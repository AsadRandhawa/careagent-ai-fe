import * as React from "react";
import { motion } from "motion/react";
import { SectionHeader } from "../components/SectionHeader";
import { MetricCard } from "../components/MetricCard";
import { Card } from "../components/Card";
import { StatRow } from "../components/StatRow";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { ProgressBar } from "../components/ui/ProgressBar";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { TrendingUp, AlertCircle, Plus, Sparkles, Filter, Calendar, MessageCircle, Globe, Clock } from "lucide-react";
import { useAppStore } from "../store";
import { useNavigate } from "react-router-dom";
import { mockStats } from "../mockData";

const CATEGORY_COLORS = ["bg-brand", "bg-danger", "bg-purple", "bg-teal", "bg-warn"];

// ── Channel config ────────────────────────────────────────────────────────────
const CHANNEL_CFG = [
  {
    id: "WhatsApp",
    color: "#25D366",
    bgClass: "bg-[#25D366]/10",
    borderClass: "border-[#25D366]/20",
    textClass: "text-[#25D366]",
    icon: <MessageCircle size={14} />,
  },
  {
    id: "Facebook",
    color: "#1877F2",
    bgClass: "bg-[#1877F2]/10",
    borderClass: "border-[#1877F2]/20",
    textClass: "text-[#1877F2]",
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    ),
  },
  {
    id: "Website",
    color: "#14B8A6",
    bgClass: "bg-teal/10",
    borderClass: "border-teal/20",
    textClass: "text-teal",
    icon: <Globe size={14} />,
  },
];

// Combine per-day data for grouped bar chart
const buildReplyRateChart = () => {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  return days.map(day => {
    const entry: Record<string, any> = { day };
    mockStats.channelReplyRates.forEach(ch => {
      const found = ch.data.find(d => d.day === day);
      entry[ch.channel] = found?.mins ?? 0;
    });
    return entry;
  });
};

const replyRateData = buildReplyRateChart();

