import { CostDataPoint, Anomaly, Recommendation } from '../store/cost-store';

// Generate mock AWS cost data for the last 90 days
export function generateMockCostData(): CostDataPoint[] {
  const services = ['EC2', 'S3', 'RDS', 'Lambda', 'CloudFront', 'DynamoDB', 'ECS', 'EKS'];
  const regions = ['us-east-1', 'us-west-2', 'eu-west-1', 'ap-southeast-1'];
  const data: CostDataPoint[] = [];
  
  const today = new Date();
  
  for (let i = 89; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    services.forEach((service) => {
      regions.forEach((region) => {
        // Base cost with some variation
        let baseCost = Math.random() * 500 + 100;
        
        // Add trend (increasing costs over time)
        baseCost += (89 - i) * 2;
        
        // Add some anomalies
        if (service === 'EC2' && i < 10) {
          baseCost *= 1.4; // Recent spike
        }
        if (service === 'S3' && i >= 20 && i <= 25) {
          baseCost *= 2.1; // Spike 20-25 days ago
        }
        
        data.push({
          date: dateStr,
          service,
          region,
          cost: parseFloat(baseCost.toFixed(2)),
          resourceId: `${service.toLowerCase()}-${Math.random().toString(36).substr(2, 9)}`,
          tags: {
            environment: Math.random() > 0.5 ? 'production' : 'development',
            team: ['engineering', 'data', 'platform'][Math.floor(Math.random() * 3)],
          },
        });
      });
    });
  }
  
  return data;
}

export function generateMockAnomalies(): Anomaly[] {
  return [
    {
      id: '1',
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      service: 'EC2',
      severity: 'high',
      description: 'EC2 costs increased 42% in us-east-1. Detected 3 new m5.xlarge instances running continuously.',
      impact: 1247.80,
      identified: new Date().toISOString(),
    },
    {
      id: '2',
      date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      service: 'S3',
      severity: 'medium',
      description: 'S3 storage costs up 28%. Analysis shows 450GB of duplicate data in production-logs bucket.',
      impact: 89.50,
      identified: new Date().toISOString(),
    },
    {
      id: '3',
      date: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      service: 'RDS',
      severity: 'medium',
      description: 'RDS instance db-prod-01 showing consistently low CPU utilization (avg 12%). Consider downsizing.',
      impact: 320.00,
      identified: new Date().toISOString(),
    },
    {
      id: '4',
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      service: 'Lambda',
      severity: 'low',
      description: 'Lambda invocations increased 18% but within normal variance. Monitor for sustained growth.',
      impact: 45.30,
      identified: new Date().toISOString(),
    },
  ];
}

export function generateMockRecommendations(): Recommendation[] {
  return [
    {
      id: '1',
      title: 'Purchase EC2 Reserved Instances for Production Workloads',
      description: 'Analysis shows 8 m5.xlarge instances running 24/7 in production. Purchasing 1-year Reserved Instances could save ~40% on these compute costs.',
      estimatedSavings: 18560.00,
      effortLevel: 'low',
      risk: 'low',
      category: 'Reserved Instances',
      status: 'pending',
      createdAt: new Date().toISOString(),
    },
    {
      id: '2',
      title: 'Enable S3 Intelligent Tiering for production-logs',
      description: 'The production-logs bucket (450GB) has objects with varying access patterns. Intelligent Tiering can automatically move data to cheaper storage classes.',
      estimatedSavings: 3240.00,
      effortLevel: 'low',
      risk: 'low',
      category: 'Storage Optimization',
      status: 'pending',
      createdAt: new Date().toISOString(),
    },
    {
      id: '3',
      title: 'Right-size RDS Instance db-prod-01',
      description: 'Database instance shows avg CPU of 12% and memory of 35%. Downgrade from db.m5.2xlarge to db.m5.xlarge.',
      estimatedSavings: 7200.00,
      effortLevel: 'medium',
      risk: 'medium',
      category: 'Right-sizing',
      status: 'pending',
      createdAt: new Date().toISOString(),
    },
    {
      id: '4',
      title: 'Delete Unattached EBS Volumes',
      description: 'Found 12 EBS volumes (total 2.4TB) not attached to any instances. These appear to be from terminated instances.',
      estimatedSavings: 2880.00,
      effortLevel: 'low',
      risk: 'low',
      category: 'Unused Resources',
      status: 'pending',
      createdAt: new Date().toISOString(),
    },
    {
      id: '5',
      title: 'Implement Auto-scaling for Development Environments',
      description: 'Development EC2 instances run 24/7. Configure auto-scaling to shut down during off-hours (7pm-7am, weekends).',
      estimatedSavings: 5400.00,
      effortLevel: 'medium',
      risk: 'low',
      category: 'Scheduling',
      status: 'pending',
      createdAt: new Date().toISOString(),
    },
    {
      id: '6',
      title: 'Optimize CloudFront Cache Configuration',
      description: 'CloudFront cache hit ratio is 45%. Optimizing TTL settings and cache behaviors could reduce origin requests by ~30%.',
      estimatedSavings: 1890.00,
      effortLevel: 'medium',
      risk: 'medium',
      category: 'CDN Optimization',
      status: 'pending',
      createdAt: new Date().toISOString(),
    },
  ];
}
