import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import crypto from 'crypto';
import { Category, Product, SiteConfig, InstagramPost, Review } from './types';

function ensureUUID(id?: string): string {
  if (id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    return id;
  }
  return crypto.randomUUID();
}

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://avibyiwrelvnxzctfdfw.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_nUDXhUyIl-Hz66nfmpTsxQ_T6Y6Pm1C';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Single global instance for public anonymous reads
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Returns a Supabase client context.
 * Automatically injects the admin session token if logged in, or uses the service role key if requested and available.
 */
export async function getSupabaseClient(useServiceRole = false) {
  if (useServiceRole && supabaseServiceKey) {
    return createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }

  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('ramya-admin-session')?.value;
    if (token) {
      return createClient(supabaseUrl, supabaseAnonKey, {
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      });
    }
  } catch (e) {
    // cookies() may throw in static page generation contexts
  }

  return supabase;
}

/* ============================================================================
   MAPPING HELPERS
   ============================================================================ */

/**
 * Maps a Supabase products row to the frontend Product type.
 */
function mapProductFromDB(row: any, categories: Category[] = []): Product {
  const matchedCat = categories.find(c => c.slug === row.subcategory || c.id === row.subcategory);
  const categoryId = matchedCat ? matchedCat.id : (row.subcategory || '');
  return {
    id: row.id,
    name: row.name,
    description: row.description || '',
    price: Number(row.price),
    images: row.image_url ? [row.image_url] : [],
    category_id: categoryId,
    badge: null,
    status: row.status || (Number(row.stock) === 0 ? 'out_of_stock' : (Number(row.stock) <= 3 ? 'low_stock' : 'in_stock')),
    created_at: row.created_at,
  };
}

/**
 * Maps a frontend Review type from a Supabase reviews row, extracting JSON metadata.
 */
function mapReviewFromDB(row: any): Review {
  let comment = row.review_text || '';
  let product_id = '';
  let product_name = '';
  let image_url = '';
  let featured = false;

  if (row.review_text && row.review_text.startsWith('{')) {
    try {
      const parsed = JSON.parse(row.review_text);
      comment = parsed.comment || '';
      product_id = parsed.product_id || '';
      product_name = parsed.product_name || '';
      image_url = parsed.image_url || '';
      featured = !!parsed.featured;
    } catch (e) {
      // Fallback if parsing fails
    }
  }

  return {
    id: row.id,
    product_id,
    product_name,
    rating: Number(row.rating),
    name: row.customer_name || 'Anonymous',
    comment,
    image_url: image_url || undefined,
    status: row.approved ? 'approved' : 'pending',
    featured,
    created_at: row.created_at,
  };
}

/**
 * Maps a frontend Review object to the Supabase reviews row structure.
 */
function mapReviewToDB(review: Omit<Review, 'id' | 'created_at'> & { id?: string }) {
  const reviewTextObj = {
    comment: review.comment,
    product_id: review.product_id,
    product_name: review.product_name,
    image_url: review.image_url || '',
    featured: !!review.featured,
  };

  return {
    id: review.id,
    customer_name: review.name,
    rating: Number(review.rating),
    review_text: JSON.stringify(reviewTextObj),
    approved: review.status === 'approved',
  };
}

/* ============================================================================
   CATEGORIES SERVICES
   ============================================================================ */

export async function getCategories(): Promise<Category[]> {
  const client = await getSupabaseClient();
  const { data, error } = await client.from('categories').select('*').order('name');
  if (error) {
    console.error('Supabase getCategories error:', error);
    return [];
  }
  return data || [];
}

export async function addCategory(category: Omit<Category, 'id'> & { id?: string }): Promise<Category> {
  const categoryId = ensureUUID(category.id);
  const slug = category.slug || category.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const newCategory: Category = {
    ...category,
    id: categoryId,
    slug,
    created_at: new Date().toISOString(),
  };

  const client = await getSupabaseClient(true);
  const { data, error } = await client.from('categories').insert([newCategory]).select();
  if (error) {
    throw new Error(`Supabase addCategory error: ${error.message}`);
  }
  return data[0];
}

