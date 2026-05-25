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
import { mockStats, mockTickets } from "../mockData";
import { RefreshCw, Download, Inbox, Sparkles, Clock, Star, Zap, Activity } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../components/ToastProvider";

export const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      toast("Dashboard metrics updated", "success");
    }, 800);
  };
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="p-8 max-w-[1400px] mx-auto"
    >
      <SectionHeader 
        title="Operations Overview" 
        subtitle="Thursday, May 14, 2026"
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
            <Button size="sm" variant="ghost" icon={<Download size={14} />}>Export</Button>
          </>
        }
      />

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard 
          label="Open Tickets" 
          value={mockStats.openTickets} 
          subtext="24 overdue" 
          delta={{ value: "12%", type: "increase" }}
          icon={<Inbox size={16} />}
        />
        <MetricCard 
          label="AI Drafts Ready" 
          value={mockStats.aiDraftsReady} 
          subtext="Batch review needed" 
          icon={<Sparkles size={16} className="text-brand" />}
          className="ring-1 ring-brand/20"
        />
        <MetricCard 
          label="Avg Response Time" 
          value={mockStats.avgResponseTime} 
          subtext="-15s from yesterday" 
          delta={{ value: "08%", type: "decrease" }}
          icon={<Clock size={16} />}
        />
        <MetricCard 
          label="CSAT Score" 
          value={mockStats.csatScore} 
          subtext="Based on 48 ratings" 
          icon={<Star size={16} className="text-warn" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-8">
          <Card variant="noPad">
            <div className="p-5 border-b border-border-faint flex items-center justify-between">
              <h3 className="text-[13px] font-bold uppercase tracking-widest text-text-muted">Recent Tickets</h3>
              <Button size="xs" variant="ghost">View all</Button>
            </div>
            <div className="divide-y divide-border-faint">
              {mockTickets.slice(0, 4).map((ticket) => (
                <TicketRow key={ticket.id} {...ticket} avatarVariant={ticket.avatarVariant as any} onClick={() => navigate(`/inbox?ticketId=${ticket.id}`)} className="cursor-pointer hover:bg-bg-elevated/50 transition-colors" />
              ))}
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
                  <span className="text-[12px] text-text-second">Draft Accuracy</span>
                  <span className="text-[12px] font-mono text-success">98.4%</span>
                </div>
                <ProgressBar value={98.4} color="bg-success" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <StatRow label="Tickets Automuted" value="28.5%" />
                <StatRow label="Agent Approve Rate" value="92.1%" />
                <StatRow label="Token Usage" value="12,402" />
                <StatRow label="Cost Saved (Est)" value="$420.50" valueColor="text-success" />
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
            <div className="space-y-5">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-[11px] text-success font-bold uppercase">Positive</span>
                  <span className="text-[11px] font-mono text-text-muted">65%</span>
                </div>
                <ProgressBar value={65} color="bg-success" />
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-[11px] text-warn font-bold uppercase">Neutral</span>
                  <span className="text-[11px] font-mono text-text-muted">25%</span>
                </div>
                <ProgressBar value={25} color="bg-warn" />
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-[11px] text-danger font-bold uppercase">Frustrated</span>
                  <span className="text-[11px] font-mono text-text-muted">10%</span>
                </div>
                <ProgressBar value={10} color="bg-danger" />
              </div>
            </div>
          </Card>

          <Card>
            <h3 className="text-[13px] font-bold uppercase tracking-widest text-text-muted mb-6">Ticket Volume (7d)</h3>
            <MiniBarChart data={mockStats.volumeTrend} />
          </Card>

          <Card>
            <h3 className="text-[13px] font-bold uppercase tracking-widest text-text-muted mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <Button className="w-full justify-start py-2" variant="surface" size="sm">Update Knowledge Base</Button>
              <Button className="w-full justify-start py-2" variant="surface" size="sm">Resolve All Escalations</Button>
              <Button className="w-full justify-start py-2" variant="surface" size="sm">Export Weekly Report</Button>
            </div>
          </Card>
        </div>
      </div>
    </motion.div>
  );
};
