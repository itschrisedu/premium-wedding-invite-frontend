import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Heart } from 'lucide-react';
import { weddingConfigService } from '../services/weddingConfigService';

interface LoaderScreenProps {
  onComplete: () => void;
}

export const LoaderScreen: React.FC<LoaderScreenProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [isReady, setIsReady] = useState(false);
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
        return prev + 4;
      });
    }, 25);

    return () => clearInterval(interval);
  }, []);

  const groomInit = (config.hero.groom || 'Mateo').trim().charAt(0).toUpperCase();
  const brideInit = (config.hero.bride || 'Camila').trim().charAt(0).toUpperCase();

  return (
    <AnimatePresence>
      <motion.div
        id="loader-screen"
        initial={{ opacity: 1 }}
        exit={{ opacity: 0, scale: 1.04 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[var(--color-bg-base)] text-[var(--color-text-primary)] overflow-hidden p-4"
      >
        {/* Ambient background blur elements */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-[var(--color-gold)]/15 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[var(--color-gold-light)]/10 rounded-full blur-[140px] pointer-events-none" />

        {/* ELEGANT WEDDING INVITATION CARD / ENVELOPE CONTAINER */}
        <motion.div
          initial={{ scale: 0.92, opacity: 0, y: 25 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="relative z-10 w-full max-w-lg p-8 sm:p-14 rounded-3xl bg-[var(--color-bg-elevated)] border-2 border-[var(--color-gold)]/30 shadow-[0_20px_60px_rgba(42,56,40,0.12)] flex flex-col items-center text-center overflow-hidden"
        >
          {/* Decorative Envelope Flap Accent Lines */}
          <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-[var(--color-gold)]/10 to-transparent pointer-events-none" />
          <div className="absolute top-2 left-4 right-4 h-[1px] bg-[var(--color-gold)]/20 pointer-events-none" />
          <div className="absolute bottom-2 left-4 right-4 h-[1px] bg-[var(--color-gold)]/20 pointer-events-none" />

          {/* Monogram Badge (Matching Screenshot Circle) */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="relative mb-6 p-6 rounded-full bg-white border border-[var(--color-gold)] shadow-md flex items-center justify-center w-28 h-28 shrink-0"
          >
            <span className="font-cinzel text-2xl font-bold text-[var(--color-text-primary)] tracking-wider">
              {groomInit}<span className="text-[var(--color-accent)] font-serif italic text-xl mx-0.5">&</span>{brideInit}
            </span>
            <div className="absolute inset-0 rounded-full border border-[var(--color-gold)] animate-ping opacity-25 pointer-events-none" />
          </motion.div>

          {/* Names */}
          <motion.h1
            initial={{ y: 15, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="font-cinzel font-bold text-3xl sm:text-4xl tracking-tight text-[var(--color-text-primary)] mb-2 uppercase"
          >
            {config.loaderText || `${config.hero.groom} & ${config.hero.bride}`}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.85 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="text-[11px] font-mono uppercase tracking-[0.35em] text-[var(--color-text-muted)] mb-8 font-bold"
          >
            {config.hero.city} • {config.hero.dateFormatted}
          </motion.p>

          {/* Progress Bar & Counter or Enter Button */}
          {!isReady ? (
            <div className="w-full space-y-3 px-2">
              <div className="h-1.5 w-full bg-black/10 rounded-full overflow-hidden p-0.5 border border-black/10">
                <motion.div
                  className="h-full bg-gradient-to-r from-[var(--color-accent)] via-[var(--color-gold)] to-[var(--color-gold-light)] rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] font-mono text-[var(--color-text-muted)] font-semibold tracking-wider">
                <span>{config.loaderSubtitle || 'Cargando experiencia...'}</span>
                <span>{progress}%</span>
              </div>
            </div>
          ) : (
            <motion.div
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="space-y-4 w-full flex flex-col items-center"
            >
              <button
                onClick={onComplete}
                id="btn-enter-experience"
                className="group relative inline-flex items-center justify-center gap-3 px-8 sm:px-10 py-4 sm:py-4.5 rounded-full bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white font-bold text-xs tracking-[0.2em] uppercase shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer w-full sm:w-auto"
              >
                <Sparkles className="w-4 h-4 text-white animate-spin" style={{ animationDuration: '4s' }} />
                <span>Entrar a la Experiencia</span>
                <Heart className="w-4 h-4 text-white fill-white group-hover:scale-125 transition-transform" />
              </button>

              <p className="text-[11px] text-[var(--color-text-muted)] italic font-serif">
                Haz clic para activar el audio y la inmersión completa
              </p>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
