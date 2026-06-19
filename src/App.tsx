import * as React from "react";
import { Sidebar } from "./components/Sidebar";
import { Topbar } from "./components/Topbar";

import { Dashboard } from "./screens/Dashboard";
import { Inbox } from "./screens/Inbox";
import { Escalations } from "./screens/Escalations";
import { KnowledgeBase } from "./screens/KnowledgeBase";
import { Onboarding } from "./screens/Onboarding";
import { Channels } from "./screens/Channels";
import { PaymentSuccess } from "./screens/PaymentSuccess";
import { Billing } from "./screens/Billing";
import { Contact } from "./screens/Contact";
import { RefundPolicy } from "./screens/RefundPolicy";
import { TermsOfService } from "./screens/TermsOfService";
import { Analytics } from "./screens/Analytics";
import { Landing } from "./screens/Landing";
import { Privacy } from "./screens/Privacy";
import { AnimatePresence, motion } from "motion/react";
import { Skeleton } from "./components/ui/AtomsMisc";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { useAppStore } from "./store";
import { OnboardingModal } from "./components/OnboardingModal";

export default function App() {
  const [isLoading, setIsLoading] = React.useState(true);
  const location = useLocation();
  const fetchTickets = useAppStore(state => state.fetchTickets);
  const { token, setUser, setDocuments, setBrandVoice, setBusinessIdentity } = useAppStore();

  React.useEffect(() => {
    // Load user profile first, then fetch tickets once we know gmail is connected
    if (token) {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
      fetch(`${apiUrl}/api/user/me`, {
        headers: { "Authorization": `Bearer ${token}`, "Cache-Control": "no-store" }
      })
      .then(res => res.json())
      .then(userData => {
        if (!userData.error) {
          setUser(userData);
          if (userData.knowledgeBase) {
            if (userData.knowledgeBase.documents) setDocuments(userData.knowledgeBase.documents);
            if (userData.knowledgeBase.brandVoice) setBrandVoice(userData.knowledgeBase.brandVoice);
            if (userData.knowledgeBase.businessIdentity) setBusinessIdentity(userData.knowledgeBase.businessIdentity);
          }
          // Only fetch tickets if this account has Gmail connected
          if (userData.googleConnected) fetchTickets();
        }
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [token]);

  const isLanding = location.pathname === "/" || location.pathname === "/privacy" || location.pathname === "/refund-policy" || location.pathname === "/terms";

  if (isLanding) {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
        >
          {
            location.pathname === "/privacy" ? <Privacy /> : 
            location.pathname === "/refund-policy" ? <RefundPolicy /> : 
            location.pathname === "/terms" ? <TermsOfService /> : 
            <Landing />
          }
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="app"
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        className="flex h-screen w-full bg-bg overflow-hidden select-none"
      >
        <Sidebar />
        
        <div className="flex-1 flex flex-col min-w-0 h-full">
          <Topbar />
          <main className="flex-1 overflow-y-auto overflow-x-hidden relative">
            <AnimatePresence mode="wait">
              <motion.div 
                key={location.pathname} 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="h-full"
              >
                {isLoading ? <LoadingSkeleton /> : (
                  <Routes location={location}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/inbox" element={<Inbox />} />
                    <Route path="/escalations" element={<Escalations />} />
                    <Route path="/knowledge-base" element={<KnowledgeBase />} />
                    <Route path="/onboarding" element={<Onboarding />} />
                    <Route path="/channels" element={<Channels />} />
                    <Route path="/analytics" element={<Analytics />} />
                    <Route path="/payment-success" element={<PaymentSuccess />} />
                    <Route path="/billing" element={<Billing />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                  </Routes>
                )}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
        <OnboardingModal />
      </motion.div>
    </AnimatePresence>
  );
}

const LoadingSkeleton = () => (
  <div className="p-8 space-y-8 animate-pulse">
    <div className="flex justify-between items-center">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-9 w-24" />
        <Skeleton className="h-9 w-24" />
      </div>
    </div>
    
    <div className="grid grid-cols-4 gap-6">
      {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-[90px] w-full" />)}
    </div>
    
    <div className="grid grid-cols-3 gap-8">
      <Skeleton className="col-span-2 h-[400px] w-full" />
      <div className="space-y-6">
        <Skeleton className="h-[180px] w-full" />
        <Skeleton className="h-[200px] w-full" />
      </div>
    </div>
  </div>
);
