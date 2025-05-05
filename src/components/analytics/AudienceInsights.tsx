
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, LabelList } from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Users, MapPin, Monitor, PieChart as PieChartIcon } from 'lucide-react';

// Pinterest branding colors
const COLORS = ['#e60023', '#bd081c', '#0076d3', '#ffc208', '#00af87', '#cb4791'];

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
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-pinterest-red" />
            <CardTitle className="text-lg">Audience Insights</CardTitle>
          </div>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="categories" className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 mb-4">
              <TabsTrigger value="categories" className="flex items-center gap-1">
                <PieChartIcon className="h-4 w-4" />
                <span className="hidden md:inline">Categories</span>
              </TabsTrigger>
              <TabsTrigger value="age" className="flex items-center gap-1">
                <User className="h-4 w-4" />
                <span className="hidden md:inline">Age</span>
              </TabsTrigger>
              <TabsTrigger value="gender" className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span className="hidden md:inline">Gender</span>
              </TabsTrigger>
              <TabsTrigger value="location" className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span className="hidden md:inline">Location</span>
              </TabsTrigger>
              <TabsTrigger value="devices" className="flex items-center gap-1">
                <Monitor className="h-4 w-4" />
                <span className="hidden md:inline">Devices</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="categories">
              <div className="h-[400px]">
                <h3 className="text-lg font-semibold mb-4">Categories & Interests</h3>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    layout="vertical"
                    data={audienceData.categories}
                    margin={{ top: 20, right: 30, left: 100, bottom: 20 }}
                  >
                    <XAxis type="number" tickFormatter={(value) => `${value}%`} />
                    <YAxis dataKey="name" type="category" />
                    <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
                    <Bar dataKey="percentage" fill="#e60023">
                      <LabelList dataKey="percentage" position="right" formatter={(value: number) => `${value}%`} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
            
            <TabsContent value="age">
              <div className="h-[400px]">
                <h3 className="text-lg font-semibold mb-4">Age Distribution</h3>
                <div className="grid md:grid-cols-2 gap-4 h-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={audienceData.age}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="percentage"
                        nameKey="group"
                        label={renderCustomizedLabel}
                      >
                        {audienceData.age.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
                    </PieChart>
                  </ResponsiveContainer>
                  
                  <div className="flex flex-col justify-center">
                    <h4 className="text-sm font-medium mb-2">Age Breakdown</h4>
                    <div className="space-y-2">
                      {audienceData.age.map((entry, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: COLORS[index % COLORS.length] }}
                            ></div>
                            <span className="text-sm">{entry.group}</span>
                          </div>
                          <span className="text-sm font-medium">{entry.percentage}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="gender">
              <div className="h-[400px]">
                <h3 className="text-lg font-semibold mb-4">Gender Distribution</h3>
                <div className="grid md:grid-cols-2 gap-4 h-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={audienceData.gender}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="percentage"
                        nameKey="group"
                        label={renderCustomizedLabel}
                      >
                        {audienceData.gender.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={index === 0 ? "#e60023" : "#0076d3"} />
                        ))}
                      </Pie>
                      <Legend />
                      <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
                    </PieChart>
                  </ResponsiveContainer>
                  
                  <div className="flex flex-col justify-center">
                    <h4 className="text-sm font-medium mb-2">Gender Breakdown</h4>
                    <div className="space-y-4">
                      {audienceData.gender.map((entry, index) => (
                        <div key={index} className="space-y-1">
                          <div className="flex justify-between items-center">
                            <span className="text-sm">{entry.group === 'FEMALE' ? 'Female' : entry.group === 'MALE' ? 'Male' : entry.group}</span>
                            <span className="text-sm font-medium">{entry.percentage}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div 
                              className="h-2.5 rounded-full" 
                              style={{ 
                                width: `${entry.percentage}%`,
                                backgroundColor: index === 0 ? "#e60023" : "#0076d3"
                              }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="location">
              <div className="h-[400px]">
                <h3 className="text-lg font-semibold mb-4">Top Locations</h3>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    layout="vertical"
                    data={audienceData.locations}
                    margin={{ top: 20, right: 30, left: 100, bottom: 20 }}
                  >
                    <XAxis type="number" tickFormatter={(value) => `${value}%`} />
                    <YAxis dataKey="country" type="category" />
                    <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
                    <Bar dataKey="percentage" fill="#0076d3">
                      <LabelList dataKey="percentage" position="right" formatter={(value: number) => `${value}%`} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
            
            <TabsContent value="devices">
              <div className="h-[400px]">
                <h3 className="text-lg font-semibold mb-4">Device Distribution</h3>
                <div className="grid md:grid-cols-2 gap-4 h-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={audienceData.devices}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={120}
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
                  
                  <div className="flex flex-col justify-center">
                    <h4 className="text-sm font-medium mb-2">Device Breakdown</h4>
                    <div className="space-y-2">
                      {audienceData.devices.map((entry, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: COLORS[index % COLORS.length] }}
                            ></div>
                            <span className="text-sm">{entry.type}</span>
                          </div>
                          <span className="text-sm font-medium">{entry.percentage}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AudienceInsights;
