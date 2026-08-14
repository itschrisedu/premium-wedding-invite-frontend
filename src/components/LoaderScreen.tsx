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
        return prev + 3;
      });
    }, 25);

    return () => clearInterval(interval);
  }, []);

  return (
    <AnimatePresence>
      <motion.div
        id="loader-screen"
        initial={{ opacity: 1 }}
        exit={{ opacity: 0, scale: 1.05 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[var(--color-bg-base)] text-[var(--color-text-primary)] overflow-hidden"
      >
        {/* Ambient background blur elements */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-[var(--color-gold)]/15 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[var(--color-gold-light)]/10 rounded-full blur-[140px] pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center max-w-md px-6 text-center">
          {/* Monogram Badge */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1 }}
            className="relative mb-8 p-6 rounded-full bg-[var(--color-bg-elevated)] border border-[var(--color-gold)] shadow-2xl flex items-center justify-center w-28 h-28"
          >
            <span className="font-cinzel text-2xl font-bold text-[var(--color-gold-dark)] tracking-wider">
              {config.hero.groom.charAt(0)}<span className="text-[var(--color-accent)] font-serif italic text-xl mx-0.5">&</span>{config.hero.bride.charAt(0)}
            </span>
            <div className="absolute inset-0 rounded-full border border-[var(--color-gold)] animate-ping opacity-20 pointer-events-none" />
          </motion.div>

          {/* Names */}
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="font-bold text-3xl md:text-4xl tracking-tight text-[var(--color-text-primary)] mb-2 uppercase"
          >
            {config.loaderText || `${config.hero.groom} & ${config.hero.bride}`}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.8 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-[11px] font-mono uppercase tracking-[0.35em] text-[var(--color-text-muted)] mb-10 font-bold"
          >
            {config.hero.city} • {config.hero.dateFormatted}
          </motion.p>

          {/* Progress Bar & Counter */}
          {!isReady ? (
            <div className="w-full space-y-3">
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
              transition={{ duration: 0.6 }}
              className="space-y-4"
            >
              <button
                onClick={onComplete}
                id="btn-enter-experience"
                className="group relative inline-flex items-center gap-3 px-10 py-5 rounded-full bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white font-bold text-xs tracking-[0.2em] uppercase shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
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
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
