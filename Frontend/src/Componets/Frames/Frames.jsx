import React, { useEffect, useState } from "react";
import {
  Check,
  Eye,
  Frame,
  ImagePlus,
  Layers,
  Package,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api";
import PageContainer from "../../CommonComponents/PageContainer";
import PageHeader from "../../CommonComponents/PageHeader";
import toast from "react-hot-toast";

const orientationCards = ["All", "Portrait", "Landscape", "Square"];

const Frames = () => {
  const [frames, setFrames] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrientation, setSelectedOrientation] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [previewFrame, setPreviewFrame] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [framesRes, prodsRes] = await Promise.all([
          api.get("/frames"),
          api.get("/products").catch(() => ({ data: { data: [] } })),
        ]);

        const rawFrames = Array.isArray(framesRes.data?.data)
          ? framesRes.data.data
          : [];
        setFrames(rawFrames.filter((f) => (f.status || "Active") === "Active"));

        const rawProducts = Array.isArray(prodsRes.data?.data)
          ? prodsRes.data.data
          : [];
        setProducts(rawProducts.filter((p) => (p.status || "Active") === "Active"));
      } catch (err) {
        console.error("Failed to load frames:", err);
        toast.error("Failed to load frame templates");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter frames by orientation and search term
  const filteredFrames = frames.filter((frame) => {
    const matchesOrientation =
      selectedOrientation === "All" ||
      (frame.orientation || "Portrait").toLowerCase() ===
        selectedOrientation.toLowerCase();
    const matchesSearch =
      !searchTerm ||
      frame.frame_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      frame.orientation?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesOrientation && matchesSearch;
  });

  // Find linked product for a frame
  const getLinkedProduct = (frame) => {
    return products.find(
      (p) =>
        Number(p.frame_id) === Number(frame.id) ||
        Number(p.frame_data?.id) === Number(frame.id) ||
        String(p.frame_data?.uuid || "").toLowerCase() ===
          String(frame.uuid || "").toLowerCase() ||
        String(p.product_name || "").trim().toLowerCase() ===
          String(frame.frame_name || "").trim().toLowerCase()
    );
  };

  return (
    <main className="min-h-screen bg-[#f7f3ed]">
      <PageHeader title="Frames" />
      <PageContainer className="py-10">
        <div>
          {/* HEADER / INTRO */}
          <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#b07838]">
                Q Frame Studio
              </p>
              <h1 className="mt-2 text-3xl font-black tracking-tight text-[#1d2925] sm:text-4xl">
                Explore Our Frame Templates
              </h1>
              <p className="mt-2 max-w-xl text-sm text-[#6b6b63]">
                Discover our studio-crafted photo frame designs. Choose your desired orientation, layout, and personalize directly with your photos.
              </p>
            </div>

            <span className="inline-flex items-center gap-2 rounded-full border border-[#e2d9cd] bg-white px-4 py-2 text-xs font-bold text-[#5d675f] shadow-xs">
              <Frame className="h-4 w-4 text-[#b07838]" /> {filteredFrames.length} Available Frames
            </span>
          </div>

          {/* FRAME ORIENTATION SELECTOR (MATCHING SHOP DESIGN) */}
          <section
            className="mb-8 rounded-2xl bg-[#f1f1f1] px-3 py-5 sm:px-5 md:px-6"
            aria-label="Choose frame orientation"
          >
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {orientationCards.map((orientation) => {
                const isSelected = selectedOrientation === orientation;
                return (
                  <button
                    key={orientation}
                    type="button"
                    onClick={() => setSelectedOrientation(orientation)}
                    aria-label={`Show ${orientation} frames`}
                    className={`text-left transition ${
                      isSelected ? "text-[#1a3c36]" : "text-[#171717]"
                    }`}
                  >
                    <div
                      className={`h-40 overflow-hidden rounded-xl border-2 bg-white sm:h-48 transition ${
                        isSelected ? "border-[#1a3c36] shadow-sm" : "border-transparent"
                      }`}
                    >
                      <div className="flex h-full items-center justify-center bg-[#f7f7f7]">
                        {orientation === "All" ? (
                          <div className="flex flex-col items-center gap-2 text-[#777]">
                            <Layers className="h-10 w-10 text-[#1a3c36]" />
                            <span className="text-xs font-bold">All Orientations</span>
                          </div>
                        ) : (
                          <div
                            className={`${
                              orientation === "Portrait"
                                ? "h-4/5 w-2/5"
                                : orientation === "Landscape"
                                ? "h-3/5 w-4/5"
                                : "aspect-square h-3/5"
                            } rounded-md border-4 border-[#1a3c36] bg-[#dce9e4] shadow-[inset_0_0_0_8px_#f7f7f7,0_5px_12px_rgba(26,60,54,0.15)]`}
                          />
                        )}
                      </div>
                    </div>
                    <span className="mt-2.5 block text-center text-base font-bold">
                      {orientation === "All" ? "All Frames" : orientation}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* SEARCH AND FILTER BAR */}
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#999]" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search frame designs by name..."
                className="w-full rounded-2xl border border-[#e2d9cd] bg-white py-2.5 pl-10 pr-4 text-xs font-medium text-[#1d2925] outline-none transition placeholder:text-[#999] focus:border-[#1a3c36] focus:ring-1 focus:ring-[#1a3c36]"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#999] hover:text-[#333]"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* FILTER PILLS */}
            <div className="flex flex-wrap items-center gap-2">
              {orientationCards.map((orientation) => (
                <button
                  key={orientation}
                  type="button"
                  onClick={() => setSelectedOrientation(orientation)}
                  className={`rounded-full px-4 py-2 text-xs font-bold transition ${
                    selectedOrientation === orientation
                      ? "bg-[#1a3c36] text-white shadow-sm"
                      : "border border-[#e0d6c8] bg-white text-[#555] hover:border-[#b07838]"
                  }`}
                >
                  {orientation === "All" ? `All (${frames.length})` : orientation}
                </button>
              ))}
            </div>
          </div>

          {/* FRAMES GRID (MATCHING SHOP PRODUCT CARD DESIGN) */}
          {loading ? (
            <div className="py-24 text-center">
              <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-[#b07838] border-t-transparent" />
              <p className="mt-3 text-sm font-semibold text-[#777]">
                Loading frame templates...
              </p>
            </div>
          ) : filteredFrames.length === 0 ? (
            <div className="rounded-3xl border border-[#e7ded2] bg-white py-20 text-center text-sm text-[#777]">
              <Package className="mx-auto h-12 w-12 text-[#ccc]" />
              <p className="mt-3 font-semibold text-[#444]">
                No frames available for this orientation.
              </p>
              <p className="mt-1 text-xs text-[#999]">
                Try selecting a different orientation or clear your search.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
              {filteredFrames.map((frame) => {
                const slotCount = frame.photo_slots?.length || 0;
                const linkedProduct = getLinkedProduct(frame);
                const variant = linkedProduct?.size_variants?.[0];
                const price = variant?.offer_price || variant?.mrp;
                const destinationUrl = linkedProduct
                  ? `/products/${linkedProduct.id}`
                  : null;

                return (
                  <article
                    key={frame.id || frame.uuid}
                    className="group flex flex-col overflow-hidden rounded-3xl border border-[#e7ded2] bg-white shadow-xs transition hover:-translate-y-1.5 hover:shadow-xl"
                  >
                    {/* FRAME IMAGE (MATCHING SHOP CARD) */}
                    <div
                      onClick={() => {
                        if (destinationUrl) navigate(destinationUrl);
                        else setPreviewFrame(frame);
                      }}
                      className="relative flex h-64 items-center justify-center overflow-hidden bg-[#f4eee6] p-5 cursor-pointer"
                    >
                      {frame.frame_image ? (
                        <img
                          src={frame.frame_image}
                          alt={frame.frame_name}
                          className="h-full w-full object-contain transition duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <Frame className="h-12 w-12 text-[#b9aa98]" />
                      )}

                      {/* SLOTS COUNT BADGE */}
                      {slotCount > 0 && (
                        <span className="absolute bottom-3 left-3 rounded-full bg-black/60 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur-xs flex items-center gap-1">
                          <ImagePlus className="h-3 w-3 text-[#d4a553]" />
                          {slotCount} Photo Position{slotCount !== 1 ? "s" : ""}
                        </span>
                      )}

                      {/* ORIENTATION BADGE */}
                      <span className="absolute right-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#666] shadow-xs">
                        {frame.orientation || "Portrait"}
                      </span>
                    </div>

                    {/* CARD BODY */}
                    <div className="flex flex-1 flex-col p-5">
                      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#b07838]">
                        {frame.orientation || "Portrait"} Frame
                      </p>

                      <h2
                        onClick={() => {
                          if (destinationUrl) navigate(destinationUrl);
                          else setPreviewFrame(frame);
                        }}
                        className="mt-1.5 truncate text-base font-bold text-[#1d2925] hover:text-[#b07838] cursor-pointer"
                        title={frame.frame_name}
                      >
                        {frame.frame_name}
                      </h2>

                      <div className="mt-4 flex items-center justify-between">
                        <div>
                          {price ? (
                            <>
                              <span className="text-xl font-black text-[#1a3c36]">
                                ₹{price}
                              </span>
                              {variant?.mrp && variant?.offer_price && variant.mrp > variant.offer_price && (
                                <span className="ml-2 text-xs text-[#999] line-through">
                                  ₹{variant.mrp}
                                </span>
                              )}
                            </>
                          ) : (
                            <span className="text-sm font-bold text-[#1a3c36]">
                              {slotCount} Multi-Photo Layout
                            </span>
                          )}
                        </div>

                        {linkedProduct?.size_variants?.length > 1 && (
                          <span className="text-[11px] font-semibold text-[#888]">
                            {linkedProduct.size_variants.length} Sizes
                          </span>
                        )}
                      </div>

                      {/* CARD ACTION BUTTON */}
                      <div className="mt-auto border-t border-[#f0e8dc] pt-3">
                        {destinationUrl ? (
                          <Link
                            to={destinationUrl}
                            className="flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-[#1a3c36] text-xs font-bold text-white shadow-sm transition hover:bg-[#235048]"
                          >
                            <ImagePlus className="h-4 w-4" />
                            Customize Photos
                          </Link>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setPreviewFrame(frame)}
                            className="flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-[#1a3c36] text-xs font-bold text-white shadow-sm transition hover:bg-[#235048]"
                          >
                            <Eye className="h-4 w-4" />
                            View Template Layout
                          </button>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </PageContainer>

      {/* ================= FRAME PREVIEW MODAL ================= */}
      {previewFrame && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs overflow-y-auto"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative my-8 w-full max-w-2xl rounded-3xl border border-[#ebdcc8] bg-white p-6 shadow-2xl md:p-8">
            <button
              type="button"
              onClick={() => setPreviewFrame(null)}
              className="absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-full text-[#999] hover:bg-[#f4efe8] hover:text-[#333]"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="border-b border-[#f0e8dc] pb-4">
              <span className="inline-block rounded-full bg-[#f2ecdf] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#9b6b2d]">
                {previewFrame.orientation} Frame Template
              </span>
              <h2 className="mt-2 text-2xl font-black text-[#1d2925]">
                {previewFrame.frame_name}
              </h2>
              <p className="mt-1 text-xs text-[#777]">
                Configured with {previewFrame.photo_slots?.length || 0} photo position
                {(previewFrame.photo_slots?.length || 0) !== 1 ? "s" : ""}.
              </p>
            </div>

            {/* INTERACTIVE CANVAS PREVIEW WITH SLOTS */}
            <div className="mt-6 flex justify-center">
              <div
                className={`relative overflow-hidden rounded-2xl border border-[#ebdcc8] bg-[#f9f7f4] shadow-md ${
                  previewFrame.orientation === "Portrait"
                    ? "aspect-[3/4] w-full max-w-sm"
                    : previewFrame.orientation === "Landscape"
                    ? "aspect-[4/3] w-full max-w-md"
                    : "aspect-square w-full max-w-sm"
                }`}
              >
                {/* FRAME BACKGROUND */}
                {previewFrame.frame_image && (
                  <img
                    src={previewFrame.frame_image}
                    alt={previewFrame.frame_name}
                    className="absolute inset-0 h-full w-full object-contain pointer-events-none"
                  />
                )}

                {/* PHOTO SLOTS OVERLAY */}
                {(previewFrame.photo_slots || []).map((slot, idx) => (
                  <div
                    key={slot.id || idx}
                    style={{
                      top: slot.top,
                      left: slot.left,
                      width: slot.width,
                      height: slot.height,
                    }}
                    className={`absolute flex flex-col items-center justify-center border-2 border-dashed border-[#b07838] bg-[#b07838]/15 text-center transition ${
                      slot.shape === "circle" ? "rounded-full" : "rounded-lg"
                    }`}
                  >
                    <ImagePlus className="h-5 w-5 text-[#b07838]" />
                    <span className="mt-1 rounded bg-white/90 px-1.5 py-0.5 text-[10px] font-bold text-[#1a3c36] shadow-2xs">
                      {slot.name || `Slot ${idx + 1}`}
                    </span>
                    <span className="text-[9px] font-semibold text-[#8a5d2a]">
                      {slot.shape || "rectangle"} • {slot.objectFit || "cover"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* MODAL FOOTER */}
            <div className="mt-6 flex items-center justify-between border-t border-[#f0e8dc] pt-4">
              <div className="text-xs text-[#777]">
                Template ID: <span className="font-mono font-bold text-[#333]">{previewFrame.uuid?.slice(0, 8) || previewFrame.id}</span>
              </div>
              <button
                type="button"
                onClick={() => setPreviewFrame(null)}
                className="rounded-xl bg-[#1a3c36] px-6 py-2.5 text-xs font-bold text-white shadow transition hover:bg-[#235048]"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default Frames;
