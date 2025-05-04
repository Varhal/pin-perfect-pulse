
import React from 'react';
import Layout from '../components/layout/Layout';
import PerformanceMetrics from '../components/analytics/PerformanceMetrics';
import MetricChart from '../components/analytics/MetricChart';
import AudienceInsights from '../components/analytics/AudienceInsights';
import { mockMetricData } from '../data/mockData';

const Analytics = () => {
  const aggregatedPerformanceMetrics = [
    {
      label: 'Impressions',
      value: '6.2M',
      change: '+10.5%',
      changeType: 'positive' as const,
    },
    {
      label: 'Engagements',
      value: '258.5K',
      change: '+15.2%',
      changeType: 'positive' as const,
    },
    {
      label: 'Outbound clicks',
      value: '167K',
      change: '+8.7%',
      changeType: 'positive' as const,
    },
    {
      label: 'Saves',
      value: '110.6K',
      change: '+12.3%',
      changeType: 'positive' as const,
    },
    {
      label: 'Total audience',
      value: '3.8M',
      change: '+5.1%',
      changeType: 'positive' as const,
    },
    {
      label: 'Engaged audience',
      value: '282.2K',
      change: '+9.4%',
      changeType: 'positive' as const,
    },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">General Analytics</h1>
          <p className="text-muted-foreground">
            Combined performance data from all Pinterest accounts
          </p>
        </div>

        <PerformanceMetrics metrics={aggregatedPerformanceMetrics} />
        
        <MetricChart metrics={mockMetricData} />
        
        <AudienceInsights />
      </div>
    </Layout>
  );
};

export default Analytics;
