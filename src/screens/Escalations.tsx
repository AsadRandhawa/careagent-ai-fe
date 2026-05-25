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
import { AlertTriangle, ShieldCheck, Activity, UserCheck, MessageCircleWarning } from "lucide-react";

export const Escalations = () => {
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
        <MetricCard label="Active Escalations" value="8" icon={<AlertTriangle size={16} className="text-danger" />} />
        <MetricCard label="High Risk Score" value="3" icon={<Activity size={16} className="text-warn" />} />
        <MetricCard label="Resolution Rate" value="94%" icon={<ShieldCheck size={16} className="text-success" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {[
            { name: "Averie Miller", id: "TIC-8293", score: 88, sentiment: "Angry", reason: "AI detected billing threat and offensive language." },
            { name: "Marcus Thorne", id: "TIC-8401", score: 72, sentiment: "Frustrated", reason: "Customer requested a manager multiple times." },
            { name: "Elena Kovic", id: "TIC-8312", score: 65, sentiment: "Urgent", reason: "System detected potential data privacy leak." },
          ].map((item) => (
            <Card key={item.id} className="relative ring-1 ring-danger/10">
              <div className="flex items-start gap-6">
                <Avatar initials={item.name[0]} size={38} variant="danger" isEscalated />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-[15px] font-bold text-text-primary">{item.name}</h3>
                    <Badge variant={item.score > 80 ? "danger" : "warn"} size="sm">{item.sentiment}</Badge>
                  </div>
                  
                  <div className="mb-4">
                    <div className="flex justify-between items-end mb-2">
                      <span className="text-[11px] font-bold text-text-muted uppercase">Risk Score</span>
                      <span className={cn("text-[13px] font-mono font-bold", item.score > 80 ? "text-danger" : "text-warn")}>
                        {item.score}/100
                      </span>
                    </div>
                    <ProgressBar value={item.score} color={item.score > 80 ? "bg-danger" : "bg-warn"} />
                  </div>

                  <div className="bg-bg-elevated p-3 rounded-lg border border-border-faint mb-4">
                    <div className="flex items-start gap-3">
                      <MessageCircleWarning size={14} className="text-danger mt-0.5" />
                      <p className="text-[12px] text-text-second">{item.reason}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button variant="danger" size="sm">Take Over</Button>
                    <Button variant="ghost" size="sm">Dismiss Flag</Button>
                    <Button variant="ghost" size="sm">Review Logs</Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="space-y-6">
          <Card>
            <h3 className="text-[12px] font-bold text-text-muted uppercase tracking-widest mb-4">HITL Actions Required</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-danger-faint border border-danger/10">
                <span className="text-[12px] font-medium text-text-primary">Immediate Override</span>
                <Badge variant="danger" size="xs">3 Actions</Badge>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-warn-faint border border-border-faint">
                <span className="text-[12px] font-medium text-text-primary">Sentiment Audit</span>
                <Badge variant="warn" size="xs">5 Pending</Badge>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-surface border border-border-faint">
                <span className="text-[12px] font-medium text-text-primary">Conflict Resolution</span>
                <Badge variant="default" size="xs">All clear</Badge>
              </div>
            </div>
          </Card>

          <Card>
            <h3 className="text-[12px] font-bold text-text-muted uppercase tracking-widest mb-4">Detection Signals</h3>
            <div className="space-y-1">
              <StatRow label="Sentiment Volatility" value="High" valueColor="text-danger" />
              <StatRow label="Repetition Count" value="8" />
              <StatRow label="Manager Requests" value="3" />
              <StatRow label="Refund Likelihood" value="82%" valueColor="text-warn" />
            </div>
          </Card>
        </div>
      </div>
    </motion.div>
  );
};

const cn = (...inputs: any[]) => inputs.filter(Boolean).join(" ");
