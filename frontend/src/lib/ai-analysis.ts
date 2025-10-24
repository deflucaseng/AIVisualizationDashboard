import { CostDataPoint, Anomaly, Recommendation } from '../store/cost-store';
import { generateMockAnomalies, generateMockRecommendations } from './mock-data';

// Mock AI analysis functions that simulate Claude API responses

export async function analyzeCostData(costData: CostDataPoint[]): Promise<{
  anomalies: Anomaly[];
  recommendations: Recommendation[];
}> {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 1500));
  
  // In a real implementation, this would send data to Claude API via Supabase Edge Function
  // For now, return mock data
  return {
    anomalies: generateMockAnomalies(),
    recommendations: generateMockRecommendations(),
  };
}

export async function answerCostQuestion(
  question: string,
  costData: CostDataPoint[]
): Promise<string> {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 1000));
  
  // Mock responses based on question keywords
  const lowerQuestion = question.toLowerCase();
  
  if (lowerQuestion.includes('s3') && (lowerQuestion.includes('double') || lowerQuestion.includes('increase'))) {
    return `Based on my analysis of your S3 costs, I found that spending doubled last week due to a significant increase in storage. Specifically:

• **450GB of new data** was added to the production-logs bucket
• **120GB of duplicate files** were uploaded across multiple buckets
• **Data transfer costs** increased by 35% due to more cross-region replication

**Recommendations:**
1. Enable S3 Intelligent Tiering to automatically optimize storage costs
2. Implement lifecycle policies to delete old logs after 90 days
3. Review and deduplicate files in production-logs bucket

This should reduce your S3 costs by approximately $240/month.`;
  }
  
  if (lowerQuestion.includes('ec2') || lowerQuestion.includes('compute')) {
    return `Your EC2 costs are currently running at **$4,250/month** across all regions. Here's the breakdown:

**Cost Distribution:**
• us-east-1: $2,100 (49%) - 8 production instances
• us-west-2: $1,450 (34%) - 5 instances  
• eu-west-1: $700 (17%) - 3 instances

**Key Findings:**
• 3 new m5.xlarge instances were launched 5 days ago in us-east-1, increasing costs by 42%
• All production instances run 24/7 with ~70% utilization
• Development instances also run 24/7 with only ~15% utilization during off-hours

**Optimization Opportunities:**
1. Purchase Reserved Instances for production workloads → Save ~$18,500/year
2. Implement auto-shutdown for dev instances during off-hours → Save ~$5,400/year
3. Consider Graviton instances for 20% better price-performance`;
  }
  
  if (lowerQuestion.includes('save') || lowerQuestion.includes('optimize') || lowerQuestion.includes('reduce')) {
    return `I've identified **$39,170 in potential annual savings** across your AWS infrastructure. Here are the top opportunities:

**Quick Wins (Low effort, Low risk):**
1. 💰 **$18,560/year** - Purchase EC2 Reserved Instances
2. 💰 **$3,240/year** - Enable S3 Intelligent Tiering  
3. 💰 **$2,880/year** - Delete 12 unattached EBS volumes

**Medium Effort:**
4. 💰 **$7,200/year** - Right-size over-provisioned RDS instance
5. 💰 **$5,400/year** - Auto-shutdown dev environments off-hours
6. 💰 **$1,890/year** - Optimize CloudFront caching

I recommend starting with #1, #2, and #3 which can be implemented quickly and will give you $24,680 in annual savings with minimal risk.`;
  }
  
  if (lowerQuestion.includes('forecast') || lowerQuestion.includes('predict') || lowerQuestion.includes('next month')) {
    return `Based on current trends and historical data, here's my forecast:

**Next Month Projected Spend: $13,450**
(Current month trending at $12,100)

**Key Drivers:**
• EC2 costs increasing due to 3 new instances launched recently
• Linear growth pattern suggests continued expansion
• Seasonal traffic patterns indicate 8-12% increase in Q4

**Confidence Level:** 85%

**Risk Factors:**
⚠️ If the recent EC2 growth continues, costs could reach $14,200  
⚠️ Without optimization, monthly costs will exceed $15,000 by end of quarter

**Recommended Actions:**
1. Implement cost controls and budgets alerts at $13,000
2. Review and approve the recommended optimizations to offset growth
3. Set up auto-scaling policies to prevent unnecessary resource expansion`;
  }
  
  if (lowerQuestion.includes('most expensive') || lowerQuestion.includes('highest cost')) {
    return `Your **most expensive services** this month are:

1. **EC2** - $4,250 (35%)
   - Largest contributor: m5.xlarge instances in us-east-1
   
2. **RDS** - $3,100 (26%)
   - Mostly db.m5.2xlarge production database
   
3. **S3** - $2,450 (20%)
   - production-logs bucket is 60% of this cost
   
4. **CloudFront** - $1,200 (10%)
   
5. **ECS** - $890 (7%)

**By Region:**
• us-east-1: $6,800 (56%)
• us-west-2: $3,200 (27%)  
• eu-west-1: $2,100 (17%)

The recent 42% spike in EC2 costs in us-east-1 is the primary cost driver this month.`;
  }
  
  // Default response
  return `I've analyzed your AWS cost data. Here's what I found:

**Current Month Spend:** $12,100  
**Previous Month:** $10,850  
**Change:** +11.5%

**Top Cost Drivers:**
• EC2 instances (35% of total spend)
• RDS databases (26% of total spend)  
• S3 storage (20% of total spend)

**Recent Anomalies Detected:**
• EC2 costs spiked 42% in the last 5 days
• S3 storage increased by 28% last week
• RDS utilization has been consistently low (<15% CPU)

I've generated detailed recommendations that could save you up to **$39,170 annually**. Would you like me to explain any specific service or recommendation in more detail?`;
}

export async function generateCostForecast(costData: CostDataPoint[]): Promise<{
  dates: string[];
  actual: number[];
  forecast: number[];
}> {
  await new Promise((resolve) => setTimeout(resolve, 800));
  
  // Calculate daily totals from cost data
  const dailyTotals = new Map<string, number>();
  
  costData.forEach((point) => {
    const current = dailyTotals.get(point.date) || 0;
    dailyTotals.set(point.date, current + point.cost);
  });
  
  const sortedDates = Array.from(dailyTotals.keys()).sort();
  const actual = sortedDates.map((date) => dailyTotals.get(date) || 0);
  
  // Generate 30-day forecast using simple linear regression
  const n = actual.length;
  const lastValue = actual[n - 1];
  const trend = (actual[n - 1] - actual[0]) / n;
  
  const forecastDates: string[] = [];
  const forecast: number[] = [];
  
  for (let i = 1; i <= 30; i++) {
    const forecastDate = new Date(sortedDates[sortedDates.length - 1]);
    forecastDate.setDate(forecastDate.getDate() + i);
    forecastDates.push(forecastDate.toISOString().split('T')[0]);
    
    // Simple linear forecast with some randomness
    const forecastValue = lastValue + trend * i + (Math.random() - 0.5) * 100;
    forecast.push(Math.max(0, forecastValue));
  }
  
  return {
    dates: [...sortedDates, ...forecastDates],
    actual: [...actual, ...new Array(30).fill(null)],
    forecast: [...new Array(sortedDates.length).fill(null), ...forecast],
  };
}
