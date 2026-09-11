import React, { useContext, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  Gift,
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
  Star,
  Trash2,
  Truck,
  UploadCloud,
  X,
} from "lucide-react";
import { Autoplay } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import api, { API_URL } from "../../api";
import { StoreContext, notifyLoginRequired } from "../../PrivateRouter/StoreContext";
import { useAuth } from "../../PrivateRouter/AuthContext";
import PageContainer from "../../CommonComponents/PageContainer";
import PageHeader from "../../CommonComponents/PageHeader";
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

const parseJson = (value, fallback) => {
  if (value === null || value === undefined || value === "") return fallback;
  if (typeof value !== "string") return value;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

const parseReviewPhotoString = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value === "string") {
    return value
      .split(/[|,]/)
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
};

const GiftDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart, wishlist = [], toggleWishlist, openCart } = useContext(StoreContext) || {};

  const [gift, setGift] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Gallery
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Quantity
  const [quantity, setQuantity] = useState(1);

  // Customization
  const [customFields, setCustomFields] = useState({
    recipientName: "",
    message: "",
    customPhoto: null,
  });
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);

  // Review state for gift detail route
  const [productReviews, setProductReviews] = useState([]);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewPopupOpen, setReviewPopupOpen] = useState(false);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewDraft, setReviewDraft] = useState({ rating: 5, title: "", comment: "", photos: [] });
  const [reviewNotice, setReviewNotice] = useState("");
  const [reviewUploadingPhotos, setReviewUploadingPhotos] = useState(false);

  // Fetch gift details
  useEffect(() => {
    let isMounted = true;
    const fetchGift = async () => {
      try {
        setLoading(true);
        setError(null);
        window.scrollTo({ top: 0, behavior: "smooth" });

        const res = await api.get(`/gift-boxes/${id}`);
        const data = res.data?.data || res.data;
        if (!data) {
          throw new Error("Gift box not found");
        }

        if (isMounted) {
          setGift(data);
          setSelectedImageIndex(0);
        }
      } catch (err) {
        console.error("Failed to load gift details:", err);
        if (isMounted) {
          setError(err?.response?.data?.message || err.message || "Failed to load gift box details");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchGift();
    return () => {
      isMounted = false;
    };
  }, [id]);

  useEffect(() => {
    if (!gift) return;

    const fetchReviews = async () => {
      try {
        setReviewLoading(true);
        const reviewCode = gift.gift_box_id || gift.id || id;
        const reviewRes = await api.get(`/reviews?product_id=${encodeURIComponent(reviewCode)}`);
        const rows = Array.isArray(reviewRes?.data?.data) ? reviewRes.data.data : [];
        setProductReviews(rows);
        setReviewNotice("");
      } catch (err) {
        console.error("Fetch gift reviews error:", err);
        setProductReviews([]);
      } finally {
        setReviewLoading(false);
      }
    };

    fetchReviews();
  }, [gift, id]);

  const activeUserId = user?.user_id || user?.id || user?.uuid || null;
  const activeGiftCode = gift?.gift_box_id || gift?.id || id;

  const userAlreadyReviewedGift = useMemo(() => {
    if (!activeUserId || !activeGiftCode) return false;

    return productReviews.some((review) => {
      const reviewUserId = String(review.user_id || review.created_by || review.reviewer_email || "");
      const reviewCode = String(review.product_code || review.product_id || "");
      return reviewUserId === String(activeUserId) && (
        String(reviewCode) === String(activeGiftCode) ||
        Number(review.product_id ?? 0) === Number(gift?.id ?? 0)
      );
    });
  }, [activeUserId, activeGiftCode, gift?.id, productReviews]);

  const reviewStoreArray = useMemo(() => {
    return productReviews
      .slice()
      .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
      .map((review) => ({
        name: review.reviewer_name || review.reviewer_email || "Customer",
        rating: Number(review.rating || 5),
        title: review.title || review.product_name || "",
        dis: review.comment || review.title || "",
        image: parseReviewPhotoString(review.review_photo || review.product_image || "")[0] || review.product_image || "",
        images: parseReviewPhotoString(review.review_photo || review.product_image || ""),
        createdAt: review.created_at || review.updated_at || "",
      }));
  }, [productReviews]);

  const averageRating = productReviews.length
    ? productReviews.reduce((sum, review) => sum + Number(review.rating || 5), 0) / productReviews.length
    : 0;

  const ratingDistribution = useMemo(() => {
    const dist = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    productReviews.forEach((review) => {
      const r = Math.min(5, Math.max(1, Number(review.rating || 5)));
      dist[r] += 1;
    });
    return dist;
  }, [productReviews]);

  // Items included
  const giftItems = useMemo(() => {
    if (!gift) return [];
    return parseJson(gift.gift_items, []);
  }, [gift]);

  // Gallery images
  const galleryImages = useMemo(() => {
    if (!gift) return [];
    const list = [gift.image, ...(Array.isArray(gift.images) ? gift.images : parseJson(gift.images, []))].filter(Boolean);
    const resolved = Array.from(new Set(list.map(resolveImageUrl))).filter(Boolean);
    return resolved.length > 0 ? resolved : [];
  }, [gift]);

  const currentImage = galleryImages[selectedImageIndex] || galleryImages[0] || "";

  // Pricing calculations
  const { sellingPrice, mrp, discount, stock, isOutOfStock } = useMemo(() => {
    if (!gift) return { sellingPrice: 0, mrp: 0, discount: 0, stock: 0, isOutOfStock: false };

    const price = Number(gift.selling_price || gift.mrp || 0);
    const original = Number(gift.mrp || price);
    let disc = Number(gift.discount_percentage || 0);
    if (disc <= 0 && original > price && original > 0) {
      disc = Math.round(((original - price) / original) * 100);
    }
    const currentStock = Number(gift.current_stock ?? 10);
    const outOfStock = gift.stock_status === "Out of Stock" || currentStock <= 0;

    return {
      sellingPrice: price,
      mrp: original,
      discount: disc,
      stock: currentStock,
      isOutOfStock: outOfStock,
    };
  }, [gift]);

  const handleReviewPhotoUpload = async (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    setReviewUploadingPhotos(true);
    try {
      const uploaded = [];
      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);
        const res = await api.post("/upload", formData);
        const uploadedUrl = res.data?.url || res.data?.fileUrl || (Array.isArray(res.data?.urls) ? res.data.urls[0] : "");
        if (uploadedUrl) uploaded.push(uploadedUrl);
      }

      if (uploaded.length) {
        setReviewDraft((prev) => ({ ...prev, photos: [...prev.photos, ...uploaded] }));
      }
    } catch (err) {
      console.error("Upload gift review photo error:", err);
      toast.error("Unable to upload selected review photos");
    } finally {
      setReviewUploadingPhotos(false);
      event.target.value = "";
    }
  };

  const removeReviewPhoto = (photoUrl) => {
    setReviewDraft((prev) => ({
      ...prev,
      photos: prev.photos.filter((url) => url !== photoUrl),
    }));
  };

  const handleReviewSubmit = async (event) => {
    event.preventDefault();

    if (!gift?.id) {
      return;
    }

    if (!activeUserId) {
      toast.error("Please login before writing a review.");
      return;
    }

    const trimmedTitle = reviewDraft.title.trim();
    const trimmedComment = reviewDraft.comment.trim();

    if (!trimmedTitle) {
      toast.error("Review title is required");
      return;
    }

    if (!trimmedComment) {
      toast.error("Review comment is required");
      return;
    }

    if (userAlreadyReviewedGift) {
      setReviewNotice("You have already reviewed this gift box.");
      return;
    }

    try {
      setReviewSubmitting(true);
      const payload = {
        product_id: Number(gift.id),
        product_code: gift.gift_box_id || gift.id,
        product_name: gift.name,
        product_image: currentImage || gift.image || null,
        product_type: "gift",
        reviewer_name: user?.username || user?.displayName || user?.name || user?.email || "Customer",
        reviewer_email: user?.email || null,
        rating: Number(reviewDraft.rating || 5),
        comment: trimmedComment,
        title: trimmedTitle,
        review_photo: reviewDraft.photos.length ? reviewDraft.photos.join("|") : null,
        created_by: activeUserId,
        updated_by: activeUserId,
        user_id: activeUserId,
      };

      const response = await api.post("/reviews", payload);
      if (response.data?.success) {
        const newReview = response.data.data || payload;
        setProductReviews((prev) => [newReview, ...prev]);
        setReviewDraft({ rating: 5, title: "", comment: "", photos: [] });
        setReviewPopupOpen(false);
        setReviewNotice("");
        toast.success("Review submitted successfully");
      }
    } catch (err) {
      console.error("Submit gift review error:", err);
      const apiMessage = err?.response?.data?.message || "Unable to submit your review";
      if (String(apiMessage).toLowerCase().includes("already reviewed") || err?.response?.status === 409) {
        setReviewNotice("You have already reviewed this gift box.");
        setReviewPopupOpen(false);
        toast.error("You have already reviewed this gift box.");
      } else {
        toast.error(apiMessage);
      }
    } finally {
      setReviewSubmitting(false);
    }
  };

  // Custom photo upload
  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    setUploadingPhoto(true);
    const toastId = toast.loading("Uploading photo...");
    try {
      const res = await api.post("/upload", formData);
      const url = res.data?.url || res.data?.fileUrl || (Array.isArray(res.data?.urls) ? res.data.urls[0] : "");
      if (!url) throw new Error("Upload response missing file URL");
      setCustomFields((prev) => ({ ...prev, customPhoto: url }));
      toast.success("Photo uploaded successfully!", { id: toastId });
    } catch (err) {
      console.error("Photo upload error:", err);
      toast.error("Failed to upload photo", { id: toastId });
    } finally {
      setUploadingPhoto(false);
    }
  };

  // Add to Cart
  const handleAddToCart = async () => {
    if (!user?.user_id) {
      notifyLoginRequired("Please login before adding gift boxes to your cart");
      return;
    }
    if (isOutOfStock) {
      toast.error("This gift box is currently out of stock");
      return;
    }

    setAddingToCart(true);
    try {
      const giftBoxId = gift.gift_box_id || gift.id;
      const productPayload = {
        id: gift.id || giftBoxId,
        gift_box_id: giftBoxId,
        item_type: "gift",
        product_name: gift.name,
        category: gift.category || "Gift Box",
        price: sellingPrice,
        product_images: galleryImages,
        image: currentImage,
      };

      const options = {
        item_type: "gift",
        size: gift.box_size || "Standard Box",
        price: sellingPrice,
        quantity: quantity,
        preview_image: currentImage,
        slot_photos: customFields.customPhoto || customFields.recipientName || customFields.message
          ? {
              name: customFields.recipientName,
              msg: customFields.message,
              photo: customFields.customPhoto,
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
      notifyLoginRequired("Please login before ordering this gift box");
      return;
    }
    if (isOutOfStock) {
      toast.error("This gift box is currently out of stock");
      return;
    }

    const giftBoxId = gift.gift_box_id || gift.id;
    const checkoutItem = {
      product_id: gift.id || giftBoxId,
      gift_box_id: giftBoxId,
      item_type: "gift",
      product_name: gift.name,
      category: gift.category || "Gift Box",
      size: gift.box_size || "Standard Box",
      price: sellingPrice,
      quantity: quantity,
      product_image: currentImage,
      slot_photos: customFields.customPhoto || customFields.recipientName || customFields.message
        ? {
            name: customFields.recipientName,
            msg: customFields.message,
            photo: customFields.customPhoto,
          }
        : null,
    };

    navigate("/checkout", { state: { checkoutItems: [checkoutItem] } });
  };

  const giftId = gift?.id || gift?.gift_box_id;
  const isFavorite = wishlist.some(
    (item) => String(item.product_id || item.id || item._id) === String(giftId)
  );

  // Loading State
  if (loading) {
    return (
      <main className="min-h-screen bg-[#f7f3ed] py-16">
        <PageContainer>
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#1a3c36] border-t-transparent" />
            <p className="mt-4 text-sm font-semibold text-[#666]">Loading gift box details...</p>
          </div>
        </PageContainer>
      </main>
    );
  }

  // Error State
  if (error || !gift) {
    return (
      <main className="min-h-screen bg-[#f7f3ed] py-16">
        <PageContainer>
          <div className="mx-auto max-w-lg rounded-3xl border border-[#e8ded2] bg-white p-8 text-center shadow-md">
            <Package className="mx-auto h-12 w-12 text-[#b07838]" />
            <h2 className="mt-4 text-2xl font-black text-[#1d2925]">Gift Box Not Found</h2>
            <p className="mt-2 text-sm text-[#777]">{error || "The gift box you are looking for does not exist or has been removed."}</p>
            <Link
              to="/gifts"
              className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-[#1a3c36] px-6 py-3 text-xs font-bold text-white shadow transition hover:bg-[#235048]"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Gifts Catalog
            </Link>
          </div>
        </PageContainer>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f3ed] pb-20">
      <PageHeader title={gift.name} />
      <PageContainer className="py-6 sm:py-10">
        {/* BREADCRUMBS */}
        <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-xs text-[#777]">
          <Link to="/" className="transition hover:text-[#1a3c36]">Home</Link>
          <ChevronRight className="h-3 w-3 text-[#aaa]" />
          <Link to="/gifts" className="transition hover:text-[#1a3c36]">Gift Boxes</Link>
          <ChevronRight className="h-3 w-3 text-[#aaa]" />
          <span className="truncate font-bold text-[#1d2925]">{gift.name}</span>
        </nav>

        {/* MAIN PRODUCT DETAIL GRID */}
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          {/* LEFT: GALLERY (5 COLS) */}
          <div className="lg:col-span-6 xl:col-span-5">
            <div className="space-y-4 lg:sticky lg:top-24">
              <div className="relative flex aspect-4/3 sm:aspect-square w-full items-center justify-center overflow-hidden rounded-3xl border border-[#ebdcc8] bg-[#fbf9f6] p-4 shadow-sm sm:p-8">
                {currentImage ? (
                  <img
                    src={currentImage}
                    alt={gift.name}
                    className="max-h-full max-w-full object-contain transition-transform duration-300 hover:scale-105"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-[#b9aa98]">
                    <Gift className="h-16 w-16" />
                    <span className="mt-2 text-xs font-semibold">No preview available</span>
                  </div>
                )}

                {giftItems.length > 0 && (
                  <span className="absolute bottom-4 left-4 flex items-center gap-1.5 rounded-full bg-black/65 px-3 py-1.5 text-xs font-bold text-white backdrop-blur-xs">
                    <Gift className="h-3.5 w-3.5 text-[#d4a553]" />
                    {giftItems.length} Item{giftItems.length !== 1 ? "s" : ""} Inside Box
                  </span>
                )}

                {discount > 0 && (
                  <span className="absolute left-4 top-4 rounded-full bg-[#1a3c36] px-3 py-1 text-xs font-black text-white shadow-xs">
                    {discount}% OFF
                  </span>
                )}

                <button
                  type="button"
                  onClick={() => toggleWishlist?.({ ...gift, __wishlistType: "gift" })}
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

              {/* THUMBNAILS */}
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
                      <img src={img} alt={`${gift.name} view ${idx + 1}`} className="h-full w-full object-contain" />
                    </button>
                  ))}
                </div>
              )}

              {/* TRUST FEATURES BADGES */}
              <div className="grid grid-cols-3 gap-2.5 pt-2 text-center text-[11px] text-[#555]">
                <div className="rounded-2xl border border-[#e8dfd2] bg-white p-3 shadow-2xs">
                  <Truck className="mx-auto h-5 w-5 text-[#b07838]" />
                  <p className="mt-1.5 font-bold text-[#1d2925]">Express Delivery</p>
                  <p className="text-[10px] text-[#888]">Safe shockproof packing</p>
                </div>
                <div className="rounded-2xl border border-[#e8dfd2] bg-white p-3 shadow-2xs">
                  <Sparkles className="mx-auto h-5 w-5 text-[#b07838]" />
                  <p className="mt-1.5 font-bold text-[#1d2925]">Luxury Ribbon</p>
                  <p className="text-[10px] text-[#888]">Ready to gift</p>
                </div>
                <div className="rounded-2xl border border-[#e8dfd2] bg-white p-3 shadow-2xs">
                  <ShieldCheck className="mx-auto h-5 w-5 text-[#1b794b]" />
                  <p className="mt-1.5 font-bold text-[#1d2925]">100% Guaranteed</p>
                  <p className="text-[10px] text-[#888]">Handpicked quality</p>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: DETAILS & ACTIONS (7 COLS) */}
          <div className="lg:col-span-6 xl:col-span-7">
            <div className="rounded-3xl border border-[#ebdcc8] bg-white p-4 shadow-sm sm:p-6 md:p-8">
              {/* CATEGORY & CODE */}
              <div className="flex items-center justify-between gap-3">
                <span className="inline-flex rounded-full bg-[#f2ecdf] px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#9b6b2d]">
                  {gift.category || "Gift Box"}
                </span>
                <span className="font-mono text-xs font-semibold text-[#888]">
                  Code: {gift.gift_box_id || gift.id}
                </span>
              </div>

              {/* TITLE */}
              <h1 className="mt-3 text-2xl font-black tracking-tight text-[#1d2925] sm:text-3xl">
                {gift.name}
              </h1>

              {/* SHORT DESCRIPTION */}
              <p className="mt-2 text-sm leading-relaxed text-[#666]">
                {gift.description ||
                  "A luxurious curated gift hamper beautifully assembled with personalized keepsakes, premium packaging, and a custom greeting card."}
              </p>

              {/* PRICE ROW */}
              <div className="mt-5 flex flex-wrap items-baseline gap-3 border-y border-[#f2ede4] py-4">
                <span className="text-3xl font-black text-[#1a3c36]">
                  ₹{sellingPrice.toLocaleString("en-IN")}
                </span>
                {mrp > sellingPrice && (
                  <>
                    <span className="text-base text-[#999] line-through">
                      ₹{mrp.toLocaleString("en-IN")}
                    </span>
                    <span className="rounded-md bg-[#eef6f3] px-2.5 py-1 text-xs font-bold text-[#1b794b]">
                      Save ₹{(mrp - sellingPrice).toLocaleString("en-IN")} ({discount}% OFF)
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

              {/* ITEMS INCLUDED SHOWCASE */}
              {giftItems.length > 0 && (
                <div className="mt-6 rounded-2xl border border-[#ebe3d7] bg-[#faf8f5] p-5">
                  <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#9b6b2d]">
                    <Gift className="h-4 w-4" /> Items Included in this Box ({giftItems.length})
                  </h3>
                  <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {giftItems.map((item, idx) => {
                      const itemName = typeof item === "string" ? item : item?.name || `Item ${idx + 1}`;
                      const itemDesc = typeof item === "object" ? item?.quantity || item?.desc || "" : "";
                      return (
                        <div
                          key={`${itemName}-${idx}`}
                          className="flex items-center gap-2.5 rounded-xl border border-[#ebdcc8] bg-white p-2.5 text-xs text-[#1d2925]"
                        >
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#f2ecdf] text-[10px] font-black text-[#9b6b2d]">
                            {idx + 1}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-bold">{itemName}</p>
                            {itemDesc && <p className="truncate text-[10px] text-[#777]">{itemDesc}</p>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* PERSONALIZATION SECTION */}
              <div className="mt-6 rounded-2xl border border-[#ebdcc8] bg-[#fdfbf8] p-5">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#9b6b2d]">
                  <Sparkles className="h-4 w-4" /> Add Personalization &amp; Card Message (Optional)
                </div>
                <p className="mt-1 text-[11px] text-[#777]">
                  We will include a handwritten greeting card with your words and recipient name inside the luxury gift box.
                </p>

                <div className="mt-4 space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-[#444]">
                      Recipient Name:
                    </label>
                    <input
                      type="text"
                      value={customFields.recipientName}
                      onChange={(e) => setCustomFields((prev) => ({ ...prev, recipientName: e.target.value }))}
                      placeholder="e.g., Sneha Sharma"
                      className="mt-1 w-full rounded-xl border border-[#d8cfc3] bg-white px-3.5 py-2.5 text-xs font-medium text-[#1d2925] outline-none transition focus:border-[#1a3c36]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#444]">
                      Greeting Card Message:
                    </label>
                    <textarea
                      rows={2}
                      value={customFields.message}
                      onChange={(e) => setCustomFields((prev) => ({ ...prev, message: e.target.value }))}
                      placeholder="e.g., Wishing you a joyous celebration and a wonderful year ahead!"
                      className="mt-1 w-full resize-none rounded-xl border border-[#d8cfc3] bg-white px-3.5 py-2 text-xs font-medium text-[#1d2925] outline-none transition focus:border-[#1a3c36]"
                    />
                  </div>

                  {/* CUSTOM PHOTO UPLOAD */}
                  <div>
                    <label className="block text-[11px] font-bold text-[#444]">
                      Custom Photo for Card / Frame:
                    </label>
                    {customFields.customPhoto ? (
                      <div className="mt-2 flex items-center gap-3 rounded-xl border border-[#cbe3d3] bg-[#f0f8f3] p-2.5">
                        <img
                          src={resolveImageUrl(customFields.customPhoto)}
                          alt="Uploaded photo"
                          className="h-12 w-12 rounded-lg object-cover border border-[#b2d9be]"
                        />
                        <div className="flex-1 text-[11px]">
                          <p className="font-bold text-[#1b794b] flex items-center gap-1">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Photo attached
                          </p>
                          <p className="text-[#666]">Ready for gift inclusion</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setCustomFields((prev) => ({ ...prev, customPhoto: null }))}
                          className="rounded-lg p-1.5 text-[#888] transition hover:bg-white hover:text-red-600"
                          title="Remove photo"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <label className="mt-1.5 inline-flex cursor-pointer items-center gap-2 rounded-xl border border-[#1a3c36] bg-white px-4 py-2.5 text-xs font-bold text-[#1a3c36] shadow-2xs transition hover:bg-[#f4efe8]">
                        <UploadCloud className="h-4 w-4" />
                        {uploadingPhoto ? "Uploading photo..." : "Upload Memory Photo"}
                        <input
                          type="file"
                          accept="image/*"
                          disabled={uploadingPhoto}
                          onChange={handlePhotoUpload}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </div>
              </div>

              {/* QUANTITY & ACTIONS */}
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

              {/* SPECIFICATIONS */}
              <div className="mt-8 rounded-2xl border border-[#e8dfd2] bg-[#fbf9f6] p-5">
                <h3 className="border-b border-[#ebdcc8] pb-3 text-xs font-bold uppercase tracking-wider text-[#b07838]">
                  Gift Box Specifications
                </h3>
                <div className="mt-3 divide-y divide-[#f0eaee] text-xs">
                  <SpecRow label="Box Size" value={gift.box_size || "Standard Gift Box"} />
                  <SpecRow label="Box Type" value={gift.box_type || "Magnetic Closure Rigid Box"} />
                  <SpecRow label="Box Material" value={gift.material || "Premium Kappa Board"} />
                  <SpecRow label="Theme / Occasion" value={gift.theme || gift.category || "All Occasions"} />
                  <SpecRow label="Total Contents" value={`${giftItems.length} Handcrafted Items`} />
                  <SpecRow label="Brand" value={gift.brand || "Q Frames Prima Shop"} />
                </div>
              </div>
            </div>
          </div>
        </div>

        <section className="mt-6 rounded-4xl border border-[#e5ded4] bg-white p-3 shadow-sm sm:mt-8 sm:p-5 md:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[#b07838]" />
                <span className="text-[11px] font-black uppercase tracking-[0.2em] text-[#b07838]">Write a Review</span>
              </div>
              <h3 className="mt-2 text-2xl font-black tracking-tight text-[#1d2925]">Write a Review</h3>
              <p className="mt-1 text-[12px] font-semibold text-[#666]">Share your experience with this product</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-[#eef6f3] px-3 py-1 text-[10px] font-black text-[#1a3c36]">
                {reviewLoading ? "Loading..." : `${productReviews.length} Review${productReviews.length === 1 ? "" : "s"}`}
              </span>
              <span className="rounded-full bg-[#f7f3ea] px-3 py-1 text-[10px] font-black text-[#b07838]">
                {productReviews.length ? averageRating.toFixed(1) : "0.0"}/5
              </span>
            </div>
          </div>

          {reviewNotice && (
            <div className="mt-4 rounded-2xl border border-[#f1d6b3] bg-[#fffaf4] px-4 py-3 text-xs font-black text-[#b07838]">
              {reviewNotice}
            </div>
          )}

          <div className="mt-5 grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2 xl:grid-cols-[460px_minmax(0,1fr)]">
            <section className="rounded-3xl border border-[#e8dfd2] bg-[#faf8f5] p-3 sm:p-5">
              {activeUserId && userAlreadyReviewedGift ? (
                <div className="rounded-2xl border border-[#d8cfc3] bg-[#f3f0ea] p-4 text-center">
                  <p className="text-sm font-black text-[#1a3c36]">You have already reviewed this product.</p>
                </div>
              ) : (
                <form onSubmit={handleReviewSubmit} className="space-y-4">
                  <div>
                    <div className="mb-2 flex items-center gap-2">
                      <span className="text-[11px] font-black uppercase tracking-[0.15em] text-[#b07838]">Rating</span>
                      <span className="text-[11px] font-bold text-[#666]">Select your rating</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {[1,2,3,4,5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewDraft((prev) => ({ ...prev, rating: star }))}
                          className="rounded-full p-1 transition hover:bg-[#fffaf4]"
                          aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
                        >
                          <Star className={`h-6 w-6 ${star <= reviewDraft.rating ? "fill-[#d4a553] text-[#d4a553]" : "text-[#d4cdbf]"}`} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block text-[11px] font-black uppercase tracking-[0.15em] text-[#1d2925]">Review Title</label>
                    <input
                      type="text"
                      value={reviewDraft.title}
                      onChange={(e) => setReviewDraft((prev) => ({ ...prev, title: e.target.value }))}
                      placeholder="Review title"
                      className="w-full rounded-2xl border border-[#d8cfc3] bg-white px-3.5 py-2.5 text-xs font-bold text-[#1d2925] outline-none transition focus:border-[#1a3c36] focus:ring-2 focus:ring-[#1a3c36]/15"
                      required
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-[11px] font-black uppercase tracking-[0.15em] text-[#1d2925]">Your Review</label>
                    <textarea
                      rows="5"
                      value={reviewDraft.comment}
                      onChange={(e) => setReviewDraft((prev) => ({ ...prev, comment: e.target.value }))}
                      placeholder="Write your review here..."
                      className="w-full resize-none rounded-2xl border border-[#d8cfc3] bg-white px-3.5 py-3 text-xs text-[#1d2925] outline-none transition focus:border-[#1a3c36] focus:ring-2 focus:ring-[#1a3c36]/15"
                      required
                    />
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <label className="inline-flex cursor-pointer items-center gap-2 rounded-2xl border border-[#1a3c36] bg-white px-4 py-2 text-[11px] font-black text-[#1a3c36] shadow-sm transition hover:bg-[#eef6f3]">
                        <ImagePlus className="h-4 w-4" />
                        {reviewUploadingPhotos ? "Uploading..." : "Add Photos"}
                        <input type="file" accept="image/*" multiple className="hidden" onChange={handleReviewPhotoUpload} />
                      </label>
                      <span className="text-[11px] font-bold text-[#777]">
                        {reviewDraft.photos.length ? `${reviewDraft.photos.length} photo${reviewDraft.photos.length > 1 ? "s" : ""}` : "No photos added"}
                      </span>
                    </div>

                    {reviewDraft.photos.length > 0 && (
                      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                        {reviewDraft.photos.map((photo, index) => (
                          <div key={`${photo}-${index}`} className="relative group">
                            <img src={photo} alt="Review upload" className="h-20 w-full rounded-xl border border-[#e8dfd2] object-cover" />
                            <button
                              type="button"
                              onClick={() => removeReviewPhoto(photo)}
                              className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-[#1a3c36] text-white shadow transition hover:bg-[#b07838]"
                              title="Remove photo"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={reviewSubmitting || !reviewDraft.title.trim() || !reviewDraft.comment.trim()}
                    className="w-full rounded-2xl bg-[#1a3c36] px-5 py-3 text-xs font-black uppercase tracking-[0.16em] text-white shadow-md transition hover:bg-[#235048] hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {reviewSubmitting ? "Submitting..." : "Submit Review"}
                  </button>
                </form>
              )}
            </section>

            <section className="rounded-3xl border border-[#e8dfd2] bg-[#faf8f5] p-3 sm:p-5">
              <div className="flex items-center justify-between gap-3 border-b border-[#e8dfd2] pb-3">
                <div>
                  <span className="text-[11px] font-black uppercase tracking-[0.2em] text-[#b07838]">Reviews</span>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-3xl font-black text-[#1a3c36]">{productReviews.length ? averageRating.toFixed(1) : "0.0"}</span>
                    <span className="text-[11px] font-bold text-[#6a6a6a]">out of 5</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="rounded-full bg-[#eef6f3] px-3 py-1 text-[10px] font-black text-[#1a3c36]">
                    {productReviews.length} Review{productReviews.length === 1 ? "" : "s"}
                  </span>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                {[5,4,3,2,1].map((star) => {
                  const count = ratingDistribution[star] || 0;
                  const percent = productReviews.length ? (count / productReviews.length) * 100 : 0;
                  return (
                    <div key={star} className="flex items-center gap-2">
                      <span className="w-11 text-[11px] font-black text-[#666]">{star} ★</span>
                      <div className="h-2 flex-1 rounded-full bg-[#e9e4dc] overflow-hidden">
                        <div className="h-full rounded-full bg-[#d4a553]" style={{ width: `${percent}%` }} />
                      </div>
                      <span className="w-8 text-right text-[11px] font-bold text-[#666]">{count}</span>
                    </div>
                  );
                })}
              </div>

              <div className="mt-5">
                {reviewStoreArray.length > 0 ? (
                  <Swiper
                    modules={[Autoplay]}
                    autoplay={{ delay: 3500, disableOnInteraction: false }}
                    spaceBetween={12}
                    slidesPerView={1}
                    breakpoints={{
                      768: { slidesPerView: 2, spaceBetween: 16 },
                    }}
                    className="product-reviews-swiper"
                  >
                    {reviewStoreArray.slice(0, 6).map((entry, index) => (
                      <SwiperSlide key={`${entry.name}-${index}`} className="h-auto!">
                        <article className="h-full rounded-2xl border border-[#e8dfd2] bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                        <div className="flex items-start gap-3">
                          <div className="h-11 w-11 shrink-0 overflow-hidden rounded-full border border-[#d8cfc3] bg-[#f8f4ee]">
                            {entry.image ? (
                              <img src={entry.image} alt="" className="h-full w-full object-cover" />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-[11px] font-black text-[#1a3c36]">{entry.name.charAt(0).toUpperCase()}</div>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <span className="text-[11px] font-black text-[#1d2925]">{entry.name}</span>
                              <span className="text-[10px] font-bold text-[#777]">{entry.createdAt ? new Date(entry.createdAt).toLocaleDateString() : "Recent"}</span>
                            </div>
                            <div className="mt-1 flex items-center gap-1">
                              {Array.from({ length: 5 }).map((_, starIndex) => (
                                <Star key={starIndex} className={`h-3.5 w-3.5 ${starIndex < entry.rating ? "fill-[#d4a553] text-[#d4a553]" : "text-[#d3cfc5]"}`} />
                              ))}
                            </div>
                            <p className="mt-2 text-[11px] font-black text-[#1d2925]">{entry.title || "Product Feedback"}</p>
                            <p className="mt-1 text-[11px] leading-5 text-[#555]">{entry.dis}</p>
                            {entry.images?.length > 0 && (
                              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                                {entry.images.slice(0,4).map((image, photoIndex) => (
                                  <img key={`${image}-${photoIndex}`} src={image} alt="" className="h-16 w-full rounded-xl border border-[#ede4d8] object-cover" />
                                ))}
                              </div>
                            )}
                            <div className="mt-3 flex items-center gap-2">
                              <button type="button" className="rounded-full border border-[#d8cfc3] px-3 py-1 text-[10px] font-black text-[#1a3c36] transition hover:bg-[#eef6f3]">
                                Helpful
                              </button>
                            </div>
                          </div>
                        </div>
                        </article>
                      </SwiperSlide>
                    ))}
                  </Swiper>
                ) : (
                  <div className="mt-4 rounded-2xl border border-dashed border-[#d8cfc3] bg-white px-4 py-6 text-center text-[11px] font-bold text-[#666]">
                    No reviews yet. Be the first to review this product!
                  </div>
                )}
              </div>
            </section>
          </div>
        </section>

        {/* RELATED GIFTS */}
        <RelatedProducts gift={gift} type="gift" className="px-0! pb-16 pt-8" />
      </PageContainer>
    </main>
  );
};

const SpecRow = ({ label, value }) => (
  <div className="flex items-center justify-between py-2">
    <span className="text-[#777]">{label}:</span>
    <span className="font-bold text-[#222]">{value}</span>
  </div>
);

export default GiftDetailsPage;
