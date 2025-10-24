import os
import sqlite3
from typing import Dict, Any, List
from dotenv import load_dotenv
from langchain_anthropic import ChatAnthropic
from langchain_core.messages import HumanMessage, SystemMessage

load_dotenv()

class NaturalLanguageQueryService:
    def __init__(self, database_path: str = 'data.db'):
        self.database_path = database_path
        self.llm = ChatAnthropic(
            model="claude-3-haiku-20240307",
            anthropic_api_key=os.getenv('ANTHROPIC_API_KEY')
        )
    
    def get_db_schema(self) -> str:
        """Get database schema information for context"""
        conn = sqlite3.connect(self.database_path)
        cursor = conn.cursor()
        
        # Get all table names
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
        tables = [row[0] for row in cursor.fetchall()]
        
        schema_info = []
        for table in tables:
            cursor.execute(f"PRAGMA table_info({table});")
            columns = cursor.fetchall()
            
            table_info = f"Table: {table}\nColumns:\n"
            for col in columns:
                table_info += f"  - {col[1]} ({col[2]})\n"
            schema_info.append(table_info)
        
        conn.close()
        return "\n\n".join(schema_info)
    
    def generate_sql_query(self, natural_language_question: str) -> str:
        """Convert natural language question to SQL query"""
        schema = self.get_db_schema()
        
        system_prompt = f"""You are an expert SQL query generator. Given a database schema and a natural language question, generate a valid SQLite SELECT query.

Database Schema:
{schema}

CRITICAL RULES:
1. Only generate SELECT queries
2. Use proper SQLite syntax
3. Include appropriate WHERE, GROUP BY, ORDER BY clauses as needed
4. Return only the SQL query, no explanations
5. Use table and column names EXACTLY as they appear in the schema - including forward slashes and special characters
6. Column names with forward slashes (/) must be enclosed in square brackets, e.g., [lineItem/UnblendedCost] not lineItem
7. For cost queries, use [lineItem/UnblendedCost] from the cost_data table
8. For aggregations, use appropriate functions like COUNT, SUM, AVG, MAX, MIN, etc.
9. Handle case-insensitive text searches with LOWER() function
10. When looking for highest cost, use ORDER BY [lineItem/UnblendedCost] DESC LIMIT 1
11. If a syntax error is generated say 'I am unsure of this question'

Examples:
- For highest cost: SELECT * FROM cost_data ORDER BY [lineItem/UnblendedCost] DESC LIMIT 1
- For cost by service: SELECT [lineItem/ProductCode], SUM([lineItem/UnblendedCost]) FROM cost_data GROUP BY [lineItem/ProductCode]
"""

        messages = [
            SystemMessage(content=system_prompt),
            HumanMessage(content=f"Generate SQL query for: {natural_language_question}")
        ]
        
        response = self.llm.invoke(messages)
        sql_query = response.content.strip()
        
        # Clean up the query (remove any markdown formatting)
        if sql_query.startswith('```sql'):
            sql_query = sql_query[6:]
        if sql_query.endswith('```'):
            sql_query = sql_query[:-3]
        
        return sql_query.strip()
    
    def execute_query(self, sql_query: str) -> List[Dict[str, Any]]:
        """Execute SQL query and return results"""
        conn = sqlite3.connect(self.database_path)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        try:
            cursor.execute(sql_query)
            results = cursor.fetchall()
            
            # Convert to list of dictionaries
            result_list = [dict(row) for row in results]
            conn.close()
            
            return result_list
        except Exception as e:
            conn.close()
            raise e
    
    def generate_natural_language_response(self, question: str, query_results: List[Dict[str, Any]], sql_query: str) -> str:
        """Generate natural language response based on query results"""
        if not query_results:
            return "I couldn't find any data matching your question."
        
        # Prepare context about the results
        result_summary = f"Query executed: {sql_query}\n"
        result_summary += f"Number of results: {len(query_results)}\n"
        
        if len(query_results) <= 10:
            result_summary += f"Results: {query_results}"
        else:
            result_summary += f"First 5 results: {query_results[:5]}"
        
        system_prompt = """You are a helpful data analyst. Given a user's question and the results from a database query, provide a clear, concise natural language response that answers their question.

Rules:
1. Be conversational and helpful
2. Summarize key findings from the data
3. If there are many results, provide highlights or patterns
4. Use specific numbers and data points when relevant
5. Keep the response focused on answering the original question
"""

        messages = [
            SystemMessage(content=system_prompt),
            HumanMessage(content=f"Original question: {question}\n\n{result_summary}\n\nPlease provide a natural language response answering the user's question based on this data.")
        ]
        
        response = self.llm.invoke(messages)
        return response.content.strip()
    
    def process_natural_language_query(self, question: str) -> Dict[str, Any]:
        """Main method to process a natural language question end-to-end"""
        try:
            # Generate SQL query
            sql_query = self.generate_sql_query(question)
            
            # Execute query
            results = self.execute_query(sql_query)
            
            # Generate natural language response
            nl_response = self.generate_natural_language_response(question, results, sql_query)
            
            return {
                'success': True,
                'question': question,
                'sql_query': sql_query,
                'results': results,
                'response': nl_response,
                'row_count': len(results)
            }
            
        except Exception as e:
            return {
                'success': False,
                'question': question,
                'error': str(e),
                'response': f"I encountered an error while processing your question: {str(e)}"
            }