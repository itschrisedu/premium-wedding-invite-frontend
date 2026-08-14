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
  RefreshCw,
  Palette,
  Layout,
  Music,
  Eye,
  EyeOff,
  Sliders,
  Building2,
  Heart,
  Calendar,
  Check,
  ToggleLeft,
  ToggleRight,
  Sparkles,
  Lock,
  Unlock,
  AlertTriangle,
  KeyRound,
  ExternalLink,
  SlidersHorizontal
} from 'lucide-react';
import { Guest, GuestCategory } from '../types';
import { storageService } from '../services/storageService';
import { authService } from '../services/authService';
import { apiService, type AuthSession, type AdminUser, type GalleryAlbum } from '../services/apiService';
import { galleryService } from '../services/galleryService';
import { Modal } from './ui/Modal';
import { ConfirmDialog } from './ui/ConfirmDialog';
import { ELEGANT_WEDDING_THEMES, ThemePalette, generatePaletteFromHex } from '../data/weddingThemes';
import { weddingConfigService, WeddingSiteConfig, DynamicBankAccount, DynamicVenue, DynamicTimelineEvent, DynamicLoveStoryChapter } from '../services/weddingConfigService';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  appUrl: string;
}

type AdminTab = 'invitados' | 'apariencia' | 'secciones' | 'usuarios';

