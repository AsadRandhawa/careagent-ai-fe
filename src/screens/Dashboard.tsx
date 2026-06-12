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
import { RefreshCw, Download, Inbox, Sparkles, Clock, Star, Zap, Activity } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../components/ToastProvider";
import { useAppStore } from "../store";

const todayLabel = () =>
  new Date().toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

export const Dashboard = () => {
  const navigate    = useNavigate();
  const { toast }   = useToast();
  const {
    tickets, isFetchingTickets, fetchTickets,
    ticketStats, isFetchingStats, fetchTicketStats,
    syncTickets, token,
  } = useAppStore();

  const [isRefreshing, setIsRefreshing] = React.useState(false);

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
        title="Operations Overview"
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          label="Open Tickets"
          value={isFetchingStats ? "..." : (stats?.openTickets ?? tickets.length)}
          subtext={stats ? `${stats.escalated} escalated` : "Loading..."}
          delta={{ value: "live", type: "increase" }}
          icon={<Inbox size={16} />}
        />
        <MetricCard
          label="AI Drafts Ready"
          value={isFetchingStats ? "..." : (stats?.aiDraftsReady ?? tickets.length)}
          subtext="Awaiting review"
          icon={<Sparkles size={16} className="text-brand" />}
          className="ring-1 ring-brand/20"
        />
        <MetricCard
          label="Avg Resolution Time"
          value={isFetchingStats ? "..." : (stats?.avgResolutionTime ?? "N/A")}
          subtext="This month"
          icon={<Clock size={16} />}
        />
        <MetricCard
          label="Escalation Rate"
          value={isFetchingStats ? "..." : (stats?.escalationRate ?? "0%")}
          subtext="Last 30 days"
          icon={<Star size={16} className="text-warn" />}
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
                <StatRow label="Open Tickets"     value={String(stats?.openTickets ?? tickets.length)} />
                <StatRow label="Resolved (30d)"   value={String(stats?.resolvedThisPeriod ?? 0)} />
                <StatRow label="Escalated"         value={String(stats?.escalated ?? 0)} />
                <StatRow label="Escalation Rate"   value={stats?.escalationRate ?? "0%"} valueColor="text-warn" />
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
            <h3 className="text-[13px] font-bold uppercase tracking-widest text-text-muted mb-6">Ticket Volume (7d)</h3>
            <MiniBarChart data={miniBarData} />
          </Card>

          <Card>
            <h3 className="text-[13px] font-bold uppercase tracking-widest text-text-muted mb-4">Quick Actions</h3>
            <div className="space-y-2">
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
    </motion.div>
  );
};
