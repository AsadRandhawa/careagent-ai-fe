import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowRight, Bot, Zap, Shield, MessageSquare, Database, Menu, X, Check } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Typewriter } from "../components/Typewriter";

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] }
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

      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? "bg-bg/80 backdrop-blur-xl border-b border-border-faint py-3 shadow-sm" : "py-8"}`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 cursor-pointer group"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            <img src="/Logo-CareAgent.png" alt="CareAgent" className="h-16 md:h-20 object-contain group-hover:scale-105 transition-transform duration-300" />
          </motion.div>

          <div className="hidden md:flex items-center gap-12">
            {["Features", "Integrations", "Pricing"].map((item, i) => (
              <motion.a 
                key={item}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 + 0.2 }}
                href={`#${item.toLowerCase().replace(/\s+/g, "-")}`} 
                className="text-[14px] font-semibold text-text-muted hover:text-brand transition-colors relative group"
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
              <Button variant="primary" onClick={onEnterApp} className="px-8 py-4 text-sm rounded-full font-bold">
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
                  <a key={item} href={`#${item.toLowerCase().replace(/\s+/g, "-")}`} className="text-2xl font-extrabold text-text-primary tracking-tight" onClick={() => setIsMenuOpen(false)}>{item}</a>
                ))}
                <Button variant="primary" onClick={onEnterApp} className="w-full py-5 text-xl font-bold rounded-full">Launch App</Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-32 px-6 z-10">
        <div className="max-w-4xl mx-auto flex flex-col items-center text-center">
          <h1
            className="text-5xl md:text-[5rem] font-extrabold text-text-primary tracking-tighter leading-[1.05] mb-8 min-h-[120px] md:min-h-[170px]"
          >
            <Typewriter text="Customer support that" speed={40} delay={200} cursor={false} /> <br className="hidden md:block" />
            <span className="relative inline-block text-brand">
              <Typewriter text="answers itself." speed={60} delay={1400} />
            </span>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="text-lg md:text-xl text-text-muted max-w-xl mb-12 leading-relaxed"
          >
            Gmail, WhatsApp, Instagram, and live chat, in one inbox. AI drafts every
            reply. Approve it yourself, or let confident answers send on their own.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Button variant="primary" size="lg" onClick={onEnterApp} className="px-10 py-5 text-lg h-auto rounded-full font-bold shadow-xl hover:shadow-2xl transition-shadow">
              Start for free
            </Button>
          </motion.div>
        </div>

        {/* Hero Video Animation */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-5xl mx-auto mt-20 relative rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-border-faint bg-surface"
        >
          <video 
            src="/CareAgent_product_animation_script_202609030626.mp4" 
            autoPlay 
            loop 
            muted 
            playsInline
            className="w-full h-auto object-cover"
          />
        </motion.div>
      </section>

      {/* Feature Showcase (Bento Grid) */}
      <section id="features" className="py-32 px-6 border-t border-border-faint relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="mb-20 max-w-xl">
            <h2 className="text-4xl md:text-5xl font-extrabold text-text-primary tracking-tighter mb-6 leading-[1.1] min-h-[2.2em] md:min-h-[1.1em]">
              <Typewriter text="Experience the " speed={40} delay={0} cursor={false} />
              <span className="text-brand"><Typewriter text="CareAgent" speed={40} delay={600} cursor={false} /></span>
              <Typewriter text=" difference." speed={40} delay={960} />
            </h2>
            <p className="text-lg text-text-muted">Standard chatbots guess. CareAgent understands context and intent.</p>
          </div>

          <div className="grid lg:grid-cols-12 gap-6">
            {/* Bento Card 1 */}
            <motion.div 
              {...fadeInUp}
              className="lg:col-span-7 bg-bg rounded-2xl border border-border-faint p-10 overflow-hidden relative"
            >
              <div className="w-14 h-14 rounded-xl bg-brand/10 flex items-center justify-center text-brand mb-8">
                <Database size={28} />
              </div>
              <h3 className="text-3xl font-black text-text-primary mb-4 tracking-tight">The knowledge brain</h3>
              <p className="text-text-second text-base leading-relaxed max-w-sm">Sync your help center and docs. CareAgent builds a working understanding of your business in minutes.</p>
            </motion.div>

            {/* Bento Card 2 */}
            <motion.div 
              {...fadeInUp}
              className="lg:col-span-5 bg-brand text-white rounded-2xl p-10 flex flex-col justify-between overflow-hidden relative"
            >
              <div>
                <div className="w-14 h-14 rounded-xl bg-white text-brand flex items-center justify-center mb-8">
                  <Zap size={28} />
                </div>
                <h3 className="text-3xl font-black mb-4 tracking-tight">Instant resolution</h3>
                <p className="text-white/85 text-base leading-relaxed">Tickets resolve in seconds with accurate answers.</p>
              </div>
            </motion.div>

            {/* Bento Card 3 */}
            <motion.div 
              {...fadeInUp}
              className="lg:col-span-4 bg-bg-elevated rounded-2xl border border-border-faint p-10 flex flex-col items-center text-center"
            >
              <div className="w-16 h-16 rounded-xl bg-white border border-border-faint flex items-center justify-center text-brand mb-8">
                <MessageSquare size={30} />
              </div>
              <h3 className="text-2xl font-black text-text-primary mb-3 tracking-tight">One inbox, every channel</h3>
              <p className="text-text-muted text-sm">Gmail, WhatsApp, Instagram, and live chat. See and answer everything in one place.</p>
            </motion.div>

            {/* Bento Card 4 */}
            <motion.div 
              {...fadeInUp}
              className="lg:col-span-8 bg-surface-high border border-border-mid rounded-2xl p-10 flex flex-col md:flex-row items-center gap-10"
            >
              <div className="flex-1">
                <h3 className="text-3xl font-black text-text-primary mb-4 tracking-tight leading-[1.1]">Built with real safeguards.</h3>
                <ul className="space-y-3">
                  {[ "Human review before anything sends, or full autonomy once you trust it", "Uncertain answers get flagged for a person", "Every conversation logged, nothing sent silently" ].map(t => (
                    <li key={t} className="flex items-start gap-2.5 font-medium text-text-second text-sm">
                      <div className="w-1.5 h-1.5 rounded-full bg-brand mt-1.5 flex-shrink-0" /> {t}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex-1 w-full bg-bg rounded-xl border border-border-faint aspect-video flex items-center justify-center">
                <Shield size={56} className="text-brand opacity-20" />
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
            <h2 className="text-4xl md:text-6xl font-extrabold tracking-tighter text-text-primary mb-6 leading-[1.1] min-h-[2.2em] md:min-h-[2.2em]">
              <Typewriter text="Meet your customers " speed={40} delay={0} cursor={false} />
              <br/>
              <span className="text-brand"><Typewriter text="where they are." speed={40} delay={800} /></span>
            </h2>
            <p className="text-lg text-text-muted max-w-xl mx-auto">Connect your support channels in minutes. One inbox. Every conversation.</p>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
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
                whileHover={{ y: -5 }}
                className="p-8 rounded-3xl border border-border-faint bg-surface shadow-card hover:shadow-hover transition-all duration-300 flex flex-col items-center text-center gap-4 group"
              >
                <div className="w-20 h-20 bg-surface rounded-2xl shadow-[0_4px_14px_rgba(15,23,42,0.05)] border border-border-faint flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-300">
                  {integration.icon}
                </div>
                <div className="text-[16px] font-bold text-text-primary">{integration.name}</div>
                <div className="text-[13px] text-text-muted leading-relaxed px-2">{integration.desc}</div>
              </motion.div>
            ))}
          </div>
          <motion.div {...fadeInUp} className="text-center mt-12">
            <Button variant="primary" size="lg" className="px-10 py-5 text-lg font-bold rounded-full shadow-lg hover:shadow-hover transition-shadow" onClick={onEnterApp}>
              Connect Your Channels <ArrowRight className="ml-2" size={24} />
            </Button>
          </motion.div>
        </div>
      </section>

      <section id="how-it-works" className="py-32 px-6 relative bg-bg">
        <div className="max-w-5xl mx-auto">
          <div className="mb-20 text-center">
            <h2 className="text-4xl md:text-[5rem] font-extrabold text-text-primary tracking-tighter leading-[1] min-h-[1.2em]">
              <Typewriter text="From noise to clarity." speed={40} delay={0} />
            </h2>
          </div>

          <div className="flex flex-col gap-6 relative pb-16">
            {[
              { icon: <Database />, title: "1. Connect", desc: "Sync your data sources and communication channels instantly." },
              { icon: <Bot />, title: "2. Train", desc: "CareAgent learns your tone, history, and knowledge base." },
              { icon: <Zap />, title: "3. Automate", desc: "Routine tickets get resolved automatically. Anything uncertain goes to a person." }
            ].map((step, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5 }}
                className="flex flex-col md:flex-row items-center gap-8 p-6 md:p-10 bg-surface rounded-2xl border border-border-faint shadow-card hover:shadow-hover transition-all"
              >
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl bg-brand/10 flex items-center justify-center text-brand shrink-0">
                   {step.icon}
                </div>
                <div>
                  <h3 className="text-2xl md:text-3xl font-bold text-text-primary mb-2 tracking-tight">{step.title}</h3>
                  <p className="text-text-muted text-base md:text-lg leading-relaxed max-w-xl">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-32 px-6 bg-surface border-y border-border-faint">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20 flex flex-col items-center">
            <h2 className="text-4xl md:text-6xl font-extrabold text-text-primary tracking-tighter mb-6 min-h-[1.2em]">
              <Typewriter text="Flexible like your team." speed={40} delay={0} />
            </h2>
            <p className="text-lg text-text-muted max-w-lg">Zero per-seat costs. You only pay for successful resolutions.</p>
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

      {/* Final CTA */}
      <section
        className="py-32 px-6 relative flex items-center justify-center text-center"
        style={{ backgroundColor: '#16a34a' }}
      >
        <div className="max-w-2xl relative">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-6xl font-extrabold tracking-tighter leading-[1.05] mb-6"
            style={{ color: '#ffffff' }}
          >
            Scale your support, not your headcount.
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-lg mb-10 max-w-md mx-auto font-medium"
            style={{ color: 'rgba(255,255,255,0.85)' }}
          >
            Connect your first channel and see your first AI-drafted reply today.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Button
              variant="default"
              size="lg"
              onClick={onEnterApp}
              className="px-10 py-5 text-lg font-bold rounded-full border-none shadow-xl"
              style={{ backgroundColor: '#ffffff', color: '#16a34a' }}
            >
              Start for free
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="pt-24 pb-12 px-6 bg-bg">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-start justify-between gap-16 mb-24">
            <div className="max-w-sm">
              <div className="flex items-center gap-3 mb-6">
                <img src="/Logo-CareAgent.png" alt="CareAgent" className="h-16 object-contain" />
              </div>
              <p className="text-text-muted text-base font-medium leading-relaxed mb-8">
                An AI support inbox for Gmail, WhatsApp, Instagram, and live chat. It drafts replies, sends confident answers, and escalates the rest.
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
    className={`p-10 rounded-2xl border flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-brand/50 ${popular ? "bg-bg border-brand relative ring-1 ring-brand/20" : "bg-surface border-border-faint"}`}
  >
    {popular && <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-brand text-white text-[11px] font-bold px-4 py-1.5 rounded-full">Most popular</div>}
    <div className="mb-10">
      <h4 className={`text-xl font-black mb-4 ${popular ? "text-brand" : "text-text-primary"}`}>{title}</h4>
      <div className="flex items-baseline gap-1 mb-4">
        {price !== "Custom" && <span className="text-2xl font-black text-text-primary tracking-tighter">{currency}</span>}
        <span className="text-5xl font-black text-text-primary tracking-tighter">{price}</span>
        {price !== "Custom" && <span className="text-text-disabled font-bold text-sm ml-1">/ month</span>}
      </div>
      <p className="text-text-muted font-medium text-base leading-tight">{desc}</p>
    </div>
    <div className="space-y-4 mb-10 flex-grow">
      {features.map(f => (
        <div key={f} className="flex items-start gap-3">
          <div className={`p-1 rounded-full mt-0.5 ${popular ? "bg-brand text-white" : "bg-border-faint text-text-disabled"}`}><Check size={12} /></div>
          <span className="text-sm font-medium text-text-second">{f}</span>
        </div>
      ))}
    </div>
    <Button 
      variant={popular ? "brand" : "default"} 
      onClick={onClick}
      className={`w-full py-6 rounded-xl text-lg font-bold ${popular ? "" : "bg-bg-elevated text-text-primary hover:bg-surface-high border-border-faint"}`}
    >
      Get started
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
- AI-powered customer support platform that auto-drafts and can auto-send replies
- Connects to Gmail, WhatsApp, Instagram DMs, and website live chat — all live
- Pricing: Startup Rs 0/mo (100 AI resolutions), Growth Rs 45,000/mo (2,500 resolutions), Enterprise custom pricing
- 5-minute setup inside the platform: business identity, brand voice, upload a knowledge doc, connect your channels
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
                <span className="font-bold text-[13px]">Ask CareAgent</span>
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
