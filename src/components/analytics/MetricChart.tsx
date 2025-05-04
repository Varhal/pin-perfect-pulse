
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
} from 'recharts';

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

const metricColors: Record<string, string> = {
  impressions: '#e60023',
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

  return (
    <Card className="h-[400px]">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-medium">Metric Performance</CardTitle>
        <Select value={selectedMetric} onValueChange={setSelectedMetric}>
          <SelectTrigger className="w-[180px]">
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
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={metrics[selectedMetric] || []}
              margin={{ top: 20, right: 20, left: 20, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="date"
                tickFormatter={(date) => {
                  const d = new Date(date);
                  return `${d.getDate()}/${d.getMonth() + 1}`;
                }}
              />
              <YAxis tickFormatter={formatNumber} />
              <Tooltip
                formatter={(value: number) => [formatNumber(value), metricOptions.find(m => m.value === selectedMetric)?.label]}
                labelFormatter={(label) => {
                  const d = new Date(label);
                  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke={metricColors[selectedMetric] || "#e60023"}
                strokeWidth={2}
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
