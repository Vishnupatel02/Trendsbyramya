import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { Category, Product, SiteConfig, InstagramPost, Review } from './types';

// Environment variables check for Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const isSupabaseEnabled = supabaseUrl !== '' && supabaseAnonKey !== '';

export const supabase = isSupabaseEnabled
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Paths for local mock DB file
const LOCAL_DB_PATH = path.join(process.cwd(), 'data', 'db.json');

// Interface for db.json file structure
interface LocalDB {
  categories: Category[];
  products: Product[];
  site_config: SiteConfig;
  instagram_feed: InstagramPost[];
  reviews: Review[];
}

// Read local mock DB file helper
function readLocalDB(): LocalDB {
  try {
    if (!fs.existsSync(LOCAL_DB_PATH)) {
      // Create empty db structures if file does not exist
      const defaultDB: LocalDB = {
        categories: [],
        products: [],
        site_config: {
          whatsapp_number: "+91 97052 82684",
          email_address: "ramyajangili221@gmail.com",
          instagram_url: "https://www.instagram.com/trends_by_ramya",
        },
        instagram_feed: [],
        reviews: [],
      };
      fs.mkdirSync(path.dirname(LOCAL_DB_PATH), { recursive: true });
      fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(defaultDB, null, 2), 'utf8');
      return defaultDB;
    }
    const rawData = fs.readFileSync(LOCAL_DB_PATH, 'utf8');
    return JSON.parse(rawData);
  } catch (error) {
    console.error("Error reading local DB file, returning empty state:", error);
    return { categories: [], products: [], site_config: { whatsapp_number: '', email_address: '', instagram_url: '' }, instagram_feed: [], reviews: [] };
  }
}

// Write local mock DB file helper
function writeLocalDB(data: LocalDB): void {
  try {
    fs.mkdirSync(path.dirname(LOCAL_DB_PATH), { recursive: true });
    fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error("Error writing local DB file:", error);
  }
}

/* ============================================================================
   CATEGORIES SERVICES
   ============================================================================ */

export async function getCategories(): Promise<Category[]> {
  if (isSupabaseEnabled && supabase) {
    const { data, error } = await supabase.from('categories').select('*').order('name');
    if (error) {
      console.error('Supabase getCategories error:', error);
      return [];
    }
    return data || [];
  } else {
    const db = readLocalDB();
    return db.categories;
  }
}

export async function addCategory(category: Omit<Category, 'id'> & { id?: string }): Promise<Category> {
  const newId = category.id || `cat-${Date.now()}`;
  const slug = category.slug || category.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const newCategory: Category = {
    ...category,
    id: newId,
    slug,
    created_at: new Date().toISOString()
  };

  if (isSupabaseEnabled && supabase) {
    const { data, error } = await supabase.from('categories').insert([newCategory]).select();
    if (error) {
      throw new Error(`Supabase addCategory error: ${error.message}`);
    }
    return data[0];
  } else {
    const db = readLocalDB();
    db.categories.push(newCategory);
    writeLocalDB(db);
    return newCategory;
  }
}

export async function deleteCategory(id: string): Promise<boolean> {
  if (isSupabaseEnabled && supabase) {
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) {
      console.error('Supabase deleteCategory error:', error);
      return false;
    }
    return true;
  } else {
    const db = readLocalDB();
    const index = db.categories.findIndex(c => c.id === id);
    if (index !== -1) {
      db.categories.splice(index, 1);
      // Clean up product category IDs that reference this category
      db.products = db.products.map(p => p.category_id === id ? { ...p, category_id: '' } : p);
      writeLocalDB(db);
      return true;
    }
    return false;
  }
}

/* ============================================================================
   PRODUCTS SERVICES
   ============================================================================ */

export async function getProducts(): Promise<Product[]> {
  if (isSupabaseEnabled && supabase) {
    const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    if (error) {
      console.error('Supabase getProducts error:', error);
      return [];
    }
    return data || [];
  } else {
    const db = readLocalDB();
    return db.products;
  }
}

export async function getProductById(id: string): Promise<Product | null> {
  if (isSupabaseEnabled && supabase) {
    const { data, error } = await supabase.from('products').select('*').eq('id', id).single();
    if (error) {
      console.error(`Supabase getProductById error for ${id}:`, error);
      return null;
    }
    return data;
  } else {
    const db = readLocalDB();
    return db.products.find(p => p.id === id) || null;
  }
}

export async function addProduct(product: Omit<Product, 'id'> & { id?: string }): Promise<Product> {
  const newProduct: Product = {
    ...product,
    id: product.id || `prod-${Date.now()}`,
    created_at: new Date().toISOString()
  };

  if (isSupabaseEnabled && supabase) {
    const { data, error } = await supabase.from('products').insert([newProduct]).select();
    if (error) {
      throw new Error(`Supabase addProduct error: ${error.message}`);
    }
    return data[0];
  } else {
    const db = readLocalDB();
    db.products.push(newProduct);
    writeLocalDB(db);
    return newProduct;
  }
}

export async function updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
  if (isSupabaseEnabled && supabase) {
    const { data, error } = await supabase.from('products').update(updates).eq('id', id).select();
    if (error) {
      throw new Error(`Supabase updateProduct error: ${error.message}`);
    }
    return data ? data[0] : null;
  } else {
    const db = readLocalDB();
    const index = db.products.findIndex(p => p.id === id);
    if (index !== -1) {
      const updatedProduct = { ...db.products[index], ...updates };
      db.products[index] = updatedProduct;
      writeLocalDB(db);
      return updatedProduct;
    }
    return null;
  }
}

