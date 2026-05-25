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
}

export const useAppStore = create<AppState>((set) => ({
  documents: [],
  setDocuments: (updater) => set((state) => ({
    documents: typeof updater === 'function' ? updater(state.documents) : updater
  })),
  brandVoice: "Professional, concise, but friendly. Use emojis occasionally.",
  setBrandVoice: (brandVoice) => set({ brandVoice }),
  businessIdentity: "We are a fast-growing SaaS company that sells productivity software. Our customers are busy professionals.",
  setBusinessIdentity: (businessIdentity) => set({ businessIdentity }),
}));
