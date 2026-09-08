import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  ArrowRight,
  Bold,
  Check,
  CheckCircle2,
  Crop,
  Download,
  Eye,
  FlipHorizontal,
  FlipVertical,
  Frame,
  Image as ImageIcon,
  ImagePlus,
  Italic,
  Layers,
  Move,
  Package,
  Palette,
  Plus,
  RotateCcw,
  RotateCw,
  ShoppingBag,
  ShoppingCart,
  Sliders,
  Sparkles,
  Type,
  UploadCloud,
  Wand2,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../../api";
import { StoreContext } from "../../PrivateRouter/StoreContext";
import { useAuth } from "../../PrivateRouter/AuthContext";
import toast from "react-hot-toast";
import CheckoutModal from "../Checkout/CheckoutModal";
import PageHeader from "../../CommonComponents/PageHeader";
import PageContainer from "../../CommonComponents/PageContainer";
import {
  ASPECT_RATIOS,
  DEFAULT_ADJUSTMENT,
  FILTER_PRESETS,
  FONT_FAMILIES,
  INNER_BORDER_COLORS,
  OUTER_BORDER_COLORS,
} from "../../CommonComponents/PhotoAdjustModal";

// Default Size Options with Dimensions & Base Prices
const DEFAULT_SIZES = [
  { id: "6x8", name: "6\" x 8\"", label: "Mini Desk Frame", price: 499, mrp: 699, scale: 0.8 },
  { id: "8x10", name: "8\" x 10\"", label: "Standard Tabletop", price: 799, mrp: 1099, scale: 1.0 },
  { id: "12x18", name: "12\" x 18\"", label: "Classic Wall Frame", price: 1299, mrp: 1799, scale: 1.3 },
  { id: "16x24", name: "16\" x 24\"", label: "Large Gallery Frame", price: 1899, mrp: 2499, scale: 1.6 },
  { id: "20x30", name: "20\" x 30\"", label: "Statement Masterpiece", price: 2699, mrp: 3499, scale: 2.0 },
];

// Sample showcase images for users who want to try before uploading
const SAMPLE_PHOTOS = [
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80",
];

const parsePercentage = (val, total = 100) => {
  if (typeof val === "string" && val.includes("%")) {
    return (parseFloat(val) / 100) * total;
  }
  return parseFloat(val) || 0;
};

