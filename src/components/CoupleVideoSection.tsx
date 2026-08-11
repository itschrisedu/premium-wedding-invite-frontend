import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Play, Pause, Video, Film, Sparkles, Volume2, VolumeX } from 'lucide-react';
import { COUPLE_INFO } from '../data/weddingData';

export const CoupleVideoSection: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  return (
    <section id="video" className="relative py-24 px-6 max-w-6xl mx-auto overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 right-0 w-96 h-96 bg-amber-400/10 rounded-full blur-[150px] pointer-events-none" />

      {/* Section Header */}
      <div className="text-center mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full backdrop-blur-xl bg-white/10 border border-white/20 text-orange-300 text-[10px] font-bold uppercase tracking-[0.4em] mb-3"
        >
          <Video className="w-3.5 h-3.5 text-orange-400" />
          <span>Film Nupcial Teaser</span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-6xl font-extrabold uppercase tracking-tight text-white"
        >
          Momentos en <span className="italic font-serif font-normal text-amber-200">Movimiento</span>
        </motion.h2>

        <p className="mt-3 text-xs sm:text-sm text-white/70 font-sans tracking-wide uppercase max-w-xl mx-auto">
          Un adelanto cinematográfico de nuestra historia grabado en los miradores de Tungurahua.
        </p>
      </div>

      {/* Video Container Frame */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="relative rounded-3xl overflow-hidden liquid-glass border border-white/20 shadow-2xl p-3 md:p-4 max-w-4xl mx-auto"
      >
        <div className="relative aspect-video rounded-2xl overflow-hidden bg-black group">
          {/* Mock Video / High Res Ambient Loop Visual */}
          <img
            src={COUPLE_INFO.videoPoster}
            alt="Trailer de boda Mateo y Camila"
            className={`w-full h-full object-cover transition-all duration-700 ${
              isPlaying ? 'scale-105 filter contrast-110' : 'scale-100 brightness-75'
            }`}
          />

          {/* Animated Overlay during play */}
          {isPlaying && (
            <div className="absolute inset-0 bg-amber-900/10 mix-blend-overlay pointer-events-none" />
          )}

          {/* Play/Pause Overlay Button */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-[2px] transition-opacity group-hover:bg-black/20">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              id="btn-toggle-video"
              className="p-6 rounded-full liquid-glass border border-amber-300/50 text-amber-100 shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 group-hover:border-amber-300 cursor-pointer"
            >
              {isPlaying ? (
                <Pause className="w-8 h-8 text-amber-300" />
              ) : (
                <Play className="w-8 h-8 text-amber-300 fill-amber-300 ml-1" />
              )}
            </button>
          </div>

          {/* Top Video Bar */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-amber-200 text-xs font-mono">
              <Film className="w-3.5 h-3.5 text-amber-400" />
              <span>MATEO & CAMILA — CINEMATIC PRE-WEDDING</span>
            </div>

            <button
              onClick={() => setIsMuted(!isMuted)}
              className="pointer-events-auto p-2 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-amber-200 hover:text-amber-400 transition-colors"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </div>

          {/* Bottom Video Quote Overlay */}
          <div className="absolute bottom-4 left-4 right-4 p-4 rounded-xl bg-gradient-to-t from-black/90 via-black/40 to-transparent backdrop-blur-sm border-t border-white/10 flex items-center justify-between text-xs text-amber-100/90 font-serif italic">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>"El amor no se mira con los ojos, sino con el corazón."</span>
            </div>
            <span className="font-mono text-[10px] text-amber-300/80 uppercase tracking-widest hidden sm:inline">
              Ambato, Ecuador • 4K HDR
            </span>
          </div>
        </div>
      </motion.div>
    </section>
  );
};
