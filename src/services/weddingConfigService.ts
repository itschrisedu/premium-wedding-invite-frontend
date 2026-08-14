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

export interface WeddingSiteConfig {
  themeId: string;
  customThemeColors?: ThemePalette['colors'];
  audio: AudioConfig;
  loaderText: string;
  loaderSubtitle: string;
  hero: {
    groom: string;
    bride: string;
    weddingDate: string;
    dateFormatted: string;
    city: string;
    quote: string;
    hashtag: string;
    coverImage: string;
    secondaryImage: string;
  };
  loveStory: DynamicLoveStoryChapter[];
  timeline: DynamicTimelineEvent[];
  venues: DynamicVenue[];
  dressCode: {
    title: string;
    subtitle: string;
    styleType: string;
    description: string;
    rulesNotice: string;
    cards: DressCodeCard[];
  };
  bankAccounts: DynamicBankAccount[];
  honeymoon: {
    title: string;
    description: string;
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
    url: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=wedding-vals-gentle-piano-112190.mp3',
    title: 'Vals Nupcial en Piano',
    artist: 'Música de Entrada Especial',
    autoPlay: true,
    loop: true
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
    styleType: 'Formal Gala / Black Tie Option',
    description: 'Agradecemos vestir trajes de gala y vestidos largos formales para honrar la solemnidad de nuestro día.',
    rulesNotice: 'Sugerimos paleta de colores tierra y marfil cálido. Reservamos el color blanco absoluto para la novia.',
    cards: [
      {
        id: 'dc-1',
        title: 'Caballeros',
        gender: 'Hombres',
        description: 'Traje de gala, terno oscuro (Negro, Azul Noche o Gris Marengo) con corbata de seda o corbatín.',
        items: ['Terno completo oscuro', 'Camisa blanca formal', 'Corbata / Corbatín', 'Zapatos de vestir lustrados'],
        isVisible: true
      },
      {
        id: 'dc-2',
        title: 'Damas',
        gender: 'Mujeres',
        description: 'Vestido largo de noche o gala de alta costura.',
        items: ['Vestido largo de noche', 'Accesorios de gala', 'Calzado elegante de fiesta', 'Evitar color blanco estricto'],
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
    title: 'Luna de Miel en las Islas Galápagos & Italia',
    description: '"Si prefieres aportar a las experiencias de nuestro primer viaje como esposos, tu aporte nos acompañará a crear recuerdos inolvidables."',
    imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=1200',
    isVisible: true
  },
  galleryConfig: {
    layoutStyle: 'grid'
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

class WeddingConfigService {
  private config: WeddingSiteConfig = DEFAULT_CONFIG;
  private listeners: Array<() => void> = [];

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    if (typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem(CONFIG_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        this.config = {
          ...DEFAULT_CONFIG,
          ...parsed,
          sectionVisibility: { ...DEFAULT_CONFIG.sectionVisibility, ...(parsed.sectionVisibility || {}) },
          hero: { ...DEFAULT_CONFIG.hero, ...(parsed.hero || {}) },
          audio: { ...DEFAULT_CONFIG.audio, ...(parsed.audio || {}) },
          dressCode: { ...DEFAULT_CONFIG.dressCode, ...(parsed.dressCode || {}) },
          honeymoon: { ...DEFAULT_CONFIG.honeymoon, ...(parsed.honeymoon || {}) }
        };
      }
    } catch {
      this.config = DEFAULT_CONFIG;
    }
    this.applyActiveTheme();
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
        localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(this.config));
      } catch {
        // ignore
      }
    }
    this.applyActiveTheme();
    this.listeners.forEach(cb => cb());
  }
}

export const weddingConfigService = new WeddingConfigService();
