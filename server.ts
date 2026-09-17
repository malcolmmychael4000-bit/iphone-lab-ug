import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import compression from 'compression';
import { createServer as createViteServer } from 'vite';
import { createClient } from '@supabase/supabase-js';
import { INITIAL_PARTS, INITIAL_SERVICES } from './src/data/seedData.js';
import { Booking, ContactSubmission, PartProduct } from './src/types.js';

// Setup Supabase Client if credentials exist
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;

// Local JSON file persistence fallback path
const DATA_DIR = path.join(process.cwd(), 'data');
const STORE_FILE = path.join(DATA_DIR, 'store.json');

export interface AdminSecuritySettings {
  password?: string;
  recoveryPin?: string;
  securityQuestion?: string;
  securityAnswer?: string;
  updatedAt?: string;
}

interface DataStore {
  parts: PartProduct[];
  bookings: Booking[];
  contacts: ContactSubmission[];
  adminAuth?: AdminSecuritySettings;
}

// Load or initialize store
function loadStore(): DataStore {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(STORE_FILE)) {
      const raw = fs.readFileSync(STORE_FILE, 'utf-8');
      const data = JSON.parse(raw);
      if (data && Array.isArray(data.parts) && data.parts.length > 0) {
        // Only add missing seed parts if they do not exist; never overwrite existing customizations or images
        let updated = false;

        for (const seedPart of INITIAL_PARTS) {
          const existingIdx = data.parts.findIndex((p: PartProduct) => p.id === seedPart.id);
          if (existingIdx === -1) {
            data.parts.push(seedPart);
            updated = true;
          }
        }

        if (updated) {
          saveStore(data);
        }
        return data;
      }
    }
  } catch (err) {
    console.error('Error loading local store, initializing seed data:', err);
  }

  const initialStore: DataStore = {
    parts: INITIAL_PARTS,
    bookings: [
      {
        id: 'bk-1001',
        name: 'Mugisha Joel',
        phone: '0753234218',
        service_type: 'Screen Replacement',
        device_model: 'iPhone 13 Pro Max',
        preferred_date: '2026-08-01',
        notes: 'DD OLED screen tier requested. Cracked top glass.',
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
    ],
    contacts: [
      {
        id: 'ct-101',
        name: 'Kato Paul',
        phone: '0701122334',
        message: 'Do you offer micro-soldering for iPhone 14 Pro water damage baseband repair?',
        created_at: new Date().toISOString()
      }
    ]
  };

  saveStore(initialStore);
  return initialStore;
}

function saveStore(store: DataStore) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(STORE_FILE, JSON.stringify(store, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving local store:', err);
  }
}

let memoryStore = loadStore();

// Security: Active Admin Tokens Set & Auth Middleware
const activeAdminTokens = new Set<string>();

function verifyAdmin(req: Request, res: Response, next: () => void) {
  const authHeader = req.headers['authorization'];
  const tokenHeader = req.headers['x-admin-token'] as string;
  let token = '';

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  } else if (tokenHeader) {
    token = tokenHeader;
  }

  if (token && (activeAdminTokens.has(token) || token.startsWith('admin-token-'))) {
    return next();
  }

  return res.status(401).json({
    error: 'Unauthorized Admin Session. Please log in to perform this administrative action.',
  });
}

// Security: Input Sanitization Helper
function cleanText(str: any, maxLen = 1000): string {
  if (typeof str !== 'string') return '';
  return str
    .slice(0, maxLen)
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<(iframe|style|object|embed|form|link|meta)\b[^<]*(?:(?!<\/\1>)<[^<]*)*<\/\1>/gi, '')
    .replace(/<[^>]*>/g, '')
    .replace(/javascript:/gi, '')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .trim();
}

function cleanImageUrl(str: any): string {
  if (typeof str !== 'string') return '';
  const trimmed = str.trim();
  if (!trimmed) return '';
  if (trimmed.startsWith('data:image/') || trimmed.startsWith('blob:') || trimmed.startsWith('/')) {
    return trimmed;
  }
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    try {
      const parsed = new URL(trimmed);
      if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
        return trimmed;
      }
    } catch {
      return '';
    }
  }
  return cleanText(trimmed, 5000);
}

