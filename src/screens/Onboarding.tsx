import * as React from "react";
import { motion } from "motion/react";
import { SectionHeader } from "../components/SectionHeader";
import { Card } from "../components/Card";
import { Button } from "../components/ui/Button";
import { useNavigate } from "react-router-dom";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { useAppStore } from "../store";

export const Onboarding = () => {
  const navigate = useNavigate();
  const { businessIdentity, setBusinessIdentity, brandVoice, setBrandVoice, saveKnowledgeBase } = useAppStore();
  const [saving, setSaving] = React.useState(false);
  const [saved, setSaved] = React.useState(false);

  const handleSave = async () => {
    setSaving(true);
    await saveKnowledgeBase();
    setSaving(false);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      navigate("/knowledge-base");
    }, 800);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-8 max-w-[800px] mx-auto h-full flex flex-col"
    >
      <SectionHeader 
        title="The 5-Minute Setup" 
        subtitle="Define your Business Identity and Brand Voice to launch your AI."
      />

      <div className="mt-8 space-y-6">
        <Card>
          <h3 className="text-[14px] font-bold text-text-primary mb-2">1. Business Identity</h3>
          <p className="text-[12px] text-text-muted mb-4">Briefly describe what your company does and who your customers are.</p>
          <textarea
            className="w-full h-32 bg-bg border border-border-mid rounded-xl p-4 text-[13px] text-text-primary outline-none focus:border-brand transition-colors resize-none"
            value={businessIdentity}
            onChange={(e) => setBusinessIdentity(e.target.value)}
            placeholder="e.g. We sell high-end coffee beans to enthusiasts..."
          />
        </Card>

        <Card>
          <h3 className="text-[14px] font-bold text-text-primary mb-2">2. Brand Voice</h3>
          <p className="text-[12px] text-text-muted mb-4">How should the AI sound? (e.g. Casual, Professional, Witty)</p>
          <textarea
            className="w-full h-32 bg-bg border border-border-mid rounded-xl p-4 text-[13px] text-text-primary outline-none focus:border-brand transition-colors resize-none"
            value={brandVoice}
            onChange={(e) => setBrandVoice(e.target.value)}
            placeholder="e.g. Friendly, concise, no jargon."
          />
        </Card>

        <div className="flex justify-end">
          <Button
            variant="primary"
            size="lg"
            className="px-8 shadow-glow"
            onClick={handleSave}
            disabled={saving}
          >
            {saved
              ? <><CheckCircle2 size={16} className="mr-2" /> Saved!</>
              : saving
              ? "Saving..."
              : <> Save & Continue <ArrowRight className="ml-2" size={16} /></>
            }
          </Button>
        </div>
      </div>
    </motion.div>
  );
};
