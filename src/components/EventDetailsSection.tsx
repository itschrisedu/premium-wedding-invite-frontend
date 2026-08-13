import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Church, GlassWater, MapPin, Clock, ExternalLink, Compass } from 'lucide-react';
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
    <section id="detalles" className="relative py-24 px-6 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="text-center mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full backdrop-blur-xl bg-white/10 border border-white/20 text-amber-300 text-[10px] font-bold uppercase tracking-[0.4em] mb-3"
        >
          <Compass className="w-3.5 h-3.5 text-amber-400" />
          <span>Ubicación & Cronograma</span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-6xl font-extrabold uppercase tracking-tight text-white"
        >
          Detalles del <span className="italic font-serif font-normal text-amber-200">Evento</span>
        </motion.h2>

        <p className="mt-3 text-xs sm:text-sm text-white/70 font-sans tracking-wide uppercase max-w-xl mx-auto">
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
            className="rounded-3xl overflow-hidden liquid-glass border border-white/15 p-6 md:p-8 flex flex-col justify-between shadow-2xl hover:border-amber-300/40 transition-all duration-500"
          >
            <div>
              {/* Venue Image */}
              <div className="relative aspect-video rounded-2xl overflow-hidden mb-6 border border-white/10">
                <img
                  src={venue.imageUrl}
                  alt={venue.name}
                  className="w-full h-full object-cover object-center filter brightness-90 hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute top-4 left-4 px-3.5 py-1.5 rounded-full bg-black/70 backdrop-blur-md border border-white/20 text-amber-300 font-mono text-xs uppercase tracking-wider flex items-center gap-2">
                  {venue.type === 'ceremonia' ? (
                    <>
                      <Church className="w-3.5 h-3.5 text-amber-400" />
                      <span>Ceremonia Religiosa</span>
                    </>
                  ) : (
                    <>
                      <GlassWater className="w-3.5 h-3.5 text-amber-400" />
                      <span>Recepción & Fiesta</span>
                    </>
                  )}
                </div>
              </div>

              {/* Title & Info */}
              <h3 className="font-cinzel text-2xl font-light text-amber-100 mb-2">
                {venue.name}
              </h3>

              <p className="text-xs text-amber-200/70 font-serif italic mb-6">
                {venue.description}
              </p>

              <div className="space-y-3 mb-8 text-xs text-amber-100/90 font-sans border-t border-b border-white/10 py-4">
                <div className="flex items-start gap-3">
                  <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-mono text-[10px] text-amber-300/70 uppercase tracking-widest block">Hora</span>
                    <strong className="text-amber-100 text-sm font-medium">{venue.time}</strong>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-mono text-[10px] text-amber-300/70 uppercase tracking-widest block">Dirección</span>
                    <span className="text-amber-100 font-medium">{venue.address}, {venue.city}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Google Maps Actions */}
            <div className="flex items-center gap-4 pt-2">
              <a
                href={venue.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                id={`btn-map-${venue.type}`}
                className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-4 rounded-full bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white font-bold text-xs uppercase tracking-[0.2em] shadow-xl hover:scale-[1.02] active:scale-98 transition-all cursor-pointer"
              >
                <MapPin className="w-4 h-4 text-white" />
                <span>Cómo Llegar en Google Maps</span>
                <ExternalLink className="w-3.5 h-3.5 text-white/80" />
              </a>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};
