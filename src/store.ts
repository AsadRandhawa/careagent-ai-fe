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

export interface TicketStats {
  openTickets:        number;
  resolvedThisPeriod: number;
  escalated:          number;
  escalationRate:     string;
  avgResolutionTime:  string;
  aiDraftsReady:      number;
  sentimentPct:       { positive: number; neutral: number; frustrated: number };
  categoryStats:      { name: string; value: number; count: number }[];
  volumeTrend:        { name: string; count: number }[];
  miniBarData:        { day: string; value: number }[];
}

export interface AIInsights {
  recommendation:  string;
  recurringIssues: { title: string; count: number; severity: 'High' | 'Medium' | 'Low' }[];
}

interface AppState {
  documents: Document[];
  setDocuments: (docs: Document[] | ((prev: Document[]) => Document[])) => void;
  brandVoice: string;
  setBrandVoice: (voice: string) => void;
  businessIdentity: string;
  setBusinessIdentity: (identity: string) => void;

  tickets: any[];
  setTickets: (tickets: any[] | ((prev: any[]) => any[])) => void;
  isFetchingTickets: boolean;
  fetchTickets: () => Promise<void>;

  // Real stats from DB
  ticketStats:        TicketStats | null;
  isFetchingStats:    boolean;
  fetchTicketStats:   (days?: number) => Promise<void>;

  // AI insights
  aiInsights:         AIInsights | null;
  isFetchingInsights: boolean;
  fetchAIInsights:    () => Promise<void>;

  // Sync Gmail → DB
  syncTickets: () => Promise<void>;

  // Session-local resolved count (incremented on send/take-over)
  resolvedCount: number;
  incrementResolved: () => void;

  // Take over a ticket (remove from list)
  takeOverTicket: (ticketId: string) => void;

  // Sidebar seen tracking (badges disappear after first visit)
  seenSections: Record<string, boolean>;
  markSectionSeen: (section: string) => void;

  // Gmail channel enabled toggle
  gmailEnabled: boolean;
  setGmailEnabled: (enabled: boolean) => void;

  aiDrafts: Record<string, { status: "draft" | "escalated"; reason?: string; draft?: string }>;
  setAiDrafts: (
    drafts:
      | Record<string, { status: "draft" | "escalated"; reason?: string; draft?: string }>
      | ((prev: Record<string, { status: "draft" | "escalated"; reason?: string; draft?: string }>) => Record<string, { status: "draft" | "escalated"; reason?: string; draft?: string }>)
  ) => void;

  token: string | null;
  setToken: (token: string | null) => void;
  user: any | null;
  setUser: (user: any | null) => void;
  saveKnowledgeBase: () => Promise<void>;
  showOnboarding: boolean;
  setShowOnboarding: (show: boolean) => void;
}

