import React from 'react';
import { motion } from 'motion/react';
import { Shield, Sparkles, UserCheck, Heart } from 'lucide-react';
import { Guest } from '../types';

interface HeaderNavProps {
  currentGuest: Guest | undefined;
  onOpenAdmin: () => void;
  onOpenGuestSelector: () => void;
  onScrollToRSVP: () => void;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  currentGuest,
  onOpenAdmin,
  onOpenGuestSelector,
  onScrollToRSVP,
}) => {
  return (
    <motion.header
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, delay: 0.5 }}
      className="fixed top-4 left-0 right-0 z-40 px-4 md:px-8 max-w-6xl mx-auto pointer-events-none"
    >
      <div className="pointer-events-auto flex items-center justify-between p-2.5 md:p-3 rounded-full liquid-glass border border-white/15 shadow-2xl backdrop-blur-2xl bg-[#0d0c0a]/60">
        {/* Monogram / Title */}
        <a href="#hero" className="flex items-center gap-2 pl-3 group cursor-pointer">
          <div className="w-8 h-8 rounded-full border border-amber-300/40 bg-amber-500/10 flex items-center justify-center text-amber-200 font-cinzel text-xs font-semibold group-hover:scale-105 transition-transform">
            M&C
          </div>
          <div className="hidden sm:flex flex-col text-left">
            <span className="font-cinzel text-xs tracking-widest text-amber-100 font-medium">
              MATEO & CAMILA
            </span>
            <span className="text-[9px] uppercase tracking-wider text-amber-200/60 font-mono">
              Ambato 2026
            </span>
          </div>
        </a>

        {/* Links Navigation */}
        <nav className="hidden lg:flex items-center gap-6 text-[11px] text-white/80 font-bold uppercase tracking-[0.2em]">
          <a href="#historia" className="hover:text-orange-400 transition-colors">Nuestra Historia</a>
          <a href="#galeria" className="hover:text-orange-400 transition-colors">Galería</a>
          <a href="#video" className="hover:text-orange-400 transition-colors">Video</a>
          <a href="#evento" className="hover:text-orange-400 transition-colors">Detalles</a>
          <a href="#regalos" className="hover:text-orange-400 transition-colors">Mesa de Regalos</a>
        </nav>

        {/* Actions Right */}
        <div className="flex items-center gap-2 pr-1">
          {/* Guest Identity Chip */}
          <button
            onClick={onOpenGuestSelector}
            id="btn-guest-selector"
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-white text-xs hover:bg-white/20 transition-all cursor-pointer"
            title="Cambiar invitado personalizado"
          >
            <UserCheck className="w-3.5 h-3.5 text-orange-400" />
            <span className="max-w-[110px] sm:max-w-[160px] truncate font-semibold text-[11px] uppercase tracking-wider">
              {currentGuest ? currentGuest.name : "Invitación Personal"}
            </span>
          </button>

          {/* Quick RSVP Button */}
          <button
            onClick={onScrollToRSVP}
            id="btn-nav-rsvp"
            className="hidden sm:flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs uppercase tracking-wider hover:scale-105 active:scale-95 transition-all shadow-md cursor-pointer"
          >
            <Heart className="w-3 h-3 fill-white" />
            <span>RSVP</span>
          </button>

          {/* Admin Panel Button */}
          <button
            onClick={onOpenAdmin}
            id="btn-open-admin-nav"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/15 hover:border-orange-400/50 text-amber-200 text-xs transition-all cursor-pointer hover:bg-white/10"
            title="Acceso Administración / Novios"
          >
            <Shield className="w-3.5 h-3.5 text-orange-400" />
            <span className="hidden md:inline font-mono text-[11px]">Admin</span>
          </button>
        </div>
      </div>
    </motion.header>
  );
};
