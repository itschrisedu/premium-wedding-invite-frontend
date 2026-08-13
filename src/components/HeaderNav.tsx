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
      <div className="pointer-events-auto flex items-center justify-between p-2.5 md:p-3 rounded-full bg-[var(--color-bg-elevated)] border border-[var(--color-gold)] shadow-2xl backdrop-blur-2xl">
        {/* Monogram / Title */}
        <a href="#hero" className="flex items-center gap-2 pl-3 group cursor-pointer">
          <div className="w-9 h-9 rounded-full border border-[var(--color-gold)] bg-[var(--color-gold)]/10 flex items-center justify-center text-[var(--color-gold-dark)] font-cinzel text-xs font-bold group-hover:scale-105 transition-transform shadow-sm">
            M&C
          </div>
          <div className="hidden sm:flex flex-col text-left">
            <span className="font-cinzel text-xs tracking-widest text-[var(--color-text-primary)] font-bold">
              MATEO & CAMILA
            </span>
            <span className="text-[9px] uppercase tracking-wider text-[var(--color-gold-dark)] font-mono font-semibold">
              Ambato 2026
            </span>
          </div>
        </a>

        {/* Links Navigation */}
        <nav className="hidden lg:flex items-center gap-6 text-[11px] text-[var(--color-text-primary)] font-extrabold uppercase tracking-[0.18em]">
          <a href="#historia" className="hover:text-[var(--color-accent)] transition-colors">Nuestra Historia</a>
          <a href="#galeria" className="hover:text-[var(--color-accent)] transition-colors">Galería</a>
          <a href="#video" className="hover:text-[var(--color-accent)] transition-colors">Video</a>
          <a href="#evento" className="hover:text-[var(--color-accent)] transition-colors">Detalles</a>
          <a href="#regalos" className="hover:text-[var(--color-accent)] transition-colors">Mesa de Regalos</a>
        </nav>

        {/* Actions Right */}
        <div className="flex items-center gap-2 pr-1">
          {/* Guest Identity Chip */}
          <button
            onClick={onOpenGuestSelector}
            id="btn-guest-selector"
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--color-gold)]/10 border border-[var(--color-gold)] text-[var(--color-text-primary)] hover:bg-[var(--color-gold)]/20 transition-all cursor-pointer font-bold"
            title="Cambiar invitado personalizado"
          >
            <UserCheck className="w-3.5 h-3.5 text-[var(--color-accent)]" />
            <span className="max-w-[110px] sm:max-w-[160px] truncate font-bold text-[11px] uppercase tracking-wider">
              {currentGuest ? currentGuest.name : "Invitación Personal"}
            </span>
          </button>

          {/* Quick RSVP Button */}
          <button
            onClick={onScrollToRSVP}
            id="btn-nav-rsvp"
            className="hidden sm:flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white font-bold text-xs uppercase tracking-wider hover:scale-105 active:scale-95 transition-all shadow-md cursor-pointer"
          >
            <Heart className="w-3 h-3 fill-white" />
            <span>RSVP</span>
          </button>

          {/* Admin Panel Button */}
          <button
            onClick={onOpenAdmin}
            id="btn-open-admin-nav"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[var(--color-bg-base)] border border-[var(--color-gold)] text-[var(--color-gold-dark)] text-xs font-bold transition-all cursor-pointer hover:bg-[var(--color-gold)]/10 shadow-sm"
            title="Acceso Administración / Novios"
          >
            <Shield className="w-3.5 h-3.5 text-[var(--color-accent)]" />
            <span className="hidden md:inline font-mono text-[11px] font-bold">Admin</span>
          </button>
        </div>
      </div>
    </motion.header>
  );
};
