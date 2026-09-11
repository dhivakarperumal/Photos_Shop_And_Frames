import { useContext, useEffect, useMemo, useState } from "react";
import {
  Check,
  CheckCircle2,
  Gift,
  Heart,
  ImagePlus,
  Image as ImageIcon,
  Minus,
  Plus,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api, { API_URL } from "../api";
import { StoreContext } from "../PrivateRouter/StoreContext";
import { notifyLoginRequired } from "../PrivateRouter/StoreContext";
import { useAuth } from "../PrivateRouter/AuthContext";

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

const getImages = (item, type) => {
  if (!item) return [];
  if (type === "album") {
    const rawVariants = parseJsonArray(item.variants);
    const variantImages = [];
    rawVariants.forEach((v) => {
      if (v?.image) variantImages.push(v.image);
      if (Array.isArray(v?.images)) variantImages.push(...v.images);
    });

    const productImages = parseJsonArray(item.product_images);
    const images = [
      item.displayImage,
      item.thumbnail_image,
      ...productImages,
      ...variantImages,
    ];
    return [...new Set(images.filter(Boolean))];
  }

  const images = [item.image, ...(Array.isArray(item.images) ? item.images : [])];
  return [...new Set(images.filter(Boolean))];
};

const resolveImageUrl = (value) => {
  if (!value || typeof value !== "string") return "";
  if (/^(data:|blob:|https?:\/\/)/i.test(value)) return value;
  const path = `/${value.replace(/^\/+/, "")}`;
  if (/^\/api\/?$/i.test(API_URL)) return path;
  return `${API_URL.replace(/\/api\/?$/, "")}${path}`;
};

const ProductQuickView = ({ item, type, image, onClose }) => {
  const isAlbum = type === "album";
  const { addToCart, wishlist = [], toggleWishlist } = useContext(StoreContext) || {};
  const { user } = useAuth();
  const navigate = useNavigate();
  const [imageIndex, setImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [uploading, setUploading] = useState(false);
  const [customFields, setCustomFields] = useState({
    title: "",
    note: "",
    photo: null,
  });

  // Full album details state when opened in quick view
  const [albumData, setAlbumData] = useState(null);

  // Album sheet photos upload state
  const [albumPhotos, setAlbumPhotos] = useState([]);
  const [uploadingAlbumPhotos, setUploadingAlbumPhotos] = useState(false);

  const id = item?.id || item?.product_id || item?.gift_box_id;

  // Fetch full album details if type is album
  useEffect(() => {
    if (!isAlbum || !id) return;
    let isMounted = true;
    api
      .get(`/albums/${id}`)
      .then((res) => {
        if (isMounted && res.data?.data) {
          setAlbumData(res.data.data);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch full album details in quick view:", err);
      });

    return () => {
      isMounted = false;
    };
  }, [isAlbum, id]);

  const activeAlbum = isAlbum ? (albumData || item) : item;

  useEffect(() => {
    const handleKeyDown = (event) => event.key === "Escape" && onClose();
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const images = useMemo(() => getImages(activeAlbum, type).map(resolveImageUrl), [activeAlbum, type]);
  const currentImage = images[imageIndex] || resolveImageUrl(image) || images[0];
  const title = isAlbum ? activeAlbum.product_name : activeAlbum.name;
  const category = isAlbum ? activeAlbum.sub_category || activeAlbum.occasion || "Photo Album" : activeAlbum.category || "Gift Box";
  const fullDetailsPath = isAlbum ? `/albums/${activeAlbum.product_id || id}` : `/gifts/${activeAlbum.gift_box_id || id}`;

  // Sheet count & max photos calculation matching AlbumDetailsPage
  const sheetCount = Number(
    activeAlbum?.sheet_count ||
    activeAlbum?.sheets ||
    Math.round((activeAlbum?.total_pages || 40) / 2) ||
    20
  );
  const maxPhotos = Math.max(sheetCount * 2, 0);

  const albumVariants = isAlbum ? parseJsonArray(activeAlbum.variants) : [];
  const albumSizes = useMemo(() => {
    if (!isAlbum) return [];
    const fromOpts = parseJsonArray(activeAlbum.size_options);
    const fromVars = albumVariants.map((v) => v.size).filter(Boolean);
    const base = activeAlbum.size ? [activeAlbum.size] : [];
    const set = Array.from(new Set([...fromOpts, ...fromVars, ...base].filter(Boolean)));
    return set.length ? set : ["8 x 12 Inches", "10 x 14 Inches", "12 x 18 Inches"];
  }, [isAlbum, activeAlbum, albumVariants]);

  const albumColors = useMemo(() => {
    if (!isAlbum) return [];
    const rawColors = parseJsonArray(activeAlbum.color_options);
    const fromVariants = albumVariants.map((v) => v.color).filter(Boolean);
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
  }, [isAlbum, activeAlbum, albumVariants]);

  const [selectedSize, setSelectedSize] = useState(albumSizes[0] || activeAlbum.size || "12 x 18 Inches");
  const [selectedColor, setSelectedColor] = useState(albumColors[0]?.name || activeAlbum.cover_color || "");

  useEffect(() => {
    if (albumSizes.length > 0 && !selectedSize) {
      setSelectedSize(albumSizes[0]);
    }
  }, [albumSizes, selectedSize]);

  useEffect(() => {
    if (albumColors.length > 0 && !selectedColor) {
      setSelectedColor(albumColors[0]?.name || activeAlbum.cover_color || "");
    }
  }, [albumColors, selectedColor, activeAlbum.cover_color]);

  const activeVariant = useMemo(() => {
    if (!albumVariants.length) return null;
    return (
      albumVariants.find(
        (v) =>
          String(v.size || "").toLowerCase() === String(selectedSize || "").toLowerCase() &&
          (!selectedColor || String(v.color || "").toLowerCase() === String(selectedColor || "").toLowerCase())
      ) ||
      albumVariants.find(
        (v) => String(v.size || "").toLowerCase() === String(selectedSize || "").toLowerCase()
      ) ||
      albumVariants[0]
    );
  }, [albumVariants, selectedSize, selectedColor]);

  const variantMrp = Number(activeVariant?.mrp || activeVariant?.price || activeVariant?.selling_price || 0);
  const variantOffer = Number(activeVariant?.offerPrice || activeVariant?.offer_price || activeVariant?.price || variantMrp || 0);
  const stock = isAlbum
    ? Number(activeVariant?.stock ?? activeVariant?.stock_quantity ?? activeAlbum.stock_quantity ?? 0)
    : Number(item.current_stock ?? item.stock_quantity ?? item.stock ?? 0);
  const isOutOfStock = stock <= 0;

  const originalPrice = Number(
    isAlbum
      ? variantMrp || activeAlbum.displayOriginalPrice || activeAlbum.selling_price || 0
      : item.mrp || 0
  );
  const price = Number(
    isAlbum
      ? variantOffer || activeAlbum.displayPrice || activeAlbum.discount_price || activeAlbum.selling_price || 0
      : item.selling_price || item.mrp || 0
  );
  const isFavorite = wishlist.some((entry) => String(entry.product_id || entry.id || entry._id) === String(id));
  const hasCustomization = isAlbum || item.customization?.customerName || item.customization?.customMessage || item.customization?.photoUpload;

  const updateField = (field, value) => setCustomFields((current) => ({ ...current, [field]: value }));

  // Cover photo upload
  const handleCoverPhotoUpload = async (file) => {
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    setUploading(true);
    const toastId = toast.loading("Uploading cover photo...");
    try {
      const response = await api.post("/upload", formData);
      const url =
        response.data?.url ||
        response.data?.fileUrl ||
        (Array.isArray(response.data?.urls) ? response.data.urls[0] : "");
      if (!url) throw new Error("Missing uploaded URL");
      updateField("photo", url);
      toast.success("Cover photo uploaded successfully!", { id: toastId });
    } catch (err) {
      console.error("Cover photo upload error:", err);
      toast.error("Could not upload cover photo", { id: toastId });
    } finally {
      setUploading(false);
    }
  };

  // Sheet photos batch upload (up to maxPhotos = sheetCount * 2)
  const handleAlbumPhotosUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const currentCount = albumPhotos.length;
    if (currentCount >= maxPhotos) {
      toast.error(
        `This album has reached the maximum capacity of ${maxPhotos} photos (${sheetCount} sheets × 2 photos per sheet). You cannot add more than ${maxPhotos} photos.`
      );
      e.target.value = "";
      return;
    }

    const remainingSlots = maxPhotos - currentCount;
    let filesToUpload = files;

    if (files.length > remainingSlots) {
      toast(
        `You can only add up to ${maxPhotos} photos for this album. Uploading the first ${remainingSlots} photo${
          remainingSlots > 1 ? "s" : ""
        }. More than ${maxPhotos} photos are not permitted.`,
        {
          icon: "⚠️",
          duration: 5000,
        }
      );
      filesToUpload = files.slice(0, remainingSlots);
    }

    setUploadingAlbumPhotos(true);
    const toastId = toast.loading(
      `Uploading ${filesToUpload.length} album photo${
        filesToUpload.length > 1 ? "s" : ""
      }...`
    );

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
        toast.success(
          `Added ${urls.length} photo${urls.length > 1 ? "s" : ""}! (${
            currentCount + urls.length
          }/${maxPhotos})`,
          { id: toastId }
        );
      } else {
        throw new Error("No photo URLs returned from server");
      }
    } catch (err) {
      console.error("Album photos upload error:", err);
      toast.error("Failed to upload album photos. Please try again.", {
        id: toastId,
      });
    } finally {
      setUploadingAlbumPhotos(false);
      e.target.value = "";
    }
  };

  // Replace single photo
  const handleReplacePhoto = async (index, file) => {
    if (!file) return;
    const formData = new FormData();
    formData.append("folder", "album_customer_photos");
    formData.append("file", file);

    const toastId = toast.loading(`Replacing photo #${index + 1}...`);
    try {
      const res = await api.post("/upload", formData);
      const newUrl =
        res.data?.url ||
        res.data?.fileUrl ||
        (Array.isArray(res.data?.urls) ? res.data.urls[0] : "");
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

  // Remove single photo
  const handleRemovePhoto = (index) => {
    setAlbumPhotos((prev) => prev.filter((_, idx) => idx !== index));
    toast.success(`Photo #${index + 1} removed`);
  };

  // Clear all uploaded photos
  const handleClearAllPhotos = () => {
    if (window.confirm("Are you sure you want to remove all uploaded photos?")) {
      setAlbumPhotos([]);
      toast.success("All uploaded photos removed");
    }
  };

  // Helper to build slot_photos map matching AlbumDetailsPage
  const getPreparedSlotPhotos = () => {
    if (!isAlbum) {
      if (!customFields.title && !customFields.note && !customFields.photo) return null;
      return { name: customFields.title, msg: customFields.note, photo: customFields.photo };
    }

    const slotPhotosData = {};
    albumPhotos.forEach((url, idx) => {
      slotPhotosData[`Photo ${idx + 1}`] = url;
    });
    if (customFields.photo) {
      slotPhotosData.coverPhoto = customFields.photo;
    }
    if (customFields.title) {
      slotPhotosData.coverTitle = customFields.title;
    }
    if (customFields.note) {
      slotPhotosData.dedicationNote = customFields.note;
    }
    return albumPhotos.length > 0 || customFields.photo || customFields.title || customFields.note
      ? slotPhotosData
      : null;
  };

  const productPayload = isAlbum
    ? {
        id: activeAlbum.id || activeAlbum.product_id || id,
        product_id: activeAlbum.product_id || activeAlbum.id || id,
        item_type: "album",
        product_name: title,
        category: activeAlbum.category || "Albums",
        price,
        product_images: images,
        image: currentImage,
      }
    : {
        id,
        gift_box_id: item.gift_box_id || id,
        item_type: "gift",
        product_name: title,
        category,
        price,
        product_images: images,
        image: currentImage,
      };

  const addItemToCart = async () => {
    if (!user?.user_id) {
      notifyLoginRequired("Please login before adding albums to your cart");
      return;
    }
    if (isOutOfStock) {
      toast.error("This item is currently out of stock");
      return;
    }
    if (isAlbum) {
      if (activeAlbum.photo_upload_required && albumPhotos.length === 0) {
        toast.error("Please upload at least 1 photo for this album before adding to cart");
        return;
      }
      if (albumPhotos.length > maxPhotos) {
        toast.error(`You cannot upload more than ${maxPhotos} photos for this album.`);
        return;
      }
    }

    const chosenSize = isAlbum ? (selectedSize || activeAlbum.size || "12 x 18 Inches") : (item.box_size || "Standard Box");
    const success = await addToCart?.(productPayload, {
      item_type: isAlbum ? "album" : "gift",
      size: chosenSize,
      color: isAlbum ? (selectedColor || null) : null,
      price,
      quantity,
      preview_image: currentImage,
      slot_photos: getPreparedSlotPhotos(),
    });
    if (success !== false) onClose();
  };

  const buyNow = () => {
    if (!user?.user_id) {
      notifyLoginRequired("Please login before buying this item");
      return;
    }
    if (isOutOfStock) {
      toast.error("This item is currently out of stock");
      return;
    }
    if (isAlbum) {
      if (activeAlbum.photo_upload_required && albumPhotos.length === 0) {
        toast.error("Please upload at least 1 photo for this album before ordering");
        return;
      }
      if (albumPhotos.length > maxPhotos) {
        toast.error(`You cannot upload more than ${maxPhotos} photos for this album.`);
        return;
      }
    }

    const chosenSize = isAlbum ? (selectedSize || activeAlbum.size || "12 x 18 Inches") : (item.box_size || "Standard Box");
    navigate("/checkout", {
      state: {
        checkoutItems: [
          {
            product_id: id,
            gift_box_id: isAlbum ? null : (item.gift_box_id || id),
            item_type: isAlbum ? "album" : "gift",
            product_name: title,
            category,
            size: chosenSize,
            color: isAlbum ? (selectedColor || null) : null,
            price,
            quantity,
            product_image: currentImage,
            slot_photos: getPreparedSlotPhotos(),
          },
        ],
      },
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/75 p-3 backdrop-blur-sm sm:p-5" role="dialog" aria-modal="true" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div className="relative my-4 grid w-full max-w-4xl gap-5 rounded-3xl border border-[#eadfce] bg-white p-4 shadow-2xl sm:p-6 md:grid-cols-[280px_minmax(0,1fr)] lg:grid-cols-[320px_minmax(0,1fr)]">
        <button type="button" onClick={onClose} className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full text-[#777] transition hover:bg-[#f4efe8]" aria-label="Close product details"><X className="h-5 w-5" /></button>

        <div className="space-y-3 pt-1">
          <div className="flex aspect-square items-center justify-center overflow-hidden rounded-2xl border border-[#e8dfd2] bg-[#fbf9f6] p-4">
            {currentImage ? <img src={currentImage} alt={title} className="h-full w-full object-contain" /> : (isAlbum ? <ImagePlus className="h-14 w-14 text-[#c9bba9]" /> : <Gift className="h-14 w-14 text-[#c9bba9]" />)}
          </div>
          {images.length > 1 && <div className="flex gap-2 overflow-x-auto pb-1">{images.map((itemImage, index) => <button key={`${itemImage}-${index}`} type="button" onClick={() => setImageIndex(index)} className={`h-14 w-14 shrink-0 overflow-hidden rounded-xl border-2 bg-[#f8f4ee] p-1 ${imageIndex === index ? "border-[#1a3c36]" : "border-transparent opacity-70"}`}><img src={itemImage} alt={`${title} ${index + 1}`} className="h-full w-full object-contain" /></button>)}</div>}
          <div className="rounded-2xl border border-[#e8dfd2] bg-[#fdfcfb] p-3.5 text-xs">
            <h4 className="border-b border-[#eee] pb-2 text-[10px] font-bold uppercase tracking-wider text-[#b07838]">
              {isAlbum ? "Album Specifications" : "Box Specifications"}
            </h4>
            {isAlbum ? (
              <>
                <Spec label="Dimensions" value={selectedSize || activeAlbum.size || "12 x 18 Inches"} />
                <Spec
                  label="Total Pages"
                  value={`${activeAlbum.total_pages || (sheetCount * 2) || 40} (${sheetCount} Sheets)`}
                />
                <Spec label="Cover Material" value={selectedColor || activeAlbum.cover_material || "Leatherette"} />
                <Spec label="Binding" value={activeAlbum.binding_type || "Lay Flat Binding"} />
                <Spec label="Paper Quality" value={activeAlbum.page_thickness || activeAlbum.page_material || "300 GSM"} />
              </>
            ) : (
              <>
                <Spec label="Category" value={category} />
                <Spec label="Box Size" value={item.box_size || "Standard"} />
                <Spec label="Material" value={item.material || "Premium Box"} />
                <Spec label="Items" value={`${item.gift_items?.length || 0} Included`} />
              </>
            )}
          </div>
        </div>

        <div className="flex min-h-0 flex-col pt-1 md:max-h-[calc(100vh-5rem)] md:overflow-y-auto md:pr-1">
          <div>
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex rounded-full bg-[#f2ecdf] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#9b6b2d]">
                {category}
              </span>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  navigate(fullDetailsPath);
                }}
                className="text-xs font-bold text-[#b07838] hover:underline"
              >
                View Full Page &rarr;
              </button>
            </div>
            <h2 className="mt-2 pr-8 text-2xl font-black leading-tight text-[#1d2925] sm:text-3xl">
              {title}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-[#777]">
              {activeAlbum.short_description ||
                activeAlbum.description ||
                (isAlbum
                  ? `${activeAlbum.cover_material || "Premium cover"} • ${activeAlbum.page_thickness || "300 GSM"}`
                  : `${item.box_type || "Magnetic Closure"} • ${item.material || "Premium Box"}`)}
            </p>
            <div className="mt-4 flex flex-wrap items-baseline gap-3">
              <span className="text-2xl font-black text-[#1a3c36]">₹{price.toLocaleString()}</span>
              {originalPrice > price && (
                <>
                  <span className="text-sm text-[#999] line-through">₹{originalPrice.toLocaleString()}</span>
                  <span className="rounded-md bg-[#eef6f3] px-2 py-0.5 text-xs font-bold text-[#1b794b]">
                    Save ₹{(originalPrice - price).toLocaleString()}
                  </span>
                </>
              )}
              <span
                className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
                  isOutOfStock ? "bg-red-50 text-red-600" : "bg-[#e8efeb] text-[#1a3c36]"
                }`}
              >
                {isOutOfStock ? "Out of Stock" : `In Stock (${stock} available)`}
              </span>
            </div>

            {/* ALBUM SIZE SELECTOR */}
            {isAlbum && albumSizes.length > 0 && (
              <div className="mt-4 rounded-2xl border border-[#e8ded2] bg-[#fbf9f6] p-3.5">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-[#1d2925]">Select Album Size:</span>
                  <span className="text-[#b07838]">{selectedSize}</span>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {albumSizes.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setSelectedSize(size)}
                      className={`rounded-xl border-2 px-3 py-1.5 text-xs font-bold transition ${
                        selectedSize === size
                          ? "border-[#1a3c36] bg-[#1a3c36] text-white shadow-xs"
                          : "border-[#dfd6ca] bg-white text-[#444] hover:border-[#b07838]"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ALBUM COLOR / COVER SELECTOR (IF AVAILABLE) */}
            {isAlbum && albumColors.length > 0 && (
              <div className="mt-4 rounded-2xl border border-[#e8ded2] bg-[#fbf9f6] p-3.5">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-[#1d2925]">Cover Material / Color:</span>
                  <span className="text-[#b07838]">{selectedColor || "Standard"}</span>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {albumColors.map((color) => {
                    const isSelected =
                      String(selectedColor).trim().toLowerCase() === String(color.name).trim().toLowerCase();
                    return (
                      <button
                        key={color.name}
                        type="button"
                        onClick={() => setSelectedColor(color.name)}
                        className={`inline-flex items-center gap-2 rounded-xl border-2 px-3 py-1.5 text-xs font-bold transition ${
                          isSelected
                            ? "border-[#1a3c36] bg-[#1a3c36] text-white shadow-xs"
                            : "border-[#dfd6ca] bg-white text-[#444] hover:border-[#b07838]"
                        }`}
                      >
                        <span
                          className="h-3 w-3 rounded-full border border-black/20 shadow-2xs"
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
            {isAlbum && (
              <div className="mt-4 rounded-2xl border border-[#ebdcc8] bg-[#fdfbf8] p-4 shadow-2xs">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#f0e8dc] pb-3">
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#9b6b2d]">
                      <ImageIcon className="h-4 w-4" /> Upload Album Photos ({albumPhotos.length} / {maxPhotos})
                    </div>
                    <p className="mt-1 text-[11px] text-[#666]">
                      This album has <strong className="text-[#1d2925]">{sheetCount} sheets</strong> (2 photos per sheet = <strong className="text-[#1a3c36]">max {maxPhotos} photos</strong>).
                      You can add up to {maxPhotos} photos (less than {maxPhotos} is allowed). More than {maxPhotos} photos cannot be added.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
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
                        : "Maximum capacity reached"}
                    </span>
                  </div>
                  <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-[#ece5dc]">
                    <div
                      className={`h-full transition-all duration-300 ${
                        albumPhotos.length >= maxPhotos ? "bg-[#b07838]" : "bg-[#1a3c36]"
                      }`}
                      style={{ width: `${Math.min(100, (albumPhotos.length / Math.max(maxPhotos, 1)) * 100)}%` }}
                    />
                  </div>
                </div>

                {/* MULTI-FILE UPLOAD AREA */}
                {albumPhotos.length < maxPhotos ? (
                  <div className="mt-3">
                    <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#1a3c36]/35 bg-white p-4 text-center transition hover:border-[#1a3c36] hover:bg-[#faf7f2]">
                      <UploadCloud className="h-7 w-7 text-[#1a3c36]" />
                      <p className="mt-1.5 text-xs font-bold text-[#1d2925]">
                        {uploadingAlbumPhotos ? "Uploading Photos to Album..." : "Click or Drag & Drop Photos to Upload"}
                      </p>
                      <p className="mt-0.5 text-[11px] text-[#777]">
                        Upload single or multiple images • Up to <strong>{maxPhotos} photos max</strong> ({maxPhotos - albumPhotos.length} slots left)
                      </p>
                      <span className="mt-2 inline-flex items-center gap-1 rounded-xl bg-[#1a3c36] px-3 py-1.5 text-xs font-bold text-white shadow-2xs">
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
                  <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-2.5 text-center text-xs font-semibold text-amber-800">
                    Maximum limit of {maxPhotos} photos reached for this {sheetCount}-sheet album. Remove any photo to add a different one.
                  </div>
                )}

                {/* UPLOADED PHOTOS GRID */}
                {albumPhotos.length > 0 && (
                  <div className="mt-3 border-t border-[#f0e8dc] pt-2.5">
                    <div className="mb-2 flex items-center justify-between text-xs font-semibold text-[#555]">
                      <span>Uploaded Photos ({albumPhotos.length}):</span>
                      <span className="text-[10px] text-[#888]">Hover on photo to replace or delete</span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 max-h-56 overflow-y-auto p-1 scrollbar-thin">
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
                          <span className="absolute left-1 top-1 rounded-md bg-black/75 px-1 py-0.5 text-[9px] font-black text-white backdrop-blur-xs">
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
            )}

            {/* ALBUM COVER PERSONALIZATION */}
            {isAlbum && (
              <div className="mt-4 space-y-3 rounded-2xl border border-[#ebdcc8] bg-[#fdfbf8] p-4">
                <h4 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#9b6b2d]">
                  <Sparkles className="h-3.5 w-3.5" /> Personalize Your Album Cover (Free)
                </h4>
                <p className="text-[11px] text-[#777]">
                  Custom emboss or imprint your names, wedding/event date, or dedication note directly onto the cover.
                </p>
                <div>
                  <label className="block text-[11px] font-bold text-[#444]">Names / Cover Title:</label>
                  <input
                    type="text"
                    value={customFields.title}
                    onChange={(event) => updateField("title", event.target.value)}
                    placeholder="e.g., Rahul & Priya • Wedding Memories"
                    className="mt-1 w-full rounded-xl border border-[#d8cfc3] bg-white px-3 py-2 text-xs outline-none focus:border-[#1a3c36]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#444]">Dedication Note / Subtitle:</label>
                  <textarea
                    rows="2"
                    value={customFields.note}
                    onChange={(event) => updateField("note", event.target.value)}
                    placeholder="Add a special date, message, or chapter title..."
                    className="mt-1 w-full resize-none rounded-xl border border-[#d8cfc3] bg-white px-3 py-2 text-xs outline-none focus:border-[#1a3c36]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#444]">Featured Cover Photo (Optional):</label>
                  {customFields.photo ? (
                    <div className="mt-1.5 flex items-center gap-2.5 rounded-xl border border-[#cbe3d3] bg-[#f0f8f3] p-2">
                      <img
                        src={resolveImageUrl(customFields.photo)}
                        alt="Cover upload"
                        className="h-10 w-10 rounded-lg object-cover border border-[#b2d9be]"
                      />
                      <div className="flex-1 text-[11px]">
                        <p className="font-bold text-[#1b794b] flex items-center gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Photo attached for cover
                        </p>
                        <p className="text-[10px] text-[#666]">Ready for album printing</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => updateField("photo", null)}
                        className="rounded-lg p-1 text-[#888] transition hover:bg-white hover:text-red-600"
                        title="Remove photo"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ) : (
                    <label className="mt-1 inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-[#1a3c36] bg-white px-3 py-2 text-xs font-bold text-[#1a3c36] hover:bg-[#f4efe8]">
                      <UploadCloud className="h-3.5 w-3.5" />
                      {uploading ? "Uploading..." : "Upload Photo"}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={uploading}
                        onChange={(event) => handleCoverPhotoUpload(event.target.files?.[0])}
                      />
                    </label>
                  )}
                </div>
              </div>
            )}

            {/* GIFT BOX PERSONALIZATION (FOR GIFTS) */}
            {!isAlbum && hasCustomization && (
              <CustomizationFields
                titleLabel="Recipient Name"
                noteLabel="Handwritten Note / Message"
                titlePlaceholder="e.g., Happy Birthday Rahul"
                notePlaceholder="Add a heartfelt message for the card..."
                fields={customFields}
                updateField={updateField}
                uploadPhoto={handleCoverPhotoUpload}
                uploading={uploading}
              />
            )}

            {!isAlbum && item.gift_items?.length > 0 && (
              <div className="mt-4 rounded-2xl border border-[#ebe3d7] bg-[#faf8f5] p-3.5">
                <h4 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#9b6b2d]">
                  <Gift className="h-3.5 w-3.5" /> Items Included ({item.gift_items.length})
                </h4>
                <p className="mt-2 text-xs text-[#555]">
                  {item.gift_items
                    .map((giftItem) => (typeof giftItem === "string" ? giftItem : giftItem?.name))
                    .filter(Boolean)
                    .join(" • ")}
                </p>
              </div>
            )}
          </div>

          <div className="mt-5 border-t border-[#f0e8dc] pt-4">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#555]">Quantity</span>
                <button
                  type="button"
                  onClick={() => toggleWishlist?.({ ...item, __wishlistType: type })}
                  className={`flex h-9 w-9 items-center justify-center rounded-full border ${
                    isFavorite
                      ? "border-[#d79d4a] bg-[#d79d4a] text-[#1d2925]"
                      : "border-[#e5ded4] bg-[#faf8f5] text-[#777]"
                  }`}
                  aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
                >
                  <Heart className="h-4 w-4" fill={isFavorite ? "currentColor" : "none"} />
                </button>
              </div>
              <div className="inline-flex items-center rounded-xl border border-[#d8cfc3] bg-white p-1">
                <button
                  type="button"
                  onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-sm font-bold text-[#555] hover:bg-[#f4efe8]"
                >
                  <Minus className="h-3 w-3" />
                </button>
                <span className="w-8 text-center text-xs font-bold text-[#1d2925]">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((value) => value + 1)}
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-sm font-bold text-[#555] hover:bg-[#f4efe8]"
                >
                  <Plus className="h-3 w-3" />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={addItemToCart}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#1a3c36] bg-white py-3 text-xs font-bold text-[#1a3c36] hover:bg-[#f7f4ef]"
              >
                <ShoppingCart className="h-4 w-4" /> Add to Cart
              </button>
              <button
                type="button"
                onClick={buyNow}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#1a3c36] py-3 text-xs font-bold text-white hover:bg-[#235048]"
              >
                <ShoppingBag className="h-4 w-4" /> Buy Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Spec = ({ label, value }) => (
  <div className="flex justify-between gap-3 border-b border-[#f2eee8] py-1.5 last:border-0">
    <span className="text-[#777]">{label}</span>
    <span className="text-right font-bold text-[#1d2925]">{value}</span>
  </div>
);

const CustomizationFields = ({
  titleLabel,
  noteLabel,
  titlePlaceholder,
  notePlaceholder,
  fields,
  updateField,
  uploadPhoto,
  uploading,
}) => (
  <div className="mt-5 space-y-3 rounded-2xl border border-[#ebdcc8] bg-[#fdfbf8] p-4">
    <h4 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#9b6b2d]">
      <Sparkles className="h-3.5 w-3.5" /> Personalize Your {titleLabel.includes("Cover") ? "Album Cover" : "Gift Box"}
    </h4>
    <div>
      <label className="block text-[11px] font-bold text-[#444]">{titleLabel}:</label>
      <input
        type="text"
        value={fields.title}
        onChange={(event) => updateField("title", event.target.value)}
        placeholder={titlePlaceholder}
        className="mt-1 w-full rounded-xl border border-[#d8cfc3] bg-white px-3 py-2 text-xs outline-none focus:border-[#1a3c36]"
      />
    </div>
    <div>
      <label className="block text-[11px] font-bold text-[#444]">{noteLabel}:</label>
      <textarea
        rows="2"
        value={fields.note}
        onChange={(event) => updateField("note", event.target.value)}
        placeholder={notePlaceholder}
        className="mt-1 w-full resize-none rounded-xl border border-[#d8cfc3] bg-white px-3 py-2 text-xs outline-none focus:border-[#1a3c36]"
      />
    </div>
    <div>
      <label className="block text-[11px] font-bold text-[#444]">Attach Photo (Optional):</label>
      {fields.photo ? (
        <div className="mt-1.5 flex items-center gap-2.5 rounded-xl border border-[#cbe3d3] bg-[#f0f8f3] p-2">
          <img
            src={resolveImageUrl(fields.photo)}
            alt="Upload preview"
            className="h-10 w-10 rounded-lg object-cover border border-[#b2d9be]"
          />
          <div className="flex-1 text-[11px]">
            <p className="font-bold text-[#1b794b] flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" /> Photo attached
            </p>
          </div>
          <button
            type="button"
            onClick={() => updateField("photo", null)}
            className="rounded-lg p-1 text-[#888] transition hover:bg-white hover:text-red-600"
            title="Remove photo"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <label className="mt-1 inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-[#1a3c36] bg-white px-3 py-2 text-xs font-bold text-[#1a3c36] hover:bg-[#f4efe8]">
          <UploadCloud className="h-3.5 w-3.5" /> {uploading ? "Uploading..." : "Upload Photo"}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            disabled={uploading}
            onChange={(event) => uploadPhoto(event.target.files?.[0])}
          />
        </label>
      )}
    </div>
  </div>
);

export default ProductQuickView;