const getApiUrl = () => import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const useAppStore = create<AppState>((set, get) => ({
  // ── Documents ──────────────────────────────────────────
  documents: [],
  setDocuments: (updater) => {
    set((state) => ({
      documents: typeof updater === 'function' ? updater(state.documents) : updater,
    }));
    get().saveKnowledgeBase();
  },

  // ── Brand / Identity ───────────────────────────────────
  brandVoice: 'Professional, concise, but friendly. Use emojis occasionally.',
  setBrandVoice: (brandVoice) => { set({ brandVoice }); get().saveKnowledgeBase(); },

  businessIdentity: 'We are a fast-growing SaaS company that sells productivity software. Our customers are busy professionals.',
  setBusinessIdentity: (businessIdentity) => { set({ businessIdentity }); get().saveKnowledgeBase(); },

  // ── Tickets (live inbox) ───────────────────────────────
  tickets: [],
  setTickets: (updater) =>
    set((state) => ({
      tickets: typeof updater === 'function' ? updater(state.tickets) : updater,
    })),
  isFetchingTickets: false,
  fetchTickets: async () => {
    const { token, gmailEnabled } = get();
    if (!token) return;
    // If Gmail channel is disabled, clear tickets and bail
    if (!gmailEnabled) {
      set({ tickets: [] });
      return;
    }
    set({ isFetchingTickets: true });
    try {
      const res = await fetch(`${getApiUrl()}/api/gmail/emails`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.length > 0) set({ tickets: data });
      }
    } catch (err) {
      console.error('Could not fetch live emails:', err);
    } finally {
      set({ isFetchingTickets: false });
    }
  },

  // ── Sync Gmail → DB ────────────────────────────────────
  syncTickets: async () => {
    const { token } = get();
    if (!token) return;
    try {
      await fetch(`${getApiUrl()}/api/tickets/sync`, {
        method:  'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (err) {
      console.error('Sync failed:', err);
    }
  },

  // ── Resolved Count (session + localStorage) ────────────
  resolvedCount: parseInt(localStorage.getItem('careagent_resolved') || '0', 10),
  incrementResolved: () => {
    set((state) => {
      const next = state.resolvedCount + 1;
      localStorage.setItem('careagent_resolved', String(next));
      return { resolvedCount: next };
    });
  },

  // ── Take Over Ticket ───────────────────────────────────
  takeOverTicket: (ticketId: string) => {
    set((state) => ({
      tickets: state.tickets.filter((t) => t.id !== ticketId),
      aiDrafts: (() => {
        const d = { ...state.aiDrafts };
        delete d[ticketId];
        return d;
      })(),
    }));
    get().incrementResolved();
  },

  // ── Sidebar Seen Sections ──────────────────────────────
  seenSections: JSON.parse(localStorage.getItem('careagent_seen') || '{}'),
  markSectionSeen: (section: string) => {
    set((state) => {
      const updated = { ...state.seenSections, [section]: true };
      localStorage.setItem('careagent_seen', JSON.stringify(updated));
      return { seenSections: updated };
    });
  },

  // ── Gmail Channel Toggle ───────────────────────────────
  gmailEnabled: localStorage.getItem('careagent_gmail_enabled') !== 'false',
  setGmailEnabled: (enabled: boolean) => {
    localStorage.setItem('careagent_gmail_enabled', String(enabled));
    set({ gmailEnabled: enabled });
  },

  // ── Real Stats ─────────────────────────────────────────
  ticketStats:     null,
  isFetchingStats: false,
  fetchTicketStats: async (days = 30) => {
    const { token } = get();
    if (!token) return;
    set({ isFetchingStats: true });
    try {
      const res = await fetch(`${getApiUrl()}/api/tickets/stats?days=${days}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) set({ ticketStats: await res.json() });
    } catch (err) {
      console.error('Stats fetch failed:', err);
    } finally {
      set({ isFetchingStats: false });
    }
  },

  // ── AI Insights ────────────────────────────────────────
  aiInsights:         null,
  isFetchingInsights: false,
  fetchAIInsights: async () => {
    const { token } = get();
    if (!token) return;
    set({ isFetchingInsights: true });
    try {
      const res = await fetch(`${getApiUrl()}/api/tickets/insights`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) set({ aiInsights: await res.json() });
    } catch (err) {
      console.error('Insights fetch failed:', err);
    } finally {
      set({ isFetchingInsights: false });
    }
  },

  // ── AI Drafts ──────────────────────────────────────────
  aiDrafts: {},
  setAiDrafts: (updater) =>
    set((state) => ({
      aiDrafts: typeof updater === 'function' ? updater(state.aiDrafts) : updater,
    })),

  // ── Auth ───────────────────────────────────────────────
  token: localStorage.getItem('careagent_token'),
  setToken: (token) => {
    if (token) localStorage.setItem('careagent_token', token);
    else localStorage.removeItem('careagent_token');
    set({ token });
  },
  user:    null,
  setUser: (user) => set({ user }),

  // ── Onboarding ─────────────────────────────────────────
  showOnboarding: false,
  setShowOnboarding: (show) => set({ showOnboarding: show }),

  // ── Knowledge Base ─────────────────────────────────────
  saveKnowledgeBase: async () => {
    const state = get();
    if (!state.token) return;
    try {
      await fetch(`${getApiUrl()}/api/user/knowledge-base`, {
        method:  'POST',
        headers: {
          'Content-Type':  'application/json',
          Authorization:   `Bearer ${state.token}`,
        },
        body: JSON.stringify({
          documents:        state.documents,
          businessIdentity: state.businessIdentity,
          brandVoice:       state.brandVoice,
        }),
      });
    } catch (err) {
      console.error('Failed to save knowledge base', err);
    }
  },
}));
