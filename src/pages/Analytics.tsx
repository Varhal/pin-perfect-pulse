
import React, { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import PerformanceMetrics from '../components/analytics/PerformanceMetrics';
import MetricChart from '../components/analytics/MetricChart';
import AudienceInsights from '../components/analytics/AudienceInsights';
import { fetchPinterestAccounts, fetchAccountAnalytics, fetchAudienceInsights } from '../services/pinterestApi';
import { useToast } from '@/hooks/use-toast';

const Analytics = () => {
  const [aggregatedData, setAggregatedData] = useState<any>(null);
  const [audienceData, setAudienceData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const loadAnalyticsData = async () => {
      setIsLoading(true);
      try {
        // Fetch all accounts
        const accounts = await fetchPinterestAccounts();
        
        if (accounts.length === 0) {
          setIsLoading(false);
          return;
        }
        
        // Get analytics for the first account (we'll aggregate in the future)
        const firstAccountId = accounts[0].id;
        const metricsData = await fetchAccountAnalytics(firstAccountId);
        const insightsData = await fetchAudienceInsights(firstAccountId);
        
        setAggregatedData(metricsData);
        setAudienceData(insightsData);
      } catch (error) {
        console.error('Error loading analytics data:', error);
        toast({
          title: "Error loading data",
          description: "Failed to load analytics. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadAnalyticsData();
  }, [toast]);

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

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pinterest-red"></div>
          </div>
        ) : (
          <>
            <PerformanceMetrics metrics={aggregatedPerformanceMetrics} />
            
            {aggregatedData && <MetricChart metrics={aggregatedData} />}
            
            {audienceData && <AudienceInsights audienceData={audienceData} />}
          </>
        )}
      </div>
    </Layout>
  );
};

export default Analytics;
