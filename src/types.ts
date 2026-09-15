export type ServiceCategory = 'All' | 'Hardware' | 'Micro-Soldering' | 'Software';

export interface ServiceItem {
  id: string;
  title: string;
  iconName: string;
  description: string;
  estimatedTime: string;
  warranty: string;
  startingPriceUGX: number;
  isPopular?: boolean;
}

export type PartCategory = 'Screens' | 'Batteries' | 'Back Glasses' | 'Housings' | 'Camera Glasses' | 'Screen Guards' | 'Accessories';

export interface PartProduct {
  id: string;
  name: string;
  category: PartCategory;
  subCategory?: string;
  screenTier?: 'Incell (JH)' | 'OLED (DD)' | 'Both' | string;
  incellPriceUGX?: number;
  oledPriceUGX?: number;
  oemPriceUGX?: number;
  priceUGX?: number;
  compatibilityRange: string;
  stockStatus: 'In Stock' | 'Low Stock' | 'Limited Stock' | 'Pre-Order' | 'Out of Stock';
  description?: string;
  image_url?: string;
  imageUrl?: string;
  incellImageUrl?: string;
  incell_image_url?: string;
  oledImageUrl?: string;
  oled_image_url?: string;
  created_at?: string;
}

export interface Booking {
  id: string;
  name: string;
  phone: string;
  service_type: string;
  device_model: string;
  preferred_date: string;
  notes?: string;
  status: 'Pending' | 'Confirmed' | 'In Progress' | 'Completed' | 'Cancelled';
  created_at: string;
}

export interface ContactSubmission {
  id: string;
  name: string;
  phone: string;
  message: string;
  created_at: string;
}

export interface FilterOptions {
  category: string;
  searchQuery: string;
  modelFamily: string;
}
