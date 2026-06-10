import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, Filter, Sparkles, Send, Edit3, RotateCw, AlertTriangle, User, Hash, MoreVertical, Paperclip, Smile, Plus } from "lucide-react";
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

export const Inbox = ({ defaultFilter = "All" }: { defaultFilter?: string }) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const ticketIdParam = searchParams.get("ticketId");
  
  const { documents, businessIdentity, brandVoice, tickets, setTickets, isFetchingTickets, aiDrafts, setAiDrafts, token } = useAppStore();
  const [selectedId, setSelectedId] = React.useState<string | null>(ticketIdParam || (tickets.length > 0 ? tickets[0].id : null));
  const [activeFilter, setActiveFilter] = React.useState(defaultFilter);
  const [isDrafting, setIsDrafting] = React.useState(false);
  const [isEditing, setIsEditing] = React.useState(false);
  const [manualReply, setManualReply] = React.useState("");
  const [isSending, setIsSending] = React.useState(false);
  const { toast } = useToast();

  const selectedTicket = tickets.find(t => t.id === selectedId);

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

      const systemPrompt = `You are an expert customer support agent for the following business:
Business Identity: ${businessIdentity}

Your brand voice should be:
${brandVoice}

CRITICAL RULE — AUTOMATED & IRRELEVANT EMAILS:
Before anything else, check if this email is:
- An automated system notification (App Store Connect, Google, GitHub, noreply@, no-reply@, notifications@, alerts@, donotreply@)
- A marketing or promotional email
- A newsletter or subscription notification
- An internal system alert
- An email where the sender is clearly NOT a real customer asking for support

If ANY of the above apply, you MUST set status to "escalated" with reason "Automated or non-customer email — no reply needed."
DO NOT draft a reply for automated notifications. This is the most important rule.

INSTRUCTIONS FOR REAL CUSTOMER EMAILS:
1. Analyze the customer's message carefully.
2. ONLY use information from the provided Context Documents to answer. Do NOT make up policies, prices, or procedures not mentioned in the documents.
3. If the customer is highly angry, threatening, asking for refunds/high-risk actions, or reporting fraud — escalate.
4. If the question cannot be answered confidently from the provided documents — escalate with reason explaining what's missing.
5. Otherwise, write a complete, ready-to-send email reply using ONLY facts from the Context Documents.
- Do NOT use placeholders like [Your Name] — sign off as CareAgent Support.
- Keep it concise and perfectly formatted.
- Never invent information not present in the documents.

${customInstructions ? "SPECIAL INSTRUCTION FROM AGENT:\n" + customInstructions + "\n" : ""}

Context Documents:
${contextDocs || "No documents uploaded yet. Escalate all tickets until documents are added."}

You MUST return your response as a JSON object matching this schema:
{
  "status": "draft" | "escalated",
  "reason": "If escalated, briefly explain why in 1 sentence. Otherwise empty string.",
  "draft": "The email draft if status is draft. Otherwise empty string."
}`;

      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const response = await fetch(`${apiUrl}/api/ai/draft`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: `Customer Name: ${ticket.customerName}\nMessage: ${ticket.content}` }
          ]
        })
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
    if (selectedId && !aiDrafts[selectedId]) {
      generateDraft(selectedId);
    }
  }, [selectedId, aiDrafts, generateDraft]);

  React.useEffect(() => {
    if (tickets.length === 0) {
      setSelectedId(null);
    }
  }, [tickets]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Approve & Send AI Draft ──────────────────────────────
  const handleApprove = React.useCallback(async () => {
    if (!selectedId || !selectedTicket) return;
    const draft = aiDrafts[selectedId];
    if (!draft?.draft) return;

    setIsSending(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const res = await fetch(`${apiUrl}/api/gmail/reply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          to: selectedTicket.email,
          subject: selectedTicket.subject || "Re: Your message",
          body: draft.draft,
          threadId: selectedTicket.threadId
        })
      });

      if (!res.ok) throw new Error("Failed to send");

      toast("Reply sent successfully ✓", "success");
      const nextTickets = tickets.filter(t => t.id !== selectedId);
      setTickets(nextTickets);
      setAiDrafts(prev => {
        const newDrafts = { ...prev };
        delete newDrafts[selectedId];
        return newDrafts;
      });
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

  // ── Send Manual Reply ────────────────────────────────────
  const handleManualSend = React.useCallback(async () => {
    if (!selectedTicket || !manualReply.trim()) return;

    setIsSending(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const res = await fetch(`${apiUrl}/api/gmail/reply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          to: selectedTicket.email,
          subject: selectedTicket.subject || "Re: Your message",
          body: manualReply,
          threadId: selectedTicket.threadId
        })
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
    if (activeFilter === "All") return true;
    if (activeFilter === "New") return ticket.status === "new";
    if (activeFilter === "Pending") return ticket.status === "pending";
    if (activeFilter === "Escalated") return ticket.status === "escalated" || aiDrafts[ticket.id]?.status === "escalated";
    if (activeFilter === "Draft Ready") return ticket.hasDraft;
    return true;
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

      if (e.key === 'j' || e.key === 'J') {
        const currentIndex = filteredTickets.findIndex(t => t.id === selectedId);
        if (currentIndex < filteredTickets.length - 1) setSelectedId(filteredTickets[currentIndex + 1].id);
      } else if (e.key === 'k' || e.key === 'K') {
        const currentIndex = filteredTickets.findIndex(t => t.id === selectedId);
        if (currentIndex > 0) setSelectedId(filteredTickets[currentIndex - 1].id);
      } else if ((e.key === 'a' || e.key === 'A') && aiDrafts[selectedId || '']?.status !== 'escalated') {
        handleApprove();
      } else if ((e.key === 'e' || e.key === 'E') && aiDrafts[selectedId || '']?.status !== 'escalated') {
        setIsEditing(true);
        e.preventDefault();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [filteredTickets, selectedId, handleApprove, aiDrafts]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col h-full bg-bg"
    >
      {/* Header with Filters */}
      <div className="px-8 pt-6 pb-4 border-b border-border-faint bg-bg-elevated/50 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center justify-between mb-4">
          <SectionHeader title="Active Inbox" className="mb-0" />
          <div className="flex items-center gap-2">
            <IconButton><Filter size={16} /></IconButton>
            <Button size="sm" variant="primary" icon={<Plus size={14} />}>New Ticket</Button>
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          {["All", "New", "Pending", "Escalated", "Draft Ready"].map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={cn(
                "px-3 py-1.5 rounded-full text-[12px] font-medium transition-all",
                activeFilter === filter 
                  ? "bg-surface-high text-text-primary" 
                  : "text-text-muted hover:text-text-second"
              )}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Main 2-Panel Split */}
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
              filteredTickets.map((ticket) => (
                <TicketRow 
                  key={ticket.id} 
                  {...ticket} 
                  selected={ticket.id === selectedId}
                  onClick={() => setSelectedId(ticket.id)}
                  avatarVariant={ticket.avatarVariant as any}
                />
              ))
            )}
          </div>
        </div>

        {/* Right Panel: Conversation Details */}
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
                                 <Button size="sm" variant="ghost" className="text-danger hover:bg-danger/10" onClick={() => navigate("/escalations")}>Take Over Ticket</Button>
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
                                    onChange={(e) => setAiDrafts({ ...aiDrafts, [selectedTicket.id]: { ...aiDrafts[selectedTicket.id], draft: e.target.value } })}
                                  />
                                ) : (
                                  <p className="text-[13px] text-text-primary leading-relaxed whitespace-pre-wrap">
                                    {aiDrafts[selectedTicket.id].draft}
                                  </p>
                                )}
                              </div>

                              {/* Action Bar */}
                              <div className="bg-brand-faint/50 p-3 border-t border-brand/10 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                   {isEditing ? (
                                     <Button size="sm" variant="primary" onClick={() => setIsEditing(false)}>Done Editing</Button>
                                   ) : (
                                     <>
                                       <Button 
                                        size="sm" 
                                        variant="primary" 
                                        icon={isSending ? <Spinner size={14} className="border-white/20 border-t-white" /> : <Send size={14} />}
                                        onClick={handleApprove}
                                        disabled={isSending}
                                      >
                                        {isSending ? "Sending..." : "Approve & Send"}
                                      </Button>
                                      <Button 
                                        size="sm" 
                                        variant="ghost" 
                                        className="bg-surface/50 border-border-mid" 
                                        icon={<Edit3 size={14} />}
                                        onClick={() => setIsEditing(true)}
                                      >
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
                      onChange={(e) => setManualReply(e.target.value)}
                      onKeyDown={(e) => {
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
                      size="sm" 
                      variant="primary" 
                      className="h-10 px-6 font-bold shadow-lg"
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
