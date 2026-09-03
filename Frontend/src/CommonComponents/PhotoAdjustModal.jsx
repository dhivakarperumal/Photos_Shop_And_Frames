import React, { useEffect, useRef, useState } from "react";
import {
  Check,
  Move,
  RotateCcw,
  Sliders,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";

/**
 * Reusable Photo Position & Zoom Adjustment Modal.
 * Supports mouse & touch drag-to-pan, zoom slider, mouse wheel zoom, and reset.
 */
const PhotoAdjustModal = ({
  isOpen,
  onClose,
  photoSrc,
  slot,
  initialAdjustment = { panX: 0, panY: 0, scale: 1.0 },
  onSave,
}) => {
  const [panX, setPanX] = useState(initialAdjustment?.panX || 0);
  const [panY, setPanY] = useState(initialAdjustment?.panY || 0);
  const [scale, setScale] = useState(initialAdjustment?.scale || 1.0);
  const [isDragging, setIsDragging] = useState(false);

  const dragStartRef = useRef({ x: 0, y: 0, startPanX: 0, startPanY: 0 });
  const viewportRef = useRef(null);

  // Sync state with initial values when modal opens
  useEffect(() => {
    if (isOpen) {
      setPanX(initialAdjustment?.panX || 0);
      setPanY(initialAdjustment?.panY || 0);
      setScale(initialAdjustment?.scale || 1.0);
    }
  }, [isOpen, initialAdjustment]);

  if (!isOpen || !photoSrc) return null;

  // Calculate viewport aspect ratio from slot dimensions
  const parsePercent = (val) => {
    if (typeof val === "string" && val.includes("%")) {
      return parseFloat(val) || 100;
    }
    return parseFloat(val) || 100;
  };

  const slotW = parsePercent(slot?.width);
  const slotH = parsePercent(slot?.height);
  const slotRatio = slotW > 0 && slotH > 0 ? slotW / slotH : 1;

  // Compute display box dimensions (max 320px)
  let boxW = 320;
  let boxH = 320;
  if (slotRatio >= 1) {
    boxW = 320;
    boxH = Math.max(160, Math.round(320 / slotRatio));
  } else {
    boxH = 320;
    boxW = Math.max(160, Math.round(320 * slotRatio));
  }

  const isCircle = slot?.shape === "circle";

  // Drag handlers using Pointer Events (handles mouse & touch uniformly)
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
    } catch (err) {
      // fallback
    }
  };

  const handlePointerMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();

    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;

    // Convert pixel delta to percentage of viewport box
    const deltaPercentX = (dx / (boxW || 1)) * 100;
    const deltaPercentY = (dy / (boxH || 1)) * 100;

    // Calculate maximum pan bounds based on scale zoom
    const maxPan = Math.max(40, (scale - 1) * 60 + 40);

    const newPanX = Math.min(maxPan, Math.max(-maxPan, dragStartRef.current.startPanX + deltaPercentX));
    const newPanY = Math.min(maxPan, Math.max(-maxPan, dragStartRef.current.startPanY + deltaPercentY));

    setPanX(Math.round(newPanX * 10) / 10);
    setPanY(Math.round(newPanY * 10) / 10);
  };

  const handlePointerUp = (e) => {
    setIsDragging(false);
    try {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    } catch (err) {
      // fallback
    }
  };

  // Mouse wheel zoom
  const handleWheel = (e) => {
    e.preventDefault();
    const zoomStep = 0.08;
    const newScale = e.deltaY < 0 ? Math.min(3.0, scale + zoomStep) : Math.max(1.0, scale - zoomStep);
    setScale(Math.round(newScale * 100) / 100);
  };

  const handleReset = () => {
    setPanX(0);
    setPanY(0);
    setScale(1.0);
  };

  const handleSave = () => {
    if (onSave) {
      onSave({
        panX,
        panY,
        scale,
      });
    }
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-md rounded-3xl border border-[#ebe3d7] bg-white p-5 shadow-2xl md:p-6">
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-[#f0e8dc] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#eef6f3] text-[#1a3c36]">
              <Move className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-[#1d2925]">
                Adjust Photo Position
              </h3>
              <p className="text-[11px] text-[#777]">
                {slot?.name || "Photo Slot"} • Drag to reposition &amp; zoom
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-[#888] hover:bg-[#f4efe8] hover:text-[#222]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* VIEWPORT AREA */}
        <div className="my-4 flex flex-col items-center">
          <div
            className="relative flex items-center justify-center overflow-hidden rounded-2xl border border-[#e5ded4] bg-[#222] p-4 select-none shadow-inner"
            style={{ width: "100%", height: 350 }}
          >
            {/* CROP MASK CONTAINER */}
            <div
              ref={viewportRef}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              onWheel={handleWheel}
              className={`relative overflow-hidden border-2 border-white shadow-2xl transition-shadow ${
                isCircle ? "rounded-full" : "rounded-xl"
              } ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
              style={{
                width: `${boxW}px`,
                height: `${boxH}px`,
                boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.65)",
              }}
              title="Click and drag to pan photo. Scroll to zoom."
            >
              <img
                src={photoSrc}
                alt="Adjust preview"
                draggable={false}
                className="pointer-events-none absolute select-none"
                style={{
                  top: "50%",
                  left: "50%",
                  width: "100%",
                  height: "100%",
                  objectFit: slot?.objectFit === "contain" ? "contain" : "cover",
                  transform: `translate(calc(-50% + ${panX}%), calc(-50% + ${panY}%)) scale(${scale})`,
                  transition: isDragging ? "none" : "transform 0.05s ease-out",
                }}
              />

              {/* CENTER GUIDE RETICLE */}
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-30">
                <div className="h-4 w-4 border border-dashed border-white/60" />
              </div>
            </div>

            {/* DRAG HINT BADGE */}
            <div className="pointer-events-none absolute bottom-2 rounded-full bg-black/60 px-3 py-1 text-[10px] font-semibold text-white backdrop-blur-xs flex items-center gap-1.5">
              <Move className="h-3 w-3 text-[#d4a553]" />
              {isDragging ? "Moving..." : "Drag to move • Scroll to zoom"}
            </div>
          </div>
        </div>

        {/* CONTROLS (ZOOM SLIDER & RESET) */}
        <div className="space-y-3 rounded-2xl border border-[#ede4d8] bg-[#faf8f5] p-3.5">
          {/* ZOOM CONTROL */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setScale((s) => Math.max(1.0, Math.round((s - 0.1) * 10) / 10))}
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#d8cfc3] bg-white text-[#555] hover:bg-[#f0ebe3]"
              title="Zoom Out"
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </button>

            <div className="flex-1 flex items-center gap-2">
              <input
                type="range"
                min="1.0"
                max="3.0"
                step="0.05"
                value={scale}
                onChange={(e) => setScale(parseFloat(e.target.value))}
                className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-[#dfd6c9] accent-[#1a3c36]"
              />
              <span className="w-10 text-right font-mono text-[11px] font-bold text-[#1a3c36]">
                {Math.round(scale * 100)}%
              </span>
            </div>

            <button
              type="button"
              onClick={() => setScale((s) => Math.min(3.0, Math.round((s + 0.1) * 10) / 10))}
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#d8cfc3] bg-white text-[#555] hover:bg-[#f0ebe3]"
              title="Zoom In"
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* QUICK POSITION RESET */}
          <div className="flex items-center justify-between border-t border-[#eee5d8] pt-2.5 text-xs">
            <span className="text-[11px] text-[#777]">
              Offset: <strong className="font-mono text-[#444]">{panX > 0 ? `+${panX}` : panX}%, {panY > 0 ? `+${panY}` : panY}%</strong>
            </span>

            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-semibold text-[#888] hover:bg-white hover:text-[#222]"
            >
              <RotateCcw className="h-3 w-3" /> Reset
            </button>
          </div>
        </div>

        {/* FOOTER ACTIONS */}
        <div className="mt-4 flex items-center justify-end gap-2.5 border-t border-[#f0e8dc] pt-3.5">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-[#d8cfc3] bg-white px-4 py-2 text-xs font-bold text-[#555] transition hover:bg-[#faf8f5]"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#1a3c36] px-5 py-2 text-xs font-bold text-white shadow transition hover:bg-[#235048]"
          >
            <Check className="h-3.5 w-3.5" /> Apply Position
          </button>
        </div>
      </div>
    </div>
  );
};

export default PhotoAdjustModal;
