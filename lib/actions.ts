"use server";

import { cookies } from "next/headers";
import {
  getCategories,
  addCategory,
  deleteCategory,
  getProducts,
  getProductById,
  addProduct,
  updateProduct,
  deleteProduct,
  getSiteConfig,
  updateSiteConfig,
  getInstagramFeed,
  addInstagramPost,
  deleteInstagramPost,
  supabase,
  getReviews,
  addReview,
  updateReview,
  deleteReview,
  getSupabaseClient,
} from "./db";
import { Category, Product, SiteConfig, InstagramPost, Review } from "./types";

// Mock Admin Credentials (used if Supabase is disabled)
const MOCK_ADMIN_EMAIL = "admin@trendsbyramya.com";
const MOCK_ADMIN_PASSWORD = "adminpassword123";
const SESSION_COOKIE_NAME = "ramya-admin-session";

/* ============================================================================
   AUTH ACTIONS
   ============================================================================ */

export async function loginAdmin(email: string, password: string): Promise<{ success: boolean; error?: string }> {
  // If Supabase is enabled, use Supabase Auth
  if (supabase) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        return { success: false, error: error.message };
      }
      
      // Set session cookie
      if (data.session) {
        const cookieStore = await cookies();
        cookieStore.set(SESSION_COOKIE_NAME, data.session.access_token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          maxAge: 60 * 60 * 24 * 7, // 1 week
          path: "/",
        });
        return { success: true };
      }
      return { success: false, error: "Authentication failed. No session created." };
    } catch (err: any) {
      return { success: false, error: err.message || "An error occurred during sign-in." };
    }
  } else {
    // Local Mock Auth
    if (email === MOCK_ADMIN_EMAIL && password === MOCK_ADMIN_PASSWORD) {
      const cookieStore = await cookies();
      cookieStore.set(SESSION_COOKIE_NAME, "mock-admin-token-xyz-123", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 2, // 2 hours for mock session
        path: "/",
      });
      return { success: true };
    } else {
      return { success: false, error: "Invalid admin email or password." };
    }
  }
}

export async function logoutAdmin(): Promise<{ success: boolean }> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);

  if (supabase) {
    await supabase.auth.signOut();
  }
  
  return { success: true };
}

export async function checkAdminAuth(): Promise<boolean> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  
  if (!sessionToken) return false;

  if (supabase) {
    // Verify token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(sessionToken);
    if (error || !user) {
      return false;
    }
    return true;
  } else {
    // Mock token check
    return sessionToken === "mock-admin-token-xyz-123";
  }
}

/* ============================================================================
   CATEGORIES ACTIONS
   ============================================================================ */

export async function fetchCategories(): Promise<Category[]> {
  return getCategories();
}

export async function createCategory(category: Omit<Category, 'id'>): Promise<Category> {
  // Check auth first
  const isAuth = await checkAdminAuth();
  if (!isAuth) throw new Error("Unauthorized");
  return addCategory(category);
}

export async function removeCategory(id: string): Promise<boolean> {
  const isAuth = await checkAdminAuth();
  if (!isAuth) throw new Error("Unauthorized");
  return deleteCategory(id);
}

/* ============================================================================
   PRODUCTS ACTIONS
   ============================================================================ */

export async function fetchProducts(): Promise<Product[]> {
  return getProducts();
}

export async function fetchProductById(id: string): Promise<Product | null> {
  return getProductById(id);
}

export async function createProduct(product: Omit<Product, 'id'>): Promise<Product> {
  const isAuth = await checkAdminAuth();
  if (!isAuth) throw new Error("Unauthorized");
  return addProduct(product);
}

export async function saveProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
  const isAuth = await checkAdminAuth();
  if (!isAuth) throw new Error("Unauthorized");
  return updateProduct(id, updates);
}

export async function removeProduct(id: string): Promise<boolean> {
  const isAuth = await checkAdminAuth();
  if (!isAuth) throw new Error("Unauthorized");
  return deleteProduct(id);
}

/* ============================================================================
   SITE CONFIG / SETTINGS ACTIONS
   ============================================================================ */

export async function fetchSiteConfig(): Promise<SiteConfig> {
  return getSiteConfig();
}

