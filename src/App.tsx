import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { AuthProvider } from "@/contexts/AuthContext";
import { useAuth } from "@/contexts/auth-context";
import Index from "./pages/Index";
import Game from "./pages/Game";
import PackDetail from "./pages/PackDetail";
import Dashboard from "./pages/Dashboard";
import UnknownWords from "./pages/UnknownWords";
import Settings from "./pages/Settings";
import WordManager from "./pages/WordManager";
import AdminLogin from "./pages/AdminLogin";
import NotFound from "./pages/NotFound";
import Diagnostics from "./pages/Diagnostics";
import Scene3DBackground from "./components/3d/Scene3DBackground";
import LockerLanding from "./pages/LockerLanding";
import LockerReveal from "./pages/LockerReveal";

const queryClient = new QueryClient();

const pageFlip = {
  initial: { rotateY: -90, opacity: 0, transformOrigin: 'left center' as const },
  animate: { rotateY: 0, opacity: 1, transformOrigin: 'left center' as const, transition: { duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] } },
  exit: { rotateY: 90, opacity: 0, transformOrigin: 'right center' as const, transition: { duration: 0.3, ease: [0.55, 0.06, 0.68, 0.19] as [number, number, number, number] } },
};

const AnimatedRoutes = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.div key={location.pathname} variants={pageFlip} initial="initial" animate="animate" exit="exit" style={{ perspective: 1200, minHeight: '100vh' }}>
        <Routes location={location}>
          <Route path="/" element={<Index />} />
          <Route path="/pack" element={<PackDetail />} />
          <Route path="/game" element={<Game />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/unknown-words" element={<UnknownWords />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/word-manager" element={<WordManager />} />
          <Route path="/diagnostics" element={<Diagnostics />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
};

const AuthGate = () => {
  const { user, isLoading } = useAuth();
  const [showLockerReveal, setShowLockerReveal] = useState(true);

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center" style={{ background: '#0a0a0f' }}>
        <motion.div
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          style={{ fontFamily: 'var(--font-display)', color: '#ff9ed8', fontSize: '2rem' }}
        >
          CrossPrep
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return <LockerLanding />;
  }

  // Show locker reveal transition after login
  if (showLockerReveal) {
    const displayName = user.user_metadata?.display_name || '';
    return (
      <LockerReveal
        displayName={displayName}
        onComplete={() => setShowLockerReveal(false)}
      />
    );
  }

  return (
    <>
      <Scene3DBackground />
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AnimatedRoutes />
      </BrowserRouter>
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <AuthGate />
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
