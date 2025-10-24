import { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { useCostStore } from '../store/cost-store';

export function CostTrendsChart() {
  const { costData } = useCostStore();

  const chartData = useMemo(() => {
    if (costData.length === 0) return [];

    // Group by date and sum costs
    const dailyTotals = new Map<string, number>();
    
    costData.forEach((point) => {
      const current = dailyTotals.get(point.date) || 0;
      dailyTotals.set(point.date, current + point.cost);
    });

    // Convert to array and sort by date
    const data = Array.from(dailyTotals.entries())
      .map(([date, cost]) => ({
        date,
        cost: parseFloat(cost.toFixed(2)),
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Take last 30 days
    return data.slice(-30);
  }, [costData]);

  const formatCurrency = (value: number) => {
    return `$${value.toLocaleString()}`;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (costData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Cost Trends (Last 30 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center text-gray-500">
            Upload cost data to see trends
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cost Trends (Last 30 Days)</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="date"
              tickFormatter={formatDate}
              stroke="#6b7280"
            />
            <YAxis tickFormatter={formatCurrency} stroke="#6b7280" />
            <Tooltip
              formatter={(value: number) => formatCurrency(value)}
              labelFormatter={formatDate}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="cost"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={false}
              name="Daily Cost"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
