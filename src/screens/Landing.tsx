import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowRight, Bot, Zap, Shield, MessageSquare, Database, Menu, X, Check,
  Clock, Home, Car, GraduationCap, ShoppingBag, Hammer, UserCheck, Layers,
  RefreshCw, ChevronDown, Smile, MessageCircle,
} from "lucide-react";
import { Button } from "../components/ui/Button";
import { Typewriter } from "../components/Typewriter";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "../store";
import { AuthModal } from "../components/AuthModal";

// ── Pricing — single source of truth ─────────────────────────
// Every price on this page (cards, cost estimator, FAQ, the guide bot)
// reads from here. Change a number once and the whole page follows.
// "AI reply" = one reply written by CareAgent's AI (auto-sent or approved).
const PRICING = {
  starter: { price: 49, includedReplies: 1500, extraPerReply: 0.02, channels: 2 },
  growth: { price: 149, includedReplies: 6000, extraPerReply: 0.015 },
  managed: { base: 45, perReply: 0.03, setupFee: 199 },
  // WhatsApp fees are charged by Meta to the client's own WhatsApp Business
  // account, not by CareAgent. perReplyAfterFree is only used inside the
  // cost estimator as a typical rate (Pakistan, Oct 2026); it isn't shown as text.
  whatsapp: { freeRepliesPerNumber: 1000, perReplyAfterFree: 0.015 },
};

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] }
};

const NAV_ITEMS = [
  { label: "How it works", id: "how-it-works" },
  { label: "Industries", id: "industries" },
  { label: "Pricing", id: "pricing" },
  { label: "FAQ", id: "faq" },
];

const usd = (n: number) =>
  n >= 100 ? `$${Math.round(n).toLocaleString()}` : `$${n.toFixed(2).replace(/\.00$/, "")}`;