export async function deleteCategory(id: string): Promise<boolean> {
  const client = await getSupabaseClient(true);
  const { error } = await client.from('categories').delete().eq('id', id);
  if (error) {
    console.error('Supabase deleteCategory error:', error);
    return false;
  }
  return true;
}

/* ============================================================================
   PRODUCTS SERVICES
   ============================================================================ */

export async function getProducts(): Promise<Product[]> {
  const client = await getSupabaseClient();
  const { data, error } = await client.from('products').select('*').order('created_at', { ascending: false });
  if (error) {
    console.error('Supabase getProducts error:', error);
    return [];
  }
  
  const categories = await getCategories();
  return (data || []).map(row => mapProductFromDB(row, categories));
}

export async function getProductById(id: string): Promise<Product | null> {
  const client = await getSupabaseClient();
  const { data, error } = await client.from('products').select('*').eq('id', id).single();
  if (error) {
    console.error(`Supabase getProductById error for ${id}:`, error);
    return null;
  }
  if (!data) return null;

  const categories = await getCategories();
  return mapProductFromDB(data, categories);
}

export async function addProduct(product: Omit<Product, 'id'> & { id?: string }): Promise<Product> {
  const client = await getSupabaseClient(true);
  
  // Find category to populate parent category and subcategory slug
  const categories = await getCategories();
  const cat = categories.find(c => c.id === product.category_id || c.slug === product.category_id);
  const parentType = cat ? cat.parent_type : 'jewellery';
  const subcategory = cat ? cat.slug : (product.category_id || '');
  
  const imageUrl = product.images && product.images.length > 0 ? product.images[0] : '';
  const stock = product.status === 'out_of_stock' ? 0 : (product.status === 'low_stock' ? 3 : 10);
  
  const productId = ensureUUID(product.id);
  const dbProduct = {
    id: productId,
    name: product.name,
    category: parentType,
    subcategory: subcategory,
    description: product.description || '',
    price: Number(product.price),
    stock: stock,
    image_url: imageUrl,
    status: product.status || 'in_stock',
    created_at: new Date().toISOString(),
  };

  const { data, error } = await client.from('products').insert([dbProduct]).select();
  if (error) {
    throw new Error(`Supabase addProduct error: ${error.message}`);
  }
  return mapProductFromDB(data[0], categories);
}

export async function updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
  const client = await getSupabaseClient(true);
  
  const dbUpdates: any = {};
  if (updates.name !== undefined) dbUpdates.name = updates.name;
  if (updates.description !== undefined) dbUpdates.description = updates.description;
  if (updates.price !== undefined) dbUpdates.price = Number(updates.price);
  
  if (updates.status !== undefined) {
    dbUpdates.status = updates.status;
    dbUpdates.stock = updates.status === 'out_of_stock' ? 0 : (updates.status === 'low_stock' ? 3 : 10);
  }
  
  if (updates.images !== undefined) {
    dbUpdates.image_url = updates.images.length > 0 ? updates.images[0] : '';
  }
  
  if (updates.category_id !== undefined) {
    const categories = await getCategories();
    const cat = categories.find(c => c.id === updates.category_id || c.slug === updates.category_id);
    if (cat) {
      dbUpdates.category = cat.parent_type;
      dbUpdates.subcategory = cat.slug;
    } else {
      dbUpdates.subcategory = updates.category_id;
    }
  }

  const { data, error } = await client.from('products').update(dbUpdates).eq('id', id).select();
  if (error) {
    throw new Error(`Supabase updateProduct error: ${error.message}`);
  }
  const categories = await getCategories();
  return data ? mapProductFromDB(data[0], categories) : null;
}

export async function deleteProduct(id: string): Promise<boolean> {
  const client = await getSupabaseClient(true);
  const { error } = await client.from('products').delete().eq('id', id);
  if (error) {
    console.error('Supabase deleteProduct error:', error);
    return false;
  }
  return true;
}

/* ============================================================================
   SITE CONFIG / SETTINGS SERVICES
   ============================================================================ */

export async function getSiteConfig(): Promise<SiteConfig> {
  // site_config table does not exist in Supabase. We serve standard premium fallbacks.
  return {
    whatsapp_number: "+91 97052 82684",
    email_address: "ramyajangili221@gmail.com",
    instagram_url: "https://www.instagram.com/trends_by_ramya",
  };
}

