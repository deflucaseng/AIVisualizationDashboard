import { useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { useCostStore } from '../store/cost-store';

const COLORS = [
  '#3b82f6', // blue
  '#10b981', // green
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#f97316', // orange
];

export function ServiceBreakdown() {
  const { costData } = useCostStore();

  const chartData = useMemo(() => {
    if (costData.length === 0) return [];

    // Get current month data
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const currentMonthData = costData.filter(
      (d) => new Date(d.date) >= currentMonthStart
    );

    // Group by service
    const serviceTotals = new Map<string, number>();
    
    currentMonthData.forEach((point) => {
      const current = serviceTotals.get(point.service) || 0;
      serviceTotals.set(point.service, current + point.cost);
    });

    // Convert to array and sort by cost
    const data = Array.from(serviceTotals.entries())
      .map(([name, value]) => ({
        name,
        value: parseFloat(value.toFixed(2)),
      }))
      .sort((a, b) => b.value - a.value);

    // Take top 8 services, group rest as "Other"
    if (data.length > 8) {
      const top8 = data.slice(0, 8);
      const others = data.slice(8);
      const othersTotal = others.reduce((sum, item) => sum + item.value, 0);
      
      if (othersTotal > 0) {
        top8.push({ name: 'Other', value: parseFloat(othersTotal.toFixed(2)) });
      }
      
      return top8;
    }

    return data;
  }, [costData]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium">{data.name}</p>
          <p className="text-blue-600">{formatCurrency(data.value)}</p>
        </div>
      );
    }
    return null;
  };

  if (costData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Service Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center text-gray-500">
            Upload cost data to see service breakdown
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Service Breakdown (Current Month)</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={320}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) =>
                `${name} ${(percent * 100).toFixed(0)}%`
              }
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
