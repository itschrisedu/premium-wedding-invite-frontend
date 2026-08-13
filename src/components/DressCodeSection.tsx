import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Shirt, Info } from 'lucide-react';
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
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full backdrop-blur-xl bg-white/10 border border-white/20 text-amber-300 text-[10px] font-bold uppercase tracking-[0.4em] mb-3"
        >
          <Shirt className="w-3.5 h-3.5 text-amber-400" />
          <span>{dressCode.subtitle || 'Etiqueta del Evento'}</span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-6xl font-extrabold uppercase tracking-tight text-white"
        >
          {dressCode.title}: <span className="italic font-serif font-normal text-amber-200">{dressCode.styleType}</span>
        </motion.h2>

        <p className="mt-3 text-xs sm:text-sm text-white/70 font-sans tracking-wide uppercase max-w-xl mx-auto">
          {dressCode.description}
        </p>
      </div>

      {/* Dress Code Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {visibleCards.map((card, idx) => (
          <motion.div
            key={card.id || idx}
            initial={{ opacity: 0, x: idx % 2 === 0 ? -20 : 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="p-8 rounded-3xl liquid-glass border border-white/15 shadow-2xl flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-300/30 flex items-center justify-center text-amber-300">
                  <Sparkles className="w-6 h-6 text-amber-300" />
                </div>
                <div>
                  <span className="font-mono text-[10px] text-amber-300/70 uppercase tracking-widest block">{card.gender}</span>
                  <h3 className="font-cinzel text-xl text-amber-100 font-medium">{card.title}</h3>
                </div>
              </div>

              <p className="text-xs text-amber-100/80 leading-relaxed font-sans mb-6">
                {card.description}
              </p>

              {card.items && card.items.length > 0 && (
                <div className="space-y-2 mb-6">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-amber-200/60 block">
                    Recomendaciones
                  </span>
                  <ul className="space-y-1.5">
                    {card.items.map((item, i) => (
                      <li key={i} className="text-xs text-amber-100/90 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {dressCode.rulesNotice && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-400/20 text-[11px] text-amber-200/90 font-serif italic flex items-center gap-2 mt-4">
                <Info className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{dressCode.rulesNotice}</span>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </section>
  );
};