export async function updateSiteConfig(updates: Partial<SiteConfig>): Promise<SiteConfig> {
  const current = await getSiteConfig();
  return {
    ...current,
    ...updates,
  };
}

/* ============================================================================
   INSTAGRAM FEED SERVICES
   ============================================================================ */

export async function getInstagramFeed(): Promise<InstagramPost[]> {
  // instagram_feed table does not exist in Supabase. We return a curated list of fallback posts.
  return [
    {
      id: "ig-1",
      image_url: "https://images.unsplash.com/photo-1617032213178-1b887b1b3b0e?w=600&q=80",
      post_url: "https://www.instagram.com/trends_by_ramya",
      caption: "Bridal glow with our Royal Temple Choker set. Custom orders open ✨",
    },
    {
      id: "ig-2",
      image_url: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&q=80",
      post_url: "https://www.instagram.com/trends_by_ramya",
      caption: "Intricate temple detailing close-up. Pure handcrafted perfection. 💛",
    },
    {
      id: "ig-3",
      image_url: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&q=80",
      post_url: "https://www.instagram.com/trends_by_ramya",
      caption: "Everyday elegance with customized blackbeads strands. Customized length. 🌸",
    },
    {
      id: "ig-4",
      image_url: "https://images.unsplash.com/photo-1583391733981-5c55a0b0e0f0?w=600&q=80",
      post_url: "https://www.instagram.com/trends_by_ramya",
      caption: "Stunning block print kurtis perfect for the summer season. Order yours now!",
    },
  ];
}

export async function addInstagramPost(post: Omit<InstagramPost, 'id'> & { id?: string }): Promise<InstagramPost> {
  return {
    ...post,
    id: post.id || `ig-${Date.now()}`,
    created_at: new Date().toISOString(),
  };
}

export async function deleteInstagramPost(id: string): Promise<boolean> {
  return true;
}

/* ============================================================================
   REVIEWS SERVICES
   ============================================================================ */

export async function getReviews(): Promise<Review[]> {
  const client = await getSupabaseClient();
  const { data, error } = await client.from('reviews').select('*').order('created_at', { ascending: false });
  if (error) {
    console.error('Supabase getReviews error:', error);
    return [];
  }
  return (data || []).map(mapReviewFromDB);
}

export async function addReview(review: Omit<Review, 'id' | 'created_at'> & { id?: string }): Promise<Review> {
  // Use service role if available to bypass potential guest insert blocks in RLS
  const client = await getSupabaseClient(true);
  const reviewId = ensureUUID(review.id);
  const dbReview = mapReviewToDB({ ...review, id: reviewId });

  const { data, error } = await client.from('reviews').insert([dbReview]).select();
  if (error) {
    throw new Error(`Supabase addReview error: ${error.message}`);
  }
  return mapReviewFromDB(data[0]);
}

export async function updateReview(id: string, updates: Partial<Review>): Promise<Review | null> {
  const client = await getSupabaseClient(true);

  // Fetch the existing review first to preserve JSON metadata in review_text
  const { data: existingData, error: fetchError } = await client.from('reviews').select('*').eq('id', id).single();
  if (fetchError || !existingData) {
    throw new Error(`Failed to fetch review for update: ${fetchError?.message}`);
  }

  const mappedExisting = mapReviewFromDB(existingData);
  const updatedReview = { ...mappedExisting, ...updates };
  const dbUpdates = mapReviewToDB(updatedReview);

  const { data, error } = await client.from('reviews').update({
    customer_name: dbUpdates.customer_name,
    rating: dbUpdates.rating,
    review_text: dbUpdates.review_text,
    approved: dbUpdates.approved,
  }).eq('id', id).select();

  if (error) {
    throw new Error(`Supabase updateReview error: ${error.message}`);
  }
  return data ? mapReviewFromDB(data[0]) : null;
}

export async function deleteReview(id: string): Promise<boolean> {
  const client = await getSupabaseClient(true);
  const { error } = await client.from('reviews').delete().eq('id', id);
  if (error) {
    console.error('Supabase deleteReview error:', error);
    return false;
  }
  return true;
}
