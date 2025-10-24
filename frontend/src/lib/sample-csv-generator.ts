// Helper to generate a sample AWS Cost & Usage Report CSV for testing

export function generateSampleCSV(): string {
  const services = ['AmazonEC2', 'AmazonS3', 'AmazonRDS', 'AWSLambda', 'AmazonCloudFront', 'AmazonDynamoDB'];
  const regions = ['us-east-1', 'us-west-2', 'eu-west-1', 'ap-southeast-1'];
  const environments = ['production', 'development', 'staging'];
  const teams = ['engineering', 'data', 'platform'];
  
  const rows: string[] = [];
  
  // CSV Header
  rows.push('lineItem/UsageStartDate,lineItem/ProductCode,product/region,lineItem/UnblendedCost,lineItem/ResourceId,resourceTags/environment,resourceTags/team');
  
  // Generate 90 days of data
  const today = new Date();
  for (let i = 89; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    // Generate 10-20 random entries per day
    const numEntries = Math.floor(Math.random() * 10) + 10;
    
    for (let j = 0; j < numEntries; j++) {
      const service = services[Math.floor(Math.random() * services.length)];
      const region = regions[Math.floor(Math.random() * regions.length)];
      const environment = environments[Math.floor(Math.random() * environments.length)];
      const team = teams[Math.floor(Math.random() * teams.length)];
      
      // Generate cost with some variation
      let cost = Math.random() * 100 + 10;
      
      // Add anomalies for recent dates
      if (service === 'AmazonEC2' && i < 10) {
        cost *= 1.5; // EC2 spike in last 10 days
      }
      if (service === 'AmazonS3' && i >= 20 && i <= 25) {
        cost *= 2.2; // S3 spike 20-25 days ago
      }
      
      const resourceId = `${service.toLowerCase()}-${Math.random().toString(36).substr(2, 9)}`;
      
      rows.push(`${dateStr},${service},${region},${cost.toFixed(2)},${resourceId},${environment},${team}`);
    }
  }
  
  return rows.join('\n');
}

export function downloadSampleCSV(): void {
  const csv = generateSampleCSV();
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = 'sample-aws-cost-report.csv';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}
