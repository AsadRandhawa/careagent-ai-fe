import * as React from "react";
import { motion } from "motion/react";
import { SectionHeader } from "../components/SectionHeader";
import { MetricCard } from "../components/MetricCard";
import { Card } from "../components/Card";
import { StatRow } from "../components/StatRow";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Avatar } from "../components/ui/Avatar";
import { ProgressBar } from "../components/ui/ProgressBar";
import { AlertTriangle, ShieldCheck, Activity, UserCheck, MessageCircleWarning, X, Eye, Zap } from "lucide-react";
import { useAppStore } from "../store";
import { cn } from "@/src/lib/utils";
import { useNavigate } from "react-router-dom";

// Derive a risk score from ticket content/reason
const getRiskScore = (ticket: any, reason: string): number => {
  let score = 60; // base score for any escalation
  const text = (reason + " " + (ticket.subject || "") + " " + (ticket.content || "")).toLowerCase();
  if (text.includes("refund") || text.includes("money")) score += 15;
  if (text.includes("urgent") || text.includes("immediately")) score += 10;
  if (text.includes("legal") || text.includes("lawyer") || text.includes("sue")) score += 20;
  if (text.includes("angry") || text.includes("furious") || text.includes("terrible")) score += 10;
  if (text.includes("cancel") || text.includes("unsubscribe")) score += 8;
  if (text.includes("fraud") || text.includes("scam") || text.includes("fake")) score += 15;
  return Math.min(score, 99);
};

