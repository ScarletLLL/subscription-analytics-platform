import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, ScatterChart, Scatter, LineChart, Line } from 'recharts';
import { Users, TrendingUp, Target, DollarSign, Activity, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';

const CustomerSegmentationDashboard = () => {
  const [selectedSegment, setSelectedSegment] = useState('all');
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedSection, setExpandedSection] = useState(null);

  // Mock data based on your analysis
  const segmentData = [
    {
      id: 0,
      name: 'High-Performance Segment 0',
      description: 'High-value customers with strong engagement',
      count: 245,
      percentage: 24.5,
      avgRevenue: 2850.75,
      avgUsage: 156.3,
      avgTickets: 2.1,
      color: '#10B981'
    },
    {
      id: 1,
      name: 'Medium-Performance Segment 1',
      description: 'Moderate-value customers with average engagement',
      count: 387,
      percentage: 38.7,
      avgRevenue: 1425.50,
      avgUsage: 89.2,
      avgTickets: 4.8,
      color: '#F59E0B'
    },
    {
      id: 2,
      name: 'Low-Performance Segment 2',
      description: 'Lower-value customers requiring attention',
      count: 368,
      percentage: 36.8,
      avgRevenue: 685.25,
      avgUsage: 34.7,
      avgTickets: 8.2,
      color: '#EF4444'
    }
  ];

  const clusterMetrics = [
    { metric: 'Average Revenue', segment0: 2850.75, segment1: 1425.50, segment2: 685.25 },
    { metric: 'Average Usage Hours', segment0: 156.3, segment1: 89.2, segment2: 34.7 },
    { metric: 'Support Tickets', segment0: 2.1, segment1: 4.8, segment2: 8.2 },
    { metric: 'Login Frequency', segment0: 28.5, segment1: 15.2, segment2: 6.8 }
  ];

  const pcaData = [
    { x: 2.1, y: 1.5, cluster: 0 },
    { x: 1.8, y: 1.2, cluster: 0 },
    { x: 2.3, y: 1.7, cluster: 0 },
    { x: 0.5, y: 0.8, cluster: 1 },
    { x: 0.7, y: 0.6, cluster: 1 },
    { x: 0.3, y: 0.9, cluster: 1 },
    { x: -1.2, y: -0.5, cluster: 2 },
    { x: -1.5, y: -0.8, cluster: 2 },
    { x: -1.0, y: -0.3, cluster: 2 }
  ];

  const elbow = [
    { k: 2, inertia: 1250, silhouette: 0.45 },
    { k: 3, inertia: 890, silhouette: 0.62 },
    { k: 4, inertia: 720, silhouette: 0.58 },
    { k: 5, inertia: 610, silhouette: 0.52 },
    { k: 6, inertia: 540, silhouette: 0.48 }
  ];

  const recommendations = {
    0: [
      "Implement premium support tiers",
      "Offer advanced features and integrations",
      "Create loyalty programs with exclusive benefits",
      "Assign dedicated account managers"
    ],
    1: [
      "Focus on increasing engagement through targeted campaigns",
      "Provide usage analytics and insights",
      "Offer training sessions to maximize platform utilization",
      "Implement usage-based pricing incentives"
    ],
    2: [
      "Implement retention strategies",
      "Evaluate churn risk and prevention measures",
      "Consider cost-effective acquisition channels",
      "Explore freemium or trial upgrade paths"
    ]
  };

  const filteredData = useMemo(() => {
    if (selectedSegment === 'all') return segmentData;
    return segmentData.filter(segment => segment.id === parseInt(selectedSegment));
  }, [selectedSegment]);

  const totalCustomers = segmentData.reduce((sum, segment) => sum + segment.count, 0);
  const totalRevenue = segmentData.reduce((sum, segment) => sum + (segment.avgRevenue * segment.count), 0);

  const MetricCard = ({ title, value, icon: Icon, color, subtitle }) => (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className={`text-3xl font-bold ${color}`}>{value}</p>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <Icon className={`w-8 h-8 ${color}`} />
      </div>
    </div>
  );

  const SegmentCard = ({ segment, isSelected, onClick }) => (
    <div 
      className={`bg-white rounded-xl shadow-lg p-6 border-2 cursor-pointer transition-all duration-200 hover:shadow-xl ${
        isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-100 hover:border-gray-200'
      }`}
      onClick={() => onClick(segment.id)}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div 
            className="w-4 h-4 rounded-full mr-3" 
            style={{ backgroundColor: segment.color }}
          />
          <h3 className="text-lg font-semibold text-gray-900">{segment.name}</h3>
        </div>
        <span className="text-2xl font-bold text-gray-700">{segment.count}</span>
      </div>
      <p className="text-sm text-gray-600 mb-3">{segment.description}</p>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-gray-500">Avg Revenue</p>
          <p className="font-semibold">${segment.avgRevenue.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-gray-500">Usage Hours</p>
          <p className="font-semibold">{segment.avgUsage.toFixed(1)}h</p>
        </div>
      </div>
    </div>
  );

  const CollapsibleSection = ({ title, children, sectionKey }) => (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 mb-6">
      <button
        className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
        onClick={() => setExpandedSection(expandedSection === sectionKey ? null : sectionKey)}
      >
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {expandedSection === sectionKey ? 
          <ChevronUp className="w-5 h-5 text-gray-500" /> : 
          <ChevronDown className="w-5 h-5 text-gray-500" />
        }
      </button>
      {expandedSection === sectionKey && (
        <div className="px-6 pb-6 border-t border-gray-100">
          {children}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Target className="w-8 h-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Customer Segmentation Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={selectedSegment}
                onChange={(e) => setSelectedSegment(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Segments</option>
                {segmentData.map(segment => (
                  <option key={segment.id} value={segment.id}>
                    {segment.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          {['overview', 'segments', 'analysis', 'recommendations'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 pb-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard
                title="Total Customers"
                value={totalCustomers.toLocaleString()}
                icon={Users}
                color="text-blue-600"
                subtitle="Active customer base"
              />
              <MetricCard
                title="Total Revenue"
                value={`$${(totalRevenue / 1000000).toFixed(1)}M`}
                icon={DollarSign}
                color="text-green-600"
                subtitle="Monthly recurring revenue"
              />
              <MetricCard
                title="Segments"
                value={segmentData.length}
                icon={Target}
                color="text-purple-600"
                subtitle="Distinct customer groups"
              />
              <MetricCard
                title="Silhouette Score"
                value="0.62"
                icon={TrendingUp}
                color="text-orange-600"
                subtitle="Clustering quality"
              />
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Segment Distribution */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={segmentData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percentage }) => `${name.split(' ')[0]} (${percentage}%)`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {segmentData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [value, 'Customers']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Revenue by Segment */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Average Revenue by Segment</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={segmentData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={false} />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Avg Revenue']} />
                    <Bar dataKey="avgRevenue" fill="#3B82F6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* Segments Tab */}
        {activeTab === 'segments' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {segmentData.map(segment => (
                <SegmentCard
                  key={segment.id}
                  segment={segment}
                  isSelected={selectedSegment === segment.id.toString()}
                  onClick={setSelectedSegment}
                />
              ))}
            </div>

            {/* Comparative Analysis */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Segment Comparison</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Metric</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-700">High-Performance</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-700">Medium-Performance</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-700">Low-Performance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clusterMetrics.map((row, index) => (
                      <tr key={index} className="border-b border-gray-100">
                        <td className="py-3 px-4 text-gray-900">{row.metric}</td>
                        <td className="py-3 px-4 text-right text-green-600 font-medium">
                          {row.metric.includes('Revenue') ? `$${row.segment0.toLocaleString()}` : row.segment0}
                        </td>
                        <td className="py-3 px-4 text-right text-orange-600 font-medium">
                          {row.metric.includes('Revenue') ? `$${row.segment1.toLocaleString()}` : row.segment1}
                        </td>
                        <td className="py-3 px-4 text-right text-red-600 font-medium">
                          {row.metric.includes('Revenue') ? `$${row.segment2.toLocaleString()}` : row.segment2}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Analysis Tab */}
        {activeTab === 'analysis' && (
          <div className="space-y-8">
            <CollapsibleSection title="Cluster Optimization Analysis" sectionKey="optimization">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-6">
                <div>
                  <h4 className="text-md font-semibold text-gray-900 mb-4">Elbow Method</h4>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={elbow}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="k" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="inertia" stroke="#3B82F6" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div>
                  <h4 className="text-md font-semibold text-gray-900 mb-4">Silhouette Score</h4>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={elbow}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="k" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="silhouette" stroke="#10B981" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </CollapsibleSection>

            <CollapsibleSection title="PCA Visualization" sectionKey="pca">
              <div className="mt-6">
                <h4 className="text-md font-semibold text-gray-900 mb-4">Customer Segments in 2D Space</h4>
                <ResponsiveContainer width="100%" height={400}>
                  <ScatterChart data={pcaData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      type="number" 
                      dataKey="x" 
                      name="PC1" 
                      domain={['dataMin - 0.5', 'dataMax + 0.5']}
                    />
                    <YAxis 
                      type="number" 
                      dataKey="y" 
                      name="PC2" 
                      domain={['dataMin - 0.5', 'dataMax + 0.5']}
                    />
                    <Tooltip 
                      formatter={(value, name) => [value.toFixed(2), name]}
                      labelFormatter={(label) => `Cluster: ${label}`}
                    />
                    <Scatter name="Customers" dataKey="cluster" fill="#3B82F6" />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </CollapsibleSection>

            <CollapsibleSection title="Feature Importance" sectionKey="features">
              <div className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="text-md font-semibold text-gray-900 mb-4">Key Differentiators</h4>
                    <ul className="space-y-3">
                      <li className="flex items-center justify-between">
                        <span className="text-gray-700">Revenue</span>
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-600 h-2 rounded-full" style={{ width: '95%' }}></div>
                        </div>
                      </li>
                      <li className="flex items-center justify-between">
                        <span className="text-gray-700">Usage Hours</span>
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-600 h-2 rounded-full" style={{ width: '87%' }}></div>
                        </div>
                      </li>
                      <li className="flex items-center justify-between">
                        <span className="text-gray-700">Support Tickets</span>
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-600 h-2 rounded-full" style={{ width: '72%' }}></div>
                        </div>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-md font-semibold text-gray-900 mb-4">Clustering Quality</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-700">Silhouette Score</span>
                        <span className="font-semibold text-green-600">0.62</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-700">Inertia</span>
                        <span className="font-semibold text-blue-600">890</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-700">Optimal Clusters</span>
                        <span className="font-semibold text-purple-600">3</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CollapsibleSection>
          </div>
        )}

        {/* Recommendations Tab */}
        {activeTab === 'recommendations' && (
          <div className="space-y-8">
            {segmentData.map(segment => (
              <div key={segment.id} className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center mb-4">
                  <div 
                    className="w-4 h-4 rounded-full mr-3" 
                    style={{ backgroundColor: segment.color }}
                  />
                  <h3 className="text-lg font-semibold text-gray-900">{segment.name}</h3>
                  <span className="ml-auto text-sm text-gray-500">{segment.count} customers</span>
                </div>
                <p className="text-gray-600 mb-4">{segment.description}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-md font-semibold text-gray-900 mb-3">Strategic Recommendations</h4>
                    <ul className="space-y-2">
                      {recommendations[segment.id].map((rec, index) => (
                        <li key={index} className="flex items-start">
                          <Activity className="w-4 h-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-700">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-md font-semibold text-gray-900 mb-3">Key Metrics</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">Avg Revenue</p>
                        <p className="text-lg font-semibold text-gray-900">${segment.avgRevenue.toLocaleString()}</p>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">Usage Hours</p>
                        <p className="text-lg font-semibold text-gray-900">{segment.avgUsage.toFixed(1)}h</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Action Items */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6">
              <div className="flex items-center mb-4">
                <AlertCircle className="w-6 h-6 text-blue-600 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900">Next Steps</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Immediate (0-30 days)</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Implement premium support for high-value segments</li>
                    <li>• Launch retention campaigns for low-value segments</li>
                    <li>• Set up automated engagement tracking</li>
                  </ul>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Short-term (1-3 months)</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Develop tier-specific feature offerings</li>
                    <li>• Create personalized onboarding flows</li>
                    <li>• Launch referral programs</li>
                  </ul>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Long-term (3+ months)</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Implement predictive churn modeling</li>
                    <li>• Launch advanced analytics dashboard</li>
                    <li>• Develop customer success programs</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerSegmentationDashboard;