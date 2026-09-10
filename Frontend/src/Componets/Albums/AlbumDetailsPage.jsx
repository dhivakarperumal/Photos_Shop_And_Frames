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
  Image as ImageIcon,
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

  // Album review state
  const [albumReviews, setAlbumReviews] = useState([]);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewPopupOpen, setReviewPopupOpen] = useState(false);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewDraft, setReviewDraft] = useState({ rating: 5, title: "", comment: "", photos: [] });
  const [reviewNotice, setReviewNotice] = useState("");
  const [reviewUploadingPhotos, setReviewUploadingPhotos] = useState(false);

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

  useEffect(() => {
    if (!album) return;

    const fetchReviews = async () => {
      try {
        setReviewLoading(true);
        const albumCode = album.product_code || album.product_id || id;
        const reviewRes = await api.get(`/reviews?product_id=${encodeURIComponent(albumCode)}`);
        const rows = Array.isArray(reviewRes?.data?.data) ? reviewRes.data.data : [];
        setAlbumReviews(rows);
        setReviewNotice("");
      } catch (err) {
        console.error("Fetch album reviews error:", err);
        setAlbumReviews([]);
      } finally {
        setReviewLoading(false);
      }
    };

    fetchReviews();
  }, [album, id]);

  const activeUserId = user?.user_id || user?.id || user?.uuid || null;
  const activeAlbumCode = album?.product_code || album?.product_id || id;

  const userAlreadyReviewedAlbum = useMemo(() => {
    if (!activeUserId || !activeAlbumCode) return false;

    return albumReviews.some((review) => {
      const reviewUserId = String(review.user_id || review.created_by || review.reviewer_email || "");
      const reviewCode = String(review.product_code || review.product_id || "");
      return reviewUserId === String(activeUserId) && (
        String(reviewCode) === String(activeAlbumCode) ||
        Number(review.product_id ?? 0) === Number(album?.id ?? 0)
      );
    });
  }, [activeUserId, activeAlbumCode, album?.id, albumReviews]);

  const reviewStoreArray = useMemo(() => {
    return albumReviews
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
  }, [albumReviews]);

  const averageRating = albumReviews.length
    ? albumReviews.reduce((sum, review) => sum + Number(review.rating || 5), 0) / albumReviews.length
    : 0;

  const ratingDistribution = useMemo(() => {
    const dist = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    albumReviews.forEach((review) => {
      const r = Math.min(5, Math.max(1, Number(review.rating || 5)));
      dist[r] += 1;
    });
    return dist;
  }, [albumReviews]);

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
      console.error("Upload album review photo error:", err);
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

    if (!album?.id) {
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

    if (userAlreadyReviewedAlbum) {
      setReviewNotice("You have already reviewed this album.");
      return;
    }

    try {
      setReviewSubmitting(true);
      const payload = {
        product_id: Number(album.id || album.product_id),
        product_code: album.product_code || album.product_id || String(album.id),
        product_name: album.product_name,
        product_image: currentImage || album.thumbnail_image || null,
        product_type: "album",
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
        setAlbumReviews((prev) => [newReview, ...prev]);
        setReviewDraft({ rating: 5, title: "", comment: "", photos: [] });
        setReviewPopupOpen(false);
        setReviewNotice("");
        toast.success("Review submitted successfully");
      }
    } catch (err) {
      console.error("Submit album review error:", err);
      const apiMessage = err?.response?.data?.message || "Unable to submit your review";
      if (String(apiMessage).toLowerCase().includes("already reviewed") || err?.response?.status === 409) {
        setReviewNotice("You have already reviewed this album.");
        setReviewPopupOpen(false);
        toast.error("You have already reviewed this album.");
      } else {
        toast.error(apiMessage);
      }
    } finally {
      setReviewSubmitting(false);
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

  // Handle album photos batch upload (up to maxPhotos = sheetCount * 2)
  const handleAlbumPhotosUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const currentCount = albumPhotos.length;
    if (currentCount >= maxPhotos) {
      toast.error(`This album has reached the maximum capacity of ${maxPhotos} photos (${sheetCount} sheets × 2 photos per sheet). You cannot add more than ${maxPhotos} photos.`);
      e.target.value = "";
      return;
    }

    const remainingSlots = maxPhotos - currentCount;
    let filesToUpload = files;

    if (files.length > remainingSlots) {
      toast(`You can only add up to ${maxPhotos} photos for this album. Uploading the first ${remainingSlots} photo${remainingSlots > 1 ? "s" : ""}. More than ${maxPhotos} photos are not permitted.`, {
        icon: "⚠️",
        duration: 5000,
      });
      filesToUpload = files.slice(0, remainingSlots);
    }

    setUploadingAlbumPhotos(true);
    const toastId = toast.loading(`Uploading ${filesToUpload.length} album photo${filesToUpload.length > 1 ? "s" : ""}...`);

    try {
      const formData = new FormData();
      formData.append("folder", "album_customer_photos");
      filesToUpload.forEach((file) => {
        formData.append("files", file);
      });

      const res = await api.post("/upload", formData);
      const urls = Array.isArray(res.data?.urls)
        ? res.data.urls
        : Array.isArray(res.data?.data)
        ? res.data.data
        : [res.data?.url || res.data?.fileUrl].filter(Boolean);

      if (urls && urls.length > 0) {
        setAlbumPhotos((prev) => {
          const combined = [...prev, ...urls];
          return combined.slice(0, maxPhotos);
        });
        toast.success(`Added ${urls.length} photo${urls.length > 1 ? "s" : ""}! (${currentCount + urls.length}/${maxPhotos})`, { id: toastId });
      } else {
        throw new Error("No photo URLs returned from server");
      }
    } catch (err) {
      console.error("Album photos upload error:", err);
      toast.error("Failed to upload album photos. Please try again.", { id: toastId });
    } finally {
      setUploadingAlbumPhotos(false);
      e.target.value = "";
    }
  };

  // Handle individual photo replacement
  const handleReplacePhoto = async (index, file) => {
    if (!file) return;
    const formData = new FormData();
    formData.append("folder", "album_customer_photos");
    formData.append("file", file);

    const toastId = toast.loading(`Replacing photo #${index + 1}...`);
    try {
      const res = await api.post("/upload", formData);
      const newUrl = res.data?.url || res.data?.fileUrl || (Array.isArray(res.data?.urls) ? res.data.urls[0] : "");
      if (!newUrl) throw new Error("Upload failed");

      setAlbumPhotos((prev) => {
        const updated = [...prev];
        updated[index] = newUrl;
        return updated;
      });
      toast.success(`Photo #${index + 1} updated!`, { id: toastId });
    } catch (err) {
      console.error("Replace photo error:", err);
      toast.error("Failed to replace photo.", { id: toastId });
    }
  };

  // Remove individual photo
  const handleRemovePhoto = (index) => {
    setAlbumPhotos((prev) => prev.filter((_, idx) => idx !== index));
    toast.success(`Photo #${index + 1} removed`);
  };

  // Clear all photos
  const handleClearAllPhotos = () => {
    if (window.confirm("Are you sure you want to remove all uploaded photos?")) {
      setAlbumPhotos([]);
      toast.success("All uploaded photos removed");
    }
  };

  // Helper to build slot_photos map
  const getPreparedSlotPhotos = () => {
    const slotPhotosData = {};
    albumPhotos.forEach((url, idx) => {
      slotPhotosData[`Photo ${idx + 1}`] = url;
    });
    if (customFields.coverPhoto) {
      slotPhotosData.coverPhoto = customFields.coverPhoto;
    }
    if (customFields.coverTitle) {
      slotPhotosData.coverTitle = customFields.coverTitle;
    }
    if (customFields.dedicationNote) {
      slotPhotosData.dedicationNote = customFields.dedicationNote;
    }
    return (albumPhotos.length > 0 || customFields.coverPhoto || customFields.coverTitle || customFields.dedicationNote)
      ? slotPhotosData
      : null;
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
    if (album.photo_upload_required && albumPhotos.length === 0) {
      toast.error("Please upload at least 1 photo for this album before adding to cart");
      return;
    }
    if (albumPhotos.length > maxPhotos) {
      toast.error(`You cannot upload more than ${maxPhotos} photos for this album.`);
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
        slot_photos: getPreparedSlotPhotos(),
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
    if (album.photo_upload_required && albumPhotos.length === 0) {
      toast.error("Please upload at least 1 photo for this album before ordering");
      return;
    }
    if (albumPhotos.length > maxPhotos) {
      toast.error(`You cannot upload more than ${maxPhotos} photos for this album.`);
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
      slot_photos: getPreparedSlotPhotos(),
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

  const totalPages = album.total_pages || (sheetCount * 2) || 40;

  return (
    <main className="min-h-screen bg-[#f7f3ed] pb-20">
      <PageHeader title={album.product_name} />
      <PageContainer className="py-10">
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

              {/* ============================================================ */}
              {/* ALBUM PHOTOS UPLOAD (UP TO {maxPhotos} PHOTOS = sheetCount * 2) */}
              {/* ============================================================ */}
              <div className="mt-6 rounded-2xl border border-[#ebdcc8] bg-[#fdfbf8] p-5 shadow-2xs">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#f0e8dc] pb-3">
                  <div>
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#9b6b2d]">
                      <ImageIcon className="h-4 w-4" /> Upload Album Photos ({albumPhotos.length} / {maxPhotos})
                    </div>
                    <p className="mt-1 text-[11px] text-[#666]">
                      This album has <strong className="text-[#1d2925]">{sheetCount} sheets</strong> (2 photos per sheet = <strong className="text-[#1a3c36]">max {maxPhotos} photos</strong>).
                      You can add up to {maxPhotos} photos (less than {maxPhotos} is allowed). More than {maxPhotos} photos cannot be added.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        albumPhotos.length >= maxPhotos
                          ? "bg-amber-100 text-amber-900 border border-amber-300"
                          : albumPhotos.length > 0
                          ? "bg-[#e8efeb] text-[#1a3c36] border border-[#b9d5c8]"
                          : "bg-gray-100 text-gray-600 border border-gray-200"
                      }`}
                    >
                      {albumPhotos.length} / {maxPhotos} Photos
                    </span>
                    {albumPhotos.length > 0 && (
                      <button
                        type="button"
                        onClick={handleClearAllPhotos}
                        className="rounded-lg border border-red-200 bg-red-50 px-2.5 py-1 text-[11px] font-bold text-red-600 transition hover:bg-red-100"
                      >
                        Clear All
                      </button>
                    )}
                  </div>
                </div>

                {/* CAPACITY PROGRESS BAR */}
                <div className="mt-3">
                  <div className="flex justify-between text-[10px] font-semibold text-[#888]">
                    <span>Capacity ({sheetCount} Sheets)</span>
                    <span>
                      {maxPhotos - albumPhotos.length > 0
                        ? `${maxPhotos - albumPhotos.length} slots remaining`
                        : "Maximum capacity reached (40/40)"}
                    </span>
                  </div>
                  <div className="mt-1 h-2.5 w-full overflow-hidden rounded-full bg-[#ece5dc]">
                    <div
                      className={`h-full transition-all duration-300 ${
                        albumPhotos.length >= maxPhotos ? "bg-[#b07838]" : "bg-[#1a3c36]"
                      }`}
                      style={{ width: `${Math.min(100, (albumPhotos.length / maxPhotos) * 100)}%` }}
                    />
                  </div>
                </div>

                {/* MULTI-FILE UPLOAD AREA */}
                {albumPhotos.length < maxPhotos ? (
                  <div className="mt-4">
                    <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#1a3c36]/35 bg-white p-5 text-center transition hover:border-[#1a3c36] hover:bg-[#faf7f2]">
                      <UploadCloud className="h-8 w-8 text-[#1a3c36]" />
                      <p className="mt-2 text-xs font-bold text-[#1d2925]">
                        {uploadingAlbumPhotos ? "Uploading Photos to Album..." : "Click or Drag & Drop Photos to Upload"}
                      </p>
                      <p className="mt-1 text-[11px] text-[#777]">
                        Upload single or multiple images • Up to <strong>{maxPhotos} photos max</strong> ({maxPhotos - albumPhotos.length} slots left)
                      </p>
                      <span className="mt-2 inline-flex items-center gap-1 rounded-xl bg-[#1a3c36] px-4 py-1.5 text-xs font-bold text-white shadow-2xs">
                        <Plus className="h-3.5 w-3.5" /> Choose Photos
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        disabled={uploadingAlbumPhotos}
                        onChange={handleAlbumPhotosUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                ) : (
                  <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-center text-xs font-semibold text-amber-800">
                    Maximum limit of {maxPhotos} photos reached for this {sheetCount}-sheet album. Remove any photo to add a different one.
                  </div>
                )}

                {/* UPLOADED PHOTOS GRID */}
                {albumPhotos.length > 0 && (
                  <div className="mt-4 border-t border-[#f0e8dc] pt-3">
                    <div className="mb-2.5 flex items-center justify-between text-xs font-semibold text-[#555]">
                      <span>Uploaded Photos ({albumPhotos.length}):</span>
                      <span className="text-[11px] text-[#888]">Hover on photo to replace or delete</span>
                    </div>

                    <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4 md:grid-cols-5 max-h-80 overflow-y-auto p-1 scrollbar-thin">
                      {albumPhotos.map((photoUrl, idx) => (
                        <div
                          key={`${photoUrl}-${idx}`}
                          className="group relative aspect-square overflow-hidden rounded-xl border border-[#e8dfd2] bg-white p-1 shadow-2xs transition hover:border-[#1a3c36]"
                        >
                          <img
                            src={resolveImageUrl(photoUrl)}
                            alt={`Album Photo ${idx + 1}`}
                            className="h-full w-full rounded-lg object-cover"
                          />
                          {/* Position Badge */}
                          <span className="absolute left-1.5 top-1.5 rounded-md bg-black/75 px-1.5 py-0.5 text-[9px] font-black text-white backdrop-blur-xs">
                            #{idx + 1}
                          </span>

                          {/* Hover Controls: Replace / Delete */}
                          <div className="absolute inset-0 flex items-center justify-center gap-1.5 bg-black/65 opacity-0 transition group-hover:opacity-100 rounded-xl">
                            <label
                              className="cursor-pointer rounded-lg bg-white/95 p-1.5 text-[#1d2925] shadow transition hover:bg-white hover:text-[#1a3c36]"
                              title="Replace this photo"
                            >
                              <UploadCloud className="h-3.5 w-3.5" />
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                  const f = e.target.files?.[0];
                                  if (f) handleReplacePhoto(idx, f);
                                }}
                                className="hidden"
                              />
                            </label>
                            <button
                              type="button"
                              onClick={() => handleRemovePhoto(idx)}
                              className="rounded-lg bg-white/95 p-1.5 text-red-600 shadow transition hover:bg-white hover:text-red-700"
                              title="Delete this photo"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

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

        <section className="mt-8 rounded-[2rem] border border-[#e5ded4] bg-white p-5 shadow-sm md:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[#b07838]" />
                <span className="text-[11px] font-black uppercase tracking-[0.2em] text-[#b07838]">Write a Review</span>
              </div>
              <h3 className="mt-2 text-2xl font-black tracking-tight text-[#1d2925]">Write a Review</h3>
              <p className="mt-1 text-[12px] font-semibold text-[#666]">Share your experience with this album</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-[#eef6f3] px-3 py-1 text-[10px] font-black text-[#1a3c36]">
                {reviewLoading ? "Loading..." : `${albumReviews.length} Review${albumReviews.length === 1 ? "" : "s"}`}
              </span>
              <span className="rounded-full bg-[#f7f3ea] px-3 py-1 text-[10px] font-black text-[#b07838]">
                {albumReviews.length ? averageRating.toFixed(1) : "0.0"}/5
              </span>
            </div>
          </div>

          {reviewNotice && (
            <div className="mt-4 rounded-2xl border border-[#f1d6b3] bg-[#fffaf4] px-4 py-3 text-xs font-black text-[#b07838]">
              {reviewNotice}
            </div>
          )}

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[460px_minmax(420px,1fr)]">
            <section className="rounded-[1.5rem] border border-[#e8dfd2] bg-[#faf8f5] p-5">
              {activeUserId && userAlreadyReviewedAlbum ? (
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
                      <div className="mt-3 grid grid-cols-4 gap-2">
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

            <section className="rounded-[1.5rem] border border-[#e8dfd2] bg-[#faf8f5] p-5">
              <div className="flex items-center justify-between gap-3 border-b border-[#e8dfd2] pb-3">
                <div>
                  <span className="text-[11px] font-black uppercase tracking-[0.2em] text-[#b07838]">Reviews</span>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-3xl font-black text-[#1a3c36]">{albumReviews.length ? averageRating.toFixed(1) : "0.0"}</span>
                    <span className="text-[11px] font-bold text-[#6a6a6a]">out of 5</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="rounded-full bg-[#eef6f3] px-3 py-1 text-[10px] font-black text-[#1a3c36]">
                    {albumReviews.length} Review{albumReviews.length === 1 ? "" : "s"}
                  </span>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                {[5,4,3,2,1].map((star) => {
                  const count = ratingDistribution[star] || 0;
                  const percent = albumReviews.length ? (count / albumReviews.length) * 100 : 0;
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
                  <div className="space-y-3">
                    {reviewStoreArray.slice(0, 6).map((entry, index) => (
                      <article key={`${entry.name}-${index}`} className="rounded-2xl border border-[#e8dfd2] bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
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
                              <div className="mt-3 grid grid-cols-4 gap-2">
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
                    ))}
                  </div>
                ) : (
                  <div className="mt-4 rounded-2xl border border-dashed border-[#d8cfc3] bg-white px-4 py-6 text-center text-[11px] font-bold text-[#666]">
                    No reviews yet. Be the first to review this album!
                  </div>
                )}
              </div>
            </section>
          </div>
        </section>

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
        <RelatedProducts album={album} type="album" className="!px-0 pb-16 pt-8" />
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
