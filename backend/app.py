from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import sqlite3
import os
import io
import re
from datetime import datetime, timedelta
import uuid
from werkzeug.utils import secure_filename
from nl_query_service import NaturalLanguageQueryService

app = Flask(__name__)
CORS(app)

# Initialize natural language query service
nl_service = NaturalLanguageQueryService()

# Configuration
UPLOAD_FOLDER = 'uploads'
DATABASE = 'data.db'
ALLOWED_EXTENSIONS = {'csv'}

# Ensure upload directory exists
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def normalize_date(date_str):
    """Normalize date string to YYYY-MM-DD format"""
    try:
        date = pd.to_datetime(date_str)
        return date.strftime('%Y-%m-%d')
    except:
        return date_str

def normalize_service_name(service):
    """Map AWS service codes to friendly names"""
    service_map = {
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
    }
    return service_map.get(service, service)

def extract_tags(row):
    """Extract tags from AWS CSV row"""
    tags = {}
    for col in row.index:
        if col.startswith('resourceTags/') or col.startswith('tag:'):
            tag_name = col.replace('resourceTags/', '').replace('tag:', '')
            if pd.notna(row[col]) and row[col]:
                tags[tag_name] = str(row[col])
    return tags if tags else None

def transform_csv_to_cost_data(df):
    """Transform CSV DataFrame to CostDataPoint format"""
    cost_data = []
    
    for _, row in df.iterrows():
        # Try different column name formats for AWS Cost & Usage Report
        date = (row.get('lineItem/UsageStartDate') or 
                row.get('UsageStartDate') or 
                row.get('Date') or 
                row.get('date') or '')
        
        service = (row.get('lineItem/ProductCode') or
                  row.get('ProductCode') or
                  row.get('Service') or
                  row.get('service') or 'Unknown')
        
        region = (row.get('product/region') or
                 row.get('Region') or
                 row.get('region') or 'global')
        
        cost_str = (row.get('lineItem/UnblendedCost') or
                   row.get('UnblendedCost') or
                   row.get('Cost') or
                   row.get('cost') or '0')
        
        try:
            cost = float(cost_str) if pd.notna(cost_str) else 0
        except (ValueError, TypeError):
            cost = 0
        
        # Only include rows with valid date and positive cost
        if date and cost > 0:
            normalized_date = normalize_date(date)
            normalized_service = normalize_service_name(service)
            
            cost_point = {
                'date': normalized_date,
                'service': normalized_service,
                'region': region or 'global',
                'cost': round(cost, 2),
            }
            
            # Add optional fields if they exist
            resource_id = (row.get('lineItem/ResourceId') or 
                          row.get('ResourceId'))
            if resource_id and pd.notna(resource_id):
                cost_point['resourceId'] = str(resource_id)
            
            tags = extract_tags(row)
            if tags:
                cost_point['tags'] = str(tags)  # Convert dict to string for SQLite storage
                
            cost_data.append(cost_point)
    
    return cost_data

def generate_anomalies(cost_data):
    """Generate cost anomalies based on the data"""
    anomalies = []
    
    # Group by service and analyze patterns
    df = pd.DataFrame(cost_data)
    if df.empty:
        return anomalies
    
    # Convert date column to datetime for analysis
    df['date'] = pd.to_datetime(df['date'])
    daily_totals = df.groupby(['date', 'service'])['cost'].sum().reset_index()
    
    # Detect anomalies - costs that are significantly higher than average
    for service in daily_totals['service'].unique():
        service_data = daily_totals[daily_totals['service'] == service]
        if len(service_data) > 3:  # Need enough data points
            mean_cost = service_data['cost'].mean()
            std_cost = service_data['cost'].std()
            
            for _, row in service_data.iterrows():
                if row['cost'] > mean_cost + 2 * std_cost and row['cost'] > 50:  # Significant anomaly
                    severity = 'high' if row['cost'] > mean_cost + 3 * std_cost else 'medium'
                    
                    anomalies.append({
                        'id': str(uuid.uuid4()),
                        'date': row['date'].strftime('%Y-%m-%d'),
                        'service': service,
                        'severity': severity,
                        'description': f'Unusual spike in {service} costs: ${row["cost"]:.2f} (average: ${mean_cost:.2f})',
                        'impact': round(row['cost'] - mean_cost, 2),
                        'identified': datetime.now().strftime('%Y-%m-%d')
                    })
    
    return anomalies[:10]  # Return top 10 anomalies

