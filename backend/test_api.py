import requests
import pandas as pd
import io

# Test data
test_csv_data = """name,age,city
John,25,New York
Jane,30,Los Angeles
Bob,35,Chicago"""

def test_upload():
    """Test CSV upload endpoint"""
    url = "http://localhost:5000/upload"
    
    # Create file-like object
    csv_file = io.StringIO(test_csv_data)
    files = {'file': ('test.csv', csv_file.getvalue(), 'text/csv')}
    data = {'table_name': 'test_users'}
    
    try:
        response = requests.post(url, files=files, data=data)
        print(f"Upload test: {response.status_code}")
        print(f"Response: {response.json()}")
        return response.status_code == 200
    except Exception as e:
        print(f"Upload test failed: {e}")
        return False

def test_schema():
    """Test schema endpoint"""
    url = "http://localhost:5000/schema"
    
    try:
        response = requests.get(url)
        print(f"Schema test: {response.status_code}")
        print(f"Response: {response.json()}")
        return response.status_code == 200
    except Exception as e:
        print(f"Schema test failed: {e}")
        return False

def test_query():
    """Test query endpoint"""
    url = "http://localhost:5000/query"
    data = {"query": "SELECT * FROM test_users"}
    
    try:
        response = requests.post(url, json=data)
        print(f"Query test: {response.status_code}")
        print(f"Response: {response.json()}")
        return response.status_code == 200
    except Exception as e:
        print(f"Query test failed: {e}")
        return False

def test_tables():
    """Test tables endpoint"""
    url = "http://localhost:5000/tables"
    
    try:
        response = requests.get(url)
        print(f"Tables test: {response.status_code}")
        print(f"Response: {response.json()}")
        return response.status_code == 200
    except Exception as e:
        print(f"Tables test failed: {e}")
        return False

if __name__ == "__main__":
    print("Testing Flask API endpoints...")
    print("Make sure the Flask app is running on localhost:5000")
    print("-" * 50)
    
    # Run tests
    upload_ok = test_upload()
    print()
    
    schema_ok = test_schema()
    print()
    
    tables_ok = test_tables()
    print()
    
    query_ok = test_query()
    print()
    
    print("-" * 50)
    print(f"Upload: {'✓' if upload_ok else '✗'}")
    print(f"Schema: {'✓' if schema_ok else '✗'}")
    print(f"Tables: {'✓' if tables_ok else '✗'}")
    print(f"Query: {'✓' if query_ok else '✗'}")