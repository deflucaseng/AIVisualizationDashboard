import { useState } from 'react';
import { Check, X, TrendingDown, Zap, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { useCostStore } from '../store/cost-store';

const effortConfig = {
  low: { label: 'Low Effort', color: 'bg-green-100 text-green-800' },
  medium: { label: 'Medium Effort', color: 'bg-yellow-100 text-yellow-800' },
  high: { label: 'High Effort', color: 'bg-red-100 text-red-800' },
};

const riskConfig = {
  low: { label: 'Low Risk', color: 'bg-green-100 text-green-800' },
  medium: { label: 'Medium Risk', color: 'bg-yellow-100 text-yellow-800' },
  high: { label: 'High Risk', color: 'bg-red-100 text-red-800' },
};

export function RecommendationsPanel() {
  const { recommendations, updateRecommendationStatus } = useCostStore();
  const [filter, setFilter] = useState<'all' | 'pending' | 'implemented' | 'ignored'>('all');

  const filteredRecommendations = recommendations.filter((rec) => {
    if (filter === 'all') return true;
    return rec.status === filter;
  });

  const totalSavings = filteredRecommendations
    .filter((rec) => rec.status === 'pending')
    .reduce((sum, rec) => sum + rec.estimatedSavings, 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (recommendations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Optimization Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <TrendingDown className="h-12 w-12 mx-auto mb-2 text-gray-400" />
            <p>No recommendations available</p>
            <p className="text-sm">Upload cost data to get AI-powered optimization suggestions</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Optimization Recommendations</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-green-50">
              {formatCurrency(totalSavings)}/year potential
            </Badge>
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            All ({recommendations.length})
          </Button>
          <Button
            variant={filter === 'pending' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('pending')}
          >
            Pending ({recommendations.filter((r) => r.status === 'pending').length})
          </Button>
          <Button
            variant={filter === 'implemented' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('implemented')}
          >
            Implemented ({recommendations.filter((r) => r.status === 'implemented').length})
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {filteredRecommendations.map((rec) => (
            <div
              key={rec.id}
              className={`p-4 rounded-lg border ${
                rec.status === 'implemented'
                  ? 'bg-green-50 border-green-200'
                  : rec.status === 'ignored'
                  ? 'bg-gray-50 border-gray-200 opacity-60'
                  : 'bg-white border-gray-200'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-start gap-2">
                    {rec.status === 'implemented' && (
                      <Check className="h-5 w-5 text-green-600 mt-0.5" />
                    )}
                    {rec.status === 'ignored' && (
                      <X className="h-5 w-5 text-gray-400 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <h4 className={rec.status === 'ignored' ? 'text-gray-500' : ''}>
                        {rec.title}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">{rec.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge className="bg-blue-100 text-blue-800">
                      {rec.category}
                    </Badge>
                    <Badge className={effortConfig[rec.effortLevel].color}>
                      <Zap className="h-3 w-3 mr-1" />
                      {effortConfig[rec.effortLevel].label}
                    </Badge>
                    <Badge className={riskConfig[rec.risk].color}>
                      <Shield className="h-3 w-3 mr-1" />
                      {riskConfig[rec.risk].label}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-green-600">
                      💰 Estimated savings: {formatCurrency(rec.estimatedSavings)}/year
                    </span>
                    {rec.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateRecommendationStatus(rec.id, 'implemented')}
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Mark Implemented
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => updateRecommendationStatus(rec.id, 'ignored')}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Ignore
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
