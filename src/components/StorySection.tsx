import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Heart, MapPin, Sparkles, BookOpen } from 'lucide-react';
import { weddingConfigService } from '../services/weddingConfigService';

export const StorySection: React.FC = () => {
  const [config, setConfig] = useState(weddingConfigService.getConfig());

  useEffect(() => {
    const unsub = weddingConfigService.subscribe(() => {
      setConfig(weddingConfigService.getConfig());
    });
    return unsub;
  }, []);

  const visibleChapters = config.loveStory.filter(c => c.isVisible !== false);

  return (
    <section id="historia" className="relative py-24 px-6 max-w-6xl mx-auto overflow-hidden">
      {/* Decorative Glow */}
      <div className="absolute top-1/2 left-0 w-80 h-80 bg-[var(--color-gold)]/15 rounded-full blur-[140px] pointer-events-none" />

      {/* Section Header */}
      <div className="text-center mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--color-bg-elevated)] border border-[var(--color-gold)] text-[var(--color-gold-dark)] text-[10px] font-bold uppercase tracking-[0.4em] mb-3 shadow-sm"
        >
          <BookOpen className="w-3.5 h-3.5 text-[var(--color-accent)]" />
          <span>El Comienzo del Viaje</span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-6xl font-extrabold uppercase tracking-tight text-[var(--color-text-primary)]"
        >
          Nuestra <span className="italic font-serif font-bold text-[var(--color-accent)]">Historia</span>
        </motion.h2>

        <p className="mt-3 text-xs sm:text-sm text-[var(--color-text-muted)] font-bold tracking-wide uppercase max-w-xl mx-auto">
          Inspirados por nuestro amor y la calidez de nuestras familias.
        </p>
      </div>

      {/* Grid Layout: Couple Story Image + Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left: High-Art Couple Photo */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="lg:col-span-5 relative"
        >
          <div className="relative rounded-2xl overflow-hidden bg-[var(--color-bg-elevated)] border border-[var(--color-gold)] shadow-2xl p-2">
            <img
              src={config.hero.secondaryImage || config.hero.coverImage}
              alt={`${config.hero.groom} & ${config.hero.bride}`}
              className="w-full h-[480px] object-cover rounded-xl filter contrast-[1.03]"
            />
            {/* Glass Tag Overlay */}
            <div className="absolute bottom-6 left-6 right-6 p-4 rounded-xl bg-[var(--color-bg-elevated)]/90 border border-[var(--color-gold)] backdrop-blur-md shadow-lg">
              <div className="flex items-center justify-between text-[var(--color-text-primary)] text-xs font-serif italic font-bold">
                <span>"Cada día a tu lado es mi lugar favorito."</span>
                <Heart className="w-4 h-4 text-[var(--color-accent)] fill-[var(--color-accent)]" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right: Animated Timeline */}
        <div className="lg:col-span-7 relative">
          {/* Vertical Connecting Line */}
          <div className="absolute left-4 top-2 bottom-2 w-1 bg-gradient-to-b from-[var(--color-gold)] via-[var(--color-accent)] to-transparent opacity-40" />

          <div className="space-y-8 pl-10">
            {visibleChapters.map((chapter, index) => (
              <motion.div
                key={chapter.id || chapter.year}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                className="relative group"
              >
                {/* Timeline Dot Node */}
                <div className="absolute -left-[42px] top-1.5 w-7 h-7 rounded-full bg-[var(--color-bg-elevated)] border border-[var(--color-gold)] flex items-center justify-center text-[var(--color-gold-dark)] group-hover:scale-125 transition-transform shadow-md">
                  <Sparkles className="w-3.5 h-3.5 text-[var(--color-accent)]" />
                </div>

                {/* Content Card */}
                <div className="p-6 rounded-2xl bg-[var(--color-bg-elevated)] border border-[var(--color-gold)]/30 hover:border-[var(--color-gold)] transition-all duration-300 shadow-md">
                  <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                    <span className="font-mono text-xs text-[var(--color-gold-dark)] font-bold uppercase tracking-widest bg-[var(--color-gold)]/10 px-2.5 py-1 rounded-md border border-[var(--color-gold)]/30">
                      {chapter.year}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-[var(--color-text-muted)] font-mono font-semibold">
                      <MapPin className="w-3 h-3 text-[var(--color-accent)]" />
                      {chapter.location}
                    </span>
                  </div>

                  <h3 className="font-cinzel text-xl text-[var(--color-text-primary)] font-bold mb-2">
                    {chapter.title}
                  </h3>

                  <p className="text-sm text-[var(--color-text-primary)]/90 leading-relaxed font-sans font-medium">
                    {chapter.content}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
