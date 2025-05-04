
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Metric {
  label: string;
  value: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
}

interface PerformanceMetricsProps {
  metrics: Metric[];
  dateRange?: string; // Add dateRange prop
}

const PerformanceMetrics: React.FC<PerformanceMetricsProps> = ({ metrics, dateRange }) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Overall Performance</CardTitle>
        {dateRange && <span className="text-sm text-muted-foreground">{dateRange}</span>}
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {metrics.map((metric, index) => (
            <div key={index} className="space-y-1">
              <p className="text-sm text-gray-500">{metric.label}</p>
              <p className="text-2xl font-bold">{metric.value}</p>
              {metric.change && (
                <p 
                  className={`text-xs ${
                    metric.changeType === 'positive' 
                      ? 'text-green-600' 
                      : metric.changeType === 'negative' 
                        ? 'text-red-600' 
                        : 'text-gray-600'
                  }`}
                >
                  {metric.changeType === 'positive' ? '↑' : metric.changeType === 'negative' ? '↓' : ''}
                  {metric.change}
                </p>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default PerformanceMetrics;
