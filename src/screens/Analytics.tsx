import * as React from "react";
import { motion } from "motion/react";
import { SectionHeader } from "../components/SectionHeader";
import { MetricCard } from "../components/MetricCard";
import { Card } from "../components/Card";
import { StatRow } from "../components/StatRow";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { ProgressBar } from "../components/ui/ProgressBar";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp, AlertCircle, Plus, Sparkles, Filter, Calendar } from "lucide-react";
import { useAppStore } from "../store";
import { useNavigate } from "react-router-dom";

const CATEGORY_COLORS = ["bg-brand", "bg-danger", "bg-purple", "bg-teal", "bg-warn"];

export const Analytics = () => {
  const navigate = useNavigate();
  const {
    token,
    ticketStats,    isFetchingStats,    fetchTicketStats,
    aiInsights,     isFetchingInsights, fetchAIInsights,
    syncTickets,
    resolvedCount,
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

  const escalationNum = parseFloat(stats?.escalationRate ?? "0");

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
            <Button
              size="sm"
              variant={days === 30 ? "primary" : "ghost"}
              icon={<Calendar size={14} />}
              onClick={() => setDays(30)}
            >
              Last 30 Days
            </Button>
            <Button
              size="sm"
              variant={days === 7 ? "primary" : "ghost"}
              icon={<Filter size={14} />}
              onClick={() => setDays(7)}
            >
              Last 7 Days
            </Button>
          </>
        }
      />

      {/* Metric Cards — real data */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        <MetricCard
          label="Open Tickets"
          value={isFetchingStats ? "..." : String(stats?.openTickets ?? 0)}
          subtext="Currently active"
          icon={<TrendingUp size={16} />}
        />
        <MetricCard
          label="Resolved"
          value={isFetchingStats ? "..." : String((stats?.resolvedThisPeriod ?? 0) + resolvedCount)}
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-8">

          {/* Volume Trend Chart */}
          <Card className="h-[360px] flex flex-col">
            <h3 className="text-[12px] font-bold text-text-muted uppercase tracking-widest mb-6">
              Ticket Volume Trend
            </h3>
            <div className="flex-1 w-full">
              {isFetchingStats ? (
                <div className="flex items-center justify-center h-full text-text-muted text-sm">
                  Loading chart data...
                </div>
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

          {/* Recurring Issues — real AI data */}
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
                          className={
                            issue.severity === "High"   ? "text-danger" :
                            issue.severity === "Medium" ? "text-warn"   : "text-brand"
                          }
                        />
                      </div>
                      <div>
                        <h4 className="text-[13px] font-semibold text-text-primary">{issue.title}</h4>
                        <p className="text-[11px] text-text-muted mt-0.5">{issue.count} tickets reported</p>
                      </div>
                    </div>
                    <Badge variant={issue.severity === "High" ? "danger" : "warn"} size="xs">
                      {issue.severity}
                    </Badge>
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

        {/* Right Column */}
        <div className="space-y-8">

          {/* AI Recommendation — real */}
          <Card variant="glow" className="bg-gradient-to-br from-brand-faint to-surface border-brand/20">
            <div className="flex items-center gap-3 mb-4">
              <Sparkles size={18} className="text-brand" />
              <h3 className="text-[13px] font-bold text-text-primary">AI Recommendation</h3>
            </div>
            {isFetchingInsights ? (
              <p className="text-[12px] text-text-second leading-relaxed mb-4">
                Analyzing your tickets...
              </p>
            ) : (
              <p className="text-[12px] text-text-second leading-relaxed mb-4">
                {insights?.recommendation ?? "Connect Gmail and sync tickets to get personalized recommendations."}
              </p>
            )}
            <Button
              size="sm"
              variant="primary"
              className="w-full"
              icon={<Plus size={12} />}
              onClick={() => navigate("/knowledge-base")}
            >
              Update Knowledge Base
            </Button>
          </Card>

          {/* Top Categories — real */}
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
              <div className="text-center text-text-muted text-sm py-4">
                No category data yet.
              </div>
            )}
          </Card>

          {/* Performance Summary — real */}
          <Card>
            <h3 className="text-[12px] font-bold text-text-muted uppercase tracking-widest mb-4">
              Performance Summary
            </h3>
            <div className="space-y-1">
              <StatRow label="Open Tickets"      value={String(stats?.openTickets ?? 0)} />
              <StatRow label="Resolved (period)" value={String((stats?.resolvedThisPeriod ?? 0) + resolvedCount)} />
              <StatRow label="Escalation Rate"   value={stats?.escalationRate ?? "0%"} />
              <StatRow
                label="Avg Resolution"
                value={stats?.avgResolutionTime ?? "N/A"}
                valueColor="text-success"
              />
            </div>
          </Card>
        </div>
      </div>
    </motion.div>
  );
};
