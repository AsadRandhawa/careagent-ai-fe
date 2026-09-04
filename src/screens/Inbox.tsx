import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Search, Filter, Sparkles, Send, Edit3, RotateCw,
  AlertTriangle, User, Hash, MoreVertical, Paperclip,
  Smile, Plus, MessageCircle, Globe, Mail, Instagram,
} from "lucide-react";
import { SectionHeader } from "../components/SectionHeader";
import { TicketRow } from "../components/TicketRow";
import { Avatar } from "../components/ui/Avatar";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { IconButton } from "../components/ui/IconButton";
import { Spinner } from "../components/ui/AtomsMisc";
import { Card } from "../components/Card";
import { useToast } from "../components/ToastProvider";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAppStore } from "../store";
import { cn } from "@/src/lib/utils";

type AIDraftResponse = { status: "draft" | "escalated"; reason?: string; draft?: string };

// ── Channel config ────────────────────────────────────────────────────────────
const CHANNELS = [
  { id: "All",      label: "All",      icon: null,                  accent: "", bg: "", text: "", dot: "" },
  { id: "gmail",    label: "Gmail",    icon: <Mail size={14} />,    accent: "border-danger/50",      bg: "bg-danger/8",      text: "text-danger",      dot: "bg-danger"      },
  { id: "whatsapp", label: "WhatsApp", icon: <MessageCircle size={14} />, accent: "border-[#25D366]/50", bg: "bg-[#25D366]/8",   text: "text-[#25D366]",   dot: "bg-[#25D366]"   },
  {
    id: "facebook", label: "Facebook",
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    ),
    accent: "border-[#1877F2]/50", bg: "bg-[#1877F2]/8", text: "text-[#1877F2]", dot: "bg-[#1877F2]",
  },
  {
    id: "instagram", label: "Instagram",
    icon: <Instagram size={14} />,
    accent: "border-[#E1306C]/50", bg: "bg-[#E1306C]/8", text: "text-[#E1306C]", dot: "bg-[#E1306C]",
  },
  { id: "website",  label: "Website",  icon: <Globe size={14} />,   accent: "border-teal/50",        bg: "bg-teal/8",        text: "text-teal",        dot: "bg-teal"        },
];

// Formats a ticket's received timestamp for the conversation-header date
// separator. Previously this was a hardcoded literal string ("Today, May
// 14") that never changed regardless of when a message actually arrived —
// every single conversation showed the exact same fake date. This derives
// a real label from the ticket's actual createdAt/time field instead:
// "Today" for the current calendar day, "Yesterday" for the day before,
// and a real date otherwise.
function formatDateSeparator(dateInput: string | undefined): string {
  if (!dateInput) return "";
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return "";

  const now = new Date();
  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const diffDays = Math.round((startOfDay(now) - startOfDay(date)) / (24 * 60 * 60 * 1000));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  return date.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
}