export async function saveSiteConfig(updates: Partial<SiteConfig>): Promise<SiteConfig> {
  const isAuth = await checkAdminAuth();
  if (!isAuth) throw new Error("Unauthorized");
  return updateSiteConfig(updates);
}

/* ============================================================================
   INSTAGRAM FEED ACTIONS
   ============================================================================ */

export async function fetchInstagramFeed(): Promise<InstagramPost[]> {
  return getInstagramFeed();
}

export async function createInstagramPost(post: Omit<InstagramPost, 'id'>): Promise<InstagramPost> {
  const isAuth = await checkAdminAuth();
  if (!isAuth) throw new Error("Unauthorized");
  return addInstagramPost(post);
}

export async function removeInstagramPost(id: string): Promise<boolean> {
  const isAuth = await checkAdminAuth();
  if (!isAuth) throw new Error("Unauthorized");
  return deleteInstagramPost(id);
}

/* ============================================================================
   REVIEWS ACTIONS
   ============================================================================ */

export async function fetchReviews(): Promise<Review[]> {
  return getReviews();
}

async function uploadToSupabaseStorage(file: File, folder: string): Promise<string> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  
  const originalName = file.name || 'image.jpg';
  const ext = originalName.includes('.') ? originalName.slice(originalName.lastIndexOf('.')) : '.jpg';
  const filename = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2, 7)}${ext}`;

  const client = await getSupabaseClient(true);
  const { data, error } = await client.storage
    .from('product-images')
    .upload(filename, buffer, {
      contentType: file.type || 'image/jpeg',
      upsert: true
    });

  if (error) {
    throw new Error(`Storage upload failed: ${error.message}`);
  }

  const { data: urlData } = client.storage
    .from('product-images')
    .getPublicUrl(filename);

  return urlData.publicUrl;
}

export async function createReviewAction(formData: FormData): Promise<{ success: boolean; review?: Review; error?: string }> {
  try {
    const name = formData.get("name") as string;
    const productId = formData.get("product_id") as string;
    const productName = formData.get("product_name") as string;
    const rating = Number(formData.get("rating"));
    const comment = formData.get("comment") as string;
    const imageFile = formData.get("image") as File | null;

    let imageUrl = "";
    if (imageFile && imageFile.size > 0) {
      imageUrl = await uploadToSupabaseStorage(imageFile, "reviews");
    }

    const reviewData = {
      product_id: productId,
      product_name: productName,
      rating,
      name,
      comment,
      image_url: imageUrl || undefined,
      status: "pending" as const,
      featured: false,
    };

    const review = await addReview(reviewData);
    return { success: true, review };
  } catch (err: any) {
    console.error("Error creating review:", err);
    return { success: false, error: err.message || "Failed to submit review." };
  }
}

export async function approveReviewAction(id: string): Promise<boolean> {
  const isAuth = await checkAdminAuth();
  if (!isAuth) throw new Error("Unauthorized");
  const updated = await updateReview(id, { status: "approved" });
  return !!updated;
}

export async function rejectReviewAction(id: string): Promise<boolean> {
  const isAuth = await checkAdminAuth();
  if (!isAuth) throw new Error("Unauthorized");
  const updated = await updateReview(id, { status: "rejected" });
  return !!updated;
}

export async function toggleFeatureReviewAction(id: string, featured: boolean): Promise<boolean> {
  const isAuth = await checkAdminAuth();
  if (!isAuth) throw new Error("Unauthorized");
  const updated = await updateReview(id, { featured });
  return !!updated;
}

export async function removeReviewAction(id: string): Promise<boolean> {
  const isAuth = await checkAdminAuth();
  if (!isAuth) throw new Error("Unauthorized");
  return deleteReview(id);
}

/* ============================================================================
   IMAGE UPLOAD ACTION
   ============================================================================ */

export async function uploadImageAction(formData: FormData): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const isAuth = await checkAdminAuth();
    if (!isAuth) throw new Error("Unauthorized");

    const file = formData.get("file") as File;
    if (!file) throw new Error("No file uploaded");

    const publicUrl = await uploadToSupabaseStorage(file, "products");
    return { success: true, url: publicUrl };
  } catch (err: any) {
    console.error("Error uploading image:", err);
    return { success: false, error: err.message || "Failed to upload image." };
  }
}

