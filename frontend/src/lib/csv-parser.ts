import Papa from 'papaparse';
import { CostDataPoint } from '../store/cost-store';

export interface ParsedCSVRow {
  [key: string]: string;
}

export async function parseAWSCostCSV(file: File): Promise<CostDataPoint[]> {
  return new Promise((resolve, reject) => {
    Papa.parse<ParsedCSVRow>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const costData = transformToCostData(results.data);
          resolve(costData);
        } catch (error) {
          reject(error);
        }
      },
      error: (error) => {
        reject(error);
      },
    });
  });
}

function transformToCostData(rows: ParsedCSVRow[]): CostDataPoint[] {
  const costData: CostDataPoint[] = [];
  
  rows.forEach((row) => {
    // Try to parse different AWS Cost & Usage Report formats
    // Standard AWS CUR columns might include:
    // - lineItem/UsageStartDate, lineItem/ProductCode, lineItem/UsageAccountId
    // - lineItem/LineItemDescription, lineItem/UnblendedCost, product/region
    
    // Support multiple possible column name formats
    const date = 
      row['lineItem/UsageStartDate'] ||
      row['UsageStartDate'] ||
      row['Date'] ||
      row['date'] ||
      '';
    
    const service =
      row['lineItem/ProductCode'] ||
      row['ProductCode'] ||
      row['Service'] ||
      row['service'] ||
      'Unknown';
    
    const region =
      row['product/region'] ||
      row['Region'] ||
      row['region'] ||
      'global';
    
    const costStr =
      row['lineItem/UnblendedCost'] ||
      row['UnblendedCost'] ||
      row['Cost'] ||
      row['cost'] ||
      '0';
    
    const cost = parseFloat(costStr) || 0;
    
    // Only add if we have valid date and non-zero cost
    if (date && cost > 0) {
      // Normalize date format to YYYY-MM-DD
      const normalizedDate = normalizeDate(date);
      
      costData.push({
        date: normalizedDate,
        service: normalizeServiceName(service),
        region: region || 'global',
        cost: parseFloat(cost.toFixed(2)),
        resourceId: row['lineItem/ResourceId'] || row['ResourceId'] || undefined,
        tags: extractTags(row),
      });
    }
  });
  
  return costData;
}

function normalizeDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0];
    }
  } catch (e) {
    // Invalid date
  }
  return dateStr;
}

function normalizeServiceName(service: string): string {
  // Map AWS service codes to friendly names
  const serviceMap: Record<string, string> = {
    'AmazonEC2': 'EC2',
    'AmazonS3': 'S3',
    'AmazonRDS': 'RDS',
    'AWSLambda': 'Lambda',
    'AmazonCloudFront': 'CloudFront',
    'AmazonDynamoDB': 'DynamoDB',
    'AmazonECS': 'ECS',
    'AmazonEKS': 'EKS',
    'AmazonElastiCache': 'ElastiCache',
    'AmazonVPC': 'VPC',
    'AmazonRoute53': 'Route53',
  };
  
  return serviceMap[service] || service;
}

function extractTags(row: ParsedCSVRow): Record<string, string> | undefined {
  const tags: Record<string, string> = {};
  
  // Look for columns that start with 'resourceTags/' or 'tag:'
  Object.keys(row).forEach((key) => {
    if (key.startsWith('resourceTags/') || key.startsWith('tag:')) {
      const tagName = key.replace('resourceTags/', '').replace('tag:', '');
      if (row[key]) {
        tags[tagName] = row[key];
      }
    }
  });
  
  return Object.keys(tags).length > 0 ? tags : undefined;
}
