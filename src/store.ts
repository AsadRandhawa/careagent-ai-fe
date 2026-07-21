import { create } from 'zustand';
import { mockChannelTickets, mockAiDrafts } from './mockData';

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

  // Take over a ticket (remove from list, server increments resolved via reply endpoint)
  takeOverTicket: (ticketId: string) => void;

  // Sidebar seen tracking — stored in DB, not localStorage
  markSectionSeen: (section: 'inbox' | 'escalations') => Promise<void>;

  // Gmail channel toggle — stored in DB
  gmailEnabled: boolean;
  setGmailEnabled: (enabled: boolean) => Promise<void>;

  // Facebook channel toggle — stored in DB
  facebookEnabled: boolean;
  setFacebookEnabled: (enabled: boolean) => Promise<void>;

  instagramEnabled: boolean;
  setInstagramEnabled: (enabled: boolean) => Promise<void>;

  // Automation settings — stored in DB
  aiAutoDrafting: boolean;
  setAiAutoDrafting: (val: boolean) => Promise<void>;
  autoClassification: boolean;
  setAutoClassification: (val: boolean) => Promise<void>;
  sentimentTracking: boolean;
  setSentimentTracking: (val: boolean) => Promise<void>;

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
    // Documents save is triggered explicitly by the KB page
    get().saveKnowledgeBase();
  },

  // ── Brand / Identity ───────────────────────────────────
  brandVoice: 'Professional, concise, but friendly. Use emojis occasionally.',
  setBrandVoice: (brandVoice) => { set({ brandVoice }); },

  businessIdentity: 'We are a fast-growing SaaS company that sells productivity software. Our customers are busy professionals.',
  setBusinessIdentity: (businessIdentity) => { set({ businessIdentity }); },

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

    // Always pre-populate AI drafts for mock channel tickets
    set(state => ({
      aiDrafts: { ...mockAiDrafts, ...state.aiDrafts },
    }));

    if (!gmailEnabled) {
      // No Gmail — show only mock channel tickets
      set({ tickets: mockChannelTickets });
      return;
    }

    set({ isFetchingTickets: true });
    try {
      // Fetch Gmail + live chat + Facebook + Instagram tickets in parallel
      const [gmailRes, livechatRes, facebookRes, instagramRes] = await Promise.allSettled([
        fetch(`${getApiUrl()}/api/gmail/emails`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${getApiUrl()}/api/livechat/tickets`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${getApiUrl()}/api/facebook/tickets`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${getApiUrl()}/api/instagram/tickets`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const gmailTickets: any[] = [];
      if (gmailRes.status === 'fulfilled' && gmailRes.value.ok) {
        const data = await gmailRes.value.json();
        if (Array.isArray(data)) {
          gmailTickets.push(...data.map((t: any) => ({ ...t, channel: 'gmail' })));
        }
      }

      const livechatTickets: any[] = [];
      if (livechatRes.status === 'fulfilled' && livechatRes.value.ok) {
        const data = await livechatRes.value.json();
        if (Array.isArray(data)) livechatTickets.push(...data);
      }

      const facebookTickets: any[] = [];
      if (facebookRes.status === 'fulfilled' && facebookRes.value.ok) {
        const data = await facebookRes.value.json();
        if (Array.isArray(data)) facebookTickets.push(...data);
      }

      const instagramTickets: any[] = [];
      if (instagramRes.status === 'fulfilled' && instagramRes.value.ok) {
        const data = await instagramRes.value.json();
        if (Array.isArray(data)) instagramTickets.push(...data);
      }

      // Drop mock Facebook tickets once real ones are flowing in, so the
      // inbox doesn't show duplicate/fake entries alongside live ones.
      const mockTicketsFiltered = facebookTickets.length > 0
        ? mockChannelTickets.filter((t: any) => t.channel !== 'facebook')
        : mockChannelTickets;

      set({ tickets: [...gmailTickets, ...livechatTickets, ...facebookTickets, ...instagramTickets, ...mockTicketsFiltered] });
    } catch (err) {
      console.error('Could not fetch tickets:', err);
      set({ tickets: mockChannelTickets });
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
    // No local resolved increment — the DB is the source of truth via /api/tickets/stats
  },

  // ── Mark Section Seen (DB) ─────────────────────────────
  markSectionSeen: async (section: 'inbox' | 'escalations') => {
    const { token } = get();
    if (!token) return;
    const field = section === 'inbox' ? 'lastSeenInboxAt' : 'lastSeenEscalAt';
    try {
      await fetch(`${getApiUrl()}/api/user/preferences`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ [field]: new Date().toISOString() }),
      });
      // Update local user object so sidebar re-renders immediately
      set((state) => ({
        user: state.user ? { ...state.user, [field]: new Date().toISOString() } : state.user
      }));
    } catch (err) {
      console.error('markSectionSeen failed:', err);
    }
  },

  // ── Pending Plan ──────────────────────────────────────
  pendingPlan: null,
  setPendingPlan: (plan) => set({ pendingPlan: plan }),

  // ── Gmail Toggle (DB) ──────────────────────────────────
  gmailEnabled: true, // will be overwritten by user profile load in App.tsx
  setGmailEnabled: async (enabled: boolean) => {
    const { token } = get();
    set({ gmailEnabled: enabled });
    if (!enabled) set({ tickets: [] });
    if (!token) return;
    try {
      await fetch(`${getApiUrl()}/api/user/preferences`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ gmailEnabled: enabled }),
      });
    } catch (err) {
      console.error('setGmailEnabled failed:', err);
    }
  },

  // ── Facebook Toggle (DB) ───────────────────────────────
  facebookEnabled: true, // will be overwritten by user profile load in App.tsx
  setFacebookEnabled: async (enabled: boolean) => {
    const { token } = get();
    set({ facebookEnabled: enabled });
    if (!token) return;
    try {
      await fetch(`${getApiUrl()}/api/user/preferences`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ facebookEnabled: enabled }),
      });
      // Re-pull tickets so a paused/resumed Facebook channel reflects immediately
      get().fetchTickets();
    } catch (err) {
      console.error('setFacebookEnabled failed:', err);
    }
  },

  // ── Instagram Toggle (DB) ──────────────────────────────
  instagramEnabled: true, // will be overwritten by user profile load in App.tsx
  setInstagramEnabled: async (enabled: boolean) => {
    const { token } = get();
    set({ instagramEnabled: enabled });
    if (!token) return;
    try {
      await fetch(`${getApiUrl()}/api/user/preferences`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ instagramEnabled: enabled }),
      });
      get().fetchTickets();
    } catch (err) {
      console.error('setInstagramEnabled failed:', err);
    }
  },

  // ── Automation Settings (DB) ──────────────────────────
  aiAutoDrafting: true,
  setAiAutoDrafting: async (val: boolean) => {
    set({ aiAutoDrafting: val });
    const { token } = get();
    if (!token) return;
    await fetch(`${getApiUrl()}/api/user/preferences`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ aiAutoDrafting: val }),
    }).catch(console.error);
  },
  autoClassification: true,
  setAutoClassification: async (val: boolean) => {
    set({ autoClassification: val });
    const { token } = get();
    if (!token) return;
    await fetch(`${getApiUrl()}/api/user/preferences`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ autoClassification: val }),
    }).catch(console.error);
  },
  sentimentTracking: false,
  setSentimentTracking: async (val: boolean) => {
    set({ sentimentTracking: val });
    const { token } = get();
    if (!token) return;
    await fetch(`${getApiUrl()}/api/user/preferences`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ sentimentTracking: val }),
    }).catch(console.error);
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
    if (token) {
      localStorage.setItem('careagent_token', token);
    } else {
      // Logout — clear token and reset ALL in-memory state
      localStorage.removeItem('careagent_token');
      set({
        tickets: [],
        aiDrafts: {},
        pendingPlan: null,
        gmailEnabled: true,
        facebookEnabled: true,
        instagramEnabled: true,
        aiAutoDrafting: true,
        autoClassification: true,
        sentimentTracking: false,
        ticketStats: null,
        aiInsights: null,
        user: null,
        documents: [],
        brandVoice: 'Professional, concise, but friendly. Use emojis occasionally.',
        businessIdentity: 'We are a fast-growing SaaS company that sells productivity software. Our customers are busy professionals.',
      });
    }
    set({ token });
  },
  user:    null,
  setUser: (user) => {
    // Sync gmailEnabled from DB when user profile loads
    if (user) {
      set({
        user,
        gmailEnabled:       user.gmailEnabled       ?? true,
        facebookEnabled:    user.facebookEnabled    ?? true,
        instagramEnabled:   user.instagramEnabled    ?? true,
        aiAutoDrafting:     user.aiAutoDrafting     ?? true,
        autoClassification: user.autoClassification ?? true,
        sentimentTracking:  user.sentimentTracking  ?? false,
      });
    } else {
      set({ user: null });
    }
  },

  // ── Onboarding ─────────────────────────────────────────
  showOnboarding: false,
  setShowOnboarding: (show) => set({ showOnboarding: show }),

  // ── Knowledge Base ─────────────────────────────────────
  saveKnowledgeBase: async () => {
    const state = get();
    if (!state.token) return;
    try {
      // Strip base64 field before saving — only keep metadata and textContent
      const docsToSave = state.documents.map(({ base64, ...rest }) => rest);
      await fetch(`${getApiUrl()}/api/user/knowledge-base`, {
        method:  'POST',
        headers: {
          'Content-Type':  'application/json',
          Authorization:   `Bearer ${state.token}`,
        },
        body: JSON.stringify({
          documents:        docsToSave,
          businessIdentity: state.businessIdentity,
          brandVoice:       state.brandVoice,
        }),
      });
    } catch (err) {
      console.error('Failed to save knowledge base', err);
    }
  },
}));
