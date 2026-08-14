import { COUPLE_INFO, TIMELINE_EVENTS, LOVE_STORY_CHAPTERS, VENUES, BANK_DETAILS } from '../data/weddingData';
import { ELEGANT_WEDDING_THEMES, ThemePalette, applyTheme } from '../data/weddingThemes';
import { TimelineEvent, EventVenue, BankDetail } from '../types';

export interface SectionVisibility {
  hero: boolean;
  story: boolean;
  gallery: boolean;
  video: boolean;
  countdown: boolean;
  eventDetails: boolean;
  dressCode: boolean;
  giftRegistry: boolean;
  rsvp: boolean;
}

export interface AudioConfig {
  url: string;
  title: string;
  artist: string;
  autoPlay: boolean;
  loop: boolean;
}

export interface DynamicTimelineEvent extends TimelineEvent {
  id: string;
  isVisible: boolean;
}

export interface DynamicLoveStoryChapter {
  id: string;
  year: string;
  title: string;
  location: string;
  content: string;
  isVisible: boolean;
}

export interface DynamicVenue extends EventVenue {
  id: string;
  isVisible: boolean;
}

export interface DynamicBankAccount extends BankDetail {
  id: string;
  isVisible: boolean;
}

export interface DressCodeCard {
  id: string;
  title: string;
  gender: string;
  description: string;
  items: string[];
  isVisible: boolean;
}

export interface VideoSectionConfig {
  mode: 'video' | 'slideshow';
  videoUrl: string;
  videoTitle: string;
  posterUrl: string;
  quote: string;
}

export interface WeddingSiteConfig {
  themeId: string;
  customThemeColors?: ThemePalette['colors'];
  audio: AudioConfig;
  videoConfig: VideoSectionConfig;
  loaderText?: string;
  loaderSubtitle?: string;
  hero: {
    groom: string;
    bride: string;
    weddingDate: string;
    dateFormatted: string;
    city: string;
    quote: string;
    hashtag: string;
    coverImage: string;
    secondaryImage?: string;
  };
  loveStory: DynamicLoveStoryChapter[];
  timeline: DynamicTimelineEvent[];
  venues: DynamicVenue[];
  bankAccounts: DynamicBankAccount[];
  dressCode: {
    title: string;
    subtitle: string;
    styleType: string;
    description: string;
    rulesNotice?: string;
    cards: DressCodeCard[];
  };
  honeymoon: {
    title: string;
    description: string;
    bankReference: string;
    imageUrl: string;
    isVisible: boolean;
  };
  galleryConfig: {
    layoutStyle: 'carousel' | 'grid' | 'masonry';
  };
  sectionVisibility: SectionVisibility;
}

const CONFIG_STORAGE_KEY = 'mateo_camila_wedding_config_v2';

const DEFAULT_CONFIG: WeddingSiteConfig = {
  themeId: 'pastel-olive-sage',
  audio: {
    url: 'https://www.youtube.com/watch?v=2Vv-BfVoq4g',
    title: 'Perfect',
    artist: 'Ed Sheeran',
    autoPlay: true,
    loop: true
  },
  videoConfig: {
    mode: 'slideshow',
    videoUrl: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=1200',
    videoTitle: 'MATEO & CAMILA — CINEMATIC PRE-WEDDING',
    posterUrl: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=1200',
    quote: '"El amor no se mira con los ojos, sino con el corazón."'
  },
  loaderText: 'Mateo & Camila',
  loaderSubtitle: 'Cargando experiencia nupcial exclusiva...',
  hero: {
    groom: COUPLE_INFO.groom,
    bride: COUPLE_INFO.bride,
    weddingDate: COUPLE_INFO.weddingDate,
    dateFormatted: COUPLE_INFO.dateFormatted,
    city: COUPLE_INFO.city,
    quote: COUPLE_INFO.quote,
    hashtag: COUPLE_INFO.hashtag,
    coverImage: COUPLE_INFO.coverImage,
    secondaryImage: COUPLE_INFO.secondaryImage
  },
  loveStory: LOVE_STORY_CHAPTERS.map((ch, idx) => ({
    id: `story-${idx + 1}`,
    ...ch,
    isVisible: true
  })),
  timeline: TIMELINE_EVENTS.map((evt, idx) => ({
    id: `tl-${idx + 1}`,
    ...evt,
    isVisible: true
  })),
  venues: VENUES.map((v, idx) => ({
    id: `vn-${idx + 1}`,
    ...v,
    isVisible: true
  })),
  dressCode: {
    title: 'Código de Vestimenta',
    subtitle: 'Rigurosa Etiqueta Nupcial',
    styleType: 'Formal Elegante',
    description: 'Agradecemos a nuestros estimados invitados vestir con la máxima elegancia nupcial para honrar esta gran celebración.',
    rulesNotice: 'Reservado el color blanco y marfil exclusivamente para la novia.',
    cards: [
      {
        id: 'dc-1',
        title: 'Traje Formal de Gala',
        gender: 'Caballeros',
        description: 'Terno completo en tonos oscuros (Negro, Azul Noche o Marengo) con corbata o pajarita elegante y zapatos de cuero.',
        items: ['Terno Completo', 'Camisa Blanca', 'Corbata / Pajarita'],
        isVisible: true
      },
      {
        id: 'dc-2',
        title: 'Vestido Largo de Fiesta',
        gender: 'Damas',
        description: 'Vestido largo de noche o cóctel sofisticado. Se sugiere evitar tonos blancos, marfil o crema.',
        items: ['Vestido Largo', 'Tonos Joya / Pastel', 'Accesorios Elegantes'],
        isVisible: true
      }
    ]
  },
  bankAccounts: BANK_DETAILS.map((b, idx) => ({
    id: `bank-${idx + 1}`,
    ...b,
    isVisible: true
  })),
  honeymoon: {
    title: 'Fondo de Luna de Miel',
    description: 'Tu mejor regalo es compartir este momento con nosotros. Si deseas hacernos un detalle para nuestro viaje de bodas, te lo agradeceremos de corazón.',
    bankReference: 'Luna de Miel Mateo & Camila',
    imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    isVisible: true
  },
  galleryConfig: {
    layoutStyle: 'carousel'
  },
  sectionVisibility: {
    hero: true,
    story: true,
    gallery: true,
    video: true,
    countdown: true,
    eventDetails: true,
    dressCode: true,
    giftRegistry: true,
    rsvp: true
  }
};

