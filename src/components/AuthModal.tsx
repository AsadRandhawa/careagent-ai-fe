import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Bot, Mail, Lock } from "lucide-react";
import { Button } from "./ui/Button";
import { useAppStore } from "../store";
import { useToast } from "./ToastProvider";
import { useNavigate } from "react-router-dom";

export const AuthModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [mode, setMode] = React.useState<"login" | "register">("login");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  
  const { setToken, setUser, setDocuments, setBrandVoice, setBusinessIdentity } = useAppStore();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const res = await fetch(`${apiUrl}/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Authentication failed");
      
      setToken(data.token);
      
      // Fetch user data
      const userRes = await fetch(`${apiUrl}/api/user/me`, {
        headers: { "Authorization": `Bearer ${data.token}` }
      });
      if (userRes.ok) {
        const userData = await userRes.json();
        setUser(userData);
        if (userData.knowledgeBase) {
          if (userData.knowledgeBase.documents) setDocuments(userData.knowledgeBase.documents);
          if (userData.knowledgeBase.brandVoice) setBrandVoice(userData.knowledgeBase.brandVoice);
          if (userData.knowledgeBase.businessIdentity) setBusinessIdentity(userData.knowledgeBase.businessIdentity);
        }
      }
      
      toast(mode === "login" ? "Welcome back!" : "Account created successfully!", "success");
      onClose();
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-bg/80 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-bg border border-border-faint rounded-3xl p-8 shadow-2xl overflow-hidden"
          >
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/5 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2" />
            
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 text-text-muted hover:text-text-primary transition-colors"
            >
              <X size={20} />
            </button>

            <div className="flex flex-col items-center mb-8 relative z-10">
              <div className="w-12 h-12 rounded-xl bg-brand flex items-center justify-center shadow-glow mb-4">
                <Bot className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-2xl font-black text-text-primary tracking-tight">
                {mode === "login" ? "Welcome back" : "Create your account"}
              </h2>
              <p className="text-text-muted text-sm font-medium mt-1">
                {mode === "login" ? "Enter your details to access your agents." : "Start automating your customer support today."}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
              <div>
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-brand transition-colors" size={18} />
                  <input 
                    type="email" 
                    required
                    placeholder="Work Email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full bg-surface border border-border-mid rounded-xl h-12 pl-10 pr-4 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-brand/40 focus:ring-1 focus:ring-brand/40 transition-all"
                  />
                </div>
              </div>
              <div>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-brand transition-colors" size={18} />
                  <input 
                    type="password" 
                    required
                    placeholder="Password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full bg-surface border border-border-mid rounded-xl h-12 pl-10 pr-4 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-brand/40 focus:ring-1 focus:ring-brand/40 transition-all"
                  />
                </div>
              </div>

              <Button 
                type="submit"
                variant="brand" 
                className="w-full py-4 rounded-xl text-[15px] font-bold shadow-glow mt-2"
                disabled={isLoading}
              >
                {isLoading ? "Please wait..." : (mode === "login" ? "Sign In" : "Create Account")}
              </Button>
            </form>

            <div className="mt-8 text-center relative z-10">
              <span className="text-text-muted text-sm font-medium">
                {mode === "login" ? "Don't have an account?" : "Already have an account?"}
              </span>
              <button 
                type="button"
                onClick={() => setMode(mode === "login" ? "register" : "login")}
                className="ml-2 text-brand font-bold text-sm hover:underline"
              >
                {mode === "login" ? "Sign up" : "Sign in"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
