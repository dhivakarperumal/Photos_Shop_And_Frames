import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Eye, ImagePlus, Package, RotateCw } from "lucide-react";
import api from "../../api";
import PageContainer from "../../CommonComponents/PageContainer";

const Shop = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [frames, setFrames] = useState([]);
  const [selectedFrameId, setSelectedFrameId] = useState("All");
  const [selectedOrientation, setSelectedOrientation] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, catRes, frameRes] = await Promise.all([
          api.get("/products"),
          api.get("/categories").catch(() => ({ data: { data: [] } })),
          api.get("/frames?status=Active").catch(() => ({ data: { data: [] } })),
        ]);

        const rows = Array.isArray(prodRes.data?.data) ? prodRes.data.data : [];
        setProducts(rows.filter((product) => (product.status || "Active") === "Active"));

        const catRows = Array.isArray(catRes.data?.data) ? catRes.data.data : [];
        setCategories(catRows);

        const frameRows = Array.isArray(frameRes.data?.data) ? frameRes.data.data : [];
        setFrames(frameRows.filter((frame) => (frame.status || "Active") === "Active"));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredProducts = products.filter((p) => {
    const matchesCategory = selectedCategory === "All" || p.category === selectedCategory;
    const matchesFrame = selectedFrameId === "All" || String(p.frame_id) === String(selectedFrameId);
    const matchesOrientation = selectedOrientation === "All" || (p.orientation || "Portrait").toLowerCase() === selectedOrientation.toLowerCase();
    return matchesCategory && matchesFrame && matchesOrientation;
  });

  const visibleFrames = selectedOrientation === "All"
    ? frames
    : frames.filter((frame) => (frame.orientation || "Portrait").toLowerCase() === selectedOrientation.toLowerCase());

  const selectOrientation = (orientation) => {
    setSelectedOrientation(orientation);
    setSelectedFrameId("All");
  };

  return (
    <main className="min-h-screen bg-[#f7f3ed] py-10 ">
      <PageContainer>
        <div className="">
          {/* HEADER */}
          <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#b07838]">
                Q Frame Studio
              </p>
              <h1 className="mt-2 text-3xl font-black tracking-tight text-[#1d2925] sm:text-4xl">
                Shop our photo frames
              </h1>
              <p className="mt-2 max-w-xl text-sm text-[#6b6b63]">
                Choose a frame, customize it with your own photos, choose your size, and order directly for doorstep delivery.
              </p>
            </div>

            <span className="inline-flex items-center gap-2 rounded-full border border-[#e2d9cd] bg-white px-4 py-2 text-xs font-bold text-[#5d675f] shadow-xs">
              <Package className="h-4 w-4 text-[#b07838]" /> {filteredProducts.length} Available Products
            </span>
          </div>

          {/* FRAME TYPE SLIDER */}
          {frames.length > 0 && (
            <section className="mb-8 rounded-2xl bg-[#f1f1f1] px-5 py-6 md:px-6" aria-label="Explore frame types">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#b07838]">Explore frame types</p>
                  <h2 className="mt-1 text-xl font-bold text-[#171717] sm:text-2xl">Find the right shape for your memory</h2>
                </div>
                <div className="hidden items-center gap-2 sm:flex">
                  <button type="button" onClick={() => document.getElementById("shop-frame-slider")?.scrollBy({ left: -280, behavior: "smooth" })} className="flex h-9 w-9 items-center justify-center rounded-full border border-[#d8d2ca] bg-white text-[#444]" aria-label="Previous frame types"><ChevronLeft className="h-4 w-4" /></button>
                  <button type="button" onClick={() => document.getElementById("shop-frame-slider")?.scrollBy({ left: 280, behavior: "smooth" })} className="flex h-9 w-9 items-center justify-center rounded-full border border-[#d8d2ca] bg-white text-[#444]" aria-label="Next frame types"><ChevronRight className="h-4 w-4" /></button>
                </div>
              </div>

              <div className="mb-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {["All", "Portrait", "Landscape", "Square"].map((orientation) => (
                  <button
                    key={orientation}
                    type="button"
                    onClick={() => selectOrientation(orientation)}
                    className={`flex h-12 items-center justify-center gap-2 rounded-xl border text-sm font-bold transition ${selectedOrientation === orientation
                      ? "border-[#1a3c36] bg-[#1a3c36] text-white shadow-sm"
                      : "border-[#e1d9cf] bg-white text-[#444] hover:border-[#b07838]"
                      }`}
                  >
                    {orientation !== "All" && <RotateCw className="h-4 w-4" />}
                    {orientation === "All" ? "All Frames" : orientation}
                  </button>
                ))}
              </div>

              <div id="shop-frame-slider" className="flex snap-x gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {visibleFrames.map((frame) => (
                  <button key={frame.id} type="button" onClick={() => setSelectedFrameId(frame.id)} aria-label={`Select ${frame.orientation || "Photo frame"} frame`} className={`w-[180px] shrink-0 snap-start text-left ${String(selectedFrameId) === String(frame.id) ? "text-[#1a3c36]" : "text-[#222]"}`}>
                    <div className={`relative h-36 overflow-hidden rounded-xl border-2 bg-white ${String(selectedFrameId) === String(frame.id) ? "border-[#1a3c36]" : "border-transparent"}`}>
                      <img src={frame.frame_image} alt={frame.frame_name} className="h-full w-full object-contain" />
                      <span className="absolute bottom-2 left-2 rounded-full bg-black/65 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-xs">
                        {frame.orientation || "Photo frame"}
                      </span>
                    </div>
                  </button>
                ))}
                {visibleFrames.length === 0 && <p className="w-full py-8 text-center text-sm text-[#777]">No frames available for this orientation.</p>}
              </div>
            </section>
          )}

          {/* CATEGORY FILTER PILLS */}
          <div className="mb-8 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setSelectedCategory("All")}
              className={`rounded-full px-4 py-2 text-xs font-bold transition ${selectedCategory === "All"
                ? "bg-[#1a3c36] text-white shadow-sm"
                : "border border-[#e0d6c8] bg-white text-[#555] hover:border-[#b07838]"
                }`}
            >
              All Frames ({products.length})
            </button>

            {categories.map((cat) => (
              <button
                key={cat.id || cat.category_id}
                type="button"
                onClick={() => setSelectedCategory(cat.category_name)}
                className={`rounded-full px-4 py-2 text-xs font-bold transition ${selectedCategory === cat.category_name
                  ? "bg-[#1a3c36] text-white shadow-sm"
                  : "border border-[#e0d6c8] bg-white text-[#555] hover:border-[#b07838]"
                  }`}
              >
                {cat.category_name}
              </button>
            ))}
          </div>

          {/* PRODUCT GRID */}
          {loading ? (
            <div className="py-24 text-center">
              <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-[#b07838] border-t-transparent" />
              <p className="mt-3 text-sm font-semibold text-[#777]">Loading products...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="rounded-3xl border border-[#e7ded2] bg-white py-20 text-center text-sm text-[#777]">
              <Package className="mx-auto h-12 w-12 text-[#ccc]" />
              <p className="mt-3 font-semibold text-[#444]">No products available in this category.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredProducts.map((product) => {
                const variant = product.size_variants?.[0] || {};
                const image = product.product_images?.[0] || product.frame_data?.frame_image;
                const slotCount = product.frame_data?.photo_slots?.length || 0;

                return (
                  <article
                    key={product.id}
                    className="group flex flex-col overflow-hidden rounded-3xl border border-[#e7ded2] bg-white shadow-xs transition hover:-translate-y-1.5 hover:shadow-xl"
                  >
                    {/* PRODUCT IMAGE / FRAME */}
                    <Link
                      to={`/products/${product.id}`}
                      className="relative flex h-64 items-center justify-center overflow-hidden bg-[#f4eee6] p-5"
                    >
                      {image ? (
                        <img
                          src={image}
                          alt={product.product_name}
                          className="h-full w-full object-contain transition duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <ImagePlus className="h-12 w-12 text-[#b9aa98]" />
                      )}

                      {slotCount > 0 && (
                        <span className="absolute bottom-3 left-3 rounded-full bg-black/60 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur-xs">
                          {slotCount} Photo Position{slotCount !== 1 ? "s" : ""}
                        </span>
                      )}

                      <span className="absolute right-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#666] shadow-xs">
                        {product.orientation || "Portrait"}
                      </span>
                    </Link>

                    {/* PRODUCT CONTENT */}
                    <div className="flex flex-1 flex-col p-5">
                      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#b07838]">
                        {product.category || "Photo Frame"}
                      </p>

                      <Link to={`/products/${product.id}`}>
                        <h2 className="mt-1.5 truncate text-base font-bold text-[#1d2925] hover:text-[#b07838]">
                          {product.product_name}
                        </h2>
                      </Link>

                      <div className="mt-4 flex items-center justify-between">
                        <div>
                          <span className="text-xl font-black text-[#1a3c36]">
                            ₹{variant.offer_price || variant.mrp || "--"}
                          </span>
                          {variant.mrp && variant.offer_price && variant.mrp > variant.offer_price && (
                            <span className="ml-2 text-xs text-[#999] line-through">
                              ₹{variant.mrp}
                            </span>
                          )}
                        </div>

                        {product.size_variants?.length > 1 && (
                          <span className="text-[11px] font-semibold text-[#888]">
                            {product.size_variants.length} Sizes
                          </span>
                        )}
                      </div>

                      {/* ACTION BUTTON */}
                      <div className="mt-5 pt-3 border-t border-[#f0e8dc] mt-auto">
                        <button
                          type="button"
                          onClick={() => navigate(`/products/${product.id}`)}
                          className="flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-[#1a3c36] text-xs font-bold text-white shadow-sm transition hover:bg-[#235048]"
                        >
                          <Eye className="h-4 w-4" /> View Product Details
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </PageContainer>
    </main>
  );
};

export default Shop;
