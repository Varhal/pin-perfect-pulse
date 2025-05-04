
import React, { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Layout from '../components/layout/Layout';
import { mockAccounts, mockMetricData } from '../data/mockData';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import PerformanceMetrics from '../components/analytics/PerformanceMetrics';
import MetricChart from '../components/analytics/MetricChart';
import AudienceInsights from '../components/analytics/AudienceInsights';
import { Button } from '@/components/ui/button';

const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

const AccountDetail = () => {
  const { id } = useParams<{ id: string }>();
  
  const account = useMemo(() => {
    return mockAccounts.find(acc => acc.id === id);
  }, [id]);

  if (!account) {
    return (
      <Layout>
        <div className="text-center py-10">
          <h1 className="text-2xl font-bold mb-4">Account not found</h1>
          <Link to="/" className="text-pinterest-red hover:text-pinterest-darkred">
            Back to accounts
          </Link>
        </div>
      </Layout>
    );
  }

  const performanceMetrics = [
    {
      label: 'Impressions',
      value: formatNumber(account.impressions.value),
      change: '+8.2%',
      changeType: 'positive' as const,
    },
    {
      label: 'Engagements',
      value: formatNumber(account.engagements.value),
      change: '+12.5%',
      changeType: 'positive' as const,
    },
    {
      label: 'Outbound clicks',
      value: formatNumber(account.clicks.value),
      change: '+5.1%',
      changeType: 'positive' as const,
    },
    {
      label: 'Saves',
      value: formatNumber(account.saves.value),
      change: '+10.8%',
      changeType: 'positive' as const,
    },
    {
      label: 'Total audience',
      value: '1.2M',
      change: '+3.4%',
      changeType: 'positive' as const,
    },
    {
      label: 'Engaged audience',
      value: formatNumber(account.engaged.value),
      change: '+7.6%',
      changeType: 'positive' as const,
    },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
          <Avatar className="h-12 w-12">
            <AvatarImage src={account.avatarUrl} alt={account.name} />
            <AvatarFallback>{account.name.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold">{account.name}</h1>
            <p className="text-muted-foreground">@{account.username}</p>
          </div>
        </div>

        <PerformanceMetrics metrics={performanceMetrics} />
        
        <MetricChart metrics={mockMetricData} />
        
        <AudienceInsights />
      </div>
    </Layout>
  );
};

export default AccountDetail;
