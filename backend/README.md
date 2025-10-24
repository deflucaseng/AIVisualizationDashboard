# Flask CSV API Backend

A Flask API that allows users to upload CSV files, store them in SQLite database, and query the data.

## Features

- CSV file upload with automatic SQLite table creation
- Database schema inspection
- SQL query execution (SELECT only for security)
- Table listing
- CORS enabled for frontend integration

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Run the Flask application:
```bash
python app.py
```

The server will start on `http://localhost:5000`

## API Endpoints

### 1. Upload CSV File
**POST** `/upload`

Upload a CSV file and store it in SQLite database.

**Form Data:**
- `file`: CSV file
- `table_name` (optional): Name for the database table (defaults to 'uploaded_data')

**Response:**
```json
{
  "message": "File uploaded successfully to table test_data",
  "rows": 100,
  "columns": ["name", "age", "city"]
}
```

### 2. Get Database Schema
**GET** `/schema`

Get the schema of all tables in the database.

**Response:**
```json
{
  "schema": {
    "table_name": [
      {
        "name": "column_name",
        "type": "TEXT",
        "not_null": false,
        "primary_key": false
      }
    ]
  }
}
```

### 3. Execute Query
**POST** `/query`

Execute a SELECT query on the database.

**JSON Body:**
```json
{
  "query": "SELECT * FROM table_name LIMIT 10"
}
```

**Response:**
```json
{
  "results": [
    {"column1": "value1", "column2": "value2"},
    {"column1": "value3", "column2": "value4"}
  ],
  "row_count": 2,
  "columns": ["column1", "column2"]
}
```

### 4. List Tables
**GET** `/tables`

Get a list of all tables in the database.

**Response:**
```json
{
  "tables": ["table1", "table2", "table3"]
}
```

## Testing

Run the test script to verify all endpoints:

```bash
python test_api.py
```

Make sure the Flask app is running before executing tests.

## Security

- Only SELECT queries are allowed for security reasons
- File type validation ensures only CSV files are uploaded
- CORS is enabled for cross-origin requests