import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Lock,
  Calendar,
  Package,
  MessageSquare,
  Plus,
  Trash2,
  Edit2,
  RefreshCw,
  LogOut,
  CheckCircle2,
  Search,
  ShieldCheck,
  AlertCircle,
  X,
  DollarSign,
  Smartphone,
  Battery,
  Layers,
  Box,
  Camera,
  Shield,
  Zap,
  Save,
  Upload,
  Image as ImageIcon,
  Key,
  KeyRound,
  Eye,
  EyeOff,
} from 'lucide-react';
import { Booking, ContactSubmission, PartProduct } from '../types';
import { INITIAL_PARTS } from '../data/seedData';
import { formatUGX } from '../utils/format';
import { getStoredParts, mergeWithStoredParts, saveStoredParts, hydrateCatalogFromIdb } from '../utils/catalogStorage';
import { AdminInventory } from './AdminInventory';
import { AdminSecurity } from './AdminSecurity';
import { AdminResetPassword } from './AdminResetPassword';

interface AdminPanelProps {
  isDarkMode: boolean;
  onBackToMain: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ isDarkMode, onBackToMain }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [activeTab, setActiveTab] = useState<'bookings' | 'parts' | 'contacts' | 'security'>('bookings');

  // Data states
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [parts, setParts] = useState<PartProduct[]>([]);
  const [contacts, setContacts] = useState<ContactSubmission[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');

  // Part Editing Modal & Token Persistence
  const [adminToken, setAdminToken] = useState<string>(() => {
    return localStorage.getItem('iphone_lab_admin_token') || '';
  });
  const [editingPart, setEditingPart] = useState<PartProduct | null>(null);
  const [isAddingPart, setIsAddingPart] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    // Hydrate catalog from IndexedDB for high-capacity offline image support
    hydrateCatalogFromIdb().then((idbParts) => {
      if (idbParts && idbParts.length > 0) {
        setParts(mergeWithStoredParts(INITIAL_PARTS));
      }
    });

    const storedToken = localStorage.getItem('iphone_lab_admin_token');
    if (storedToken) {
      setAdminToken(storedToken);
      setIsAuthenticated(true);
      loadAdminData(storedToken);
    }
  }, []);

  const getAuthHeaders = (extraHeaders: Record<string, string> = {}) => {
    const tok = adminToken || localStorage.getItem('iphone_lab_admin_token') || '';
    return {
      ...extraHeaders,
      'Authorization': `Bearer ${tok}`,
    };
  };

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    fieldKey: 'image_url' | 'incell_image_url' | 'oled_image_url' = 'image_url'
  ) => {
    const file = e.target.files?.[0];
    if (!file || !editingPart) return;

    setUploadingImage(true);
    try {
      const isPng = file.type === 'image/png' || file.name.toLowerCase().endsWith('.png');
      const base64Str = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (ev) => {
          const rawUrl = ev.target?.result as string;
          if (!rawUrl) return resolve('');
          const img = new Image();
          img.onload = () => {
            const maxDim = 800;
            let { width, height } = img;
            if (width > maxDim || height > maxDim) {
              if (width > height) {
                height = Math.round((height * maxDim) / width);
                width = maxDim;
              } else {
                width = Math.round((width * maxDim) / height);
                height = maxDim;
              }
            }
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (!ctx) return resolve(rawUrl);

            if (isPng) {
              // Preserve transparency for PNGs
              ctx.clearRect(0, 0, width, height);
              ctx.drawImage(img, 0, 0, width, height);
              try {
                const webp = canvas.toDataURL('image/webp', 0.88);
                if (webp && webp.startsWith('data:image/webp')) {
                  return resolve(webp);
                }
              } catch {}
              resolve(canvas.toDataURL('image/png'));
            } else {
              ctx.fillStyle = '#FFFFFF';
              ctx.fillRect(0, 0, width, height);
              ctx.drawImage(img, 0, 0, width, height);
              resolve(canvas.toDataURL('image/jpeg', 0.85));
            }
          };
          img.onerror = () => resolve(rawUrl);
          img.src = rawUrl;
        };
        reader.onerror = () => resolve('');
        reader.readAsDataURL(file);
      });

      if (!base64Str) {
        setUploadingImage(false);
        return;
      }

      try {
        const res = await fetch('/api/admin/upload-image', {
          method: 'POST',
          headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
          body: JSON.stringify({ imageBase64: base64Str, filename: file.name }),
        });
        const data = await res.json();
        if (!res.ok || !data.image_url) {
          throw new Error(data.error || `Image upload failed (${res.status})`);
        }
        const finalUrl = data.image_url;
        setEditingPart((prev) =>
          prev
            ? {
                ...prev,
                [fieldKey]: finalUrl,
                image_url: prev.image_url || finalUrl,
                imageUrl: prev.imageUrl || finalUrl,
              }
            : null
        );
      } catch (error) {
        setToastMessage(error instanceof Error ? error.message : 'Image upload failed');
      } finally {
        setUploadingImage(false);
      }
    } catch (err) {
      console.error('File read error:', err);
      setUploadingImage(false);
    }
  };

  // Check login with dual server and static deployment fallback
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    const inputPass = passwordInput.trim();

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: inputPass }),
      });

      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const data = await res.json();
        if (res.ok && data.success) {
          const tok = data.token || `admin-token-${Date.now()}`;
          setAdminToken(tok);
          localStorage.setItem('iphone_lab_admin_token', tok);
          setIsAuthenticated(true);
          loadAdminData(tok);
          return;
        } else {
          setLoginError(data.error || 'Incorrect Admin Password');
          return;
        }
      }
    } catch {
      // If network fails or server is not available (e.g. static hosting on Vercel), fall back to client verification
    }

    // Client-side authentication fallback for static/Vercel deployments
    const storedCustomPass = localStorage.getItem('iphone_lab_admin_custom_pwd');
    const validPasswords = [
      storedCustomPass,
      'iphonelab2026',
      'iPhoneLab2026',
      'iphonelab@2026',
    ].filter(Boolean);

    if (validPasswords.includes(inputPass)) {
      const tok = `admin-token-${Date.now()}`;
      setAdminToken(tok);
      localStorage.setItem('iphone_lab_admin_token', tok);
      setIsAuthenticated(true);
      loadAdminData(tok);
    } else {
      setLoginError('Incorrect Admin Password');
    }
  };

  const handleLogout = () => {
    setAdminToken('');
    localStorage.removeItem('iphone_lab_admin_token');
    setIsAuthenticated(false);
  };

  const loadAdminData = async (tokenOverride?: string) => {
    setLoading(true);
    const activeTok = tokenOverride || adminToken || localStorage.getItem('iphone_lab_admin_token') || '';
    const headers = { 'Authorization': `Bearer ${activeTok}` };

    // Fallback seed bookings
    const defaultBookings: Booking[] = [
      {
        id: 'bk-1001',
        name: 'Mugisha Joel',
        phone: '0753234218',
        service_type: 'Screen Replacement',
        device_model: 'iPhone 13 Pro Max',
        preferred_date: '2026-08-01',
        notes: 'OLED (DD) screen tier requested. Cracked top glass.',
        status: 'Pending',
        created_at: new Date().toISOString()
      },
      {
        id: 'bk-1002',
        name: 'Nalubega Sarah',
        phone: '0730700368',
        service_type: 'Battery Replacement',
        device_model: 'iPhone 11 Pro',
        preferred_date: '2026-08-02',
        notes: 'Battery health at 74%. Needs same-day installation.',
        status: 'Confirmed',
        created_at: new Date().toISOString()
      }
    ];

    const defaultContacts: ContactSubmission[] = [
      {
        id: 'ct-101',
        name: 'Kato Paul',
        phone: '0701122334',
        message: 'Do you offer micro-soldering for iPhone 14 Pro water damage baseband repair?',
        created_at: new Date().toISOString()
      }
    ];

    try {
      const [resB, resP, resC] = await Promise.allSettled([
        fetch('/api/bookings', { headers }),
        fetch('/api/parts', { headers }),
        fetch('/api/contacts', { headers }),
      ]);

      // Handle Bookings
      let loadedBookings: Booking[] = [];
      if (resB.status === 'fulfilled' && resB.value.ok && (resB.value.headers.get('content-type') || '').includes('application/json')) {
        loadedBookings = await resB.value.json();
      } else {
        const localB = localStorage.getItem('iphone_lab_bookings');
        loadedBookings = localB ? JSON.parse(localB) : defaultBookings;
      }
      setBookings(loadedBookings);

      // Handle Parts
      let loadedParts: PartProduct[] = [];
      if (resP.status === 'fulfilled' && resP.value.ok && (resP.value.headers.get('content-type') || '').includes('application/json')) {
        const pData = await resP.value.json();
        loadedParts = Array.isArray(pData) && pData.length > 0 ? pData : mergeWithStoredParts(INITIAL_PARTS);
      } else {
        loadedParts = mergeWithStoredParts(INITIAL_PARTS);
      }
      setParts(loadedParts);
      saveStoredParts(loadedParts);

      // Handle Contacts
      let loadedContacts: ContactSubmission[] = [];
      if (resC.status === 'fulfilled' && resC.value.ok && (resC.value.headers.get('content-type') || '').includes('application/json')) {
        loadedContacts = await resC.value.json();
      } else {
        const localC = localStorage.getItem('iphone_lab_contacts');
        loadedContacts = localC ? JSON.parse(localC) : defaultContacts;
      }
      setContacts(loadedContacts);
    } catch (err) {
      console.error('Error loading admin data, using local storage:', err);
      const partsFallback = mergeWithStoredParts(INITIAL_PARTS);
      setParts(partsFallback);
      saveStoredParts(partsFallback);
      const localB = localStorage.getItem('iphone_lab_bookings');
      setBookings(localB ? JSON.parse(localB) : defaultBookings);
      const localC = localStorage.getItem('iphone_lab_contacts');
      setContacts(localC ? JSON.parse(localC) : defaultContacts);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateBookingStatus = async (id: string, newStatus: Booking['status']) => {
    const updated = bookings.map((b) => (b.id === id ? { ...b, status: newStatus } : b));
    setBookings(updated);
    try {
      localStorage.setItem('iphone_lab_bookings', JSON.stringify(updated));
    } catch {}

    try {
      await fetch(`/api/bookings/${id}/status`, {
        method: 'PUT',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ status: newStatus }),
      });
    } catch (err) {
      console.warn('Background update booking status note:', err);
    }
  };

  const handleSavePart = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPart) return;

    try {
      const isScreen = editingPart.category === 'Screens';
const incellImg = isScreen ? (editingPart.incell_image_url || editingPart.incellImageUrl || '') : '';
const oledImg = isScreen ? (editingPart.oled_image_url || editingPart.oledImageUrl || '') : '';

// Check main image_url first, then fall back to oled/incell tiers
const primaryImg = editingPart.image_url || editingPart.imageUrl || oledImg || incellImg || '';

      const partToSave: PartProduct = {
        ...editingPart,
        imageUrl: primaryImg,
        image_url: primaryImg,
        incellImageUrl: incellImg,
        incell_image_url: incellImg,
        oledImageUrl: oledImg,
        oled_image_url: oledImg,
      };

      const updatedList = isAddingPart
        ? [partToSave, ...parts.filter((p) => p.id !== partToSave.id)]
        : parts.map((p) => (p.id === partToSave.id ? partToSave : p));

      setParts(updatedList);
      saveStoredParts(updatedList);
      setEditingPart(null);
      setIsAddingPart(false);

      const method = isAddingPart ? 'POST' : 'PUT';
      const url = isAddingPart ? '/api/parts' : `/api/parts/${editingPart.id}`;

      try {
        const response = await fetch(url, {
          method,
          headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
          body: JSON.stringify(partToSave),
        });
        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data.error || `Inventory save failed (${response.status})`);
        }
      } catch (error) {
        setToastMessage(error instanceof Error ? error.message : 'Inventory save failed');
        await loadAdminData();
      }
    } catch (err) {
      console.error('Error saving part:', err);
    }
  };

  const handleDeletePart = async (id: string) => {
    if (!confirm('Are you sure you want to delete this part from inventory?')) return;
    try {
      const updatedParts = parts.filter((p) => p.id !== id);
      setParts(updatedParts);
      saveStoredParts(updatedParts);

      try {
        const response = await fetch(`/api/parts/${id}`, {
          method: 'DELETE',
          headers: getAuthHeaders(),
        });
        if (!response.ok) throw new Error(`Inventory delete failed (${response.status})`);
      } catch (error) {
        setToastMessage(error instanceof Error ? error.message : 'Inventory delete failed');
        await loadAdminData();
      }
    } catch (err) {
      console.error('Error deleting part:', err);
    }
  };

  const handleUpdatePart = async (updatedPart: PartProduct) => {
    // Optimistic UI update and persistent local store update
    const updatedList = parts.map((p) => (p.id === updatedPart.id ? updatedPart : p));
    setParts(updatedList);
    saveStoredParts(updatedList);
    try {
      const response = await fetch(`/api/parts/${updatedPart.id}`, {
        method: 'PUT',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(updatedPart),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || `Inventory update failed (${response.status})`);
      }
    } catch (err) {
      setToastMessage(err instanceof Error ? err.message : 'Inventory update failed');
      await loadAdminData();
    }
  };

  const handleAddPart = async (partData: Omit<PartProduct, 'id'>) => {
    const newPart: PartProduct = {
      ...partData,
      id: `part-${Date.now()}`,
    };
    const updatedList = [newPart, ...parts];
    setParts(updatedList);
    saveStoredParts(updatedList);
    try {
      const response = await fetch('/api/parts', {
        method: 'POST',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(newPart),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || `Inventory create failed (${response.status})`);
      }
    } catch (error) {
      setToastMessage(error instanceof Error ? error.message : 'Inventory create failed');
      await loadAdminData();
    }
  };

  const handleReseed = async () => {
    if (!confirm('This will reset inventory back to default seed data. Proceed?')) return;
    try {
      await fetch('/api/seed', {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      loadAdminData();
    } catch (err) {
      console.error('Reseed error:', err);
    }
  };

  if (!isAuthenticated) {
    return (
      <section id="admin" className={`min-h-[85vh] flex items-center justify-center p-4 py-24 ${isDarkMode ? 'bg-[#0A0A0A]' : 'bg-slate-100'}`}>
        <AnimatePresence mode="wait">
          {isResettingPassword ? (
            <AdminResetPassword
              key="reset-flow"
              isDarkMode={isDarkMode}
              onSuccess={(tok, msg) => {
                setAdminToken(tok);
                localStorage.setItem('iphone_lab_admin_token', tok);
                setIsAuthenticated(true);
                setIsResettingPassword(false);
                setToastMessage(msg || 'Password created successfully! Welcome to the Admin Console.');
                setTimeout(() => setToastMessage(''), 5000);
                loadAdminData(tok);
              }}
              onCancel={() => setIsResettingPassword(false)}
            />
          ) : (
            <motion.div
              key="login-flow"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`w-full max-w-md p-8 rounded-3xl border shadow-2xl ${
                isDarkMode ? 'glass-card-dark text-white' : 'glass-card-light text-slate-900'
              }`}
            >
              <div className="w-16 h-16 rounded-2xl liquid-teal text-[#1D9BB5] border border-[#1D9BB5]/30 flex items-center justify-center mx-auto mb-6">
                <Lock className="w-8 h-8" />
              </div>

              <h2 className="text-2xl font-black text-center mb-1">Admin Control Console</h2>
              <p className="text-xs text-slate-400 text-center mb-6">
                iPhone Lab UG Management Subpage (Single Admin Access)
              </p>

              {toastMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{toastMessage}</span>
                </motion.div>
              )}

              {loginError && (
                <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                      Admin Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsResettingPassword(true)}
                      className="text-xs font-bold text-[#1D9BB5] hover:underline flex items-center gap-1"
                    >
                      <KeyRound className="w-3 h-3" />
                      <span>Forgot / Reset?</span>
                    </button>
                  </div>

                  <div className="relative">
                    <input
                      type={showLoginPassword ? 'text' : 'password'}
                      required
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      placeholder="Enter password (default: iphonelab2026)"
                      className={`w-full pl-4 pr-10 py-3 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-[#1D9BB5] ${
                        isDarkMode ? 'bg-black/40 border-white/10 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                    >
                      {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full glow-btn text-white font-bold py-3.5 px-4 rounded-xl text-sm flex items-center justify-center gap-2"
                >
                  <Lock className="w-4 h-4" />
                  <span>Authenticate Console</span>
                </button>
              </form>

              {/* Forgot password secondary prompt */}
              <div className="mt-4 pt-4 border-t border-slate-800/40 text-center">
                <button
                  type="button"
                  onClick={() => setIsResettingPassword(true)}
                  className="w-full py-2.5 px-3 rounded-xl border border-slate-700/50 hover:border-[#1D9BB5]/40 text-xs font-semibold text-slate-300 hover:text-white transition-all flex items-center justify-center gap-2 bg-slate-800/30 hover:bg-slate-800/60"
                >
                  <KeyRound className="w-3.5 h-3.5 text-[#1D9BB5]" />
                  <span>Forgot Password or Set New Password</span>
                </button>
              </div>

              <div className="mt-4 text-center">
                <button
                  onClick={onBackToMain}
                  className="text-xs font-bold text-slate-400 hover:text-[#1D9BB5] transition-colors"
                >
                  ← Return to Main Website
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    );
  }

  // Filtered Bookings
  const filteredBookings = bookings.filter(
    (b) =>
      b.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      b.phone.includes(searchFilter) ||
      b.device_model.toLowerCase().includes(searchFilter.toLowerCase()) ||
      b.id.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <section id="admin" className={`min-h-screen py-24 px-4 sm:px-6 lg:px-8 ${isDarkMode ? 'bg-[#0A0A0A] text-white' : 'bg-slate-100 text-slate-900'}`}>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Admin Dashboard Header */}
        <div className={`p-6 sm:p-8 rounded-3xl border shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 ${
          isDarkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1D9BB5]/10 text-[#1D9BB5] text-xs font-bold uppercase tracking-wider mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              Authenticated Session
            </div>
            <h1 className="text-2xl sm:text-3xl font-black">
              iPhone Lab UG Management Console
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Shop PB86, New Pioneer Mall, Kampala · Real-Time Repair Database
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('security')}
              className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 ${
                activeTab === 'security'
                  ? 'bg-[#1D9BB5] border-[#1D9BB5] text-white shadow-md'
                  : isDarkMode
                  ? 'border-slate-700 hover:bg-slate-800 text-slate-300'
                  : 'border-slate-300 hover:bg-slate-100 text-slate-700'
              }`}
              title="Security & Password Settings"
            >
              <Key className="w-4 h-4 text-[#1D9BB5]" />
              <span>Password & Security</span>
            </button>

            <button
              onClick={handleReseed}
              className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 ${
                isDarkMode ? 'border-slate-700 hover:bg-slate-800 text-slate-300' : 'border-slate-300 hover:bg-slate-100 text-slate-700'
              }`}
              title="Reseed Parts Inventory"
            >
              <RefreshCw className="w-4 h-4 text-[#1D9BB5]" />
              <span>Reseed Parts</span>
            </button>

            <button
              onClick={handleLogout}
              className="bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 border border-red-500/20"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out</span>
            </button>
          </div>
        </div>

        {/* Global Toast Message */}
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-semibold flex items-center gap-3 shadow-lg"
          >
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setActiveTab('bookings')}
            className={`px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
              activeTab === 'bookings'
                ? 'bg-[#1D9BB5] text-white shadow-lg'
                : isDarkMode
                ? 'bg-slate-900 text-slate-400 hover:text-white'
                : 'bg-white text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Bookings Queue ({bookings.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('parts')}
            className={`px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
              activeTab === 'parts'
                ? 'bg-[#1D9BB5] text-white shadow-lg'
                : isDarkMode
                ? 'bg-slate-900 text-slate-400 hover:text-white'
                : 'bg-white text-slate-600 hover:text-slate-900'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Parts Inventory ({parts.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('contacts')}
            className={`px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
              activeTab === 'contacts'
                ? 'bg-[#1D9BB5] text-white shadow-lg'
                : isDarkMode
                ? 'bg-slate-900 text-slate-400 hover:text-white'
                : 'bg-white text-slate-600 hover:text-slate-900'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Messages Log ({contacts.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
              activeTab === 'security'
                ? 'bg-[#1D9BB5] text-white shadow-lg'
                : isDarkMode
                ? 'bg-slate-900 text-slate-400 hover:text-white'
                : 'bg-white text-slate-600 hover:text-slate-900'
            }`}
          >
            <Key className="w-4 h-4" />
            <span>Security & Password</span>
          </button>
        </div>

        {/* TAB 1: BOOKINGS MANAGEMENT */}
        {activeTab === 'bookings' && (
          <div className={`p-6 rounded-3xl border shadow-xl ${isDarkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'}`}>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#1D9BB5]" />
                Customer Repair Bookings
              </h2>

              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  placeholder="Filter name, phone, or model..."
                  className={`w-full pl-10 pr-4 py-2 rounded-xl text-xs border ${
                    isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300'
                  }`}
                />
              </div>
            </div>

            {filteredBookings.length === 0 ? (
              <p className="text-center py-12 text-sm text-slate-400">No booking records found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className={`border-b ${isDarkMode ? 'border-slate-800 text-slate-400' : 'border-slate-200 text-slate-500'}`}>
                    <tr>
                      <th className="py-3 px-4">Ref ID</th>
                      <th className="py-3 px-4">Customer</th>
                      <th className="py-3 px-4">Device & Service</th>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Notes</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/40">
                    {filteredBookings.map((b) => (
                      <tr key={b.id} className={isDarkMode ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50'}>
                        <td className="py-3.5 px-4 font-mono font-bold text-[#1D9BB5]">{b.id}</td>
                        <td className="py-3.5 px-4">
                          <div className="font-bold">{b.name}</div>
                          <a href={`tel:${b.phone}`} className="text-[#1D9BB5] hover:underline">{b.phone}</a>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-200">{b.device_model}</div>
                          <div className="text-slate-400">{b.service_type}</div>
                        </td>
                        <td className="py-3.5 px-4 font-medium">{b.preferred_date}</td>
                        <td className="py-3.5 px-4 max-w-xs truncate text-slate-400">{b.notes || '—'}</td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2.5 py-1 rounded-full font-bold uppercase text-[10px] ${
                            b.status === 'Completed'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : b.status === 'In Progress'
                              ? 'bg-blue-500/20 text-blue-400'
                              : b.status === 'Confirmed'
                              ? 'bg-amber-500/20 text-amber-400'
                              : 'bg-slate-700 text-slate-300'
                          }`}>
                            {b.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <select
                            value={b.status}
                            onChange={(e) => handleUpdateBookingStatus(b.id, e.target.value as Booking['status'])}
                            className={`px-2 py-1 rounded border text-[11px] font-semibold ${
                              isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-100 border-slate-300'
                            }`}
                          >
                            <option value="Pending">Pending</option>
                            <option value="Confirmed">Confirmed</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Completed">Completed</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: PARTS INVENTORY MONITORING DASHBOARD */}
        {activeTab === 'parts' && (
          <div className={`p-6 rounded-3xl border shadow-xl ${isDarkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'}`}>
            <AdminInventory
              isDarkMode={isDarkMode}
              parts={parts}
              onUpdatePart={handleUpdatePart}
              onAddPart={handleAddPart}
              onDeletePart={handleDeletePart}
              onRefreshData={() => loadAdminData()}
            />
          </div>
        )}

        {/* TAB 3: CONTACT SUBMISSIONS */}
        {activeTab === 'contacts' && (
          <div className={`p-6 rounded-3xl border shadow-xl ${isDarkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'}`}>
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-[#1D9BB5]" />
              Customer Inquiries Log
            </h2>

            {contacts.length === 0 ? (
              <p className="text-center py-12 text-sm text-slate-400">No contact messages received yet.</p>
            ) : (
              <div className="space-y-4">
                {contacts.map((c) => (
                  <div
                    key={c.id}
                    className={`p-5 rounded-2xl border space-y-2 ${
                      isDarkMode ? 'bg-slate-800/60 border-slate-700' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="font-bold text-base text-[#1D9BB5]">{c.name}</div>
                      <span className="text-slate-400">{new Date(c.created_at).toLocaleDateString()}</span>
                    </div>

                    <div className="text-xs font-semibold text-slate-300">
                      Phone: <a href={`tel:${c.phone}`} className="text-[#1D9BB5] hover:underline">{c.phone}</a>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed bg-black/20 p-3 rounded-xl">
                      &quot;{c.message}&quot;
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: ADMIN SECURITY & PASSWORD MANAGEMENT */}
        {activeTab === 'security' && (
          <div className={`p-6 sm:p-8 rounded-3xl border shadow-xl ${isDarkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'}`}>
            <AdminSecurity
              isDarkMode={isDarkMode}
              adminToken={adminToken}
              getAuthHeaders={getAuthHeaders}
              onPasswordChanged={(newTok) => {
                if (newTok) {
                  setAdminToken(newTok);
                  localStorage.setItem('iphone_lab_admin_token', newTok);
                }
                setToastMessage('Admin password updated successfully!');
                setTimeout(() => setToastMessage(''), 5000);
              }}
            />
          </div>
        )}

        {/* PART EDIT MODAL */}
        <AnimatePresence>
          {editingPart && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`w-full max-w-lg p-6 sm:p-8 rounded-3xl border shadow-2xl relative ${
                  isDarkMode ? 'bg-[#0A0A0A] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
                }`}
              >
                <button
                  onClick={() => setEditingPart(null)}
                  className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>

                <h3 className="text-xl font-bold mb-4">
                  {isAddingPart ? 'Add New Product' : 'Edit Part Details & Pricing'}
                </h3>

                <form onSubmit={handleSavePart} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase mb-1 text-slate-400">Part Name</label>
                    <input
                      type="text"
                      required
                      value={editingPart.name}
                      onChange={(e) => setEditingPart({ ...editingPart, name: e.target.value })}
                      className={`w-full px-3 py-2 rounded-xl text-xs border ${
                        isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300'
                      }`}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold uppercase mb-1 text-slate-400">Category</label>
                      <select
                        value={editingPart.category}
                        onChange={(e) => setEditingPart({ ...editingPart, category: e.target.value as PartProduct['category'] })}
                        className={`w-full px-3 py-2 rounded-xl text-xs border ${
                          isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300'
                        }`}
                      >
                        <option value="Screens">Screens</option>
                        <option value="Batteries">Batteries</option>
                        <option value="Back Glasses">Back Glasses</option>
                        <option value="Housings">Housings</option>
                        <option value="Camera Glasses">Camera Glasses</option>
                        <option value="Screen Guards">Screen Guards</option>
                        <option value="Accessories">Accessories</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase mb-1 text-slate-400">Stock Status</label>
                      <select
                        value={editingPart.stockStatus}
                        onChange={(e) => setEditingPart({ ...editingPart, stockStatus: e.target.value as PartProduct['stockStatus'] })}
                        className={`w-full px-3 py-2 rounded-xl text-xs border ${
                          isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300'
                        }`}
                      >
                        <option value="In Stock">In Stock</option>
                        <option value="Limited Stock">Limited Stock</option>
                        <option value="Pre-Order">Pre-Order</option>
                        <option value="Out of Stock">Out of Stock</option>
                      </select>
                    </div>
                  </div>

                  {editingPart.category === 'Screens' && (
                    <div className="p-3 bg-slate-800/40 rounded-xl space-y-3">
                      <label className="block text-xs font-bold text-[#1D9BB5]">Screen Quality Tiers</label>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] text-slate-400">InCell (JH) Price (UGX)</label>
                          <input
                            type="number"
                            value={editingPart.incellPriceUGX || ''}
                            onChange={(e) =>
                              setEditingPart({
                                ...editingPart,
                                screenTier: 'Both',
                                incellPriceUGX: Number(e.target.value),
                              })
                            }
                            className={`w-full px-3 py-2 rounded-xl text-xs border ${
                              isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300'
                            }`}
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] text-slate-400">OLED (DD) Price (UGX)</label>
                          <input
                            type="number"
                            value={editingPart.oledPriceUGX || ''}
                            onChange={(e) =>
                              setEditingPart({
                                ...editingPart,
                                screenTier: 'Both',
                                oledPriceUGX: Number(e.target.value),
                              })
                            }
                            className={`w-full px-3 py-2 rounded-xl text-xs border ${
                              isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300'
                            }`}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold uppercase mb-1 text-slate-400">
                      Standard / Primary Price (UGX)
                    </label>
                    <input
                      type="number"
                      required
                      value={editingPart.priceUGX}
                      onChange={(e) => setEditingPart({ ...editingPart, priceUGX: Number(e.target.value) })}
                      className={`w-full px-3 py-2 rounded-xl text-xs border ${
                        isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase mb-1 text-slate-400">Compatibility Range</label>
                    <input
                      type="text"
                      required
                      value={editingPart.compatibilityRange}
                      onChange={(e) => setEditingPart({ ...editingPart, compatibilityRange: e.target.value })}
                      placeholder="e.g. iPhone 12 - 14 Pro Max"
                      className={`w-full px-3 py-2 rounded-xl text-xs border ${
                        isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300'
                      }`}
                    />
                  </div>

                  {/* Product Image File Upload & Preview Section */}
                  {editingPart.category === 'Screens' ? (
                    <div className="p-3 bg-slate-800/40 rounded-2xl border border-slate-700/60 space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-bold uppercase text-[#1D9BB5]">
                          Screen Photos (INCELL & OLED)
                        </label>
                        <span className="text-[10px] text-emerald-400 font-bold">Dual Upload</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        {/* INCELL PHOTO */}
                        <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-700 space-y-2">
                          <div className="font-bold text-[#1D9BB5] text-[11px]">1. INCELL Screen Photo</div>
                          <div className="flex items-center gap-2">
                            {editingPart.incell_image_url || editingPart.incellImageUrl ? (
                              <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-[#1D9BB5] bg-black shrink-0">
                                <img
                                  src={editingPart.incell_image_url || editingPart.incellImageUrl}
                                  alt="INCELL"
                                  className="w-full h-full object-cover"
                                />
                                <button
                                  type="button"
                                  onClick={() => setEditingPart({ ...editingPart, incell_image_url: '', incellImageUrl: '' })}
                                  className="absolute inset-0 bg-black/80 text-red-400 flex items-center justify-center text-[9px] font-bold"
                                >
                                  Remove
                                </button>
                              </div>
                            ) : null}
                            <label className="cursor-pointer flex-1 py-1.5 px-2 rounded-lg bg-[#1D9BB5]/20 hover:bg-[#1D9BB5]/30 text-[#1D9BB5] text-[10px] font-bold text-center border border-[#1D9BB5]/40">
                              Upload INCELL PNG
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleFileUpload(e, 'incell_image_url')}
                                className="hidden"
                                disabled={uploadingImage}
                              />
                            </label>
                          </div>
                          <input
                            type="url"
                            value={editingPart.incell_image_url || editingPart.incellImageUrl || ''}
                            onChange={(e) => setEditingPart({ ...editingPart, incell_image_url: e.target.value, incellImageUrl: e.target.value })}
                            placeholder="INCELL Image URL..."
                            className={`w-full px-2 py-1 rounded-lg text-[10px] border ${
                              isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300'
                            }`}
                          />
                        </div>

                        {/* OLED PHOTO */}
                        <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-700 space-y-2">
                          <div className="font-bold text-cyan-400 text-[11px]">2. OLED Screen Photo</div>
                          <div className="flex items-center gap-2">
                            {editingPart.oled_image_url || editingPart.oledImageUrl ? (
                              <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-cyan-400 bg-black shrink-0">
                                <img
                                  src={editingPart.oled_image_url || editingPart.oledImageUrl}
                                  alt="OLED"
                                  className="w-full h-full object-cover"
                                />
                                <button
                                  type="button"
                                  onClick={() => setEditingPart({ ...editingPart, oled_image_url: '', oledImageUrl: '' })}
                                  className="absolute inset-0 bg-black/80 text-red-400 flex items-center justify-center text-[9px] font-bold"
                                >
                                  Remove
                                </button>
                              </div>
                            ) : null}
                            <label className="cursor-pointer flex-1 py-1.5 px-2 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 text-[10px] font-bold text-center border border-cyan-500/40">
                              Upload OLED PNG
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleFileUpload(e, 'oled_image_url')}
                                className="hidden"
                                disabled={uploadingImage}
                              />
                            </label>
                          </div>
                          <input
                            type="url"
                            value={editingPart.oled_image_url || editingPart.oledImageUrl || ''}
                            onChange={(e) => setEditingPart({ ...editingPart, oled_image_url: e.target.value, oledImageUrl: e.target.value })}
                            placeholder="OLED Image URL..."
                            className={`w-full px-2 py-1 rounded-lg text-[10px] border ${
                              isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300'
                            }`}
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 bg-slate-800/40 rounded-2xl border border-slate-700/60 space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-bold uppercase text-[#1D9BB5]">
                          Product Photo / Image
                        </label>
                        <span className="text-[10px] text-slate-400">Direct Upload or URL</span>
                      </div>

                      <div className="flex flex-col sm:flex-row items-center gap-3">
                        {editingPart.image_url ? (
                          <div className="relative w-20 h-20 rounded-xl overflow-hidden border-2 border-[#1D9BB5] shrink-0 bg-black group shadow-md">
                            <img
                              src={editingPart.image_url}
                              alt="Product Preview"
                              width="80"
                              height="80"
                              loading="lazy"
                              decoding="async"
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                            <button
                              type="button"
                              onClick={() => setEditingPart({ ...editingPart, image_url: '' })}
                              className="absolute inset-0 bg-black/75 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                              title="Remove Photo"
                              aria-label="Remove Photo"
                            >
                              <Trash2 className="w-5 h-5 text-red-400 mb-1" />
                              <span className="text-[9px] font-bold">Remove</span>
                            </button>
                          </div>
                        ) : (
                          <div className="w-20 h-20 rounded-xl border-2 border-dashed border-slate-600/80 flex flex-col items-center justify-center text-slate-400 shrink-0 bg-slate-900/60">
                            <ImageIcon className="w-6 h-6 mb-1 text-[#1D9BB5]" />
                            <span className="text-[10px] font-semibold text-slate-400">No Photo</span>
                          </div>
                        )}

                        <div className="flex-1 space-y-2 w-full">
                          <label className="cursor-pointer inline-flex items-center justify-center gap-2 w-full px-3 py-2.5 rounded-xl bg-[#1D9BB5]/20 hover:bg-[#1D9BB5]/30 text-[#1D9BB5] border border-[#1D9BB5]/50 text-xs font-bold transition-all shadow-sm">
                            <Upload className="w-4 h-4" />
                            <span>{uploadingImage ? 'Processing File...' : 'Choose Image / Upload Photo'}</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleFileUpload(e, 'image_url')}
                              className="hidden"
                              disabled={uploadingImage}
                            />
                          </label>

                          <input
                            type="url"
                            value={editingPart.image_url || ''}
                            onChange={(e) => setEditingPart({ ...editingPart, image_url: e.target.value })}
                            placeholder="Or paste image URL (https://...)"
                            className={`w-full px-3 py-1.5 rounded-xl text-xs border ${
                              isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300'
                            }`}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <button
                      type="submit"
                      className="flex-1 bg-[#1D9BB5] text-white font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-1"
                    >
                      <Save className="w-4 h-4" /> Save Part
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingPart(null)}
                      className="px-4 py-3 rounded-xl border border-slate-700 text-xs font-bold"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};
