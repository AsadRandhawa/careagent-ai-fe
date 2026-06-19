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
  const { token, setPendingPlan } = useAppStore();
  const [isAuthModalOpen, setIsAuthModalOpen] = React.useState(false);
  const onEnterApp = () => {
    if (token) navigate("/dashboard");
    else setIsAuthModalOpen(true);
  };

  const handleStripeCheckout = async () => {
    if (!token) {
      // Save intent, open auth — AuthModal will redirect to Stripe after login
      setPendingPlan('growth');
      setIsAuthModalOpen(true);
      return;
    }
    try {
      const apiUrl = (import.meta.env.VITE_API_URL || 'https://careagent-ai-be-production.up.railway.app').replace(/\/+$/, '');
      const res = await fetch(`${apiUrl}/api/stripe/create-checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else alert('Failed to start checkout. Please try again.');
    } catch (err) {
      console.error('Stripe checkout error:', err);
      alert('Failed to connect to payment system.');
    }
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
              <Button variant="brand" onClick={onEnterApp} className="px-8 py-4 text-sm rounded-full font-bold shadow-glow border-2 border-brand/20 hover:translate-y-[-2px] active:translate-y-[0] transition-all flex items-center gap-2">
                Sign In / Sign Up
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
      <section className="relative pt-28 pb-12 px-6 z-10">
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 mb-10 text-brand text-[11px] font-black uppercase tracking-[0.3em]"
          >
            <span className="w-12 h-0.5 bg-brand/30 rounded-full" />
            <span>Next Generation Support Platform</span>
            <span className="w-12 h-0.5 bg-brand/30 rounded-full" />
          </motion.div>
          
          <div className="max-w-5xl overflow-visible mb-12 relative">
            <motion.div 
              initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ delay: 1.5, duration: 0.8 }}
              className="absolute -top-12 -left-12 bg-white border-2 border-border-faint p-4 rounded-3xl shadow-2xl rotate-[-12deg] z-20 hidden md:flex items-center gap-2"
            >
              <div className="w-8 h-8 rounded-full bg-brand flex items-center justify-center text-white"><Check size={16} strokeWidth={4} /></div>
              <span className="font-black tracking-tighter">99% CSAT</span>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.8, rotate: 5 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ delay: 1.7, duration: 0.8 }}
              className="absolute -bottom-6 -right-12 bg-text-primary text-white p-4 rounded-3xl shadow-2xl rotate-[8deg] z-20 hidden md:block"
            >
              <span className="font-black tracking-tighter">24/7 Autopilot</span>
            </motion.div>

            <motion.h1 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="text-5xl md:text-[4.5rem] font-black text-text-primary tracking-tighter leading-[1]"
            >
              <TypewriterText text="Customer support" /> <br />
              <TypewriterText text="that " delay={0.6} /> 
              <span className="italic text-brand relative inline-block">
                <TypewriterText text="thinks." delay={0.8} />
                <motion.span 
                  initial={{ width: 0 }} 
                  animate={{ width: "100%" }} 
                  transition={{ delay: 1.2, duration: 1 }} 
                  className="absolute bottom-2 left-0 h-4 md:h-6 bg-brand/20 -z-10" 
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
            className="mt-10 w-8 h-12 rounded-full border-2 border-text-disabled flex justify-center p-2"
          >
            <motion.div className="w-1.5 h-1.5 rounded-full bg-text-disabled" />
          </motion.div>
        </div>
      </section>

      {/* Dynamic Marquee */}
      <div className="w-full overflow-hidden bg-text-primary text-white py-6 border-y border-border-faint flex items-center relative z-20">
        <div className="flex whitespace-nowrap animate-marquee">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center gap-10 mx-6">
              <span className="text-2xl font-black uppercase tracking-tighter">Autonomous Intelligence</span>
              <Sparkles className="text-brand w-6 h-6" />
              <span className="text-2xl font-black uppercase tracking-tighter">Zero Training Required</span>
              <Sparkles className="text-brand w-6 h-6" />
              <span className="text-2xl font-black uppercase tracking-tighter">Omnichannel Brain</span>
              <Sparkles className="text-brand w-6 h-6" />
            </div>
          ))}
        </div>
      </div>

      {/* Feature Showcase (Bento Grid) */}
      <section id="features" className="py-20 px-6 bg-surface/30 backdrop-blur-sm border-t border-border-faint relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="mb-20 flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="max-w-xl">
              <h2 className="text-3xl md:text-5xl font-black text-text-primary tracking-tighter mb-6 leading-[1]">Experience the <br /><span className="text-brand">CareAgent</span> difference.</h2>
              <p className="text-lg text-text-muted font-medium">Standard chatbots guess. CareAgent understands context, history, and intent.</p>
            </div>

          </div>

          <div className="grid lg:grid-cols-12 gap-6">
            {/* Bento Card 1 */}
            <motion.div 
              {...fadeInUp}
              className="lg:col-span-7 bg-bg rounded-3xl border-2 border-border-faint p-10 overflow-hidden relative group hover:-translate-y-2 hover:-rotate-1 hover:shadow-2xl transition-all duration-300"
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
              className="lg:col-span-5 bg-brand text-white rounded-3xl p-10 flex flex-col justify-between shadow-glow group overflow-hidden relative hover:-translate-y-2 hover:rotate-1 hover:shadow-2xl transition-all duration-300"
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
              className="lg:col-span-4 bg-bg-elevated rounded-3xl border-2 border-border-faint p-10 flex flex-col items-center text-center group hover:-translate-y-2 hover:-rotate-1 hover:shadow-2xl transition-all duration-300"
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
              className="lg:col-span-8 bg-surface-high border-2 border-border-strong rounded-3xl p-10 flex flex-col md:flex-row items-center gap-10 group hover:-translate-y-2 hover:rotate-1 hover:shadow-2xl transition-all duration-300"
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
          <motion.div {...fadeInUp} className="text-center mb-20">
            <div className="inline-block px-4 py-1.5 rounded-full bg-brand/10 text-brand text-[11px] font-black uppercase tracking-widest mb-4">Integrations</div>
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-text-primary mb-4 leading-none">Meet your customers <br/><span className="text-brand">where they are.</span></h2>
            <p className="text-lg text-text-muted max-w-xl mx-auto">Connect your support channels in minutes. One inbox. Every conversation.</p>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {[
              {
                name: "Gmail", status: "Live", desc: "Official support inbox connection",
                icon: (
                  <svg viewBox="0 0 48 48" className="w-12 h-12"><path fill="#EA4335" d="M6 40h7V23.6L4 17.5V37c0 1.7 1.3 3 3 3z"/><path fill="#34A853" d="M35 40h7c1.7 0 3-1.3 3-3V17.5l-10 6.1z"/><path fill="#FBBC05" d="M35 10l-11 7.4L13 10H6v7.5l18 11.6 18-11.6V10z"/><path fill="#4285F4" d="M4 17.5l9 6.1V10H6c-1.1 0-2 .9-2 2z"/><path fill="#C5221F" d="M44 12c0-1.1-.9-2-2-2h-7v13.6l9-6.1z"/></svg>
                )
              },
              {
                name: "WhatsApp", status: "Coming Soon", desc: "Business messaging at scale",
                icon: (
                  <svg viewBox="0 0 48 48" className="w-12 h-12"><circle cx="24" cy="24" r="24" fill="#25D366"/><path fill="#fff" d="M34.5 13.5C32 11 28.6 9.5 25 9.5c-7.4 0-13.4 6-13.4 13.4 0 2.4.6 4.7 1.8 6.7L11 38l8.6-2.3c2 1.1 4.2 1.6 6.4 1.6 7.4 0 13.4-6 13.4-13.4 0-3.6-1.4-7-3.9-9.4zM25 35.2c-2 0-4-.5-5.7-1.5l-.4-.2-4.2 1.1 1.1-4.1-.3-.4c-1.1-1.8-1.7-3.8-1.7-5.9C13.8 18 18.8 13 25 13c3 0 5.8 1.2 7.9 3.3 2.1 2.1 3.3 4.9 3.3 7.9-.1 6.1-5.1 11-11.2 11zm6.1-8.2c-.3-.2-1.9-.9-2.2-1-.3-.1-.5-.2-.7.2-.2.3-.8 1-.9 1.2-.2.2-.3.2-.6.1-.3-.2-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6l.5-.6c.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5s-.7-1.7-.9-2.3c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.4s1 2.8 1.2 3c.2.2 2 3.1 4.9 4.3.7.3 1.2.5 1.6.6.7.2 1.3.2 1.8.1.5-.1 1.6-.7 1.9-1.3.2-.6.2-1.2.1-1.3-.2-.1-.4-.2-.7-.3z"/></svg>
                )
              },
              {
                name: "Instagram DMs", status: "Coming Soon", desc: "Direct message management",
                icon: (
                  <svg viewBox="0 0 48 48" className="w-12 h-12"><radialGradient id="ig1" cx="19%" cy="99%" r="128%"><stop offset="0" stopColor="#ffd879"/><stop offset=".25" stopColor="#f7a84a"/><stop offset=".5" stopColor="#f05c3c"/><stop offset="1" stopColor="#c22f86"/></radialGradient><radialGradient id="ig2" cx="99%" cy="5%" r="100%"><stop offset="0" stopColor="#3a5bce"/><stop offset=".3" stopColor="#3a5bce" stopOpacity=".5"/><stop offset="1" stopColor="#3a5bce" stopOpacity="0"/></radialGradient><rect width="48" height="48" rx="12" fill="url(#ig1)"/><rect width="48" height="48" rx="12" fill="url(#ig2)"/><path fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" d="M24 17.5c-3.6 0-6.5 2.9-6.5 6.5s2.9 6.5 6.5 6.5 6.5-2.9 6.5-6.5-2.9-6.5-6.5-6.5z"/><rect fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" x="12" y="12" width="24" height="24" rx="7"/><circle cx="32" cy="16" r="1.5" fill="#fff"/></svg>
                )
              },
              {
                name: "Web Chat", status: "Coming Soon", desc: "In-app support widget",
                icon: (
                  <svg viewBox="0 0 48 48" className="w-12 h-12"><rect width="48" height="48" rx="12" fill="#0ea5e9"/><path fill="#fff" d="M10 14a4 4 0 0 1 4-4h20a4 4 0 0 1 4 4v16a4 4 0 0 1-4 4H28l-6 4v-4h-8a4 4 0 0 1-4-4V14z"/><circle cx="17" cy="22" r="2" fill="#0ea5e9"/><circle cx="24" cy="22" r="2" fill="#0ea5e9"/><circle cx="31" cy="22" r="2" fill="#0ea5e9"/></svg>
                )
              },
            ].map((integration, i) => (
              <motion.div
                key={integration.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                whileHover={{ y: -10, rotate: i % 2 === 0 ? 2 : -2 }}
                className="p-8 rounded-3xl border-2 border-border-faint bg-surface hover:shadow-2xl transition-all duration-300 flex flex-col items-center text-center gap-4"
              >
                {integration.icon}
                <div className="text-[14px] font-bold text-text-primary">{integration.name}</div>
                <div className="text-[11px] text-text-muted leading-relaxed">{integration.desc}</div>
                <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${integration.status === "Live" ? "bg-brand/15 text-brand" : "bg-surface-high text-text-disabled border border-border-faint"}`}>
                  {integration.status}
                </span>
              </motion.div>
            ))}
          </div>
          <motion.div {...fadeInUp} className="text-center mt-8">
            <Button variant="brand" size="lg" className="px-8 py-5 text-lg font-black shadow-2xl rounded-2xl" onClick={onEnterApp}>
              Connect Your Channels <ArrowRight className="ml-2" size={24} />
            </Button>
          </motion.div>
        </div>
      </section>

      <section id="how-it-works" className="py-32 px-6 relative bg-bg">
        <div className="max-w-5xl mx-auto">
          <div className="mb-24 text-center">
            <h4 className="text-brand font-black uppercase tracking-[0.3em] mb-3 text-[10px]">The Workflow</h4>
            <h2 className="text-4xl md:text-[5rem] font-black text-text-primary tracking-tighter leading-[0.9]">From Noise to Clarity.</h2>
          </div>

          <div className="flex flex-col gap-12 relative pb-32">
            {[
              { icon: <Database />, title: "1. Connect", desc: "Sync your data sources and communication channels instantly." },
              { icon: <Bot />, title: "2. Train", desc: "Our AI analyzes your tone, history, and logic to build your agent." },
              { icon: <Zap />, title: "3. Automate", desc: "Watch as 80% of your tickets resolve on autopilot. Forever." }
            ].map((step, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5 }}
                className="sticky flex flex-col md:flex-row items-center gap-8 p-6 md:p-10 bg-bg rounded-[1.5rem] border-2 border-brand shadow-2xl"
                style={{ top: `calc(120px + ${i * 24}px)`, zIndex: 10 + i }}
              >
                <div className="w-16 h-16 md:w-24 md:h-24 rounded-2xl bg-bg border-2 border-border-faint flex items-center justify-center text-brand shrink-0 shadow-glow">
                   <div className="scale-110">
                     {step.icon}
                   </div>
                </div>
                <div>
                  <h3 className="text-2xl md:text-3xl font-black text-text-primary mb-2 tracking-tight">{step.title}</h3>
                  <p className="text-text-muted text-base md:text-lg font-medium leading-relaxed max-w-xl">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing - Upwork Green Vibe */}
      <section id="pricing" className="py-20 px-6 bg-surface/50 border-y border-border-faint">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20 flex flex-col items-center">
            <div className="px-5 py-2 rounded-full bg-brand/10 border border-brand/20 text-brand text-[10px] font-black uppercase tracking-[0.2em] mb-6">Simple Plans</div>
            <h2 className="text-4xl md:text-6xl font-black text-text-primary tracking-tighter mb-6 underline decoration-brand decoration-4 underline-offset-8">Flexible like your team.</h2>
            <p className="text-lg text-text-muted font-medium max-w-lg">Zero per-seat costs. You only pay for successful resolutions.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 items-stretch max-w-6xl mx-auto">
            <PricingCard 
              title="Starter" 
              price="0" 
              currency="$"
              desc="For testing AI workflows."
              features={["100 AI Resolutions", "2 KB Sources", "Email Integration"]}
              onClick={onEnterApp}
            />
            <PricingCard 
              title="Pro" 
              price="20" 
              currency="$"
              popular
              desc="Scale your support operations."
              features={["2,500 AI Resolutions", "Unlimited KB Docs", "WhatsApp & Slack", "SSO Login"]}
              onClick={onEnterApp}
            />
            <PricingCard 
              title="Premium" 
              price="Custom" 
              currency="$"
              desc="Full control and infinite docs."
              features={["Custom Usage", "Private Deployment", "Audit Logging", "Account Manager"]}
              onClick={onEnterApp}
            />
          </div>
        </div>
      </section>

      {/* Final CTA Immersive Section */}
      <section
        className="py-24 px-6 relative overflow-hidden flex items-center justify-center text-center"
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
          {/* Headline */}
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-5xl md:text-[4.5rem] font-black tracking-tighter leading-[1] mb-8"
            style={{ color: '#ffffff' }}
          >
            Scale your support. <br /> Without scaling headcount.
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
            Start your mission control today. Connect your first channel in 90 seconds.
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
      <footer className="pt-24 pb-12 px-6 bg-bg">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-start justify-between gap-16 mb-24">
            <div className="max-w-sm">
              <div className="flex items-center gap-3 mb-6">
                <Bot className="w-8 h-8 text-brand" />
                <span className="text-2xl font-black text-text-primary tracking-tighter uppercase">CAREAGENT</span>
              </div>
              <p className="text-text-muted text-base font-medium leading-relaxed mb-8">
                We are passionate about helping businesses leverage the power of technology to achieve their goals.
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-16 md:gap-24">
               <div>
                  <h6 className="font-bold text-lg text-text-primary mb-6">Company</h6>
                  <ul className="space-y-4 font-medium text-text-muted text-base">
                    <li><a href="#" className="hover:text-brand transition-colors">Home</a></li>
                    <li><a href="#" className="hover:text-brand transition-colors">About Us</a></li>
                    <li><a href="#" className="hover:text-brand transition-colors">Blog</a></li>
                    <li><a href="#" className="hover:text-brand transition-colors">Pricing</a></li>
                    <li><a href="/privacy" className="hover:text-brand transition-colors">Privacy Policy</a></li>
                    <li><a href="/refund-policy" className="hover:text-brand transition-colors">Refund Policy</a></li>
                    <li><a href="/terms" className="hover:text-brand transition-colors">Terms of Service</a></li>
                  </ul>
               </div>
               <div>
                  <h6 className="font-bold text-lg text-text-primary mb-6">Support</h6>
                  <ul className="space-y-4 font-medium text-text-muted text-base">
                    <li><a href="#" className="hover:text-brand transition-colors">Contact</a></li>
                    <li><a href="#" className="hover:text-brand transition-colors">Licenses</a></li>
                    <li><a href="#" className="hover:text-brand transition-colors">Changelog</a></li>
                  </ul>
               </div>
            </div>
          </div>
          
          <div className="pt-12 flex flex-col md:flex-row items-center justify-between gap-8">
             <div className="text-sm font-medium text-text-muted">
               2026 CareAgent. Powered by Flint Sol
             </div>
          </div>
        </div>
      </footer>
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      <CareAgentBot />
    </div>
  );
};

