import React, { useContext, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  BookOpen,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  Heart,
  ImagePlus,
  Layers,
  Minus,
  Package,
  Plus,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  Trash2,
  Truck,
  UploadCloud,
  X,
} from "lucide-react";
import api, { API_URL } from "../../api";
import { StoreContext, notifyLoginRequired } from "../../PrivateRouter/StoreContext";
import { useAuth } from "../../PrivateRouter/AuthContext";
import PageContainer from "../../CommonComponents/PageContainer";
import RelatedProducts from "../../CommonComponents/RelatedProducts";
import toast from "react-hot-toast";

const resolveImageUrl = (value) => {
  if (!value || typeof value !== "string") return "";
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (/^(data:|blob:|https?:\/\/)/i.test(trimmed)) return trimmed;
  const cleanPath = trimmed.replace(/\\/g, "/");
  const path = cleanPath.startsWith("/") ? cleanPath : `/${cleanPath}`;
  if (/^\/api\/?$/i.test(API_URL)) return path;
  return `${API_URL.replace(/\/api\/?$/, "")}${path}`;
};

const parseJsonArray = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
};

const AlbumDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart, wishlist = [], toggleWishlist, openCart } = useContext(StoreContext) || {};

  const [album, setAlbum] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Gallery
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Selection states
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);

  // Customization
  const [customFields, setCustomFields] = useState({
    coverTitle: "",
    dedicationNote: "",
    coverPhoto: null,
  });
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);


  // Fetch album details
  useEffect(() => {
    let isMounted = true;
    const fetchAlbum = async () => {
      try {
        setLoading(true);
        setError(null);
        window.scrollTo({ top: 0, behavior: "smooth" });

        const res = await api.get(`/albums/${id}`);
        const data = res.data?.data;
        if (!data) {
          throw new Error("Album not found");
        }

        if (isMounted) {
          setAlbum(data);

          // Initial size & color setup
          const sizeOpts = parseJsonArray(data.size_options);
          const variants = parseJsonArray(data.variants);
          const variantSizes = variants.map((v) => v.size).filter(Boolean);
          const allSizes = Array.from(new Set([...sizeOpts, ...variantSizes, data.size].filter(Boolean)));
          const defaultSize = allSizes[0] || data.size || "12 x 18 Inches";
          setSelectedSize(defaultSize);

          const colorOpts = parseJsonArray(data.color_options);
          const variantColors = variants.map((v) => v.color).filter(Boolean);
          const allColors = Array.from(new Set([...colorOpts.map((c) => typeof c === "string" ? c : c?.name), ...variantColors].filter(Boolean)));
          setSelectedColor(allColors[0] || data.cover_color || "");

          setSelectedImageIndex(0);
        }
      } catch (err) {
        console.error("Failed to load album:", err);
        if (isMounted) {
          setError(err?.response?.data?.message || err.message || "Failed to load album details");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchAlbum();
    return () => {
      isMounted = false;
    };
  }, [id]);

  // Parse variants and options
  const variants = useMemo(() => (album ? parseJsonArray(album.variants) : []), [album]);
  const sizeOptions = useMemo(() => {
    if (!album) return [];
    const fromField = parseJsonArray(album.size_options);
    const fromVariants = variants.map((v) => v.size).filter(Boolean);
    const base = album.size ? [album.size] : [];
    const set = Array.from(new Set([...fromField, ...fromVariants, ...base].filter(Boolean)));
    if (set.length > 0) return set;
    return ["8 x 12 Inches", "10 x 14 Inches", "12 x 18 Inches"];
  }, [album, variants]);

  const colorOptions = useMemo(() => {
    if (!album) return [];
    const rawColors = parseJsonArray(album.color_options);
    const fromVariants = variants.map((v) => v.color).filter(Boolean);
    const normalized = rawColors.map((c) => {
      if (typeof c === "string") return { name: c, code: "#3a2e26" };
      return { name: c?.name || "Color", code: c?.code || c?.hex || "#3a2e26" };
    });
    fromVariants.forEach((name) => {
      if (!normalized.some((c) => c.name.toLowerCase() === name.toLowerCase())) {
        normalized.push({ name, code: "#3a2e26" });
      }
    });
    return normalized;
  }, [album, variants]);

  // Find currently active variant based on selectedSize and selectedColor
  const activeVariant = useMemo(() => {
    if (!variants.length) return null;
    return (
      variants.find(
        (v) =>
          String(v.size || "").trim().toLowerCase() === String(selectedSize || "").trim().toLowerCase() &&
          (!selectedColor || String(v.color || "").trim().toLowerCase() === String(selectedColor || "").trim().toLowerCase())
      ) ||
      variants.find(
        (v) => String(v.size || "").trim().toLowerCase() === String(selectedSize || "").trim().toLowerCase()
      ) ||
      variants[0]
    );
  }, [variants, selectedSize, selectedColor]);

  // Compute pricing
  const { displayPrice, displayMrp, discountPercentage, isOutOfStock } = useMemo(() => {
    if (!album) return { displayPrice: 0, displayMrp: 0, discountPercentage: 0, isOutOfStock: false };

    let mrp = Number(activeVariant?.mrp || activeVariant?.selling_price || album.selling_price || 0);
    let offer = Number(
      activeVariant?.offerPrice ||
      activeVariant?.offer_price ||
      album.discount_price ||
      album.selling_price ||
      mrp
    );

    if (offer <= 0 && mrp > 0) offer = mrp;
    if (mrp <= 0 && offer > 0) mrp = offer;

    let discount = Number(album.discount_percentage || 0);
    if (mrp > offer && mrp > 0) {
      discount = Math.round(((mrp - offer) / mrp) * 100);
    }

    const stock = activeVariant
      ? Number(activeVariant.stock ?? activeVariant.stock_quantity ?? 10)
      : Number(album.stock_quantity ?? 10);

    const outOfStock = album.stock_status === "Out of Stock" || stock <= 0;

    return {
      displayPrice: offer,
      displayMrp: mrp,
      discountPercentage: discount,
      isOutOfStock: outOfStock,
    };
  }, [album, activeVariant]);

  // Gather all gallery images
  const galleryImages = useMemo(() => {
    if (!album) return [];
    const rawImages = parseJsonArray(album.product_images);
    const variantImages = [];
    variants.forEach((v) => {
      if (v?.image) variantImages.push(v.image);
      if (Array.isArray(v?.images)) variantImages.push(...v.images);
    });

    const list = [
      album.thumbnail_image,
      ...rawImages,
      ...variantImages,
    ].filter(Boolean);

    const resolved = Array.from(new Set(list.map(resolveImageUrl))).filter(Boolean);
    return resolved.length > 0 ? resolved : [];
  }, [album, variants]);

  const currentImage = galleryImages[selectedImageIndex] || galleryImages[0] || "";

  // Handle size selection
  const handleSelectSize = (size) => {
    setSelectedSize(size);
    // If a variant has a specific image for this size, focus that image
    const matchingVar = variants.find(
      (v) => String(v.size || "").trim().toLowerCase() === String(size || "").trim().toLowerCase()
    );
    if (matchingVar?.image) {
      const idx = galleryImages.findIndex((img) => img.includes(matchingVar.image) || resolveImageUrl(matchingVar.image) === img);
      if (idx !== -1) setSelectedImageIndex(idx);
    }
  };

  // Handle color selection
  const handleSelectColor = (colorName) => {
    setSelectedColor(colorName);
    const matchingVar = variants.find(
      (v) =>
        String(v.color || "").trim().toLowerCase() === String(colorName || "").trim().toLowerCase() &&
        (!selectedSize || String(v.size || "").trim().toLowerCase() === String(selectedSize || "").trim().toLowerCase())
    );
    if (matchingVar?.image) {
      const idx = galleryImages.findIndex((img) => img.includes(matchingVar.image) || resolveImageUrl(matchingVar.image) === img);
      if (idx !== -1) setSelectedImageIndex(idx);
    }
  };

  // Handle custom photo upload
  const handleCoverPhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    setUploadingPhoto(true);
    const toastId = toast.loading("Uploading cover photo...");
    try {
      const res = await api.post("/upload", formData);
      const url = res.data?.url || res.data?.fileUrl || (Array.isArray(res.data?.urls) ? res.data.urls[0] : "");
      if (!url) throw new Error("Upload response missing file URL");
      setCustomFields((prev) => ({ ...prev, coverPhoto: url }));
      toast.success("Cover photo uploaded successfully!", { id: toastId });
    } catch (err) {
      console.error("Cover photo upload error:", err);
      toast.error("Failed to upload cover photo. Please try again.", { id: toastId });
    } finally {
      setUploadingPhoto(false);
    }
  };

  // Add to Cart
  const handleAddToCart = async () => {
    if (!user?.user_id) {
      notifyLoginRequired("Please login before adding albums to your cart");
      return;
    }
    if (isOutOfStock) {
      toast.error("This album variant is currently out of stock");
      return;
    }

    setAddingToCart(true);
    try {
      const productPayload = {
        id: album.id || album.product_id,
        product_id: album.product_id || album.id,
        item_type: "album",
        product_name: album.product_name,
        category: album.category || "Albums",
        price: displayPrice,
        product_images: galleryImages,
        image: currentImage,
      };

      const options = {
        item_type: "album",
        size: selectedSize || album.size || "12 x 18 Inches",
        color: selectedColor || null,
        price: displayPrice,
        quantity: quantity,
        preview_image: currentImage,
        slot_photos: customFields.coverPhoto || customFields.coverTitle || customFields.dedicationNote
          ? {
              coverPhoto: customFields.coverPhoto,
              coverTitle: customFields.coverTitle,
              note: customFields.dedicationNote,
            }
          : null,
      };

      const success = await addToCart(productPayload, options);
      if (success) {
        openCart?.();
      }
    } finally {
      setAddingToCart(false);
    }
  };

  // Buy Now
  const handleBuyNow = () => {
    if (!user?.user_id) {
      notifyLoginRequired("Please login before ordering this album");
      return;
    }
    if (isOutOfStock) {
      toast.error("This album variant is currently out of stock");
      return;
    }

    const checkoutItem = {
      product_id: album.id || album.product_id,
      item_type: "album",
      product_name: album.product_name,
      category: album.category || "Albums",
      size: selectedSize || album.size || "12 x 18 Inches",
      color: selectedColor || null,
      price: displayPrice,
      quantity: quantity,
      product_image: currentImage,
      slot_photos: customFields.coverPhoto || customFields.coverTitle || customFields.dedicationNote
        ? {
            coverPhoto: customFields.coverPhoto,
            coverTitle: customFields.coverTitle,
            note: customFields.dedicationNote,
          }
        : null,
    };

    navigate("/checkout", { state: { checkoutItems: [checkoutItem] } });
  };

  const albumId = album?.id || album?.product_id;
  const isFavorite = wishlist.some(
    (item) => String(item.product_id || item.id || item._id) === String(albumId)
  );

  // Loading State
  if (loading) {
    return (
      <main className="min-h-screen bg-[#f7f3ed] py-16">
        <PageContainer>
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#1a3c36] border-t-transparent" />
            <p className="mt-4 text-sm font-semibold text-[#666]">Loading album details...</p>
          </div>
        </PageContainer>
      </main>
    );
  }

  // Error State
  if (error || !album) {
    return (
      <main className="min-h-screen bg-[#f7f3ed] py-16">
        <PageContainer>
          <div className="mx-auto max-w-lg rounded-3xl border border-[#e8ded2] bg-white p-8 text-center shadow-md">
            <Package className="mx-auto h-12 w-12 text-[#b07838]" />
            <h2 className="mt-4 text-2xl font-black text-[#1d2925]">Album Not Found</h2>
            <p className="mt-2 text-sm text-[#777]">{error || "The album you are looking for does not exist or has been removed."}</p>
            <Link
              to="/albums"
              className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-[#1a3c36] px-6 py-3 text-xs font-bold text-white shadow transition hover:bg-[#235048]"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Albums Catalog
            </Link>
          </div>
        </PageContainer>
      </main>
    );
  }

  const totalPages = album.total_pages || 40;
  const sheetCount = album.sheet_count || Math.round(totalPages / 2);

  return (
    <main className="min-h-screen bg-[#f7f3ed] pb-20 pt-6">
      <PageContainer>
        {/* BREADCRUMBS */}
        <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-xs text-[#777]">
          <Link to="/" className="transition hover:text-[#1a3c36]">Home</Link>
          <ChevronRight className="h-3 w-3 text-[#aaa]" />
          <Link to="/albums" className="transition hover:text-[#1a3c36]">Albums</Link>
          <ChevronRight className="h-3 w-3 text-[#aaa]" />
          <span className="truncate font-bold text-[#1d2925]">{album.product_name}</span>
        </nav>

        {/* MAIN PRODUCT DETAIL GRID */}
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          {/* LEFT: GALLERY COLUMN (5 COLS) */}
          <div className="lg:col-span-6 xl:col-span-5">
            <div className="sticky top-24 space-y-4">
              {/* MAIN IMAGE CONTAINER */}
              <div className="relative flex aspect-4/3 sm:aspect-square w-full items-center justify-center overflow-hidden rounded-3xl border border-[#ebdcc8] bg-[#fbf9f6] p-4 shadow-sm sm:p-8">
                {currentImage ? (
                  <img
                    src={currentImage}
                    alt={album.product_name}
                    className="max-h-full max-w-full object-contain transition-transform duration-300 hover:scale-105"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-[#b9aa98]">
                    <BookOpen className="h-16 w-16" />
                    <span className="mt-2 text-xs font-semibold">No preview available</span>
                  </div>
                )}

                {/* BADGES ON IMAGE */}
                <span className="absolute bottom-4 left-4 flex items-center gap-1.5 rounded-full bg-black/65 px-3 py-1.5 text-xs font-bold text-white backdrop-blur-xs">
                  <BookOpen className="h-3.5 w-3.5 text-[#d4a553]" />
                  {totalPages} Pages • Lay Flat
                </span>

                {discountPercentage > 0 && (
                  <span className="absolute left-4 top-4 rounded-full bg-[#1a3c36] px-3 py-1 text-xs font-black text-white shadow-xs">
                    {discountPercentage}% OFF
                  </span>
                )}

                <button
                  type="button"
                  onClick={() => toggleWishlist?.({ ...album, __wishlistType: "album" })}
                  className={`absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full shadow-md transition ${
                    isFavorite
                      ? "bg-[#d79d4a] text-[#1d2925]"
                      : "bg-white/95 text-[#666] hover:bg-white hover:text-[#b07838]"
                  }`}
                  aria-label={isFavorite ? "Remove from favorites" : "Save to favorites"}
                >
                  <Heart className="h-5 w-5" fill={isFavorite ? "currentColor" : "none"} />
                </button>
              </div>

              {/* THUMBNAIL STRIP */}
              {galleryImages.length > 1 && (
                <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-thin">
                  {galleryImages.map((img, idx) => (
                    <button
                      key={`${img}-${idx}`}
                      type="button"
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`relative h-18 w-18 shrink-0 overflow-hidden rounded-2xl border-2 bg-white p-1 transition ${
                        selectedImageIndex === idx
                          ? "border-[#1a3c36] shadow-sm"
                          : "border-[#e5ded4] opacity-75 hover:opacity-100"
                      }`}
                    >
                      <img src={img} alt={`${album.product_name} view ${idx + 1}`} className="h-full w-full object-contain" />
                    </button>
                  ))}
                </div>
              )}

              {/* TRUST FEATURES BADGES */}
              <div className="grid grid-cols-3 gap-2.5 pt-2 text-center text-[11px] text-[#555]">
                <div className="rounded-2xl border border-[#e8dfd2] bg-white p-3 shadow-2xs">
                  <Truck className="mx-auto h-5 w-5 text-[#b07838]" />
                  <p className="mt-1.5 font-bold text-[#1d2925]">Safe Shipping</p>
                  <p className="text-[10px] text-[#888]">Delivered in {album.estimated_delivery_days || 7} days</p>
                </div>
                <div className="rounded-2xl border border-[#e8dfd2] bg-white p-3 shadow-2xs">
                  <ShieldCheck className="mx-auto h-5 w-5 text-[#1b794b]" />
                  <p className="mt-1.5 font-bold text-[#1d2925]">100% Quality</p>
                  <p className="text-[10px] text-[#888]">Archival HD lab print</p>
                </div>
                <div className="rounded-2xl border border-[#e8dfd2] bg-white p-3 shadow-2xs">
                  <Sparkles className="mx-auto h-5 w-5 text-[#b07838]" />
                  <p className="mt-1.5 font-bold text-[#1d2925]">Lay-Flat 180°</p>
                  <p className="text-[10px] text-[#888]">Seamless spreads</p>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: DETAILS & ACTIONS COLUMN (7 COLS) */}
          <div className="lg:col-span-6 xl:col-span-7">
            <div className="rounded-3xl border border-[#ebdcc8] bg-white p-6 shadow-sm md:p-8">
              {/* CATEGORY & CODE */}
              <div className="flex items-center justify-between gap-3">
                <span className="inline-flex rounded-full bg-[#f2ecdf] px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#9b6b2d]">
                  {album.sub_category || album.occasion || album.category || "Photo Album"}
                </span>
                <span className="font-mono text-xs font-semibold text-[#888]">
                  Code: {album.product_code || album.product_id}
                </span>
              </div>

              {/* TITLE */}
              <h1 className="mt-3 text-2xl font-black tracking-tight text-[#1d2925] sm:text-3xl">
                {album.product_name}
              </h1>

              {/* SHORT DESCRIPTION */}
              <p className="mt-2 text-sm leading-relaxed text-[#666]">
                {album.short_description ||
                  "Handcrafted premium photo album featuring archival photo paper, high-definition lay-flat binding, and custom cover stamping for your life milestones."}
              </p>

              {/* PRICE ROW */}
              <div className="mt-5 flex flex-wrap items-baseline gap-3 border-y border-[#f2ede4] py-4">
                <span className="text-3xl font-black text-[#1a3c36]">
                  ₹{displayPrice.toLocaleString("en-IN")}
                </span>
                {displayMrp > displayPrice && (
                  <>
                    <span className="text-base text-[#999] line-through">
                      ₹{displayMrp.toLocaleString("en-IN")}
                    </span>
                    <span className="rounded-md bg-[#eef6f3] px-2.5 py-1 text-xs font-bold text-[#1b794b]">
                      Save ₹{(displayMrp - displayPrice).toLocaleString("en-IN")} ({discountPercentage}% OFF)
                    </span>
                  </>
                )}
                <span
                  className={`ml-auto rounded-full px-3 py-1 text-xs font-bold ${
                    isOutOfStock
                      ? "bg-red-50 text-red-600 border border-red-200"
                      : "bg-[#e8efeb] text-[#1a3c36]"
                  }`}
                >
                  {isOutOfStock ? "Out of Stock" : "In Stock"}
                </span>
              </div>

              {/* ============================================================ */}
              {/* SIZE SELECTOR OPTION (KEY USER REQUIREMENT) */}
              {/* ============================================================ */}
              <div className="mt-6 border-b border-[#f2ede4] pb-6">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#1d2925]">
                    <Layers className="h-4 w-4 text-[#b07838]" /> Select Album Size:
                  </label>
                  <span className="text-xs font-semibold text-[#b07838]">
                    Selected: <strong className="text-[#1d2925]">{selectedSize || "Standard"}</strong>
                  </span>
                </div>

                <div className="mt-3.5 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                  {sizeOptions.map((size) => {
                    const isSelected =
                      String(selectedSize).trim().toLowerCase() === String(size).trim().toLowerCase();

                    // Check if this size has variant price
                    const variantForSize = variants.find(
                      (v) => String(v.size || "").trim().toLowerCase() === String(size).trim().toLowerCase()
                    );
                    const varPrice = variantForSize?.offerPrice || variantForSize?.offer_price;

                    return (
                      <button
                        key={size}
                        type="button"
                        onClick={() => handleSelectSize(size)}
                        className={`relative flex flex-col items-start justify-center rounded-2xl border-2 p-3 text-left transition ${
                          isSelected
                            ? "border-[#1a3c36] bg-[#f5f9f7] shadow-xs"
                            : "border-[#e7e0d4] bg-white hover:border-[#b07838] hover:bg-[#faf7f2]"
                        }`}
                      >
                        <div className="flex w-full items-center justify-between">
                          <span className={`text-xs font-bold ${isSelected ? "text-[#1a3c36]" : "text-[#222]"}`}>
                            {size}
                          </span>
                          {isSelected && <Check className="h-3.5 w-3.5 text-[#1a3c36]" />}
                        </div>
                        <span className="mt-1 text-[10px] text-[#777]">
                          {size.includes("18") || size.includes("24")
                            ? "Panoramic Spread"
                            : size.includes("14") || size.includes("12")
                            ? "Large Coffee Table"
                            : "Standard Classic"}
                        </span>
                        {varPrice && (
                          <span className="mt-1 text-[11px] font-bold text-[#1b794b]">
                            ₹{Number(varPrice).toLocaleString("en-IN")}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* COLOR / COVER SELECTOR (IF AVAILABLE) */}
              {colorOptions.length > 0 && (
                <div className="mt-6 border-b border-[#f2ede4] pb-6">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#1d2925]">
                      Cover Material / Color:
                    </label>
                    <span className="text-xs font-semibold text-[#777]">
                      {selectedColor || "Standard"}
                    </span>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {colorOptions.map((color) => {
                      const isSelected =
                        String(selectedColor).trim().toLowerCase() === String(color.name).trim().toLowerCase();
                      return (
                        <button
                          key={color.name}
                          type="button"
                          onClick={() => handleSelectColor(color.name)}
                          className={`inline-flex items-center gap-2 rounded-xl border-2 px-3 py-2 text-xs font-bold transition ${
                            isSelected
                              ? "border-[#1a3c36] bg-[#1a3c36] text-white"
                              : "border-[#e0d6c8] bg-white text-[#444] hover:border-[#b07838]"
                          }`}
                        >
                          <span
                            className="h-3.5 w-3.5 rounded-full border border-black/20 shadow-2xs"
                            style={{ backgroundColor: color.code || "#333" }}
                          />
                          <span>{color.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* PERSONALIZATION / CUSTOMIZATION SECTION */}
              <div className="mt-6 rounded-2xl border border-[#ebdcc8] bg-[#fdfbf8] p-5">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#9b6b2d]">
                  <Sparkles className="h-4 w-4" /> Personalize Your Album Cover (Free)
                </div>
                <p className="mt-1 text-[11px] text-[#777]">
                  Custom emboss or imprint your names, wedding/event date, or family crest directly onto the cover.
                </p>

                <div className="mt-4 space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-[#444]">
                      Cover Title / Couple Names:
                    </label>
                    <input
                      type="text"
                      value={customFields.coverTitle}
                      onChange={(e) => setCustomFields((prev) => ({ ...prev, coverTitle: e.target.value }))}
                      placeholder="e.g., Rahul &amp; Priya • 18th Dec 2024"
                      className="mt-1 w-full rounded-xl border border-[#d8cfc3] bg-white px-3.5 py-2.5 text-xs font-medium text-[#1d2925] outline-none transition focus:border-[#1a3c36]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#444]">
                      Dedication Note / Subtitle:
                    </label>
                    <textarea
                      rows={2}
                      value={customFields.dedicationNote}
                      onChange={(e) => setCustomFields((prev) => ({ ...prev, dedicationNote: e.target.value }))}
                      placeholder="e.g., A lifetime of shared memories and countless adventures..."
                      className="mt-1 w-full resize-none rounded-xl border border-[#d8cfc3] bg-white px-3.5 py-2 text-xs font-medium text-[#1d2925] outline-none transition focus:border-[#1a3c36]"
                    />
                  </div>

                  {/* COVER PHOTO UPLOAD */}
                  <div>
                    <label className="block text-[11px] font-bold text-[#444]">
                      Featured Cover Photo (Optional):
                    </label>
                    {customFields.coverPhoto ? (
                      <div className="mt-2 flex items-center gap-3 rounded-xl border border-[#cbe3d3] bg-[#f0f8f3] p-2.5">
                        <img
                          src={resolveImageUrl(customFields.coverPhoto)}
                          alt="Cover upload"
                          className="h-12 w-12 rounded-lg object-cover border border-[#b2d9be]"
                        />
                        <div className="flex-1 text-[11px]">
                          <p className="font-bold text-[#1b794b] flex items-center gap-1">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Photo attached for cover
                          </p>
                          <p className="text-[#666]">Ready for album printing</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setCustomFields((prev) => ({ ...prev, coverPhoto: null }))}
                          className="rounded-lg p-1.5 text-[#888] transition hover:bg-white hover:text-red-600"
                          title="Remove photo"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <label className="mt-1.5 inline-flex cursor-pointer items-center gap-2 rounded-xl border border-[#1a3c36] bg-white px-4 py-2.5 text-xs font-bold text-[#1a3c36] shadow-2xs transition hover:bg-[#f4efe8]">
                        <UploadCloud className="h-4 w-4" />
                        {uploadingPhoto ? "Uploading photo..." : "Upload Cover Photo"}
                        <input
                          type="file"
                          accept="image/*"
                          disabled={uploadingPhoto}
                          onChange={handleCoverPhotoUpload}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </div>
              </div>

              {/* QUANTITY AND ACTION BUTTONS */}
              <div className="mt-8 border-t border-[#f2ede4] pt-6">
                <div className="mb-5 flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#555]">
                    Order Quantity:
                  </span>
                  <div className="inline-flex items-center rounded-2xl border border-[#d8cfc3] bg-white p-1 shadow-2xs">
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      disabled={quantity <= 1}
                      className="flex h-8 w-8 items-center justify-center rounded-xl text-sm font-bold text-[#555] transition hover:bg-[#f4efe8] disabled:opacity-40"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-10 text-center text-xs font-black text-[#1d2925]">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => q + 1)}
                      className="flex h-8 w-8 items-center justify-center rounded-xl text-sm font-bold text-[#555] transition hover:bg-[#f4efe8]"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    disabled={addingToCart || isOutOfStock}
                    className="inline-flex h-13 items-center justify-center gap-2 rounded-2xl border-2 border-[#1a3c36] bg-white text-xs font-bold text-[#1a3c36] shadow-xs transition hover:bg-[#f7f4ef] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    {addingToCart ? "Adding to Cart..." : "Add to Cart"}
                  </button>

                  <button
                    type="button"
                    onClick={handleBuyNow}
                    disabled={isOutOfStock}
                    className="inline-flex h-13 items-center justify-center gap-2 rounded-2xl bg-[#1a3c36] text-xs font-bold text-white shadow-md transition hover:bg-[#235048] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <ShoppingBag className="h-4 w-4" />
                    Buy Now
                  </button>
                </div>
              </div>

              {/* SPECIFICATIONS LIST */}
              <div className="mt-8 rounded-2xl border border-[#e8dfd2] bg-[#fbf9f6] p-5">
                <h3 className="border-b border-[#ebdcc8] pb-3 text-xs font-bold uppercase tracking-wider text-[#b07838]">
                  Album Specifications
                </h3>
                <div className="mt-3 divide-y divide-[#f0eaee] text-xs">
                  <SpecRow label="Active Size" value={selectedSize || album.size || "12 x 18 Inches"} highlight />
                  <SpecRow label="Pages & Spreads" value={`${totalPages} Pages (${sheetCount} Sheets)`} />
                  <SpecRow label="Paper Quality" value={album.page_thickness || album.page_material || "300 GSM Archival Silk"} />
                  <SpecRow label="Cover Type" value={`${album.cover_type || "Hardcover"} (${album.cover_material || "Premium Leatherette"})`} />
                  <SpecRow label="Binding" value={album.binding_type || "Seamless Lay-Flat 180°"} />
                  <SpecRow label="Printing Quality" value={album.print_quality || "HD Digital Color Stamping"} />
                  <SpecRow label="Estimated Delivery" value={`${album.estimated_delivery_days || 7} Business Days`} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* DETAILED DESCRIPTION & HIGHLIGHTS SECTION */}
        {album.description && (
          <div className="mt-12 rounded-3xl border border-[#ebdcc8] bg-white p-8 shadow-xs">
            <h2 className="text-xl font-black text-[#1d2925]">About This Album</h2>
            <div className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-[#555]">
              {album.description}
            </div>
          </div>
        )}

        {/* RELATED ALBUMS */}
        <RelatedProducts album={album} type="album" />
      </PageContainer>
    </main>
  );
};

const SpecRow = ({ label, value, highlight = false }) => (
  <div className="flex items-center justify-between py-2">
    <span className="text-[#777]">{label}:</span>
    <span className={`font-bold ${highlight ? "text-[#1a3c36]" : "text-[#222]"}`}>{value}</span>
  </div>
);

export default AlbumDetailsPage;
