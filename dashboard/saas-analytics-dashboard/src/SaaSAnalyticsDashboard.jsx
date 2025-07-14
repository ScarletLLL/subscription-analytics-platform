import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, ScatterChart, Scatter } from 'recharts';
import { Users, TrendingUp, AlertTriangle, DollarSign, Target, Activity, Award, Bell } from 'lucide-react';

const SaaSAnalyticsDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

  // Generate sample data based on your analysis
  const generateSampleData = () => {
    const customers = [];
    const segments = ['High Value', 'Medium-High', 'Medium', 'Medium-Low', 'Low Value'];
    const products = ['Basic', 'Premium', 'Enterprise'];
    const regions = ['North America', 'Europe', 'Asia'];
    const strategies = ['Retention Focus - High Priority', 'Expansion/Upsell', 'Engagement Increase', 'Natural Churn - Monitor', 'Value Enhancement'];

    for (let i = 0; i < 1000; i++) {
      const engagementScore = Math.random() * 100;
      const churnProb = Math.random();
      const totalRevenue = Math.random() * 10000 + 1000;
      const clv = totalRevenue * (1 - churnProb) * 2 * 0.9; // 2-year horizon with discount
      
      customers.push({
        id: i + 1,
        totalRevenue,
        engagementScore,
        churnProb,
        clv,
        segment: segments[Math.floor(Math.random() * segments.length)],
        product: products[Math.floor(Math.random() * products.length)],
        region: regions[Math.floor(Math.random() * regions.length)],
        strategy: strategies[Math.floor(Math.random() * strategies.length)],
        usageHours: Math.random() * 100 + 10,
        supportTickets: Math.floor(Math.random() * 10),
        daysSinceLastActivity: Math.floor(Math.random() * 90),
        subscriptionFee: [29, 49, 99, 199][Math.floor(Math.random() * 4)]
      });
    }
    return customers;
  };

  const customerData = useMemo(() => generateSampleData(), []);

  // Calculate key metrics
  const metrics = useMemo(() => {
    const totalCustomers = customerData.length;
    const totalCLV = customerData.reduce((sum, customer) => sum + customer.clv, 0);
    const averageCLV = totalCLV / totalCustomers;
    const averageChurnRisk = customerData.reduce((sum, customer) => sum + customer.churnProb, 0) / totalCustomers;
    const totalRevenue = customerData.reduce((sum, customer) => sum + customer.totalRevenue, 0);
    const highRiskCustomers = customerData.filter(c => c.churnProb > 0.7 && c.clv > averageCLV).length;

    return {
      totalCustomers,
      totalCLV,
      averageCLV,
      averageChurnRisk,
      totalRevenue,
      highRiskCustomers
    };
  }, [customerData]);

  // Prepare chart data
  const segmentData = useMemo(() => {
    const segmentCounts = {};
    customerData.forEach(customer => {
      segmentCounts[customer.segment] = (segmentCounts[customer.segment] || 0) + 1;
    });
    return Object.entries(segmentCounts).map(([segment, count]) => ({ segment, count }));
  }, [customerData]);

  const churnBySegment = useMemo(() => {
    const segmentChurn = {};
    customerData.forEach(customer => {
      if (!segmentChurn[customer.segment]) {
        segmentChurn[customer.segment] = { total: 0, churnSum: 0 };
      }
      segmentChurn[customer.segment].total += 1;
      segmentChurn[customer.segment].churnSum += customer.churnProb;
    });
    
    return Object.entries(segmentChurn).map(([segment, data]) => ({
      segment,
      churnRate: (data.churnSum / data.total * 100).toFixed(1)
    }));
  }, [customerData]);

  const revenueByProduct = useMemo(() => {
    const productRevenue = {};
    customerData.forEach(customer => {
      productRevenue[customer.product] = (productRevenue[customer.product] || 0) + customer.totalRevenue;
    });
    return Object.entries(productRevenue).map(([product, revenue]) => ({ product, revenue }));
  }, [customerData]);

  const clvDistribution = useMemo(() => {
    const sorted = [...customerData].sort((a, b) => a.clv - b.clv);
    const buckets = 10;
    const bucketSize = Math.floor(sorted.length / buckets);
    const distribution = [];
    
    for (let i = 0; i < buckets; i++) {
      const start = i * bucketSize;
      const end = i === buckets - 1 ? sorted.length : (i + 1) * bucketSize;
      const bucketCustomers = sorted.slice(start, end);
      const avgCLV = bucketCustomers.reduce((sum, c) => sum + c.clv, 0) / bucketCustomers.length;
      distribution.push({
        bucket: `${i * 10 + 1}-${(i + 1) * 10}%`,
        clv: avgCLV,
        count: bucketCustomers.length
      });
    }
    
    return distribution;
  }, [customerData]);

  const churnVsEngagement = useMemo(() => {
    return customerData.map(customer => ({
      engagement: customer.engagementScore,
      churnRisk: customer.churnProb * 100,
      clv: customer.clv
    }));
  }, [customerData]);

  const strategyData = useMemo(() => {
    const strategyCounts = {};
    customerData.forEach(customer => {
      strategyCounts[customer.strategy] = (strategyCounts[customer.strategy] || 0) + 1;
    });
    return Object.entries(strategyCounts).map(([strategy, count]) => ({ strategy, count }));
  }, [customerData]);

  const MetricCard = ({ title, value, icon: Icon, color, subtext }) => (
    <div className="bg-white rounded-lg shadow-md p-6 border-l-4" style={{ borderColor: color }}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtext && <p className="text-xs text-gray-500 mt-1">{subtext}</p>}
        </div>
        <Icon className="h-8 w-8" style={{ color }} />
      </div>
    </div>
  );

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#0088fe'];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">SaaS Customer Analytics</h1>
            <div className="flex items-center space-x-4">
              <Bell className="h-6 w-6 text-gray-400" />
              <div className="h-8 w-8 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">A</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: Activity },
              { id: 'segments', label: 'Customer Segments', icon: Users },
              { id: 'churn', label: 'Churn Analysis', icon: AlertTriangle },
              { id: 'revenue', label: 'Revenue Insights', icon: DollarSign },
              { id: 'clv', label: 'Customer Lifetime Value', icon: Award },
              { id: 'strategies', label: 'Action Strategies', icon: Target }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-3 py-4 text-sm font-medium border-b-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-4 w-4 mr-2" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard
                title="Total Customers"
                value={metrics.totalCustomers.toLocaleString()}
                icon={Users}
                color="#3b82f6"
              />
              <MetricCard
                title="Total CLV"
                value={`$${(metrics.totalCLV / 1000000).toFixed(1)}M`}
                icon={DollarSign}
                color="#10b981"
                subtext={`Avg: $${metrics.averageCLV.toFixed(0)}`}
              />
              <MetricCard
                title="Churn Risk"
                value={`${(metrics.averageChurnRisk * 100).toFixed(1)}%`}
                icon={AlertTriangle}
                color="#f59e0b"
              />
              <MetricCard
                title="High-Risk Customers"
                value={metrics.highRiskCustomers}
                icon={Target}
                color="#ef4444"
                subtext="High value, high churn risk"
              />
            </div>

            {/* Overview Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold mb-4">Customer Segments</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={segmentData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ segment, percent }) => `${segment} (${(percent * 100).toFixed(0)}%)`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {segmentData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold mb-4">Revenue by Product</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={revenueByProduct}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="product" />
                    <YAxis tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`} />
                    <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']} />
                    <Bar dataKey="revenue" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'segments' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Customer Segment Distribution</h3>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={segmentData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="segment" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Churn Rate by Segment</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={churnBySegment}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="segment" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value}%`, 'Churn Rate']} />
                  <Bar dataKey="churnRate" fill="#ef4444" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {activeTab === 'churn' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Churn Risk vs Engagement Score</h3>
              <ResponsiveContainer width="100%" height={400}>
                <ScatterChart data={churnVsEngagement.slice(0, 200)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="engagement" name="Engagement Score" />
                  <YAxis dataKey="churnRisk" name="Churn Risk %" />
                  <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                  <Scatter name="Customers" data={churnVsEngagement} fill="#8884d8" />
                </ScatterChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold mb-4">High-Risk Customers</h3>
                <div className="space-y-3">
                  {customerData
                    .filter(c => c.churnProb > 0.7 && c.clv > metrics.averageCLV)
                    .slice(0, 10)
                    .map((customer, index) => (
                      <div key={customer.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                        <div>
                          <p className="font-medium">Customer #{customer.id}</p>
                          <p className="text-sm text-gray-600">{customer.segment} • {customer.product}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-red-600">{(customer.churnProb * 100).toFixed(1)}%</p>
                          <p className="text-sm text-gray-600">${customer.clv.toFixed(0)} CLV</p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold mb-4">Churn Prevention Metrics</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total at-risk customers</span>
                    <span className="font-semibold">{customerData.filter(c => c.churnProb > 0.5).length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">High-value at-risk</span>
                    <span className="font-semibold text-red-600">{metrics.highRiskCustomers}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Potential revenue loss</span>
                    <span className="font-semibold text-red-600">
                      ${(customerData.filter(c => c.churnProb > 0.5).reduce((sum, c) => sum + c.clv, 0) / 1000000).toFixed(1)}M
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'revenue' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Revenue Distribution by Product</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={revenueByProduct}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="product" />
                  <YAxis tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`} />
                  <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']} />
                  <Bar dataKey="revenue" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h4 className="text-lg font-semibold mb-3">Total Revenue</h4>
                <p className="text-3xl font-bold text-green-600">${(metrics.totalRevenue / 1000000).toFixed(1)}M</p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6">
                <h4 className="text-lg font-semibold mb-3">Average Revenue per Customer</h4>
                <p className="text-3xl font-bold text-blue-600">${(metrics.totalRevenue / metrics.totalCustomers).toFixed(0)}</p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6">
                <h4 className="text-lg font-semibold mb-3">Revenue Growth Potential</h4>
                <p className="text-3xl font-bold text-purple-600">
                  ${((metrics.totalCLV - metrics.totalRevenue) / 1000000).toFixed(1)}M
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'clv' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Customer Lifetime Value Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={clvDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="bucket" />
                  <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`} />
                  <Tooltip formatter={(value) => [`$${value.toFixed(0)}`, 'Average CLV']} />
                  <Bar dataKey="clv" fill="#8b5cf6" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h4 className="text-lg font-semibold mb-3">Top 10 Highest CLV Customers</h4>
                <div className="space-y-3">
                  {[...customerData]
                    .sort((a, b) => b.clv - a.clv)
                    .slice(0, 10)
                    .map((customer, index) => (
                      <div key={customer.id} className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                        <div>
                          <p className="font-medium">Customer #{customer.id}</p>
                          <p className="text-sm text-gray-600">{customer.segment} • {customer.product}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-purple-600">${customer.clv.toFixed(0)}</p>
                          <p className="text-sm text-gray-600">{(customer.churnProb * 100).toFixed(1)}% churn risk</p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <h4 className="text-lg font-semibold mb-3">CLV Key Metrics</h4>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total CLV</span>
                    <span className="font-semibold">${(metrics.totalCLV / 1000000).toFixed(1)}M</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Average CLV</span>
                    <span className="font-semibold">${metrics.averageCLV.toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Median CLV</span>
                    <span className="font-semibold">
                      ${[...customerData].sort((a, b) => a.clv - b.clv)[Math.floor(customerData.length / 2)].clv.toFixed(0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">High-value customers (>$5K CLV)</span>
                    <span className="font-semibold text-green-600">
                      {customerData.filter(c => c.clv > 5000).length}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'strategies' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Customer Strategy Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={strategyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="strategy" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#f59e0b" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h4 className="text-lg font-semibold mb-3">Priority Actions</h4>
                <div className="space-y-3">
                  <div className="p-3 bg-red-50 rounded-lg border-l-4 border-red-500">
                    <h5 className="font-semibold text-red-700">High Priority - Retention</h5>
                    <p className="text-sm text-red-600">
                      {customerData.filter(c => c.strategy === 'Retention Focus - High Priority').length} customers
                    </p>
                    <p className="text-xs text-gray-600 mt-1">High-value customers at risk of churning</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg border-l-4 border-green-500">
                    <h5 className="font-semibold text-green-700">Growth - Expansion/Upsell</h5>
                    <p className="text-sm text-green-600">
                      {customerData.filter(c => c.strategy === 'Expansion/Upsell').length} customers
                    </p>
                    <p className="text-xs text-gray-600 mt-1">High-value, low-churn customers ready for expansion</p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                    <h5 className="font-semibold text-blue-700">Engagement Increase</h5>
                    <p className="text-sm text-blue-600">
                      {customerData.filter(c => c.strategy === 'Engagement Increase').length} customers
                    </p>
                    <p className="text-xs text-gray-600 mt-1">Medium-value customers needing engagement boost</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <h4 className="text-lg font-semibold mb-3">Recommended Actions</h4>
                <div className="space-y-3">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <h5 className="font-semibold">1. Retention Campaign</h5>
                    <p className="text-sm text-gray-600">
                      Target {metrics.highRiskCustomers} high-value customers with personalized retention offers
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <h5 className="font-semibold">2. Upsell Strategy</h5>
                    <p className="text-sm text-gray-600">
                      Approach {customerData.filter(c => c.strategy === 'Expansion/Upsell').length} customers with premium features
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <h5 className="font-semibold">3. Engagement Program</h5>
                    <p className="text-sm text-gray-600">
                      Launch engagement initiatives for {customerData.filter(c => c.engagementScore < 50).length} low-engagement customers
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default SaaSAnalyticsDashboard;