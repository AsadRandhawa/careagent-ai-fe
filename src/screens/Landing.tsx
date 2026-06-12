import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowRight, Bot, Zap, Shield, Sparkles, MessageSquare, Database, Layout, Menu, X, Check, ArrowDown, ExternalLink } from "lucide-react";
import { Button } from "../components/ui/Button";

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] }
};

const TypewriterText = ({ text, delay = 0 }: { text: string; delay?: number }) => {
  const characters = text.split("");
  
  return (
    <motion.span
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={{
        visible: {
          transition: {
            staggerChildren: 0.03,
            delayChildren: delay,
          },
        },
      }}
    >
      {characters.map((char, index) => (
        <motion.span
          key={index}
          variants={{
            hidden: { opacity: 0, x: -5 },
            visible: { opacity: 1, x: 0 },
          }}
          transition={{ duration: 0.1 }}
        >
          {char}
        </motion.span>
      ))}
    </motion.span>
  );
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

import { useNavigate } from "react-router-dom";
import { useAppStore } from "../store";
import { AuthModal } from "../components/AuthModal";

export const Landing = () => {
  const navigate = useNavigate();
  const { token } = useAppStore();
  const [isAuthModalOpen, setIsAuthModalOpen] = React.useState(false);
  const onEnterApp = () => {
    if (token) navigate("/dashboard");
    else setIsAuthModalOpen(true);
  };
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-bg overflow-x-hidden selection:bg-brand selection:text-white font-sans scroll-smooth">
      {/* Dynamic Background Blurs */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-brand/5 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-brand/10 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: "2s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-blue-500/5 blur-[150px] rounded-full" />
      </div>

      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? "bg-bg/80 backdrop-blur-xl border-b border-border-faint py-3 shadow-sm" : "py-8"}`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 cursor-pointer group"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            <div className="w-10 h-10 rounded-xl bg-brand flex items-center justify-center shadow-glow group-hover:scale-110 transition-transform duration-300">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <span className="text-[24px] font-black text-text-primary tracking-tighter">CareAgent<span className="text-brand">.ai</span></span>
          </motion.div>

          <div className="hidden md:flex items-center gap-12">
            {["Features", "Integrations", "Pricing"].map((item, i) => (
              <motion.a 
                key={item}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 + 0.2 }}
                href={`#${item.toLowerCase().replace(/\s+/g, "-")}`} 
                className="text-[13px] font-bold text-text-muted hover:text-brand uppercase tracking-[0.2em] transition-colors relative group"
              >
                {item}
                <span className="absolute -bottom-1.5 left-0 w-0 h-0.5 bg-brand transition-all duration-300 group-hover:w-full" />
              </motion.a>
            ))}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 }}
            >
              <Button variant="brand" onClick={onEnterApp} className="px-8 py-5 rounded-full font-bold shadow-glow hover:translate-y-[-2px] active:translate-y-[0] transition-all">
                Launch Platform
              </Button>
            </motion.div>
          </div>

          <button className="md:hidden p-2 text-text-muted" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        <AnimatePresence>
          {isMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="absolute top-full left-0 right-0 bg-bg border-b border-border-faint overflow-hidden md:hidden"
            >
              <div className="p-8 flex flex-col gap-8 bg-bg/95 backdrop-blur-xl">
                {["Features", "Integrations", "Pricing"].map((item) => (
                  <a key={item} href={`#${item.toLowerCase().replace(/\s+/g, "-")}`} className="text-2xl font-black text-text-primary tracking-tight" onClick={() => setIsMenuOpen(false)}>{item}</a>
                ))}
                <Button variant="brand" onClick={onEnterApp} className="w-full py-5 text-xl font-bold rounded-2xl">Launch App</Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-56 pb-40 px-6 z-10">
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-brand/10 border border-brand/20 text-brand text-[12px] font-black uppercase tracking-[0.2em] mb-12 shadow-glow-sm"
          >
            <Sparkles size={16} className="text-brand animate-pulse" />
            <span>Autonomous Intelligence for Support</span>
          </motion.div>
          
          <div className="max-w-4xl overflow-hidden mb-8">
            <motion.h1 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="text-4xl md:text-7xl font-black text-text-primary tracking-tighter leading-[1]"
            >
              <TypewriterText text="Customer support" /> <br />
              <TypewriterText text="that " delay={0.6} /> 
              <span className="italic text-brand relative inline-block">
                <TypewriterText text="thinks." delay={0.8} />
                <motion.span 
                  initial={{ width: 0 }} 
                  animate={{ width: "100%" }} 
                  transition={{ delay: 1.2, duration: 1 }} 
                  className="absolute bottom-2 left-0 h-3 bg-brand/10 -z-10" 
                />
              </span>
            </motion.h1>
          </div>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4, duration: 0.8 }}
            className="text-lg md:text-xl text-text-muted max-w-2xl mb-12 leading-relaxed font-medium"
          >
            Connect your knowledge, sync your channels, and deploy AI agents that resolve 80% of customer inquiries instantly. Zero training required.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.6, duration: 0.8 }}
            className="flex flex-col sm:flex-row items-center gap-6"
          >
            <Button variant="brand" size="lg" onClick={onEnterApp} className="group px-10 py-6 text-xl h-auto rounded-2xl shadow-glow hover:scale-105 active:scale-95 transition-all duration-300">
              Transform Support Now
              <ArrowRight className="ml-3 group-hover:translate-x-2 transition-transform duration-300" />
            </Button>
            <div className="flex flex-col items-center sm:items-start gap-1">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-bg bg-surface-high ring-2 ring-brand/5 shadow-md overflow-hidden">
                     <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=user${i}`} alt="user" />
                  </div>
                ))}
              </div>
              <p className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em]">Trusted by 2,000+ teams</p>
            </div>
          </motion.div>

          {/* Mouse Scroll Indicator */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, y: [0, 15, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, delay: 1.5 }}
            className="mt-32 w-8 h-12 rounded-full border-2 border-text-disabled flex justify-center p-2"
          >
            <motion.div className="w-1.5 h-1.5 rounded-full bg-text-disabled" />
          </motion.div>
        </div>
      </section>

      {/* Feature Showcase (Bento Grid) */}
      <section id="features" className="py-40 px-6 bg-surface/30 backdrop-blur-sm border-t border-border-faint relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="mb-20 flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="max-w-xl">
              <h2 className="text-3xl md:text-5xl font-black text-text-primary tracking-tighter mb-6 leading-[1]">Experience the <br /><span className="text-brand">CareAgent</span> difference.</h2>
              <p className="text-lg text-text-muted font-medium">Standard chatbots guess. CareAgent understands context, history, and intent.</p>
            </div>
            <div className="flex gap-3">
               <div className="w-10 h-10 rounded-full border border-border-faint flex items-center justify-center text-text-muted hover:bg-surface-high transition-colors"><ArrowRight className="rotate-180" /></div>
               <div className="w-10 h-10 rounded-full border border-brand bg-brand/5 text-brand flex items-center justify-center hover:bg-brand/10 transition-colors"><ArrowRight /></div>
            </div>
          </div>

          <div className="grid lg:grid-cols-12 gap-6">
            {/* Bento Card 1 */}
            <motion.div 
              {...fadeInUp}
              className="lg:col-span-7 bg-bg rounded-3xl border border-border-faint p-10 overflow-hidden relative group"
            >
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-brand/10 flex items-center justify-center text-brand mb-8 group-hover:bg-brand group-hover:text-white transition-all duration-500">
                  <Database size={28} />
                </div>
                <h3 className="text-3xl font-black text-text-primary mb-4 tracking-tight">The Knowledge Brain</h3>
                <p className="text-text-second text-base font-medium leading-relaxed max-w-sm">Sync your help center, docs, and manuals. Our AI builds a deep understanding of your business in minutes.</p>
              </div>
              <div className="absolute right-0 bottom-0 w-1/2 h-full bg-gradient-to-l from-brand/5 to-transparent flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                 <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} className="w-48 h-48 border border-brand/20 rounded-full border-dashed" />
              </div>
            </motion.div>

            {/* Bento Card 2 */}
            <motion.div 
              {...fadeInUp}
              className="lg:col-span-5 bg-brand text-white rounded-3xl p-10 flex flex-col justify-between shadow-glow group overflow-hidden relative"
            >
              <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-[60px] -translate-y-1/2 translate-x-1/2" />
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-white text-brand flex items-center justify-center mb-8">
                  <Zap size={28} />
                </div>
                <h3 className="text-3xl font-black mb-4 tracking-tight italic">Instant Resolution.</h3>
                <p className="text-white/80 text-base font-medium leading-relaxed">Cut ticket times from hours to seconds. Our agents respond with accurate information <span className="font-black underline decoration-2 underline-offset-4">every single time.</span></p>
              </div>
              <div className="mt-8 flex items-center gap-2.5 bg-white/10 p-3.5 rounded-xl border border-white/20">
                <div className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
                <span className="text-[11px] font-bold uppercase tracking-widest">Resolution Engine Active</span>
              </div>
            </motion.div>

            {/* Bento Card 3 */}
            <motion.div 
              {...fadeInUp}
              className="lg:col-span-4 bg-bg-elevated rounded-3xl border border-border-faint p-10 flex flex-col items-center text-center group"
            >
              <div className="w-16 h-16 rounded-2xl bg-white border border-border-faint flex items-center justify-center text-brand mb-8 shadow-sm group-hover:scale-110 transition-transform">
                <MessageSquare size={30} />
              </div>
              <h3 className="text-2xl font-black text-text-primary mb-3 tracking-tight">Omnichannel Brain</h3>
              <p className="text-text-muted text-sm font-medium">Sync Email, Slack, and WhatsApp. One source of truth for all noise.</p>
            </motion.div>

            {/* Bento Card 4 */}
            <motion.div 
              {...fadeInUp}
              className="lg:col-span-8 bg-surface-high border border-border-strong rounded-3xl p-10 flex flex-col md:flex-row items-center gap-10 group"
            >
              <div className="flex-1">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-500 text-[9px] font-black uppercase tracking-widest mb-5">Security First</div>
                <h3 className="text-3xl font-black text-text-primary mb-4 tracking-tight leading-[1.1]">Enterprise-Grade Safety & Trust.</h3>
                <ul className="space-y-3">
                  {[ "PII Masking built-in", "Bank-grade encryption", "Human-in-the-loop audit logs" ].map(t => (
                    <li key={t} className="flex items-center gap-2.5 font-bold text-text-second text-sm">
                      <div className="w-1.5 h-1.5 rounded-full bg-brand" /> {t}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex-1 w-full bg-bg rounded-2xl border border-border-faint aspect-video flex items-center justify-center relative overflow-hidden">
                <Shield size={60} className="text-brand opacity-10" />
                <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 4, repeat: Infinity }} className="absolute inset-0 bg-brand/5 pointer-events-none" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Interactive Process Section */}
      {/* Integrations Section */}
      <section id="integrations" className="py-20 px-6 relative overflow-hidden">
        <div className="max-w-5xl mx-auto">
          <motion.div {...fadeInUp} className="text-center mb-14">
            <div className="inline-block px-4 py-1.5 rounded-full bg-brand/10 text-brand text-[11px] font-black uppercase tracking-widest mb-4">Integrations</div>
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-text-primary mb-4">Meet your customers <span className="text-brand">where they are</span></h2>
            <p className="text-lg text-text-muted max-w-xl mx-auto">Connect your support channels in minutes. One inbox. Every conversation.</p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {[
              { name: "Gmail", status: "Live", icon: "📧", desc: "Official support inbox connection" },
              { name: "WhatsApp", status: "Coming Soon", icon: "💬", desc: "Business messaging at scale" },
              { name: "Instagram DMs", status: "Coming Soon", icon: "📸", desc: "Direct message management" },
              { name: "Web Chat", status: "Coming Soon", icon: "🌐", desc: "In-app support widget" },
            ].map((integration, i) => (
              <motion.div
                key={integration.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                whileHover={{ y: -5 }}
                className="p-6 rounded-2xl border border-border-faint bg-surface/50 hover:border-brand/30 hover:bg-brand/5 transition-all flex flex-col items-center text-center gap-3"
              >
                <div className="text-4xl">{integration.icon}</div>
                <div className="text-[14px] font-bold text-text-primary">{integration.name}</div>
                <div className="text-[11px] text-text-muted leading-relaxed">{integration.desc}</div>
                <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${integration.status === "Live" ? "bg-brand/15 text-brand" : "bg-surface-high text-text-disabled border border-border-faint"}`}>
                  {integration.status}
                </span>
              </motion.div>
            ))}
          </div>

          <motion.div {...fadeInUp} className="text-center">
            <Button variant="primary" size="lg" className="px-10 shadow-glow" onClick={onEnterApp}>
              Connect Your Channels <ArrowRight className="ml-2" size={18} />
            </Button>
          </motion.div>
        </div>
      </section>

      <section id="how-it-works" className="py-32 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="mb-20">
            <h4 className="text-brand font-black uppercase tracking-[0.3em] mb-3 text-center text-[10px]">The Workflow</h4>
            <h2 className="text-4xl md:text-6xl font-black text-text-primary text-center tracking-tighter leading-[0.9]">From Noise to Clarity.</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-16">
            {[
              { icon: <Database />, title: "1. Connect", desc: "Sync your data sources and communication channels instantly." },
              { icon: <Bot />, title: "2. Train", desc: "Our AI analyzes your tone, history, and logic to build your agent." },
              { icon: <Zap />, title: "3. Automate", desc: "Watch as 80% of your tickets resolve on autopilot. Forever." }
            ].map((step, i) => (
              <motion.div 
                key={i}
                viewport={{ once: true }}
                whileInView={{ opacity: 1, y: 0 }}
                initial={{ opacity: 0, y: 30 }}
                transition={{ delay: i * 0.2 }}
                className="relative flex flex-col items-center text-center"
              >
                <div className="w-20 h-20 rounded-3xl bg-surface border border-border-faint flex items-center justify-center text-brand mb-8 shadow-glow shadow-brand/10 group">
                   {step.icon}
                </div>
                <h3 className="text-2xl font-black text-text-primary mb-4 tracking-tight">{step.title}</h3>
                <p className="text-text-muted text-base font-medium leading-relaxed">{step.desc}</p>
                {i < 2 && <div className="hidden lg:block absolute top-10 left-[100%] w-16 border-t-2 border-dashed border-border-faint -translate-x-1/2" />}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing - Upwork Green Vibe */}
      <section id="pricing" className="py-32 px-6 bg-surface/50 border-y border-border-faint">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20 flex flex-col items-center">
            <div className="px-5 py-2 rounded-full bg-brand/10 border border-brand/20 text-brand text-[10px] font-black uppercase tracking-[0.2em] mb-6">Simple Plans</div>
            <h2 className="text-4xl md:text-6xl font-black text-text-primary tracking-tighter mb-6 underline decoration-brand decoration-4 underline-offset-8">Flexible like your team.</h2>
            <p className="text-lg text-text-muted font-medium max-w-lg">Zero per-seat costs. You only pay for successful resolutions.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 items-stretch max-w-6xl mx-auto">
            <PricingCard 
              title="Startup" 
              price="0" 
              desc="For testing AI workflows."
              features={["100 AI Resolutions", "2 KB Sources", "Email Integration"]}
              onClick={onEnterApp}
            />
            <PricingCard 
              title="Growth" 
              price="499" 
              popular
              desc="Scale your support operations."
              features={["2,500 AI Resolutions", "Unlimited KB Docs", "WhatsApp & Slack", "SSO Login"]}
              onClick={onEnterApp}
            />
            <PricingCard 
              title="Enterprise" 
              price="Custom" 
              desc="Full control and infinite docs."
              features={["Custom Usage", "Private Deployment", "Audit Logging", "Account Manager"]}
              onClick={onEnterApp}
            />
          </div>
        </div>
      </section>

      {/* Final CTA Immersive Section */}
      <section
        className="py-48 px-6 relative overflow-hidden flex items-center justify-center text-center"
        style={{ backgroundColor: '#16a34a', isolation: 'isolate' }}
      >
        {/* Animated glow orb */}
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.45, 0.2] }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] rounded-full blur-[120px] pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.18) 0%, transparent 70%)', zIndex: 0 }}
        />
        {/* Top-left soft accent */}
        <div
          className="absolute top-0 left-0 w-[500px] h-[500px] rounded-full blur-[100px] pointer-events-none"
          style={{ background: 'rgba(255,255,255,0.07)', zIndex: 0 }}
        />
        {/* Bottom-right dark accent */}
        <div
          className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full blur-[100px] pointer-events-none"
          style={{ background: 'rgba(0,0,0,0.10)', zIndex: 0 }}
        />

        <div className="max-w-3xl relative" style={{ zIndex: 1 }}>
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-white/30 text-white text-[11px] font-black uppercase tracking-[0.2em] mb-10"
            style={{ backgroundColor: 'rgba(255,255,255,0.12)' }}
          >
            <Sparkles size={14} />
            <span>14-Day Free Trial</span>
          </motion.div>

          {/* Headline */}
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-5xl md:text-7xl font-black tracking-tighter leading-[1.05] mb-8"
            style={{ color: '#ffffff' }}
          >
            Ready to stop <br />treading water?
          </motion.h2>

          {/* Subtext */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl font-bold mb-12 max-w-xl mx-auto"
            style={{ color: 'rgba(255,255,255,0.85)' }}
          >
            Start your 14-day mission control trial today. Connect your first channel in 90 seconds.
          </motion.p>

          {/* Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-5"
          >
            <Button
              variant="default"
              size="lg"
              onClick={onEnterApp}
              className="hover:scale-105 active:scale-95 border-none px-12 py-6 text-xl font-black rounded-2xl shadow-2xl transition-all duration-300"
              style={{ backgroundColor: '#ffffff', color: '#16a34a' }}
            >
              Enter Platform
            </Button>
            <button
              onClick={onEnterApp}
              className="text-base font-black uppercase tracking-[0.2em] px-8 py-4 rounded-2xl transition-all duration-300 hover:scale-105"
              style={{ color: '#ffffff', border: '2px solid rgba(255,255,255,0.35)', backgroundColor: 'rgba(255,255,255,0.08)' }}
            >
              Request Info
            </button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-24 px-6 bg-bg border-t border-border-faint">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-start justify-between gap-16 mb-24">
            <div className="max-w-md">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-brand flex items-center justify-center shadow-glow">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <span className="text-3xl font-black text-text-primary tracking-tighter">CareAgent.ai</span>
              </div>
              <p className="text-text-muted text-xl font-medium leading-relaxed">Scaling the world's most responsive customer experiences through autonomous intelligence.</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-16 md:gap-24">
               <div>
                  <h6 className="font-black text-text-primary text-[10px] uppercase tracking-[0.3em] mb-8">Product</h6>
                  <ul className="space-y-4 font-bold text-text-muted text-sm">
                    <li><a href="#" className="hover:text-brand transition-colors">Platform</a></li>
                    <li><a href="#" className="hover:text-brand transition-colors">Brains</a></li>
                    <li><a href="#" className="hover:text-brand transition-colors">Pricing</a></li>
                  </ul>
               </div>
               <div>
                  <h6 className="font-black text-text-primary text-[10px] uppercase tracking-[0.3em] mb-8">Engine</h6>
                  <ul className="space-y-4 font-bold text-text-muted text-sm">
                    <li><a href="#" className="hover:text-brand transition-colors">Security</a></li>
                    <li><a href="#" className="hover:text-brand transition-colors">Compliance</a></li>
                    <li><a href="#" className="hover:text-brand transition-colors">Labs</a></li>
                  </ul>
               </div>
               <div className="col-span-2 md:col-span-1">
                  <h6 className="font-black text-text-primary text-[10px] uppercase tracking-[0.3em] mb-8">Company</h6>
                  <ul className="space-y-4 font-bold text-text-muted text-sm">
                    <li><a href="#" className="hover:text-brand transition-colors">About</a></li>
                    <li><a href="#" className="hover:text-brand transition-colors">Careers</a></li>
                    <li><a href="#" className="hover:text-brand transition-colors">Blog</a></li>
                  </ul>
               </div>
            </div>
          </div>
          <div className="pt-12 border-t border-border-faint flex flex-col md:flex-row items-center justify-between gap-8">
             <div className="text-[11px] font-black text-text-disabled uppercase tracking-[0.2em]">Build for the modern era © 2026 · Flint Sol</div>
             <div className="flex gap-10 items-center">
                <a href="/privacy" className="text-[11px] font-black text-text-disabled uppercase tracking-[0.2em] hover:text-brand transition-colors">Privacy Policy</a>
                {["Twitter", "LinkedIn", "GitHub"].map(p => (
                  <a key={p} href="#" className="text-[11px] font-black text-text-disabled uppercase tracking-[0.2em] hover:text-brand transition-colors">{p}</a>
                ))}
             </div>
          </div>
        </div>
      </footer>
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </div>
  );
};

const PricingCard = ({ title, price, desc, features, popular, onClick }: { title: string, price: string, desc: string, features: string[], popular?: boolean, onClick?: () => void }) => (
  <motion.div 
    whileHover={{ y: -10 }}
    className={`p-10 rounded-3xl border flex flex-col transition-all duration-500 ${popular ? "bg-bg border-brand shadow-glow relative ring-4 ring-brand/5" : "bg-surface border-border-faint hover:border-brand/40"}`}
  >
    {popular && <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-brand text-white text-[9px] font-black uppercase tracking-[0.3em] px-5 py-2 rounded-full shadow-glow">Most Popular</div>}
    <div className="mb-10">
      <h4 className={`text-xl font-black mb-4 ${popular ? "text-brand" : "text-text-primary"}`}>{title}</h4>
      <div className="flex items-baseline gap-1 mb-4">
        {price !== "Custom" && <span className="text-2xl font-black text-text-primary tracking-tighter">$</span>}
        <span className="text-5xl font-black text-text-primary tracking-tighter">{price}</span>
        {price !== "Custom" && <span className="text-text-disabled font-black text-[10px] uppercase tracking-widest ml-1">/mo</span>}
      </div>
      <p className="text-text-muted font-bold text-base leading-tight">{desc}</p>
    </div>
    <div className="space-y-4 mb-10 flex-grow">
      {features.map(f => (
        <div key={f} className="flex items-start gap-3">
          <div className={`p-1 rounded-full mt-0.5 ${popular ? "bg-brand text-white" : "bg-border-faint text-text-disabled"}`}><Check size={12} /></div>
          <span className="text-xs font-black text-text-second tracking-tight">{f}</span>
        </div>
      ))}
    </div>
    <Button 
      variant={popular ? "brand" : "default"} 
      onClick={onClick}
      className={`w-full py-6 rounded-2xl text-lg font-black ${popular ? "shadow-glow" : "bg-bg-elevated text-text-primary hover:bg-surface-high border-border-faint translate-y-0"}`}
    >
      Enroll Now
    </Button>
  </motion.div>
);
