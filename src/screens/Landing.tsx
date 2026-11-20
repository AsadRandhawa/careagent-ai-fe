import * as React from "react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
  useReducedMotion,
  useMotionValueEvent,
  useInView,
} from "motion/react";
import {
  ArrowRight,
  Bot,
  Menu,
  X,
  Check,
  CheckCheck,
  Clock,
  Play,
  MessageCircle,
  ChevronDown,
  Info,
  SlidersHorizontal,
} from "lucide-react";
import {
  MoonStars,
  Question,
  Tray,
  FileText as PhosphorFileText,
  PushPin,
  SmileyMeh,
  SmileySad,
  Smiley,
  SealCheck,
  ChartLineUp,
  ShieldCheck,
  CheckCircle,
  House,
  Car as PhosphorCar,
  GraduationCap as PhosphorGraduationCap,
  Bag,
  Wrench,
  ChatCircleDots,
  Database as PhosphorDatabase,
} from "@phosphor-icons/react";
import { Button } from "../components/ui/Button";
import { Typewriter } from "../components/Typewriter";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "../store";
import { AuthModal } from "../components/AuthModal";

// Pricing - single source of truth
// Every price on this page (cards, cost estimator, FAQ, the guide bot)
// reads from here. Change a number once and the whole page follows.
// "AI reply" = one reply written by CareAgent's AI (auto-sent or approved).
const PRICING = {
  starter: { price: 49, includedReplies: 1500, extraPerReply: 0.02, channels: 2 },
  growth: { price: 149, includedReplies: 6000, extraPerReply: 0.015 },
  managed: { base: 45, perReply: 0.03 },
  // WhatsApp fees are charged by Meta to the client's own WhatsApp Business
  // account, not by CareAgent. perReplyAfterFree is only used inside the
  // cost estimator as a typical rate (Pakistan, Oct 2026); it isn't shown as text.
  whatsapp: { freeRepliesPerNumber: 1000, perReplyAfterFree: 0.015 },
};

const EASE = [0.22, 1, 0.36, 1] as const;

const fadeInUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-40px" },
  transition: { duration: 0.6, ease: EASE },
};

const NAV_ITEMS = [
  { label: "How it works", id: "how-it-works" },
  { label: "Industries", id: "industries" },
  { label: "Pricing", id: "pricing" },
  { label: "FAQ", id: "faq" },
];

const usd = (n: number) =>
  n >= 100 ? `$${Math.round(n).toLocaleString()}` : `$${n.toFixed(2).replace(/\.00$/, "")}`;

// ── Lazy load hook ──────────────────────────────────────────
function useLazySection(rootMargin = "250px") {
  const ref = React.useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (typeof IntersectionObserver === "undefined") {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [rootMargin]);

  return { ref, isVisible };
}

// ── Channel icons ───────────────────────────────────────────
// Official brand marks from Simple Icons (CC0), drawn on a 24×24 grid.
const BRAND_ICONS: Record<string, { color: string; path: string }> = {
  whatsapp: {
    color: "#25D366",
    path: "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z",
  },
  instagram: {
    color: "#FF0069",
    path: "M7.0301.084c-1.2768.0602-2.1487.264-2.911.5634-.7888.3075-1.4575.72-2.1228 1.3877-.6652.6677-1.075 1.3368-1.3802 2.127-.2954.7638-.4956 1.6365-.552 2.914-.0564 1.2775-.0689 1.6882-.0626 4.947.0062 3.2586.0206 3.6671.0825 4.9473.061 1.2765.264 2.1482.5635 2.9107.308.7889.72 1.4573 1.388 2.1228.6679.6655 1.3365 1.0743 2.1285 1.38.7632.295 1.6361.4961 2.9134.552 1.2773.056 1.6884.069 4.9462.0627 3.2578-.0062 3.668-.0207 4.9478-.0814 1.28-.0607 2.147-.2652 2.9098-.5633.7889-.3086 1.4578-.72 2.1228-1.3881.665-.6682 1.0745-1.3378 1.3795-2.1284.2957-.7632.4966-1.636.552-2.9124.056-1.2809.0692-1.6898.063-4.948-.0063-3.2583-.021-3.6668-.0817-4.9465-.0607-1.2797-.264-2.1487-.5633-2.9117-.3084-.7889-.72-1.4568-1.3876-2.1228C21.2982 1.33 20.628.9208 19.8378.6165 19.074.321 18.2017.1197 16.9244.0645 15.6471.0093 15.236-.005 11.977.0014 8.718.0076 8.31.0215 7.0301.0839m.1402 21.6932c-1.17-.0509-1.8053-.2453-2.2287-.408-.5606-.216-.96-.4771-1.3819-.895-.422-.4178-.6811-.8186-.9-1.378-.1644-.4234-.3624-1.058-.4171-2.228-.0595-1.2645-.072-1.6442-.079-4.848-.007-3.2037.0053-3.583.0607-4.848.05-1.169.2456-1.805.408-2.2282.216-.5613.4762-.96.895-1.3816.4188-.4217.8184-.6814 1.3783-.9003.423-.1651 1.0575-.3614 2.227-.4171 1.2655-.06 1.6447-.072 4.848-.079 3.2033-.007 3.5835.005 4.8495.0608 1.169.0508 1.8053.2445 2.228.408.5608.216.96.4754 1.3816.895.4217.4194.6816.8176.9005 1.3787.1653.4217.3617 1.056.4169 2.2263.0602 1.2655.0739 1.645.0796 4.848.0058 3.203-.0055 3.5834-.061 4.848-.051 1.17-.245 1.8055-.408 2.2294-.216.5604-.4763.96-.8954 1.3814-.419.4215-.8181.6811-1.3783.9-.4224.1649-1.0577.3617-2.2262.4174-1.2656.0595-1.6448.072-4.8493.079-3.2045.007-3.5825-.006-4.848-.0608M16.953 5.5864A1.44 1.44 0 1 0 18.39 4.144a1.44 1.44 0 0 0-1.437 1.4424M5.8385 12.012c.0067 3.4032 2.7706 6.1557 6.173 6.1493 3.4026-.0065 6.157-2.7701 6.1506-6.1733-.0065-3.4032-2.771-6.1565-6.174-6.1498-3.403.0067-6.156 2.771-6.1496 6.1738M8 12.0077a4 4 0 1 1 4.008 3.9921A3.9996 3.9996 0 0 1 8 12.0077",
  },
  messenger: {
    color: "#00B2FF",
    path: "M.001 11.639C.001 4.949 5.241 0 12.001 0S24 4.95 24 11.639c0 6.689-5.24 11.638-12 11.638-1.21 0-2.38-.16-3.47-.46a.96.96 0 00-.64.05l-2.39 1.05a.96.96 0 01-1.35-.85l-.07-2.14a.97.97 0 00-.32-.68A11.39 11.389 0 01.002 11.64zm8.32-2.19l-3.52 5.6c-.35.53.32 1.139.82.75l3.79-2.87c.26-.2.6-.2.87 0l2.8 2.1c.84.63 2.04.4 2.6-.48l3.52-5.6c.35-.53-.32-1.13-.82-.75l-3.79 2.87c-.25.2-.6.2-.86 0l-2.8-2.1a1.8 1.8 0 00-2.61.48z",
  },
};

type ChannelKey = "whatsapp" | "instagram" | "messenger" | "website";

const ChannelIcon = ({
  channel,
  size = 24,
}: {
  channel: ChannelKey;
  size?: number;
  key?: React.Key;
}) => {
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
  whatsapp: "#25D366",
  instagram: "#FF0069",
  messenger: "#00B2FF",
  website: "#0EA5E9",
};

const CHANNELS: { key: ChannelKey; name: string; desc: string }[] = [
  { key: "whatsapp", name: "WhatsApp", desc: "Your WhatsApp Business number" },
  { key: "instagram", name: "Instagram", desc: "Direct messages to your business account" },
  { key: "messenger", name: "Messenger", desc: "Messages to your Facebook Page" },
  { key: "website", name: "Website chat", desc: "A chat widget for your own site" },
];

const FINAL_CTA_CHANNELS = ["whatsapp", "instagram", "messenger", "website"] as const;