const CustomFrameStudio = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useContext(StoreContext) || {};

  // Studio tabs: 'photo' | 'borders' | 'rotate' | 'filters' | 'effects' | 'text' | 'size'
  const [activeTab, setActiveTab] = useState("filters");

  // Catalog items
  const [framesList, setFramesList] = useState([]);
  const [productsList, setProductsList] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedFrame, setSelectedFrame] = useState(null);
  const [loadingData, setLoadingData] = useState(true);

  // Slots & Multi-Photo state
  const [photoSlots, setPhotoSlots] = useState([]);
  const [activeSlotId, setActiveSlotId] = useState(null);
  const [customerPhotos, setCustomerPhotos] = useState({});
  const [photoAdjustments, setPhotoAdjustments] = useState({});
  const [uploadingSlotId, setUploadingSlotId] = useState(null);

  // View state: 'studio' | 'wall'
  const [viewMode, setViewMode] = useState("studio");

  // Size & Order state
  const [selectedSizeIndex, setSelectedSizeIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [addingToCartState, setAddingToCartState] = useState(false);

  // Drag interaction
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0, startPanX: 0, startPanY: 0 });
  const fileInputRefs = useRef({});

  // 1. Fetch products & frame templates on mount / when searchParams change
  useEffect(() => {
    const loadStudioData = async () => {
      try {
        setLoadingData(true);
        const [framesRes, prodsRes] = await Promise.all([
          api.get("/frames").catch(() => ({ data: { data: [] } })),
          api.get("/products").catch(() => ({ data: { data: [] } })),
        ]);

        const rawFrames = Array.isArray(framesRes.data?.data) ? framesRes.data.data : [];
        const activeFrames = rawFrames.filter((f) => (f.status || "Active") === "Active");
        setFramesList(activeFrames);

        const rawProds = Array.isArray(prodsRes.data?.data) ? prodsRes.data.data : [];
        const activeProds = rawProds.filter((p) => (p.status || "Active") === "Active");
        setProductsList(activeProds);

        const queryProdId = searchParams.get("productId");
        const queryFrameId = searchParams.get("frameId");

        let targetProduct = null;
        let targetFrame = null;

        if (queryProdId) {
          try {
            const singleProdRes = await api.get(`/products/${queryProdId}`);
            if (singleProdRes.data?.data) {
              targetProduct = singleProdRes.data.data;
            }
          } catch (e) {
            targetProduct = activeProds.find((p) => String(p.id) === String(queryProdId));
          }
        }

        if (!targetProduct && queryFrameId) {
          targetFrame = activeFrames.find(
            (f) => String(f.id) === String(queryFrameId) || String(f.uuid) === String(queryFrameId)
          );
        }

        // Default to first product if none specified
        if (!targetProduct && !targetFrame && activeProds.length > 0) {
          targetProduct = activeProds[0];
        }

        if (targetProduct) {
          setSelectedProduct(targetProduct);
          const fData = targetProduct.frame_data || {};
          setSelectedFrame(fData);

          const slots = Array.isArray(fData.photo_slots) && fData.photo_slots.length > 0
            ? fData.photo_slots
            : [
                {
                  id: "slot_1",
                  name: "Main Photo",
                  top: "10%",
                  left: "10%",
                  width: "80%",
                  height: "80%",
                  shape: "rectangle",
                  objectFit: "cover",
                },
              ];
          setPhotoSlots(slots);
          setActiveSlotId(slots[0]?.id || "slot_1");

          // Preload slot photos
          const initialPhotos = {};
          const initialAdjustments = {};

          slots.forEach((s, i) => {
            const existingPhoto =
              targetProduct.slot_photos?.[s.id] ||
              targetProduct.product_images?.[i] ||
              SAMPLE_PHOTOS[i % SAMPLE_PHOTOS.length];
            initialPhotos[s.id] = existingPhoto;

            initialAdjustments[s.id] = {
              ...DEFAULT_ADJUSTMENT,
              ...(targetProduct.slot_adjustments?.[s.id] ||
                targetProduct.frame_data?.slot_adjustments?.[s.id] ||
                {}),
            };
          });

          setCustomerPhotos(initialPhotos);
          setPhotoAdjustments(initialAdjustments);
        } else if (targetFrame) {
          setSelectedFrame(targetFrame);
          const slots = Array.isArray(targetFrame.photo_slots) && targetFrame.photo_slots.length > 0
            ? targetFrame.photo_slots
            : [
                {
                  id: "slot_1",
                  name: "Main Photo",
                  top: "10%",
                  left: "10%",
                  width: "80%",
                  height: "80%",
                  shape: "rectangle",
                  objectFit: "cover",
                },
              ];
          setPhotoSlots(slots);
          setActiveSlotId(slots[0]?.id || "slot_1");

          const initialPhotos = {};
          const initialAdjustments = {};
          slots.forEach((s, i) => {
            initialPhotos[s.id] = SAMPLE_PHOTOS[i % SAMPLE_PHOTOS.length];
            initialAdjustments[s.id] = { ...DEFAULT_ADJUSTMENT };
          });
          setCustomerPhotos(initialPhotos);
          setPhotoAdjustments(initialAdjustments);
        }
      } catch (err) {
        console.error("Studio data loading error:", err);
        toast.error("Failed to load frame data");
      } finally {
        setLoadingData(false);
      }
    };

    loadStudioData();
  }, [searchParams]);

  // Active Slot & Adjustment Accessors
  const activeSlot = useMemo(() => {
    return photoSlots.find((s) => s.id === activeSlotId) || photoSlots[0] || null;
  }, [photoSlots, activeSlotId]);

  const activeAdjustment = useMemo(() => {
    if (!activeSlotId) return DEFAULT_ADJUSTMENT;
    return photoAdjustments[activeSlotId] || DEFAULT_ADJUSTMENT;
  }, [photoAdjustments, activeSlotId]);

  const activePhotoSrc = useMemo(() => {
    if (!activeSlotId) return "";
    return customerPhotos[activeSlotId] || "";
  }, [customerPhotos, activeSlotId]);

  // Helper to mutate adjustment for the ACTIVE slot only
  const updateActiveAdjustment = (updates) => {
    if (!activeSlotId) return;
    setPhotoAdjustments((prev) => ({
      ...prev,
      [activeSlotId]: {
        ...(prev[activeSlotId] || DEFAULT_ADJUSTMENT),
        ...updates,
      },
    }));
  };

  // Helper to update text overlay for the ACTIVE slot only
  const updateActiveTextOverlay = (textUpdates) => {
    if (!activeSlotId) return;
    setPhotoAdjustments((prev) => {
      const currentAdj = prev[activeSlotId] || DEFAULT_ADJUSTMENT;
      return {
        ...prev,
        [activeSlotId]: {
          ...currentAdj,
          textOverlay: {
            ...(currentAdj.textOverlay || DEFAULT_ADJUSTMENT.textOverlay),
            ...textUpdates,
          },
        },
      };
    });
  };

  // Handle Uploading a photo specifically for a slot
  const handleSlotUpload = async (slotId, event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file (JPG, PNG, WebP).");
      return;
    }

    setUploadingSlotId(slotId);
    const formData = new FormData();
    formData.append("folder", "customizations");
    formData.append("file", file);

    try {
      const res = await api.post("/upload", formData);
      const url = res.data?.url || res.data?.urls?.[0];
      if (!url) throw new Error("No URL returned from upload");

      setCustomerPhotos((prev) => ({
        ...prev,
        [slotId]: url,
      }));
      // Reset pan/zoom for freshly uploaded photo
      updateActiveAdjustment({ panX: 0, panY: 0, scale: 1.0 });
      toast.success(`Photo uploaded to ${photoSlots.find((s) => s.id === slotId)?.name || "slot"}!`);
    } catch (err) {
      console.error("Photo upload error:", err);
      toast.error("Upload failed, using local preview.");
      const localUrl = URL.createObjectURL(file);
      setCustomerPhotos((prev) => ({
        ...prev,
        [slotId]: localUrl,
      }));
    } finally {
      setUploadingSlotId(null);
      event.target.value = "";
    }
  };

  // Drag-to-pan handlers on active slot photo
  const handlePointerDown = (e) => {
    if (!activeSlotId) return;
    e.preventDefault();
    setIsDragging(true);
    const curr = activeAdjustment;
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      startPanX: curr.panX || 0,
      startPanY: curr.panY || 0,
    };
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch (err) {}
  };

  const handlePointerMove = (e) => {
    if (!isDragging || !activeSlotId) return;
    e.preventDefault();

    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;

    const deltaPercentX = (dx / 240) * 100;
    const deltaPercentY = (dy / 240) * 100;

    const maxPan = Math.max(50, ((activeAdjustment.scale || 1.0) - 1) * 70 + 50);

    const newPanX = Math.min(
      maxPan,
      Math.max(-maxPan, dragStartRef.current.startPanX + deltaPercentX)
    );
    const newPanY = Math.min(
      maxPan,
      Math.max(-maxPan, dragStartRef.current.startPanY + deltaPercentY)
    );

    updateActiveAdjustment({
      panX: Math.round(newPanX * 10) / 10,
      panY: Math.round(newPanY * 10) / 10,
    });
  };

  const handlePointerUp = (e) => {
    setIsDragging(false);
    try {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    } catch (err) {}
  };

  const handleWheel = (e) => {
    if (!activeSlotId) return;
    e.preventDefault();
    const zoomStep = 0.08;
    const currentScale = activeAdjustment.scale || 1.0;
    const newScale =
      e.deltaY < 0 ? Math.min(3.0, currentScale + zoomStep) : Math.max(1.0, currentScale - zoomStep);
    updateActiveAdjustment({ scale: Math.round(newScale * 100) / 100 });
  };

  // Helper to build CSS filter string for any slot adjustment
  const getSlotFilterCss = (adj = {}) => {
    const parts = [];
    const filterId = adj.filter || "normal";
    const preset = FILTER_PRESETS.find((p) => p.id === filterId);
    if (preset && preset.id !== "normal") {
      parts.push(preset.filterCss);
    }
    const br = adj.brightness ?? 100;
    const ct = adj.contrast ?? 100;
    const sat = adj.saturation ?? 100;
    const blur = adj.blur || 0;
    const sh = adj.sharpness || 0;

    if (br !== 100) parts.push(`brightness(${br}%)`);
    if (ct !== 100) parts.push(`contrast(${ct}%)`);
    if (sat !== 100) parts.push(`saturate(${sat}%)`);
    if (blur > 0) parts.push(`blur(${blur}px)`);
    if (sh > 0) parts.push(`contrast(${100 + Math.round(sh * 0.4)}%)`);

    return parts.length > 0 ? parts.join(" ") : "none";
  };

  // Helper to build CSS transform string for any slot adjustment
  const getSlotTransformCss = (adj = {}) => {
    const px = adj.panX || 0;
    const py = adj.panY || 0;
    const sc = adj.scale || 1.0;
    const rot = ((adj.rotate || 0) + (adj.angle || 0)) % 360;
    const fh = Boolean(adj.flipH);
    const fv = Boolean(adj.flipV);

    return `translate(calc(-50% + ${px}%), calc(-50% + ${py}%)) scale(${sc}) rotate(${rot}deg) scaleX(${
      fh ? -1 : 1
    }) scaleY(${fv ? -1 : 1})`;
  };

  // Size variants and live pricing
  const currentSizes = selectedProduct?.size_variants?.length
    ? selectedProduct.size_variants.map((v, i) => ({
        id: `v-${i}`,
        name: v.size || `Size ${i + 1}`,
        label: v.size ? `${v.size} Standard` : "Custom Size",
        price: Number(v.offer_price || v.mrp || 899),
        mrp: Number(v.mrp || (v.offer_price ? v.offer_price * 1.3 : 1199)),
      }))
    : DEFAULT_SIZES;

  const activeSize = currentSizes[selectedSizeIndex] || currentSizes[0];
  const currentUnitPrice = Number(activeSize.price || 799);
  const currentTotalAmount = currentUnitPrice * quantity;

  // Generate High-Res Composite Canvas Image for whole frame with all slots
  const generateHighResCompositeBlobAndUrl = () => {
    return new Promise((resolve) => {
      const frameImgSrc = selectedFrame?.frame_image || selectedProduct?.product_images?.[0];
      const baseDim = 1200;

      const finishDrawing = (canvas) => {
        const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
        canvas.toBlob((blob) => resolve({ blob, dataUrl }), "image/jpeg", 0.92);
      };

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (frameImgSrc) {
        const fImg = new Image();
        fImg.crossOrigin = "anonymous";
        fImg.src = frameImgSrc;

        fImg.onload = async () => {
          const cw = fImg.naturalWidth || baseDim;
          const ch = fImg.naturalHeight || baseDim;
          canvas.width = cw;
          canvas.height = ch;

          // 1. Draw Frame background image
          ctx.drawImage(fImg, 0, 0, cw, ch);

          // 2. Draw each individual slot
          for (const slot of photoSlots) {
            const pSrc = customerPhotos[slot.id];
            if (!pSrc) continue;

            const adj = photoAdjustments[slot.id] || DEFAULT_ADJUSTMENT;

            await new Promise((slotResolve) => {
              const pImg = new Image();
              pImg.crossOrigin = "anonymous";
              pImg.src = pSrc;

              pImg.onload = () => {
                ctx.save();
                const sx = parsePercentage(slot.left, cw);
                const sy = parsePercentage(slot.top, ch);
                const sw = parsePercentage(slot.width, cw);
                const sh = parsePercentage(slot.height, ch);

                // Slot clipping
                ctx.beginPath();
                const radius = Math.min(14, Math.min(sw, sh) * 0.05);
                if (slot.shape === "circle") {
                  ctx.arc(sx + sw / 2, sy + sh / 2, Math.min(sw, sh) / 2, 0, Math.PI * 2);
                } else {
                  if (ctx.roundRect) ctx.roundRect(sx, sy, sw, sh, radius);
                  else ctx.rect(sx, sy, sw, sh);
                }
                ctx.closePath();
                ctx.clip();

                // Inner mat border background & padding
                const inWidth = adj.innerBorderWidth ? Math.round((adj.innerBorderWidth / 320) * sw) : 0;
                const inColor = adj.innerBorderColor && adj.innerBorderColor !== "transparent" ? adj.innerBorderColor : null;
                const outWidth = adj.outerBorderWidth ? Math.round((adj.outerBorderWidth / 320) * sw) : 0;
                const outColor = adj.outerBorderColor && adj.outerBorderColor !== "transparent" ? adj.outerBorderColor : null;

                if (inColor) {
                  ctx.fillStyle = inColor;
                  ctx.fillRect(sx, sy, sw, sh);
                }

                const psx = sx + inWidth;
                const psy = sy + inWidth;
                const psw = Math.max(10, sw - inWidth * 2);
                const psh = Math.max(10, sh - inWidth * 2);

                ctx.save();
                ctx.beginPath();
                if (slot.shape === "circle") {
                  ctx.arc(psx + psw / 2, psy + psh / 2, Math.min(psw, psh) / 2, 0, Math.PI * 2);
                } else {
                  const innerRad = Math.max(0, radius - inWidth * 0.5);
                  if (ctx.roundRect) ctx.roundRect(psx, psy, psw, psh, innerRad);
                  else ctx.rect(psx, psy, psw, psh);
                }
                ctx.closePath();
                ctx.clip();

                // Object-fit calculations
                const imgRatio = pImg.naturalWidth / pImg.naturalHeight;
                const slotRatio = psw / psh;
                let dw = psw;
                let dh = psh;

                if (slot.objectFit === "contain") {
                  if (imgRatio > slotRatio) {
                    dw = psw;
                    dh = psw / imgRatio;
                  } else {
                    dh = psh;
                    dw = psh * imgRatio;
                  }
                } else {
                  if (imgRatio > slotRatio) {
                    dh = psh;
                    dw = psh * imgRatio;
                  } else {
                    dw = psw;
                    dh = psw / imgRatio;
                  }
                }

                const sc = adj.scale || 1.0;
                dw = dw * sc;
                dh = dh * sc;
                const dx = psx + (psw - dw) / 2 + ((adj.panX || 0) / 100) * psw;
                const dy = psy + (psh - dh) / 2 + ((adj.panY || 0) / 100) * psh;

                // Slot-specific Canvas filters
                const filterParts = [];
                const fid = adj.filter || "normal";
                if (fid === "bw") filterParts.push("grayscale(100%) contrast(110%)");
                else if (fid === "sepia") filterParts.push("sepia(85%) contrast(95%)");
                else if (fid === "warm") filterParts.push("sepia(25%) saturate(140%) brightness(105%)");
                else if (fid === "cool") filterParts.push("hue-rotate(185deg) saturate(90%) brightness(105%)");
                else if (fid === "vintage") filterParts.push("sepia(35%) contrast(120%) brightness(90%) saturate(120%)");
                else if (fid === "vivid") filterParts.push("saturate(160%) contrast(115%) brightness(102%)");
                else if (fid === "dramatic") filterParts.push("contrast(140%) brightness(90%) saturate(110%)");
                else if (fid === "fade") filterParts.push("contrast(85%) brightness(110%) saturate(85%)");

                const br = adj.brightness ?? 100;
                const ct = (adj.contrast ?? 100) + Math.round((adj.sharpness || 0) * 0.4);
                const sat = adj.saturation ?? 100;
                const blur = adj.blur || 0;

                if (br !== 100) filterParts.push(`brightness(${br}%)`);
                if (ct !== 100) filterParts.push(`contrast(${ct}%)`);
                if (sat !== 100) filterParts.push(`saturate(${sat}%)`);
                if (blur > 0) filterParts.push(`blur(${Math.max(1, Math.round(blur * (cw / 1000)))}px)`);

                if (filterParts.length > 0 && ctx.filter) {
                  ctx.filter = filterParts.join(" ");
                }

                // Slot-specific Rotation and Flip
                const totalRot = ((adj.rotate || 0) + (adj.angle || 0)) % 360;
                const flipH = Boolean(adj.flipH);
                const flipV = Boolean(adj.flipV);

                ctx.save();
                ctx.translate(dx + dw / 2, dy + dh / 2);
                if (totalRot !== 0) ctx.rotate((totalRot * Math.PI) / 180);
                if (flipH || flipV) ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
                ctx.drawImage(pImg, -dw / 2, -dh / 2, dw, dh);
                ctx.restore();
                ctx.filter = "none";
                ctx.restore(); // Restore inner clip

                // Draw Outer border stroke
                if (outColor && outWidth > 0) {
                  ctx.strokeStyle = outColor;
                  ctx.lineWidth = outWidth;
                  ctx.stroke();
                }

                // Draw Slot-specific Text Overlay
                if (adj.textOverlay?.text) {
                  ctx.save();
                  const fontSz = Math.max(14, Math.round(((adj.textOverlay.fontSize || 18) / 320) * sw));
                  const isB = adj.textOverlay.bold ? "bold " : "";
                  const isI = adj.textOverlay.italic ? "italic " : "";
                  ctx.font = `${isB}${isI}${fontSz}px ${adj.textOverlay.fontFamily || "sans-serif"}`;
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

          finishDrawing(canvas);
        };

        fImg.onerror = () => {
          canvas.width = baseDim;
          canvas.height = baseDim;
          finishDrawing(canvas);
        };
      } else {
        canvas.width = baseDim;
        canvas.height = baseDim;
        finishDrawing(canvas);
      }
    });
  };

  // Download high-resolution custom frame
  const handleDownload = async () => {
    toast.loading("Rendering high-resolution custom frame...", { id: "dl-frame" });
    const { dataUrl } = await generateHighResCompositeBlobAndUrl();
    if (dataUrl) {
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `custom-frame-${Date.now()}.jpg`;
      a.click();
      toast.success("Frame image downloaded!", { id: "dl-frame" });
    } else {
      toast.error("Could not download frame image.", { id: "dl-frame" });
    }
  };

  // Add customized frame to cart
  const handleAddToCart = async () => {
    setAddingToCartState(true);
    try {
      const activeUserId =
        user?.user_id || user?.id || localStorage.getItem("frame_shop_guest_id") || "guest";

      let compositeUrl = selectedProduct?.product_images?.[0] || selectedFrame?.frame_image || null;
      const { blob, dataUrl } = await generateHighResCompositeBlobAndUrl();

      if (blob) {
        const formData = new FormData();
        formData.append("folder", "customizations");
        formData.append("file", blob, `custom-frame-${Date.now()}.jpg`);
        try {
          const upRes = await api.post("/upload", formData);
          const u = upRes.data?.url || upRes.data?.urls?.[0];
          if (u) compositeUrl = u;
        } catch (e) {
          compositeUrl = dataUrl || compositeUrl;
        }
      }

      const custId = `CUST-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
      const targetProduct = selectedProduct || {
        id: 9999,
        product_name: "Custom Bespoke Studio Frame",
        category: "Custom Frame",
        price: currentUnitPrice,
      };

      // Save customization
      await api.post("/customizations", {
        customization_id: custId,
        user_id: activeUserId,
        product_id: targetProduct.id,
        slot_photos: customerPhotos,
        photo_adjustments: photoAdjustments,
        preview_image: compositeUrl,
      }).catch((err) => console.warn("Save customization note:", err));

      if (addToCart) {
        await addToCart(targetProduct, {
          size: activeSize.name,
          price: currentUnitPrice,
          quantity: quantity,
          customization_id: custId,
          slot_photos: customerPhotos,
          preview_image: compositeUrl,
        });
      } else {
        toast.success("Added custom frame to cart!");
      }
    } catch (err) {
      console.error("Add to cart error:", err);
      toast.error("Could not add to cart. Please try again.");
    } finally {
      setAddingToCartState(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f7f3ed]">
      <PageHeader title="Custom Frame Studio" />
      <PageContainer className="py-8 sm:py-10">
        {/* STUDIO HEADER */}
        <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.24em] text-[#b07838]">
              <Sparkles className="h-4 w-4 text-[#d5a65a]" />
              <span>Multi-Photo Frame Customizer</span>
            </div>
            <h1 className="mt-1 text-2xl sm:text-3xl font-black tracking-tight text-[#1d2925]">
              {selectedProduct?.product_name || selectedFrame?.frame_name || "Custom Frame Studio"}
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-[#6b6b63]">
              Personalize every single photo position inside your frame with its own text, brightness, color filters, borders, crop &amp; effects.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setViewMode((m) => (m === "studio" ? "wall" : "studio"))}
              className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-xs font-bold transition shadow-xs ${
                viewMode === "wall"
                  ? "border-[#1a3c36] bg-[#1a3c36] text-white"
                  : "border-[#d8cfc3] bg-white text-[#1d2925] hover:bg-[#faf8f5]"
              }`}
            >
              <Eye className="h-4 w-4 text-[#b07838]" />
              <span>{viewMode === "wall" ? "Studio View" : "Wall Visualizer"}</span>
            </button>

            <button
              type="button"
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 rounded-full border border-[#d8cfc3] bg-white px-4 py-2 text-xs font-bold text-[#1d2925] hover:bg-[#faf8f5] shadow-xs transition"
              title="Download high-resolution custom frame image"
            >
              <Download className="h-4 w-4 text-[#b07838]" />
              <span>Download High-Res</span>
            </button>
          </div>
        </div>

        {/* WORKSPACE GRID */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* ================= LEFT / CENTER: INTERACTIVE FRAME STAGE ================= */}
          <div className="lg:col-span-7 flex flex-col items-center">
            {/* FRAME VIEWER CONTAINER */}
            <div
              className={`relative flex w-full flex-col items-center justify-center overflow-hidden rounded-3xl border border-[#e5ded4] p-4 sm:p-8 transition-all duration-300 ${
                viewMode === "wall"
                  ? "min-h-[520px] bg-cover bg-center shadow-inner"
                  : "min-h-[480px] bg-[#191b1a] shadow-2xl"
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
              {/* WALL MODE SUBTITLE */}
              {viewMode === "wall" && (
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 border-t border-[#d8cfc3] bg-[#e4dacd]/60 backdrop-blur-xs flex items-center justify-center text-[11px] font-bold text-[#888]">
                  Wall Hanging Simulation • Living Room Ambient Lighting
                </div>
              )}

              {/* MAIN FRAME & SLOTS COMPOSITION */}
              <div
                className="relative mx-auto w-full max-w-[480px] overflow-hidden rounded-xl shadow-2xl transition duration-300 select-none"
                style={{
                  backgroundColor: "#ffffff",
                }}
              >
                {/* 1. FRAME BACKGROUND IMAGE (E.G. MOM FRAME TEMPLATE) */}
                {selectedFrame?.frame_image ? (
                  <img
                    src={selectedFrame.frame_image}
                    alt={selectedFrame.frame_name || "Frame template"}
                    className="block h-auto w-full select-none"
                  />
                ) : (
                  <div
                    className="flex aspect-[3/4] w-full items-center justify-center bg-[#fdfbf7] p-4"
                    style={{
                      border: "16px solid #18181b",
                    }}
                  />
                )}

                {/* 2. MULTI-PHOTO SLOTS OVERLAY */}
                {photoSlots.map((slot, idx) => {
                  const isActive = activeSlotId === slot.id;
                  const photo = customerPhotos[slot.id];
                  const adj = photoAdjustments[slot.id] || DEFAULT_ADJUSTMENT;
                  const isCircle = slot.shape === "circle";

                  const filterCss = getSlotFilterCss(adj);
                  const transformCss = getSlotTransformCss(adj);

                  return (
                    <React.Fragment key={slot.id || idx}>
                      {/* Hidden File Input for this Slot */}
                      <input
                        ref={(el) => {
                          fileInputRefs.current[slot.id] = el;
                        }}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleSlotUpload(slot.id, e)}
                      />

                      {/* Photo Slot Box */}
                      <div
                        onClick={() => setActiveSlotId(slot.id)}
                        className={`group absolute overflow-hidden transition-all duration-150 cursor-pointer ${
                          isActive
                            ? "ring-4 ring-[#1a3c36] ring-offset-2 ring-offset-white z-30 shadow-2xl"
                            : "hover:ring-2 hover:ring-[#b07838] z-10"
                        }`}
                        style={{
                          top: slot.top,
                          left: slot.left,
                          width: slot.width,
                          height: slot.height,
                          borderRadius: isCircle ? "9999px" : "4px",
                          backgroundColor:
                            adj.innerBorderColor && adj.innerBorderColor !== "transparent"
                              ? adj.innerBorderColor
                              : "#f0ede8",
                          padding: adj.innerBorderWidth ? `${adj.innerBorderWidth}px` : "0px",
                          boxShadow:
                            adj.outerBorderWidth && adj.outerBorderColor !== "transparent"
                              ? `inset 0 0 0 ${adj.outerBorderWidth}px ${adj.outerBorderColor}`
                              : "none",
                        }}
                        title={`Click to edit ${slot.name || `Photo ${idx + 1}`}`}
                      >
                        {photo ? (
                          <div
                            onPointerDown={isActive ? handlePointerDown : undefined}
                            onPointerMove={isActive ? handlePointerMove : undefined}
                            onPointerUp={isActive ? handlePointerUp : undefined}
                            onPointerCancel={isActive ? handlePointerUp : undefined}
                            onWheel={isActive ? handleWheel : undefined}
                            className={`relative h-full w-full overflow-hidden ${
                              isActive && isDragging ? "cursor-grabbing" : "cursor-grab"
                            }`}
                          >
                            <img
                              src={photo}
                              alt={slot.name || `Photo ${idx + 1}`}
                              draggable={false}
                              className="pointer-events-none absolute select-none origin-center"
                              style={{
                                top: "50%",
                                left: "50%",
                                width: "100%",
                                height: "100%",
                                objectFit: slot.objectFit === "contain" ? "contain" : "cover",
                                transform: transformCss,
                                filter: filterCss,
                                transition:
                                  isActive && isDragging
                                    ? "none"
                                    : "transform 0.05s ease-out, filter 0.2s ease",
                              }}
                            />

                            {/* Center Reticle for active slot */}
                            {isActive && (
                              <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-30">
                                <div className="h-5 w-5 border border-dashed border-white" />
                              </div>
                            )}

                            {/* Slot-specific Text Overlay */}
                            {adj.textOverlay?.text && (
                              <div
                                className={`pointer-events-none absolute left-1 right-1 flex z-20 ${
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
                                  className="px-1 py-0.5 truncate text-center max-w-full"
                                  style={{
                                    fontFamily: adj.textOverlay.fontFamily,
                                    fontSize: `${Math.max(
                                      10,
                                      Math.round((adj.textOverlay.fontSize || 18) * 0.55)
                                    )}px`,
                                    color: adj.textOverlay.color || "#ffffff",
                                    fontWeight: adj.textOverlay.bold ? "bold" : "normal",
                                    fontStyle: adj.textOverlay.italic ? "italic" : "normal",
                                    textShadow: adj.textOverlay.shadow
                                      ? "0 1px 3px rgba(0,0,0,0.9), 0 0 2px rgba(0,0,0,0.8)"
                                      : "none",
                                  }}
                                >
                                  {adj.textOverlay.text}
                                </span>
                              </div>
                            )}

                            {/* Slot Badge */}
                            <div className="absolute top-1 left-1 flex items-center gap-1 rounded bg-black/70 px-1.5 py-0.5 text-[9px] font-bold text-white shadow pointer-events-none z-10 backdrop-blur-xs">
                              <span className="text-[#d5a65a]">#{idx + 1}</span>
                              {isActive && <span className="text-[8px] text-[#4ade80]">• Editing</span>}
                            </div>

                            {/* Slot Hover Overlay for Change */}
                            <div className="absolute inset-0 flex items-center justify-center gap-1.5 bg-black/45 opacity-0 transition group-hover:opacity-100 z-20">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  fileInputRefs.current[slot.id]?.click();
                                }}
                                className="rounded-lg bg-[#1a3c36] px-2.5 py-1 text-[10px] font-bold text-white shadow hover:bg-[#235048] flex items-center gap-1"
                              >
                                <UploadCloud className="h-3 w-3" /> Change Photo
                              </button>
                            </div>
                          </div>
                        ) : (
                          /* Empty Slot Upload Placeholder */
                          <div
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveSlotId(slot.id);
                              fileInputRefs.current[slot.id]?.click();
                            }}
                            className="flex h-full w-full flex-col items-center justify-center p-2 text-center hover:bg-white/90 transition"
                          >
                            <UploadCloud className="h-6 w-6 text-[#b07838]" />
                            <span className="mt-1 text-[10px] font-bold text-[#1a3c36]">
                              {slot.name || `Photo ${idx + 1}`}
                            </span>
                            <span className="text-[8px] text-[#777]">Click to Upload</span>
                          </div>
                        )}
                      </div>
                    </React.Fragment>
                  );
                })}
              </div>

              {/* HINT BADGE */}
              <div className="pointer-events-none absolute bottom-3 rounded-full bg-black/75 px-3 py-1 text-[10px] font-bold text-white shadow backdrop-blur-xs flex items-center gap-1.5">
                <Move className="h-3 w-3 text-[#d5a65a]" />
                <span>Click any photo to edit its text, brightness, crop, filters &amp; borders</span>
              </div>
            </div>

            {/* ================= MULTI-PHOTO SLOT SELECTOR CAROUSEL ================= */}
            <div className="mt-4 flex w-full flex-col gap-2.5 rounded-2xl border border-[#e2d9cd] bg-white p-4 shadow-xs">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#1d2925]">
                  Photos inside this frame ({photoSlots.length} Positions):
                </span>
                <span className="text-[11px] text-[#b07838] font-bold">
                  Editing: {activeSlot?.name || `Photo 1`}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                {photoSlots.map((slot, idx) => {
                  const isSel = activeSlotId === slot.id;
                  const photo = customerPhotos[slot.id];
                  return (
                    <button
                      key={slot.id}
                      type="button"
                      onClick={() => setActiveSlotId(slot.id)}
                      className={`flex items-center gap-2.5 rounded-xl border p-2 text-left transition ${
                        isSel
                          ? "border-[#1a3c36] bg-[#eef6f3] ring-2 ring-[#1a3c36]/20 shadow-xs"
                          : "border-[#e0d6c8] bg-[#faf8f5] hover:border-[#b07838]"
                      }`}
                    >
                      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-[#ddd] border border-[#ccc]">
                        {photo ? (
                          <img
                            src={photo}
                            alt={slot.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <ImageIcon className="m-auto h-5 w-5 text-[#888]" />
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
                          {isSel ? "Active for editing" : "Click to edit"}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ================= RIGHT: STUDIO TOOL ACCORDION & CONTROLS ================= */}
          <div className="lg:col-span-5 flex flex-col justify-between rounded-3xl border border-[#e5ded4] bg-white p-5 sm:p-6 shadow-sm">
            <div>
              {/* CURRENTLY EDITING BADGE */}
              <div className="mb-4 flex items-center justify-between rounded-2xl bg-[#f7f5f0] p-3 border border-[#ede4d8]">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#1a3c36] text-[#d5a65a]">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#b07838]">
                      Currently Editing
                    </span>
                    <h3 className="text-xs font-black text-[#1d2925]">
                      {activeSlot?.name || "Selected Photo"}
                    </h3>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => fileInputRefs.current[activeSlotId]?.click()}
                  className="inline-flex items-center gap-1 rounded-xl bg-[#1a3c36] px-3 py-1.5 text-xs font-bold text-white shadow hover:bg-[#235048] transition"
                >
                  <UploadCloud className="h-3.5 w-3.5 text-[#d5a65a]" />
                  <span>Replace Photo</span>
                </button>
              </div>

              {/* STUDIO NAVIGATION PILLS */}
              <div className="flex overflow-x-auto border-b border-[#f0e8dc] pb-3 text-xs font-bold scrollbar-none gap-1.5">
                {[
                  { id: "filters", label: "Brightness & Filters", icon: Wand2 },
                  { id: "text", label: "Add Text", icon: Type },
                  { id: "crop", label: "Crop & Pan", icon: Crop },
                  { id: "borders", label: "Borders", icon: Palette },
                  { id: "rotate", label: "Rotate", icon: RotateCw },
                  { id: "effects", label: "Blur & Sharpness", icon: Sliders },
                  { id: "size", label: "Size & Price", icon: Package },
                ].map((t) => {
                  const Icon = t.icon;
                  const isActive = activeTab === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setActiveTab(t.id)}
                      className={`flex items-center gap-1.5 rounded-xl px-3 py-2 whitespace-nowrap transition ${
                        isActive
                          ? "bg-[#1a3c36] text-white shadow-xs"
                          : "bg-[#faf8f5] text-[#666] hover:bg-[#f0ebe3] hover:text-[#1d2925]"
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      <span>{t.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* ================= TAB 1: BRIGHTNESS & FILTERS (FOR EACH PIC) ================= */}
              {activeTab === "filters" && (
                <div className="mt-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#b07838]">
                      Brightness &amp; Tone ({activeSlot?.name || "Selected Pic"})
                    </h3>
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
                      className="text-[11px] font-semibold text-[#888] hover:text-[#222]"
                    >
                      Reset Tone
                    </button>
                  </div>

                  {/* BRIGHTNESS SLIDER */}
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

                  {/* PRESET FILTERS */}
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
                            className={`rounded-xl border p-2 text-center transition ${
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

              {/* ================= TAB 2: ADD TEXT (FOR EACH PIC) ================= */}
              {activeTab === "text" && (
                <div className="mt-5 space-y-3.5">
                  <div>
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#b07838]">
                        Caption on {activeSlot?.name || "this pic"}
                      </label>
                      {activeAdjustment.textOverlay?.text && (
                        <button
                          type="button"
                          onClick={() => updateActiveTextOverlay({ text: "" })}
                          className="text-[11px] font-semibold text-red-600 hover:underline"
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
                              className={`rounded-lg border py-1 text-[10px] font-bold capitalize transition ${
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
                              className={`flex flex-1 items-center justify-center rounded-lg border py-1 text-xs transition ${
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
                          className={`h-5 w-5 rounded-full border ${
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
                        className={`h-6 w-6 rounded border font-bold text-[11px] ${
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
                        className={`h-6 w-6 rounded border italic text-[11px] ${
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

              {/* ================= TAB 3: CROP & PAN (FOR EACH PIC) ================= */}
              {activeTab === "crop" && (
                <div className="mt-5 space-y-4">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#b07838]">
                      Zoom &amp; Scale ({activeSlot?.name || "Selected Pic"})
                    </h3>
                    <div className="mt-2 flex items-center gap-3 rounded-2xl border border-[#ede4d8] bg-[#faf8f5] p-3.5">
                      <button
                        type="button"
                        onClick={() =>
                          updateActiveAdjustment({
                            scale: Math.max(1.0, Math.round(((activeAdjustment.scale || 1.0) - 0.1) * 10) / 10),
                          })
                        }
                        className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#d8cfc3] bg-white text-[#555]"
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
                        className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#d8cfc3] bg-white text-[#555]"
                      >
                        <ZoomIn className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-10 font-mono text-xs font-bold text-[#1a3c36] text-right">
                        {Math.round((activeAdjustment.scale || 1.0) * 100)}%
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-[#eee5d8] pt-3 text-xs">
                    <span className="text-[11px] text-[#777]">
                      Pan Offset:{" "}
                      <strong className="font-mono text-[#333]">
                        {activeAdjustment.panX || 0}%, {activeAdjustment.panY || 0}%
                      </strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => updateActiveAdjustment({ panX: 0, panY: 0, scale: 1.0 })}
                      className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold text-[#888] hover:bg-[#f4efe8] hover:text-[#222]"
                    >
                      <RotateCcw className="h-3 w-3" /> Reset Position
                    </button>
                  </div>
                </div>
              )}

              {/* ================= TAB 4: BORDERS (FOR EACH PIC) ================= */}
              {activeTab === "borders" && (
                <div className="mt-5 space-y-5">
                  {/* INNER BORDER */}
                  <div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-[#b07838]">
                          Inner Border Color ({activeSlot?.name})
                        </h3>
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
                          className={`h-7 w-7 rounded-full border-2 transition ${
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
                        <h3 className="text-xs font-bold uppercase tracking-wider text-[#b07838]">
                          Outer Border Color ({activeSlot?.name})
                        </h3>
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
                          className={`h-7 w-7 rounded-full border-2 transition ${
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

              {/* ================= TAB 5: ROTATE (FOR EACH PIC) ================= */}
              {activeTab === "rotate" && (
                <div className="mt-5 space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#b07838]">
                    Rotate &amp; Flip ({activeSlot?.name})
                  </h3>
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() =>
                        updateActiveAdjustment({
                          rotate: (((activeAdjustment.rotate || 0) - 90 + 360) % 360),
                        })
                      }
                      className="flex items-center justify-center gap-2 rounded-xl border border-[#d8cfc3] bg-[#faf8f5] p-3 text-xs font-bold text-[#1d2925] hover:bg-[#f0ebe3] transition"
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
                      className="flex items-center justify-center gap-2 rounded-xl border border-[#d8cfc3] bg-[#faf8f5] p-3 text-xs font-bold text-[#1d2925] hover:bg-[#f0ebe3] transition"
                    >
                      <RotateCw className="h-4 w-4 text-[#b07838]" /> Right 90°
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => updateActiveAdjustment({ flipH: !activeAdjustment.flipH })}
                      className={`flex items-center justify-center gap-2 rounded-xl border p-2.5 text-xs font-bold transition ${
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
                      className={`flex items-center justify-center gap-2 rounded-xl border p-2.5 text-xs font-bold transition ${
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

              {/* ================= TAB 6: BLUR & SHARPNESS (FOR EACH PIC) ================= */}
              {activeTab === "effects" && (
                <div className="mt-5 space-y-4">
                  <div className="rounded-2xl border border-[#ede4d8] bg-[#faf8f5] p-3.5">
                    <div className="flex items-center justify-between text-xs font-bold text-[#1d2925]">
                      <span>Blur Intensity ({activeSlot?.name})</span>
                      <span className="font-mono text-[#1a3c36]">{activeAdjustment.blur || 0}px</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="15"
                      step="0.5"
                      value={activeAdjustment.blur || 0}
                      onChange={(e) =>
                        updateActiveAdjustment({ blur: parseFloat(e.target.value) })
                      }
                      className="mt-2 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-[#dfd6c9] accent-[#1a3c36]"
                    />
                    <div className="mt-1 flex justify-between text-[10px] text-[#888]">
                      <span>0px</span>
                      <button
                        type="button"
                        onClick={() => updateActiveAdjustment({ blur: 0 })}
                        className="font-semibold text-[#b07838] hover:underline"
                      >
                        Reset Blur
                      </button>
                      <span>15px</span>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-[#ede4d8] bg-[#faf8f5] p-3.5">
                    <div className="flex items-center justify-between text-xs font-bold text-[#1d2925]">
                      <span>Sharpness ({activeSlot?.name})</span>
                      <span className="font-mono text-[#1a3c36]">+{activeAdjustment.sharpness || 0}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={activeAdjustment.sharpness || 0}
                      onChange={(e) =>
                        updateActiveAdjustment({ sharpness: parseInt(e.target.value, 10) })
                      }
                      className="mt-2 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-[#dfd6c9] accent-[#1a3c36]"
                    />
                    <div className="mt-1 flex justify-between text-[10px] text-[#888]">
                      <span>Original</span>
                      <button
                        type="button"
                        onClick={() => updateActiveAdjustment({ sharpness: 0 })}
                        className="font-semibold text-[#b07838] hover:underline"
                      >
                        Reset Sharpness
                      </button>
                      <span>Crisp (+100%)</span>
                    </div>
                  </div>
                </div>
              )}

              {/* ================= TAB 7: SIZE & ORDER ================= */}
              {activeTab === "size" && (
                <div className="mt-5 space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#b07838]">
                    Choose Frame Print Size
                  </h3>
                  <div className="space-y-2">
                    {currentSizes.map((sz, idx) => {
                      const isSel = selectedSizeIndex === idx;
                      return (
                        <div
                          key={sz.id}
                          onClick={() => setSelectedSizeIndex(idx)}
                          className={`flex items-center justify-between rounded-2xl border p-3 cursor-pointer transition ${
                            isSel
                              ? "border-[#1a3c36] bg-[#eef6f3] shadow-xs"
                              : "border-[#e0d6c8] bg-white hover:border-[#b07838]"
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <div
                              className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                                isSel ? "border-[#1a3c36] bg-[#1a3c36] text-white" : "border-[#bbb]"
                              }`}
                            >
                              {isSel && <Check className="h-3 w-3" />}
                            </div>
                            <div>
                              <p className="text-xs font-bold text-[#1d2925]">{sz.name}</p>
                              <p className="text-[10px] text-[#666]">{sz.label}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-black text-[#1a3c36]">₹{sz.price}</span>
                            {sz.mrp && sz.mrp > sz.price && (
                              <span className="ml-1.5 text-[10px] text-[#999] line-through">
                                ₹{sz.mrp}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* STICKY BOTTOM CHECKOUT SUMMARY */}
            <div className="mt-6 border-t border-[#f0e8dc] pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-[#777]">Size: {activeSize.name}</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-[#1a3c36]">
                      ₹{currentTotalAmount}
                    </span>
                    {activeSize.mrp && activeSize.mrp > activeSize.price && (
                      <span className="text-xs text-[#999] line-through">
                        ₹{activeSize.mrp * quantity}
                      </span>
                    )}
                  </div>
                </div>

                {/* QUANTITY PICKER */}
                <div className="flex items-center rounded-xl border border-[#d8cfc3] bg-[#faf8f5] p-1">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold text-[#555] hover:bg-white"
                  >
                    -
                  </button>
                  <span className="w-8 text-center text-xs font-bold text-[#1d2925]">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 1)}
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold text-[#555] hover:bg-white"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="mt-4 grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={addingToCartState}
                  className="flex h-11 items-center justify-center gap-2 rounded-2xl border border-[#1a3c36] bg-white text-xs font-bold text-[#1a3c36] shadow-xs hover:bg-[#eef5f3] transition"
                >
                  <ShoppingCart className="h-4 w-4" />
                  <span>{addingToCartState ? "Adding..." : "Add to Cart"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsCheckoutOpen(true)}
                  className="flex h-11 items-center justify-center gap-2 rounded-2xl bg-[#1a3c36] text-xs font-bold text-white shadow-sm hover:bg-[#235048] transition"
                >
                  <ShoppingBag className="h-4 w-4 text-[#d5a65a]" />
                  <span>Instant Order</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </PageContainer>

      {/* CHECKOUT MODAL */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        user={user}
        items={[
          {
            product_id: selectedProduct?.id || 9999,
            product_name: selectedProduct?.product_name || "Custom Multi-Photo Frame",
            price: currentUnitPrice,
            quantity: quantity,
            size: activeSize.name,
            preview_image: selectedProduct?.product_images?.[0] || selectedFrame?.frame_image,
            customization_id: `CUST-${Date.now()}`,
            slot_photos: customerPhotos,
          },
        ]}
      />
    </main>
  );
};

export default CustomFrameStudio;
