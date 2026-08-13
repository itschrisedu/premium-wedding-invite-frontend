import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Shirt, Info } from 'lucide-react';
import { weddingConfigService } from '../services/weddingConfigService';

export const DressCodeSection: React.FC = () => {
  const [config, setConfig] = useState(weddingConfigService.getConfig());

  useEffect(() => {
    const unsub = weddingConfigService.subscribe(() => {
      setConfig(weddingConfigService.getConfig());
    });
    return unsub;
  }, []);

  const dressCode = config.dressCode;
  const visibleCards = (dressCode.cards || []).filter(c => c.isVisible !== false);

  return (
    <section id="dress-code" className="relative py-24 px-6 max-w-5xl mx-auto">
      {/* Section Header */}
      <div className="text-center mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--color-bg-elevated)] border border-[var(--color-gold)] text-[var(--color-gold-dark)] text-[10px] font-bold uppercase tracking-[0.4em] mb-3 shadow-sm"
        >
          <Shirt className="w-3.5 h-3.5 text-[var(--color-accent)]" />
          <span>{dressCode.subtitle || 'Etiqueta del Evento'}</span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-6xl font-extrabold uppercase tracking-tight text-[var(--color-text-primary)]"
        >
          {dressCode.title}: <span className="italic font-serif font-bold text-[var(--color-accent)]">{dressCode.styleType}</span>
        </motion.h2>

        <p className="mt-3 text-xs sm:text-sm text-[var(--color-text-muted)] font-bold tracking-wide uppercase max-w-xl mx-auto">
          {dressCode.description}
        </p>
      </div>

      {/* Dress Code Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {visibleCards.map((card, idx) => (
          <motion.div
            key={card.id || card.gender}
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: idx * 0.15 }}
            className="p-8 rounded-3xl bg-[var(--color-bg-elevated)] border border-[var(--color-gold)]/40 hover:border-[var(--color-gold)] transition-all duration-300 shadow-xl"
          >
            <span className="px-3.5 py-1 rounded-full bg-[var(--color-gold)]/10 text-[var(--color-gold-dark)] text-xs font-mono font-bold uppercase tracking-wider inline-block mb-4 border border-[var(--color-gold)]/30">
              {card.gender}
            </span>
            <h3 className="font-cinzel text-2xl text-[var(--color-text-primary)] font-bold mb-3">
              {card.title}
            </h3>
            <p className="text-xs text-[var(--color-text-primary)]/90 font-sans leading-relaxed font-medium">
              {card.description}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Notice / Rules */}
      {dressCode.rulesNotice && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-10 p-5 rounded-2xl bg-[var(--color-bg-elevated)] border border-[var(--color-gold)]/30 flex items-center gap-3 text-xs text-[var(--color-text-muted)] font-semibold shadow-md max-w-2xl mx-auto"
        >
          <Info className="w-5 h-5 text-[var(--color-accent)] shrink-0" />
          <span>{dressCode.rulesNotice}</span>
        </motion.div>
      )}
    </section>
  );
};
