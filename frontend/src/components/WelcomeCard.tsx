import { Info, Upload, Brain, TrendingDown, MessageSquare, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';

interface WelcomeCardProps {
  onDismiss: () => void;
}

export function WelcomeCard({ onDismiss }: WelcomeCardProps) {
  return (
    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Info className="h-5 w-5 text-blue-600" />
            <CardTitle>Welcome to AWS Cost Anomaly Detective</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDismiss}
            className="hover:bg-blue-100"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-gray-700">
          AI-powered dashboard for analyzing AWS costs, detecting anomalies, and discovering optimization opportunities.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex gap-3">
            <div className="flex-shrink-0">
              <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Upload className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <div>
              <h4 className="text-sm">Upload CSV Data</h4>
              <p className="text-xs text-gray-600">
                Import your AWS Cost & Usage Report or use the pre-loaded demo data
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex-shrink-0">
              <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <Brain className="h-5 w-5 text-purple-600" />
              </div>
            </div>
            <div>
              <h4 className="text-sm">AI Analysis</h4>
              <p className="text-xs text-gray-600">
                Automatic anomaly detection and intelligent cost insights
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex-shrink-0">
              <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                <TrendingDown className="h-5 w-5 text-green-600" />
              </div>
            </div>
            <div>
              <h4 className="text-sm">Smart Recommendations</h4>
              <p className="text-xs text-gray-600">
                Actionable suggestions to reduce costs with estimated savings
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex-shrink-0">
              <div className="h-10 w-10 rounded-lg bg-orange-100 flex items-center justify-center">
                <MessageSquare className="h-5 w-5 text-orange-600" />
              </div>
            </div>
            <div>
              <h4 className="text-sm">AI Chat Assistant</h4>
              <p className="text-xs text-gray-600">
                Ask questions about your costs in natural language
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white/60 rounded-lg p-3 border border-blue-200">
          <p className="text-xs text-gray-700">
            <strong>Note:</strong> This demo uses mock AI responses. In production, connect to
            Claude API via Supabase for real-time analysis.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
