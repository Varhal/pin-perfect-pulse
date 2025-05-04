
import React, { useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, CalendarIcon } from 'lucide-react';
import Layout from '../components/layout/Layout';
import { mockAccounts, mockMetricData } from '../data/mockData';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import PerformanceMetrics from '../components/analytics/PerformanceMetrics';
import MetricChart from '../components/analytics/MetricChart';
import AudienceInsights from '../components/analytics/AudienceInsights';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from '@/lib/utils';

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
  const [dateRange, setDateRange] = useState<string>("last7Days");
  const [dateRangeLabel, setDateRangeLabel] = useState<string>("Last 7 days");
  const [customDateFrom, setCustomDateFrom] = useState<Date>();
  const [customDateTo, setCustomDateTo] = useState<Date>(new Date());
  const [isCustomRange, setIsCustomRange] = useState(false);
  
  const account = useMemo(() => {
    return mockAccounts.find(acc => acc.id === id);
  }, [id]);

  const handleDateRangeChange = (value: string) => {
    setDateRange(value);
    setIsCustomRange(value === 'custom');
    
    switch(value) {
      case 'last7Days':
        setDateRangeLabel('Last 7 days');
        break;
      case 'last30Days':
        setDateRangeLabel('Last 30 days');
        break;
      case 'last90Days':
        setDateRangeLabel('Last 90 days');
        break;
      case 'last12Months':
        setDateRangeLabel('Last 12 months');
        break;
      case 'custom':
        if (customDateFrom && customDateTo) {
          setDateRangeLabel(`${format(customDateFrom, 'MMM d, yyyy')} - ${format(customDateTo, 'MMM d, yyyy')}`);
        } else {
          setDateRangeLabel('Custom range');
        }
        break;
      default:
        setDateRangeLabel('Last 7 days');
    }
  };

  const handleCustomDateChange = (type: 'from' | 'to', date?: Date) => {
    if (type === 'from') {
      setCustomDateFrom(date);
    } else {
      setCustomDateTo(date);
    }
    
    if (customDateFrom && customDateTo) {
      setDateRangeLabel(`${format(customDateFrom, 'MMM d, yyyy')} - ${format(customDateTo || new Date(), 'MMM d, yyyy')}`);
    }
  };

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

        {/* Date Range Selector */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <h2 className="text-lg font-medium">Analytics</h2>
          <div className="flex items-center gap-2">
            <Select value={dateRange} onValueChange={handleDateRangeChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select date range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="last7Days">Last 7 days</SelectItem>
                <SelectItem value="last30Days">Last 30 days</SelectItem>
                <SelectItem value="last90Days">Last 90 days</SelectItem>
                <SelectItem value="last12Months">Last 12 months</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>

            {isCustomRange && (
              <div className="flex items-center gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-[160px] justify-start text-left text-sm font-normal",
                        !customDateFrom && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {customDateFrom ? format(customDateFrom, "MMM dd, yyyy") : <span>Start date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={customDateFrom}
                      onSelect={(date) => handleCustomDateChange('from', date)}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>

                <span>-</span>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-[160px] justify-start text-left text-sm font-normal",
                        !customDateTo && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {customDateTo ? format(customDateTo, "MMM dd, yyyy") : <span>End date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={customDateTo}
                      onSelect={(date) => handleCustomDateChange('to', date)}
                      initialFocus
                      disabled={(date) => date > new Date() || (customDateFrom ? date < customDateFrom : false)}
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            )}
          </div>
        </div>

        <PerformanceMetrics metrics={performanceMetrics} dateRange={dateRangeLabel} />
        
        <MetricChart metrics={mockMetricData} />
        
        <AudienceInsights />
      </div>
    </Layout>
  );
};

export default AccountDetail;