def generate_recommendations(cost_data):
    """Generate cost optimization recommendations"""
    recommendations = []
    
    df = pd.DataFrame(cost_data)
    if df.empty:
        return recommendations
    
    # Analyze service costs
    service_totals = df.groupby('service')['cost'].sum().sort_values(ascending=False)
    total_cost = service_totals.sum()
    
    recommendation_id = 0
    
    # EC2 recommendations
    if 'EC2' in service_totals and service_totals['EC2'] > 1000:
        recommendation_id += 1
        recommendations.append({
            'id': str(recommendation_id),
            'title': 'Purchase EC2 Reserved Instances',
            'description': f'Your EC2 costs (${service_totals["EC2"]:.2f}) could benefit from Reserved Instance pricing. Save up to 60% on predictable workloads.',
            'estimatedSavings': round(service_totals['EC2'] * 0.4, 2),
            'effortLevel': 'low',
            'risk': 'low',
            'category': 'Computing',
            'status': 'pending',
            'createdAt': datetime.now().strftime('%Y-%m-%d')
        })
    
    # S3 recommendations  
    if 'S3' in service_totals and service_totals['S3'] > 500:
        recommendation_id += 1
        recommendations.append({
            'id': str(recommendation_id),
            'title': 'Enable S3 Intelligent Tiering',
            'description': f'S3 costs (${service_totals["S3"]:.2f}) can be optimized with Intelligent Tiering to automatically move data to cost-effective storage classes.',
            'estimatedSavings': round(service_totals['S3'] * 0.25, 2),
            'effortLevel': 'low',
            'risk': 'low', 
            'category': 'Storage',
            'status': 'pending',
            'createdAt': datetime.now().strftime('%Y-%m-%d')
        })
    
    # RDS recommendations
    if 'RDS' in service_totals and service_totals['RDS'] > 800:
        recommendation_id += 1
        recommendations.append({
            'id': str(recommendation_id),
            'title': 'Right-size RDS Instances',
            'description': f'RDS costs (${service_totals["RDS"]:.2f}) suggest potential over-provisioning. Review instance sizes and utilization metrics.',
            'estimatedSavings': round(service_totals['RDS'] * 0.3, 2),
            'effortLevel': 'medium',
            'risk': 'medium',
            'category': 'Database',
            'status': 'pending',
            'createdAt': datetime.now().strftime('%Y-%m-%d')
        })
    
    # General high-cost service recommendations
    for service, cost in service_totals.head(3).items():
        if cost > 200 and service not in ['EC2', 'S3', 'RDS']:
            recommendation_id += 1
            recommendations.append({
                'id': str(recommendation_id),
                'title': f'Optimize {service} Usage',
                'description': f'{service} is one of your top cost drivers (${cost:.2f}). Review usage patterns and consider optimization strategies.',
                'estimatedSavings': round(cost * 0.15, 2),
                'effortLevel': 'medium',
                'risk': 'low',
                'category': 'General',
                'status': 'pending', 
                'createdAt': datetime.now().strftime('%Y-%m-%d')
            })
    
    return recommendations[:8]  # Return top 8 recommendations

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def get_db_connection():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

@app.route('/upload', methods=['POST'])
def upload_csv():
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    
    file = request.files['file']
    table_name = request.form.get('table_name', 'cost_data')
    
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    if not allowed_file(file.filename):
        return jsonify({'error': 'Invalid file type. Only CSV files allowed'}), 400
    
    try:
        # Read CSV into pandas DataFrame
        df = pd.read_csv(io.StringIO(file.stream.read().decode("utf-8")))
        
        # Transform CSV data to CostDataPoint format
        cost_data = transform_csv_to_cost_data(df)
        
        if not cost_data:
            return jsonify({'error': 'No valid cost data found in CSV. Please check column names and data format.'}), 400
        
        # Generate AI analysis based on the cost data
        anomalies = generate_anomalies(cost_data)
        recommendations = generate_recommendations(cost_data)
        
        # Store raw CSV data in SQLite for querying
        conn = get_db_connection()
        df.to_sql(table_name, conn, if_exists='replace', index=False)
        
        # Also store processed cost data for faster access
        cost_df = pd.DataFrame(cost_data)
        cost_df.to_sql('processed_cost_data', conn, if_exists='replace', index=False)
        
        conn.close()
        
        return jsonify({
            'message': f'File uploaded and processed successfully',
            'rows': len(df),
            'columns': list(df.columns),
            'results': cost_data,
            'anomalies': anomalies,
            'recommendations': recommendations,
            'summary': {
                'total_cost': round(sum(point['cost'] for point in cost_data), 2),
                'date_range': {
                    'start': min(point['date'] for point in cost_data) if cost_data else None,
                    'end': max(point['date'] for point in cost_data) if cost_data else None
                },
                'services': len(set(point['service'] for point in cost_data)),
                'regions': len(set(point['region'] for point in cost_data))
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/schema', methods=['GET'])
def get_schema():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Get all table names
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
        tables = [row[0] for row in cursor.fetchall()]
        
        schema = {}
        for table in tables:
            cursor.execute(f"PRAGMA table_info({table});")
            columns = cursor.fetchall()
            schema[table] = [
                {
                    'name': col[1],
                    'type': col[2],
                    'not_null': bool(col[3]),
                    'primary_key': bool(col[5])
                }
                for col in columns
            ]
        
        conn.close()
        return jsonify({'schema': schema}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/ask', methods=['POST'])
def ask_question():
    data = request.get_json()
    
    if not data or 'question' not in data:
        return jsonify({'error': 'No question provided'}), 400
    
    question = data['question']
    
    try:
        result = nl_service.process_natural_language_query(question)
        
        if result['success']:
            return jsonify({
                'success': True,
                'question': result['question'],
                'response': result['response'],
                'sql_query': result['sql_query'],
                'results': result['results'],
                'row_count': result['row_count']
            }), 200
        else:
            return jsonify({
                'success': False,
                'question': result['question'],
                'error': result['error'],
                'response': result['response']
            }), 400
        
    except Exception as e:
        return jsonify({
            'success': False,
            'question': question,
            'error': str(e),
            'response': f'I encountered an error while processing your question: {str(e)}'
        }), 500

@app.route('/query', methods=['POST'])
def execute_query():
    data = request.get_json()
    
    if not data or 'query' not in data:
        return jsonify({'error': 'No query provided'}), 400
    
    query = data['query']
    
    # Basic SQL injection protection - only allow SELECT statements
    if not query.strip().upper().startswith('SELECT'):
        return jsonify({'error': 'Only SELECT queries are allowed'}), 400
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute(query)
        results = cursor.fetchall()
        
        # Convert results to list of dictionaries
        columns = [description[0] for description in cursor.description]
        result_list = [dict(zip(columns, row)) for row in results]
        
        conn.close()
        
        return jsonify({
            'results': result_list,
            'row_count': len(result_list),
            'columns': columns
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/tables', methods=['GET'])
def get_tables():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
        tables = [row[0] for row in cursor.fetchall()]
        
        conn.close()
        return jsonify({'tables': tables}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)