const PricingCard = ({ title, price, currency = "$", desc, features, popular, onClick, onEnroll, enrollLabel }: { title: string, price: string, currency?: string, desc: string, features: string[], popular?: boolean, onClick?: () => void, onEnroll?: () => void, enrollLabel?: string }) => (
  <motion.div 
    whileHover={{ y: -10, rotate: popular ? 0 : 1 }}
    className={`p-10 rounded-3xl border-2 flex flex-col transition-all duration-500 ${popular ? "bg-bg border-brand shadow-2xl relative ring-4 ring-brand/10 scale-105 z-10" : "bg-surface border-border-faint hover:border-brand/40 hover:shadow-2xl"}`}
  >
    {popular && <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-brand text-white text-[9px] font-black uppercase tracking-[0.3em] px-5 py-2 rounded-full shadow-glow">Most Popular</div>}
    <div className="mb-10">
      <h4 className={`text-xl font-black mb-4 ${popular ? "text-brand" : "text-text-primary"}`}>{title}</h4>
      <div className="flex items-baseline gap-1 mb-4">
        {price !== "Custom" && <span className="text-2xl font-black text-text-primary tracking-tighter">{currency}</span>}
        <span className="text-5xl font-black text-text-primary tracking-tighter">{price}</span>
        {price !== "Custom" && <span className="text-text-disabled font-bold text-sm ml-1">/ Month</span>}
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

// ── CareAgent Landing Bot ─────────────────────────────────
const SYSTEM_PROMPT = `You are the CareAgent guide — a friendly assistant embedded on the CareAgent.ai website.
You ONLY answer questions about CareAgent. If asked anything unrelated, politely decline and redirect.

CRITICAL FORMATTING RULES:
- Never use markdown: no **, no *, no #, no bullet dashes
- Write in plain conversational text only
- Use numbered lists like "1. Step one 2. Step two" inline or on new lines without any symbols
- Keep answers short and direct

CONTEXT RULES:
- The user is already ON the CareAgent website
- Never say "visit the CareAgent website" — they are already here
- When someone asks how to get started or sign up, tell them to click the "Launch Platform" button at the top right of this page
- When referencing setup steps, mention they happen inside the platform after clicking Launch Platform

CareAgent key facts:
- AI-powered customer support platform that auto-drafts email replies
- Connects to Gmail (live), WhatsApp and Instagram DMs (coming soon)
- Pricing: Startup Rs 0/mo (100 AI resolutions), Growth Rs 45,000/mo (2,500 resolutions), Enterprise custom pricing
- 5-minute setup inside the platform: business identity, brand voice, upload a knowledge doc, connect Gmail
- AI escalates complex tickets to human agents automatically
- Dashboard shows open tickets, resolved count, sentiment analysis, escalation rate
- Zero per-seat costs — you only pay for successful resolutions`;

const CareAgentBot = () => {
  const [open, setOpen] = React.useState(false);
  const [messages, setMessages] = React.useState<{role: 'user'|'assistant', content: string}[]>([
    { role: 'assistant', content: "Hi! I'm the CareAgent guide 👋 Ask me anything about the platform — features, pricing, how to get started, anything!" }
  ]);
  const [input, setInput] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const bottomRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    const next = [...messages, { role: 'user' as const, content: text }];
    setMessages(next);
    setInput('');
    setLoading(true);
    try {
      const apiUrl = (import.meta.env.VITE_API_URL || 'https://careagent-ai-be-production.up.railway.app').replace(/\/+$/, '');
      const res = await fetch(`${apiUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system: SYSTEM_PROMPT,
          messages: next.map(m => ({ role: m.role, content: m.content })),
        })
      });
      const data = await res.json();
      const reply = data.reply || "Sorry, I couldn't get a response.";
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: "Having trouble connecting. Please try again!" }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <motion.button
        onClick={() => setOpen(o => !o)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-8 right-8 z-50 h-14 px-5 rounded-full bg-brand shadow-2xl flex items-center justify-center gap-2.5 text-white"
        aria-label="Open CareAgent guide"
      >
        <AnimatePresence mode="wait">
          {open
            ? <motion.div key="x" initial={{rotate:-90,opacity:0}} animate={{rotate:0,opacity:1}} exit={{rotate:90,opacity:0}} transition={{duration:0.15}}><X size={24}/></motion.div>
            : <motion.div key="bot" className="flex items-center gap-2.5" initial={{rotate:90,opacity:0}} animate={{rotate:0,opacity:1}} exit={{rotate:-90,opacity:0}} transition={{duration:0.15}}>
                <Bot size={24}/>
                <span className="font-black tracking-widest uppercase text-[11px]">Ask CareAgent</span>
              </motion.div>
          }
        </AnimatePresence>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-6 z-50 w-[340px] max-h-[500px] flex flex-col rounded-2xl border border-border-faint bg-bg shadow-2xl overflow-hidden"
          >
            <div className="flex items-center gap-3 px-4 py-3 bg-brand">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <Bot size={16} className="text-white" />
              </div>
              <div>
                <div className="text-[13px] font-bold text-white">CareAgent Guide</div>
                <div className="text-[10px] text-white/70">Ask me about the platform</div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-0 max-h-[340px]">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] text-[12px] px-3 py-2 rounded-2xl leading-relaxed whitespace-pre-wrap ${
                    m.role === 'user'
                      ? 'bg-brand text-white rounded-br-sm'
                      : 'bg-surface border border-border-faint text-text-primary rounded-bl-sm'
                  }`}>
                    {m.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-surface border border-border-faint rounded-2xl rounded-bl-sm px-3 py-2">
                    <div className="flex gap-1 items-center h-4">
                      {[0,1,2].map(i => (
                        <motion.div key={i} className="w-1.5 h-1.5 rounded-full bg-brand"
                          animate={{ y: [0,-4,0] }} transition={{ duration: 0.6, repeat: Infinity, delay: i*0.15 }} />
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            <div className="px-3 py-3 border-t border-border-faint flex gap-2">
              <input
                className="flex-1 bg-surface border border-border-mid rounded-xl px-3 py-2 text-[12px] text-text-primary outline-none focus:border-brand transition-colors placeholder:text-text-disabled"
                placeholder="Ask about CareAgent..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && send()}
                disabled={loading}
              />
              <button
                onClick={send}
                disabled={loading || !input.trim()}
                className="w-8 h-8 rounded-xl bg-brand text-white flex items-center justify-center hover:opacity-90 disabled:opacity-40 transition-opacity flex-shrink-0"
              >
                <ArrowRight size={14} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
