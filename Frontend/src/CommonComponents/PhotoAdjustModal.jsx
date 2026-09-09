import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Check,
  Crop,
  FlipHorizontal,
  FlipVertical,
  Italic,
  Layers,
  Maximize2,
  Minimize2,
  Move,
  Palette,
  RotateCcw,
  RotateCw,
  Sliders,
  Sparkles,
  Type,
  Wand2,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";

// Preset color filters configuration
export const FILTER_PRESETS = [
  { id: "normal", name: "Original", filterCss: "none", canvasFilter: "none" },
  {
    id: "bw",
    name: "B & W",
    filterCss: "grayscale(100%) contrast(110%)",
    canvasFilter: "grayscale(100%) contrast(110%)",
  },
  {
    id: "sepia",
    name: "Sepia",
    filterCss: "sepia(85%) contrast(95%) brightness(95%)",
    canvasFilter: "sepia(85%) contrast(95%) brightness(95%)",
  },
  {
    id: "warm",
    name: "Warm Sun",
    filterCss: "sepia(25%) saturate(140%) brightness(105%)",
    canvasFilter: "sepia(25%) saturate(140%) brightness(105%)",
  },
  {
    id: "cool",
    name: "Cool Nordic",
    filterCss: "hue-rotate(185deg) saturate(90%) brightness(105%)",
    canvasFilter: "hue-rotate(185deg) saturate(90%) brightness(105%)",
  },
  {
    id: "vintage",
    name: "Vintage",
    filterCss: "sepia(35%) contrast(120%) brightness(90%) saturate(120%)",
    canvasFilter: "sepia(35%) contrast(120%) brightness(90%) saturate(120%)",
  },
  {
    id: "vivid",
    name: "Vivid",
    filterCss: "saturate(160%) contrast(115%) brightness(102%)",
    canvasFilter: "saturate(160%) contrast(115%) brightness(102%)",
  },
  {
    id: "dramatic",
    name: "Dramatic",
    filterCss: "contrast(140%) brightness(90%) saturate(110%)",
    canvasFilter: "contrast(140%) brightness(90%) saturate(110%)",
  },
  {
    id: "fade",
    name: "Matte Fade",
    filterCss: "contrast(85%) brightness(110%) saturate(85%)",
    canvasFilter: "contrast(85%) brightness(110%) saturate(85%)",
  },
];

// Curated Inner Border (Mat Board) colors
export const INNER_BORDER_COLORS = [
  { label: "None / Transparent", value: "transparent" },
  { label: "Pure White", value: "#ffffff" },
  { label: "Warm Ivory", value: "#fdfbf7" },
  { label: "Antique Cream", value: "#f4ede2" },
  { label: "Matte Charcoal", value: "#333333" },
  { label: "Midnight Navy", value: "#1e293b" },
  { label: "Forest Green", value: "#1b4332" },
  { label: "Soft Champagne", value: "#e8d8b8" },
  { label: "Classic Black", value: "#111111" },
];

// Curated Outer Border (Moulding) colors
export const OUTER_BORDER_COLORS = [
  { label: "None", value: "transparent" },
  { label: "Matte Black", value: "#18181b" },
  { label: "Pure White", value: "#ffffff" },
  { label: "Natural Oak", value: "#c29b68" },
  { label: "Teak Wood", value: "#8b5a2b" },
  { label: "Espresso Walnut", value: "#3d2314" },
  { label: "Antique Gold", value: "#c5a059" },
  { label: "Rose Gold", value: "#b76e79" },
  { label: "Gunmetal Silver", value: "#71717a" },
];

export const FONT_FAMILIES = [
  { id: "Inter, sans-serif", name: "Modern Sans" },
  { id: "Playfair Display, serif", name: "Elegant Serif" },
  { id: "Cinzel, serif", name: "Luxury Roman" },
  { id: "Caveat, cursive", name: "Handwritten" },
  { id: "Courier New, monospace", name: "Typewriter" },
];

export const ASPECT_RATIOS = [
  { id: "free", label: "Fit Slot", ratio: null },
  { id: "1:1", label: "1:1 Square", ratio: 1 },
  { id: "4:5", label: "4:5 Portrait", ratio: 0.8 },
  { id: "3:2", label: "3:2 Photo", ratio: 1.5 },
  { id: "16:9", label: "16:9 Cinema", ratio: 16 / 9 },
];

export const DEFAULT_ADJUSTMENT = {
  panX: 0,
  panY: 0,
  scale: 1.0,
  rotate: 0,
  flipH: false,
  flipV: false,
  angle: 0,
  cropRatio: "free",
  fitMode: "contain",
  innerBorderColor: "transparent",
  innerBorderWidth: 0,
  outerBorderColor: "transparent",
  outerBorderWidth: 0,
  blur: 0,
  sharpness: 0,
  filter: "normal",
  brightness: 100,
  contrast: 100,
  saturation: 100,
  textOverlay: {
    text: "",
    fontFamily: "Inter, sans-serif",
    fontSize: 18,
    color: "#ffffff",
    bold: false,
    italic: false,
    align: "center",
    position: "bottom",
    shadow: true,
  },
};

