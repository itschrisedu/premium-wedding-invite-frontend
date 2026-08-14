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
import { weddingConfigService } from './services/weddingConfigService';
import { Heart, UserCheck } from 'lucide-react';

export default function App() {
  const [showLoader, setShowLoader] = useState(true);
  const [autoPlayMusic, setAutoPlayMusic] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isGuestSelectorOpen, setIsGuestSelectorOpen] = useState(false);
  const [currentGuest, setCurrentGuest] = useState<Guest | undefined>(undefined);
  const [appUrl, setAppUrl] = useState<string>('');
  const [config, setConfig] = useState(weddingConfigService.getConfig());

  useEffect(() => {
    const unsub = weddingConfigService.subscribe(() => {
      setConfig(weddingConfigService.getConfig());
    });
    return unsub;
  }, []);

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
          setCurrentGuest(found);
        }
      };

      void bootstrap();
    }
  }, []);

  const handleLoaderComplete = () => {
    setShowLoader(false);
    setAutoPlayMusic(true);
    // Always start at the top (Hero/Portada)
    window.scrollTo(0, 0);
  };

  const handleSelectGuest = (guest: Guest) => {
    setCurrentGuest(guest);
    setIsGuestSelectorOpen(false);
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

  const vis = config.sectionVisibility;

  return (
    <div className="min-h-screen bg-[var(--color-bg-base)] text-[var(--color-text-primary)] relative font-sans selection:bg-[var(--color-gold)]/30 selection:text-white">
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
      {vis.hero !== false && (
        <HeroSection
          currentGuest={currentGuest}
          onExploreClick={scrollToStory}
        />
      )}

      {/* 5. Nuestra Historia & Timeline */}
      {vis.story !== false && <StorySection />}

      {/* 6. Galería Tipo Revista */}
      {vis.gallery !== false && <GallerySection />}

      {/* 7. Video Reel de los Novios */}
      {vis.video !== false && <CoupleVideoSection />}

      {/* 8. Cuenta Regresiva Animada */}
      {vis.countdown !== false && <CountdownSection />}

      {/* 9. Detalles del Evento & Google Maps */}
      {vis.eventDetails !== false && <EventDetailsSection />}

      {/* 10. Dress Code con Ilustraciones */}
      {vis.dressCode !== false && <DressCodeSection />}

      {/* 11. Mesa de Regalos */}
      {vis.giftRegistry !== false && <GiftRegistrySection />}

      {/* 12. Confirmación RSVP Personalizada */}
      {vis.rsvp !== false && (
        <RSVPSection
          currentGuest={currentGuest}
          onSelectGuest={handleSelectGuest}
        />
      )}

      {/* 13. Panel Administrativo Modal */}
      <AdminPanel
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        appUrl={appUrl}
      />

      {/* GUEST SELECTOR MODAL DRAWER (para pruebas admin) */}
        <Modal
        isOpen={isGuestSelectorOpen}
        onClose={() => setIsGuestSelectorOpen(false)}
        title="Probar Invitación Personal"
        titleIcon={<UserCheck className="w-4 h-4 text-[var(--color-gold-light)]" />}
        size="md"
      >
        <div className="space-y-4">
          <p className="text-xs text-[#EAF0E6]/70 font-serif italic">
            Selecciona un invitado para probar su enlace personalizado:
          </p>

          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {storageService.getGuests().map(g => (
              <button
                key={g.id}
                onClick={() => handleSelectGuest(g)}
                className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                  currentGuest?.id === g.id
                    ? 'gold-gradient-bg text-white font-semibold border-[var(--color-gold)]'
                    : 'bg-[#3A4B37] border-[var(--color-border-soft)]/30 hover:border-[var(--color-gold-light)]/40 text-[#EAF0E6]'
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
      <footer className="py-12 px-6 text-center border-t border-[var(--color-border-soft)]/20 bg-[var(--color-bg-elevated)] text-xs text-[var(--color-text-muted)] font-serif italic space-y-2">
        <div className="flex items-center justify-center gap-2">
          <Heart className="w-4 h-4 text-[var(--color-accent)] fill-[var(--color-accent)]" />
          <span className="font-cinzel text-[var(--color-text-primary)] text-sm">{config.hero.groom} & {config.hero.bride}</span>
        </div>
        <p>{config.hero.dateFormatted} • {config.hero.city}</p>
        <p className="text-[10px] font-mono uppercase tracking-widest text-[var(--color-gold-dark)]/50 pt-2">
          Experiencia Nupcial Exclusiva Multitenant
        </p>
      </footer>
    </div>
  );
}
