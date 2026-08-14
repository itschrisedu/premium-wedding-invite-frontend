import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Clock, Heart } from 'lucide-react';
import { COUPLE_INFO } from '../data/weddingData';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export const CountdownSection: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const targetDate = new Date(COUPLE_INFO.weddingDate).getTime();

    const updateCountdown = () => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        setTimeLeft({ days, hours, minutes, seconds });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section id="cuenta-regresiva" className="relative py-20 px-6 max-w-5xl mx-auto my-12">
      {/* Liquid Glass Background Card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="relative rounded-3xl bg-[var(--color-bg-elevated)] border border-[var(--color-gold)] p-8 sm:p-12 text-center shadow-2xl overflow-hidden"
      >
        {/* Background Ambient Glow */}
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-[var(--color-gold)]/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--color-bg-base)] border border-[var(--color-gold)]/40 text-[var(--color-gold-dark)] text-[10px] font-bold uppercase tracking-[0.4em] mb-4 shadow-sm">
            <Clock className="w-3.5 h-3.5 text-[var(--color-accent)] animate-pulse" />
            <span>El Gran Día Se Acerca</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold uppercase tracking-tight text-[var(--color-text-primary)] mb-2">
            Cuenta <span className="italic font-serif font-bold text-[var(--color-accent)]">Regresiva</span>
          </h2>

          <p className="text-xs sm:text-sm text-[var(--color-text-muted)] font-bold tracking-wide uppercase mb-10">
            {COUPLE_INFO.dateFormatted} • Ambato, Ecuador
          </p>

          {/* Timer Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 w-full max-w-2xl">
            {[
              { label: 'Días', value: timeLeft.days },
              { label: 'Horas', value: timeLeft.hours },
              { label: 'Minutos', value: timeLeft.minutes },
              { label: 'Segundos', value: timeLeft.seconds }
            ].map((item) => (
              <div
                key={item.label}
                className="flex flex-col items-center justify-center p-5 rounded-2xl bg-[var(--color-bg-base)] border border-[var(--color-gold)]/30 shadow-md"
              >
                <span className="font-sans text-4xl sm:text-6xl font-bold text-[var(--color-accent)] tracking-tight">
                  {String(item.value).padStart(2, '0')}
                </span>
                <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-[var(--color-text-primary)] font-bold mt-2">
                  {item.label}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-8 flex items-center gap-2 text-xs text-[var(--color-gold-dark)] font-serif italic font-bold">
            <Heart className="w-3.5 h-3.5 text-[var(--color-accent)] fill-[var(--color-accent)]" />
            <span>"Contando cada segundo para decir Sí Acepto"</span>
          </div>
        </div>
      </motion.div>
    </section>
  );
};
