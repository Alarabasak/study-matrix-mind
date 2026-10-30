import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { useAuth } from "@/contexts/auth-context";
import { toast } from '@/hooks/use-toast';

const LOCKER_COLORS = ['#d4c5a0', '#c9bb94', '#d0c19e', '#c5b790'];

const LockerLanding: React.FC = () => {
  const { signIn, signUp } = useAuth();
  const [phase, setPhase] = useState<'intro' | 'lockers' | 'walking' | 'zoomed'>('intro');
  const [selectedLocker, setSelectedLocker] = useState<number | null>(null);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneControls = useAnimation();

  const handleScreenClick = () => {
    if (phase === 'intro') setPhase('lockers');
  };

  const handleLockerClick = async () => {
    if (phase !== 'lockers') return;
    setSelectedLocker(0);
    setPhase('walking');

    // Human walking keyframes — organic sway + progressive zoom
    await sceneControls.start({
      scale: [1, 1.15, 1.3, 1.5, 1.8, 2.2, 2.8, 3.5],
      x: ['0%', '0.3%', '-0.5%', '-2%', '-5%', '-8%', '-12%', '-15%'],
      y: ['0%', '-0.3%', '0.5%', '-1%', '-3%', '-5%', '-8%', '-10%'],
      rotate: [0, 0.3, -0.5, 0.4, -0.3, 0.2, -0.15, 0],
      transition: {
        duration: 2.5,
        ease: 'easeInOut',
        times: [0, 0.1, 0.2, 0.35, 0.5, 0.65, 0.82, 1],
      },
    });

    setPhase('zoomed');
  };

  // Start subtle idle sway when in lockers phase
  useEffect(() => {
    if (phase === 'lockers') {
      sceneControls.start({
        scale: 1,
        x: '0%',
        y: '0%',
        rotate: 0,
        transition: { duration: 0.5 },
      });
    }
  }, [phase, sceneControls]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (authMode === 'signup') {
        const { error } = await signUp(email, password, displayName);
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
            <div
              className="absolute inset-0 pointer-events-none z-10"
              style={{
                backgroundImage: 'repeating-linear-gradient(transparent, transparent 2px, rgba(0,0,0,0.15) 2px, rgba(0,0,0,0.15) 4px)',
              }}
            />
            <motion.div
              className="absolute top-6 right-6 font-mono text-xs z-20"
              style={{ color: '#ff4040', fontFamily: 'monospace', textShadow: '0 0 8px #ff4040' }}
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              ● REC &nbsp; 2005.09.01
            </motion.div>
            <div
              className="absolute inset-0 pointer-events-none z-10 mix-blend-overlay"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.4'/%3E%3C/svg%3E")`,
                opacity: 0.15,
              }}
            />
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
              style={{ color: '#a0a0b0', fontFamily: 'var(--font-heading)', letterSpacing: '0.2em' }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
            >
              STUDY EDITION • 2025
            </motion.p>
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
            <div
              className="absolute inset-0 pointer-events-none z-5"
              style={{ background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.7) 100%)' }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ PHASE 2+: Locker scene ═══ */}
      <AnimatePresence>
        {(phase === 'lockers' || phase === 'walking' || phase === 'zoomed') && (
          <motion.div
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            {/* Football field background — also zooms with the scene */}
            <motion.div
              className="absolute inset-0"
              animate={sceneControls}
              style={{ transformOrigin: '68% 60%' }}
            >
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: 'url(/images/football-field-bg.jpg)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              />
              <div
                className="absolute inset-0"
                style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.15) 100%)' }}
              />
            </motion.div>

            {/* Sun lens flare */}
            <motion.div
              className="absolute top-0 left-0 w-60 h-60 pointer-events-none z-10"
              style={{ background: 'radial-gradient(ellipse at 30% 20%, rgba(255,250,200,0.3) 0%, transparent 70%)' }}
              animate={{ opacity: [0.7, 1, 0.8] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
            />

            {/* Locker unit image — zooms with the same origin */}
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              animate={sceneControls}
              style={{ transformOrigin: '68% 60%' }}
            >
              <img
                src="/images/locker-unit-field.png"
                alt="School lockers on football field"
                className="max-h-[75vh] w-auto object-contain cursor-pointer"
                style={{ filter: 'drop-shadow(0 10px 30px rgba(0,0,0,0.4))' }}
                onClick={handleLockerClick}
              />
            </motion.div>

            {/* Walking camera shake overlay — visible during walk */}
            {phase === 'walking' && (
              <motion.div
                className="absolute inset-0 pointer-events-none z-20"
                animate={{
                  opacity: [0, 0.08, 0, 0.05, 0, 0.1, 0.05, 0],
                }}
                transition={{ duration: 2.5, ease: 'linear' }}
                style={{ background: 'black' }}
              />
            )}

            {/* Footstep bob overlay — subtle vertical black bars like peripheral vision */}
            {phase === 'walking' && (
              <motion.div
                className="absolute inset-0 pointer-events-none z-20"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.3, 0.5, 0.7, 0.85] }}
                transition={{ duration: 2.5, ease: 'easeIn' }}
                style={{
                  background: 'radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.8) 100%)',
                }}
              />
            )}

            {/* Title overlay */}
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
                <motion.div
                  className="mt-6 text-white text-sm"
                  style={{ fontFamily: 'var(--font-display)', textShadow: '0 2px 8px rgba(0,0,0,0.6)' }}
                  animate={{ y: [0, 8, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  👆 Dolaba dokun
                </motion.div>
              </motion.div>
            )}

            {/* ═══ Auth form (after walk) ═══ */}
            <AnimatePresence>
              {phase === 'zoomed' && (
                <motion.div
                  className="absolute inset-0 flex items-center justify-center z-30"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  {/* Backdrop */}
                  <div
                    className="absolute inset-0"
                    style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)' }}
                    onClick={() => {
                      setPhase('lockers');
                      setSelectedLocker(null);
                      sceneControls.start({
                        scale: 1, x: '0%', y: '0%', rotate: 0,
                        transition: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] },
                      });
                    }}
                  />

                  {/* Triple-frame auth card */}
                  <motion.div
                    className="relative w-[340px] sm:w-[380px]"
                    initial={{ scale: 0.8, opacity: 0, y: 30 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.8, opacity: 0, y: 30 }}
                    transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
                    onClick={(e) => e.stopPropagation()}
                    style={{ overflow: 'visible' }}
                  >
                    {/* 3D Popcorn charm — overflows frame */}
                    <motion.img
                      src="/images/popcorn-3d.png"
                      alt="Popcorn"
                      className="absolute z-30 w-40 h-40 object-contain drop-shadow-xl pointer-events-none"
                      style={{ top: '-60px', right: '-30px', transform: 'rotate(12deg)' }}
                      animate={{ y: [0, -4, 0], rotate: [12, 8, 12] }}
                      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                    />
                    {/* Frame 1 — Outer: Harlequin diamond pattern */}
                    <div
                      className="p-[18px] relative overflow-hidden"
                      style={{
                        background: '#f4a6c0',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
                      }}
                    >
                      {/* Diamond pattern via CSS — uniform on all sides */}
                      <div
                        className="absolute inset-0"
                        style={{
                          backgroundImage: `
                            linear-gradient(45deg, #c41e3a 25%, transparent 25%),
                            linear-gradient(-45deg, #c41e3a 25%, transparent 25%),
                            linear-gradient(45deg, transparent 75%, #c41e3a 75%),
                            linear-gradient(-45deg, transparent 75%, #c41e3a 75%)
                          `,
                          backgroundSize: '28px 28px',
                          backgroundPosition: '0 0, 0 14px, 14px -14px, -14px 0px',
                        }}
                      />
                      <div className="relative z-10">
                      {/* Frame 2 — Middle: Cream with gold stars */}
                      <div
                        className="p-[14px] relative overflow-hidden"
                        style={{
                          background: '#f5edd6',
                          boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.08)',
                        }}
                      >
                        {/* 5-pointed star pattern via SVG */}
                        <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
                          <defs>
                            <pattern id="starPattern" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse">
                              <path
                                d="M16 4 l3.5 7.5 8 1 -6 5.5 1.5 8 -7-4 -7 4 1.5-8 -6-5.5 8-1z"
                                fill="#8b6520"
                                opacity="0.45"
                              />
                            </pattern>
                          </defs>
                          <rect width="100%" height="100%" fill="url(#starPattern)" />
                        </svg>

                        {/* Frame 3 — Inner: Solid pink */}
                        <div
                          className="relative p-5 sm:p-6"
                          style={{
                            background: '#f0b4cc',
                            boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.08)',
                          }}
                        >
                          {/* Name plate */}
                          <div
                            className="mx-auto mb-4 px-4 py-2 rounded-sm text-center"
                            style={{
                              background: 'rgba(255,255,255,0.7)',
                              boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.08)',
                              border: '1px solid rgba(0,0,0,0.06)',
                            }}
                          >
                            <span className="text-lg font-bold" style={{ fontFamily: 'var(--font-display)', color: '#6b3a4a' }}>
                              {authMode === 'signup' ? (displayName || 'İsmini Yaz ✍️') : 'Giriş Yap 🔑'}
                            </span>
                          </div>

                          {/* Mode toggle */}
                          <div className="flex gap-1 mb-4 p-1 rounded-lg" style={{ background: 'rgba(255,255,255,0.35)' }}>
                            <button
                              className="flex-1 py-1.5 rounded-md text-xs font-bold transition-all"
                              style={{
                                fontFamily: 'var(--font-heading)',
                                background: authMode === 'signup' ? 'rgba(255,255,255,0.8)' : 'transparent',
                                color: authMode === 'signup' ? '#6b3a4a' : '#996b7c',
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
                                background: authMode === 'signin' ? 'rgba(255,255,255,0.8)' : 'transparent',
                                color: authMode === 'signin' ? '#6b3a4a' : '#996b7c',
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
                                  background: 'rgba(255,255,255,0.8)',
                                  border: '1px solid rgba(107,58,74,0.15)',
                                  fontFamily: 'var(--font-display)',
                                  fontSize: '16px',
                                  color: '#4a2535',
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
                                background: 'rgba(255,255,255,0.8)',
                                border: '1px solid rgba(107,58,74,0.15)',
                                fontFamily: 'var(--font-body)',
                                color: '#4a2535',
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
                                background: 'rgba(255,255,255,0.8)',
                                border: '1px solid rgba(107,58,74,0.15)',
                                fontFamily: 'var(--font-body)',
                                color: '#4a2535',
                              }}
                            />
                            <motion.button
                              type="submit"
                              disabled={loading}
                              className="w-full py-3 rounded-lg text-sm font-bold tracking-wider uppercase disabled:opacity-50"
                              style={{
                                fontFamily: 'var(--font-heading)',
                                background: 'linear-gradient(135deg, #c41e3a, #8b1a2e)',
                                color: '#fff',
                                boxShadow: '0 4px 16px rgba(196,30,58,0.3)',
                                border: 'none',
                              }}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.97 }}
                            >
                              {loading ? '...' : authMode === 'signup' ? '✨ Dolabımı Al' : '🚪 Giriş Yap'}
                            </motion.button>
                          </form>
                        </div>
                      </div>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Back button */}
            {phase === 'zoomed' && (
              <motion.button
                className="absolute top-6 left-6 z-40 px-3 py-1.5 rounded-lg text-xs font-bold"
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  color: '#aaa',
                  fontFamily: 'var(--font-heading)',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
                onClick={() => {
                  setPhase('lockers');
                  setSelectedLocker(null);
                  sceneControls.start({
                    scale: 1, x: '0%', y: '0%', rotate: 0,
                    transition: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] },
                  });
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
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
