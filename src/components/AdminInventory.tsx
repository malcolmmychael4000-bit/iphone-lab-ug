import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Package,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Smartphone,
  Battery,
  Layers,
  Box,
  Camera,
  Shield,
  Zap,
  TrendingUp,
  DollarSign,
  Clock,
  RefreshCw,
  X,
  Save,
  Upload,
  Image as ImageIcon,
  Download,
  FileUp,
  HardDrive,
  Check,
} from 'lucide-react';
import { PartProduct } from '../types';
import { formatUGX } from '../utils/format';
import { saveStoredParts, getStoredParts, sanitizeImageUrl } from '../utils/catalogStorage';

interface AdminInventoryProps {
  isDarkMode: boolean;
  parts: PartProduct[];
  onUpdatePart: (part: PartProduct) => void;
  onAddPart: (part: Omit<PartProduct, 'id'>) => void;
  onDeletePart: (partId: string) => void;
  onRefreshData?: () => void;
}

export const AdminInventory: React.FC<AdminInventoryProps> = ({
  isDarkMode,
  parts,
  onUpdatePart,
  onAddPart,
  onDeletePart,
  onRefreshData,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [filterStockStatus, setFilterStockStatus] = useState<string>('All');

  // Modals & Backup States
  const [editingPart, setEditingPart] = useState<PartProduct | null>(null);
  const [isAddingPart, setIsAddingPart] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const importFileRef = useRef<HTMLInputElement>(null);

  // Auto-backup catalog to localStorage whenever parts change
  useEffect(() => {
    if (parts && parts.length > 0) {
      try {
        localStorage.setItem('iphone_lab_parts_local_backup', JSON.stringify(parts));
        localStorage.setItem('iphone_lab_parts_backup_timestamp', new Date().toISOString());
      } catch (e) {
        console.warn('LocalStorage backup quota reached:', e);
      }
    }
  }, [parts]);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setFeedbackMsg({ text, type });
    setTimeout(() => {
      setFeedbackMsg(null);
    }, 4500);
  };

  // Export full inventory backup to .json file
  const handleExportBackup = () => {
    try {
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify({
        exportedAt: new Date().toISOString(),
        shop: 'Shop PB86, Pioneer Mall Kampala - iPhone Lab UG',
        totalItems: parts.length,
        parts: parts,
      }, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `iphone_lab_parts_backup_${new Date().toISOString().slice(0, 10)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      showToast(`Exported ${parts.length} inventory products & screen PNGs successfully!`);
    } catch (err: any) {
      showToast('Export failed: ' + (err.message || 'Unknown error'), 'error');
    }
  };

  // Restore inventory from imported .json file
  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const content = ev.target?.result as string;
        const parsed = JSON.parse(content);
        const importedParts: PartProduct[] = Array.isArray(parsed) ? parsed : (parsed.parts || []);

        if (!Array.isArray(importedParts) || importedParts.length === 0) {
          showToast('Invalid backup file. No parts array found.', 'error');
          return;
        }

        const token = localStorage.getItem('iphone_lab_admin_token') || '';
        const res = await fetch('/api/admin/restore-inventory', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ parts: importedParts }),
        });

        if (res.ok) {
          saveStoredParts(importedParts);
          showToast(`Successfully restored ${importedParts.length} products & screen PNGs!`);
          if (onRefreshData) onRefreshData();
        } else {
          // Client fallback: apply to state directly
          saveStoredParts(importedParts);
          importedParts.forEach((p) => onUpdatePart(p));
          showToast(`Restored ${importedParts.length} products to active session!`);
        }
      } catch (err: any) {
        showToast('Error reading backup file: ' + (err.message || 'Invalid JSON'), 'error');
      } finally {
        if (importFileRef.current) importFileRef.current.value = '';
      }
    };
    reader.readAsText(file);
  };

  // Restore from browser cache / localStorage
  const handleRestoreFromLocal = async () => {
    try {
      const raw = localStorage.getItem('iphone_lab_parts_local_backup');
      if (!raw) {
        showToast('No local backup found in this browser.', 'error');
        return;
      }
      const cachedParts: PartProduct[] = JSON.parse(raw);
      if (!Array.isArray(cachedParts) || cachedParts.length === 0) {
        showToast('Local backup is empty.', 'error');
        return;
      }

      saveStoredParts(cachedParts);
      const token = localStorage.getItem('iphone_lab_admin_token') || '';
      const res = await fetch('/api/admin/restore-inventory', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ parts: cachedParts }),
      });

      if (res.ok) {
        showToast(`Recovered ${cachedParts.length} products & screen PNGs from browser backup!`);
        if (onRefreshData) onRefreshData();
      } else {
        cachedParts.forEach((p) => onUpdatePart(p));
        showToast(`Recovered ${cachedParts.length} products to active view!`);
      }
    } catch (err: any) {
      showToast('Recovery failed: ' + (err.message || 'Error'), 'error');
    }
  };

  // Form states
  const [partForm, setPartForm] = useState<{
    name: string;
    category: 'Screens' | 'Batteries' | 'Back Glasses' | 'Housings' | 'Camera Glasses' | 'Screen Guards' | 'Accessories';
    subCategory?: string;
    screenTier?: string;
    incellPriceUGX?: number;
    oledPriceUGX?: number;
    oemPriceUGX?: number;
    priceUGX: number;
    stockStatus: 'In Stock' | 'Low Stock' | 'Out of Stock';
    compatibilityRange: string;
    description: string;
    imageUrl?: string;
    incellImageUrl?: string;
    oledImageUrl?: string;
  }>({
    name: '',
    category: 'Screens',
    stockStatus: 'In Stock',
    priceUGX: 100000,
    compatibilityRange: 'iPhone 11 - 15 Pro Max',
    description: '',
    imageUrl: '',
    incellImageUrl: '',
    oledImageUrl: '',
  });

  // Calculate Metrics
  const metrics = useMemo(() => {
    const totalItems = parts.length;
    const inStock = parts.filter((p) => p.stockStatus === 'In Stock').length;
    const lowStock = parts.filter((p) => p.stockStatus === 'Low Stock').length;
    const outOfStock = parts.filter((p) => p.stockStatus === 'Out of Stock').length;

    const totalValuation = parts.reduce((acc, p) => acc + (p.priceUGX || p.oledPriceUGX || 100000), 0);

    // Category breakdown
    const categories = ['Screens', 'Batteries', 'Housings', 'Camera Glasses', 'Screen Guards', 'Back Glasses', 'Accessories'];
    const categoryStats = categories.map((cat) => {
      const catParts = parts.filter((p) => p.category === cat);
      const catInStock = catParts.filter((p) => p.stockStatus === 'In Stock').length;
      const catLowStock = catParts.filter((p) => p.stockStatus === 'Low Stock').length;
      const catOutOfStock = catParts.filter((p) => p.stockStatus === 'Out of Stock').length;
      return {
        category: cat,
        total: catParts.length,
        inStock: catInStock,
        lowStock: catLowStock,
        outOfStock: catOutOfStock,
      };
    });

    return {
      totalItems,
      inStock,
      lowStock,
      outOfStock,
      totalValuation,
      categoryStats,
    };
  }, [parts]);

  // Category ordering helper
  const CATEGORY_ORDER: string[] = [
    'Screens',
    'Batteries',
    'Back Glasses',
    'Housings',
    'Camera Glasses',
    'Screen Guards',
    'Accessories',
  ];

  const getCategoryIndex = (category: string) => {
    const idx = CATEGORY_ORDER.indexOf(category);
    return idx !== -1 ? idx : 999;
  };

  // Screen ordering helper
  const getScreenOrderIndex = (partName: string) => {
    const order = [
      'iPhone X Screen',
      'iPhone XS Screen',
      'iPhone XS Max Screen',
      'iPhone XR Screen',
      'iPhone 11 Screen',
      'iPhone 11 Pro Screen',
      'iPhone 11 Pro Max Screen',
      'iPhone 12 & 12 Pro Screen',
      'iPhone 12 Mini Screen',
      'iPhone 12 Pro Max Screen',
      'iPhone 13 Screen',
      'iPhone 13 Mini Screen',
      'iPhone 13 Pro Screen',
      'iPhone 13 Pro Max Screen',
      'iPhone 14 Screen',
      'iPhone 14 Plus Screen',
      'iPhone 14 Pro Screen',
      'iPhone 14 Pro Max Screen',
      'iPhone 15 Screen',
      'iPhone 15 Plus Screen',
      'iPhone 15 Pro Screen',
      'iPhone 15 Pro Max Screen',
      'iPhone 16 Screen',
      'iPhone 16 Pro Screen',
      'iPhone 16 Pro Max Screen',
      'iPhone 17 Pro Screen',
      'iPhone 17 Pro Max Screen',
    ];
    const index = order.indexOf(partName);
    return index !== -1 ? index : 999;
  };

  // Battery ordering helper
  const getBatteryOrderIndex = (partName: string) => {
    const order = [
      'iPhone X Battery',
      'iPhone XS Battery',
      'iPhone XR Battery',
      'iPhone XS Max Battery',
      'iPhone 11 Battery',
      'iPhone 11 Pro Battery',
      'iPhone 11 Pro Max Battery',
      'iPhone 12 & 12 Pro Battery',
      'iPhone 12 Mini Battery',
      'iPhone 12 Pro Max Battery',
      'iPhone 13 Battery',
      'iPhone 13 Mini Battery',
      'iPhone 13 Pro Battery',
      'iPhone 13 Pro Max Battery',
      'iPhone 14 Battery',
      'iPhone 14 Pro Battery',
      'iPhone 14 Plus Battery',
      'iPhone 14 Pro Max Battery',
      'iPhone 15 Battery',
      'iPhone 15 Pro Battery',
      'iPhone 15 Plus Battery',
      'iPhone 15 Pro Max Battery',
      'iPhone 16 Battery',
      'iPhone 16 Plus Battery',
      'iPhone 16 Pro Battery',
      'iPhone 16 Pro Max Battery',
    ];
    const index = order.indexOf(partName);
    return index !== -1 ? index : 999;
  };

  const getModelScore = (part: PartProduct): number => {
    if (part.category === 'Screens') return getScreenOrderIndex(part.name);
    if (part.category === 'Batteries') return getBatteryOrderIndex(part.name);

    const text = (part.name + ' ' + part.compatibilityRange).toLowerCase();
    if (text.includes('17')) return 170;
    if (text.includes('16')) return 160;
    if (text.includes('15')) return 150;
    if (text.includes('14')) return 140;
    if (text.includes('13')) return 130;
    if (text.includes('12')) return 120;
    if (text.includes('11')) return 110;
    if (text.includes('xs') || text.includes('xr') || /\bx\b/.test(text)) return 100;
    return 999;
  };

  // Filtered Parts list
  const filteredParts = useMemo(() => {
    return parts
      .filter((p) => {
        const matchesSearch =
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.compatibilityRange.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.category.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
        const matchesStock = filterStockStatus === 'All' || p.stockStatus === filterStockStatus;

        return matchesSearch && matchesCategory && matchesStock;
      })
      .sort((a, b) => {
        const catDiff = getCategoryIndex(a.category) - getCategoryIndex(b.category);
        if (catDiff !== 0) return catDiff;

        return getModelScore(a) - getModelScore(b);
      });
  }, [parts, searchQuery, selectedCategory, filterStockStatus]);

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    fieldKey: 'imageUrl' | 'incellImageUrl' | 'oledImageUrl' = 'imageUrl'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 25 * 1024 * 1024) {
      alert('Image file is too large. Please select an image or PNG smaller than 25MB.');
      return;
    }

    setIsUploadingImage(true);
    try {
      const isPng = file.type === 'image/png' || file.name.toLowerCase().endsWith('.png');
      const base64Data = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (ev) => {
          const rawUrl = ev.target?.result as string;
          if (!rawUrl) return resolve('');
          const img = new Image();
          img.onload = () => {
            const maxDim = 640;
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
              // Retain transparency for PNG screen photos
              ctx.clearRect(0, 0, width, height);
              ctx.drawImage(img, 0, 0, width, height);
              try {
                const webp = canvas.toDataURL('image/webp', 0.90);
                if (webp && webp.startsWith('data:image/webp') && webp.length < 500000) {
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

      if (!base64Data) {
        setIsUploadingImage(false);
        return;
      }

      // Upload to server if available, otherwise use preserved optimized data URL
      let permanentUrl = base64Data;
      try {
        const token = localStorage.getItem('iphone_lab_admin_token') || '';
        const res = await fetch('/api/admin/upload-image', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ imageBase64: base64Data, filename: file.name }),
        });
        const contentType = res.headers.get('content-type') || '';
        if (res.ok && contentType.includes('application/json')) {
          const data = await res.json();
          if (data.image_url && typeof data.image_url === 'string') {
            permanentUrl = data.image_url;
          }
        }
      } catch (uploadErr) {
        console.warn('Server image upload fallback to data URL:', uploadErr);
      }

      setPartForm((prev) => ({
        ...prev,
        [fieldKey]: permanentUrl,
        imageUrl: fieldKey === 'imageUrl' ? permanentUrl : (prev.imageUrl || permanentUrl),
      }));
    } catch (err) {
      console.error('File compression error:', err);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleOpenAddModal = () => {
    setPartForm({
      name: '',
      category: 'Screens',
      stockStatus: 'In Stock',
      priceUGX: 120000,
      compatibilityRange: 'iPhone X - 16 Pro Max',
      description: 'Genuine quality replacement part tested at Shop PB86 laboratory.',
      imageUrl: '',
      incellImageUrl: '',
      oledImageUrl: '',
    });
    setIsAddingPart(true);
  };

  const handleOpenEditModal = (part: PartProduct) => {
    const isScreen = part.category === 'Screens';
    const incellImg = part.incellImageUrl || part.incell_image_url || (isScreen && part.screenTier === 'Incell' ? (part.imageUrl || part.image_url) : '') || '';
    const oledImg = part.oledImageUrl || part.oled_image_url || (isScreen && part.screenTier === 'OLED' ? (part.imageUrl || part.image_url) : '') || '';

    setEditingPart(part);
    setPartForm({
      name: part.name,
      category: part.category,
      subCategory: part.subCategory,
      screenTier: part.screenTier,
      incellPriceUGX: part.incellPriceUGX,
      oledPriceUGX: part.oledPriceUGX,
      oemPriceUGX: part.oemPriceUGX,
      priceUGX: part.priceUGX,
      stockStatus: part.stockStatus,
      compatibilityRange: part.compatibilityRange,
      description: part.description || '',
      imageUrl: isScreen ? (oledImg || incellImg) : (part.imageUrl || part.image_url || ''),
      incellImageUrl: incellImg,
      oledImageUrl: oledImg,
    });
  };

  const handleSavePart = () => {
    if (!partForm.name.trim()) return;

    const isScreen = partForm.category === 'Screens';
    const incellImg = isScreen ? (partForm.incellImageUrl || '') : '';
    const oledImg = isScreen ? (partForm.oledImageUrl || '') : '';
    const primaryImg = isScreen ? (oledImg || incellImg) : (partForm.imageUrl || '');

    const updatedForm = {
      ...partForm,
      imageUrl: primaryImg,
      image_url: primaryImg,
      incellImageUrl: incellImg,
      incell_image_url: incellImg,
      oledImageUrl: oledImg,
      oled_image_url: oledImg,
    };

    if (editingPart) {
      onUpdatePart({
        ...editingPart,
        ...updatedForm,
      });
      setEditingPart(null);
    } else {
      onAddPart(updatedForm);
      setIsAddingPart(false);
    }
  };

  const handleQuickStatusChange = (part: PartProduct, newStatus: 'In Stock' | 'Low Stock' | 'Out of Stock') => {
    onUpdatePart({
      ...part,
      stockStatus: newStatus,
    });
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Screens':
        return <Smartphone className="w-4 h-4 text-[#1D9BB5]" />;
      case 'Batteries':
        return <Battery className="w-4 h-4 text-emerald-400" />;
      case 'Back Glasses':
        return <Layers className="w-4 h-4 text-indigo-400" />;
      case 'Housings':
        return <Box className="w-4 h-4 text-amber-400" />;
      case 'Camera Glasses':
        return <Camera className="w-4 h-4 text-purple-400" />;
      case 'Screen Guards':
        return <Shield className="w-4 h-4 text-cyan-400" />;
      default:
        return <Zap className="w-4 h-4 text-[#D4A017]" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Feedback Toast */}
      {feedbackMsg && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className={`p-3.5 rounded-xl border text-xs font-bold flex items-center justify-between gap-3 shadow-lg ${
            feedbackMsg.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedbackMsg.type === 'success' ? <Check className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
            <span>{feedbackMsg.text}</span>
          </div>
          <button onClick={() => setFeedbackMsg(null)} className="p-1 hover:bg-white/10 rounded-lg">
            <X className="w-3.5 h-3.5" />
          </button>
        </motion.div>
      )}

      {/* Catalog & Screen PNG Persistence Protection Bar */}
      <div className={`p-4 rounded-2xl border flex flex-col md:flex-row items-center justify-between gap-4 ${
        isDarkMode ? 'bg-[#1D9BB5]/5 border-[#1D9BB5]/20' : 'bg-[#1D9BB5]/10 border-[#1D9BB5]/30'
      }`}>
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#1D9BB5]/20 text-[#1D9BB5] shrink-0">
            <HardDrive className="w-5 h-5" />
          </div>
          <div>
            <div className={`text-xs font-extrabold flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              <span>Image & Inventory Persistence Safeguard</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-black">
                {parts.length} Items Protected
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Screen PNGs and custom parts are saved to disk, Supabase & local browser cache. Export a backup anytime.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
          {/* Hidden file input for import */}
          <input
            type="file"
            ref={importFileRef}
            onChange={handleImportBackup}
            accept=".json"
            className="hidden"
          />

          {/* Export JSON */}
          <button
            onClick={handleExportBackup}
            className={`px-3 py-2 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition-all ${
              isDarkMode ? 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-200' : 'bg-white hover:bg-slate-50 border-slate-300 text-slate-800'
            }`}
            title="Download full JSON backup of all items and images"
          >
            <Download className="w-3.5 h-3.5 text-[#1D9BB5]" />
            <span>Export Backup</span>
          </button>

          {/* Import JSON */}
          <button
            onClick={() => importFileRef.current?.click()}
            className={`px-3 py-2 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition-all ${
              isDarkMode ? 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-200' : 'bg-white hover:bg-slate-50 border-slate-300 text-slate-800'
            }`}
            title="Restore catalog from a saved JSON backup file"
          >
            <FileUp className="w-3.5 h-3.5 text-amber-400" />
            <span>Import Backup</span>
          </button>

          {/* Restore Local */}
          <button
            onClick={handleRestoreFromLocal}
            className={`px-3 py-2 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition-all ${
              isDarkMode ? 'bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/30 text-emerald-400' : 'bg-emerald-50 hover:bg-emerald-100 border-emerald-300 text-emerald-700'
            }`}
            title="Restore immediately from local browser cache if server was restarted"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Restore Local Backup</span>
          </button>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1D9BB5]/20 text-[#1D9BB5] text-xs font-bold uppercase tracking-wider mb-2">
            <Package className="w-3.5 h-3.5" />
            Shop PB86 Real-Time Inventory
          </div>
          <h2 className={`text-2xl sm:text-3xl font-extrabold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            Inventory Monitoring Dashboard
          </h2>
          <p className={`text-xs sm:text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
            Monitor stock levels for iPhone screens, batteries, housings, camera glasses & accessories.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {onRefreshData && (
            <button
              onClick={onRefreshData}
              className={`p-3 rounded-xl border font-bold text-xs flex items-center gap-2 transition-all ${
                isDarkMode ? 'bg-white/5 border-white/10 hover:bg-white/10 text-slate-200' : 'bg-white border-slate-300 hover:bg-slate-100 text-slate-800'
              }`}
            >
              <RefreshCw className="w-4 h-4 text-[#1D9BB5]" />
              <span className="hidden sm:inline">Refresh Sync</span>
            </button>
          )}

          <button
            onClick={handleOpenAddModal}
            className="glow-btn text-white font-extrabold py-3 px-5 rounded-xl text-xs flex items-center gap-2 shadow-lg"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Part</span>
          </button>
        </div>
      </div>

      {/* Quick Metrics Bar (4 Responsive Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Catalog Items */}
        <div className={`p-5 rounded-2xl border transition-all ${
          isDarkMode ? 'glass-card-dark' : 'glass-card-light'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className={`text-xs font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Total Inventory Items</span>
            <div className="p-2 rounded-xl bg-[#1D9BB5]/10 text-[#1D9BB5]">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className={`text-2xl sm:text-3xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            {metrics.totalItems} <span className="text-xs font-normal text-slate-400">Products</span>
          </div>
          <div className="text-[11px] text-[#1D9BB5] font-semibold mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            Active in Shop PB86 Catalog
          </div>
        </div>

        {/* Metric 2: Real-time In Stock Items */}
        <div className={`p-5 rounded-2xl border transition-all ${
          isDarkMode ? 'glass-card-dark' : 'glass-card-light'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className={`text-xs font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Fully Stocked Parts</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-400">
            {metrics.inStock} <span className="text-xs font-normal text-slate-400">Available</span>
          </div>
          <div className="text-[11px] text-emerald-500 font-semibold mt-1">
            Ready for instant repair & sale
          </div>
        </div>

        {/* Metric 3: Low & Out of Stock Alerts */}
        <div className={`p-5 rounded-2xl border transition-all ${
          isDarkMode ? 'glass-card-dark' : 'glass-card-light'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className={`text-xs font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Low Stock Alerts</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-400">
            {metrics.lowStock + metrics.outOfStock} <span className="text-xs font-normal text-slate-400">Alerts</span>
          </div>
          <div className="text-[11px] text-amber-500 font-semibold mt-1">
            {metrics.lowStock} Low Stock • {metrics.outOfStock} Out of Stock
          </div>
        </div>

        {/* Metric 4: Estimated Inventory Value */}
        <div className={`p-5 rounded-2xl border transition-all ${
          isDarkMode ? 'glass-card-dark' : 'glass-card-light'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className={`text-xs font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Inventory Stock Value</span>
            <div className="p-2 rounded-xl bg-[#D4A017]/10 text-[#D4A017]">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className={`text-2xl sm:text-3xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            {formatUGX(metrics.totalValuation)}
          </div>
          <div className="text-[11px] text-[#D4A017] font-semibold mt-1">
            Retail parts value in store
          </div>
        </div>
      </div>

      {/* Real-time Category Stock Level Progress Indicators */}
      <div className={`p-6 rounded-2xl border ${isDarkMode ? 'glass-card-dark' : 'glass-card-light'}`}>
        <h3 className={`text-base font-extrabold mb-4 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
          Real-Time Category Stock Breakdown
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.categoryStats.map((stat) => {
            const inStockPct = stat.total > 0 ? Math.round((stat.inStock / stat.total) * 100) : 0;
            return (
              <div
                key={stat.category}
                className={`p-3.5 rounded-xl border ${
                  isDarkMode ? 'bg-white/5 border-white/10' : 'bg-slate-100/80 border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs font-bold flex items-center gap-1.5 ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                    {getCategoryIcon(stat.category)}
                    {stat.category}
                  </span>
                  <span className="text-[11px] font-black text-[#1D9BB5]">
                    {stat.total} items
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-700/30 rounded-full h-2 overflow-hidden mb-2">
                  <div
                    className={`h-full transition-all duration-500 ${
                      inStockPct > 70 ? 'bg-emerald-400' : inStockPct > 30 ? 'bg-amber-400' : 'bg-rose-500'
                    }`}
                    style={{ width: `${inStockPct}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[10px] font-semibold text-slate-400">
                  <span className="text-emerald-400">{stat.inStock} In Stock</span>
                  <span className="text-amber-400">{stat.lowStock} Low</span>
                  <span className="text-rose-400">{stat.outOfStock} Out</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filters & Search Control Bar */}
      <div className={`p-5 rounded-2xl border flex flex-col md:flex-row items-center justify-between gap-4 ${
        isDarkMode ? 'glass-card-dark' : 'glass-card-light'
      }`}>
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search part name, model or range..."
            className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-xs font-medium border focus:outline-none focus:border-[#1D9BB5] ${
              isDarkMode ? 'bg-black/40 border-white/10 text-white placeholder-slate-500' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
            }`}
          />
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
          {['All', 'Screens', 'Batteries', 'Housings', 'Camera Glasses', 'Screen Guards', 'Back Glasses', 'Accessories'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-[#1D9BB5] text-white shadow-md'
                  : isDarkMode
                  ? 'bg-white/5 hover:bg-white/10 text-slate-300'
                  : 'bg-slate-200/80 hover:bg-slate-300 text-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Stock Filter Dropdown */}
        <div className="flex items-center gap-2 shrink-0">
          <Filter className="w-4 h-4 text-[#1D9BB5]" />
          <select
            value={filterStockStatus}
            onChange={(e) => setFilterStockStatus(e.target.value)}
            className={`px-3 py-2 rounded-xl text-xs font-bold border focus:outline-none focus:border-[#1D9BB5] ${
              isDarkMode ? 'bg-slate-800 border-white/10 text-white' : 'bg-white border-slate-300 text-slate-900'
            }`}
          >
            <option value="All">All Statuses</option>
            <option value="In Stock">In Stock Only</option>
            <option value="Low Stock">Low Stock Only</option>
            <option value="Out of Stock">Out of Stock Only</option>
          </select>
        </div>
      </div>

      {/* Parts Table */}
      <div className={`rounded-2xl border overflow-hidden ${isDarkMode ? 'glass-card-dark' : 'glass-card-light'}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={`border-b text-xs font-extrabold uppercase tracking-wider ${
                isDarkMode ? 'border-white/10 bg-white/5 text-slate-300' : 'border-slate-200 bg-slate-100 text-slate-700'
              }`}>
                <th className="py-3.5 px-4">Part / Product</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Compatibility</th>
                <th className="py-3.5 px-4">Pricing (UGX)</th>
                <th className="py-3.5 px-4">Stock Status</th>
                <th className="py-3.5 px-4 text-right">Quick Actions</th>
              </tr>
            </thead>
            <tbody className={`divide-y text-xs font-medium ${isDarkMode ? 'divide-white/10' : 'divide-slate-200'}`}>
              {filteredParts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No matching parts found in Shop PB86 inventory.
                  </td>
                </tr>
              ) : (
                filteredParts.map((part) => (
                  <tr key={part.id} className={`hover:bg-white/5 transition-colors ${
                    isDarkMode ? 'text-slate-200' : 'text-slate-900'
                  }`}>
                    {/* Name & Thumbnail */}
                    <td className="py-4 px-4 font-bold">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center shrink-0 border ${
                          isDarkMode ? 'bg-white/5 border-white/10' : 'bg-slate-100 border-slate-300'
                        }`}>
                          {(() => {
                            const rawSrc = part.imageUrl || part.image_url || part.oledImageUrl || part.oled_image_url || part.incellImageUrl || part.incell_image_url;
                            const safeSrc = sanitizeImageUrl(rawSrc, part.id, 'main');
                            return safeSrc ? (
                              <img
                                src={safeSrc}
                                alt={part.name}
                                width="40"
                                height="40"
                                loading="lazy"
                                decoding="async"
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                            ) : (
                              getCategoryIcon(part.category)
                            );
                          })()}
                        </div>
                        <div>
                          <div className={`font-extrabold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{part.name}</div>
                          {part.subCategory && <div className="text-[10px] text-slate-400">{part.subCategory}</div>}
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#1D9BB5]/10 text-[#1D9BB5] font-bold">
                        {part.category}
                      </span>
                    </td>

                    {/* Compatibility */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-lg border text-[11px] font-semibold ${
                        isDarkMode ? 'bg-white/5 border-white/10 text-slate-300' : 'bg-slate-100 border-slate-300 text-slate-800'
                      }`}>
                        {part.compatibilityRange}
                      </span>
                    </td>

                    {/* Pricing */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      {part.category === 'Screens' ? (
                        <div className="space-y-0.5 text-[11px]">
                          {part.incellPriceUGX && <div>InCell: <span className="font-bold text-[#1D9BB5]">{formatUGX(part.incellPriceUGX)}</span></div>}
                          {part.oledPriceUGX && <div>OLED: <span className="font-bold text-[#1D9BB5]">{formatUGX(part.oledPriceUGX)}</span></div>}
                          {part.oemPriceUGX && <div>OEM: <span className="font-bold text-[#D4A017]">{formatUGX(part.oemPriceUGX)}</span></div>}
                        </div>
                      ) : (
                        <span className="font-bold text-[#1D9BB5]">{formatUGX(part.priceUGX || part.oledPriceUGX || 0)}</span>
                      )}
                    </td>

                    {/* Stock Status Selector */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleQuickStatusChange(part, 'In Stock')}
                          className={`px-2 py-1 rounded-lg text-[10px] font-extrabold transition-all ${
                            part.stockStatus === 'In Stock'
                              ? 'bg-emerald-500 text-white shadow-sm'
                              : isDarkMode ? 'bg-white/5 text-slate-400 hover:text-white' : 'bg-slate-200 text-slate-600'
                          }`}
                          title="Mark In Stock"
                        >
                          In Stock
                        </button>

                        <button
                          onClick={() => handleQuickStatusChange(part, 'Low Stock')}
                          className={`px-2 py-1 rounded-lg text-[10px] font-extrabold transition-all ${
                            part.stockStatus === 'Low Stock'
                              ? 'bg-amber-500 text-white shadow-sm'
                              : isDarkMode ? 'bg-white/5 text-slate-400 hover:text-white' : 'bg-slate-200 text-slate-600'
                          }`}
                          title="Mark Low Stock"
                        >
                          Low
                        </button>

                        <button
                          onClick={() => handleQuickStatusChange(part, 'Out of Stock')}
                          className={`px-2 py-1 rounded-lg text-[10px] font-extrabold transition-all ${
                            part.stockStatus === 'Out of Stock'
                              ? 'bg-rose-600 text-white shadow-sm'
                              : isDarkMode ? 'bg-white/5 text-slate-400 hover:text-white' : 'bg-slate-200 text-slate-600'
                          }`}
                          title="Mark Out of Stock"
                        >
                          Out
                        </button>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEditModal(part)}
                          className="p-2 rounded-lg bg-[#1D9BB5]/10 hover:bg-[#1D9BB5] text-[#1D9BB5] hover:text-white transition-all"
                          title="Edit Part"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => onDeletePart(part.id)}
                          className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-600 text-rose-500 hover:text-white transition-all"
                          title="Delete Part"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Part Modal */}
      <AnimatePresence>
        {(isAddingPart || editingPart) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`relative w-full max-w-xl rounded-3xl p-6 sm:p-8 border shadow-2xl ${
                isDarkMode ? 'glass-card-dark text-white' : 'glass-card-light text-slate-900'
              }`}
            >
              <button
                onClick={() => {
                  setIsAddingPart(false);
                  setEditingPart(null);
                }}
                className="absolute top-5 right-5 p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-xl font-extrabold mb-1">
                {editingPart ? 'Edit Inventory Item' : 'Add New Inventory Part'}
              </h3>
              <p className="text-xs text-slate-400 mb-6">
                Shop PB86, New Pioneer Mall real-time stock register.
              </p>

              <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                <div>
                  <label className="block text-xs font-extrabold uppercase mb-1">Part Name</label>
                  <input
                    type="text"
                    value={partForm.name}
                    onChange={(e) => setPartForm({ ...partForm, name: e.target.value })}
                    placeholder="e.g. iPhone 15 Pro OEM Display Screen"
                    className={`w-full p-3 rounded-xl text-xs font-bold border focus:outline-none focus:border-[#1D9BB5] ${
                      isDarkMode ? 'bg-black/40 border-white/10 text-white' : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-extrabold uppercase mb-1">Category</label>
                    <select
                      value={partForm.category}
                      onChange={(e) =>
                        setPartForm({
                          ...partForm,
                          category: e.target.value as any,
                        })
                      }
                      className={`w-full p-3 rounded-xl text-xs font-bold border focus:outline-none focus:border-[#1D9BB5] ${
                        isDarkMode ? 'bg-black/40 border-white/10 text-white' : 'bg-white border-slate-300 text-slate-900'
                      }`}
                    >
                      <option value="Screens">Screens</option>
                      <option value="Batteries">Batteries</option>
                      <option value="Back Glasses">Back Glasses</option>
                      <option value="Housings">Full Housings</option>
                      <option value="Camera Glasses">Camera Glasses</option>
                      <option value="Screen Guards">Screen Guards</option>
                      <option value="Accessories">Accessories</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold uppercase mb-1">Stock Status</label>
                    <select
                      value={partForm.stockStatus}
                      onChange={(e) =>
                        setPartForm({
                          ...partForm,
                          stockStatus: e.target.value as any,
                        })
                      }
                      className={`w-full p-3 rounded-xl text-xs font-bold border focus:outline-none focus:border-[#1D9BB5] ${
                        isDarkMode ? 'bg-black/40 border-white/10 text-white' : 'bg-white border-slate-300 text-slate-900'
                      }`}
                    >
                      <option value="In Stock">In Stock</option>
                      <option value="Low Stock">Low Stock</option>
                      <option value="Out of Stock">Out of Stock</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-extrabold uppercase mb-1">Compatibility Range</label>
                  <input
                    type="text"
                    value={partForm.compatibilityRange}
                    onChange={(e) => setPartForm({ ...partForm, compatibilityRange: e.target.value })}
                    placeholder="e.g. iPhone 13 / 13 Pro / 14"
                    className={`w-full p-3 rounded-xl text-xs font-bold border focus:outline-none focus:border-[#1D9BB5] ${
                      isDarkMode ? 'bg-black/40 border-white/10 text-white' : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  />
                </div>

                {partForm.category === 'Screens' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                    <div>
                      <label className="block text-[10px] font-bold uppercase mb-1">InCell (UGX)</label>
                      <input
                        type="number"
                        value={partForm.incellPriceUGX || ''}
                        onChange={(e) => setPartForm({ ...partForm, incellPriceUGX: Number(e.target.value) })}
                        placeholder="120000"
                        className={`w-full p-2 rounded-lg text-xs font-bold border ${
                          isDarkMode ? 'bg-black/40 border-white/10 text-white' : 'bg-white border-slate-300 text-slate-900'
                        }`}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase mb-1">OLED (UGX)</label>
                      <input
                        type="number"
                        value={partForm.oledPriceUGX || ''}
                        onChange={(e) => setPartForm({ ...partForm, oledPriceUGX: Number(e.target.value) })}
                        placeholder="220000"
                        className={`w-full p-2 rounded-lg text-xs font-bold border ${
                          isDarkMode ? 'bg-black/40 border-white/10 text-white' : 'bg-white border-slate-300 text-slate-900'
                        }`}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase mb-1">OEM (UGX)</label>
                      <input
                        type="number"
                        value={partForm.oemPriceUGX || ''}
                        onChange={(e) => setPartForm({ ...partForm, oemPriceUGX: Number(e.target.value) })}
                        placeholder="350000"
                        className={`w-full p-2 rounded-lg text-xs font-bold border ${
                          isDarkMode ? 'bg-black/40 border-white/10 text-white' : 'bg-white border-slate-300 text-slate-900'
                        }`}
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-extrabold uppercase mb-1">Price (UGX)</label>
                    <input
                      type="number"
                      value={partForm.priceUGX}
                      onChange={(e) => setPartForm({ ...partForm, priceUGX: Number(e.target.value) })}
                      placeholder="100000"
                      className={`w-full p-3 rounded-xl text-xs font-bold border focus:outline-none focus:border-[#1D9BB5] ${
                        isDarkMode ? 'bg-black/40 border-white/10 text-white' : 'bg-white border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>
                )}

                {/* Product Photos Upload Section */}
                {partForm.category === 'Screens' ? (
                  <div className={`p-4 rounded-2xl border space-y-4 ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'}`}>
                    <div>
                      <label className="block text-xs font-extrabold uppercase flex items-center justify-between text-[#1D9BB5] mb-1">
                        <span className="flex items-center gap-2">
                          <ImageIcon className="w-4 h-4 text-[#1D9BB5]" />
                          <span>Screen Photos (INCELL & OLED Tiers)</span>
                        </span>
                        <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                          Dual Tier Upload Active
                        </span>
                      </label>
                      <p className="text-[11px] text-slate-400 mb-3">
                        Upload distinct PNG photos or device captures for both <span className="text-[#1D9BB5] font-bold">INCELL</span> and <span className="text-cyan-400 font-bold">OLED</span> screen displays.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* 1. INCELL SCREEN PHOTO */}
                      <div className={`p-3 rounded-xl border ${isDarkMode ? 'bg-black/30 border-white/10' : 'bg-white border-slate-200'}`}>
                        <div className="text-xs font-extrabold text-[#1D9BB5] mb-2 flex items-center justify-between">
                          <span>1. INCELL Screen Photo / PNG</span>
                          {partForm.incellImageUrl && (
                            <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Set
                            </span>
                          )}
                        </div>

                        {partForm.incellImageUrl ? (
                          <div className="space-y-2">
                            <div className="relative group rounded-lg overflow-hidden border border-[#1D9BB5]/40 bg-black/40 flex items-center justify-center p-2 h-32">
                              <img
                                src={partForm.incellImageUrl}
                                alt="INCELL Screen preview"
                                width="160"
                                height="120"
                                loading="lazy"
                                decoding="async"
                                className="max-h-28 object-contain rounded"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                              <button
                                type="button"
                                onClick={() => setPartForm({ ...partForm, incellImageUrl: '' })}
                                className="absolute top-1 right-1 p-1 rounded-md bg-rose-600 text-white hover:bg-rose-700 transition-all shadow flex items-center gap-1 text-[9px] font-bold"
                                aria-label="Remove INCELL image"
                              >
                                <X className="w-3 h-3" />
                                <span>Remove</span>
                              </button>
                            </div>
                            <label className="block text-center text-[10px] text-[#1D9BB5] font-bold hover:underline cursor-pointer py-1">
                              Replace INCELL Photo
                              <input
                                type="file"
                                accept="image/png, image/jpeg, image/webp, image/gif, image/svg+xml"
                                onChange={(e) => handleFileUpload(e, 'incellImageUrl')}
                                className="hidden"
                              />
                            </label>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <label className={`flex flex-col items-center justify-center p-3 border border-dashed rounded-lg cursor-pointer transition-all ${
                              isDarkMode
                                ? 'border-white/20 hover:border-[#1D9BB5] bg-black/20 hover:bg-[#1D9BB5]/10'
                                : 'border-slate-300 hover:border-[#1D9BB5] bg-slate-50 hover:bg-slate-100'
                            }`}>
                              <Upload className="w-5 h-5 text-[#1D9BB5] mb-1" />
                              <span className="text-[11px] font-extrabold text-[#1D9BB5]">Upload INCELL Photo</span>
                              <span className="text-[9px] text-slate-400">PNG / JPG from Device</span>
                              <input
                                type="file"
                                accept="image/png, image/jpeg, image/webp, image/gif, image/svg+xml"
                                onChange={(e) => handleFileUpload(e, 'incellImageUrl')}
                                className="hidden"
                              />
                            </label>
                            <input
                              type="url"
                              value={partForm.incellImageUrl || ''}
                              onChange={(e) => setPartForm({ ...partForm, incellImageUrl: e.target.value })}
                              placeholder="Or paste INCELL URL..."
                              className={`w-full p-2 rounded-lg text-[11px] border focus:outline-none focus:border-[#1D9BB5] ${
                                isDarkMode ? 'bg-black/40 border-white/10 text-white' : 'bg-white border-slate-300 text-slate-900'
                              }`}
                            />
                          </div>
                        )}
                      </div>

                      {/* 2. OLED SCREEN PHOTO */}
                      <div className={`p-3 rounded-xl border ${isDarkMode ? 'bg-black/30 border-white/10' : 'bg-white border-slate-200'}`}>
                        <div className="text-xs font-extrabold text-cyan-400 mb-2 flex items-center justify-between">
                          <span>2. OLED Screen Photo / PNG</span>
                          {partForm.oledImageUrl && (
                            <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Set
                            </span>
                          )}
                        </div>

                        {partForm.oledImageUrl ? (
                          <div className="space-y-2">
                            <div className="relative group rounded-lg overflow-hidden border border-cyan-400/40 bg-black/40 flex items-center justify-center p-2 h-32">
                              <img
                                src={partForm.oledImageUrl}
                                alt="OLED Screen preview"
                                width="160"
                                height="120"
                                loading="lazy"
                                decoding="async"
                                className="max-h-28 object-contain rounded"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                              <button
                                type="button"
                                onClick={() => setPartForm({ ...partForm, oledImageUrl: '' })}
                                className="absolute top-1 right-1 p-1 rounded-md bg-rose-600 text-white hover:bg-rose-700 transition-all shadow flex items-center gap-1 text-[9px] font-bold"
                                aria-label="Remove OLED image"
                              >
                                <X className="w-3 h-3" />
                                <span>Remove</span>
                              </button>
                            </div>
                            <label className="block text-center text-[10px] text-cyan-400 font-bold hover:underline cursor-pointer py-1">
                              Replace OLED Photo
                              <input
                                type="file"
                                accept="image/png, image/jpeg, image/webp, image/gif, image/svg+xml"
                                onChange={(e) => handleFileUpload(e, 'oledImageUrl')}
                                className="hidden"
                              />
                            </label>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <label className={`flex flex-col items-center justify-center p-3 border border-dashed rounded-lg cursor-pointer transition-all ${
                              isDarkMode
                                ? 'border-white/20 hover:border-cyan-400 bg-black/20 hover:bg-cyan-400/10'
                                : 'border-slate-300 hover:border-cyan-400 bg-slate-50 hover:bg-slate-100'
                            }`}>
                              <Upload className="w-5 h-5 text-cyan-400 mb-1" />
                              <span className="text-[11px] font-extrabold text-cyan-400">Upload OLED Photo</span>
                              <span className="text-[9px] text-slate-400">PNG / JPG from Device</span>
                              <input
                                type="file"
                                accept="image/png, image/jpeg, image/webp, image/gif, image/svg+xml"
                                onChange={(e) => handleFileUpload(e, 'oledImageUrl')}
                                className="hidden"
                              />
                            </label>
                            <input
                              type="url"
                              value={partForm.oledImageUrl || ''}
                              onChange={(e) => setPartForm({ ...partForm, oledImageUrl: e.target.value })}
                              placeholder="Or paste OLED URL..."
                              className={`w-full p-2 rounded-lg text-[11px] border focus:outline-none focus:border-cyan-400 ${
                                isDarkMode ? 'bg-black/40 border-white/10 text-white' : 'bg-white border-slate-300 text-slate-900'
                              }`}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'}`}>
                    <label className="block text-xs font-extrabold uppercase mb-2 flex items-center gap-2 text-[#1D9BB5]">
                      <ImageIcon className="w-4 h-4" />
                      <span>Product Photo / PNG Image</span>
                    </label>

                    {partForm.imageUrl ? (
                      <div className="space-y-3">
                        <div className="relative group rounded-xl overflow-hidden border border-[#1D9BB5]/40 bg-black/40 flex items-center justify-center p-3 max-h-48">
                          <img
                            src={partForm.imageUrl}
                            alt="Product preview"
                            width="200"
                            height="160"
                            loading="lazy"
                            decoding="async"
                            className="max-h-40 object-contain rounded-lg"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => setPartForm({ ...partForm, imageUrl: '' })}
                            className="absolute top-2 right-2 p-1.5 rounded-lg bg-rose-600 text-white hover:bg-rose-700 transition-all shadow-md flex items-center gap-1 text-[10px] font-bold"
                            title="Remove image"
                            aria-label="Remove image"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Remove</span>
                          </button>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-emerald-400 font-bold px-1">
                          <span className="flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Photo / PNG Attached
                          </span>
                          <label className="text-[#1D9BB5] hover:underline cursor-pointer">
                            Change Photo
                            <input
                              type="file"
                              accept="image/png, image/jpeg, image/webp, image/gif, image/svg+xml"
                              onChange={(e) => handleFileUpload(e, 'imageUrl')}
                              className="hidden"
                            />
                          </label>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {/* Upload Button */}
                        <label className={`flex flex-col items-center justify-center p-5 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
                          isDarkMode
                            ? 'border-white/20 hover:border-[#1D9BB5] bg-black/20 hover:bg-[#1D9BB5]/10'
                            : 'border-slate-300 hover:border-[#1D9BB5] bg-white hover:bg-slate-50'
                        }`}>
                          <Upload className="w-6 h-6 text-[#1D9BB5] mb-2 animate-bounce" />
                          <span className="text-xs font-extrabold text-[#1D9BB5]">Upload PNG or Photo from Device</span>
                          <span className="text-[10px] text-slate-400 mt-1">Supports PNG (transparent), JPG, WEBP up to 5MB</span>
                          <input
                            type="file"
                            accept="image/png, image/jpeg, image/webp, image/gif, image/svg+xml"
                            onChange={(e) => handleFileUpload(e, 'imageUrl')}
                            className="hidden"
                          />
                        </label>

                        {/* Image URL fallback */}
                        <div>
                          <div className="text-[10px] font-bold text-slate-400 mb-1 uppercase">Or Paste Image URL Link</div>
                          <input
                            type="url"
                            value={partForm.imageUrl || ''}
                            onChange={(e) => setPartForm({ ...partForm, imageUrl: e.target.value })}
                            placeholder="https://example.com/images/iphone15-battery.png"
                            className={`w-full p-2.5 rounded-xl text-xs font-bold border focus:outline-none focus:border-[#1D9BB5] ${
                              isDarkMode ? 'bg-black/40 border-white/10 text-white' : 'bg-white border-slate-300 text-slate-900'
                            }`}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-extrabold uppercase mb-1">Description</label>
                  <textarea
                    rows={3}
                    value={partForm.description}
                    onChange={(e) => setPartForm({ ...partForm, description: e.target.value })}
                    className={`w-full p-3 rounded-xl text-xs font-medium border focus:outline-none focus:border-[#1D9BB5] ${
                      isDarkMode ? 'bg-black/40 border-white/10 text-white' : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 mt-6 pt-4 border-t border-white/10">
                <button
                  onClick={handleSavePart}
                  className="flex-1 glow-btn text-white font-extrabold py-3 rounded-xl text-xs flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{editingPart ? 'Save Changes' : 'Add to Inventory'}</span>
                </button>
                <button
                  onClick={() => {
                    setIsAddingPart(false);
                    setEditingPart(null);
                  }}
                  className={`py-3 px-5 rounded-xl text-xs font-extrabold border ${
                    isDarkMode ? 'border-white/10 hover:bg-white/10 text-slate-300' : 'border-slate-300 hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
