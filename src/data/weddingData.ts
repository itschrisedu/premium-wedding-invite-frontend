import { Guest, TimelineEvent, GalleryImage, BankDetail, EventVenue } from '../types';

export const COUPLE_INFO = {
  groom: "Mateo Andrade",
  bride: "Camila Viteri",
  weddingDate: "2026-11-14T16:30:00-05:00", // Saturday Nov 14, 2026
  dateFormatted: "Sábado, 14 de Noviembre de 2026",
  city: "Ambato, Ecuador",
  quote: "Con la bendición de Dios y nuestras familias, iniciamos este nuevo capítulo juntos en la ciudad que nos vio crecer.",
  hashtag: "#MateoyCamila2026",
  coverImage: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&q=80&w=1920",
  secondaryImage: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=1200",
  storyImage: "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&q=80&w=1200",
  videoPoster: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=1200"
};

export const INITIAL_GUESTS: Guest[] = [
  {
    id: "gst-001",
    code: "familia-naranjo-viteri",
    name: "Familia Naranjo Viteri",
    category: "Familia",
    passesAllowed: 4,
    passesConfirmed: 4,
    status: "confirmado",
    phone: "+593 99 876 5432",
    email: "naranjo.viteri@gmail.com",
    notes: "Tíos maternos de la novia. Estarán en la mesa de honor.",
    dietaryRestrictions: "Ninguna",
    updatedAt: "2026-08-01T10:15:00Z"
  },
  {
    id: "gst-002",
    code: "daniel-paredes",
    name: "Daniel Paredes & Acompañante",
    category: "Amigos",
    passesAllowed: 2,
    passesConfirmed: 2,
    status: "confirmado",
    phone: "+593 99 123 4567",
    email: "daniel.paredes@empresa.ec",
    notes: "Mejor amigo del novio desde el colegio San Alfonso.",
    dietaryRestrictions: "Vegetariano para la acompañante",
    updatedAt: "2026-08-02T14:20:00Z"
  },
  {
    id: "gst-003",
    code: "familia-villacis-freire",
    name: "Familia Villacís Freire",
    category: "Familia",
    passesAllowed: 5,
    passesConfirmed: 0,
    status: "pendiente",
    phone: "+593 98 765 4321",
    email: "villacis.freire@yahoo.es",
    notes: "Primos del novio provenientes de Ficoa.",
    dietaryRestrictions: "",
    updatedAt: "2026-07-28T09:00:00Z"
  },
  {
    id: "gst-004",
    code: "jose-miguel-freire",
    name: "Ing. José Miguel Freire & Esposa",
    category: "VIP",
    passesAllowed: 2,
    passesConfirmed: 2,
    status: "confirmado",
    phone: "+593 99 555 1212",
    email: "jmfreire@ambatonet.ec",
    notes: "Padrinos de boda.",
    dietaryRestrictions: "Sin mariscos",
    updatedAt: "2026-08-03T11:45:00Z"
  },
  {
    id: "gst-005",
    code: "domenica-cevallos",
    name: "Doménica Cevallos & Carlos Andrés Cevallos",
    category: "Amigos",
    passesAllowed: 2,
    passesConfirmed: 0,
    status: "pendiente",
    phone: "+593 98 444 3322",
    email: "domenica.cevallos@icloud.com",
    notes: "Compañera de universidad de Camila.",
    dietaryRestrictions: "",
    updatedAt: "2026-07-25T16:30:00Z"
  },
  {
    id: "gst-006",
    code: "familia-lopez-andrade",
    name: "Familia López Andrade",
    category: "Familia",
    passesAllowed: 3,
    passesConfirmed: 0,
    status: "declinado",
    phone: "+593 99 999 8877",
    email: "lopez.andrade@hotmail.com",
    notes: "Tíos lejanos en Quito. Viaje programado.",
    dietaryRestrictions: "",
    updatedAt: "2026-08-04T18:10:00Z"
  },
  {
    id: "gst-007",
    code: "sofia-naranjo",
    name: "Dra. Sofía Naranjo & Acompañante",
    category: "VIP",
    passesAllowed: 2,
    passesConfirmed: 2,
    status: "confirmado",
    phone: "+593 99 333 2211",
    email: "sofia.naranjo@clinicambato.com",
    notes: "Mesa VIP de médicos.",
    dietaryRestrictions: "Bajo en sodio",
    updatedAt: "2026-08-05T08:30:00Z"
  },
  {
    id: "gst-008",
    code: "sebastian-andrade",
    name: "Sebastián Andrade & Acompañante",
    category: "Familia",
    passesAllowed: 2,
    passesConfirmed: 2,
    status: "confirmado",
    phone: "+593 98 111 2233",
    email: "seb.andrade@gmail.com",
    notes: "Hermano del novio.",
    dietaryRestrictions: "",
    updatedAt: "2026-08-01T12:00:00Z"
  }
];

export const VENUES: EventVenue[] = [
  {
    name: "Catedral de Ambato",
    type: "ceremonia",
    time: "16:30 PM",
    address: "Calle Bolívar y Montalvo, Parque Montalvo",
    city: "Ambato, Ecuador",
    googleMapsUrl: "https://maps.google.com/?q=Catedral+de+Ambato",
    imageUrl: "https://images.unsplash.com/photo-1548625361-1815b3641b6c?auto=format&fit=crop&q=80&w=1200",
    description: "Solemne ceremonia religiosa en el corazón histórico de Ambato. Un marco de paz, fe y luz frente al majestuoso Parque Montalvo."
  },
  {
    name: "Quinta Loren",
    type: "recepcion",
    time: "19:00 PM",
    address: "Av. Los Guaytambos, Ficoa",
    city: "Ambato, Ecuador",
    googleMapsUrl: "https://maps.google.com/?q=Quinta+Loren+Ambato",
    imageUrl: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=1200",
    description: "Recepción de gala y cena campestre rodeada de los afamados jardines de Ficoa y una vista deslumbrante del valle de Tungurahua."
  }
];