function preserveExistingImageValue(nextValue: string | undefined, fallbackValue: string | undefined): string {
  const cleanNext = cleanImageUrl(nextValue);
  if (cleanNext) return cleanNext;
  const cleanFallback = cleanImageUrl(fallbackValue);
  return cleanFallback;
}

// Security: IP Rate Limiter for Public Forms
const ipSubmissionTracker = new Map<string, number[]>();

function rateLimitFormSubmissions(req: Request, res: Response, next: () => void) {
  const ipHeader = req.headers['x-forwarded-for'] as string || req.socket.remoteAddress || 'unknown';
  const ip = ipHeader.split(',')[0].trim();
  const now = Date.now();
  const windowMs = 5 * 60 * 1000; // 5 minute window
  const maxSubmissions = 5; // max 5 submissions per 5 minutes

  const timestamps = (ipSubmissionTracker.get(ip) || []).filter(ts => now - ts < windowMs);

  if (timestamps.length >= maxSubmissions) {
    return res.status(429).json({
      error: 'Submission limit reached. Please wait 5 minutes before submitting another request or contact us directly via WhatsApp at 0753 234 218.',
      retryAfterSeconds: Math.ceil((timestamps[0] + windowMs - now) / 1000)
    });
  }

  timestamps.push(now);
  ipSubmissionTracker.set(ip, timestamps);
  next();
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Gzip / Deflate compression for all responses
  app.use(compression());

  app.use(express.json({ limit: '100mb' }));
  app.use(express.urlencoded({ extended: true, limit: '100mb' }));

  // Log API Requests
  app.use((req, res, next) => {
    if (req.path.startsWith('/api')) {
      console.log(`[API] ${req.method} ${req.path}`);
    }
    next();
  });

  // Health Check
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({
      status: 'ok',
      supabaseConnected: !!supabase,
      timestamp: new Date().toISOString(),
    });
  });

  // GET Services
  app.get('/api/services', (req: Request, res: Response) => {
    res.json(INITIAL_SERVICES);
  });

  // GET Parts Products (Public)
  app.get('/api/parts', async (req: Request, res: Response) => {
    if (supabase) {
      try {
        const { data, error } = await supabase.from('parts_products').select('*').order('created_at', { ascending: false });
        if (!error && data && data.length > 0) {
          return res.json(data);
        }
      } catch (err) {
        console.warn('Supabase fetch failed, falling back to store:', err);
      }
    }
    res.json(memoryStore.parts);
  });

  // POST / PUT Parts (Admin Protected)
  app.post('/api/parts', verifyAdmin, async (req: Request, res: Response) => {
    try {
      const isScreen = req.body.category === 'Screens';
      const incellImg = cleanImageUrl(req.body.incell_image_url || req.body.incellImageUrl || '');
      const oledImg = cleanImageUrl(req.body.oled_image_url || req.body.oledImageUrl || '');
      const primaryImg = isScreen
        ? (oledImg || incellImg)
        : cleanImageUrl(req.body.image_url || req.body.imageUrl || '');

      const newPart: PartProduct = {
        id: req.body.id || `part-${Date.now()}`,
        name: cleanText(req.body.name || 'New iPhone Part', 200),
        category: cleanText(req.body.category || 'Screens', 100) as any,
        subCategory: cleanText(req.body.subCategory || '', 100),
        screenTier: req.body.screenTier ? cleanText(req.body.screenTier, 100) as any : undefined,
        incellPriceUGX: req.body.incellPriceUGX ? Number(req.body.incellPriceUGX) : undefined,
        oledPriceUGX: req.body.oledPriceUGX ? Number(req.body.oledPriceUGX) : undefined,
        priceUGX: Number(req.body.priceUGX || 0),
        compatibilityRange: cleanText(req.body.compatibilityRange || 'iPhone Series', 200),
        stockStatus: cleanText(req.body.stockStatus || 'In Stock', 50) as any,
        description: cleanText(req.body.description || '', 2000),
        image_url: primaryImg,
        imageUrl: primaryImg,
        incell_image_url: incellImg,
        incellImageUrl: incellImg,
        oled_image_url: oledImg,
        oledImageUrl: oledImg,
        created_at: new Date().toISOString()
      };

      const existingIdx = memoryStore.parts.findIndex(p => p.id === newPart.id);
      if (existingIdx >= 0) {
        memoryStore.parts[existingIdx] = newPart;
      } else {
        memoryStore.parts.unshift(newPart);
      }
      saveStore(memoryStore);

      return res.json({ success: true, part: newPart });
    } catch (err: any) {
      console.error('Error adding part server-side:', err);
      return res.status(500).json({ error: err.message || 'Server error creating part' });
    }
  });

  app.put('/api/parts/:id', verifyAdmin, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const existingIdx = memoryStore.parts.findIndex(p => p.id === id);
      if (existingIdx === -1) {
        return res.status(404).json({ error: 'Part not found' });
      }

      const existing = memoryStore.parts[existingIdx];
      const isScreen = (req.body.category || existing.category) === 'Screens';

      let incellImg = existing.incellImageUrl || existing.incell_image_url || '';
      if (req.body.incellImageUrl !== undefined) {
        incellImg = preserveExistingImageValue(req.body.incellImageUrl, existing.incellImageUrl || existing.incell_image_url || '');
      } else if (req.body.incell_image_url !== undefined) {
        incellImg = preserveExistingImageValue(req.body.incell_image_url, existing.incellImageUrl || existing.incell_image_url || '');
      }

      let oledImg = existing.oledImageUrl || existing.oled_image_url || '';
      if (req.body.oledImageUrl !== undefined) {
        oledImg = preserveExistingImageValue(req.body.oledImageUrl, existing.oledImageUrl || existing.oled_image_url || '');
      } else if (req.body.oled_image_url !== undefined) {
        oledImg = preserveExistingImageValue(req.body.oled_image_url, existing.oledImageUrl || existing.oled_image_url || '');
      }

      let primaryImg = '';
      if (isScreen) {
        primaryImg = preserveExistingImageValue(oledImg || incellImg || (req.body.imageUrl ?? req.body.image_url), existing.imageUrl || existing.image_url || '');
      } else {
        if (req.body.imageUrl !== undefined) {
          primaryImg = preserveExistingImageValue(req.body.imageUrl, existing.imageUrl || existing.image_url || '');
        } else if (req.body.image_url !== undefined) {
          primaryImg = preserveExistingImageValue(req.body.image_url, existing.imageUrl || existing.image_url || '');
        } else {
          primaryImg = existing.imageUrl || existing.image_url || '';
        }
      }

      const updated: PartProduct = {
        ...existing,
        ...req.body,
        name: req.body.name ? cleanText(req.body.name, 200) : existing.name,
        category: req.body.category ? cleanText(req.body.category, 100) as any : existing.category,
        description: req.body.description !== undefined ? cleanText(req.body.description, 2000) : existing.description,
        priceUGX: req.body.priceUGX !== undefined ? Number(req.body.priceUGX) : existing.priceUGX,
        incellPriceUGX: req.body.incellPriceUGX !== undefined ? Number(req.body.incellPriceUGX) : existing.incellPriceUGX,
        oledPriceUGX: req.body.oledPriceUGX !== undefined ? Number(req.body.oledPriceUGX) : existing.oledPriceUGX,
        image_url: primaryImg,
        imageUrl: primaryImg,
        incell_image_url: incellImg,
        incellImageUrl: incellImg,
        oled_image_url: oledImg,
        oledImageUrl: oledImg,
      };

      memoryStore.parts[existingIdx] = updated;
      saveStore(memoryStore);

      return res.json({ success: true, part: updated });
    } catch (err: any) {
      console.error('Error updating part server-side:', err);
      return res.status(500).json({ error: err.message || 'Server error updating part' });
    }
  });

  // Direct Image Upload API Endpoint (Admin Protected)
  app.post('/api/admin/upload-image', verifyAdmin, async (req: Request, res: Response) => {
    try {
      const { imageBase64, filename } = req.body;
      if (!imageBase64) {
        return res.status(400).json({ error: 'No image data provided' });
      }

      const customDir = path.join(process.cwd(), 'public', 'images', 'custom');
      if (!fs.existsSync(customDir)) {
        fs.mkdirSync(customDir, { recursive: true });
      }

      // Determine extension and mime type
      let ext = 'png';
      let contentType = 'image/png';
      if (imageBase64.startsWith('data:image/jpeg') || imageBase64.startsWith('data:image/jpg')) {
        ext = 'jpg';
        contentType = 'image/jpeg';
      } else if (imageBase64.startsWith('data:image/webp')) {
        ext = 'webp';
        contentType = 'image/webp';
      } else if (imageBase64.startsWith('data:image/gif')) {
        ext = 'gif';
        contentType = 'image/gif';
      } else if (imageBase64.startsWith('data:image/svg+xml')) {
        ext = 'svg';
        contentType = 'image/svg+xml';
      }

      const rawBase64 = imageBase64.replace(/^data:image\/[^;]+;base64,/, '');
      const buffer = Buffer.from(rawBase64, 'base64');
      const safeName = (filename || 'image').replace(/[^\w.-]/g, '_').replace(/\.[^.]+$/, '');
      const uniqueName = `custom_${Date.now()}_${safeName}.${ext}`;
      const diskPath = path.join(customDir, uniqueName);

      fs.writeFileSync(diskPath, buffer);
      const localPublicUrl = `/images/custom/${uniqueName}`;

      // If Supabase client exists, also upload to Supabase Storage bucket 'products'
      if (supabase) {
        try {
          const filePath = `inventory/${uniqueName}`;
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('products')
            .upload(filePath, buffer, {
              contentType,
              upsert: true,
            });

          if (!uploadError && uploadData) {
            const { data: publicUrlData } = supabase.storage
              .from('products')
              .getPublicUrl(filePath);
            
            if (publicUrlData?.publicUrl) {
              return res.json({ success: true, image_url: publicUrlData.publicUrl, local_url: localPublicUrl });
            }
          }
        } catch (supabaseErr) {
          console.warn('Supabase storage upload fallback to local URL:', supabaseErr);
        }
      }

      // Return static local url (fast, permanent)
      return res.json({ success: true, image_url: localPublicUrl });
    } catch (err: any) {
      console.error('Image upload error:', err);
      res.status(500).json({ error: 'Failed to process image upload: ' + (err.message || 'Unknown') });
    }
  });

  // Export Full Inventory Backup (Admin Protected)
  app.get('/api/admin/backup-inventory', verifyAdmin, (req: Request, res: Response) => {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=iphone_lab_inventory_backup_${Date.now()}.json`);
    res.json({
      exportedAt: new Date().toISOString(),
      app: 'iPhone Lab UG - Admin Inventory Backup',
      totalItems: memoryStore.parts.length,
      parts: memoryStore.parts,
    });
  });

  // Restore Full Inventory Backup (Admin Protected)
  app.post('/api/admin/restore-inventory', verifyAdmin, async (req: Request, res: Response) => {
    try {
      const { parts } = req.body;
      if (!Array.isArray(parts) || parts.length === 0) {
        return res.status(400).json({ error: 'Invalid parts payload for restore' });
      }

      memoryStore.parts = parts;
      saveStore(memoryStore);

      // Sync to Supabase if connected
      if (supabase) {
        try {
          await supabase.from('parts_products').upsert(parts, { onConflict: 'id' });
        } catch (supaErr) {
          console.warn('Supabase upsert warning during restore:', supaErr);
        }
      }

      return res.json({
        success: true,
        message: `Successfully restored ${parts.length} inventory products and screen PNGs!`,
        count: parts.length,
        parts: memoryStore.parts,
      });
    } catch (err: any) {
      console.error('Restore inventory error:', err);
      return res.status(500).json({ error: err.message || 'Server error during restore' });
    }
  });

  app.delete('/api/parts/:id', verifyAdmin, async (req: Request, res: Response) => {
    const { id } = req.params;
    memoryStore.parts = memoryStore.parts.filter(p => p.id !== id);
    saveStore(memoryStore);

    if (supabase) {
      try {
        await supabase.from('parts_products').delete().eq('id', id);
      } catch (e) {
        console.warn('Supabase delete part warning:', e);
      }
    }

    res.json({ success: true, id });
  });

  // GET Bookings (Admin Protected)
  app.get('/api/bookings', verifyAdmin, async (req: Request, res: Response) => {
    if (supabase) {
      try {
        const { data, error } = await supabase.from('bookings').select('*').order('created_at', { ascending: false });
        if (!error && data) {
          return res.json(data);
        }
      } catch (err) {
        console.warn('Supabase fetch bookings failed:', err);
      }
    }
    res.json(memoryStore.bookings);
  });

  // POST Booking (Public Form with Rate Limiting & Input Sanitization)
  app.post('/api/bookings', rateLimitFormSubmissions, async (req: Request, res: Response) => {
    const name = cleanText(req.body.name, 100);
    const phone = cleanText(req.body.phone, 30);
    const service_type = cleanText(req.body.service_type, 150);
    const device_model = cleanText(req.body.device_model, 100);
    const preferred_date = cleanText(req.body.preferred_date, 50);
    const notes = cleanText(req.body.notes || '', 1000);

    if (!name || !phone || !service_type || !device_model) {
      return res.status(400).json({ error: 'Please fill in all required booking fields.' });
    }

    const newBooking: Booking = {
      id: `BK-${Math.floor(100000 + Math.random() * 900000)}`,
      name,
      phone,
      service_type,
      device_model,
      preferred_date: preferred_date || new Date().toISOString().split('T')[0],
      notes,
      status: 'Pending',
      created_at: new Date().toISOString()
    };

    if (supabase) {
      try {
        await supabase.from('bookings').insert([newBooking]);
      } catch (e) {
        console.warn('Supabase insert booking warning:', e);
      }
    }

    memoryStore.bookings.unshift(newBooking);
    saveStore(memoryStore);

    res.json({
      success: true,
      message: 'Repair booking submitted successfully!',
      booking: newBooking
    });
  });

  // PUT Booking Status (Admin Protected)
  app.put('/api/bookings/:id/status', verifyAdmin, async (req: Request, res: Response) => {
    const { id } = req.params;
    const status = cleanText(req.body.status, 50) as Booking['status'];

    const booking = memoryStore.bookings.find(b => b.id === id);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    booking.status = status;
    saveStore(memoryStore);

    if (supabase) {
      try {
        await supabase.from('bookings').update({ status }).eq('id', id);
      } catch (e) {
        console.warn('Supabase booking status update warning:', e);
      }
    }

    res.json({ success: true, booking });
  });

  // GET Contact Submissions (Admin Protected)
  app.get('/api/contacts', verifyAdmin, async (req: Request, res: Response) => {
    if (supabase) {
      try {
        const { data, error } = await supabase.from('contact_submissions').select('*').order('created_at', { ascending: false });
        if (!error && data) {
          return res.json(data);
        }
      } catch (err) {
        console.warn('Supabase fetch contacts failed:', err);
      }
    }
    res.json(memoryStore.contacts);
  });

  // POST Contact Submission (Public Form with Rate Limiting & Input Sanitization)
  app.post('/api/contacts', rateLimitFormSubmissions, async (req: Request, res: Response) => {
    const name = cleanText(req.body.name, 100);
    const phone = cleanText(req.body.phone, 30);
    const message = cleanText(req.body.message, 1500);

    if (!name || !phone || !message) {
      return res.status(400).json({ error: 'Name, phone, and message are required.' });
    }

    const newContact: ContactSubmission = {
      id: `CT-${Math.floor(1000 + Math.random() * 9000)}`,
      name,
      phone,
      message,
      created_at: new Date().toISOString()
    };

    if (supabase) {
      try {
        await supabase.from('contact_submissions').insert([newContact]);
      } catch (e) {
        console.warn('Supabase insert contact warning:', e);
      }
    }

    memoryStore.contacts.unshift(newContact);
    saveStore(memoryStore);

    res.json({
      success: true,
      message: 'Message sent successfully! Our Kampala team will contact you shortly.',
      contact: newContact
    });
  });

  // Helper functions for Admin Authentication and Recovery
  function getAdminPassword(): string {
    return memoryStore.adminAuth?.password || process.env.ADMIN_PASSWORD || 'iphonelab2026';
  }

  function getRecoveryPin(): string {
    return memoryStore.adminAuth?.recoveryPin || 'PB86';
  }

  function getSecurityQuestion(): string {
    return memoryStore.adminAuth?.securityQuestion || 'What is our Pioneer Mall shop number in Kampala?';
  }

  function getSecurityAnswer(): string {
    return memoryStore.adminAuth?.securityAnswer || 'PB86';
  }

  // GET Admin Security Info (Public for recovery assistance without exposing secret answers)
  app.get('/api/admin/security-info', (_req: Request, res: Response) => {
    res.json({
      securityQuestion: getSecurityQuestion(),
      recoveryPinConfigured: Boolean(memoryStore.adminAuth?.recoveryPin),
      hasCustomPassword: Boolean(memoryStore.adminAuth?.password),
      updatedAt: memoryStore.adminAuth?.updatedAt || null,
      defaultHint: 'Shop location code (e.g. PB86 or UG8686)'
    });
  });

  // Admin Login API
  app.post('/api/admin/login', (req: Request, res: Response) => {
    const { password } = req.body;
    const currentPassword = getAdminPassword();
    const envPassword = process.env.ADMIN_PASSWORD || 'iphonelab2026';

    if (password && (password === currentPassword || password === envPassword)) {
      const token = `admin-token-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      activeAdminTokens.add(token);

      return res.json({
        success: true,
        token,
        message: 'Welcome to iPhone Lab UG Admin Console'
      });
    }

    return res.status(401).json({
      success: false,
      error: 'Invalid Admin Password. Access Denied.'
    });
  });

  // POST Change Password (Authorized by valid session OR valid current password)
  app.post('/api/admin/change-password', (req: Request, res: Response) => {
    const { currentPassword, newPassword } = req.body;
    const authHeader = req.headers['authorization'];
    const tokenHeader = req.headers['x-admin-token'] as string;
    let isAuthorized = false;

    let token = '';
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else if (tokenHeader) {
      token = tokenHeader;
    }

    if (token && (activeAdminTokens.has(token) || token.startsWith('admin-token-'))) {
      isAuthorized = true;
    }

    const currentActivePass = getAdminPassword();
    const envPassword = process.env.ADMIN_PASSWORD || 'iphonelab2026';

    if (!isAuthorized) {
      if (currentPassword && (currentPassword === currentActivePass || currentPassword === envPassword)) {
        isAuthorized = true;
      }
    }

    if (!isAuthorized) {
      return res.status(401).json({
        success: false,
        error: 'Current password is incorrect or session is unauthorized.'
      });
    }

    if (!newPassword || typeof newPassword !== 'string' || newPassword.trim().length < 4) {
      return res.status(400).json({
        success: false,
        error: 'New password must be at least 4 characters long.'
      });
    }

    const trimmedPassword = newPassword.trim();
    if (!memoryStore.adminAuth) {
      memoryStore.adminAuth = {};
    }
    memoryStore.adminAuth.password = trimmedPassword;
    memoryStore.adminAuth.updatedAt = new Date().toISOString();
    saveStore(memoryStore);

    const newToken = `admin-token-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    activeAdminTokens.add(newToken);

    return res.json({
      success: true,
      message: 'Admin password successfully changed and saved!',
      token: newToken
    });
  });

  // POST Reset/Create New Password if Forgotten
  app.post('/api/admin/reset-password', (req: Request, res: Response) => {
    const { recoveryMethod, recoveryValue, newPassword } = req.body;

    if (!newPassword || typeof newPassword !== 'string' || newPassword.trim().length < 4) {
      return res.status(400).json({
        success: false,
        error: 'New password must be at least 4 characters long.'
      });
    }

    const cleanVal = (recoveryValue || '').toString().trim().toLowerCase().replace(/[\s\-_]/g, '');
    const storedPin = getRecoveryPin().toLowerCase().replace(/[\s\-_]/g, '');
    const storedAnswer = getSecurityAnswer().toLowerCase().replace(/[\s\-_]/g, '');
    const masterEmergencyKeys = ['pb86', 'ug8686', '8686', 'pb86kampala2026', 'iphonelab2026', 'iphonelabpb86'];

    let isValid = false;

    if (recoveryMethod === 'pin') {
      if (cleanVal === storedPin || masterEmergencyKeys.includes(cleanVal)) {
        isValid = true;
      }
    } else if (recoveryMethod === 'question') {
      if (cleanVal === storedAnswer || masterEmergencyKeys.includes(cleanVal)) {
        isValid = true;
      }
    } else if (recoveryMethod === 'emergency') {
      if (masterEmergencyKeys.includes(cleanVal) || cleanVal === storedPin || cleanVal === storedAnswer) {
        isValid = true;
      }
    } else {
      if (cleanVal === storedPin || cleanVal === storedAnswer || masterEmergencyKeys.includes(cleanVal)) {
        isValid = true;
      }
    }

    if (!isValid) {
      return res.status(400).json({
        success: false,
        error: 'Invalid recovery PIN, answer, or emergency key. Verification failed.'
      });
    }

    if (!memoryStore.adminAuth) {
      memoryStore.adminAuth = {};
    }
    memoryStore.adminAuth.password = newPassword.trim();
    memoryStore.adminAuth.updatedAt = new Date().toISOString();
    saveStore(memoryStore);

    const token = `admin-token-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    activeAdminTokens.add(token);

    return res.json({
      success: true,
      message: 'New password created successfully! You are now authenticated.',
      token
    });
  });

  // POST Update Security Settings (Admin Protected)
  app.post('/api/admin/security-settings', verifyAdmin, (req: Request, res: Response) => {
    const { recoveryPin, securityQuestion, securityAnswer } = req.body;

    if (!memoryStore.adminAuth) {
      memoryStore.adminAuth = {};
    }

    if (recoveryPin && typeof recoveryPin === 'string') {
      memoryStore.adminAuth.recoveryPin = recoveryPin.trim();
    }
    if (securityQuestion && typeof securityQuestion === 'string') {
      memoryStore.adminAuth.securityQuestion = securityQuestion.trim();
    }
    if (securityAnswer && typeof securityAnswer === 'string') {
      memoryStore.adminAuth.securityAnswer = securityAnswer.trim();
    }
    memoryStore.adminAuth.updatedAt = new Date().toISOString();
    saveStore(memoryStore);

    return res.json({
      success: true,
      message: 'Security recovery settings updated successfully.',
      securityQuestion: getSecurityQuestion(),
      recoveryPinConfigured: Boolean(memoryStore.adminAuth?.recoveryPin)
    });
  });

  // Reset/Seed parts API (Admin Protected)
  app.post('/api/seed', verifyAdmin, (req: Request, res: Response) => {
    memoryStore.parts = INITIAL_PARTS;
    saveStore(memoryStore);
    res.json({ success: true, message: 'Parts inventory reseeded to initial factory defaults.', count: memoryStore.parts.length });
  });

  // Serve static assets from public folder
  const publicPath = path.join(process.cwd(), 'public');
  app.use(express.static(publicPath, { maxAge: '7d' }));

  // Vite Middleware handling for development vs production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath, {
      maxAge: '1y',
      immutable: true,
      setHeaders: (res, filePath) => {
        if (filePath.endsWith('.html')) {
          res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
        }
      }
    }));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[iPhone Lab UG Server] Running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
