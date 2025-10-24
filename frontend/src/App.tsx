import { useEffect, useState } from 'react';
import {
  LayoutDashboard,
  TrendingUp,
  MessageSquare,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  Database,
} from 'lucide-react';
import { Button } from './components/ui/button';
import { FileUpload } from './components/FileUpload';
import { CostOverview } from './components/CostOverview';
import { CostTrendsChart } from './components/CostTrendsChart';
import { ServiceBreakdown } from './components/ServiceBreakdown';
import { AnomalyAlerts } from './components/AnomalyAlerts';
import { RecommendationsPanel } from './components/RecommendationsPanel';
import { AiChat } from './components/AiChat';
import { ResourceTable } from './components/ResourceTable';
import { WelcomeCard } from './components/WelcomeCard';
import { useCostStore } from './store/cost-store';
import { generateMockCostData } from './lib/mock-data';
import { analyzeCostData } from './lib/ai-analysis';

type Tab = 'dashboard' | 'trends' | 'chat' | 'resources';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const { costData, setCostData, setAnomalies, setRecommendations, setLoading } = useCostStore();

  // Load mock data on first render for demo purposes
  useEffect(() => {
    const loadMockData = async () => {
      if (costData.length === 0) {
        setLoading(true);
        const mockData = generateMockCostData();
        setCostData(mockData);
        
        const analysis = await analyzeCostData(mockData);
        setAnomalies(analysis.anomalies);
        setRecommendations(analysis.recommendations);
        setLoading(false);
      }
    };
    
    loadMockData();
  }, []);

  const navigation = [
    { id: 'dashboard' as Tab, name: 'Dashboard', icon: LayoutDashboard },
    { id: 'trends' as Tab, name: 'Trends & Analysis', icon: TrendingUp },
    { id: 'chat' as Tab, name: 'AI Assistant', icon: MessageSquare },
    { id: 'resources' as Tab, name: 'Resources', icon: FileText },
  ];

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-purple-400/20 to-pink-400/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-blue-300/10 to-purple-300/10 rounded-full blur-3xl"></div>
      </div>
      
      {/* Sidebar */}
      <div
        className={`bg-white/80 backdrop-blur-xl border-r border-purple-200/50 transition-all duration-300 relative z-10 ${
          sidebarCollapsed ? 'w-16' : 'w-64'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-blue-200/50 bg-gradient-to-r from-blue-500/5 to-purple-500/5">
            <div className="flex items-center justify-between">
              {!sidebarCollapsed && (
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
                    <Database className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-lg bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">AWS Cost Detective</span>
                </div>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="ml-auto hover:bg-blue-100/50"
              >
                {sidebarCollapsed ? (
                  <ChevronRight className="h-4 w-4 text-blue-600" />
                ) : (
                  <ChevronLeft className="h-4 w-4 text-blue-600" />
                )}
              </Button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-2">
            <div className="space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-blue-600 shadow-sm border border-blue-200/50'
                        : 'text-gray-700 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-purple-50/50'
                    }`}
                    title={sidebarCollapsed ? item.name : undefined}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    {!sidebarCollapsed && <span>{item.name}</span>}
                  </button>
                );
              })}
            </div>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-blue-200/50">
            <button
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-purple-50/50 transition-all duration-200`}
              title={sidebarCollapsed ? 'Settings' : undefined}
            >
              <Settings className="h-5 w-5 flex-shrink-0" />
              {!sidebarCollapsed && <span>Settings</span>}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto relative z-10">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-2xl blur-xl"></div>
            <div className="relative bg-white/50 backdrop-blur-sm rounded-2xl p-6 border border-blue-200/30">
              <h1 className="text-3xl mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {navigation.find((n) => n.id === activeTab)?.name}
              </h1>
              <p className="text-gray-600">
                AI-powered AWS cost analysis and optimization
              </p>
            </div>
          </div>

          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6 relative">
              {showWelcome && <WelcomeCard onDismiss={() => setShowWelcome(false)} />}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 to-purple-400/10 rounded-2xl blur-xl"></div>
                <div className="relative">
                  <FileUpload />
                </div>
              </div>
              <CostOverview />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-300/10 to-cyan-300/10 rounded-2xl blur-2xl"></div>
                  <div className="relative">
                    <CostTrendsChart />
                  </div>
                </div>
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-300/10 to-pink-300/10 rounded-2xl blur-2xl"></div>
                  <div className="relative">
                    <ServiceBreakdown />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <AnomalyAlerts />
                <RecommendationsPanel />
              </div>
            </div>
          )}

          {/* Trends Tab */}
          {activeTab === 'trends' && (
            <div className="space-y-6 relative">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 to-purple-400/10 rounded-2xl blur-xl"></div>
                <div className="relative">
                  <CostTrendsChart />
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-300/10 to-pink-300/10 rounded-2xl blur-2xl"></div>
                  <div className="relative">
                    <ServiceBreakdown />
                  </div>
                </div>
                <AnomalyAlerts />
              </div>
              <RecommendationsPanel />
            </div>
          )}

          {/* Chat Tab */}
          {activeTab === 'chat' && (
            <div className="max-w-4xl mx-auto">
              <AiChat />
            </div>
          )}

          {/* Resources Tab */}
          {activeTab === 'resources' && (
            <div className="space-y-6">
              <ResourceTable />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