export const Analytics = () => {
  const navigate = useNavigate();
  const {
    token,
    ticketStats,    isFetchingStats,    fetchTicketStats,
    aiInsights,     isFetchingInsights, fetchAIInsights,
    syncTickets,
  } = useAppStore();

  const [days, setDays] = React.useState(30);

  React.useEffect(() => {
    if (!token) return;
    const init = async () => {
      await syncTickets();
      await Promise.all([fetchTicketStats(days), fetchAIInsights()]);
    };
    init();
  }, [token, days]); // eslint-disable-line react-hooks/exhaustive-deps

  const stats    = ticketStats;
  const insights = aiInsights;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-8 max-w-[1400px] mx-auto"
    >
      <SectionHeader
        title="Predictive Insights"
        subtitle="Performance metrics and AI-driven growth opportunities."
        actions={
          <>
            <Button size="sm" variant={days === 30 ? "primary" : "ghost"} icon={<Calendar size={14} />} onClick={() => setDays(30)}>
              Last 30 Days
            </Button>
            <Button size="sm" variant={days === 7 ? "primary" : "ghost"} icon={<Filter size={14} />} onClick={() => setDays(7)}>
              Last 7 Days
            </Button>
          </>
        }
      />

      {/* ── Top Metric Cards ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        <MetricCard
          label="Open Tickets"
          value={isFetchingStats ? "..." : String(stats?.openTickets ?? 0)}
          subtext="Currently active"
          icon={<TrendingUp size={16} />}
        />
        <MetricCard
          label="Resolved"
          value={isFetchingStats ? "..." : String(Number.isFinite(stats?.resolvedThisPeriod) ? stats.resolvedThisPeriod : 0)}
          subtext={`Last ${days} days`}
          icon={<Sparkles size={16} className="text-brand" />}
        />
        <MetricCard
          label="Avg Resolution"
          value={isFetchingStats ? "..." : (stats?.avgResolutionTime ?? "N/A")}
          subtext="Per ticket"
          icon={<TrendingUp size={16} className="text-success" />}
        />
        <MetricCard
          label="Escalation Rate"
          value={isFetchingStats ? "..." : (stats?.escalationRate ?? "0%")}
          subtext="Last 30 days"
          icon={<AlertCircle size={16} className="text-purple" />}
        />
      </div>

      {/* ── Channel Reply Rate Cards ───────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        {mockStats.channelReplyRates.map(ch => {
          const cfg = CHANNEL_CFG.find(c => c.id === ch.channel)!;
          const escPct = ch.totalTickets > 0 ? Math.round((ch.escalated / ch.totalTickets) * 100) : 0;
          return (
            <div
              key={ch.channel}
              className={`rounded-2xl border p-5 ${cfg.bgClass} ${cfg.borderClass} flex flex-col gap-3`}
            >
              <div className="flex items-center justify-between">
                <div className={`flex items-center gap-2 text-[13px] font-bold ${cfg.textClass}`}>
                  {cfg.icon}
                  {ch.channel}
                </div>
                <Badge variant="default" size="xs" className="font-mono bg-surface/60 border-border-mid">
                  {ch.totalTickets} tickets
                </Badge>
              </div>

              <div className="flex items-end gap-3">
                <div>
                  <p className="text-[28px] font-black text-text-primary leading-none">{ch.avgMins}m</p>
                  <p className="text-[11px] text-text-muted mt-1 flex items-center gap-1">
                    <Clock size={10} /> avg first reply
                  </p>
                </div>
                <div className="flex-1 pb-1">
                  {/* Mini sparkline using divs */}
                  <div className="flex items-end gap-0.5 h-8">
                    {ch.data.map((d, i) => (
                      <div
                        key={i}
                        className="flex-1 rounded-sm opacity-70"
                        style={{
                          height: `${Math.round((d.mins / 10) * 100)}%`,
                          minHeight: "10%",
                          backgroundColor: cfg.color,
                        }}
                      />
                    ))}
                  </div>
                  <p className="text-[9px] text-text-muted font-mono mt-1 text-right">7-day trend</p>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2 border-t border-white/5">
                <div className="flex-1">
                  <div className="flex justify-between text-[10px] text-text-muted mb-1">
                    <span>Escalation rate</span>
                    <span className="font-mono">{escPct}%</span>
                  </div>
                  <div className="h-1 bg-surface-high rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-danger/80 transition-all"
                      style={{ width: `${escPct}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ── Left Column ─────────────────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-8">

          {/* Reply Rate by Channel — grouped bar chart */}
          <Card className="h-[360px] flex flex-col">
            <h3 className="text-[12px] font-bold text-text-muted uppercase tracking-widest mb-6">
              Reply Rate by Channel (avg minutes to first reply)
            </h3>
            <div className="flex-1 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={replyRateData} barSize={10} barGap={3}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1A2233" />
                  <XAxis dataKey="day" stroke="#4A5568" fontSize={10} axisLine={false} tickLine={false} dy={8} />
                  <YAxis stroke="#4A5568" fontSize={10} axisLine={false} tickLine={false} tickFormatter={v => `${v}m`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#0D1219", border: "1px solid #1E2A3D", borderRadius: "8px", fontSize: "12px" }}
                    itemStyle={{ color: "#F0F4F8" }}
                    formatter={(v: any) => [`${v} min`, ""]}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: "11px", paddingTop: "12px" }}
                    iconType="circle"
                    iconSize={8}
                  />
                  {mockStats.channelReplyRates.map(ch => (
                    <Bar key={ch.channel} dataKey={ch.channel} fill={ch.color} radius={[3, 3, 0, 0]} opacity={0.85} />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Volume Trend */}
          <Card className="h-[300px] flex flex-col">
            <h3 className="text-[12px] font-bold text-text-muted uppercase tracking-widest mb-6">
              Ticket Volume Trend
            </h3>
            <div className="flex-1 w-full">
              {isFetchingStats ? (
                <div className="flex items-center justify-center h-full text-text-muted text-sm">Loading chart data...</div>
              ) : stats?.volumeTrend?.length ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats.volumeTrend}>
                    <defs>
                      <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#3B82F6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}   />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1A2233" />
                    <XAxis dataKey="name" stroke="#4A5568" fontSize={10} axisLine={false} tickLine={false} dy={10} />
                    <YAxis stroke="#4A5568" fontSize={10} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#0D1219", border: "1px solid #1E2A3D", borderRadius: "8px", fontSize: "12px" }}
                      itemStyle={{ color: "#F0F4F8" }}
                    />
                    <Area type="monotone" dataKey="count" stroke="#3B82F6" fillOpacity={1} fill="url(#colorCount)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-text-muted text-sm">
                  No volume data yet. Sync tickets to see trends.
                </div>
              )}
            </div>
          </Card>

          {/* Recurring Issues */}
          <Card>
            <h3 className="text-[12px] font-bold text-text-muted uppercase tracking-widest mb-6">
              Recurring Issues Detection
            </h3>
            {isFetchingInsights ? (
              <div className="text-center text-text-muted text-sm py-4">AI is analyzing your tickets...</div>
            ) : insights?.recurringIssues?.length ? (
              <div className="space-y-5">
                {insights.recurringIssues.map((issue, i) => (
                  <div key={i} className="flex items-center justify-between group p-3 hover:bg-surface-high/20 rounded-xl transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-surface border border-border-strong flex items-center justify-center">
                        <AlertCircle
                          size={18}
                          className={issue.severity === "High" ? "text-danger" : issue.severity === "Medium" ? "text-warn" : "text-brand"}
                        />
                      </div>
                      <div>
                        <h4 className="text-[13px] font-semibold text-text-primary">{issue.title}</h4>
                        <p className="text-[11px] text-text-muted mt-0.5">{issue.count} tickets reported</p>
                      </div>
                    </div>
                    <Badge variant={issue.severity === "High" ? "danger" : "warn"} size="xs">{issue.severity}</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-text-muted text-sm py-4">
                No recurring issues detected yet. Sync more tickets to enable detection.
              </div>
            )}
          </Card>
        </div>

        {/* ── Right Column ────────────────────────────────────────────────── */}
        <div className="space-y-8">

          {/* Channel Summary */}
          <Card>
            <h3 className="text-[12px] font-bold text-text-muted uppercase tracking-widest mb-4">
              Channel Summary
            </h3>
            <div className="space-y-4">
              {mockStats.channelReplyRates.map(ch => {
                const cfg = CHANNEL_CFG.find(c => c.id === ch.channel)!;
                return (
                  <div key={ch.channel} className="flex items-center gap-3">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${cfg.bgClass} ${cfg.textClass}`}>
                      {cfg.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between text-[12px] mb-1">
                        <span className="text-text-second font-medium">{ch.channel}</span>
                        <span className="font-mono text-text-muted">{ch.avgMins}m avg</span>
                      </div>
                      <div className="h-1.5 bg-surface-high rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: `${Math.min((ch.avgMins / 8) * 100, 100)}%`, backgroundColor: cfg.color, opacity: 0.8 }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* AI Recommendation */}
          <Card variant="glow" className="bg-gradient-to-br from-brand-faint to-surface border-brand/20">
            <div className="flex items-center gap-3 mb-4">
              <Sparkles size={18} className="text-brand" />
              <h3 className="text-[13px] font-bold text-text-primary">AI Recommendation</h3>
            </div>
            {isFetchingInsights ? (
              <p className="text-[12px] text-text-second leading-relaxed mb-4">Analyzing your tickets...</p>
            ) : (
              <p className="text-[12px] text-text-second leading-relaxed mb-4">
                {insights?.recommendation ?? "Connect your channels and sync tickets to get personalized recommendations."}
              </p>
            )}
            <Button size="sm" variant="primary" className="w-full" icon={<Plus size={12} />} onClick={() => navigate("/knowledge-base")}>
              Update Knowledge Base
            </Button>
          </Card>

          {/* Top Categories */}
          <Card>
            <h3 className="text-[12px] font-bold text-text-muted uppercase tracking-widest mb-4">
              Top Categories
            </h3>
            {isFetchingStats ? (
              <div className="text-center text-text-muted text-sm py-4">Loading...</div>
            ) : stats?.categoryStats?.length ? (
              <div className="space-y-5">
                {stats.categoryStats.map((cat, i) => (
                  <div key={i}>
                    <div className="flex justify-between mb-1.5">
                      <span className="text-[12px] text-text-second">{cat.name}</span>
                      <span className="text-[11px] font-mono text-text-muted">{cat.value}%</span>
                    </div>
                    <ProgressBar value={cat.value} color={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-text-muted text-sm py-4">No category data yet.</div>
            )}
          </Card>

          {/* Performance Summary */}
          <Card>
            <h3 className="text-[12px] font-bold text-text-muted uppercase tracking-widest mb-4">
              Performance Summary
            </h3>
            <div className="space-y-1">
              <StatRow label="Open Tickets"      value={String(stats?.openTickets ?? 0)} />
              <StatRow label="Resolved (period)" value={String(Number.isFinite(stats?.resolvedThisPeriod) ? stats.resolvedThisPeriod : 0)} />
              <StatRow label="Escalation Rate"   value={stats?.escalationRate ?? "0%"} />
              <StatRow label="Avg Resolution"    value={stats?.avgResolutionTime ?? "N/A"} valueColor="text-success" />
            </div>
          </Card>
        </div>
      </div>
    </motion.div>
  );
};
