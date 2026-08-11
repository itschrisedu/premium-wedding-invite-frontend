import React from 'react';
import { motion } from 'motion/react';
import { Heart, MapPin, Sparkles, BookOpen } from 'lucide-react';
import { LOVE_STORY_CHAPTERS, COUPLE_INFO } from '../data/weddingData';

export const StorySection: React.FC = () => {
  return (
    <section id="historia" className="relative py-24 px-6 max-w-6xl mx-auto overflow-hidden">
      {/* Decorative Glow */}
      <div className="absolute top-1/2 left-0 w-80 h-80 bg-amber-500/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Section Header */}
      <div className="text-center mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full backdrop-blur-xl bg-white/10 border border-white/20 text-orange-300 text-[10px] font-bold uppercase tracking-[0.4em] mb-3"
        >
          <BookOpen className="w-3.5 h-3.5 text-orange-400" />
          <span>El Comienzo del Viaje</span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-6xl font-extrabold uppercase tracking-tight text-white"
        >
          Nuestra <span className="italic font-serif font-normal text-amber-200">Historia</span>
        </motion.h2>

        <p className="mt-3 text-xs sm:text-sm text-white/70 font-sans tracking-wide uppercase max-w-xl mx-auto">
          Inspirados por la calidez de Ambato, sus valles fértiles y atardeceres andinos.
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
          <div className="relative rounded-2xl overflow-hidden liquid-glass border border-white/20 shadow-2xl p-2">
            <img
              src={COUPLE_INFO.storyImage}
              alt="Mateo Andrade y Camila Viteri en Ficoa Ambato"
              className="w-full h-[480px] object-cover rounded-xl filter contrast-[1.03]"
            />
            {/* Glass Tag Overlay */}
            <div className="absolute bottom-6 left-6 right-6 p-4 rounded-xl glass-panel border border-white/20 backdrop-blur-md">
              <div className="flex items-center justify-between text-amber-100 text-xs font-serif italic">
                <span>"Cada día a tu lado es mi lugar favorito."</span>
                <Heart className="w-4 h-4 text-amber-400 fill-amber-400" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right: Animated Timeline */}
        <div className="lg:col-span-7 relative">
          {/* Vertical Connecting Line */}
          <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-gradient-to-b from-amber-400/40 via-amber-300/20 to-transparent" />

          <div className="space-y-8 pl-10">
            {LOVE_STORY_CHAPTERS.map((chapter, index) => (
              <motion.div
                key={chapter.year}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                className="relative group"
              >
                {/* Timeline Dot Node */}
                <div className="absolute -left-[42px] top-1.5 w-7 h-7 rounded-full liquid-glass border border-amber-300/50 flex items-center justify-center text-amber-300 group-hover:scale-125 transition-transform bg-[#0d0c0a]">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>

                {/* Content Card */}
                <div className="p-6 rounded-2xl glass-panel border border-white/10 hover:border-amber-300/30 transition-all duration-300 group-hover:bg-white/[0.05]">
                  <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                    <span className="font-mono text-xs text-amber-400 font-semibold uppercase tracking-widest bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-400/20">
                      {chapter.year}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-amber-200/60 font-mono">
                      <MapPin className="w-3 h-3 text-amber-400" />
                      {chapter.location}
                    </span>
                  </div>

                  <h3 className="font-cinzel text-xl text-amber-100 font-medium mb-2">
                    {chapter.title}
                  </h3>

                  <p className="text-sm text-amber-100/80 leading-relaxed font-sans">
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
