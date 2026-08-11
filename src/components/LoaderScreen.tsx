import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Heart } from 'lucide-react';

interface LoaderScreenProps {
  onComplete: () => void;
}

export const LoaderScreen: React.FC<LoaderScreenProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsReady(true);
          return 100;
        }
        return prev + 2;
      });
    }, 30);

    return () => clearInterval(interval);
  }, []);

  return (
    <AnimatePresence>
      <motion.div
        id="loader-screen"
        initial={{ opacity: 1 }}
        exit={{ opacity: 0, scale: 1.05 }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0a0908] text-[#ece8e1] overflow-hidden"
      >
        {/* Ambient background blur elements */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-amber-600/15 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-amber-400/10 rounded-full blur-[140px] pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center max-w-md px-6 text-center">
          {/* Monogram Badge */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1 }}
            className="relative mb-8 p-6 rounded-full liquid-glass border border-amber-300/30 shadow-2xl flex items-center justify-center w-28 h-28"
          >
            <span className="font-cinzel text-3xl font-light text-amber-100 tracking-wider">
              M<span className="text-amber-400 font-serif italic text-2xl mx-0.5">&</span>C
            </span>
            <div className="absolute inset-0 rounded-full border border-amber-400/20 animate-ping opacity-20 pointer-events-none" />
          </motion.div>

          {/* Names */}
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="font-bold text-3xl md:text-4xl tracking-tight text-white mb-2 uppercase"
          >
            MATEO <span className="font-serif italic font-normal text-orange-400">&</span> CAMILA
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.8 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-[10px] font-mono uppercase tracking-[0.4em] text-orange-200/80 mb-10 font-bold"
          >
            Ambato, Ecuador • 2026
          </motion.p>

          {/* Progress Bar & Counter */}
          {!isReady ? (
            <div className="w-full space-y-3">
              <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden p-0.5 border border-white/10">
                <motion.div
                  className="h-full bg-gradient-to-r from-orange-500 via-amber-300 to-white rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] font-mono text-orange-200/80 tracking-wider">
                <span>Cargando experiencia...</span>
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
                className="group relative inline-flex items-center gap-3 px-10 py-5 rounded-full bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs tracking-[0.2em] uppercase shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-white animate-spin" style={{ animationDuration: '4s' }} />
                <span>Entrar a la Experiencia</span>
                <Heart className="w-4 h-4 text-white fill-white group-hover:scale-125 transition-transform" />
              </button>
              <p className="text-[11px] text-white/60 italic font-serif">
                Haz clic para activar el audio y la inmersión completa
              </p>
            </motion.div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
