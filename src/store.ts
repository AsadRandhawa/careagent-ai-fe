import { create } from 'zustand';

export interface Document {
  name: string;
  size: string;
  chunks: number;
  status: "Active" | "Syncing" | "Pending" | "Error";
  date: string;
  type: string;
  base64?: string;
  textContent?: string;
}

interface AppState {
  documents: Document[];
  setDocuments: (docs: Document[] | ((prev: Document[]) => Document[])) => void;
  brandVoice: string;
  setBrandVoice: (voice: string) => void;
  businessIdentity: string;
  setBusinessIdentity: (identity: string) => void;
  tickets: any[];
  setTickets: (tickets: any[]) => void;
  isFetchingTickets: boolean;
  fetchTickets: () => Promise<void>;
  aiDrafts: Record<string, { status: "draft" | "escalated"; reason?: string; draft?: string }>;
  setAiDrafts: (drafts: Record<string, { status: "draft" | "escalated"; reason?: string; draft?: string }> | ((prev: Record<string, { status: "draft" | "escalated"; reason?: string; draft?: string }>) => Record<string, { status: "draft" | "escalated"; reason?: string; draft?: string }>)) => void;
  token: string | null;
  setToken: (token: string | null) => void;
  user: any | null;
  setUser: (user: any | null) => void;
  saveKnowledgeBase: () => Promise<void>;
  showOnboarding: boolean;
  setShowOnboarding: (show: boolean) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  documents: [],
  setDocuments: (updater) => {
    set((state) => ({ documents: typeof updater === 'function' ? updater(state.documents) : updater }));
    get().saveKnowledgeBase();
  },
  brandVoice: "Professional, concise, but friendly. Use emojis occasionally.",
  setBrandVoice: (brandVoice) => {
    set({ brandVoice });
    get().saveKnowledgeBase();
  },
  businessIdentity: "We are a fast-growing SaaS company that sells productivity software. Our customers are busy professionals.",
  setBusinessIdentity: (businessIdentity) => {
    set({ businessIdentity });
    get().saveKnowledgeBase();
  },
  aiDrafts: {},
  setAiDrafts: (updater) => set((state) => ({
    aiDrafts: typeof updater === 'function' ? updater(state.aiDrafts) : updater
  })),
  token: localStorage.getItem('careagent_token'),
  setToken: (token) => {
    if (token) localStorage.setItem('careagent_token', token);
    else localStorage.removeItem('careagent_token');
    set({ token });
  },
  user: null,
  setUser: (user) => set({ user }),
  showOnboarding: false,
  setShowOnboarding: (show) => set({ showOnboarding: show }),
  saveKnowledgeBase: async () => {
    const state = useAppStore.getState();
    if (!state.token) return;
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
      await fetch(`${apiUrl}/api/user/knowledge-base`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${state.token}`
        },
        body: JSON.stringify({
          documents: state.documents,
          businessIdentity: state.businessIdentity,
          brandVoice: state.brandVoice
        })
      });
    } catch (err) {
      console.error("Failed to save knowledge base", err);
    }
  },
  tickets: [],
  setTickets: (tickets) => set({ tickets }),
  isFetchingTickets: false,
  fetchTickets: async () => {
    const state = get();
    if (!state.token) {
      set({ isFetchingTickets: false });
      return;
    }
    
    set({ isFetchingTickets: true });
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const res = await fetch(`${apiUrl}/api/gmail/emails`, {
        headers: {
          "Authorization": `Bearer ${state.token}`
        }
      });
      if (res.ok) {
        const liveData = await res.json();
        if (liveData && liveData.length > 0) {
          set({ tickets: liveData });
        }
      }
    } catch (err) {
      console.error("Could not fetch live emails:", err);
    } finally {
      set({ isFetchingTickets: false });
    }
  },
}));