/**
 * Generates dynamic SVG favicon with the couple's initials and sets browser document title
 */
export function updateDynamicFavicon(groomName: string, brideName: string) {
  if (typeof document === 'undefined') return;

  const groomInit = (groomName || 'M').trim().charAt(0).toUpperCase();
  const brideInit = (brideName || 'C').trim().charAt(0).toUpperCase();

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <circle cx="50" cy="50" r="46" fill="#FAFCF9" stroke="#6B7F5A" stroke-width="4"/>
    <text x="50" y="60" font-family="Cinzel, Georgia, serif" font-size="34" font-weight="700" fill="#2A3828" text-anchor="middle" letter-spacing="-1">
      ${groomInit}<tspan fill="#6B7F5A" font-size="28" font-style="italic"> &amp; </tspan>${brideInit}
    </text>
  </svg>`;

  const encodedSvg = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;

  let link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
  if (!link) {
    link = document.createElement('link');
    link.rel = 'icon';
    document.getElementsByTagName('head')[0].appendChild(link);
  }
  link.type = 'image/svg+xml';
  link.href = encodedSvg;

  document.title = `${groomName || 'Mateo'} & ${brideName || 'Camila'} — Boda Nupcial`;
}

import { authService } from './authService';

const CONFIG_STORAGE_KEY_PREFIX = 'mateo_camila_wedding_config_';

class WeddingConfigService {
  private config: WeddingSiteConfig = DEFAULT_CONFIG;
  private listeners: Array<() => void> = [];
  private currentUserId: string | null = null;

  constructor() {
    this.loadFromStorage();

    // Listen for auth changes to scope config per admin user
    authService.subscribe(session => {
      const newUserId = session?.user?.id ?? null;
      if (newUserId !== this.currentUserId) {
        this.currentUserId = newUserId;
        this.loadFromStorage();
        this.listeners.forEach(cb => cb());
      }
    });
  }

  /** Build a localStorage key scoped to the active admin user */
  private storageKey(): string {
    const userId = this.currentUserId || 'public';
    return `${CONFIG_STORAGE_KEY_PREFIX}${userId}_v2`;
  }

  private loadFromStorage(): void {
    if (typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem(this.storageKey());
      if (stored) {
        const parsed = JSON.parse(stored);
        this.config = {
          ...DEFAULT_CONFIG,
          ...parsed,
          sectionVisibility: { ...DEFAULT_CONFIG.sectionVisibility, ...(parsed.sectionVisibility || {}) },
          hero: { ...DEFAULT_CONFIG.hero, ...(parsed.hero || {}) },
          audio: { ...DEFAULT_CONFIG.audio, ...(parsed.audio || {}) },
          videoConfig: { ...DEFAULT_CONFIG.videoConfig, ...(parsed.videoConfig || {}) },
          dressCode: { ...DEFAULT_CONFIG.dressCode, ...(parsed.dressCode || {}) },
          honeymoon: { ...DEFAULT_CONFIG.honeymoon, ...(parsed.honeymoon || {}) }
        };
      } else {
        this.config = { ...DEFAULT_CONFIG };
      }
    } catch {
      this.config = { ...DEFAULT_CONFIG };
    }
    this.applyActiveTheme();
    updateDynamicFavicon(this.config.hero.groom, this.config.hero.bride);
  }

  public getConfig(): WeddingSiteConfig {
    return this.config;
  }

  public updateConfig(partial: Partial<WeddingSiteConfig>): void {
    this.config = {
      ...this.config,
      ...partial
    };
    this.saveAndNotify();
  }

  public setTheme(themeId: string): void {
    this.config.themeId = themeId;
    this.config.customThemeColors = undefined;
    this.applyActiveTheme();
    this.saveAndNotify();
  }

  public setCustomThemeColors(colors: ThemePalette['colors']): void {
    this.config.customThemeColors = colors;
    applyTheme(colors);
    this.saveAndNotify();
  }

  public applyActiveTheme(): void {
    if (this.config.customThemeColors) {
      applyTheme(this.config.customThemeColors);
      return;
    }
    const found = ELEGANT_WEDDING_THEMES.find(t => t.id === this.config.themeId) || ELEGANT_WEDDING_THEMES[0];
    applyTheme(found.colors);
  }

  public subscribe(callback: () => void): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  private saveAndNotify(): void {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(this.storageKey(), JSON.stringify(this.config));
      } catch {
        // ignore
      }
    }
    this.applyActiveTheme();
    updateDynamicFavicon(this.config.hero.groom, this.config.hero.bride);
    this.listeners.forEach(cb => cb());
  }
}

export const weddingConfigService = new WeddingConfigService();
