import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, ChevronDown, Calendar, MapPin, Heart, ArrowRight } from 'lucide-react';
import { COUPLE_INFO } from '../data/weddingData';
import { Guest } from '../types';

interface HeroSectionProps {
  currentGuest: Guest | undefined;
  onExploreClick: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ currentGuest, onExploreClick }) => {
  return (
    <section id="hero" className="relative min-h-screen flex flex-col justify-between overflow-hidden bg-[#0a0a0a] text-white pt-20 pb-12">
      {/* Background Photography with Dramatic Gradient Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={COUPLE_INFO.coverImage}
          alt="Mateo y Camila Boda Ambato"
          className="w-full h-full object-cover object-center filter contrast-[1.08] brightness-[0.55] transition-transform duration-[20s] hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/50 to-[#0a0a0a]/80" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a]/70 via-transparent to-[#0a0a0a]/70" />
      </div>

      {/* Top Meta Bar */}
      <div className="relative z-20 max-w-7xl mx-auto w-full px-6 flex justify-between items-start pt-4">
        <div className="flex flex-col gap-1">
          <div className="text-[10px] uppercase tracking-[0.4em] font-bold text-white/60">
            Ambato, Ecuador
          </div>
          <div className="text-xs tracking-widest font-light text-white/80">
            M & C — 2026
          </div>
        </div>

        {/* Status Pill */}
        <div className="hidden sm:flex items-center gap-3 backdrop-blur-xl bg-white/10 border border-white/20 rounded-full px-4 py-2">
          <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
          <span className="text-[10px] uppercase tracking-wider font-semibold text-white/90">
            14 de Noviembre, 2026 • Quinta Loren
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
            className="mb-8 inline-flex items-center gap-2 px-5 py-2.5 rounded-full backdrop-blur-xl bg-black/40 border border-orange-500/40 text-orange-200 shadow-2xl"
          >
            <Sparkles className="w-3.5 h-3.5 text-orange-400 animate-pulse" />
            <span className="text-[11px] font-mono uppercase tracking-widest">
              Invitación Especial: <strong className="text-white font-sans font-bold">{currentGuest.name}</strong> ({currentGuest.passesAllowed} Pases)
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
            <span className="block font-bold tracking-tight text-white">MATEO</span>
            <span className="block italic font-serif text-amber-200/90 text-4xl sm:text-6xl md:text-7xl lg:text-8xl -mt-2 sm:-mt-4">Andrade</span>
            <span className="block text-orange-400 font-serif text-4xl sm:text-6xl md:text-7xl my-1">&</span>
            <span className="block font-bold tracking-tight text-white">CAMILA</span>
            <span className="block italic font-serif text-amber-200/90 text-4xl sm:text-6xl md:text-7xl lg:text-8xl -mt-2 sm:-mt-4">Viteri</span>
          </h1>
        </motion.div>

        {/* Date Monogram Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-8 sm:mt-10 flex items-center justify-center gap-8 opacity-90 uppercase tracking-[0.4em] text-xs font-semibold text-white/80"
        >
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-orange-300">Sábado</span>
            <span className="text-2xl font-bold mt-0.5 text-white">14</span>
          </div>
          <div className="h-px w-10 sm:w-16 bg-white/30" />
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-orange-300">Noviembre</span>
            <span className="text-2xl font-bold mt-0.5 text-white">2026</span>
          </div>
        </motion.div>
      </div>

      {/* Bottom Row Layout */}
      <div className="relative z-20 max-w-7xl mx-auto w-full px-6 flex flex-col md:flex-row justify-between items-center md:items-end gap-6 pt-6 border-t border-white/10">
        {/* Personal Invitation Card */}
        {currentGuest ? (
          <div className="backdrop-blur-2xl bg-black/50 border border-white/15 p-5 rounded-2xl max-w-sm w-full text-left">
            <p className="text-[10px] uppercase tracking-widest text-orange-300 mb-1.5 font-bold">
              Enlace de Invitado
            </p>
            <p className="text-lg font-serif italic text-white mb-1">
              Hola, {currentGuest.name}
            </p>
            <p className="text-xs text-white/70 mb-4">
              Nos encantaría contar con tu presencia ({currentGuest.passesAllowed} pases reservados).
            </p>
            <div className="flex gap-2">
              <a
                href="#confirmacion"
                className="flex-1 bg-white text-black text-[10px] uppercase font-bold py-2.5 rounded-lg text-center hover:bg-orange-400 hover:text-white transition-colors"
              >
                Confirmar
              </a>
              <a
                href="#evento"
                className="flex-1 border border-white/20 text-white text-[10px] uppercase font-bold py-2.5 rounded-lg text-center hover:bg-white/10 transition-colors"
              >
                Detalles
              </a>
            </div>
          </div>
        ) : (
          <div className="text-left hidden md:block">
            <p className="text-[10px] uppercase tracking-widest text-orange-300 font-bold mb-1">Cita Nupcial</p>
            <p className="text-base font-serif italic text-white/90">"{COUPLE_INFO.quote}"</p>
          </div>
        )}

        {/* Location & Discover Button */}
        <div className="flex flex-col items-center md:items-end gap-4 w-full md:w-auto">
          <div className="text-center md:text-right">
            <p className="text-[10px] uppercase tracking-widest font-bold text-white/50 mb-1">Recepción</p>
            <p className="text-base sm:text-lg font-serif uppercase tracking-tight text-white font-semibold">Quinta Loren, Ambato</p>
            <p className="text-[11px] text-white/50">19:00 PM — Hasta el amanecer</p>
          </div>

          <button
            onClick={onExploreClick}
            id="btn-discover-story"
            className="group relative overflow-hidden bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-full font-bold uppercase tracking-[0.2em] text-xs transition-all shadow-xl hover:shadow-orange-500/25 flex items-center gap-3 cursor-pointer"
          >
            <span>Descubrir Nuestra Historia</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </section>
  );
};

