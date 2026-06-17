import * as React from "react";
import { motion } from "motion/react";
import { SectionHeader } from "../components/SectionHeader";
import { Card } from "../components/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { useAppStore } from "../store";
import { CreditCard, Zap, Sparkles, CheckCircle2, ArrowRight, ExternalLink, Building } from "lucide-react";

const PLANS = [
  {
    id: "startup",
    name: "Startup",
    price: "$0",
    period: "/mo",
    icon: Zap,
    color: "text-text-muted",
    bg: "bg-surface-high",
    features: ["100 AI Resolutions/month", "2 KB Sources", "Email Integration", "Basic Dashboard"],
  },
  {
    id: "growth",
    name: "Growth",
    price: "$20",
    period: "/mo",
    icon: Sparkles,
    color: "text-brand",
    bg: "bg-brand/10",
    popular: true,
    features: ["2,500 AI Resolutions/month", "Unlimited KB Docs", "WhatsApp & Slack", "SSO Login", "Priority Support"],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "Custom",
    period: "",
    icon: Building,
    color: "text-purple",
    bg: "bg-purple/10",
    features: ["Custom AI Resolutions", "Private Deployment", "Audit Logging", "Account Manager", "SLA Guarantee"],
  },
];

export const Billing = () => {
  const { token, user } = useAppStore();
  const [currentPlan, setCurrentPlan] = React.useState<string>("startup");
  const [loading, setLoading] = React.useState(false);
  const [portalLoading, setPortalLoading] = React.useState(false);

  const apiUrl = (import.meta.env.VITE_API_URL || 'https://careagent-ai-be-production.up.railway.app').replace(/\/+$/, '');

  React.useEffect(() => {
    if (!token) return;

    // Check if returning from successful Stripe checkout
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get('session_id');
    const planParam = params.get('plan');

    // If returning from Stripe, sync plan from Stripe then fetch
    const syncAndFetch = async () => {
      if (sessionId) {
        // Tell backend to sync this session
        await fetch(`${apiUrl}/api/stripe/sync-session`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ sessionId }),
        }).catch(() => {});
        // Clean URL
        window.history.replaceState({}, '', '/billing');
      }
      // Fetch current plan
      const res = await fetch(`${apiUrl}/api/stripe/plan`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const d = await res.json();
      if (d.plan) setCurrentPlan(d.plan);
    };

    syncAndFetch().catch(console.error);
  }, [token]);

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/api/stripe/create-checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch (err) {
      console.error('Checkout error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePortal = async () => {
    setPortalLoading(true);
    try {
      const res = await fetch(`${apiUrl}/api/stripe/portal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.url) window.open(data.url, '_blank');
    } catch (err) {
      console.error('Portal error:', err);
    } finally {
      setPortalLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.18 }}
      className="p-8 max-w-[1000px] mx-auto"
    >
      <div className="flex items-start justify-between mb-8">
        <SectionHeader
          title="Billing & Plans"
          subtitle="Manage your subscription and usage."
        />
        {currentPlan !== "startup" && (
          <Button variant="surface" size="sm" onClick={handlePortal} disabled={portalLoading}>
            <CreditCard size={13} className="mr-2" />
            {portalLoading ? "Opening..." : "Manage Billing"}
            <ExternalLink size={11} className="ml-1.5 text-text-muted" />
          </Button>
        )}
      </div>

      {/* Current plan banner */}
      <Card className="mb-8 flex items-center justify-between bg-brand/5 border-brand/20">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-brand/15 flex items-center justify-center">
            <Sparkles size={18} className="text-brand" />
          </div>
          <div>
            <div className="text-[13px] font-black text-text-primary">
              Current Plan: <span className="text-brand capitalize">{currentPlan}</span>
            </div>
            <div className="text-[11px] text-text-muted mt-0.5">
              {currentPlan === "startup" ? "You're on the free plan. Upgrade to unlock more." : "Your subscription is active."}
            </div>
          </div>
        </div>
        {currentPlan === "startup" && (
          <Button variant="brand" size="sm" onClick={handleUpgrade} disabled={loading} className="shadow-glow">
            {loading ? "Redirecting..." : "Upgrade to Growth"} <ArrowRight size={13} className="ml-1.5" />
          </Button>
        )}
      </Card>

      {/* Plans grid */}
      <div className="grid grid-cols-3 gap-5">
        {PLANS.map(plan => {
          const Icon = plan.icon;
          const isActive = currentPlan === plan.id;
          return (
            <motion.div
              key={plan.id}
              whileHover={{ y: -4 }}
              className={`rounded-2xl border-2 p-6 flex flex-col transition-all ${
                isActive
                  ? "border-brand bg-brand/5 shadow-glow"
                  : "border-border-faint bg-surface hover:border-border-mid"
              }`}
            >
              {plan.popular && (
                <div className="text-[9px] font-black uppercase tracking-widest text-brand bg-brand/10 px-2.5 py-1 rounded-full w-fit mb-3">Most Popular</div>
              )}
              <div className={`w-10 h-10 rounded-xl ${plan.bg} flex items-center justify-center mb-4`}>
                <Icon size={18} className={plan.color} />
              </div>
              <div className="text-[15px] font-black text-text-primary mb-1">{plan.name}</div>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-2xl font-black text-text-primary">{plan.price}</span>
                <span className="text-[12px] text-text-muted">{plan.period}</span>
              </div>
              <div className="space-y-2 flex-1 mb-6">
                {plan.features.map(f => (
                  <div key={f} className="flex items-start gap-2 text-[12px] text-text-muted">
                    <CheckCircle2 size={12} className="text-brand mt-0.5 flex-shrink-0" />
                    {f}
                  </div>
                ))}
              </div>
              {isActive ? (
                <Badge variant="success" size="sm" className="w-full justify-center py-2">Current Plan</Badge>
              ) : plan.id === "growth" ? (
                <Button variant="brand" size="sm" className="w-full shadow-glow" onClick={handleUpgrade} disabled={loading}>
                  {loading ? "Redirecting..." : "Upgrade Now"}
                </Button>
              ) : plan.id === "enterprise" ? (
                <Button variant="surface" size="sm" className="w-full" onClick={() => {
                  const email = user?.email || '';
                  const subject = encodeURIComponent('Enterprise Plan Inquiry – CareAgent');
                  const body = encodeURIComponent(`Hi CareAgent Sales Team,\n\nI'm interested in the Enterprise plan.\n\nMy account email: ${email}\n\nPlease get in touch to discuss pricing and requirements.\n\nThanks`);
                  window.location.href = `mailto:support@careagent.ai?subject=${subject}&body=${body}`;
                }}>
                  Contact Sales
                </Button>
              ) : (
                <Button variant="surface" size="sm" className="w-full" disabled>Free Forever</Button>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Usage note */}
      <p className="text-[11px] text-text-disabled text-center mt-8">
        Payments are processed securely by Stripe. Test mode active — use card <span className="font-mono">4242 4242 4242 4242</span>.
      </p>
    </motion.div>
  );
};
