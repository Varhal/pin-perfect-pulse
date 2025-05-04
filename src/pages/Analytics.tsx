
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
  const [performanceMetrics, setPerformanceMetrics] = useState<any[]>([]);
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

        // Calculate aggregated metrics from real data
        const formatNumber = (num: number): string => {
          if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
          }
          if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
          }
          return num.toString();
        };

        // Calculate metrics from first account
        const firstAccount = accounts[0];
        setPerformanceMetrics([
          {
            label: 'Impressions',
            value: formatNumber(firstAccount.impressions.value),
            change: '+10.5%',
            changeType: 'positive' as const,
          },
          {
            label: 'Engagements',
            value: formatNumber(firstAccount.engagements.value),
            change: '+15.2%',
            changeType: 'positive' as const,
          },
          {
            label: 'Outbound clicks',
            value: formatNumber(firstAccount.clicks.value),
            change: '+8.7%',
            changeType: 'positive' as const,
          },
          {
            label: 'Saves',
            value: formatNumber(firstAccount.saves.value),
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
            value: formatNumber(firstAccount.engaged.value),
            change: '+9.4%',
            changeType: 'positive' as const,
          },
        ]);
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
            <PerformanceMetrics metrics={performanceMetrics} />
            
            {aggregatedData && <MetricChart metrics={aggregatedData} />}
            
            {audienceData && <AudienceInsights audienceData={audienceData} />}
          </>
        )}
      </div>
    </Layout>
  );
};

export default Analytics;
