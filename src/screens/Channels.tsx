import * as React from "react";
import { motion } from "motion/react";
import { SectionHeader } from "../components/SectionHeader";
import { Card } from "../components/Card";
import { ChannelRow } from "../components/ChannelRow";
import { Toggle } from "../components/ui/Toggle";
import { Button } from "../components/ui/Button";
import { StatRow } from "../components/StatRow";
import { Mail, MessageSquare, Instagram, Globe, Zap, Settings, Shield, ExternalLink } from "lucide-react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useToast } from "../components/ToastProvider";
import { useAppStore } from "../store";

export const Channels = () => {
  const [searchParams] = useSearchParams();
  const navigate      = useNavigate();
  const { toast }     = useToast();
  const { token, user, gmailEnabled, setGmailEnabled } = useAppStore();

  // Derive real connection status from user object
  const gmailConnected     = !!user?.googleConnected;
  const whatsappConnected  = !!user?.whatsappConnected;

  // ── Handle OAuth redirects back to this page ──────────
  React.useEffect(() => {
    if (searchParams.get("connected") === "gmail") {
      toast("Gmail connected successfully! ✓", "success");
      window.history.replaceState({}, "", "/channels");
    }
    if (searchParams.get("error") === "google_denied") {
      toast("Gmail connection was cancelled.", "error");
      window.history.replaceState({}, "", "/channels");
    }
  }, [searchParams, toast]);

  // ── Channel connect handlers ──────────────────────────
  const connectGmail = () => {
    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
    window.location.href = `${apiUrl}/api/auth/google?token=${token || ""}`;
  };

  const connectWhatsApp = () => {
    // WhatsApp requires Meta Business Verification before users can connect.
    // Once verified, this will launch the Embedded Signup flow.
    toast("WhatsApp integration coming soon. Meta Business Verification is in progress.", "info");
  };

  const connectInstagram = () => {
    toast("Instagram integration coming soon.", "info");
  };

  const disconnectGmail = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
      await fetch(`${apiUrl}/api/user/disconnect/gmail`, {
        method:  "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      toast("Gmail disconnected.", "success");
      // Refresh user in store
      window.location.reload();
    } catch {
      toast("Failed to disconnect Gmail.", "error");
    }
  };

  const channels = [
    {
      id:          "gmail",
      name:        "Gmail",
      description: "Official support inbox connection",
      icon:        <Mail size={18} />,
      connected:   gmailConnected,
      enabled:     gmailEnabled,
      onToggle:    (val: boolean) => {
        setGmailEnabled(val);
        if (val) {
          toast("Gmail inbox enabled. Tickets will load shortly.", "success");
        } else {
          toast("Gmail inbox disabled. No new tickets will load.", "info");
        }
      },
      onConnect:   connectGmail,
      onDisconnect: disconnectGmail,
    },
    {
      id:          "whatsapp",
      name:        "WhatsApp Business",
      description: "Customer chat integration — verification in progress",
      icon:        <MessageSquare size={18} />,
      connected:   whatsappConnected,
      onConnect:   connectWhatsApp,
      onDisconnect: () => toast("WhatsApp disconnect coming soon.", "info"),
    },
    {
      id:          "instagram",
      name:        "Instagram DMs",
      description: "Direct message management — coming soon",
      icon:        <Instagram size={18} />,
      connected:   false,
      onConnect:   connectInstagram,
      onDisconnect: () => {},
    },
    {
      id:          "livechat",
      name:        "Web Live Chat",
      description: "In-app support widget — coming soon",
      icon:        <Globe size={18} />,
      connected:   false,
      onConnect:   () => toast("Web Live Chat coming soon.", "info"),
      onDisconnect: () => {},
    },
  ];

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
        {/* Left — Channel list */}
        <div className="lg:col-span-2">
          <div className="mb-6">
            <h3 className="text-[11px] font-bold text-text-muted uppercase tracking-widest mb-4">
              Available Channels
            </h3>
            <div className="space-y-3">
              {channels.map((channel) => (
                <ChannelRow
                  key={channel.id}
                  name={channel.name}
                  description={channel.description}
                  icon={channel.icon}
                  connected={channel.connected}
                  enabled={'enabled' in channel ? channel.enabled : channel.connected}
                  onToggle={'onToggle' in channel ? channel.onToggle : () => {}}
                  onConnect={channel.connected ? channel.onDisconnect : channel.onConnect}
                />
              ))}
            </div>
          </div>

          <Button variant="ghost" className="w-full border-dashed py-6 border-2">
            + Request Custom Webhook
          </Button>
        </div>

        {/* Right — Settings */}
        <div className="space-y-6">
          {/* Automation Settings */}
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

          {/* Security & Privacy — honest values */}
          <Card>
            <div className="flex items-center gap-3 mb-6">
              <Shield size={16} className="text-success" />
              <h3 className="text-[13px] font-bold text-text-primary">Security & Privacy</h3>
            </div>
            <div className="space-y-1">
              <StatRow label="Gmail OAuth" value={gmailConnected ? "Connected" : "Not connected"} valueColor={gmailConnected ? "text-success" : "text-text-muted"} />
              <StatRow label="WhatsApp" value={whatsappConnected ? "Connected" : "Pending verification"} valueColor={whatsappConnected ? "text-success" : "text-warn"} />
              <StatRow label="Data Storage" value="Railway (EU)" />
              <StatRow label="Passwords" value="bcrypt encrypted" valueColor="text-success" />
            </div>
            <a
              href="/privacy"
              className="flex items-center gap-2 text-[11px] text-brand hover:underline mt-4 font-semibold"
            >
              <ExternalLink size={11} />
              View Privacy Policy
            </a>
          </Card>
        </div>
      </div>
    </motion.div>
  );
};
