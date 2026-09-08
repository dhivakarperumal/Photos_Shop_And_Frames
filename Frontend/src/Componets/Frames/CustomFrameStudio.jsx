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
  {
    name: "Golden Sunset",
    url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80",
  },
  {
    name: "Misty Mountain",
    url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&auto=format&fit=crop&q=80",
  },
  {
    name: "Architectural Elegance",
    url: "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&auto=format&fit=crop&q=80",
  },
  {
    name: "Minimalist Portrait",
    url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80",
  },
];

const CustomFrameStudio = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useContext(StoreContext) || {};

  // Studio tabs: 'photo' | 'borders' | 'rotate' | 'filters' | 'effects' | 'text' | 'size'
  const [activeTab, setActiveTab] = useState("photo");

  // Catalog items
  const [framesList, setFramesList] = useState([]);
  const [productsList, setProductsList] = useState([]);
  const [selectedFrame, setSelectedFrame] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loadingData, setLoadingData] = useState(true);

  // Photo & Canvas state
  const [photoSrc, setPhotoSrc] = useState(SAMPLE_PHOTOS[0].url);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [viewMode, setViewMode] = useState("studio"); // 'studio' | 'wall'

  // Photo adjustments
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [scale, setScale] = useState(1.0);
  const [cropRatio, setCropRatio] = useState("free");

  // Borders
  const [innerBorderColor, setInnerBorderColor] = useState("#ffffff");
  const [innerBorderWidth, setInnerBorderWidth] = useState(16);
  const [outerBorderColor, setOuterBorderColor] = useState("#18181b");
  const [outerBorderWidth, setOuterBorderWidth] = useState(20);

  // Rotation
  const [rotate, setRotate] = useState(0);
  const [angle, setAngle] = useState(0);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);

  // Filters & Tone
  const [filter, setFilter] = useState("normal");
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);

  // Blur & Sharpness
  const [blur, setBlur] = useState(0);
  const [sharpness, setSharpness] = useState(0);

  // Text Overlay
  const [textOverlay, setTextOverlay] = useState({
    text: "",
    fontFamily: "Playfair Display, serif",
    fontSize: 20,
    color: "#ffffff",
    bold: false,
    italic: false,
    align: "center",
    position: "bottom",
    shadow: true,
  });

  // Size & Order
  const [selectedSizeIndex, setSelectedSizeIndex] = useState(1);
  const [quantity, setQuantity] = useState(1);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [addingToCartState, setAddingToCartState] = useState(false);

  // Drag interaction
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0, startPanX: 0, startPanY: 0 });
  const viewportRef = useRef(null);
  const fileInputRef = useRef(null);

  // 1. Fetch frames and products on mount
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

        // Check query params
        const queryProdId = searchParams.get("productId");
        const queryFrameId = searchParams.get("frameId");

        if (queryProdId) {
          const matchedProd = activeProds.find((p) => String(p.id) === String(queryProdId));
          if (matchedProd) {
            setSelectedProduct(matchedProd);
            if (matchedProd.frame_data) {
              setSelectedFrame(matchedProd.frame_data);
            }
            if (matchedProd.product_images?.[0]) {
              setPhotoSrc(matchedProd.product_images[0]);
            }
          }
        } else if (queryFrameId) {
          const matchedFrame = activeFrames.find(
            (f) => String(f.id) === String(queryFrameId) || String(f.uuid) === String(queryFrameId)
          );
          if (matchedFrame) setSelectedFrame(matchedFrame);
        }
      } catch (err) {
        console.error("Studio data loading error:", err);
      } finally {
        setLoadingData(false);
      }
    };

    loadStudioData();
  }, [searchParams]);

  // Handle Photo File Upload
  const handlePhotoUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file (JPG, PNG, WebP).");
      return;
    }

    setUploadingPhoto(true);
    const formData = new FormData();
    formData.append("folder", "customizations");
    formData.append("file", file);

    try {
      const res = await api.post("/upload", formData);
      const url = res.data?.url || res.data?.urls?.[0];
      if (!url) throw new Error("No URL returned from upload");

      setPhotoSrc(url);
      setPanX(0);
      setPanY(0);
      setScale(1.0);
      toast.success("Photo uploaded to frame studio!");
    } catch (err) {
      console.error("Photo upload error:", err);
      toast.error("Could not upload photo. Using local preview instead.");
      const localUrl = URL.createObjectURL(file);
      setPhotoSrc(localUrl);
    } finally {
      setUploadingPhoto(false);
      event.target.value = "";
    }
  };

  // Drag-to-pan handlers
  const handlePointerDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      startPanX: panX,
      startPanY: panY,
    };
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch (err) {}
  };

  const handlePointerMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();

    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;

    const deltaPercentX = (dx / 320) * 100;
    const deltaPercentY = (dy / 320) * 100;

    const maxPan = Math.max(50, (scale - 1) * 70 + 50);

    const newPanX = Math.min(
      maxPan,
      Math.max(-maxPan, dragStartRef.current.startPanX + deltaPercentX)
    );
    const newPanY = Math.min(
      maxPan,
      Math.max(-maxPan, dragStartRef.current.startPanY + deltaPercentY)
    );

    setPanX(Math.round(newPanX * 10) / 10);
    setPanY(Math.round(newPanY * 10) / 10);
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
    e.preventDefault();
    const zoomStep = 0.08;
    const newScale =
      e.deltaY < 0 ? Math.min(3.0, scale + zoomStep) : Math.max(1.0, scale - zoomStep);
    setScale(Math.round(newScale * 100) / 100);
  };

  // Active filters and transforms
  const activePreset = FILTER_PRESETS.find((p) => p.id === filter) || FILTER_PRESETS[0];
  const combinedFilterCss = useMemo(() => {
    const parts = [];
    if (activePreset.id !== "normal") parts.push(activePreset.filterCss);
    if (brightness !== 100) parts.push(`brightness(${brightness}%)`);
    if (contrast !== 100) parts.push(`contrast(${contrast}%)`);
    if (saturation !== 100) parts.push(`saturate(${saturation}%)`);
    if (blur > 0) parts.push(`blur(${blur}px)`);
    if (sharpness > 0) parts.push(`contrast(${100 + Math.round(sharpness * 0.4)}%)`);
    return parts.length > 0 ? parts.join(" ") : "none";
  }, [activePreset, brightness, contrast, saturation, blur, sharpness]);

  const totalRotate = (rotate + angle) % 360;
  const transformCss = `translate(calc(-50% + ${panX}%), calc(-50% + ${panY}%)) scale(${scale}) rotate(${totalRotate}deg) scaleX(${
    flipH ? -1 : 1
  }) scaleY(${flipV ? -1 : 1})`;

  // Current pricing calculation
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

  // Generate High-Res Composite Canvas Image
  const generateHighResCompositeBlobAndUrl = () => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = photoSrc;

      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          const baseDim = 1200;
          let cw = baseDim;
          let ch = baseDim;

          const ratioPreset = ASPECT_RATIOS.find((r) => r.id === cropRatio);
          if (ratioPreset && ratioPreset.ratio) {
            if (ratioPreset.ratio >= 1) {
              cw = baseDim;
              ch = Math.round(baseDim / ratioPreset.ratio);
            } else {
              ch = baseDim;
              cw = Math.round(baseDim * ratioPreset.ratio);
            }
          }

          canvas.width = cw;
          canvas.height = ch;
          const ctx = canvas.getContext("2d");

          // 1. Draw Outer Border background
          if (outerBorderWidth > 0 && outerBorderColor !== "transparent") {
            ctx.fillStyle = outerBorderColor;
            ctx.fillRect(0, 0, cw, ch);
          }

          // Outer border thickness in canvas coordinates
          const canvasOuterW = outerBorderWidth > 0 && outerBorderColor !== "transparent"
            ? Math.round((outerBorderWidth / 320) * cw)
            : 0;

          // 2. Draw Inner Border background
          const innerX = canvasOuterW;
          const innerY = canvasOuterW;
          const innerW = cw - canvasOuterW * 2;
          const innerH = ch - canvasOuterW * 2;

          if (innerBorderWidth > 0 && innerBorderColor !== "transparent") {
            ctx.fillStyle = innerBorderColor;
            ctx.fillRect(innerX, innerY, innerW, innerH);
          }

          // Inner border padding in canvas coordinates
          const canvasInnerW = innerBorderWidth > 0 && innerBorderColor !== "transparent"
            ? Math.round((innerBorderWidth / 320) * cw)
            : 0;

          // 3. Photo area
          const px = innerX + canvasInnerW;
          const py = innerY + canvasInnerW;
          const pw = innerW - canvasInnerW * 2;
          const ph = innerH - canvasInnerW * 2;

          ctx.save();
          ctx.beginPath();
          ctx.rect(px, py, pw, ph);
          ctx.clip();

          // Calculate aspect ratio cover/contain
          const imgRatio = img.naturalWidth / img.naturalHeight;
          const frameRatio = pw / ph;
          let dw = pw;
          let dh = ph;

          if (imgRatio > frameRatio) {
            dh = ph;
            dw = ph * imgRatio;
          } else {
            dw = pw;
            dh = pw / imgRatio;
          }

          dw = dw * scale;
          dh = dh * scale;
          const dx = px + (pw - dw) / 2 + (panX / 100) * pw;
          const dy = py + (ph - dh) / 2 + (panY / 100) * ph;

          // Canvas filters
          const filterParts = [];
          if (filter === "bw") filterParts.push("grayscale(100%) contrast(110%)");
          else if (filter === "sepia") filterParts.push("sepia(85%) contrast(95%)");
          else if (filter === "warm") filterParts.push("sepia(25%) saturate(140%) brightness(105%)");
          else if (filter === "cool") filterParts.push("hue-rotate(185deg) saturate(90%) brightness(105%)");
          else if (filter === "vintage") filterParts.push("sepia(35%) contrast(120%) brightness(90%) saturate(120%)");
          else if (filter === "vivid") filterParts.push("saturate(160%) contrast(115%) brightness(102%)");
          else if (filter === "dramatic") filterParts.push("contrast(140%) brightness(90%) saturate(110%)");
          else if (filter === "fade") filterParts.push("contrast(85%) brightness(110%) saturate(85%)");

          if (brightness !== 100) filterParts.push(`brightness(${brightness}%)`);
          if (contrast !== 100) filterParts.push(`contrast(${contrast}%)`);
          if (saturation !== 100) filterParts.push(`saturate(${saturation}%)`);
          if (blur > 0) filterParts.push(`blur(${Math.max(1, Math.round(blur * (cw / 400)))}px)`);

          if (filterParts.length > 0 && ctx.filter) {
            ctx.filter = filterParts.join(" ");
          }

          // Rotation & Flip
          ctx.save();
          ctx.translate(dx + dw / 2, dy + dh / 2);
          if (totalRotate !== 0) ctx.rotate((totalRotate * Math.PI) / 180);
          if (flipH || flipV) ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
          ctx.drawImage(img, -dw / 2, -dh / 2, dw, dh);
          ctx.restore();
          ctx.filter = "none";
          ctx.restore(); // Restore clip

          // 4. Draw Text Overlay
          if (textOverlay.text) {
            ctx.save();
            const fontSz = Math.max(18, Math.round(((textOverlay.fontSize || 20) / 320) * cw));
            const isBold = textOverlay.bold ? "bold " : "";
            const isItalic = textOverlay.italic ? "italic " : "";
            ctx.font = `${isBold}${isItalic}${fontSz}px ${textOverlay.fontFamily}`;
            ctx.fillStyle = textOverlay.color;
            ctx.textAlign = textOverlay.align || "center";
            ctx.textBaseline = "middle";

            if (textOverlay.shadow) {
              ctx.shadowColor = "rgba(0,0,0,0.85)";
              ctx.shadowBlur = 8;
              ctx.shadowOffsetX = 2;
              ctx.shadowOffsetY = 3;
            }

            let tx = pw / 2 + px;
            if (textOverlay.align === "left") tx = px + fontSz * 1.5;
            else if (textOverlay.align === "right") tx = px + pw - fontSz * 1.5;

            let ty = py + ph - fontSz * 1.8;
            if (textOverlay.position === "top") ty = py + fontSz * 1.8;
            else if (textOverlay.position === "center") ty = py + ph / 2;

            ctx.fillText(textOverlay.text, tx, ty, pw - fontSz * 2);
            ctx.restore();
          }

          const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
          canvas.toBlob((blob) => resolve({ blob, dataUrl }), "image/jpeg", 0.92);
        } catch (err) {
          console.error("Canvas export error:", err);
          resolve({ blob: null, dataUrl: photoSrc });
        }
      };

      img.onerror = () => resolve({ blob: null, dataUrl: photoSrc });
    });
  };

  // Download high-resolution custom frame
  const handleDownload = async () => {
    toast.loading("Generating high-resolution frame...", { id: "dl-frame" });
    const { dataUrl } = await generateHighResCompositeBlobAndUrl();
    if (dataUrl) {
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `custom-frame-${Date.now()}.jpg`;
      a.click();
      toast.success("Frame image downloaded!", { id: "dl-frame" });
    } else {
      toast.error("Could not generate frame download.", { id: "dl-frame" });
    }
  };

  // Handle Add To Cart
  const handleAddToCart = async () => {
    setAddingToCartState(true);
    try {
      const activeUserId =
        user?.user_id || user?.id || localStorage.getItem("frame_shop_guest_id") || "guest";

      // 1. Generate full composite blob & upload
      let compositeUrl = photoSrc;
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
          console.warn("Upload fallback to dataUrl");
          compositeUrl = dataUrl || photoSrc;
        }
      }

      const custId = `CUST-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
      const targetProduct = selectedProduct || {
        id: 9999,
        product_name: "Custom Bespoke Studio Frame",
        category: "Custom Frame",
        price: currentUnitPrice,
      };

      const customAdjustmentObj = {
        panX,
        panY,
        scale,
        rotate,
        angle,
        flipH,
        flipV,
        cropRatio,
        innerBorderColor,
        innerBorderWidth,
        outerBorderColor,
        outerBorderWidth,
        blur,
        sharpness,
        filter,
        brightness,
        contrast,
        saturation,
        textOverlay,
      };

      // Save customization
      await api.post("/customizations", {
        customization_id: custId,
        user_id: activeUserId,
        product_id: targetProduct.id,
        slot_photos: { slot_1: photoSrc },
        photo_adjustments: { slot_1: customAdjustmentObj },
        preview_image: compositeUrl,
      }).catch((err) => console.warn("Save customization note:", err));

      // Add to Cart
      if (addToCart) {
        await addToCart(targetProduct, {
          size: activeSize.name,
          price: currentUnitPrice,
          quantity: quantity,
          customization_id: custId,
          slot_photos: { slot_1: photoSrc },
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

  // Handle Instant Buy Now
  const handleBuyNow = async () => {
    setIsCheckoutOpen(true);
  };

  return (
    <main className="min-h-screen bg-[#f7f3ed]">
      <PageHeader title="Custom Frame Studio" />
      <PageContainer className="py-8 sm:py-10">
        {/* STUDIO HERO HEADER */}
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.24em] text-[#b07838]">
              <Sparkles className="h-4 w-4 text-[#d5a65a]" />
              <span>Bespoke Frame Studio</span>
            </div>
            <h1 className="mt-1.5 text-3xl font-black tracking-tight text-[#1d2925] sm:text-4xl">
              Design Your Custom Frame
            </h1>
            <p className="mt-1 max-w-2xl text-xs sm:text-sm text-[#6b6b63]">
              Upload your photo, personalize with inner &amp; outer borders, add custom text, crop, rotate, enhance with sharpness &amp; blur, and apply studio filters.
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
              title="Download high-resolution frame image"
            >
              <Download className="h-4 w-4 text-[#b07838]" />
              <span>Download High-Res</span>
            </button>
          </div>
        </div>

        {/* WORKSPACE GRID */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* ================= LEFT / CENTER: INTERACTIVE FRAME VIEWPORT ================= */}
          <div className="lg:col-span-7 flex flex-col items-center">
            <div
              className={`relative flex w-full flex-col items-center justify-center overflow-hidden rounded-3xl border border-[#e5ded4] p-6 sm:p-10 transition-all duration-300 ${
                viewMode === "wall"
                  ? "min-h-[520px] bg-cover bg-center shadow-inner"
                  : "min-h-[480px] bg-[#1a1c1b] shadow-2xl"
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
              {/* WALL DECOR ELEMENTS IN WALL MODE */}
              {viewMode === "wall" && (
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 border-t border-[#d8cfc3] bg-[#e4dacd]/60 backdrop-blur-xs flex items-center justify-center text-[11px] font-bold text-[#888]">
                  Wall Hanging Simulation • Living Room Ambient Light
                </div>
              )}

              {/* FRAME CONTAINER */}
              <div
                ref={viewportRef}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                onWheel={handleWheel}
                className={`relative transition-all duration-200 select-none ${
                  isDragging ? "cursor-grabbing" : "cursor-grab"
                }`}
                style={{
                  width: "100%",
                  maxWidth: 420,
                  backgroundColor: innerBorderColor !== "transparent" ? innerBorderColor : "#000",
                  padding: `${innerBorderWidth}px`,
                  boxShadow:
                    outerBorderWidth > 0 && outerBorderColor !== "transparent"
                      ? `0 0 0 ${outerBorderWidth}px ${outerBorderColor}, 0 25px 50px -12px rgba(0,0,0,0.5)`
                      : "0 25px 50px -12px rgba(0,0,0,0.5)",
                  borderRadius: "6px",
                }}
                title="Drag to reposition photo • Scroll to zoom"
              >
                {/* INNER PHOTO MASK CONTAINER */}
                <div
                  className="relative overflow-hidden bg-black"
                  style={{
                    width: "100%",
                    height: 380,
                    borderRadius: "3px",
                  }}
                >
                  <img
                    src={photoSrc}
                    alt="Custom Frame Preview"
                    draggable={false}
                    className="pointer-events-none absolute select-none origin-center"
                    style={{
                      top: "50%",
                      left: "50%",
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      transform: transformCss,
                      filter: combinedFilterCss,
                      transition: isDragging ? "none" : "transform 0.05s ease-out, filter 0.2s ease",
                    }}
                  />

                  {/* GUIDE RETICLE */}
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-25">
                    <div className="h-6 w-6 border border-dashed border-white" />
                  </div>

                  {/* TEXT OVERLAY */}
                  {textOverlay.text && (
                    <div
                      className={`pointer-events-none absolute left-3 right-3 flex z-20 ${
                        textOverlay.position === "top"
                          ? "top-4"
                          : textOverlay.position === "center"
                          ? "top-1/2 -translate-y-1/2"
                          : "bottom-4"
                      } ${
                        textOverlay.align === "left"
                          ? "justify-start"
                          : textOverlay.align === "right"
                          ? "justify-end"
                          : "justify-center"
                      }`}
                    >
                      <span
                        className="px-2 py-0.5 truncate text-center max-w-full"
                        style={{
                          fontFamily: textOverlay.fontFamily,
                          fontSize: `${textOverlay.fontSize}px`,
                          color: textOverlay.color,
                          fontWeight: textOverlay.bold ? "bold" : "normal",
                          fontStyle: textOverlay.italic ? "italic" : "normal",
                          textShadow: textOverlay.shadow
                            ? "0 2px 5px rgba(0,0,0,0.9), 0 0 3px rgba(0,0,0,0.8)"
                            : "none",
                        }}
                      >
                        {textOverlay.text}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* DRAG HINT BADGE */}
              <div className="pointer-events-none absolute bottom-4 rounded-full bg-black/75 px-3 py-1.5 text-[11px] font-bold text-white shadow backdrop-blur-xs flex items-center gap-1.5">
                <Move className="h-3.5 w-3.5 text-[#d5a65a]" />
                <span>{isDragging ? "Moving photo..." : "Drag to pan photo • Scroll to zoom"}</span>
              </div>
            </div>

            {/* QUICK SAMPLE PHOTOS SWITCHER */}
            <div className="mt-4 flex w-full flex-col gap-2 rounded-2xl border border-[#e2d9cd] bg-white p-3.5 shadow-xs">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#1d2925]">Or try with sample photography:</span>
                <span className="text-[11px] text-[#777]">Click to preview</span>
              </div>
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                {SAMPLE_PHOTOS.map((sp, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setPhotoSrc(sp.url);
                      setPanX(0);
                      setPanY(0);
                      setScale(1.0);
                    }}
                    className={`group relative h-12 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition ${
                      photoSrc === sp.url
                        ? "border-[#1a3c36] ring-2 ring-[#1a3c36]/20"
                        : "border-[#e0d6c8] hover:border-[#b07838]"
                    }`}
                  >
                    <img
                      src={sp.url}
                      alt={sp.name}
                      className="h-full w-full object-cover transition group-hover:scale-105"
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ================= RIGHT: STUDIO TOOL ACCORDION & CHECKOUT ================= */}
          <div className="lg:col-span-5 flex flex-col justify-between rounded-3xl border border-[#e5ded4] bg-white p-5 sm:p-6 shadow-sm">
            <div>
              {/* STUDIO NAVIGATION PILLS */}
              <div className="flex overflow-x-auto border-b border-[#f0e8dc] pb-3 text-xs font-bold scrollbar-none gap-1.5">
                {[
                  { id: "photo", label: "Photo & Crop", icon: UploadCloud },
                  { id: "borders", label: "Borders", icon: Palette },
                  { id: "rotate", label: "Rotate", icon: RotateCw },
                  { id: "filters", label: "Filters", icon: Wand2 },
                  { id: "effects", label: "Blur/Sharp", icon: Sliders },
                  { id: "text", label: "Add Text", icon: Type },
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

              {/* ================= TAB 1: PHOTO & CROP ================= */}
              {activeTab === "photo" && (
                <div className="mt-5 space-y-4">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#b07838]">
                      1. Upload Your Personal Photo
                    </h3>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handlePhotoUpload}
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingPhoto}
                      className="mt-2 flex h-24 w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#b07838] bg-[#fdfbf7] p-4 text-center transition hover:bg-white hover:shadow-xs"
                    >
                      <UploadCloud className="h-6 w-6 text-[#b07838]" />
                      <span className="mt-1 text-xs font-bold text-[#1d2925]">
                        {uploadingPhoto ? "Uploading Photo..." : "Click or Drag to Upload Personal Photo"}
                      </span>
                      <span className="text-[10px] text-[#777]">Supports high-res JPG, PNG, WebP</span>
                    </button>
                  </div>

                  {/* CROP ASPECT RATIO */}
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#b07838]">
                      2. Frame Proportions
                    </h3>
                    <div className="mt-2 grid grid-cols-3 gap-2">
                      {ASPECT_RATIOS.map((r) => (
                        <button
                          key={r.id}
                          type="button"
                          onClick={() => setCropRatio(r.id)}
                          className={`rounded-xl border p-2 text-xs font-bold transition ${
                            cropRatio === r.id
                              ? "border-[#1a3c36] bg-[#1a3c36] text-white shadow-xs"
                              : "border-[#e2d9cd] bg-[#faf8f5] text-[#555] hover:border-[#b07838]"
                          }`}
                        >
                          {r.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* ZOOM SLIDER */}
                  <div className="rounded-2xl border border-[#ede4d8] bg-[#faf8f5] p-3.5">
                    <div className="flex items-center justify-between text-xs font-bold text-[#1d2925]">
                      <span>Photo Zoom</span>
                      <span className="font-mono text-[#1a3c36]">{Math.round(scale * 100)}%</span>
                    </div>
                    <div className="mt-2 flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setScale((s) => Math.max(1.0, Math.round((s - 0.1) * 10) / 10))}
                        className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#d8cfc3] bg-white text-[#555]"
                      >
                        <ZoomOut className="h-3.5 w-3.5" />
                      </button>
                      <input
                        type="range"
                        min="1.0"
                        max="3.0"
                        step="0.05"
                        value={scale}
                        onChange={(e) => setScale(parseFloat(e.target.value))}
                        className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-[#dfd6c9] accent-[#1a3c36]"
                      />
                      <button
                        type="button"
                        onClick={() => setScale((s) => Math.min(3.0, Math.round((s + 0.1) * 10) / 10))}
                        className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#d8cfc3] bg-white text-[#555]"
                      >
                        <ZoomIn className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ================= TAB 2: BORDERS & MATS ================= */}
              {activeTab === "borders" && (
                <div className="mt-5 space-y-5">
                  {/* INNER BORDER */}
                  <div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-[#b07838]">
                          Inner Border Color (Mat Board)
                        </h3>
                        <p className="text-[11px] text-[#777]">
                          Passe-partout mat board surrounding your photo
                        </p>
                      </div>
                      <span className="font-mono text-xs font-bold text-[#1a3c36]">
                        {innerBorderWidth}px
                      </span>
                    </div>

                    <input
                      type="range"
                      min="0"
                      max="35"
                      step="1"
                      value={innerBorderWidth}
                      onChange={(e) => setInnerBorderWidth(parseInt(e.target.value, 10))}
                      className="mt-2 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-[#dfd6c9] accent-[#1a3c36]"
                    />

                    <div className="mt-2.5 flex flex-wrap items-center gap-2">
                      {INNER_BORDER_COLORS.map((c) => (
                        <button
                          key={c.value}
                          type="button"
                          onClick={() => {
                            setInnerBorderColor(c.value);
                            if (c.value !== "transparent" && innerBorderWidth === 0) {
                              setInnerBorderWidth(16);
                            }
                          }}
                          title={c.label}
                          className={`h-7 w-7 rounded-full border-2 transition ${
                            innerBorderColor === c.value
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
                          value={innerBorderColor === "transparent" ? "#ffffff" : innerBorderColor}
                          onChange={(e) => {
                            setInnerBorderColor(e.target.value);
                            if (innerBorderWidth === 0) setInnerBorderWidth(16);
                          }}
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
                          Outer Border Color (Frame Moulding)
                        </h3>
                        <p className="text-[11px] text-[#777]">
                          Solid outer frame profile
                        </p>
                      </div>
                      <span className="font-mono text-xs font-bold text-[#1a3c36]">
                        {outerBorderWidth}px
                      </span>
                    </div>

                    <input
                      type="range"
                      min="0"
                      max="40"
                      step="1"
                      value={outerBorderWidth}
                      onChange={(e) => setOuterBorderWidth(parseInt(e.target.value, 10))}
                      className="mt-2 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-[#dfd6c9] accent-[#1a3c36]"
                    />

                    <div className="mt-2.5 flex flex-wrap items-center gap-2">
                      {OUTER_BORDER_COLORS.map((c) => (
                        <button
                          key={c.value}
                          type="button"
                          onClick={() => {
                            setOuterBorderColor(c.value);
                            if (c.value !== "transparent" && outerBorderWidth === 0) {
                              setOuterBorderWidth(20);
                            }
                          }}
                          title={c.label}
                          className={`h-7 w-7 rounded-full border-2 transition ${
                            outerBorderColor === c.value
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
                          value={outerBorderColor === "transparent" ? "#18181b" : outerBorderColor}
                          onChange={(e) => {
                            setOuterBorderColor(e.target.value);
                            if (outerBorderWidth === 0) setOuterBorderWidth(20);
                          }}
                          className="h-4 w-4 cursor-pointer rounded border-0 bg-transparent"
                        />
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* ================= TAB 3: ROTATE & FLIP ================= */}
              {activeTab === "rotate" && (
                <div className="mt-5 space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#b07838]">
                    Rotate &amp; Flip Controls
                  </h3>
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setRotate((r) => (r - 90 + 360) % 360)}
                      className="flex items-center justify-center gap-2 rounded-xl border border-[#d8cfc3] bg-[#faf8f5] p-3 text-xs font-bold text-[#1d2925] hover:bg-[#f0ebe3] transition"
                    >
                      <RotateCcw className="h-4 w-4 text-[#b07838]" /> Left 90°
                    </button>
                    <button
                      type="button"
                      onClick={() => setRotate((r) => (r + 90) % 360)}
                      className="flex items-center justify-center gap-2 rounded-xl border border-[#d8cfc3] bg-[#faf8f5] p-3 text-xs font-bold text-[#1d2925] hover:bg-[#f0ebe3] transition"
                    >
                      <RotateCw className="h-4 w-4 text-[#b07838]" /> Right 90°
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setFlipH((f) => !f)}
                      className={`flex items-center justify-center gap-2 rounded-xl border p-2.5 text-xs font-bold transition ${
                        flipH
                          ? "border-[#1a3c36] bg-[#1a3c36] text-white"
                          : "border-[#d8cfc3] bg-[#faf8f5] text-[#1d2925] hover:bg-[#f0ebe3]"
                      }`}
                    >
                      <FlipHorizontal className="h-4 w-4" /> Flip Horizontal
                    </button>
                    <button
                      type="button"
                      onClick={() => setFlipV((f) => !f)}
                      className={`flex items-center justify-center gap-2 rounded-xl border p-2.5 text-xs font-bold transition ${
                        flipV
                          ? "border-[#1a3c36] bg-[#1a3c36] text-white"
                          : "border-[#d8cfc3] bg-[#faf8f5] text-[#1d2925] hover:bg-[#f0ebe3]"
                      }`}
                    >
                      <FlipVertical className="h-4 w-4" /> Flip Vertical
                    </button>
                  </div>

                  {/* ANGLE SLIDER */}
                  <div className="rounded-2xl border border-[#ede4d8] bg-[#faf8f5] p-3.5">
                    <div className="flex items-center justify-between text-xs font-bold text-[#1d2925]">
                      <span>Fine Leveling Angle</span>
                      <span className="font-mono text-[#1a3c36]">{angle}°</span>
                    </div>
                    <input
                      type="range"
                      min="-45"
                      max="45"
                      value={angle}
                      onChange={(e) => setAngle(parseInt(e.target.value, 10))}
                      className="mt-2 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-[#dfd6c9] accent-[#1a3c36]"
                    />
                    <div className="mt-1 flex justify-between text-[10px] text-[#888]">
                      <span>-45°</span>
                      <button
                        type="button"
                        onClick={() => setAngle(0)}
                        className="font-semibold text-[#b07838] hover:underline"
                      >
                        Reset Angle
                      </button>
                      <span>+45°</span>
                    </div>
                  </div>
                </div>
              )}

              {/* ================= TAB 4: COLOR FILTERS ================= */}
              {activeTab === "filters" && (
                <div className="mt-5 space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#b07838]">
                    Preset Color Filters
                  </h3>
                  <div className="grid grid-cols-3 gap-2">
                    {FILTER_PRESETS.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setFilter(p.id)}
                        className={`rounded-xl border p-2 text-center transition ${
                          filter === p.id
                            ? "border-[#1a3c36] bg-[#1a3c36] text-white shadow-xs"
                            : "border-[#e0d6c8] bg-[#faf8f5] text-[#444] hover:border-[#b07838]"
                        }`}
                      >
                        <span className="block text-xs font-bold">{p.name}</span>
                      </button>
                    ))}
                  </div>

                  <div className="space-y-2.5 rounded-2xl border border-[#ede4d8] bg-[#faf8f5] p-3.5 text-xs">
                    <div>
                      <div className="flex justify-between font-bold text-[#333]">
                        <span>Brightness</span>
                        <span className="font-mono text-[#1a3c36]">{brightness}%</span>
                      </div>
                      <input
                        type="range"
                        min="50"
                        max="150"
                        value={brightness}
                        onChange={(e) => setBrightness(parseInt(e.target.value, 10))}
                        className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-[#dfd6c9] accent-[#1a3c36]"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between font-bold text-[#333]">
                        <span>Contrast</span>
                        <span className="font-mono text-[#1a3c36]">{contrast}%</span>
                      </div>
                      <input
                        type="range"
                        min="50"
                        max="150"
                        value={contrast}
                        onChange={(e) => setContrast(parseInt(e.target.value, 10))}
                        className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-[#dfd6c9] accent-[#1a3c36]"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between font-bold text-[#333]">
                        <span>Saturation</span>
                        <span className="font-mono text-[#1a3c36]">{saturation}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="200"
                        value={saturation}
                        onChange={(e) => setSaturation(parseInt(e.target.value, 10))}
                        className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-[#dfd6c9] accent-[#1a3c36]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ================= TAB 5: BLUR & SHARPNESS ================= */}
              {activeTab === "effects" && (
                <div className="mt-5 space-y-4">
                  <div className="rounded-2xl border border-[#ede4d8] bg-[#faf8f5] p-3.5">
                    <div className="flex items-center justify-between text-xs font-bold text-[#1d2925]">
                      <span>Blur Intensity</span>
                      <span className="font-mono text-[#1a3c36]">{blur}px</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="15"
                      step="0.5"
                      value={blur}
                      onChange={(e) => setBlur(parseFloat(e.target.value))}
                      className="mt-2 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-[#dfd6c9] accent-[#1a3c36]"
                    />
                    <div className="mt-1 flex justify-between text-[10px] text-[#888]">
                      <span>0px</span>
                      <button
                        type="button"
                        onClick={() => setBlur(0)}
                        className="font-semibold text-[#b07838] hover:underline"
                      >
                        Reset Blur
                      </button>
                      <span>15px</span>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-[#ede4d8] bg-[#faf8f5] p-3.5">
                    <div className="flex items-center justify-between text-xs font-bold text-[#1d2925]">
                      <span>Sharpness &amp; Clarity</span>
                      <span className="font-mono text-[#1a3c36]">+{sharpness}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={sharpness}
                      onChange={(e) => setSharpness(parseInt(e.target.value, 10))}
                      className="mt-2 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-[#dfd6c9] accent-[#1a3c36]"
                    />
                    <div className="mt-1 flex justify-between text-[10px] text-[#888]">
                      <span>Original</span>
                      <button
                        type="button"
                        onClick={() => setSharpness(0)}
                        className="font-semibold text-[#b07838] hover:underline"
                      >
                        Reset Sharpness
                      </button>
                      <span>Crisp (+100%)</span>
                    </div>
                  </div>
                </div>
              )}

              {/* ================= TAB 6: ADD TEXT ================= */}
              {activeTab === "text" && (
                <div className="mt-5 space-y-3.5">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#b07838]">
                      Custom Caption / Engraving Text
                    </label>
                    <input
                      type="text"
                      value={textOverlay.text}
                      onChange={(e) =>
                        setTextOverlay((prev) => ({ ...prev, text: e.target.value }))
                      }
                      placeholder="e.g. Together Forever • 2026, Our Sweet Family"
                      className="mt-1.5 w-full rounded-xl border border-[#d8cfc3] bg-[#faf8f5] px-3.5 py-2 text-xs text-[#1d2925] outline-none focus:border-[#1a3c36] focus:bg-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[11px] font-bold text-[#666]">Font Family</span>
                      <select
                        value={textOverlay.fontFamily}
                        onChange={(e) =>
                          setTextOverlay((prev) => ({ ...prev, fontFamily: e.target.value }))
                        }
                        className="mt-1 w-full rounded-lg border border-[#d8cfc3] bg-[#faf8f5] px-2 py-1 text-xs text-[#333] outline-none"
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
                        Size ({textOverlay.fontSize}px)
                      </span>
                      <input
                        type="range"
                        min="14"
                        max="36"
                        value={textOverlay.fontSize}
                        onChange={(e) =>
                          setTextOverlay((prev) => ({
                            ...prev,
                            fontSize: parseInt(e.target.value, 10),
                          }))
                        }
                        className="mt-2 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-[#dfd6c9] accent-[#1a3c36]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[11px] font-bold text-[#666]">Position</span>
                      <div className="mt-1 grid grid-cols-3 gap-1">
                        {["top", "center", "bottom"].map((pos) => (
                          <button
                            key={pos}
                            type="button"
                            onClick={() =>
                              setTextOverlay((prev) => ({ ...prev, position: pos }))
                            }
                            className={`rounded-lg border py-1 text-[10px] font-bold capitalize transition ${
                              textOverlay.position === pos
                                ? "border-[#1a3c36] bg-[#1a3c36] text-white"
                                : "border-[#d8cfc3] bg-[#faf8f5] text-[#666]"
                            }`}
                          >
                            {pos}
                          </button>
                        ))}
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
                          return (
                            <button
                              key={al.id}
                              type="button"
                              onClick={() =>
                                setTextOverlay((prev) => ({ ...prev, align: al.id }))
                              }
                              className={`flex flex-1 items-center justify-center rounded-lg border py-1 text-xs transition ${
                                textOverlay.align === al.id
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
                      {["#ffffff", "#18181b", "#d5a65a", "#e11d48"].map((clr) => (
                        <button
                          key={clr}
                          type="button"
                          onClick={() => setTextOverlay((prev) => ({ ...prev, color: clr }))}
                          className={`h-5 w-5 rounded-full border ${
                            textOverlay.color === clr ? "ring-2 ring-[#1a3c36]" : "border-[#ccc]"
                          }`}
                          style={{ backgroundColor: clr }}
                        />
                      ))}
                      <input
                        type="color"
                        value={textOverlay.color}
                        onChange={(e) =>
                          setTextOverlay((prev) => ({ ...prev, color: e.target.value }))
                        }
                        className="h-5 w-5 cursor-pointer rounded border-0 bg-transparent"
                      />
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setTextOverlay((prev) => ({ ...prev, bold: !prev.bold }))}
                        className={`h-6 w-6 rounded border font-bold text-[11px] ${
                          textOverlay.bold ? "bg-[#1a3c36] text-white" : "bg-[#faf8f5] text-[#555]"
                        }`}
                      >
                        B
                      </button>
                      <button
                        type="button"
                        onClick={() => setTextOverlay((prev) => ({ ...prev, italic: !prev.italic }))}
                        className={`h-6 w-6 rounded border italic text-[11px] ${
                          textOverlay.italic ? "bg-[#1a3c36] text-white" : "bg-[#faf8f5] text-[#555]"
                        }`}
                      >
                        I
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ================= TAB 7: SIZE & ORDER ================= */}
              {activeTab === "size" && (
                <div className="mt-5 space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#b07838]">
                    Choose Print &amp; Frame Size
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
                  <span className="text-[11px] text-[#777]">Selected Size: {activeSize.name}</span>
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
                  onClick={handleBuyNow}
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
            product_name: selectedProduct?.product_name || "Custom Bespoke Studio Frame",
            price: currentUnitPrice,
            quantity: quantity,
            size: activeSize.name,
            preview_image: photoSrc,
            customization_id: `CUST-${Date.now()}`,
            slot_photos: { slot_1: photoSrc },
          },
        ]}
      />
    </main>
  );
};

export default CustomFrameStudio;