export const Landing = () => {
  const navigate = useNavigate();
  const { token } = useAppStore();
  const [isAuthModalOpen, setIsAuthModalOpen] = React.useState(false);
  const onEnterApp = () => {
    if (token) navigate("/dashboard");
    else setIsAuthModalOpen(true);
  };
  const scrollTo = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

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

          <div className="hidden md:flex items-center gap-10">
            {NAV_ITEMS.map((item, i) => (
              <motion.a
                key={item.id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 + 0.2 }}
                href={`#${item.id}`}
                className="text-[14px] font-semibold text-text-muted hover:text-brand transition-colors relative group"
              >
                {item.label}
                <span className="absolute -bottom-1.5 left-0 w-0 h-0.5 bg-brand transition-all duration-300 group-hover:w-full" />
              </motion.a>
            ))}
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.6 }}>
              <Button variant="primary" onClick={onEnterApp} className="px-8 py-4 text-sm rounded-full font-bold">
                {token ? "Go To Dashboard" : "Sign In / Sign Up"}
              </Button>
            </motion.div>
          </div>

          <button className="md:hidden p-2 text-text-muted" onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Menu">
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
                {NAV_ITEMS.map((item) => (
                  <a key={item.id} href={`#${item.id}`} className="text-2xl font-extrabold text-text-primary tracking-tight" onClick={() => setIsMenuOpen(false)}>{item.label}</a>
                ))}
                <Button variant="primary" onClick={onEnterApp} className="w-full py-5 text-xl font-bold rounded-full">{token ? "Go To Dashboard" : "Get started"}</Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Hero */}
      <section className="relative pt-40 md:pt-48 pb-24 px-6 z-10">
        <div className="max-w-4xl mx-auto flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 inline-flex items-center gap-2 rounded-full border border-border-faint bg-surface px-4 py-2 text-[13px] font-semibold text-text-second"
          >
            <span className="flex items-center gap-1.5">
              {CHANNELS.map(c => <ChannelIcon key={c.key} channel={c.key} size={16} />)}
            </span>
            One inbox for all five
          </motion.div>

          <h1 className="text-5xl md:text-[4.75rem] font-extrabold text-text-primary tracking-tighter leading-[1.05] mb-8 min-h-[120px] md:min-h-[165px]">
            <Typewriter text="Every lead answered." speed={40} delay={200} cursor={false} /> <br className="hidden md:block" />
            <span className="relative inline-block text-brand">
              <Typewriter text="Even at 2 AM." speed={60} delay={1200} />
            </span>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="text-lg md:text-xl text-text-muted max-w-2xl mb-12 leading-relaxed"
          >
            You pay for ads, SEO and Google listings to make customers message you. CareAgent makes sure
            every one of them gets a correct answer in seconds, from your own prices and policies, on
            whichever app they used. Anything it can't answer goes straight to your team.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center gap-4"
          >
            <Button variant="primary" size="lg" onClick={onEnterApp} className="px-10 py-5 text-lg h-auto rounded-full font-bold shadow-xl hover:shadow-2xl transition-shadow">
              Get started <ArrowRight className="ml-2" size={20} />
            </Button>
            <button onClick={() => scrollTo("pricing")} className="px-6 py-4 text-base font-bold text-text-primary hover:text-brand transition-colors">
              See pricing
            </button>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-6 text-sm text-text-muted"
          >
            Set up in an afternoon · Cancel any month · Already answering admissions questions for a university in Lahore
          </motion.p>
        </div>

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

      {/* The problem */}
      <section className="py-24 px-6 border-t border-border-faint">
        <div className="max-w-6xl mx-auto">
          <motion.div {...fadeInUp} className="max-w-2xl mb-14">
            <h2 className="text-4xl md:text-5xl font-extrabold text-text-primary tracking-tighter mb-6 leading-[1.1]">
              Getting the lead is half the job.
            </h2>
            <p className="text-lg text-text-muted leading-relaxed">
              The other half is replying before the customer messages your competitor. Most small teams can't
              watch five apps all day, so paid-for inquiries sit unread.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: <Clock size={24} />, problem: "Messages arrive after hours", fix: "CareAgent replies at 11 PM, on Sundays and on Eid, in seconds." },
              { icon: <RefreshCw size={24} />, problem: "The same 20 questions, every day", fix: "Price, timing, location, availability: answered from your own documents." },
              { icon: <Layers size={24} />, problem: "Five apps, one tired person", fix: "WhatsApp, Instagram, Facebook, Gmail and website chat land in one inbox." },
            ].map((p) => (
              <motion.div key={p.problem} {...fadeInUp} className="bg-surface rounded-2xl border border-border-faint p-8 flex flex-col gap-4">
                <div className="w-12 h-12 rounded-xl bg-brand/10 flex items-center justify-center text-brand">{p.icon}</div>
                <h3 className="text-xl font-black text-text-primary tracking-tight">{p.problem}</h3>
                <p className="text-text-muted leading-relaxed">{p.fix}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Industries */}
      <section id="industries" className="py-24 px-6 bg-surface border-y border-border-faint">
        <div className="max-w-6xl mx-auto">
          <motion.div {...fadeInUp} className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-extrabold text-text-primary tracking-tighter mb-6 leading-[1.1]">
              Built for businesses that <span className="text-brand">live on inquiries.</span>
            </h2>
            <p className="text-lg text-text-muted max-w-2xl mx-auto">
              Pick your business and see the kind of conversation CareAgent handles for you.
            </p>
          </motion.div>
          <IndustryExamples />
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-32 px-6 relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="mb-16 max-w-xl">
            <h2 className="text-4xl md:text-5xl font-extrabold text-text-primary tracking-tighter mb-6 leading-[1.1]">
              What you get with <span className="text-brand">CareAgent</span>
            </h2>
            <p className="text-lg text-text-muted">No coding, no new phone numbers, no new apps for your customers.</p>
          </div>

          <div className="grid lg:grid-cols-12 gap-6">
            <motion.div {...fadeInUp} className="lg:col-span-7 bg-bg rounded-2xl border border-border-faint p-10">
              <div className="w-14 h-14 rounded-xl bg-brand/10 flex items-center justify-center text-brand mb-8"><Database size={28} /></div>
              <h3 className="text-3xl font-black text-text-primary mb-4 tracking-tight">Answers from your own information</h3>
              <p className="text-text-second text-base leading-relaxed max-w-md">
                Upload your price list, brochure, FAQ or website pages. CareAgent answers only from what you give it,
                and you can pin the facts it must always get right.
              </p>
            </motion.div>

            <motion.div {...fadeInUp} className="lg:col-span-5 bg-brand text-white rounded-2xl p-10 flex flex-col justify-between">
              <div>
                <div className="w-14 h-14 rounded-xl bg-white text-brand flex items-center justify-center mb-8"><Zap size={28} /></div>
                <h3 className="text-3xl font-black mb-4 tracking-tight">Many conversations at once</h3>
                <p className="text-white/85 text-base leading-relaxed">
                  Several AI agents work in parallel, so a busy ad campaign never creates a queue.
                </p>
              </div>
            </motion.div>

            <motion.div {...fadeInUp} className="lg:col-span-4 bg-bg-elevated rounded-2xl border border-border-faint p-10 flex flex-col">
              <div className="w-14 h-14 rounded-xl bg-white border border-border-faint flex items-center justify-center text-brand mb-8"><Smile size={28} /></div>
              <h3 className="text-2xl font-black text-text-primary mb-3 tracking-tight">Spots unhappy customers</h3>
              <p className="text-text-muted text-sm leading-relaxed">
                Sentiment tracking flags frustrated customers and hands them to a person before they leave.
              </p>
            </motion.div>

            <motion.div {...fadeInUp} className="lg:col-span-4 bg-bg-elevated rounded-2xl border border-border-faint p-10 flex flex-col">
              <div className="w-14 h-14 rounded-xl bg-white border border-border-faint flex items-center justify-center text-brand mb-8"><UserCheck size={28} /></div>
              <h3 className="text-2xl font-black text-text-primary mb-3 tracking-tight">Your team stays in charge</h3>
              <p className="text-text-muted text-sm leading-relaxed">
                Approve every reply, or let confident answers send on their own. You choose per channel.
              </p>
            </motion.div>

            <motion.div {...fadeInUp} className="lg:col-span-4 bg-bg-elevated rounded-2xl border border-border-faint p-10 flex flex-col">
              <div className="w-14 h-14 rounded-xl bg-white border border-border-faint flex items-center justify-center text-brand mb-8"><RefreshCw size={28} /></div>
              <h3 className="text-2xl font-black text-text-primary mb-3 tracking-tight">Gets better as you use it</h3>
              <p className="text-text-muted text-sm leading-relaxed">
                When your team edits a reply or answers an escalation, CareAgent learns the better answer.
              </p>
            </motion.div>

            <motion.div {...fadeInUp} className="lg:col-span-12 bg-surface-high border border-border-mid rounded-2xl p-10 flex flex-col md:flex-row items-center gap-10">
              <div className="flex-1">
                <h3 className="text-3xl font-black text-text-primary mb-4 tracking-tight leading-[1.1]">Built with real safeguards</h3>
                <ul className="space-y-3">
                  {[
                    "If the answer isn't in your information, CareAgent tells the customer a person will follow up, and flags it for your team",
                    "Every conversation is logged. Nothing is sent silently",
                    "Uses official Meta and Google connections, so your accounts stay in good standing",
                  ].map(t => (
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

      {/* Channels */}
      <section id="integrations" className="py-20 px-6 relative overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <motion.div {...fadeInUp} className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-extrabold tracking-tighter text-text-primary mb-6 leading-[1.1] min-h-[2.2em]">
              <Typewriter text="Meet your customers " speed={40} delay={0} cursor={false} />
              <br />
              <span className="text-brand"><Typewriter text="where they are." speed={40} delay={800} /></span>
            </h2>
            <p className="text-lg text-text-muted max-w-xl mx-auto">All five channels are live. Connect each one with its official login button.</p>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-5 mb-16">
            {CHANNELS.map((c, i) => (
              <motion.div
                key={c.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                whileHover={{ y: -5 }}
                className="p-6 rounded-3xl border border-border-faint bg-surface shadow-card hover:shadow-hover transition-all duration-300 flex flex-col items-center text-center gap-3 group"
              >
                <div
                  className="w-20 h-20 rounded-2xl flex items-center justify-center mb-1 group-hover:scale-110 transition-transform duration-300"
                  style={{ backgroundColor: `${CHANNEL_TINT[c.key]}14` }}
                >
                  <ChannelIcon channel={c.key} size={36} />
                </div>
                <div className="text-[16px] font-bold text-text-primary">{c.name}</div>
                <div className="text-[13px] text-text-muted leading-relaxed">{c.desc}</div>
                <span className="text-[11px] font-bold text-brand bg-brand/10 rounded-full px-3 py-1">Live</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-28 px-6 relative bg-bg border-t border-border-faint">
        <div className="max-w-5xl mx-auto">
          <div className="mb-16 text-center">
            <h2 className="text-4xl md:text-6xl font-extrabold text-text-primary tracking-tighter leading-[1.05]">
              Live in an afternoon.
            </h2>
            <p className="text-lg text-text-muted mt-6">Three steps. On the Managed plan, we do all three for you.</p>
          </div>

          <div className="flex flex-col gap-6">
            {[
              { icon: <MessageSquare />, title: "1. Connect your channels", desc: "Log in to WhatsApp Business, Instagram, Facebook and Gmail with their official buttons, and add the chat widget to your website." },
              { icon: <Database />, title: "2. Teach it your business", desc: "Upload your price list, services, timings and FAQs, and set the tone you want. Pin the facts that must always be exact." },
              { icon: <Bot />, title: "3. Go live", desc: "Start by approving every reply. Switch on auto-send for a channel once you trust the answers. Anything uncertain goes to your team." },
            ].map((step) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5 }}
                className="flex flex-col md:flex-row items-center gap-8 p-6 md:p-10 bg-surface rounded-2xl border border-border-faint shadow-card"
              >
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl bg-brand/10 flex items-center justify-center text-brand shrink-0">{step.icon}</div>
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
          <div className="text-center mb-16 flex flex-col items-center">
            <h2 className="text-4xl md:text-6xl font-extrabold text-text-primary tracking-tighter mb-6">
              Simple plans. No per-seat fees.
            </h2>
            <p className="text-lg text-text-muted max-w-2xl">
              Pick the plan that fits how many customers message you. Cancel any month.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 items-stretch max-w-6xl mx-auto">
            <PricingCard
              title="Starter"
              price={`$${PRICING.starter.price}`}
              suffix="/ month"
              desc="For a small business answering on one or two apps."
              features={[
                `${PRICING.starter.includedReplies.toLocaleString()} AI replies a month`,
                `Any ${PRICING.starter.channels} channels`,
                "Knowledge base and pinned facts",
                "Approve-first or auto-send",
                "Human handoff for uncertain answers",
              ]}
              cta="Get started"
              onClick={onEnterApp}
            />
            <PricingCard
              title="Growth"
              price={`$${PRICING.growth.price}`}
              suffix="/ month"
              popular
              desc="For teams running ads and handling inquiries all day."
              features={[
                `${PRICING.growth.includedReplies.toLocaleString()} AI replies a month`,
                "All 5 channels",
                "Several AI agents working in parallel",
                "Sentiment tracking and escalation",
                "Analytics and reports",
                "Priority support on WhatsApp",
              ]}
              cta="Get started"
              onClick={onEnterApp}
            />
            <PricingCard
              title="Managed"
              price={`$${PRICING.managed.base}`}
              suffix="/ month + usage"
              desc="We set it up and run it. You only see your inbox."
              features={[
                "Everything in Growth",
                `$${PRICING.managed.perReply} per AI reply, no monthly cap`,
                "We set up your WhatsApp Business and Meta accounts",
                "We write and maintain your knowledge base",
                "No accounts, keys or settings to manage",
                "Live usage meter in your dashboard",
                `One-time setup $${PRICING.managed.setupFee}`,
              ]}
              cta="Estimate my cost"
              onClick={() => scrollTo("estimate")}
            />
          </div>

          <p className="text-center text-sm text-text-muted mt-10 max-w-3xl mx-auto">
            WhatsApp charges a small fee per message, set by Meta and billed by Meta to your own WhatsApp Business
            account on every plan. The rate varies by your customers' country.
          </p>

          <CostEstimator onStart={onEnterApp} />
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-28 px-6 bg-bg">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-extrabold text-text-primary tracking-tighter mb-12 text-center">Questions businesses ask us</h2>
          <FAQ />
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-6 pb-28 bg-bg">
        <div className="max-w-5xl mx-auto bg-brand rounded-3xl p-10 md:p-16 text-center text-white">
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tighter mb-6 leading-[1.1]">
            Stop paying for leads nobody answers.
          </h2>
          <p className="text-white/85 text-lg max-w-xl mx-auto mb-10">
            Connect one channel today and watch CareAgent answer your next customer.
          </p>
          <button
            onClick={onEnterApp}
            className="inline-flex items-center gap-2 bg-white text-brand font-bold text-lg rounded-full px-10 py-5 shadow-xl hover:shadow-2xl transition-shadow"
          >
            Get started <ArrowRight size={20} />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="pt-20 pb-12 px-6 bg-bg border-t border-border-faint">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-start justify-between gap-16 mb-16">
            <div className="max-w-sm">
              <img src="/Logo-CareAgent.png" alt="CareAgent" className="h-16 object-contain mb-6" />
              <p className="text-text-muted text-base font-medium leading-relaxed">
                AI customer replies for WhatsApp, Instagram, Facebook, Gmail and website chat. It answers from your
                information, sends confident replies and hands the rest to your team.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-16 md:gap-24">
              <div>
                <h6 className="font-bold text-lg text-text-primary mb-6">Product</h6>
                <ul className="space-y-4 font-medium text-text-muted text-base">
                  {NAV_ITEMS.map(item => (
                    <li key={item.id}><a href={`#${item.id}`} className="hover:text-brand transition-colors">{item.label}</a></li>
                  ))}
                </ul>
              </div>
              <div>
                <h6 className="font-bold text-lg text-text-primary mb-6">Legal</h6>
                <ul className="space-y-4 font-medium text-text-muted text-base">
                  <li><a href="/privacy" className="hover:text-brand transition-colors">Privacy Policy</a></li>
                  <li><a href="/refund-policy" className="hover:text-brand transition-colors">Refund Policy</a></li>
                  <li><a href="/terms" className="hover:text-brand transition-colors">Terms of Service</a></li>
                </ul>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-border-faint text-sm font-medium text-text-muted">
            2026 CareAgent. Powered by Flint Sol
          </div>
        </div>
      </footer>
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      <CareAgentBot />
    </div>
  );
};

// ── Channel icons ───────────────────────────────────────────
// Official brand marks from Simple Icons (CC0), drawn on a 24×24 grid.
const BRAND_ICONS: Record<string, { color: string; path: string }> = {
  whatsapp: { color: "#25D366", path: "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" },
  instagram: { color: "#FF0069", path: "M7.0301.084c-1.2768.0602-2.1487.264-2.911.5634-.7888.3075-1.4575.72-2.1228 1.3877-.6652.6677-1.075 1.3368-1.3802 2.127-.2954.7638-.4956 1.6365-.552 2.914-.0564 1.2775-.0689 1.6882-.0626 4.947.0062 3.2586.0206 3.6671.0825 4.9473.061 1.2765.264 2.1482.5635 2.9107.308.7889.72 1.4573 1.388 2.1228.6679.6655 1.3365 1.0743 2.1285 1.38.7632.295 1.6361.4961 2.9134.552 1.2773.056 1.6884.069 4.9462.0627 3.2578-.0062 3.668-.0207 4.9478-.0814 1.28-.0607 2.147-.2652 2.9098-.5633.7889-.3086 1.4578-.72 2.1228-1.3881.665-.6682 1.0745-1.3378 1.3795-2.1284.2957-.7632.4966-1.636.552-2.9124.056-1.2809.0692-1.6898.063-4.948-.0063-3.2583-.021-3.6668-.0817-4.9465-.0607-1.2797-.264-2.1487-.5633-2.9117-.3084-.7889-.72-1.4568-1.3876-2.1228C21.2982 1.33 20.628.9208 19.8378.6165 19.074.321 18.2017.1197 16.9244.0645 15.6471.0093 15.236-.005 11.977.0014 8.718.0076 8.31.0215 7.0301.0839m.1402 21.6932c-1.17-.0509-1.8053-.2453-2.2287-.408-.5606-.216-.96-.4771-1.3819-.895-.422-.4178-.6811-.8186-.9-1.378-.1644-.4234-.3624-1.058-.4171-2.228-.0595-1.2645-.072-1.6442-.079-4.848-.007-3.2037.0053-3.583.0607-4.848.05-1.169.2456-1.805.408-2.2282.216-.5613.4762-.96.895-1.3816.4188-.4217.8184-.6814 1.3783-.9003.423-.1651 1.0575-.3614 2.227-.4171 1.2655-.06 1.6447-.072 4.848-.079 3.2033-.007 3.5835.005 4.8495.0608 1.169.0508 1.8053.2445 2.228.408.5608.216.96.4754 1.3816.895.4217.4194.6816.8176.9005 1.3787.1653.4217.3617 1.056.4169 2.2263.0602 1.2655.0739 1.645.0796 4.848.0058 3.203-.0055 3.5834-.061 4.848-.051 1.17-.245 1.8055-.408 2.2294-.216.5604-.4763.96-.8954 1.3814-.419.4215-.8181.6811-1.3783.9-.4224.1649-1.0577.3617-2.2262.4174-1.2656.0595-1.6448.072-4.8493.079-3.2045.007-3.5825-.006-4.848-.0608M16.953 5.5864A1.44 1.44 0 1 0 18.39 4.144a1.44 1.44 0 0 0-1.437 1.4424M5.8385 12.012c.0067 3.4032 2.7706 6.1557 6.173 6.1493 3.4026-.0065 6.157-2.7701 6.1506-6.1733-.0065-3.4032-2.771-6.1565-6.174-6.1498-3.403.0067-6.156 2.771-6.1496 6.1738M8 12.0077a4 4 0 1 1 4.008 3.9921A3.9996 3.9996 0 0 1 8 12.0077" },
  messenger: { color: "#00B2FF", path: "M.001 11.639C.001 4.949 5.241 0 12.001 0S24 4.95 24 11.639c0 6.689-5.24 11.638-12 11.638-1.21 0-2.38-.16-3.47-.46a.96.96 0 00-.64.05l-2.39 1.05a.96.96 0 01-1.35-.85l-.07-2.14a.97.97 0 00-.32-.68A11.39 11.389 0 01.002 11.64zm8.32-2.19l-3.52 5.6c-.35.53.32 1.139.82.75l3.79-2.87c.26-.2.6-.2.87 0l2.8 2.1c.84.63 2.04.4 2.6-.48l3.52-5.6c.35-.53-.32-1.13-.82-.75l-3.79 2.87c-.25.2-.6.2-.86 0l-2.8-2.1a1.8 1.8 0 00-2.61.48z" },
  gmail: { color: "#EA4335", path: "M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z" },
};

type ChannelKey = "whatsapp" | "instagram" | "messenger" | "gmail" | "website";

const ChannelIcon = ({ channel, size = 24 }: { channel: ChannelKey; size?: number }) => {
  if (channel === "website") {
    return <MessageCircle size={size} color="#0EA5E9" strokeWidth={2.25} aria-hidden="true" />;
  }
  const icon = BRAND_ICONS[channel];
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill={icon.color} aria-hidden="true">
      <path d={icon.path} />
    </svg>
  );
};

const CHANNEL_TINT: Record<ChannelKey, string> = {
  whatsapp: "#25D366", instagram: "#FF0069", messenger: "#00B2FF", gmail: "#EA4335", website: "#0EA5E9",
};

const CHANNELS: { key: ChannelKey; name: string; desc: string }[] = [
  { key: "whatsapp", name: "WhatsApp", desc: "Your WhatsApp Business number" },
  { key: "instagram", name: "Instagram", desc: "Direct messages to your business account" },
  { key: "messenger", name: "Messenger", desc: "Messages to your Facebook Page" },
  { key: "gmail", name: "Gmail", desc: "Your support or sales inbox" },
  { key: "website", name: "Website chat", desc: "A chat widget for your own site" },
];

// ── Industry examples ───────────────────────────────────────
const INDUSTRIES = [
  {
    key: "realestate", label: "Real estate", icon: <Home size={18} />, channel: "whatsapp" as ChannelKey,
    question: "Is the 10 marla house in DHA Phase 6 still available? Can I see it on Saturday?",
    answer: "Yes, it's still available. Saturday viewings run from 11 AM to 5 PM. Which time suits you? I'll confirm it with our agent and send you the location pin.",
  },
  {
    key: "auto", label: "Car dealers & workshops", icon: <Car size={18} />, channel: "instagram" as ChannelKey,
    question: "How much is a full service for a 2018 Corolla, and can I bring it tomorrow?",
    answer: "A full service for a 2018 Corolla starts at PKR 12,000 and takes about 3 hours. We have slots tomorrow at 10 AM and 2 PM. Shall I book one for you?",
  },
  {
    key: "education", label: "Schools & universities", icon: <GraduationCap size={18} />, channel: "messenger" as ChannelKey,
    question: "What's the fee for BS Computer Science, and are there scholarships?",
    answer: "The BS Computer Science fee is PKR 95,000 per semester. Merit scholarships of up to 50% are available for students with 80% or more in intermediate. Would you like the admission form?",
  },
  {
    key: "retail", label: "Retailers & manufacturers", icon: <ShoppingBag size={18} />, channel: "website" as ChannelKey,
    question: "Do you deliver 20 kg of green tea to Karachi? What's your wholesale price?",
    answer: "Yes, we deliver across Pakistan in 3 to 5 working days. Wholesale prices depend on the blend, so I've passed your request to our sales team. They'll send you a quote today.",
    escalated: true,
  },
  {
    key: "services", label: "Carpenters & home services", icon: <Hammer size={18} />, channel: "gmail" as ChannelKey,
    question: "Can you make a 6-seater walnut dining table? How long would it take?",
    answer: "Yes. Custom 6-seater tables usually take about 3 weeks. Could you share the size you need and a photo of a design you like? Our carpenter will send you a quote.",
  },
];

const IndustryExamples = () => {
  const [active, setActive] = React.useState(INDUSTRIES[0].key);
  const item = INDUSTRIES.find(i => i.key === active) ?? INDUSTRIES[0];
  return (
    <div className="grid lg:grid-cols-12 gap-8 items-start">
      <div className="lg:col-span-4 flex flex-row lg:flex-col gap-2 overflow-x-auto pb-2 lg:pb-0">
        {INDUSTRIES.map(i => (
          <button
            key={i.key}
            onClick={() => setActive(i.key)}
            className={`shrink-0 flex items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-bold border transition-colors ${
              active === i.key ? "bg-brand text-white border-brand" : "bg-bg text-text-second border-border-faint hover:border-brand/50"
            }`}
          >
            {i.icon} {i.label}
          </button>
        ))}
      </div>

      <div className="lg:col-span-8 bg-bg rounded-2xl border border-border-faint p-6 md:p-8 min-w-0">
        <div className="flex items-center justify-between mb-6 gap-4">
          <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-text-muted">
            <ChannelIcon channel={item.channel} size={16} />
            Example conversation · {CHANNELS.find(c => c.key === item.channel)?.name}
          </span>
          <span className="text-xs font-bold text-brand bg-brand/10 rounded-full px-3 py-1">Answered by CareAgent</span>
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={item.key}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="flex flex-col gap-4"
          >
            <div className="self-start max-w-[85%] bg-surface border border-border-faint rounded-2xl rounded-bl-sm px-4 py-3 text-[15px] text-text-primary">
              {item.question}
            </div>
            <div className="self-end max-w-[85%] bg-brand text-white rounded-2xl rounded-br-sm px-4 py-3 text-[15px] leading-relaxed">
              {item.answer}
            </div>
            {item.escalated && (
              <div className="self-end text-xs font-bold text-text-second bg-surface-high border border-border-mid rounded-full px-3 py-1.5">
                Handed to your sales team
              </div>
            )}
          </motion.div>
        </AnimatePresence>
        <p className="text-xs text-text-muted mt-6">Prices and details come from the information you upload.</p>
      </div>
    </div>
  );
};

// ── Cost estimator ──────────────────────────────────────────
const CostEstimator = ({ onStart }: { onStart: () => void }) => {
  const [conversations, setConversations] = React.useState(600);
  const [repliesPer, setRepliesPer] = React.useState(3);
  const [waShare, setWaShare] = React.useState(60);

  const totalReplies = conversations * repliesPer;
  const waReplies = Math.round(totalReplies * (waShare / 100));
  const metaFee = Math.max(0, waReplies - PRICING.whatsapp.freeRepliesPerNumber) * PRICING.whatsapp.perReplyAfterFree;

  const plans = [
    {
      name: "Starter",
      base: PRICING.starter.price,
      usage: Math.max(0, totalReplies - PRICING.starter.includedReplies) * PRICING.starter.extraPerReply,
      note: `Includes ${PRICING.starter.includedReplies.toLocaleString()} replies, ${PRICING.starter.channels} channels`,
    },
    {
      name: "Growth",
      base: PRICING.growth.price,
      usage: Math.max(0, totalReplies - PRICING.growth.includedReplies) * PRICING.growth.extraPerReply,
      note: `Includes ${PRICING.growth.includedReplies.toLocaleString()} replies, all channels`,
    },
    {
      name: "Managed",
      base: PRICING.managed.base,
      usage: totalReplies * PRICING.managed.perReply,
      note: `$${PRICING.managed.perReply} per reply, set up and run for you`,
    },
  ].map(p => ({ ...p, careagent: p.base + p.usage, total: p.base + p.usage + metaFee }));

  const max = Math.max(...plans.map(p => p.total));
  const cheapest = plans.reduce((a, b) => (b.careagent < a.careagent ? b : a));

  return (
    <motion.div id="estimate" {...fadeInUp} className="max-w-6xl mx-auto mt-20 bg-bg rounded-3xl border border-border-faint p-6 md:p-10">
      <div className="mb-8">
        <h3 className="text-3xl font-black text-text-primary tracking-tight mb-2">Estimate your monthly cost</h3>
        <p className="text-text-muted">Move the sliders to match your business. Your dashboard shows the same meter as you use it.</p>
      </div>

      <div className="grid lg:grid-cols-12 gap-10">
        <div className="lg:col-span-5 flex flex-col gap-7 min-w-0">
          <Slider id="est-conversations" label="Customer conversations a month" value={conversations} min={50} max={5000} step={50}
            onChange={setConversations} display={conversations.toLocaleString()} />
          <Slider id="est-replies" label="AI replies per conversation" value={repliesPer} min={1} max={8} step={1}
            onChange={setRepliesPer} display={String(repliesPer)} />
          <Slider id="est-whatsapp" label="Share of conversations on WhatsApp" value={waShare} min={0} max={100} step={5}
            onChange={setWaShare} display={`${waShare}%`} />
          <div className="rounded-xl bg-surface border border-border-faint p-4 text-sm text-text-second leading-relaxed">
            That's <strong className="text-text-primary">{totalReplies.toLocaleString()} AI replies</strong> a month,
            {" "}{waReplies.toLocaleString()} of them on WhatsApp.
          </div>
        </div>

        <div className="lg:col-span-7 flex flex-col gap-6 min-w-0">
          {plans.map(p => (
            <div key={p.name} className="flex flex-col gap-2">
              <div className="flex items-baseline justify-between gap-4">
                <span className="font-bold text-text-primary">
                  {p.name}
                  {p.name === cheapest.name && <span className="ml-2 text-[11px] font-bold text-white bg-brand rounded-full px-2.5 py-0.5 align-middle">Lowest for you</span>}
                </span>
                <span className="font-black text-xl text-text-primary tabular-nums">{usd(p.total)}<span className="text-sm font-bold text-text-muted"> / mo</span></span>
              </div>
              <div className="h-4 w-full rounded-full bg-surface overflow-hidden flex" aria-hidden="true">
                <div className="h-full bg-brand" style={{ width: `${(p.base / max) * 100}%` }} />
                <div className="h-full bg-brand/40" style={{ width: `${(p.usage / max) * 100}%` }} />
                <div className="h-full bg-border-mid" style={{ width: `${(metaFee / max) * 100}%` }} />
              </div>
              <div className="text-xs text-text-muted tabular-nums">
                Plan {usd(p.base)} · AI usage {usd(p.usage)} · WhatsApp fees to Meta {usd(metaFee)} · {p.note}
              </div>
            </div>
          ))}

          <div className="flex flex-wrap gap-4 text-xs text-text-muted pt-2">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-brand" /> Plan fee</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-brand/40" /> AI usage</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-border-mid" /> WhatsApp fees (billed by Meta)</span>
          </div>

          <p className="text-xs text-text-muted leading-relaxed">
            Estimate only. WhatsApp fees use a typical rate; the real rate depends on your customers' country, and Meta bills it to
            your WhatsApp Business account. Managed adds a one-time ${PRICING.managed.setupFee} setup fee.
          </p>

          <div>
            <Button variant="primary" onClick={onStart} className="px-8 py-4 rounded-full font-bold">
              Start with {cheapest.name} <ArrowRight className="ml-2" size={18} />
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const Slider = ({ id, label, value, min, max, step, onChange, display }: {
  id: string; label: string; value: number; min: number; max: number; step: number;
  onChange: (v: number) => void; display: string;
}) => (
  <div className="flex flex-col gap-2">
    <div className="flex items-baseline justify-between gap-4">
      <label htmlFor={id} className="text-sm font-bold text-text-second">{label}</label>
      <span className="text-lg font-black text-text-primary tabular-nums">{display}</span>
    </div>
    <input
      id={id}
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={e => onChange(Number(e.target.value))}
      className="w-full accent-brand cursor-pointer"
    />
  </div>
);

// ── FAQ ─────────────────────────────────────────────────────
const FAQS = [
  {
    q: "Do I need any technical knowledge?",
    a: "No. Each channel connects with its official login button, and setup takes about ten minutes per channel. On the Managed plan we do all of it for you.",
  },
  {
    q: "What happens when the AI doesn't know the answer?",
    a: "It doesn't guess. It tells the customer a person will follow up, and the conversation appears in your Escalations list so your team can reply.",
  },
  {
    q: "Can I check replies before they're sent?",
    a: "Yes. By default every reply waits for your approval. You can switch on auto-send for each channel separately once you trust the answers.",
  },
  {
    q: "Are WhatsApp messages included in the price?",
    a: `CareAgent's price covers the AI and the platform. WhatsApp also charges a small per-message fee, set by Meta and billed by Meta to your own WhatsApp Business account. The fee depends on the country of the customer you're replying to.`,
  },
  {
    q: "Which languages does it reply in?",
    a: "It replies in the language the customer writes in, including Urdu and Roman Urdu.",
  },
  {
    q: "What's the difference between Growth and Managed?",
    a: "Growth is a fixed monthly price with a large reply allowance, and you set things up yourself. Managed costs less to start, you pay per reply, and our team sets up and maintains everything for you.",
  },
  {
    q: "Can I cancel?",
    a: "Yes, at any time. Plans are billed monthly. See our refund policy for details.",
  },
];

const FAQ = () => {
  const [open, setOpen] = React.useState<number | null>(0);
  return (
    <div className="flex flex-col divide-y divide-border-faint border-y border-border-faint">
      {FAQS.map((f, i) => (
        <div key={f.q}>
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="w-full flex items-center justify-between gap-6 py-6 text-left"
            aria-expanded={open === i}
          >
            <span className="text-lg font-bold text-text-primary">{f.q}</span>
            <ChevronDown size={20} className={`shrink-0 text-text-muted transition-transform ${open === i ? "rotate-180" : ""}`} />
          </button>
          <AnimatePresence initial={false}>
            {open === i && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <p className="pb-6 text-text-muted leading-relaxed">{f.a}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
};

// ── Pricing card ────────────────────────────────────────────
const PricingCard = ({ title, price, suffix, desc, features, popular, cta = "Get started", onClick }: {
  title: string; price: string; suffix?: string; desc: string; features: string[];
  popular?: boolean; cta?: string; onClick?: () => void;
}) => (
  <motion.div
    className={`p-10 rounded-2xl border flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-brand/50 ${popular ? "bg-bg border-brand relative ring-1 ring-brand/20" : "bg-surface border-border-faint"}`}
  >
    {popular && <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-brand text-white text-[11px] font-bold px-4 py-1.5 rounded-full">Most popular</div>}
    <div className="mb-8">
      <h4 className={`text-xl font-black mb-4 ${popular ? "text-brand" : "text-text-primary"}`}>{title}</h4>
      <div className="flex items-baseline gap-1 mb-4 flex-wrap">
        <span className="text-5xl font-black text-text-primary tracking-tighter">{price}</span>
        {suffix && <span className="text-text-disabled font-bold text-sm ml-1">{suffix}</span>}
      </div>
      <p className="text-text-muted font-medium text-base leading-snug">{desc}</p>
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
      {cta}
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
- When someone asks how to get started or sign up, tell them to click the "Get started" button on this page, or "Sign In / Sign Up" at the top right
- When referencing setup steps, mention they happen inside the platform after signing up

CareAgent key facts:
- AI customer reply platform for small and growing businesses: real estate, car dealers and workshops, schools and universities, retailers, manufacturers and home services
- Connects WhatsApp, Instagram DMs, Facebook Messenger, Gmail and a website chat widget, all live, in one inbox
- Answers from the business's own uploaded information; hands anything it can't answer to the business's team
- Replies can be approved before sending, or auto-sent per channel
- Pricing: Starter $${PRICING.starter.price}/month (${PRICING.starter.includedReplies} AI replies, ${PRICING.starter.channels} channels). Growth $${PRICING.growth.price}/month (${PRICING.growth.includedReplies} AI replies, all channels). Managed $${PRICING.managed.base}/month plus $${PRICING.managed.perReply} per AI reply and a one-time $${PRICING.managed.setupFee} setup, where the CareAgent team sets up and runs everything
- All plans are paid monthly plans; there is no free plan or free trial
- WhatsApp per-message fees are set and billed by Meta to the business's own WhatsApp Business account; the rate varies by country
- There is a cost estimator in the Pricing section of this page`;

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
            className="fixed bottom-24 right-6 z-50 w-[340px] max-w-[calc(100vw-3rem)] max-h-[500px] flex flex-col rounded-2xl border border-border-faint bg-bg shadow-2xl overflow-hidden"
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
                aria-label="Send"
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
