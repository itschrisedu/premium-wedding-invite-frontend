import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, Shirt, Palette, Info } from 'lucide-react';

export const DressCodeSection: React.FC = () => {
  return (
    <section id="dress-code" className="relative py-24 px-6 max-w-5xl mx-auto">
      {/* Section Header */}
      <div className="text-center mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full backdrop-blur-xl bg-white/10 border border-white/20 text-orange-300 text-[10px] font-bold uppercase tracking-[0.4em] mb-3"
        >
          <Shirt className="w-3.5 h-3.5 text-orange-400" />
          <span>Etiqueta del Evento</span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-6xl font-extrabold uppercase tracking-tight text-white"
        >
          Dress Code: <span className="italic font-serif font-normal text-amber-200">Rigurosa Etiqueta</span>
        </motion.h2>

        <p className="mt-3 text-xs sm:text-sm text-white/70 font-sans tracking-wide uppercase max-w-xl mx-auto">
          Queremos que te sientas espectacular en una noche inolvidable de gala.
        </p>
      </div>

      {/* Dress Code Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Dames Card */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
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
                <span className="font-mono text-[10px] text-amber-300/70 uppercase tracking-widest block">Damas</span>
                <h3 className="font-cinzel text-xl text-amber-100 font-medium">Vestido Largo de Gala</h3>
              </div>
            </div>

            <p className="text-xs text-amber-100/80 leading-relaxed font-sans mb-6">
              Sugerimos vestidos largos de noche de corte elegante y sofisticado. Ideales para la brisa fresca de la noche en Quinta Loren.
            </p>

            {/* Recommended Palette */}
            <div className="space-y-2 mb-6">
              <span className="text-[10px] font-mono uppercase tracking-widest text-amber-200/60 flex items-center gap-1">
                <Palette className="w-3 h-3 text-amber-400" />
                Paleta de Colores Sugerida
              </span>
              <div className="flex items-center gap-3 pt-1">
                <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full text-xs text-amber-100">
                  <span className="w-3 h-3 rounded-full bg-[#d4af37] border border-white/30" />
                   Champán / Oro
                </div>
                <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full text-xs text-amber-100">
                  <span className="w-3 h-3 rounded-full bg-[#046307] border border-white/30" />
                   Esmeralda
                </div>
                <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full text-xs text-amber-100">
                  <span className="w-3 h-3 rounded-full bg-[#9e2a2b] border border-white/30" />
                   Borgoña
                </div>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-400/20 text-[11px] text-amber-200/90 font-serif italic flex items-center gap-2">
            <Info className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Nota: Agradecemos reservar el tono blanco y marfil exclusivamente para la novia.</span>
          </div>
        </motion.div>

        {/* Gentlemen Card */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="p-8 rounded-3xl liquid-glass border border-white/15 shadow-2xl flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-300/30 flex items-center justify-center text-amber-300">
                <Shirt className="w-6 h-6 text-amber-300" />
              </div>
              <div>
                <span className="font-mono text-[10px] text-amber-300/70 uppercase tracking-widest block">Caballeros</span>
                <h3 className="font-cinzel text-xl text-amber-100 font-medium">Traje Formal o Esmoquin</h3>
              </div>
            </div>

            <p className="text-xs text-amber-100/80 leading-relaxed font-sans mb-6">
              Traje oscuro (negro, azul noche o gris marengo) con corbata o corbatín, camisa blanca impecable y calzado formal de vestir.
            </p>

            {/* Suggested Styles */}
            <div className="space-y-2 mb-6">
              <span className="text-[10px] font-mono uppercase tracking-widest text-amber-200/60 flex items-center gap-1">
                <Palette className="w-3 h-3 text-amber-400" />
                Tonos Preferidos
              </span>
              <div className="flex items-center gap-3 pt-1">
                <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full text-xs text-amber-100">
                  <span className="w-3 h-3 rounded-full bg-[#0a0a0a] border border-white/30" />
                   Negro Smoking
                </div>
                <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full text-xs text-amber-100">
                  <span className="w-3 h-3 rounded-full bg-[#0b1d3a] border border-white/30" />
                   Azul Noche
                </div>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-400/20 text-[11px] text-amber-200/90 font-serif italic flex items-center gap-2">
            <Info className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Black Tie / Traje de Etiqueta Obligatorio.</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