export const AdminPanel: React.FC<AdminPanelProps> = ({ isOpen, onClose, appUrl }) => {
  const [session, setSession] = useState<AuthSession | null>(authService.getSession());
  const [activeTab, setActiveTab] = useState<AdminTab>('invitados');
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
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [isUploadingPhotos, setIsUploadingPhotos] = useState(false);

  // Site Config state
  const [siteConfig, setSiteConfig] = useState<WeddingSiteConfig>(weddingConfigService.getConfig());

  // Custom Color Picker state
  const [customHex, setCustomHex] = useState('#6B7F5A');
  const [isWhiteBg, setIsWhiteBg] = useState(true);

  // User Management & Superadmin controls
  const [userEditPermissions, setUserEditPermissions] = useState<Record<string, boolean>>({});
  const [userStatusMap, setUserStatusMap] = useState<Record<string, 'active' | 'disabled'>>({});
  const [managedAdminUser, setManagedAdminUser] = useState<AdminUser | null>(null);

  // Modals
  const [isGuestModalOpen, setIsGuestModalOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isBankModalOpen, setIsBankModalOpen] = useState(false);
  const [isVenueModalOpen, setIsVenueModalOpen] = useState(false);

  // Edit items
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);
  const [guestFormData, setGuestFormData] = useState({
    name: '',
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

  const [editingUserForPassword, setEditingUserForPassword] = useState<AdminUser | null>(null);
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [showPasswordText, setShowPasswordText] = useState(false);

  const [editingBank, setEditingBank] = useState<DynamicBankAccount | null>(null);
  const [bankFormData, setBankFormData] = useState({
    bankName: '',
    accountType: 'Cuenta de Ahorros',
    accountNumber: '',
    holderName: '',
    idNumber: '',
    email: ''
  });

  const [editingVenue, setEditingVenue] = useState<DynamicVenue | null>(null);
  const [venueFormData, setVenueFormData] = useState({
    name: '',
    type: 'recepcion' as 'ceremonia' | 'recepcion',
    time: '19:00 PM',
    address: '',
    city: 'Ambato, Ecuador',
    googleMapsUrl: '',
    imageUrl: '',
    description: ''
  });

  const [photoFiles, setPhotoFiles] = useState<File[]>([]);

  // Confirm dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    variant: 'danger' | 'warning' | 'default';
  }>({ isOpen: false, title: '', message: '', onConfirm: () => {}, variant: 'danger' });

  const isSuperadmin = session?.user.role === 'superadmin' || session?.user.role === 'admin';
  const currentUserId = session?.user.id || '';
  const canEditPage = isSuperadmin || userEditPermissions[currentUserId] !== false;

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
    }
  };

  useEffect(() => {
    const unsubConfig = weddingConfigService.subscribe(() => {
      setSiteConfig(weddingConfigService.getConfig());
    });

    const unsubscribeAuth = authService.subscribe(nextSession => {
      setSession(nextSession);
      if (!nextSession) {
        setUsers([]);
        setAlbums([]);
        setPhotoFiles([]);
        setManagedAdminUser(null);
      }
    });

    const unsubscribeGuests = storageService.subscribe(() => {
      setGuests(storageService.getGuests());
    });

    void loadData();

    return () => {
      unsubConfig();
      unsubscribeAuth();
      unsubscribeGuests();
    };
  }, []);

  useEffect(() => {
    if (session) {
      void loadData();
    }
  }, [session?.token]);

  // ESC to close panel
  useEffect(() => {
    if (!isOpen || !session) return;
    const hasNestedModal = isGuestModalOpen || isUserModalOpen || isPasswordModalOpen || isBankModalOpen || isVenueModalOpen || confirmDialog.isOpen;
    if (hasNestedModal) return;

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, session, onClose, isGuestModalOpen, isUserModalOpen, isPasswordModalOpen, isBankModalOpen, isVenueModalOpen, confirmDialog.isOpen]);

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

  // Login Modal if not authenticated
  if (!session) {
    return (
      <AnimatePresence>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 overflow-y-auto bg-black/90 backdrop-blur-2xl p-4 md:p-8">
          <div className="max-w-lg mx-auto min-h-[calc(100vh-4rem)] flex items-center justify-center">
            <div className="w-full rounded-3xl bg-[#181612] border border-[var(--color-gold)] shadow-2xl p-8 md:p-10 space-y-6 text-[#f5f0e6]">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-300/30 flex items-center justify-center text-amber-300">
                    <Shield className="w-6 h-6 text-amber-400" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-amber-300/70 block">Acceso Administrativo Nupcial</span>
                    <h1 className="font-cinzel text-2xl font-light text-amber-100 gold-gradient-text">Boda & Matrimonio</h1>
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
                  <input type="text" value={loginData.username} onChange={e => setLoginData({ ...loginData, username: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs text-amber-100 focus:outline-none focus:border-amber-300" placeholder="superadmin" />
                </div>
                <div>
                  <label className="text-[10px] font-mono uppercase tracking-widest text-amber-200/80 block mb-1">Contraseña</label>
                  <input type="password" value={loginData.password} onChange={e => setLoginData({ ...loginData, password: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs text-amber-100 focus:outline-none focus:border-amber-300" placeholder="••••••••" />
                </div>
                {loginError && <p className="text-rose-300 text-xs font-mono">{loginError}</p>}
                <button type="submit" disabled={isLoggingIn} className="w-full py-3 rounded-full bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs uppercase tracking-[0.2em] transition-all cursor-pointer disabled:opacity-50">
                  {isLoggingIn ? 'Validando...' : 'Entrar al panel'}
                </button>
              </form>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }

  // --- Custom Palette Generator Handler ---
  const applyCustomColor = () => {
    const generatedColors = generatePaletteFromHex(customHex, isWhiteBg);
    weddingConfigService.setCustomThemeColors(generatedColors);
  };

  // --- Guest Handlers ---
  const openCreateGuest = () => {
    setEditingGuest(null);
    setGuestFormData({ name: '', category: 'Familia', passesAllowed: 2, phone: '', email: '', notes: '' });
    setIsGuestModalOpen(true);
  };

  const openEditGuest = (guest: Guest) => {
    setEditingGuest(guest);
    setGuestFormData({
      name: guest.name,
      category: guest.category,
      passesAllowed: guest.passesAllowed,
      phone: guest.phone || '',
      email: guest.email || '',
      notes: guest.notes || ''
    });
    setIsGuestModalOpen(true);
  };

  const saveGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestFormData.name.trim()) return;

    setIsSavingGuest(true);
    try {
      const autoCode = guestFormData.name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');

      if (editingGuest) {
        await storageService.updateGuest({
          ...editingGuest,
          name: guestFormData.name,
          code: editingGuest.code || autoCode,
          category: guestFormData.category,
          passesAllowed: Number(guestFormData.passesAllowed),
          phone: guestFormData.phone,
          email: guestFormData.email,
          notes: guestFormData.notes
        });
      } else {
        await storageService.addGuest({
          name: guestFormData.name,
          code: autoCode,
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

  const deleteGuest = (guestId: string, name: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Eliminar invitado',
      message: `¿Estás seguro de eliminar a "${name}" de la lista de invitados?`,
      onConfirm: () => void storageService.deleteGuest(guestId),
      variant: 'danger'
    });
  };

  // --- Bank Account Handlers ---
  const openCreateBank = () => {
    setEditingBank(null);
    setBankFormData({ bankName: '', accountType: 'Cuenta de Ahorros', accountNumber: '', holderName: '', idNumber: '', email: '' });
    setIsBankModalOpen(true);
  };

  const openEditBank = (bank: DynamicBankAccount) => {
    setEditingBank(bank);
    setBankFormData({
      bankName: bank.bankName,
      accountType: bank.accountType,
      accountNumber: bank.accountNumber,
      holderName: bank.holderName,
      idNumber: bank.idNumber,
      email: bank.email
    });
    setIsBankModalOpen(true);
  };

  const saveBank = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bankFormData.bankName || !bankFormData.accountNumber) return;

    const accounts = [...siteConfig.bankAccounts];
    if (editingBank) {
      const idx = accounts.findIndex(a => a.id === editingBank.id);
      if (idx !== -1) {
        accounts[idx] = { ...editingBank, ...bankFormData };
      }
    } else {
      accounts.push({
        id: `bank-${Date.now()}`,
        ...bankFormData,
        isVisible: true
      });
    }
    weddingConfigService.updateConfig({ bankAccounts: accounts });
    setIsBankModalOpen(false);
  };

  const toggleBankVisibility = (id: string) => {
    const accounts = siteConfig.bankAccounts.map(a => a.id === id ? { ...a, isVisible: !a.isVisible } : a);
    weddingConfigService.updateConfig({ bankAccounts: accounts });
  };

  const deleteBank = (id: string, name: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Eliminar Cuenta Bancaria',
      message: `¿Eliminar la cuenta ${name}?`,
      onConfirm: () => {
        const accounts = siteConfig.bankAccounts.filter(a => a.id !== id);
        weddingConfigService.updateConfig({ bankAccounts: accounts });
      },
      variant: 'danger'
    });
  };

  // --- Venue Handlers ---
  const openCreateVenue = () => {
    setEditingVenue(null);
    setVenueFormData({ name: '', type: 'recepcion', time: '19:00 PM', address: '', city: 'Ambato, Ecuador', googleMapsUrl: '', imageUrl: '', description: '' });
    setIsVenueModalOpen(true);
  };

  const openEditVenue = (venue: DynamicVenue) => {
    setEditingVenue(venue);
    setVenueFormData({
      name: venue.name,
      type: venue.type,
      time: venue.time,
      address: venue.address,
      city: venue.city,
      googleMapsUrl: venue.googleMapsUrl,
      imageUrl: venue.imageUrl,
      description: venue.description
    });
    setIsVenueModalOpen(true);
  };

  const saveVenue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!venueFormData.name) return;

    const venues = [...siteConfig.venues];
    if (editingVenue) {
      const idx = venues.findIndex(v => v.id === editingVenue.id);
      if (idx !== -1) {
        venues[idx] = { ...editingVenue, ...venueFormData };
      }
    } else {
      venues.push({
        id: `venue-${Date.now()}`,
        ...venueFormData,
        isVisible: true
      });
    }
    weddingConfigService.updateConfig({ venues });
    setIsVenueModalOpen(false);
  };

  const toggleVenueVisibility = (id: string) => {
    const venues = siteConfig.venues.map(v => v.id === id ? { ...v, isVisible: !v.isVisible } : v);
    weddingConfigService.updateConfig({ venues });
  };

  const deleteVenue = (id: string, name: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Eliminar Lugar',
      message: `¿Eliminar ${name}?`,
      onConfirm: () => {
        const venues = siteConfig.venues.filter(v => v.id !== id);
        weddingConfigService.updateConfig({ venues });
      },
      variant: 'danger'
    });
  };

  // --- Section Visibility Toggle ---
  const toggleSection = (sectionKey: keyof WeddingSiteConfig['sectionVisibility']) => {
    weddingConfigService.updateConfig({
      sectionVisibility: {
        ...siteConfig.sectionVisibility,
        [sectionKey]: !siteConfig.sectionVisibility[sectionKey]
      }
    });
  };

  // --- User Superadmin Handlers ---
  const openCreateUser = () => {
    setUserFormData({ username: '', password: '', fullName: '', role: 'user' });
    setIsUserModalOpen(true);
  };

  const openEditPasswordModal = (user: AdminUser) => {
    setEditingUserForPassword(user);
    setNewPasswordInput('');
    setShowPasswordText(false);
    setIsPasswordModalOpen(true);
  };

  const saveUserPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUserForPassword || !newPasswordInput) return;

    const token = authService.getToken();
    if (!token) return;

    setIsSavingPassword(true);
    try {
      await apiService.updateUserPassword(token, editingUserForPassword.id, newPasswordInput);
      setIsPasswordModalOpen(false);
      setEditingUserForPassword(null);
      setNewPasswordInput('');
    } catch {
      // ignore
    } finally {
      setIsSavingPassword(false);
    }
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

  const toggleUserStatus = async (user: AdminUser) => {
    const current = userStatusMap[user.id] || 'active';
    const next = current === 'active' ? 'disabled' : 'active';
    setUserStatusMap(prev => ({ ...prev, [user.id]: next }));

    const token = authService.getToken();
    if (token) {
      try {
        await apiService.updateUserSettings(token, user.id, { status: next });
      } catch {
        // ignore fallback
      }
    }
  };

  const toggleUserEditPermission = async (userId: string) => {
    const current = userEditPermissions[userId] !== false;
    const next = !current;
    setUserEditPermissions(prev => ({ ...prev, [userId]: next }));

    const token = authService.getToken();
    if (token) {
      try {
        await apiService.updateUserSettings(token, userId, { canEdit: next });
      } catch {
        // ignore fallback
      }
    }
  };

  const impersonateAdminSite = (user: AdminUser) => {
    setManagedAdminUser(user);
    setActiveTab('secciones');
  };

  const deleteUserCascade = (user: AdminUser) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Eliminación Total de Admin (Cascada)',
      message: `¿Estás seguro de eliminar permanentemente al admin "${user.fullName}" (${user.username})? Se eliminarán todos sus invitados, configuraciones y datos de forma irreversible.`,
      onConfirm: async () => {
        const token = authService.getToken();
        if (!token) return;
        try {
          await apiService.deleteUser(token, user.id);
          setUsers(await apiService.listUsers(token));
        } catch {
          // ignore
        }
      },
      variant: 'danger'
    });
  };

  // --- Photo Upload ---
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

  const totalGuests = guests.length;
  const confirmedCount = guests.filter(g => g.status === 'confirmado').length;
  const pendingCount = guests.filter(g => g.status === 'pendiente').length;
  const declinedCount = guests.filter(g => g.status === 'declinado').length;
  const totalPassesConfirmed = guests.reduce((acc, g) => acc + (g.status === 'confirmado' ? g.passesConfirmed : 0), 0);
  const confirmationPercentage = totalGuests > 0 ? Math.round((confirmedCount / totalGuests) * 100) : 0;

  const sendWhatsApp = (guest: Guest) => {
    window.open(storageService.buildWhatsAppMessage(guest, appUrl), '_blank');
  };

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 overflow-y-auto bg-black/90 backdrop-blur-2xl p-4 md:p-8">
        <div className="max-w-7xl mx-auto space-y-6 pb-16">
          {/* Header Panel */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-6 rounded-3xl bg-[#181612] border border-[var(--color-gold)] shadow-2xl text-[#f5f0e6]">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[var(--color-accent)]/20 border border-[var(--color-gold)] flex items-center justify-center text-[var(--color-accent)]">
                <Shield className="w-6 h-6 text-[var(--color-accent)]" />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--color-gold-light)] block">
                  {managedAdminUser ? `Gestionando Admin: ${managedAdminUser.fullName}` : 'Panel Administrativo Multitenant Nupcial'}
                </span>
                <h1 className="font-cinzel text-2xl md:text-3xl font-light text-amber-100 gold-gradient-text">{siteConfig.hero.groom} & {siteConfig.hero.bride}</h1>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {managedAdminUser && (
                <button onClick={() => setManagedAdminUser(null)} className="px-4 py-2 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 text-xs font-mono uppercase font-bold cursor-pointer">
                  ← Volver a Mi Vista
                </button>
              )}
              {isSuperadmin && (
                <button onClick={openCreateUser} className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white font-bold text-xs uppercase tracking-[0.15em] hover:scale-105 transition-all cursor-pointer shadow-lg">
                  <UserPlus className="w-4 h-4 text-white" />
                  <span>+ Crear Nuevo Admin</span>
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

          {/* Navigation Tabs */}
          <div className="flex flex-wrap items-center gap-2 p-2 rounded-2xl bg-[#181612] border border-[var(--color-gold)]">
            <button
              onClick={() => setActiveTab('invitados')}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-mono text-xs uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'invitados' ? 'bg-[var(--color-accent)] text-white font-bold shadow-lg' : 'text-amber-200/70 hover:bg-white/10'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Invitados ({totalGuests})</span>
            </button>

            <button
              onClick={() => setActiveTab('apariencia')}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-mono text-xs uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'apariencia' ? 'bg-[var(--color-accent)] text-white font-bold shadow-lg' : 'text-amber-200/70 hover:bg-white/10'
              }`}
            >
              <Palette className="w-4 h-4" />
              <span>Colores & Temas</span>
            </button>

            <button
              onClick={() => setActiveTab('secciones')}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-mono text-xs uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'secciones' ? 'bg-[var(--color-accent)] text-white font-bold shadow-lg' : 'text-amber-200/70 hover:bg-white/10'
              }`}
            >
              <Layout className="w-4 h-4" />
              <span>Editor de Secciones & Contenido</span>
            </button>

            {isSuperadmin && (
              <button
                onClick={() => setActiveTab('usuarios')}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-mono text-xs uppercase tracking-wider transition-all cursor-pointer ${
                  activeTab === 'usuarios' ? 'bg-[var(--color-accent)] text-white font-bold shadow-lg' : 'text-amber-200/70 hover:bg-white/10'
                }`}
              >
                <UserCog className="w-4 h-4" />
                <span>Superadmin & Usuarios</span>
              </button>
            )}
          </div>

          {/* TAB 1: INVITADOS */}
          {activeTab === 'invitados' && (
            <div className="space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="p-6 rounded-2xl bg-[#181612] border border-white/10">
                  <div className="flex items-center justify-between mb-2"><span className="text-[10px] font-mono uppercase tracking-widest text-amber-200/60">Total Invitaciones</span><Users className="w-4 h-4 text-amber-400" /></div>
                  <span className="font-cinzel text-3xl font-light text-amber-100 block">{totalGuests}</span>
                  <span className="text-[11px] text-amber-200/50 font-serif">Familias / Personas</span>
                </div>
                <div className="p-6 rounded-2xl bg-[#181612] border border-emerald-500/20 bg-emerald-500/5"><div className="flex items-center justify-between mb-2"><span className="text-[10px] font-mono uppercase tracking-widest text-emerald-300">Confirmados</span><CheckCircle2 className="w-4 h-4 text-emerald-400" /></div><span className="font-cinzel text-3xl font-light text-emerald-300 block">{confirmedCount}</span><span className="text-[11px] text-emerald-200/60 font-serif">{totalPassesConfirmed} Pases Confirmados</span></div>
                <div className="p-6 rounded-2xl bg-[#181612] border border-amber-500/20 bg-amber-500/5"><div className="flex items-center justify-between mb-2"><span className="text-[10px] font-mono uppercase tracking-widest text-amber-300">Pendientes</span><Clock className="w-4 h-4 text-amber-400" /></div><span className="font-cinzel text-3xl font-light text-amber-300 block">{pendingCount}</span><span className="text-[11px] text-amber-200/60 font-serif">Por Responder</span></div>
                <div className="p-6 rounded-2xl bg-[#181612] border border-rose-500/20 bg-rose-500/5"><div className="flex items-center justify-between mb-2"><span className="text-[10px] font-mono uppercase tracking-widest text-rose-300">Declinados</span><XCircle className="w-4 h-4 text-rose-400" /></div><span className="font-cinzel text-3xl font-light text-rose-300 block">{declinedCount}</span><span className="text-[11px] text-rose-200/60 font-serif">No Asistirán</span></div>
                <div className="p-6 rounded-2xl bg-[#181612] border border-amber-300/30 flex flex-col justify-between"><div><div className="flex items-center justify-between mb-1"><span className="text-[10px] font-mono uppercase tracking-widest text-amber-200/70">% Confirmado</span><RefreshCw className="w-4 h-4 text-amber-400" /></div><span className="font-cinzel text-3xl font-light text-amber-100 gold-gradient-text block">{confirmationPercentage}%</span></div><div className="w-full h-2 bg-white/10 rounded-full overflow-hidden mt-3 border border-white/10"><div className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 rounded-full transition-all duration-500" style={{ width: `${confirmationPercentage}%` }} /></div></div>
              </div>

              {/* Action Bar */}
              <div className="p-6 rounded-2xl bg-[#181612] border border-white/15 flex flex-wrap items-center justify-between gap-4">
                <div className="relative flex-1 min-w-[240px]">
                  <Search className="w-4 h-4 text-amber-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Buscador por nombre o teléfono..." className="w-full pl-11 pr-4 py-2.5 rounded-full bg-black/40 border border-white/20 text-xs text-amber-100 placeholder-amber-200/40 focus:outline-none focus:border-amber-300" />
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-amber-400" />
                  <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="px-4 py-2 rounded-full bg-[#181612] border border-white/20 text-xs text-amber-100 focus:outline-none focus:border-amber-300">
                    <option value="todos">Todas las Categorías</option>
                    <option value="Familia">Familia</option>
                    <option value="Amigos">Amigos</option>
                    <option value="VIP">VIP</option>
                    <option value="Trabajo">Trabajo</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-4 py-2 rounded-full bg-[#181612] border border-white/20 text-xs text-amber-100 focus:outline-none focus:border-amber-300">
                    <option value="todos">Todos los Estados</option>
                    <option value="confirmado">Confirmados</option>
                    <option value="pendiente">Pendientes</option>
                    <option value="declinado">Declinados</option>
                  </select>
                </div>
                <button onClick={openCreateGuest} className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white font-bold text-xs uppercase tracking-[0.15em] hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-lg">
                  <Plus className="w-4 h-4 text-white" />
                  <span>Nuevo Invitado</span>
                </button>
              </div>

              {/* Guest Table */}
              <div className="rounded-3xl bg-[#181612] border border-white/15 overflow-hidden shadow-2xl">
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
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button onClick={() => sendWhatsApp(guest)} className="p-2 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 transition-colors cursor-pointer" title="Enviar enlace personalizado por WhatsApp">
                                <Send className="w-3.5 h-3.5" />
                              </button>
                              <button onClick={() => openEditGuest(guest)} className="p-2 rounded-lg bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 transition-colors cursor-pointer">
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button onClick={() => deleteGuest(guest.id, guest.name)} className="p-2 rounded-lg bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 transition-colors cursor-pointer">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )) : (<tr><td colSpan={5} className="p-8 text-center text-amber-200/50 font-serif italic">No se encontraron invitados.</td></tr>)}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: APARIENCIA & TEMAS DE COLOR */}
          {activeTab === 'apariencia' && (
            <div className="space-y-6">
              {/* Custom Global Color Picker & Manual Input Card */}
              <div className="p-6 rounded-3xl bg-[#181612] border border-[var(--color-gold)] shadow-2xl space-y-6 text-[#f5f0e6]">
                <div className="flex items-center gap-3">
                  <SlidersHorizontal className="w-6 h-6 text-[var(--color-accent)]" />
                  <div>
                    <h2 className="font-cinzel text-2xl text-amber-100">Personalización de Color Global (Picker & HEX / RGB)</h2>
                    <p className="text-xs text-amber-200/70 font-serif italic">
                      Selecciona o ingresa cualquier color en rueda cromática o código Hexadecimal. Se aplicará a todos los botones, acentos y componentes:
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                  {/* Wheel Picker */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono uppercase tracking-widest text-amber-200/80 block">Selector de Rueda de Color</label>
                    <div className="flex items-center gap-4">
                      <input
                        type="color"
                        value={customHex}
                        onChange={e => setCustomHex(e.target.value)}
                        className="w-16 h-16 rounded-2xl border-2 border-[var(--color-gold)] cursor-pointer bg-transparent"
                      />
                      <div>
                        <span className="text-xs font-mono font-bold block">Tono Activo</span>
                        <span className="text-xs font-mono text-[var(--color-gold-light)]">{customHex.toUpperCase()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Manual HEX Input */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono uppercase tracking-widest text-amber-200/80 block">Código Hexadecimal Manual</label>
                    <input
                      type="text"
                      value={customHex}
                      onChange={e => setCustomHex(e.target.value)}
                      placeholder="#6B7F5A"
                      className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/20 text-xs text-amber-100 font-mono"
                    />
                  </div>

                  {/* White Background Option */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono uppercase tracking-widest text-amber-200/80 block">Fondo Principal por Defecto</label>
                    <div className="flex items-center gap-4 pt-1">
                      <label className="flex items-center gap-2 text-xs text-amber-100 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isWhiteBg}
                          onChange={e => setIsWhiteBg(e.target.checked)}
                        />
                        <span>Fondo Claro / Blanco Nupcial (Recomendado)</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full border border-white/30" style={{ backgroundColor: customHex }} />
                    <span className="text-xs font-serif italic text-amber-200/80">Vista previa del tono primario</span>
                  </div>

                  <button
                    onClick={applyCustomColor}
                    className="px-6 py-3 rounded-full bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white font-bold text-xs uppercase tracking-wider shadow-lg cursor-pointer transition-transform hover:scale-105"
                  >
                    Aplicar Color Global a Todo el Sitio
                  </button>
                </div>
              </div>

              {/* Preset Wedding Palettes */}
              <div className="p-6 rounded-3xl bg-[#181612] border border-white/20 shadow-2xl space-y-4">
                <div>
                  <h2 className="font-cinzel text-2xl text-amber-100">Paletas Predefinidas para Boda & Matrimonio</h2>
                  <p className="text-xs text-amber-200/70 font-serif italic">
                    Paletas de alta costura pre-diseñadas para un cambio instantáneo:
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
                  {ELEGANT_WEDDING_THEMES.map(theme => (
                    <div
                      key={theme.id}
                      onClick={() => weddingConfigService.setTheme(theme.id)}
                      className={`p-6 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-4 ${
                        siteConfig.themeId === theme.id
                          ? 'bg-white/10 border-amber-400 shadow-2xl ring-2 ring-amber-400/50'
                          : 'bg-black/30 border-white/10 hover:border-white/25'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-cinzel text-lg text-amber-100 font-medium">{theme.name}</h3>
                          {siteConfig.themeId === theme.id && (
                            <span className="w-6 h-6 rounded-full bg-amber-400 text-black flex items-center justify-center font-bold text-xs">✓</span>
                          )}
                        </div>
                        <p className="text-xs text-amber-100/70 font-serif italic leading-relaxed mb-4">
                          {theme.description}
                        </p>
                      </div>

                      {/* Color Preview Dots */}
                      <div className="flex items-center gap-2 pt-2 border-t border-white/10">
                        <div className="w-7 h-7 rounded-full border border-white/30" style={{ backgroundColor: theme.previewBg }} title="Color Fondo" />
                        <div className="w-7 h-7 rounded-full border border-white/30" style={{ backgroundColor: theme.previewGold }} title="Color Acento" />
                        <div className="w-7 h-7 rounded-full border border-white/30" style={{ backgroundColor: theme.previewAccent }} title="Color Secundario" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: EDITOR DE SECCIONES & CONTENIDO */}
          {activeTab === 'secciones' && (
            <div className="space-y-8">
              {!canEditPage && (
                <div className="p-4 rounded-2xl bg-amber-500/20 border border-amber-400/40 text-amber-200 text-xs flex items-center gap-3">
                  <Lock className="w-5 h-5 text-amber-400 shrink-0" />
                  <span>Tu cuenta tiene restringidos los permisos de edición por el Superadmin. Contacta al Superadmin para solicitar permisos de edición de página.</span>
                </div>
              )}

              {/* 1. VISIBILIDAD DE SECCIONES PRINCIPALES */}
              <div className="p-6 rounded-3xl bg-[#181612] border border-white/20 shadow-2xl space-y-6">
                <div>
                  <h2 className="font-cinzel text-2xl text-amber-100">Visibilidad de Secciones (Switch ON / OFF)</h2>
                  <p className="text-xs text-amber-200/70 font-serif italic">
                    Activa o desactiva con un switch las secciones principales que aparecerán en el sitio público:
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {[
                    { key: 'hero', name: 'Portada / Hero' },
                    { key: 'story', name: 'Nuestra Historia' },
                    { key: 'gallery', name: 'Galería de Fotos' },
                    { key: 'video', name: 'Reel de Video' },
                    { key: 'countdown', name: 'Cuenta Regresiva' },
                    { key: 'eventDetails', name: 'Detalles & Lugares' },
                    { key: 'dressCode', name: 'Código de Vestimenta' },
                    { key: 'giftRegistry', name: 'Mesa de Regalos' },
                    { key: 'rsvp', name: 'Confirmación RSVP' }
                  ].map(sec => {
                    const isVisible = siteConfig.sectionVisibility[sec.key as keyof WeddingSiteConfig['sectionVisibility']] !== false;
                    return (
                      <div
                        key={sec.key}
                        onClick={() => canEditPage && toggleSection(sec.key as keyof WeddingSiteConfig['sectionVisibility'])}
                        className={`p-4 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                          isVisible ? 'bg-amber-500/10 border-amber-400/40 text-amber-100' : 'bg-black/30 border-white/10 text-white/40'
                        }`}
                      >
                        <span className="text-xs font-mono font-semibold">{sec.name}</span>
                        {isVisible ? <ToggleRight className="w-6 h-6 text-amber-400" /> : <ToggleLeft className="w-6 h-6 text-white/40" />}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 2. AUDIO & MÚSICA EN BUCLE */}
              <div className="p-6 rounded-3xl bg-[#181612] border border-white/20 shadow-2xl space-y-6">
                <div className="flex items-center gap-3">
                  <Music className="w-6 h-6 text-amber-400" />
                  <div>
                    <h2 className="font-cinzel text-xl text-amber-100">Música de Fondo & Reproductor en Bucle</h2>
                    <p className="text-xs text-amber-200/70 font-serif italic">Configura la canción de entrada, enlace MP3 y bucle infinito (`loop`).</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-mono uppercase tracking-widest text-amber-200/80 block mb-1">Título de la Canción</label>
                    <input
                      type="text"
                      disabled={!canEditPage}
                      value={siteConfig.audio.title}
                      onChange={e => weddingConfigService.updateConfig({ audio: { ...siteConfig.audio, title: e.target.value } })}
                      className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs text-amber-100"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono uppercase tracking-widest text-amber-200/80 block mb-1">URL / Enlace Directo Audio MP3</label>
                    <input
                      type="text"
                      disabled={!canEditPage}
                      value={siteConfig.audio.url}
                      onChange={e => weddingConfigService.updateConfig({ audio: { ...siteConfig.audio, url: e.target.value } })}
                      className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs text-amber-100 font-mono"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-6 pt-2">
                  <label className="flex items-center gap-3 text-xs text-amber-100 cursor-pointer">
                    <input
                      type="checkbox"
                      disabled={!canEditPage}
                      checked={siteConfig.audio.loop}
                      onChange={e => weddingConfigService.updateConfig({ audio: { ...siteConfig.audio, loop: e.target.checked } })}
                    />
                    <span>Bucle Infinito (`loop` continuo al terminar)</span>
                  </label>
                  <label className="flex items-center gap-3 text-xs text-amber-100 cursor-pointer">
                    <input
                      type="checkbox"
                      disabled={!canEditPage}
                      checked={siteConfig.audio.autoPlay}
                      onChange={e => weddingConfigService.updateConfig({ audio: { ...siteConfig.audio, autoPlay: e.target.checked } })}
                    />
                    <span>Autoplay al ingresar al sitio</span>
                  </label>
                </div>
              </div>

              {/* 3. HERO & NOVIOS EDITOR */}
              <div className="p-6 rounded-3xl bg-[#181612] border border-white/20 shadow-2xl space-y-6">
                <div className="flex items-center gap-3">
                  <Heart className="w-6 h-6 text-amber-400" />
                  <h2 className="font-cinzel text-xl text-amber-100">Información Principal de la Boda & Novios</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-mono uppercase tracking-widest text-amber-200/80 block mb-1">Nombre Novio</label>
                    <input type="text" disabled={!canEditPage} value={siteConfig.hero.groom} onChange={e => weddingConfigService.updateConfig({ hero: { ...siteConfig.hero, groom: e.target.value } })} className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs text-amber-100" />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono uppercase tracking-widest text-amber-200/80 block mb-1">Nombre Novia</label>
                    <input type="text" disabled={!canEditPage} value={siteConfig.hero.bride} onChange={e => weddingConfigService.updateConfig({ hero: { ...siteConfig.hero, bride: e.target.value } })} className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs text-amber-100" />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono uppercase tracking-widest text-amber-200/80 block mb-1">Fecha Formateada</label>
                    <input type="text" disabled={!canEditPage} value={siteConfig.hero.dateFormatted} onChange={e => weddingConfigService.updateConfig({ hero: { ...siteConfig.hero, dateFormatted: e.target.value } })} className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs text-amber-100" />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono uppercase tracking-widest text-amber-200/80 block mb-1">Ciudad / País</label>
                    <input type="text" disabled={!canEditPage} value={siteConfig.hero.city} onChange={e => weddingConfigService.updateConfig({ hero: { ...siteConfig.hero, city: e.target.value } })} className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs text-amber-100" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-[10px] font-mono uppercase tracking-widest text-amber-200/80 block mb-1">Frase / Cita Nupcial</label>
                    <textarea rows={2} disabled={!canEditPage} value={siteConfig.hero.quote} onChange={e => weddingConfigService.updateConfig({ hero: { ...siteConfig.hero, quote: e.target.value } })} className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs text-amber-100" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-[10px] font-mono uppercase tracking-widest text-amber-200/80 block mb-1">URL Foto de Portada (Hero Image)</label>
                    <input type="text" disabled={!canEditPage} value={siteConfig.hero.coverImage} onChange={e => weddingConfigService.updateConfig({ hero: { ...siteConfig.hero, coverImage: e.target.value } })} className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs text-amber-100 font-mono" />
                  </div>
                </div>
              </div>

              {/* 4. MESA DE REGALOS (CUENTAS BANCARIAS DINÁMICAS) */}
              <div className="p-6 rounded-3xl bg-[#181612] border border-white/20 shadow-2xl space-y-6">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Building2 className="w-6 h-6 text-amber-400" />
                    <div>
                      <h2 className="font-cinzel text-xl text-amber-100">Cuentas Bancarias & Mesa de Regalos</h2>
                      <p className="text-xs text-amber-200/70 font-serif italic">Agrega, edita o desactiva tarjetas de cuentas bancarias según lo necesites.</p>
                    </div>
                  </div>
                  {canEditPage && (
                    <button onClick={openCreateBank} className="px-4 py-2 rounded-full bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer">
                      <Plus className="w-4 h-4" />
                      <span>Nueva Cuenta</span>
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {siteConfig.bankAccounts.map(b => (
                    <div key={b.id} className={`p-4 rounded-2xl border flex items-center justify-between ${b.isVisible !== false ? 'bg-black/40 border-white/15' : 'bg-white/5 border-white/5 opacity-50'}`}>
                      <div>
                        <strong className="text-amber-100 block text-sm">{b.bankName}</strong>
                        <span className="text-xs text-amber-200/70 font-mono">{b.accountType} • {b.accountNumber}</span>
                        <span className="text-[10px] text-amber-300/60 block mt-0.5">{b.holderName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => toggleBankVisibility(b.id)} className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-amber-200" title={b.isVisible !== false ? "Ocultar tarjeta" : "Mostrar tarjeta"}>
                          {b.isVisible !== false ? <Eye className="w-4 h-4 text-emerald-400" /> : <EyeOff className="w-4 h-4 text-white/40" />}
                        </button>
                        {canEditPage && (
                          <>
                            <button onClick={() => openEditBank(b)} className="p-2 rounded-lg bg-amber-500/20 text-amber-300 hover:bg-amber-500/30"><Edit2 className="w-4 h-4" /></button>
                            <button onClick={() => deleteBank(b.id, b.bankName)} className="p-2 rounded-lg bg-rose-500/20 text-rose-300 hover:bg-rose-500/30"><Trash2 className="w-4 h-4" /></button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 5. LUGARES DEL EVENTO (VENUES) */}
              <div className="p-6 rounded-3xl bg-[#181612] border border-white/20 shadow-2xl space-y-6">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-6 h-6 text-amber-400" />
                    <div>
                      <h2 className="font-cinzel text-xl text-amber-100">Lugares del Evento (Ceremonia & Recepción)</h2>
                      <p className="text-xs text-amber-200/70 font-serif italic">Gestiona las tarjetas de lugares de la boda.</p>
                    </div>
                  </div>
                  {canEditPage && (
                    <button onClick={openCreateVenue} className="px-4 py-2 rounded-full bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer">
                      <Plus className="w-4 h-4" />
                      <span>Nuevo Lugar</span>
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {siteConfig.venues.map(v => (
                    <div key={v.id} className={`p-4 rounded-2xl border flex items-center justify-between ${v.isVisible !== false ? 'bg-black/40 border-white/15' : 'bg-white/5 border-white/5 opacity-50'}`}>
                      <div>
                        <strong className="text-amber-100 block text-sm">{v.name} ({v.type.toUpperCase()})</strong>
                        <span className="text-xs text-amber-200/70 font-mono">{v.time} • {v.address}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => toggleVenueVisibility(v.id)} className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-amber-200" title={v.isVisible !== false ? "Ocultar tarjeta" : "Mostrar tarjeta"}>
                          {v.isVisible !== false ? <Eye className="w-4 h-4 text-emerald-400" /> : <EyeOff className="w-4 h-4 text-white/40" />}
                        </button>
                        {canEditPage && (
                          <>
                            <button onClick={() => openEditVenue(v)} className="p-2 rounded-lg bg-amber-500/20 text-amber-300 hover:bg-amber-500/30"><Edit2 className="w-4 h-4" /></button>
                            <button onClick={() => deleteVenue(v.id, v.name)} className="p-2 rounded-lg bg-rose-500/20 text-rose-300 hover:bg-rose-500/30"><Trash2 className="w-4 h-4" /></button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 6. GALERÍA DE FOTOS Y ESTILO DE CARRUSEL */}
              <div className="p-6 rounded-3xl bg-[#181612] border border-white/20 shadow-2xl space-y-6">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Camera className="w-6 h-6 text-amber-400" />
                    <div>
                      <h2 className="font-cinzel text-xl text-amber-100">Modo de Visualización de Galería</h2>
                      <p className="text-xs text-amber-200/70 font-serif italic">Selecciona entre Carrusel Slider o Grid Revista.</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <button
                    onClick={() => weddingConfigService.updateConfig({ galleryConfig: { layoutStyle: 'grid' } })}
                    className={`px-5 py-3 rounded-xl border text-xs font-mono uppercase tracking-wider transition-all cursor-pointer ${
                      siteConfig.galleryConfig.layoutStyle === 'grid' ? 'bg-amber-500 text-white font-bold border-amber-400' : 'bg-black/40 border-white/15 text-amber-200/70'
                    }`}
                  >
                    Grid Tipo Revista
                  </button>
                  <button
                    onClick={() => weddingConfigService.updateConfig({ galleryConfig: { layoutStyle: 'carousel' } })}
                    className={`px-5 py-3 rounded-xl border text-xs font-mono uppercase tracking-wider transition-all cursor-pointer ${
                      siteConfig.galleryConfig.layoutStyle === 'carousel' ? 'bg-amber-500 text-white font-bold border-amber-400' : 'bg-black/40 border-white/15 text-amber-200/70'
                    }`}
                  >
                    Carrusel Deslizable (Slider)
                  </button>
                </div>

                {/* Photo Subida */}
                <div className="pt-4 border-t border-white/10 space-y-4">
                  <span className="text-xs text-amber-100 font-semibold block">Subir fotos a la galería</span>
                  <select value={selectedAlbumId} onChange={e => setSelectedAlbumId(e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-[#181612] border border-white/15 text-xs text-amber-100">
                    {albums.map(album => <option key={album.id} value={album.id}>{album.title} ({album.photoCount})</option>)}
                  </select>
                  <input type="file" multiple accept="image/*" onChange={e => setPhotoFiles(Array.from(e.target.files || []))} className="w-full text-xs text-amber-100" />
                  <button onClick={() => void uploadPhotos()} disabled={isUploadingPhotos || photoFiles.length === 0} className="py-2.5 px-6 rounded-full bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    <span>{isUploadingPhotos ? 'Subiendo...' : 'Subir Fotos Seleccionadas'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SUPERADMIN & USUARIOS */}
          {activeTab === 'usuarios' && isSuperadmin && (
            <div className="space-y-6">
              <div className="p-6 rounded-3xl bg-[#181612] border border-amber-300/20 shadow-2xl space-y-6 text-[#f5f0e6]">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-amber-300/70 block">Gobernanza de Plataforma Multitenant</span>
                    <h2 className="font-cinzel text-2xl text-amber-100">Administración de Usuarios (Admins / Novios)</h2>
                  </div>
                  <button onClick={openCreateUser} className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs uppercase tracking-[0.15em] shadow-lg hover:scale-105 transition-all cursor-pointer">
                    <UserPlus className="w-4 h-4 text-white" />
                    <span>Crear Nuevo Admin</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {users.map(user => {
                    const status = userStatusMap[user.id] || 'active';
                    const canEdit = userEditPermissions[user.id] !== false;

                    return (
                      <div key={user.id} className="p-6 rounded-2xl bg-black/40 border border-white/10 flex flex-col justify-between gap-4">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <strong className="text-amber-100 block text-base">{user.fullName}</strong>
                            <span className={`px-2.5 py-0.5 rounded-full font-mono text-[10px] uppercase font-bold ${status === 'active' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'}`}>
                              {status === 'active' ? 'Activo' : 'Deshabilitado'}
                            </span>
                          </div>
                          <span className="text-[11px] font-mono text-amber-300/60 block">Usuario: {user.username} · Rol: {user.role}</span>
                        </div>

                        <div className="space-y-3 pt-3 border-t border-white/10">
                          {/* Impersonation / Direct Site Management */}
                          <button
                            onClick={() => impersonateAdminSite(user)}
                            className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-amber-200 text-xs font-mono font-bold uppercase tracking-wider transition-colors cursor-pointer"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>⚙️ Administrar & Editar Sitio de este Admin</span>
                          </button>

                          <div className="flex items-center justify-between text-xs text-amber-100">
                            <span>Estado de Cuenta:</span>
                            <button onClick={() => toggleUserStatus(user)} className={`px-3 py-1 rounded-lg text-xs font-mono uppercase font-bold cursor-pointer transition-colors ${status === 'active' ? 'bg-rose-500/20 text-rose-300 hover:bg-rose-500/30' : 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'}`}>
                              {status === 'active' ? 'Deshabilitar' : 'Habilitar'}
                            </button>
                          </div>

                          <div className="flex items-center justify-between text-xs text-amber-100">
                            <span>Permisos de Edición:</span>
                            <button onClick={() => toggleUserEditPermission(user.id)} className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono uppercase font-bold cursor-pointer transition-colors ${canEdit ? 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30' : 'bg-white/10 text-white/50'}`}>
                              {canEdit ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                              <span>{canEdit ? 'Permitido' : 'Restringido'}</span>
                            </button>
                          </div>

                          {/* Password Management */}
                          <div className="flex items-center justify-between text-xs text-amber-100">
                            <span>Contraseña de Acceso:</span>
                            <button onClick={() => openEditPasswordModal(user)} className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 text-xs font-mono uppercase font-bold cursor-pointer">
                              <KeyRound className="w-3.5 h-3.5" />
                              <span>Cambiar / Ver Contraseña</span>
                            </button>
                          </div>
                        </div>

                        <div className="pt-2 flex justify-end">
                          <button onClick={() => deleteUserCascade(user)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 transition-colors cursor-pointer text-xs font-bold uppercase tracking-wider">
                            <Trash2 className="w-4 h-4" />
                            <span>Eliminar Admin (Cascada)</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ═══════════════════════════════════════════════════════════════
            MODALS FOR GUEST, BANK, VENUE, USER & PASSWORD EDIT
           ═══════════════════════════════════════════════════════════════ */}

        {/* Guest Modal — Simplified form: NO manual code input needed! */}
        <Modal
          isOpen={isGuestModalOpen}
          onClose={() => setIsGuestModalOpen(false)}
          title={editingGuest ? 'Editar Invitado' : 'Crear Nuevo Invitado'}
          size="md"
          footer={
            <div className="flex items-center justify-end gap-3">
              <button type="button" onClick={() => setIsGuestModalOpen(false)} className="px-5 py-2.5 rounded-full bg-white/10 text-xs text-amber-100 hover:bg-white/20 transition-colors cursor-pointer">Cancelar</button>
              <button type="submit" form="guest-form" disabled={isSavingGuest} className="px-6 py-2.5 rounded-full bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs uppercase tracking-[0.15em] shadow-lg hover:scale-[1.02] transition-transform cursor-pointer disabled:opacity-50">{isSavingGuest ? 'Guardando...' : 'Guardar Invitado'}</button>
            </div>
          }
        >
          <form id="guest-form" onSubmit={e => void saveGuest(e)} className="space-y-4">
            <div>
              <label className="text-[10px] font-mono uppercase tracking-widest text-amber-200/80 block mb-1">Nombre Completo / Familia *</label>
              <input type="text" required value={guestFormData.name} onChange={e => setGuestFormData({ ...guestFormData, name: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs text-amber-100 focus:outline-none focus:border-amber-300" placeholder="Ej. Familia Naranjo Viteri" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-mono uppercase tracking-widest text-amber-200/80 block mb-1">Categoría</label>
                <select value={guestFormData.category} onChange={e => setGuestFormData({ ...guestFormData, category: e.target.value as GuestCategory })} className="w-full px-4 py-2.5 rounded-xl bg-[#181612] border border-white/15 text-xs text-amber-100 focus:outline-none focus:border-amber-300">
                  <option value="Familia">Familia</option>
                  <option value="Amigos">Amigos</option>
                  <option value="VIP">VIP</option>
                  <option value="Trabajo">Trabajo</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-mono uppercase tracking-widest text-amber-200/80 block mb-1">Pases Asignados</label>
                <input type="number" min={1} max={10} value={guestFormData.passesAllowed} onChange={e => setGuestFormData({ ...guestFormData, passesAllowed: Number(e.target.value) })} className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs text-amber-100 focus:outline-none focus:border-amber-300" />
              </div>
            </div>
            <div>
              <label className="text-[10px] font-mono uppercase tracking-widest text-amber-200/80 block mb-1">Teléfono / WhatsApp (para envío directo)</label>
              <input type="text" value={guestFormData.phone} onChange={e => setGuestFormData({ ...guestFormData, phone: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs text-amber-100 focus:outline-none focus:border-amber-300" placeholder="+593 99 876 5432" />
            </div>
            <div>
              <label className="text-[10px] font-mono uppercase tracking-widest text-amber-200/80 block mb-1">Notas Internas</label>
              <textarea rows={2} value={guestFormData.notes} onChange={e => setGuestFormData({ ...guestFormData, notes: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs text-amber-100 focus:outline-none focus:border-amber-300" placeholder="Ej. Padrinos de boda..." />
            </div>
          </form>
        </Modal>

        {/* Bank Account Modal */}
        <Modal
          isOpen={isBankModalOpen}
          onClose={() => setIsBankModalOpen(false)}
          title={editingBank ? 'Editar Cuenta Bancaria' : 'Agregar Cuenta Bancaria'}
          size="md"
          footer={
            <div className="flex items-center justify-end gap-3">
              <button type="button" onClick={() => setIsBankModalOpen(false)} className="px-5 py-2.5 rounded-full bg-white/10 text-xs text-amber-100 hover:bg-white/20 transition-colors cursor-pointer">Cancelar</button>
              <button type="submit" form="bank-form" className="px-6 py-2.5 rounded-full bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs uppercase tracking-[0.15em] shadow-lg hover:scale-[1.02] transition-transform cursor-pointer">Guardar Cuenta</button>
            </div>
          }
        >
          <form id="bank-form" onSubmit={saveBank} className="space-y-4">
            <div>
              <label className="text-[10px] font-mono uppercase tracking-widest text-amber-200/80 block mb-1">Nombre del Banco *</label>
              <input type="text" required value={bankFormData.bankName} onChange={e => setBankFormData({ ...bankFormData, bankName: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs text-amber-100" placeholder="Ej. Banco Pichincha" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-mono uppercase tracking-widest text-amber-200/80 block mb-1">Tipo de Cuenta</label>
                <input type="text" required value={bankFormData.accountType} onChange={e => setBankFormData({ ...bankFormData, accountType: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs text-amber-100" placeholder="Cuenta de Ahorros" />
              </div>
              <div>
                <label className="text-[10px] font-mono uppercase tracking-widest text-amber-200/80 block mb-1">Número de Cuenta *</label>
                <input type="text" required value={bankFormData.accountNumber} onChange={e => setBankFormData({ ...bankFormData, accountNumber: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs text-amber-100 font-mono" placeholder="2205481904" />
              </div>
            </div>
            <div>
              <label className="text-[10px] font-mono uppercase tracking-widest text-amber-200/80 block mb-1">Nombre del Titular</label>
              <input type="text" value={bankFormData.holderName} onChange={e => setBankFormData({ ...bankFormData, holderName: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs text-amber-100" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-mono uppercase tracking-widest text-amber-200/80 block mb-1">C.I. / RUC</label>
                <input type="text" value={bankFormData.idNumber} onChange={e => setBankFormData({ ...bankFormData, idNumber: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs text-amber-100" />
              </div>
              <div>
                <label className="text-[10px] font-mono uppercase tracking-widest text-amber-200/80 block mb-1">Email</label>
                <input type="email" value={bankFormData.email} onChange={e => setBankFormData({ ...bankFormData, email: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs text-amber-100" />
              </div>
            </div>
          </form>
        </Modal>

        {/* Venue Modal */}
        <Modal
          isOpen={isVenueModalOpen}
          onClose={() => setIsVenueModalOpen(false)}
          title={editingVenue ? 'Editar Lugar del Evento' : 'Agregar Lugar'}
          size="lg"
          footer={
            <div className="flex items-center justify-end gap-3">
              <button type="button" onClick={() => setIsVenueModalOpen(false)} className="px-5 py-2.5 rounded-full bg-white/10 text-xs text-amber-100 hover:bg-white/20 transition-colors cursor-pointer">Cancelar</button>
              <button type="submit" form="venue-form" className="px-6 py-2.5 rounded-full bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs uppercase tracking-[0.15em] shadow-lg hover:scale-[1.02] transition-transform cursor-pointer">Guardar Lugar</button>
            </div>
          }
        >
          <form id="venue-form" onSubmit={saveVenue} className="space-y-4">
            <div>
              <label className="text-[10px] font-mono uppercase tracking-widest text-amber-200/80 block mb-1">Nombre del Lugar *</label>
              <input type="text" required value={venueFormData.name} onChange={e => setVenueFormData({ ...venueFormData, name: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs text-amber-100" placeholder="Ej. Quinta Loren" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-mono uppercase tracking-widest text-amber-200/80 block mb-1">Tipo</label>
                <select value={venueFormData.type} onChange={e => setVenueFormData({ ...venueFormData, type: e.target.value as 'ceremonia' | 'recepcion' })} className="w-full px-4 py-2.5 rounded-xl bg-[#181612] border border-white/15 text-xs text-amber-100">
                  <option value="ceremonia">Ceremonia Religiosa</option>
                  <option value="recepcion">Recepción & Fiesta</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-mono uppercase tracking-widest text-amber-200/80 block mb-1">Hora</label>
                <input type="text" value={venueFormData.time} onChange={e => setVenueFormData({ ...venueFormData, time: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs text-amber-100" placeholder="19:00 PM" />
              </div>
            </div>
            <div>
              <label className="text-[10px] font-mono uppercase tracking-widest text-amber-200/80 block mb-1">Dirección</label>
              <input type="text" value={venueFormData.address} onChange={e => setVenueFormData({ ...venueFormData, address: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs text-amber-100" placeholder="Av. Los Guaytambos, Ficoa" />
            </div>
            <div>
              <label className="text-[10px] font-mono uppercase tracking-widest text-amber-200/80 block mb-1">URL Google Maps</label>
              <input type="text" value={venueFormData.googleMapsUrl} onChange={e => setVenueFormData({ ...venueFormData, googleMapsUrl: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs text-amber-100 font-mono" placeholder="https://maps.google.com/..." />
            </div>
            <div>
              <label className="text-[10px] font-mono uppercase tracking-widest text-amber-200/80 block mb-1">URL Imagen de Fondo</label>
              <input type="text" value={venueFormData.imageUrl} onChange={e => setVenueFormData({ ...venueFormData, imageUrl: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs text-amber-100 font-mono" />
            </div>
            <div>
              <label className="text-[10px] font-mono uppercase tracking-widest text-amber-200/80 block mb-1">Descripción</label>
              <textarea rows={2} value={venueFormData.description} onChange={e => setVenueFormData({ ...venueFormData, description: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs text-amber-100" />
            </div>
          </form>
        </Modal>

        {/* User Modal */}
        <Modal
          isOpen={isUserModalOpen && isSuperadmin}
          onClose={() => setIsUserModalOpen(false)}
          title="Crear Nuevo Admin"
          size="md"
          footer={
            <div className="flex items-center justify-end gap-3">
              <button type="button" onClick={() => setIsUserModalOpen(false)} className="px-5 py-2.5 rounded-full bg-white/10 text-xs text-amber-100 hover:bg-white/20 transition-colors cursor-pointer">Cancelar</button>
              <button type="submit" form="user-form" disabled={isSavingUser} className="px-6 py-2.5 rounded-full bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs uppercase tracking-[0.15em] shadow-lg hover:scale-[1.02] transition-transform cursor-pointer disabled:opacity-50">{isSavingUser ? 'Guardando...' : 'Crear Admin'}</button>
            </div>
          }
        >
          <form id="user-form" onSubmit={e => void saveUser(e)} className="space-y-4">
            <div><label className="text-[10px] font-mono uppercase tracking-widest text-amber-200/80 block mb-1">Nombre Novios / Nombres *</label><input type="text" required value={userFormData.fullName} onChange={e => setUserFormData({ ...userFormData, fullName: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs text-amber-100" placeholder="Ej. Mateo & Camila" /></div>
            <div className="grid grid-cols-2 gap-4"><div><label className="text-[10px] font-mono uppercase tracking-widest text-amber-200/80 block mb-1">Usuario / Subdominio *</label><input type="text" required value={userFormData.username} onChange={e => setUserFormData({ ...userFormData, username: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs text-amber-100" placeholder="mateoycamila" /></div><div><label className="text-[10px] font-mono uppercase tracking-widest text-amber-200/80 block mb-1">Contraseña *</label><input type="password" required value={userFormData.password} onChange={e => setUserFormData({ ...userFormData, password: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs text-amber-100" placeholder="••••••••" /></div></div>
            <div><label className="text-[10px] font-mono uppercase tracking-widest text-amber-200/80 block mb-1">Rol</label><select value={userFormData.role} onChange={e => setUserFormData({ ...userFormData, role: e.target.value as 'superadmin' | 'admin' | 'user' })} className="w-full px-4 py-2.5 rounded-xl bg-[#181612] border border-white/15 text-xs text-amber-100"><option value="admin">Admin (Novios)</option><option value="superadmin">Superadmin</option></select></div>
          </form>
        </Modal>

        {/* Edit Password Modal */}
        <Modal
          isOpen={isPasswordModalOpen && isSuperadmin}
          onClose={() => setIsPasswordModalOpen(false)}
          title={`Cambiar Contraseña: ${editingUserForPassword?.fullName || ''}`}
          size="md"
          footer={
            <div className="flex items-center justify-end gap-3">
              <button type="button" onClick={() => setIsPasswordModalOpen(false)} className="px-5 py-2.5 rounded-full bg-white/10 text-xs text-amber-100 hover:bg-white/20 transition-colors cursor-pointer">Cancelar</button>
              <button type="submit" form="password-form" disabled={isSavingPassword} className="px-6 py-2.5 rounded-full bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white font-bold text-xs uppercase tracking-[0.15em] shadow-lg cursor-pointer disabled:opacity-50">{isSavingPassword ? 'Actualizando...' : 'Guardar Nueva Contraseña'}</button>
            </div>
          }
        >
          <form id="password-form" onSubmit={e => void saveUserPassword(e)} className="space-y-4">
            <div>
              <label className="text-[10px] font-mono uppercase tracking-widest text-amber-200/80 block mb-1">Usuario Admin</label>
              <input type="text" disabled value={editingUserForPassword?.username || ''} className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-amber-200/50 font-mono" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[10px] font-mono uppercase tracking-widest text-amber-200/80 block">Nueva Contraseña *</label>
                <button type="button" onClick={() => setShowPasswordText(!showPasswordText)} className="text-[10px] font-mono text-[var(--color-accent)] hover:underline cursor-pointer">
                  {showPasswordText ? 'Ocultar' : 'Mostrar'}
                </button>
              </div>
              <input
                type={showPasswordText ? 'text' : 'password'}
                required
                value={newPasswordInput}
                onChange={e => setNewPasswordInput(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs text-amber-100 font-mono"
                placeholder="Nueva contraseña segura..."
              />
            </div>
          </form>
        </Modal>

        {/* Confirm Dialog */}
        <ConfirmDialog
          isOpen={confirmDialog.isOpen}
          onClose={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
          onConfirm={confirmDialog.onConfirm}
          title={confirmDialog.title}
          message={confirmDialog.message}
          variant={confirmDialog.variant}
          confirmLabel="Proceder"
          cancelLabel="Cancelar"
        />
      </motion.div>
    </AnimatePresence>
  );
};
