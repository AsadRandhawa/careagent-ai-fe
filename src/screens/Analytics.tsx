import * as React from "react";
import { motion } from "motion/react";
import { SectionHeader } from "../components/SectionHeader";
import { MetricCard } from "../components/MetricCard";
import { Card } from "../components/Card";
import { StatRow } from "../components/StatRow";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { ProgressBar } from "../components/ui/ProgressBar";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import { TrendingUp, AlertCircle, Plus, Sparkles, Filter, Calendar } from "lucide-react";

const chartData = [
  { name: "Week 1", count: 420, ai: 310 },
  { name: "Week 2", count: 512, ai: 440 },
  { name: "Week 3", count: 480, ai: 410 },
  { name: "Week 4", count: 620, ai: 520 },
  { name: "Week 5", count: 580, ai: 510 },
];

export const Analytics = () => {
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
            <Button size="sm" variant="ghost" icon={<Calendar size={14} />}>Last 30 Days</Button>
            <Button size="sm" variant="ghost" icon={<Filter size={14} />}>Filters</Button>
          </>
        }
      />

      <div className="grid grid-cols-4 gap-6 mb-8">
        <MetricCard label="Support Throughput" value="1.2k" subtext="Tickets solved/mo" icon={<TrendingUp size={16} />} />
        <MetricCard label="Manager Workload" value="-24%" subtext="Saved by AI" icon={<Sparkles size={16} className="text-brand" />} />
        <MetricCard label="Avg Satisfaction" value="4.92" subtext="+0.2 this month" icon={<TrendingUp size={16} className="text-success" />} />
        <MetricCard label="Escalation Rate" value="2.4%" subtext="Historical low" icon={<AlertCircle size={16} className="text-purple" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="h-[360px] flex flex-col">
            <h3 className="text-[12px] font-bold text-text-muted uppercase tracking-widest mb-6">Ticket Volume Trend</h3>
            <div className="flex-1 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
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
                  <Area type="monotone" dataKey="ai" stroke="#10B981" fillOpacity={0} strokeWidth={2} strokeDasharray="5 5" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card>
            <h3 className="text-[12px] font-bold text-text-muted uppercase tracking-widest mb-6">Recurring Issues Detection</h3>
            <div className="space-y-5">
              {[
                { title: "Shipping delays in Europe", count: 124, severity: "High", color: "text-danger" },
                { title: "Coupon code 'SPRING20' invalid", count: 82, severity: "Medium", color: "text-warn" },
                { title: "Login screen flickering", count: 48, severity: "Low", color: "text-brand" },
              ].map((issue, i) => (
                <div key={i} className="flex items-center justify-between group p-3 hover:bg-surface-high/20 rounded-xl transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-surface border border-border-strong flex items-center justify-center text-text-muted">
                      <AlertCircle size={18} className={issue.color} />
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
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-8">
           <Card variant="glow" className="bg-gradient-to-br from-brand-faint to-surface border-brand/20">
             <div className="flex items-center gap-3 mb-4">
                <Sparkles size={18} className="text-brand" />
                <h3 className="text-[13px] font-bold text-text-primary">AI Recommendation</h3>
             </div>
             <p className="text-[12px] text-text-second leading-relaxed mb-4">
               Customers are frequently asking about "Customs Duties". Creating a dedicated FAQ entry could reduce ticket volume by 12%.
             </p>
             <Button size="sm" variant="primary" className="w-full" icon={<Plus size={12} />}>Create Article</Button>
           </Card>

           <Card>
             <h3 className="text-[12px] font-bold text-text-muted uppercase tracking-widest mb-4">Top Categories</h3>
             <div className="space-y-5">
               {[
                 { name: "Order Tracking", value: 45, color: "bg-brand" },
                 { name: "Refunds", value: 25, color: "bg-danger" },
                 { name: "Technical", value: 18, color: "bg-purple" },
                 { name: "Pre-sales", value: 12, color: "bg-teal" },
               ].map((cat, i) => (
                 <div key={i}>
                   <div className="flex justify-between mb-1.5">
                     <span className="text-[12px] text-text-second">{cat.name}</span>
                     <span className="text-[11px] font-mono text-text-muted">{cat.value}%</span>
                   </div>
                   <ProgressBar value={cat.value} color={cat.color} />
                 </div>
               ))}
             </div>
           </Card>

           <Card>
             <h3 className="text-[12px] font-bold text-text-muted uppercase tracking-widest mb-4">Performance Summary</h3>
             <div className="space-y-1">
               <StatRow label="Agent Occupancy" value="78%" />
               <StatRow label="Escalation Time" value="12m" />
               <StatRow label="Draft Iterations" value="1.2" />
               <StatRow label="Self-Solve Rate" value="18%" valueColor="text-success" />
             </div>
           </Card>
        </div>
      </div>
    </motion.div>
  );
};
