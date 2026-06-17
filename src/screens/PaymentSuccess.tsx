import * as React from "react";
import { motion } from "motion/react";
import { CheckCircle2, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "../components/ui/Button";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "../store";

export const PaymentSuccess = () => {
  const navigate = useNavigate();
  const { token } = useAppStore();

  React.useEffect(() => {
    // Auto-redirect to dashboard after 5s
    const timer = setTimeout(() => navigate("/dashboard"), 5000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-md w-full bg-surface border border-border-faint rounded-3xl p-10 text-center shadow-2xl"
      >
        {/* Success icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="w-20 h-20 rounded-full bg-brand/10 border-2 border-brand/20 flex items-center justify-center mx-auto mb-6"
        >
          <CheckCircle2 size={40} className="text-brand" />
        </motion.div>

        <h1 className="text-3xl font-black text-text-primary tracking-tight mb-3">
          You're on Growth! 🎉
        </h1>
        <p className="text-text-muted mb-8 leading-relaxed">
          Your subscription is active. You now have access to 2,500 AI resolutions, unlimited knowledge base docs, and all Growth features.
        </p>

        <div className="bg-brand/5 border border-brand/15 rounded-2xl p-4 mb-8 text-left space-y-2">
          {["2,500 AI Resolutions/month", "Unlimited KB Documents", "WhatsApp & Slack (coming soon)", "SSO Login", "Priority Support"].map(f => (
            <div key={f} className="flex items-center gap-2 text-[13px] text-text-second">
              <Sparkles size={12} className="text-brand flex-shrink-0" />
              {f}
            </div>
          ))}
        </div>

        <Button
          variant="brand"
          size="lg"
          className="w-full shadow-glow"
          onClick={() => navigate("/dashboard")}
        >
          Go to Dashboard <ArrowRight size={16} className="ml-2" />
        </Button>

        <p className="text-[11px] text-text-disabled mt-4">
          Redirecting automatically in 5 seconds...
        </p>
      </motion.div>
    </div>
  );
};
