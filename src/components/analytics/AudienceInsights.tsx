
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';

const COLORS = ['#e60023', '#0097e6', '#27ae60', '#8e44ad', '#f39c12', '#95a5a6'];

const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
  const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));

  return (
    <text 
      x={x} 
      y={y} 
      fill="white" 
      textAnchor={x > cx ? 'start' : 'end'} 
      dominantBaseline="central"
      fontSize="12"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

interface AudienceInsightsProps {
  audienceData: {
    categories: { name: string; percentage: number }[];
    age: { group: string; percentage: number }[];
    gender: { group: string; percentage: number }[];
    locations: { country: string; percentage: number }[];
    devices: { type: string; percentage: number }[];
  };
}

const AudienceInsights: React.FC<AudienceInsightsProps> = ({ audienceData }) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Audience Insights</CardTitle>
        </CardHeader>
      </Card>
      
      {/* Categories Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Categories & Interests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={audienceData.categories}
                margin={{ top: 20, right: 30, left: 100, bottom: 20 }}
              >
                <XAxis type="number" tickFormatter={(value) => `${value}%`} />
                <YAxis dataKey="name" type="category" />
                <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
                <Bar dataKey="percentage" fill="#e60023" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      
      {/* Age Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Age</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={audienceData.age}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="percentage"
                  nameKey="group"
                  label={renderCustomizedLabel}
                >
                  {audienceData.age.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      
      {/* Gender Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Gender</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={audienceData.gender}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="percentage"
                  nameKey="group"
                  label={renderCustomizedLabel}
                >
                  {audienceData.gender.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      
      {/* Location Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Location</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={audienceData.locations}
                margin={{ top: 20, right: 30, left: 100, bottom: 20 }}
              >
                <XAxis type="number" tickFormatter={(value) => `${value}%`} />
                <YAxis dataKey="country" type="category" />
                <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
                <Bar dataKey="percentage" fill="#0097e6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      
      {/* Devices Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Devices</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={audienceData.devices}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="percentage"
                  nameKey="type"
                  label={renderCustomizedLabel}
                >
                  {audienceData.devices.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AudienceInsights;
