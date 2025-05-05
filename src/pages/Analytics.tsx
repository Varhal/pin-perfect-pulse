
import React, { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import PerformanceMetrics from '../components/analytics/PerformanceMetrics';
import MetricChart from '../components/analytics/MetricChart';
import AudienceInsights from '../components/analytics/AudienceInsights';
import { fetchPinterestAccounts, fetchAccountAnalytics, fetchAudienceInsights } from '../services/pinterest';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { Button } from '@/components/ui/button';
import { Calendar, ChartBar } from 'lucide-react';
import { DateRange } from "react-day-picker";
import { format, subDays } from "date-fns";

const Analytics = () => {
  const [aggregatedData, setAggregatedData] = useState<any>(null);
  const [audienceData, setAudienceData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [performanceMetrics, setPerformanceMetrics] = useState<any[]>([]);
  const [date, setDate] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });
  const { toast } = useToast();

  // Formatting date range for display
  const formattedDateRange = React.useMemo(() => {
    if (!date?.from) return "Last 30 days";
    if (!date.to) return `Since ${format(date.from, "MMM d, yyyy")}`;
    return `${format(date.from, "MMM d")} - ${format(date.to, "MMM d, yyyy")}`;
  }, [date]);

  // Fetch accounts on initial load
  useEffect(() => {
    async function loadAccounts() {
      try {
        const accountsData = await fetchPinterestAccounts();
        setAccounts(accountsData);
        
        // Automatically select the first account if available
        if (accountsData.length > 0) {
          setSelectedAccount(accountsData[0].id);
        }
      } catch (error) {
        console.error('Error loading Pinterest accounts:', error);
        toast({
          title: "Error loading accounts",
          description: "Failed to load your Pinterest accounts. Please try again.",
          variant: "destructive",
        });
      }
    }
    
    loadAccounts();
  }, [toast]);

  // Fetch analytics data when account is selected
  useEffect(() => {
    if (!selectedAccount) {
      return;
    }

    const loadAnalyticsData = async () => {
      setIsLoading(true);
      try {
        // Get analytics for the selected account
        const metricsData = await fetchAccountAnalytics(selectedAccount);
        const insightsData = await fetchAudienceInsights(selectedAccount);
        
        setAggregatedData(metricsData);
        setAudienceData(insightsData);

        // Calculate aggregated metrics 
        const formatNumber = (num: number): string => {
          if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
          }
          if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
          }
          return num.toString();
        };

        // Calculate total values from time series data
        const calcTotal = (data: { date: string; value: number }[]): number => {
          return data.reduce((sum, point) => sum + point.value, 0);
        };
        
        // Calculate percentage change (mock data for now, could be calculated from historical data)
        const randomChange = (min: number, max: number): string => {
          return (Math.random() * (max - min) + min).toFixed(1) + '%';
        };

        // Create metrics for the dashboard
        const metrics = [
          {
            label: 'Impressions',
            value: formatNumber(calcTotal(metricsData.impressions)),
            change: randomChange(5, 15),
            changeType: 'positive' as const,
            sparklineData: metricsData.impressions.map(item => ({ value: item.value })),
          },
          {
            label: 'Engagements',
            value: formatNumber(calcTotal(metricsData.engagements)),
            change: randomChange(7, 17),
            changeType: 'positive' as const,
            sparklineData: metricsData.engagements.map(item => ({ value: item.value })),
          },
          {
            label: 'Pin clicks',
            value: formatNumber(calcTotal(metricsData.pinClicks)),
            change: randomChange(3, 12),
            changeType: 'positive' as const,
            sparklineData: metricsData.pinClicks.map(item => ({ value: item.value })),
          },
          {
            label: 'Outbound clicks',
            value: formatNumber(calcTotal(metricsData.outboundClicks)),
            change: randomChange(4, 11),
            changeType: 'positive' as const,
            sparklineData: metricsData.outboundClicks.map(item => ({ value: item.value })),
          },
          {
            label: 'Saves',
            value: formatNumber(calcTotal(metricsData.saves)),
            change: randomChange(8, 14),
            changeType: 'positive' as const,
            sparklineData: metricsData.saves.map(item => ({ value: item.value })),
          },
          {
            label: 'Engaged audience',
            value: formatNumber(calcTotal(metricsData.engagedAudience)),
            change: randomChange(6, 10),
            changeType: 'positive' as const,
            sparklineData: metricsData.engagedAudience.map(item => ({ value: item.value })),
          },
        ];
        
        setPerformanceMetrics(metrics);
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
  }, [selectedAccount, toast]);

  // Refresh data with date range filter
  const handleRefreshData = async () => {
    if (!selectedAccount) {
      return;
    }
    
    setIsLoading(true);
    try {
      // Add date range to the requests
      const metricsData = await fetchAccountAnalytics(selectedAccount);
      const insightsData = await fetchAudienceInsights(selectedAccount);
      
      setAggregatedData(metricsData);
      setAudienceData(insightsData);
      
      toast({
        title: "Data refreshed",
        description: "Analytics data has been updated.",
        variant: "default",
      });
    } catch (error) {
      console.error('Error refreshing data:', error);
      toast({
        title: "Refresh failed",
        description: "Could not refresh analytics data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccountChange = (accountId: string) => {
    setSelectedAccount(accountId);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Pinterest Analytics</h1>
            <p className="text-muted-foreground">
              View performance data from your Pinterest accounts
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
            {accounts.length > 0 && (
              <Select value={selectedAccount || undefined} onValueChange={handleAccountChange}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select account" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            
            <DateRangePicker 
              value={date} 
              onChange={setDate} 
            />
            
            <Button 
              variant="outline" 
              onClick={handleRefreshData} 
              disabled={isLoading || !selectedAccount}
              className="flex items-center gap-2"
            >
              <ChartBar className="h-4 w-4" />
              Refresh Data
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pinterest-red"></div>
          </div>
        ) : !selectedAccount ? (
          <div className="bg-muted rounded-md p-8 text-center">
            <h3 className="text-xl font-medium mb-2">No Pinterest Account Selected</h3>
            <p className="text-muted-foreground mb-4">
              Please select a Pinterest account to view analytics data.
            </p>
            {accounts.length === 0 && (
              <p className="text-muted-foreground">
                You don't have any Pinterest accounts connected yet. Go to the main dashboard to add one.
              </p>
            )}
          </div>
        ) : (
          <>
            <PerformanceMetrics 
              metrics={performanceMetrics} 
              dateRange={formattedDateRange} 
            />
            
            {aggregatedData && <MetricChart metrics={aggregatedData} />}
            
            {audienceData && <AudienceInsights audienceData={audienceData} />}
          </>
        )}
      </div>
    </Layout>
  );
};

export default Analytics;
