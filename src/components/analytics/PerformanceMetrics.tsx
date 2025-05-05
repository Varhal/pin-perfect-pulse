
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Info } from 'lucide-react';
import MiniChart from '../ui/MiniChart';

interface Metric {
  label: string;
  value: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  sparklineData?: { value: number }[];
}

interface PerformanceMetricsProps {
  metrics: Metric[];
  dateRange?: string;
}

const PerformanceMetrics: React.FC<PerformanceMetricsProps> = ({ metrics, dateRange }) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg flex items-center gap-2">
          Overall Performance
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">Aggregate metrics from your Pinterest account</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
        {dateRange && <span className="text-sm text-muted-foreground">{dateRange}</span>}
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {metrics.map((metric, index) => (
            <div key={index} className="space-y-2">
              <p className="text-sm text-gray-500">{metric.label}</p>
              <p className="text-2xl font-bold">{metric.value}</p>
              {metric.change && (
                <div className="flex items-center space-x-1">
                  <span 
                    className={`text-xs font-medium ${
                      metric.changeType === 'positive' 
                        ? 'text-green-600' 
                        : metric.changeType === 'negative' 
                          ? 'text-red-600' 
                          : 'text-gray-600'
                    }`}
                  >
                    {metric.changeType === 'positive' ? '↑' : metric.changeType === 'negative' ? '↓' : ''}
                    {metric.change}
                  </span>
                  <span className="text-xs text-muted-foreground">vs. previous</span>
                </div>
              )}
              
              {metric.sparklineData && (
                <div className="h-8 mt-2">
                  <MiniChart 
                    data={metric.sparklineData}
                    color="#e60023"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default PerformanceMetrics;
