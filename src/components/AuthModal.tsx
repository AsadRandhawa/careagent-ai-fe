import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Mail, Lock, Eye, EyeOff, ArrowRight, Loader2 } from "lucide-react";
import { useAppStore } from "../store";
import { useToast } from "./ToastProvider";
import { useNavigate } from "react-router-dom";

export interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: "login" | "register";
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = "login",
}) => {
  const [mode, setMode] = React.useState<"login" | "register">(initialMode);
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  const emailInputRef = React.useRef<HTMLInputElement>(null);

  const {
    setToken,
    setUser,
    hydrateDocuments,
    setBrandVoice,
    setBusinessIdentity,
    setShowOnboarding,
    pendingPlan,
    setPendingPlan,
  } = useAppStore();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Sync mode when initialMode changes or modal opens
  React.useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      // Autofocus first input with slight delay for modal mount
      const timer = setTimeout(() => {
        emailInputRef.current?.focus();
      }, 90);
      return () => clearTimeout(timer);
    }
  }, [isOpen, initialMode]);

  // Lock body scroll while modal is open
  React.useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  // Handle ESC key to dismiss
  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "https://careagent-ai-be-production.up.railway.app";
      const res = await fetch(`${apiUrl}/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Authentication failed");

      setToken(data.token);

      // Fetch user data
      const userRes = await fetch(`${apiUrl}/api/user/me`, {
        headers: { Authorization: `Bearer ${data.token}` },
      });
      if (userRes.ok) {
        const userData = await userRes.json();
        setUser(userData);
        if (userData.knowledgeBase) {
          if (userData.knowledgeBase.documents) hydrateDocuments(userData.knowledgeBase.documents);
          if (userData.knowledgeBase.brandVoice) setBrandVoice(userData.knowledgeBase.brandVoice);
          if (userData.knowledgeBase.businessIdentity)
            setBusinessIdentity(userData.knowledgeBase.businessIdentity);
        }
      }

      toast(mode === "login" ? "Welcome back!" : "Account created successfully!", "success");
      onClose();

      // If user was trying to subscribe, redirect to Stripe checkout
      if (pendingPlan === "growth") {
        setPendingPlan(null);
        try {
          const checkoutRes = await fetch(`${apiUrl}/api/stripe/create-checkout`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${data.token}`,
            },
          });
          const checkoutData = await checkoutRes.json();
          if (checkoutData.url) {
            window.location.href = checkoutData.url;
            return;
          }
        } catch (err) {
          console.error("Stripe redirect failed:", err);
        }
      }

      if (mode === "register") {
        setShowOnboarding(true);
      }

      navigate("/dashboard");
    } catch (err: any) {
      toast(err.message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Subtle frosted glass backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            onClick={onClose}
            aria-hidden="true"
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-md"
          />

          {/* Modal Card with crisp spring entry */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 14 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 10 }}
            transition={{ type: "spring", damping: 28, stiffness: 360, mass: 0.8 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="auth-modal-title"
            className="relative w-full max-w-[430px] bg-white border border-slate-200/90 rounded-[28px] sm:rounded-[32px] p-6 sm:p-8 shadow-[0_24px_70px_rgba(15,23,42,0.18),0_1px_3px_rgba(15,23,42,0.06)] ring-1 ring-black/[0.04] overflow-hidden my-auto"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              type="button"
              aria-label="Close dialog"
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand z-20 cursor-pointer"
            >
              <X size={16} strokeWidth={2.5} />
            </button>

            {/* Header branding */}
            <div className="flex flex-col items-center text-center mb-6 relative z-10">
              <img
                src="/Logo-CareAgent-clean.png"
                alt="CareAgent"
                className="h-8 sm:h-9 w-auto object-contain mb-4 select-none"
              />

              <AnimatePresence mode="wait">
                <motion.div
                  key={mode}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.16, ease: "easeOut" }}
                  className="flex flex-col items-center"
                >
                  <h2
                    id="auth-modal-title"
                    className="text-2xl font-extrabold text-slate-900 tracking-tight"
                  >
                    {mode === "login" ? "Welcome back" : "Create your account"}
                  </h2>
                  <p className="text-slate-500 text-xs sm:text-sm font-medium mt-1">
                    {mode === "login"
                      ? "Enter your credentials to access your unified inbox."
                      : "Start automating your customer conversations in minutes."}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Segmented Mode Selector Tab */}
            <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl mb-6 relative">
              <button
                type="button"
                onClick={() => setMode("login")}
                className={`relative py-2 text-xs sm:text-sm font-bold rounded-lg transition-colors z-10 cursor-pointer ${
                  mode === "login" ? "text-slate-900" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {mode === "login" && (
                  <motion.div
                    layoutId="auth-pill-active"
                    transition={{ type: "spring", stiffness: 450, damping: 35 }}
                    className="absolute inset-0 bg-white rounded-lg shadow-xs"
                  />
                )}
                <span className="relative z-10">Sign In</span>
              </button>

              <button
                type="button"
                onClick={() => setMode("register")}
                className={`relative py-2 text-xs sm:text-sm font-bold rounded-lg transition-colors z-10 cursor-pointer ${
                  mode === "register" ? "text-slate-900" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {mode === "register" && (
                  <motion.div
                    layoutId="auth-pill-active"
                    transition={{ type: "spring", stiffness: 450, damping: 35 }}
                    className="absolute inset-0 bg-white rounded-lg shadow-xs"
                  />
                )}
                <span className="relative z-10">Create Account</span>
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
              {/* Email Field */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Work Email
                </label>
                <div className="relative group rounded-xl border border-slate-200 bg-slate-50/50 hover:border-slate-300 focus-within:border-brand focus-within:bg-white focus-within:ring-4 focus-within:ring-brand/10 transition-all duration-200">
                  <Mail
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand transition-colors"
                    size={17}
                  />
                  <input
                    ref={emailInputRef}
                    type="email"
                    required
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-transparent h-11 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 outline-none font-medium"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Password
                  </label>
                  {mode === "login" && (
                    <span className="text-[11px] font-semibold text-slate-400 hover:text-slate-600 cursor-pointer transition-colors">
                      Forgot password?
                    </span>
                  )}
                </div>
                <div className="relative group rounded-xl border border-slate-200 bg-slate-50/50 hover:border-slate-300 focus-within:border-brand focus-within:bg-white focus-within:ring-4 focus-within:ring-brand/10 transition-all duration-200">
                  <Lock
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand transition-colors"
                    size={17}
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder={mode === "login" ? "Enter your password" : "At least 6 characters"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    minLength={mode === "register" ? 6 : undefined}
                    className="w-full bg-transparent h-11 pl-10 pr-10 text-sm text-slate-900 placeholder:text-slate-400 outline-none font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors p-1 rounded-md focus:outline-none cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 rounded-full bg-brand hover:bg-brand-dim text-white font-bold text-sm shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={17} className="animate-spin text-white" />
                      <span>{mode === "login" ? "Signing in..." : "Creating account..."}</span>
                    </>
                  ) : (
                    <>
                      <span>{mode === "login" ? "Sign In" : "Create Account"}</span>
                      <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Bottom toggle / disclaimer */}
            <div className="mt-6 pt-5 border-t border-slate-100 text-center relative z-10">
              <p className="text-xs text-slate-500 font-medium">
                {mode === "login" ? (
                  <>
                    Don't have an account?{" "}
                    <button
                      type="button"
                      onClick={() => setMode("register")}
                      className="text-brand font-bold hover:underline ml-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand rounded-xs cursor-pointer"
                    >
                      Sign up free
                    </button>
                  </>
                ) : (
                  <>
                    Already have an account?{" "}
                    <button
                      type="button"
                      onClick={() => setMode("login")}
                      className="text-brand font-bold hover:underline ml-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand rounded-xs cursor-pointer"
                    >
                      Sign in
                    </button>
                  </>
                )}
              </p>

              {mode === "register" && (
                <p className="text-[11px] text-slate-400 mt-3 leading-relaxed">
                  By creating an account, you agree to our Terms of Service and Privacy Policy.
                </p>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
