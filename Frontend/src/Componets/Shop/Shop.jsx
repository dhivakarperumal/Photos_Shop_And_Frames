import { useEffect, useState } from "react";
import { Package } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import api from "../../api";
import PageContainer from "../../CommonComponents/PageContainer";
import ProductCard from "../../CommonComponents/ProductCard";
import PageHeader from "../../CommonComponents/PageHeader";

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedOrientation, setSelectedOrientation] = useState("All");
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedCategoryType = searchParams.get("categoryType") || "All";

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
    const matchesCategory = selectedCategory === "All" || p.category === selectedCategory;
    const matchesCategoryType = selectedCategoryType === "All" || categories.some((category) =>
      String(category.category_name || "").trim().toLowerCase() === String(p.category || "").trim().toLowerCase()
      && String(category.category_type || "").trim().toLowerCase() === selectedCategoryType.toLowerCase()
      && (category.status || "Active") === "Active"
    );
    const matchesOrientation = selectedOrientation === "All" || (p.orientation || "Portrait").toLowerCase() === selectedOrientation.toLowerCase();
    return matchesCategory && matchesCategoryType && matchesOrientation;
  });

  const orientationCards = ["Portrait", "Landscape", "Square"];

  const selectOrientation = (orientation) => {
    setSelectedOrientation(orientation);
  };

  return (
    <main className="min-h-screen bg-[#f7f3ed]">
      <PageHeader title="Shop" />
      <PageContainer className="py-10">
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

          {/* FRAME ORIENTATION SELECTOR */}
          <section className="mb-8 rounded-2xl bg-[#f1f1f1] px-3 py-5 sm:px-5 md:px-6" aria-label="Choose frame orientation">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {orientationCards.map((orientation) => (
                  <button
                    key={orientation}
                    type="button"
                    onClick={() => selectOrientation(orientation)}
                    aria-label={`Show ${orientation} frames`}
                    className={`text-left transition ${selectedOrientation === orientation ? "text-[#1a3c36]" : "text-[#171717]"}`}
                  >
                    <div className={`h-52 overflow-hidden rounded-xl border-2 bg-white sm:h-56 ${selectedOrientation === orientation ? "border-[#1a3c36]" : "border-transparent"}`}>
                      <div className="flex h-full items-center justify-center bg-[#f7f7f7]">
                        <div className={`${orientation === "Portrait" ? "h-4/5 w-2/5" : orientation === "Landscape" ? "h-3/5 w-4/5" : "aspect-square h-3/5"} rounded-md border-4 border-[#1a3c36] bg-[#dce9e4] shadow-[inset_0_0_0_8px_#f7f7f7,0_5px_12px_rgba(26,60,54,0.15)]`} />
                      </div>
                    </div>
                    <span className="mt-3 block text-center text-lg font-bold">{orientation}</span>
                  </button>
                ))}
              </div>
            </section>

          {/* CATEGORY FILTER PILLS */}
          <div className="mb-8 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setSelectedCategory("All");
                setSearchParams({});
              }}
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
                onClick={() => {
                  setSelectedCategory(cat.category_name);
                  setSearchParams({});
                }}
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
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </PageContainer>
    </main>
  );
};

export default Shop;
