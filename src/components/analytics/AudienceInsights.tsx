
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { mockAudienceInsights } from '@/data/mockData';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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

const AudienceInsights = () => {
  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="text-lg">Audience Insights</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="categories">
          <TabsList className="grid grid-cols-5 mb-6">
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="age">Age</TabsTrigger>
            <TabsTrigger value="gender">Gender</TabsTrigger>
            <TabsTrigger value="location">Location</TabsTrigger>
            <TabsTrigger value="devices">Devices</TabsTrigger>
          </TabsList>

          <TabsContent value="categories">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={mockAudienceInsights.categories}
                  margin={{ top: 20, right: 30, left: 100, bottom: 20 }}
                >
                  <XAxis type="number" tickFormatter={(value) => `${value}%`} />
                  <YAxis dataKey="name" type="category" />
                  <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
                  <Bar dataKey="percentage" fill="#e60023" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="age">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={mockAudienceInsights.age}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="percentage"
                    nameKey="group"
                    label={renderCustomizedLabel}
                  >
                    {mockAudienceInsights.age.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend />
                  <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="gender">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={mockAudienceInsights.gender}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="percentage"
                    nameKey="group"
                    label={renderCustomizedLabel}
                  >
                    {mockAudienceInsights.gender.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend />
                  <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="location">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={mockAudienceInsights.locations}
                  margin={{ top: 20, right: 30, left: 100, bottom: 20 }}
                >
                  <XAxis type="number" tickFormatter={(value) => `${value}%`} />
                  <YAxis dataKey="country" type="category" />
                  <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
                  <Bar dataKey="percentage" fill="#0097e6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="devices">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={mockAudienceInsights.devices}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="percentage"
                    nameKey="type"
                    label={renderCustomizedLabel}
                  >
                    {mockAudienceInsights.devices.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend />
                  <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default AudienceInsights;
