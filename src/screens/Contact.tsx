import * as React from "react";
import { motion } from "motion/react";
import { Send, Building, Mail, User, MessageSquare, CheckCircle2, ArrowLeft } from "lucide-react";
import { Button } from "../components/ui/Button";
import { useAppStore } from "../store";
import { useNavigate } from "react-router-dom";

export const Contact = () => {
  const { user } = useAppStore();
  const navigate = useNavigate();
  const [form, setForm] = React.useState({
    name: user?.email?.split("@")[0] || "",
    email: user?.email || "",
    company: "",
    message: "Hi, I'm interested in the Enterprise plan. I'd like to discuss pricing and requirements for my team.",
  });
  const [sending, setSending] = React.useState(false);
  const [sent, setSent] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    // Simulate sending — in production wire to an email service
    await new Promise(r => setTimeout(r, 1200));
    setSending(false);
    setSent(true);
  };

  if (sent) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-surface border border-border-faint rounded-3xl p-10 text-center shadow-xl"
        >
          <div className="w-16 h-16 rounded-full bg-brand/10 border-2 border-brand/20 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={32} className="text-brand" />
          </div>
          <h2 className="text-2xl font-black text-text-primary mb-3">Message sent!</h2>
          <p className="text-text-muted mb-8">Our sales team will get back to you within 4 business hours at <span className="font-semibold text-text-primary">{form.email}</span>.</p>
          <Button variant="brand" className="w-full shadow-glow" onClick={() => navigate("/billing")}>
            Back to Billing
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="max-w-lg w-full"
      >
        {/* Back */}
        <button
          onClick={() => navigate("/billing")}
          className="flex items-center gap-2 text-[12px] font-semibold text-text-muted hover:text-text-primary mb-6 transition-colors"
        >
          <ArrowLeft size={14} /> Back to Billing
        </button>

        <div className="bg-surface border border-border-faint rounded-3xl p-8 shadow-xl">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-brand/10 flex items-center justify-center">
              <Building size={22} className="text-brand" />
            </div>
            <div>
              <h1 className="text-xl font-black text-text-primary">Contact Sales</h1>
              <p className="text-[12px] text-text-muted">Enterprise plan — custom pricing & deployment</p>
            </div>
          </div>

          {/* What you get callout */}
          <div className="bg-brand/5 border border-brand/15 rounded-2xl p-4 mb-6">
            <div className="text-[11px] font-black text-brand uppercase tracking-widest mb-2">Enterprise includes</div>
            <div className="grid grid-cols-2 gap-1.5">
              {["Custom AI Resolutions", "Private Deployment", "Audit Logging", "Account Manager", "SLA Guarantee", "Custom Integrations"].map(f => (
                <div key={f} className="flex items-center gap-1.5 text-[11px] text-text-muted">
                  <CheckCircle2 size={10} className="text-brand flex-shrink-0" />{f}
                </div>
              ))}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-bold text-text-muted uppercase tracking-wide mb-1.5 block">Name</label>
                <div className="relative">
                  <User size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                  <input
                    required
                    type="text"
                    value={form.name}
                    onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                    className="w-full bg-bg border border-border-mid rounded-xl h-10 pl-8 pr-3 text-[13px] text-text-primary outline-none focus:border-brand/50 transition-colors"
                    placeholder="Your name"
                  />
                </div>
              </div>
              <div>
                <label className="text-[11px] font-bold text-text-muted uppercase tracking-wide mb-1.5 block">Email</label>
                <div className="relative">
                  <Mail size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                  <input
                    required
                    type="email"
                    value={form.email}
                    onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                    className="w-full bg-bg border border-border-mid rounded-xl h-10 pl-8 pr-3 text-[13px] text-text-primary outline-none focus:border-brand/50 transition-colors"
                    placeholder="work@company.com"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-text-muted uppercase tracking-wide mb-1.5 block">Company</label>
              <div className="relative">
                <Building size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                  type="text"
                  value={form.company}
                  onChange={e => setForm(p => ({ ...p, company: e.target.value }))}
                  className="w-full bg-bg border border-border-mid rounded-xl h-10 pl-8 pr-3 text-[13px] text-text-primary outline-none focus:border-brand/50 transition-colors"
                  placeholder="Company name (optional)"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-text-muted uppercase tracking-wide mb-1.5 block">Message</label>
              <div className="relative">
                <MessageSquare size={13} className="absolute left-3 top-3 text-text-muted" />
                <textarea
                  required
                  value={form.message}
                  onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                  rows={4}
                  className="w-full bg-bg border border-border-mid rounded-xl pl-8 pr-3 py-2.5 text-[13px] text-text-primary outline-none focus:border-brand/50 transition-colors resize-none"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="brand"
              size="lg"
              className="w-full shadow-glow"
              disabled={sending}
            >
              {sending ? (
                "Sending..."
              ) : (
                <><Send size={14} className="mr-2" /> Send Message</>
              )}
            </Button>

            <p className="text-[10px] text-text-disabled text-center">
              We respond within 4 business hours · support@careagent.ai
            </p>
          </form>
        </div>
      </motion.div>
    </div>
  );
};
