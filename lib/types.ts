export interface Category {
  id: string;
  name: string;
  parent_type: string;
  slug: string;
  image_url?: string;
  created_at?: string;
}

export interface ContactEnquiry {
  id: string;
  name: string;
  whatsapp_number: string;
  looking_for: string;
  message: string;
  created_at?: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  category_id: string;
  badge: 'new_arrival' | 'bestseller' | 'trending' | 'limited_stock' | null;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
  created_at?: string;
}

export interface SiteConfig {
  whatsapp_number: string;
  email_address: string;
  instagram_url: string;
  updated_at?: string;
}

export interface InstagramPost {
  id: string;
  image_url: string;
  post_url: string;
  caption?: string;
  created_at?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Review {
  id: string;
  product_id: string;
  product_name: string;
  rating: number; // 1-5
  name: string;
  comment: string;
  image_url?: string;
  status: 'pending' | 'approved' | 'rejected';
  featured: boolean;
  created_at: string;
}

export interface User {
  id: string;
  email?: string;
  phone?: string;
  displayName?: string;
  isAnonymous: boolean;
  avatarUrl?: string;
}