export const TIMELINE_EVENTS: TimelineEvent[] = [
  {
    time: "16:30 PM",
    title: "Ceremonia Eucarística",
    location: "Catedral de Ambato",
    description: "Entrada triunfal de novios, intercambio de votos y bendición de argollas.",
    iconName: "Church"
  },
  {
    time: "18:00 PM",
    title: "Coctel al Atardecer",
    location: "Jardines de Quinta Loren",
    description: "Brindis con espumante, aperitivos ecuatorianos de autor y música ambiental en vivo.",
    iconName: "GlassWater"
  },
  {
    time: "19:30 PM",
    title: "Banquete Nupcial & Brindis",
    location: "Salón Principal Quinta Loren",
    description: "Cena de gala de 3 tiempos inspirada en la gastronomía andina contemporánea.",
    iconName: "Utensils"
  },
  {
    time: "21:00 PM",
    title: "Primer Baile & Apertura de Pista",
    location: "Pista Central Quinta Loren",
    description: "Vals inolvidable, show de orquesta y fiesta bailable hasta el amanecer.",
    iconName: "Music"
  },
  {
    time: "00:00 AM",
    title: "Hora Loca Ambateña",
    location: "Quinta Loren",
    description: "Sorpresas, cotillón exclusivo y animación en vivo.",
    iconName: "Sparkles"
  }
];

export const GALLERY_IMAGES: GalleryImage[] = [
  {
    id: "gal-1",
    url: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&q=80&w=1200",
    title: "Amanecer en Ficoa",
    locationTag: "Ficoa, Ambato",
    caption: "Caminando entre los huertos y la brisa fresca del río Ambato.",
    aspectRatio: "portrait"
  },
  {
    id: "gal-2",
    url: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=1200",
    title: "Mirador de Quisapincha",
    locationTag: "Quisapincha, Tungurahua",
    caption: "El atardecer perfecto contemplando las montañas andinas.",
    aspectRatio: "landscape"
  },
  {
    id: "gal-3",
    url: "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&q=80&w=1200",
    title: "Un 'Sí' Eterno",
    locationTag: "Quinta La Liria",
    caption: "El momento inolvidable en que Mateo pidió la mano de Camila.",
    aspectRatio: "tall"
  },
  {
    id: "gal-4",
    url: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=1200",
    title: "Detalles Finos",
    locationTag: "Jardines Quinta Loren",
    caption: "Texturas organza, flores de orquídeas ecuatorianas y oro cepillado.",
    aspectRatio: "square"
  },
  {
    id: "gal-5",
    url: "https://images.unsplash.com/photo-1532712938310-34cb3982ef74?auto=format&fit=crop&q=80&w=1200",
    title: "Complicidad Nupcial",
    locationTag: "Parque Benigno Vela",
    caption: "Misas de luz natural bajo el follaje centenario.",
    aspectRatio: "portrait"
  },
  {
    id: "gal-6",
    url: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&q=80&w=1200",
    title: "Noche Encantada",
    locationTag: "Ambato, Ecuador",
    caption: "Luces cálidas, ambiente de cuento de hadas y celebración pura.",
    aspectRatio: "landscape"
  }
];

export const BANK_DETAILS: BankDetail[] = [
  {
    bankName: "Banco Pichincha",
    accountType: "Cuenta de Ahorros",
    accountNumber: "2205481904",
    holderName: "Mateo Sebastián Andrade Naranjo",
    idNumber: "1804921849",
    email: "mateo.andrade@boda.ec"
  },
  {
    bankName: "Banco Guayaquil",
    accountType: "Cuenta Corriente",
    accountNumber: "0018934521",
    holderName: "Camila Doménica Viteri Cevallos",
    idNumber: "1805128392",
    email: "camila.viteri@boda.ec"
  },
  {
    bankName: "Produbanco",
    accountType: "Cuenta de Ahorros",
    accountNumber: "12080034921",
    holderName: "Mateo Andrade & Camila Viteri",
    idNumber: "1804921849",
    email: "regalos@mateoycamila.ec"
  }
];

export const LOVE_STORY_CHAPTERS = [
  {
    year: "2021",
    title: "El Encuentro en Ficoa",
    location: "Ficoa, Ambato",
    content: "Coincidimos en un café bajo la sombra de los guaytambo tradicionales. Entre risas espontáneas y conversaciones de horas, supimos que era el inicio de algo extraordinario."
  },
  {
    year: "2023",
    title: "Aventuras por Tungurahua",
    location: "Baños & Quisapincha",
    content: "Descubrimos juntos los paisajes andinos de nuestra tierra, desde los miradores de Quisapincha hasta los atardeceres mágicos en las montañas."
  },
  {
    year: "2025",
    title: "La Propuesta",
    location: "Quinta La Liria",
    content: "Rodeados de flores, arboles históricos y con el atardecer dorando el cielo de Ambato, Mateo se arrodilló para hacer la pregunta que cambiaría nuestras vidas para siempre."
  },
  {
    year: "2026",
    title: "El Comienzo del 'Para Siempre'",
    location: "Catedral de Ambato & Quinta Loren",
    content: "Hoy celebramos ante Dios, nuestras familias y amigos más queridos la unión de nuestras vidas y sueños."
  }
];
