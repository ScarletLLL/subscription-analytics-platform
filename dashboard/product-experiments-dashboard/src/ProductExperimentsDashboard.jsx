import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Area, AreaChart } from 'recharts';
import { TrendingUp, TrendingDown, Users, Target, Activity, AlertTriangle, CheckCircle, XCircle, Eye, Clock, MousePointer, DollarSign } from 'lucide-react';

const ABTestDashboard = () => {
  const [selectedExperiment, setSelectedExperiment] = useState('pricing');
  const [selectedMetric, setSelectedMetric] = useState('conversion');

  // Mock data based on the Python script
  const experimentData = {
    pricing: {
      name: 'Pricing Strategy Test',
      description: 'Testing new pricing model vs current pricing',
      status: 'active',
      duration: '14 days',
      participants: 2847,
      metrics: {
        conversion: { control: 0.287, treatment: 0.342, lift: 19.2, pValue: 0.0023, significant: true },
        revenue: { control: 1247.50, treatment: 1434.62, lift: 15.0, pValue: 0.0156, significant: true },
        pageViews: { control: 5.2, treatment: 5.8, lift: 11.5, pValue: 0.0432, significant: true },
        sessionDuration: { control: 8.7, treatment: 9.4, lift: 8.0, pValue: 0.0891, significant: false }
      }
    },
    ui: {
      name: 'UI/UX Redesign Test',
      description: 'New interface design vs current design',
      status: 'active',
      duration: '21 days',
      participants: 3142,
      metrics: {
        conversion: { control: 0.312, treatment: 0.356, lift: 14.1, pValue: 0.0034, significant: true },
        revenue: { control: 1156.80, treatment: 1249.34, lift: 8.0, pValue: 0.0267, significant: true },
        pageViews: { control: 4.8, treatment: 5.9, lift: 22.9, pValue: 0.0012, significant: true },
        sessionDuration: { control: 7.9, treatment: 10.2, lift: 29.1, pValue: 0.0001, significant: true }
      }
    },
    feature: {
      name: 'Feature Enhancement Test',
      description: 'New feature vs baseline experience',
      status: 'completed',
      duration: '28 days',
      participants: 4256,
      metrics: {
        conversion: { control: 0.295, treatment: 0.318, lift: 7.8, pValue: 0.0456, significant: true },
        revenue: { control: 1198.75, treatment: 1267.89, lift: 5.8, pValue: 0.0789, significant: false },
        pageViews: { control: 5.1, treatment: 5.3, lift: 3.9, pValue: 0.1234, significant: false },
        sessionDuration: { control: 9.1, treatment: 9.6, lift: 5.5, pValue: 0.0923, significant: false }
      }
    }
  };

  // Time series data for trends
  const timeSeriesData = [
    { day: 'Day 1', control: 0.28, treatment: 0.29 },
    { day: 'Day 2', control: 0.30, treatment: 0.32 },
    { day: 'Day 3', control: 0.29, treatment: 0.34 },
    { day: 'Day 4', control: 0.31, treatment: 0.35 },
    { day: 'Day 5', control: 0.28, treatment: 0.33 },
    { day: 'Day 6', control: 0.32, treatment: 0.36 },
    { day: 'Day 7', control: 0.29, treatment: 0.34 },
    { day: 'Day 8', control: 0.30, treatment: 0.35 },
    { day: 'Day 9', control: 0.28, treatment: 0.33 },
    { day: 'Day 10', control: 0.31, treatment: 0.37 },
    { day: 'Day 11', control: 0.29, treatment: 0.34 },
    { day: 'Day 12', control: 0.30, treatment: 0.35 },
    { day: 'Day 13', control: 0.28, treatment: 0.33 },
    { day: 'Day 14', control: 0.29, treatment: 0.34 }
  ];

  // Sample size and power analysis data
  const sampleSizeData = [
    { effect: '5%', required: 6420, current: 2847, status: 'insufficient' },
    { effect: '10%', required: 1605, current: 2847, status: 'sufficient' },
    { effect: '15%', required: 713, current: 2847, status: 'sufficient' },
    { effect: '20%', required: 401, current: 2847, status: 'sufficient' }
  ];

  const currentExperiment = experimentData[selectedExperiment];
  const currentMetric = currentExperiment.metrics[selectedMetric];

  // Calculate overall health score
  const healthScore = useMemo(() => {
    const experiments = Object.values(experimentData);
    const totalMetrics = experiments.reduce((acc, exp) => acc + Object.keys(exp.metrics).length, 0);
    const significantMetrics = experiments.reduce((acc, exp) => 
      acc + Object.values(exp.metrics).filter(m => m.significant).length, 0);
    return Math.round((significantMetrics / totalMetrics) * 100);
  }, []);

  // Metric icon mapping
  const metricIcons = {
    conversion: Target,
    revenue: DollarSign,
    pageViews: Eye,
    sessionDuration: Clock
  };

  // Status colors
  const statusColors = {
    active: 'bg-green-100 text-green-800',
    completed: 'bg-blue-100 text-blue-800',
    paused: 'bg-yellow-100 text-yellow-800'
  };

  const MetricCard = ({ title, value, change, isPercentage, icon: Icon, significant }) => (
    <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-l-blue-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Icon className="h-8 w-8 text-blue-600" />
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">
              {isPercentage ? `${(value * 100).toFixed(1)}%` : value.toFixed(2)}
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className={`flex items-center ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {change >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
            <span className="ml-1 font-semibold">{change >= 0 ? '+' : ''}{change.toFixed(1)}%</span>
          </div>
          <div className="flex items-center mt-1">
            {significant ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <XCircle className="h-4 w-4 text-red-500" />
            )}
            <span className={`ml-1 text-xs ${significant ? 'text-green-600' : 'text-red-600'}`}>
              {significant ? 'Significant' : 'Not Significant'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  const ExperimentCard = ({ experiment, name, isActive, onClick }) => (
    <div 
      className={`cursor-pointer rounded-lg p-4 border-2 transition-all duration-200 ${
        isActive ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white hover:border-gray-300'
      }`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-gray-900">{experiment.name}</h3>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[experiment.status]}`}>
          {experiment.status}
        </span>
      </div>
      <p className="text-sm text-gray-600 mb-3">{experiment.description}</p>
      <div className="flex justify-between text-sm text-gray-500">
        <span><Users className="h-4 w-4 inline mr-1" />{experiment.participants.toLocaleString()}</span>
        <span><Clock className="h-4 w-4 inline mr-1" />{experiment.duration}</span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">A/B Testing Dashboard</h1>
          <p className="text-gray-600">Monitor and analyze your experiments in real-time</p>
        </div>

        {/* Health Score Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 mb-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">Experiment Health Score</h2>
              <p className="text-blue-100">Overall performance across all active experiments</p>
            </div>
            <div className="text-right">
              <div className="text-5xl font-bold">{healthScore}%</div>
              <div className="flex items-center justify-end mt-2">
                <Activity className="h-5 w-5 mr-1" />
                <span className="text-sm">3 Active Experiments</span>
              </div>
            </div>
          </div>
        </div>

        {/* Experiment Selection */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {Object.entries(experimentData).map(([key, experiment]) => (
            <ExperimentCard
              key={key}
              experiment={experiment}
              name={key}
              isActive={selectedExperiment === key}
              onClick={() => setSelectedExperiment(key)}
            />
          ))}
        </div>

        {/* Current Experiment Details */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">{currentExperiment.name}</h2>
            <div className="flex space-x-2">
              {Object.keys(currentExperiment.metrics).map((metric) => (
                <button
                  key={metric}
                  onClick={() => setSelectedMetric(metric)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    selectedMetric === metric
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {metric.charAt(0).toUpperCase() + metric.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Metrics Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {Object.entries(currentExperiment.metrics).map(([key, metric]) => {
              const Icon = metricIcons[key];
              return (
                <MetricCard
                  key={key}
                  title={key.charAt(0).toUpperCase() + key.slice(1)}
                  value={metric.treatment}
                  change={metric.lift}
                  isPercentage={key === 'conversion'}
                  icon={Icon}
                  significant={metric.significant}
                />
              );
            })}
          </div>

          {/* Detailed Analysis */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Conversion Trend */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Conversion Rate Trend</h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={timeSeriesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip formatter={(value) => `${(value * 100).toFixed(1)}%`} />
                  <Area type="monotone" dataKey="control" stroke="#64748b" fill="#64748b" fillOpacity={0.3} name="Control" />
                  <Area type="monotone" dataKey="treatment" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} name="Treatment" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Statistical Analysis */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Statistical Analysis</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Control Group:</span>
                  <span className="font-semibold">
                    {selectedMetric === 'conversion' 
                      ? `${(currentMetric.control * 100).toFixed(1)}%`
                      : currentMetric.control.toFixed(2)
                    }
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Treatment Group:</span>
                  <span className="font-semibold">
                    {selectedMetric === 'conversion' 
                      ? `${(currentMetric.treatment * 100).toFixed(1)}%`
                      : currentMetric.treatment.toFixed(2)
                    }
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Lift:</span>
                  <span className={`font-semibold ${currentMetric.lift >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {currentMetric.lift >= 0 ? '+' : ''}{currentMetric.lift.toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">P-Value:</span>
                  <span className="font-semibold">{currentMetric.pValue.toFixed(4)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Statistical Significance:</span>
                  <div className="flex items-center">
                    {currentMetric.significant ? (
                      <CheckCircle className="h-5 w-5 text-green-500 mr-1" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500 mr-1" />
                    )}
                    <span className={`font-semibold ${currentMetric.significant ? 'text-green-600' : 'text-red-600'}`}>
                      {currentMetric.significant ? 'Significant' : 'Not Significant'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sample Size Analysis */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Sample Size & Power Analysis</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Required Sample Sizes</h3>
              <div className="space-y-3">
                {sampleSizeData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <span className="text-gray-700">{item.effect} Effect Size:</span>
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold">{item.required.toLocaleString()}</span>
                      {item.status === 'sufficient' ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-orange-500" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Current vs Required Sample Size</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={sampleSizeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="effect" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="required" fill="#94a3b8" name="Required" />
                  <Bar dataKey="current" fill="#3b82f6" name="Current" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Recommendations</h2>
          <div className="space-y-4">
            <div className="flex items-start space-x-3 p-4 bg-green-50 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
              <div>
                <p className="font-semibold text-green-800">Pricing Experiment: IMPLEMENT</p>
                <p className="text-green-700 text-sm">Shows significant positive impact across conversion and revenue metrics. Consider full rollout.</p>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg">
              <Activity className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
              <div>
                <p className="font-semibold text-blue-800">UI/UX Experiment: CONTINUE MONITORING</p>
                <p className="text-blue-700 text-sm">Strong engagement improvements. Monitor for sustained conversion impact.</p>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-4 bg-yellow-50 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-1 flex-shrink-0" />
              <div>
                <p className="font-semibold text-yellow-800">Feature Experiment: INVESTIGATE</p>
                <p className="text-yellow-700 text-sm">Mixed results. Consider segmentation analysis to identify user groups that benefit most.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ABTestDashboard;