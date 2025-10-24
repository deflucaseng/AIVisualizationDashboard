# AWS Cost Visualization Dashboard

A modern React/TypeScript frontend application that enables natural language queries to visualize and analyze AWS cost data through an intelligent backend service.

## 🚀 Features

- **Natural Language Queries**: Ask questions about your AWS costs in plain English
- **Interactive Dashboards**: Comprehensive cost overview with visual charts and trends
- **Service Breakdown**: Detailed analysis of costs by AWS service
- **Anomaly Detection**: Automatic identification of unusual spending patterns
- **Cost Recommendations**: AI-powered suggestions for cost optimization
- **CSV Import**: Upload AWS cost reports for analysis
- **Real-time Chat**: Interactive AI assistant for cost analysis queries
- **Responsive Design**: Modern UI built with Tailwind CSS and Radix UI components

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **Radix UI** for accessible components
- **Recharts** for data visualization
- **Zustand** for state management
- **Papa Parse** for CSV processing

### Backend
- **Python Flask** REST API
- **LangChain** for natural language processing
- **Anthropic Claude** for AI analysis
- **Pandas** for data processing
- **SQLite** for data storage

## 📋 Prerequisites

- Node.js 18+ and npm
- Python 3.8+
- Git

## 🚀 Quick Start

### 1. Clone the repository
```bash
git clone <repository-url>
cd AIVisualizationDashboard
```

### 2. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Create a `.env` file in the backend directory:
```env
ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

Start the backend server:
```bash
python app.py
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

The application will be available at `http://localhost:5173`

## 🎯 Usage

1. **Upload CSV Data**: Click the upload button to import your AWS cost report CSV files
2. **Explore Dashboard**: View cost overviews, trends, and service breakdowns
3. **Ask Questions**: Use the AI chat feature to query your cost data in natural language
4. **Review Insights**: Check anomaly alerts and optimization recommendations

## 📁 Project Structure

```
AIVisualizationDashboard/
├── frontend/                 # React TypeScript frontend
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── lib/            # Utility functions and services
│   │   ├── store/          # State management
│   │   └── styles/         # Global styles
│   └── package.json
├── backend/                 # Python Flask API
│   ├── app.py              # Main Flask application
│   ├── nl_query_service.py # Natural language processing
│   └── requirements.txt
└── README.md
```

## 🔧 Available Scripts

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production

### Backend
- `python app.py` - Start Flask development server
- `python test_api.py` - Run API tests

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For questions or issues, please open an issue on GitHub or contact the development team.