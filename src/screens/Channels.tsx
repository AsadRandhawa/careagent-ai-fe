import * as React from "react";
import { motion } from "motion/react";
import { SectionHeader } from "../components/SectionHeader";
import { Card } from "../components/Card";
import { ChannelRow } from "../components/ChannelRow";
import { Toggle } from "../components/ui/Toggle";
import { Button } from "../components/ui/Button";
import { Mail, MessageSquare, Instagram, Globe, Zap, Copy, Check, X, ExternalLink } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { useToast } from "../components/ToastProvider";
import { useAppStore } from "../store";

export const Channels = () => {
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { token, user, gmailEnabled, setGmailEnabled, fetchTickets,
    aiAutoDrafting, setAiAutoDrafting,
    autoClassification, setAutoClassification,
    sentimentTracking, setSentimentTracking,
  } = useAppStore();

  const gmailConnected    = !!user?.googleConnected;
  const whatsappConnected = !!user?.whatsappConnected;

  // ── Live Chat state ─────────────────────────────────────
  const [livechatToken,   setLivechatToken]   = React.useState<string | null>(null);
  const [embedCode,       setEmbedCode]       = React.useState<string>("");
  const [showEmbed,       setShowEmbed]       = React.useState(false);
  const [copied,          setCopied]          = React.useState(false);
  const [connectingChat,  setConnectingChat]  = React.useState(false);

  const livechatConnected = !!livechatToken;

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

  const connectGmail = () => {
    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
    window.location.href = `${apiUrl}/api/auth/google?token=${token || ""}`;
  };

  const connectWhatsApp = () => {
    toast("WhatsApp integration coming soon. Meta Business Verification is in progress.", "info");
  };

  const connectInstagram = () => {
    toast("Instagram integration coming soon.", "info");
  };

  const disconnectGmail = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
      await fetch(`${apiUrl}/api/user/disconnect/gmail`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      toast("Gmail disconnected.", "success");
      window.location.reload();
    } catch {
      toast("Failed to disconnect Gmail.", "error");
    }
  };

  const connectLivechat = async () => {
    setConnectingChat(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const res = await fetch(`${apiUrl}/api/livechat/token`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to generate token");
      const data = await res.json();
      setLivechatToken(data.token);
      setEmbedCode(data.embedCode);
      setShowEmbed(true);
    } catch {
      toast("Failed to set up live chat. Please try again.", "error");
    } finally {
      setConnectingChat(false);
    }
  };

  const copyEmbed = async () => {
    await navigator.clipboard.writeText(embedCode);
    setCopied(true);
    toast("Embed code copied! ✓", "success");
    setTimeout(() => setCopied(false), 2000);
  };

  const channels = [
    {
      id:           "gmail",
      name:         "Gmail",
      description:  "Official support inbox connection",
      icon:         <Mail size={18} />,
      connected:    gmailConnected,
      enabled:      gmailEnabled,
      onToggle:     (val: boolean) => {
        setGmailEnabled(val).then(() => {
          if (val) { toast("Gmail inbox enabled.", "success"); fetchTickets(); }
          else toast("Gmail inbox disabled.", "info");
        });
      },
      onConnect:    connectGmail,
      onDisconnect: disconnectGmail,
    },
    {
      id:          "whatsapp",
      name:        "WhatsApp Business",
      description: "Customer chat integration — verification in progress",
      icon:        <MessageSquare size={18} />,
      connected:   whatsappConnected,
      enabled:     whatsappConnected,
      onToggle:    () => {},
      onConnect:   connectWhatsApp,
      onDisconnect: () => toast("WhatsApp disconnect coming soon.", "info"),
    },
    {
      id:          "instagram",
      name:        "Instagram DMs",
      description: "Direct message management — coming soon",
      icon:        <Instagram size={18} />,
      connected:   false,
      enabled:     false,
      onToggle:    () => {},
      onConnect:   connectInstagram,
      onDisconnect: () => {},
    },
    {
      id:          "livechat",
      name:        "Web Live Chat",
      description: livechatConnected ? "Widget active — embed script ready" : "Embeddable chat widget for your website",
      icon:        <Globe size={18} />,
      connected:   livechatConnected,
      enabled:     livechatConnected,
      onToggle:    () => {},
      onConnect:   connectLivechat,
      onDisconnect: () => { setLivechatToken(null); setShowEmbed(false); },
    },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-8 max-w-[1200px] mx-auto">
      <SectionHeader title="Channel Integrations" subtitle="Manage where your support agent listens and responds." />

      {/* ── Live Chat Embed Panel ────────────────────────────────────────────── */}
      {showEmbed && (
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 rounded-2xl border border-teal/30 bg-teal/5 p-5"
        >
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="text-[13px] font-bold text-text-primary flex items-center gap-2">
                <Globe size={14} className="text-teal" />
                Web Live Chat — Ready to Deploy
              </h3>
              <p className="text-[12px] text-text-muted mt-1">
                Paste this script tag into your website's <code className="text-teal bg-teal/10 px-1 rounded text-[11px]">&lt;/body&gt;</code> — the chat widget appears instantly.
              </p>
            </div>
            <button onClick={() => setShowEmbed(false)} className="text-text-muted hover:text-text-primary p-1">
              <X size={16} />
            </button>
          </div>

          <div className="relative bg-bg border border-border-mid rounded-xl p-4 font-mono text-[12px] text-text-second overflow-x-auto">
            <code>{embedCode}</code>
            <button
              onClick={copyEmbed}
              className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-high text-[11px] font-bold hover:bg-surface text-text-second transition-all"
            >
              {copied ? <Check size={12} className="text-success" /> : <Copy size={12} />}
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>

          <div className="flex items-center gap-3 mt-3">
            <span className="flex items-center gap-1.5 text-[11px] text-success font-medium">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
              Widget is live at: careagent-ai-be-production.up.railway.app/widget.js
            </span>
            <a
              href={`${import.meta.env.VITE_API_URL || "https://careagent-ai-be-production.up.railway.app"}/widget.js`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 text-[11px] text-brand hover:underline ml-auto"
            >
              Preview widget <ExternalLink size={10} />
            </a>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left — Channel list */}
        <div className="lg:col-span-2">
          <div className="mb-6">
            <h3 className="text-[11px] font-bold text-text-muted uppercase tracking-widest mb-4">Available Channels</h3>
            <div className="space-y-3">
              {channels.map((ch) => (
                <div key={ch.id} className="relative">
                  <ChannelRow
                    name={ch.name}
                    description={ch.description}
                    icon={ch.icon}
                    connected={ch.connected}
                    enabled={ch.enabled}
                    onToggle={ch.onToggle}
                    onConnect={ch.connected ? ch.onDisconnect : ch.id === "livechat" ? () => { connectLivechat(); } : ch.onConnect}
                  />
                  {ch.id === "livechat" && ch.connected && (
                    <button
                      onClick={() => setShowEmbed(v => !v)}
                      className="absolute right-16 top-1/2 -translate-y-1/2 text-[11px] font-bold text-teal hover:underline flex items-center gap-1"
                    >
                      <Copy size={10} /> Get embed code
                    </button>
                  )}
                  {ch.id === "livechat" && !ch.connected && connectingChat && (
                    <div className="absolute inset-0 bg-bg/60 rounded-xl flex items-center justify-center">
                      <span className="text-[12px] text-text-muted">Generating token…</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          <Button variant="ghost" className="w-full border-dashed py-6 border-2">
            + Request Custom Webhook
          </Button>
        </div>

        {/* Right — Settings */}
        <div className="space-y-6">
          <Card>
            <div className="flex items-center gap-3 mb-6">
              <Zap size={16} className="text-brand" />
              <h3 className="text-[13px] font-bold text-text-primary">Automation Settings</h3>
            </div>
            <div className="space-y-5">
              {[
                { label: "AI Auto-Drafting", sub: "Draft replies instantly", val: aiAutoDrafting, set: setAiAutoDrafting },
                { label: "Auto-Classification", sub: "Apply tags automatically", val: autoClassification, set: setAutoClassification },
                { label: "Sentiment Tracking", sub: "Real-time tone analysis", val: sentimentTracking, set: setSentimentTracking },
              ].map(s => (
                <div key={s.label} className="flex items-center justify-between">
                  <div>
                    <div className="text-[12px] font-semibold text-text-primary">{s.label}</div>
                    <div className="text-[11px] text-text-muted">{s.sub}</div>
                  </div>
                  <Toggle checked={s.val} onChange={s.set} />
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </motion.div>
  );
};
