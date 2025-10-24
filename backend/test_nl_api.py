import requests
import json

BASE_URL = 'http://localhost:5000'

def test_natural_language_query():
    """Test the new natural language query endpoint"""
    
    # Test questions
    test_questions = [
        "How many rows are in the database?",
        "What tables are available?",
        "Show me the first 5 records",
        "What columns are in the data?"
    ]
    
    print("Testing Natural Language Query API...")
    print("=" * 50)
    
    for question in test_questions:
        print(f"\nQuestion: {question}")
        print("-" * 30)
        
        try:
            response = requests.post(f'{BASE_URL}/ask', 
                                   json={'question': question})
            
            if response.status_code == 200:
                data = response.json()
                print(f"Response: {data['response']}")
                print(f"SQL Query: {data['sql_query']}")
                print(f"Row Count: {data['row_count']}")
            else:
                print(f"Error {response.status_code}: {response.json()}")
                
        except requests.exceptions.ConnectionError:
            print("Error: Could not connect to server. Make sure the Flask app is running.")
            break
        except Exception as e:
            print(f"Error: {e}")

if __name__ == '__main__':
    test_natural_language_query()