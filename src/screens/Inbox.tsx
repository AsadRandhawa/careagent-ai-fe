import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Search, Filter, Sparkles, Send, Edit3, RotateCw,
  AlertTriangle, User, Hash, MoreVertical, Paperclip,
  Smile, Plus, MessageCircle, Globe, Mail,
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
  { id: "website",  label: "Website",  icon: <Globe size={14} />,   accent: "border-teal/50",        bg: "bg-teal/8",        text: "text-teal",        dot: "bg-teal"        },
];

export const Inbox = ({ defaultFilter = "All" }: { defaultFilter?: string }) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const ticketIdParam = searchParams.get("ticketId");

  const {
    documents, businessIdentity, brandVoice,
    tickets, setTickets, isFetchingTickets,
    aiDrafts, setAiDrafts,
    token, takeOverTicket,
  } = useAppStore();

  const [selectedId,   setSelectedId]   = React.useState<string | null>(ticketIdParam || (tickets.length > 0 ? tickets[0].id : null));
  const [activeFilter, setActiveFilter] = React.useState(defaultFilter);
  const [activeChannel, setActiveChannel] = React.useState("All");
  const [isDrafting,   setIsDrafting]   = React.useState(false);
  const [isEditing,    setIsEditing]    = React.useState(false);
  const [manualReply,  setManualReply]  = React.useState("");
  const [isSending,    setIsSending]    = React.useState(false);
  const { toast } = useToast();

  const selectedTicket = tickets.find(t => t.id === selectedId);

  // ── Per-channel escalation counts ────────────────────────────────────────────
  const channelEscCounts = React.useMemo(() => {
    const counts: Record<string, { total: number; escalated: number }> = {
      gmail:    { total: 0, escalated: 0 },
      whatsapp: { total: 0, escalated: 0 },
      facebook: { total: 0, escalated: 0 },
      website:  { total: 0, escalated: 0 },
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
      let contextDocs = "";
      documents.forEach(doc => {
        if (doc.status === "Active" && doc.textContent) {
          contextDocs += `Document [${doc.name}]:\n${doc.textContent}\n\n`;
        }
      });

      const systemPrompt = `You are a customer support AI. Your ONLY job is to reply to real customer support emails using the knowledge base below.

KNOWLEDGE BASE (your only allowed source of information):
${contextDocs || "EMPTY — escalate everything until documents are added."}

BUSINESS: ${businessIdentity}
VOICE: ${brandVoice}
${customInstructions ? "AGENT NOTE: " + customInstructions + "\n" : ""}

STEP 1 — IS THIS A REAL CUSTOMER SUPPORT EMAIL?
Ask yourself: "Is a real human asking for help with a product or service?"
If NO → output escalated immediately. Do not draft anything.

Signs it is NOT a real customer email:
- Sender contains: noreply, no-reply, no_reply, donotreply, notifications, alert, mailer-daemon, testflight, appstoreconnect, accounts.google, email.apple.com, apple.com, googleplay, mail.apple, support.apple, developer.apple
- Content is a system notification, app review update, security alert, account activity, TestFlight build notification, App Store submission update, promotional email, newsletter
- There is no question or request for help from a customer

STEP 2 — CAN THE KNOWLEDGE BASE ANSWER THIS?
Read the knowledge base carefully. If the customer's question is NOT covered by the knowledge base → escalate. Never use outside knowledge. Never guess or make up information.

STEP 3 — IS THE CUSTOMER HIGH RISK?
If the customer is threatening, abusive, claiming fraud, or requesting something not covered → escalate.

STEP 4 — ONLY IF ALL ABOVE PASS: write a reply using ONLY facts from the knowledge base. Sign off as CareAgent Support. No placeholders.

RESPOND ONLY AS JSON — no other text:
{"status":"draft","reason":"","draft":"full reply here"}
OR
{"status":"escalated","reason":"one sentence why","draft":""}`;

      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const response = await fetch(`${apiUrl}/api/ai/draft`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: `Customer Name: ${ticket.customerName}\nMessage: ${ticket.content}` },
          ],
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
  }, [tickets, documents, businessIdentity, brandVoice, toast, token]);

  React.useEffect(() => {
    if (selectedId && !aiDrafts[selectedId]) generateDraft(selectedId);
  }, [selectedId, aiDrafts, generateDraft]);

  React.useEffect(() => {
    if (tickets.length === 0) setSelectedId(null);
  }, [tickets]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Approve & Send AI Draft ───────────────────────────────────────────────
  const handleApprove = React.useCallback(async () => {
    if (!selectedId || !selectedTicket) return;
    const draft = aiDrafts[selectedId];
    if (!draft?.draft) return;
    setIsSending(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const res = await fetch(`${apiUrl}/api/gmail/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({
          to: selectedTicket.email,
          subject: selectedTicket.subject || "Re: Your message",
          body: draft.draft,
          threadId: selectedTicket.threadId,
        }),
      });
      if (!res.ok) throw new Error("Failed to send");
      toast("Reply sent successfully ✓", "success");
      const nextTickets = tickets.filter(t => t.id !== selectedId);
      setTickets(nextTickets);
      setAiDrafts(prev => { const d = { ...prev }; delete d[selectedId]; return d; });
      setIsEditing(false);
      setManualReply("");
      setSelectedId(nextTickets.length > 0 ? nextTickets[0].id : null);
    } catch (err) {
      console.error(err);
      toast("Failed to send reply. Please try again.", "error");
    } finally {
      setIsSending(false);
    }
  }, [selectedId, selectedTicket, aiDrafts, token, toast, setTickets, setAiDrafts]);

  // ── Send Manual Reply ─────────────────────────────────────────────────────
  const handleManualSend = React.useCallback(async () => {
    if (!selectedTicket || !manualReply.trim()) return;
    setIsSending(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const res = await fetch(`${apiUrl}/api/gmail/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({
          to: selectedTicket.email,
          subject: selectedTicket.subject || "Re: Your message",
          body: manualReply,
          threadId: selectedTicket.threadId,
        }),
      });
      if (!res.ok) throw new Error("Failed to send");
      toast("Manual reply sent successfully ✓", "success");
      setManualReply("");
      const nextTickets2 = tickets.filter(t => t.id !== selectedId);
      setTickets(nextTickets2);
      setSelectedId(nextTickets2.length > 0 ? nextTickets2[0].id : null);
    } catch (err) {
      console.error(err);
      toast("Failed to send reply. Please try again.", "error");
    } finally {
      setIsSending(false);
    }
  }, [selectedTicket, manualReply, token, toast, setTickets, selectedId]);

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
      <div className="px-8 pt-6 pb-0 border-b border-border-faint bg-bg-elevated/50 backdrop-blur-md sticky top-0 z-10">
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
                placeholder="Find a conversation..."
                className="w-full bg-bg border border-border-mid rounded-lg h-9 pl-9 pr-3 text-[12px] placeholder:text-text-muted outline-none focus:border-brand/40"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {isFetchingTickets && tickets.length === 0 ? (
              <div className="p-8 text-center text-[13px] text-text-muted">Loading emails...</div>
            ) : filteredTickets.length === 0 ? (
              <div className="p-8 text-center text-[13px] text-text-muted">No active tickets!</div>
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
                  <Badge variant="default" size="xs" className="mb-4">Today, May 14</Badge>
                </div>

                {/* Customer Message */}
                <div className="flex flex-col items-start max-w-[80%]">
                  <div className="flex items-center gap-2 mb-1.5 px-1">
                    <span className="text-[10px] font-bold text-text-second">{selectedTicket.customerName}</span>
                    <span className="text-[10px] font-mono text-text-muted">{selectedTicket.time}</span>
                  </div>
                  <div className="bg-surface border border-border-mid rounded-2xl rounded-bl-sm p-4 text-[13px] text-text-primary leading-relaxed shadow-sm">
                    {selectedTicket.content}
                  </div>
                </div>

                {/* AI Draft Section */}
                <AnimatePresence mode="wait">
                  {isDrafting ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      key="drafting"
                    >
                      <Card variant="glow" className="max-w-[85%] ml-auto border-brand/20 bg-brand-faint/5">
                        <div className="flex items-center gap-3 text-brand">
                          <Spinner size={16} className="border-brand/20 border-t-brand" />
                          <span className="text-[12px] font-bold uppercase tracking-widest">AI is analyzing context...</span>
                        </div>
                      </Card>
                    </motion.div>
                  ) : (
                    aiDrafts[selectedTicket.id] && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        key="ready"
                      >
                        {aiDrafts[selectedTicket.id].status === "escalated" ? (
                          <div className="flex flex-col items-end max-w-[85%] ml-auto">
                            <div className="flex items-center gap-2 mb-1.5 px-1">
                              <AlertTriangle size={10} className="text-danger" />
                              <span className="text-[10px] font-bold text-danger uppercase tracking-wider">AI Escalation</span>
                            </div>
                            <div className="w-full bg-danger-faint border border-danger/20 rounded-2xl rounded-br-sm overflow-hidden shadow-sm">
                              <div className="p-5">
                                <h4 className="text-[13px] font-bold text-danger mb-2">Ticket requires human attention</h4>
                                <p className="text-[13px] text-danger/90 leading-relaxed">
                                  {aiDrafts[selectedTicket.id].reason}
                                </p>
                              </div>
                              <div className="bg-danger/5 p-3 border-t border-danger/10 flex items-center justify-end">
                                <Button size="sm" variant="ghost" className="text-danger hover:bg-danger/10" onClick={async () => {
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
                                        reason: aiDrafts[selectedTicket.id]?.reason || "Manually escalated by agent",
                                      }),
                                    });
                                  } catch (e) { console.error("Failed to persist escalation:", e); }
                                  navigate("/escalations");
                                }}>Take Over Ticket</Button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col items-end max-w-[85%] ml-auto">
                            <div className="flex items-center gap-2 mb-1.5 px-1">
                              <Sparkles size={10} className="text-brand" />
                              <span className="text-[10px] font-bold text-brand uppercase tracking-wider">AI Generated Draft</span>
                              <Badge variant="brand" size="xs" className="font-mono bg-brand/5 border-brand/10">98% CONFIDENCE</Badge>
                            </div>
                            <div className="w-full bg-gradient-to-br from-brand-faint to-surface border border-brand/20 rounded-2xl rounded-br-sm overflow-hidden shadow-glow">
                              <div className="p-5">
                                {isEditing ? (
                                  <textarea
                                    className="w-full bg-bg/50 border border-brand/20 rounded-lg p-3 text-[13px] text-text-primary h-48 focus:ring-1 focus:ring-brand outline-none"
                                    value={aiDrafts[selectedTicket.id].draft}
                                    onChange={e => setAiDrafts({ ...aiDrafts, [selectedTicket.id]: { ...aiDrafts[selectedTicket.id], draft: e.target.value } })}
                                  />
                                ) : (
                                  <p className="text-[13px] text-text-primary leading-relaxed whitespace-pre-wrap">
                                    {aiDrafts[selectedTicket.id].draft}
                                  </p>
                                )}
                              </div>
                              <div className="bg-brand-faint/50 p-3 border-t border-brand/10 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  {isEditing ? (
                                    <Button size="sm" variant="primary" onClick={() => setIsEditing(false)}>Done Editing</Button>
                                  ) : (
                                    <>
                                      <Button
                                        size="sm" variant="primary"
                                        icon={isSending ? <Spinner size={14} className="border-white/20 border-t-white" /> : <Send size={14} />}
                                        onClick={handleApprove}
                                        disabled={isSending}
                                      >
                                        {isSending ? "Sending..." : "Approve & Send"}
                                      </Button>
                                      <Button size="sm" variant="ghost" className="bg-surface/50 border-border-mid" icon={<Edit3 size={14} />} onClick={() => setIsEditing(true)}>
                                        Edit
                                      </Button>
                                    </>
                                  )}
                                </div>
                                <div className="flex items-center gap-2">
                                  <IconButton className="bg-surface/50 border-border-mid" onClick={handleRegenerate}>
                                    <RotateCw size={14} />
                                  </IconButton>
                                  <IconButton className="bg-danger-faint border-danger/10 text-danger hover:bg-danger/20">
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
                    )
                  )}
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
