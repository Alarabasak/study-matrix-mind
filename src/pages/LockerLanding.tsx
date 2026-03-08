import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

/* ── Locker config ── */
const LOCKER_COLORS = [
  '#d4c5a0', '#c9bb94', '#d0c19e', '#c5b790',
];

const LockerLanding: React.FC = () => {
  const { signIn, signUp } = useAuth();
  const [phase, setPhase] = useState<'intro' | 'lockers' | 'zoomed'>('intro');
  const [selectedLocker, setSelectedLocker] = useState<number | null>(null);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleScreenClick = () => {
    if (phase === 'intro') setPhase('lockers');
  };

  const handleLockerClick = (index: number) => {
    setSelectedLocker(index);
    setPhase('zoomed');
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (authMode === 'signup') {
        const { error } = await signUp(email, password);
        if (error) { toast({ title: 'Hata', description: error.message, variant: 'destructive' }); return; }
        toast({ title: '✅ Kayıt başarılı!', description: 'E-posta adresinizi doğrulayın.' });
      } else {
        const { error } = await signIn(email, password);
        if (error) { toast({ title: 'Hata', description: error.message, variant: 'destructive' }); return; }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 overflow-hidden cursor-pointer"
      onClick={phase === 'intro' ? handleScreenClick : undefined}
      style={{ background: '#0a0a0f' }}
    >
      {/* ═══ PHASE 1: Movie intro ═══ */}
      <AnimatePresence>
        {phase === 'intro' && (
          <motion.div
            className="absolute inset-0 flex flex-col items-center justify-center"
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 0.8 }}
          >
            {/* Scanlines overlay */}
            <div
              className="absolute inset-0 pointer-events-none z-10"
              style={{
                backgroundImage: 'repeating-linear-gradient(transparent, transparent 2px, rgba(0,0,0,0.15) 2px, rgba(0,0,0,0.15) 4px)',
              }}
            />
            {/* VHS date */}
            <motion.div
              className="absolute top-6 right-6 font-mono text-xs z-20"
              style={{ color: '#ff4040', fontFamily: 'monospace', textShadow: '0 0 8px #ff4040' }}
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              ● REC &nbsp; 2005.09.01
            </motion.div>

            {/* Film grain */}
            <div
              className="absolute inset-0 pointer-events-none z-10 mix-blend-overlay"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.4'/%3E%3C/svg%3E")`,
                opacity: 0.15,
              }}
            />

            {/* Title */}
            <motion.h1
              className="text-7xl sm:text-9xl font-bold z-20 tracking-tight"
              style={{
                fontFamily: 'var(--font-display)',
                background: 'linear-gradient(135deg, #ff9ed8, #ff6bb5, #c084fc)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: 'none',
                filter: 'drop-shadow(0 0 30px rgba(255,158,216,0.4))',
              }}
              initial={{ opacity: 0, scale: 0.5, rotateX: 40 }}
              animate={{ opacity: 1, scale: 1, rotateX: 0 }}
              transition={{ duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              CrossPrep
            </motion.h1>

            <motion.p
              className="text-lg sm:text-xl mt-4 z-20"
              style={{
                color: '#a0a0b0',
                fontFamily: 'var(--font-heading)',
                letterSpacing: '0.2em',
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
            >
              STUDY EDITION • 2025
            </motion.p>

            {/* Click prompt */}
            <motion.div
              className="absolute bottom-12 z-20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
            >
              <motion.p
                className="text-sm tracking-widest uppercase"
                style={{ color: '#666', fontFamily: 'var(--font-heading)' }}
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                Ekrana dokun
              </motion.p>
            </motion.div>

            {/* Vignette */}
            <div
              className="absolute inset-0 pointer-events-none z-5"
              style={{
                background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.7) 100%)',
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ PHASE 2: Locker room ═══ */}
      <AnimatePresence>
        {(phase === 'lockers' || phase === 'zoomed') && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            style={{ perspective: '1200px' }}
          >
            {/* Football field background */}
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: 'url(/images/football-field-bg.jpg)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            />
            {/* Subtle overlay for contrast */}
            <div
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(180deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.2) 100%)',
              }}
            />

            {/* Sun lens flare */}
            <motion.div
              className="absolute top-0 left-0 w-60 h-60 pointer-events-none"
              style={{
                background: 'radial-gradient(ellipse at 30% 20%, rgba(255,250,200,0.3) 0%, transparent 70%)',
              }}
              animate={{ opacity: [0.7, 1, 0.8] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
            />

            {/* Main locker unit image */}
            <motion.div
              className="relative z-10"
              initial={{ opacity: 0, scale: 0.8, y: 40 }}
              animate={phase === 'zoomed' ? {
                opacity: 1,
                scale: 3.5,
                x: '-35%',
                y: '-15%',
              } : {
                opacity: 1,
                scale: 1,
                x: 0,
                y: 0,
              }}
              transition={{ duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <img
                src="/images/locker-unit-field.png"
                alt="School lockers on football field"
                className="max-h-[70vh] w-auto object-contain"
                style={{
                  filter: 'drop-shadow(0 10px 30px rgba(0,0,0,0.4))',
                }}
              />

              {/* Clickable closed locker overlay — positioned over bottom-right locker */}
              {phase === 'lockers' && (
                <motion.div
                  className="absolute cursor-pointer z-20"
                  style={{
                    right: '0%',
                    bottom: '8%',
                    width: '18%',
                    height: '44%',
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLockerClick(0);
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <motion.div
                    className="absolute inset-0 rounded-sm pointer-events-none"
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                    style={{
                      boxShadow: '0 0 25px rgba(255,200,100,0.6), inset 0 0 15px rgba(255,200,100,0.2)',
                      border: '2px solid rgba(255,200,100,0.4)',
                    }}
                  />
                </motion.div>
              )}
            </motion.div>

            {/* Title overlay on lockers view */}
            {phase === 'lockers' && (
              <motion.div
                className="absolute top-8 left-0 right-0 text-center z-20"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <h2
                  className="text-2xl sm:text-3xl font-bold tracking-wider uppercase"
                  style={{
                    fontFamily: 'var(--font-heading)',
                    color: '#fff',
                    textShadow: '0 2px 10px rgba(0,0,0,0.7), 0 0 20px rgba(0,0,0,0.4)',
                  }}
                >
                  Dolabını Seç
                </h2>
                <p
                  className="text-xs mt-1 tracking-widest"
                  style={{ color: 'rgba(255,255,255,0.7)', fontFamily: 'var(--font-body)', textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}
                >
                  PICK YOUR LOCKER
                </p>

                {/* Arrow pointing to the closed locker */}
                <motion.div
                  className="absolute bottom-[-80px] right-[10%] sm:right-[20%] text-white text-sm"
                  style={{ fontFamily: 'var(--font-display)', textShadow: '0 2px 8px rgba(0,0,0,0.6)' }}
                  animate={{ y: [0, 8, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  👆 Bu dolap senin!
                </motion.div>
              </motion.div>
            )}

            {/* ═══ PHASE 3: Auth form (zoomed into locker) ═══ */}
            <AnimatePresence>
              {phase === 'zoomed' && (
                <motion.div
                  className="absolute inset-0 flex items-center justify-center z-30"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.0, duration: 0.5 }}
                >
                  {/* Backdrop blur */}
                  <div
                    className="absolute inset-0"
                    style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
                    onClick={() => { setPhase('lockers'); setSelectedLocker(null); }}
                  />

                  {/* Locker door form */}
                  <motion.div
                    className="relative w-[280px] sm:w-[320px] overflow-hidden rounded-lg"
                    initial={{ rotateY: -90, opacity: 0 }}
                    animate={{ rotateY: 0, opacity: 1 }}
                    exit={{ rotateY: 90, opacity: 0 }}
                    transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
                    style={{ perspective: '1000px', transformStyle: 'preserve-3d' }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Closed locker image as background */}
                    <div className="relative">
                      <img
                        src="/images/locker-closed.png"
                        alt="Closed locker"
                        className="absolute inset-0 w-full h-full object-cover rounded-lg opacity-30"
                      />
                    {/* Locker surface */}
                    <div
                      className="relative p-6 sm:p-8"
                      style={{
                        background: `linear-gradient(180deg, ${LOCKER_COLORS[selectedLocker || 0]}ee 0%, #b8a880ee 100%)`,
                        boxShadow: 'inset 0 2px 0 rgba(255,255,255,0.2), inset 0 -4px 8px rgba(0,0,0,0.15), 0 20px 60px rgba(0,0,0,0.5)',
                        border: '2px solid rgba(0,0,0,0.15)',
                      }}
                    >
                      {/* Vents */}
                      <div className="flex flex-col gap-1 mb-4">
                        {[0, 1, 2].map(j => (
                          <div key={j} className="h-[2px] mx-8 rounded-full" style={{ background: 'rgba(0,0,0,0.1)' }} />
                        ))}
                      </div>

                      {/* Name plate area */}
                      <div
                        className="mx-auto mb-5 px-4 py-2 rounded-sm text-center"
                        style={{
                          background: 'rgba(255,255,255,0.6)',
                          boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)',
                          border: '1px solid rgba(0,0,0,0.08)',
                        }}
                      >
                        <span
                          className="text-lg font-bold"
                          style={{
                            fontFamily: 'var(--font-display)',
                            color: '#444',
                          }}
                        >
                          {authMode === 'signup'
                            ? (displayName || 'İsmini Yaz ✍️')
                            : 'Giriş Yap 🔑'}
                        </span>
                      </div>

                      {/* Mode toggle */}
                      <div className="flex gap-1 mb-4 p-1 rounded-lg" style={{ background: 'rgba(0,0,0,0.08)' }}>
                        <button
                          className="flex-1 py-1.5 rounded-md text-xs font-bold transition-all"
                          style={{
                            fontFamily: 'var(--font-heading)',
                            background: authMode === 'signup' ? 'rgba(255,255,255,0.7)' : 'transparent',
                            color: authMode === 'signup' ? '#333' : '#777',
                            boxShadow: authMode === 'signup' ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
                          }}
                          onClick={() => setAuthMode('signup')}
                        >
                          📝 Kayıt Ol
                        </button>
                        <button
                          className="flex-1 py-1.5 rounded-md text-xs font-bold transition-all"
                          style={{
                            fontFamily: 'var(--font-heading)',
                            background: authMode === 'signin' ? 'rgba(255,255,255,0.7)' : 'transparent',
                            color: authMode === 'signin' ? '#333' : '#777',
                            boxShadow: authMode === 'signin' ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
                          }}
                          onClick={() => setAuthMode('signin')}
                        >
                          🔑 Giriş
                        </button>
                      </div>

                      {/* Form */}
                      <form onSubmit={handleAuth} className="space-y-3">
                        {authMode === 'signup' && (
                          <input
                            type="text"
                            placeholder="İsmin (dolap etiketi)"
                            value={displayName}
                            onChange={e => setDisplayName(e.target.value)}
                            className="w-full px-3 py-2.5 rounded-md text-sm outline-none"
                            style={{
                              background: 'rgba(255,255,255,0.75)',
                              border: '1px solid rgba(0,0,0,0.1)',
                              fontFamily: 'var(--font-display)',
                              fontSize: '16px',
                              color: '#333',
                            }}
                          />
                        )}
                        <input
                          type="email"
                          placeholder="E-posta"
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          required
                          className="w-full px-3 py-2.5 rounded-md text-sm outline-none"
                          style={{
                            background: 'rgba(255,255,255,0.75)',
                            border: '1px solid rgba(0,0,0,0.1)',
                            fontFamily: 'var(--font-body)',
                            color: '#333',
                          }}
                        />
                        <input
                          type="password"
                          placeholder="Şifre"
                          value={password}
                          onChange={e => setPassword(e.target.value)}
                          required
                          minLength={6}
                          className="w-full px-3 py-2.5 rounded-md text-sm outline-none"
                          style={{
                            background: 'rgba(255,255,255,0.75)',
                            border: '1px solid rgba(0,0,0,0.1)',
                            fontFamily: 'var(--font-body)',
                            color: '#333',
                          }}
                        />
                        <motion.button
                          type="submit"
                          disabled={loading}
                          className="w-full py-3 rounded-lg text-sm font-bold tracking-wider uppercase disabled:opacity-50"
                          style={{
                            fontFamily: 'var(--font-heading)',
                            background: 'linear-gradient(135deg, #ff9ed8, #c084fc)',
                            color: '#fff',
                            boxShadow: '0 4px 16px rgba(192,132,252,0.3)',
                            border: 'none',
                          }}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.97 }}
                        >
                          {loading ? '...' : authMode === 'signup' ? '✨ Dolabımı Al' : '🚪 Giriş Yap'}
                        </motion.button>
                      </form>

                      {/* Bottom vents */}
                      <div className="flex flex-col gap-1 mt-5">
                        {[0, 1, 2].map(j => (
                          <div key={j} className="h-[2px] mx-8 rounded-full" style={{ background: 'rgba(0,0,0,0.08)' }} />
                        ))}
                      </div>
                    </div>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Back button when zoomed */}
            {phase === 'zoomed' && (
              <motion.button
                className="absolute top-6 left-6 z-40 px-3 py-1.5 rounded-lg text-xs font-bold"
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  color: '#aaa',
                  fontFamily: 'var(--font-heading)',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
                onClick={() => { setPhase('lockers'); setSelectedLocker(null); }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                whileHover={{ background: 'rgba(255,255,255,0.2)' }}
              >
                ← Geri
              </motion.button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scanlines global */}
      <div
        className="absolute inset-0 pointer-events-none z-50"
        style={{
          backgroundImage: 'repeating-linear-gradient(transparent, transparent 3px, rgba(0,0,0,0.05) 3px, rgba(0,0,0,0.05) 4px)',
          mixBlendMode: 'multiply',
        }}
      />
    </div>
  );
};

export default LockerLanding;
