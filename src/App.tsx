import React, { useState, useEffect } from 'react';
import { LoaderScreen } from './components/LoaderScreen';
import { HeaderNav } from './components/HeaderNav';
import { HeroSection } from './components/HeroSection';
import { StorySection } from './components/StorySection';
import { GallerySection } from './components/GallerySection';
import { CoupleVideoSection } from './components/CoupleVideoSection';
import { CountdownSection } from './components/CountdownSection';
import { EventDetailsSection } from './components/EventDetailsSection';
import { DressCodeSection } from './components/DressCodeSection';
import { GiftRegistrySection } from './components/GiftRegistrySection';
import { RSVPSection } from './components/RSVPSection';
import { AdminPanel } from './components/AdminPanel';
import { AudioPlayer } from './components/AudioPlayer';
import { Modal } from './components/ui/Modal';
import { Guest } from './types';
import { storageService } from './services/storageService';
import { Heart, Sparkles, UserCheck, X } from 'lucide-react';

export default function App() {
  const [showLoader, setShowLoader] = useState(true);
  const [autoPlayMusic, setAutoPlayMusic] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isGuestSelectorOpen, setIsGuestSelectorOpen] = useState(false);
  const [currentGuest, setCurrentGuest] = useState<Guest | undefined>(undefined);
  const [appUrl, setAppUrl] = useState<string>('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setAppUrl(window.location.origin + window.location.pathname);

      const bootstrap = async () => {
        const guests = await storageService.refreshGuests();
        const urlParams = new URLSearchParams(window.location.search);
        const codeParam = urlParams.get('invitado') || urlParams.get('guest');

        if (codeParam) {
          const normalized = codeParam.toLowerCase().trim();
          const found = guests.find(guest => guest.code.toLowerCase() === normalized || guest.id.toLowerCase() === normalized);
          setCurrentGuest(found ?? guests[0]);
        } else if (guests.length > 0) {
          setCurrentGuest(guests[0]);
        }
      };

      void bootstrap();
    }
  }, []);

  const handleLoaderComplete = () => {
    setShowLoader(false);
    setAutoPlayMusic(true);
  };

  const handleSelectGuest = (guest: Guest) => {
    setCurrentGuest(guest);
    setIsGuestSelectorOpen(false);
    // Update URL quietly without reload
    const newUrl = `${window.location.pathname}?invitado=${guest.code}`;
    window.history.pushState({ path: newUrl }, '', newUrl);
  };

  const scrollToRSVP = () => {
    const elem = document.getElementById('confirmacion');
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToStory = () => {
    const elem = document.getElementById('historia');
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0c0a] text-[#ece8e1] relative font-sans selection:bg-[#d4af37]/30 selection:text-[#f8f5ee]">
      {/* 1. Loader Screen */}
      {showLoader && <LoaderScreen onComplete={handleLoaderComplete} />}

      {/* 2. Audio Player Floating Control */}
      <AudioPlayer autoPlayTriggered={autoPlayMusic} />

      {/* 3. Floating Liquid Glass Header Navigation */}
      {!showLoader && (
        <HeaderNav
          currentGuest={currentGuest}
          onOpenAdmin={() => setIsAdminOpen(true)}
          onOpenGuestSelector={() => setIsGuestSelectorOpen(true)}
          onScrollToRSVP={scrollToRSVP}
        />
      )}

      {/* 4. Fullscreen Portada Hero */}
      <HeroSection
        currentGuest={currentGuest}
        onExploreClick={scrollToStory}
      />

      {/* 5. Nuestra Historia & Timeline */}
      <StorySection />

      {/* 6. Galería Tipo Revista */}
      <GallerySection />

      {/* 7. Video Reel de los Novios */}
      <CoupleVideoSection />

      {/* 8. Cuenta Regresiva Animada */}
      <CountdownSection />

      {/* 9. Detalles del Evento & Google Maps */}
      <EventDetailsSection />

      {/* 10. Dress Code con Ilustraciones */}
      <DressCodeSection />

      {/* 11. Mesa de Regalos */}
      <GiftRegistrySection />

      {/* 12. Confirmación RSVP Personalizada */}
      <RSVPSection
        currentGuest={currentGuest}
        onSelectGuest={handleSelectGuest}
      />

      {/* 13. Panel Administrativo Modal */}
      <AdminPanel
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        appUrl={appUrl}
      />
      {/* GUEST SELECTOR MODAL DRAWER */}
      <Modal
        isOpen={isGuestSelectorOpen}
        onClose={() => setIsGuestSelectorOpen(false)}
        title="Probar Invitación Personal"
        titleIcon={<UserCheck className="w-4 h-4 text-amber-400" />}
        size="md"
      >
        <div className="space-y-4">
          <p className="text-xs text-amber-200/70 font-serif italic">
            Selecciona un invitado para ver cómo luce su enlace personalizado:
          </p>

          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {storageService.getGuests().map(g => (
              <button
                key={g.id}
                onClick={() => handleSelectGuest(g)}
                className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                  currentGuest?.id === g.id
                    ? 'gold-gradient-bg text-amber-950 font-semibold border-amber-300'
                    : 'glass-panel border-white/10 hover:border-white/20 text-amber-100'
                }`}
              >
                <div>
                  <strong className="text-xs block">{g.name}</strong>
                  <span className="text-[10px] opacity-80 font-mono">
                    {g.category} • {g.passesAllowed} Pases
                  </span>
                </div>
                <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-black/20">
                  {g.status}
                </span>
              </button>
            ))}
          </div>
        </div>
      </Modal>

      {/* Footer */}
      <footer className="py-12 px-6 text-center border-t border-white/10 bg-[#0a0908] text-xs text-amber-200/60 font-serif italic space-y-2">
        <div className="flex items-center justify-center gap-2">
          <Heart className="w-4 h-4 text-amber-400 fill-amber-400" />
          <span className="font-cinzel text-amber-100 text-sm">Mateo Andrade & Camila Viteri</span>
        </div>
        <p>14 de Noviembre de 2026 • Quinta Loren, Ambato, Ecuador</p>
        <p className="text-[10px] font-mono uppercase tracking-widest text-amber-400/50 pt-2">
          Experiencia Interactiva de Boda Realizada con Excelencia
        </p>
      </footer>
    </div>
  );
}
