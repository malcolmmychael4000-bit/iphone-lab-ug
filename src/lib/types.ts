// Supabase Database Schema & Types for iPhone Lab UG
// Compatible with PostgreSQL / Supabase Real-Time Client

export interface PartsInventoryTable {
  id: string; // primary key UUID or text
  name: string; // e.g., 'iPhone 13 Pro Max OLED Display'
  category: 'Screens' | 'Batteries' | 'Back Glasses' | 'Housings' | 'Camera Glasses' | 'Screen Guards' | 'Accessories';
  sub_category?: string | null;
  screen_tier?: 'InCell' | 'OLED' | 'OEM Original' | null;
  incell_price_ugx?: number | null;
  oled_price_ugx?: number | null;
  oem_price_ugx?: number | null;
  price_ugx: number;
  wholesale_price_ugx?: number | null;
  stock_quantity: number;
  stock_status: 'In Stock' | 'Low Stock' | 'Out of Stock';
  compatibility_range: string;
  description: string;
  image_url?: string | null;
  created_at: string; // ISO Timestamp
  updated_at: string;
}

export interface RepairBookingsTable {
  id: string; // primary key
  customer_name: string;
  phone_number: string;
  email?: string | null;
  device_model: string;
  service_type: string;
  preferred_date: string;
  preferred_time: string;
  notes?: string | null;
  status: 'Pending' | 'Confirmed' | 'In Progress' | 'Completed' | 'Cancelled';
  assigned_technician?: string | null;
  shop_location: string; // e.g. 'Shop PB86, New Pioneer Mall'
  created_at: string;
  updated_at: string;
}

export interface UserProfilesTable {
  id: string; // Supabase auth.users UUID
  full_name: string;
  email: string;
  phone_number?: string | null;
  role: 'admin' | 'technician' | 'customer';
  shop_branch?: string | null; // default 'Shop PB86, Kampala'
  created_at: string;
  last_login_at?: string | null;
}

export interface ContactSubmissionsTable {
  id: string;
  full_name: string;
  phone_number: string;
  message: string;
  status: 'Unread' | 'Read' | 'Responded';
  created_at: string;
}

// Database Schema Definition Object (Supabase Type Mapping)
export type Database = {
  public: {
    Tables: {
      parts_inventory: {
        Row: PartsInventoryTable;
        Insert: Omit<PartsInventoryTable, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<PartsInventoryTable, 'id'>>;
      };
      repair_bookings: {
        Row: RepairBookingsTable;
        Insert: Omit<RepairBookingsTable, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<RepairBookingsTable, 'id'>>;
      };
      user_profiles: {
        Row: UserProfilesTable;
        Insert: Omit<UserProfilesTable, 'created_at'>;
        Update: Partial<Omit<UserProfilesTable, 'id'>>;
      };
      contact_submissions: {
        Row: ContactSubmissionsTable;
        Insert: Omit<ContactSubmissionsTable, 'created_at'>;
        Update: Partial<Omit<ContactSubmissionsTable, 'id'>>;
      };
    };
  };
};

// Mock Supabase Helper Service for Real-Time State Persistence
export class SupabaseInventoryService {
  private static STORAGE_KEY_PARTS = 'iphone_lab_parts_v2';

  public static getParts(): PartsInventoryTable[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY_PARTS);
      if (stored) return JSON.parse(stored);
    } catch {
      // fallback
    }
    return [];
  }

  public static saveParts(parts: PartsInventoryTable[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY_PARTS, JSON.stringify(parts));
    } catch {
      // fallback
    }
  }

  public static updateStockStatus(
    partId: string,
    status: 'In Stock' | 'Low Stock' | 'Out of Stock',
    newQuantity?: number
  ): PartsInventoryTable[] {
    const parts = this.getParts();
    const updated = parts.map((p) => {
      if (p.id === partId) {
        return {
          ...p,
          stock_status: status,
          stock_quantity: newQuantity !== undefined ? newQuantity : status === 'Out of Stock' ? 0 : p.stock_quantity,
          updated_at: new Date().toISOString(),
        };
      }
      return p;
    });
    this.saveParts(updated);
    return updated;
  }
}