export const Escalations = () => {
  const navigate = useNavigate();
  const { tickets, aiDrafts, isFetchingTickets, takeOverTicket, setTickets, setAiDrafts } = useAppStore();

  const escalatedTickets = tickets.filter(
    ticket => ticket.status === "escalated" || (aiDrafts && aiDrafts[ticket.id]?.status === "escalated")
  );

  const highRiskCount = escalatedTickets.filter(t => {
    const reason = aiDrafts[t.id]?.reason || "";
    return getRiskScore(t, reason) >= 75;
  }).length;

  // Derive detection signals from actual escalated tickets
  const sentimentVolatility = escalatedTickets.length > 3 ? "High" : escalatedTickets.length > 1 ? "Medium" : "Low";
  const sentimentColor = sentimentVolatility === "High" ? "text-danger" : sentimentVolatility === "Medium" ? "text-warn" : "text-success";
  const refundCount = escalatedTickets.filter(t =>
    ((aiDrafts[t.id]?.reason || "") + (t.subject || "") + (t.content || "")).toLowerCase().includes("refund")
  ).length;
  const refundLikelihood = escalatedTickets.length > 0 ? Math.round((refundCount / escalatedTickets.length) * 100) : 0;

  const handleDismiss = (ticketId: string) => {
    // Move back to inbox as normal ticket
    setTickets((prev: any[]) => prev.map(t => t.id === ticketId ? { ...t, status: "new" } : t));
    setAiDrafts((prev: any) => {
      const d = { ...prev };
      if (d[ticketId]) d[ticketId] = { ...d[ticketId], status: "draft" };
      return d;
    });
  };

  const handleReviewLogs = (ticketId: string) => {
    navigate(`/inbox?ticket=${ticketId}`);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.99 }}
      animate={{ opacity: 1, scale: 1 }}
      className="p-8 max-w-[1400px] mx-auto"
    >
      <SectionHeader 
        title="Escalations Queue" 
        subtitle="High-risk conversations requiring human intervention."
      />

      <div className="grid grid-cols-3 gap-6 mb-8">
        <MetricCard label="Active Escalations" value={escalatedTickets.length} icon={<AlertTriangle size={16} className="text-danger" />} />
        <MetricCard label="High Risk" value={highRiskCount} icon={<Activity size={16} className="text-warn" />} />
        <MetricCard label="Avg Risk Score" value={escalatedTickets.length > 0 ? Math.round(escalatedTickets.reduce((sum, t) => sum + getRiskScore(t, aiDrafts[t.id]?.reason || ""), 0) / escalatedTickets.length) + "%" : "N/A"} icon={<ShieldCheck size={16} className="text-success" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {isFetchingTickets && escalatedTickets.length === 0 ? (
            <div className="p-8 text-center text-text-muted">Loading escalations...</div>
          ) : escalatedTickets.length === 0 ? (
            <div className="p-8 text-center text-text-muted">No active escalations!</div>
          ) : escalatedTickets.map((ticket) => {
            const draftInfo = aiDrafts[ticket.id];
            const reason = draftInfo?.reason || "Flagged for manual review";
            const score = getRiskScore(ticket, reason);

            return (
              <Card key={ticket.id} className="relative ring-1 ring-danger/10">
                <div className="flex items-start gap-6">
                  <Avatar initials={ticket.initials} size={38} variant="danger" isEscalated />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-[15px] font-bold text-text-primary">{ticket.customerName}</h3>
                      <Badge variant={score >= 80 ? "danger" : "warn"} size="sm">
                        {score >= 80 ? "Critical" : "Urgent"}
                      </Badge>
                    </div>
                    
                    <div className="mb-4">
                      <div className="flex justify-between items-end mb-2">
                        <span className="text-[11px] font-bold text-text-muted uppercase">Risk Score</span>
                        <span className="text-[13px] font-mono font-bold text-danger">{score}/100</span>
                      </div>
                      <ProgressBar value={score} color="bg-danger" />
                    </div>

                    <div className="bg-bg-elevated p-3 rounded-lg border border-border-faint mb-4">
                      <div className="flex items-start gap-3">
                        <MessageCircleWarning size={14} className="text-danger mt-0.5" />
                        <p className="text-[12px] text-text-second">{reason}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button variant="danger" size="sm" onClick={() => takeOverTicket(ticket.id)}>
                        <UserCheck size={13} className="mr-1" /> Take Over
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDismiss(ticket.id)}>
                        <X size={13} className="mr-1" /> Dismiss Flag
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleReviewLogs(ticket.id)}>
                        <Eye size={13} className="mr-1" /> Review in Inbox
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        <div className="space-y-6">
          <Card>
            <h3 className="text-[12px] font-bold text-text-muted uppercase tracking-widest mb-4">Actions Required</h3>
            <div className="space-y-4">
              {escalatedTickets.length > 0 ? (
                <>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-danger-faint border border-danger/10">
                    <span className="text-[12px] font-medium text-text-primary">Needs Immediate Response</span>
                    <Badge variant="danger" size="xs">{escalatedTickets.filter(t => getRiskScore(t, aiDrafts[t.id]?.reason||"") >= 80).length} tickets</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-warn-faint border border-border-faint">
                    <span className="text-[12px] font-medium text-text-primary">Review Pending</span>
                    <Badge variant="warn" size="xs">{escalatedTickets.filter(t => getRiskScore(t, aiDrafts[t.id]?.reason||"") < 80).length} tickets</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-surface border border-border-faint">
                    <span className="text-[12px] font-medium text-text-primary">Refund Requests</span>
                    <Badge variant="default" size="xs">{refundCount} tickets</Badge>
                  </div>
                </>
              ) : (
                <p className="text-[12px] text-text-muted text-center py-4">No actions needed</p>
              )}
            </div>
          </Card>

          <Card>
            <h3 className="text-[12px] font-bold text-text-muted uppercase tracking-widest mb-4">Detection Signals</h3>
            {escalatedTickets.length > 0 ? (
              <div className="space-y-1">
                <StatRow label="Sentiment Volatility" value={sentimentVolatility} valueColor={sentimentColor} />
                <StatRow label="Active Escalations" value={String(escalatedTickets.length)} />
                <StatRow label="High Risk Tickets" value={String(highRiskCount)} />
                <StatRow label="Refund Likelihood" value={refundLikelihood + "%"} valueColor={refundLikelihood > 50 ? "text-warn" : "text-text-primary"} />
              </div>
            ) : (
              <p className="text-[12px] text-text-muted text-center py-4">No signals detected</p>
            )}
          </Card>
        </div>
      </div>
    </motion.div>
  );
};
