import * as React from "react";
import { motion } from "motion/react";
import { SectionHeader } from "../components/SectionHeader";
import { MetricCard } from "../components/MetricCard";
import { Card } from "../components/Card";
import { StatRow } from "../components/StatRow";
import { MiniBarChart } from "../components/MiniBarChart";
import { TicketRow } from "../components/TicketRow";
import { ProgressBar } from "../components/ui/ProgressBar";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Modal } from "../components/ui/Modal";
import { RefreshCw, Download, Inbox, Sparkles, Clock, Star, Zap, Activity, CreditCard, ArrowRight, MessageSquare, Instagram, Globe } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../components/ToastProvider";
import { useAppStore } from "../store";

const todayLabel = () =>
  new Date().toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

const formatTimeWaiting = (dateStr?: string | Date) => {
  if (!dateStr) return "—";
  const ms = Date.now() - new Date(dateStr).getTime();
  if (isNaN(ms) || ms < 0) return "just now";
  const mins = Math.floor(ms / (1000 * 60));
  if (mins < 60) return `${mins}m waiting`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h waiting`;
  const days = Math.floor(hrs / 24);
  return `${days}d waiting`;
};

export const Dashboard = () => {
  const navigate    = useNavigate();
  const { toast }   = useToast();
  const {
    tickets, isFetchingTickets, fetchTickets,
    ticketStats, isFetchingStats, fetchTicketStats,
    syncTickets, token,
  } = useAppStore();

  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [currentPlan, setCurrentPlan] = React.useState<string>("startup");
  const [activeMetricModal, setActiveMetricModal] = React.useState<"open" | "resolution" | "escalation" | null>(null);
  const [metricDetails, setMetricDetails] = React.useState<any>(null);
  const [isLoadingDetails, setIsLoadingDetails] = React.useState(false);

  const openMetricModal = async (metric: "open" | "resolution" | "escalation") => {
    setActiveMetricModal(metric);
    setIsLoadingDetails(true);
    setMetricDetails(null);
    try {
      const apiUrl = (import.meta.env.VITE_API_URL || "https://careagent-ai-be-production.up.railway.app").replace(/\/+$/, "");
      const res = await fetch(`${apiUrl}/api/tickets/stats/details?metric=${metric}&days=30`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setMetricDetails(data);
      }
    } catch (err) {
      console.error("Failed to fetch metric details:", err);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  React.useEffect(() => {
    if (!token) return;
    const apiUrl = (import.meta.env.VITE_API_URL || 'https://careagent-ai-be-production.up.railway.app').replace(/\/+$/, '');
    fetch(`${apiUrl}/api/stripe/plan`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => { if (d.plan) setCurrentPlan(d.plan); })
      .catch(() => {});
  }, [token]);

  // Auto-sync + fetch stats on mount
  React.useEffect(() => {
    if (!token) return;
    const init = async () => {
      await syncTickets();
      await Promise.all([fetchTickets(), fetchTicketStats(30)]);
    };
    init();

    // Auto-refresh every 5 minutes
    const interval = setInterval(init, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await syncTickets();
    await Promise.all([fetchTickets(), fetchTicketStats(30)]);
    setIsRefreshing(false);
    toast("Dashboard metrics updated", "success");
  };

  const handleExportCSV = () => {
    if (!tickets.length) { toast("No tickets to export", "error"); return; }
    const headers = ["ID", "Customer", "Email", "Subject", "Status", "Time"];
    const rows    = tickets.map(t =>
      [t.id, t.customerName, t.email || "", t.subject || "", t.status, t.time].join(",")
    );
    const csv  = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `careagent-report-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast("Weekly report downloaded", "success");
  };

  const stats = ticketStats;

  // Build 7-day volume from live tickets
  const miniBarData = React.useMemo(() => {
    const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    const today = new Date();
    const counts: Record<string, number> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      counts[days[d.getDay()]] = 0;
    }
    tickets.forEach(t => {
      if (!t.createdAt) return;
      const d = new Date(t.createdAt);
      const daysSince = Math.floor((today.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
      if (daysSince <= 6) {
        const label = days[d.getDay()];
        counts[label] = (counts[label] || 0) + 1;
      }
    });
    const todayLabel = days[today.getDay()];
    return Object.entries(counts).map(([label, value]) => ({ label, value, highlight: label === todayLabel }));
  }, [tickets]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="p-8 max-w-[1400px] mx-auto"
    >
      <SectionHeader
        title="Operations overview"
        subtitle={todayLabel()}
        actions={
          <>
            <Button
              size="sm"
              variant="ghost"
              icon={<RefreshCw size={14} className={isRefreshing ? "animate-spin" : ""} />}
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              {isRefreshing ? "Refreshing..." : "Refresh"}
            </Button>
            <Button size="sm" variant="ghost" icon={<Download size={14} />} onClick={handleExportCSV}>
              Export
            </Button>
          </>
        }
      />

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <MetricCard
          label="Open Tickets"
          value={stats?.openTickets ?? 0}
          subtext={stats?.escalated ? `${stats.escalated} escalated` : "All clear"}
          delta={{ value: "live", type: "increase" }}
          icon={<Inbox size={16} />}
          loading={isFetchingStats && !stats}
          onClick={() => openMetricModal("open")}
        />
        <MetricCard
          label="Avg Resolution Time"
          value={stats?.avgResolutionTime ?? "N/A"}
          subtext="This month"
          icon={<Clock size={16} />}
          loading={isFetchingStats && !stats}
          onClick={() => openMetricModal("resolution")}
        />
        <MetricCard
          label="Escalation Rate"
          value={stats?.escalationRate ?? "0.0%"}
          subtext="Last 30 days"
          icon={<Star size={16} className="text-warn" />}
          loading={isFetchingStats && !stats}
          onClick={() => openMetricModal("escalation")}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-8">
          <Card variant="noPad">
            <div className="p-5 border-b border-border-faint flex items-center justify-between">
              <h3 className="text-[13px] font-bold uppercase tracking-widest text-text-muted">Recent Tickets</h3>
              <Button size="xs" variant="ghost" onClick={() => navigate("/inbox")}>View all</Button>
            </div>
            <div className="divide-y divide-border-faint">
              {isFetchingTickets && tickets.length === 0 ? (
                <div className="p-5 text-center text-text-muted text-sm">Loading tickets...</div>
              ) : tickets.length === 0 ? (
                <div className="p-5 text-center text-text-muted text-sm">No tickets yet. Connect Gmail to get started.</div>
              ) : (
                tickets.slice(0, 4).map((ticket) => (
                  <TicketRow
                    key={ticket.id}
                    {...ticket}
                    avatarVariant={ticket.avatarVariant as any}
                    onClick={() => navigate(`/inbox?ticketId=${ticket.id}`)}
                    className="cursor-pointer hover:bg-bg-elevated/50 transition-colors"
                  />
                ))
              )}
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[13px] font-bold uppercase tracking-widest text-text-muted">AI Performance</h3>
              <Zap size={16} className="text-brand" />
            </div>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-end mb-2">
                  <span className="text-[12px] text-text-second">Tickets with AI Draft</span>
                  <span className="text-[12px] font-mono text-success">
                    {tickets.length > 0 ? "100%" : "0%"}
                  </span>
                </div>
                <ProgressBar value={tickets.length > 0 ? 100 : 0} color="bg-success" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <StatRow label="Open Tickets"     value={String(stats?.openTickets ?? 0)} />
                <StatRow label="Resolved (30d)"   value={String(stats?.resolvedThisPeriod ?? 0)} />
                <StatRow label="Escalated"         value={String(stats?.escalated ?? 0)} />
                <StatRow label="Escalation Rate"   value={stats?.escalationRate ?? "0.0%"} valueColor="text-warn" />
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-8">
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[13px] font-bold uppercase tracking-widest text-text-muted">Sentiment Today</h3>
              <Activity size={16} className="text-text-muted" />
            </div>
            {isFetchingStats ? (
              <div className="text-center text-text-muted text-sm py-4">Loading...</div>
            ) : stats?.sentimentPct ? (
              <div className="space-y-5">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-[11px] text-success font-bold uppercase">Positive</span>
                    <span className="text-[11px] font-mono text-text-muted">{stats.sentimentPct.positive}%</span>
                  </div>
                  <ProgressBar value={stats.sentimentPct.positive} color="bg-success" />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-[11px] text-warn font-bold uppercase">Neutral</span>
                    <span className="text-[11px] font-mono text-text-muted">{stats.sentimentPct.neutral}%</span>
                  </div>
                  <ProgressBar value={stats.sentimentPct.neutral} color="bg-warn" />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-[11px] text-danger font-bold uppercase">Frustrated</span>
                    <span className="text-[11px] font-mono text-text-muted">{stats.sentimentPct.frustrated}%</span>
                  </div>
                  <ProgressBar value={stats.sentimentPct.frustrated} color="bg-danger" />
                </div>
              </div>
            ) : (
              <div className="text-center text-text-muted text-sm py-4">No sentiment data yet.</div>
            )}
          </Card>

          <Card>
            <h3 className="text-[13px] font-bold uppercase tracking-widest text-text-muted mb-6">Ticket volume (7d)</h3>
            <MiniBarChart data={miniBarData} />
          </Card>

          <Card>
            <h3 className="text-[13px] font-bold uppercase tracking-widest text-text-muted mb-4">Quick actions</h3>
            <div className="space-y-2">
              {/* Upgrade prompt for startup/starter users */}
              {(currentPlan === "startup" || currentPlan === "starter") && (
                <div className="rounded-xl bg-brand/8 border border-brand/20 p-3 mb-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles size={12} className="text-brand" />
                    <span className="text-[11px] font-black text-brand uppercase tracking-wide">Upgrade to Growth</span>
                  </div>
                  <p className="text-[10px] text-text-muted mb-2 leading-relaxed">Get 6,000 AI replies a month, all 4 channels, and parallel agents.</p>
                  <Button variant="brand" size="sm" className="w-full shadow-glow text-[11px]" onClick={() => navigate("/billing")}>
                    View Plans <ArrowRight size={11} className="ml-1" />
                  </Button>
                </div>
              )}
              <Button
                className="w-full justify-start py-2"
                variant="surface"
                size="sm"
                onClick={() => navigate("/knowledge-base")}
              >
                Update Knowledge Base
              </Button>
              <Button
                className="w-full justify-start py-2"
                variant="surface"
                size="sm"
                onClick={() => navigate("/escalations")}
              >
                View All Escalations
              </Button>
              <Button
                className="w-full justify-start py-2"
                variant="surface"
                size="sm"
                onClick={handleExportCSV}
              >
                Export Weekly Report
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* ── Metric Details Modal ────────────────────────────────────── */}
      <Modal
        isOpen={activeMetricModal !== null}
        onClose={() => setActiveMetricModal(null)}
        title={
          activeMetricModal === "open"
            ? "Open Tickets"
            : activeMetricModal === "resolution"
            ? "Average Resolution Time"
            : "Escalation Rate Details"
        }
        description={
          activeMetricModal === "open"
            ? `${metricDetails?.count ?? stats?.openTickets ?? 0} open tickets waiting for reply (oldest first)`
            : activeMetricModal === "resolution"
            ? `Based on ${metricDetails?.count ?? stats?.resolvedThisPeriod ?? 0} tickets resolved in the last 30 days`
            : `Last 30 days: ${metricDetails?.ratioText || "0 of 0"} decided tickets escalated`
        }
        maxWidth="max-w-2xl"
      >
        {isLoadingDetails ? (
          <div className="text-center text-text-muted text-sm py-12 flex flex-col items-center gap-2">
            <RefreshCw size={18} className="animate-spin text-brand" />
            <span>Loading metric details...</span>
          </div>
        ) : (
          <div>
            {activeMetricModal === "open" && (
              <div>
                {metricDetails?.items && metricDetails.items.length > 0 ? (
                  <div className="divide-y divide-border-faint border border-border-faint rounded-xl overflow-hidden bg-surface-high/20 max-h-[420px] overflow-y-auto">
                    {metricDetails.items.map((item: any) => (
                      <div
                        key={item.id}
                        onClick={() => {
                          setActiveMetricModal(null);
                          navigate(`/inbox?ticketId=${item.id}`);
                        }}
                        className="p-3.5 flex items-center justify-between hover:bg-surface-high cursor-pointer transition-colors gap-3"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-surface flex items-center justify-center text-text-muted border border-border-faint flex-shrink-0">
                            {item.channel === "whatsapp" && <MessageSquare size={14} className="text-success" />}
                            {item.channel === "facebook" && <MessageSquare size={14} className="text-brand" />}
                            {item.channel === "instagram" && <Instagram size={14} className="text-danger" />}
                            {item.channel === "livechat" && <Globe size={14} className="text-teal" />}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-[13px] font-semibold text-text-primary truncate">{item.customerName || "Customer"}</span>
                              <Badge variant="default" size="xs">New</Badge>
                              {item.urgency && item.urgency !== "normal" && (
                                <Badge variant={item.urgency === "high" ? "danger" : item.urgency === "medium" ? "warn" : "default"} size="xs">
                                  {item.urgency}
                                </Badge>
                              )}
                            </div>
                            <p className="text-[11px] text-text-muted truncate capitalize">
                              {item.channel} {item.subject ? `• ${item.subject}` : ""}
                            </p>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0 text-[11px] text-text-muted font-mono">
                          {formatTimeWaiting(item.receivedAt)}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-text-muted text-sm py-8">No open tickets right now.</div>
                )}
              </div>
            )}

            {activeMetricModal === "resolution" && (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 bg-surface-high/30 border border-border-faint rounded-xl">
                    <div className="text-[11px] text-text-muted font-medium">Overall Average</div>
                    <div className="text-xl font-bold text-text-primary mt-1">{metricDetails?.avgResolutionTime || "—"}</div>
                  </div>
                  <div className="p-3 bg-surface-high/30 border border-border-faint rounded-xl">
                    <div className="text-[11px] text-text-muted font-medium">Resolved Sample</div>
                    <div className="text-xl font-bold text-text-primary mt-1">{metricDetails?.count || 0}</div>
                  </div>
                  <div className="p-3 bg-surface-high/30 border border-border-faint rounded-xl">
                    <div className="text-[11px] text-text-muted font-medium">Period</div>
                    <div className="text-xl font-bold text-text-primary mt-1">30 days</div>
                  </div>
                </div>

                <div className="p-3 bg-surface-high/50 border border-border-faint rounded-xl text-xs text-text-muted">
                  💡 <strong>Calculation:</strong> {metricDetails?.calculationExplanation || "Counted from when the message arrived to when the ticket was resolved."}
                </div>

                {metricDetails?.channelAverages && metricDetails.channelAverages.length > 0 && (
                  <div>
                    <h4 className="text-[11px] font-bold text-text-muted uppercase tracking-wider mb-2">Average by Channel</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {metricDetails.channelAverages.map((ch: any) => (
                        <div key={ch.channel} className="p-2.5 bg-surface-high/30 border border-border-faint rounded-lg">
                          <div className="text-[11px] text-text-muted capitalize">{ch.channel}</div>
                          <div className="text-sm font-bold text-text-primary">{ch.avgResolutionTime}</div>
                          <div className="text-[10px] text-text-muted">{ch.count} tickets</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <h4 className="text-[11px] font-bold text-text-muted uppercase tracking-wider mb-2">10 Slowest Resolved Tickets</h4>
                  {metricDetails?.slowestTickets && metricDetails.slowestTickets.length > 0 ? (
                    <div className="divide-y divide-border-faint border border-border-faint rounded-xl overflow-hidden bg-surface-high/20 max-h-[220px] overflow-y-auto">
                      {metricDetails.slowestTickets.map((t: any) => (
                        <div
                          key={t.id}
                          onClick={() => { setActiveMetricModal(null); navigate(`/inbox?ticketId=${t.id}`); }}
                          className="p-2.5 flex items-center justify-between hover:bg-surface-high cursor-pointer transition-colors"
                        >
                          <div>
                            <div className="text-[12px] font-medium text-text-primary">{t.customerName || "Customer"}</div>
                            <div className="text-[10px] text-text-muted capitalize">{t.channel} • {new Date(t.resolvedAt).toLocaleDateString()}</div>
                          </div>
                          <Badge variant="warn" size="xs">{t.durationFormatted}</Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-text-muted text-xs py-4">No resolved tickets in this period.</div>
                  )}
                </div>
              </div>
            )}

            {activeMetricModal === "escalation" && (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 bg-surface-high/30 border border-border-faint rounded-xl">
                    <div className="text-[11px] text-text-muted font-medium">Escalated / Total</div>
                    <div className="text-xl font-bold text-text-primary mt-1">{metricDetails?.ratioText || "0 of 0"}</div>
                  </div>
                  <div className="p-3 bg-surface-high/30 border border-border-faint rounded-xl">
                    <div className="text-[11px] text-text-muted font-medium">Escalation Rate</div>
                    <div className="text-xl font-bold text-warn mt-1">{metricDetails?.escalationRate ?? stats?.escalationRate ?? "0.0%"}</div>
                  </div>
                  <div className="p-3 bg-surface-high/30 border border-border-faint rounded-xl">
                    <div className="text-[11px] text-text-muted font-medium">Period</div>
                    <div className="text-xl font-bold text-text-primary mt-1">30 days</div>
                  </div>
                </div>

                {metricDetails?.channelCounts && Object.keys(metricDetails.channelCounts).length > 0 && (
                  <div>
                    <h4 className="text-[11px] font-bold text-text-muted uppercase tracking-wider mb-2">Escalations by Channel</h4>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(metricDetails.channelCounts).map(([ch, count]: [string, any]) => (
                        <div key={ch} className="px-2.5 py-1 bg-surface-high border border-border-faint rounded-lg flex items-center gap-1.5 text-xs">
                          <span className="capitalize text-text-muted">{ch}:</span>
                          <span className="font-bold text-warn">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <h4 className="text-[11px] font-bold text-text-muted uppercase tracking-wider mb-2">Escalated Tickets (Up to 50)</h4>
                  {metricDetails?.items && metricDetails.items.length > 0 ? (
                    <div className="divide-y divide-border-faint border border-border-faint rounded-xl overflow-hidden bg-surface-high/20 max-h-[260px] overflow-y-auto">
                      {metricDetails.items.map((t: any) => (
                        <div
                          key={t.id}
                          onClick={() => { setActiveMetricModal(null); navigate(`/inbox?ticketId=${t.id}`); }}
                          className="p-3 flex items-start justify-between hover:bg-surface-high cursor-pointer transition-colors gap-3"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-[12px] font-medium text-text-primary truncate">{t.customerName || "Customer"}</span>
                              <Badge variant="danger" size="xs">Escalated</Badge>
                              <span className="text-[10px] text-text-muted capitalize">• {t.channel}</span>
                            </div>
                            <p className="text-[11px] text-text-muted line-clamp-2">
                              <span className="font-semibold text-text-second">Reason: </span>
                              {t.escalationReason || "AI could not confidently answer — flagged for human follow-up."}
                            </p>
                          </div>
                          <div className="text-right text-[10px] text-text-muted flex-shrink-0 font-mono">
                            {formatTimeWaiting(t.updatedAt || t.receivedAt)}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-text-muted text-xs py-4">No escalated tickets in this period.</div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </motion.div>
  );
};
