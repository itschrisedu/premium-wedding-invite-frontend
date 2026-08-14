import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Pause, Video, Film, Sparkles, Volume2, VolumeX, ChevronLeft, ChevronRight } from 'lucide-react';
import { GALLERY_IMAGES } from '../data/weddingData';
import { weddingConfigService } from '../services/weddingConfigService';
import { galleryService } from '../services/galleryService';
import { API_BASE_URL } from '../services/apiService';

export const CoupleVideoSection: React.FC = () => {
  const [config, setConfig] = useState(weddingConfigService.getConfig());
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [slideIndex, setSlideIndex] = useState(0);
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);

  useEffect(() => {
    const unsub = weddingConfigService.subscribe(() => {
      setConfig(weddingConfigService.getConfig());
    });
    return unsub;
  }, []);

  useEffect(() => {
    const loadPhotos = async () => {
      try {
        const photos = await galleryService.getPhotosByDefaultAlbum();
        if (photos.length > 0) {
          setUploadedPhotos(photos.map(p => `${API_BASE_URL}${p.contentUrl}`));
        }
      } catch {
        // ignore
      }
    };
    void loadPhotos();
  }, []);

  // Combine static and uploaded gallery photos, cap at max 9
  const slideshowImages = [
    ...(uploadedPhotos.length > 0 ? uploadedPhotos : []),
    ...GALLERY_IMAGES.map(g => g.url)
  ].slice(0, 9);

  // Auto-advance slideshow if playing
  useEffect(() => {
    if (!isPlaying || slideshowImages.length === 0) return;
    const timer = setInterval(() => {
      setSlideIndex(prev => (prev + 1) % slideshowImages.length);
    }, 4000);

    return () => clearInterval(timer);
  }, [isPlaying, slideshowImages.length]);

  const videoCfg = config.videoConfig || {
    mode: 'slideshow',
    videoUrl: '',
    videoTitle: `${config.hero.groom || 'Mateo'} & ${config.hero.bride || 'Camila'} — FILM NUPCIAL`,
    posterUrl: config.hero.coverImage,
    quote: '"El amor no se mira con los ojos, sino con el corazón."'
  };

  const isVideoUrl = videoCfg.mode === 'video' && Boolean(videoCfg.videoUrl);

  const getYouTubeEmbedUrl = (url: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? `https://www.youtube.com/embed/${match[2]}?autoplay=1&mute=${isMuted ? 1 : 0}&loop=1` : null;
  };

  const embedUrl = isVideoUrl ? getYouTubeEmbedUrl(videoCfg.videoUrl) : null;

  return (
    <section id="video" className="relative py-24 px-6 max-w-6xl mx-auto overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 right-0 w-96 h-96 bg-[var(--color-gold)]/10 rounded-full blur-[150px] pointer-events-none" />

      {/* Section Header */}
      <div className="text-center mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--color-bg-elevated)] border border-[var(--color-gold)] text-[var(--color-gold-dark)] text-[10px] font-bold uppercase tracking-[0.4em] mb-3 shadow-sm"
        >
          <Video className="w-3.5 h-3.5 text-[var(--color-accent)]" />
          <span>Film Nupcial & Recuerdos</span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-6xl font-extrabold uppercase tracking-tight text-[var(--color-text-primary)]"
        >
          Momentos en <span className="italic font-serif font-bold text-[var(--color-accent)]">Movimiento</span>
        </motion.h2>

        <p className="mt-3 text-xs sm:text-sm text-[var(--color-text-muted)] font-bold tracking-wide uppercase max-w-xl mx-auto">
          {videoCfg.mode === 'slideshow' ? 'Galería animada de fotos en alta resolución de la preboda.' : 'Un adelanto cinematográfico de nuestra historia.'}
        </p>
      </div>

      {/* Video Container Frame */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="relative rounded-3xl overflow-hidden liquid-glass border border-[var(--color-border-light)] shadow-2xl p-3 md:p-4 max-w-4xl mx-auto"
      >
        <div className="relative aspect-video rounded-2xl overflow-hidden bg-black group">
          {/* EMBED YOUTUBE VIDEO MODE */}
          {isVideoUrl && embedUrl ? (
            <iframe
              src={embedUrl}
              title={videoCfg.videoTitle || 'Video de Boda'}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : isVideoUrl && videoCfg.videoUrl.endsWith('.mp4') ? (
            /* MP4 DIRECT VIDEO */
            <video
              src={videoCfg.videoUrl}
              controls
              autoPlay
              loop
              muted={isMuted}
              className="w-full h-full object-cover"
            />
          ) : (
            /* AUTOMATIC PHOTO VIDEO SLIDESHOW MODE */
            <div className="relative w-full h-full overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.img
                  key={slideIndex}
                  src={slideshowImages[slideIndex]}
                  alt="Momento en movimiento"
                  initial={{ opacity: 0, scale: 1.15 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 1.2, ease: 'easeInOut' }}
                  className="w-full h-full object-cover filter contrast-[1.03]"
                />
              </AnimatePresence>

              {/* Ken Burns Overlay Effect */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />

              {/* Manual Nav Controls */}
              <div className="absolute inset-0 flex items-center justify-between px-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => setSlideIndex(prev => (prev - 1 + slideshowImages.length) % slideshowImages.length)}
                  className="p-3 rounded-full bg-black/50 text-white hover:bg-black/80 transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setSlideIndex(prev => (prev + 1) % slideshowImages.length)}
                  className="p-3 rounded-full bg-black/50 text-white hover:bg-black/80 transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Play / Pause Toggle Button */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="pointer-events-auto p-5 rounded-full bg-black/60 border border-white/30 text-white shadow-2xl hover:scale-110 active:scale-95 transition-transform cursor-pointer"
                >
                  {isPlaying ? <Pause className="w-7 h-7 text-[var(--color-gold-light)]" /> : <Play className="w-7 h-7 text-[var(--color-gold-light)] ml-1" />}
                </button>
              </div>
            </div>
          )}

          {/* Top Video Bar */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white/90 text-xs font-mono">
              <Film className="w-3.5 h-3.5 text-[var(--color-gold-light)]" />
              <span>{videoCfg.videoTitle || `${config.hero.groom} & ${config.hero.bride} — FILM NUPCIAL`}</span>
            </div>

            {slideshowImages.length > 0 && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-emerald-300 text-xs font-mono font-bold">
                <span>Foto {slideIndex + 1} de {slideshowImages.length}</span>
              </div>
            )}
          </div>

          {/* Bottom Video Quote Overlay */}
          <div className="absolute bottom-4 left-4 right-4 p-4 rounded-xl bg-gradient-to-t from-black/90 via-black/40 to-transparent backdrop-blur-sm border-t border-white/10 flex items-center justify-between text-xs text-white/90 font-serif italic z-10">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[var(--color-gold-light)]" />
              <span>{videoCfg.quote || '"El amor no se mira con los ojos, sino con el corazón."'}</span>
            </div>
            <span className="font-mono text-[10px] text-[var(--color-gold-light)]/80 uppercase tracking-widest hidden sm:inline">
              {config.hero.city} • HD Nupcial
            </span>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

