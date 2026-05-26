import * as React from "react";
import { motion } from "motion/react";
import { SectionHeader } from "../components/SectionHeader";
import { MetricCard } from "../components/MetricCard";
import { Card } from "../components/Card";
import { ChannelRow } from "../components/ChannelRow";
import { Badge } from "../components/ui/Badge";
import { Toggle } from "../components/ui/Toggle";
import { Button } from "../components/ui/Button";
import { StatRow } from "../components/StatRow";
import { Mail, MessageSquare, Instagram, Globe, Layout, Zap, Settings, Shield } from "lucide-react";
import { mockChannels } from "../mockData";
import { useSearchParams } from "react-router-dom";
import { useToast } from "../components/ToastProvider";

const iconMap = {
  gmail: <Mail size={18} />,
  whatsapp: <MessageSquare size={18} />,
  livechat: <Globe size={18} />,
  instagram: <Instagram size={18} />,
  zendesk: <Layout size={18} />,
};

export const Channels = () => {
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [channels, setChannels] = React.useState(mockChannels);

  React.useEffect(() => {
    if (searchParams.get("connected") === "gmail") {
      toast("Gmail connected successfully!", "success");
      setChannels(prev => prev.map(c => c.id === 'gmail' ? { ...c, connected: true } : c));
      
      // Clean up the URL quietly
      window.history.replaceState({}, '', '/channels');
    }
  }, [searchParams, toast]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-8 max-w-[1200px] mx-auto"
    >
      <SectionHeader 
        title="Channel Integrations" 
        subtitle="Manage where your support agent listens and responds."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="mb-6">
             <h3 className="text-[11px] font-bold text-text-muted uppercase tracking-widest mb-4">Available Channels</h3>
             <div className="space-y-3">
               {channels.map((channel) => (
                 <ChannelRow 
                   key={channel.id}
                   name={channel.name}
                   description={channel.description}
                   icon={(iconMap as any)[channel.id]}
                   connected={channel.connected}
                   onToggle={() => {}}
                   onConnect={() => {
                     if (channel.id === 'gmail') {
                       const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
                       window.location.href = `${apiUrl}/api/auth/google`;
                     }
                   }}
                 />
               ))}
             </div>
          </div>
          
          <Button variant="ghost" className="w-full border-dashed py-6 border-2">
            + Request Custom Webhook
          </Button>
        </div>

        <div className="space-y-6">
          <Card>
            <div className="flex items-center gap-3 mb-6">
              <Zap size={16} className="text-brand" />
              <h3 className="text-[13px] font-bold text-text-primary">Automation Settings</h3>
            </div>
            
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[12px] font-semibold text-text-primary">AI Auto-Drafting</div>
                  <div className="text-[11px] text-text-muted">Draft replies instantly</div>
                </div>
                <Toggle checked={true} onChange={() => {}} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[12px] font-semibold text-text-primary">Auto-Classification</div>
                  <div className="text-[11px] text-text-muted">Apply tags automatically</div>
                </div>
                <Toggle checked={true} onChange={() => {}} />
              </div>
               <div className="flex items-center justify-between">
                <div>
                  <div className="text-[12px] font-semibold text-text-primary">Sentiment Tracking</div>
                  <div className="text-[11px] text-text-muted">Real-time tone analysis</div>
                </div>
                <Toggle checked={false} onChange={() => {}} />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-3 mb-6">
              <Shield size={16} className="text-success" />
              <h3 className="text-[13px] font-bold text-text-primary">Security & Privacy</h3>
            </div>
            <div className="space-y-1">
              <StatRow label="Data Residency" value="US East 1" />
              <StatRow label="PII Masking" value="Active" valueColor="text-success" />
              <StatRow label="Audit Logging" value="Full" />
            </div>
            <Button size="sm" variant="ghost" className="w-full mt-4" icon={<Settings size={12} />}>
              Advanced Security
            </Button>
          </Card>
        </div>
      </div>
    </motion.div>
  );
};
