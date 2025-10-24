import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import { Badge } from './ui/badge';
import { useCostStore } from '../store/cost-store';
import { Search } from 'lucide-react';

export function ResourceTable() {
  const { costData } = useCostStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [serviceFilter, setServiceFilter] = useState<string>('all');

  const { aggregatedData, services } = useMemo(() => {
    if (costData.length === 0) return { aggregatedData: [], services: [] };

    // Get current month data
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const currentMonthData = costData.filter(
      (d) => new Date(d.date) >= currentMonthStart
    );

    // Aggregate by resource
    const resourceMap = new Map<string, {
      resourceId: string;
      service: string;
      region: string;
      cost: number;
      tags?: Record<string, string>;
    }>();

    currentMonthData.forEach((point) => {
      const key = `${point.service}-${point.region}-${point.resourceId || 'unknown'}`;
      
      if (resourceMap.has(key)) {
        const existing = resourceMap.get(key)!;
        existing.cost += point.cost;
      } else {
        resourceMap.set(key, {
          resourceId: point.resourceId || 'N/A',
          service: point.service,
          region: point.region,
          cost: point.cost,
          tags: point.tags,
        });
      }
    });

    const aggregated = Array.from(resourceMap.values()).sort((a, b) => b.cost - a.cost);
    
    // Get unique services for filter
    const uniqueServices = Array.from(new Set(aggregated.map((r) => r.service))).sort();

    return { aggregatedData: aggregated, services: uniqueServices };
  }, [costData]);

  const filteredData = useMemo(() => {
    let filtered = aggregatedData;

    if (serviceFilter !== 'all') {
      filtered = filtered.filter((r) => r.service === serviceFilter);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.resourceId.toLowerCase().includes(term) ||
          r.service.toLowerCase().includes(term) ||
          r.region.toLowerCase().includes(term)
      );
    }

    return filtered;
  }, [aggregatedData, serviceFilter, searchTerm]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  if (costData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Resource Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            Upload cost data to see resource details
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Resource Details (Current Month)</CardTitle>
        <div className="flex gap-2 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search resources..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <select
            value={serviceFilter}
            onChange={(e) => setServiceFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="all">All Services</option>
            {services.map((service) => (
              <option key={service} value={service}>
                {service}
              </option>
            ))}
          </select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Resource ID</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Region</TableHead>
                <TableHead>Environment</TableHead>
                <TableHead className="text-right">Cost</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-gray-500">
                    No resources found
                  </TableCell>
                </TableRow>
              ) : (
                filteredData.slice(0, 50).map((resource, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-mono text-sm">
                      {resource.resourceId}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{resource.service}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {resource.region}
                    </TableCell>
                    <TableCell>
                      {resource.tags?.environment && (
                        <Badge
                          variant="secondary"
                          className={
                            resource.tags.environment === 'production'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-800'
                          }
                        >
                          {resource.tags.environment}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(resource.cost)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        {filteredData.length > 50 && (
          <p className="text-sm text-gray-500 mt-2 text-center">
            Showing top 50 of {filteredData.length} resources
          </p>
        )}
      </CardContent>
    </Card>
  );
}
