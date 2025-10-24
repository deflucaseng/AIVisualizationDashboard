import { create } from 'zustand';

export interface CostDataPoint {
  date: string;
  service: string;
  region: string;
  cost: number;
  tags?: Record<string, string>;
  resourceId?: string;
}

export interface Anomaly {
  id: string;
  date: string;
  service: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
  impact: number; // cost impact
  identified: string; // date identified
}

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  estimatedSavings: number;
  effortLevel: 'low' | 'medium' | 'high';
  risk: 'low' | 'medium' | 'high';
  category: string;
  status: 'pending' | 'implemented' | 'ignored';
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface CostStore {
  costData: CostDataPoint[];
  anomalies: Anomaly[];
  recommendations: Recommendation[];
  chatMessages: ChatMessage[];
  isLoading: boolean;
  
  // Actions
  setCostData: (data: CostDataPoint[]) => void;
  setAnomalies: (anomalies: Anomaly[]) => void;
  setRecommendations: (recommendations: Recommendation[]) => void;
  updateRecommendationStatus: (id: string, status: Recommendation['status']) => void;
  addChatMessage: (message: ChatMessage) => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;
}

export const useCostStore = create<CostStore>((set) => ({
  costData: [],
  anomalies: [],
  recommendations: [],
  chatMessages: [],
  isLoading: false,
  
  setCostData: (data) => set({ costData: data }),
  setAnomalies: (anomalies) => set({ anomalies }),
  setRecommendations: (recommendations) => set({ recommendations }),
  updateRecommendationStatus: (id, status) =>
    set((state) => ({
      recommendations: state.recommendations.map((rec) =>
        rec.id === id ? { ...rec, status } : rec
      ),
    })),
  addChatMessage: (message) =>
    set((state) => ({
      chatMessages: [...state.chatMessages, message],
    })),
  setLoading: (loading) => set({ isLoading: loading }),
  reset: () => set({
    costData: [],
    anomalies: [],
    recommendations: [],
    chatMessages: [],
    isLoading: false,
  }),
}));
