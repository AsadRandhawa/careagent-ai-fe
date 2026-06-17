import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Building2, MessageSquareText, FileText, Mail, ArrowRight, ArrowLeft, Bot, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "./ui/Button";
import { useAppStore } from "../store";
import { useNavigate } from "react-router-dom";
import { useToast } from "./ToastProvider";

const steps = [
  { id: "plan", icon: CreditCard, title: "Choose Plan", desc: "Free or Growth?" },
  { id: "business", icon: Building2, title: "Business Identity", desc: "What do you do?" },
  { id: "voice", icon: MessageSquareText, title: "Brand Voice", desc: "How do you sound?" },
  { id: "docs", icon: FileText, title: "First Document", desc: "Upload knowledge" },
  { id: "connect", icon: Mail, title: "Connect Gmail", desc: "Start automating" }
];

export const OnboardingModal = () => {
  const { showOnboarding, setShowOnboarding, businessIdentity, setBusinessIdentity, brandVoice, setBrandVoice, setDocuments, token } = useAppStore();
  const [currentStep, setCurrentStep] = React.useState(0);
  const [isTyping, setIsTyping] = React.useState(false);
  const [isUploading, setIsUploading] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Mock live typing effect for brand voice preview
  const [previewText, setPreviewText] = React.useState("Hello! How can I help you today?");
  
  React.useEffect(() => {
    if (currentStep === 2) {
      setIsTyping(true);
      const timer = setTimeout(() => {
        setIsTyping(false);
        if (brandVoice.toLowerCase().includes("professional")) {
          setPreviewText("Greetings. Thank you for reaching out to our support team. How may I assist you with your inquiry today?");
        } else if (brandVoice.toLowerCase().includes("friendly") || brandVoice.toLowerCase().includes("casual")) {
          setPreviewText("Hey there! 👋 Thanks for reaching out! What's up and how can I help?");
        } else {
          setPreviewText("Hello! Thanks for your message. How can I help you today?");
        }
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [brandVoice, currentStep]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);

    const sizeStr = file.size > 1024 * 1024
      ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
      : `${(file.size / 1024).toFixed(0)} KB`;

    try {
      let textContent = "";
      const arrayBuffer = await file.arrayBuffer();

      if (file.name.endsWith(".docx")) {
        const result = await mammoth.extractRawText({ arrayBuffer });
        textContent = result.value;
      } else if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        for (let p = 1; p <= pdf.numPages; p++) {
          const page = await pdf.getPage(p);
          const content = await page.getTextContent();
          textContent += content.items.map((i: any) => i.str).join(" ") + "\n";
        }
      } else {
        textContent = await file.text();
      }

      const doc = {
        name: file.name,
        size: sizeStr,
        chunks: Math.ceil(textContent.length / 500),
        status: "Active" as const,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
        type: file.type,
        textContent,
      };

      setDocuments([doc]);
      // Explicitly save to DB immediately
      const state = useAppStore.getState();
      if (state.token) {
        const apiUrl = (import.meta.env.VITE_API_URL || 'https://careagent-ai-be-production.up.railway.app').replace(/\/+$/, '');
        await fetch(`${apiUrl}/api/user/knowledge-base`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${state.token}` },
          body: JSON.stringify({
            documents: [{ ...doc, base64: undefined }],
            businessIdentity: state.businessIdentity,
            brandVoice: state.brandVoice,
          }),
        });
      }

      toast("Document processed successfully!", "success");
      setCurrentStep(3);
    } catch (err) {
      console.error("File parse error:", err);
      toast("Failed to read document. Try a .txt or .docx file.", "error");
    } finally {
      setIsUploading(false);
    }
  };

  const handleConnectGmail = () => {
    const state = useAppStore.getState();
    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
    window.location.href = `${apiUrl}/api/auth/google?token=${state.token || ""}`;
  };

  const handleStripeCheckout = async () => {
    try {
      const apiUrl = (import.meta.env.VITE_API_URL || 'https://careagent-ai-be-production.up.railway.app').replace(/\/+$/, '');
      const res = await fetch(`${apiUrl}/api/stripe/create-checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch (err) {
      console.error('Stripe error:', err);
    }
  };

  const handleComplete = () => {
    setShowOnboarding(false);
    toast("Setup complete! Welcome to CareAgent.", "success");
    navigate("/dashboard");
  };

  if (!showOnboarding) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-bg/90 backdrop-blur-md"
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-4xl bg-bg border border-border-faint rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row h-[600px]"
      >
        {/* Left Sidebar Steps */}
        <div className="w-full md:w-[280px] bg-surface-high border-r border-border-faint p-6 flex flex-col">
          <div className="flex items-center gap-2 mb-10">
            <div className="w-8 h-8 rounded-lg bg-brand flex items-center justify-center shadow-glow">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <span className="text-[16px] font-black text-text-primary tracking-tight">CareAgent Setup</span>
          </div>

          <div className="flex-1 space-y-6">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              const isActive = currentStep === idx;
              const isPast = currentStep > idx;
              return (
                <div key={step.id} className={`flex items-start gap-4 transition-opacity duration-300 ${isActive ? "opacity-100" : isPast ? "opacity-60" : "opacity-30"}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${isActive ? "bg-brand text-white shadow-glow" : isPast ? "bg-brand/20 text-brand" : "bg-surface border border-border-strong text-text-muted"}`}>
                    {isPast ? <CheckCircle2 size={16} /> : <Icon size={16} />}
                  </div>
                  <div>
                    <div className={`text-[13px] font-bold ${isActive ? "text-text-primary" : "text-text-muted"}`}>{step.title}</div>
                    <div className="text-[11px] text-text-second mt-0.5">{step.desc}</div>
                  </div>
                </div>
              );
            })}
          </div>
          
          <button onClick={() => setShowOnboarding(false)} className="text-[11px] font-bold text-text-muted hover:text-text-primary text-left mt-auto uppercase tracking-widest">
            Skip for now
          </button>
        </div>

        {/* Right Content Area */}
        <div className="flex-1 flex flex-col p-8 lg:p-12 relative overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="flex-1 flex flex-col"
            >
              {/* Step 0: Choose Plan */}
              {currentStep === 0 && (
                <div className="flex-1 flex flex-col justify-center items-center text-center">
                  <div className="inline-block px-3 py-1 rounded-full bg-brand/10 text-brand text-[10px] font-black uppercase tracking-widest mb-4">Step 00</div>
                  <h2 className="text-3xl font-black text-text-primary tracking-tight mb-2">Pick your plan</h2>
                  <p className="text-sm text-text-muted mb-8 max-w-md">Start free and upgrade anytime. No credit card required for Startup.</p>
                  <div className="grid grid-cols-2 gap-4 w-full max-w-lg">
                    {/* Startup */}
                    <button onClick={() => setCurrentStep(1)} className="p-6 rounded-2xl border-2 border-border-faint hover:border-brand/40 bg-surface text-left transition-all group hover:shadow-lg">
                      <div className="w-10 h-10 rounded-xl bg-surface-high flex items-center justify-center mb-3">
                        <Zap size={18} className="text-text-muted group-hover:text-brand transition-colors" />
                      </div>
                      <div className="text-[16px] font-black text-text-primary mb-1">Startup</div>
                      <div className="text-2xl font-black text-brand mb-2">$0<span className="text-[12px] text-text-muted font-semibold">/mo</span></div>
                      <div className="space-y-1">
                        {["100 AI Resolutions", "2 KB Sources", "Email Integration"].map(f => (
                          <div key={f} className="flex items-center gap-1.5 text-[11px] text-text-muted">
                            <CheckCircle2 size={10} className="text-brand flex-shrink-0" />{f}
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 text-[11px] font-black text-brand">Continue free →</div>
                    </button>
                    {/* Growth */}
                    <button onClick={handleStripeCheckout} className="p-6 rounded-2xl border-2 border-brand bg-brand/5 text-left transition-all relative shadow-glow hover:shadow-xl">
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand text-white text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full">Most Popular</div>
                      <div className="w-10 h-10 rounded-xl bg-brand/15 flex items-center justify-center mb-3">
                        <Sparkles size={18} className="text-brand" />
                      </div>
                      <div className="text-[16px] font-black text-text-primary mb-1">Growth</div>
                      <div className="text-2xl font-black text-brand mb-2">$20<span className="text-[12px] text-text-muted font-semibold">/mo</span></div>
                      <div className="space-y-1">
                        {["2,500 AI Resolutions", "Unlimited KB Docs", "WhatsApp & Slack", "SSO Login"].map(f => (
                          <div key={f} className="flex items-center gap-1.5 text-[11px] text-text-muted">
                            <CheckCircle2 size={10} className="text-brand flex-shrink-0" />{f}
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 text-[11px] font-black text-brand">Subscribe with Stripe →</div>
                    </button>
                  </div>
                </div>
              )}

              {/* Step 1: Business Identity */}
              {currentStep === 1 && (
                <div className="flex-1 flex flex-col justify-center">
                  <div className="inline-block px-3 py-1 rounded-full bg-brand/10 text-brand text-[10px] font-black uppercase tracking-widest mb-4 w-fit">Step 01</div>
                  <h2 className="text-3xl font-black text-text-primary tracking-tight mb-2">Define your business</h2>
                  <p className="text-sm text-text-muted mb-8 max-w-md">What's your company called, what do you sell, and who are your customers? The AI reads this to build the foundation of every future response.</p>
                  
                  <textarea
                    autoFocus
                    className="w-full h-40 bg-surface border border-border-mid rounded-2xl p-5 text-[14px] text-text-primary outline-none focus:border-brand/50 focus:ring-2 focus:ring-brand/20 transition-all resize-none shadow-sm"
                    value={businessIdentity}
                    onChange={(e) => setBusinessIdentity(e.target.value)}
                    placeholder="e.g. We are 'Acme Coffee'. We sell high-end, ethically sourced coffee beans. Our customers are coffee enthusiasts who care about quality and sustainability. Our return policy is 30 days."
                  />
                </div>
              )}

              {/* Step 2: Brand Voice */}
              {currentStep === 1 && (
                <div className="flex-1 flex flex-col justify-center">
                  <div className="inline-block px-3 py-1 rounded-full bg-brand/10 text-brand text-[10px] font-black uppercase tracking-widest mb-4 w-fit">Step 02</div>
                  <h2 className="text-3xl font-black text-text-primary tracking-tight mb-2">How do you sound?</h2>
                  <p className="text-sm text-text-muted mb-8 max-w-md">Formal or friendly? What phrases do you always use? What do you never say? Watch the live preview adapt as you type.</p>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <textarea
                      autoFocus
                      className="w-full h-40 bg-surface border border-border-mid rounded-2xl p-5 text-[14px] text-text-primary outline-none focus:border-brand/50 focus:ring-2 focus:ring-brand/20 transition-all resize-none shadow-sm"
                      value={brandVoice}
                      onChange={(e) => setBrandVoice(e.target.value)}
                      placeholder="e.g. Extremely polite, highly professional, no emojis. Always refer to them as 'Valued Customer'."
                    />
                    
                    {/* Live Preview Pane */}
                    <div className="bg-bg-elevated border border-border-faint rounded-2xl p-5 flex flex-col">
                      <div className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-4 flex items-center justify-between">
                        <span>Live AI Preview</span>
                        {isTyping && <Loader2 size={12} className="animate-spin text-brand" />}
                      </div>
                      <div className="flex-1 flex items-center justify-center">
                        <div className="bg-brand/10 border border-brand/20 text-text-primary p-4 rounded-xl rounded-bl-sm text-[13px] leading-relaxed relative">
                          {previewText}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: First Document */}
              {currentStep === 2 && (
                <div className="flex-1 flex flex-col justify-center items-center text-center">
                  <div className="inline-block px-3 py-1 rounded-full bg-brand/10 text-brand text-[10px] font-black uppercase tracking-widest mb-4">Step 03</div>
                  <h2 className="text-3xl font-black text-text-primary tracking-tight mb-2">Give it some brains</h2>
                  <p className="text-sm text-text-muted mb-8 max-w-md mx-auto">Upload one file — a policy doc, FAQ list, or product manual. This is the AI's first piece of real knowledge. Even one document transforms response quality dramatically.</p>
                  
                  <div 
                    onClick={() => !isUploading && fileInputRef.current?.click()}
                    className={`w-full max-w-md border-2 border-dashed rounded-3xl p-10 flex flex-col items-center justify-center transition-all cursor-pointer ${isUploading ? 'border-border-mid bg-surface opacity-50' : 'border-border-strong bg-brand/5 hover:border-brand/40 hover:bg-brand/10'}`}
                  >
                    <div className="w-16 h-16 rounded-2xl bg-surface border border-border-faint flex items-center justify-center mb-6 shadow-sm">
                      {isUploading ? <Loader2 size={24} className="text-brand animate-spin" /> : <FileText size={24} className="text-brand" />}
                    </div>
                    <h3 className="text-lg font-bold text-text-primary mb-2">
                      {isUploading ? "Reading document..." : "Upload a Document"}
                    </h3>
                    <p className="text-[12px] text-text-muted text-center">PDF, TXT, or DOCX (Max 10MB)</p>
                    
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      accept=".pdf,.txt,.md,.docx"
                      onChange={handleFileUpload}
                    />
                  </div>
                </div>
              )}

              {/* Step 4: Connect Gmail */}
              {currentStep === 3 && (
                <div className="flex-1 flex flex-col justify-center items-center text-center">
                  <div className="inline-block px-3 py-1 rounded-full bg-brand/10 text-brand text-[10px] font-black uppercase tracking-widest mb-4">Final Step</div>
                  <h2 className="text-3xl font-black text-text-primary tracking-tight mb-2">Turn on the magic</h2>
                  <p className="text-sm text-text-muted mb-8 max-w-md mx-auto">Connect your support email. Once connected, we'll immediately fetch your last 5 unread emails and generate draft responses so you see value instantly.</p>
                  
                  <div className="w-full max-w-md bg-surface border border-border-mid rounded-3xl p-8 flex flex-col items-center">
                     <div className="flex items-center gap-4 mb-8">
                       <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm border border-border-faint">
                         <Mail className="text-[#EA4335]" size={24} />
                       </div>
                       <div className="flex gap-1 items-center">
                         <div className="w-1.5 h-1.5 rounded-full bg-border-strong animate-pulse" />
                         <div className="w-1.5 h-1.5 rounded-full bg-border-strong animate-pulse delay-75" />
                         <div className="w-1.5 h-1.5 rounded-full bg-border-strong animate-pulse delay-150" />
                       </div>
                       <div className="w-12 h-12 rounded-2xl bg-brand flex items-center justify-center shadow-glow">
                         <Bot className="text-white" size={24} />
                       </div>
                     </div>
                     
                     <Button variant="outline" size="lg" onClick={handleConnectGmail} className="w-full h-14 rounded-xl mb-4 group relative overflow-hidden bg-white hover:bg-neutral-50 text-neutral-800 border-neutral-200">
                        <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                        </svg>
                        Connect Google Workspace
                     </Button>
                     
                     <button onClick={handleComplete} className="text-[12px] font-bold text-text-muted hover:text-text-primary hover:underline">
                       I'll do this later
                     </button>
                  </div>
                </div>
              )}

            </motion.div>
          </AnimatePresence>

          {/* Navigation Footer */}
          <div className="mt-auto pt-6 flex items-center justify-between border-t border-border-faint relative z-10 bg-bg">
            <Button 
              variant="outline" 
              onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
              disabled={currentStep === 0 || isUploading}
              className="text-text-muted"
            >
              <ArrowLeft size={16} className="mr-2" /> Back
            </Button>
            
            {currentStep < 3 ? (
              <Button 
                variant="brand" 
                onClick={() => setCurrentStep(prev => Math.min(3, prev + 1))}
                disabled={isUploading}
                className="px-8 shadow-glow"
              >
                Continue <ArrowRight size={16} className="ml-2" />
              </Button>
            ) : null}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
