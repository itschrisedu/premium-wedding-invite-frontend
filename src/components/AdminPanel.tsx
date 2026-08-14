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
  Copy,
  Share2,
  ToggleLeft,
  ToggleRight,
  Sparkles,
  Lock,
  Unlock,
  AlertTriangle,
  KeyRound,
  ExternalLink,
  SlidersHorizontal,
  BookOpen,
  Shirt,
  Video,
  Film
} from 'lucide-react';

async function fetchAndCleanYouTubeTitle(url: string): Promise<string | null> {
  if (!url) return null;
  const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|shorts\/|watch\?.+&v=))([\w-]{11})/);
  if (!ytMatch || !ytMatch[1]) return null;

  try {
    const res = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${ytMatch[1]}&format=json`);
    if (!res.ok) return null;
    const data = await res.json();
    const rawTitle: string = data.title || '';

    // Clean up typical YouTube tags & noise: (Official Video), [Audio], (Video Oficial), [4K], etc.
    let clean = rawTitle
      .replace(/[\(\[\{]\s*(official\s*)?(music\s*)?(video|audio|lyric|lyrics|video\s*oficial|audio\s*oficial|letra|4k|hd|remastered|vevo|clip|hd\s*video|4k\s*video)[\)\]\}]/gi, '')
      .replace(/\b(official video|official audio|music video|video oficial|audio oficial|lyric video)\b/gi, '')
      .replace(/[\(\[\{]\s*[\)\]\}]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    clean = clean.replace(/^[\s\-–|]+|[\s\-–|]+$/g, '').trim();

    return clean || rawTitle;
  } catch {
    return null;
  }
}
import { Guest, GuestCategory, GalleryImage } from '../types';
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

  // Legal Terms & LOPDP / GDPR Privacy Consent Audit State
  const [userTermsMap, setUserTermsMap] = useState<Record<string, { accepted: boolean; acceptedAt?: string; version?: string }>>(() => {
    try {
      const stored = localStorage.getItem('mateo_camila_terms_audit_v1');
      return stored ? JSON.parse(stored) : { '1': { accepted: true, acceptedAt: new Date().toISOString(), version: 'v1.0-2026' } };
    } catch {
      return { '1': { accepted: true, acceptedAt: new Date().toISOString(), version: 'v1.0-2026' } };
    }
  });
  const [hasAcceptedTermsCheckbox, setHasAcceptedTermsCheckbox] = useState(false);
  const [isAcceptingTerms, setIsAcceptingTerms] = useState(false);

  // Failed Login Attempts Security Lock Map with 24-hour automatic reset timer
  const [lockoutMap, setLockoutMap] = useState<Record<string, { count: number; lockedUntil?: string }>>(() => {
    try {
      const stored = localStorage.getItem('mateo_camila_lockout_map_v2');
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  // Share Credentials & Domain Link Modal
  const [isCredentialsModalOpen, setIsCredentialsModalOpen] = useState(false);
  const [shareCredentialsData, setShareCredentialsData] = useState({ fullName: '', username: '', password: '' });
  const [copiedCredentialsToast, setCopiedCredentialsToast] = useState(false);
  const [newPhotoUrl, setNewPhotoUrl] = useState('');

  // Superadmin Event Ceremony Permissions per Admin User (Civil / Eclesiástico / Recepción)
  const [userCeremonyMap, setUserCeremonyMap] = useState<Record<string, { civil: boolean; eclesiastico: boolean; recepcion: boolean }>>(() => {
    try {
      const stored = localStorage.getItem('mateo_camila_user_ceremonies_v1');
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  const toggleUserCeremonyPerm = (userId: string, key: 'civil' | 'eclesiastico' | 'recepcion') => {
    const current = userCeremonyMap[userId] || { civil: true, eclesiastico: true, recepcion: true };
    const updatedUserPerms = { ...current, [key]: !current[key] };
    const nextMap = { ...userCeremonyMap, [userId]: updatedUserPerms };
    setUserCeremonyMap(nextMap);
    try {
      localStorage.setItem('mateo_camila_user_ceremonies_v1', JSON.stringify(nextMap));
    } catch {
      // ignore
    }
  };

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
    type: 'recepcion' as 'civil' | 'eclesiastico' | 'ceremonia' | 'recepcion',
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
            <div className="w-full rounded-3xl bg-[#2D3B2A] border border-[var(--color-gold)] shadow-2xl p-8 md:p-10 space-y-6 text-[#f5f0e6]">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[var(--color-gold)]/10 border border-[var(--color-border-soft)]/30 flex items-center justify-center text-[#8A9D76]">
                    <Shield className="w-6 h-6 text-[var(--color-gold-light)]" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-[#8A9D76]/70 block">Acceso Administrativo Nupcial</span>
                    <h1 className="font-cinzel text-2xl font-light text-[#EAF0E6] gold-gradient-text">Boda & Matrimonio</h1>
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
                  const targetUser = loginData.username.trim();
                  const userLock = lockoutMap[targetUser] || { count: 0 };
                  const now = new Date().getTime();

                  let is24hLocked = false;
                  let hoursRemaining = 24;

                  if (userLock.count >= 3 && userLock.lockedUntil) {
                    const lockUntilMs = new Date(userLock.lockedUntil).getTime();
                    if (now < lockUntilMs) {
                      is24hLocked = true;
                      hoursRemaining = Math.max(1, Math.ceil((lockUntilMs - now) / (1000 * 60 * 60)));
                    } else {
                      // 24 hours have passed! Automatically reset and unlock account!
                      is24hLocked = false;
                    }
                  }

                  const isManualDisabled = userStatusMap[targetUser] === 'disabled';

                  if (is24hLocked) {
                    setLoginError(`⏳ Tu cuenta está bloqueada por 3 intentos fallidos. Podrás intentar nuevamente en approx. ${hoursRemaining} hora(s) (o solicita al Superadministrador que la desbloquee de inmediato).`);
                    return;
                  }

                  if (isManualDisabled) {
                    setLoginError("🚨 Tu cuenta ha sido DESHABILITADA por el Superadministrador. Por favor contacta para reactivarla.");
                    return;
                  }

                  setIsLoggingIn(true);
                  setLoginError('');
                  try {
                    await authService.login(targetUser, loginData.password);
                    // Reset lockout count on successful login
                    setLockoutMap(prev => {
                      const next = { ...prev, [targetUser]: { count: 0 } };
                      try { localStorage.setItem('mateo_camila_lockout_map_v2', JSON.stringify(next)); } catch {}
                      return next;
                    });
                  } catch {
                    const nextCount = (is24hLocked ? 0 : userLock.count || 0) + 1;
                    const lockUntilIso = nextCount >= 3 ? new Date(now + 24 * 60 * 60 * 1000).toISOString() : undefined;

                    setLockoutMap(prev => {
                      const next = { ...prev, [targetUser]: { count: nextCount, lockedUntil: lockUntilIso } };
                      try { localStorage.setItem('mateo_camila_lockout_map_v2', JSON.stringify(next)); } catch {}
                      return next;
                    });

                    if (nextCount >= 3) {
                      setLoginError("🚨 Tu cuenta ha sido bloqueada temporalmente por 24 HORAS debido a 3 intentos fallidos consecutivos. Podrás intentar nuevamente mañana o solicitar al Superadministrador que la desbloquee de inmediato.");
                    } else {
                      setLoginError(`❌ Credenciales incorrectas. Intento ${nextCount} de 3. (Al 3º intento fallido la cuenta se bloqueará por 24 horas).`);
                    }
                  } finally {
                    setIsLoggingIn(false);
                  }
                }}
              >
                <div>
                  <label className="text-[10px] font-mono uppercase tracking-widest text-[#B1C2A5] block mb-1">Usuario</label>
                  <input type="text" value={loginData.username} onChange={e => setLoginData({ ...loginData, username: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs text-[#EAF0E6] focus:outline-none focus:border-[var(--color-gold)]" placeholder="superadmin" />
                </div>
                <div>
                  <label className="text-[10px] font-mono uppercase tracking-widest text-[#B1C2A5] block mb-1">Contraseña</label>
                  <input type="password" value={loginData.password} onChange={e => setLoginData({ ...loginData, password: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs text-[#EAF0E6] focus:outline-none focus:border-[var(--color-gold)]" placeholder="••••••••" />
                </div>
                {loginError && <p className="text-rose-300 text-xs font-mono">{loginError}</p>}
                <button type="submit" disabled={isLoggingIn} className="w-full py-3 rounded-full bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white font-bold text-xs uppercase tracking-[0.2em] transition-all cursor-pointer disabled:opacity-50">
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
    const initialPass = (user as unknown as { password?: string }).password || (user.username === 'superadmin' ? 'superadmin' : 'mateo2026');
    setNewPasswordInput(initialPass);
    setShowPasswordText(true);
    setIsPasswordModalOpen(true);
  };

  const handleRequestSavePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUserForPassword || !newPasswordInput) return;

    setConfirmDialog({
      isOpen: true,
      title: '🔐 Confirmar Cambio de Contraseña',
      message: `¿Estás seguro de guardar y actualizar la contraseña de acceso para "${editingUserForPassword.fullName}" a "${newPasswordInput}"?`,
      variant: 'default',
      onConfirm: () => void executeSavePassword()
    });
  };

  const executeSavePassword = async () => {
    if (!editingUserForPassword || !newPasswordInput) return;
    const token = authService.getToken();

    setIsSavingPassword(true);
    try {
      if (token) {
        await apiService.updateUserPassword(token, editingUserForPassword.id, newPasswordInput);
      }
      setUsers(prev => prev.map(u => u.id === editingUserForPassword.id ? { ...u, password: newPasswordInput } as AdminUser : u));
      setIsPasswordModalOpen(false);
      setEditingUserForPassword(null);
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

      // Open Share Credentials & Domain Link Modal
      setShareCredentialsData({
        fullName: userFormData.fullName,
        username: userFormData.username,
        password: userFormData.password
      });
      setIsCredentialsModalOpen(true);
    } finally {
      setIsSavingUser(false);
    }
  };

  const openShareCredentialsModal = (user: AdminUser) => {
    const userPass = (user as unknown as { password?: string }).password || (user.username === 'superadmin' ? 'superadmin' : 'mateo2026');
    setShareCredentialsData({
      fullName: user.fullName,
      username: user.username,
      password: userPass
    });
    setIsCredentialsModalOpen(true);
  };

  const toggleUserStatus = async (user: AdminUser) => {
    const current = userStatusMap[user.id] || 'active';
    const next = current === 'active' ? 'disabled' : 'active';
    setUserStatusMap(prev => ({ ...prev, [user.id]: next }));

    // Reset failed login attempts and 24h lockout when Superadmin enables account
    if (next === 'active') {
      setLockoutMap(prev => {
        const updated = { ...prev, [user.username]: { count: 0 } };
        try { localStorage.setItem('mateo_camila_lockout_map_v2', JSON.stringify(updated)); } catch {}
        return updated;
      });
    }

    const token = authService.getToken();
    if (token) {
      try {
        await apiService.updateUserSettings(token, user.id, { status: next });
      } catch {
        // ignore fallback
      }
    }
  };

  const acceptTermsAndConditions = async () => {
    if (!currentUserId || !hasAcceptedTermsCheckbox) return;

    setIsAcceptingTerms(true);
    const nowIso = new Date().toISOString();
    const newEntry = { accepted: true, acceptedAt: nowIso, version: 'v1.0-2026' };

    setUserTermsMap(prev => {
      const next = { ...prev, [currentUserId]: newEntry };
      try {
        localStorage.setItem('mateo_camila_terms_audit_v1', JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });

    const token = authService.getToken();
    if (token) {
      try {
        await apiService.updateUserSettings(token, currentUserId, { terms: newEntry });
      } catch {
        // ignore
      }
    }
    setIsAcceptingTerms(false);
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

  // --- Photo Upload (Files or URL links) ---
  const uploadPhotos = async () => {
    if (photoFiles.length === 0) return;
    setIsUploadingPhotos(true);

    try {
      const newCustomPhotos: GalleryImage[] = [];
      for (const file of photoFiles) {
        const dataUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = e => resolve(e.target?.result as string);
          reader.readAsDataURL(file);
        });

        newCustomPhotos.push({
          id: `gal-${Date.now()}-${Math.random().toString().slice(-4)}`,
          url: dataUrl,
          title: file.name.replace(/\.[^/.]+$/, ''),
          locationTag: 'Subida desde Panel',
          caption: 'Fotografía de la sesión de bodas.',
          aspectRatio: 'square'
        });
      }

      const token = authService.getToken();
      if (token && selectedAlbumId) {
        await galleryService.uploadPhotos(token, selectedAlbumId, photoFiles).catch(() => {});
      }

      const current = siteConfig.galleryConfig.customPhotos || [];
      weddingConfigService.updateConfig({
        galleryConfig: {
          ...siteConfig.galleryConfig,
          customPhotos: [...current, ...newCustomPhotos].slice(0, 9)
        }
      });
      setPhotoFiles([]);
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

  // Check if current user has accepted Terms & Data Privacy (LOPDP / GDPR)
  const currentTerms = userTermsMap[currentUserId];
  const hasAcceptedTerms = isSuperadmin || Boolean(currentTerms?.accepted);

  // MANDATORY TERMS ACCEPTANCE MODAL
  if (!hasAcceptedTerms) {
    return (
      <AnimatePresence>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 overflow-y-auto bg-black/92 backdrop-blur-2xl p-4 md:p-8 flex items-center justify-center">
          <div className="max-w-2xl w-full rounded-3xl bg-[#2D3B2A] border-2 border-[var(--color-gold)] shadow-2xl p-6 sm:p-10 space-y-6 text-[#f5f0e6] my-8">
            <div className="flex items-center gap-4 border-b border-white/10 pb-4">
              <div className="w-14 h-14 rounded-2xl bg-[var(--color-gold)]/20 border border-[var(--color-gold)]/40 flex items-center justify-center text-[var(--color-gold-light)] shrink-0">
                <FileText className="w-7 h-7 text-[var(--color-gold-light)]" />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#8A9D76] block font-bold">Cumplimiento Legal & Protección de Datos (LOPDP / GDPR)</span>
                <h2 className="font-cinzel text-xl sm:text-2xl text-[#EAF0E6]">Términos de Servicio & Política de Privacidad</h2>
              </div>
            </div>

            <p className="text-xs text-[#EAF0E6]/90 leading-relaxed font-sans">
              Para ingresar y gestionar tu plataforma de bodas, es requisito legal obligatorio leer y aceptar nuestros Términos de Servicio, Acuerdo de Confidencialidad y Tratamiento de Datos Personales.
            </p>

            {/* SCROLLABLE LEGAL TERMS DOCUMENT */}
            <div className="max-h-72 overflow-y-auto p-4 rounded-2xl bg-black/40 border border-white/15 text-xs text-[#EAF0E6]/85 font-sans space-y-4">
              <h3 className="font-bold text-[var(--color-gold-light)] uppercase tracking-wider text-[11px]">1. Protección de Datos Personales (Ley LOPDP & Normativa Internacional)</h3>
              <p className="leading-relaxed">
                El Administrador/Cliente otorga su consentimiento libre, previo, expreso, informado e inequívoco para la recolección, almacenamiento y procesamiento de la información de sus invitados (nombres, teléfonos, restricciones dietéticas, asistencia) con la exclusiva finalidad de coordinar la logística de la boda.
              </p>

              <h3 className="font-bold text-[var(--color-gold-light)] uppercase tracking-wider text-[11px]">2. Responsabilidad Exclusiva sobre el Contenido</h3>
              <p className="leading-relaxed">
                El cliente declara ser el único propietario o contar con las licencias correspondientes sobre las imágenes, música, textos, números de cuenta bancaria y referencias cargadas en la plataforma. La plataforma queda totalmente exenta de responsabilidad legal por disputas de propiedad intelectual o datos provistos por el cliente.
              </p>

              <h3 className="font-bold text-[var(--color-gold-light)] uppercase tracking-wider text-[11px]">3. Uso de Accesos y Seguridad de Credenciales</h3>
              <p className="leading-relaxed">
                Las credenciales de acceso al panel administrativo son personales e intransferibles. El usuario se compromete a resguardar la confidencialidad de su usuario y contraseña, asumiendo responsabilidad legal por cualquier modificación realizada desde su cuenta.
              </p>

              <h3 className="font-bold text-[var(--color-gold-light)] uppercase tracking-wider text-[11px]">4. Cláusula de Indemnidad y Respaldo Jurídico</h3>
              <p className="leading-relaxed">
                El cliente mantendrá indemne a la empresa desarrolladora frente a cualquier reclamo, multa, sanción o demanda promovida por terceros o invitados respecto al manejo de su información personal dentro de la invitación digital.
              </p>

              <h3 className="font-bold text-[var(--color-gold-light)] uppercase tracking-wider text-[11px]">5. Validez Legal y Firma Digital Auditoría</h3>
              <p className="leading-relaxed">
                La aceptación de esta casilla constituye una firma electrónica vinculante con registro auditado de fecha, hora UTC y versión del acuerdo firmado digitalmente por el usuario.
              </p>
            </div>

            {/* CHECKBOX CONSENT */}
            <div className="pt-2">
              <label className="flex items-start gap-3 p-4 rounded-xl bg-white/5 border border-white/10 text-xs text-[#EAF0E6] cursor-pointer hover:bg-white/10 transition-colors">
                <input
                  type="checkbox"
                  checked={hasAcceptedTermsCheckbox}
                  onChange={e => setHasAcceptedTermsCheckbox(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded text-[var(--color-accent)] focus:ring-[var(--color-accent)] cursor-pointer"
                />
                <span className="leading-normal font-medium">
                  Declaro que he leído, comprendo y <strong>ACEPTO INCONDICIONALMENTE</strong> los Términos de Servicio, la Política de Privacidad y la Ley de Protección de Datos Personales (LOPDP/GDPR).
                </span>
              </label>
            </div>

            {/* BUTTONS */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-white/10">
              <button
                onClick={() => authService.logout()}
                className="px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-mono uppercase tracking-wider cursor-pointer"
              >
                Cerrar Sesión / Rechazar
              </button>

              <button
                onClick={() => void acceptTermsAndConditions()}
                disabled={!hasAcceptedTermsCheckbox || isAcceptingTerms}
                className="px-8 py-3 rounded-full bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white font-bold text-xs uppercase tracking-[0.15em] shadow-xl hover:scale-105 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isAcceptingTerms ? 'Guardando Firma...' : 'Aceptar Términos y Acceder al Panel'}
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 overflow-y-auto bg-[#F9F8F3]/98 backdrop-blur-2xl p-4 md:p-8">
        <div className="max-w-7xl mx-auto space-y-6 pb-16">
          {/* Header Panel */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-6 rounded-3xl bg-[#2D3B2A] border border-[var(--color-gold)] shadow-2xl text-[#f5f0e6]">
            <div className="flex items-center gap-3">
              {/* Couple's Initials Circular Monogram Badge */}
              <div className="w-12 h-12 rounded-full bg-white border-2 border-[var(--color-gold)] flex items-center justify-center text-[#2A3828] font-cinzel font-bold text-sm shadow-md shrink-0">
                {(siteConfig.hero.groom || 'M').trim().charAt(0)}<span className="text-[var(--color-accent)] font-serif italic text-xs mx-0.5">&</span>{(siteConfig.hero.bride || 'C').trim().charAt(0)}
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--color-gold-light)] block">
                  {managedAdminUser ? `Gestionando Admin: ${managedAdminUser.fullName}` : 'Panel Administrativo Multitenant Nupcial'}
                </span>
                <h1 className="font-cinzel text-2xl md:text-3xl font-light text-[#EAF0E6] gold-gradient-text">{siteConfig.hero.groom} & {siteConfig.hero.bride}</h1>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {managedAdminUser && (
                <button onClick={() => setManagedAdminUser(null)} className="px-4 py-2 rounded-full bg-[var(--color-gold)]/20 text-[#8A9D76] border border-[var(--color-gold)]/30 text-xs font-mono uppercase font-bold cursor-pointer">
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
          <div className="flex flex-wrap items-center gap-2 p-2 rounded-2xl bg-[#2D3B2A] border border-[var(--color-gold)]">
            <button
              onClick={() => setActiveTab('invitados')}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-mono text-xs uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'invitados' ? 'bg-[var(--color-accent)] text-white font-bold shadow-lg' : 'text-[#8A9D76]/70 hover:bg-white/10'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Invitados ({totalGuests})</span>
            </button>

            <button
              onClick={() => setActiveTab('apariencia')}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-mono text-xs uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'apariencia' ? 'bg-[var(--color-accent)] text-white font-bold shadow-lg' : 'text-[#8A9D76]/70 hover:bg-white/10'
              }`}
            >
              <Palette className="w-4 h-4" />
              <span>Colores & Temas</span>
            </button>

            <button
              onClick={() => setActiveTab('secciones')}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-mono text-xs uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'secciones' ? 'bg-[var(--color-accent)] text-white font-bold shadow-lg' : 'text-[#8A9D76]/70 hover:bg-white/10'
              }`}
            >
              <Layout className="w-4 h-4" />
              <span>Editor de Secciones & Contenido</span>
            </button>

            {isSuperadmin && (
              <button
                onClick={() => setActiveTab('usuarios')}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-mono text-xs uppercase tracking-wider transition-all cursor-pointer ${
                  activeTab === 'usuarios' ? 'bg-[var(--color-accent)] text-white font-bold shadow-lg' : 'text-[#8A9D76]/70 hover:bg-white/10'
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
                <div className="p-6 rounded-2xl bg-[#2D3B2A] border border-white/10">
                  <div className="flex items-center justify-between mb-2"><span className="text-[10px] font-mono uppercase tracking-widest text-[#8A9D76]/60">Total Invitaciones</span><Users className="w-4 h-4 text-[var(--color-gold-light)]" /></div>
                  <span className="font-cinzel text-3xl font-light text-[#EAF0E6] block">{totalGuests}</span>
                  <span className="text-[11px] text-[#8A9D76]/50 font-serif">Familias / Personas</span>
                </div>
                <div className="p-6 rounded-2xl bg-[#2D3B2A] border border-emerald-500/20 bg-emerald-500/5"><div className="flex items-center justify-between mb-2"><span className="text-[10px] font-mono uppercase tracking-widest text-emerald-300">Confirmados</span><CheckCircle2 className="w-4 h-4 text-emerald-400" /></div><span className="font-cinzel text-3xl font-light text-emerald-300 block">{confirmedCount}</span><span className="text-[11px] text-emerald-200/60 font-serif">{totalPassesConfirmed} Pases Confirmados</span></div>
                <div className="p-6 rounded-2xl bg-[#2D3B2A] border border-[var(--color-gold)]/20 bg-[var(--color-gold)]/5"><div className="flex items-center justify-between mb-2"><span className="text-[10px] font-mono uppercase tracking-widest text-[#8A9D76]">Pendientes</span><Clock className="w-4 h-4 text-[var(--color-gold-light)]" /></div><span className="font-cinzel text-3xl font-light text-[#8A9D76] block">{pendingCount}</span><span className="text-[11px] text-[#8A9D76]/60 font-serif">Por Responder</span></div>
                <div className="p-6 rounded-2xl bg-[#2D3B2A] border border-rose-500/20 bg-rose-500/5"><div className="flex items-center justify-between mb-2"><span className="text-[10px] font-mono uppercase tracking-widest text-rose-300">Declinados</span><XCircle className="w-4 h-4 text-rose-400" /></div><span className="font-cinzel text-3xl font-light text-rose-300 block">{declinedCount}</span><span className="text-[11px] text-rose-200/60 font-serif">No Asistirán</span></div>
                <div className="p-6 rounded-2xl bg-[#2D3B2A] border border-[var(--color-border-soft)]/30 flex flex-col justify-between"><div><div className="flex items-center justify-between mb-1"><span className="text-[10px] font-mono uppercase tracking-widest text-[#8A9D76]/70">% Confirmado</span><RefreshCw className="w-4 h-4 text-[var(--color-gold-light)]" /></div><span className="font-cinzel text-3xl font-light text-[#EAF0E6] gold-gradient-text block">{confirmationPercentage}%</span></div><div className="w-full h-2 bg-white/10 rounded-full overflow-hidden mt-3 border border-white/10"><div className="h-full bg-gradient-to-r from-[var(--color-accent)] to-emerald-400 rounded-full transition-all duration-500" style={{ width: `${confirmationPercentage}%` }} /></div></div>
              </div>

              {/* Action Bar */}
              <div className="p-6 rounded-2xl bg-[#2D3B2A] border border-white/15 flex flex-wrap items-center justify-between gap-4">
                <div className="relative flex-1 min-w-[240px]">
                  <Search className="w-4 h-4 text-[var(--color-gold-light)] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Buscador por nombre o teléfono..." className="w-full pl-11 pr-4 py-2.5 rounded-full bg-black/40 border border-white/20 text-xs text-[#EAF0E6] placeholder-[#8A9D76]/40 focus:outline-none focus:border-[var(--color-gold)]" />
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-[var(--color-gold-light)]" />
                  <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="px-4 py-2 rounded-full bg-[#2D3B2A] border border-white/20 text-xs text-[#EAF0E6] focus:outline-none focus:border-[var(--color-gold)]">
                    <option value="todos">Todas las Categorías</option>
                    <option value="Familia">Familia</option>
                    <option value="Amigos">Amigos</option>
                    <option value="VIP">VIP</option>
                    <option value="Trabajo">Trabajo</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-4 py-2 rounded-full bg-[#2D3B2A] border border-white/20 text-xs text-[#EAF0E6] focus:outline-none focus:border-[var(--color-gold)]">
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
              <div className="rounded-3xl bg-[#2D3B2A] border border-white/15 overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs text-[#EAF0E6]">
                    <thead>
                      <tr className="bg-white/5 border-b border-white/10 text-[10px] font-mono uppercase tracking-widest text-[#8A9D76]/80">
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
                          <td className="p-4 font-medium"><strong className="text-[#EAF0E6] block text-sm">{guest.name}</strong><span className="text-[10px] text-[#8A9D76]/70 italic block">{guest.phone || 'Sin teléfono'}</span></td>
                          <td className="p-4"><span className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 font-mono text-[10px]">{guest.category}</span></td>
                          <td className="p-4 font-mono font-semibold text-[#B1C2A5]">{guest.status === 'confirmado' ? <span>{guest.passesConfirmed} de {guest.passesAllowed}</span> : <span>{guest.passesAllowed} asignados</span>}</td>
                          <td className="p-4"><span className={`px-3 py-1 rounded-full font-mono text-[10px] font-semibold uppercase tracking-wider ${guest.status === 'confirmado' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : guest.status === 'declinado' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-[var(--color-gold)]/20 text-[#8A9D76] border border-[var(--color-gold)]/30'}`}>{guest.status}</span></td>
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button onClick={() => sendWhatsApp(guest)} className="p-2 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 transition-colors cursor-pointer" title="Enviar enlace personalizado por WhatsApp">
                                <Send className="w-3.5 h-3.5" />
                              </button>
                              <button onClick={() => openEditGuest(guest)} className="p-2 rounded-lg bg-[var(--color-gold)]/20 text-[#8A9D76] hover:bg-[var(--color-gold)]/30 transition-colors cursor-pointer">
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button onClick={() => deleteGuest(guest.id, guest.name)} className="p-2 rounded-lg bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 transition-colors cursor-pointer">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )) : (<tr><td colSpan={5} className="p-8 text-center text-[#8A9D76]/50 font-serif italic">No se encontraron invitados.</td></tr>)}
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
              <div className="p-6 rounded-3xl bg-[#2D3B2A] border border-[var(--color-gold)] shadow-2xl space-y-6 text-[#f5f0e6]">
                <div className="flex items-center gap-3">
                  <SlidersHorizontal className="w-6 h-6 text-[var(--color-accent)]" />
                  <div>
                    <h2 className="font-cinzel text-2xl text-[#EAF0E6]">Personalización de Color Global (Picker & HEX / RGB)</h2>
                    <p className="text-xs text-[#8A9D76]/70 font-serif italic">
                      Selecciona o ingresa cualquier color en rueda cromática o código Hexadecimal. Se aplicará a todos los botones, acentos y componentes:
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                  {/* Wheel Picker */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono uppercase tracking-widest text-[#B1C2A5] block">Selector de Rueda de Color</label>
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
                    <label className="text-[10px] font-mono uppercase tracking-widest text-[#B1C2A5] block">Código Hexadecimal Manual</label>
                    <input
                      type="text"
                      value={customHex}
                      onChange={e => setCustomHex(e.target.value)}
                      placeholder="#6B7F5A"
                      className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/20 text-xs text-[#EAF0E6] font-mono"
                    />
                  </div>

                  {/* White Background Option */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono uppercase tracking-widest text-[#B1C2A5] block">Fondo Principal por Defecto</label>
                    <div className="flex items-center gap-4 pt-1">
                      <label className="flex items-center gap-2 text-xs text-[#EAF0E6] cursor-pointer">
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
                    <span className="text-xs font-serif italic text-[#B1C2A5]">Vista previa del tono primario</span>
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
              <div className="p-6 rounded-3xl bg-[#2D3B2A] border border-white/20 shadow-2xl space-y-4">
                <div>
                  <h2 className="font-cinzel text-2xl text-[#EAF0E6]">Paletas Predefinidas para Boda & Matrimonio</h2>
                  <p className="text-xs text-[#8A9D76]/70 font-serif italic">
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
                          ? 'bg-white/10 border-[var(--color-gold)] shadow-2xl ring-2 ring-[var(--color-gold)]/50'
                          : 'bg-black/30 border-white/10 hover:border-white/25'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-cinzel text-lg text-[#EAF0E6] font-medium">{theme.name}</h3>
                          {siteConfig.themeId === theme.id && (
                            <span className="w-6 h-6 rounded-full bg-[var(--color-gold)] text-black flex items-center justify-center font-bold text-xs">✓</span>
                          )}
                        </div>
                        <p className="text-xs text-[#EAF0E6]/70 font-serif italic leading-relaxed mb-4">
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
                <div className="p-4 rounded-2xl bg-[var(--color-gold)]/20 border border-[var(--color-gold)]/40 text-[#B1C2A5] text-xs flex items-center gap-3">
                  <Lock className="w-5 h-5 text-[var(--color-gold-light)] shrink-0" />
                  <span>Tu cuenta tiene restringidos los permisos de edición por el Superadmin. Contacta al Superadmin para solicitar permisos de edición de página.</span>
                </div>
              )}

              {/* 1. VISIBILIDAD DE SECCIONES PRINCIPALES */}
              <div className="p-6 rounded-3xl bg-[#2D3B2A] border border-white/20 shadow-2xl space-y-6">
                <div>
                  <h2 className="font-cinzel text-2xl text-[#EAF0E6]">Visibilidad de Secciones (Switch ON / OFF)</h2>
                  <p className="text-xs text-[#8A9D76]/70 font-serif italic">
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
                          isVisible ? 'bg-[var(--color-gold)]/10 border-[var(--color-gold)]/40 text-[#EAF0E6]' : 'bg-black/30 border-white/10 text-white/40'
                        }`}
                      >
                        <span className="text-xs font-mono font-semibold">{sec.name}</span>
                        {isVisible ? <ToggleRight className="w-6 h-6 text-[var(--color-gold-light)]" /> : <ToggleLeft className="w-6 h-6 text-white/40" />}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 2. AUDIO & MÚSICA EN BUCLE */}
              <div className="p-6 rounded-3xl bg-[#2D3B2A] border border-white/20 shadow-2xl space-y-6">
                <div className="flex items-center gap-3">
                  <Music className="w-6 h-6 text-[var(--color-gold-light)]" />
                  <div>
                    <h2 className="font-cinzel text-xl text-[#EAF0E6]">Música de Fondo & Reproductor en Bucle</h2>
                    <p className="text-xs text-[#8A9D76]/70 font-serif italic">
                      Soporta enlaces de <strong>YouTube</strong> (ej. <code>https://www.youtube.com/watch?v=...</code>), <strong>Google Drive</strong> o URLs directas de MP3. Solo se reproducirá el audio en segundo plano sin mostrar video.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[10px] font-mono uppercase tracking-widest text-[#B1C2A5]">Título de la Canción & Artista</label>
                      <button
                        type="button"
                        disabled={!canEditPage || !siteConfig.audio.url}
                        onClick={async () => {
                          const cleaned = await fetchAndCleanYouTubeTitle(siteConfig.audio.url);
                          if (cleaned) {
                            weddingConfigService.updateConfig({ audio: { ...siteConfig.audio, title: cleaned } });
                          }
                        }}
                        className="text-[10px] font-mono text-[var(--color-gold-light)] hover:underline flex items-center gap-1 cursor-pointer disabled:opacity-50"
                        title="Extraer y limpiar automáticamente el título de YouTube"
                      >
                        ✨ Detectar título
                      </button>
                    </div>
                    <input
                      type="text"
                      disabled={!canEditPage}
                      value={siteConfig.audio.title}
                      onChange={e => weddingConfigService.updateConfig({ audio: { ...siteConfig.audio, title: e.target.value } })}
                      placeholder="Ej. Perfect - Ed Sheeran"
                      className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs text-[#EAF0E6]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono uppercase tracking-widest text-[#B1C2A5] block mb-1">Enlace del Audio (YouTube / Drive / MP3)</label>
                    <input
                      type="text"
                      disabled={!canEditPage}
                      value={siteConfig.audio.url}
                      onChange={async (e) => {
                        const newUrl = e.target.value;
                        weddingConfigService.updateConfig({ audio: { ...siteConfig.audio, url: newUrl } });
                        // Auto-detect clean title when pasting YouTube link
                        const cleaned = await fetchAndCleanYouTubeTitle(newUrl);
                        if (cleaned) {
                          weddingConfigService.updateConfig({ audio: { ...weddingConfigService.getConfig().audio, title: cleaned } });
                        }
                      }}
                      placeholder="https://www.youtube.com/watch?v=2Vv-BfVoq4g"
                      className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs text-[#EAF0E6] font-mono"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-6 pt-2">
                  <label className="flex items-center gap-3 text-xs text-[#EAF0E6] cursor-pointer">
                    <input
                      type="checkbox"
                      disabled={!canEditPage}
                      checked={siteConfig.audio.loop}
                      onChange={e => weddingConfigService.updateConfig({ audio: { ...siteConfig.audio, loop: e.target.checked } })}
                    />
                    <span>Bucle Infinito (`loop` continuo al terminar)</span>
                  </label>
                  <label className="flex items-center gap-3 text-xs text-[#EAF0E6] cursor-pointer">
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
              <div className="p-6 rounded-3xl bg-[#2D3B2A] border border-white/20 shadow-2xl space-y-6">
                <div className="flex items-center gap-3">
                  <Heart className="w-6 h-6 text-[var(--color-gold-light)]" />
                  <h2 className="font-cinzel text-xl text-[#EAF0E6]">Información Principal de la Boda & Novios</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-mono uppercase tracking-widest text-[#B1C2A5] block mb-1">Nombre Novio</label>
                    <input type="text" disabled={!canEditPage} value={siteConfig.hero.groom} onChange={e => weddingConfigService.updateConfig({ hero: { ...siteConfig.hero, groom: e.target.value } })} className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs text-[#EAF0E6]" />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono uppercase tracking-widest text-[#B1C2A5] block mb-1">Nombre Novia</label>
                    <input type="text" disabled={!canEditPage} value={siteConfig.hero.bride} onChange={e => weddingConfigService.updateConfig({ hero: { ...siteConfig.hero, bride: e.target.value } })} className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs text-[#EAF0E6]" />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono uppercase tracking-widest text-[#B1C2A5] block mb-1">Fecha Formateada</label>
                    <input type="text" disabled={!canEditPage} value={siteConfig.hero.dateFormatted} onChange={e => weddingConfigService.updateConfig({ hero: { ...siteConfig.hero, dateFormatted: e.target.value } })} className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs text-[#EAF0E6]" />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono uppercase tracking-widest text-[#B1C2A5] block mb-1">Ciudad / País</label>
                    <input type="text" disabled={!canEditPage} value={siteConfig.hero.city} onChange={e => weddingConfigService.updateConfig({ hero: { ...siteConfig.hero, city: e.target.value } })} className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs text-[#EAF0E6]" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-[10px] font-mono uppercase tracking-widest text-[#B1C2A5] block mb-1">Frase / Cita Nupcial</label>
                    <textarea rows={2} disabled={!canEditPage} value={siteConfig.hero.quote} onChange={e => weddingConfigService.updateConfig({ hero: { ...siteConfig.hero, quote: e.target.value } })} className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs text-[#EAF0E6]" />
                  </div>
                  {/* Hero Cover Photo (Dual Mode: URL Link OR File Upload) */}
                  <div className="md:col-span-2 p-4 rounded-2xl bg-black/50 border border-white/15 space-y-3">
                    <label className="text-[10px] font-mono uppercase tracking-widest text-[#B1C2A5] block">
                      📷 Foto de Portada Principal (Hero Image)
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Option A: Photo URL Link */}
                      <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-2">
                        <label className="text-[10px] font-mono uppercase tracking-widest text-[#B1C2A5] block">Opción A: Pegar Enlace / URL Directo de la Foto</label>
                        <input
                          type="text"
                          disabled={!canEditPage}
                          value={siteConfig.hero.coverImage}
                          onChange={e => weddingConfigService.updateConfig({ hero: { ...siteConfig.hero, coverImage: e.target.value } })}
                          placeholder="https://images.unsplash.com/photo-..."
                          className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/15 text-xs text-[#EAF0E6] font-mono"
                        />
                      </div>

                      {/* Option B: Direct Image File Upload */}
                      <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-2">
                        <label className="text-[10px] font-mono uppercase tracking-widest text-[#B1C2A5] block">Opción B: Subir Archivo de Imagen desde tu Dispositivo</label>
                        <input
                          type="file"
                          accept="image/*"
                          disabled={!canEditPage}
                          onChange={e => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const reader = new FileReader();
                            reader.onload = ev => {
                              if (ev.target?.result) {
                                weddingConfigService.updateConfig({ hero: { ...siteConfig.hero, coverImage: ev.target.result as string } });
                              }
                            };
                            reader.readAsDataURL(file);
                          }}
                          className="w-full text-xs text-[#EAF0E6]"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. NUESTRA HISTORIA (CAPÍTULOS DE AMOR - MÁXIMO 5 TARJETAS) */}
              <div className="p-6 rounded-3xl bg-[#2D3B2A] border border-white/20 shadow-2xl space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <BookOpen className="w-6 h-6 text-[var(--color-gold-light)]" />
                    <div>
                      <h2 className="font-cinzel text-xl text-[#EAF0E6]">Nuestra Historia (Capítulos de Amor)</h2>
                      <p className="text-xs text-[#8A9D76]/70 font-serif italic">
                        Edita los capítulos de tu historia ({siteConfig.loveStory.length} de máx. 5 tarjetas habilitadas).
                      </p>
                    </div>
                  </div>

                  {canEditPage && siteConfig.loveStory.length < 5 && (
                    <button
                      onClick={() => {
                        const newId = `story-${Date.now()}`;
                        const newChapter = {
                          id: newId,
                          year: `${new Date().getFullYear()}`,
                          title: 'Nuevo Capítulo',
                          location: 'Ambato, Ecuador',
                          content: 'Escribe aquí los detalles inolvidables de este momento...',
                          isVisible: true
                        };
                        weddingConfigService.updateConfig({
                          loveStory: [...siteConfig.loveStory, newChapter]
                        });
                      }}
                      className="px-4 py-2 rounded-full bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-lg hover:scale-105 transition-all"
                    >
                      <Plus className="w-4 h-4" />
                      <span>+ Agregar Capítulo (Máx. 5)</span>
                    </button>
                  )}
                </div>

                {/* Main Story Photo (Dual Mode: URL Link OR File Upload) */}
                <div className="p-4 rounded-2xl bg-black/50 border border-white/15 space-y-3">
                  <label className="text-[10px] font-mono uppercase tracking-widest text-[#B1C2A5] block">
                    📷 Foto Principal de la Sección "Nuestra Historia"
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Option A: Photo URL Link */}
                    <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-2">
                      <label className="text-[10px] font-mono uppercase tracking-widest text-[#B1C2A5] block">Opción A: Pegar Enlace / URL Directo de la Foto</label>
                      <input
                        type="text"
                        disabled={!canEditPage}
                        value={siteConfig.hero.secondaryImage || siteConfig.hero.coverImage}
                        onChange={e => weddingConfigService.updateConfig({ hero: { ...siteConfig.hero, secondaryImage: e.target.value } })}
                        placeholder="https://images.unsplash.com/photo-..."
                        className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/15 text-xs text-[#EAF0E6] font-mono"
                      />
                    </div>

                    {/* Option B: Direct Image File Upload */}
                    <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-2">
                      <label className="text-[10px] font-mono uppercase tracking-widest text-[#B1C2A5] block">Opción B: Subir Archivo de Imagen desde tu Dispositivo</label>
                      <input
                        type="file"
                        accept="image/*"
                        disabled={!canEditPage}
                        onChange={e => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const reader = new FileReader();
                          reader.onload = ev => {
                            if (ev.target?.result) {
                              weddingConfigService.updateConfig({ hero: { ...siteConfig.hero, secondaryImage: ev.target.result as string } });
                            }
                          };
                          reader.readAsDataURL(file);
                        }}
                        className="w-full text-xs text-[#EAF0E6]"
                      />
                    </div>
                  </div>
                  <span className="text-[10px] text-[#8A9D76]/70 font-serif italic mt-1 block">
                    Esta imagen se mostrará al lado izquierdo del timeline de capítulos en el sitio público.
                  </span>
                </div>

                <div className="space-y-4">
                  {siteConfig.loveStory.map((chapter, idx) => (
                    <div key={chapter.id || idx} className="p-5 rounded-2xl bg-black/40 border border-white/15 space-y-4">
                      <div className="flex items-center justify-between border-b border-white/10 pb-3">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-[var(--color-gold)]/20 border border-[var(--color-gold)]/40 text-[var(--color-gold-light)] font-mono font-bold text-xs flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <strong className="text-sm font-cinzel text-[#EAF0E6]">{chapter.title || `Capítulo ${idx + 1}`}</strong>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              const updated = siteConfig.loveStory.map((c, i) => i === idx ? { ...c, isVisible: !c.isVisible } : c);
                              weddingConfigService.updateConfig({ loveStory: updated });
                            }}
                            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-[#B1C2A5]"
                            title={chapter.isVisible !== false ? "Visible" : "Oculto"}
                          >
                            {chapter.isVisible !== false ? <Eye className="w-4 h-4 text-emerald-400" /> : <EyeOff className="w-4 h-4 text-white/40" />}
                          </button>
                          {canEditPage && siteConfig.loveStory.length > 1 && (
                            <button
                              onClick={() => {
                                const updated = siteConfig.loveStory.filter((_, i) => i !== idx);
                                weddingConfigService.updateConfig({ loveStory: updated });
                              }}
                              className="p-1.5 rounded-lg bg-rose-500/20 text-rose-300 hover:bg-rose-500/30"
                              title="Eliminar este capítulo"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="text-[10px] font-mono uppercase tracking-widest text-[#B1C2A5] block mb-1">Año / Fecha</label>
                          <input
                            type="text"
                            disabled={!canEditPage}
                            value={chapter.year}
                            onChange={e => {
                              const val = e.target.value;
                              const updated = siteConfig.loveStory.map((c, i) => i === idx ? { ...c, year: val } : c);
                              weddingConfigService.updateConfig({ loveStory: updated });
                            }}
                            className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-[#EAF0E6] font-mono font-bold"
                            placeholder="Ej. 2021"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-mono uppercase tracking-widest text-[#B1C2A5] block mb-1">Título del Capítulo</label>
                          <input
                            type="text"
                            disabled={!canEditPage}
                            value={chapter.title}
                            onChange={e => {
                              const val = e.target.value;
                              const updated = siteConfig.loveStory.map((c, i) => i === idx ? { ...c, title: val } : c);
                              weddingConfigService.updateConfig({ loveStory: updated });
                            }}
                            className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-[#EAF0E6]"
                            placeholder="Ej. El Encuentro en Ficoa"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-mono uppercase tracking-widest text-[#B1C2A5] block mb-1">Lugar / Ubicación</label>
                          <input
                            type="text"
                            disabled={!canEditPage}
                            value={chapter.location}
                            onChange={e => {
                              const val = e.target.value;
                              const updated = siteConfig.loveStory.map((c, i) => i === idx ? { ...c, location: val } : c);
                              weddingConfigService.updateConfig({ loveStory: updated });
                            }}
                            className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-[#EAF0E6]"
                            placeholder="Ej. Ficoa, Ambato"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] font-mono uppercase tracking-widest text-[#B1C2A5] block mb-1">Contenido / Historia</label>
                        <textarea
                          rows={2}
                          disabled={!canEditPage}
                          value={chapter.content}
                          onChange={e => {
                            const val = e.target.value;
                            const updated = siteConfig.loveStory.map((c, i) => i === idx ? { ...c, content: val } : c);
                            weddingConfigService.updateConfig({ loveStory: updated });
                          }}
                          className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-[#EAF0E6]"
                          placeholder="Escribe los detalles de este capítulo..."
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3. GALERÍA DE FOTOS & RECUERDOS (SUBIDA DE ARCHIVO O ENLACE URL DIRECTO - MÁX 9 FOTOS) */}
              <div className="p-6 rounded-3xl bg-[#2D3B2A] border border-white/20 shadow-2xl space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Camera className="w-6 h-6 text-[var(--color-gold-light)]" />
                    <div>
                      <h2 className="font-cinzel text-xl text-[#EAF0E6]">Galería de Fotos & Recuerdos (Máx. 9 Fotos)</h2>
                      <p className="text-xs text-[#8A9D76]/70 font-serif italic">
                        Puedes agregar fotos usando <strong>un enlace/URL directo de imagen</strong> o <strong>subiendo el archivo de imagen</strong> desde tu dispositivo.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => weddingConfigService.updateConfig({
                        galleryConfig: { ...siteConfig.galleryConfig, layoutStyle: 'carousel' }
                      })}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-mono font-bold transition-all cursor-pointer ${
                        siteConfig.galleryConfig.layoutStyle === 'carousel' ? 'bg-[var(--color-accent)] text-white border-[var(--color-gold)]' : 'bg-black/40 border-white/15 text-white/50'
                      }`}
                    >
                      Carrusel (Slider)
                    </button>
                    <button
                      type="button"
                      onClick={() => weddingConfigService.updateConfig({
                        galleryConfig: { ...siteConfig.galleryConfig, layoutStyle: 'grid' }
                      })}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-mono font-bold transition-all cursor-pointer ${
                        siteConfig.galleryConfig.layoutStyle === 'grid' ? 'bg-[var(--color-accent)] text-white border-[var(--color-gold)]' : 'bg-black/40 border-white/15 text-white/50'
                      }`}
                    >
                      Grid Revista
                    </button>
                  </div>
                </div>

                {/* Adding New Photo Option */}
                {canEditPage && (siteConfig.galleryConfig.customPhotos || []).length < 9 && (
                  <div className="p-4 rounded-2xl bg-black/40 border border-white/15 space-y-3">
                    <span className="text-xs font-mono font-bold uppercase text-[#B1C2A5] block">
                      + Agregar Nueva Foto a la Galería ({ (siteConfig.galleryConfig.customPhotos || []).length } / 9 habilitadas)
                    </span>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Option A: Photo URL Link */}
                      <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-2">
                        <label className="text-[10px] font-mono uppercase tracking-widest text-[#B1C2A5] block">Opción A: Pegar Enlace / URL Directo de la Foto</label>
                        <input
                          type="text"
                          value={newPhotoUrl}
                          onChange={e => setNewPhotoUrl(e.target.value)}
                          placeholder="https://images.unsplash.com/photo-..."
                          className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/15 text-xs text-[#EAF0E6] font-mono"
                        />
                        <button
                          type="button"
                          disabled={!newPhotoUrl.trim()}
                          onClick={() => {
                            const newPhoto: GalleryImage = {
                              id: `gal-${Date.now()}`,
                              url: newPhotoUrl.trim(),
                              title: 'Momento Especial',
                              locationTag: 'Ambato, Ecuador',
                              caption: 'Fotografía de la sesión de bodas.',
                              aspectRatio: 'square'
                            };
                            const current = siteConfig.galleryConfig.customPhotos || [];
                            weddingConfigService.updateConfig({
                              galleryConfig: {
                                ...siteConfig.galleryConfig,
                                customPhotos: [...current, newPhoto].slice(0, 9)
                              }
                            });
                            setNewPhotoUrl('');
                          }}
                          className="w-full py-2 rounded-xl bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white font-bold text-xs uppercase tracking-wider disabled:opacity-40 cursor-pointer"
                        >
                          + Guardar Foto por Enlace URL
                        </button>
                      </div>

                      {/* Option B: Direct Image File Upload */}
                      <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-2">
                        <label className="text-[10px] font-mono uppercase tracking-widest text-[#B1C2A5] block">Opción B: Subir Archivo de Imagen desde tu Dispositivo</label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={e => setPhotoFiles(Array.from(e.target.files || []))}
                          className="w-full text-xs text-[#EAF0E6]"
                        />
                        <button
                          type="button"
                          disabled={isUploadingPhotos || photoFiles.length === 0}
                          onClick={() => void uploadPhotos()}
                          className="w-full py-2 rounded-xl bg-[var(--color-gold)]/30 hover:bg-[var(--color-gold)]/40 text-[var(--color-gold-light)] border border-[var(--color-gold)]/50 font-bold text-xs uppercase tracking-wider disabled:opacity-40 cursor-pointer flex items-center justify-center gap-2"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>{isUploadingPhotos ? 'Subiendo...' : 'Subir Archivo de Imagen'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* List of Gallery Photos (Editable URL Link or File per Slot) */}
                <div className="space-y-3 pt-2">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#B1C2A5] block">
                    Fotos Actuales en Galería ({ (siteConfig.galleryConfig.customPhotos || []).length } de máx. 9)
                  </span>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {(siteConfig.galleryConfig.customPhotos || []).slice(0, 9).map((photo, pIdx) => (
                      <div key={photo.id || pIdx} className="p-3.5 rounded-2xl bg-black/40 border border-white/15 space-y-3 flex flex-col justify-between">
                        <div className="relative aspect-video rounded-xl overflow-hidden bg-black border border-white/10 group">
                          <img src={photo.url} alt={photo.title} className="w-full h-full object-cover" />
                          <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/70 text-[var(--color-gold-light)] font-mono font-bold text-[10px]">
                            #{pIdx + 1}
                          </span>
                        </div>

                        <div className="space-y-2">
                          <div>
                            <label className="text-[9px] font-mono uppercase text-[#B1C2A5] block mb-0.5">Título / Etiqueta</label>
                            <input
                              type="text"
                              disabled={!canEditPage}
                              value={photo.title}
                              onChange={e => {
                                const val = e.target.value;
                                const updated = (siteConfig.galleryConfig.customPhotos || []).map((p, i) => i === pIdx ? { ...p, title: val } : p);
                                weddingConfigService.updateConfig({ galleryConfig: { ...siteConfig.galleryConfig, customPhotos: updated } });
                              }}
                              className="w-full px-2.5 py-1.5 rounded-lg bg-black/40 border border-white/15 text-xs text-[#EAF0E6]"
                            />
                          </div>

                          <div>
                            <label className="text-[9px] font-mono uppercase text-[#B1C2A5] block mb-0.5">Enlace / URL Directo de la Foto</label>
                            <input
                              type="text"
                              disabled={!canEditPage}
                              value={photo.url}
                              onChange={e => {
                                const val = e.target.value;
                                const updated = (siteConfig.galleryConfig.customPhotos || []).map((p, i) => i === pIdx ? { ...p, url: val } : p);
                                weddingConfigService.updateConfig({ galleryConfig: { ...siteConfig.galleryConfig, customPhotos: updated } });
                              }}
                              className="w-full px-2.5 py-1.5 rounded-lg bg-black/40 border border-white/15 text-xs text-[#EAF0E6] font-mono"
                            />
                          </div>
                        </div>

                        {canEditPage && (
                          <div className="pt-1 flex items-center justify-end">
                            <button
                              type="button"
                              onClick={() => {
                                const updated = (siteConfig.galleryConfig.customPhotos || []).filter((_, i) => i !== pIdx);
                                weddingConfigService.updateConfig({ galleryConfig: { ...siteConfig.galleryConfig, customPhotos: updated } });
                              }}
                              className="px-3 py-1 rounded-lg bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 font-mono text-[10px] uppercase font-bold flex items-center gap-1 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Eliminar</span>
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 3. MOMENTOS EN MOVIMIENTO (VIDEO & SLIDESHOW ANIMADO DE FOTOS) */}
              <div className="p-6 rounded-3xl bg-[#2D3B2A] border border-white/20 shadow-2xl space-y-6">
                <div className="flex items-center gap-3">
                  <Video className="w-6 h-6 text-[var(--color-gold-light)]" />
                  <div>
                    <h2 className="font-cinzel text-xl text-[#EAF0E6]">Momentos en Movimiento (Video & Slideshow)</h2>
                    <p className="text-xs text-[#8A9D76]/70 font-serif italic">
                      Elige entre reproducir un video URL o hacer un video-slideshow animado automático con todas las fotos subidas.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="text-[10px] font-mono uppercase tracking-widest text-[#B1C2A5] block mb-2">Modo de Presentación</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => weddingConfigService.updateConfig({
                          videoConfig: { ...siteConfig.videoConfig, mode: 'slideshow' }
                        })}
                        className={`p-3.5 rounded-xl border font-mono text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                          siteConfig.videoConfig?.mode === 'slideshow' ? 'bg-[var(--color-accent)] text-white border-[var(--color-gold)] shadow-lg' : 'bg-black/40 text-white/50 border-white/10'
                        }`}
                      >
                        <Film className="w-4 h-4" />
                        <span>🎞️ Video Slideshow (Fotos Subidas)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => weddingConfigService.updateConfig({
                          videoConfig: { ...siteConfig.videoConfig, mode: 'video' }
                        })}
                        className={`p-3.5 rounded-xl border font-mono text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                          siteConfig.videoConfig?.mode === 'video' ? 'bg-[var(--color-accent)] text-white border-[var(--color-gold)] shadow-lg' : 'bg-black/40 text-white/50 border-white/10'
                        }`}
                      >
                        <Video className="w-4 h-4" />
                        <span>🎥 Reproducir Video URL (YouTube / MP4)</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-mono uppercase tracking-widest text-[#B1C2A5] block mb-1">Título del Video / Teaser</label>
                    <input
                      type="text"
                      disabled={!canEditPage}
                      value={siteConfig.videoConfig?.videoTitle || ''}
                      onChange={e => weddingConfigService.updateConfig({
                        videoConfig: { ...siteConfig.videoConfig, videoTitle: e.target.value }
                      })}
                      placeholder="Ej. MATEO & CAMILA — FILM NUPCIAL"
                      className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs text-[#EAF0E6]"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-mono uppercase tracking-widest text-[#B1C2A5] block mb-1">URL del Video (YouTube / MP4 Directo)</label>
                    <input
                      type="text"
                      disabled={!canEditPage}
                      value={siteConfig.videoConfig?.videoUrl || ''}
                      onChange={e => weddingConfigService.updateConfig({
                        videoConfig: { ...siteConfig.videoConfig, videoUrl: e.target.value }
                      })}
                      placeholder="https://www.youtube.com/watch?v=..."
                      className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs text-[#EAF0E6] font-mono"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-[10px] font-mono uppercase tracking-widest text-[#B1C2A5] block mb-1">Frase Subtitulada del Video</label>
                    <input
                      type="text"
                      disabled={!canEditPage}
                      value={siteConfig.videoConfig?.quote || ''}
                      onChange={e => weddingConfigService.updateConfig({
                        videoConfig: { ...siteConfig.videoConfig, quote: e.target.value }
                      })}
                      placeholder="Ej. 'El amor no se mira con los ojos, sino con el corazón.'"
                      className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs text-[#EAF0E6]"
                    />
                  </div>
                </div>
              </div>

              {/* 4. CÓDIGO DE VESTIMENTA (ETIQUETA & REGLAS EDITABLES) */}
              <div className="p-6 rounded-3xl bg-[#2D3B2A] border border-white/20 shadow-2xl space-y-6">
                <div className="flex items-center gap-3">
                  <Shirt className="w-6 h-6 text-[var(--color-gold-light)]" />
                  <div>
                    <h2 className="font-cinzel text-xl text-[#EAF0E6]">Código de Vestimenta (Etiqueta & Reglas)</h2>
                    <p className="text-xs text-[#8A9D76]/70 font-serif italic">
                      Edita el mensaje principal, las reglas reservadas y las tarjetas para Caballeros y Damas.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-mono uppercase tracking-widest text-[#B1C2A5] block mb-1">Título de Sección</label>
                    <input
                      type="text"
                      disabled={!canEditPage}
                      value={siteConfig.dressCode?.title || 'Código de Vestimenta'}
                      onChange={e => weddingConfigService.updateConfig({
                        dressCode: { ...siteConfig.dressCode, title: e.target.value }
                      })}
                      className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs text-[#EAF0E6]"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-mono uppercase tracking-widest text-[#B1C2A5] block mb-1">Tipo de Estilo / Etiqueta</label>
                    <input
                      type="text"
                      disabled={!canEditPage}
                      value={siteConfig.dressCode?.styleType || 'Formal Elegante'}
                      onChange={e => weddingConfigService.updateConfig({
                        dressCode: { ...siteConfig.dressCode, styleType: e.target.value }
                      })}
                      className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs text-[#EAF0E6]"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-[10px] font-mono uppercase tracking-widest text-[#B1C2A5] block mb-1">Mensaje de Bienvenida / Descripción</label>
                    <textarea
                      rows={2}
                      disabled={!canEditPage}
                      value={siteConfig.dressCode?.description || ''}
                      onChange={e => weddingConfigService.updateConfig({
                        dressCode: { ...siteConfig.dressCode, description: e.target.value }
                      })}
                      className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs text-[#EAF0E6]"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-[10px] font-mono uppercase tracking-widest text-[#B1C2A5] block mb-1">Nota Especial / Reglas (Ej. Blanco reservado para la novia)</label>
                    <input
                      type="text"
                      disabled={!canEditPage}
                      value={siteConfig.dressCode?.rulesNotice || ''}
                      onChange={e => weddingConfigService.updateConfig({
                        dressCode: { ...siteConfig.dressCode, rulesNotice: e.target.value }
                      })}
                      className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs text-[#EAF0E6]"
                    />
                  </div>
                </div>

                {/* Dress Code Cards */}
                <div className="space-y-4 pt-2 border-t border-white/10">
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#B1C2A5]">Tarjetas por Género (Caballeros & Damas)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(siteConfig.dressCode?.cards || []).map((card, cIdx) => (
                      <div key={card.id || cIdx} className="p-4 rounded-2xl bg-black/40 border border-white/15 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="px-2.5 py-0.5 rounded-full bg-[var(--color-gold)]/20 text-[#8A9D76] font-mono text-[10px] font-bold uppercase">
                            {card.gender}
                          </span>
                        </div>
                        <div>
                          <label className="text-[9px] font-mono uppercase tracking-widest text-[#B1C2A5] block mb-0.5">Título Tarjeta</label>
                          <input
                            type="text"
                            disabled={!canEditPage}
                            value={card.title}
                            onChange={e => {
                              const val = e.target.value;
                              const updatedCards = siteConfig.dressCode.cards.map((c, i) => i === cIdx ? { ...c, title: val } : c);
                              weddingConfigService.updateConfig({ dressCode: { ...siteConfig.dressCode, cards: updatedCards } });
                            }}
                            className="w-full px-3 py-1.5 rounded-lg bg-black/40 border border-white/15 text-xs text-[#EAF0E6]"
                          />
                        </div>
                        <div>
                          <label className="text-[9px] font-mono uppercase tracking-widest text-[#B1C2A5] block mb-0.5">Indicaciones de Vestuario</label>
                          <textarea
                            rows={2}
                            disabled={!canEditPage}
                            value={card.description}
                            onChange={e => {
                              const val = e.target.value;
                              const updatedCards = siteConfig.dressCode.cards.map((c, i) => i === cIdx ? { ...c, description: val } : c);
                              weddingConfigService.updateConfig({ dressCode: { ...siteConfig.dressCode, cards: updatedCards } });
                            }}
                            className="w-full px-3 py-1.5 rounded-lg bg-black/40 border border-white/15 text-xs text-[#EAF0E6]"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 5. MESA DE REGALOS (CUENTAS BANCARIAS DINÁMICAS) */}
              <div className="p-6 rounded-3xl bg-[#2D3B2A] border border-white/20 shadow-2xl space-y-6">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Building2 className="w-6 h-6 text-[var(--color-gold-light)]" />
                    <div>
                      <h2 className="font-cinzel text-xl text-[#EAF0E6]">Cuentas Bancarias & Mesa de Regalos</h2>
                      <p className="text-xs text-[#8A9D76]/70 font-serif italic">Agrega, edita o desactiva tarjetas de cuentas bancarias según lo necesites.</p>
                    </div>
                  </div>
                  {canEditPage && (
                    <button onClick={openCreateBank} className="px-4 py-2 rounded-full bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer">
                      <Plus className="w-4 h-4" />
                      <span>Nueva Cuenta</span>
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {siteConfig.bankAccounts.map(b => (
                    <div key={b.id} className={`p-4 rounded-2xl border flex items-center justify-between ${b.isVisible !== false ? 'bg-black/40 border-white/15' : 'bg-white/5 border-white/5 opacity-50'}`}>
                      <div>
                        <strong className="text-[#EAF0E6] block text-sm">{b.bankName}</strong>
                        <span className="text-xs text-[#8A9D76]/70 font-mono">{b.accountType} • {b.accountNumber}</span>
                        <span className="text-[10px] text-[#8A9D76]/60 block mt-0.5">{b.holderName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => toggleBankVisibility(b.id)} className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-[#B1C2A5]" title={b.isVisible !== false ? "Ocultar tarjeta" : "Mostrar tarjeta"}>
                          {b.isVisible !== false ? <Eye className="w-4 h-4 text-emerald-400" /> : <EyeOff className="w-4 h-4 text-white/40" />}
                        </button>
                        {canEditPage && (
                          <>
                            <button onClick={() => openEditBank(b)} className="p-2 rounded-lg bg-[var(--color-gold)]/20 text-[#8A9D76] hover:bg-[var(--color-gold)]/30"><Edit2 className="w-4 h-4" /></button>
                            <button onClick={() => deleteBank(b.id, b.bankName)} className="p-2 rounded-lg bg-rose-500/20 text-rose-300 hover:bg-rose-500/30"><Trash2 className="w-4 h-4" /></button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 5. LUGARES DEL EVENTO (VENUES) */}
              <div className="p-6 rounded-3xl bg-[#2D3B2A] border border-white/20 shadow-2xl space-y-6">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-6 h-6 text-[var(--color-gold-light)]" />
                    <div>
                      <h2 className="font-cinzel text-xl text-[#EAF0E6]">Lugares del Evento (Ceremonia & Recepción)</h2>
                      <p className="text-xs text-[#8A9D76]/70 font-serif italic">Gestiona las tarjetas de lugares de la boda.</p>
                    </div>
                  </div>
                  {canEditPage && (
                    <button onClick={openCreateVenue} className="px-4 py-2 rounded-full bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer">
                      <Plus className="w-4 h-4" />
                      <span>Nuevo Lugar</span>
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {siteConfig.venues.map(v => (
                    <div key={v.id} className={`p-4 rounded-2xl border flex items-center justify-between ${v.isVisible !== false ? 'bg-black/40 border-white/15' : 'bg-white/5 border-white/5 opacity-50'}`}>
                      <div>
                        <strong className="text-[#EAF0E6] block text-sm">{v.name} ({v.type.toUpperCase()})</strong>
                        <span className="text-xs text-[#8A9D76]/70 font-mono">{v.time} • {v.address}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => toggleVenueVisibility(v.id)} className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-[#B1C2A5]" title={v.isVisible !== false ? "Ocultar tarjeta" : "Mostrar tarjeta"}>
                          {v.isVisible !== false ? <Eye className="w-4 h-4 text-emerald-400" /> : <EyeOff className="w-4 h-4 text-white/40" />}
                        </button>
                        {canEditPage && (
                          <>
                            <button onClick={() => openEditVenue(v)} className="p-2 rounded-lg bg-[var(--color-gold)]/20 text-[#8A9D76] hover:bg-[var(--color-gold)]/30"><Edit2 className="w-4 h-4" /></button>
                            <button onClick={() => deleteVenue(v.id, v.name)} className="p-2 rounded-lg bg-rose-500/20 text-rose-300 hover:bg-rose-500/30"><Trash2 className="w-4 h-4" /></button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SUPERADMIN & USUARIOS */}
          {activeTab === 'usuarios' && isSuperadmin && (
            <div className="space-y-6">
              <div className="p-6 rounded-3xl bg-[#2D3B2A] border border-[var(--color-gold)]/20 shadow-2xl space-y-6 text-[#f5f0e6]">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-[#8A9D76]/70 block">Gobernanza de Plataforma Multitenant</span>
                    <h2 className="font-cinzel text-2xl text-[#EAF0E6]">Administración de Usuarios (Admins / Novios)</h2>
                  </div>
                  <button onClick={openCreateUser} className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white font-bold text-xs uppercase tracking-[0.15em] shadow-lg hover:scale-105 transition-all cursor-pointer">
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
                            <strong className="text-[#EAF0E6] block text-base">{user.fullName}</strong>
                            <span className={`px-2.5 py-0.5 rounded-full font-mono text-[10px] uppercase font-bold ${status === 'active' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'}`}>
                              {status === 'active' ? 'Activo' : 'Deshabilitado'}
                            </span>
                          </div>
                          <span className="text-[11px] font-mono text-[#8A9D76]/60 block">Usuario: {user.username} · Rol: {user.role}</span>
                        </div>

                        <div className="space-y-3 pt-3 border-t border-white/10">
                          {/* Impersonation & Credentials Share */}
                          <div className="space-y-2">
                            <button
                              onClick={() => impersonateAdminSite(user)}
                              className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-[var(--color-gold)]/20 hover:bg-[var(--color-gold)]/30 border border-[var(--color-gold)]/40 text-[#B1C2A5] text-xs font-mono font-bold uppercase tracking-wider transition-colors cursor-pointer"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              <span>⚙️ Administrar & Editar Sitio de este Admin</span>
                            </button>

                            <button
                              onClick={() => openShareCredentialsModal(user)}
                              className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-200 text-xs font-mono font-bold uppercase tracking-wider transition-colors cursor-pointer"
                            >
                              <Share2 className="w-3.5 h-3.5" />
                              <span>📋 Copiar Credenciales & Link de Acceso</span>
                            </button>
                          </div>

                          <div className="flex items-center justify-between text-xs text-[#EAF0E6]">
                            <span>Estado de Cuenta:</span>
                            <button onClick={() => toggleUserStatus(user)} className={`px-3 py-1 rounded-lg text-xs font-mono uppercase font-bold cursor-pointer transition-colors ${status === 'active' ? 'bg-rose-500/20 text-rose-300 hover:bg-rose-500/30' : 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'}`}>
                              {status === 'active' ? 'Deshabilitar' : 'Habilitar'}
                            </button>
                          </div>

                          <div className="flex items-center justify-between text-xs text-[#EAF0E6]">
                            <span>Permisos de Edición:</span>
                            <button onClick={() => toggleUserEditPermission(user.id)} className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono uppercase font-bold cursor-pointer transition-colors ${canEdit ? 'bg-[var(--color-gold)]/20 text-[#8A9D76] hover:bg-[var(--color-gold)]/30' : 'bg-white/10 text-white/50'}`}>
                              {canEdit ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                              <span>{canEdit ? 'Permitido' : 'Restringido'}</span>
                            </button>
                          </div>

                          {/* Permisos de Evento / Tipos de Matrimonio Habilitados */}
                          <div className="pt-2 border-t border-white/10 space-y-1.5">
                            <span className="text-[10px] font-mono uppercase tracking-widest text-[#B1C2A5] block font-bold">
                              Habilitar Tipos de Matrimonio / Eventos:
                            </span>
                            <div className="flex flex-wrap items-center gap-2 text-xs text-[#EAF0E6]">
                              <label className="flex items-center gap-1.5 cursor-pointer bg-white/5 hover:bg-white/10 px-2.5 py-1 rounded-lg border border-white/10">
                                <input
                                  type="checkbox"
                                  checked={(userCeremonyMap[user.id] || { civil: true }).civil !== false}
                                  onChange={() => toggleUserCeremonyPerm(user.id, 'civil')}
                                  className="w-3.5 h-3.5 rounded text-[var(--color-accent)] cursor-pointer"
                                />
                                <span className="font-mono text-[11px]">Civil</span>
                              </label>

                              <label className="flex items-center gap-1.5 cursor-pointer bg-white/5 hover:bg-white/10 px-2.5 py-1 rounded-lg border border-white/10">
                                <input
                                  type="checkbox"
                                  checked={(userCeremonyMap[user.id] || { eclesiastico: true }).eclesiastico !== false}
                                  onChange={() => toggleUserCeremonyPerm(user.id, 'eclesiastico')}
                                  className="w-3.5 h-3.5 rounded text-[var(--color-accent)] cursor-pointer"
                                />
                                <span className="font-mono text-[11px]">Eclesiástico</span>
                              </label>

                              <label className="flex items-center gap-1.5 cursor-pointer bg-white/5 hover:bg-white/10 px-2.5 py-1 rounded-lg border border-white/10">
                                <input
                                  type="checkbox"
                                  checked={(userCeremonyMap[user.id] || { recepcion: true }).recepcion !== false}
                                  onChange={() => toggleUserCeremonyPerm(user.id, 'recepcion')}
                                  className="w-3.5 h-3.5 rounded text-[var(--color-accent)] cursor-pointer"
                                />
                                <span className="font-mono text-[11px]">Recepción</span>
                              </label>
                            </div>
                          </div>

                          {/* Terms & Privacy Audit Badge */}
                          <div className="flex items-center justify-between text-xs text-[#EAF0E6]">
                            <span>Protección de Datos (LOPDP):</span>
                            {userTermsMap[user.id]?.accepted ? (
                              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono font-bold flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                <span>Aceptado ({new Date(userTermsMap[user.id].acceptedAt || '').toLocaleDateString('es-ES')})</span>
                              </span>
                            ) : (
                              <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-mono font-bold flex items-center gap-1">
                                <Clock className="w-3 h-3 text-rose-400" />
                                <span>Pendiente de Firma</span>
                              </span>
                            )}
                          </div>

                          {/* Password Management */}
                          <div className="flex items-center justify-between text-xs text-[#EAF0E6]">
                            <span>Contraseña de Acceso:</span>
                            <button onClick={() => openEditPasswordModal(user)} className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[var(--color-gold)]/20 text-[#8A9D76] hover:bg-[var(--color-gold)]/30 text-xs font-mono uppercase font-bold cursor-pointer">
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
              <button type="button" onClick={() => setIsGuestModalOpen(false)} className="px-5 py-2.5 rounded-full bg-white/10 text-xs text-[#EAF0E6] hover:bg-white/20 transition-colors cursor-pointer">Cancelar</button>
              <button type="submit" form="guest-form" disabled={isSavingGuest} className="px-6 py-2.5 rounded-full bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white font-bold text-xs uppercase tracking-[0.15em] shadow-lg hover:scale-[1.02] transition-transform cursor-pointer disabled:opacity-50">{isSavingGuest ? 'Guardando...' : 'Guardar Invitado'}</button>
            </div>
          }
        >
          <form id="guest-form" onSubmit={e => void saveGuest(e)} className="space-y-4">
            <div>
              <label className="text-[10px] font-mono uppercase tracking-widest text-[#B1C2A5] block mb-1">Nombre Completo / Familia *</label>
              <input type="text" required value={guestFormData.name} onChange={e => setGuestFormData({ ...guestFormData, name: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs text-[#EAF0E6] focus:outline-none focus:border-[var(--color-gold)]" placeholder="Ej. Familia Naranjo Viteri" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-mono uppercase tracking-widest text-[#B1C2A5] block mb-1">Categoría</label>
                <select value={guestFormData.category} onChange={e => setGuestFormData({ ...guestFormData, category: e.target.value as GuestCategory })} className="w-full px-4 py-2.5 rounded-xl bg-[#2D3B2A] border border-white/15 text-xs text-[#EAF0E6] focus:outline-none focus:border-[var(--color-gold)]">
                  <option value="Familia">Familia</option>
                  <option value="Amigos">Amigos</option>
                  <option value="VIP">VIP</option>
                  <option value="Trabajo">Trabajo</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-mono uppercase tracking-widest text-[#B1C2A5] block mb-1">Pases Asignados</label>
                <input type="number" min={1} max={10} value={guestFormData.passesAllowed} onChange={e => setGuestFormData({ ...guestFormData, passesAllowed: Number(e.target.value) })} className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs text-[#EAF0E6] focus:outline-none focus:border-[var(--color-gold)]" />
              </div>
            </div>
            <div>
              <label className="text-[10px] font-mono uppercase tracking-widest text-[#B1C2A5] block mb-1">Teléfono / WhatsApp (para envío directo)</label>
              <input type="text" value={guestFormData.phone} onChange={e => setGuestFormData({ ...guestFormData, phone: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs text-[#EAF0E6] focus:outline-none focus:border-[var(--color-gold)]" placeholder="+593 99 876 5432" />
            </div>
            <div>
              <label className="text-[10px] font-mono uppercase tracking-widest text-[#B1C2A5] block mb-1">Notas Internas</label>
              <textarea rows={2} value={guestFormData.notes} onChange={e => setGuestFormData({ ...guestFormData, notes: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs text-[#EAF0E6] focus:outline-none focus:border-[var(--color-gold)]" placeholder="Ej. Padrinos de boda..." />
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
              <button type="button" onClick={() => setIsBankModalOpen(false)} className="px-5 py-2.5 rounded-full bg-white/10 text-xs text-[#EAF0E6] hover:bg-white/20 transition-colors cursor-pointer">Cancelar</button>
              <button type="submit" form="bank-form" className="px-6 py-2.5 rounded-full bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white font-bold text-xs uppercase tracking-[0.15em] shadow-lg hover:scale-[1.02] transition-transform cursor-pointer">Guardar Cuenta</button>
            </div>
          }
        >
          <form id="bank-form" onSubmit={saveBank} className="space-y-4">
            <div>
              <label className="text-[10px] font-mono uppercase tracking-widest text-[#B1C2A5] block mb-1">Nombre del Banco *</label>
              <input type="text" required value={bankFormData.bankName} onChange={e => setBankFormData({ ...bankFormData, bankName: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs text-[#EAF0E6]" placeholder="Ej. Banco Pichincha" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-mono uppercase tracking-widest text-[#B1C2A5] block mb-1">Tipo de Cuenta</label>
                <input type="text" required value={bankFormData.accountType} onChange={e => setBankFormData({ ...bankFormData, accountType: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs text-[#EAF0E6]" placeholder="Cuenta de Ahorros" />
              </div>
              <div>
                <label className="text-[10px] font-mono uppercase tracking-widest text-[#B1C2A5] block mb-1">Número de Cuenta *</label>
                <input type="text" required value={bankFormData.accountNumber} onChange={e => setBankFormData({ ...bankFormData, accountNumber: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs text-[#EAF0E6] font-mono" placeholder="2205481904" />
              </div>
            </div>
            <div>
              <label className="text-[10px] font-mono uppercase tracking-widest text-[#B1C2A5] block mb-1">Nombre del Titular</label>
              <input type="text" value={bankFormData.holderName} onChange={e => setBankFormData({ ...bankFormData, holderName: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs text-[#EAF0E6]" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-mono uppercase tracking-widest text-[#B1C2A5] block mb-1">C.I. / RUC</label>
                <input type="text" value={bankFormData.idNumber} onChange={e => setBankFormData({ ...bankFormData, idNumber: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs text-[#EAF0E6]" />
              </div>
              <div>
                <label className="text-[10px] font-mono uppercase tracking-widest text-[#B1C2A5] block mb-1">Email</label>
                <input type="email" value={bankFormData.email} onChange={e => setBankFormData({ ...bankFormData, email: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs text-[#EAF0E6]" />
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
              <button type="button" onClick={() => setIsVenueModalOpen(false)} className="px-5 py-2.5 rounded-full bg-white/10 text-xs text-[#EAF0E6] hover:bg-white/20 transition-colors cursor-pointer">Cancelar</button>
              <button type="submit" form="venue-form" className="px-6 py-2.5 rounded-full bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white font-bold text-xs uppercase tracking-[0.15em] shadow-lg hover:scale-[1.02] transition-transform cursor-pointer">Guardar Lugar</button>
            </div>
          }
        >
          <form id="venue-form" onSubmit={saveVenue} className="space-y-4">
            <div>
              <label className="text-[10px] font-mono uppercase tracking-widest text-[#B1C2A5] block mb-1">Nombre del Lugar *</label>
              <input type="text" required value={venueFormData.name} onChange={e => setVenueFormData({ ...venueFormData, name: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs text-[#EAF0E6]" placeholder="Ej. Quinta Loren" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-mono uppercase tracking-widest text-[#B1C2A5] block mb-1">Tipo de Evento / Lugar</label>
                {(() => {
                  const currentUserId = managedAdminUser?.id || session?.user?.id || '1';
                  const activePerms = userCeremonyMap[currentUserId] || { civil: true, eclesiastico: true, recepcion: true };
                  return (
                    <select
                      value={venueFormData.type}
                      onChange={e => setVenueFormData({ ...venueFormData, type: e.target.value as any })}
                      className="w-full px-4 py-2.5 rounded-xl bg-[#2D3B2A] border border-white/15 text-xs text-[#EAF0E6]"
                    >
                      {activePerms.civil !== false && (
                        <option value="civil">Matrimonio Civil (Ceremonia Civil)</option>
                      )}
                      {activePerms.eclesiastico !== false && (
                        <option value="eclesiastico">Matrimonio Eclesiástico (Ceremonia Religiosa)</option>
                      )}
                      <option value="ceremonia">Ceremonia Nupcial General</option>
                      {activePerms.recepcion !== false && (
                        <option value="recepcion">Recepción & Fiesta de Bodas</option>
                      )}
                    </select>
                  );
                })()}
              </div>
              <div>
                <label className="text-[10px] font-mono uppercase tracking-widest text-[#B1C2A5] block mb-1">Hora</label>
                <input type="text" value={venueFormData.time} onChange={e => setVenueFormData({ ...venueFormData, time: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs text-[#EAF0E6]" placeholder="19:00 PM" />
              </div>
            </div>
            <div>
              <label className="text-[10px] font-mono uppercase tracking-widest text-[#B1C2A5] block mb-1">Dirección</label>
              <input type="text" value={venueFormData.address} onChange={e => setVenueFormData({ ...venueFormData, address: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs text-[#EAF0E6]" placeholder="Av. Los Guaytambos, Ficoa" />
            </div>
            <div>
              <label className="text-[10px] font-mono uppercase tracking-widest text-[#B1C2A5] block mb-1">URL Google Maps</label>
              <input type="text" value={venueFormData.googleMapsUrl} onChange={e => setVenueFormData({ ...venueFormData, googleMapsUrl: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs text-[#EAF0E6] font-mono" placeholder="https://maps.google.com/..." />
            </div>
            <div>
              <label className="text-[10px] font-mono uppercase tracking-widest text-[#B1C2A5] block mb-1">URL Imagen de Fondo</label>
              <input type="text" value={venueFormData.imageUrl} onChange={e => setVenueFormData({ ...venueFormData, imageUrl: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs text-[#EAF0E6] font-mono" />
            </div>
            <div>
              <label className="text-[10px] font-mono uppercase tracking-widest text-[#B1C2A5] block mb-1">Descripción</label>
              <textarea rows={2} value={venueFormData.description} onChange={e => setVenueFormData({ ...venueFormData, description: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs text-[#EAF0E6]" />
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
              <button type="button" onClick={() => setIsUserModalOpen(false)} className="px-5 py-2.5 rounded-full bg-white/10 text-xs text-[#EAF0E6] hover:bg-white/20 transition-colors cursor-pointer">Cancelar</button>
              <button type="submit" form="user-form" disabled={isSavingUser} className="px-6 py-2.5 rounded-full bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white font-bold text-xs uppercase tracking-[0.15em] shadow-lg hover:scale-[1.02] transition-transform cursor-pointer disabled:opacity-50">{isSavingUser ? 'Guardando...' : 'Crear Admin'}</button>
            </div>
          }
        >
          <form id="user-form" onSubmit={e => void saveUser(e)} className="space-y-4">
            <div><label className="text-[10px] font-mono uppercase tracking-widest text-[#B1C2A5] block mb-1">Nombre Novios / Nombres *</label><input type="text" required value={userFormData.fullName} onChange={e => setUserFormData({ ...userFormData, fullName: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs text-[#EAF0E6]" placeholder="Ej. Mateo & Camila" /></div>
            <div className="grid grid-cols-2 gap-4"><div><label className="text-[10px] font-mono uppercase tracking-widest text-[#B1C2A5] block mb-1">Usuario / Subdominio *</label><input type="text" required value={userFormData.username} onChange={e => setUserFormData({ ...userFormData, username: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs text-[#EAF0E6]" placeholder="mateoycamila" /></div><div><label className="text-[10px] font-mono uppercase tracking-widest text-[#B1C2A5] block mb-1">Contraseña *</label><input type="password" required value={userFormData.password} onChange={e => setUserFormData({ ...userFormData, password: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs text-[#EAF0E6]" placeholder="••••••••" /></div></div>
            <div><label className="text-[10px] font-mono uppercase tracking-widest text-[#B1C2A5] block mb-1">Rol</label><select value={userFormData.role} onChange={e => setUserFormData({ ...userFormData, role: e.target.value as 'superadmin' | 'admin' | 'user' })} className="w-full px-4 py-2.5 rounded-xl bg-[#2D3B2A] border border-white/15 text-xs text-[#EAF0E6]"><option value="admin">Admin (Novios)</option><option value="superadmin">Superadmin</option></select></div>
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
              <button type="button" onClick={() => setIsPasswordModalOpen(false)} className="px-5 py-2.5 rounded-full bg-white/10 text-xs text-[#EAF0E6] hover:bg-white/20 transition-colors cursor-pointer">Cancelar</button>
              <button type="submit" form="password-form" disabled={isSavingPassword} className="px-6 py-2.5 rounded-full bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white font-bold text-xs uppercase tracking-[0.15em] shadow-lg cursor-pointer disabled:opacity-50">{isSavingPassword ? 'Actualizando...' : 'Guardar Nueva Contraseña'}</button>
            </div>
          }
        >
          <form id="password-form" onSubmit={handleRequestSavePassword} className="space-y-4">
            <div>
              <label className="text-[10px] font-mono uppercase tracking-widest text-[#B1C2A5] block mb-1">Usuario Admin</label>
              <input type="text" disabled value={editingUserForPassword?.username || ''} className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-[#EAF0E6] font-mono font-bold" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[10px] font-mono uppercase tracking-widest text-[#B1C2A5] block">Contraseña de Acceso *</label>
                <button type="button" onClick={() => setShowPasswordText(!showPasswordText)} className="flex items-center gap-1.5 text-[11px] font-mono text-[var(--color-gold-light)] hover:underline cursor-pointer">
                  {showPasswordText ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>{showPasswordText ? 'Ocultar Contraseña' : 'Ver / Mostrar Contraseña'}</span>
                </button>
              </div>
              <input
                type={showPasswordText ? 'text' : 'password'}
                required
                value={newPasswordInput}
                onChange={e => setNewPasswordInput(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/15 text-sm text-[#EAF0E6] font-mono font-semibold focus:outline-none focus:border-[var(--color-gold)]"
                placeholder="Ingresa la nueva contraseña..."
              />
            </div>
          </form>
        </Modal>

        {/* Share Credentials & Domain Link Modal */}
        <Modal
          isOpen={isCredentialsModalOpen && isSuperadmin}
          onClose={() => setIsCredentialsModalOpen(false)}
          title={`Ficha de Accesos: ${shareCredentialsData.fullName}`}
          size="md"
          footer={
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsCredentialsModalOpen(false)}
                className="px-5 py-2.5 rounded-full bg-white/10 text-xs text-[#EAF0E6] hover:bg-white/20 transition-colors cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          }
        >
          <div className="space-y-5 text-[#EAF0E6]">
            <p className="text-xs text-[#8A9D76]/80 leading-relaxed font-sans">
              Aquí tienes el enlace del subdominio/sitio asignado a este administrador junto con su usuario y contraseña para enviarle directamente por WhatsApp o correo.
            </p>

            <div className="p-4 rounded-2xl bg-black/50 border border-white/15 space-y-3 font-mono text-xs">
              <div>
                <span className="text-[10px] text-[#B1C2A5] uppercase tracking-widest block mb-0.5">🌐 Enlace Directo al Sitio del Admin:</span>
                <input
                  type="text"
                  readOnly
                  value={`${window.location.origin}${window.location.pathname}?admin=${encodeURIComponent(shareCredentialsData.username)}`}
                  className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/15 text-xs text-emerald-300 font-mono font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[10px] text-[#B1C2A5] uppercase tracking-widest block mb-0.5">👤 Usuario:</span>
                  <input
                    type="text"
                    readOnly
                    value={shareCredentialsData.username}
                    className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/15 text-xs text-[#EAF0E6] font-mono font-bold"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-[#B1C2A5] uppercase tracking-widest block mb-0.5">🔑 Contraseña:</span>
                  <input
                    type="text"
                    readOnly
                    value={shareCredentialsData.password}
                    className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/15 text-xs text-[#EAF0E6] font-mono font-bold"
                  />
                </div>
              </div>
            </div>

            {/* Quick WhatsApp Copy Button */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => {
                  const siteUrl = `${window.location.origin}${window.location.pathname}?admin=${encodeURIComponent(shareCredentialsData.username)}`;
                  const textToCopy = `💍 ¡Hola ${shareCredentialsData.fullName}! Bienvenidos a su Plataforma Nupcial.\n\n🌐 Enlace de su Sitio: ${siteUrl}\n👤 Usuario de Acceso: ${shareCredentialsData.username}\n🔑 Contraseña: ${shareCredentialsData.password}\n\nPor favor ingresen al enlace para revisar su invitación y aceptar los Términos de Servicio. ¡Felicidades!`;

                  navigator.clipboard.writeText(textToCopy);
                  setCopiedCredentialsToast(true);
                  setTimeout(() => setCopiedCredentialsToast(false), 3500);
                }}
                className="w-full py-3.5 px-6 rounded-full bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white font-bold text-xs uppercase tracking-[0.15em] shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Copy className="w-4 h-4 text-white" />
                <span>Copiar Ficha Completa para WhatsApp</span>
              </button>

              {copiedCredentialsToast && (
                <p className="text-center text-xs font-mono text-emerald-300 font-bold animate-pulse">
                  ✅ ¡Ficha de accesos y link copiados al portapapeles con éxito!
                </p>
              )}
            </div>
          </div>
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
