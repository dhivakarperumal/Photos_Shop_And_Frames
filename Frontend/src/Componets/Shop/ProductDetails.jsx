import React, { useContext, useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  Heart,
  ImagePlus,
  Package,
  RotateCw,
  Share2,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  Trash2,
  Truck,
  UploadCloud,
} from "lucide-react";
import api from "../../api";
import { StoreContext } from "../../PrivateRouter/StoreContext";
import { useAuth } from "../../PrivateRouter/AuthContext";
import toast from "react-hot-toast";
import CheckoutModal from "../Checkout/CheckoutModal";

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart, toggleWishlist, wishlist } = useContext(StoreContext);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [customerPhotos, setCustomerPhotos] = useState({});
  const [uploadingSlot, setUploadingSlot] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("customize"); // 'customize' | 'details'
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [savingCustomization, setSavingCustomization] = useState(false);
  const [customizationId, setCustomizationId] = useState(null);

  const fileInputRefs = useRef({});

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/products/${id}`);
        if (res.data?.data) {
          const prod = res.data.data;
          setProduct(prod);
          // Set first available variant as default
          if (prod.size_variants && prod.size_variants.length > 0) {
            setSelectedVariantIndex(0);
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
  const isWishlisted = wishlist?.some(
    (w) => w.product_id === product?.id || w.id === product?.id
  );

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
  };

  // Save customization into separate customized_photos table
  const ensureCustomizationSaved = async () => {
    const hasPhotos = Object.keys(customerPhotos).length > 0;
    if (!hasPhotos) return null;

    setSavingCustomization(true);
    try {
      const activeUserId =
        user?.user_id ||
        user?.id ||
        localStorage.getItem("frame_shop_guest_id") ||
        null;

      const res = await api.post("/customizations", {
        customization_id: customizationId || undefined,
        user_id: activeUserId,
        product_id: product.id,
        slot_photos: customerPhotos,
        preview_image: frameData.frame_image || null,
      });

      if (res.data?.success && res.data.data?.customization_id) {
        setCustomizationId(res.data.data.customization_id);
        return res.data.data.customization_id;
      }
      return null;
    } catch (err) {
      console.error("Save customization error:", err);
      return null;
    } finally {
      setSavingCustomization(false);
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;
    if (!inStock) {
      toast.error("Selected size variant is out of stock.");
      return;
    }

    setAddingToCart(true);
    try {
      const custId = await ensureCustomizationSaved();

      await addToCart(product, {
        size: selectedVariant.size || "Standard",
        price: Number(selectedVariant.offer_price || selectedVariant.mrp || 0),
        quantity: Number(quantity),
        customization_id: custId,
        slot_photos: customerPhotos,
      });
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    if (!product) return;
    if (!inStock) {
      toast.error("Selected size variant is out of stock.");
      return;
    }

    const custId = await ensureCustomizationSaved();
    setIsCheckoutOpen(true);
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
      product_image: product.product_images?.[0] || frameData.frame_image,
      frame_image: frameData.frame_image,
    },
  ];

  return (
    <main className="min-h-screen bg-[#f8f5f0] px-4 py-8 md:px-8">
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
          {/* ================= LEFT COLUMN: LIVE FRAME CANVAS PREVIEW (7 COLS) ================= */}
          <div className="lg:col-span-7">
            <div className="sticky top-28 rounded-3xl border border-[#ebe3d7] bg-white p-5 shadow-sm md:p-8">
              {/* CANVAS HEADER */}
              <div className="mb-4 flex items-center justify-between border-b border-[#f0e8dc] pb-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#eef6f3] text-[#1a3c36]">
                    <Sparkles className="h-4 w-4" />
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-[#1d2925]">Interactive Frame Canvas</h3>
                    <p className="text-[11px] text-[#777]">
                      {totalSlotsCount > 0
                        ? `Customized ${customPhotoCount} of ${totalSlotsCount} photo slots`
                        : "Ready for your photos"}
                    </p>
                  </div>
                </div>

                {customPhotoCount > 0 && (
                  <span className="rounded-full bg-[#e8f6ed] px-3 py-1 text-xs font-bold text-[#1b794b]">
                    ✓ {customPhotoCount} Photo{customPhotoCount !== 1 ? "s" : ""} Added
                  </span>
                )}
              </div>

              {/* FRAME STAGE */}
              <div className="relative flex min-h-[420px] items-center justify-center overflow-hidden rounded-2xl border border-[#e8dfd2] bg-[#f5efe7] p-4 sm:p-8">
                {frameData.frame_image ? (
                  <div className="relative mx-auto w-full max-w-[480px] overflow-hidden rounded-xl shadow-xl">
                    {/* FRAME BACKGROUND */}
                    <img
                      src={frameData.frame_image}
                      alt={frameData.frame_name || product.product_name}
                      className="block h-auto w-full select-none"
                    />

                    {/* PHOTO SLOTS OVERLAY */}
                    {photoSlots.map((slot, idx) => {
                      // Check if user uploaded a custom photo for this slot
                      const userPhoto = customerPhotos[slot.id];
                      // Otherwise, show admin demo photo as sample placeholder
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

                          <button
                            type="button"
                            onClick={() => fileInputRefs.current[slot.id]?.click()}
                            title={`Click to upload your photo for ${slot.name || `Position ${idx + 1}`}`}
                            className={`group absolute overflow-hidden border-2 transition ${
                              userPhoto
                                ? "border-[#1b794b] ring-2 ring-[#1b794b]/30"
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
                              <div className="relative h-full w-full">
                                <img
                                  src={activePhoto}
                                  alt={slot.name}
                                  className="h-full w-full"
                                  style={{ objectFit: slot.objectFit || "cover" }}
                                />
                                {userPhoto && (
                                  <div className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#1b794b] text-white shadow">
                                    <Check className="h-2.5 w-2.5" />
                                  </div>
                                )}
                                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition group-hover:opacity-100">
                                  <span className="rounded-md bg-white/95 px-2 py-1 text-[10px] font-bold text-[#1d2925] shadow">
                                    Change Photo
                                  </span>
                                </div>
                              </div>
                            ) : (
                              <div className="flex h-full w-full flex-col items-center justify-center p-1 text-center">
                                <UploadCloud className="h-5 w-5 text-[#b07838]" />
                                <span className="mt-0.5 rounded bg-white/90 px-1.5 py-0.5 text-[9px] font-bold text-[#1a3c36] shadow-xs">
                                  {slot.name || `Slot ${idx + 1}`}
                                </span>
                              </div>
                            )}
                          </button>
                        </React.Fragment>
                      );
                    })}
                  </div>
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

              {/* NOTICE */}
              <div className="mt-4 rounded-xl border border-[#f0e7dc] bg-[#faf8f5] p-3 text-center text-xs text-[#666]">
                <p>
                  💡 <span className="font-semibold text-[#1d2925]">Tip:</span> Click directly on the photo slots in the frame above or use the upload list on the right to place your photos.
                </p>
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
              <div className="mt-6 rounded-2xl border border-[#ebdcc8] bg-[#fdfbf8] p-4">
                <div className="flex items-center justify-between border-b border-[#eee3d3] pb-3">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#9b6b2d]">
                      Customize Your Photos
                    </h3>
                    <p className="text-[11px] text-[#666]">
                      Upload photos for each position in this frame
                    </p>
                  </div>
                  <span className="rounded-full bg-[#fff4e3] px-2.5 py-0.5 text-xs font-bold text-[#b07838]">
                    {customPhotoCount} / {totalSlotsCount}
                  </span>
                </div>

                {photoSlots.length === 0 ? (
                  <p className="py-4 text-center text-xs text-[#888]">
                    This product frame has no dedicated photo slots.
                  </p>
                ) : (
                  <div className="mt-3 space-y-2.5">
                    {photoSlots.map((slot, index) => {
                      const userPhoto = customerPhotos[slot.id];
                      const isUploading = uploadingSlot === slot.id;

                      return (
                        <div
                          key={slot.id || index}
                          className="flex items-center gap-3 rounded-xl border border-[#ede3d5] bg-white p-2.5 shadow-xs"
                        >
                          <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#eee7de]">
                            {userPhoto ? (
                              <img
                                src={userPhoto}
                                alt={slot.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <ImagePlus className="h-5 w-5 text-[#b9aa98]" />
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-xs font-bold text-[#333]">
                              {slot.name || `Photo Position ${index + 1}`}
                            </p>
                            <p className="text-[10px] text-[#888]">
                              {userPhoto ? "Your photo is attached" : "No photo selected"}
                            </p>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {userPhoto && (
                              <button
                                type="button"
                                onClick={() => removeCustomerPhoto(slot.id)}
                                title="Remove photo"
                                className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#f0d8d8] bg-[#fff5f5] text-[#d04d4d] hover:bg-[#ffe5e5]"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => fileInputRefs.current[slot.id]?.click()}
                              disabled={isUploading}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-[#d8d0c5] bg-[#faf8f5] px-3 py-1.5 text-xs font-bold text-[#333] transition hover:bg-white disabled:opacity-50"
                            >
                              <UploadCloud className="h-3.5 w-3.5" />
                              {isUploading ? "Uploading" : userPhoto ? "Change" : "Upload"}
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

                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 pt-2">
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    disabled={!inStock || addingToCart}
                    className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl border-2 border-[#1a3c36] bg-white text-xs font-bold text-[#1a3c36] shadow-sm transition hover:bg-[#1a3c36] hover:text-white disabled:opacity-50"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    {addingToCart ? "Adding..." : "Add to Cart"}
                  </button>

                  <button
                    type="button"
                    onClick={handleBuyNow}
                    disabled={!inStock}
                    className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#1a3c36] text-xs font-bold text-white shadow-md transition hover:bg-[#235048] disabled:opacity-50"
                  >
                    <ShoppingBag className="h-4 w-4" />
                    Buy Now
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