// ── Reusable Bento Spotlight Card ───────────────────────────
const BentoSpotlightCard = ({
  children,
  className = "",
  prefersReduced = false,
}: {
  children: React.ReactNode;
  className?: string;
  prefersReduced?: boolean;
}) => {
  const [coords, setCoords] = React.useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = React.useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (prefersReduced) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setCoords({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <motion.div
      {...fadeInUp}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative overflow-hidden rounded-[24px] border border-border-faint transition-all duration-300 hover:-translate-y-1 hover:shadow-hover ${className}`}
    >
      {!prefersReduced && isHovered && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-300 hidden md:block"
          style={{
            background: `radial-gradient(350px circle at ${coords.x}px ${coords.y}px, rgba(20, 168, 0, 0.08), transparent 80%)`,
          }}
        />
      )}
      <div className="relative z-10 flex flex-col h-full">{children}</div>
    </motion.div>
  );
};

// ── Industry examples ───────────────────────────────────────
const INDUSTRIES = [
  {
    key: "realestate",
    label: "Real estate",
    icon: <House size={20} weight="duotone" className="text-brand" />,
    channel: "whatsapp" as ChannelKey,
    question: "Is the 10 marla house in DHA Phase 6 still available? Can I see it on Saturday?",
    answer:
      "Yes, it's still available. Saturday viewings run from 11 AM to 5 PM. Which time suits you? I'll confirm it with our agent and send you the location pin.",
  },
  {
    key: "auto",
    label: "Car dealers & workshops",
    icon: <PhosphorCar size={20} weight="duotone" className="text-brand" />,
    channel: "instagram" as ChannelKey,
    question: "How much is a full service for a 2018 Corolla, and can I bring it tomorrow?",
    answer:
      "A full service for a 2018 Corolla starts at PKR 12,000 and takes about 3 hours. We have slots tomorrow at 10 AM and 2 PM. Shall I book one for you?",
  },
  {
    key: "education",
    label: "Schools & universities",
    icon: <PhosphorGraduationCap size={20} weight="duotone" className="text-brand" />,
    channel: "messenger" as ChannelKey,
    question: "What's the fee for BS Computer Science, and are there scholarships?",
    answer:
      "The BS Computer Science fee is PKR 95,000 per semester. Merit scholarships of up to 50% are available for students with 80% or more in intermediate. Would you like the admission form?",
  },
  {
    key: "retail",
    label: "Retailers & manufacturers",
    icon: <Bag size={20} weight="duotone" className="text-brand" />,
    channel: "website" as ChannelKey,
    question: "Do you deliver 20 kg of green tea to Karachi? What's your wholesale price?",
    answer:
      "Yes, we deliver across Pakistan in 3 to 5 working days. Wholesale prices depend on the blend, so I've passed your request to our sales team. They'll send you a quote today.",
    escalated: true,
  },
  {
    key: "services",
    label: "Carpenters & home services",
    icon: <Wrench size={20} weight="duotone" className="text-brand" />,
    channel: "whatsapp" as ChannelKey,
    question: "Can you make a 6-seater walnut dining table? How long would it take?",
    answer:
      "Yes. Custom 6-seater tables usually take about 3 weeks. Could you share the size you need and a photo of a design you like? Our carpenter will send you a quote.",
  },
];

const IndustryExamples = () => {
  const [active, setActive] = React.useState(INDUSTRIES[0].key);
  const item = INDUSTRIES.find((i) => i.key === active) ?? INDUSTRIES[0];

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "ArrowDown" || e.key === "ArrowRight") {
      e.preventDefault();
      const nextIndex = (index + 1) % INDUSTRIES.length;
      setActive(INDUSTRIES[nextIndex].key);
    } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
      e.preventDefault();
      const prevIndex = (index - 1 + INDUSTRIES.length) % INDUSTRIES.length;
      setActive(INDUSTRIES[prevIndex].key);
    }
  };

  return (
    <div className="grid lg:grid-cols-12 gap-8 items-start">
      <div
        role="tablist"
        aria-label="Industries"
        className="lg:col-span-4 flex flex-row lg:flex-col gap-2 overflow-x-auto pb-2 lg:pb-0"
      >
        {INDUSTRIES.map((i, idx) => {
          const isSelected = active === i.key;
          return (
            <button
              key={i.key}
              role="tab"
              aria-selected={isSelected}
              tabIndex={isSelected ? 0 : -1}
              onKeyDown={(e) => handleKeyDown(e, idx)}
              onClick={() => setActive(i.key)}
              className={`relative shrink-0 flex items-center gap-3 rounded-xl px-4 py-3.5 text-left text-sm font-bold border transition-colors outline-none focus-visible:ring-2 focus-visible:ring-brand/40 ${
                isSelected
                  ? "text-white border-transparent"
                  : "bg-surface text-text-second border-border-faint hover:border-brand/40"
              }`}
            >
              {isSelected && (
                <motion.div
                  layoutId="industry-pill"
                  className="absolute inset-0 bg-brand rounded-xl z-0"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-3">
                {i.icon} {i.label}
              </span>
            </button>
          );
        })}
      </div>

      <div
        role="tabpanel"
        aria-label={item.label}
        className="lg:col-span-8 bg-surface rounded-[24px] border border-border-faint p-6 md:p-8 min-w-0 shadow-card"
      >
        <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
          <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-text-muted">
            <ChannelIcon channel={item.channel} size={16} />
            Example conversation · {CHANNELS.find((c) => c.key === item.channel)?.name}
          </span>
          <span className="text-xs font-bold text-brand bg-brand/10 rounded-full px-3 py-1">
            Answered by CareAgent
          </span>
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={item.key}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="flex flex-col gap-4"
          >
            <div className="self-start max-w-[85%] bg-bg border border-border-faint rounded-2xl rounded-bl-sm px-4 py-3 text-[15px] text-text-primary shadow-xs">
              {item.question}
            </div>
            <div className="self-end max-w-[85%] bg-brand text-white rounded-2xl rounded-br-sm px-4 py-3 text-[15px] leading-relaxed shadow-sm">
              {item.answer}
            </div>
            {item.escalated && (
              <div className="self-end text-xs font-bold text-text-second bg-surface-high border border-border-mid rounded-full px-3 py-1.5 shadow-xs">
                Handed to your sales team
              </div>
            )}
          </motion.div>
        </AnimatePresence>
        <p className="text-xs text-text-muted mt-6">
          Prices and details come from the information you upload.
        </p>
      </div>
    </div>
  );
};

// ── Hero Interactive Chat Scene ─────────────────────────────
const HeroChatScene = ({ prefersReduced }: { prefersReduced: boolean }) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { margin: "50px" });
  const [step, setStep] = React.useState(prefersReduced ? 3 : 0);

  React.useEffect(() => {
    if (prefersReduced) {
      setStep(3);
      return;
    }
    if (!isInView) return;

    let timeoutId: any;

    const runSequence = () => {
      setStep(0);
      timeoutId = setTimeout(() => {
        setStep(1); // CareAgent typing
        timeoutId = setTimeout(() => {
          setStep(2); // CareAgent reply
          timeoutId = setTimeout(() => {
            setStep(3); // Handed to your sales team
            timeoutId = setTimeout(() => {
              runSequence();
            }, 5500); // Wait 5.5s at full state before restarting loop
          }, 1600);
        }, 1600);
      }, 1400);
    };

    runSequence();
    return () => clearTimeout(timeoutId);
  }, [isInView, prefersReduced]);

  return (
    <div ref={containerRef} className="relative w-full max-w-md lg:max-w-lg mx-auto">
      {/* Floating glass chips (hidden on mobile, visible on desktop) */}
      <div className="hidden lg:block pointer-events-none">
        {/* WhatsApp Chip */}
        <motion.div
          animate={prefersReduced ? undefined : { y: [0, -8, 0] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-5 -left-5 z-20 flex items-center gap-2.5 rounded-2xl bg-surface/90 backdrop-blur-xl border border-border-faint px-3.5 py-2 shadow-xl ring-1 ring-black/5"
        >
          <ChannelIcon channel="whatsapp" size={20} />
          <span className="text-xs font-bold text-text-primary">WhatsApp</span>
          <span className="w-2 h-2 rounded-full bg-[#25D366] animate-pulse" />
        </motion.div>

        {/* 2:04 AM Time Chip */}
        <motion.div
          animate={prefersReduced ? undefined : { y: [0, 8, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          className="absolute -top-6 right-2 z-20 flex items-center gap-2 rounded-2xl bg-surface/90 backdrop-blur-xl border border-border-faint px-3.5 py-2 shadow-xl ring-1 ring-black/5"
        >
          <Clock size={16} className="text-brand" />
          <span className="font-mono text-xs font-black text-text-primary">2:04 AM</span>
          <span className="text-[10px] font-bold text-brand bg-brand/10 px-2 py-0.5 rounded-full">
            Replied in 3s
          </span>
        </motion.div>

        {/* Instagram Chip */}
        <motion.div
          animate={prefersReduced ? undefined : { y: [0, -7, 0] }}
          transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute top-1/2 -left-8 z-20 flex items-center justify-center rounded-2xl bg-surface/90 backdrop-blur-xl border border-border-faint p-2.5 shadow-xl ring-1 ring-black/5"
        >
          <ChannelIcon channel="instagram" size={22} />
        </motion.div>

        {/* Messenger Chip */}
        <motion.div
          animate={prefersReduced ? undefined : { y: [0, 7, 0] }}
          transition={{ duration: 5.2, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
          className="absolute top-1/2 -right-8 z-20 flex items-center justify-center rounded-2xl bg-surface/90 backdrop-blur-xl border border-border-faint p-2.5 shadow-xl ring-1 ring-black/5"
        >
          <ChannelIcon channel="messenger" size={22} />
        </motion.div>

        {/* Live Chat Chip */}
        <motion.div
          animate={prefersReduced ? undefined : { y: [0, -6, 0] }}
          transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
          className="absolute -bottom-5 -right-3 z-20 flex items-center gap-2.5 rounded-2xl bg-surface/90 backdrop-blur-xl border border-border-faint px-3.5 py-2 shadow-xl ring-1 ring-black/5"
        >
          <ChannelIcon channel="website" size={20} />
          <span className="text-xs font-bold text-text-primary">Live Chat</span>
        </motion.div>
      </div>

      {/* Main Glass Phone / Window Card */}
      <div className="relative rounded-3xl border border-border-faint bg-surface/95 backdrop-blur-2xl shadow-2xl overflow-hidden ring-1 ring-black/5">
        {/* WhatsApp-style Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-bg border-b border-border-faint">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-full bg-brand/10 text-brand flex items-center justify-center font-bold">
              <Bot size={22} />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-brand ring-2 ring-surface" />
            </div>
            <div>
              <div className="text-sm font-extrabold text-text-primary flex items-center gap-1.5">
                CareAgent
                <span className="text-[10px] font-bold text-white bg-brand px-1.5 py-0.2 rounded">
                  AI
                </span>
              </div>
              <div className="text-[11px] font-medium text-brand">Online · 2 AM Shift</div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-text-muted">
            <span className="text-[11px] font-mono font-semibold bg-surface border border-border-faint px-2 py-0.5 rounded-md">
              WhatsApp
            </span>
          </div>
        </div>

        {/* Chat Thread */}
        <div className="p-5 space-y-4 min-h-[330px] flex flex-col justify-end bg-gradient-to-b from-bg/40 to-surface">
          {/* Date pill */}
          <div className="flex justify-center mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted bg-bg border border-border-faint px-2.5 py-0.5 rounded-full">
              Today · 2:04 AM
            </span>
          </div>

          {/* Customer Question (Inbound: No ticks, timestamp 2:04 AM) */}
          <motion.div
            initial={prefersReduced ? false : { opacity: 0, y: 10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="self-start max-w-[85%]"
          >
            <div className="bg-bg border border-border-faint rounded-2xl rounded-tl-xs p-3.5 shadow-xs text-[13px] text-text-primary leading-relaxed">
              Do you deliver 20 kg of green tea to Karachi? What's your wholesale price?
              <div className="text-[10px] text-text-muted mt-1.5 text-right font-medium">
                2:04 AM
              </div>
            </div>
          </motion.div>

          {/* Typing Indicator */}
          {step === 1 && !prefersReduced && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="self-end"
            >
              <div className="bg-brand/10 border border-brand/20 rounded-2xl rounded-tr-xs px-3.5 py-2.5 flex items-center gap-1.5">
                <span className="text-[11px] font-bold text-brand mr-1">CareAgent is typing</span>
                {[0, 1, 2].map((dot) => (
                  <motion.span
                    key={dot}
                    animate={{ y: [0, -4, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: dot * 0.15 }}
                    className="w-1.5 h-1.5 rounded-full bg-brand"
                  />
                ))}
              </div>
            </motion.div>
          )}

          {/* CareAgent Answer (Outbound: Double ticks, timestamp 2:04 AM) */}
          {(step >= 2 || prefersReduced) && (
            <motion.div
              initial={prefersReduced ? false : { opacity: 0, y: 10, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="self-end max-w-[88%]"
            >
              <div className="bg-brand text-white rounded-2xl rounded-tr-xs p-3.5 shadow-md text-[13px] leading-relaxed">
                Yes, we deliver across Pakistan in 3 to 5 working days. Wholesale prices depend on
                the blend, so I've passed your request to our sales team. They'll send you a quote
                today.
                <div className="flex items-center justify-end gap-1 text-[10px] text-white/80 mt-1.5 font-medium">
                  <span>2:04 AM</span>
                  <CheckCheck size={14} className="text-white" />
                </div>
              </div>
            </motion.div>
          )}

          {/* Handed to your sales team Pill */}
          {(step >= 3 || prefersReduced) && (
            <motion.div
              initial={prefersReduced ? false : { opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="self-end"
            >
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-text-second bg-surface border border-border-mid rounded-full px-3 py-1 shadow-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-brand" />
                Handed to your sales team
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Demo Video Modal ─────────────────────────────────────────
const DemoVideoModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const closeButtonRef = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    if (!isOpen) return;
    closeButtonRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="CareAgent Product Demo"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Dialog Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ duration: 0.25 }}
            className="relative w-full max-w-4xl rounded-3xl overflow-hidden bg-surface border border-white/20 shadow-2xl z-10"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-border-faint bg-surface/90">
              <span className="text-sm font-bold text-text-primary">CareAgent Product Demo</span>
              <button
                ref={closeButtonRef}
                onClick={onClose}
                aria-label="Close demo"
                className="p-1.5 rounded-full hover:bg-bg text-text-muted hover:text-text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
              >
                <X size={20} />
              </button>
            </div>
            <div className="aspect-video w-full bg-black">
              <video
                src="/CareAgent_product_animation_script_202609030626.mp4"
                controls
                autoPlay
                playsInline
                className="w-full h-full object-contain"
              />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

// ── How It Works Steps & Product Mockup ─────────────────────
const HOW_IT_WORKS_STEPS = [
  {
    icon: <ChatCircleDots size={32} weight="duotone" className="text-brand" />,
    title: "1. Connect your channels",
    desc: "Log in to WhatsApp Business, Instagram and Facebook with their official buttons, and add the chat widget to your website.",
  },
  {
    icon: <PhosphorDatabase size={32} weight="duotone" className="text-brand" />,
    title: "2. Teach it your business",
    desc: "Upload your price list, services, timings and FAQs, and set the tone you want. Pin the facts that must always be exact.",
  },
  {
    icon: <Bot size={32} className="text-brand" />,
    title: "3. Go live",
    desc: "Start by approving every reply. Switch on auto-send for a channel once you trust the answers. Anything uncertain goes to your team.",
  },
];

const ProductMockup = ({ activeStep }: { activeStep: number }) => {
  return (
    <div className="relative rounded-2xl border border-border-faint bg-surface shadow-2xl overflow-hidden w-full max-w-xl">
      {/* Liquid glass top window bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border-faint bg-bg/80 backdrop-blur-md">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-400/80" />
          <div className="w-3 h-3 rounded-full bg-amber-400/80" />
          <div className="w-3 h-3 rounded-full bg-emerald-400/80" />
        </div>
        <div className="text-xs font-bold text-text-muted tracking-tight">CareAgent - Inbox</div>
        <div className="w-12" />
      </div>

      {/* Screen body */}
      <div className="p-6 md:p-8 min-h-[340px] flex flex-col justify-center bg-radial from-surface to-bg">
        <AnimatePresence mode="wait">
          {activeStep === 0 && (
            <motion.div
              key="step-0"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3 }}
              className="space-y-3"
            >
              <div className="text-xs font-bold uppercase tracking-wider text-text-muted mb-2">
                Connected Channels
              </div>
              {CHANNELS.map((c) => (
                <div
                  key={c.key}
                  className="flex items-center justify-between p-3 rounded-xl border border-border-faint bg-surface hover:border-brand/40 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <ChannelIcon channel={c.key} size={20} />
                    <div>
                      <div className="text-sm font-bold text-text-primary">{c.name}</div>
                      <div className="text-xs text-text-muted">{c.desc}</div>
                    </div>
                  </div>
                  <span className="flex items-center gap-1.5 text-xs font-bold text-brand bg-brand/10 px-2.5 py-1 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse" />
                    Live
                  </span>
                </div>
              ))}
            </motion.div>
          )}

          {activeStep === 1 && (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3 }}
              className="space-y-3"
            >
              <div className="text-xs font-bold uppercase tracking-wider text-text-muted mb-2">
                Knowledge Base & Policies
              </div>
              {[
                { name: "Price_List_2026.pdf", note: "Pinned facts active", chunks: "12 sections" },
                {
                  name: "Services_and_Timings.docx",
                  note: "Knowledge base indexed",
                  chunks: "8 sections",
                },
                {
                  name: "Frequently_Asked_Questions.pdf",
                  note: "Auto-sync enabled",
                  chunks: "24 Q&As",
                },
              ].map((doc) => (
                <div
                  key={doc.name}
                  className="flex items-center justify-between p-3.5 rounded-xl border border-border-faint bg-surface"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-brand/10 text-brand flex items-center justify-center">
                      <PhosphorFileText size={18} weight="duotone" className="text-brand" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-text-primary">{doc.name}</div>
                      <div className="text-xs text-text-muted">{doc.note}</div>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-text-second bg-bg px-2.5 py-1 rounded-md border border-border-faint">
                    {doc.chunks}
                  </span>
                </div>
              ))}
            </motion.div>
          )}

          {activeStep === 2 && (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-bold text-text-muted">
                  <ChannelIcon channel="whatsapp" size={16} /> WhatsApp Inquiry
                </span>
                <span className="text-xs font-bold text-brand bg-brand/10 rounded-full px-2.5 py-0.5">
                  Live in inbox
                </span>
              </div>

              <div className="bg-bg border border-border-faint rounded-xl p-3 text-xs text-text-primary">
                {INDUSTRIES[0].question}
              </div>

              <div className="rounded-xl border border-brand/40 bg-brand/5 p-4 relative">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-brand uppercase tracking-wider flex items-center gap-1">
                    CareAgent AI Draft
                  </span>
                  <span className="text-[11px] font-bold text-text-muted">Confidence: 98%</span>
                </div>
                <div className="text-xs text-text-second leading-relaxed mb-3">
                  {INDUSTRIES[0].answer}
                </div>
                <div className="flex items-center gap-2 pt-1 border-t border-brand/10">
                  <span className="px-2.5 py-1 rounded bg-brand text-white font-mono text-[11px] font-bold shadow-xs">
                    Press A to Approve
                  </span>
                  <span className="px-2.5 py-1 rounded bg-surface border border-border-faint text-text-second font-mono text-[11px] font-bold">
                    Press E to Edit
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// Desktop Pinned Walkthrough
const PinnedHowItWorks = () => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [activeStep, setActiveStep] = React.useState(0);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    if (latest < 0.34) {
      setActiveStep(0);
    } else if (latest < 0.67) {
      setActiveStep(1);
    } else {
      setActiveStep(2);
    }
  });

  return (
    <div ref={containerRef} className="relative h-[280vh]">
      <div className="sticky top-24 h-[calc(100vh-6rem)] flex items-center">
        <div className="w-full max-w-7xl mx-auto px-6 lg:px-8 grid lg:grid-cols-12 gap-12 items-center">
          {/* Steps column */}
          <div className="lg:col-span-6 flex flex-col gap-6">
            <div className="mb-4">
              <h2 className="text-4xl md:text-5xl font-extrabold text-text-primary tracking-tighter leading-[1.05]">
                Live in an afternoon.
              </h2>
              <p className="text-lg text-text-muted mt-4">
                Three steps. On the Managed plan, we do all three for you.
              </p>
            </div>

            {HOW_IT_WORKS_STEPS.map((step, idx) => {
              const isActive = activeStep === idx;
              return (
                <div
                  key={step.title}
                  onClick={() => setActiveStep(idx)}
                  className={`cursor-pointer transition-all duration-300 rounded-[24px] p-6 border ${
                    isActive
                      ? "bg-surface/95 border-brand/50 shadow-card translate-x-2"
                      : "bg-surface/50 border-border-faint opacity-50 hover:opacity-80"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="shrink-0">{step.icon}</div>
                    <div>
                      <h3 className="text-xl font-bold text-text-primary mb-1 tracking-tight">
                        {step.title}
                      </h3>
                      <p className="text-text-muted text-sm leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Product mockup column */}
          <div className="lg:col-span-6 flex items-center justify-center">
            <ProductMockup activeStep={activeStep} />
          </div>
        </div>
      </div>
    </div>
  );
};

// Mobile / Reduced Motion Stacked Walkthrough
const StackedHowItWorks = () => {
  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-8">
      <div className="mb-14 text-center">
        <h2 className="text-4xl md:text-5xl font-extrabold text-text-primary tracking-tighter leading-[1.05]">
          Live in an afternoon.
        </h2>
        <p className="text-lg text-text-muted mt-4">
          Three steps. On the Managed plan, we do all three for you.
        </p>
      </div>

      <div className="flex flex-col gap-6 max-w-4xl mx-auto">
        {HOW_IT_WORKS_STEPS.map((step, i) => (
          <motion.div
            key={step.title}
            {...fadeInUp}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className="flex flex-col md:flex-row items-center gap-6 md:gap-8 p-6 md:p-8 bg-surface rounded-[24px] border border-border-faint shadow-card"
          >
            <div className="shrink-0">{step.icon}</div>
            <div>
              <h3 className="text-2xl font-bold text-text-primary mb-2 tracking-tight">
                {step.title}
              </h3>
              <p className="text-text-muted text-base leading-relaxed">{step.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

const HowItWorks = ({ prefersReduced }: { prefersReduced: boolean }) => {
  const [isDesktop, setIsDesktop] = React.useState(() =>
    typeof window !== "undefined" ? window.innerWidth >= 1024 : true
  );

  React.useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  if (isDesktop && !prefersReduced) {
    return <PinnedHowItWorks />;
  }
  return <StackedHowItWorks />;
};

// ── Cost estimator ──────────────────────────────────────────
const CostEstimator = ({ onStart }: { onStart: () => void }) => {
  const [conversations, setConversations] = React.useState(600);
  const [repliesPer, setRepliesPer] = React.useState(3);
  const [waShare, setWaShare] = React.useState(60);

  const totalReplies = conversations * repliesPer;
  const waReplies = Math.round(totalReplies * (waShare / 100));
  const metaFee =
    Math.max(0, waReplies - PRICING.whatsapp.freeRepliesPerNumber) *
    PRICING.whatsapp.perReplyAfterFree;

  const plans = [
    {
      name: "Starter",
      base: PRICING.starter.price,
      usage:
        Math.max(0, totalReplies - PRICING.starter.includedReplies) * PRICING.starter.extraPerReply,
      note: `Includes ${PRICING.starter.includedReplies.toLocaleString()} replies, ${PRICING.starter.channels} channels`,
    },
    {
      name: "Growth",
      base: PRICING.growth.price,
      usage:
        Math.max(0, totalReplies - PRICING.growth.includedReplies) * PRICING.growth.extraPerReply,
      note: `Includes ${PRICING.growth.includedReplies.toLocaleString()} replies, all channels`,
    },
    {
      name: "Managed",
      base: PRICING.managed.base,
      usage: totalReplies * PRICING.managed.perReply,
      note: `$${PRICING.managed.perReply} per reply, set up and run for you`,
    },
  ].map((p) => ({ ...p, careagent: p.base + p.usage, total: p.base + p.usage + metaFee }));

  const max = Math.max(...plans.map((p) => p.total), 1);
  const cheapest = plans.reduce((a, b) => (b.careagent < a.careagent ? b : a));

  return (
    <motion.div
      id="estimate"
      {...fadeInUp}
      className="max-w-7xl mx-auto mt-20 relative rounded-[28px] sm:rounded-[32px] border border-border-faint bg-surface p-4 sm:p-8 lg:p-12 shadow-[0_24px_64px_-12px_rgba(15,23,42,0.06),0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-black/[0.03] overflow-hidden scroll-mt-28"
    >
      {/* Subtle brand radial glow inside */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 85% 15%, rgba(20,168,0,0.06) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 mb-6 sm:mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand/10 border border-brand/20 text-brand text-xs font-bold tracking-wide uppercase mb-3">
          <SlidersHorizontal size={13} className="text-brand" />
          <span>Cost Estimator</span>
        </div>
        <h3 className="text-2xl sm:text-4xl font-extrabold text-text-primary tracking-tight mb-2">
          Estimate your monthly cost
        </h3>
        <p className="text-text-muted text-sm sm:text-base max-w-2xl leading-relaxed">
          Move the sliders to match your business. Your dashboard shows the same meter as you use it.
        </p>
      </div>

      <div className="relative z-10 grid lg:grid-cols-12 gap-6 lg:gap-12 items-start">
        {/* Left Column: Sliders & Live Summary */}
        <div className="lg:col-span-5 flex flex-col gap-4 sm:gap-5 min-w-0">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-0.5 sm:mb-1">
            <span className="text-[11px] sm:text-xs font-bold text-text-muted uppercase tracking-wider mr-1">Presets:</span>
            <button
              type="button"
              onClick={() => { setConversations(200); setRepliesPer(2); setWaShare(50); }}
              className={`text-[11px] sm:text-xs font-semibold px-2.5 sm:px-3 py-1 rounded-full border transition-all ${
                conversations === 200 && repliesPer === 2 && waShare === 50
                  ? "bg-brand text-white border-brand shadow-xs"
                  : "bg-white text-text-second border-border-faint hover:border-slate-300"
              }`}
            >
              Starter (200)
            </button>
            <button
              type="button"
              onClick={() => { setConversations(600); setRepliesPer(3); setWaShare(60); }}
              className={`text-[11px] sm:text-xs font-semibold px-2.5 sm:px-3 py-1 rounded-full border transition-all ${
                conversations === 600 && repliesPer === 3 && waShare === 60
                  ? "bg-brand text-white border-brand shadow-xs"
                  : "bg-white text-text-second border-border-faint hover:border-slate-300"
              }`}
            >
              Growing (600)
            </button>
            <button
              type="button"
              onClick={() => { setConversations(2000); setRepliesPer(4); setWaShare(75); }}
              className={`text-[11px] sm:text-xs font-semibold px-2.5 sm:px-3 py-1 rounded-full border transition-all ${
                conversations === 2000 && repliesPer === 4 && waShare === 75
                  ? "bg-brand text-white border-brand shadow-xs"
                  : "bg-white text-text-second border-border-faint hover:border-slate-300"
              }`}
            >
              Scale (2,000)
            </button>
          </div>

          <SliderCard
            id="est-conversations"
            label="Customer conversations a month"
            value={conversations}
            min={50}
            max={5000}
            step={50}
            onChange={setConversations}
            display={conversations.toLocaleString()}
            minLabel="50 / mo"
            maxLabel="5,000 / mo"
          />
          <SliderCard
            id="est-replies"
            label="AI replies per conversation"
            value={repliesPer}
            min={1}
            max={8}
            step={1}
            onChange={setRepliesPer}
            display={String(repliesPer)}
            minLabel="1 reply"
            maxLabel="8 replies"
          />
          <SliderCard
            id="est-whatsapp"
            label="Share of conversations on WhatsApp"
            value={waShare}
            min={0}
            max={100}
            step={5}
            onChange={setWaShare}
            display={`${waShare}%`}
            minLabel="0% (None)"
            maxLabel="100% (All)"
          />

          <div className="rounded-2xl bg-brand/[0.04] border border-brand/20 p-4 sm:p-5 flex items-start gap-3">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-brand/10 border border-brand/20 flex items-center justify-center shrink-0 text-brand mt-0.5">
              <ChatCircleDots size={18} weight="duotone" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs sm:text-sm text-text-second leading-relaxed">
                That's <strong className="text-text-primary font-bold font-mono">{totalReplies.toLocaleString()} AI replies</strong> a month,{" "}
                <span className="font-semibold text-text-primary">{waReplies.toLocaleString()}</span> of them on WhatsApp.
              </div>
              <div className="text-[11px] sm:text-xs text-text-muted mt-1.5 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-brand shrink-0" />
                <span>
                  {waReplies <= 1000
                    ? "Within Meta's 1,000 free monthly WhatsApp replies"
                    : `Meta bills $0.015/reply on ${(waReplies - 1000).toLocaleString()} replies after the free 1,000 tier`}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Comparison Cards & Actions */}
        <div className="lg:col-span-7 flex flex-col gap-3.5 sm:gap-4 min-w-0">
          {plans.map((p) => {
            const isCheapest = p.name === cheapest.name;
            const basePct = (p.base / max) * 100;
            const usagePct = (p.usage / max) * 100;
            const metaPct = (metaFee / max) * 100;
            return (
              <div
                key={p.name}
                className={`rounded-2xl p-4 sm:p-6 transition-all duration-200 border ${
                  isCheapest
                    ? "bg-white border-brand/40 ring-2 ring-brand/15 shadow-[0_8px_24px_rgba(20,168,0,0.08)]"
                    : "bg-slate-50/60 border-border-faint hover:bg-white hover:border-slate-300"
                }`}
              >
                <div className="flex items-center justify-between gap-3 mb-2.5 sm:mb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-base sm:text-lg font-extrabold text-text-primary tracking-tight">
                      {p.name}
                    </span>
                    {isCheapest && (
                      <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-bold text-white bg-brand rounded-full px-2 sm:px-2.5 py-0.5 shadow-xs">
                        <Check size={11} strokeWidth={3} />
                        Lowest for you
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="font-black text-xl sm:text-2xl lg:text-3xl text-text-primary tabular-nums tracking-tight">
                      {usd(p.total)}
                    </span>
                    <span className="text-[10px] sm:text-xs font-bold text-text-muted ml-1 uppercase">/ mo</span>
                  </div>
                </div>

                {/* Segmented bar */}
                <div
                  className="h-2.5 sm:h-3 w-full rounded-full bg-slate-100 overflow-hidden flex gap-0.5 mb-2.5 sm:mb-3"
                  aria-hidden="true"
                >
                  {p.base > 0 && (
                    <div
                      className="h-full bg-brand transition-all duration-300 first:rounded-l-full last:rounded-r-full"
                      style={{ width: `${basePct}%` }}
                      title={`Plan fee: ${usd(p.base)}`}
                    />
                  )}
                  {p.usage > 0 && (
                    <div
                      className="h-full bg-emerald-400 transition-all duration-300 first:rounded-l-full last:rounded-r-full"
                      style={{ width: `${usagePct}%` }}
                      title={`AI usage: ${usd(p.usage)}`}
                    />
                  )}
                  {metaFee > 0 && (
                    <div
                      className="h-full bg-slate-400 transition-all duration-300 first:rounded-l-full last:rounded-r-full"
                      style={{ width: `${metaPct}%` }}
                      title={`WhatsApp fees to Meta: ${usd(metaFee)}`}
                    />
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] sm:text-xs text-text-muted tabular-nums">
                  <span className="font-medium text-text-second">
                    Plan <strong className="font-semibold text-text-primary">{usd(p.base)}</strong>
                  </span>
                  <span className="text-slate-300">·</span>
                  <span className="font-medium text-text-second">
                    AI usage <strong className="font-semibold text-text-primary">{usd(p.usage)}</strong>
                  </span>
                  <span className="text-slate-300">·</span>
                  <span className="font-medium text-text-second">
                    WhatsApp fees to Meta <strong className="font-semibold text-text-primary">{usd(metaFee)}</strong>
                  </span>
                  <span className="text-slate-300">·</span>
                  <span className="text-text-muted">{p.note}</span>
                </div>
              </div>
            );
          })}

          <div className="flex flex-wrap items-center gap-3 sm:gap-5 text-[11px] sm:text-xs font-medium text-text-muted pt-1">
            <span className="inline-flex items-center gap-1.5 sm:gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-brand shrink-0" />
              <span className="text-text-second">Plan fee</span>
            </span>
            <span className="inline-flex items-center gap-1.5 sm:gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0" />
              <span className="text-text-second">AI usage</span>
            </span>
            <span className="inline-flex items-center gap-1.5 sm:gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-400 shrink-0" />
              <span className="text-text-second">WhatsApp fees (billed by Meta)</span>
            </span>
          </div>

          <div className="flex items-start gap-2.5 p-3 sm:p-3.5 rounded-xl bg-slate-50 border border-border-faint text-[11px] sm:text-xs text-text-muted leading-relaxed">
            <Info size={15} className="text-slate-400 shrink-0 mt-0.5" />
            <span>
              Estimate only. WhatsApp fees use a typical rate; the real rate depends on your
              customers' country, and Meta bills it to your WhatsApp Business account.
            </span>
          </div>

          <div className="pt-1 sm:pt-2">
            <Button
              variant="primary"
              onClick={onStart}
              className="w-full sm:w-auto h-12 sm:h-[52px] px-8 rounded-full font-bold text-sm sm:text-base inline-flex items-center justify-center gap-2 shadow-sm hover:shadow-md transition-all group"
            >
              <span>Start with {cheapest.name}</span>
              <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const SliderCard = ({
  id,
  label,
  value,
  min,
  max,
  step,
  onChange,
  display,
  minLabel,
  maxLabel,
}: {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  display: string;
  minLabel: string;
  maxLabel: string;
}) => {
  const percentage = ((value - min) / (max - min)) * 100;
  return (
    <div className="p-3.5 sm:p-5 rounded-2xl bg-slate-50/70 border border-border-faint hover:border-slate-300 transition-colors flex flex-col gap-2.5 sm:gap-3">
      <div className="flex items-center justify-between gap-2">
        <label htmlFor={id} className="text-xs sm:text-sm font-bold text-text-primary block cursor-pointer">
          {label}
        </label>
        <span className="font-mono font-bold text-sm sm:text-base text-text-primary bg-white px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-xl border border-border-faint shadow-xs tabular-nums shrink-0">
          {display}
        </span>
      </div>

      <div className="pt-1">
        <input
          id={id}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          aria-label={label}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full slider-brand"
          style={{ "--slider-fill": `${percentage}%` } as React.CSSProperties}
        />
        <div className="flex justify-between items-center text-[11px] text-text-muted mt-1.5 font-medium tabular-nums">
          <span>{minLabel}</span>
          <span>{maxLabel}</span>
        </div>
      </div>
    </div>
  );
};

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
    a: "CareAgent's price covers the AI and the platform. WhatsApp also charges a small per-message fee, set by Meta and billed by Meta to your own WhatsApp Business account. The fee depends on the country of the customer you're replying to.",
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
  const prefersReduced = useReducedMotion();

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      const nextBtn = document.getElementById(`faq-btn-${(index + 1) % FAQS.length}`);
      nextBtn?.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const prevBtn = document.getElementById(
        `faq-btn-${(index - 1 + FAQS.length) % FAQS.length}`
      );
      prevBtn?.focus();
    }
  };

  return (
    <div className="flex flex-col divide-y divide-border-faint border-y border-border-faint max-w-4xl mx-auto">
      {FAQS.map((f, i) => {
        const isOpen = open === i;
        return (
          <div key={f.q}>
            <button
              id={`faq-btn-${i}`}
              onClick={() => setOpen(isOpen ? null : i)}
              onKeyDown={(e) => handleKeyDown(e, i)}
              className="w-full flex items-center justify-between gap-6 py-6 text-left outline-none focus-visible:ring-2 focus-visible:ring-brand/40 rounded-lg"
              aria-expanded={isOpen}
              aria-controls={`faq-content-${i}`}
            >
              <span className="text-lg font-bold text-text-primary">{f.q}</span>
              <ChevronDown
                size={20}
                className={`shrink-0 text-text-muted transition-transform duration-300 ${
                  isOpen ? "rotate-180 text-brand" : ""
                }`}
              />
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  id={`faq-content-${i}`}
                  role="region"
                  aria-labelledby={`faq-btn-${i}`}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={
                    prefersReduced
                      ? { duration: 0.1 }
                      : { duration: 0.3, ease: EASE }
                  }
                  className="overflow-hidden"
                >
                  <p className="pb-6 text-text-muted leading-relaxed text-base">{f.a}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
};

// ── Pricing card ────────────────────────────────────────────
const PricingCard = ({
  title,
  price,
  suffix,
  desc,
  features,
  popular,
  cta = "Get started",
  onClick,
}: {
  title: string;
  price: string;
  suffix?: string;
  desc: string;
  features: string[];
  popular?: boolean;
  cta?: string;
  onClick?: () => void;
}) => (
  <motion.div
    {...fadeInUp}
    className={`p-8 md:p-10 rounded-[28px] border flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-hover ${
      popular
        ? "bg-surface/90 backdrop-blur-xl border-brand shadow-card relative ring-1 ring-brand/30"
        : "bg-surface border-border-faint hover:border-brand/40 shadow-xs"
    }`}
  >
    {popular && (
      <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-brand text-white text-[11px] font-bold px-4 py-1 rounded-full shadow-xs">
        Most popular
      </div>
    )}
    <div className="mb-8">
      <h4 className={`text-xl font-black mb-4 ${popular ? "text-brand" : "text-text-primary"}`}>
        {title}
      </h4>
      <div className="flex items-baseline gap-1 mb-4 flex-wrap">
        <span className="text-5xl font-black text-text-primary tracking-tighter">{price}</span>
        {suffix && <span className="text-text-muted font-bold text-sm ml-1">{suffix}</span>}
      </div>
      <p className="text-text-muted font-medium text-base leading-snug">{desc}</p>
    </div>
    <div className="space-y-4 mb-10 flex-grow">
      {features.map((f) => (
        <div key={f} className="flex items-start gap-3">
          <div
            className={`p-1 rounded-full mt-0.5 shrink-0 ${
              popular ? "bg-brand text-white" : "bg-brand/10 text-brand"
            }`}
          >
            <Check size={12} strokeWidth={3} />
          </div>
          <span className="text-sm font-medium text-text-second">{f}</span>
        </div>
      ))}
    </div>
    <Button
      variant={popular ? "primary" : "surface"}
      onClick={onClick}
      className="w-full py-5 rounded-full text-base font-bold shadow-xs hover:shadow-md transition-shadow"
    >
      {cta}
    </Button>
  </motion.div>
);

// ── Drop-in FinalCta Component ──────────────────────────────
export function FinalCta({ onEnterApp }: { onEnterApp: () => void }) {
  const reduce = useReducedMotion();

  return (
    <section className="relative px-6 lg:px-8 pb-28 bg-bg">
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.7, ease: EASE }}
        className="relative isolate mx-auto max-w-7xl overflow-hidden rounded-[32px] bg-text-primary px-6 py-16 text-center ring-1 ring-white/10 shadow-[0_40px_80px_rgba(15,23,42,0.25)] md:px-16 md:py-24"
      >
        {/* Emerald glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-brand/30 blur-[120px]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-40 right-0 -z-10 h-[300px] w-[420px] rounded-full bg-brand/15 blur-[100px]"
        />

        {/* Faint grid, masked to fade out at the edges */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
            backgroundSize: "48px 48px",
            maskImage: "radial-gradient(ellipse at center, black 30%, transparent 75%)",
            WebkitMaskImage: "radial-gradient(ellipse at center, black 30%, transparent 75%)",
          }}
        />

        {/* Floating glass channel chips */}
        <div className="mb-10 flex items-center justify-center gap-3 md:gap-4">
          {FINAL_CTA_CHANNELS.map((c, i) => (
            <motion.div
              key={c}
              animate={reduce ? undefined : { y: [0, -6, 0] }}
              transition={{
                duration: 4 + i * 0.4,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.25,
              }}
              className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/20 backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.25)] md:h-14 md:w-14"
            >
              <ChannelIcon channel={c} size={26} />
            </motion.div>
          ))}
        </div>

        <h2 className="mx-auto max-w-3xl text-4xl font-extrabold leading-[1.05] tracking-tighter text-white md:text-6xl">
          Stop paying for leads <span className="text-brand">nobody answers.</span>
        </h2>

        <p className="mx-auto mt-6 max-w-xl text-lg font-medium leading-relaxed text-white/70 md:text-xl">
          Connect one channel today and watch CareAgent answer your next customer.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <button
            onClick={onEnterApp}
            className="group inline-flex cursor-pointer items-center gap-3 rounded-full bg-white py-4 pl-8 pr-4 text-lg font-bold text-text-primary shadow-[0_10px_30px_rgba(20,168,0,0.35)] transition-all hover:-translate-y-0.5 hover:shadow-[0_16px_40px_rgba(20,168,0,0.45)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand/50 active:scale-95"
          >
            Get started
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand text-white transition-transform group-hover:translate-x-0.5">
              <ArrowRight size={20} />
            </span>
          </button>
          <a
            href="#pricing"
            className="rounded-full px-6 py-4 text-base font-semibold text-white/80 ring-1 ring-white/20 backdrop-blur transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
          >
            See pricing
          </a>
        </div>

        <p className="mt-8 font-mono text-xs uppercase tracking-wider text-white/50">
          Set up in an afternoon · Cancel any month
        </p>
      </motion.div>
    </section>
  );
}

// ── CareAgent Landing Bot ─────────────────────────────────
const SYSTEM_PROMPT = `You are the CareAgent guide: a friendly assistant embedded on the CareAgent.ai website.
You ONLY answer questions about CareAgent. If asked anything unrelated, politely decline and redirect.

CRITICAL FORMATTING RULES:
- Never use markdown: no **, no *, no #, no bullet dashes
- Write in plain conversational text only
- Use numbered lists like "1. Step one 2. Step two" inline or on new lines without any symbols
- Keep answers short and direct

CONTEXT RULES:
- The user is already ON the CareAgent website
- Never say "visit the CareAgent website": they are already here
- When someone asks how to get started or sign up, tell them to click the "Get started" button on this page, or "Sign in" at the top right
- When referencing setup steps, mention they happen inside the platform after signing up

CareAgent key facts:
- AI customer reply platform for small and growing businesses: real estate, car dealers and workshops, schools and universities, retailers, manufacturers and home services
- Connects WhatsApp, Instagram DMs, Facebook Messenger and a website chat widget, all live, in one inbox. Gmail/email is not supported
- Answers from the business's own uploaded information; hands anything it can't answer to the business's team
- Replies can be approved before sending, or auto-sent per channel
- Pricing: Starter $${PRICING.starter.price}/month (${PRICING.starter.includedReplies} AI replies, ${PRICING.starter.channels} channels). Growth $${PRICING.growth.price}/month (${PRICING.growth.includedReplies} AI replies, all channels). Managed $${PRICING.managed.base}/month plus $${PRICING.managed.perReply} per AI reply, where the CareAgent team sets up and runs everything
- All plans are paid monthly plans; there is no free plan or free trial
- WhatsApp per-message fees are set and billed by Meta to the business's own WhatsApp Business account; the rate varies by country
- There is a cost estimator in the Pricing section of this page`;

const CareAgentBot = () => {
  const [open, setOpen] = React.useState(false);
  const [messages, setMessages] = React.useState<{ role: "user" | "assistant"; content: string }[]>([
    {
      role: "assistant",
      content:
        "Hi! I'm the CareAgent guide. Ask me anything about the platform: features, pricing, how to get started, anything!",
    },
  ]);
  const [input, setInput] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const bottomRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    const next = [...messages, { role: "user" as const, content: text }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const apiUrl = (
        (import.meta as any).env?.VITE_API_URL || "https://careagent-ai-be-production.up.railway.app"
      ).replace(/\/+$/, "");
      const res = await fetch(`${apiUrl}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system: SYSTEM_PROMPT,
          messages: next.map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json();
      const reply = data.reply || "Sorry, I couldn't get a response.";
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Having trouble connecting. Please try again!" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <motion.button
        onClick={() => setOpen((o) => !o)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-8 right-8 z-50 h-14 px-5 rounded-full bg-brand shadow-2xl flex items-center justify-center gap-2.5 text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
        aria-label="Open CareAgent guide"
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.div
              key="x"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <X size={24} />
            </motion.div>
          ) : (
            <motion.div
              key="bot"
              className="flex items-center gap-2.5"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <Bot size={24} />
              <span className="font-bold text-[13px]">Ask CareAgent</span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-6 z-50 w-[350px] max-w-[calc(100vw-3rem)] max-h-[500px] flex flex-col rounded-2xl border border-border-faint bg-surface/95 backdrop-blur-xl shadow-2xl overflow-hidden"
          >
            <div className="flex items-center gap-3 px-4 py-3 bg-brand text-white">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <Bot size={16} className="text-white" />
              </div>
              <div>
                <div className="text-[13px] font-bold text-white">CareAgent Guide</div>
                <div className="text-[10px] text-white/80">Ask me about the platform</div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-0 max-h-[340px]">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[85%] text-[12px] px-3.5 py-2.5 rounded-2xl leading-relaxed whitespace-pre-wrap ${
                      m.role === "user"
                        ? "bg-brand text-white rounded-br-xs shadow-xs"
                        : "bg-bg border border-border-faint text-text-primary rounded-bl-xs shadow-xs"
                    }`}
                  >
                    {m.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-bg border border-border-faint rounded-2xl rounded-bl-xs px-3 py-2">
                    <div className="flex gap-1 items-center h-4">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          className="w-1.5 h-1.5 rounded-full bg-brand"
                          animate={{ y: [0, -4, 0] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            <div className="px-3 py-3 border-t border-border-faint bg-bg/50 flex gap-2">
              <input
                className="flex-1 bg-surface border border-border-mid rounded-xl px-3 py-2 text-[12px] text-text-primary outline-none focus:border-brand transition-colors placeholder:text-text-muted"
                placeholder="Ask about CareAgent..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                disabled={loading}
              />
              <button
                onClick={send}
                disabled={loading || !input.trim()}
                className="w-8 h-8 rounded-xl bg-brand text-white flex items-center justify-center hover:opacity-90 disabled:opacity-40 transition-opacity shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
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

// ── Hero Channel Strip (Four logos at 20px in slate-400, names at 13px, color on hover only) ──
const HeroChannelStrip = () => {
  const [hovered, setHovered] = React.useState<string | null>(null);

  return (
    <div className="flex items-center justify-center gap-4 sm:gap-8 flex-wrap max-w-full px-2">
      {CHANNELS.map((ch) => {
        const isHov = hovered === ch.key;
        return (
          <div
            key={ch.key}
            onMouseEnter={() => setHovered(ch.key)}
            onMouseLeave={() => setHovered(null)}
            className="flex items-center gap-2 cursor-pointer transition-transform duration-150 hover:-translate-y-0.5"
            aria-label={ch.name}
          >
            {ch.key === "website" ? (
              <MessageCircle
                size={20}
                strokeWidth={2.2}
                className="transition-colors duration-200"
                style={{ color: isHov ? "#0EA5E9" : "#94A3B8" }}
              />
            ) : (
              <svg
                viewBox="0 0 24 24"
                width={20}
                height={20}
                className="transition-colors duration-200"
                style={{ fill: isHov ? BRAND_ICONS[ch.key].color : "#94A3B8" }}
              >
                <path d={BRAND_ICONS[ch.key].path} />
              </svg>
            )}
            <span
              className={`text-[13px] font-semibold transition-colors duration-200 ${
                isHov ? "text-text-primary" : "text-slate-500"
              }`}
            >
              {ch.name}
            </span>
          </div>
        );
      })}
    </div>
  );
};

// ── Hero Animated Background (One effect only: 3 aurora blobs + 56px grid + 5 beams) ──
const HeroAnimatedBackground = ({
  isHeroInView,
  prefersReduced,
}: {
  isHeroInView: boolean;
  prefersReduced: boolean;
}) => {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 pointer-events-none -z-10 overflow-hidden bg-bg max-w-full select-none"
      style={{ contain: "paint", clipPath: "inset(0)" }}
    >
      {/* Slow aurora: 3 large blurred radial blobs using brand/brand-glow/brand-faint tints (max 0.18 opacity) */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ animationPlayState: isHeroInView && !prefersReduced ? "running" : "paused" }}
      >
        <div
          className={`absolute -top-32 left-1/4 w-[650px] h-[650px] rounded-full bg-brand/12 blur-[120px] pointer-events-none ${
            prefersReduced ? "" : "animate-aurora-1"
          }`}
          style={{ animationPlayState: isHeroInView && !prefersReduced ? "running" : "paused" }}
        />
        <div
          className={`absolute -top-24 right-1/6 w-[550px] h-[550px] rounded-full bg-emerald-400/10 blur-[130px] pointer-events-none ${
            prefersReduced ? "" : "animate-aurora-2"
          }`}
          style={{ animationPlayState: isHeroInView && !prefersReduced ? "running" : "paused" }}
        />
        <div
          className={`absolute top-1/2 left-1/3 -translate-x-1/2 w-[700px] h-[500px] rounded-full bg-brand/8 blur-[140px] pointer-events-none ${
            prefersReduced ? "" : "animate-aurora-3"
          }`}
          style={{ animationPlayState: isHeroInView && !prefersReduced ? "running" : "paused" }}
        />
      </div>

      {/* Grid: 1px slate-200 lines at 56px, masked with radial gradient */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(to right, #e2e8f0 1px, transparent 1px), linear-gradient(to bottom, #e2e8f0 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage:
            "radial-gradient(ellipse 70% 55% at 50% 35%, black 20%, transparent 85%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 70% 55% at 50% 35%, black 20%, transparent 85%)",
        }}
      >
        {/* Light Beams traveling along grid lines */}
        {!prefersReduced && (
          <div
            className="absolute inset-0 overflow-hidden"
            style={{ animationPlayState: isHeroInView ? "running" : "paused" }}
          >
            <div
              className="absolute top-[112px] left-0 w-[140px] h-[1.5px] bg-gradient-to-r from-transparent via-brand/60 to-transparent animate-beam-h-1"
              style={{ animationPlayState: isHeroInView ? "running" : "paused" }}
            />
            <div
              className="absolute top-[280px] left-0 w-[160px] h-[1.5px] bg-gradient-to-r from-transparent via-brand/50 to-transparent animate-beam-h-2"
              style={{ animationPlayState: isHeroInView ? "running" : "paused" }}
            />
            <div
              className="absolute top-[448px] left-0 w-[130px] h-[1.5px] bg-gradient-to-r from-transparent via-brand/55 to-transparent animate-beam-h-3"
              style={{ animationPlayState: isHeroInView ? "running" : "paused" }}
            />
            <div
              className="absolute top-0 left-[calc(50%-280px)] w-[1.5px] h-[140px] bg-gradient-to-b from-transparent via-brand/60 to-transparent animate-beam-v-1"
              style={{ animationPlayState: isHeroInView ? "running" : "paused" }}
            />
            <div
              className="absolute top-0 left-[calc(50%+336px)] w-[1.5px] h-[150px] bg-gradient-to-b from-transparent via-brand/50 to-transparent animate-beam-v-2"
              style={{ animationPlayState: isHeroInView ? "running" : "paused" }}
            />
          </div>
        )}
      </div>

      {/* Bottom fade into the next section */}
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent via-bg/60 to-bg" />
    </div>
  );
};

// ── Hero Conversation Mockup (ONE conversation from Industries data, min 15px text) ──
const HeroConversationMockup = ({ prefersReduced }: { prefersReduced: boolean }) => {
  const mockupRef = React.useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: mockupRef,
    offset: ["start end", "center center"],
  });

  const rotateX = useTransform(scrollYProgress, [0, 1], [18, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [0.92, 1]);

  return (
    <div
      ref={mockupRef}
      className="w-full max-w-5xl mx-auto mt-4 px-2 sm:px-4"
      style={{
        perspective: "1600px",
        contain: "paint",
        maskImage:
          "linear-gradient(to bottom, rgba(0,0,0,0.85) 0%, rgba(0,0,0,1) 12%, rgba(0,0,0,1) 100%)",
        WebkitMaskImage:
          "linear-gradient(to bottom, rgba(0,0,0,0.85) 0%, rgba(0,0,0,1) 12%, rgba(0,0,0,1) 100%)",
      }}
    >
      <motion.div
        style={prefersReduced ? {} : { rotateX, scale, transformPerspective: 1600 }}
        className="w-full rounded-2xl border border-slate-200/90 bg-surface shadow-[0_25px_60px_-15px_rgba(20,168,0,0.1),0_20px_40px_-20px_rgba(15,23,42,0.08)] overflow-hidden transition-shadow"
      >
        {/* Window Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-faint bg-bg/60">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5" aria-hidden="true">
              <span className="w-3 h-3 rounded-full bg-slate-300" />
              <span className="w-3 h-3 rounded-full bg-slate-300" />
              <span className="w-3 h-3 rounded-full bg-slate-300" />
            </div>
            <div className="h-4 w-px bg-border-faint mx-1" aria-hidden="true" />
            <div className="flex items-center gap-2">
              <ChannelIcon channel="whatsapp" size={18} />
              <span className="text-[15px] font-bold text-text-primary">
                Wholesale Green Tea
              </span>
            </div>
          </div>
        </div>

        {/* Conversation Thread */}
        <div className="p-4 sm:p-6 md:p-8 space-y-5 sm:space-y-6 bg-surface">
          {/* Customer bubble with its time (2:04 AM) */}
          <div className="self-start max-w-[95%] sm:max-w-[80%] text-left">
            <div className="bg-bg border border-border-faint rounded-2xl rounded-tl-sm p-3.5 sm:p-4 text-[14px] sm:text-[16px] text-text-primary leading-relaxed shadow-xs">
              Do you deliver 20 kg of green tea to Karachi? What's your wholesale price?
              <div className="text-[12px] sm:text-[13px] text-text-muted mt-2 text-right font-mono">
                2:04 AM
              </div>
            </div>
          </div>

          {/* AI draft card with a source line (Price_List_2026.pdf) */}
          <div className="self-end max-w-full sm:max-w-[85%] ml-auto rounded-2xl border border-brand/40 bg-brand/[0.03] p-4 sm:p-5 shadow-xs text-left">
            {/* Source Line */}
            <div className="flex items-center gap-2 text-[12px] sm:text-[13px] text-text-muted font-mono mb-3 pb-2 border-b border-brand/10">
              <PhosphorFileText size={16} weight="duotone" className="text-brand shrink-0" />
              <span>Price_List_2026.pdf</span>
            </div>

            {/* Draft text (minimum 15px) */}
            <p className="text-[14px] sm:text-[16px] text-text-second leading-relaxed mb-4">
              Yes, we deliver across Pakistan in 3 to 5 working days. Wholesale prices depend on the blend, so I've passed your request to our sales team. They'll send you a quote today.
            </p>

            {/* Action buttons with key hints */}
            <div className="flex items-center gap-2 sm:gap-3 pt-1 flex-wrap">
              <button className="px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-lg bg-brand text-white text-[13px] sm:text-[15px] font-bold shadow-xs flex items-center gap-1.5 sm:gap-2 hover:bg-brand-dim transition-colors cursor-default">
                Approve & Send
                <kbd className="px-1.5 py-0.5 rounded bg-white/20 text-white font-mono text-xs font-semibold">
                  A
                </kbd>
              </button>
              <button className="px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-lg bg-surface border border-border-faint text-text-second text-[13px] sm:text-[15px] font-bold hover:bg-bg transition-colors flex items-center gap-1.5 sm:gap-2 cursor-default">
                Edit
                <kbd className="px-1.5 py-0.5 rounded bg-bg border border-border-faint text-text-muted font-mono text-xs font-semibold">
                  E
                </kbd>
              </button>
            </div>
          </div>

          {/* Handed to your team row */}
          <div className="flex justify-end pt-1">
            <div className="inline-flex items-center gap-2 text-[13px] sm:text-[14px] font-semibold text-text-second bg-bg border border-border-faint px-3.5 py-1.5 rounded-full shadow-xs">
              <span className="w-2 h-2 rounded-full bg-brand" />
              Handed to your team
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// ── Floating Glass Pill Navbar ──
const FloatingNavbar = ({
  scrolled,
  navHidden,
  activeSection,
  onEnterApp,
  onSignIn,
  token,
  navigate,
  isMenuOpen,
  setIsMenuOpen,
  scrollYProgress,
}: {
  scrolled: boolean;
  navHidden: boolean;
  activeSection: string;
  onEnterApp: (mode?: "login" | "register") => void;
  onSignIn: () => void;
  token: string | null;
  navigate: (path: string) => void;
  isMenuOpen: boolean;
  setIsMenuOpen: (open: boolean) => void;
  scrollYProgress: any;
}) => {
  const [hoveredNav, setHoveredNav] = React.useState<string | null>(null);
  const menuRef = React.useRef<HTMLDivElement>(null);

  // Esc key closes mobile menu & body scroll lock
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isMenuOpen) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMenuOpen, setIsMenuOpen]);

  // Focus trap for mobile menu
  React.useEffect(() => {
    if (!isMenuOpen || !menuRef.current) return;
    const focusableElements = menuRef.current.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    firstElement?.focus();

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };
    window.addEventListener("keydown", handleTab);
    return () => window.removeEventListener("keydown", handleTab);
  }, [isMenuOpen]);

  return (
    <>
      <motion.nav
        initial={{ y: 0 }}
        animate={{
          y: navHidden && !isMenuOpen ? -100 : 0,
          scale: scrolled ? 0.98 : 1,
        }}
        transition={{ type: "spring", stiffness: 350, damping: 30 }}
        className={`fixed top-3 sm:top-4 left-1/2 -translate-x-1/2 w-[calc(100%-1.5rem)] sm:w-[calc(100%-2rem)] max-w-5xl z-50 h-14 rounded-full transition-all duration-300 ${
          scrolled
            ? "bg-white/70 backdrop-blur-xl border border-slate-200/80 shadow-[0_8px_30px_rgba(15,23,42,0.06),0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-white/60"
            : "bg-white/40 backdrop-blur-md border border-white/40 shadow-none ring-1 ring-white/30"
        }`}
      >
        <div className="h-full px-4 sm:px-6 flex items-center justify-between relative">
          {/* Left: Logo */}
          <div
            className="flex items-center gap-2 cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand rounded-lg shrink-0"
            tabIndex={0}
            role="button"
            aria-label="CareAgent Home"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            onKeyDown={(e) => e.key === "Enter" && window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            <img
              src="/Logo-CareAgent-clean.png"
              alt="CareAgent"
              className="h-7 sm:h-8 w-auto object-contain group-hover:scale-105 transition-transform duration-200"
            />
          </div>

          {/* Center: Nav Links */}
          <div
            className="hidden md:flex items-center gap-1 lg:gap-2"
            onMouseLeave={() => setHoveredNav(null)}
          >
            {NAV_ITEMS.map((item) => {
              const isActive = activeSection === item.id;
              const isHovered = hoveredNav === item.id;
              return (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  onMouseEnter={() => setHoveredNav(item.id)}
                  aria-current={isActive ? "true" : undefined}
                  className="relative px-3.5 py-1.5 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                >
                  {/* Sliding pill highlight behind hovered link */}
                  {isHovered && (
                    <motion.span
                      layoutId="navbar-hover-pill"
                      className="absolute inset-0 bg-slate-100/80 rounded-full -z-10"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">{item.label}</span>
                  {/* 4px brand dot under active section */}
                  {isActive && (
                    <motion.span
                      layoutId="navbar-active-dot"
                      className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-brand"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </a>
              );
            })}
          </div>

          {/* Right: Sign in & Get started */}
          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={() => {
                if (token) navigate("/dashboard");
                else onSignIn();
              }}
              className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer px-2 py-1 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            >
              {token ? "Dashboard" : "Sign in"}
            </button>
            <button
              onClick={() => onEnterApp("register")}
              className="group h-10 px-5 rounded-full text-sm font-bold bg-brand hover:bg-brand-dim text-white shadow-xs inline-flex items-center gap-1.5 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 cursor-pointer"
            >
              <span>Get started</span>
              <ArrowRight
                size={15}
                className="transition-transform duration-200 group-hover:translate-x-1"
              />
            </button>
          </div>

          {/* Mobile hamburger button */}
          <button
            className="md:hidden p-2 text-slate-600 hover:text-slate-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand rounded-lg"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Menu"
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          {/* Scroll progress bar: 2px brand line along bottom edge of pill */}
          <motion.div
            style={{ scaleX: scrollYProgress }}
            className="absolute bottom-0 left-6 right-6 h-[2px] bg-brand origin-left rounded-full pointer-events-none"
          />
        </div>
      </motion.nav>

      {/* Mobile Menu Full-Screen Sheet */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            ref={menuRef}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-40 bg-surface/95 backdrop-blur-2xl flex flex-col justify-between p-8 md:hidden pt-24"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation Menu"
          >
            <div className="flex flex-col gap-6">
              {NAV_ITEMS.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className="text-2xl font-bold text-text-primary tracking-tight hover:text-brand transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand rounded-lg py-1"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </a>
              ))}
            </div>

            <div className="flex flex-col gap-3 pt-6 border-t border-border-faint">
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  onEnterApp("register");
                }}
                className="w-full py-4 text-base font-bold rounded-full bg-brand hover:bg-brand-dim text-white shadow-sm flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand cursor-pointer"
              >
                Get started <ArrowRight size={18} />
              </button>
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  if (token) navigate("/dashboard");
                  else onSignIn();
                }}
                className="w-full py-3 text-center text-sm font-semibold text-text-muted hover:text-text-primary cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand rounded-lg"
              >
                {token ? "Dashboard" : "Sign in"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

// ── Main Landing Page ───────────────────────────────────────
export const Landing = () => {
  const navigate = useNavigate();
  const { token } = useAppStore();
  const [isAuthModalOpen, setIsAuthModalOpen] = React.useState(false);
  const [authMode, setAuthMode] = React.useState<"login" | "register">("login");
  const [isDemoModalOpen, setIsDemoModalOpen] = React.useState(false);
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);
  const [navHidden, setNavHidden] = React.useState(false);
  const [activeSection, setActiveSection] = React.useState<string>("how-it-works");

  const prefersReduced = useReducedMotion() ?? false;
  const { scrollY, scrollYProgress } = useScroll();

  const heroRef = React.useRef<HTMLElement>(null);
  const isHeroInView = useInView(heroRef, { margin: "100px" });

  const { ref: faqRef, isVisible: faqVisible } = useLazySection("350px");
  const { ref: botRef, isVisible: botVisible } = useLazySection("150px");

  const onEnterApp = (mode: "login" | "register" = "register") => {
    if (token) navigate("/dashboard");
    else {
      setAuthMode(mode);
      setIsAuthModalOpen(true);
    }
  };

  const onSignIn = () => {
    if (token) navigate("/dashboard");
    else {
      setAuthMode("login");
      setIsAuthModalOpen(true);
    }
  };

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const path = window.location.pathname;
      const search = window.location.search;
      const hash = window.location.hash;
      if (path === "/login" || search.includes("auth=login") || hash === "#login") {
        setAuthMode("login");
        setIsAuthModalOpen(true);
      } else if (path === "/signup" || search.includes("auth=signup") || search.includes("auth=register") || hash === "#signup") {
        setAuthMode("register");
        setIsAuthModalOpen(true);
      }
    }
  }, []);

  const handleCloseAuth = () => {
    setIsAuthModalOpen(false);
    if (typeof window !== "undefined") {
      if (window.location.pathname === "/login" || window.location.pathname === "/signup") {
        window.history.replaceState({}, "", "/");
      } else if (window.location.hash === "#login" || window.location.hash === "#signup") {
        window.history.replaceState({}, "", window.location.pathname + window.location.search);
      }
    }
  };

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Scroll direction detection (hide on scroll down, reveal on scroll up)
  const prevScrollY = React.useRef(0);
  useMotionValueEvent(scrollY, "change", (latest) => {
    const delta = latest - prevScrollY.current;
    if ((latest > 20) !== scrolled) {
      setScrolled(latest > 20);
    }
    if (!isMenuOpen && latest > 80) {
      if (delta > 8) {
        setNavHidden(true);
      } else if (delta < -8) {
        setNavHidden(false);
      }
    } else {
      setNavHidden(false);
    }
    prevScrollY.current = latest;
  });

  // Track active section via IntersectionObserver
  React.useEffect(() => {
    const sectionIds = ["how-it-works", "industries", "pricing", "faq"];
    const observers: IntersectionObserver[] = [];

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setActiveSection(id);
            }
          });
        },
        { rootMargin: "-20% 0px -60% 0px" }
      );
      obs.observe(el);
      observers.push(obs);
    });

    return () => {
      observers.forEach((obs) => obs.disconnect());
    };
  }, []);

  return (
    <div className="min-h-screen bg-bg text-text-primary overflow-x-clip selection:bg-brand selection:text-white font-sans">
      {/* Floating Glass Pill Navbar */}
      <FloatingNavbar
        scrolled={scrolled}
        navHidden={navHidden}
        activeSection={activeSection}
        onEnterApp={onEnterApp}
        onSignIn={onSignIn}
        token={token}
        navigate={navigate}
        isMenuOpen={isMenuOpen}
        setIsMenuOpen={setIsMenuOpen}
        scrollYProgress={scrollYProgress}
      />

      {/* Hero Section */}
      <section
        ref={heroRef}
        className="relative pt-20 sm:pt-24 pb-14 min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 z-10 overflow-hidden"
      >
        <HeroAnimatedBackground
          isHeroInView={isHeroInView}
          prefersReduced={prefersReduced}
        />

        <div className="max-w-4xl mx-auto w-full max-w-full flex flex-col items-center text-center overflow-x-hidden px-2">
          {/* Eyebrow badge: small glass pill with pulse dot */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full text-[11px] sm:text-[12px] font-mono font-bold tracking-wider text-text-second bg-surface/80 border border-border-faint backdrop-blur-md shadow-xs mb-5 max-w-full truncate"
          >
            <span className="w-2 h-2 rounded-full bg-brand animate-pulse shrink-0" />
            <span className="truncate">01 / UNIFIED INBOX FOR LEADS</span>
          </motion.div>

          {/* H1: clamp(20px, 6vw, 92px), line-height 1.05, letter-spacing -0.035em, two lines */}
          <h1
            style={{
              fontSize: "clamp(20px, 6vw, 92px)",
              lineHeight: 1.05,
              letterSpacing: "-0.035em",
            }}
            className="font-extrabold text-text-primary mb-5 text-center break-words w-full max-w-full"
          >
            <span className="block overflow-hidden">
              <motion.span
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className="block break-words"
              >
                Every lead answered.
              </motion.span>
            </span>
            <span className="block overflow-hidden">
              <motion.span
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                transition={{ duration: 0.7, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
                className="block text-brand break-words"
              >
                Even at 2 AM.
              </motion.span>
            </span>
          </h1>

          {/* Body: max-w-2xl, 19px, slate-600 */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.16, duration: 0.5 }}
            className="max-w-2xl w-full text-[16px] sm:text-[19px] text-slate-600 leading-relaxed mb-6 font-normal break-words px-2"
          >
            You pay for ads, SEO and Google listings to get customers messaging. CareAgent gives each one a correct answer in seconds, from your own prices and policies, on whichever app they used. Anything it can't answer goes straight to your team.
          </motion.p>

          {/* CTA row: Get started (primary pill, 52px) plus See pricing text link */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.24, duration: 0.5 }}
            className="flex items-center justify-center gap-4 sm:gap-6 mb-5 flex-wrap w-full max-w-full"
          >
            <button
              onClick={onEnterApp}
              className="h-[52px] rounded-full px-7 sm:px-8 text-base font-bold bg-brand hover:bg-brand-dim text-white shadow-sm hover:shadow-md transition-all inline-flex items-center justify-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 group"
            >
              Get started <ArrowRight size={18} className="transition-transform group-hover:translate-x-0.5" />
            </button>
            <a
              href="#pricing"
              className="text-base font-semibold text-text-second hover:text-text-primary transition-colors inline-flex items-center gap-1 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand rounded-md px-2 py-1"
            >
              See pricing
              <span className="transition-transform group-hover:translate-x-0.5">→</span>
            </a>
          </motion.div>

          {/* Trust line: 13px, slate-500 */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.32, duration: 0.5 }}
            className="text-[12px] sm:text-[13px] text-slate-500 leading-relaxed max-w-2xl w-full mb-6 break-words px-2"
          >
            Set up in an afternoon · Cancel any month · Already answering admissions questions for a university in Lahore
          </motion.p>

          {/* Channels: thin row of four logos in slate-400 under the CTAs that turn to brand color on hover */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.40, duration: 0.5 }}
            className="mb-6 w-full max-w-full"
          >
            <HeroChannelStrip />
          </motion.div>
        </div>

        {/* Product Shot Under Headline: Large window mockup centered below CTAs, max-w-6xl */}
        <HeroConversationMockup prefersReduced={prefersReduced} />
      </section>

      {/* Channel Marquee under hero */}
      <div className="w-full py-8 border-y border-border-faint bg-surface/40 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 mb-3 text-center">
          <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
            Official connections
          </span>
        </div>
        <div className="relative flex overflow-x-hidden">
          <div className={`flex gap-12 whitespace-nowrap ${prefersReduced ? "" : "animate-marquee"}`}>
            {[...CHANNELS, ...CHANNELS, ...CHANNELS, ...CHANNELS].map((c, i) => (
              <div
                key={`${c.key}-${i}`}
                className="flex items-center gap-3 shrink-0 px-4 py-2 rounded-xl bg-surface border border-border-faint shadow-xs"
              >
                <ChannelIcon channel={c.key} size={22} />
                <span className="text-sm font-bold text-text-primary">{c.name}</span>
                <span className="text-[11px] font-bold text-brand bg-brand/10 rounded-full px-2 py-0.5">
                  Official API
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* The Problem Section */}
      <section className="py-24 px-6 lg:px-8 bg-surface/50 border-t border-border-faint">
        <div className="max-w-7xl mx-auto">
          {/* Left aligned heading and body */}
          <motion.div {...fadeInUp} className="max-w-2xl mb-14 text-left">
            <h2 className="text-4xl md:text-5xl font-extrabold text-text-primary tracking-tighter mb-6 leading-[1.1]">
              Getting the lead is half the job.
            </h2>
            <p className="text-lg text-text-muted leading-relaxed">
              The other half is replying before the customer messages your competitor. Most small teams can't
              watch four apps all day, so paid-for inquiries sit unread.
            </p>
          </motion.div>

          {/* Cards with white glass surface, 24px radius, 1px highlight, illustration at top, 01/02/03 labels */}
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                number: "01",
                problem: "Messages arrive after hours",
                fix: "CareAgent replies at 11 PM, on Sundays and on Eid, in seconds.",
                illustration: (
                  <div className="flex items-center gap-3 text-brand mb-6">
                    <MoonStars size={38} weight="duotone" className="text-brand" />
                    <div className="relative w-8 h-8 rounded-full border-2 border-brand/40 flex items-center justify-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand" />
                      <motion.span
                        animate={prefersReduced ? undefined : { rotate: 360 }}
                        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                        className="absolute top-1/2 left-1/2 w-0.5 h-2.5 bg-brand origin-bottom -translate-x-1/2 -translate-y-full rounded-full"
                      />
                      <span className="absolute top-1/2 left-1/2 w-0.5 h-1.5 bg-brand-dim origin-bottom -translate-x-1/2 -translate-y-full rounded-full -rotate-45" />
                    </div>
                  </div>
                ),
              },
              {
                number: "02",
                problem: "The same 20 questions, every day",
                fix: "Price, timing, location, availability: answered from your own documents.",
                illustration: (
                  <div className="relative flex items-center h-10 mb-6">
                    <div className="relative flex items-center">
                      <div className="w-9 h-7 rounded-lg rounded-bl-xs bg-brand/10 border border-brand/20 -rotate-6" />
                      <div className="w-10 h-8 rounded-lg rounded-br-xs bg-brand/15 border border-brand/30 -ml-4 flex items-center justify-center shadow-xs">
                        <motion.div
                          animate={prefersReduced ? undefined : { y: [0, -3, 0] }}
                          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                        >
                          <Question size={22} weight="duotone" className="text-brand" />
                        </motion.div>
                      </div>
                    </div>
                  </div>
                ),
              },
              {
                number: "03",
                problem: "Four apps, one tired person",
                fix: "WhatsApp, Instagram, Facebook and website chat land in one inbox.",
                illustration: (
                  <div className="flex items-center gap-3 mb-6">
                    <div className="flex items-center -space-x-1.5">
                      {CHANNELS.map((c, i) => (
                        <motion.div
                          key={c.key}
                          initial={prefersReduced ? false : { x: -6 * (3 - i), opacity: 0.7 }}
                          whileInView={{ x: 0, opacity: 1 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.5, delay: i * 0.08 }}
                          className="w-7 h-7 rounded-lg bg-surface border border-border-faint shadow-xs flex items-center justify-center shrink-0"
                        >
                          <ChannelIcon channel={c.key} size={15} />
                        </motion.div>
                      ))}
                    </div>
                    <ArrowRight size={14} className="text-brand/60" />
                    <div className="text-brand">
                      <Tray size={36} weight="duotone" className="text-brand" />
                    </div>
                  </div>
                ),
              },
            ].map((p, i) => (
              <motion.div
                key={p.problem}
                {...fadeInUp}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="bg-surface/90 backdrop-blur-md rounded-[24px] border border-border-faint p-8 flex flex-col justify-between shadow-card hover:shadow-hover hover:-translate-y-1 transition-all duration-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    {p.illustration}
                    <span className="font-mono text-xs font-bold text-text-muted">{p.number}</span>
                  </div>
                  <h3 className="text-xl font-black text-text-primary tracking-tight mb-2">
                    {p.problem}
                  </h3>
                  <p className="text-text-muted leading-relaxed text-sm md:text-base">{p.fix}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Industries Section */}
      <section id="industries" className="py-24 px-6 lg:px-8 bg-surface border-y border-border-faint">
        <div className="max-w-7xl mx-auto">
          <motion.div {...fadeInUp} className="text-center mb-14">
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

      {/* Features Bento Grid */}
      <section id="features" className="py-28 px-6 lg:px-8 relative overflow-hidden bg-bg">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="mb-16 max-w-xl text-left">
            <h2 className="text-4xl md:text-5xl font-extrabold text-text-primary tracking-tighter mb-6 leading-[1.1]">
              What you get with <span className="text-brand">CareAgent</span>
            </h2>
            <p className="text-lg text-text-muted">
              No coding, no new phone numbers, no new apps for your customers.
            </p>
          </div>

          <div className="grid lg:grid-cols-12 gap-6">
            {/* Feature 1: Wide card with mini documents + pinned fact */}
            <BentoSpotlightCard
              prefersReduced={prefersReduced}
              className="lg:col-span-7 bg-surface p-8 md:p-10 shadow-card"
            >
              <div className="flex items-center gap-3 text-brand mb-6">
                <PhosphorFileText size={38} weight="duotone" className="text-brand" />
                <PushPin size={24} weight="duotone" className="text-brand rotate-12" />
              </div>

              <div className="mb-6 p-3 rounded-xl bg-bg border border-border-faint flex items-center justify-between max-w-md">
                <div className="flex items-center gap-2.5">
                  <PhosphorFileText size={18} weight="duotone" className="text-brand" />
                  <span className="text-xs font-bold text-text-primary">Price_List_2026.pdf</span>
                </div>
                <span className="text-[10px] font-bold text-brand bg-brand/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand" />
                  Pinned fact active
                </span>
              </div>

              <h3 className="text-2xl md:text-3xl font-black text-text-primary mb-4 tracking-tight">
                Answers from your own information
              </h3>
              <p className="text-text-second text-base leading-relaxed max-w-lg">
                Upload your price list, brochure, FAQ or website pages. CareAgent answers only from
                what you give it, and you can pin the facts it must always get right.
              </p>
            </BentoSpotlightCard>

            {/* Feature 2: Taller dark slate card with emerald glow and 3 sliding chat lanes */}
            <BentoSpotlightCard
              prefersReduced={prefersReduced}
              className="lg:col-span-5 bg-text-primary text-white p-8 md:p-10 shadow-2xl ring-1 ring-white/10"
            >
              {/* Emerald ambient glow */}
              <div
                aria-hidden
                className="pointer-events-none absolute -top-16 -right-16 w-44 h-44 rounded-full bg-brand/20 blur-2xl"
              />

              <div className="space-y-2.5 mb-8 bg-white/5 p-4 rounded-2xl border border-white/10 overflow-hidden">
                {[0, 1, 2].map((lane) => (
                  <div
                    key={lane}
                    className="h-6 w-full rounded-lg bg-white/5 relative overflow-hidden flex items-center"
                  >
                    <motion.div
                      animate={prefersReduced ? undefined : { x: ["-100%", "260%"] }}
                      transition={{
                        duration: 3.5 + lane * 0.8,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: lane * 0.4,
                      }}
                      className="h-4 px-3 rounded-full bg-brand text-[10px] font-mono font-bold text-white flex items-center shrink-0 shadow-xs"
                    >
                      Chat #{lane + 1}
                    </motion.div>
                  </div>
                ))}
              </div>

              <h3 className="text-2xl md:text-3xl font-black mb-4 tracking-tight text-white">
                Many conversations at once
              </h3>
              <p className="text-white/85 text-base leading-relaxed">
                Several AI agents work in parallel, so a busy ad campaign never creates a queue.
              </p>
            </BentoSpotlightCard>

            {/* Feature 3: Sentiment meter */}
            <BentoSpotlightCard
              prefersReduced={prefersReduced}
              className="lg:col-span-4 bg-surface p-8 shadow-card"
            >
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <SmileySad size={28} weight="duotone" className="text-warn" />
                  <SmileyMeh size={28} weight="duotone" className="text-brand/60" />
                  <Smiley size={28} weight="duotone" className="text-brand" />
                </div>
                <div className="h-2 w-full rounded-full bg-bg border border-border-faint relative overflow-hidden">
                  <div className="h-full w-full bg-gradient-to-r from-warn via-brand/40 to-brand" />
                </div>
              </div>
              <h3 className="text-xl md:text-2xl font-black text-text-primary mb-3 tracking-tight">
                Spots unhappy customers
              </h3>
              <p className="text-text-muted text-sm leading-relaxed">
                Sentiment tracking flags frustrated customers and hands them to a person before they
                leave.
              </p>
            </BentoSpotlightCard>

            {/* Feature 4: Keycap "A" next to SealCheck */}
            <BentoSpotlightCard
              prefersReduced={prefersReduced}
              className="lg:col-span-4 bg-surface p-8 shadow-card"
            >
              <div className="flex items-center gap-3 text-brand mb-6">
                <span className="w-9 h-9 rounded-lg border-2 border-brand/40 bg-surface shadow-xs font-mono font-black text-sm flex items-center justify-center text-brand">
                  A
                </span>
                <SealCheck size={36} weight="duotone" className="text-brand" />
              </div>
              <h3 className="text-xl md:text-2xl font-black text-text-primary mb-3 tracking-tight">
                Your team stays in charge
              </h3>
              <p className="text-text-muted text-sm leading-relaxed">
                Approve every reply, or let confident answers send on their own. You choose per channel.
              </p>
            </BentoSpotlightCard>

            {/* Feature 5: ChartLineUp */}
            <BentoSpotlightCard
              prefersReduced={prefersReduced}
              className="lg:col-span-4 bg-surface p-8 shadow-card"
            >
              <div className="text-brand mb-6">
                <ChartLineUp size={38} weight="duotone" className="text-brand" />
              </div>
              <h3 className="text-xl md:text-2xl font-black text-text-primary mb-3 tracking-tight">
                Gets better as you use it
              </h3>
              <p className="text-text-muted text-sm leading-relaxed">
                When your team edits a reply or answers an escalation, CareAgent learns the better
                answer.
              </p>
            </BentoSpotlightCard>

            {/* Feature 6: Safeguards with Duotone Phosphor Icons */}
            <BentoSpotlightCard
              prefersReduced={prefersReduced}
              className="lg:col-span-12 bg-surface p-8 md:p-10 flex flex-col md:flex-row items-center gap-10 shadow-card"
            >
              <div className="flex-1">
                <div className="w-12 h-12 rounded-xl bg-brand/10 flex items-center justify-center text-brand mb-6">
                  <ShieldCheck size={32} weight="duotone" className="text-brand" />
                </div>
                <h3 className="text-2xl md:text-3xl font-black text-text-primary mb-4 tracking-tight leading-[1.1]">
                  Built with real safeguards
                </h3>
                <ul className="space-y-3">
                  {[
                    "If the answer isn't in your information, CareAgent tells the customer a person will follow up, and flags it for your team",
                    "Every conversation is logged. Nothing is sent silently",
                    "Uses official Meta and Google connections, so your accounts stay in good standing",
                  ].map((t) => (
                    <li key={t} className="flex items-start gap-3 font-medium text-text-second text-sm">
                      <div className="w-1.5 h-1.5 rounded-full bg-brand mt-2 shrink-0" />
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Safeguards visual audit card using ONLY existing bullet strings */}
              <div className="flex-1 w-full bg-bg rounded-2xl border border-border-faint p-6 flex flex-col justify-center gap-3 shadow-inner">
                {[
                  {
                    bullet:
                      "If the answer isn't in your information, CareAgent tells the customer a person will follow up, and flags it for your team",
                    icon: <ShieldCheck size={20} weight="duotone" className="text-brand shrink-0" />,
                  },
                  {
                    bullet: "Every conversation is logged. Nothing is sent silently",
                    icon: (
                      <PhosphorFileText size={20} weight="duotone" className="text-brand shrink-0" />
                    ),
                  },
                  {
                    bullet:
                      "Uses official Meta and Google connections, so your accounts stay in good standing",
                    icon: <CheckCircle size={20} weight="duotone" className="text-brand shrink-0" />,
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="p-3.5 rounded-xl bg-surface border border-border-faint flex items-start gap-3"
                  >
                    <div className="mt-0.5">{item.icon}</div>
                    <div className="text-xs text-text-second leading-relaxed font-medium">
                      {item.bullet}
                    </div>
                  </div>
                ))}
              </div>
            </BentoSpotlightCard>
          </div>
        </div>
      </section>

      {/* Channels Section */}
      <section id="integrations" className="py-24 px-6 lg:px-8 relative overflow-hidden bg-surface/50 border-t border-border-faint">
        <div className="max-w-7xl mx-auto">
          <motion.div {...fadeInUp} className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-extrabold tracking-tighter text-text-primary mb-6 leading-[1.1] min-h-[2.2em]">
              <Typewriter text="Meet your customers " speed={40} delay={0} cursor={false} />
              <br />
              <span className="text-brand">
                <Typewriter text="where they are." speed={40} delay={800} />
              </span>
            </h2>
            <p className="text-lg text-text-muted max-w-xl mx-auto">
              All four channels are live. Connect each one with its official login button.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-16">
            {CHANNELS.map((c, i) => (
              <motion.div
                key={c.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                whileHover={{ y: -5 }}
                className="p-6 rounded-[28px] border border-border-faint bg-surface shadow-xs hover:shadow-card transition-all duration-300 flex flex-col items-center text-center gap-3 group"
              >
                <div
                  className="w-20 h-20 rounded-2xl flex items-center justify-center mb-1 group-hover:scale-110 transition-transform duration-300"
                  style={{ backgroundColor: `${CHANNEL_TINT[c.key]}14` }}
                >
                  <ChannelIcon channel={c.key} size={36} />
                </div>
                <div className="text-[16px] font-bold text-text-primary">{c.name}</div>
                <div className="text-[13px] text-text-muted leading-relaxed">{c.desc}</div>
                <span className="text-[11px] font-bold text-brand bg-brand/10 rounded-full px-3 py-1">
                  Live
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section (Pinned on Desktop, Stacked on Mobile / Reduced Motion) */}
      <section id="how-it-works" className="py-24 px-6 lg:px-8 relative bg-bg border-t border-border-faint">
        <HowItWorks prefersReduced={prefersReduced} />
      </section>

      {/* Pricing Section with Faint Brand Radial Wash */}
      <section id="pricing" className="py-28 px-6 lg:px-8 bg-surface border-y border-border-faint relative overflow-hidden scroll-mt-20">
        {/* Faint brand radial wash */}
        <div
          className="absolute inset-0 pointer-events-none -z-10"
          style={{
            background:
              "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(20,168,0,0.08) 0%, transparent 70%)",
          }}
        />

        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 flex flex-col items-center">
            <h2 className="text-4xl md:text-6xl font-extrabold text-text-primary tracking-tighter mb-6">
              Simple plans. No per-seat fees.
            </h2>
            <p className="text-lg text-text-muted max-w-2xl">
              Pick the plan that fits how many customers message you. Cancel any month.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 items-stretch max-w-7xl mx-auto">
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
                "All 4 channels",
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
              ]}
              cta="Estimate my cost"
              onClick={() => scrollTo("estimate")}
            />
          </div>

          <p className="text-center text-sm text-text-muted mt-10 max-w-3xl mx-auto leading-relaxed">
            WhatsApp charges a small fee per message, set by Meta and billed by Meta to your own WhatsApp Business
            account on every plan. The rate varies by your customers' country.
          </p>

          {/* Cost Estimator */}
          <CostEstimator onStart={onEnterApp} />
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-28 px-6 lg:px-8 bg-bg">
        <div className="max-w-7xl mx-auto" ref={faqRef}>
          <h2 className="text-4xl md:text-5xl font-extrabold text-text-primary tracking-tighter mb-12 text-center">
            Questions businesses ask us
          </h2>
          {faqVisible ? <FAQ /> : <div className="min-h-[350px]" />}
        </div>
      </section>

      {/* Final CTA Section (Drop-in Replacement) */}
      <FinalCta onEnterApp={onEnterApp} />

      {/* Footer: strictly 2 columns (Product + Legal) */}
      <footer className="pt-20 pb-12 px-6 lg:px-8 bg-surface border-t border-border-faint">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-start justify-between gap-16 mb-16">
            <div className="max-w-sm">
              <img src="/Logo-CareAgent-clean.png" alt="CareAgent" className="h-8 object-contain mb-6" />
              <p className="text-text-muted text-base font-medium leading-relaxed">
                AI customer replies for WhatsApp, Instagram, Facebook and website chat. It answers from your
                information, sends confident replies and hands the rest to your team.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-16 md:gap-24">
              <div>
                <h6 className="font-bold text-lg text-text-primary mb-6">Product</h6>
                <ul className="space-y-4 font-medium text-text-muted text-base">
                  {NAV_ITEMS.map((item) => (
                    <li key={item.id}>
                      <a href={`#${item.id}`} className="hover:text-brand transition-colors">
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h6 className="font-bold text-lg text-text-primary mb-6">Legal</h6>
                <ul className="space-y-4 font-medium text-text-muted text-base">
                  <li>
                    <a href="/privacy" className="hover:text-brand transition-colors">
                      Privacy Policy
                    </a>
                  </li>
                  <li>
                    <a href="/refund-policy" className="hover:text-brand transition-colors">
                      Refund Policy
                    </a>
                  </li>
                  <li>
                    <a href="/terms" className="hover:text-brand transition-colors">
                      Terms of Service
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-border-faint text-sm font-medium text-text-muted">
            2026 CareAgent. Powered by Flint Sol
          </div>
        </div>
      </footer>

      {/* Modals & Embedded Guide Bot */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={handleCloseAuth}
        initialMode={authMode}
      />
      <DemoVideoModal isOpen={isDemoModalOpen} onClose={() => setIsDemoModalOpen(false)} />
      <div ref={botRef}>
        {botVisible && <CareAgentBot />}
      </div>
    </div>
  );
};
