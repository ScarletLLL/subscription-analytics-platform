import React, { useState, useMemo } from 'react';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, PieChart, Pie, Cell, Area, AreaChart, ScatterChart, Scatter
} from 'recharts';
import { 
  Users, TrendingUp, Clock, Target, ArrowRight, Calendar, 
  Activity, BarChart3, PieChart as LucidePieChart, GitBranch
} from 'lucide-react';

const CustomerJourneyDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data - in a real app, this would come from your API
  const mockData = useMemo(() => {
    // Generate mock customer journey data
    const customers = Array.from({ length: 1000 }, (_, i) => ({
      id: `customer_${i}`,
      firstInteraction: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
      totalInteractions: Math.floor(Math.random() * 50) + 1,
      journeyLength: Math.floor(Math.random() * 365) + 1,
      lifecycleStage: ['New', 'Growing', 'Mature', 'Loyal'][Math.floor(Math.random() * 4)],
      segment: ['High Engagement', 'Medium Engagement', 'Low Engagement', 'Quick Exit', 'Long Journey'][Math.floor(Math.random() * 5)]
    }));

    // Journey length distribution
    const journeyLengthData = Array.from({ length: 12 }, (_, i) => ({
      days: `${i * 30}-${(i + 1) * 30}`,
      customers: customers.filter(c => c.journeyLength >= i * 30 && c.journeyLength < (i + 1) * 30).length
    }));

    // Interaction distribution
    const interactionData = Array.from({ length: 10 }, (_, i) => ({
      interactions: `${i * 5}-${(i + 1) * 5}`,
      customers: customers.filter(c => c.totalInteractions >= i * 5 && c.totalInteractions < (i + 1) * 5).length
    }));

    // Lifecycle stage distribution
    const stageData = ['New', 'Growing', 'Mature', 'Loyal'].map(stage => ({
      stage,
      count: customers.filter(c => c.lifecycleStage === stage).length,
      percentage: (customers.filter(c => c.lifecycleStage === stage).length / customers.length * 100).toFixed(1)
    }));

    // Segment analysis
    const segmentData = ['High Engagement', 'Medium Engagement', 'Low Engagement', 'Quick Exit', 'Long Journey'].map(segment => ({
      segment,
      count: customers.filter(c => c.segment === segment).length,
      avgInteractions: customers.filter(c => c.segment === segment).reduce((sum, c) => sum + c.totalInteractions, 0) / customers.filter(c => c.segment === segment).length || 0,
      avgJourneyLength: customers.filter(c => c.segment === segment).reduce((sum, c) => sum + c.journeyLength, 0) / customers.filter(c => c.segment === segment).length || 0
    }));

    // Transition matrix data
    const transitionData = [
      { from: 'New', to: 'New', value: 45 },
      { from: 'New', to: 'Growing', value: 35 },
      { from: 'New', to: 'Mature', value: 15 },
      { from: 'New', to: 'Loyal', value: 5 },
      { from: 'Growing', to: 'New', value: 10 },
      { from: 'Growing', to: 'Growing', value: 40 },
      { from: 'Growing', to: 'Mature', value: 35 },
      { from: 'Growing', to: 'Loyal', value: 15 },
      { from: 'Mature', to: 'New', value: 5 },
      { from: 'Mature', to: 'Growing', value: 20 },
      { from: 'Mature', to: 'Mature', value: 50 },
      { from: 'Mature', to: 'Loyal', value: 25 },
      { from: 'Loyal', to: 'New', value: 2 },
      { from: 'Loyal', to: 'Growing', value: 8 },
      { from: 'Loyal', to: 'Mature', value: 30 },
      { from: 'Loyal', to: 'Loyal', value: 60 }
    ];

    // Cohort retention data
    const cohortData = Array.from({ length: 12 }, (_, month) => ({
      month: `Month ${month + 1}`,
      retention: Math.max(0.2, 1 - (month * 0.1) + (Math.random() * 0.2 - 0.1))
    }));

    // Time between interactions
    const timeBetweenData = Array.from({ length: 30 }, (_, i) => ({
      days: i + 1,
      frequency: Math.floor(Math.random() * 100) + 20
    }));

    return {
      customers,
      journeyLengthData,
      interactionData,
      stageData,
      segmentData,
      transitionData,
      cohortData,
      timeBetweenData,
      totalCustomers: customers.length,
      avgJourneyLength: customers.reduce((sum, c) => sum + c.journeyLength, 0) / customers.length,
      avgInteractions: customers.reduce((sum, c) => sum + c.totalInteractions, 0) / customers.length,
      avgTimeBetween: 7.5
    };
  }, []);

  const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1'];

  const MetricCard = ({ title, value, icon: Icon, trend, color = "blue" }) => (
    <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {trend && (
            <p className="text-sm text-green-600 mt-1">
              <TrendingUp className="inline w-4 h-4 mr-1" />
              {trend}
            </p>
          )}
        </div>
        <Icon className={`w-8 h-8 text-${color}-500`} />
      </div>
    </div>
  );

  const TabButton = ({ id, label, icon: Icon, active, onClick }) => (
    <button
      onClick={() => onClick(id)}
      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
        active 
          ? 'bg-blue-500 text-white' 
          : 'text-gray-600 hover:bg-gray-100'
      }`}
    >
      <Icon className="w-4 h-4" />
      <span>{label}</span>
    </button>
  );

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Customers"
          value={mockData.totalCustomers.toLocaleString()}
          icon={Users}
          trend="+12% vs last month"
        />
        <MetricCard
          title="Avg Journey Length"
          value={`${mockData.avgJourneyLength.toFixed(1)} days`}
          icon={Clock}
          trend="+5% vs last month"
        />
        <MetricCard
          title="Avg Interactions"
          value={mockData.avgInteractions.toFixed(1)}
          icon={Activity}
          trend="+8% vs last month"
        />
        <MetricCard
          title="Avg Time Between"
          value={`${mockData.avgTimeBetween} days`}
          icon={Target}
          trend="-2% vs last month"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Journey Length Distribution */}
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2" />
            Journey Length Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={mockData.journeyLengthData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="days" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="customers" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Lifecycle Stage Distribution */}
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <LucidePieChart className="w-5 h-5 mr-2" />
            Lifecycle Stage Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={mockData.stageData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percentage }) => `${name} ${percentage}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {mockData.stageData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Interaction Distribution */}
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-lg font-semibold mb-4">Total Interactions Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={mockData.interactionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="interactions" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="customers" stroke="#82ca9d" fill="#82ca9d" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Time Between Interactions */}
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-lg font-semibold mb-4">Time Between Interactions</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={mockData.timeBetweenData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="days" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="frequency" stroke="#ffc658" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );

  const renderSegments = () => (
    <div className="space-y-6">
      {/* Segment Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {mockData.segmentData.map((segment, index) => (
          <div key={segment.segment} className="bg-white p-4 rounded-xl shadow-lg">
            <div className="text-center">
              <div className={`w-12 h-12 mx-auto mb-2 rounded-full flex items-center justify-center`}
                   style={{ backgroundColor: colors[index % colors.length] + '20' }}>
                <Target className="w-6 h-6" style={{ color: colors[index % colors.length] }} />
              </div>
              <h3 className="font-semibold text-sm mb-1">{segment.segment}</h3>
              <p className="text-2xl font-bold text-gray-900">{segment.count}</p>
              <p className="text-xs text-gray-500 mt-1">
                {((segment.count / mockData.totalCustomers) * 100).toFixed(1)}% of total
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Segment Analysis Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Average Interactions by Segment */}
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-lg font-semibold mb-4">Average Interactions by Segment</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={mockData.segmentData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="segment" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="avgInteractions" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Average Journey Length by Segment */}
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-lg font-semibold mb-4">Average Journey Length by Segment</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={mockData.segmentData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="segment" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="avgJourneyLength" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Segment Comparison Scatter Plot */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h3 className="text-lg font-semibold mb-4">Segment Comparison: Journey Length vs Interactions</h3>
        <ResponsiveContainer width="100%" height={400}>
          <ScatterChart>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="avgJourneyLength" name="Journey Length" />
            <YAxis dataKey="avgInteractions" name="Interactions" />
            <Tooltip cursor={{ strokeDasharray: '3 3' }} />
            <Scatter name="Segments" data={mockData.segmentData} fill="#8884d8" />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  const renderTransitions = () => (
    <div className="space-y-6">
      {/* Transition Matrix Visualization */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <ArrowRight className="w-5 h-5 mr-2" />
          Lifecycle Stage Transition Matrix
        </h3>
        <div className="grid grid-cols-4 gap-2 text-sm">
          <div className="font-semibold">From / To</div>
          <div className="font-semibold text-center">New</div>
          <div className="font-semibold text-center">Growing</div>
          <div className="font-semibold text-center">Mature</div>
          <div className="font-semibold text-center">Loyal</div>
          
          {['New', 'Growing', 'Mature', 'Loyal'].map(fromStage => (
            <React.Fragment key={fromStage}>
              <div className="font-medium">{fromStage}</div>
              {['New', 'Growing', 'Mature', 'Loyal'].map(toStage => {
                const transition = mockData.transitionData.find(t => t.from === fromStage && t.to === toStage);
                const value = transition ? transition.value : 0;
                return (
                  <div key={toStage} className="text-center p-2 rounded" 
                       style={{ backgroundColor: `rgba(136, 132, 216, ${value / 100})` }}>
                    {value}%
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Top Transitions */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h3 className="text-lg font-semibold mb-4">Most Common Transitions</h3>
        <div className="space-y-3">
          {mockData.transitionData
            .sort((a, b) => b.value - a.value)
            .slice(0, 8)
            .map((transition, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span className="font-medium">{transition.from}</span>
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                  <span className="font-medium">{transition.to}</span>
                </div>
                <span className="font-semibold text-blue-600">{transition.value}%</span>
              </div>
            ))}
        </div>
      </div>

      {/* Cohort Retention */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h3 className="text-lg font-semibold mb-4">Cohort Retention Analysis</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={mockData.cohortData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip formatter={(value) => `${(value * 100).toFixed(1)}%`} />
            <Line type="monotone" dataKey="retention" stroke="#8884d8" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  const renderRecommendations = () => (
    <div className="space-y-6">
      {/* Key Insights */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-xl shadow-lg">
        <h3 className="text-xl font-bold mb-4">🎯 Key Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold mb-2">Customer Journey Health</h4>
            <ul className="text-sm space-y-1">
              <li>• Average journey length: {mockData.avgJourneyLength.toFixed(1)} days</li>
              <li>• {mockData.stageData.find(s => s.stage === 'New')?.percentage}% of customers are in 'New' stage</li>
              <li>• High engagement segment: {mockData.segmentData.find(s => s.segment === 'High Engagement')?.count} customers</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Engagement Patterns</h4>
            <ul className="text-sm space-y-1">
              <li>• Average interactions per customer: {mockData.avgInteractions.toFixed(1)}</li>
              <li>• Average time between interactions: {mockData.avgTimeBetween} days</li>
              <li>• Quick exit rate: {((mockData.segmentData.find(s => s.segment === 'Quick Exit')?.count / mockData.totalCustomers) * 100).toFixed(1)}%</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Actionable Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-lg font-semibold mb-4 text-green-600">🚀 Growth Opportunities</h3>
          <div className="space-y-4">
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-semibold text-green-800">Convert New to Growing</h4>
              <p className="text-sm text-green-700 mt-1">
                Focus on onboarding optimization for the {mockData.stageData.find(s => s.stage === 'New')?.percentage}% of new customers
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-semibold text-green-800">Leverage High Engagement</h4>
              <p className="text-sm text-green-700 mt-1">
                Use {mockData.segmentData.find(s => s.segment === 'High Engagement')?.count} high-engagement customers for referrals and testimonials
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-semibold text-green-800">Expand Mature Customers</h4>
              <p className="text-sm text-green-700 mt-1">
                Introduce premium features to {mockData.stageData.find(s => s.stage === 'Mature')?.percentage}% mature customers
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-lg font-semibold mb-4 text-orange-600">⚠️ Risk Mitigation</h3>
          <div className="space-y-4">
            <div className="p-4 bg-orange-50 rounded-lg">
              <h4 className="font-semibold text-orange-800">Reduce Quick Exits</h4>
              <p className="text-sm text-orange-700 mt-1">
                Address {mockData.segmentData.find(s => s.segment === 'Quick Exit')?.count} customers with early intervention strategies
              </p>
            </div>
            <div className="p-4 bg-orange-50 rounded-lg">
              <h4 className="font-semibold text-orange-800">Re-engage Low Activity</h4>
              <p className="text-sm text-orange-700 mt-1">
                Create targeted campaigns for {mockData.segmentData.find(s => s.segment === 'Low Engagement')?.count} low-engagement customers
              </p>
            </div>
            <div className="p-4 bg-orange-50 rounded-lg">
              <h4 className="font-semibold text-orange-800">Optimize Interaction Timing</h4>
              <p className="text-sm text-orange-700 mt-1">
                Reduce {mockData.avgTimeBetween}-day average gap between interactions
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Plan */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h3 className="text-lg font-semibold mb-4 text-blue-600">📋 30-Day Action Plan</h3>
        <div className="space-y-3">
          {[
            { week: 'Week 1', task: 'Implement onboarding email sequence for new customers', priority: 'High' },
            { week: 'Week 2', task: 'Launch referral program for high-engagement customers', priority: 'High' },
            { week: 'Week 3', task: 'Create re-engagement campaign for low-activity users', priority: 'Medium' },
            { week: 'Week 4', task: 'A/B test interaction frequency optimization', priority: 'Medium' }
          ].map((item, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                <span className="font-medium">{item.week}</span>
                <span className="text-gray-600">{item.task}</span>
              </div>
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                item.priority === 'High' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
              }`}>
                {item.priority}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Customer Journey Analytics</h1>
              <p className="text-gray-600">Comprehensive insights into customer behaviors and journey patterns</p>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-gray-400" />
              <span className="text-sm text-gray-600">Last updated: {new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex space-x-2 overflow-x-auto">
          <TabButton
            id="overview"
            label="Overview"
            icon={BarChart3}
            active={activeTab === 'overview'}
            onClick={setActiveTab}
          />
          <TabButton
            id="segments"
            label="Segments"
            icon={Users}
            active={activeTab === 'segments'}
            onClick={setActiveTab}
          />
          <TabButton
            id="transitions"
            label="Transitions"
            icon={GitBranch}
            active={activeTab === 'transitions'}
            onClick={setActiveTab}
          />
          <TabButton
            id="recommendations"
            label="Insights"
            icon={Target}
            active={activeTab === 'recommendations'}
            onClick={setActiveTab}
          />
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'segments' && renderSegments()}
        {activeTab === 'transitions' && renderTransitions()}
        {activeTab === 'recommendations' && renderRecommendations()}
      </div>
    </div>
  );
};

export default CustomerJourneyDashboard;