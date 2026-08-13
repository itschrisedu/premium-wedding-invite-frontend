import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { Guest } from '../types';
import { weddingConfigService } from '../services/weddingConfigService';

interface HeroSectionProps {
  currentGuest: Guest | undefined;
  onExploreClick: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ currentGuest, onExploreClick }) => {
  const [heroConfig, setHeroConfig] = useState(weddingConfigService.getConfig().hero);

  useEffect(() => {
    const unsub = weddingConfigService.subscribe(() => {
      setHeroConfig(weddingConfigService.getConfig().hero);
    });
    return unsub;
  }, []);

  return (
    <section id="hero" className="relative min-h-screen flex flex-col justify-between overflow-hidden bg-[var(--color-bg-base)] text-[var(--color-text-primary)] pt-24 pb-12">
      {/* Background Photography with Soft Gradient Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroConfig.coverImage}
          alt={`${heroConfig.groom} & ${heroConfig.bride}`}
          className="w-full h-full object-cover object-center filter contrast-[1.08] opacity-25 transition-transform duration-[20s] hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-bg-base)] via-[var(--color-bg-base)]/80 to-[var(--color-bg-base)]" />
      </div>

      {/* Top Meta Bar */}
      <div className="relative z-20 max-w-7xl mx-auto w-full px-6 flex justify-between items-start pt-4">
        <div className="flex flex-col gap-1">
          <div className="text-[10px] uppercase tracking-[0.4em] font-extrabold text-[var(--color-gold-dark)]">
            {heroConfig.city}
          </div>
          <div className="text-xs tracking-widest font-bold text-[var(--color-text-primary)]">
            {heroConfig.groom.split(' ')[0]} & {heroConfig.bride.split(' ')[0]}
          </div>
        </div>

        {/* Status Pill */}
        <div className="hidden sm:flex items-center gap-3 bg-[var(--color-bg-elevated)] border border-[var(--color-gold)] rounded-full px-4 py-2 shadow-md">
          <div className="w-2 h-2 rounded-full bg-[var(--color-accent)] animate-pulse" />
          <span className="text-[10px] uppercase tracking-wider font-bold text-[var(--color-text-primary)]">
            {heroConfig.dateFormatted}
          </span>
        </div>
      </div>

      {/* Center Statement Typography */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 text-center my-auto py-8">
        {/* Personalized Guest Badge */}
        {currentGuest && (
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="mb-8 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[var(--color-bg-elevated)] border border-[var(--color-gold)] text-[var(--color-gold-dark)] shadow-xl"
          >
            <Sparkles className="w-3.5 h-3.5 text-[var(--color-accent)] animate-pulse" />
            <span className="text-[11px] font-mono uppercase tracking-widest font-bold">
              Invitación Especial: <strong className="text-[var(--color-text-primary)] font-sans font-bold">{currentGuest.name}</strong> ({currentGuest.passesAllowed} Pases)
            </span>
          </motion.div>
        )}

        {/* Giant Statement Names in Bold Typography */}
        <motion.div
          initial={{ scale: 0.92, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="select-none"
        >
          <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-[110px] font-light leading-[0.88] tracking-tighter text-center uppercase">
            <span className="block font-extrabold tracking-tight text-[var(--color-text-primary)]">{heroConfig.groom.split(' ')[0]}</span>
            <span className="block italic font-serif text-[var(--color-gold-dark)] font-bold text-4xl sm:text-6xl md:text-7xl lg:text-8xl -mt-2 sm:-mt-4">{heroConfig.groom.split(' ').slice(1).join(' ')}</span>
            <span className="block text-[var(--color-accent)] font-serif text-4xl sm:text-6xl md:text-7xl my-1">&</span>
            <span className="block font-extrabold tracking-tight text-[var(--color-text-primary)]">{heroConfig.bride.split(' ')[0]}</span>
            <span className="block italic font-serif text-[var(--color-gold-dark)] font-bold text-4xl sm:text-6xl md:text-7xl lg:text-8xl -mt-2 sm:-mt-4">{heroConfig.bride.split(' ').slice(1).join(' ')}</span>
          </h1>
        </motion.div>

        {/* Date Monogram Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-8 sm:mt-10 flex items-center justify-center gap-8 uppercase tracking-[0.4em] text-xs font-bold text-[var(--color-text-muted)]"
        >
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-[var(--color-accent)] font-bold">Boda Nupcial</span>
            <span className="text-xl font-bold mt-0.5 text-[var(--color-text-primary)]">{heroConfig.dateFormatted}</span>
          </div>
        </motion.div>
      </div>

      {/* Bottom Row Layout */}
      <div className="relative z-20 max-w-7xl mx-auto w-full px-6 flex flex-col md:flex-row justify-between items-center md:items-end gap-6 pt-6 border-t border-[var(--color-gold)]/20">
        {/* Personal Invitation Card */}
        {currentGuest ? (
          <div className="bg-[var(--color-bg-elevated)] border border-[var(--color-gold)] p-5 rounded-2xl max-w-sm w-full text-left shadow-xl">
            <p className="text-[10px] uppercase tracking-widest text-[var(--color-accent)] mb-1.5 font-bold">
              Pase Personalizado
            </p>
            <p className="text-lg font-serif italic text-[var(--color-text-primary)] font-bold mb-1">
              Hola, {currentGuest.name}
            </p>
            <p className="text-xs text-[var(--color-text-muted)] mb-4 font-medium">
              Nos encantaría contar con tu presencia ({currentGuest.passesAllowed} pases reservados).
            </p>
            <div className="flex gap-2">
              <a
                href="#confirmacion"
                className="flex-1 bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white text-[10px] uppercase font-bold py-2.5 rounded-lg text-center transition-colors"
              >
                Confirmar
              </a>
              <a
                href="#detalles"
                className="flex-1 border border-[var(--color-gold)] text-[var(--color-text-primary)] text-[10px] uppercase font-bold py-2.5 rounded-lg text-center hover:bg-[var(--color-gold)]/10 transition-colors"
              >
                Detalles
              </a>
            </div>
          </div>
        ) : (
          <div className="text-left hidden md:block max-w-md bg-[var(--color-bg-elevated)]/80 border border-[var(--color-gold)]/30 p-4 rounded-2xl shadow-sm">
            <p className="text-[10px] uppercase tracking-widest text-[var(--color-accent)] font-bold mb-1">Cita Nupcial</p>
            <p className="text-base font-serif italic text-[var(--color-text-primary)] font-semibold">"{heroConfig.quote}"</p>
          </div>
        )}

        {/* Location & Discover Button */}
        <div className="flex flex-col items-center md:items-end gap-4 w-full md:w-auto">
          <div className="text-center md:text-right bg-[var(--color-bg-elevated)]/80 border border-[var(--color-gold)]/30 px-4 py-2 rounded-xl">
            <p className="text-[10px] uppercase tracking-widest font-bold text-[var(--color-gold-dark)] mb-0.5">Ubicación</p>
            <p className="text-base sm:text-lg font-serif uppercase tracking-tight text-[var(--color-text-primary)] font-bold">{heroConfig.city}</p>
          </div>

          <button
            onClick={onExploreClick}
            id="btn-discover-story"
            className="group relative overflow-hidden bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white px-8 py-4 rounded-full font-bold uppercase tracking-[0.2em] text-xs transition-all shadow-xl flex items-center gap-3 cursor-pointer"
          >
            <span>Descubrir Nuestra Historia</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </section>
  );
};
