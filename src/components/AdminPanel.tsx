import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Shield,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Filter,
  Plus,
  Edit2,
  Trash2,
  FileSpreadsheet,
  FileText,
  X,
  Send,
  LogOut,
  UserPlus,
  UserCog,
  Camera,
  Upload,
  RefreshCw
} from 'lucide-react';
import { Guest, GuestCategory } from '../types';
import { storageService } from '../services/storageService';
import { authService } from '../services/authService';
import { apiService, type AuthSession, type AdminUser, type GalleryAlbum, type SiteSection } from '../services/apiService';
import { BANK_DETAILS } from '../data/weddingData';
import { galleryService } from '../services/galleryService';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  appUrl: string;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ isOpen, onClose, appUrl }) => {
  const [session, setSession] = useState<AuthSession | null>(authService.getSession());
  const [guests, setGuests] = useState<Guest[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [albums, setAlbums] = useState<GalleryAlbum[]>([]);
  const [selectedAlbumId, setSelectedAlbumId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('todos');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isSavingGuest, setIsSavingGuest] = useState(false);
  const [isSavingUser, setIsSavingUser] = useState(false);
  const [isUploadingPhotos, setIsUploadingPhotos] = useState(false);
  const [isGuestModalOpen, setIsGuestModalOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isUserSettingsModalOpen, setIsUserSettingsModalOpen] = useState(false);
  const [guestModalPosition, setGuestModalPosition] = useState<{ left: number; top: number }>({ left: 0, top: 0 });
  const [sectionModalPosition, setSectionModalPosition] = useState<{ left: number; top: number }>({ left: 0, top: 0 });
  const [userModalPosition, setUserModalPosition] = useState<{ left: number; top: number }>({ left: 0, top: 0 });
  const [userSettingsModalPosition, setUserSettingsModalPosition] = useState<{ left: number; top: number }>({ left: 0, top: 0 });
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);
  const [guestFormData, setGuestFormData] = useState({
    name: '',
    code: '',
    category: 'Familia' as GuestCategory,
    passesAllowed: 2,
    phone: '',
    email: '',
    notes: ''
  });
  const [userFormData, setUserFormData] = useState({
    username: '',
    password: '',
    fullName: '',
    role: 'user' as 'superadmin' | 'admin' | 'user'
  });
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [sections, setSections] = useState<SiteSection[]>([]);
  const [isSectionModalOpen, setIsSectionModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<SiteSection | null>(null);
  const [sectionFormData, setSectionFormData] = useState({ sectionKey: '', title: '', subtitle: '', body: '', sortOrder: 0, isVisible: true });
  const [activeUserSettingsId, setActiveUserSettingsId] = useState<string | null>(null);
  const [userSettingsForm, setUserSettingsForm] = useState<{ sections?: Record<string, boolean>; bankAccountIndex?: number | null }>({ sections: {}, bankAccountIndex: null });

  const isSuperadmin = session?.user.role === 'superadmin';

  const loadData = async () => {
    const nextGuests = await storageService.refreshGuests();
    setGuests(nextGuests);

    const nextAlbums = await galleryService.getAlbums();
    setAlbums(nextAlbums);
    if (!selectedAlbumId && nextAlbums.length > 0) {
      setSelectedAlbumId(nextAlbums[0].id);
    }

    const token = authService.getToken();
    if (token && session) {
      const nextUsers = await apiService.listUsers(token);
      setUsers(nextUsers);
      try {
        const nextSections = await apiService.listSections(token);
        setSections(nextSections);
      } catch {
        setSections([]);
      }
    }
  };

  useEffect(() => {
    const unsubscribeAuth = authService.subscribe(nextSession => {
      setSession(nextSession);
      if (!nextSession) {
        setUsers([]);
        setAlbums([]);
        setPhotoFiles([]);
      }
    });

    const unsubscribeGuests = storageService.subscribe(() => {
      setGuests(storageService.getGuests());
    });

    void loadData();

    return () => {
      unsubscribeAuth();
      unsubscribeGuests();
    };
  }, []);

  useEffect(() => {
    if (session) {
      void loadData();
    }
  }, [session?.token]);

  const filteredGuests = useMemo(() => {
    return guests.filter(guest => {
      const matchesSearch =
        guest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        guest.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (guest.phone && guest.phone.includes(searchQuery));

      const matchesCategory = categoryFilter === 'todos' || guest.category === categoryFilter;
      const matchesStatus = statusFilter === 'todos' || guest.status === statusFilter;
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [guests, searchQuery, categoryFilter, statusFilter]);

  if (!isOpen) return null;

  if (!session) {
    return (
      <AnimatePresence>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 overflow-y-auto bg-black/90 backdrop-blur-2xl p-4 md:p-8">
          <div className="max-w-lg mx-auto min-h-[calc(100vh-4rem)] flex items-center justify-center">
            <div className="w-full rounded-3xl liquid-glass border border-white/20 shadow-2xl p-8 md:p-10 space-y-6">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-300/30 flex items-center justify-center text-amber-300">
                    <Shield className="w-6 h-6 text-amber-400" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-amber-300/70 block">Acceso Administrativo</span>
                    <h1 className="font-cinzel text-2xl font-light text-amber-100 gold-gradient-text">Mateo & Camila</h1>
                  </div>
                </div>
                <button onClick={onClose} className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form
                className="space-y-4"
                onSubmit={async e => {
                  e.preventDefault();
                  setIsLoggingIn(true);
                  setLoginError('');
                  try {
                    await authService.login(loginData.username, loginData.password);
                  } catch (error) {
                    setLoginError(error instanceof Error ? error.message : 'Error al iniciar sesión');
                  } finally {
                    setIsLoggingIn(false);
                  }
                }}
              >
                <div>
                  <label className="text-[10px] font-mono uppercase tracking-widest text-amber-200/80 block mb-1">Usuario</label>
                  <input type="text" value={loginData.username} onChange={e => setLoginData({ ...loginData, username: e.target.value })} className="w-full px-4 py-2.5 rounded-xl glass-panel border border-white/15 text-xs text-amber-100 focus:outline-none focus:border-amber-300" placeholder="superadmin" />
                </div>
                <div>
                  <label className="text-[10px] font-mono uppercase tracking-widest text-amber-200/80 block mb-1">Contraseña</label>
                  <input type="password" value={loginData.password} onChange={e => setLoginData({ ...loginData, password: e.target.value })} className="w-full px-4 py-2.5 rounded-xl glass-panel border border-white/15 text-xs text-amber-100 focus:outline-none focus:border-amber-300" placeholder="••••••••" />
                </div>
                {loginError && <p className="text-rose-300 text-xs font-mono">{loginError}</p>}
                <button type="submit" disabled={isLoggingIn} className="w-full py-3 rounded-full bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs uppercase tracking-[0.2em] transition-all cursor-pointer disabled:opacity-50">
                  {isLoggingIn ? 'Validando...' : 'Entrar al panel'}
                </button>
              </form>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }

  const totalGuests = guests.length;
  const confirmedCount = guests.filter(g => g.status === 'confirmado').length;
  const pendingCount = guests.filter(g => g.status === 'pendiente').length;
  const declinedCount = guests.filter(g => g.status === 'declinado').length;
  const totalPassesConfirmed = guests.reduce((acc, g) => acc + (g.status === 'confirmado' ? g.passesConfirmed : 0), 0);
  const totalPassesAllowed = guests.reduce((acc, g) => acc + g.passesAllowed, 0);
  const confirmationPercentage = totalGuests > 0 ? Math.round((confirmedCount / totalGuests) * 100) : 0;

  const placeModalNearButton = (event: React.MouseEvent<HTMLElement> | undefined, width: number, height: number) => {
    if (!event) return { left: window.innerWidth / 2, top: window.scrollY + window.innerHeight / 2 };

    const rect = event.currentTarget.getBoundingClientRect();
    const modalWidth = Math.min(width, window.innerWidth - 32);
    const modalHeight = Math.min(height, window.innerHeight - 32);

    // Convertir posición del viewport a posición de página considerando el scroll
    const scrollY = window.scrollY;
    const buttonPageY = rect.top + scrollY;
    const buttonPageX = rect.left;

    // Priorizar mostrar debajo del botón si hay espacio en viewport
    let pageY: number;
    if (rect.bottom + modalHeight + 18 <= window.innerHeight) {
      // Hay espacio abajo del botón en el viewport
      pageY = buttonPageY + rect.height + 18;
    } else if (rect.top - modalHeight - 18 >= scrollY) {
      // Hay espacio arriba del botón
      pageY = buttonPageY - modalHeight - 18;
    } else {
      // Mostrar centrado donde está el botón
      pageY = buttonPageY + rect.height / 2 - modalHeight / 2;
    }

    const left = Math.min(Math.max(buttonPageX + rect.width / 2, modalWidth / 2 + 16), window.innerWidth - modalWidth / 2 - 16);

    return { left, top: pageY };
  };

  const scrollModalIntoView = (position: { left: number; top: number }, modalHeight: number) => {
    // Scroll para asegurar que el modal sea visible en el viewport
    const viewportTop = window.scrollY;
    const viewportBottom = window.scrollY + window.innerHeight;
    const modalTop = position.top;
    const modalBottom = position.top + modalHeight;

    if (modalBottom > viewportBottom) {
      // El modal está abajo del viewport, scroll hacia abajo
      const scrollNeeded = modalBottom - viewportBottom + 40;
      window.scrollBy({ top: scrollNeeded, behavior: 'smooth' });
    } else if (modalTop < viewportTop) {
      // El modal está arriba del viewport, scroll hacia arriba
      const scrollNeeded = modalTop - viewportTop - 40;
      window.scrollBy({ top: scrollNeeded, behavior: 'smooth' });
    }
  };

  const openCreateGuest = (event?: React.MouseEvent<HTMLButtonElement>) => {
    setEditingGuest(null);
    setGuestFormData({ name: '', code: '', category: 'Familia', passesAllowed: 2, phone: '', email: '', notes: '' });
    if (event) {
      const position = placeModalNearButton(event, 520, 640);
      setGuestModalPosition(position);
      setTimeout(() => scrollModalIntoView(position, 640), 0);
    }
    setIsGuestModalOpen(true);
  };

  const openCreateUser = (event?: React.MouseEvent<HTMLButtonElement>) => {
    if (event) {
      const position = placeModalNearButton(event, 480, 520);
      setUserModalPosition(position);
      setTimeout(() => scrollModalIntoView(position, 520), 0);
    }
    setIsUserModalOpen(true);
  };

  const openEditGuest = (guest: Guest, event?: React.MouseEvent<HTMLButtonElement>) => {
    setEditingGuest(guest);
    setGuestFormData({
      name: guest.name,
      code: guest.code,
      category: guest.category,
      passesAllowed: guest.passesAllowed,
      phone: guest.phone || '',
      email: guest.email || '',
      notes: guest.notes || ''
    });
    if (event) {
      const position = placeModalNearButton(event, 520, 640);
      setGuestModalPosition(position);
      setTimeout(() => scrollModalIntoView(position, 640), 0);
    }
    setIsGuestModalOpen(true);
  };

  const saveGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestFormData.name.trim()) return;

    setIsSavingGuest(true);
    try {
      const generatedCode = guestFormData.code.trim()
        ? guestFormData.code.toLowerCase().replace(/\s+/g, '-')
        : guestFormData.name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');

      if (editingGuest) {
        await storageService.updateGuest({
          ...editingGuest,
          name: guestFormData.name,
          code: generatedCode,
          category: guestFormData.category,
          passesAllowed: Number(guestFormData.passesAllowed),
          phone: guestFormData.phone,
          email: guestFormData.email,
          notes: guestFormData.notes
        });
      } else {
        await storageService.addGuest({
          name: guestFormData.name,
          code: generatedCode,
          category: guestFormData.category,
          passesAllowed: Number(guestFormData.passesAllowed),
          passesConfirmed: 0,
          status: 'pendiente',
          phone: guestFormData.phone,
          email: guestFormData.email,
          notes: guestFormData.notes
        });
      }

      setIsGuestModalOpen(false);
    } finally {
      setIsSavingGuest(false);
    }
  };

  const deleteGuest = async (guestId: string, name: string) => {
    if (!confirm(`¿Estás seguro de eliminar a "${name}" de la lista de invitados?`)) return;
    await storageService.deleteGuest(guestId);
  };

  const saveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = authService.getToken();
    if (!token) return;

    setIsSavingUser(true);
    try {
      await apiService.createUser(token, userFormData);
      setUsers(await apiService.listUsers(token));
      setIsUserModalOpen(false);
    } finally {
      setIsSavingUser(false);
    }
  };

  const openCreateSection = (event?: React.MouseEvent<HTMLButtonElement>) => {
    setEditingSection(null);
    setSectionFormData({ sectionKey: '', title: '', subtitle: '', body: '', sortOrder: 0, isVisible: true });
    if (event) {
      const position = placeModalNearButton(event, 640, 700);
      setSectionModalPosition(position);
      setTimeout(() => scrollModalIntoView(position, 700), 0);
    }
    setIsSectionModalOpen(true);
  };

  const openEditSection = (section: SiteSection, event?: React.MouseEvent<HTMLButtonElement>) => {
    setEditingSection(section);
    setSectionFormData({ sectionKey: section.sectionKey, title: section.title, subtitle: section.subtitle || '', body: section.body, sortOrder: section.sortOrder, isVisible: section.isVisible });
    if (event) {
      const position = placeModalNearButton(event, 640, 700);
      setSectionModalPosition(position);
      setTimeout(() => scrollModalIntoView(position, 700), 0);
    }
    setIsSectionModalOpen(true);
  };

  const saveSection = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = authService.getToken();
    if (!token) return;

    if (editingSection) {
      const updated = await apiService.updateSection(token, editingSection.id, {
        title: sectionFormData.title,
        subtitle: sectionFormData.subtitle || null,
        body: sectionFormData.body,
        sortOrder: Number(sectionFormData.sortOrder),
        isVisible: Boolean(sectionFormData.isVisible)
      });
      setSections(s => s.map(sx => sx.id === updated.id ? updated : sx));
    } else {
      const created = await apiService.createSection(token, {
        sectionKey: sectionFormData.sectionKey,
        title: sectionFormData.title,
        subtitle: sectionFormData.subtitle || null,
        body: sectionFormData.body,
        sortOrder: Number(sectionFormData.sortOrder),
        isVisible: Boolean(sectionFormData.isVisible)
      });
      setSections(s => [created, ...s]);
    }

    setIsSectionModalOpen(false);
  };

  const removeSection = async (sectionId: string) => {
    const token = authService.getToken();
    if (!token) return;
    if (!confirm('¿Eliminar sección? Esta acción es irreversible.')) return;
    await apiService.deleteSection(token, sectionId);
    setSections(s => s.filter(x => x.id !== sectionId));
  };

  const uploadPhotos = async () => {
    const token = authService.getToken();
    if (!token || !selectedAlbumId || photoFiles.length === 0) return;

    setIsUploadingPhotos(true);
    try {
      await galleryService.uploadPhotos(token, selectedAlbumId, photoFiles);
      setPhotoFiles([]);
      setAlbums(await galleryService.getAlbums());
    } finally {
      setIsUploadingPhotos(false);
    }
  };

  const sendWhatsApp = (guest: Guest) => {
    window.open(storageService.buildWhatsAppMessage(guest, appUrl), '_blank');
  };

  const isSendingEnabled = Boolean(selectedAlbumId && photoFiles.length > 0);

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 overflow-y-auto bg-black/90 backdrop-blur-2xl p-4 md:p-8">
        <div className="max-w-7xl mx-auto space-y-8 pb-16">
          <div className="flex flex-wrap items-center justify-between gap-4 p-6 rounded-3xl liquid-glass border border-white/20 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-300/30 flex items-center justify-center text-amber-300">
                <Shield className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-amber-300/70 block">Panel de Administración Nupcial</span>
                <h1 className="font-cinzel text-2xl md:text-3xl font-light text-amber-100 gold-gradient-text">Mateo & Camila — Ambato 2026</h1>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button onClick={() => storageService.exportToExcel()} className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 font-mono text-xs uppercase tracking-wider hover:bg-emerald-500/30 transition-all cursor-pointer">
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                <span>Exportar Excel</span>
              </button>
              <button onClick={() => storageService.exportToPDF()} className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 font-mono text-xs uppercase tracking-wider hover:bg-amber-500/30 transition-all cursor-pointer">
                <FileText className="w-4 h-4 text-amber-400" />
                <span>Exportar PDF</span>
              </button>
              <button onClick={(event) => openCreateGuest(event)} className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs uppercase tracking-[0.15em] hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-lg">
                <Plus className="w-4 h-4 text-white" />
                <span>Nuevo Invitado</span>
              </button>
              {isSuperadmin && (
                <button onClick={(event) => openCreateUser(event)} className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs uppercase tracking-[0.15em] hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-lg">
                  <UserPlus className="w-4 h-4 text-white" />
                  <span>Nuevo Usuario</span>
                </button>
              )}
              <button onClick={() => authService.logout()} className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/10 border border-white/15 text-white font-mono text-xs uppercase tracking-wider hover:bg-white/20 transition-all cursor-pointer">
                <LogOut className="w-4 h-4 text-white" />
                <span>Salir</span>
              </button>
              <button onClick={onClose} className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="p-6 rounded-2xl liquid-glass border border-white/15 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-amber-100">
              <UserCog className="w-5 h-5 text-amber-400" />
              <div>
                <p className="text-[10px] font-mono uppercase tracking-widest text-amber-300/70">Sesión activa</p>
                <p className="text-sm font-semibold">{session.user.fullName} · {session.user.role}</p>
              </div>
            </div>
            <p className="text-xs text-amber-100/60 font-serif">
              {isSuperadmin ? 'Puedes administrar invitados, usuarios y fotos.' : 'Puedes administrar invitados y fotos, pero no usuarios.'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="p-6 rounded-2xl glass-panel border border-white/10">
              <div className="flex items-center justify-between mb-2"><span className="text-[10px] font-mono uppercase tracking-widest text-amber-200/60">Total Invitaciones</span><Users className="w-4 h-4 text-amber-400" /></div>
              <span className="font-cinzel text-3xl font-light text-amber-100 block">{totalGuests}</span>
              <span className="text-[11px] text-amber-200/50 font-serif">Familias / Personas</span>
            </div>
            <div className="p-6 rounded-2xl glass-panel border border-emerald-500/20 bg-emerald-500/5"><div className="flex items-center justify-between mb-2"><span className="text-[10px] font-mono uppercase tracking-widest text-emerald-300">Confirmados</span><CheckCircle2 className="w-4 h-4 text-emerald-400" /></div><span className="font-cinzel text-3xl font-light text-emerald-300 block">{confirmedCount}</span><span className="text-[11px] text-emerald-200/60 font-serif">{totalPassesConfirmed} Pases Confirmados</span></div>
            <div className="p-6 rounded-2xl glass-panel border border-amber-500/20 bg-amber-500/5"><div className="flex items-center justify-between mb-2"><span className="text-[10px] font-mono uppercase tracking-widest text-amber-300">Pendientes</span><Clock className="w-4 h-4 text-amber-400" /></div><span className="font-cinzel text-3xl font-light text-amber-300 block">{pendingCount}</span><span className="text-[11px] text-amber-200/60 font-serif">Por Responder</span></div>
            <div className="p-6 rounded-2xl glass-panel border border-rose-500/20 bg-rose-500/5"><div className="flex items-center justify-between mb-2"><span className="text-[10px] font-mono uppercase tracking-widest text-rose-300">Declinados</span><XCircle className="w-4 h-4 text-rose-400" /></div><span className="font-cinzel text-3xl font-light text-rose-300 block">{declinedCount}</span><span className="text-[11px] text-rose-200/60 font-serif">No Asistirán</span></div>
            <div className="p-6 rounded-2xl liquid-glass border border-amber-300/30 flex flex-col justify-between"><div><div className="flex items-center justify-between mb-1"><span className="text-[10px] font-mono uppercase tracking-widest text-amber-200/70">% Confirmado</span><RefreshCw className="w-4 h-4 text-amber-400" /></div><span className="font-cinzel text-3xl font-light text-amber-100 gold-gradient-text block">{confirmationPercentage}%</span></div><div className="w-full h-2 bg-white/10 rounded-full overflow-hidden mt-3 border border-white/10"><div className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 rounded-full transition-all duration-500" style={{ width: `${confirmationPercentage}%` }} /></div></div>
          </div>

          <div className="p-6 rounded-2xl glass-panel border border-white/15 flex flex-wrap items-center justify-between gap-4">
            <div className="relative flex-1 min-w-[240px]"><Search className="w-4 h-4 text-amber-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" /><input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Buscador por nombre, código o teléfono..." className="w-full pl-11 pr-4 py-2.5 rounded-full glass-panel border border-white/20 text-xs text-amber-100 placeholder-amber-200/40 focus:outline-none focus:border-amber-300" /></div>
            <div className="flex items-center gap-2"><Filter className="w-4 h-4 text-amber-400" /><select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="px-4 py-2 rounded-full bg-[#181612] border border-white/20 text-xs text-amber-100 focus:outline-none focus:border-amber-300"><option value="todos">Todas las Categorías</option><option value="Familia">Familia</option><option value="Amigos">Amigos</option><option value="VIP">VIP</option><option value="Trabajo">Trabajo</option></select></div>
            <div className="flex items-center gap-2"><select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-4 py-2 rounded-full bg-[#181612] border border-white/20 text-xs text-amber-100 focus:outline-none focus:border-amber-300"><option value="todos">Todos los Estados</option><option value="confirmado">Confirmados</option><option value="pendiente">Pendientes</option><option value="declinado">Declinados</option></select></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="rounded-3xl liquid-glass border border-white/15 overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs text-amber-100">
                  <thead>
                    <tr className="bg-white/5 border-b border-white/10 text-[10px] font-mono uppercase tracking-widest text-amber-300/80">
                      <th className="p-4">Invitado / Familia</th>
                      <th className="p-4">Categoría</th>
                      <th className="p-4">Pases</th>
                      <th className="p-4">Estado</th>
                      <th className="p-4 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredGuests.length > 0 ? filteredGuests.map(guest => (
                      <tr key={guest.id} className="hover:bg-white/[0.03] transition-colors">
                        <td className="p-4 font-medium"><strong className="text-amber-100 block text-sm">{guest.name}</strong><span className="text-[10px] text-amber-300/70 italic block">{guest.phone || 'Sin teléfono'}</span></td>
                        <td className="p-4"><span className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 font-mono text-[10px]">{guest.category}</span></td>
                        <td className="p-4 font-mono font-semibold text-amber-200">{guest.status === 'confirmado' ? <span>{guest.passesConfirmed} de {guest.passesAllowed}</span> : <span>{guest.passesAllowed} asignados</span>}</td>
                        <td className="p-4"><span className={`px-3 py-1 rounded-full font-mono text-[10px] font-semibold uppercase tracking-wider ${guest.status === 'confirmado' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : guest.status === 'declinado' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'}`}>{guest.status}</span></td>
                        <td className="p-4 text-right"><div className="flex items-center justify-end gap-2"><button onClick={() => sendWhatsApp(guest)} className="p-2 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 transition-colors cursor-pointer"><Send className="w-3.5 h-3.5" /></button><button onClick={(event) => openEditGuest(guest, event)} className="p-2 rounded-lg bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 transition-colors cursor-pointer"><Edit2 className="w-3.5 h-3.5" /></button><button onClick={() => void deleteGuest(guest.id, guest.name)} className="p-2 rounded-lg bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 transition-colors cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button></div></td>
                      </tr>
                    )) : (<tr><td colSpan={5} className="p-8 text-center text-amber-200/50 font-serif italic">No se encontraron invitados con los criterios seleccionados.</td></tr>)}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-3xl liquid-glass border border-amber-300/15 p-6 space-y-4 shadow-2xl">
                <div className="flex items-center justify-between gap-4"><div><span className="text-[10px] font-mono uppercase tracking-widest text-amber-300/70 block">Galería</span><h2 className="font-cinzel text-2xl text-amber-100">Subir varias fotos</h2></div><Camera className="w-5 h-5 text-amber-400" /></div>
                <select value={selectedAlbumId} onChange={e => setSelectedAlbumId(e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-[#181612] border border-white/15 text-xs text-amber-100 focus:outline-none focus:border-amber-300">
                  {albums.map(album => <option key={album.id} value={album.id}>{album.title} ({album.photoCount})</option>)}
                </select>
                <input type="file" multiple accept="image/*" onChange={e => setPhotoFiles(Array.from(e.target.files || []))} className="w-full text-xs text-amber-100" />
                {photoFiles.length > 0 && <p className="text-[11px] text-amber-200/60 font-mono">{photoFiles.length} archivo(s) seleccionado(s)</p>}
                <button onClick={() => void uploadPhotos()} disabled={isUploadingPhotos || !isSendingEnabled} className="w-full py-3 rounded-full bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs uppercase tracking-[0.2em] transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"><Upload className="w-4 h-4" />{isUploadingPhotos ? 'Subiendo...' : 'Subir fotos'}</button>
              </div>

                {(session.user.role === 'admin' || session.user.role === 'superadmin') && (
                  <div className="rounded-3xl liquid-glass border border-amber-300/15 p-6 space-y-4 shadow-2xl">
                    <div className="flex items-center justify-between gap-4"><div><span className="text-[10px] font-mono uppercase tracking-widest text-amber-300/70 block">Secciones del Sitio</span><h2 className="font-cinzel text-2xl text-amber-100">Contenido del sitio</h2></div><Plus className="w-5 h-5 text-amber-400" /></div>
                    <div className="grid gap-3">
                      {sections.length === 0 && <div className="p-4 text-amber-200/60 italic">No hay secciones aún.</div>}
                      {sections.map(section => (
                        <div key={section.id} className="p-3 rounded-lg glass-panel border border-white/10 flex items-center justify-between">
                          <div>
                            <strong className="text-amber-100 block text-sm">{section.title}</strong>
                            <span className="text-[10px] text-amber-300/70">{section.sectionKey} · {section.isVisible ? 'Visible' : 'Oculta'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button onClick={(event) => openEditSection(section, event)} className="p-2 rounded-md bg-amber-500/20 text-amber-300 hover:bg-amber-500/30"><Edit2 className="w-4 h-4" /></button>
                            <button onClick={() => removeSection(section.id)} className="p-2 rounded-md bg-rose-500/20 text-rose-300 hover:bg-rose-500/30"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <button onClick={(event) => openCreateSection(event)} className="w-full py-3 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 font-mono text-xs uppercase tracking-wider hover:bg-amber-500/30 transition-all flex items-center justify-center gap-2"><Plus className="w-4 h-4 text-amber-400" />Crear sección</button>
                  </div>
                )}

              {isSuperadmin && (
                <div className="rounded-3xl liquid-glass border border-amber-300/15 p-6 space-y-4 shadow-2xl">
                  <div className="flex items-center justify-between gap-4"><div><span className="text-[10px] font-mono uppercase tracking-widest text-amber-300/70 block">Usuarios del sistema</span><h2 className="font-cinzel text-2xl text-amber-100">Control de accesos</h2></div><UserPlus className="w-5 h-5 text-amber-400" /></div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {users.map(user => (
                      <div key={user.id} className="p-4 rounded-2xl glass-panel border border-white/10 flex items-center justify-between gap-4">
                        <div>
                          <strong className="text-amber-100 block text-sm">{user.fullName}</strong>
                          <span className="text-[10px] font-mono uppercase tracking-wider text-amber-300/60">{user.username} · {user.role}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <select value={user.role} onChange={async e => {
                            const token = authService.getToken();
                            if (!token) return;
                            const newRole = e.target.value as 'superadmin' | 'admin' | 'user';
                            try {
                              await apiService.updateUserRole(token, user.id, newRole);
                              setUsers(await apiService.listUsers(token));
                            } catch {
                              // ignore
                            }
                          }} className="px-3 py-1 rounded-md bg-[#181612] border border-white/10 text-xs text-amber-100">
                            <option value="user">Usuario</option>
                            <option value="admin">Admin</option>
                            <option value="superadmin">Superadmin</option>
                          </select>
                          <button onClick={async () => {
                            if (!confirm(`Eliminar usuario ${user.username}? Esta acción es irreversible.`)) return;
                            const token = authService.getToken();
                            if (!token) return;
                            try {
                              await apiService.deleteUser(token, user.id);
                              setUsers(await apiService.listUsers(token));
                            } catch (err) {
                              // ignore
                            }
                          }} className="p-2 rounded-lg bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 transition-colors cursor-pointer"><Trash2 className="w-4 h-4" /></button>
                          <button onClick={async (event) => {
                            const token = authService.getToken();
                            if (!token) return;
                            try {
                              const res = await apiService.getUserSettings(token, user.id);
                              setActiveUserSettingsId(user.id);
                              setUserSettingsForm({ sections: res.settings?.sections ?? {}, bankAccountIndex: typeof res.settings?.bankAccountIndex === 'number' ? res.settings.bankAccountIndex : null });
                              const position = placeModalNearButton(event, 640, 700);
                              setUserSettingsModalPosition(position);
                              setTimeout(() => scrollModalIntoView(position, 700), 0);
                              setIsUserSettingsModalOpen(true);
                            } catch (err) {
                              // ignore
                            }
                          }} className="p-2 rounded-lg bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 transition-colors cursor-pointer"><UserCog className="w-4 h-4" /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button onClick={(event) => openCreateUser(event)} className="w-full py-3 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 font-mono text-xs uppercase tracking-wider hover:bg-amber-500/30 transition-all flex items-center justify-center gap-2"><UserPlus className="w-4 h-4 text-amber-400" />Crear usuario</button>
                </div>
              )}
            </div>
          </div>
        </div>

        <AnimatePresence>
          {isGuestModalOpen && (
            <div className="fixed inset-0 z-50 pointer-events-none bg-black/80 backdrop-blur-md">
              <motion.div initial={{ opacity: 0, scale: 0.9, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 12 }} style={{ position: 'fixed', left: `${guestModalPosition.left}px`, top: `${guestModalPosition.top}px`, width: 'min(520px, calc(100vw - 2rem))', pointerEvents: 'auto', transform: 'translateX(-50%)' }} className="p-8 rounded-3xl liquid-glass border border-white/20 shadow-2xl space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-white/10"><h3 className="font-cinzel text-xl text-amber-100">{editingGuest ? 'Editar Invitado' : 'Crear Nuevo Invitado'}</h3><button onClick={() => setIsGuestModalOpen(false)} className="p-2 rounded-full hover:bg-white/10 text-amber-200 transition-colors"><X className="w-5 h-5" /></button></div>
                <form onSubmit={e => void saveGuest(e)} className="space-y-4">
                  <div><label className="text-[10px] font-mono uppercase tracking-widest text-amber-200/80 block mb-1">Nombre Completo / Familia *</label><input type="text" required value={guestFormData.name} onChange={e => setGuestFormData({ ...guestFormData, name: e.target.value })} className="w-full px-4 py-2.5 rounded-xl glass-panel border border-white/15 text-xs text-amber-100 focus:outline-none focus:border-amber-300" /></div>
                  <div className="grid grid-cols-2 gap-4"><div><label className="text-[10px] font-mono uppercase tracking-widest text-amber-200/80 block mb-1">Categoría</label><select value={guestFormData.category} onChange={e => setGuestFormData({ ...guestFormData, category: e.target.value as GuestCategory })} className="w-full px-4 py-2.5 rounded-xl bg-[#181612] border border-white/15 text-xs text-amber-100 focus:outline-none focus:border-amber-300"><option value="Familia">Familia</option><option value="Amigos">Amigos</option><option value="VIP">VIP</option><option value="Trabajo">Trabajo</option></select></div><div><label className="text-[10px] font-mono uppercase tracking-widest text-amber-200/80 block mb-1">Pases Asignados</label><input type="number" min={1} max={10} value={guestFormData.passesAllowed} onChange={e => setGuestFormData({ ...guestFormData, passesAllowed: Number(e.target.value) })} className="w-full px-4 py-2.5 rounded-xl glass-panel border border-white/15 text-xs text-amber-100 focus:outline-none focus:border-amber-300" /></div></div>
                  <div className="grid grid-cols-2 gap-4"><div><label className="text-[10px] font-mono uppercase tracking-widest text-amber-200/80 block mb-1">Teléfono / WhatsApp</label><input type="text" value={guestFormData.phone} onChange={e => setGuestFormData({ ...guestFormData, phone: e.target.value })} className="w-full px-4 py-2.5 rounded-xl glass-panel border border-white/15 text-xs text-amber-100 focus:outline-none focus:border-amber-300" /></div><div><label className="text-[10px] font-mono uppercase tracking-widest text-amber-200/80 block mb-1">Código URL Personalizado</label><input type="text" value={guestFormData.code} onChange={e => setGuestFormData({ ...guestFormData, code: e.target.value })} className="w-full px-4 py-2.5 rounded-xl glass-panel border border-white/15 text-xs text-amber-100 focus:outline-none focus:border-amber-300" /></div></div>
                  <div><label className="text-[10px] font-mono uppercase tracking-widest text-amber-200/80 block mb-1">Notas Internas</label><textarea rows={2} value={guestFormData.notes} onChange={e => setGuestFormData({ ...guestFormData, notes: e.target.value })} className="w-full px-4 py-2.5 rounded-xl glass-panel border border-white/15 text-xs text-amber-100 focus:outline-none focus:border-amber-300" /></div>
                  <div className="pt-4 flex items-center justify-end gap-3"><button type="button" onClick={() => setIsGuestModalOpen(false)} className="px-5 py-2.5 rounded-full bg-white/10 text-xs text-amber-100 hover:bg-white/20 transition-colors">Cancelar</button><button type="submit" disabled={isSavingGuest} className="px-6 py-2.5 rounded-full bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs uppercase tracking-[0.15em] shadow-lg hover:scale-102 transition-transform cursor-pointer disabled:opacity-50">{isSavingGuest ? 'Guardando...' : 'Guardar Invitado'}</button></div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {isSectionModalOpen && (
            <div className="fixed inset-0 z-50 pointer-events-none bg-black/80 backdrop-blur-md">
              <motion.div initial={{ opacity: 0, scale: 0.95, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 12 }} style={{ position: 'fixed', left: `${sectionModalPosition.left}px`, top: `${sectionModalPosition.top}px`, width: 'min(640px, calc(100vw - 2rem))', pointerEvents: 'auto', transform: 'translateX(-50%)' }} className="p-8 rounded-3xl liquid-glass border border-white/20 shadow-2xl space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-white/10"><h3 className="font-cinzel text-xl text-amber-100">{editingSection ? 'Editar Sección' : 'Crear Sección'}</h3><button onClick={() => setIsSectionModalOpen(false)} className="p-2 rounded-full hover:bg-white/10 text-amber-200 transition-colors"><X className="w-5 h-5" /></button></div>
                <form onSubmit={e => void saveSection(e)} className="space-y-4">
                  {!editingSection && <div><label className="text-[10px] font-mono uppercase tracking-widest text-amber-200/80 block mb-1">Clave de sección (sectionKey)</label><input type="text" required value={sectionFormData.sectionKey} onChange={e => setSectionFormData({ ...sectionFormData, sectionKey: e.target.value })} className="w-full px-4 py-2.5 rounded-xl glass-panel border border-white/15 text-xs text-amber-100 focus:outline-none focus:border-amber-300" /></div>}
                  <div><label className="text-[10px] font-mono uppercase tracking-widest text-amber-200/80 block mb-1">Título</label><input type="text" required value={sectionFormData.title} onChange={e => setSectionFormData({ ...sectionFormData, title: e.target.value })} className="w-full px-4 py-2.5 rounded-xl glass-panel border border-white/15 text-xs text-amber-100 focus:outline-none focus:border-amber-300" /></div>
                  <div><label className="text-[10px] font-mono uppercase tracking-widest text-amber-200/80 block mb-1">Subtítulo</label><input type="text" value={sectionFormData.subtitle} onChange={e => setSectionFormData({ ...sectionFormData, subtitle: e.target.value })} className="w-full px-4 py-2.5 rounded-xl glass-panel border border-white/15 text-xs text-amber-100 focus:outline-none focus:border-amber-300" /></div>
                  <div><label className="text-[10px] font-mono uppercase tracking-widest text-amber-200/80 block mb-1">Contenido</label><textarea rows={6} value={sectionFormData.body} onChange={e => setSectionFormData({ ...sectionFormData, body: e.target.value })} className="w-full px-4 py-2.5 rounded-xl glass-panel border border-white/15 text-xs text-amber-100 focus:outline-none focus:border-amber-300" /></div>
                  <div className="grid grid-cols-2 gap-4"><div><label className="text-[10px] font-mono uppercase tracking-widest text-amber-200/80 block mb-1">Orden</label><input type="number" value={sectionFormData.sortOrder} onChange={e => setSectionFormData({ ...sectionFormData, sortOrder: Number(e.target.value) })} className="w-full px-4 py-2.5 rounded-xl glass-panel border border-white/15 text-xs text-amber-100 focus:outline-none focus:border-amber-300" /></div><div><label className="text-[10px] font-mono uppercase tracking-widest text-amber-200/80 block mb-1">Visible</label><select value={String(sectionFormData.isVisible)} onChange={e => setSectionFormData({ ...sectionFormData, isVisible: e.target.value === 'true' })} className="w-full px-4 py-2.5 rounded-xl bg-[#181612] border border-white/15 text-xs text-amber-100 focus:outline-none focus:border-amber-300"><option value="true">Visible</option><option value="false">Oculta</option></select></div></div>
                  <div className="pt-4 flex items-center justify-end gap-3"><button type="button" onClick={() => setIsSectionModalOpen(false)} className="px-5 py-2.5 rounded-full bg-white/10 text-xs text-amber-100 hover:bg-white/20 transition-colors">Cancelar</button><button type="submit" className="px-6 py-2.5 rounded-full bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs uppercase tracking-[0.15em] shadow-lg hover:scale-102 transition-transform">{editingSection ? 'Actualizar sección' : 'Crear sección'}</button></div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isUserModalOpen && isSuperadmin && (
            <div className="fixed inset-0 z-[60] pointer-events-none">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 12 }}
                style={{
                  position: 'fixed',
                  left: `${userModalPosition.left}px`,
                  top: `${userModalPosition.top}px`,
                  width: 'min(480px, calc(100vw - 2rem))',
                  pointerEvents: 'auto',
                  transform: 'translateX(-50%)'
                }}
                className="p-8 rounded-3xl liquid-glass border border-white/20 shadow-2xl space-y-6"
              >
                <div className="flex items-center justify-between pb-4 border-b border-white/10"><h3 className="font-cinzel text-xl text-amber-100">Crear Usuario</h3><button onClick={() => setIsUserModalOpen(false)} className="p-2 rounded-full hover:bg-white/10 text-amber-200 transition-colors"><X className="w-5 h-5" /></button></div>
                <form onSubmit={e => void saveUser(e)} className="space-y-4">
                  <div><label className="text-[10px] font-mono uppercase tracking-widest text-amber-200/80 block mb-1">Nombre visible</label><input type="text" required value={userFormData.fullName} onChange={e => setUserFormData({ ...userFormData, fullName: e.target.value })} className="w-full px-4 py-2.5 rounded-xl glass-panel border border-white/15 text-xs text-amber-100 focus:outline-none focus:border-amber-300" /></div>
                  <div className="grid grid-cols-2 gap-4"><div><label className="text-[10px] font-mono uppercase tracking-widest text-amber-200/80 block mb-1">Usuario</label><input type="text" required value={userFormData.username} onChange={e => setUserFormData({ ...userFormData, username: e.target.value })} className="w-full px-4 py-2.5 rounded-xl glass-panel border border-white/15 text-xs text-amber-100 focus:outline-none focus:border-amber-300" /></div><div><label className="text-[10px] font-mono uppercase tracking-widest text-amber-200/80 block mb-1">Contraseña</label><input type="password" required value={userFormData.password} onChange={e => setUserFormData({ ...userFormData, password: e.target.value })} className="w-full px-4 py-2.5 rounded-xl glass-panel border border-white/15 text-xs text-amber-100 focus:outline-none focus:border-amber-300" /></div></div>
                  <div><label className="text-[10px] font-mono uppercase tracking-widest text-amber-200/80 block mb-1">Rol</label><select value={userFormData.role} onChange={e => setUserFormData({ ...userFormData, role: e.target.value as 'superadmin' | 'admin' | 'user' })} className="w-full px-4 py-2.5 rounded-xl bg-[#181612] border border-white/15 text-xs text-amber-100 focus:outline-none focus:border-amber-300"><option value="user">Usuario</option><option value="admin">Admin</option><option value="superadmin">Superadmin</option></select></div>
                  <button type="submit" disabled={isSavingUser} className="w-full py-3 rounded-full bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs uppercase tracking-[0.2em] transition-all cursor-pointer disabled:opacity-50">{isSavingUser ? 'Guardando...' : 'Crear usuario'}</button>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {isUserSettingsModalOpen && isSuperadmin && activeUserSettingsId && (
            <div className="fixed inset-0 z-50 pointer-events-none bg-black/80 backdrop-blur-md">
              <motion.div initial={{ opacity: 0, scale: 0.95, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 12 }} style={{ position: 'fixed', left: `${userSettingsModalPosition.left}px`, top: `${userSettingsModalPosition.top}px`, width: 'min(640px, calc(100vw - 2rem))', pointerEvents: 'auto', transform: 'translateX(-50%)' }} className="p-8 rounded-3xl liquid-glass border border-white/20 shadow-2xl space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-white/10"><h3 className="font-cinzel text-xl text-amber-100">Preferencias de usuario</h3><button onClick={() => setIsUserSettingsModalOpen(false)} className="p-2 rounded-full hover:bg-white/10 text-amber-200 transition-colors"><X className="w-5 h-5" /></button></div>
                <form onSubmit={async e => {
                  e.preventDefault();
                  const token = authService.getToken();
                  if (!token || !activeUserSettingsId) return;
                  await apiService.updateUserSettings(token, activeUserSettingsId, userSettingsForm);
                  setIsUserSettingsModalOpen(false);
                }} className="space-y-4">
                  <div>
                    <label className="text-[10px] font-mono uppercase tracking-widest text-amber-200/80 block mb-2">Secciones visibles</label>
                    <div className="grid gap-2">
                      {sections.map(sec => (
                        <label key={sec.id} className="flex items-center gap-3 text-amber-100">
                          <input type="checkbox" checked={Boolean(userSettingsForm.sections?.[sec.sectionKey])} onChange={e => setUserSettingsForm(s => ({ ...s, sections: { ...(s.sections || {}), [sec.sectionKey]: e.target.checked } }))} />
                          <span className="text-sm">{sec.title} ({sec.sectionKey})</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-mono uppercase tracking-widest text-amber-200/80 block mb-2">Cuenta bancaria preferida</label>
                    <select value={userSettingsForm.bankAccountIndex ?? ''} onChange={e => setUserSettingsForm(s => ({ ...s, bankAccountIndex: e.target.value === '' ? null : Number(e.target.value) }))} className="w-full px-4 py-2.5 rounded-xl bg-[#181612] border border-white/15 text-xs text-amber-100">
                      <option value="">Ninguna</option>
                      {BANK_DETAILS.map((b, idx) => <option key={b.accountNumber} value={idx}>{b.bankName} — {b.accountNumber}</option>)}
                    </select>
                  </div>
                  <div className="pt-4 flex items-center justify-end gap-3"><button type="button" onClick={() => setIsUserSettingsModalOpen(false)} className="px-5 py-2.5 rounded-full bg-white/10 text-xs text-amber-100 hover:bg-white/20 transition-colors">Cancelar</button><button type="submit" className="px-6 py-2.5 rounded-full bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs uppercase tracking-[0.15em] shadow-lg hover:scale-102 transition-transform">Guardar preferencias</button></div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
};
