import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { SectionHeader } from "../components/SectionHeader";
import { Card } from "../components/Card";
import { ChannelRow } from "../components/ChannelRow";
import { Toggle } from "../components/ui/Toggle";
import { Button } from "../components/ui/Button";
import { MessageSquare, Instagram, Globe, Zap, Copy, Check, X } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { useToast } from "../components/ToastProvider";
import { useAppStore } from "../store";

export const Channels = () => {
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { token, user,
    facebookEnabled, setFacebookEnabled,
    instagramEnabled, setInstagramEnabled,
    aiAutoDrafting, setAiAutoDrafting,
    autoClassification, setAutoClassification,
    sentimentTracking, setSentimentTracking,
  } = useAppStore();

  const whatsappConnected = !!user?.whatsappConnected;
  const facebookConnected = !!user?.facebookConnected;
  const instagramConnected = !!user?.instagramConnected;

  // Instagram auto-send — opt-in, off by default. Kept as local state with
  // its own direct save call rather than threaded through the global store
  // like the other automation toggles, since it's specific to this one
  // channel and this keeps the change self-contained.
  const [instagramAutoSend, setInstagramAutoSendLocal] = React.useState(!!user?.instagramAutoSend);
  React.useEffect(() => {
    setInstagramAutoSendLocal(!!user?.instagramAutoSend);
  }, [user?.instagramAutoSend]);

  const saveInstagramAutoSend = async (val: boolean) => {
    setInstagramAutoSendLocal(val); // optimistic
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const res = await fetch(`${apiUrl}/api/user/preferences`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ instagramAutoSend: val }),
      });
      if (!res.ok) throw new Error("Save failed");
      toast(
        val ? "Instagram will now reply automatically, without human approval." : "Instagram auto-send turned off — replies need approval again.",
        val ? "success" : "info"
      );
    } catch (err) {
      setInstagramAutoSendLocal(!val); // revert on failure
      toast("Failed to update Instagram auto-send setting.", "error");
    }
  };

  // ── Live Chat state ─────────────────────────────────────
  const [livechatToken,   setLivechatToken]   = React.useState<string | null>(null);
  const [embedCode,       setEmbedCode]       = React.useState<string>("");
  const [showEmbed,       setShowEmbed]       = React.useState(false);
  const [connectingChat,  setConnectingChat]  = React.useState(false);

  // ── WhatsApp Embedded Signup state ──────────────────────
  const [connectingWhatsApp, setConnectingWhatsApp] = React.useState(false);
  const [fbSdkReady, setFbSdkReady] = React.useState(false);

  const livechatConnected = !!livechatToken;

  // Load Meta's JS SDK once. Embedded Signup runs through FB.login(), not
  // a backend redirect like Facebook — it needs this script present
  // on the page. If VITE_META_APP_ID isn't set, this silently no-ops and
  // the connect button falls back to an explanatory message instead of
  // throwing, since a misconfigured env var shouldn't break the page.
  React.useEffect(() => {
    const appId = import.meta.env.VITE_META_APP_ID;
    if (!appId || (window as any).FB) {
      if ((window as any).FB) setFbSdkReady(true);
      return;
    }
    (window as any).fbAsyncInit = function () {
      (window as any).FB.init({ appId, autoLogAppEvents: true, xfbml: false, version: "v19.0" });
      setFbSdkReady(true);
    };
    const script = document.createElement("script");
    script.src = "https://connect.facebook.net/en_US/sdk.js";
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);
  }, []);

  React.useEffect(() => {
    if (searchParams.get("connected") === "facebook") {
      toast("Facebook Messenger connected successfully! ✓", "success");
      window.history.replaceState({}, "", "/channels");
    }
    if (searchParams.get("error") === "auth_failed") {
      toast("Facebook connection failed. Please try again.", "error");
      window.history.replaceState({}, "", "/channels");
    }
  }, [searchParams, toast]);

  const connectWhatsApp = () => {
    const appId = import.meta.env.VITE_META_APP_ID;
    const configId = import.meta.env.VITE_WHATSAPP_CONFIG_ID;
    if (!appId || !configId) {
      toast("WhatsApp connect isn't configured yet — missing app config. Contact support.", "error");
      return;
    }
    if (!fbSdkReady || !(window as any).FB) {
      toast("Still loading Facebook's connect tool — try again in a moment.", "info");
      return;
    }

    // Meta posts a separate window message with the WABA ID and phone
    // number ID during the signup flow — these aren't included in the
    // FB.login() callback itself, so we have to listen for them
    // independently and match them up with the auth code once both
    // arrive.
    //
    // CONFIRMED (2026-09-27): this postMessage is only reliably emitted by
    // the full new-number onboarding wizard. When a business instead
    // shares an EXISTING, already-verified WABA/number through Meta's
    // simpler "select business assets to share" consent screen, NO
    // WA_EMBEDDED_SIGNUP event fires at all — verified with two
    // independent browsers, ruling out a browser/extension-blocking
    // theory. Previously this was treated as a hard failure (toast +
    // abort, /api/whatsapp/connect never called). Now we still try to
    // capture them for the common new-number case, but no longer BLOCK
    // the connect attempt if they never arrive — the backend has a
    // Graph-API-based fallback (walks the granted token's own
    // /me/businesses -> owned WABAs -> phone numbers) that resolves this
    // unambiguously when the frontend couldn't capture it directly.
    let capturedWabaId: string | null = null;
    let capturedPhoneNumberId: string | null = null;

    const messageListener = (event: MessageEvent) => {
      if (!event.origin.endsWith("facebook.com")) return;
      try {
        const data = typeof event.data === "string" ? JSON.parse(event.data) : event.data;
        if (data?.type === "WA_EMBEDDED_SIGNUP" && data?.event === "FINISH") {
          capturedWabaId = data.data?.waba_id || null;
          capturedPhoneNumberId = data.data?.phone_number_id || null;
        }
      } catch {
        // Not a JSON message we care about — Meta's SDK posts other
        // unrelated messages on this same channel too.
      }
    };
    window.addEventListener("message", messageListener);

    setConnectingWhatsApp(true);
    // NOTE: the callback passed to FB.login() must be a plain (non-async)
    // function — Meta's JS SDK does an internal type check on this
    // parameter and specifically rejects async functions (throws
    // "Expression is of type asyncfunction, not function"), even though
    // `typeof asyncFn === 'function'` is technically true in JS. The SDK's
    // check looks at the function's exact type tag instead. Fix: keep the
    // callback itself synchronous, and hand off to an async inner
    // function for the actual work.
    (window as any).FB.login(
      (response: any) => {
        handleWhatsAppLoginResponse(response);
      },
      {
        config_id: configId,
        response_type: "code",
        override_default_response_type: true,
        extras: { feature: "whatsapp_embedded_signup", sessionInfoVersion: "3" },
      }
    );

    async function handleWhatsAppLoginResponse(response: any) {
      window.removeEventListener("message", messageListener);

      const code = response?.authResponse?.code;
      if (!code) {
        setConnectingWhatsApp(false);
        toast("WhatsApp connection was cancelled.", "info");
        return;
      }
      // NOTE: we deliberately do NOT abort here if capturedWabaId/
      // capturedPhoneNumberId are missing — see the comment above the
      // listener. We always attempt the connect call; the backend either
      // uses what we captured or discovers it independently via Graph
      // API. This is what actually reaches Railway's logs now, instead of
      // silently stopping in the browser before any request is sent.
      if (!capturedWabaId || !capturedPhoneNumberId) {
        toast("Finishing connection — verifying with Meta…", "info");
      }

      try {
        const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
        const res = await fetch(`${apiUrl}/api/whatsapp/connect`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
          body: JSON.stringify({
            code,
            ...(capturedWabaId ? { wabaId: capturedWabaId } : {}),
            ...(capturedPhoneNumberId ? { phoneNumberId: capturedPhoneNumberId } : {}),
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Failed to connect WhatsApp");
        toast("WhatsApp connected successfully! ✓", "success");
        window.location.reload();
      } catch (err: any) {
        toast(err?.message || "Failed to connect WhatsApp. Please try again.", "error");
      } finally {
        setConnectingWhatsApp(false);
      }
    }
  };

  const disconnectWhatsApp = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const res = await fetch(`${apiUrl}/api/whatsapp/disconnect`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to disconnect");
      toast("WhatsApp disconnected.", "info");
      window.location.reload();
    } catch {
      toast("Failed to disconnect WhatsApp. Please try again.", "error");
    }
  };

  const connectFacebook = () => {
    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
    window.location.href = `${apiUrl}/api/auth/facebook?token=${token || ""}`;
  };

  const disconnectFacebook = async () => {
    if (!window.confirm("Disconnect Facebook Messenger? You'll need to reconnect and re-approve access to reply to Messenger conversations again.")) return;
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
      await fetch(`${apiUrl}/api/user/disconnect/facebook`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      toast("Facebook disconnected.", "success");
      window.location.reload();
    } catch {
      toast("Failed to disconnect Facebook.", "error");
    }
  };

  const connectInstagram = () => {
    if (!facebookConnected) {
      toast("Connect Facebook Messenger first — Instagram DMs connect automatically through your linked Page.", "info");
    }
    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
    window.location.href = `${apiUrl}/api/auth/facebook?token=${token || ""}`;
  };

  const disconnectInstagram = async () => {
    if (!window.confirm("Disconnect Instagram DMs? You'll need to reconnect to reply to Instagram conversations again.")) return;
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
      await fetch(`${apiUrl}/api/user/disconnect/instagram`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      toast("Instagram disconnected.", "success");
      window.location.reload();
    } catch {
      toast("Failed to disconnect Instagram.", "error");
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


  const channels = [
    {
      id:          "whatsapp",
      name:        "WhatsApp Business",
      description: whatsappConnected
        ? "Connected — messages to your WhatsApp Business number appear in your inbox."
        : "Connect your own WhatsApp Business account via Meta.",
      icon:        <MessageSquare size={18} />,
      connected:   whatsappConnected,
      enabled:     whatsappConnected,
      // No separate "paused" state exists for WhatsApp on the backend
      // (unlike Facebook, which has a real enabled/disabled flag
      // independent of the connection itself) — so the toggle here IS
      // the connect/disconnect control, not a second, different thing.
      // Previously this was a no-op (`() => {}`), meaning the toggle sat
      // there looking interactive but did nothing at all.
      onToggle:    (val: boolean) => { if (!val) disconnectWhatsApp(); },
      onConnect:   connectWhatsApp,
      onDisconnect: undefined, // folded into the toggle above — no separate control needed
    },
    {
      id:          "facebook",
      name:        "Facebook Messenger",
      description: facebookConnected
        ? (facebookEnabled ? `Connected — replying via ${user?.facebookPageName || "your Page"}` : `Paused — ${user?.facebookPageName || "your Page"} won't receive AI replies`)
        : "Respond to Messenger conversations from your Page",
      icon:        <MessageSquare size={18} />,
      connected:   facebookConnected,
      enabled:     facebookEnabled,
      onToggle:    (val: boolean) => {
        setFacebookEnabled(val).then(() => {
          toast(val ? "Facebook Messenger enabled." : "Facebook Messenger paused.", val ? "success" : "info");
        });
      },
      onConnect:   connectFacebook,
      onDisconnect: disconnectFacebook,
    },
    {
      id:          "instagram",
      name:        "Instagram DMs",
      description: instagramConnected
        ? (instagramEnabled ? `Connected — replying via @${user?.instagramUsername || "your account"}` : `Paused — @${user?.instagramUsername || "your account"} won't receive AI replies`)
        : (facebookConnected ? "No Instagram account linked to your Page yet — click Connect to check again" : "Respond to Instagram DMs — connects automatically via your Facebook Page"),
      icon:        <Instagram size={18} />,
      connected:   instagramConnected,
      enabled:     instagramEnabled,
      onToggle:    (val: boolean) => {
        setInstagramEnabled(val).then(() => {
          toast(val ? "Instagram DMs enabled." : "Instagram DMs paused.", val ? "success" : "info");
        });
      },
      onConnect:   connectInstagram,
      onDisconnect: disconnectInstagram,
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
      <SectionHeader title="Channel integrations" subtitle="Manage where your support agent listens and responds." />

      {/* ── Live Chat install guide (popup) ─────────────────────────────────── */}
      <AnimatePresence>
        {showEmbed && embedCode && (
          <LiveChatInstallModal embedCode={embedCode} onClose={() => setShowEmbed(false)} />
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left — Channel list */}
        <div className="lg:col-span-2">
          <div className="mb-6">
            <h3 className="text-[11px] font-bold text-text-muted uppercase tracking-widest mb-4">Available channels</h3>
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
                    onConnect={ch.id === "livechat" && ch.connected ? connectLivechat : ch.onConnect}
                    onDisconnect={ch.onDisconnect}
                  />
                  {ch.id === "livechat" && ch.connected && (
                    <button
                      onClick={() => setShowEmbed(v => !v)}
                      className="absolute right-16 top-1/2 -translate-y-1/2 text-[11px] font-bold text-teal hover:underline flex items-center gap-1"
                    >
                      <Copy size={10} /> Install on your website
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
            + Request custom webhook
          </Button>
        </div>

        {/* Right — Settings */}
        <div className="space-y-6">
          <Card>
            <div className="flex items-center gap-3 mb-6">
              <Zap size={16} className="text-brand" />
              <h3 className="text-[13px] font-bold text-text-primary">Automation settings</h3>
            </div>
            <div className="space-y-5">
              {[
                { label: "AI auto-drafting", sub: "Draft replies instantly", val: aiAutoDrafting, set: setAiAutoDrafting },
                { label: "Auto-classification", sub: "Apply tags automatically", val: autoClassification, set: setAutoClassification },
                { label: "Sentiment tracking", sub: "Real-time tone analysis", val: sentimentTracking, set: setSentimentTracking },
                ...(instagramConnected ? [
                  { label: "Instagram auto-send", sub: "Sends automatically, no approval step", val: instagramAutoSend, set: saveInstagramAutoSend },
                ] : []),
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

// ── Live Chat install guide ─────────────────────────────────
// Shown when a business connects Web Live Chat (or clicks "Install on your
// website"). Written for non-technical owners: copy one line, then follow the
// steps for the platform their site is built on.
type Platform = "html" | "wordpress" | "shopify" | "wix" | "squarespace";

const PLATFORMS: { key: Platform; label: string; steps: React.ReactNode[] }[] = [
  {
    key: "html",
    label: "Any website",
    steps: [
      <>Open your website's HTML. If every page shares one footer or layout file, use that file.</>,
      <>Find the closing <Code>&lt;/body&gt;</Code> tag near the bottom.</>,
      <>Paste the code on the line just above <Code>&lt;/body&gt;</Code>.</>,
      <>Save and publish (or upload) the updated file.</>,
    ],
  },
  {
    key: "wordpress",
    label: "WordPress",
    steps: [
      <>In your WordPress dashboard, go to <b>Plugins → Add New</b>, search for <b>WPCode</b> and click <b>Install</b>, then <b>Activate</b>.</>,
      <>Go to <b>Code Snippets → Header &amp; Footer</b>.</>,
      <>Paste the code into the <b>Footer</b> box.</>,
      <>Click <b>Save Changes</b>.</>,
    ],
  },
  {
    key: "shopify",
    label: "Shopify",
    steps: [
      <>In Shopify admin, go to <b>Online Store → Themes</b>.</>,
      <>Next to your current theme, click <b>⋯</b> and choose <b>Edit code</b>.</>,
      <>Under <b>Layout</b>, open <b>theme.liquid</b>.</>,
      <>Paste the code just above <Code>&lt;/body&gt;</Code>, then click <b>Save</b>.</>,
    ],
  },
  {
    key: "wix",
    label: "Wix",
    steps: [
      <>In your Wix dashboard, go to <b>Settings → Custom Code</b> (under Advanced). This needs a Premium plan and a connected domain.</>,
      <>Click <b>+ Add Custom Code</b> and paste the code.</>,
      <>Choose <b>All pages</b> and <b>Load code once</b>.</>,
      <>Under <b>Place code in</b>, choose <b>Body - end</b>, then click <b>Apply</b>.</>,
    ],
  },
  {
    key: "squarespace",
    label: "Squarespace",
    steps: [
      <>Go to <b>Settings → Advanced → Code Injection</b> (on newer versions: <b>Website → Website Tools → Code Injection</b>).</>,
      <>Paste the code into the <b>Footer</b> box.</>,
      <>Click <b>Save</b>.</>,
    ],
  },
];

function Code({ children }: { children: React.ReactNode }) {
  return <code className="font-mono text-[11px] bg-surface-high px-1 py-0.5 rounded">{children}</code>;
}

// The server hands back the full embed tag; we only need its script URL and
// token so the business can personalise the name and colour below.
function parseEmbed(embedCode: string) {
  const src = embedCode.match(/src="([^"]+)"/)?.[1] ?? "";
  const token = embedCode.match(/data-token="([^"]+)"/)?.[1] ?? "";
  return { src, token };
}

const cleanAttr = (v: string) => v.replace(/["<>&]/g, "").trim();

const LiveChatInstallModal = ({ embedCode, onClose }: { embedCode: string; onClose: () => void }) => {
  const { toast } = useToast();
  const { src, token } = React.useMemo(() => parseEmbed(embedCode), [embedCode]);
  const [platform, setPlatform] = React.useState<Platform>("html");
  const [name, setName] = React.useState("Support");
  const [color, setColor] = React.useState("#16A34A");
  const [copiedWhat, setCopiedWhat] = React.useState<"code" | "dev" | null>(null);

  const code = src && token
    ? `<script src="${src}" data-token="${token}" data-name="${cleanAttr(name) || "Support"}" data-color="${color}"></script>`
    : embedCode;

  const devInstructions =
    `Hi, please add our CareAgent live chat to our website.\n\n` +
    `Paste this line just before the closing </body> tag on every page (or in the shared footer/layout):\n\n` +
    `${code}\n\n` +
    `A chat bubble will appear in the bottom-right corner. Messages from it arrive in our CareAgent inbox.`;

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const copy = async (text: string, what: "code" | "dev") => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedWhat(what);
      toast(what === "code" ? "Code copied" : "Instructions copied — paste them to your developer", "success");
      setTimeout(() => setCopiedWhat(null), 2000);
    } catch {
      toast("Couldn't copy automatically. Select the text and copy it manually.", "error");
    }
  };

  const steps = PLATFORMS.find(p => p.key === platform)!.steps;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="livechat-install-title"
    >
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.98 }}
        transition={{ duration: 0.2 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-border-faint bg-bg shadow-2xl"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-border-faint bg-bg px-6 py-5">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand/10 flex items-center justify-center text-brand shrink-0">
              <Globe size={18} />
            </div>
            <div>
              <h2 id="livechat-install-title" className="text-[16px] font-bold text-text-primary">Add live chat to your website</h2>
              <p className="text-[12px] text-text-muted mt-0.5">Takes about 5 minutes. Messages from your site will arrive in your CareAgent inbox.</p>
            </div>
          </div>
          <button onClick={onClose} className="text-text-muted hover:text-text-primary p-1" aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-6 space-y-8">
          {/* Step 1 — personalise */}
          <section className="space-y-3">
            <StepTitle n={1} title="Choose how the chat looks" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="block">
                <span className="text-[11px] font-bold text-text-muted uppercase tracking-wide">Chat title</span>
                <input
                  id="livechat-name"
                  value={name}
                  onChange={(e) => setName(e.target.value.slice(0, 40))}
                  placeholder="Support"
                  className="mt-1.5 w-full h-10 rounded-xl border border-border-mid bg-bg px-3 text-[13px] text-text-primary outline-none focus:border-brand"
                />
              </label>
              <label className="block">
                <span className="text-[11px] font-bold text-text-muted uppercase tracking-wide">Colour</span>
                <div className="mt-1.5 flex items-center gap-2 h-10 rounded-xl border border-border-mid bg-bg px-2">
                  <input
                    id="livechat-color"
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="h-7 w-9 cursor-pointer rounded border-0 bg-transparent p-0"
                  />
                  <span className="font-mono text-[12px] text-text-second">{color.toUpperCase()}</span>
                </div>
              </label>
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-surface border border-border-faint px-4 py-3">
              <span className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: color }}>
                <MessageSquare size={18} className="text-white" />
              </span>
              <div className="text-[12px] text-text-second">
                Visitors will see this bubble in the bottom-right corner. The chat window is titled <b className="text-text-primary">{cleanAttr(name) || "Support"}</b>.
              </div>
            </div>
          </section>

          {/* Step 2 — copy the code */}
          <section className="space-y-3">
            <StepTitle n={2} title="Copy your chat code" />
            <div className="rounded-xl border border-border-mid bg-surface p-4">
              <code className="block font-mono text-[12px] text-text-second break-all leading-relaxed">{code}</code>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="brand" onClick={() => copy(code, "code")} className="rounded-xl">
                {copiedWhat === "code" ? <Check size={14} className="mr-1.5" /> : <Copy size={14} className="mr-1.5" />}
                {copiedWhat === "code" ? "Copied" : "Copy code"}
              </Button>
              <Button variant="default" onClick={() => copy(devInstructions, "dev")} className="rounded-xl">
                {copiedWhat === "dev" ? <Check size={14} className="mr-1.5" /> : <Copy size={14} className="mr-1.5" />}
                Copy instructions for my developer
              </Button>
            </div>
            <p className="text-[11px] text-text-muted">This code is unique to your account. It's safe to put on your public website.</p>
          </section>

          {/* Step 3 — paste it on the site */}
          <section className="space-y-3">
            <StepTitle n={3} title="Add it to your website" />
            <div className="flex flex-wrap gap-2" role="tablist" aria-label="Website platform">
              {PLATFORMS.map(p => (
                <button
                  key={p.key}
                  role="tab"
                  aria-selected={platform === p.key}
                  onClick={() => setPlatform(p.key)}
                  className={`px-3.5 py-2 rounded-full text-[12px] font-bold border transition-colors ${
                    platform === p.key
                      ? "bg-brand text-white border-brand"
                      : "bg-bg text-text-second border-border-mid hover:border-brand/50"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
            <ol className="space-y-2.5">
              {steps.map((step, i) => (
                <li key={i} className="flex items-start gap-3 text-[13px] text-text-second leading-relaxed">
                  <span className="mt-0.5 w-5 h-5 rounded-full bg-surface-high text-text-primary text-[11px] font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </section>

          {/* Step 4 — test */}
          <section className="space-y-3">
            <StepTitle n={4} title="Check it works" />
            <ol className="space-y-2.5">
              {[
                "Open your website in a new browser tab and refresh the page.",
                "Look for the chat bubble in the bottom-right corner and send a test message.",
                "Open Inbox in CareAgent and choose Website — your message should be there within a few seconds.",
              ].map((t, i) => (
                <li key={i} className="flex items-start gap-3 text-[13px] text-text-second leading-relaxed">
                  <span className="mt-0.5 w-5 h-5 rounded-full bg-surface-high text-text-primary text-[11px] font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                  <span>{t}</span>
                </li>
              ))}
            </ol>
            <p className="text-[11px] text-text-muted">
              No bubble? Clear your browser cache or try a private window. Some site builders only show custom code on the published site, not in the editor preview.
            </p>
          </section>
        </div>

        <div className="sticky bottom-0 flex justify-end border-t border-border-faint bg-bg px-6 py-4">
          <Button variant="primary" onClick={onClose} className="rounded-xl px-6">Done</Button>
        </div>
      </motion.div>
    </motion.div>
  );
};

const StepTitle = ({ n, title }: { n: number; title: string }) => (
  <h3 className="flex items-center gap-2.5 text-[14px] font-bold text-text-primary">
    <span className="w-6 h-6 rounded-full bg-brand text-white text-[12px] font-bold flex items-center justify-center">{n}</span>
    {title}
  </h3>
);
