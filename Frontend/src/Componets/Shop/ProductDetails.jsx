import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  AlertCircle,
  ArrowLeft,
  Bold,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Crop,
  Download,
  Eye,
  EyeOff,
  FlipHorizontal,
  FlipVertical,
  Heart,
  Image as ImageIcon,
  ImagePlus,
  Italic,
  Layers,
  Move,
  Package,
  Palette,
  RotateCcw,
  RotateCw,
  Share2,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Sliders,
  Sparkles,
  Trash2,
  Truck,
  Type,
  UploadCloud,
  Wand2,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import api from "../../api";
import { StoreContext } from "../../PrivateRouter/StoreContext";
import { useAuth } from "../../PrivateRouter/AuthContext";
import toast from "react-hot-toast";
import PhotoAdjustModal, {
  DEFAULT_ADJUSTMENT,
  FILTER_PRESETS,
  FONT_FAMILIES,
  INNER_BORDER_COLORS,
  OUTER_BORDER_COLORS,
} from "../../CommonComponents/PhotoAdjustModal";
import PageHeader from "../../CommonComponents/PageHeader";
import PageContainer from "../../CommonComponents/PageContainer";
import ProductCard from "../../CommonComponents/ProductCard";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";

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
              const radius = Math.min(12, Math.min(sw, sh) * 0.05);
              if (slot.shape === "circle") {
                ctx.arc(sx + sw / 2, sy + sh / 2, Math.min(sw, sh) / 2, 0, Math.PI * 2);
              } else {
                if (ctx.roundRect) {
                  ctx.roundRect(sx, sy, sw, sh, radius);
                } else {
                  ctx.rect(sx, sy, sw, sh);
                }
              }
              ctx.closePath();
              ctx.clip();

              // Inner Border & Outer Border calculation
              const innerBorderWidth = adj.innerBorderWidth ? Math.round((adj.innerBorderWidth / 320) * sw) : 0;
              const innerBorderColor = adj.innerBorderColor && adj.innerBorderColor !== "transparent" ? adj.innerBorderColor : null;
              const outerBorderWidth = adj.outerBorderWidth ? Math.round((adj.outerBorderWidth / 320) * sw) : 0;
              const outerBorderColor = adj.outerBorderColor && adj.outerBorderColor !== "transparent" ? adj.outerBorderColor : null;

              if (innerBorderColor) {
                ctx.fillStyle = innerBorderColor;
                ctx.fillRect(sx, sy, sw, sh);
              }

              const psx = sx + innerBorderWidth;
              const psy = sy + innerBorderWidth;
              const psw = Math.max(10, sw - innerBorderWidth * 2);
              const psh = Math.max(10, sh - innerBorderWidth * 2);

              ctx.save();
              ctx.beginPath();
              if (slot.shape === "circle") {
                ctx.arc(psx + psw / 2, psy + psh / 2, Math.min(psw, psh) / 2, 0, Math.PI * 2);
              } else {
                const innerRadius = Math.max(0, radius - innerBorderWidth * 0.5);
                if (ctx.roundRect) ctx.roundRect(psx, psy, psw, psh, innerRadius);
                else ctx.rect(psx, psy, psw, psh);
              }
              ctx.closePath();
              ctx.clip();

              // Calculate object-fit with pan & zoom
              const imgRatio = pImg.naturalWidth / pImg.naturalHeight;
              const slotRatio = psw / psh;
              let baseW = psw, baseH = psh;

              const fitMode = adj.fitMode || slot.objectFit || "cover";
              if (fitMode === "contain") {
                if (imgRatio > slotRatio) {
                  baseW = psw;
                  baseH = psw / imgRatio;
                } else {
                  baseH = psh;
                  baseW = psh * imgRatio;
                }
              } else {
                // cover
                if (imgRatio > slotRatio) {
                  baseH = psh;
                  baseW = psh * imgRatio;
                } else {
                  baseW = psw;
                  baseH = psw / imgRatio;
                }
              }

              const dw = baseW * scale;
              const dh = baseH * scale;
              const safePanX = fitMode === "contain" && scale <= 1 ? 0 : panX;
              const safePanY = fitMode === "contain" && scale <= 1 ? 0 : panY;
              const dx = psx + (psw - dw) / 2 + (safePanX / 100) * psw;
              const dy = psy + (psh - dh) / 2 + (safePanY / 100) * psh;

              // Apply Filters (Canvas filter)
              const filterParts = [];
              if (adj.filter === "bw") filterParts.push("grayscale(100%) contrast(110%)");
              else if (adj.filter === "sepia") filterParts.push("sepia(85%) contrast(95%)");
              else if (adj.filter === "warm") filterParts.push("sepia(25%) saturate(140%) brightness(105%)");
              else if (adj.filter === "cool") filterParts.push("hue-rotate(185deg) saturate(90%) brightness(105%)");
              else if (adj.filter === "vintage") filterParts.push("sepia(35%) contrast(120%) brightness(90%) saturate(120%)");
              else if (adj.filter === "vivid") filterParts.push("saturate(160%) contrast(115%) brightness(102%)");
              else if (adj.filter === "dramatic") filterParts.push("contrast(140%) brightness(90%) saturate(110%)");
              else if (adj.filter === "fade") filterParts.push("contrast(85%) brightness(110%) saturate(85%)");

              const brightness = adj.brightness ?? 100;
              const contrast = (adj.contrast ?? 100) + Math.round((adj.sharpness || 0) * 0.4);
              const saturation = adj.saturation ?? 100;
              const blur = adj.blur || 0;

              if (brightness !== 100) filterParts.push(`brightness(${brightness}%)`);
              if (contrast !== 100) filterParts.push(`contrast(${contrast}%)`);
              if (saturation !== 100) filterParts.push(`saturate(${saturation}%)`);
              if (blur > 0) filterParts.push(`blur(${Math.max(1, Math.round(blur * (w / 1000)))}px)`);

              if (filterParts.length > 0 && ctx.filter) {
                ctx.filter = filterParts.join(" ");
              }

              // Rotate and Flip Transform
              const totalRot = ((adj.rotate || 0) + (adj.angle || 0)) % 360;
              const flipH = Boolean(adj.flipH);
              const flipV = Boolean(adj.flipV);

              ctx.save();
              ctx.translate(dx + dw / 2, dy + dh / 2);
              if (totalRot !== 0) {
                ctx.rotate((totalRot * Math.PI) / 180);
              }
              if (flipH || flipV) {
                ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
              }
              ctx.drawImage(pImg, -dw / 2, -dh / 2, dw, dh);
              ctx.restore();
              ctx.filter = "none";
              ctx.restore(); // Restore sub-clip

              // Draw Outer Border stroke if specified
              if (outerBorderColor && outerBorderWidth > 0) {
                ctx.strokeStyle = outerBorderColor;
                ctx.lineWidth = outerBorderWidth;
                ctx.stroke();
              }

              // Draw Text Overlay
              if (adj.textOverlay?.text) {
                ctx.save();
                const fontSz = Math.max(14, Math.round(((adj.textOverlay.fontSize || 18) / 320) * sw));
                const fontFam = adj.textOverlay.fontFamily || "sans-serif";
                const isBold = adj.textOverlay.bold ? "bold " : "";
                const isItalic = adj.textOverlay.italic ? "italic " : "";
                ctx.font = `${isBold}${isItalic}${fontSz}px ${fontFam}`;
                ctx.fillStyle = adj.textOverlay.color || "#ffffff";
                ctx.textAlign = adj.textOverlay.align || "center";
                ctx.textBaseline = "middle";

                if (adj.textOverlay.shadow) {
                  ctx.shadowColor = "rgba(0,0,0,0.85)";
                  ctx.shadowBlur = 5;
                  ctx.shadowOffsetX = 1;
                  ctx.shadowOffsetY = 2;
                }

                let tx = sx + sw / 2;
                if (adj.textOverlay.align === "left") tx = sx + fontSz * 1.2;
                else if (adj.textOverlay.align === "right") tx = sx + sw - fontSz * 1.2;

                let ty = sy + sh - fontSz * 1.6;
                if (adj.textOverlay.position === "top") ty = sy + fontSz * 1.6;
                else if (adj.textOverlay.position === "center") ty = sy + sh / 2;

                ctx.fillText(adj.textOverlay.text, tx, ty, sw - fontSz * 1.5);
                ctx.restore();
              }

              ctx.restore(); // Restore outer clip
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
  const { addToCart, wishlist, toggleWishlist, openCart } = useContext(StoreContext);

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [customerPhotos, setCustomerPhotos] = useState({});
  const [uploadingSlot, setUploadingSlot] = useState(null);
  const [quantity, setQuantity] = useState(1);
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

  // View mode: 'editor' (interactive frame with slots) | 'wall' (living room ambient wall) | 'preview' (whole merged composite photo)
  const [viewMode, setViewMode] = useState("editor");
  const [mergedPreviewUrl, setMergedPreviewUrl] = useState(null);
  const [generatingPreview, setGeneratingPreview] = useState(false);
  const [compositeServerUrl, setCompositeServerUrl] = useState(null);

  // Active slot & Studio tool tab for inline customization
  const [activeSlotId, setActiveSlotId] = useState(null);
  const [activeStudioTab, setActiveStudioTab] = useState("filters"); // 'filters' | 'text' | 'crop' | 'borders' | 'rotate'

  const fileInputRefs = useRef({});

  // Studio navigation tabs scroll & drag handling
  const studioTabsNavRef = useRef(null);
  const [canScrollTabsLeft, setCanScrollTabsLeft] = useState(false);
  const [canScrollTabsRight, setCanScrollTabsRight] = useState(false);
  const [isDraggingStudioTabs, setIsDraggingStudioTabs] = useState(false);
  const studioTabsStartX = useRef(0);
  const studioTabsStartScrollLeft = useRef(0);
  const studioTabsHasDragged = useRef(false);

  const checkStudioTabsScroll = () => {
    const el = studioTabsNavRef.current;
    if (!el) return;
    const tolerance = 2;
    setCanScrollTabsLeft(el.scrollLeft > tolerance);
    setCanScrollTabsRight(el.scrollLeft + el.clientWidth < el.scrollWidth - tolerance);
  };

  useEffect(() => {
    const el = studioTabsNavRef.current;
    if (!el) return;

    checkStudioTabsScroll();

    const handleScroll = () => checkStudioTabsScroll();
    el.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);

    // Allow mouse wheel to scroll tabs horizontally
    const handleWheel = (e) => {
      if (el.scrollWidth > el.clientWidth) {
        if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
          e.preventDefault();
          el.scrollLeft += e.deltaY;
          checkStudioTabsScroll();
        }
      }
    };
    el.addEventListener("wheel", handleWheel, { passive: false });

    let resizeObserver;
    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(() => checkStudioTabsScroll());
      resizeObserver.observe(el);
    }

    return () => {
      el.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
      el.removeEventListener("wheel", handleWheel);
      if (resizeObserver) resizeObserver.disconnect();
    };
  }, []);

  const scrollStudioTabs = (direction) => {
    const el = studioTabsNavRef.current;
    if (!el) return;
    const scrollAmount = 180;
    el.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  const handleStudioTabsMouseDown = (e) => {
    const el = studioTabsNavRef.current;
    if (!el) return;
    setIsDraggingStudioTabs(true);
    studioTabsStartX.current = e.pageX - el.offsetLeft;
    studioTabsStartScrollLeft.current = el.scrollLeft;
    studioTabsHasDragged.current = false;
  };

  const handleStudioTabsMouseMove = (e) => {
    if (!isDraggingStudioTabs) return;
    const el = studioTabsNavRef.current;
    if (!el) return;
    e.preventDefault();
    const x = e.pageX - el.offsetLeft;
    const walk = (x - studioTabsStartX.current) * 1.5;
    if (Math.abs(walk) > 5) {
      studioTabsHasDragged.current = true;
    }
    el.scrollLeft = studioTabsStartScrollLeft.current - walk;
    checkStudioTabsScroll();
  };

  const handleStudioTabsMouseUpOrLeave = () => {
    setIsDraggingStudioTabs(false);
  };

  // Keep active tab scrolled into view
  useEffect(() => {
    if (!activeStudioTab || !studioTabsNavRef.current) return;
    const activeBtn = studioTabsNavRef.current.querySelector(`[data-tab-id="${activeStudioTab}"]`);
    if (activeBtn) {
      activeBtn.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
    }
    checkStudioTabsScroll();
  }, [activeStudioTab]);

  const isFavorite = product
    ? wishlist.some(
        (item) => String(item.product_id || item.id || item._id) === String(product.id || product.product_id),
      )
    : false;

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/products/${id}`);
        if (res.data?.data) {
          const prod = res.data.data;
          setProduct(prod);
          const productsRes = await api.get("/products");
          const products = Array.isArray(productsRes.data?.data) ? productsRes.data.data : [];
          const photoFrames = products.filter(
            (item) =>
              String(item.id) !== String(prod.id) &&
              item.frame_data?.photo_slots?.length > 0 &&
              String(item.status || "Active").toLowerCase() === "active",
          );
          const sameCategory = photoFrames.filter(
            (item) => String(item.category || "").toLowerCase() === String(prod.category || "").toLowerCase(),
          );
          setRelatedProducts((sameCategory.length > 0 ? sameCategory : photoFrames).slice(0, 8));
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

  // Ensure activeSlotId defaults to the first slot when slots are available
  useEffect(() => {
    if (photoSlots.length > 0 && (!activeSlotId || !photoSlots.some((s) => s.id === activeSlotId))) {
      setActiveSlotId(photoSlots[0].id);
    }
  }, [photoSlots, activeSlotId]);

  const activeSlot = photoSlots.find((s) => s.id === activeSlotId) || photoSlots[0] || null;
  const activeAdjustment = useMemo(() => {
    if (!activeSlot) return DEFAULT_ADJUSTMENT;
    const existing = photoAdjustments[activeSlot.id];
    return {
      ...DEFAULT_ADJUSTMENT,
      fitMode: activeSlot.objectFit || "cover",
      ...(existing || {}),
    };
  }, [photoAdjustments, activeSlot]);

  // Helper to mutate adjustment for the ACTIVE slot only
  const updateActiveAdjustment = (updates) => {
    if (!activeSlot?.id) return;
    setPhotoAdjustments((prev) => {
      const current = prev[activeSlot.id] || {
        ...DEFAULT_ADJUSTMENT,
        fitMode: activeSlot.objectFit || "cover",
      };
      return {
        ...prev,
        [activeSlot.id]: {
          ...current,
          ...updates,
        },
      };
    });
  };

  // Helper to update text overlay for the ACTIVE slot only
  const updateActiveTextOverlay = (textUpdates) => {
    if (!activeSlot?.id) return;
    setPhotoAdjustments((prev) => {
      const currentAdj = prev[activeSlot.id] || {
        ...DEFAULT_ADJUSTMENT,
        fitMode: activeSlot.objectFit || "cover",
      };
      return {
        ...prev,
        [activeSlot.id]: {
          ...currentAdj,
          textOverlay: {
            ...(currentAdj.textOverlay || DEFAULT_ADJUSTMENT.textOverlay),
            ...textUpdates,
          },
        },
      };
    });
  };

  // Download High-Resolution Composite Frame handler
  const handleDownloadHighRes = async () => {
    if (!frameData.frame_image) return;
    const toastId = toast.loading("Rendering high-resolution custom frame...");
    try {
      const { dataUrl } = await generateCompositeFrameBlobAndDataUrl(
        frameData.frame_image,
        photoSlots,
        customerPhotos,
        product?.slot_photos || {},
        photoAdjustments
      );
      if (dataUrl) {
        const a = document.createElement("a");
        a.href = dataUrl;
        a.download = `${(product?.product_name || "frame").toLowerCase().replace(/\s+/g, "-")}-custom-${Date.now()}.jpg`;
        a.click();
        toast.dismiss(toastId);
        toast.success("High-resolution frame downloaded!");
      } else {
        toast.dismiss(toastId);
        toast.error("Could not render frame image.");
      }
    } catch (err) {
      toast.dismiss(toastId);
      console.error("Download error:", err);
      toast.error("Failed to download frame image.");
    }
  };

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

      const slotObj = photoSlots.find((s) => s.id === slotId);
      const defaultFit = slotObj?.objectFit || "cover";

      setCustomerPhotos((prev) => ({
        ...prev,
        [slotId]: url,
      }));
      setActiveSlotId(slotId);
      setPhotoAdjustments((prev) => ({
        ...prev,
        [slotId]: prev[slotId] || {
          ...DEFAULT_ADJUSTMENT,
          fitMode: defaultFit,
        },
      }));
      setHighlightMissingSlots(false);
      toast.success("Photo uploaded to frame slot!");
    } catch (err) {
      console.error("Slot upload error:", err);
      toast.error("Upload failed, using local preview.");
      const localUrl = URL.createObjectURL(file);
      const slotObj = photoSlots.find((s) => s.id === slotId);
      const defaultFit = slotObj?.objectFit || "cover";

      setCustomerPhotos((prev) => ({
        ...prev,
        [slotId]: localUrl,
      }));
      setActiveSlotId(slotId);
      setPhotoAdjustments((prev) => ({
        ...prev,
        [slotId]: prev[slotId] || {
          ...DEFAULT_ADJUSTMENT,
          fitMode: defaultFit,
        },
      }));
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
    const slot = photoSlots.find((s) => s.id === slotId);
    const fitMode = curr.fitMode || slot?.objectFit || "cover";
    const slotRect = e.currentTarget.getBoundingClientRect();
    const photoElement = e.currentTarget.querySelector("img");
    const photoRatio = photoElement?.naturalWidth && photoElement?.naturalHeight
      ? photoElement.naturalWidth / photoElement.naturalHeight
      : 1;
    const baseWidth = fitMode === "contain"
      ? Math.min(slotRect.width, slotRect.height * photoRatio)
      : Math.max(slotRect.width, slotRect.height * photoRatio);
    const baseHeight = fitMode === "contain"
      ? Math.min(slotRect.height, slotRect.width / photoRatio)
      : Math.max(slotRect.height, slotRect.width / photoRatio);
    const renderedWidth = baseWidth * (curr.scale || 1.0);
    const renderedHeight = baseHeight * (curr.scale || 1.0);
    const maxPanX = Math.max(0, ((renderedWidth - slotRect.width) / 2 / slotRect.width) * 100);
    const maxPanY = Math.max(0, ((renderedHeight - slotRect.height) / 2 / slotRect.height) * 100);

    const deltaPercentX = slotRect.width ? (dx / slotRect.width) * 100 : 0;
    const deltaPercentY = slotRect.height ? (dy / slotRect.height) * 100 : 0;

    const newPanX = Math.min(maxPanX, Math.max(-maxPanX, dragSlotStartRef.current.startPanX + deltaPercentX));
    const newPanY = Math.min(maxPanY, Math.max(-maxPanY, dragSlotStartRef.current.startPanY + deltaPercentY));

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
    if (!user?.user_id) {
      toast.error("Please login before buying this item");
      return;
    }
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
        setIsConfirmModalOpen(false);
        navigate("/checkout", {
          state: {
            checkoutItems: [
              {
                product_id: product.id,
                product_name: product.product_name,
                category: product.category,
                size: selectedVariant.size || "Standard",
                price: Number(selectedVariant.offer_price || selectedVariant.mrp || 0),
                quantity: Number(quantity),
                customization_id: savedCust?.customization_id || customizationId,
                slot_photos: customerPhotos,
                photo_adjustments: photoAdjustments,
                product_image:
                  savedCust?.preview_image ||
                  compositeServerUrl ||
                  mergedPreviewUrl ||
                  product.product_images?.[0] ||
                  frameData.frame_image,
                frame_image: frameData.frame_image,
              },
            ],
          },
        });
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
      <div className="flex min-h-[70vh] items-center justify-center bg-[#f7f3ed]">
        <div className="text-center">
          <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-[#b07838] border-t-transparent" />
          <p className="mt-3 text-sm font-semibold text-[#666]">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center bg-[#f7f3ed] p-6 text-center">
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

  return (
    <main className="min-h-screen bg-[#f7f3ed]">
      <PageHeader title={product.product_name} />
      <PageContainer className="py-10">

        {/* TWO-COLUMN PRODUCT WORKSPACE */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* ================= LEFT COLUMN: LIVE FRAME CANVAS & MERGED WHOLE PREVIEW (7 COLS) ================= */}
          <div className="lg:col-span-7">
            <div className="sticky top-28 rounded-3xl border border-[#ebe3d7] bg-white p-5 shadow-sm md:p-8">
              {/* CANVAS HEADER WITH VIEW SWITCHER */}
              <div className="mb-4 flex flex-col gap-3 border-b border-[#f0e8dc] pb-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 shrink">
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#eef6f3] text-[#1a3c36]">
                      <Sparkles className="h-4 w-4" />
                    </span>
                    <h3 className="text-sm font-bold text-[#1d2925] truncate">
                      {viewMode === "editor"
                        ? "Interactive Photo Slots"
                        : viewMode === "wall"
                        ? "Wall Visualizer"
                        : "Whole Frame Preview"}
                    </h3>
                  </div>
                  <p className="mt-0.5 text-[11px] text-[#777] truncate">
                    {customPhotoCount > 0
                      ? `${customPhotoCount} of ${totalSlotsCount} custom photos placed`
                      : "Click slots to add your photos"}
                  </p>
                </div>

                {/* VIEW MODE TOGGLE BUTTONS & TOOLBAR */}
                <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 flex-nowrap overflow-x-auto scrollbar-none">
                  <button
                    type="button"
                    onClick={() => setViewMode((m) => (m === "wall" ? "editor" : "wall"))}
                    className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 sm:px-3 py-1.5 text-xs font-bold transition shadow-xs whitespace-nowrap cursor-pointer ${
                      viewMode === "wall"
                        ? "border-[#1a3c36] bg-[#1a3c36] text-white"
                        : "border-[#d8cfc3] bg-white text-[#1d2925] hover:bg-[#faf8f5]"
                    }`}
                  >
                    <Eye className="h-3.5 w-3.5 text-[#b07838] shrink-0" />
                    <span>{viewMode === "wall" ? "Studio View" : "Wall Visualizer"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDownloadHighRes}
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[#d8cfc3] bg-white px-2.5 sm:px-3 py-1.5 text-xs font-bold text-[#1d2925] hover:bg-[#faf8f5] shadow-xs transition whitespace-nowrap cursor-pointer"
                    title="Download high-resolution custom frame image"
                  >
                    <Download className="h-3.5 w-3.5 text-[#b07838] shrink-0" />
                    <span>Download High-Res</span>
                  </button>

                  <div className="inline-flex shrink-0 rounded-xl border border-[#e2d9cd] bg-[#f9f7f4] p-1 text-xs whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => setViewMode("editor")}
                      className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1 font-bold transition whitespace-nowrap cursor-pointer ${
                        viewMode === "editor"
                          ? "bg-[#1a3c36] text-white shadow-xs"
                          : "text-[#666] hover:text-[#1d2925]"
                      }`}
                    >
                      <Layers className="h-3.5 w-3.5 shrink-0" /> Slot Editor
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode("preview")}
                      className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1 font-bold transition whitespace-nowrap cursor-pointer ${
                        viewMode === "preview"
                          ? "bg-[#1a3c36] text-white shadow-xs"
                          : "text-[#666] hover:text-[#1d2925]"
                      }`}
                    >
                      <Eye className="h-3.5 w-3.5 shrink-0" /> Whole Frame Preview
                    </button>
                  </div>
                </div>
              </div>

              {/* FRAME STAGE */}
              <div
                className={`relative flex min-h-[460px] items-center justify-center overflow-hidden rounded-2xl border border-[#e8dfd2] p-4 sm:p-8 transition-all duration-300 ${
                  viewMode === "wall"
                    ? "bg-cover bg-center shadow-inner"
                    : "bg-[#f5efe7]"
                }`}
                style={
                  viewMode === "wall"
                    ? {
                        backgroundImage:
                          "radial-gradient(circle at center, rgba(245,240,230,0.92) 0%, rgba(220,210,195,0.96) 100%)",
                      }
                    : {}
                }
              >
                {/* WALL VISUALIZER AMBIENT FOOTER */}
                {viewMode === "wall" && (
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-9 border-t border-[#d8cfc3] bg-[#e4dacd]/60 backdrop-blur-xs flex items-center justify-center text-[10px] font-bold text-[#888]">
                    Wall Hanging Simulation • Living Room Ambient Lighting
                  </div>
                )}

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
                        const isActive = activeSlotId === slot.id;
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
                              onClick={() => setActiveSlotId(slot.id)}
                              className={`group absolute overflow-hidden select-none transition-all duration-150 cursor-pointer ${
                                isActive
                                  ? "ring-4 ring-[#1a3c36] ring-offset-2 ring-offset-white z-30 shadow-2xl border-transparent"
                                  : `hover:ring-2 hover:ring-[#b07838] z-10 ${
                                      userPhoto
                                        ? "border-[#1b794b] ring-2 ring-[#1b794b]/30"
                                        : highlightMissingSlots
                                        ? "border-2 border-red-500 bg-red-100/50 ring-4 ring-red-400/50 animate-pulse"
                                        : "border-dashed border-[#b07838] bg-white/70 hover:bg-white/95"
                                    }`
                              }`}
                              style={{
                                top: slot.top,
                                left: slot.left,
                                width: slot.width,
                                height: slot.height,
                                borderRadius: slot.shape === "circle" ? "9999px" : "6px",
                              }}
                              title={`Click to select & edit ${slot.name || `Photo ${idx + 1}`}`}
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
                                  {/* PHOTO WITH STUDIO ADJUSTMENTS */}
                                  {(() => {
                                    const adj = photoAdjustments[slot.id] || { panX: 0, panY: 0, scale: 1.0 };
                                    const fitMode = adj.fitMode || slot.objectFit || "cover";
                                    const isContain = fitMode === "contain";
                                    const imageScale = adj.scale || 1.0;
                                    const safePanX = isContain && imageScale <= 1 ? 0 : adj.panX || 0;
                                    const safePanY = isContain && imageScale <= 1 ? 0 : adj.panY || 0;
                                    const filterParts = [];
                                    if (adj.filter === "bw") filterParts.push("grayscale(100%) contrast(110%)");
                                    else if (adj.filter === "sepia") filterParts.push("sepia(85%) contrast(95%)");
                                    else if (adj.filter === "warm") filterParts.push("sepia(25%) saturate(140%) brightness(105%)");
                                    else if (adj.filter === "cool") filterParts.push("hue-rotate(185deg) saturate(90%) brightness(105%)");
                                    else if (adj.filter === "vintage") filterParts.push("sepia(35%) contrast(120%) brightness(90%) saturate(120%)");
                                    else if (adj.filter === "vivid") filterParts.push("saturate(160%) contrast(115%) brightness(102%)");
                                    else if (adj.filter === "dramatic") filterParts.push("contrast(140%) brightness(90%) saturate(110%)");
                                    else if (adj.filter === "fade") filterParts.push("contrast(85%) brightness(110%) saturate(85%)");

                                    if (adj.brightness && adj.brightness !== 100) filterParts.push(`brightness(${adj.brightness}%)`);
                                    if (adj.contrast && adj.contrast !== 100) filterParts.push(`contrast(${adj.contrast}%)`);
                                    if (adj.saturation && adj.saturation !== 100) filterParts.push(`saturate(${adj.saturation}%)`);
                                    if (adj.blur > 0) filterParts.push(`blur(${adj.blur}px)`);
                                    if (adj.sharpness > 0) filterParts.push(`contrast(${100 + Math.round(adj.sharpness * 0.4)}%)`);

                                    const totalRot = ((adj.rotate || 0) + (adj.angle || 0)) % 360;
                                    const flipH = Boolean(adj.flipH);
                                    const flipV = Boolean(adj.flipV);

                                    return (
                                      <div
                                        className="relative h-full w-full overflow-hidden"
                                        style={{
                                          backgroundColor: adj.innerBorderColor && adj.innerBorderColor !== "transparent" ? adj.innerBorderColor : "transparent",
                                          padding: adj.innerBorderWidth ? `${adj.innerBorderWidth}px` : "0px",
                                          boxShadow: adj.outerBorderWidth && adj.outerBorderColor !== "transparent"
                                            ? `inset 0 0 0 ${adj.outerBorderWidth}px ${adj.outerBorderColor}`
                                            : "none",
                                        }}
                                      >
                                        <img
                                          src={activePhoto}
                                          alt={slot.name}
                                          draggable={false}
                                          className={`pointer-events-none absolute h-full w-full select-none object-center origin-center ${!userPhoto ? "opacity-75" : ""}`}
                                          style={{
                                            top: `calc(50% + ${safePanY}%)`,
                                            left: `calc(50% + ${safePanX}%)`,
                                            objectFit: isContain ? "contain" : "cover",
                                            transform: `translate(-50%, -50%) scale(${imageScale}) rotate(${totalRot}deg) scaleX(${flipH ? -1 : 1}) scaleY(${flipV ? -1 : 1})`,
                                            filter: filterParts.length ? filterParts.join(" ") : "none",
                                            transition: activeDraggingSlot === slot.id ? "none" : "transform 0.08s ease-out, filter 0.2s ease",
                                          }}
                                        />

                                        {adj.textOverlay?.text && (
                                          <div
                                            className={`pointer-events-none absolute left-1 right-1 flex z-10 ${
                                              adj.textOverlay.position === "top"
                                                ? "top-1.5"
                                                : adj.textOverlay.position === "center"
                                                ? "top-1/2 -translate-y-1/2"
                                                : "bottom-1.5"
                                            } ${
                                              adj.textOverlay.align === "left"
                                                ? "justify-start"
                                                : adj.textOverlay.align === "right"
                                                ? "justify-end"
                                                : "justify-center"
                                            }`}
                                          >
                                            <span
                                              className="px-1.5 py-0.5 truncate text-center max-w-full"
                                              style={{
                                                fontFamily: adj.textOverlay.fontFamily || "inherit",
                                                fontSize: `${Math.max(10, Math.round((adj.textOverlay.fontSize || 16) * 0.65))}px`,
                                                color: adj.textOverlay.color || "#fff",
                                                fontWeight: adj.textOverlay.bold ? "bold" : "normal",
                                                fontStyle: adj.textOverlay.italic ? "italic" : "normal",
                                                textShadow: adj.textOverlay.shadow
                                                  ? "0 1px 3px rgba(0,0,0,0.8)"
                                                  : "none",
                                              }}
                                            >
                                              {adj.textOverlay.text}
                                            </span>
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })()}

                                  {/* SLOT BADGE (INDEX & ACTIVE STATUS) */}
                                  <div className="pointer-events-none absolute top-1 left-1 flex items-center gap-1 rounded bg-black/75 px-1.5 py-0.5 text-[9px] font-bold text-white shadow z-20 backdrop-blur-xs">
                                    <span className="text-[#d5a65a]">#{idx + 1}</span>
                                    {isActive && <span className="text-[8px] text-[#4ade80]">• Editing</span>}
                                  </div>

                                  {/* QUICK CHANGE PHOTO BUTTON (TOP RIGHT) */}
                                  <button
                                    type="button"
                                    onPointerDown={(e) => e.stopPropagation()}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setActiveSlotId(slot.id);
                                      fileInputRefs.current[slot.id]?.click();
                                    }}
                                    className="pointer-events-auto absolute top-1 right-1 z-20 flex h-6 w-6 items-center justify-center rounded-md bg-black/70 hover:bg-[#1a3c36] text-white/90 hover:text-[#d5a65a] shadow transition cursor-pointer"
                                    title="Change Photo"
                                  >
                                    <UploadCloud className="h-3.5 w-3.5" />
                                  </button>

                                  {/* HOVER OVERLAY: ADJUST, FIT MODE & CHANGE */}
                                  <div className="absolute inset-0 flex items-center justify-center gap-1.5 bg-black/45 opacity-0 transition group-hover:opacity-100 z-20">
                                    <button
                                      type="button"
                                      onPointerDown={(e) => e.stopPropagation()}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setActiveSlotId(slot.id);
                                        setAdjustingSlot(slot);
                                      }}
                                      className="rounded-md bg-white/95 px-2 py-1 text-[10px] font-bold text-[#1a3c36] shadow hover:bg-white flex items-center gap-1 cursor-pointer"
                                      title="Reposition & Zoom photo"
                                    >
                                      <Move className="h-3 w-3 text-[#b07838]" /> Adjust
                                    </button>

                                    <button
                                      type="button"
                                      onPointerDown={(e) => e.stopPropagation()}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        const curr = photoAdjustments[slot.id] || { panX: 0, panY: 0, scale: 1.0 };
                                        const nextMode = (curr.fitMode || slot.objectFit) === "contain" ? "cover" : "contain";
                                        setPhotoAdjustments((prev) => ({
                                          ...prev,
                                          [slot.id]: { ...curr, fitMode: nextMode, panX: 0, panY: 0, scale: 1.0 },
                                        }));
                                        toast.success(nextMode === "contain" ? "Fit Full Image mode" : "Fill Frame mode");
                                      }}
                                      className="rounded-md bg-white/95 px-2 py-1 text-[10px] font-bold text-[#333] shadow hover:bg-white flex items-center gap-1 cursor-pointer"
                                      title="Toggle between showing full image vs filling frame"
                                    >
                                      {(photoAdjustments[slot.id]?.fitMode || slot.objectFit) === "contain" ? "Fill Frame" : "Fit Full"}
                                    </button>

                                    <button
                                      type="button"
                                      onPointerDown={(e) => e.stopPropagation()}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setActiveSlotId(slot.id);
                                        fileInputRefs.current[slot.id]?.click();
                                      }}
                                      className="rounded-md bg-[#1a3c36] px-2 py-1 text-[10px] font-bold text-white shadow hover:bg-[#235048] flex items-center gap-1 cursor-pointer"
                                      title="Change photo file"
                                    >
                                      <UploadCloud className="h-3 w-3 text-white" /> {userPhoto ? "Change" : "Upload"}
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveSlotId(slot.id);
                                    fileInputRefs.current[slot.id]?.click();
                                  }}
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
                      ? "Currently in Slot Editor mode. Click on any slot to select and customize it."
                      : viewMode === "wall"
                      ? "Wall visualizer simulates living room lighting on this custom frame."
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

              {/* ================= MULTI-PHOTO POSITION STRIP ================= */}
              {photoSlots.length > 0 && (
                <div className="mt-4 flex w-full flex-col gap-2.5 rounded-2xl border border-[#e2d9cd] bg-white p-3.5 shadow-xs">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#1d2925]">
                      Photos inside this frame ({photoSlots.length} Positions):
                    </span>
                    <span className="text-[11px] text-[#b07838] font-bold">
                      Editing: {activeSlot?.name || `Photo 1`}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {photoSlots.map((slot, idx) => {
                      const isSel = activeSlotId === slot.id;
                      const photo = customerPhotos[slot.id] || product.slot_photos?.[slot.id];
                      return (
                        <button
                          key={slot.id || idx}
                          type="button"
                          onClick={() => {
                            setActiveSlotId(slot.id);
                            if (viewMode === "preview") setViewMode("editor");
                          }}
                          className={`flex items-center gap-2 rounded-xl border p-2 text-left transition ${
                            isSel
                              ? "border-[#1a3c36] bg-[#eef6f3] ring-2 ring-[#1a3c36]/20 shadow-xs"
                              : "border-[#e0d6c8] bg-[#faf8f5] hover:border-[#b07838]"
                          }`}
                        >
                          <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-lg bg-[#ddd] border border-[#ccc]">
                            {photo ? (
                              <img
                                src={photo}
                                alt={slot.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <ImageIcon className="m-auto h-4 w-4 text-[#888]" />
                            )}
                            <span className="absolute bottom-0 right-0 rounded-tl bg-black/70 px-1 text-[8px] font-bold text-white">
                              #{idx + 1}
                            </span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-xs font-bold text-[#1d2925]">
                              {slot.name || `Photo ${idx + 1}`}
                            </p>
                            <p className="text-[10px] text-[#666]">
                              {customerPhotos[slot.id] ? "Uploaded" : "Sample/Empty"}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
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
                  <button
                    type="button"
                    onClick={() => toggleWishlist?.(product, selectedVariant)}
                    className={`flex h-9 w-9 items-center justify-center rounded-full border transition ${isFavorite ? "border-[#d79d4a] bg-[#d79d4a] text-[#1d2925]" : "border-[#e5ded4] bg-[#faf8f5] text-[#777] hover:border-[#d79d4a] hover:text-[#b07838]"}`}
                    aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
                    title={isFavorite ? "Remove from favorites" : "Add to favorites"}
                  >
                    <Heart className="h-4 w-4" fill={isFavorite ? "currentColor" : "none"} />
                  </button>
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

              {/* ================= INLINE STUDIO CUSTOMIZER & PHOTO WORKSPACE ================= */}
              <div className={`mt-6 rounded-3xl border p-5 transition ${
                highlightMissingSlots && customPhotoCount < totalSlotsCount
                  ? "border-red-300 bg-[#fffbfb] ring-2 ring-red-400/30"
                  : "border-[#e5ded4] bg-white shadow-xs"
              }`}>
                {/* CURRENTLY EDITING CARD */}
                <div className="mb-4 flex items-center justify-between rounded-2xl bg-[#f7f5f0] p-3 border border-[#ede4d8]">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#1a3c36] text-[#d5a65a] shadow-xs">
                      <Sparkles className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#b07838]">
                          Currently Editing
                        </span>
                        <span className="rounded bg-[#1a3c36]/10 px-1.5 text-[9px] font-bold text-[#1a3c36]">
                          {activeSlot ? `#${photoSlots.findIndex((s) => s.id === activeSlot.id) + 1}` : "#1"}
                        </span>
                      </div>
                      <h3 className="text-xs font-black text-[#1d2925]">
                        {activeSlot?.name || "Selected Photo Position"}
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {customerPhotos[activeSlot?.id] && (
                      <button
                        type="button"
                        onClick={() => removeCustomerPhoto(activeSlot.id)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#f0d8d8] bg-[#fff5f5] text-[#d04d4d] hover:bg-[#ffe5e5] transition cursor-pointer"
                        title="Remove photo from this slot"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        if (activeSlotId) {
                          fileInputRefs.current[activeSlotId]?.click();
                        }
                      }}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-[#1a3c36] px-3.5 py-1.5 text-xs font-bold text-white shadow hover:bg-[#235048] transition cursor-pointer"
                    >
                      <UploadCloud className="h-3.5 w-3.5 text-[#d5a65a]" />
                      <span>{customerPhotos[activeSlot?.id] ? "Replace Photo" : "Upload Photo"}</span>
                    </button>
                  </div>
                </div>

                {/* STUDIO NAVIGATION PILLS */}
                <div className="relative mb-1">
                  {/* Left Scroll Arrow */}
                  {canScrollTabsLeft && (
                    <button
                      type="button"
                      onClick={() => scrollStudioTabs("left")}
                      className="absolute left-0 top-0 bottom-3 z-10 flex w-7 items-center justify-center rounded-l-xl bg-gradient-to-r from-white via-white/90 to-transparent text-[#1a3c36] hover:text-[#d5a65a] transition cursor-pointer"
                      title="Scroll tabs left"
                      aria-label="Scroll tabs left"
                    >
                      <ChevronLeft className="h-4 w-4 drop-shadow-sm" />
                    </button>
                  )}

                  <div
                    ref={studioTabsNavRef}
                    onMouseDown={handleStudioTabsMouseDown}
                    onMouseMove={handleStudioTabsMouseMove}
                    onMouseUp={handleStudioTabsMouseUpOrLeave}
                    onMouseLeave={handleStudioTabsMouseUpOrLeave}
                    className={`flex overflow-x-auto border-b border-[#f0e8dc] pb-2.5 text-xs font-bold gap-1.5 scroll-smooth select-none cursor-grab ${
                      isDraggingStudioTabs ? "cursor-grabbing" : ""
                    } [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-[#f0ebe3] [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#d5a65a]/60 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-[#1a3c36]`}
                    style={{ scrollbarWidth: "thin", scrollbarColor: "#d5a65a99 #f0ebe3" }}
                  >
                    {[
                      { id: "filters", label: "Brightness & Filters", icon: Wand2 },
                      { id: "text", label: "Add Text", icon: Type },
                      { id: "crop", label: "Crop & Pan", icon: Crop },
                      { id: "borders", label: "Borders", icon: Palette },
                      { id: "rotate", label: "Rotate", icon: RotateCw },
                    ].map((t) => {
                      const Icon = t.icon;
                      const isTabActive = activeStudioTab === t.id;
                      return (
                        <button
                          key={t.id}
                          data-tab-id={t.id}
                          type="button"
                          onClick={() => {
                            if (studioTabsHasDragged.current) return;
                            setActiveStudioTab(t.id);
                          }}
                          className={`flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-2 whitespace-nowrap transition cursor-pointer ${
                            isTabActive
                              ? "bg-[#1a3c36] text-white shadow-xs"
                              : "bg-[#faf8f5] text-[#666] hover:bg-[#f0ebe3] hover:text-[#1d2925]"
                          }`}
                        >
                          <Icon className="h-3.5 w-3.5 shrink-0" />
                          <span>{t.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Right Scroll Arrow */}
                  {canScrollTabsRight && (
                    <button
                      type="button"
                      onClick={() => scrollStudioTabs("right")}
                      className="absolute right-0 top-0 bottom-3 z-10 flex w-7 items-center justify-center rounded-r-xl bg-gradient-to-l from-white via-white/90 to-transparent text-[#1a3c36] hover:text-[#d5a65a] transition cursor-pointer"
                      title="Scroll tabs right"
                      aria-label="Scroll tabs right"
                    >
                      <ChevronRight className="h-4 w-4 drop-shadow-sm" />
                    </button>
                  )}
                </div>

                {/* TAB 1: BRIGHTNESS & FILTERS */}
                {activeStudioTab === "filters" && (
                  <div className="mt-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#b07838]">
                        Brightness &amp; Tone ({activeSlot?.name || "Selected Pic"})
                      </h4>
                      <button
                        type="button"
                        onClick={() =>
                          updateActiveAdjustment({
                            filter: "normal",
                            brightness: 100,
                            contrast: 100,
                            saturation: 100,
                          })
                        }
                        className="text-[11px] font-semibold text-[#888] hover:text-[#222] cursor-pointer"
                      >
                        Reset Tone
                      </button>
                    </div>

                    <div className="rounded-2xl border border-[#ede4d8] bg-[#faf8f5] p-3.5 text-xs space-y-3">
                      <div>
                        <div className="flex justify-between font-bold text-[#1d2925]">
                          <span>Brightness</span>
                          <span className="font-mono text-[#1a3c36]">{activeAdjustment.brightness ?? 100}%</span>
                        </div>
                        <input
                          type="range"
                          min="50"
                          max="150"
                          value={activeAdjustment.brightness ?? 100}
                          onChange={(e) =>
                            updateActiveAdjustment({ brightness: parseInt(e.target.value, 10) })
                          }
                          className="mt-1 h-2 w-full cursor-pointer appearance-none rounded-full bg-[#dfd6c9] accent-[#1a3c36]"
                        />
                        <div className="mt-1 flex justify-between text-[10px] text-[#888]">
                          <span>Dim (50%)</span>
                          <span>Normal (100%)</span>
                          <span>Bright (150%)</span>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between font-bold text-[#1d2925]">
                          <span>Contrast</span>
                          <span className="font-mono text-[#1a3c36]">{activeAdjustment.contrast ?? 100}%</span>
                        </div>
                        <input
                          type="range"
                          min="50"
                          max="150"
                          value={activeAdjustment.contrast ?? 100}
                          onChange={(e) =>
                            updateActiveAdjustment({ contrast: parseInt(e.target.value, 10) })
                          }
                          className="mt-1 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-[#dfd6c9] accent-[#1a3c36]"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between font-bold text-[#1d2925]">
                          <span>Color Saturation</span>
                          <span className="font-mono text-[#1a3c36]">{activeAdjustment.saturation ?? 100}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="200"
                          value={activeAdjustment.saturation ?? 100}
                          onChange={(e) =>
                            updateActiveAdjustment({ saturation: parseInt(e.target.value, 10) })
                          }
                          className="mt-1 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-[#dfd6c9] accent-[#1a3c36]"
                        />
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#b07838]">
                        Color Filter Presets
                      </h4>
                      <div className="mt-2 grid grid-cols-3 gap-2">
                        {FILTER_PRESETS.map((p) => {
                          const isFActive = (activeAdjustment.filter || "normal") === p.id;
                          return (
                            <button
                              key={p.id}
                              type="button"
                              onClick={() => updateActiveAdjustment({ filter: p.id })}
                              className={`rounded-xl border p-2 text-center transition cursor-pointer ${
                                isFActive
                                  ? "border-[#1a3c36] bg-[#1a3c36] text-white shadow-xs"
                                  : "border-[#e0d6c8] bg-[#faf8f5] text-[#444] hover:border-[#b07838]"
                              }`}
                            >
                              <span className="block text-xs font-bold">{p.name}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2: ADD TEXT */}
                {activeStudioTab === "text" && (
                  <div className="mt-4 space-y-3.5">
                    <div>
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-bold uppercase tracking-wider text-[#b07838]">
                          Caption on {activeSlot?.name || "this pic"}
                        </label>
                        {activeAdjustment.textOverlay?.text && (
                          <button
                            type="button"
                            onClick={() => updateActiveTextOverlay({ text: "" })}
                            className="text-[11px] font-semibold text-red-600 hover:underline cursor-pointer"
                          >
                            Clear Text
                          </button>
                        )}
                      </div>
                      <input
                        type="text"
                        value={activeAdjustment.textOverlay?.text || ""}
                        onChange={(e) => updateActiveTextOverlay({ text: e.target.value })}
                        placeholder={`e.g. Love, Mom, 2026 on ${activeSlot?.name || "photo"}`}
                        className="mt-1.5 w-full rounded-xl border border-[#d8cfc3] bg-[#faf8f5] px-3.5 py-2.5 text-xs text-[#1d2925] outline-none focus:border-[#1a3c36] focus:bg-white"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-[11px] font-bold text-[#666]">Font Style</span>
                        <select
                          value={activeAdjustment.textOverlay?.fontFamily || "Inter, sans-serif"}
                          onChange={(e) => updateActiveTextOverlay({ fontFamily: e.target.value })}
                          className="mt-1 w-full rounded-lg border border-[#d8cfc3] bg-[#faf8f5] px-2 py-1.5 text-xs text-[#333] outline-none"
                        >
                          {FONT_FAMILIES.map((f) => (
                            <option key={f.id} value={f.id}>
                              {f.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <span className="text-[11px] font-bold text-[#666]">
                          Size ({activeAdjustment.textOverlay?.fontSize || 18}px)
                        </span>
                        <input
                          type="range"
                          min="12"
                          max="36"
                          value={activeAdjustment.textOverlay?.fontSize || 18}
                          onChange={(e) =>
                            updateActiveTextOverlay({ fontSize: parseInt(e.target.value, 10) })
                          }
                          className="mt-2.5 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-[#dfd6c9] accent-[#1a3c36]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-[11px] font-bold text-[#666]">Position</span>
                        <div className="mt-1 grid grid-cols-3 gap-1">
                          {["top", "center", "bottom"].map((pos) => {
                            const isPos = (activeAdjustment.textOverlay?.position || "bottom") === pos;
                            return (
                              <button
                                key={pos}
                                type="button"
                                onClick={() => updateActiveTextOverlay({ position: pos })}
                                className={`rounded-lg border py-1 text-[10px] font-bold capitalize transition cursor-pointer ${
                                  isPos
                                    ? "border-[#1a3c36] bg-[#1a3c36] text-white"
                                    : "border-[#d8cfc3] bg-[#faf8f5] text-[#666]"
                                }`}
                              >
                                {pos}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div>
                        <span className="text-[11px] font-bold text-[#666]">Alignment</span>
                        <div className="mt-1 flex items-center gap-1">
                          {[
                            { id: "left", icon: AlignLeft },
                            { id: "center", icon: AlignCenter },
                            { id: "right", icon: AlignRight },
                          ].map((al) => {
                            const Icon = al.icon;
                            const isAl = (activeAdjustment.textOverlay?.align || "center") === al.id;
                            return (
                              <button
                                key={al.id}
                                type="button"
                                onClick={() => updateActiveTextOverlay({ align: al.id })}
                                className={`flex flex-1 items-center justify-center rounded-lg border py-1 text-xs transition cursor-pointer ${
                                  isAl
                                    ? "border-[#1a3c36] bg-[#1a3c36] text-white"
                                    : "border-[#d8cfc3] bg-[#faf8f5] text-[#666]"
                                }`}
                              >
                                <Icon className="h-3.5 w-3.5" />
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-[#f0e8dc] pt-2.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-bold text-[#666]">Color:</span>
                        {["#ffffff", "#18181b", "#d5a65a", "#e11d48", "#2563eb"].map((clr) => (
                          <button
                            key={clr}
                            type="button"
                            onClick={() => updateActiveTextOverlay({ color: clr })}
                            className={`h-5 w-5 rounded-full border cursor-pointer ${
                              (activeAdjustment.textOverlay?.color || "#ffffff") === clr
                                ? "ring-2 ring-[#1a3c36]"
                                : "border-[#ccc]"
                            }`}
                            style={{ backgroundColor: clr }}
                          />
                        ))}
                        <input
                          type="color"
                          value={activeAdjustment.textOverlay?.color || "#ffffff"}
                          onChange={(e) => updateActiveTextOverlay({ color: e.target.value })}
                          className="h-5 w-5 cursor-pointer rounded border-0 bg-transparent"
                        />
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() =>
                            updateActiveTextOverlay({ bold: !activeAdjustment.textOverlay?.bold })
                          }
                          className={`h-6 w-6 rounded border font-bold text-[11px] cursor-pointer ${
                            activeAdjustment.textOverlay?.bold
                              ? "bg-[#1a3c36] text-white"
                              : "bg-[#faf8f5] text-[#555]"
                          }`}
                        >
                          B
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            updateActiveTextOverlay({ italic: !activeAdjustment.textOverlay?.italic })
                          }
                          className={`h-6 w-6 rounded border italic text-[11px] cursor-pointer ${
                            activeAdjustment.textOverlay?.italic
                              ? "bg-[#1a3c36] text-white"
                              : "bg-[#faf8f5] text-[#555]"
                          }`}
                        >
                          I
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 3: CROP & PAN */}
                {activeStudioTab === "crop" && (
                  <div className="mt-4 space-y-4">
                    <div>
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-[#b07838]">
                          Zoom &amp; Scale ({activeSlot?.name || "Selected Pic"})
                        </h4>
                        <button
                          type="button"
                          onClick={() => {
                            const curr = photoAdjustments[activeSlot.id] || { panX: 0, panY: 0, scale: 1.0 };
                            const nextMode = (curr.fitMode || activeSlot.objectFit) === "contain" ? "cover" : "contain";
                            updateActiveAdjustment({ fitMode: nextMode, panX: 0, panY: 0, scale: 1.0 });
                            toast.success(nextMode === "contain" ? "Fit Full Image mode" : "Fill Frame mode");
                          }}
                          className="rounded-md border border-[#d8cfc3] bg-[#faf8f5] px-2 py-0.5 text-[10px] font-bold text-[#1a3c36] hover:bg-white cursor-pointer"
                        >
                          {(activeAdjustment.fitMode || activeSlot?.objectFit) === "contain" ? "Switch to Fill Frame" : "Switch to Fit Full"}
                        </button>
                      </div>

                      <div className="mt-2 flex items-center gap-3 rounded-2xl border border-[#ede4d8] bg-[#faf8f5] p-3.5">
                        <button
                          type="button"
                          onClick={() =>
                            updateActiveAdjustment({
                              scale: Math.max(1.0, Math.round(((activeAdjustment.scale || 1.0) - 0.1) * 10) / 10),
                            })
                          }
                          className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#d8cfc3] bg-white text-[#555] cursor-pointer"
                        >
                          <ZoomOut className="h-3.5 w-3.5" />
                        </button>
                        <input
                          type="range"
                          min="1.0"
                          max="3.0"
                          step="0.05"
                          value={activeAdjustment.scale || 1.0}
                          onChange={(e) =>
                            updateActiveAdjustment({ scale: parseFloat(e.target.value) })
                          }
                          className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-[#dfd6c9] accent-[#1a3c36]"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            updateActiveAdjustment({
                              scale: Math.min(3.0, Math.round(((activeAdjustment.scale || 1.0) + 0.1) * 10) / 10),
                            })
                          }
                          className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#d8cfc3] bg-white text-[#555] cursor-pointer"
                        >
                          <ZoomIn className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-12 font-mono text-xs font-bold text-[#1a3c36] text-right">
                          {Math.round((activeAdjustment.scale || 1.0) * 100)}%
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-[#eee5d8] pt-3 text-xs">
                      <span className="text-[11px] text-[#777]">
                        Pan: <strong className="font-mono text-[#333]">{activeAdjustment.panX || 0}%, {activeAdjustment.panY || 0}%</strong> (Drag directly on canvas)
                      </span>
                      <button
                        type="button"
                        onClick={() => updateActiveAdjustment({ panX: 0, panY: 0, scale: 1.0 })}
                        className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold text-[#888] hover:bg-[#f4efe8] hover:text-[#222] cursor-pointer"
                      >
                        <RotateCcw className="h-3 w-3" /> Reset
                      </button>
                    </div>
                  </div>
                )}

                {/* TAB 4: BORDERS */}
                {activeStudioTab === "borders" && (
                  <div className="mt-4 space-y-4">
                    {/* INNER MAT BORDER */}
                    <div>
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-xs font-bold uppercase tracking-wider text-[#b07838]">
                            Inner Border Color ({activeSlot?.name})
                          </h4>
                          <p className="text-[11px] text-[#777]">
                            Mat border surrounding this specific photo
                          </p>
                        </div>
                        <span className="font-mono text-xs font-bold text-[#1a3c36]">
                          {activeAdjustment.innerBorderWidth || 0}px
                        </span>
                      </div>

                      <input
                        type="range"
                        min="0"
                        max="30"
                        step="1"
                        value={activeAdjustment.innerBorderWidth || 0}
                        onChange={(e) =>
                          updateActiveAdjustment({ innerBorderWidth: parseInt(e.target.value, 10) })
                        }
                        className="mt-2 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-[#dfd6c9] accent-[#1a3c36]"
                      />

                      <div className="mt-2.5 flex flex-wrap items-center gap-2">
                        {INNER_BORDER_COLORS.map((c) => (
                          <button
                            key={c.value}
                            type="button"
                            onClick={() => {
                              updateActiveAdjustment({
                                innerBorderColor: c.value,
                                innerBorderWidth:
                                  c.value !== "transparent" && !activeAdjustment.innerBorderWidth
                                    ? 12
                                    : activeAdjustment.innerBorderWidth,
                              });
                            }}
                            title={c.label}
                            className={`h-7 w-7 rounded-full border-2 transition cursor-pointer ${
                              activeAdjustment.innerBorderColor === c.value
                                ? "border-[#1a3c36] scale-110 shadow"
                                : "border-[#ddd] hover:scale-105"
                            }`}
                            style={{
                              backgroundColor: c.value === "transparent" ? "#f0f0f0" : c.value,
                            }}
                          >
                            {c.value === "transparent" && <span className="text-[9px] text-[#888]">✕</span>}
                          </button>
                        ))}
                        <label className="flex h-7 items-center gap-1 rounded-full border border-[#d8cfc3] bg-white px-2 text-[10px] font-bold text-[#555] cursor-pointer">
                          <span>Custom</span>
                          <input
                            type="color"
                            value={activeAdjustment.innerBorderColor === "transparent" ? "#ffffff" : activeAdjustment.innerBorderColor || "#ffffff"}
                            onChange={(e) =>
                              updateActiveAdjustment({
                                innerBorderColor: e.target.value,
                                innerBorderWidth: activeAdjustment.innerBorderWidth || 12,
                              })
                            }
                            className="h-4 w-4 cursor-pointer rounded border-0 bg-transparent"
                          />
                        </label>
                      </div>
                    </div>

                    {/* OUTER BORDER */}
                    <div className="border-t border-[#f0e8dc] pt-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-xs font-bold uppercase tracking-wider text-[#b07838]">
                            Outer Border Color ({activeSlot?.name})
                          </h4>
                          <p className="text-[11px] text-[#777]">
                            Outer solid framing edge on this slot
                          </p>
                        </div>
                        <span className="font-mono text-xs font-bold text-[#1a3c36]">
                          {activeAdjustment.outerBorderWidth || 0}px
                        </span>
                      </div>

                      <input
                        type="range"
                        min="0"
                        max="30"
                        step="1"
                        value={activeAdjustment.outerBorderWidth || 0}
                        onChange={(e) =>
                          updateActiveAdjustment({ outerBorderWidth: parseInt(e.target.value, 10) })
                        }
                        className="mt-2 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-[#dfd6c9] accent-[#1a3c36]"
                      />

                      <div className="mt-2.5 flex flex-wrap items-center gap-2">
                        {OUTER_BORDER_COLORS.map((c) => (
                          <button
                            key={c.value}
                            type="button"
                            onClick={() => {
                              updateActiveAdjustment({
                                outerBorderColor: c.value,
                                outerBorderWidth:
                                  c.value !== "transparent" && !activeAdjustment.outerBorderWidth
                                    ? 12
                                    : activeAdjustment.outerBorderWidth,
                              });
                            }}
                            title={c.label}
                            className={`h-7 w-7 rounded-full border-2 transition cursor-pointer ${
                              activeAdjustment.outerBorderColor === c.value
                                ? "border-[#1a3c36] scale-110 shadow"
                                : "border-[#ddd] hover:scale-105"
                            }`}
                            style={{
                              backgroundColor: c.value === "transparent" ? "#f0f0f0" : c.value,
                            }}
                          >
                            {c.value === "transparent" && <span className="text-[9px] text-[#888]">✕</span>}
                          </button>
                        ))}
                        <label className="flex h-7 items-center gap-1 rounded-full border border-[#d8cfc3] bg-white px-2 text-[10px] font-bold text-[#555] cursor-pointer">
                          <span>Custom</span>
                          <input
                            type="color"
                            value={activeAdjustment.outerBorderColor === "transparent" ? "#18181b" : activeAdjustment.outerBorderColor || "#18181b"}
                            onChange={(e) =>
                              updateActiveAdjustment({
                                outerBorderColor: e.target.value,
                                outerBorderWidth: activeAdjustment.outerBorderWidth || 12,
                              })
                            }
                            className="h-4 w-4 cursor-pointer rounded border-0 bg-transparent"
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 5: ROTATE */}
                {activeStudioTab === "rotate" && (
                  <div className="mt-4 space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#b07838]">
                      Rotate &amp; Flip ({activeSlot?.name})
                    </h4>
                    <div className="grid grid-cols-2 gap-2.5">
                      <button
                        type="button"
                        onClick={() =>
                          updateActiveAdjustment({
                            rotate: (((activeAdjustment.rotate || 0) - 90 + 360) % 360),
                          })
                        }
                        className="flex items-center justify-center gap-2 rounded-xl border border-[#d8cfc3] bg-[#faf8f5] p-3 text-xs font-bold text-[#1d2925] hover:bg-[#f0ebe3] transition cursor-pointer"
                      >
                        <RotateCcw className="h-4 w-4 text-[#b07838]" /> Left 90°
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          updateActiveAdjustment({
                            rotate: (((activeAdjustment.rotate || 0) + 90) % 360),
                          })
                        }
                        className="flex items-center justify-center gap-2 rounded-xl border border-[#d8cfc3] bg-[#faf8f5] p-3 text-xs font-bold text-[#1d2925] hover:bg-[#f0ebe3] transition cursor-pointer"
                      >
                        <RotateCw className="h-4 w-4 text-[#b07838]" /> Right 90°
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <button
                        type="button"
                        onClick={() => updateActiveAdjustment({ flipH: !activeAdjustment.flipH })}
                        className={`flex items-center justify-center gap-2 rounded-xl border p-2.5 text-xs font-bold transition cursor-pointer ${
                          activeAdjustment.flipH
                            ? "border-[#1a3c36] bg-[#1a3c36] text-white"
                            : "border-[#d8cfc3] bg-[#faf8f5] text-[#1d2925] hover:bg-[#f0ebe3]"
                        }`}
                      >
                        <FlipHorizontal className="h-4 w-4" /> Flip Horizontal
                      </button>
                      <button
                        type="button"
                        onClick={() => updateActiveAdjustment({ flipV: !activeAdjustment.flipV })}
                        className={`flex items-center justify-center gap-2 rounded-xl border p-2.5 text-xs font-bold transition cursor-pointer ${
                          activeAdjustment.flipV
                            ? "border-[#1a3c36] bg-[#1a3c36] text-white"
                            : "border-[#d8cfc3] bg-[#faf8f5] text-[#1d2925] hover:bg-[#f0ebe3]"
                        }`}
                      >
                        <FlipVertical className="h-4 w-4" /> Flip Vertical
                      </button>
                    </div>
                  </div>
                )}

                {/* COMPACT SLOT UPLOAD PROGRESS CHECKLIST */}
                <div className="mt-5 border-t border-[#f0e8dc] pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#9b6b2d]">
                        Frame Positions Checklist
                      </h4>
                      <p className="text-[11px] text-[#666]">
                        {customPhotoCount === totalSlotsCount
                          ? "All slots customized! Ready to order."
                          : `Uploaded ${customPhotoCount} of ${totalSlotsCount} required photos`}
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
                    <div className="mt-2.5">
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

                  {/* SLOT TILES */}
                  <div className="mt-3 space-y-2">
                    {photoSlots.map((slot, index) => {
                      const userPhoto = customerPhotos[slot.id];
                      const isUploading = uploadingSlot === slot.id;
                      const isEditing = activeSlotId === slot.id;

                      return (
                        <div
                          key={slot.id || index}
                          onClick={() => setActiveSlotId(slot.id)}
                          className={`flex items-center gap-3 rounded-xl border p-2 shadow-xs transition cursor-pointer ${
                            isEditing
                              ? "border-[#1a3c36] bg-[#f0f7f4] ring-2 ring-[#1a3c36]/20"
                              : userPhoto
                              ? "border-[#cce8db] bg-[#f9fdfa] hover:bg-white"
                              : highlightMissingSlots
                              ? "border-red-300 bg-white ring-2 ring-red-200"
                              : "border-[#ede3d5] bg-white hover:bg-[#faf8f5]"
                          }`}
                        >
                          <div className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#eee7de]">
                            {userPhoto ? (
                              <img
                                src={userPhoto}
                                alt={slot.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <ImagePlus className={`h-4 w-4 ${highlightMissingSlots ? "text-red-400" : "text-[#b9aa98]"}`} />
                            )}
                            {userPhoto && (
                              <div className="absolute right-0.5 top-0.5 flex h-3 w-3 items-center justify-center rounded-full bg-[#1b794b] text-white shadow">
                                <Check className="h-2 w-2" />
                              </div>
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <p className="truncate text-xs font-bold text-[#333]">
                                {slot.name || `Photo Position ${index + 1}`}
                              </p>
                              {isEditing && (
                                <span className="rounded bg-[#1a3c36] px-1.5 py-0.2 text-[9px] font-bold text-white">
                                  Active
                                </span>
                              )}
                            </div>
                            <div className="mt-0.5 flex items-center gap-1.5">
                              {userPhoto ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#1b794b]">
                                  <CheckCircle2 className="h-2.5 w-2.5" /> Photo Attached
                                </span>
                              ) : (
                                <span className={`inline-flex items-center gap-1 text-[10px] font-semibold ${
                                  highlightMissingSlots ? "text-red-600" : "text-amber-700"
                                }`}>
                                  <AlertCircle className="h-2.5 w-2.5" /> Photo Required
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveSlotId(slot.id);
                                fileInputRefs.current[slot.id]?.click();
                              }}
                              disabled={isUploading}
                              className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-bold transition disabled:opacity-50 cursor-pointer ${
                                userPhoto
                                  ? "border border-[#d8cfc3] bg-[#faf8f5] text-[#333] hover:bg-white"
                                  : "border border-[#b07838] bg-[#fff8ef] text-[#9b6b2d] hover:bg-[#ffeed7] shadow-xs"
                              }`}
                            >
                              <UploadCloud className="h-3 w-3" />
                              {isUploading ? "..." : userPhoto ? "Change" : "Upload"}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
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
      </PageContainer>

      {relatedProducts.length > 0 && (
        <PageContainer className="pb-16 pt-2">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#b07838]">More to frame</p>
              <h2 className="mt-1 text-2xl font-black text-[#1d2925]">Related photo frames</h2>
            </div>
            <Link to="/frames" className="text-xs font-bold text-[#1a3c36] hover:text-[#b07838]">
              View all frames
            </Link>
          </div>

          <Swiper
            modules={[Navigation]}
            navigation
            spaceBetween={20}
            slidesPerView={1.15}
            breakpoints={{
              640: { slidesPerView: 2 },
              768: { slidesPerView: 3 },
              1024: { slidesPerView: 4 },
              1280: { slidesPerView: 5 },
            }}
            className="!overflow-visible"
          >
            {relatedProducts.map((relatedProduct) => (
              <SwiperSlide key={relatedProduct.id} className="!h-auto">
                <ProductCard product={relatedProduct} />
              </SwiperSlide>
            ))}
          </Swiper>
        </PageContainer>
      )}

      {/* ================= CUSTOMIZATION CONFIRMATION MODAL ================= */}
      {isConfirmModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs overflow-y-auto"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative my-4 flex max-h-[calc(100vh-2rem)] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-[#ebdcc8] bg-white p-6 shadow-2xl md:my-8 md:p-8">
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
            <div className="mt-5 min-h-0 flex-1 space-y-5 overflow-y-auto pr-1">
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
      {Boolean(adjustingSlot) && (
        <PhotoAdjustModal
          isOpen={Boolean(adjustingSlot)}
          onClose={() => setAdjustingSlot(null)}
          photoSrc={
            customerPhotos[adjustingSlot.id] || product?.slot_photos?.[adjustingSlot.id]
          }
          slot={adjustingSlot}
          initialAdjustment={{
            panX: 0,
            panY: 0,
            scale: 1.0,
            fitMode: adjustingSlot.objectFit || "cover",
            ...(photoAdjustments[adjustingSlot.id] || {}),
          }}
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
      )}

    </main>
  );
};

export default ProductDetails;
