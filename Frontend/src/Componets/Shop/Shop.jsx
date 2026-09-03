import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, ImagePlus, Package } from "lucide-react";
import api from "../../api";
import PageContainer from "../../CommonComponents/PageContainer";

const Shop = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, catRes] = await Promise.all([
          api.get("/products"),
          api.get("/categories").catch(() => ({ data: { data: [] } })),
        ]);

        const rows = Array.isArray(prodRes.data?.data) ? prodRes.data.data : [];
        setProducts(rows.filter((product) => (product.status || "Active") === "Active"));

        const catRows = Array.isArray(catRes.data?.data) ? catRes.data.data : [];
        setCategories(catRows);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredProducts = products.filter((p) => {
    if (selectedCategory === "All") return true;
    return p.category === selectedCategory;
  });

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
