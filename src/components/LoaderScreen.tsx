import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Sparkles, Heart } from 'lucide-react';
import { weddingConfigService } from '../services/weddingConfigService';

interface LoaderScreenProps {
  onComplete: () => void;
}

export const LoaderScreen: React.FC<LoaderScreenProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [isOpening, setIsOpening] = useState(false);
  const [config, setConfig] = useState(weddingConfigService.getConfig());

  useEffect(() => {
    const unsub = weddingConfigService.subscribe(() => {
      setConfig(weddingConfigService.getConfig());
    });
    return unsub;
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsReady(true);
          return 100;
        }
        return prev + 5;
      });
    }, 25);

    return () => clearInterval(interval);
  }, []);

  const groomInit = (config.hero.groom || 'Mateo').trim().charAt(0).toUpperCase();
  const brideInit = (config.hero.bride || 'Camila').trim().charAt(0).toUpperCase();

  const handleOpenEnvelope = () => {
    if (isOpening) return;
    setIsOpening(true);

    // After 1.1s flap opening and letter slide animation, trigger site complete
    setTimeout(() => {
      onComplete();
    }, 1100);
  };

  return (
    <AnimatePresence>
      <motion.div
        id="loader-screen"
        initial={{ opacity: 1 }}
        exit={{ opacity: 0, scale: 1.05 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[var(--color-bg-base)] text-[var(--color-text-primary)] overflow-hidden p-4 select-none"
      >
        {/* Ambient background blur elements */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-[var(--color-gold)]/15 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[var(--color-gold-light)]/10 rounded-full blur-[140px] pointer-events-none" />

        {/* 3D WEDDING ENVELOPE WRAPPER */}
        <div className="relative w-full max-w-2xl sm:max-w-3xl perspective-[1200px] z-10 flex flex-col items-center px-2">
          {/* ENVELOPE BODY */}
          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 25 }}
            animate={{
              scale: isOpening ? 1.05 : 1,
              opacity: 1,
              y: isOpening ? -30 : 0
            }}
            transition={{ duration: 0.8, ease: 'easeInOut' }}
            className="relative w-full min-h-[380px] sm:min-h-[420px] rounded-3xl bg-[#FAFCF9] border-2 border-[var(--color-gold)]/40 shadow-[0_30px_70px_rgba(42,56,40,0.18)] flex flex-col items-center justify-center p-6 sm:p-12 text-center overflow-hidden"
          >
            {/* Horizontal Twine / Ribbon Cord Effect */}
            <div className="absolute top-[42%] left-0 right-0 h-[3px] bg-gradient-to-r from-[#556B2F]/30 via-[#6B7F5A]/60 to-[#556B2F]/30 z-10 pointer-events-none shadow-sm" />
            <div className="absolute top-[42%] left-0 right-0 h-[1px] -mt-[4px] bg-gradient-to-r from-amber-700/20 via-amber-800/40 to-amber-700/20 z-10 pointer-events-none" />

            {/* TOP TRIANGULAR ENVELOPE FLAP WITH 3D ROTATION */}
            <motion.div
              animate={{
                rotateX: isOpening ? 180 : 0,
                zIndex: isOpening ? 0 : 30
              }}
              transition={{ duration: 0.8, ease: 'easeInOut' }}
              className="absolute top-0 left-0 right-0 h-36 sm:h-44 origin-top z-30 pointer-events-none"
              style={{ transformStyle: 'preserve-3d' }}
            >
              <svg viewBox="0 0 100 45" preserveAspectRatio="none" className="w-full h-full filter drop-shadow-md">
                <polygon points="0,0 50,44 100,0" fill="#ECF0EA" stroke="#B1C2A5" strokeWidth="0.7" />
              </svg>
            </motion.div>

            {/* WAX SEAL STAMP IN THE CENTER */}
            <motion.div
              animate={{
                scale: isOpening ? [1, 1.2, 0] : 1,
                opacity: isOpening ? 0 : 1,
                rotate: isOpening ? 25 : 0
              }}
              transition={{ duration: 0.5 }}
              onClick={isReady ? handleOpenEnvelope : undefined}
              className={`absolute top-[42%] -translate-y-1/2 z-40 w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-[#8A9D76] via-[#6B7F5A] to-[#4D5E3F] border-2 border-[#EAF0E6] shadow-2xl flex items-center justify-center text-white cursor-pointer transition-transform ${
                isReady ? 'hover:scale-110 active:scale-95 animate-pulse' : ''
              }`}
              title="Sello de Lacre Nupcial"
            >
              {/* Seal Inner Ring & Monogram */}
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border border-white/40 flex flex-col items-center justify-center bg-black/10 shadow-inner">
                <span className="font-cinzel text-base sm:text-lg font-bold tracking-wider text-white">
                  {groomInit}<span className="font-serif italic text-xs mx-0.5 text-emerald-200">&</span>{brideInit}
                </span>
                <span className="text-[7px] font-mono uppercase tracking-widest text-emerald-100 opacity-90">BODA</span>
              </div>
            </motion.div>

            {/* INVITATION LETTER SLIDING OUT (CARD CONTENT) */}
            <motion.div
              animate={{
                y: isOpening ? -60 : 0,
                scale: isOpening ? 1.04 : 1
              }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="relative z-20 flex flex-col items-center w-full pt-12 sm:pt-14"
            >
              {/* Names */}
              <h1 className="font-cinzel font-bold text-2xl sm:text-4xl tracking-tight text-[var(--color-text-primary)] mb-1.5 uppercase">
                {config.loaderText || `${config.hero.groom} & ${config.hero.bride}`}
              </h1>

              <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-[var(--color-text-muted)] mb-6 font-bold">
                {config.hero.city} • {config.hero.dateFormatted}
              </p>

              {/* Progress Bar or Action Button */}
              {!isReady ? (
                <div className="w-full space-y-2 max-w-xs px-2">
                  <div className="h-1.5 w-full bg-black/10 rounded-full overflow-hidden p-0.5 border border-black/10">
                    <motion.div
                      className="h-full bg-gradient-to-r from-[var(--color-accent)] via-[var(--color-gold)] to-[var(--color-gold-light)] rounded-full"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-mono text-[var(--color-text-muted)] font-semibold tracking-wider">
                    <span>{config.loaderSubtitle || 'Cargando invitación...'}</span>
                    <span>{progress}%</span>
                  </div>
                </div>
              ) : (
                <motion.div
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="space-y-3 w-full flex flex-col items-center pt-2"
                >
                  <button
                    onClick={handleOpenEnvelope}
                    disabled={isOpening}
                    id="btn-enter-experience"
                    className="group relative inline-flex items-center justify-center gap-3 px-8 sm:px-10 py-3.5 sm:py-4 rounded-full bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white font-bold text-xs tracking-[0.2em] uppercase shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer w-full sm:w-auto"
                  >
                    <Mail className="w-4 h-4 text-white group-hover:rotate-12 transition-transform" />
                    <span>{isOpening ? 'Abriendo Invitación...' : 'Ver Invitación'}</span>
                    <Sparkles className="w-3.5 h-3.5 text-white/80" />
                  </button>

                  <p className="text-[10px] text-[var(--color-text-muted)] italic font-serif">
                    Haz clic para abrir el sobre y comenzar la música
                  </p>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
