import { useMemo } from 'react';
import { TrendingUp, TrendingDown, DollarSign, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { useCostStore } from '../store/cost-store';

export function CostOverview() {
  const { costData, anomalies } = useCostStore();

  const stats = useMemo(() => {
    if (costData.length === 0) {
      return {
        currentMonth: 0,
        previousMonth: 0,
        change: 0,
        changePercent: 0,
        totalAnomalies: 0,
        highSeverityAnomalies: 0,
      };
    }

    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    const currentMonthCost = costData
      .filter((d) => new Date(d.date) >= currentMonthStart)
      .reduce((sum, d) => sum + d.cost, 0);

    const previousMonthCost = costData
      .filter(
        (d) =>
          new Date(d.date) >= previousMonthStart &&
          new Date(d.date) <= previousMonthEnd
      )
      .reduce((sum, d) => sum + d.cost, 0);

    const change = currentMonthCost - previousMonthCost;
    const changePercent = previousMonthCost > 0 ? (change / previousMonthCost) * 100 : 0;

    return {
      currentMonth: currentMonthCost,
      previousMonth: previousMonthCost,
      change,
      changePercent,
      totalAnomalies: anomalies.length,
      highSeverityAnomalies: anomalies.filter((a) => a.severity === 'high').length,
    };
  }, [costData, anomalies]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm">Current Month Spend</CardTitle>
          <DollarSign className="h-4 w-4 text-gray-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl">{formatCurrency(stats.currentMonth)}</div>
          <p className="text-xs text-gray-500 mt-1">
            vs {formatCurrency(stats.previousMonth)} last month
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm">Month-over-Month</CardTitle>
          {stats.changePercent >= 0 ? (
            <TrendingUp className="h-4 w-4 text-red-500" />
          ) : (
            <TrendingDown className="h-4 w-4 text-green-500" />
          )}
        </CardHeader>
        <CardContent>
          <div className={`text-2xl ${stats.changePercent >= 0 ? 'text-red-600' : 'text-green-600'}`}>
            {stats.changePercent >= 0 ? '+' : ''}
            {stats.changePercent.toFixed(1)}%
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {stats.change >= 0 ? '+' : ''}
            {formatCurrency(Math.abs(stats.change))} change
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm">Active Anomalies</CardTitle>
          <AlertTriangle className="h-4 w-4 text-orange-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl">{stats.totalAnomalies}</div>
          <p className="text-xs text-gray-500 mt-1">
            {stats.highSeverityAnomalies} high severity
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm">Potential Savings</CardTitle>
          <DollarSign className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl text-green-600">$39,170</div>
          <p className="text-xs text-gray-500 mt-1">Annual estimated</p>
        </CardContent>
      </Card>
    </div>
  );
}
