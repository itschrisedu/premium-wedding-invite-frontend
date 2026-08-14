import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { MapPin, Clock, ExternalLink, Navigation, Compass } from 'lucide-react';
import { weddingConfigService } from '../services/weddingConfigService';

export const EventDetailsSection: React.FC = () => {
  const [config, setConfig] = useState(weddingConfigService.getConfig());

  useEffect(() => {
    const unsub = weddingConfigService.subscribe(() => {
      setConfig(weddingConfigService.getConfig());
    });
    return unsub;
  }, []);

  const visibleVenues = config.venues.filter(v => v.isVisible !== false);

  return (
    <section id="evento" className="relative py-24 px-6 max-w-6xl mx-auto overflow-hidden">
      {/* Decorative Glow */}
      <div className="absolute top-1/3 right-0 w-96 h-96 bg-[var(--color-gold)]/10 rounded-full blur-[150px] pointer-events-none" />

      {/* Section Header */}
      <div className="text-center mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--color-bg-elevated)] border border-[var(--color-gold)] text-[var(--color-gold-dark)] text-[10px] font-bold uppercase tracking-[0.4em] mb-3 shadow-sm"
        >
          <Compass className="w-3.5 h-3.5 text-[var(--color-accent)]" />
          <span>Ubicación & Cronograma</span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-6xl font-extrabold uppercase tracking-tight text-[var(--color-text-primary)]"
        >
          Detalles del <span className="italic font-serif font-bold text-[var(--color-accent)]">Evento</span>
        </motion.h2>

        <p className="mt-3 text-xs sm:text-sm text-[var(--color-text-muted)] font-bold tracking-wide uppercase max-w-xl mx-auto">
          Ubicaciones especiales en {config.hero.city}.
        </p>
      </div>

      {/* Venues Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {visibleVenues.map((venue, idx) => (
          <motion.div
            key={venue.id || venue.name}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: idx * 0.2 }}
            className="rounded-3xl overflow-hidden bg-[var(--color-bg-elevated)] border border-[var(--color-gold)]/40 p-6 md:p-8 flex flex-col justify-between shadow-xl hover:border-[var(--color-gold)] transition-all duration-500"
          >
            <div>
              {/* Venue Image */}
              {venue.imageUrl && (
                <div className="mb-6 rounded-2xl overflow-hidden h-48 w-full border border-[var(--color-gold)]/20 shadow-md">
                  <img
                    src={venue.imageUrl}
                    alt={venue.name}
                    className="w-full h-full object-cover filter contrast-[1.05]"
                  />
                </div>
              )}

              {/* Tag / Type */}
              <div className="flex items-center justify-between gap-4 mb-4">
                <span className="px-3.5 py-1 rounded-full bg-[var(--color-gold)]/10 border border-[var(--color-gold)]/30 font-mono text-xs text-[var(--color-gold-dark)] font-bold uppercase tracking-widest">
                  {venue.type === 'civil'
                    ? 'Matrimonio Civil'
                    : venue.type === 'eclesiastico'
                    ? 'Matrimonio Eclesiástico'
                    : venue.type === 'ceremonia'
                    ? 'Ceremonia Nupcial'
                    : 'Recepción & Fiesta'}
                </span>
                <span className="flex items-center gap-1.5 text-xs font-mono font-bold text-[var(--color-accent)]">
                  <Clock className="w-3.5 h-3.5 text-[var(--color-accent)]" />
                  {venue.time}
                </span>
              </div>

              {/* Venue Name */}
              <h3 className="font-cinzel text-2xl md:text-3xl text-[var(--color-text-primary)] font-bold mb-2">
                {venue.name}
              </h3>

              {/* Address */}
              <div className="flex items-start gap-2 text-xs text-[var(--color-text-muted)] font-semibold mb-4">
                <MapPin className="w-4 h-4 text-[var(--color-accent)] shrink-0 mt-0.5" />
                <span>{venue.address} — {venue.city}</span>
              </div>

              {/* Description */}
              {venue.description && (
                <p className="text-xs text-[var(--color-text-primary)]/90 font-sans leading-relaxed mb-6 font-medium">
                  {venue.description}
                </p>
              )}
            </div>

            {/* Actions */}
            {venue.googleMapsUrl && (
              <div className="pt-4 border-t border-[var(--color-gold)]/20">
                <a
                  href={venue.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 w-full py-3 px-6 rounded-full bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white font-bold text-xs uppercase tracking-widest shadow-md transition-all duration-300 hover:scale-[1.02] active:scale-95"
                >
                  <Navigation className="w-4 h-4 text-white" />
                  <span>Abrir Ubicación en GPS / Maps</span>
                  <ExternalLink className="w-3.5 h-3.5 text-white/70" />
                </a>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </section>
  );
};
