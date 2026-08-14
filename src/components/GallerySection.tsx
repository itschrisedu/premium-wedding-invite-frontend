import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Camera, MapPin, ChevronLeft, ChevronRight, Maximize2, CloudUpload, LayoutGrid, Sliders } from 'lucide-react';
import { GALLERY_IMAGES } from '../data/weddingData';
import { GalleryImage } from '../types';
import { galleryService } from '../services/galleryService';
import { API_BASE_URL } from '../services/apiService';
import { Modal } from './ui/Modal';
import { weddingConfigService } from '../services/weddingConfigService';

type DisplayImage = GalleryImage & { backend?: boolean; contentUrl?: string };

export const GallerySection: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<DisplayImage | null>(null);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [uploadedImages, setUploadedImages] = useState<DisplayImage[]>([]);
  const [galleryConfig, setGalleryConfig] = useState(weddingConfigService.getConfig().galleryConfig);
  const [carouselIndex, setCarouselIndex] = useState<number>(0);

  useEffect(() => {
    const unsub = weddingConfigService.subscribe(() => {
      setGalleryConfig(weddingConfigService.getConfig().galleryConfig);
    });
    return unsub;
  }, []);

  useEffect(() => {
    const loadUploaded = async () => {
      try {
        const photos = await galleryService.getPhotosByDefaultAlbum();
        const converted: DisplayImage[] = photos.map(photo => ({
          id: photo.id,
          url: `${API_BASE_URL}${photo.contentUrl}`,
          title: photo.title,
          locationTag: 'Subida Administrativa',
          caption: 'Fotografía cargada desde el panel administrativo.',
          aspectRatio: 'square',
          backend: true,
          contentUrl: photo.contentUrl
        }));
        setUploadedImages(converted);
      } catch {
        setUploadedImages([]);
      }
    };

    void loadUploaded();
  }, []);

  const galleryItems = [...GALLERY_IMAGES, ...uploadedImages];

  const openLightbox = (img: DisplayImage, idx: number) => {
    setSelectedImage(img);
    setCurrentIndex(idx);
  };

  const closeLightbox = () => setSelectedImage(null);

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextIdx = (currentIndex + 1) % galleryItems.length;
    setCurrentIndex(nextIdx);
    setSelectedImage(galleryItems[nextIdx]);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    const prevIdx = (currentIndex - 1 + galleryItems.length) % galleryItems.length;
    setCurrentIndex(prevIdx);
    setSelectedImage(galleryItems[prevIdx]);
  };

  const nextCarousel = () => {
    setCarouselIndex(prev => (prev + 1) % galleryItems.length);
  };

  const prevCarousel = () => {
    setCarouselIndex(prev => (prev - 1 + galleryItems.length) % galleryItems.length);
  };

  return (
    <section id="galeria" className="relative py-24 px-6 max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--color-bg-elevated)] border border-[var(--color-gold)] text-[var(--color-gold-dark)] text-[10px] font-bold uppercase tracking-[0.4em] mb-3 shadow-sm"
        >
          <Camera className="w-3.5 h-3.5 text-[var(--color-accent)]" />
          <span>Sesión Preboda Editorial</span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-6xl font-extrabold uppercase tracking-tight text-[var(--color-text-primary)]"
        >
          Galería de <span className="italic font-serif font-bold text-[var(--color-accent)]">Recuerdos</span>
        </motion.h2>

        <p className="mt-3 text-xs sm:text-sm text-[var(--color-text-muted)] font-bold tracking-wide uppercase max-w-xl mx-auto">
          Capturas en Golden Hour y momentos inolvidables.
        </p>
      </div>

      {uploadedImages.length > 0 && (
        <div className="mb-8 flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-[var(--color-text-muted)] font-bold font-mono justify-center">
          <CloudUpload className="w-4 h-4 text-[var(--color-accent)]" />
          <span>Fotos subidas activas</span>
        </div>
      )}

      {/* CAROUSEL MODE */}
      {galleryConfig.layoutStyle === 'carousel' ? (
        <div className="relative max-w-4xl mx-auto">
          <div className="overflow-hidden rounded-3xl liquid-glass border border-white/20 p-4 shadow-2xl relative">
            {galleryItems.length > 0 && (
              <div className="relative aspect-[16/10] overflow-hidden rounded-2xl">
                <img
                  src={galleryItems[carouselIndex].url}
                  alt={galleryItems[carouselIndex].title}
                  className="w-full h-full object-cover transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent p-6 flex flex-col justify-end">
                  <span className="text-xs font-mono text-amber-300 uppercase tracking-widest flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-amber-400" />
                    {galleryItems[carouselIndex].locationTag}
                  </span>
                  <h3 className="font-cinzel text-2xl text-white font-medium">{galleryItems[carouselIndex].title}</h3>
                  <p className="text-xs text-amber-100/80 font-serif italic">{galleryItems[carouselIndex].caption}</p>
                </div>
              </div>
            )}

            <button
              onClick={prevCarousel}
              className="absolute left-6 top-1/2 -translate-y-1/2 p-3 rounded-full liquid-glass border border-white/20 text-white hover:text-amber-300 transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={nextCarousel}
              className="absolute right-6 top-1/2 -translate-y-1/2 p-3 rounded-full liquid-glass border border-white/20 text-white hover:text-amber-300 transition-colors"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          <div className="flex items-center justify-center gap-2 mt-4">
            {galleryItems.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCarouselIndex(idx)}
                className={`w-2.5 h-2.5 rounded-full transition-all cursor-pointer ${
                  carouselIndex === idx ? 'bg-amber-400 w-8' : 'bg-white/30 hover:bg-white/60'
                }`}
              />
            ))}
          </div>
        </div>
      ) : (
        /* GRID & MASONRY MODE */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {galleryItems.map((img, idx) => (
            <motion.div
              key={img.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.05 }}
              onClick={() => openLightbox(img, idx)}
              className="group relative cursor-pointer overflow-hidden rounded-2xl glass-panel border border-white/10 hover:border-amber-300/40 transition-all duration-500 shadow-xl"
            >
              <div className="aspect-[4/5] overflow-hidden">
                <img
                  src={img.url}
                  alt={img.title}
                  className="w-full h-full object-cover object-center group-hover:scale-108 transition-transform duration-700 ease-out filter brightness-95 group-hover:brightness-105"
                />
              </div>

              <div className="absolute inset-0 bg-gradient-to-t from-[#0d0c0a]/90 via-[#0d0c0a]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-6 flex flex-col justify-end">
                <div className="flex items-center justify-between text-amber-300 text-xs font-mono mb-1">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-amber-400" />
                    {img.locationTag}
                  </span>
                  <Maximize2 className="w-4 h-4 text-amber-200" />
                </div>
                <h3 className="font-cinzel text-lg text-amber-100 font-medium">{img.title}</h3>
                <p className="text-xs text-amber-100/80 font-serif italic mt-1 line-clamp-2">
                  {img.caption}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <Modal
        isOpen={Boolean(selectedImage && galleryItems.length > 0)}
        onClose={closeLightbox}
        size="full"
      >
        <div className="relative flex items-center justify-center min-h-[60vh]">
          <button
            onClick={prevImage}
            className="absolute left-2 z-50 p-3 rounded-full liquid-glass border border-white/20 text-white hover:text-amber-300 transition-colors cursor-pointer"
            aria-label="Imagen anterior"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            onClick={nextImage}
            className="absolute right-2 z-50 p-3 rounded-full liquid-glass border border-white/20 text-white hover:text-amber-300 transition-colors cursor-pointer"
            aria-label="Imagen siguiente"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {selectedImage && (
            <div className="relative max-w-4xl max-h-[80vh] rounded-2xl overflow-hidden liquid-glass border border-white/20 p-2">
              <img
                src={selectedImage.url}
                alt={selectedImage.title}
                className="max-w-full max-h-[65vh] object-contain rounded-xl mx-auto"
              />

              <div className="p-4 text-center bg-[#0d0c0a]/80 backdrop-blur-md rounded-b-xl border-t border-white/10 mt-2">
                <span className="text-xs font-mono text-amber-400 uppercase tracking-widest flex items-center justify-center gap-1 mb-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {selectedImage.locationTag}
                </span>
                <h3 className="font-cinzel text-xl text-amber-100 font-medium">{selectedImage.title}</h3>
                <p className="text-xs text-amber-200/80 font-serif italic mt-1">"{selectedImage.caption}"</p>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </section>
  );
};