export async function deleteProduct(id: string): Promise<boolean> {
  if (isSupabaseEnabled && supabase) {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) {
      console.error('Supabase deleteProduct error:', error);
      return false;
    }
    return true;
  } else {
    const db = readLocalDB();
    const index = db.products.findIndex(p => p.id === id);
    if (index !== -1) {
      db.products.splice(index, 1);
      writeLocalDB(db);
      return true;
    }
    return false;
  }
}

/* ============================================================================
   SITE CONFIG / SETTINGS SERVICES
   ============================================================================ */

export async function getSiteConfig(): Promise<SiteConfig> {
  if (isSupabaseEnabled && supabase) {
    const { data, error } = await supabase.from('site_config').select('*').eq('id', 1).single();
    if (error) {
      console.error('Supabase getSiteConfig error:', error);
      return {
        whatsapp_number: "+91 97052 82684",
        email_address: "ramyajangili221@gmail.com",
        instagram_url: "https://www.instagram.com/trends_by_ramya",
      };
    }
    return data;
  } else {
    const db = readLocalDB();
    return db.site_config;
  }
}

export async function updateSiteConfig(updates: Partial<SiteConfig>): Promise<SiteConfig> {
  if (isSupabaseEnabled && supabase) {
    const { data, error } = await supabase.from('site_config').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', 1).select();
    if (error) {
      throw new Error(`Supabase updateSiteConfig error: ${error.message}`);
    }
    return data[0];
  } else {
    const db = readLocalDB();
    const updatedConfig = { ...db.site_config, ...updates };
    db.site_config = updatedConfig;
    writeLocalDB(db);
    return updatedConfig;
  }
}

/* ============================================================================
   INSTAGRAM FEED SERVICES
   ============================================================================ */

export async function getInstagramFeed(): Promise<InstagramPost[]> {
  if (isSupabaseEnabled && supabase) {
    const { data, error } = await supabase.from('instagram_feed').select('*').order('created_at', { ascending: false });
    if (error) {
      console.error('Supabase getInstagramFeed error:', error);
      return [];
    }
    return data || [];
  } else {
    const db = readLocalDB();
    return db.instagram_feed;
  }
}

export async function addInstagramPost(post: Omit<InstagramPost, 'id'> & { id?: string }): Promise<InstagramPost> {
  const newPost: InstagramPost = {
    ...post,
    id: post.id || `ig-${Date.now()}`,
    created_at: new Date().toISOString()
  };

  if (isSupabaseEnabled && supabase) {
    const { data, error } = await supabase.from('instagram_feed').insert([newPost]).select();
    if (error) {
      throw new Error(`Supabase addInstagramPost error: ${error.message}`);
    }
    return data[0];
  } else {
    const db = readLocalDB();
    db.instagram_feed.push(newPost);
    writeLocalDB(db);
    return newPost;
  }
}

export async function deleteInstagramPost(id: string): Promise<boolean> {
  if (isSupabaseEnabled && supabase) {
    const { error } = await supabase.from('instagram_feed').delete().eq('id', id);
    if (error) {
      console.error('Supabase deleteInstagramPost error:', error);
      return false;
    }
    return true;
  } else {
    const db = readLocalDB();
    const index = db.instagram_feed.findIndex(item => item.id === id);
    if (index !== -1) {
      db.instagram_feed.splice(index, 1);
      writeLocalDB(db);
      return true;
    }
    return false;
  }
}

/* ============================================================================
   REVIEWS SERVICES
   ============================================================================ */

export async function getReviews(): Promise<Review[]> {
  if (isSupabaseEnabled && supabase) {
    const { data, error } = await supabase.from('reviews').select('*').order('created_at', { ascending: false });
    if (error) {
      console.error('Supabase getReviews error:', error);
      return [];
    }
    return data || [];
  } else {
    const db = readLocalDB();
    return db.reviews || [];
  }
}

export async function addReview(review: Omit<Review, 'id' | 'created_at'> & { id?: string }): Promise<Review> {
  const newReview: Review = {
    ...review,
    id: review.id || `rev-${Date.now()}`,
    created_at: new Date().toISOString()
  };

  if (isSupabaseEnabled && supabase) {
    const { data, error } = await supabase.from('reviews').insert([newReview]).select();
    if (error) {
      throw new Error(`Supabase addReview error: ${error.message}`);
    }
    return data[0];
  } else {
    const db = readLocalDB();
    if (!db.reviews) db.reviews = [];
    db.reviews.push(newReview);
    writeLocalDB(db);
    return newReview;
  }
}

export async function updateReview(id: string, updates: Partial<Review>): Promise<Review | null> {
  if (isSupabaseEnabled && supabase) {
    const { data, error } = await supabase.from('reviews').update(updates).eq('id', id).select();
    if (error) {
      throw new Error(`Supabase updateReview error: ${error.message}`);
    }
    return data ? data[0] : null;
  } else {
    const db = readLocalDB();
    if (!db.reviews) db.reviews = [];
    const index = db.reviews.findIndex(r => r.id === id);
    if (index !== -1) {
      const updatedReview = { ...db.reviews[index], ...updates };
      db.reviews[index] = updatedReview;
      writeLocalDB(db);
      return updatedReview;
    }
    return null;
  }
}

export async function deleteReview(id: string): Promise<boolean> {
  if (isSupabaseEnabled && supabase) {
    const { error } = await supabase.from('reviews').delete().eq('id', id);
    if (error) {
      console.error('Supabase deleteReview error:', error);
      return false;
    }
    return true;
  } else {
    const db = readLocalDB();
    if (!db.reviews) db.reviews = [];
    const index = db.reviews.findIndex(r => r.id === id);
    if (index !== -1) {
      db.reviews.splice(index, 1);
      writeLocalDB(db);
      return true;
    }
    return false;
  }
}

