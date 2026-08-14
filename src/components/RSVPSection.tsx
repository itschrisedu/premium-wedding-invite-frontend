import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Heart, CheckCircle2, XCircle, Users, Utensils, Send, Sparkles, UserCheck } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Guest, GuestStatus } from '../types';
import { storageService } from '../services/storageService';

interface RSVPSectionProps {
  currentGuest: Guest | undefined;
  onSelectGuest: (guest: Guest) => void;
}

export const RSVPSection: React.FC<RSVPSectionProps> = ({ currentGuest, onSelectGuest }) => {
  const [selectedStatus, setSelectedStatus] = useState<GuestStatus>('confirmado');
  const [passesConfirmed, setPassesConfirmed] = useState<number>(1);
  const [dietary, setDietary] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    if (currentGuest) {
      setSelectedStatus(currentGuest.status === 'pendiente' ? 'confirmado' : currentGuest.status);
      setPassesConfirmed(currentGuest.passesConfirmed || currentGuest.passesAllowed);
      setDietary(currentGuest.dietaryRestrictions || '');
      setNotes(currentGuest.notes || '');
      setIsSubmitted(currentGuest.status !== 'pendiente');
    }
  }, [currentGuest]);

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentGuest) return;

    setIsSubmitting(true);

    try {
      const updated = storageService.updateGuestRSVP(
        currentGuest.id,
        selectedStatus,
        passesConfirmed,
        dietary,
        notes
      );

      const resolved = await updated;

      if (resolved && selectedStatus === 'confirmado') {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#d4af37', '#e6c875', '#ffffff', '#065f46']
        });

        onSelectGuest(resolved);
      }

      setIsSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="confirmacion" className="relative py-24 px-6 max-w-4xl mx-auto">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[160px] pointer-events-none" />

      {/* Section Header */}
      <div className="text-center mb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--color-bg-elevated)] border border-[var(--color-gold)] text-[var(--color-gold-dark)] text-[10px] font-bold uppercase tracking-[0.4em] mb-3 shadow-sm"
        >
          <UserCheck className="w-3.5 h-3.5 text-[var(--color-accent)]" />
          <span>Confirmación de Asistencia</span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-6xl font-extrabold uppercase tracking-tight text-[var(--color-text-primary)]"
        >
          Reserva Tu <span className="italic font-serif font-bold text-[var(--color-accent)]">Pase Personal</span>
        </motion.h2>

        <p className="mt-3 text-xs sm:text-sm text-[var(--color-text-muted)] font-bold tracking-wide uppercase max-w-xl mx-auto">
          Por favor confirma tu presencia antes del 15 de Octubre de 2026.
        </p>
      </div>

      {/* Main RSVP Card */}
      {currentGuest ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="rounded-3xl bg-[var(--color-bg-elevated)] border border-[var(--color-gold)] p-8 sm:p-10 shadow-2xl relative overflow-hidden text-[var(--color-text-primary)]"
        >
          {/* Top Guest Info Ribbon */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-[var(--color-gold)]/20 mb-8">
            <div>
              <span className="text-[10px] font-mono text-[var(--color-gold-dark)] font-bold uppercase tracking-widest block">Pase Exclusivo</span>
              <h3 className="font-cinzel text-2xl font-bold text-[var(--color-text-primary)]">{currentGuest.name}</h3>
              <span className="text-xs text-[var(--color-text-muted)] font-bold font-mono mt-0.5 block">Categoría: {currentGuest.category}</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="px-4 py-2 rounded-2xl bg-[var(--color-bg-base)] border border-[var(--color-gold)] text-center">
                <span className="font-cinzel text-xl font-bold text-[var(--color-accent)] block">{currentGuest.passesAllowed}</span>
                <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-[var(--color-gold-dark)]">Pases Totales</span>
              </div>

              <div className={`px-4 py-2 rounded-2xl border text-center ${
                currentGuest.status === 'confirmado' ? 'bg-emerald-500/10 border-emerald-400/30 text-emerald-600' :
                currentGuest.status === 'declinado' ? 'bg-rose-500/10 border-rose-400/30 text-rose-600' : 'bg-[var(--color-gold)]/10 border-[var(--color-gold)]/30 text-[var(--color-gold-dark)] font-bold'
              }`}>
                <span className="text-xs font-mono font-semibold uppercase tracking-widest block">
                  {currentGuest.status}
                </span>
                <span className="text-[9px] opacity-70 block font-mono">Estado Actual</span>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleConfirm} className="space-y-6">
            {/* Status Selection */}
            <div>
              <label className="text-xs font-mono font-bold uppercase tracking-widest text-[var(--color-gold-dark)] block mb-3">
                ¿Nos acompañarás en este día tan especial?
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setSelectedStatus('confirmado')}
                  className={`p-4 rounded-2xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                    selectedStatus === 'confirmado'
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-900 shadow-lg'
                      : 'bg-[var(--color-bg-base)] border-[var(--color-gold)]/40 text-[var(--color-text-primary)] hover:border-[var(--color-gold)]'
                  }`}
                >
                  <CheckCircle2 className={`w-5 h-5 ${selectedStatus === 'confirmado' ? 'text-emerald-600' : 'text-[var(--color-text-muted)]'}`} />
                  <div>
                    <strong className="text-sm font-semibold block text-[var(--color-text-primary)]">¡Sí, asistiré con alegría!</strong>
                    <span className="text-[11px] text-[var(--color-text-muted)] font-serif">Confirmar presencia</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedStatus('declinado')}
                  className={`p-4 rounded-2xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                    selectedStatus === 'declinado'
                      ? 'bg-rose-500/20 border-rose-500 text-rose-900 shadow-lg'
                      : 'bg-[var(--color-bg-base)] border-[var(--color-gold)]/40 text-[var(--color-text-primary)] hover:border-[var(--color-gold)]'
                  }`}
                >
                  <XCircle className={`w-5 h-5 ${selectedStatus === 'declinado' ? 'text-rose-600' : 'text-[var(--color-text-muted)]'}`} />
                  <div>
                    <strong className="text-sm font-semibold block text-[var(--color-text-primary)]">Lamento no poder asistir</strong>
                    <span className="text-[11px] text-[var(--color-text-muted)] font-serif">Enviar mis mejores deseos</span>
                  </div>
                </button>
              </div>
            </div>

            {/* If Confirming: Select Number of Passes */}
            {selectedStatus === 'confirmado' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-4 pt-2"
              >
                <div>
                  <label className="text-xs font-mono font-bold uppercase tracking-widest text-[var(--color-gold-dark)] flex items-center gap-2 mb-2">
                    <Users className="w-3.5 h-3.5 text-[var(--color-accent)]" />
                    Número de Asistentes Confirmados (Máximo {currentGuest.passesAllowed})
                  </label>

                  <div className="flex items-center gap-3">
                    {Array.from({ length: currentGuest.passesAllowed }, (_, i) => i + 1).map(num => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setPassesConfirmed(num)}
                        className={`w-12 h-12 rounded-xl border font-sans font-bold text-lg flex items-center justify-center transition-all cursor-pointer ${
                          passesConfirmed === num
                            ? 'bg-[var(--color-accent)] text-white border-[var(--color-gold-dark)] scale-105 shadow-lg'
                            : 'bg-[var(--color-bg-base)] border-[var(--color-gold)]/40 text-[var(--color-text-primary)] hover:border-[var(--color-gold)]'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Dietary Restrictions */}
                <div>
                  <label className="text-xs font-mono font-bold uppercase tracking-widest text-[var(--color-gold-dark)] flex items-center gap-2 mb-2">
                    <Utensils className="w-3.5 h-3.5 text-[var(--color-accent)]" />
                    Restricciones Alimentarias / Alergias (Opcional)
                  </label>
                  <input
                    type="text"
                    value={dietary}
                    onChange={e => setDietary(e.target.value)}
                    placeholder="Ej. Vegetariano, sin celíacos, alergia a mariscos..."
                    className="w-full px-4 py-3 rounded-xl bg-[var(--color-bg-base)] border border-[var(--color-gold)] text-xs text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)]/60 font-medium focus:outline-none focus:border-[var(--color-accent)]"
                  />
                </div>
              </motion.div>
            )}

            {/* Special Note to Couple */}
            <div>
              <label className="text-xs font-mono font-bold uppercase tracking-widest text-[var(--color-gold-dark)] flex items-center gap-2 mb-2">
                <Heart className="w-3.5 h-3.5 text-[var(--color-accent)]" />
                Mensaje Especial para los Novios
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Escribe unas palabras para los novios..."
                className="w-full px-4 py-3 rounded-xl bg-[var(--color-bg-base)] border border-[var(--color-gold)] text-xs text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)]/60 font-medium focus:outline-none focus:border-[var(--color-accent)]"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              id="btn-submit-rsvp"
              className="w-full py-4 rounded-full bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white font-bold text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-98 transition-all cursor-pointer shadow-xl disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Guardando Respuesta...</span>
              ) : (
                <>
                  <Send className="w-4 h-4 text-white" />
                  <span>{isSubmitted ? 'Actualizar Confirmación' : 'Enviar Confirmación'}</span>
                </>
              )}
            </button>

            {isSubmitted && (
              <p className="text-center text-xs text-emerald-300 font-serif italic flex items-center justify-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                ¡Tu respuesta está sincronizada en tiempo real! Gracias por acompañarnos.
              </p>
            )}
          </form>
        </motion.div>
      ) : (
        <div className="p-10 rounded-3xl glass-panel border border-amber-300/30 text-center max-w-lg mx-auto">
          <UserCheck className="w-8 h-8 text-amber-400 mx-auto mb-3" />
          <h3 className="font-cinzel text-xl text-amber-100 mb-2">Invitación Personal Exclusiva</h3>
          <p className="text-xs text-amber-200/80 font-serif italic leading-relaxed">
            Ingresa a través del enlace personalizado enviado a tu WhatsApp para acceder a tu pase de asistencia de forma privada.
          </p>
        </div>
      )}
    </section>
  );
};
