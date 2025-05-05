
import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { ChartBar, Calendar } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface MetricChartProps {
  metrics: Record<string, { date: string; value: number }[]>;
}

const metricOptions = [
  { value: 'impressions', label: 'Impressions' },
  { value: 'engagements', label: 'Engagements' },
  { value: 'pinClicks', label: 'Pin Clicks' },
  { value: 'outboundClicks', label: 'Outbound Clicks' },
  { value: 'saves', label: 'Saves' },
  { value: 'totalAudience', label: 'Total Audience' },
  { value: 'engagedAudience', label: 'Engaged Audience' },
];

// Define Pinterest-branded colors for the chart
const metricColors: Record<string, string> = {
  impressions: '#e60023', // Pinterest red
  engagements: '#0097e6',
  pinClicks: '#27ae60',
  outboundClicks: '#8e44ad',
  saves: '#f39c12',
  totalAudience: '#3498db',
  engagedAudience: '#e74c3c',
};

const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

const MetricChart: React.FC<MetricChartProps> = ({ metrics }) => {
  const [selectedMetric, setSelectedMetric] = useState('impressions');
  const [viewMode, setViewMode] = useState('daily');
  
  // Function to prepare daily data
  const getDailyData = () => {
    return metrics[selectedMetric] || [];
  };
  
  // Function to aggregate data by week
  const getWeeklyData = () => {
    const dailyData = metrics[selectedMetric] || [];
    if (dailyData.length === 0) return [];
    
    const weeklyMap: Record<string, {date: string, value: number, count: number}> = {};
    
    dailyData.forEach(item => {
      const date = new Date(item.date);
      // Get the week number (1-52)
      const weekNumber = Math.ceil((date.getDate() + 
        new Date(date.getFullYear(), date.getMonth(), 1).getDay()) / 7);
      
      const weekKey = `${date.getFullYear()}-W${weekNumber}`;
      
      if (!weeklyMap[weekKey]) {
        weeklyMap[weekKey] = {
          date: `Week ${weekNumber}, ${date.toLocaleString('default', { month: 'short' })}`,
          value: 0,
          count: 0
        };
      }
      
      weeklyMap[weekKey].value += item.value;
      weeklyMap[weekKey].count += 1;
    });
    
    return Object.values(weeklyMap).map(week => ({
      date: week.date,
      value: Math.round(week.value / week.count) // Average for the week
    }));
  };
  
  // Function to aggregate data by month
  const getMonthlyData = () => {
    const dailyData = metrics[selectedMetric] || [];
    if (dailyData.length === 0) return [];
    
    const monthlyMap: Record<string, {date: string, value: number, count: number}> = {};
    
    dailyData.forEach(item => {
      const date = new Date(item.date);
      const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
      
      if (!monthlyMap[monthKey]) {
        monthlyMap[monthKey] = {
          date: date.toLocaleString('default', { month: 'long', year: 'numeric' }),
          value: 0,
          count: 0
        };
      }
      
      monthlyMap[monthKey].value += item.value;
      monthlyMap[monthKey].count += 1;
    });
    
    return Object.values(monthlyMap).map(month => ({
      date: month.date,
      value: Math.round(month.value / month.count) // Average for the month
    }));
  };
  
  // Get data based on selected view mode
  const getChartData = () => {
    switch (viewMode) {
      case 'weekly':
        return getWeeklyData();
      case 'monthly':
        return getMonthlyData();
      default: // 'daily'
        return getDailyData();
    }
  };
  
  const chartData = getChartData();

  return (
    <Card className="h-[500px]">
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0 pb-4">
        <div className="flex items-center gap-2">
          <ChartBar className="h-5 w-5 text-pinterest-red" />
          <CardTitle className="text-lg font-medium">Metric Performance</CardTitle>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full sm:w-auto">
          <Select value={selectedMetric} onValueChange={setSelectedMetric}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Select metric" />
            </SelectTrigger>
            <SelectContent>
              {metricOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Tabs value={viewMode} onValueChange={setViewMode} className="w-full sm:w-auto">
            <TabsList className="grid grid-cols-3 w-full sm:w-[200px]">
              <TabsTrigger value="daily">Daily</TabsTrigger>
              <TabsTrigger value="weekly">Weekly</TabsTrigger>
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 20, right: 20, left: 20, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                tickFormatter={(date) => {
                  if (viewMode !== 'daily') return date;
                  try {
                    const d = new Date(date);
                    return `${d.getDate()}/${d.getMonth() + 1}`;
                  } catch (e) {
                    return date;
                  }
                }}
              />
              <YAxis 
                tickFormatter={formatNumber}
                tick={{ fontSize: 12 }}
                width={50}
              />
              <Tooltip
                formatter={(value: number) => [
                  formatNumber(value), 
                  metricOptions.find(m => m.value === selectedMetric)?.label
                ]}
                labelFormatter={(label) => {
                  if (viewMode !== 'daily') return label;
                  try {
                    const d = new Date(label);
                    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                  } catch (e) {
                    return label;
                  }
                }}
              />
              <Legend />
              <Line
                name={metricOptions.find(m => m.value === selectedMetric)?.label}
                type="monotone"
                dataKey="value"
                stroke={metricColors[selectedMetric] || "#e60023"}
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default MetricChart;
