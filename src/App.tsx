import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import Index from "./pages/Index";
import Game from "./pages/Game";
import Dashboard from "./pages/Dashboard";
import UnknownWords from "./pages/UnknownWords";
import Settings from "./pages/Settings";
import WordManager from "./pages/WordManager";
import NotFound from "./pages/NotFound";

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
          <Route path="/game" element={<Game />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/unknown-words" element={<UnknownWords />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/word-manager" element={<WordManager />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AnimatedRoutes />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