/**
 * Reusable Studio Photo Editor Modal.
 * Provides rich options:
 * - Text adding (custom font, color, size, positioning, styling)
 * - Cropping (aspect ratios & pan/zoom)
 * - Inner Border Color & width (Mat Board)
 * - Outer Border Color & width (Moulding Frame)
 * - Rotate (90deg steps, flip horizontal/vertical, fine angle)
 * - Blur (smooth slider)
 * - Sharpness (clarity enhancement slider)
 * - Color filters & Brightness/Contrast/Saturation
 */
const PhotoAdjustModal = ({
  isOpen,
  onClose,
  photoSrc,
  slot,
  initialAdjustment = DEFAULT_ADJUSTMENT,
  onSave,
}) => {
  const [activeTab, setActiveTab] = useState("crop"); // 'crop' | 'borders' | 'rotate' | 'filters' | 'effects' | 'text'

  // Adjustment states
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [scale, setScale] = useState(1.0);
  const [rotate, setRotate] = useState(0);
  const [angle, setAngle] = useState(0);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [cropRatio, setCropRatio] = useState("free");
  const [fitMode, setFitMode] = useState(
    initialAdjustment?.fitMode || "contain"
  );
  const [naturalSize, setNaturalSize] = useState({ w: 800, h: 600 });

  const [innerBorderColor, setInnerBorderColor] = useState("transparent");
  const [innerBorderWidth, setInnerBorderWidth] = useState(0);
  const [outerBorderColor, setOuterBorderColor] = useState("transparent");
  const [outerBorderWidth, setOuterBorderWidth] = useState(0);

  const [blur, setBlur] = useState(0);
  const [sharpness, setSharpness] = useState(0);

  const [filter, setFilter] = useState("normal");
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);

  const [textOverlay, setTextOverlay] = useState({
    text: "",
    fontFamily: "Inter, sans-serif",
    fontSize: 18,
    color: "#ffffff",
    bold: false,
    italic: false,
    align: "center",
    position: "bottom",
    shadow: true,
  });

  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0, startPanX: 0, startPanY: 0 });
  const viewportRef = useRef(null);

  // Sync state with initialAdjustment on open
  useEffect(() => {
    if (isOpen) {
      const init = { ...DEFAULT_ADJUSTMENT, ...initialAdjustment };
      const currentFit = init.fitMode || "contain";
      setFitMode(currentFit);
      setPanX(init.panX || 0);
      setPanY(init.panY || 0);
      // In cover mode, photo must always cover slot edge-to-edge (min scale 1.0)
      const safeScale = currentFit === "cover" ? Math.max(1.0, init.scale || 1.0) : Math.max(0.4, init.scale || 1.0);
      setScale(safeScale);
      setRotate(init.rotate || 0);
      setAngle(init.angle || 0);
      setFlipH(Boolean(init.flipH));
      setFlipV(Boolean(init.flipV));
      setCropRatio(init.cropRatio || "free");
      setFitMode(init.fitMode || "contain");

      setInnerBorderColor(init.innerBorderColor || "transparent");
      setInnerBorderWidth(init.innerBorderWidth || 0);
      setOuterBorderColor(init.outerBorderColor || "transparent");
      setOuterBorderWidth(init.outerBorderWidth || 0);

      setBlur(init.blur || 0);
      setSharpness(init.sharpness || 0);

      setFilter(init.filter || "normal");
      setBrightness(init.brightness ?? 100);
      setContrast(init.contrast ?? 100);
      setSaturation(init.saturation ?? 100);

      setTextOverlay({
        ...DEFAULT_ADJUSTMENT.textOverlay,
        ...(init.textOverlay || {}),
      });
      setActiveTab("crop");
    }
  }, [isOpen, initialAdjustment]);

  // Build combined CSS filter string (must be called before any early return to satisfy Rules of Hooks)
  const activePreset = FILTER_PRESETS.find((p) => p.id === filter) || FILTER_PRESETS[0];
  const combinedFilterCss = useMemo(() => {
    const parts = [];
    if (activePreset.id !== "normal") {
      parts.push(activePreset.filterCss);
    }
    if (brightness !== 100) parts.push(`brightness(${brightness}%)`);
    if (contrast !== 100) parts.push(`contrast(${contrast}%)`);
    if (saturation !== 100) parts.push(`saturate(${saturation}%)`);
    if (blur > 0) parts.push(`blur(${blur}px)`);
    if (sharpness > 0) {
      parts.push(`contrast(${100 + Math.round(sharpness * 0.4)}%)`);
    }
    return parts.length > 0 ? parts.join(" ") : "none";
  }, [activePreset, brightness, contrast, saturation, blur, sharpness]);

  if (!isOpen || !photoSrc) return null;

  // Viewport aspect ratio calculation
  const parsePercent = (val) => {
    if (typeof val === "string" && val.includes("%")) {
      return parseFloat(val) || 100;
    }
    return parseFloat(val) || 100;
  };

  const slotW = parsePercent(slot?.width);
  const slotH = parsePercent(slot?.height);
  let slotRatio = slotW > 0 && slotH > 0 ? slotW / slotH : 1;

  // If crop ratio is specified
  const selectedRatioPreset = ASPECT_RATIOS.find((r) => r.id === cropRatio);
  if (selectedRatioPreset && selectedRatioPreset.ratio) {
    slotRatio = selectedRatioPreset.ratio;
  }

  let boxW = 320;
  let boxH = 320;
  if (slotRatio >= 1) {
    boxW = 320;
    boxH = Math.max(160, Math.round(320 / slotRatio));
  } else {
    boxH = 320;
    boxW = Math.max(160, Math.round(320 * slotRatio));
  }

  // Exact image dimensions matching canvas composite calculations
  const imgRatio = (naturalSize.w || 1) / (naturalSize.h || 1);
  const containerRatio = boxW / boxH;
  let baseW = boxW;
  let baseH = boxH;

  if (fitMode === "contain") {
    if (imgRatio > containerRatio) {
      baseW = boxW;
      baseH = boxW / imgRatio;
    } else {
      baseH = boxH;
      baseW = boxH * imgRatio;
    }
  } else {
    // cover
    if (imgRatio > containerRatio) {
      baseH = boxH;
      baseW = boxH * imgRatio;
    } else {
      baseW = boxW;
      baseH = boxW / imgRatio;
    }
  }

  const dw = baseW * scale;
  const dh = baseH * scale;

  // Maximum safe panning limits so photo covers slot completely with no empty gaps
  const maxPanX = fitMode === "cover" ? Math.max(0, ((dw - boxW) / (2 * boxW)) * 100) : 40;
  const maxPanY = fitMode === "cover" ? Math.max(0, ((dh - boxH) / (2 * boxH)) * 100) : 40;
  const maxSafeX = Math.max(maxPanX, 10);
  const maxSafeY = Math.max(maxPanY, 10);

  const isCircle = slot?.shape === "circle";

  // Drag handlers
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

    const deltaPercentX = (dx / (boxW || 1)) * 100;
    const deltaPercentY = (dy / (boxH || 1)) * 100;

    const newPanX = Math.min(
      maxSafeX,
      Math.max(-maxSafeX, dragStartRef.current.startPanX + deltaPercentX)
    );
    const newPanY = Math.min(
      maxSafeY,
      Math.max(-maxSafeY, dragStartRef.current.startPanY + deltaPercentY)
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
    if (!e.ctrlKey && !e.metaKey) return; // Only zoom on Ctrl+wheel or pinch, allow normal scrolling
    e.preventDefault();
    const zoomStep = 0.08;
    const minScale = fitMode === "cover" ? 1.0 : 0.4;
    const newScale =
      e.deltaY < 0 ? Math.min(3.0, scale + zoomStep) : Math.max(minScale, scale - zoomStep);
    setScale(Math.round(newScale * 100) / 100);
  };

  const handleResetAll = () => {
    setPanX(0);
    setPanY(0);
    setScale(1.0);
    setRotate(0);
    setAngle(0);
    setFlipH(false);
    setFlipV(false);
    setCropRatio("free");
    setFitMode("contain");
    setInnerBorderColor("transparent");
    setInnerBorderWidth(0);
    setOuterBorderColor("transparent");
    setOuterBorderWidth(0);
    setBlur(0);
    setSharpness(0);
    setFilter("normal");
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
    setTextOverlay({
      text: "",
      fontFamily: "Inter, sans-serif",
      fontSize: 18,
      color: "#ffffff",
      bold: false,
      italic: false,
      align: "center",
      position: "bottom",
      shadow: true,
    });
  };

  const handleSave = () => {
    if (onSave) {
      onSave({
        panX,
        panY,
        scale,
        rotate,
        angle,
        flipH,
        flipV,
        cropRatio,
        fitMode,
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
      });
    }
    onClose();
  };

  // Combined transform
  const totalRotate = (rotate + angle) % 360;
  const transformCss = `translate(-50%, -50%) scale(${scale}) rotate(${totalRotate}deg) scaleX(${
    flipH ? -1 : 1
  }) scaleY(${flipV ? -1 : 1})`;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-3 sm:p-5 backdrop-blur-sm overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative my-auto flex w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-[#ebe3d7] bg-white shadow-2xl">
        {/* MODAL HEADER */}
        <div className="flex items-center justify-between border-b border-[#f0e8dc] bg-[#faf8f5] px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#1a3c36] text-[#d5a65a] shadow-xs">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-black tracking-tight text-[#1d2925]">
                Custom Photo Studio Editor
              </h3>
              <p className="text-xs text-[#777]">
                {slot?.name || "Photo Frame"} • Text, borders, crop, rotate, blur, sharpness &amp; filters
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleResetAll}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#d8cfc3] bg-white px-3 py-1.5 text-xs font-bold text-[#666] hover:bg-[#f0ebe3] hover:text-[#222] transition"
              title="Reset all settings to default"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Reset All
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-full text-[#888] hover:bg-[#f4efe8] hover:text-[#222] transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* TABS NAVIGATION */}
        <div className="flex overflow-x-auto border-b border-[#f0e8dc] bg-white px-4 pt-2 text-xs font-bold scrollbar-none">
          {[
            { id: "crop", label: "Crop & Pan", icon: Crop },
            { id: "borders", label: "Borders & Mats", icon: Palette },
            { id: "rotate", label: "Rotate & Flip", icon: RotateCw },
            { id: "filters", label: "Color Filters", icon: Wand2 },
            { id: "effects", label: "Blur & Sharpness", icon: Sliders },
            { id: "text", label: "Add Text", icon: Type },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 border-b-2 px-4 py-3 whitespace-nowrap transition ${
                  isActive
                    ? "border-[#1a3c36] text-[#1a3c36] bg-[#f7f5f0]/50"
                    : "border-transparent text-[#777] hover:border-[#dfd6c9] hover:text-[#222]"
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? "text-[#b07838]" : ""}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* MAIN BODY: SPLIT VIEWPORT & CONTROLS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[460px]">
          {/* LEFT: INTERACTIVE VIEWPORT STAGE */}
          <div className="lg:col-span-6 flex flex-col items-center justify-center bg-[#1e201f] p-4 sm:p-6 relative select-none">
            {/* VIEWPORT FRAME CONTAINER */}
            <div
              className="relative flex items-center justify-center overflow-hidden rounded-2xl bg-black/60 p-4 shadow-2xl"
              style={{
                width: "100%",
                maxWidth: 360,
                minHeight: 340,
              }}
            >
              {/* OUTER & INNER BORDER SIMULATION CONTAINER */}
              <div
                ref={viewportRef}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                onWheel={handleWheel}
                className={`relative overflow-hidden transition-all duration-150 ${
                  isCircle ? "rounded-full" : "rounded-xl"
                } ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
                style={{
                  width: `${boxW}px`,
                  height: `${boxH}px`,
                  backgroundColor: innerBorderColor !== "transparent" ? innerBorderColor : "#000",
                  padding: `${innerBorderWidth}px`,
                  boxShadow:
                    outerBorderWidth > 0 && outerBorderColor !== "transparent"
                      ? `0 0 0 ${outerBorderWidth}px ${outerBorderColor}, 0 10px 25px rgba(0,0,0,0.5)`
                      : "0 10px 25px rgba(0,0,0,0.5)",
                }}
                title="Drag to pan photo. Scroll to zoom."
              >
                {/* INNER PHOTO CLIPPING CONTAINER */}
                <div
                  className={`relative h-full w-full overflow-hidden ${
                    isCircle ? "rounded-full" : "rounded-lg"
                  }`}
                >
                  <img
                    src={photoSrc}
                    alt="Adjust preview"
                    onLoad={(e) => {
                      setNaturalSize({
                        w: e.target.naturalWidth || 800,
                        h: e.target.naturalHeight || 600,
                      });
                    }}
                    draggable={false}
                    className="pointer-events-none absolute select-none origin-center"
                    style={{
                      top: `calc(50% + ${panY}%)`,
                      left: `calc(50% + ${panX}%)`,
                      width: `${baseW}px`,
                      height: `${baseH}px`,
                      maxWidth: "none",
                      maxHeight: "none",
                      objectFit: fitMode === "contain" ? "contain" : "cover",
                      transform: transformCss,
                      filter: combinedFilterCss,
                      transition: isDragging ? "none" : "transform 0.05s ease-out, filter 0.2s ease",
                    }}
                  />

                  {/* CENTER GUIDE RETICLE */}
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-30">
                    <div className="h-6 w-6 border border-dashed border-white/60" />
                  </div>

                  {/* TEXT OVERLAY */}
                  {textOverlay.text && (
                    <div
                      className={`pointer-events-none absolute left-2 right-2 flex ${
                        textOverlay.position === "top"
                          ? "top-3"
                          : textOverlay.position === "center"
                          ? "top-1/2 -translate-y-1/2"
                          : "bottom-3"
                      } ${
                        textOverlay.align === "left"
                          ? "justify-start"
                          : textOverlay.align === "right"
                          ? "justify-end"
                          : "justify-center"
                      }`}
                    >
                      <span
                        className="px-2 py-0.5 max-w-full truncate"
                        style={{
                          fontFamily: textOverlay.fontFamily,
                          fontSize: `${textOverlay.fontSize}px`,
                          color: textOverlay.color,
                          fontWeight: textOverlay.bold ? "bold" : "normal",
                          fontStyle: textOverlay.italic ? "italic" : "normal",
                          textShadow: textOverlay.shadow
                            ? "0 2px 4px rgba(0,0,0,0.8), 0 0 2px rgba(0,0,0,0.9)"
                            : "none",
                        }}
                      >
                        {textOverlay.text}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* HINT BADGE */}
              <div className="pointer-events-none absolute bottom-3 rounded-full bg-black/75 px-3 py-1 text-[10px] font-semibold text-white backdrop-blur-xs flex items-center gap-1.5 shadow">
                <Move className="h-3 w-3 text-[#d4a553]" />
                {isDragging ? "Panning photo..." : "Drag to pan • Scroll to zoom"}
              </div>
            </div>

            {/* LIVE ADJUSTMENT INDICATORS */}
            <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-[10px] text-[#aaa]">
              <span className="rounded-md bg-black/40 px-2 py-1">Zoom: {Math.round(scale * 100)}%</span>
              <span className="rounded-md bg-black/40 px-2 py-1">Rotate: {totalRotate}°</span>
              {blur > 0 && <span className="rounded-md bg-black/40 px-2 py-1">Blur: {blur}px</span>}
              {sharpness > 0 && <span className="rounded-md bg-black/40 px-2 py-1">Sharpness: +{sharpness}%</span>}
              {filter !== "normal" && (
                <span className="rounded-md bg-[#b07838]/80 text-white px-2 py-1 font-bold">
                  {activePreset.name}
                </span>
              )}
            </div>
          </div>

          {/* RIGHT: TABBED CONTROL PANELS */}
          <div className="lg:col-span-6 flex flex-col justify-between bg-white p-5 sm:p-6 overflow-y-auto max-h-[480px]">
            {/* ================= TAB 1: CROP & PAN ================= */}
            {activeTab === "crop" && (
              <div className="space-y-4">
                {/* 1. DISPLAY FIT MODE (SHOW FULL IMAGE VS FILL FRAME) */}
                <div className="rounded-2xl border border-[#ede4d8] bg-[#faf8f5] p-3.5">
                  <div className="flex items-center justify-between text-xs font-bold text-[#1d2925]">
                    <span>Image Display Mode</span>
                    <span className="text-[11px] font-semibold text-[#b07838]">
                      {fitMode === "contain" ? "Showing 100% Full Image" : "Filling Frame (Cropped)"}
                    </span>
                  </div>
                  <p className="mt-0.5 text-[11px] text-[#777]">
                    Choose &quot;Fit Full Image&quot; to see the entire photo without cutting edges, or &quot;Fill Frame&quot; to fill the whole slot.
                  </p>
                  <div className="mt-2.5 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setFitMode("contain");
                        setPanX(0);
                        setPanY(0);
                      }}
                      className={`flex items-center justify-center gap-1.5 rounded-xl border p-2.5 text-xs font-bold transition cursor-pointer ${
                        fitMode === "contain"
                          ? "border-[#1a3c36] bg-[#1a3c36] text-white shadow-xs"
                          : "border-[#e2d9cd] bg-white text-[#555] hover:border-[#b07838]"
                      }`}
                    >
                      <span>🖼️ Fit Full Image (No Crop)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setFitMode("cover");
                        if (scale < 1.0) setScale(1.0);
                      }}
                      className={`flex items-center justify-center gap-1.5 rounded-xl border p-2.5 text-xs font-bold transition cursor-pointer ${
                        fitMode === "cover"
                          ? "border-[#1a3c36] bg-[#1a3c36] text-white shadow-xs"
                          : "border-[#e2d9cd] bg-white text-[#555] hover:border-[#b07838]"
                      }`}
                    >
                      <span>🔲 Fill Frame (Cover)</span>
                    </button>
                  </div>
                </div>

                {/* 2. QUICK FOCUS ALIGNMENT */}
                <div className="rounded-2xl border border-[#ede4d8] bg-[#faf8f5] p-3.5">
                  <div className="flex items-center justify-between text-xs font-bold text-[#1d2925]">
                    <span>Quick Vertical Focus</span>
                    <span className="text-[11px] text-[#777]">Bring top/face into view</span>
                  </div>
                  <div className="mt-2 grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setPanY(Math.round(maxSafeY * 10) / 10)}
                      className="flex items-center justify-center gap-1 rounded-xl border border-[#e2d9cd] bg-white py-2 text-xs font-bold text-[#1a3c36] hover:border-[#1a3c36] hover:bg-[#f0f6f4] transition shadow-2xs cursor-pointer"
                      title="Focus on top of photo (shows head and face)"
                    >
                      <span>⬆️ Show Top (Face)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setPanX(0);
                        setPanY(0);
                      }}
                      className="flex items-center justify-center gap-1 rounded-xl border border-[#e2d9cd] bg-white py-2 text-xs font-bold text-[#444] hover:border-[#1a3c36] hover:bg-[#f0f6f4] transition shadow-2xs cursor-pointer"
                      title="Center the photo in the frame"
                    >
                      <span>🎯 Center</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPanY(-Math.round(maxSafeY * 10) / 10)}
                      className="flex items-center justify-center gap-1 rounded-xl border border-[#e2d9cd] bg-white py-2 text-xs font-bold text-[#444] hover:border-[#1a3c36] hover:bg-[#f0f6f4] transition shadow-2xs cursor-pointer"
                      title="Focus on bottom of photo"
                    >
                      <span>⬇️ Bottom</span>
                    </button>
                  </div>
                </div>

                {/* 3. ASPECT RATIO */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#b07838]">
                    Aspect Ratio Cropping
                  </h4>
                  <div className="mt-2 grid grid-cols-3 gap-2">
                    {ASPECT_RATIOS.map((r) => (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => setCropRatio(r.id)}
                        className={`rounded-xl border p-2 text-xs font-bold transition cursor-pointer ${
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

                {/* 4. ZOOM CONTROL */}
                <div className="rounded-2xl border border-[#ede4d8] bg-[#faf8f5] p-3.5">
                  <div className="flex items-center justify-between text-xs font-bold text-[#1d2925]">
                    <span>Photo Zoom &amp; Scale</span>
                    <span className="font-mono text-[#1a3c36]">{Math.round(scale * 100)}%</span>
                  </div>
                  <div className="mt-2.5 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setScale((s) => Math.max(fitMode === "cover" ? 1.0 : 0.4, Math.round((s - 0.1) * 10) / 10))}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#d8cfc3] bg-white text-[#555] hover:bg-[#f0ebe3] cursor-pointer"
                      title="Zoom out"
                    >
                      <ZoomOut className="h-4 w-4" />
                    </button>
                    <input
                      type="range"
                      min={fitMode === "cover" ? "1.0" : "0.4"}
                      max="3.0"
                      step="0.05"
                      value={scale}
                      onChange={(e) => setScale(parseFloat(e.target.value))}
                      className="h-2 w-full cursor-pointer appearance-none rounded-full bg-[#dfd6c9] accent-[#1a3c36]"
                    />
                    <button
                      type="button"
                      onClick={() => setScale((s) => Math.min(3.0, Math.round((s + 0.1) * 10) / 10))}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#d8cfc3] bg-white text-[#555] hover:bg-[#f0ebe3] cursor-pointer"
                      title="Zoom in"
                    >
                      <ZoomIn className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* PAN OFFSET DISPLAY & RESET */}
                <div className="flex items-center justify-between border-t border-[#eee5d8] pt-3 text-xs">
                  <span className="text-[11px] text-[#777]">
                    Pan Position: <strong className="font-mono text-[#333]">{panX}%, {panY}%</strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setPanX(0);
                      setPanY(0);
                      setScale(1.0);
                    }}
                    className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold text-[#888] hover:bg-[#f4efe8] hover:text-[#222] cursor-pointer"
                  >
                    <RotateCcw className="h-3 w-3" /> Reset Position
                  </button>
                </div>
              </div>
            )}

            {/* ================= TAB 2: BORDERS & MATS ================= */}
            {activeTab === "borders" && (
              <div className="space-y-5">
                {/* INNER BORDER (MAT BOARD) */}
                <div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#b07838]">
                        Inner Border (Mat Board)
                      </h4>
                      <p className="text-[11px] text-[#777]">
                        Inner mount border surrounding your photo
                      </p>
                    </div>
                    <span className="font-mono text-xs font-bold text-[#1a3c36]">
                      {innerBorderWidth}px
                    </span>
                  </div>

                  {/* Width slider */}
                  <div className="mt-2 flex items-center gap-3">
                    <input
                      type="range"
                      min="0"
                      max="35"
                      step="1"
                      value={innerBorderWidth}
                      onChange={(e) => setInnerBorderWidth(parseInt(e.target.value, 10))}
                      className="h-2 w-full cursor-pointer appearance-none rounded-full bg-[#dfd6c9] accent-[#1a3c36]"
                    />
                  </div>

                  {/* Color Swatches */}
                  <div className="mt-2.5 flex flex-wrap items-center gap-2">
                    {INNER_BORDER_COLORS.map((c) => (
                      <button
                        key={c.value}
                        type="button"
                        onClick={() => {
                          setInnerBorderColor(c.value);
                          if (c.value !== "transparent" && innerBorderWidth === 0) {
                            setInnerBorderWidth(10);
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
                        {c.value === "transparent" && (
                          <span className="text-[9px] font-bold text-[#999]">✕</span>
                        )}
                      </button>
                    ))}
                    <label className="flex h-7 items-center gap-1 rounded-full border border-[#d8cfc3] bg-white px-2 text-[10px] font-bold text-[#555] cursor-pointer">
                      <span>Custom</span>
                      <input
                        type="color"
                        value={innerBorderColor === "transparent" ? "#ffffff" : innerBorderColor}
                        onChange={(e) => {
                          setInnerBorderColor(e.target.value);
                          if (innerBorderWidth === 0) setInnerBorderWidth(10);
                        }}
                        className="h-4 w-4 cursor-pointer rounded border-0 bg-transparent"
                      />
                    </label>
                  </div>
                </div>

                {/* OUTER BORDER (MOULDING FRAME) */}
                <div className="border-t border-[#f0e8dc] pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#b07838]">
                        Outer Border (Frame Moulding)
                      </h4>
                      <p className="text-[11px] text-[#777]">
                        Outer solid framing edge
                      </p>
                    </div>
                    <span className="font-mono text-xs font-bold text-[#1a3c36]">
                      {outerBorderWidth}px
                    </span>
                  </div>

                  {/* Width slider */}
                  <div className="mt-2 flex items-center gap-3">
                    <input
                      type="range"
                      min="0"
                      max="40"
                      step="1"
                      value={outerBorderWidth}
                      onChange={(e) => setOuterBorderWidth(parseInt(e.target.value, 10))}
                      className="h-2 w-full cursor-pointer appearance-none rounded-full bg-[#dfd6c9] accent-[#1a3c36]"
                    />
                  </div>

                  {/* Color Swatches */}
                  <div className="mt-2.5 flex flex-wrap items-center gap-2">
                    {OUTER_BORDER_COLORS.map((c) => (
                      <button
                        key={c.value}
                        type="button"
                        onClick={() => {
                          setOuterBorderColor(c.value);
                          if (c.value !== "transparent" && outerBorderWidth === 0) {
                            setOuterBorderWidth(12);
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
                        {c.value === "transparent" && (
                          <span className="text-[9px] font-bold text-[#999]">✕</span>
                        )}
                      </button>
                    ))}
                    <label className="flex h-7 items-center gap-1 rounded-full border border-[#d8cfc3] bg-white px-2 text-[10px] font-bold text-[#555] cursor-pointer">
                      <span>Custom</span>
                      <input
                        type="color"
                        value={outerBorderColor === "transparent" ? "#18181b" : outerBorderColor}
                        onChange={(e) => {
                          setOuterBorderColor(e.target.value);
                          if (outerBorderWidth === 0) setOuterBorderWidth(12);
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
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#b07838]">
                  Rotate &amp; Orientation
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRotate((r) => (r - 90 + 360) % 360)}
                    className="flex items-center justify-center gap-2 rounded-xl border border-[#d8cfc3] bg-[#faf8f5] p-3 text-xs font-bold text-[#1d2925] hover:bg-[#f0ebe3] transition"
                  >
                    <RotateCcw className="h-4 w-4 text-[#b07838]" /> Rotate Left 90°
                  </button>
                  <button
                    type="button"
                    onClick={() => setRotate((r) => (r + 90) % 360)}
                    className="flex items-center justify-center gap-2 rounded-xl border border-[#d8cfc3] bg-[#faf8f5] p-3 text-xs font-bold text-[#1d2925] hover:bg-[#f0ebe3] transition"
                  >
                    <RotateCw className="h-4 w-4 text-[#b07838]" /> Rotate Right 90°
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFlipH((f) => !f)}
                    className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-xs font-bold transition ${
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
                    className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-xs font-bold transition ${
                      flipV
                        ? "border-[#1a3c36] bg-[#1a3c36] text-white"
                        : "border-[#d8cfc3] bg-[#faf8f5] text-[#1d2925] hover:bg-[#f0ebe3]"
                    }`}
                  >
                    <FlipVertical className="h-4 w-4" /> Flip Vertical
                  </button>
                </div>

                {/* FINE ANGLE SLIDER */}
                <div className="rounded-2xl border border-[#ede4d8] bg-[#faf8f5] p-4">
                  <div className="flex items-center justify-between text-xs font-bold text-[#1d2925]">
                    <span>Fine Angle Alignment</span>
                    <span className="font-mono text-[#1a3c36]">{angle > 0 ? `+${angle}` : angle}°</span>
                  </div>
                  <input
                    type="range"
                    min="-45"
                    max="45"
                    step="1"
                    value={angle}
                    onChange={(e) => setAngle(parseInt(e.target.value, 10))}
                    className="mt-3 h-2 w-full cursor-pointer appearance-none rounded-full bg-[#dfd6c9] accent-[#1a3c36]"
                  />
                  <div className="mt-2 flex justify-between text-[10px] text-[#888]">
                    <span>-45°</span>
                    <button
                      type="button"
                      onClick={() => setAngle(0)}
                      className="font-semibold text-[#b07838] hover:underline"
                    >
                      Reset Angle (0°)
                    </button>
                    <span>+45°</span>
                  </div>
                </div>
              </div>
            )}

            {/* ================= TAB 4: COLOR FILTERS ================= */}
            {activeTab === "filters" && (
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#b07838]">
                    Preset Color Filters
                  </h4>
                  <div className="mt-2.5 grid grid-cols-3 gap-2">
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
                </div>

                {/* MANUAL TONE ADJUSTMENTS */}
                <div className="space-y-3 rounded-2xl border border-[#ede4d8] bg-[#faf8f5] p-3.5 text-xs">
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
              <div className="space-y-5">
                {/* BLUR CONTROL */}
                <div className="rounded-2xl border border-[#ede4d8] bg-[#faf8f5] p-4">
                  <div className="flex items-center justify-between text-xs font-bold text-[#1d2925]">
                    <div>
                      <span className="text-sm font-black">Blur Effect</span>
                      <p className="text-[11px] font-normal text-[#777]">
                        Soft focus and depth-of-field blur
                      </p>
                    </div>
                    <span className="font-mono text-[#1a3c36]">{blur}px</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="15"
                    step="0.5"
                    value={blur}
                    onChange={(e) => setBlur(parseFloat(e.target.value))}
                    className="mt-3 h-2 w-full cursor-pointer appearance-none rounded-full bg-[#dfd6c9] accent-[#1a3c36]"
                  />
                  <div className="mt-2 flex justify-between text-[10px] text-[#888]">
                    <span>None (0px)</span>
                    <button
                      type="button"
                      onClick={() => setBlur(0)}
                      className="font-semibold text-[#b07838] hover:underline"
                    >
                      Clear Blur
                    </button>
                    <span>High (15px)</span>
                  </div>
                </div>

                {/* SHARPNESS CONTROL */}
                <div className="rounded-2xl border border-[#ede4d8] bg-[#faf8f5] p-4">
                  <div className="flex items-center justify-between text-xs font-bold text-[#1d2925]">
                    <div>
                      <span className="text-sm font-black">Sharpness &amp; Clarity</span>
                      <p className="text-[11px] font-normal text-[#777]">
                        Enhances fine details and edges
                      </p>
                    </div>
                    <span className="font-mono text-[#1a3c36]">+{sharpness}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={sharpness}
                    onChange={(e) => setSharpness(parseInt(e.target.value, 10))}
                    className="mt-3 h-2 w-full cursor-pointer appearance-none rounded-full bg-[#dfd6c9] accent-[#1a3c36]"
                  />
                  <div className="mt-2 flex justify-between text-[10px] text-[#888]">
                    <span>Original</span>
                    <button
                      type="button"
                      onClick={() => setSharpness(0)}
                      className="font-semibold text-[#b07838] hover:underline"
                    >
                      Clear Sharpness
                    </button>
                    <span>Crisp (+100%)</span>
                  </div>
                </div>
              </div>
            )}

            {/* ================= TAB 6: ADD TEXT ================= */}
            {activeTab === "text" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#b07838]">
                    Custom Text / Caption
                  </label>
                  <input
                    type="text"
                    value={textOverlay.text}
                    onChange={(e) =>
                      setTextOverlay((prev) => ({ ...prev, text: e.target.value }))
                    }
                    placeholder="e.g. Our Wedding Day, Summer 2026, Together Forever"
                    className="mt-1.5 w-full rounded-xl border border-[#d8cfc3] bg-[#faf8f5] px-3.5 py-2.5 text-xs text-[#1d2925] outline-none focus:border-[#1a3c36] focus:bg-white"
                  />
                </div>

                {/* FONT SELECTOR */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[11px] font-bold text-[#666]">Font Style</span>
                    <select
                      value={textOverlay.fontFamily}
                      onChange={(e) =>
                        setTextOverlay((prev) => ({ ...prev, fontFamily: e.target.value }))
                      }
                      className="mt-1 w-full rounded-lg border border-[#d8cfc3] bg-[#faf8f5] px-2.5 py-1.5 text-xs text-[#333] outline-none"
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
                      min="12"
                      max="36"
                      value={textOverlay.fontSize}
                      onChange={(e) =>
                        setTextOverlay((prev) => ({
                          ...prev,
                          fontSize: parseInt(e.target.value, 10),
                        }))
                      }
                      className="mt-2.5 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-[#dfd6c9] accent-[#1a3c36]"
                    />
                  </div>
                </div>

                {/* POSITION & ALIGNMENT */}
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

                {/* COLOR & STYLES */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#f0e8dc] pt-3">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-bold text-[#666]">Color:</span>
                    {["#ffffff", "#1d1d1d", "#d5a65a", "#e11d48", "#2563eb"].map((clr) => (
                      <button
                        key={clr}
                        type="button"
                        onClick={() =>
                          setTextOverlay((prev) => ({ ...prev, color: clr }))
                        }
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
                      onClick={() =>
                        setTextOverlay((prev) => ({ ...prev, bold: !prev.bold }))
                      }
                      className={`h-7 w-7 rounded-lg border font-bold text-xs ${
                        textOverlay.bold
                          ? "border-[#1a3c36] bg-[#1a3c36] text-white"
                          : "border-[#d8cfc3] bg-[#faf8f5] text-[#555]"
                      }`}
                    >
                      B
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setTextOverlay((prev) => ({ ...prev, italic: !prev.italic }))
                      }
                      className={`h-7 w-7 rounded-lg border italic text-xs ${
                        textOverlay.italic
                          ? "border-[#1a3c36] bg-[#1a3c36] text-white"
                          : "border-[#d8cfc3] bg-[#faf8f5] text-[#555]"
                      }`}
                    >
                      I
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* FOOTER ACTIONS */}
            <div className="mt-6 flex items-center justify-end gap-3 border-t border-[#f0e8dc] pt-4">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-[#d8cfc3] bg-white px-4 py-2.5 text-xs font-bold text-[#555] hover:bg-[#faf8f5] transition"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSave}
                className="inline-flex items-center gap-2 rounded-xl bg-[#1a3c36] px-6 py-2.5 text-xs font-bold text-white shadow hover:bg-[#235048] transition"
              >
                <Check className="h-4 w-4 text-[#d5a65a]" /> Apply Customization
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhotoAdjustModal;