export const Inbox = ({ defaultFilter = "All" }: { defaultFilter?: string }) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const ticketIdParam = searchParams.get("ticketId");

  const {
    tickets, setTickets, isFetchingTickets,
    aiDrafts, setAiDrafts,
    token, takeOverTicket,
  } = useAppStore();

  const [selectedId,   setSelectedId]   = React.useState<string | null>(ticketIdParam || (tickets.length > 0 ? tickets[0].id : null));
  const [activeFilter, setActiveFilter] = React.useState(defaultFilter);
  const [activeChannel, setActiveChannel] = React.useState("All");
  const [isDrafting,   setIsDrafting]   = React.useState(false);
  const [isEditing,    setIsEditing]    = React.useState(false);
  const [chatMessages, setChatMessages] = React.useState<any[]>([]);
  const [isChatLoading, setIsChatLoading] = React.useState(false);
  const [manualReply,  setManualReply]  = React.useState("");
  const [isSending,    setIsSending]    = React.useState(false);

  // Idempotency keys for reply-send requests, keyed by ticket id. Generated
  // lazily on first send attempt for a given ticket and reused for any
  // retry of that same attempt (e.g. the network dropped the response but
  // the message actually went out) — the backend uses this to make sure a
  // retry never sends the same message to the customer twice. Cleared once
  // a send actually succeeds, so a later, genuinely new reply to that
  // ticket id gets its own fresh key.
  const sendIdempotencyKeys = React.useRef<Record<string, string>>({});
  const getIdempotencyKey = React.useCallback((ticketId: string) => {
    if (!sendIdempotencyKeys.current[ticketId]) {
      sendIdempotencyKeys.current[ticketId] = crypto.randomUUID();
    }
    return sendIdempotencyKeys.current[ticketId];
  }, []);
  const clearIdempotencyKey = React.useCallback((ticketId: string) => {
    delete sendIdempotencyKeys.current[ticketId];
  }, []);
  const { toast } = useToast();

  const selectedTicket = tickets.find(t => t.id === selectedId);

  // ── Per-channel escalation counts ────────────────────────────────────────────
  const channelEscCounts = React.useMemo(() => {
    const counts: Record<string, { total: number; escalated: number }> = {
      gmail:     { total: 0, escalated: 0 },
      whatsapp:  { total: 0, escalated: 0 },
      facebook:  { total: 0, escalated: 0 },
      instagram: { total: 0, escalated: 0 },
      website:   { total: 0, escalated: 0 },
    };
    tickets.forEach(t => {
      const ch = ((t as any).channel as string | undefined) ?? "gmail";
      if (!counts[ch]) return;
      counts[ch].total++;
      if (t.status === "escalated" || aiDrafts[t.id]?.status === "escalated") {
        counts[ch].escalated++;
      }
    });
    return counts;
  }, [tickets, aiDrafts]);

  const generateDraft = React.useCallback(async (ticketId: string, customInstructions?: string) => {
    const ticket = tickets.find(t => t.id === ticketId);
    if (!ticket) return;
    setIsDrafting(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const response = await fetch(`${apiUrl}/api/ai/draft`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          customerName:       ticket.customerName,
          customerMessage:    ticket.content,
          customInstructions: customInstructions || null,
          ticketId:           ticket.id,
          ticketContent:      ticket.content,
          ticketSubject:      ticket.subject,
        }),
      });

      if (!response.ok) throw new Error("Backend error");
      const draftObj = await response.json();
      setAiDrafts(prev => ({ ...prev, [ticketId]: draftObj }));
    } catch (error) {
      console.error(error);
      toast("Failed to generate draft. Check API key.", "error");
    } finally {
      setIsDrafting(false);
      setIsEditing(false);
    }
  }, [tickets, toast, token, setAiDrafts]);

  // Auto-generate draft when a ticket is selected
  React.useEffect(() => {
    if (selectedId && !aiDrafts[selectedId]) generateDraft(selectedId);
  }, [selectedId, aiDrafts, generateDraft]);

  // Load full conversation history for channels backed by a persisted
  // message thread: website (ChatMessage table, always was full-history)
  // and WhatsApp/Facebook/Instagram (Message table, added alongside the
  // conversation-threading migration — each of those channels now groups
  // every message from the same customer into one Ticket instead of a new
  // one per message, so this is what actually shows that history).
  // Gmail is intentionally excluded — it's pull-based off the Gmail API,
  // which already holds full thread history natively, so there's no local
  // Message data to fetch for it.
  React.useEffect(() => {
    const ticket = tickets.find(t => t.id === selectedId);
    const channel = (ticket as any)?.channel;
    const isThreaded = channel === 'website' || channel === 'facebook' || channel === 'instagram' || channel === 'whatsapp';
    if (!ticket || !isThreaded) {
      setChatMessages([]);
      return;
    }
    setIsChatLoading(true);
    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";

    const request = channel === 'website'
      ? fetch(`${apiUrl}/api/livechat/messages/${(ticket as any).sessionId || selectedId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
          .then(r => r.ok ? r.json() : { messages: [] })
          .then(d => d.messages || [])
      // Normalized to the same { role, content, createdAt } shape the
      // livechat branch above already produces, so both can share one
      // renderer — 'outbound' (sent by an agent/AI) maps to 'agent',
      // everything else (customer-sent) maps to 'visitor'.
      : fetch(`${apiUrl}/api/tickets/${selectedId}/messages`, {
          headers: { Authorization: `Bearer ${token}` },
        })
          .then(r => r.ok ? r.json() : [])
          .then((msgs: any[]) => msgs.map(m => ({
            role: m.direction === 'outbound' ? 'agent' : 'visitor',
            content: m.content,
            createdAt: m.createdAt,
          })));

    request
      .then(setChatMessages)
      // A fetch failure (or a ticket that predates the backfill and has no
      // Message rows yet) falls back to the single-message view below via
      // the empty-array branch — never a broken/blank pane.
      .catch(() => setChatMessages([]))
      .finally(() => setIsChatLoading(false));
  }, [selectedId, token, tickets]);

  React.useEffect(() => {
    if (tickets.length === 0) setSelectedId(null);
  }, [tickets]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Manual Escalate (no AI needed) ───────────────────────────────────────
  const handleManualEscalate = React.useCallback(async () => {
    if (!selectedTicket) return;
    setTickets((prev: any[]) => prev.map((t: any) =>
      t.id === selectedTicket.id ? { ...t, status: "escalated" } : t
    ));
    try {
      const apiUrl = (import.meta.env.VITE_API_URL || "https://careagent-ai-be-production.up.railway.app").replace(/\/+$/, "");
      await fetch(`${apiUrl}/api/tickets/escalate`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({
          ticketId: selectedTicket.id,
          subject: selectedTicket.subject,
          customerName: selectedTicket.customerName,
          customerEmail: selectedTicket.email,
          content: selectedTicket.content,
          threadId: selectedTicket.threadId,
          reason: "Manually escalated by agent",
        }),
      });
    } catch (e) { console.error("Failed to persist escalation:", e); }
    navigate("/escalations");
  }, [selectedTicket, token, setTickets, navigate]);

  // ── Approve & Send AI Draft ───────────────────────────────────────────────
  const handleApprove = React.useCallback(async () => {
    if (!selectedId || !selectedTicket) return;
    const draft = aiDrafts[selectedId];
    if (!draft?.draft) return;
    setIsSending(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const channel = (selectedTicket as any).channel;
      const isLivechat = channel === 'website';
      const isFacebook = channel === 'facebook';
      const isInstagram = channel === 'instagram';
      const isWhatsapp = channel === 'whatsapp';
      const endpoint =
        isLivechat ? `${apiUrl}/api/livechat/reply` :
        isFacebook ? `${apiUrl}/api/facebook/reply` :
        isInstagram ? `${apiUrl}/api/instagram/reply` :
        isWhatsapp ? `${apiUrl}/api/whatsapp/reply` :
        `${apiUrl}/api/gmail/reply`;
      const body = isLivechat
        ? JSON.stringify({ sessionId: (selectedTicket as any).sessionId || selectedId, content: draft.draft })
        : isWhatsapp
        ? JSON.stringify({ ticketId: selectedId, message: draft.draft })
        : (isFacebook || isInstagram)
        ? JSON.stringify({ ticketId: selectedId, threadId: selectedTicket.threadId, body: draft.draft })
        : JSON.stringify({ to: selectedTicket.email, subject: selectedTicket.subject || "Re: Your message", body: draft.draft, threadId: selectedTicket.threadId });
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
          "Idempotency-Key": getIdempotencyKey(selectedId),
        },
        body,
      });
      if (!res.ok) throw new Error("Failed to send");
      clearIdempotencyKey(selectedId);
      toast("Reply sent successfully ✓", "success");
      if (isLivechat) {
        setChatMessages(prev => [...prev, { role: 'agent', content: draft.draft, createdAt: new Date().toISOString() }]);
        setAiDrafts(prev => { const d = { ...prev }; delete d[selectedId]; return d; });
        setIsEditing(false);
      } else {
        setTickets((prevTickets: any[]) => {
          const nextTickets = prevTickets.filter(t => t.id !== selectedId);
          setSelectedId(nextTickets.length > 0 ? nextTickets[0].id : null);
          return nextTickets;
        });
        setAiDrafts(prev => { const d = { ...prev }; delete d[selectedId]; return d; });
        setIsEditing(false);
        setManualReply("");
      }
    } catch (err) {
      console.error(err);
      toast("Failed to send reply. Please try again.", "error");
    } finally {
      setIsSending(false);
    }
  }, [selectedId, selectedTicket, aiDrafts, token, toast, setTickets, setAiDrafts, getIdempotencyKey, clearIdempotencyKey]);


  // ── Send Manual Reply ─────────────────────────────────────────────────────
  const handleManualSend = React.useCallback(async () => {
    if (!selectedTicket || !manualReply.trim()) return;
    setIsSending(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const channel = (selectedTicket as any).channel;
      const isLivechat = channel === 'website';
      const isFacebook = channel === 'facebook';
      const isInstagram = channel === 'instagram';
      const isWhatsapp = channel === 'whatsapp';
      const endpoint =
        isLivechat ? `${apiUrl}/api/livechat/reply` :
        isFacebook ? `${apiUrl}/api/facebook/reply` :
        isInstagram ? `${apiUrl}/api/instagram/reply` :
        isWhatsapp ? `${apiUrl}/api/whatsapp/reply` :
        `${apiUrl}/api/gmail/reply`;
      const body = isLivechat
        ? JSON.stringify({ sessionId: (selectedTicket as any).sessionId || selectedId, content: manualReply })
        : isWhatsapp
        ? JSON.stringify({ ticketId: selectedId, message: manualReply })
        : (isFacebook || isInstagram)
        ? JSON.stringify({ ticketId: selectedId, threadId: selectedTicket.threadId, body: manualReply })
        : JSON.stringify({ to: selectedTicket.email, subject: selectedTicket.subject || "Re: Your message", body: manualReply, threadId: selectedTicket.threadId });
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
          "Idempotency-Key": getIdempotencyKey(selectedId as string),
        },
        body,
      });
      if (!res.ok) throw new Error("Failed to send");
      clearIdempotencyKey(selectedId as string);
      toast("Reply sent successfully ✓", "success");
      setManualReply("");
      if (isLivechat) {
        setChatMessages(prev => [...prev, { role: 'agent', content: manualReply, createdAt: new Date().toISOString() }]);
      } else {
        setTickets((prevTickets: any[]) => {
          const nextTickets = prevTickets.filter(t => t.id !== selectedId);
          setSelectedId(nextTickets.length > 0 ? nextTickets[0].id : null);
          return nextTickets;
        });
      }
    } catch (err) {
      console.error(err);
      toast("Failed to send reply. Please try again.", "error");
    } finally {
      setIsSending(false);
    }
  }, [selectedTicket, manualReply, token, toast, setTickets, selectedId, getIdempotencyKey, clearIdempotencyKey]);

  const handleRegenerate = () => {
    if (selectedId) generateDraft(selectedId, "Make it shorter and more polite.");
  };

  const filteredTickets = tickets.filter(ticket => {
    const statusOk =
      activeFilter === "All"       ? true :
      activeFilter === "New"       ? ticket.status === "new" :
      activeFilter === "Escalated" ? ticket.status === "escalated" :
      true;
    const channelOk = activeChannel === "All" ? true : (ticket as any).channel === activeChannel;
    return statusOk && channelOk;
  });

  React.useEffect(() => {
    if (!selectedId) return;
    if (filteredTickets.length > 0 && !filteredTickets.find(t => t.id === selectedId)) {
      setSelectedId(filteredTickets[0].id);
    } else if (filteredTickets.length === 0) {
      setSelectedId(null);
    }
  }, [filteredTickets]); // eslint-disable-line react-hooks/exhaustive-deps

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLInputElement) return;
      if (e.key === "j" || e.key === "J") {
        const i = filteredTickets.findIndex(t => t.id === selectedId);
        if (i < filteredTickets.length - 1) setSelectedId(filteredTickets[i + 1].id);
      } else if (e.key === "k" || e.key === "K") {
        const i = filteredTickets.findIndex(t => t.id === selectedId);
        if (i > 0) setSelectedId(filteredTickets[i - 1].id);
      } else if ((e.key === "a" || e.key === "A") && aiDrafts[selectedId || ""]?.status !== "escalated") {
        handleApprove();
      } else if ((e.key === "e" || e.key === "E") && aiDrafts[selectedId || ""]?.status !== "escalated") {
        setIsEditing(true);
        e.preventDefault();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [filteredTickets, selectedId, handleApprove, aiDrafts]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col h-full bg-bg"
    >
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="px-8 pt-6 pb-0 bg-glass sticky top-0 z-10">
        <div className="flex items-center justify-between mb-4">
          <SectionHeader title="Active Inbox" className="mb-0" />
          <div className="flex items-center gap-2">
            <IconButton><Filter size={16} /></IconButton>
            <Button size="sm" variant="primary" icon={<Plus size={14} />}>New Ticket</Button>
          </div>
        </div>

        {/* ── Sidebar-style Channel Boxes ────────────────────────────────── */}
        <div className="flex items-center gap-2 mb-3">
          {CHANNELS.filter(c => c.id !== "All").map(ch => {
            const meta = channelEscCounts[ch.id] ?? { total: 0, escalated: 0 };
            const isActive = activeChannel === ch.id;
            return (
              <button
                key={ch.id}
                onClick={() => setActiveChannel(isActive ? "All" : ch.id)}
                className={cn(
                  "flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl border transition-all duration-150 flex-1 group",
                  isActive
                    ? cn("border-l-2", ch.accent, ch.bg, "border-border-faint shadow-sm")
                    : "bg-bg-elevated/60 border-border-faint hover:bg-surface/60 hover:border-border-mid"
                )}
              >
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0",
                    isActive ? ch.bg : "bg-surface-high"
                  )}>
                    <span className={cn("flex items-center", isActive ? ch.text : "text-text-muted")}>
                      {ch.icon}
                    </span>
                  </div>
                  <span className={cn(
                    "text-[12px] font-semibold",
                    isActive ? ch.text : "text-text-muted group-hover:text-text-second"
                  )}>
                    {ch.label}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  {meta.escalated > 0 && (
                    <span className={cn("w-1.5 h-1.5 rounded-full animate-pulse", ch.dot ?? "bg-danger")} />
                  )}
                  <span className={cn(
                    "text-[10px] font-black px-1.5 py-0.5 rounded-full min-w-[22px] text-center",
                    isActive ? cn(ch.bg, ch.text) : "bg-surface-high text-text-muted"
                  )}>
                    {meta.total}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* ── Status Filters ──────────────────────────────────────────────── */}
        <div className="flex items-center gap-1 pb-3">
          {["All", "New", "Escalated"].map(f => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={cn(
                "px-3 py-1.5 rounded-full text-[12px] font-medium transition-all",
                activeFilter === f ? "bg-surface-high text-text-primary" : "text-text-muted hover:text-text-second"
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* ── Main 2-Panel Split ───────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel: Ticket List */}
        <div className="w-[320px] flex flex-col border-r border-border-faint h-full bg-bg-elevated/20">
          <div className="p-4 border-b border-border-faint">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={14} />
              <input
                type="text"
                placeholder="Search"
                className="w-full bg-bg border border-border-mid rounded-lg h-9 pl-9 pr-3 text-[12px] placeholder:text-text-muted outline-none focus:border-brand/40"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {isFetchingTickets && tickets.length === 0 ? (
              <div className="p-8 text-center text-[13px] text-text-muted">Loading...</div>
            ) : filteredTickets.length === 0 ? (
              <div className="p-8 text-center text-[13px] text-text-muted">No tickets found.</div>
            ) : (
              filteredTickets.map(ticket => (
                <TicketRow
                  key={ticket.id}
                  {...ticket}
                  channel={(ticket as any).channel}
                  status={ticket.status === "escalated" ? "escalated" : "new"}
                  selected={ticket.id === selectedId}
                  onClick={() => setSelectedId(ticket.id)}
                  avatarVariant={ticket.avatarVariant as any}
                />
              ))
            )}
          </div>
        </div>

        {/* Right Panel: Conversation */}
        <div className="flex-1 flex flex-col h-full bg-bg">
          {selectedTicket ? (
            <>
              {/* Conversation Header */}
              <div className="h-16 flex items-center justify-between px-6 border-b border-border-faint bg-bg-elevated/10">
                <div className="flex items-center gap-4">
                  <Avatar initials={selectedTicket.initials} size={32} variant={selectedTicket.avatarVariant as any} />
                  <div>
                    <h2 className="text-[14px] font-bold text-text-primary leading-tight">{selectedTicket.customerName}</h2>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-[10px] font-mono text-text-muted flex items-center gap-1">
                        <User size={10} /> {selectedTicket.email}
                      </span>
                      <span className="text-[10px] font-mono text-text-muted flex items-center gap-1">
                        <Hash size={10} /> {selectedTicket.id}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant="default" size="sm" className="bg-surface border-border-mid px-3">
                    {selectedTicket.status}
                  </Badge>
                  <div className="h-4 w-px bg-border-faint mx-2" />
                  <IconButton><MoreVertical size={16} /></IconButton>
                </div>
              </div>

              {/* Conversation Thread */}
              <div className="flex-1 overflow-y-auto p-8 space-y-8">
                <div className="flex flex-col items-center">
                  <Badge variant="default" size="xs" className="mb-4">
                    {formatDateSeparator((selectedTicket as any).createdAt || (selectedTicket as any).receivedAt)}
                  </Badge>
                </div>

                {/* Message thread: full history for website/WhatsApp/Facebook/
                    Instagram (all backed by a real message table now); Gmail
                    still shows just the single synced message (see effect
                    above for why). */}
                {(selectedTicket as any).channel !== 'gmail' ? (
                  isChatLoading ? (
                    <div className="text-center text-[12px] text-text-muted py-4">Loading conversation…</div>
                  ) : chatMessages.length > 0 ? (
                    chatMessages.map((msg: any, i: number) => (
                      <div
                        key={i}
                        className={`flex flex-col max-w-[80%] ${msg.role === 'agent' ? 'ml-auto items-end' : 'items-start'}`}
                      >
                        <div className="flex items-center gap-2 mb-1 px-1">
                          <span className="text-[10px] font-bold text-text-second">
                            {msg.role === 'agent' ? 'You' : selectedTicket.customerName}
                          </span>
                          <span className="text-[10px] font-mono text-text-muted">
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <div className={`rounded-2xl p-4 text-[13px] leading-relaxed shadow-sm ${
                          msg.role === 'agent'
                            ? 'bg-brand-faint border border-brand/20 rounded-br-sm text-text-primary'
                            : 'bg-surface border border-border-mid rounded-bl-sm text-text-primary'
                        }`}>
                          {msg.content}
                        </div>
                      </div>
                    ))
                  ) : (
                    // No Message rows yet — either a fetch hiccup, or (for
                    // WhatsApp/Facebook/Instagram) a ticket that predates the
                    // backfill migration. Same single-bubble fallback either way.
                    <div className="flex flex-col items-start max-w-[80%]">
                      <div className="flex items-center gap-2 mb-1.5 px-1">
                        <span className="text-[10px] font-bold text-text-second">{selectedTicket.customerName}</span>
                        <span className="text-[10px] font-mono text-text-muted">{selectedTicket.time}</span>
                      </div>
                      <div className="bg-surface border border-border-mid rounded-2xl rounded-bl-sm p-4 text-[13px] text-text-primary leading-relaxed shadow-sm">
                        {selectedTicket.content}
                      </div>
                    </div>
                  )
                ) : (
                  <div className="flex flex-col items-start max-w-[80%]">
                    <div className="flex items-center gap-2 mb-1.5 px-1">
                      <span className="text-[10px] font-bold text-text-second">{selectedTicket.customerName}</span>
                      <span className="text-[10px] font-mono text-text-muted">{selectedTicket.time}</span>
                    </div>
                    <div className="bg-surface border border-border-mid rounded-2xl rounded-bl-sm p-4 text-[13px] text-text-primary leading-relaxed shadow-sm">
                      {selectedTicket.content}
                    </div>
                  </div>
                )}

                {/* AI Draft / Action Section */}
                <AnimatePresence mode="wait">
                  {isDrafting ? (
                    /* ── Generating spinner ─────────────────────────────── */
                    <motion.div
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      key="drafting"
                    >
                      <Card variant="glow" className="max-w-[85%] ml-auto bg-glass-subtle">
                        <div className="flex items-center gap-3 text-brand">
                          <Spinner size={16} className="border-brand/20 border-t-brand" />
                          <span className="text-[12px] font-bold uppercase tracking-widest">Drafting...</span>
                        </div>
                      </Card>
                    </motion.div>
                  ) : aiDrafts[selectedTicket.id] ? (
                    /* ── Draft or AI-escalation result ──────────────────── */
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      key="ready"
                    >
                      {aiDrafts[selectedTicket.id].status === "escalated" ? (
                        /* AI flagged for escalation — show a single button, user decides */
                        <div className="flex justify-end">
                          <Button
                            size="sm"
                            variant="ghost"
                            icon={<AlertTriangle size={14} className="text-danger" />}
                            className="border-danger/20 text-danger hover:bg-danger/10"
                            onClick={handleManualEscalate}
                          >
                            Escalate Ticket
                          </Button>
                        </div>
                      ) : (
                        /* AI draft ready */
                        <div className="flex flex-col items-end max-w-[85%] ml-auto">
                          <div className="flex items-center gap-2 mb-1.5 px-1">
                            <Sparkles size={10} className="text-brand" />
                            <span className="text-[10px] font-bold text-brand uppercase tracking-wider">Draft</span>
                          </div>
                          <div className="w-full bg-glass rounded-2xl rounded-br-sm overflow-hidden">
                            <div className="p-5">
                              {isEditing ? (
                                <textarea
                                  className="w-full bg-surface border border-border-mid rounded-lg p-3 text-[13px] text-text-primary h-48 focus:ring-1 focus:ring-brand outline-none"
                                  value={aiDrafts[selectedTicket.id].draft}
                                  onChange={e => setAiDrafts({ ...aiDrafts, [selectedTicket.id]: { ...aiDrafts[selectedTicket.id], draft: e.target.value } })}
                                />
                              ) : (
                                <p className="text-[13px] text-text-primary leading-relaxed whitespace-pre-wrap">
                                  {aiDrafts[selectedTicket.id].draft}
                                </p>
                              )}
                            </div>
                            <div className="bg-brand-faint/30 p-3 border-t border-border-faint flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                {isEditing ? (
                                  <Button size="sm" variant="primary" onClick={() => setIsEditing(false)}>Save</Button>
                                ) : (
                                  <>
                                    <Button
                                      size="sm" variant="primary"
                                      icon={isSending ? <Spinner size={14} className="border-white/20 border-t-white" /> : <Send size={14} />}
                                      onClick={handleApprove}
                                      disabled={isSending}
                                    >
                                      {isSending ? "Sending..." : "Send"}
                                    </Button>
                                    <Button size="sm" variant="ghost" className="bg-surface border-border-mid" icon={<Edit3 size={14} />} onClick={() => setIsEditing(true)}>
                                      Edit
                                    </Button>
                                  </>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <IconButton className="bg-surface/50 border-border-mid" onClick={handleRegenerate}>
                                  <RotateCw size={14} />
                                </IconButton>
                                <IconButton
                                  className="bg-danger-faint border-danger/10 text-danger hover:bg-danger/20"
                                  onClick={handleManualEscalate}
                                  title="Escalate ticket"
                                >
                                  <AlertTriangle size={14} />
                                </IconButton>
                              </div>
                            </div>
                          </div>
                          <div className="mt-3 flex items-center gap-4 text-[10px] text-text-muted font-mono">
                            <span className="flex items-center gap-1"><span className="w-1 h-1 rounded-full bg-text-muted" /> PRESS A TO APPROVE</span>
                            <span className="flex items-center gap-1"><span className="w-1 h-1 rounded-full bg-text-muted" /> PRESS E TO EDIT</span>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>

              {/* Manual Reply Bar */}
              <div className="p-6 bg-bg-elevated/20 border-t border-border-faint">
                <div className="relative group">
                  <div className="absolute inset-0 bg-brand/5 blur-xl group-focus-within:bg-brand/10 transition-all rounded-full" />
                  <div className="relative flex items-center bg-bg border border-border-mid group-focus-within:border-brand/40 rounded-2xl h-14 pl-4 pr-2 transition-all">
                    <input
                      type="text"
                      placeholder="Type a manual response..."
                      value={manualReply}
                      onChange={e => setManualReply(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === "Enter" && !e.shiftKey && manualReply.trim()) {
                          e.preventDefault();
                          handleManualSend();
                        }
                      }}
                      className="flex-1 bg-transparent text-[13px] text-text-primary placeholder:text-text-muted outline-none h-full"
                    />
                    <div className="flex items-center gap-1 pr-2">
                      <IconButton><Paperclip size={16} /></IconButton>
                      <IconButton><Smile size={16} /></IconButton>
                    </div>
                    <Button
                      size="sm" variant="primary" className="h-10 px-6 font-bold shadow-lg"
                      onClick={handleManualSend}
                      disabled={isSending || !manualReply.trim()}
                    >
                      {isSending ? <Spinner size={14} className="border-white/20 border-t-white" /> : "Send"}
                    </Button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-[13px] text-text-muted">
              Select a ticket to view
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
