"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  LogOut,
  LayoutDashboard,
  Package,
  ListCollapse,
  Instagram,
  Settings,
  Plus,
  Trash2,
  Edit2,
  AlertTriangle,
  CheckCircle,
  Eye,
  X,
  FileImage,
  Layers,
  MessageSquare,
  Inbox
} from "lucide-react";
import { Product, Category, SiteConfig, InstagramPost, Review, ContactEnquiry } from "@/lib/types";
import {
  logoutAdmin,
  createProduct,
  saveProduct,
  removeProduct,
  createCategory,
  removeCategory,
  saveCategory,
  saveSiteConfig,
  createInstagramPost,
  removeInstagramPost,
  approveReviewAction,
  rejectReviewAction,
  toggleFeatureReviewAction,
  removeReviewAction,
  uploadImageAction,
  uploadCategoryImageAction,
  removeContactEnquiryAction
} from "@/lib/actions";

interface DashboardClientProps {
  initialProducts: Product[];
  initialCategories: Category[];
  initialSiteConfig: SiteConfig;
  initialInstagramFeed: InstagramPost[];
  initialReviews: Review[];
  initialEnquiries: ContactEnquiry[];
}

export default function DashboardClient({
  initialProducts,
  initialCategories,
  initialSiteConfig,
  initialInstagramFeed,
  initialReviews,
  initialEnquiries
}: DashboardClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"overview" | "products" | "inventory" | "categories" | "settings" | "instagram" | "reviews" | "enquiries">("overview");
  const [reviews, setReviews] = useState<Review[]>(initialReviews || []);
  const [enquiries, setEnquiries] = useState<ContactEnquiry[]>(initialEnquiries || []);
  const [isUploading, setIsUploading] = useState(false);

  // Local state initialized with server props
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [siteConfig, setSiteConfig] = useState<SiteConfig>(initialSiteConfig);
  const [instagramFeed, setInstagramFeed] = useState<InstagramPost[]>(initialInstagramFeed);

  // Status Alerts
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Modal States
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [instagramModalOpen, setInstagramModalOpen] = useState(false);

  // Form Fields - Product
  const [pName, setPName] = useState("");
  const [pDesc, setPDesc] = useState("");
  const [pPrice, setPPrice] = useState<string>("");
  const [pParentSlug, setPParentSlug] = useState("");
  const [pCategory, setPCategory] = useState("");
  const [pStatus, setPStatus] = useState<"in_stock" | "low_stock" | "out_of_stock">("in_stock");
  const [pBadge, setPBadge] = useState<Product["badge"]>(null);
  const [pImages, setPImages] = useState<string[]>([""]);

  // Form Fields - Category
  const [cName, setCName] = useState("");
  const [cParentType, setCParentType] = useState<string>("root");
  const [cImageUrl, setCImageUrl] = useState("");
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isUploadingCategoryImg, setIsUploadingCategoryImg] = useState(false);

  // Form Fields - Settings
  const [sWhatsapp, setSWhatsapp] = useState(siteConfig.whatsapp_number);
  const [sEmail, setSEmail] = useState(siteConfig.email_address);
  const [sInstagram, setSInstagram] = useState(siteConfig.instagram_url);

  // Form Fields - Instagram Post
  const [igImage, setIgImage] = useState("");
  const [igUrl, setIgUrl] = useState("");
  const [igCaption, setIgCaption] = useState("");

  const triggerAlert = (type: "success" | "error", message: string) => {
    if (type === "success") {
      setSuccessMessage(message);
      setTimeout(() => setSuccessMessage(null), 3500);
    } else {
      setErrorMessage(message);
      setTimeout(() => setErrorMessage(null), 3500);
    }
  };

  const handleLogout = async () => {
    await logoutAdmin();
    router.push("/admin/login");
    router.refresh();
  };

  // Open product modal for add
  const handleAddProductClick = () => {
    setEditingProduct(null);
    setPName("");
    setPDesc("");
    setPPrice("");
    const parentCats = categories.filter(c => c.parent_type === "root");
    const defaultParent = parentCats[0];
    setPParentSlug(defaultParent?.slug || "");
    const subsForDefaultParent = defaultParent 
      ? categories.filter(c => c.parent_type === defaultParent.slug) 
      : [];
    setPCategory(subsForDefaultParent[0]?.id || "");
    setPStatus("in_stock");
    setPBadge(null);
    setPImages([""]);
    setProductModalOpen(true);
  };

  // Open product modal for edit
  const handleEditProductClick = (product: Product) => {
    setEditingProduct(product);
    setPName(product.name);
    setPDesc(product.description);
    setPPrice(product.price.toString());
    setPCategory(product.category_id);
    
    // Find parent category from product.category_id
    const matchedSub = categories.find(c => c.id === product.category_id);
    if (matchedSub) {
      setPParentSlug(matchedSub.parent_type);
    } else {
      setPParentSlug("");
    }
    
    setPStatus(product.status);
    setPBadge(product.badge);
    setPImages(product.images.length > 0 ? product.images : [""]);
    setProductModalOpen(true);
  };

  // Save Product (Add or Edit)
  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!pPrice || Number(pPrice) <= 0) {
      triggerAlert("error", "Please enter a valid price greater than 0.");
      return;
    }
    if (!pCategory) {
      triggerAlert("error", "Please select a category.");
      return;
    }

    const imagesList = pImages.filter((img) => img.trim() !== "");
    if (imagesList.length === 0) {
      imagesList.push("https://images.unsplash.com/photo-1617032213178-1b887b1b3b0e?w=800&q=80"); // fallback
    }

    const payload = {
      name: pName,
      description: pDesc,
      price: Number(pPrice),
      category_id: pCategory,
      status: pStatus,
      badge: pBadge,
      images: imagesList,
    };

    try {
      if (editingProduct) {
        // Edit flow
        const res = await saveProduct(editingProduct.id, payload);
        if (res) {
          setProducts(products.map((p) => (p.id === editingProduct.id ? res : p)));
          triggerAlert("success", "Product updated successfully!");
        }
      } else {
        // Add flow
        const res = await createProduct(payload);
        if (res) {
          setProducts([res, ...products]);
          triggerAlert("success", "Product created successfully!");
        }
      }
      setProductModalOpen(false);
    } catch (err: any) {
      triggerAlert("error", err.message || "Failed to save product.");
    }
  };

  // Quick Stock updates (Inventory tab)
  const handleStockChange = async (productId: string, status: Product["status"]) => {
    try {
      const res = await saveProduct(productId, { status });
      if (res) {
        setProducts(products.map((p) => (p.id === productId ? res : p)));
        triggerAlert("success", "Stock status updated!");
      }
    } catch (err: any) {
      triggerAlert("error", err.message || "Failed to update stock.");
    }
  };

  // Delete Product
  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      const success = await removeProduct(id);
      if (success) {
        setProducts(products.filter((p) => p.id !== id));
        triggerAlert("success", "Product deleted successfully!");
      }
    } catch (err: any) {
      triggerAlert("error", err.message || "Failed to delete product.");
    }
  };

  // Add/Edit Category
  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cName.trim() === "") return;

    try {
      if (editingCategory) {
        // Edit Category
        const res = await saveCategory(editingCategory.id, {
          name: cName,
          parent_type: cParentType,
          slug: cName.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          image_url: cImageUrl || undefined,
        });
        if (res) {
          setCategories(categories.map((c) => (c.id === editingCategory.id ? res : c)));
          triggerAlert("success", "Category updated successfully!");
          setCName("");
          setCImageUrl("");
          setEditingCategory(null);
          setCategoryModalOpen(false);
        }
      } else {
        // Create Category
        const res = await createCategory({
          name: cName,
          parent_type: cParentType,
          slug: cName.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          image_url: cImageUrl || undefined,
        });
        if (res) {
          setCategories([...categories, res]);
          triggerAlert("success", "Category created successfully!");
          setCName("");
          setCImageUrl("");
          setCategoryModalOpen(false);
        }
      }
    } catch (err: any) {
      triggerAlert("error", err.message || "Failed to save category.");
    }
  };

  // Delete Category
  const handleDeleteCategory = async (id: string) => {
    if (!confirm("Deleting this category will unlink all its products. Continue?")) return;
    try {
      const success = await removeCategory(id);
      if (success) {
        setCategories(categories.filter((c) => c.id !== id));
        setProducts(products.map((p) => (p.category_id === id ? { ...p, category_id: "" } : p)));
        triggerAlert("success", "Category deleted successfully!");
      }
    } catch (err: any) {
      triggerAlert("error", err.message || "Failed to delete category.");
    }
  };

  // Delete Enquiry
  const handleDeleteEnquiry = async (id: string) => {
    if (!confirm("Are you sure you want to delete this enquiry?")) return;
    try {
      const success = await removeContactEnquiryAction(id);
      if (success) {
        setEnquiries(enquiries.filter((eq) => eq.id !== id));
        triggerAlert("success", "Enquiry deleted successfully!");
      }
    } catch (err: any) {
      triggerAlert("error", err.message || "Failed to delete enquiry.");
    }
  };

  // Save Settings
  const handleSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await saveSiteConfig({
        whatsapp_number: sWhatsapp,
        email_address: sEmail,
        instagram_url: sInstagram,
      });
      if (res) {
        setSiteConfig(res);
        triggerAlert("success", "Contact configurations saved successfully!");
      }
    } catch (err: any) {
      triggerAlert("error", err.message || "Failed to save contact settings.");
    }
  };

  // Add Instagram post link
  const handleInstagramSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (igImage.trim() === "" || igUrl.trim() === "") return;

    try {
      const res = await createInstagramPost({
        image_url: igImage,
        post_url: igUrl,
        caption: igCaption,
      });
      if (res) {
        setInstagramFeed([res, ...instagramFeed]);
        triggerAlert("success", "Instagram post added successfully!");
        setIgImage("");
        setIgUrl("");
        setIgCaption("");
        setInstagramModalOpen(false);
      }
    } catch (err: any) {
      triggerAlert("error", err.message || "Failed to add Instagram feed post.");
    }
  };

  // Delete Instagram post
  const handleDeleteInstagram = async (id: string) => {
    if (!confirm("Are you sure you want to delete this post?")) return;
    try {
      const success = await removeInstagramPost(id);
      if (success) {
        setInstagramFeed(instagramFeed.filter((item) => item.id !== id));
        triggerAlert("success", "Instagram post deleted!");
      }
    } catch (err: any) {
      triggerAlert("error", err.message || "Failed to delete post.");
    }
  };

  // Image URL management helper
  const handleImageChange = (index: number, val: string) => {
    const list = [...pImages];
    list[index] = val;
    setPImages(list);
  };

  const addImageField = () => {
    setPImages([...pImages, ""]);
  };

  const removeImageField = (index: number) => {
    const list = pImages.filter((_, idx) => idx !== index);
    setPImages(list.length > 0 ? list : [""]);
  };

  const handleApproveReview = async (id: string) => {
    try {
      const success = await approveReviewAction(id);
      if (success) {
        setReviews(reviews.map((r) => (r.id === id ? { ...r, status: "approved" } : r)));
        triggerAlert("success", "Review approved successfully!");
      } else {
        triggerAlert("error", "Failed to approve review.");
      }
    } catch (err: any) {
      triggerAlert("error", err.message || "Failed to approve review.");
    }
  };

  const handleRejectReview = async (id: string) => {
    try {
      const success = await rejectReviewAction(id);
      if (success) {
        setReviews(reviews.map((r) => (r.id === id ? { ...r, status: "rejected", featured: false } : r)));
        triggerAlert("success", "Review rejected successfully!");
      } else {
        triggerAlert("error", "Failed to reject review.");
      }
    } catch (err: any) {
      triggerAlert("error", err.message || "Failed to reject review.");
    }
  };

  const handleToggleFeatureReview = async (id: string, featured: boolean) => {
    try {
      const success = await toggleFeatureReviewAction(id, featured);
      if (success) {
        setReviews(reviews.map((r) => (r.id === id ? { ...r, featured } : r)));
        triggerAlert("success", featured ? "Review featured on homepage!" : "Review unfeatured.");
      } else {
        triggerAlert("error", "Failed to update review feature status.");
      }
    } catch (err: any) {
      triggerAlert("error", err.message || "Failed to update review feature status.");
    }
  };

  const handleDeleteReview = async (id: string) => {
    if (!confirm("Are you sure you want to delete this review permanently?")) return;
    try {
      const success = await removeReviewAction(id);
      if (success) {
        setReviews(reviews.filter((r) => r.id !== id));
        triggerAlert("success", "Review deleted successfully!");
      } else {
        triggerAlert("error", "Failed to delete review.");
      }
    } catch (err: any) {
      triggerAlert("error", err.message || "Failed to delete review.");
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setIsUploading(true);
    try {
      const uploadedUrls: string[] = [];
      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);
        const res = await uploadImageAction(formData);
        if (res.success && res.url) {
          uploadedUrls.push(res.url);
        } else {
          triggerAlert("error", `Failed to upload ${file.name}: ${res.error || "Unknown error"}`);
        }
      }
      
      const currentList = pImages.filter((img) => img.trim() !== "");
      setPImages([...currentList, ...uploadedUrls]);
      triggerAlert("success", "Images uploaded successfully!");
    } catch (err: any) {
      triggerAlert("error", err.message || "Failed to upload images.");
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  const handleCategoryImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const file = e.target.files[0];
    if (!file) return;

    setIsUploadingCategoryImg(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await uploadCategoryImageAction(formData);
      if (res.success && res.url) {
        setCImageUrl(res.url);
        triggerAlert("success", "Category image uploaded successfully!");
      } else {
        triggerAlert("error", `Failed to upload: ${res.error || "Unknown error"}`);
      }
    } catch (err: any) {
      triggerAlert("error", err.message || "Failed to upload category image.");
    } finally {
      setIsUploadingCategoryImg(false);
      e.target.value = "";
    }
  };

  // Quick statistics calculations
  const stats = {
    totalProducts: products.length,
    inStock: products.filter((p) => p.status === "in_stock").length,
    lowStock: products.filter((p) => p.status === "low_stock").length,
    outOfStock: products.filter((p) => p.status === "out_of_stock").length,
    totalCategories: categories.length,
  };

  return (
    <div className="min-h-screen bg-ivory flex flex-col md:flex-row">
      {/* Sidebar Menu */}
      <aside className="w-full md:w-64 bg-ink text-ivory flex flex-col justify-between shrink-0">
        <div>
          {/* Header Branding */}
          <div className="p-6 border-b border-gold/10 flex flex-col">
            <span className="font-display text-xl font-bold tracking-wider text-gold">Trends Control</span>
            <span className="text-[9px] uppercase tracking-widest text-ivory/50 font-semibold mt-0.5">
              Dashboard Panel
            </span>
          </div>

          {/* Navigation Menu */}
          <nav className="p-4 space-y-1">
            {[
              { id: "overview", name: "Overview", icon: LayoutDashboard },
              { id: "products", name: "Products", icon: Package },
              { id: "inventory", name: "Stock Manager", icon: ListCollapse },
              { id: "categories", name: "Categories", icon: Layers },
              { id: "reviews", name: "Customer Reviews", icon: MessageSquare },
              { id: "enquiries", name: "Enquiries", icon: Inbox },
              { id: "instagram", name: "Instagram Feed", icon: Instagram },
              { id: "settings", name: "Contact Settings", icon: Settings },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors ${
                  activeTab === tab.id
                    ? "bg-gold text-ink"
                    : "text-ivory/70 hover:bg-gold/10 hover:text-white"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Footer Logout */}
        <div className="p-4 border-t border-gold/10">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-maroon/20 hover:bg-maroon text-white hover:text-white text-xs font-bold uppercase tracking-widest transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Logout Session
          </button>
        </div>
      </aside>

      {/* Main Workspace Area */}
      <main className="flex-grow p-6 md:p-8 overflow-y-auto max-h-screen relative">
        {/* Banner Alert Toast */}
        {successMessage && (
          <div className="fixed top-6 right-6 z-50 bg-green-500 text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-2 text-xs font-semibold animate-fade-in">
            <CheckCircle className="w-4 h-4" /> {successMessage}
          </div>
        )}
        {errorMessage && (
          <div className="fixed top-6 right-6 z-50 bg-rose-500 text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-2 text-xs font-semibold animate-fade-in">
            <AlertTriangle className="w-4 h-4" /> {errorMessage}
          </div>
        )}

        {/* Tab content renderer */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            <div className="flex justify-between items-center border-b border-maroon/10 pb-4">
              <h1 className="font-display text-2xl font-bold text-ink">Dashboard Overview</h1>
              <Link href="/" target="_blank" className="flex items-center gap-1.5 text-xs font-bold text-maroon hover:underline">
                <Eye className="w-4 h-4" /> View Live Storefront
              </Link>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { title: "Total Products", count: stats.totalProducts, desc: "Catalog items", color: "bg-white border-gold/10" },
                { title: "Active Categories", count: stats.totalCategories, desc: "Collection channels", color: "bg-white border-gold/10" },
                { title: "Stock Alert", count: stats.outOfStock, desc: "Out of stock items", color: stats.outOfStock > 0 ? "bg-rose-50/50 border-rose-200" : "bg-white border-gold/10" },
                { title: "Low Stock Items", count: stats.lowStock, desc: "Stock nearing empty", color: "bg-white border-gold/10" },
              ].map((card, idx) => (
                <div key={idx} className={`p-6 rounded-2xl border shadow-sm ${card.color}`}>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-ink-muted">{card.title}</h3>
                  <p className="font-display text-3xl font-bold text-ink mt-2">{card.count}</p>
                  <p className="text-[10px] text-ink-muted/60 mt-1">{card.desc}</p>
                </div>
              ))}
            </div>

            {/* Inventory Alerts section */}
            <div className="bg-white p-6 rounded-2xl border border-maroon/5 shadow-sm space-y-4">
              <h2 className="font-display text-base font-bold text-ink flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-maroon" /> Critical Stock Notices
              </h2>
              {stats.outOfStock === 0 && stats.lowStock === 0 ? (
                <p className="text-xs text-green-600 font-semibold bg-green-50 p-4 rounded-xl">
                  All systems green. All products are fully in stock!
                </p>
              ) : (
                <div className="divide-y divide-gray-100 text-xs">
                  {products
                    .filter((p) => p.status !== "in_stock")
                    .map((p) => (
                      <div key={p.id} className="py-2.5 flex justify-between items-center">
                        <span className="font-bold text-ink">{p.name} (SKU: {p.id})</span>
                        <span className={`px-2.5 py-0.5 rounded font-bold uppercase text-[9px] ${
                          p.status === "out_of_stock" ? "bg-rose-50 text-rose-600" : "bg-amber-50 text-amber-600"
                        }`}>
                          {p.status === "out_of_stock" ? "Out of Stock" : "Low Stock"}
                        </span>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Products CRUD Management */}
        {activeTab === "products" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-maroon/10 pb-4">
              <h1 className="font-display text-2xl font-bold text-ink">Product Catalog Manager</h1>
              <button
                onClick={handleAddProductClick}
                className="inline-flex items-center gap-1.5 rounded-full maroon-gradient px-5 py-2 text-xs font-bold uppercase tracking-widest text-white shadow-sm"
              >
                <Plus className="w-4 h-4" /> Add Product
              </button>
            </div>

            {/* Product Table */}
            <div className="bg-white rounded-2xl border border-maroon/5 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-ivory/50 border-b border-maroon/10 text-[10px] uppercase font-bold text-ink-muted">
                      <th className="p-4">Item</th>
                      <th className="p-4">Category</th>
                      <th className="p-4">Price</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Badge</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {products.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-10 text-center text-ink-muted">
                          No products found. Click Add Product to seed.
                        </td>
                      </tr>
                    ) : (
                      products.map((p) => {
                        const cat = categories.find((c) => c.id === p.category_id);
                        return (
                          <tr key={p.id} className="hover:bg-ivory/10 transition-colors">
                            {/* Product Info */}
                            <td className="p-4 flex items-center gap-3">
                              <div className="w-10 h-12 rounded bg-ivory overflow-hidden shrink-0 border border-maroon/5">
                                <img src={p.images[0]} alt="" className="w-full h-full object-cover" />
                              </div>
                              <div>
                                <span className="font-bold text-ink block leading-snug">{p.name}</span>
                                <span className="text-[9px] text-ink-muted/50 block font-medium">SKU: {p.id}</span>
                              </div>
                            </td>
                            {/* Category */}
                            <td className="p-4 text-ink font-semibold">{cat ? cat.name : "Unlinked"}</td>
                            {/* Price */}
                            <td className="p-4 text-maroon font-bold">&#8377;{p.price}</td>
                            {/* Status */}
                            <td className="p-4">
                              <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                                p.status === "in_stock" ? "bg-green-50 text-green-600" :
                                p.status === "low_stock" ? "bg-amber-50 text-amber-600" :
                                "bg-rose-50 text-rose-600"
                              }`}>
                                {p.status}
                              </span>
                            </td>
                            {/* Badge */}
                            <td className="p-4">
                              {p.badge ? (
                                <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-ink text-ivory">
                                  {p.badge}
                                </span>
                              ) : (
                                <span className="text-gray-300">-</span>
                              )}
                            </td>
                            {/* Action Buttons */}
                            <td className="p-4 text-right space-x-2">
                              <button
                                onClick={() => handleEditProductClick(p)}
                                className="p-1.5 border border-gold/20 hover:border-gold hover:bg-gold/10 text-gold-light rounded transition-colors"
                                title="Edit Product"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(p.id)}
                                className="p-1.5 border border-rose-200 hover:border-rose-600 hover:bg-rose-50 text-rose-500 rounded transition-colors"
                                title="Delete Product"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Quick Inventory Manager */}
        {activeTab === "inventory" && (
          <div className="space-y-6">
            <div className="border-b border-maroon/10 pb-4">
              <h1 className="font-display text-2xl font-bold text-ink">Inventory Stock Manager</h1>
            </div>

            {/* Quick Grid Table */}
            <div className="bg-white rounded-2xl border border-maroon/5 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-ivory/50 border-b border-maroon/10 text-[10px] uppercase font-bold text-ink-muted">
                      <th className="p-4">Product Name</th>
                      <th className="p-4">Category</th>
                      <th className="p-4">Status Selector</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {products.map((p) => {
                      const cat = categories.find((c) => c.id === p.category_id);
                      return (
                        <tr key={p.id} className="hover:bg-ivory/10 transition-colors">
                          <td className="p-4 flex items-center gap-3">
                            <div className="w-8 h-10 rounded bg-ivory overflow-hidden shrink-0">
                              <img src={p.images[0]} alt="" className="w-full h-full object-cover" />
                            </div>
                            <span className="font-bold text-ink">{p.name}</span>
                          </td>
                          <td className="p-4 text-ink font-semibold">{cat ? cat.name : "Unlinked"}</td>
                          <td className="p-4">
                            <select
                              value={p.status}
                              onChange={(e) => handleStockChange(p.id, e.target.value as any)}
                              className={`border focus:outline-none rounded px-2.5 py-1.5 font-semibold text-xs ${
                                p.status === "in_stock" ? "border-green-300 text-green-600 bg-green-50" :
                                p.status === "low_stock" ? "border-amber-300 text-amber-600 bg-amber-50" :
                                "border-rose-300 text-rose-600 bg-rose-50"
                              }`}
                            >
                              <option value="in_stock">In Stock</option>
                              <option value="low_stock">Low Stock</option>
                              <option value="out_of_stock">Out of Stock</option>
                            </select>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Category Management */}
        {activeTab === "categories" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-maroon/10 pb-4">
              <h1 className="font-display text-2xl font-bold text-ink">Categories Manager</h1>
              <button
                onClick={() => {
                  setEditingCategory(null);
                  setCName("");
                  setCParentType("root");
                  setCImageUrl("");
                  setCategoryModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 rounded-full maroon-gradient px-5 py-2 text-xs font-bold uppercase tracking-widest text-white shadow-sm"
              >
                <Plus className="w-4 h-4" /> Add Category
              </button>
            </div>

            {/* Categories Grids */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Parent Categories Section */}
              <div className="bg-white p-6 rounded-2xl border border-maroon/5 shadow-sm space-y-4">
                <h2 className="font-display text-base font-bold text-ink border-b border-maroon/5 pb-2">
                  Parent Categories
                </h2>
                <div className="divide-y divide-gray-100 text-xs max-h-[400px] overflow-y-auto pr-1">
                  {categories
                    .filter((c) => c.parent_type === "root")
                    .map((c) => (
                      <div key={c.id} className="py-3 flex items-center justify-between gap-4 border-b border-gray-100 last:border-b-0">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-ivory border border-maroon/10 overflow-hidden flex-shrink-0">
                            {c.image_url ? (
                              <img src={c.image_url} alt={c.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                                <FileImage className="w-5 h-5 text-maroon/20" />
                              </div>
                            )}
                          </div>
                          <div>
                            <span className="font-bold text-ink block">{c.name}</span>
                            <span className="text-[10px] text-ink-muted">slug: {c.slug}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setEditingCategory(c);
                              setCName(c.name);
                              setCParentType(c.parent_type);
                              setCImageUrl(c.image_url || "");
                              setCategoryModalOpen(true);
                            }}
                            className="text-gray-400 hover:text-gold transition-colors p-1"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(c.id)}
                            className="text-gray-400 hover:text-rose-600 transition-colors p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Subcategories Section */}
              <div className="bg-white p-6 rounded-2xl border border-maroon/5 shadow-sm space-y-4">
                <h2 className="font-display text-base font-bold text-ink border-b border-maroon/5 pb-2">
                  Subcategories
                </h2>
                <div className="divide-y divide-gray-100 text-xs max-h-[400px] overflow-y-auto pr-1">
                  {categories
                    .filter((c) => c.parent_type !== "root")
                    .map((c) => {
                      const parent = categories.find(p => p.slug === c.parent_type);
                      return (
                        <div key={c.id} className="py-3 flex items-center justify-between gap-4 border-b border-gray-100 last:border-b-0">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-ivory border border-maroon/10 overflow-hidden flex-shrink-0">
                              {c.image_url ? (
                                <img src={c.image_url} alt={c.name} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                                  <FileImage className="w-5 h-5 text-maroon/20" />
                                </div>
                              )}
                            </div>
                            <div>
                              <span className="font-bold text-ink block">{c.name}</span>
                              <span className="text-[10px] text-ink-muted">
                                parent: {parent ? parent.name : c.parent_type}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setEditingCategory(c);
                                setCName(c.name);
                                setCParentType(c.parent_type);
                                setCImageUrl(c.image_url || "");
                                setCategoryModalOpen(true);
                              }}
                              className="text-gray-400 hover:text-gold transition-colors p-1"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteCategory(c.id)}
                              className="text-gray-400 hover:text-rose-600 transition-colors p-1"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab Enquiries */}
        {activeTab === "enquiries" && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center pb-4 border-b border-maroon/10">
              <div>
                <span className="text-[10px] uppercase font-bold text-gold tracking-widest">Enquiry Log</span>
                <h1 className="font-display text-2xl font-bold text-ink mt-1">Contact Enquiries</h1>
              </div>
              <span className="text-xs font-semibold text-ink-muted bg-ivory/80 border border-maroon/5 rounded-full px-3 py-1">
                Total Enquiries: {enquiries.length}
              </span>
            </div>

            {enquiries.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-2xl border border-maroon/5 shadow-sm">
                <Inbox className="w-12 h-12 text-maroon/30 mx-auto mb-4" />
                <p className="text-sm font-bold text-ink mb-1">No enquiries found</p>
                <p className="text-xs text-ink-muted">Enquiries submitted through the Contact Us form will appear here.</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-maroon/5 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-ivory border-b border-maroon/10 text-ink uppercase tracking-wider text-[10px] font-bold">
                        <th className="px-6 py-4">Customer</th>
                        <th className="px-6 py-4">WhatsApp Number</th>
                        <th className="px-6 py-4">Looking For</th>
                        <th className="px-6 py-4">Message</th>
                        <th className="px-6 py-4">Date</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-ink">
                      {enquiries.map((eq) => (
                        <tr key={eq.id} className="hover:bg-ivory/20 transition-colors">
                          <td className="px-6 py-4 font-bold">{eq.name}</td>
                          <td className="px-6 py-4 font-semibold text-maroon">{eq.whatsapp_number}</td>
                          <td className="px-6 py-4">
                            <span className="bg-gold/10 text-gold-dark font-bold px-2.5 py-1 rounded-full text-[9px] uppercase border border-gold/15">
                              {eq.looking_for}
                            </span>
                          </td>
                          <td className="px-6 py-4 max-w-xs break-words">{eq.message}</td>
                          <td className="px-6 py-4 text-ink-muted">
                            {eq.created_at ? new Date(eq.created_at).toLocaleDateString("en-IN", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }) : "N/A"}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => handleDeleteEnquiry(eq.id)}
                              className="text-gray-400 hover:text-rose-600 transition-colors p-1"
                              title="Delete Enquiry"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 5: Instagram Feed links */}
        {activeTab === "instagram" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-maroon/10 pb-4">
              <h1 className="font-display text-2xl font-bold text-ink">Instagram Feed</h1>
              <button
                onClick={() => {
                  setIgImage("");
                  setIgUrl("");
                  setIgCaption("");
                  setInstagramModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 rounded-full maroon-gradient px-5 py-2 text-xs font-bold uppercase tracking-widest text-white shadow-sm"
              >
                <Plus className="w-4 h-4" /> Add Post Link
              </button>
            </div>

            {/* Feed Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {instagramFeed.map((item) => (
                <div key={item.id} className="bg-white rounded-xl border border-maroon/5 shadow-sm overflow-hidden flex flex-col justify-between">
                  <div className="aspect-square bg-ivory overflow-hidden relative group">
                    <img src={item.image_url} alt="" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-ink/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                      <a href={item.post_url} target="_blank" rel="noopener noreferrer" className="p-2 bg-white rounded-full text-ink hover:text-maroon shadow-md">
                        <Eye className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                  <div className="p-4 flex items-center justify-between gap-3">
                    <p className="text-[10px] text-ink-muted font-semibold line-clamp-1">
                      {item.caption || "Instagram Post"}
                    </p>
                    <button
                      onClick={() => handleDeleteInstagram(item.id)}
                      className="text-gray-400 hover:text-rose-600 transition-colors p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab: Reviews Moderation */}
        {activeTab === "reviews" && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center pb-4 border-b border-maroon/10">
              <div>
                <span className="text-[10px] uppercase font-bold text-gold tracking-widest">Feedback Control</span>
                <h1 className="font-display text-2xl font-bold text-ink mt-1">Customer Reviews</h1>
              </div>
              <span className="text-xs font-semibold text-ink-muted bg-ivory/80 border border-maroon/5 rounded-full px-3 py-1">
                Total Reviews: {reviews.length}
              </span>
            </div>

            {reviews.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-2xl border border-maroon/5 shadow-sm">
                <MessageSquare className="w-12 h-12 text-maroon/30 mx-auto mb-4" />
                <p className="text-sm font-bold text-ink mb-1">No reviews submitted yet</p>
                <p className="text-xs text-ink-muted">Reviews submitted by customers on product pages will appear here.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {reviews.map((rev) => (
                  <div key={rev.id} className="bg-white p-6 rounded-2xl border border-maroon/5 shadow-sm flex flex-col justify-between space-y-4">
                    <div className="space-y-3">
                      {/* Review Header */}
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <h3 className="font-bold text-sm text-ink">{rev.name}</h3>
                          <span className="text-[9px] text-ink-muted block mt-0.5">
                            {new Date(rev.created_at).toLocaleDateString("en-IN", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </span>
                        </div>
                        {/* Status Badge */}
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                          rev.status === "approved"
                            ? "text-green-600 bg-green-50 border-green-200"
                            : rev.status === "rejected"
                            ? "text-rose-600 bg-rose-50 border-rose-200"
                            : "text-amber-600 bg-amber-50 border-amber-200"
                        }`}>
                          {rev.status === "approved" ? "Approved" : rev.status === "rejected" ? "Rejected" : "Pending"}
                        </span>
                      </div>

                      {/* Product Name */}
                      <div className="text-[10px] font-semibold text-maroon uppercase tracking-wider">
                        Product: {rev.product_name || "General"}
                      </div>

                      {/* Star Rating */}
                      <div className="flex gap-0.5 text-gold">
                        {[...Array(rev.rating)].map((_, i) => (
                          <span key={i} className="text-xs">★</span>
                        ))}
                        {[...Array(5 - rev.rating)].map((_, i) => (
                          <span key={i} className="text-xs text-gray-200">★</span>
                        ))}
                      </div>

                      {/* Review Comment */}
                      <p className="text-xs text-ink-muted leading-relaxed line-clamp-4">
                        &ldquo;{rev.comment}&rdquo;
                      </p>

                      {/* Optional Review Image */}
                      {rev.image_url && (
                        <div className="w-20 aspect-square bg-ivory rounded-lg overflow-hidden border border-maroon/5 mt-2">
                          <img
                            src={rev.image_url}
                            alt="Review item"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                    </div>

                    {/* Moderation Controls */}
                    <div className="pt-4 border-t border-maroon/5 flex flex-wrap gap-2 justify-end">
                      {rev.status !== "approved" && (
                        <button
                          onClick={() => handleApproveReview(rev.id)}
                          className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded text-[10px] font-bold uppercase tracking-wider cursor-pointer"
                        >
                          Approve
                        </button>
                      )}
                      
                      {rev.status !== "rejected" && (
                        <button
                          onClick={() => handleRejectReview(rev.id)}
                          className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded text-[10px] font-bold uppercase tracking-wider cursor-pointer"
                        >
                          Reject
                        </button>
                      )}

                      {rev.status === "approved" && (
                        <button
                          onClick={() => handleToggleFeatureReview(rev.id, !rev.featured)}
                          className={`px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-wider cursor-pointer border ${
                            rev.featured
                              ? "bg-gold border-gold text-ink"
                              : "border-maroon/20 text-maroon hover:bg-maroon/5"
                          }`}
                        >
                          {rev.featured ? "Featured ★" : "Feature"}
                        </button>
                      )}

                      <button
                        onClick={() => handleDeleteReview(rev.id)}
                        className="p-1.5 border border-rose-200 hover:bg-rose-50 text-rose-600 rounded cursor-pointer"
                        aria-label="Delete review"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 6: Contact Information Settings */}
        {activeTab === "settings" && (
          <div className="space-y-6 max-w-2xl">
            <div className="border-b border-maroon/10 pb-4">
              <h1 className="font-display text-2xl font-bold text-ink">Contact Settings</h1>
            </div>

            <form onSubmit={handleSettingsSubmit} className="bg-white p-6 rounded-2xl border border-maroon/5 shadow-sm space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-ink-muted tracking-wider block">
                  WhatsApp Number (with country code)
                </label>
                <input
                  type="text"
                  required
                  value={sWhatsapp}
                  onChange={(e) => setSWhatsapp(e.target.value)}
                  className="w-full border border-maroon/10 focus:border-maroon focus:outline-none rounded px-3 py-2 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-ink-muted tracking-wider block">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={sEmail}
                  onChange={(e) => setSEmail(e.target.value)}
                  className="w-full border border-maroon/10 focus:border-maroon focus:outline-none rounded px-3 py-2 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-ink-muted tracking-wider block">
                  Instagram Profile Link
                </label>
                <input
                  type="url"
                  required
                  value={sInstagram}
                  onChange={(e) => setSInstagram(e.target.value)}
                  className="w-full border border-maroon/10 focus:border-maroon focus:outline-none rounded px-3 py-2 text-xs"
                />
              </div>

              <button
                type="submit"
                className="rounded-full gold-gradient px-6 py-2.5 text-xs font-bold uppercase tracking-widest text-ink shadow-md hover:scale-[1.01] transition-transform cursor-pointer mt-4"
              >
                Save Contact Info
              </button>
            </form>
          </div>
        )}
      </main>

      {/* MODAL: Product Add/Edit */}
      {productModalOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" onClick={() => setProductModalOpen(false)} />
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-maroon/10 flex items-center justify-between bg-ivory/50">
              <h2 className="font-display text-base font-bold text-ink">
                {editingProduct ? `Edit: ${editingProduct.name}` : "Add New Product"}
              </h2>
              <button onClick={() => setProductModalOpen(false)} className="text-gray-400 hover:text-maroon">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleProductSubmit} className="p-5 overflow-y-auto space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-ink-muted">Product Title</label>
                <input
                  type="text"
                  required
                  value={pName}
                  onChange={(e) => setPName(e.target.value)}
                  className="w-full border border-maroon/10 focus:border-maroon focus:outline-none rounded px-3 py-2 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-ink-muted">Description</label>
                <textarea
                  required
                  rows={3}
                  value={pDesc}
                  onChange={(e) => setPDesc(e.target.value)}
                  className="w-full border border-maroon/10 focus:border-maroon focus:outline-none rounded px-3 py-2 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-ink-muted">Price (INR)</label>
                  <input
                    type="number"
                    required
                    min={0.01}
                    step="any"
                    value={pPrice}
                    onChange={(e) => setPPrice(e.target.value)}
                    className="w-full border border-maroon/10 focus:border-maroon focus:outline-none rounded px-3 py-2 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-ink-muted">Stock Status</label>
                  <select
                    value={pStatus}
                    onChange={(e) => setPStatus(e.target.value as any)}
                    className="w-full border border-maroon/10 focus:border-maroon focus:outline-none rounded px-3 py-2 text-xs bg-white"
                  >
                    <option value="in_stock">In Stock</option>
                    <option value="low_stock">Low Stock</option>
                    <option value="out_of_stock">Out of Stock</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-ink-muted">Parent Category</label>
                  <select
                    value={pParentSlug}
                    onChange={(e) => {
                      const newParentSlug = e.target.value;
                      setPParentSlug(newParentSlug);
                      // Auto-select first subcategory under this parent
                      const subcats = categories.filter(c => c.parent_type === newParentSlug);
                      setPCategory(subcats[0]?.id || "");
                    }}
                    className="w-full border border-maroon/10 focus:border-maroon focus:outline-none rounded px-3 py-2 text-xs bg-white"
                  >
                    <option value="">Select Parent Category</option>
                    {categories.filter(c => c.parent_type === "root").map((c) => (
                      <option key={c.id} value={c.slug}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-ink-muted">Subcategory</label>
                  <select
                    value={pCategory}
                    onChange={(e) => setPCategory(e.target.value)}
                    className="w-full border border-maroon/10 focus:border-maroon focus:outline-none rounded px-3 py-2 text-xs bg-white"
                    disabled={!pParentSlug}
                  >
                    <option value="">Select Subcategory</option>
                    {categories.filter(c => c.parent_type === pParentSlug).map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-ink-muted">Badge Banner</label>
                  <select
                    value={pBadge || "none"}
                    onChange={(e) => setPBadge(e.target.value === "none" ? null : e.target.value as any)}
                    className="w-full border border-maroon/10 focus:border-maroon focus:outline-none rounded px-3 py-2 text-xs bg-white"
                  >
                    <option value="none">None</option>
                    <option value="new_arrival">New Arrival</option>
                    <option value="bestseller">Bestseller</option>
                    <option value="trending">Trending</option>
                    <option value="limited_stock">Limited Stock</option>
                  </select>
                </div>
              </div>

              {/* Product Image Upload Area */}
              <div className="space-y-4 border-t border-maroon/10 pt-4">
                <label className="text-[10px] uppercase font-bold text-ink-muted block">Product Images</label>
                
                {/* Upload Trigger Area */}
                <div className="flex flex-col items-center justify-center border-2 border-dashed border-maroon/20 hover:border-maroon/50 rounded-2xl p-6 bg-ivory/20 text-center cursor-pointer transition-colors relative group">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    disabled={isUploading}
                  />
                  <FileImage className="w-8 h-8 text-maroon/60 mb-2 group-hover:scale-105 transition-transform" />
                  <span className="text-xs font-bold text-ink mb-1">
                    {isUploading ? "Uploading images..." : "Upload Product Images"}
                  </span>
                  <span className="text-[10px] text-ink-muted">
                    Supports PNG, JPG, JPEG &bull; Select multiple files to upload
                  </span>
                </div>

                {/* Previews Grid */}
                {pImages.filter(img => img.trim() !== "").length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 pt-2">
                    {pImages.filter(img => img.trim() !== "").map((img, idx) => (
                      <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-maroon/5 bg-ivory group shadow-sm animate-fade-in">
                        <img
                          src={img}
                          alt={`Preview ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeImageField(idx)}
                          className="absolute top-1.5 right-1.5 p-1 bg-rose-600 text-white rounded-full hover:bg-rose-700 cursor-pointer shadow-sm transition-colors z-30"
                          title="Remove image"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-maroon/10 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setProductModalOpen(false)}
                  className="rounded-full border border-maroon/20 hover:bg-maroon/5 px-5 py-2 text-xs font-bold uppercase tracking-widest text-maroon"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-full maroon-gradient px-6 py-2 text-xs font-bold uppercase tracking-widest text-white shadow-md cursor-pointer"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Category Add */}
      {categoryModalOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" onClick={() => {
            setCategoryModalOpen(false);
            setEditingCategory(null);
            setCName("");
            setCImageUrl("");
          }} />
          <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-maroon/10 pb-2">
              <h2 className="font-display text-sm font-bold text-ink">
                {editingCategory ? "Edit Category" : "Add Category"}
              </h2>
              <button
                onClick={() => {
                  setCategoryModalOpen(false);
                  setEditingCategory(null);
                  setCName("");
                  setCImageUrl("");
                }}
                className="text-gray-400 hover:text-maroon"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCategorySubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-ink-muted">Category Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bangles Collection"
                  value={cName}
                  onChange={(e) => setCName(e.target.value)}
                  className="w-full border border-maroon/10 focus:border-maroon focus:outline-none rounded px-3 py-2 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-ink-muted block">Category Level</label>
                <select
                  value={cParentType === "root" ? "parent" : "subcategory"}
                  onChange={(e) => {
                    if (e.target.value === "parent") {
                      setCParentType("root");
                    } else {
                      const firstParent = categories.find(c => c.parent_type === "root");
                      setCParentType(firstParent?.slug || "");
                    }
                  }}
                  className="w-full border border-maroon/10 focus:border-maroon focus:outline-none rounded px-3 py-2 text-xs bg-white"
                >
                  <option value="parent">Parent Category (Root)</option>
                  <option value="subcategory">Subcategory</option>
                </select>
              </div>

              {cParentType !== "root" && (
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-ink-muted block">Parent Category</label>
                  <select
                    value={cParentType}
                    onChange={(e) => setCParentType(e.target.value)}
                    className="w-full border border-maroon/10 focus:border-maroon focus:outline-none rounded px-3 py-2 text-xs bg-white"
                  >
                    {categories.filter(c => c.parent_type === "root").map((c) => (
                      <option key={c.id} value={c.slug}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Category Image Upload */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-ink-muted block">Category Image</label>
                {cImageUrl ? (
                  <div className="relative rounded-lg border border-maroon/10 overflow-hidden aspect-[4/3] bg-ivory">
                    <img src={cImageUrl} alt="Category preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setCImageUrl("")}
                      className="absolute top-2 right-2 p-1.5 bg-white/90 backdrop-blur-sm rounded-full text-rose-600 hover:text-rose-700 shadow-sm transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center border-2 border-dashed border-maroon/10 hover:border-maroon/30 rounded-xl p-4 cursor-pointer hover:bg-ivory/30 transition-all aspect-[4/3]">
                    {isUploadingCategoryImg ? (
                      <span className="text-maroon animate-pulse text-[10px] font-bold uppercase tracking-widest">Uploading...</span>
                    ) : (
                      <>
                        <FileImage className="w-8 h-8 text-maroon/20 mb-2" />
                        <span className="text-[10px] font-bold text-maroon uppercase tracking-wider">Upload Image</span>
                        <span className="text-[9px] text-ink-muted mt-1">PNG, JPG up to 5MB</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleCategoryImageChange}
                      disabled={isUploadingCategoryImg}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              <button
                type="submit"
                disabled={isUploadingCategoryImg}
                className="w-full rounded-full maroon-gradient py-2.5 text-xs font-bold uppercase tracking-widest text-white shadow-md cursor-pointer mt-4 disabled:opacity-50"
              >
                {editingCategory ? "Save Changes" : "Create Category"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Add Instagram Link */}
      {instagramModalOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" onClick={() => setInstagramModalOpen(false)} />
          <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-maroon/10 pb-2">
              <h2 className="font-display text-sm font-bold text-ink">Add Instagram Post</h2>
              <button onClick={() => setInstagramModalOpen(false)} className="text-gray-400 hover:text-maroon">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleInstagramSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-ink-muted">Display Thumbnail URL</label>
                <input
                  type="url"
                  required
                  placeholder="https://images.unsplash.com/..."
                  value={igImage}
                  onChange={(e) => setIgImage(e.target.value)}
                  className="w-full border border-maroon/10 focus:border-maroon focus:outline-none rounded px-3 py-2 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-ink-muted">Instagram Post URL</label>
                <input
                  type="url"
                  required
                  placeholder="https://www.instagram.com/p/..."
                  value={igUrl}
                  onChange={(e) => setIgUrl(e.target.value)}
                  className="w-full border border-maroon/10 focus:border-maroon focus:outline-none rounded px-3 py-2 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-ink-muted">Caption (Optional)</label>
                <input
                  type="text"
                  placeholder="Bridal Glow with Choker Set"
                  value={igCaption}
                  onChange={(e) => setIgCaption(e.target.value)}
                  className="w-full border border-maroon/10 focus:border-maroon focus:outline-none rounded px-3 py-2 text-xs"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-full maroon-gradient py-2.5 text-xs font-bold uppercase tracking-widest text-white shadow-md cursor-pointer mt-4"
              >
                Add to Feed
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
