import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, ScatterChart, Scatter,
  AreaChart, Area, BoxPlot
} from 'recharts';
import { 
  TrendingUp, Users, DollarSign, AlertTriangle, 
  Activity, HeadphonesIcon, Clock, Star,
  ChevronDown, Filter, Download, RefreshCw
} from 'lucide-react';

const SubscriptionDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState('30d');
  const [selectedSegment, setSelectedSegment] = useState('all');

  // Generate sample data based on your Python code structure
  const generateSampleData = () => {
    const customers = [];
    const segments = ['Champions', 'Potential Loyalists', 'New Customers', 'Loyal Customers', 'At Risk', 'Promising'];
    
    for (let i = 0; i < 1000; i++) {
      const revenue = Math.random() * 5000 + 100;
      const engagement = Math.random() * 1;
      const usageHours = Math.random() * 200 + 10;
      const supportTickets = Math.floor(Math.random() * 10);
      const loginFreq = Math.random() * 30 + 1;
      const recency = Math.random() * 120 + 1;
      
      customers.push({
        id: i,
        revenue_sum: revenue,
        engagement_score: engagement,
        usage_hours_sum: usageHours,
        support_tickets_sum: supportTickets,
        login_frequency_mean: loginFreq,
        recency_days: recency,
        segment: segments[Math.floor(Math.random() * segments.length)]
      });
    }
    return customers;
  };

  const [customerData, setCustomerData] = useState(generateSampleData());

  // Calculate KPIs
  const calculateKPIs = () => {
    const totalRevenue = customerData.reduce((sum, c) => sum + c.revenue_sum, 0);
    const totalCustomers = customerData.length;
    const avgRevenue = totalRevenue / totalCustomers;
    const totalUsage = customerData.reduce((sum, c) => sum + c.usage_hours_sum, 0);
    const totalTickets = customerData.reduce((sum, c) => sum + c.support_tickets_sum, 0);
    const avgEngagement = customerData.reduce((sum, c) => sum + c.engagement_score, 0) / totalCustomers;
    const churnRisk = customerData.filter(c => c.recency_days > 90).length;
    
    return {
      totalRevenue,
      totalCustomers,
      avgRevenue,
      totalUsage,
      totalTickets,
      avgEngagement,
      churnRisk
    };
  };

  const kpis = calculateKPIs();

  // Process data for charts
  const segmentData = customerData.reduce((acc, customer) => {
    if (!acc[customer.segment]) {
      acc[customer.segment] = { 
        segment: customer.segment, 
        count: 0, 
        revenue: 0, 
        avgEngagement: 0,
        totalEngagement: 0
      };
    }
    acc[customer.segment].count += 1;
    acc[customer.segment].revenue += customer.revenue_sum;
    acc[customer.segment].totalEngagement += customer.engagement_score;
    acc[customer.segment].avgEngagement = acc[customer.segment].totalEngagement / acc[customer.segment].count;
    return acc;
  }, {});

  const segmentChartData = Object.values(segmentData);

  const revenueDistribution = customerData.map(c => ({
    revenue: Math.floor(c.revenue_sum / 500) * 500,
    count: 1
  })).reduce((acc, item) => {
    const existing = acc.find(a => a.revenue === item.revenue);
    if (existing) {
      existing.count += 1;
    } else {
      acc.push(item);
    }
    return acc;
  }, []).sort((a, b) => a.revenue - b.revenue);

  const engagementVsRevenue = customerData.map(c => ({
    engagement: c.engagement_score,
    revenue: c.revenue_sum,
    segment: c.segment
  }));

  const usageData = customerData.map(c => ({
    usage: Math.floor(c.usage_hours_sum / 20) * 20,
    count: 1
  })).reduce((acc, item) => {
    const existing = acc.find(a => a.usage === item.usage);
    if (existing) {
      existing.count += 1;
    } else {
      acc.push(item);
    }
    return acc;
  }, []).sort((a, b) => a.usage - b.usage);

  const supportData = segmentChartData.map(s => ({
    segment: s.segment,
    tickets: customerData.filter(c => c.segment === s.segment)
      .reduce((sum, c) => sum + c.support_tickets_sum, 0) / s.count
  }));

  const lifecycleData = customerData.map(c => {
    if (c.recency_days <= 7) return 'Active';
    if (c.recency_days <= 30) return 'Regular';
    if (c.recency_days <= 90) return 'Declining';
    return 'Inactive';
  }).reduce((acc, stage) => {
    acc[stage] = (acc[stage] || 0) + 1;
    return acc;
  }, {});

  const lifecycleChartData = Object.entries(lifecycleData).map(([stage, count]) => ({
    stage,
    count,
    percentage: (count / customerData.length * 100).toFixed(1)
  }));

  // Alert system
  const generateAlerts = () => {
    const alerts = [];
    const lowRevenue = customerData.filter(c => c.revenue_sum < 200).length;
    const lowEngagement = customerData.filter(c => c.engagement_score < 0.2).length;
    const highSupport = customerData.filter(c => c.support_tickets_sum > 5).length;
    
    if (lowRevenue > 0) alerts.push({ type: 'warning', message: `${lowRevenue} customers in bottom revenue bracket` });
    if (lowEngagement > 0) alerts.push({ type: 'warning', message: `${lowEngagement} customers with low engagement` });
    if (highSupport > 0) alerts.push({ type: 'warning', message: `${highSupport} customers with high support volume` });
    if (kpis.churnRisk > 0) alerts.push({ type: 'danger', message: `${kpis.churnRisk} customers at high churn risk` });
    
    return alerts;
  };

  const alerts = generateAlerts();

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

  const KPICard = ({ title, value, icon: Icon, change, format = 'number' }) => (
    <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">
            {format === 'currency' ? `$${value.toLocaleString()}` : 
             format === 'percentage' ? `${(value * 100).toFixed(1)}%` :
             value.toLocaleString()}
          </p>
          {change && (
            <p className={`text-sm ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {change > 0 ? '+' : ''}{change.toFixed(1)}% from last month
            </p>
          )}
        </div>
        <div className="p-3 bg-blue-100 rounded-full">
          <Icon className="h-6 w-6 text-blue-600" />
        </div>
      </div>
    </div>
  );

  const AlertBanner = ({ alerts }) => (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
      <div className="flex">
        <AlertTriangle className="h-5 w-5 text-yellow-400" />
        <div className="ml-3">
          <h3 className="text-sm font-medium text-yellow-800">Performance Alerts</h3>
          <div className="mt-2 text-sm text-yellow-700">
            {alerts.map((alert, index) => (
              <div key={index} className="mb-1">
                <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                  alert.type === 'danger' ? 'bg-red-500' : 'bg-yellow-500'
                }`}></span>
                {alert.message}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Subscription Analytics Platform</h1>
              <p className="text-gray-600 mt-1">Performance Dashboard & Customer Intelligence</p>
            </div>
            <div className="flex items-center space-x-4">
              <select 
                value={dateRange} 
                onChange={(e) => setDateRange(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md bg-white"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
              </select>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="flex space-x-8 border-b border-gray-200">
          {[
            { id: 'overview', label: 'Overview', icon: Activity },
            { id: 'revenue', label: 'Revenue', icon: DollarSign },
            { id: 'engagement', label: 'Engagement', icon: Users },
            { id: 'support', label: 'Support', icon: HeadphonesIcon }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center py-4 px-2 border-b-2 font-medium text-sm ${
                activeTab === id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className="h-5 w-5 mr-2" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Alerts */}
        {alerts.length > 0 && <AlertBanner alerts={alerts} />}

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <KPICard 
            title="Total Revenue" 
            value={kpis.totalRevenue} 
            icon={DollarSign}
            format="currency"
            change={12.5}
          />
          <KPICard 
            title="Total Customers" 
            value={kpis.totalCustomers} 
            icon={Users}
            change={8.2}
          />
          <KPICard 
            title="Avg Revenue/Customer" 
            value={kpis.avgRevenue} 
            icon={TrendingUp}
            format="currency"
            change={-2.1}
          />
          <KPICard 
            title="Avg Engagement" 
            value={kpis.avgEngagement} 
            icon={Star}
            format="percentage"
            change={5.3}
          />
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Customer Segments */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Customer Segments</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={segmentChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="segment" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Customer Lifecycle */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Customer Lifecycle</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={lifecycleChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ stage, percentage }) => `${stage} (${percentage}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {lifecycleChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Revenue by Segment */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Revenue by Segment</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={segmentChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="segment" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']} />
                  <Bar dataKey="revenue" fill="#10B981" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Engagement vs Revenue */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Engagement vs Revenue</h3>
              <ResponsiveContainer width="100%" height={300}>
                <ScatterChart data={engagementVsRevenue}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="engagement" />
                  <YAxis dataKey="revenue" />
                  <Tooltip />
                  <Scatter dataKey="revenue" fill="#8B5CF6" />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Revenue Tab */}
        {activeTab === 'revenue' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Revenue Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={revenueDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="revenue" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Revenue by Segment</h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={segmentChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="segment" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="revenue" stroke="#8884d8" fill="#8884d8" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Engagement Tab */}
        {activeTab === 'engagement' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Usage Hours Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={usageData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="usage" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#10B981" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Engagement by Segment</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={segmentChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="segment" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip formatter={(value) => [value.toFixed(3), 'Engagement']} />
                  <Bar dataKey="avgEngagement" fill="#F59E0B" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Support Tab */}
        {activeTab === 'support' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Support Tickets by Segment</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={supportData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="segment" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="tickets" fill="#EF4444" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Support Efficiency Metrics</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <span className="font-medium">Total Support Tickets</span>
                  <span className="text-2xl font-bold text-gray-900">{kpis.totalTickets}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <span className="font-medium">Avg Tickets per Customer</span>
                  <span className="text-2xl font-bold text-gray-900">{(kpis.totalTickets / kpis.totalCustomers).toFixed(1)}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <span className="font-medium">High-Support Customers</span>
                  <span className="text-2xl font-bold text-red-600">{customerData.filter(c => c.support_tickets_sum > 5).length}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Business Recommendations */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Business Recommendations</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900">Revenue Optimization</h4>
              <p className="text-sm text-blue-700 mt-2">
                Focus on 'Champions' segment - they contribute the highest revenue. Consider upselling strategies for this group.
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-medium text-green-900">Customer Retention</h4>
              <p className="text-sm text-green-700 mt-2">
                Implement retention campaigns for {kpis.churnRisk} customers at high churn risk (>90 days inactive).
              </p>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg">
              <h4 className="font-medium text-yellow-900">Support Optimization</h4>
              <p className="text-sm text-yellow-700 mt-2">
                Optimize support processes for high-maintenance customers to reduce ticket volume and improve satisfaction.
              </p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <h4 className="font-medium text-purple-900">Engagement Enhancement</h4>
              <p className="text-sm text-purple-700 mt-2">
                Develop targeted engagement campaigns for low-engagement customers to increase product adoption.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionDashboard;