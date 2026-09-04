import React, { useContext, useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  Check,
  CheckCircle2,
  Download,
  Eye,
  EyeOff,
  Heart,
  Image as ImageIcon,
  ImagePlus,
  Layers,
  Move,
  Package,
  RotateCw,
  Share2,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Sliders,
  Sparkles,
  Trash2,
  Truck,
  UploadCloud,
  X,
} from "lucide-react";
import api from "../../api";
import { StoreContext } from "../../PrivateRouter/StoreContext";
import { useAuth } from "../../PrivateRouter/AuthContext";
import toast from "react-hot-toast";
import CheckoutModal from "../Checkout/CheckoutModal";
import PhotoAdjustModal from "../../CommonComponents/PhotoAdjustModal";
import PageHeader from "../../CommonComponents/PageHeader";

/**
 * Generates an HTML5 canvas composite merging the frame template
 * and all customer uploaded slot photos into a single whole frame image.
 */
const generateCompositeFrameBlobAndDataUrl = (
  frameImageSrc,
  slots = [],
  customerPhotos = {},
  demoPhotos = {},
  photoAdjustments = {}
) => {
  return new Promise((resolve) => {
    if (!frameImageSrc) return resolve({ blob: null, dataUrl: null });

    const frameImg = new Image();
    frameImg.crossOrigin = "anonymous";
    frameImg.src = frameImageSrc;

    frameImg.onload = async () => {
      try {
        const canvas = document.createElement("canvas");
        const w = frameImg.naturalWidth || 1000;
        const h = frameImg.naturalHeight || 1000;
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");

        // 1. Draw Frame background image
        ctx.drawImage(frameImg, 0, 0, w, h);

        const parsePercentage = (val, total) => {
          if (typeof val === "string" && val.includes("%")) {
            return (parseFloat(val) / 100) * total;
          }
          return parseFloat(val) || 0;
        };

        // 2. Draw each slot photo
        for (const slot of slots || []) {
          const photoSrc = customerPhotos[slot.id] || demoPhotos[slot.id];
          if (!photoSrc) continue;

          const adj = photoAdjustments[slot.id] || { panX: 0, panY: 0, scale: 1.0 };
          const panX = adj.panX || 0;
          const panY = adj.panY || 0;
          const scale = adj.scale || 1.0;

          await new Promise((slotResolve) => {
            const pImg = new Image();
            pImg.crossOrigin = "anonymous";
            pImg.src = photoSrc;

            pImg.onload = () => {
              ctx.save();
              const sx = parsePercentage(slot.left, w);
              const sy = parsePercentage(slot.top, h);
              const sw = parsePercentage(slot.width, w);
              const sh = parsePercentage(slot.height, h);

              // Clip region (circle or rounded rectangle)
              ctx.beginPath();
              if (slot.shape === "circle") {
                ctx.arc(sx + sw / 2, sy + sh / 2, Math.min(sw, sh) / 2, 0, Math.PI * 2);
              } else {
                const radius = Math.min(12, Math.min(sw, sh) * 0.05);
                if (ctx.roundRect) {
                  ctx.roundRect(sx, sy, sw, sh, radius);
                } else {
                  ctx.rect(sx, sy, sw, sh);
                }
              }
              ctx.closePath();
              ctx.clip();

              // Calculate object-fit with pan & zoom
              const imgRatio = pImg.naturalWidth / pImg.naturalHeight;
              const slotRatio = sw / sh;
              let baseW = sw, baseH = sh;

              if (slot.objectFit === "contain") {
                if (imgRatio > slotRatio) {
                  baseW = sw;
                  baseH = sw / imgRatio;
                } else {
                  baseH = sh;
                  baseW = sh * imgRatio;
                }
              } else {
                // cover
                if (imgRatio > slotRatio) {
                  baseH = sh;
                  baseW = sh * imgRatio;
                } else {
                  baseW = sw;
                  baseH = sw / imgRatio;
                }
              }

              const dw = baseW * scale;
              const dh = baseH * scale;
              const dx = sx + (sw - dw) / 2 + (panX / 100) * sw;
              const dy = sy + (sh - dh) / 2 + (panY / 100) * sh;

              ctx.drawImage(pImg, dx, dy, dw, dh);
              ctx.restore();
              slotResolve();
            };

            pImg.onerror = () => slotResolve();
          });
        }

        const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
        canvas.toBlob(
          (blob) => {
            resolve({ blob, dataUrl });
          },
          "image/jpeg",
          0.92
        );
      } catch (err) {
        console.error("Composite generation error:", err);
        resolve({ blob: null, dataUrl: null });
      }
    };

    frameImg.onerror = () => resolve({ blob: null, dataUrl: null });
  });
};

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart, wishlist, openCart } = useContext(StoreContext);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [customerPhotos, setCustomerPhotos] = useState({});
  const [uploadingSlot, setUploadingSlot] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [savingCustomization, setSavingCustomization] = useState(false);
  const [customizationId, setCustomizationId] = useState(null);

  // Confirmation Modal state & Action type
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [confirmActionType, setConfirmActionType] = useState("cart"); // "cart" | "buy"
  const [highlightMissingSlots, setHighlightMissingSlots] = useState(false);

  // Photo Position Adjustments ({ [slotId]: { panX, panY, scale } })
  const [photoAdjustments, setPhotoAdjustments] = useState({});
  const [adjustingSlot, setAdjustingSlot] = useState(null);
  const [activeDraggingSlot, setActiveDraggingSlot] = useState(null);
  const dragSlotStartRef = useRef({ x: 0, y: 0, startPanX: 0, startPanY: 0, hasMoved: false });

  // View mode: 'editor' (interactive frame with slots) vs 'preview' (whole merged composite photo)
  const [viewMode, setViewMode] = useState("editor");
  const [mergedPreviewUrl, setMergedPreviewUrl] = useState(null);
  const [generatingPreview, setGeneratingPreview] = useState(false);
  const [compositeServerUrl, setCompositeServerUrl] = useState(null);

  const fileInputRefs = useRef({});

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/products/${id}`);
        if (res.data?.data) {
          const prod = res.data.data;
          setProduct(prod);
          if (prod.size_variants && prod.size_variants.length > 0) {
            setSelectedVariantIndex(0);
          }
          if (prod.frame_data?.slot_adjustments) {
            setPhotoAdjustments(prod.frame_data.slot_adjustments);
          } else if (prod.slot_adjustments) {
            setPhotoAdjustments(prod.slot_adjustments);
          }
        } else {
          toast.error("Product not found");
        }
      } catch (err) {
        console.error("Fetch product error:", err);
        toast.error("Failed to load product details");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const frameData = product?.frame_data || {};
  const photoSlots = frameData.photo_slots || [];
  const sizeVariants = product?.size_variants || [];
  const selectedVariant = sizeVariants[selectedVariantIndex] || {};
  const inStock = (selectedVariant.stock ?? 1) > 0;

  // Refresh merged whole frame preview whenever customer photos or adjustments change
  useEffect(() => {
    if (!frameData.frame_image) return;

    let isMounted = true;
    const updatePreview = async () => {
      setGeneratingPreview(true);
      const { dataUrl } = await generateCompositeFrameBlobAndDataUrl(
        frameData.frame_image,
        photoSlots,
        customerPhotos,
        product?.slot_photos || {},
        photoAdjustments
      );
      if (isMounted) {
        setMergedPreviewUrl(dataUrl);
        setGeneratingPreview(false);
      }
    };

    updatePreview();
    return () => {
      isMounted = false;
    };
  }, [customerPhotos, photoAdjustments, frameData.frame_image, photoSlots, product]);

  // Handle uploading user's personal photo into a slot
  const handleSlotUpload = async (slotId, event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload a valid image file (JPG, PNG, WebP).");
      return;
    }

    setUploadingSlot(slotId);
    const formData = new FormData();
    formData.append("folder", "customizations");
    formData.append("file", file);

    try {
      const res = await api.post("/upload", formData);
      const url = res.data?.url || res.data?.urls?.[0];
      if (!url) throw new Error("Upload did not return photo URL");

      setCustomerPhotos((prev) => ({
        ...prev,
        [slotId]: url,
      }));
      setPhotoAdjustments((prev) => ({
        ...prev,
        [slotId]: prev[slotId] || { panX: 0, panY: 0, scale: 1.0 },
      }));
      setHighlightMissingSlots(false);
      toast.success("Photo uploaded to frame slot!");
    } catch (err) {
      console.error("Slot upload error:", err);
      toast.error("Could not upload photo. Please try again.");
    } finally {
      setUploadingSlot(null);
      event.target.value = "";
    }
  };

  const removeCustomerPhoto = (slotId) => {
    setCustomerPhotos((prev) => {
      const updated = { ...prev };
      delete updated[slotId];
      return updated;
    });
    setPhotoAdjustments((prev) => {
      const updated = { ...prev };
      delete updated[slotId];
      return updated;
    });
  };

  // Direct In-Slot Drag Handlers
  const handleSlotDragStart = (slotId, e) => {
    const photo = customerPhotos[slotId] || product?.slot_photos?.[slotId];
    if (!photo) return;

    e.stopPropagation();
    setActiveDraggingSlot(slotId);
    const curr = photoAdjustments[slotId] || { panX: 0, panY: 0, scale: 1.0 };
    dragSlotStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      startPanX: curr.panX || 0,
      startPanY: curr.panY || 0,
      hasMoved: false,
    };
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch (err) {}
  };

  const handleSlotDragMove = (slotId, e) => {
    if (activeDraggingSlot !== slotId) return;
    e.preventDefault();
    e.stopPropagation();

    const dx = e.clientX - dragSlotStartRef.current.x;
    const dy = e.clientY - dragSlotStartRef.current.y;

    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
      dragSlotStartRef.current.hasMoved = true;
    }

    const curr = photoAdjustments[slotId] || { panX: 0, panY: 0, scale: 1.0 };
    const maxPan = Math.max(40, ((curr.scale || 1.0) - 1) * 60 + 40);

    const deltaPercentX = dx * 0.35;
    const deltaPercentY = dy * 0.35;

    const newPanX = Math.min(maxPan, Math.max(-maxPan, dragSlotStartRef.current.startPanX + deltaPercentX));
    const newPanY = Math.min(maxPan, Math.max(-maxPan, dragSlotStartRef.current.startPanY + deltaPercentY));

    setPhotoAdjustments((prev) => ({
      ...prev,
      [slotId]: {
        ...curr,
        panX: Math.round(newPanX * 10) / 10,
        panY: Math.round(newPanY * 10) / 10,
      },
    }));
  };

  const handleSlotDragEnd = (slotId, e) => {
    if (activeDraggingSlot === slotId) {
      setActiveDraggingSlot(null);
      try {
        if (e.currentTarget.hasPointerCapture(e.pointerId)) {
          e.currentTarget.releasePointerCapture(e.pointerId);
        }
      } catch (err) {}
    }
  };

  /**
   * Generates the whole merged frame composite, uploads it to /upload,
   * and saves the whole photo in customized_photos.preview_image
   * along with individual slot_photos in separate customized_photos table.
   * Admin product in products table remains 100% UNTOUCHED.
   */
  const ensureCustomizationSaved = async () => {
    const hasPhotos = Object.keys(customerPhotos).length > 0;

    setSavingCustomization(true);
    try {
      const activeUserId =
        user?.user_id ||
        user?.id ||
        localStorage.getItem("frame_shop_guest_id") ||
        null;

      // 1. Generate full composite (Whole Frame + Customer Photos merged on Canvas)
      let wholeFramePhotoUrl = compositeServerUrl || frameData.frame_image || null;

      const { blob } = await generateCompositeFrameBlobAndDataUrl(
        frameData.frame_image,
        photoSlots,
        customerPhotos,
        product?.slot_photos || {},
        photoAdjustments
      );

      if (blob) {
        const compFormData = new FormData();
        compFormData.append("folder", "customizations");
        compFormData.append(
          "file",
          blob,
          `whole-frame-${product.id}-${Date.now()}.jpg`
        );

        try {
          const compRes = await api.post("/upload", compFormData);
          const uploadedUrl = compRes.data?.url || compRes.data?.urls?.[0];
          if (uploadedUrl) {
            wholeFramePhotoUrl = uploadedUrl;
            setCompositeServerUrl(uploadedUrl);
          }
        } catch (uploadErr) {
          console.warn("Composite upload fallback:", uploadErr);
        }
      }

      // 2. Save both whole photo and individual photos in customized_photos table
      const finalCustomizationId =
        customizationId || `CUST-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

      const res = await api.post("/customizations", {
        customization_id: finalCustomizationId,
        user_id: activeUserId,
        product_id: product.id,
        slot_photos: customerPhotos,
        photo_adjustments: photoAdjustments,
        preview_image: wholeFramePhotoUrl,
      });

      if (res.data?.success) {
        setCustomizationId(finalCustomizationId);
        return {
          customization_id: finalCustomizationId,
          preview_image: wholeFramePhotoUrl,
        };
      }

      return {
        customization_id: finalCustomizationId,
        preview_image: wholeFramePhotoUrl,
      };
    } catch (err) {
      console.error("Save customization error:", err);
      return null;
    } finally {
      setSavingCustomization(false);
    }
  };

  const getMissingSlots = () => {
    if (!photoSlots || photoSlots.length === 0) return [];
    return photoSlots.filter((slot) => !customerPhotos[slot.id]);
  };

  const handleAddToCart = () => {
    if (!product) return;
    if (!inStock) {
      toast.error("Selected size variant is out of stock.");
      return;
    }

    const missing = getMissingSlots();
    if (missing.length > 0) {
      setHighlightMissingSlots(true);
      setViewMode("editor");
      toast.error(
        `Please upload photos for all ${photoSlots.length} available positions before adding to cart (${photoSlots.length - missing.length}/${photoSlots.length} uploaded).`
      );
      return;
    }

    setConfirmActionType("cart");
    setIsConfirmModalOpen(true);
  };

  const handleBuyNow = () => {
    if (!product) return;
    if (!inStock) {
      toast.error("Selected size variant is out of stock.");
      return;
    }

    const missing = getMissingSlots();
    if (missing.length > 0) {
      setHighlightMissingSlots(true);
      setViewMode("editor");
      toast.error(
        `Please upload photos for all ${photoSlots.length} available positions before checkout (${photoSlots.length - missing.length}/${photoSlots.length} uploaded).`
      );
      return;
    }

    setConfirmActionType("buy");
    setIsConfirmModalOpen(true);
  };

  const handleConfirmedAction = async () => {
    if (confirmActionType === "cart") {
      setAddingToCart(true);
      try {
        const savedCust = await ensureCustomizationSaved();

        const success = await addToCart(product, {
          size: selectedVariant.size || "Standard",
          price: Number(selectedVariant.offer_price || selectedVariant.mrp || 0),
          quantity: Number(quantity),
          customization_id: savedCust?.customization_id || null,
          slot_photos: customerPhotos,
          photo_adjustments: photoAdjustments,
          preview_image: savedCust?.preview_image || mergedPreviewUrl,
        });

        if (success !== false) {
          setIsConfirmModalOpen(false);
          toast.success("Custom frame confirmed & added to cart!");
          if (openCart) openCart();
        }
      } catch (err) {
        console.error("Confirmed add to cart error:", err);
        toast.error("Failed to add customized frame to cart");
      } finally {
        setAddingToCart(false);
      }
    } else if (confirmActionType === "buy") {
      setSavingCustomization(true);
      try {
        const savedCust = await ensureCustomizationSaved();
        if (savedCust?.preview_image) {
          setCompositeServerUrl(savedCust.preview_image);
        }
        setIsConfirmModalOpen(false);
        setIsCheckoutOpen(true);
      } catch (err) {
        console.error("Confirmed buy now error:", err);
        toast.error("Failed to prepare checkout");
      } finally {
        setSavingCustomization(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-[#f8f5f0]">
        <div className="text-center">
          <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-[#b07838] border-t-transparent" />
          <p className="mt-3 text-sm font-semibold text-[#666]">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center bg-[#f8f5f0] p-6 text-center">
        <Package className="h-16 w-16 text-[#b9aa98]" />
        <h2 className="mt-4 text-2xl font-bold text-[#1d2925]">Product Not Found</h2>
        <p className="mt-1 text-sm text-[#777]">The product you are looking for does not exist or has been removed.</p>
        <Link
          to="/shop"
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#1a3c36] px-5 py-2.5 text-xs font-bold text-white shadow"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Shop
        </Link>
      </div>
    );
  }

  const customPhotoCount = Object.keys(customerPhotos).length;
  const totalSlotsCount = photoSlots.length;
  const discountPercent =
    selectedVariant.mrp && selectedVariant.offer_price
      ? Math.round(
          ((selectedVariant.mrp - selectedVariant.offer_price) /
            selectedVariant.mrp) *
            100
        )
      : 0;

  // Prepare item for CheckoutModal if user clicks Buy Now
  const checkoutItems = [
    {
      product_id: product.id,
      product_name: product.product_name,
      category: product.category,
      size: selectedVariant.size || "Standard",
      price: Number(selectedVariant.offer_price || selectedVariant.mrp || 0),
      quantity: Number(quantity),
      customization_id: customizationId,
      slot_photos: customerPhotos,
      photo_adjustments: photoAdjustments,
      product_image: compositeServerUrl || mergedPreviewUrl || product.product_images?.[0] || frameData.frame_image,
      frame_image: frameData.frame_image,
    },
  ];

  return (
    <main className="min-h-screen bg-[#f8f5f0] px-4 py-8 md:px-8">
      <PageHeader title={product.product_name} />
      <div className="mx-auto max-w-7xl">
        {/* BREADCRUMB */}
        <div className="mb-6 flex items-center gap-2 text-xs text-[#777]">
          <Link to="/" className="hover:text-[#b07838]">Home</Link>
          <span>/</span>
          <Link to="/shop" className="hover:text-[#b07838]">Shop</Link>
          <span>/</span>
          <span className="font-semibold text-[#1d2925] truncate">{product.product_name}</span>
        </div>

        {/* TWO-COLUMN PRODUCT WORKSPACE */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* ================= LEFT COLUMN: LIVE FRAME CANVAS & MERGED WHOLE PREVIEW (7 COLS) ================= */}
          <div className="lg:col-span-7">
            <div className="sticky top-28 rounded-3xl border border-[#ebe3d7] bg-white p-5 shadow-sm md:p-8">
              {/* CANVAS HEADER WITH VIEW SWITCHER */}
              <div className="mb-4 flex flex-col gap-3 border-b border-[#f0e8dc] pb-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#eef6f3] text-[#1a3c36]">
                      <Sparkles className="h-4 w-4" />
                    </span>
                    <h3 className="text-sm font-bold text-[#1d2925]">
                      {viewMode === "editor" ? "Interactive Photo Slots" : "Whole Merged Frame Preview"}
                    </h3>
                  </div>
                  <p className="mt-0.5 text-[11px] text-[#777]">
                    {customPhotoCount > 0
                      ? `${customPhotoCount} of ${totalSlotsCount} custom photos placed`
                      : "Click slots to add your photos"}
                  </p>
                </div>

                {/* VIEW MODE TOGGLE BUTTONS */}
                <div className="inline-flex rounded-xl border border-[#e2d9cd] bg-[#f9f7f4] p-1 text-xs">
                  <button
                    type="button"
                    onClick={() => setViewMode("editor")}
                    className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-bold transition ${
                      viewMode === "editor"
                        ? "bg-[#1a3c36] text-white shadow-xs"
                        : "text-[#666] hover:text-[#1d2925]"
                    }`}
                  >
                    <Layers className="h-3.5 w-3.5" /> Slot Editor
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("preview")}
                    className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-bold transition ${
                      viewMode === "preview"
                        ? "bg-[#1a3c36] text-white shadow-xs"
                        : "text-[#666] hover:text-[#1d2925]"
                    }`}
                  >
                    <Eye className="h-3.5 w-3.5" /> Whole Frame Preview
                  </button>
                </div>
              </div>

              {/* FRAME STAGE */}
              <div className="relative flex min-h-[440px] items-center justify-center overflow-hidden rounded-2xl border border-[#e8dfd2] bg-[#f5efe7] p-4 sm:p-8">
                {frameData.frame_image ? (
                  viewMode === "preview" ? (
                    /* ================= WHOLE MERGED COMPOSITE PREVIEW ================= */
                    <div className="relative mx-auto w-full max-w-[500px] overflow-hidden rounded-xl shadow-2xl transition duration-300">
                      {generatingPreview ? (
                        <div className="flex h-80 w-full items-center justify-center bg-white/80">
                          <div className="text-center">
                            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-[#b07838] border-t-transparent" />
                            <p className="mt-2 text-xs font-semibold text-[#555]">
                              Rendering whole frame photo...
                            </p>
                          </div>
                        </div>
                      ) : mergedPreviewUrl ? (
                        <div>
                          <img
                            src={mergedPreviewUrl}
                            alt="Whole Merged Frame Preview"
                            className="block h-auto w-full select-none"
                          />
                          <div className="absolute bottom-3 left-3 rounded-full bg-black/75 px-3 py-1 text-[11px] font-bold text-white shadow backdrop-blur-xs flex items-center gap-1.5">
                            <CheckCircle2 className="h-3.5 w-3.5 text-[#22c55e]" /> Whole Merged Frame Ready
                          </div>
                        </div>
                      ) : (
                        <div className="p-8 text-center text-xs text-[#777]">
                          Loading frame preview...
                        </div>
                      )}
                    </div>
                  ) : (
                    /* ================= INTERACTIVE SLOT PHOTO EDITOR ================= */
                    <div className="relative mx-auto w-full max-w-[500px] overflow-hidden rounded-xl shadow-xl">
                      {/* FRAME BACKGROUND */}
                      <img
                        src={frameData.frame_image}
                        alt={frameData.frame_name || product.product_name}
                        className="block h-auto w-full select-none"
                      />

                      {/* PHOTO SLOTS OVERLAY */}
                      {photoSlots.map((slot, idx) => {
                        const userPhoto = customerPhotos[slot.id];
                        const demoPhoto = product.slot_photos?.[slot.id];
                        const activePhoto = userPhoto || demoPhoto;

                        return (
                          <React.Fragment key={slot.id || idx}>
                            <input
                              ref={(el) => {
                                fileInputRefs.current[slot.id] = el;
                              }}
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handleSlotUpload(slot.id, e)}
                            />

                            <div
                              className={`group absolute overflow-hidden border-2 select-none transition ${
                                userPhoto
                                  ? "border-[#1b794b] ring-2 ring-[#1b794b]/30"
                                  : highlightMissingSlots
                                  ? "border-2 border-red-500 bg-red-100/50 ring-4 ring-red-400/50 animate-pulse"
                                  : "border-dashed border-[#b07838] bg-white/70 hover:bg-white/95"
                              }`}
                              style={{
                                top: slot.top,
                                left: slot.left,
                                width: slot.width,
                                height: slot.height,
                                borderRadius: slot.shape === "circle" ? "9999px" : "6px",
                              }}
                            >
                              {activePhoto ? (
                                <div
                                  onPointerDown={(e) => handleSlotDragStart(slot.id, e)}
                                  onPointerMove={(e) => handleSlotDragMove(slot.id, e)}
                                  onPointerUp={(e) => handleSlotDragEnd(slot.id, e)}
                                  onPointerCancel={(e) => handleSlotDragEnd(slot.id, e)}
                                  className={`relative h-full w-full overflow-hidden ${
                                    activeDraggingSlot === slot.id ? "cursor-grabbing" : "cursor-grab"
                                  }`}
                                  title="Drag to reposition photo"
                                >
                                  {/* PHOTO WITH PAN & ZOOM TRANSFORM */}
                                  {(() => {
                                    const adj = photoAdjustments[slot.id] || { panX: 0, panY: 0, scale: 1.0 };
                                    return (
                                      <img
                                        src={activePhoto}
                                        alt={slot.name}
                                        draggable={false}
                                        className={`pointer-events-none absolute select-none ${!userPhoto ? "opacity-75" : ""}`}
                                        style={{
                                          top: "50%",
                                          left: "50%",
                                          width: "100%",
                                          height: "100%",
                                          objectFit: slot.objectFit === "contain" ? "contain" : "cover",
                                          transform: `translate(calc(-50% + ${adj.panX || 0}%), calc(-50% + ${adj.panY || 0}%)) scale(${adj.scale || 1.0})`,
                                          transition: activeDraggingSlot === slot.id ? "none" : "transform 0.08s ease-out",
                                        }}
                                      />
                                    );
                                  })()}

                                  {userPhoto ? (
                                    <div className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#1b794b] text-white shadow z-10 pointer-events-none">
                                      <Check className="h-2.5 w-2.5" />
                                    </div>
                                  ) : (
                                    <div className="absolute top-1 left-1 rounded bg-[#b07838] px-1.5 py-0.5 text-[8px] font-bold text-white shadow z-10 pointer-events-none">
                                      {highlightMissingSlots ? "Upload Needed" : "Sample Photo"}
                                    </div>
                                  )}

                                  {/* HOVER OVERLAY: ADJUST & CHANGE */}
                                  <div className="absolute inset-0 flex items-center justify-center gap-1.5 bg-black/45 opacity-0 transition group-hover:opacity-100 z-20">
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setAdjustingSlot(slot);
                                      }}
                                      className="rounded-md bg-white/95 px-2 py-1 text-[10px] font-bold text-[#1a3c36] shadow hover:bg-white flex items-center gap-1"
                                      title="Reposition & Zoom photo"
                                    >
                                      <Move className="h-3 w-3 text-[#b07838]" /> Adjust
                                    </button>

                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        fileInputRefs.current[slot.id]?.click();
                                      }}
                                      className="rounded-md bg-[#1a3c36] px-2 py-1 text-[10px] font-bold text-white shadow hover:bg-[#235048] flex items-center gap-1"
                                      title="Change photo file"
                                    >
                                      <UploadCloud className="h-3 w-3 text-white" /> {userPhoto ? "Change" : "Upload"}
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => fileInputRefs.current[slot.id]?.click()}
                                  className="flex h-full w-full flex-col items-center justify-center p-1 text-center"
                                >
                                  <UploadCloud className={`h-5 w-5 ${highlightMissingSlots ? "text-red-500" : "text-[#b07838]"}`} />
                                  <span className="mt-0.5 rounded bg-white/90 px-1.5 py-0.5 text-[9px] font-bold text-[#1a3c36] shadow-xs">
                                    {slot.name || `Slot ${idx + 1}`}
                                  </span>
                                  <span className="mt-0.5 text-[8px] font-semibold text-[#b07838]">Upload Photo</span>
                                </button>
                              )}
                            </div>
                          </React.Fragment>
                        );
                      })}
                    </div>
                  )
                ) : (
                  <div className="flex h-72 w-full items-center justify-center">
                    {product.product_images?.[0] ? (
                      <img
                        src={product.product_images[0]}
                        alt={product.product_name}
                        className="max-h-72 object-contain"
                      />
                    ) : (
                      <ImagePlus className="h-16 w-16 text-[#b9aa98]" />
                    )}
                  </div>
                )}
              </div>

              {/* QUICK TOGGLE & TIP */}
              <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#f0e7dc] bg-[#faf8f5] p-3 text-xs text-[#666]">
                <div className="flex items-center gap-2">
                  <span className="text-base">📸</span>
                  <span>
                    {viewMode === "editor"
                      ? "Currently in Slot Editor mode. Click on any slot to upload photos."
                      : "Currently in Whole Merged Frame Preview mode showing your combined result."}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setViewMode((m) => (m === "editor" ? "preview" : "editor"))}
                  className="rounded-lg bg-[#1a3c36] px-3 py-1.5 font-bold text-white shadow-xs hover:bg-[#235048]"
                >
                  {viewMode === "editor" ? "Preview Whole Frame →" : "← Back to Slot Editor"}
                </button>
              </div>
            </div>
          </div>

          {/* ================= RIGHT COLUMN: PRODUCT INFO, SIZES, CUSTOMIZER & BUY (5 COLS) ================= */}
          <div className="space-y-6 lg:col-span-5">
            <div className="rounded-3xl border border-[#ebe3d7] bg-white p-6 shadow-sm md:p-8">
              {/* BADGES & HEADER */}
              <div className="flex items-center justify-between gap-2">
                <span className="rounded-full bg-[#f6eee3] px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#b07838]">
                  {product.category || "Photo Frame"}
                </span>

                <div className="flex items-center gap-2">
                  <span className="rounded-full border border-[#e5ded4] bg-[#faf8f5] px-2.5 py-0.5 text-[11px] font-semibold text-[#666]">
                    {product.orientation || "Portrait"}
                  </span>
                  <span className="font-mono text-[11px] text-[#999]">{product.product_id}</span>
                </div>
              </div>

              <h1 className="mt-3 text-2xl font-black tracking-tight text-[#1d2925] sm:text-3xl">
                {product.product_name}
              </h1>

              {/* DYNAMIC PRICING & STOCK */}
              <div className="mt-4 flex items-baseline gap-3 border-b border-[#f0e8dc] pb-5">
                <span className="text-3xl font-black text-[#1a3c36]">
                  ₹{selectedVariant.offer_price || selectedVariant.mrp || "--"}
                </span>

                {selectedVariant.mrp && selectedVariant.offer_price && selectedVariant.mrp > selectedVariant.offer_price && (
                  <>
                    <span className="text-base text-[#999] line-through">
                      ₹{selectedVariant.mrp}
                    </span>
                    <span className="rounded-md bg-[#fff2e0] px-2 py-0.5 text-xs font-black text-[#c07316]">
                      {discountPercent}% OFF
                    </span>
                  </>
                )}

                <span
                  className={`ml-auto rounded-full px-2.5 py-1 text-xs font-bold ${
                    inStock
                      ? "bg-[#edf7f1] text-[#2d7b5a]"
                      : "bg-[#fff0f0] text-[#d04d4d]"
                  }`}
                >
                  {inStock
                    ? selectedVariant.stock
                      ? `${selectedVariant.stock} in stock`
                      : "In Stock"
                    : "Out of Stock"}
                </span>
              </div>

              {/* ================= SIZE VARIANT PICKER ================= */}
              <div className="mt-5">
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#444]">
                    Select Frame Size
                  </label>
                  <span className="text-xs font-semibold text-[#b07838]">
                    {sizeVariants.length} Sizes Available
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                  {sizeVariants.map((variant, index) => {
                    const isSelected = selectedVariantIndex === index;
                    return (
                      <button
                        key={index}
                        type="button"
                        onClick={() => setSelectedVariantIndex(index)}
                        className={`group relative flex flex-col items-start rounded-2xl border p-3 text-left transition ${
                          isSelected
                            ? "border-[#1a3c36] bg-[#f0f6f4] ring-2 ring-[#1a3c36]/20"
                            : "border-[#e5dfd5] bg-[#faf8f5] hover:border-[#d4a553] hover:bg-white"
                        }`}
                      >
                        <span className="text-xs font-bold text-[#1d2925]">
                          {variant.size}
                        </span>
                        <span className="mt-1 text-xs font-bold text-[#1a3c36]">
                          ₹{variant.offer_price || variant.mrp}
                        </span>
                        {variant.mrp && variant.offer_price && (
                          <span className="text-[10px] text-[#999] line-through">
                            ₹{variant.mrp}
                          </span>
                        )}

                        {isSelected && (
                          <div className="absolute right-2 top-2 flex h-4 w-4 items-center justify-center rounded-full bg-[#1a3c36] text-white">
                            <Check className="h-2.5 w-2.5" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ================= PHOTO CUSTOMIZATION SECTION ================= */}
              <div className={`mt-6 rounded-2xl border p-4 transition ${
                highlightMissingSlots && customPhotoCount < totalSlotsCount
                  ? "border-red-300 bg-red-50/40 ring-2 ring-red-400/30"
                  : "border-[#ebdcc8] bg-[#fdfbf8]"
              }`}>
                <div className="flex items-center justify-between border-b border-[#eee3d3] pb-3">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#9b6b2d]">
                      Customize Your Photos
                    </h3>
                    <p className="text-[11px] text-[#666]">
                      {customPhotoCount === totalSlotsCount
                        ? "All customer photos uploaded! Ready to add to cart."
                        : `Upload photos for all ${totalSlotsCount} positions in this frame`}
                    </p>
                  </div>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                    customPhotoCount === totalSlotsCount
                      ? "bg-[#edf7f1] text-[#1b794b]"
                      : "bg-[#fff4e3] text-[#b07838]"
                  }`}>
                    {customPhotoCount} / {totalSlotsCount} Uploaded
                  </span>
                </div>

                {/* PROGRESS BAR */}
                {totalSlotsCount > 0 && (
                  <div className="mt-3">
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#eee5d8]">
                      <div
                        className={`h-full transition-all duration-300 ${
                          customPhotoCount === totalSlotsCount ? "bg-[#1b794b]" : "bg-[#b07838]"
                        }`}
                        style={{ width: `${(customPhotoCount / totalSlotsCount) * 100}%` }}
                      />
                    </div>
                    {highlightMissingSlots && customPhotoCount < totalSlotsCount && (
                      <p className="mt-2 flex items-center gap-1.5 text-[11px] font-semibold text-red-600">
                        <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                        Please upload your photo for all {totalSlotsCount} positions before adding to cart or buy now.
                      </p>
                    )}
                  </div>
                )}

                {photoSlots.length === 0 ? (
                  <p className="py-4 text-center text-xs text-[#888]">
                    This product frame has no dedicated photo slots.
                  </p>
                ) : (
                  <div className="mt-3 space-y-2.5">
                    {photoSlots.map((slot, index) => {
                      const userPhoto = customerPhotos[slot.id];
                      const isUploading = uploadingSlot === slot.id;
                      const isMissing = !userPhoto;

                      return (
                        <div
                          key={slot.id || index}
                          className={`flex items-center gap-3 rounded-xl border p-2.5 shadow-xs transition ${
                            userPhoto
                              ? "border-[#cce8db] bg-[#f9fdfa]"
                              : highlightMissingSlots
                              ? "border-red-300 bg-white ring-2 ring-red-200"
                              : "border-[#ede3d5] bg-white"
                          }`}
                        >
                          <div className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#eee7de]">
                            {userPhoto ? (
                              <img
                                src={userPhoto}
                                alt={slot.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <ImagePlus className={`h-5 w-5 ${highlightMissingSlots ? "text-red-400" : "text-[#b9aa98]"}`} />
                            )}
                            {userPhoto && (
                              <div className="absolute right-1 top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#1b794b] text-white shadow">
                                <Check className="h-2 w-2" />
                              </div>
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-xs font-bold text-[#333]">
                              {slot.name || `Photo Position ${index + 1}`}
                            </p>
                            <div className="mt-0.5 flex items-center gap-1.5">
                              {userPhoto ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#1b794b]">
                                  <CheckCircle2 className="h-3 w-3" /> Photo Attached
                                </span>
                              ) : (
                                <span className={`inline-flex items-center gap-1 text-[10px] font-semibold ${
                                  highlightMissingSlots ? "text-red-600" : "text-amber-700"
                                }`}>
                                  <AlertCircle className="h-3 w-3" /> Photo Required
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {userPhoto && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => setAdjustingSlot(slot)}
                                  title="Drag and adjust photo position & zoom"
                                  className="inline-flex items-center gap-1 rounded-lg border border-[#d8d0c5] bg-[#faf8f5] px-2.5 py-1.5 text-xs font-semibold text-[#333] transition hover:bg-white hover:text-[#1a3c36]"
                                >
                                  <Move className="h-3.5 w-3.5 text-[#b07838]" /> Adjust
                                </button>
                                <button
                                  type="button"
                                  onClick={() => removeCustomerPhoto(slot.id)}
                                  title="Remove photo"
                                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#f0d8d8] bg-[#fff5f5] text-[#d04d4d] hover:bg-[#ffe5e5]"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </>
                            )}

                            <button
                              type="button"
                              onClick={() => fileInputRefs.current[slot.id]?.click()}
                              disabled={isUploading}
                              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition disabled:opacity-50 ${
                                userPhoto
                                  ? "border border-[#d8d0c5] bg-[#faf8f5] text-[#333] hover:bg-white"
                                  : "border border-[#b07838] bg-[#fff8ef] text-[#9b6b2d] hover:bg-[#ffeed7] shadow-xs"
                              }`}
                            >
                              <UploadCloud className="h-3.5 w-3.5" />
                              {isUploading ? "Uploading..." : userPhoto ? "Change" : "Upload Photo"}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* QUANTITY & ACTIONS */}
              <div className="mt-6 space-y-3 border-t border-[#f0e8dc] pt-5">
                <div className="flex items-center gap-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#444]">
                    Quantity
                  </span>

                  <div className="inline-flex items-center rounded-xl border border-[#d8cfc3] bg-[#faf8f5]">
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="flex h-9 w-9 items-center justify-center text-sm font-bold text-[#555] hover:bg-white"
                    >
                      -
                    </button>
                    <span className="w-10 text-center text-xs font-bold text-[#1d2925]">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setQuantity((q) =>
                          selectedVariant.stock ? Math.min(selectedVariant.stock, q + 1) : q + 1
                        )
                      }
                      className="flex h-9 w-9 items-center justify-center text-sm font-bold text-[#555] hover:bg-white"
                    >
                      +
                    </button>
                  </div>
                </div>

                {photoSlots.length > 0 && customPhotoCount < totalSlotsCount && (
                  <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-[#fffbf2] p-2.5 text-xs text-amber-800">
                    <AlertCircle className="h-4 w-4 shrink-0 text-amber-600" />
                    <span>
                      Please upload photos for all <strong>{totalSlotsCount} positions</strong> ({customPhotoCount}/{totalSlotsCount} uploaded) before adding to cart or buy now.
                    </span>
                  </div>
                )}

                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 pt-2">
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    disabled={!inStock || addingToCart || savingCustomization}
                    className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl border-2 border-[#1a3c36] bg-white text-xs font-bold text-[#1a3c36] shadow-sm transition hover:bg-[#1a3c36] hover:text-white disabled:opacity-50"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    {addingToCart || savingCustomization ? "Saving..." : "Add to Cart"}
                  </button>

                  <button
                    type="button"
                    onClick={handleBuyNow}
                    disabled={!inStock || savingCustomization}
                    className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#1a3c36] text-xs font-bold text-white shadow-md transition hover:bg-[#235048] disabled:opacity-50"
                  >
                    <ShoppingBag className="h-4 w-4" />
                    {savingCustomization ? "Preparing..." : "Buy Now"}
                  </button>
                </div>
              </div>

              {/* PERKS */}
              <div className="mt-6 grid grid-cols-3 gap-2 border-t border-[#f0e8dc] pt-5 text-center text-[11px] text-[#666]">
                <div className="flex flex-col items-center">
                  <Truck className="h-5 w-5 text-[#b07838]" />
                  <span className="mt-1 font-semibold text-[#333]">Fast Shipping</span>
                  <span className="text-[10px] text-[#888]">Across India</span>
                </div>
                <div className="flex flex-col items-center">
                  <ShieldCheck className="h-5 w-5 text-[#b07838]" />
                  <span className="mt-1 font-semibold text-[#333]">Safe Packaging</span>
                  <span className="text-[10px] text-[#888]">Bubble &amp; Thermocol</span>
                </div>
                <div className="flex flex-col items-center">
                  <Sparkles className="h-5 w-5 text-[#b07838]" />
                  <span className="mt-1 font-semibold text-[#333]">Studio Quality</span>
                  <span className="text-[10px] text-[#888]">Lab Tested Prints</span>
                </div>
              </div>
            </div>

            {/* DESCRIPTION ACCORDION / CARD */}
            {product.description && (
              <div className="rounded-3xl border border-[#ebe3d7] bg-white p-6 shadow-sm">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#b07838]">
                  Product Description
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-[#555] whitespace-pre-line">
                  {product.description}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ================= CUSTOMIZATION CONFIRMATION MODAL ================= */}
      {isConfirmModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs overflow-y-auto"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative my-8 w-full max-w-2xl rounded-3xl border border-[#ebdcc8] bg-white p-6 shadow-2xl md:p-8">
            {/* MODAL HEADER */}
            <div className="flex items-start justify-between border-b border-[#f0e8dc] pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#eef6f3] text-[#1a3c36]">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-[#1d2925]">
                    Confirm Your Custom Frame
                  </h2>
                  <p className="text-xs text-[#777]">
                    Please review your uploaded photos, size, and pricing before {confirmActionType === "cart" ? "adding to cart" : "proceeding to checkout"}.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsConfirmModalOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-[#999] hover:bg-[#f4efe8] hover:text-[#333]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* MODAL CONTENT */}
            <div className="mt-5 space-y-5">
              {/* COMPOSITE MERGED PREVIEW */}
              <div className="rounded-2xl border border-[#e8dfd2] bg-[#f7f2ea] p-4 text-center">
                <div className="relative mx-auto max-w-[320px] overflow-hidden rounded-xl shadow-lg">
                  {mergedPreviewUrl || frameData.frame_image ? (
                    <img
                      src={mergedPreviewUrl || frameData.frame_image}
                      alt="Customized Frame Preview"
                      className="block h-auto w-full object-contain"
                    />
                  ) : (
                    <div className="flex h-48 w-full items-center justify-center bg-[#eee7de]">
                      <Package className="h-10 w-10 text-[#bbb]" />
                    </div>
                  )}
                  <div className="absolute bottom-2 left-2 rounded-full bg-black/70 px-2.5 py-0.5 text-[10px] font-bold text-white backdrop-blur-xs flex items-center gap-1">
                    <Check className="h-3 w-3 text-[#22c55e]" /> Merged Frame Ready
                  </div>
                </div>
                <p className="mt-2 text-[11px] font-medium text-[#777]">
                  Preview of your personalized frame with customer-uploaded photos
                </p>
              </div>

              {/* UPLOADED PHOTOS INDIVIDUAL BREAKDOWN */}
              {photoSlots.length > 0 && (
                <div>
                  <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-[#9b6b2d]">
                    Your Uploaded Photos ({customPhotoCount} of {totalSlotsCount})
                  </h4>
                  <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                    {photoSlots.map((slot, i) => {
                      const photo = customerPhotos[slot.id];
                      return (
                        <div
                          key={slot.id || i}
                          className="flex items-center gap-2.5 rounded-xl border border-[#e2dacd] bg-[#faf8f5] p-2"
                        >
                          <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-[#eee7de]">
                            {photo ? (
                              <img
                                src={photo}
                                alt={slot.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-[#bbb]">
                                <ImageIcon className="h-5 w-5" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-[11px] font-bold text-[#1d2925]">
                              {slot.name || `Position ${i + 1}`}
                            </p>
                            <p className="text-[10px] font-semibold text-[#1b794b] flex items-center gap-1">
                              <Check className="h-2.5 w-2.5" /> Attached
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* SPECIFICATIONS & PRICE BREAKDOWN */}
              <div className="rounded-2xl border border-[#ebdcc8] bg-[#fdfbf8] p-4">
                <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-[#9b6b2d]">
                  Order Specifications
                </h4>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between border-b border-[#f0e8dc] pb-2">
                    <span className="text-[#666]">Product</span>
                    <span className="font-bold text-[#1d2925]">{product.product_name}</span>
                  </div>

                  <div className="flex items-center justify-between border-b border-[#f0e8dc] pb-2">
                    <span className="text-[#666]">Frame Size</span>
                    <span className="rounded-md bg-[#eef6f3] px-2 py-0.5 font-bold text-[#1a3c36]">
                      {selectedVariant.size || "Standard"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between border-b border-[#f0e8dc] pb-2">
                    <span className="text-[#666]">Unit Price</span>
                    <span className="font-bold text-[#1d2925]">
                      ₹{selectedVariant.offer_price || selectedVariant.mrp}
                    </span>
                  </div>

                  <div className="flex items-center justify-between border-b border-[#f0e8dc] pb-2">
                    <span className="text-[#666]">Quantity</span>
                    <span className="font-bold text-[#1d2925]">{quantity}</span>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <div>
                      <span className="text-sm font-bold text-[#1d2925]">Total Amount</span>
                      <p className="text-[10px] text-[#888]">Inclusive of all taxes</p>
                    </div>
                    <span className="text-2xl font-black text-[#1a3c36]">
                      ₹{(Number(selectedVariant.offer_price || selectedVariant.mrp || 0) * Number(quantity))}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* MODAL ACTIONS */}
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end border-t border-[#f0e8dc] pt-4">
              <button
                type="button"
                onClick={() => setIsConfirmModalOpen(false)}
                disabled={addingToCart || savingCustomization}
                className="rounded-xl border border-[#d8cfc3] bg-white px-5 py-2.5 text-xs font-bold text-[#555] transition hover:bg-[#faf8f5] disabled:opacity-50"
              >
                ← Edit Customization
              </button>

              <button
                type="button"
                onClick={handleConfirmedAction}
                disabled={addingToCart || savingCustomization}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1a3c36] px-6 py-2.5 text-xs font-bold text-white shadow-md transition hover:bg-[#235048] disabled:opacity-50"
              >
                {confirmActionType === "cart" ? (
                  <>
                    <ShoppingCart className="h-4 w-4" />
                    {addingToCart || savingCustomization ? "Adding to Cart..." : "Confirm & Add to Cart"}
                  </>
                ) : (
                  <>
                    <ShoppingBag className="h-4 w-4" />
                    {savingCustomization ? "Preparing Checkout..." : "Confirm & Proceed to Checkout"}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PHOTO ADJUST MODAL */}
      <PhotoAdjustModal
        isOpen={Boolean(adjustingSlot)}
        onClose={() => setAdjustingSlot(null)}
        photoSrc={
          adjustingSlot
            ? customerPhotos[adjustingSlot.id] || product?.slot_photos?.[adjustingSlot.id]
            : null
        }
        slot={adjustingSlot}
        initialAdjustment={
          adjustingSlot
            ? photoAdjustments[adjustingSlot.id] || { panX: 0, panY: 0, scale: 1.0 }
            : { panX: 0, panY: 0, scale: 1.0 }
        }
        onSave={(adj) => {
          if (adjustingSlot) {
            setPhotoAdjustments((prev) => ({
              ...prev,
              [adjustingSlot.id]: adj,
            }));
            toast.success(`Position adjusted for ${adjustingSlot.name || "slot"}!`);
          }
        }}
      />

      {/* CHECKOUT MODAL */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        items={checkoutItems}
        user={user}
        clearCartAfterOrder={false}
      />
    </main>
  );
};

export default ProductDetails;
