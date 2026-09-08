import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowUpDown,
  Frame,
  ImagePlus,
  Layers,
  Package,
  RotateCcw,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { useSearchParams } from "react-router-dom";
import api from "../../api";
import PageContainer from "../../CommonComponents/PageContainer";
import PageHeader from "../../CommonComponents/PageHeader";
import ProductCard from "../../CommonComponents/ProductCard";
import toast from "react-hot-toast";

const ORIENTATION_CARDS = ["All", "Portrait", "Landscape", "Square"];

const SORT_OPTIONS = [
  { label: "Featured & Popular", value: "featured" },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
  { label: "Newest Arrivals", value: "latest" },
];

const Frames = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();

  // Filters
  const initialOrientation = searchParams.get("orientation") || "All";
  const initialCategory = searchParams.get("category") || "All";
  const initialSearch = searchParams.get("search") || "";

  const [selectedOrientation, setSelectedOrientation] = useState(initialOrientation);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [sortBy, setSortBy] = useState("featured");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [prodsRes, catRes] = await Promise.all([
          api.get("/products"),
          api.get("/categories").catch(() => ({ data: { data: [] } })),
        ]);

        const rawProducts = Array.isArray(prodsRes.data?.data)
          ? prodsRes.data.data
          : [];
        const activeProducts = rawProducts.filter(
          (p) => (p.status || "Active").toLowerCase() === "active"
        );
        setProducts(activeProducts);

        // Derive frame categories
        const catRows = Array.isArray(catRes.data?.data) ? catRes.data.data : [];
        const frameCategoryNames = new Set(
          activeProducts.map((p) => p.category).filter(Boolean)
        );

        catRows
          .filter((c) => {
            const type = String(c.category_type || "").toLowerCase();
            return type === "frame" || type === "frames" || type === "photo frame";
          })
          .forEach((c) => {
            if (c.category_name) frameCategoryNames.add(c.category_name);
          });

        setCategories(Array.from(frameCategoryNames));
      } catch (err) {
        console.error("Failed to load frame products:", err);
        toast.error("Failed to load frame products");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Counts per orientation
  const orientationCounts = useMemo(() => {
    const counts = { All: products.length, Portrait: 0, Landscape: 0, Square: 0 };
    products.forEach((p) => {
      const ori = p.orientation || "Portrait";
      if (counts[ori] !== undefined) {
        counts[ori]++;
      }
    });
    return counts;
  }, [products]);

  // Filtered and sorted products
  const filteredProducts = useMemo(() => {
    return products
      .filter((product) => {
        // 1. Orientation filter
        const matchesOrientation =
          selectedOrientation === "All" ||
          (product.orientation || "Portrait").toLowerCase() ===
            selectedOrientation.toLowerCase();

        // 2. Category filter
        const matchesCategory =
          selectedCategory === "All" || product.category === selectedCategory;

        // 3. Search term
        const q = searchTerm.trim().toLowerCase();
        const matchesSearch =
          !q ||
          product.product_name?.toLowerCase().includes(q) ||
          product.category?.toLowerCase().includes(q) ||
          product.description?.toLowerCase().includes(q) ||
          product.orientation?.toLowerCase().includes(q);

        return matchesOrientation && matchesCategory && matchesSearch;
      })
      .sort((a, b) => {
        const priceA = Number(
          a.size_variants?.[0]?.offer_price ||
            a.size_variants?.[0]?.mrp ||
            a.offer_price ||
            a.price ||
            0
        );
        const priceB = Number(
          b.size_variants?.[0]?.offer_price ||
            b.size_variants?.[0]?.mrp ||
            b.offer_price ||
            b.price ||
            0
        );

        if (sortBy === "price_asc") return priceA - priceB;
        if (sortBy === "price_desc") return priceB - priceA;
        if (sortBy === "latest") {
          return new Date(b.created_at || 0) - new Date(a.created_at || 0);
        }
        return 0;
      });
  }, [products, selectedOrientation, selectedCategory, searchTerm, sortBy]);

  const handleResetFilters = () => {
    setSelectedOrientation("All");
    setSelectedCategory("All");
    setSearchTerm("");
    setSortBy("featured");
    setSearchParams({});
  };

  const hasActiveFilters =
    selectedOrientation !== "All" ||
    selectedCategory !== "All" ||
    Boolean(searchTerm.trim());

  return (
    <main className="min-h-screen bg-[#f8f6f1]">
      <PageHeader title="Frames" />

      <PageContainer className="py-8 sm:py-12">
        <div>
          {/* HEADER / INTRO */}
          <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end border-b border-[#dfd6ca] pb-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#b87840]">
                Q Frame Studio
              </p>
              <h1 className="mt-1.5 font-serif text-3xl font-bold tracking-tight text-[#1b2925] sm:text-4xl">
                Photo Frame Products
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-[#68736e]">
                Explore our collection of custom photo frame products. Select your desired frame design, customize it with your own photos, choose your size, and order for doorstep delivery.
              </p>
            </div>

            <span className="inline-flex items-center gap-2 rounded-xl border border-[#dfd6ca] bg-white px-4 py-2 text-xs font-bold text-[#1b2925] shadow-2xs">
              <Package className="h-4 w-4 text-[#b87840]" />{" "}
              {loading
                ? "Loading products..."
                : `Showing ${filteredProducts.length} of ${products.length} Frame Products`}
            </span>
          </div>

          {/* VISUAL ORIENTATION SELECTOR CARDS */}
          <section
            className="mb-8 rounded-2xl bg-white border border-[#dfd6ca] p-4 sm:p-6 shadow-2xs"
            aria-label="Choose frame orientation"
          >
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#b87840] flex items-center gap-1.5">
                <Layers size={14} /> Select Frame Orientation
              </h3>
              {selectedOrientation !== "All" && (
                <button
                  type="button"
                  onClick={() => setSelectedOrientation("All")}
                  className="text-xs font-semibold text-[#68736e] hover:text-[#b87840]"
                >
                  View All Orientations
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {ORIENTATION_CARDS.map((orientation) => {
                const isSelected = selectedOrientation === orientation;
                const count = orientationCounts[orientation] || 0;

                return (
                  <button
                    key={orientation}
                    type="button"
                    onClick={() => {
                      setSelectedOrientation(orientation);
                      setSearchParams((prev) => {
                        const next = new URLSearchParams(prev);
                        if (orientation === "All") next.delete("orientation");
                        else next.set("orientation", orientation);
                        return next;
                      });
                    }}
                    aria-label={`Show ${orientation} frames`}
                    className={`group text-left transition cursor-pointer ${
                      isSelected ? "text-[#1b2925]" : "text-[#68736e]"
                    }`}
                  >
                    <div
                      className={`h-36 sm:h-40 overflow-hidden rounded-xl border-2 transition-all p-3 flex flex-col items-center justify-center ${
                        isSelected
                          ? "border-[#b87840] bg-[#fcfbf9] shadow-xs"
                          : "border-[#e8dfd2] bg-[#faf8f5] hover:border-[#b87840]/60"
                      }`}
                    >
                      <div className="flex h-20 w-full items-center justify-center">
                        {orientation === "All" ? (
                          <div className="flex flex-col items-center gap-1.5 text-[#7b8580]">
                            <Layers className={`h-9 w-9 ${isSelected ? "text-[#b87840]" : "text-[#9ba49f]"}`} />
                          </div>
                        ) : (
                          <div
                            className={`${
                              orientation === "Portrait"
                                ? "h-16 w-11"
                                : orientation === "Landscape"
                                ? "h-11 w-16"
                                : "aspect-square h-14 w-14"
                            } rounded-md border-3 transition-colors ${
                              isSelected
                                ? "border-[#b87840] bg-[#f4eee6]"
                                : "border-[#1b2925]/70 bg-white"
                            } shadow-xs flex items-center justify-center`}
                          >
                            <ImagePlus
                              size={12}
                              className={isSelected ? "text-[#b87840]" : "text-[#7b8580]"}
                            />
                          </div>
                        )}
                      </div>

                      <div className="mt-2 text-center">
                        <span className="block text-xs font-bold text-[#1b2925]">
                          {orientation === "All" ? "All Frames" : orientation}
                        </span>
                        <span className="text-[10px] text-[#7b8580]">
                          {count} {count === 1 ? "product" : "products"}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* SEARCH, CATEGORY PILLS & SORT BAR */}
          <div className="mb-8 space-y-4">
            
            {/* Top row: Search input & Sort Dropdown */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative w-full sm:max-w-md">
                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8c9691]" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search frame products by name or theme..."
                  className="h-10 w-full rounded-xl border border-[#dfd6ca] bg-white pl-10 pr-9 text-xs font-medium text-[#1b2925] outline-none transition placeholder:text-[#8c9691] focus:border-[#b87840] focus:ring-1 focus:ring-[#b87840]"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8c9691] hover:text-[#1b2925]"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-center">
                <span className="text-xs font-bold uppercase tracking-wider text-[#7b8580] flex items-center gap-1">
                  <ArrowUpDown size={13} /> Sort:
                </span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="h-9 rounded-xl border border-[#dfd6ca] bg-white px-3 text-xs font-semibold text-[#1b2925] outline-none transition focus:border-[#b87840] cursor-pointer shadow-2xs"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Bottom row: Category Pills */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setSelectedCategory("All")}
                className={`rounded-full px-4 py-2 text-xs font-bold transition cursor-pointer ${
                  selectedCategory === "All"
                    ? "bg-[#1b2925] text-white shadow-xs"
                    : "border border-[#dfd6ca] bg-white text-[#4a5550] hover:border-[#b87840]"
                }`}
              >
                All Categories ({products.length})
              </button>

              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`rounded-full px-4 py-2 text-xs font-bold transition cursor-pointer ${
                    selectedCategory === cat
                      ? "bg-[#1b2925] text-white shadow-xs"
                      : "border border-[#dfd6ca] bg-white text-[#4a5550] hover:border-[#b87840]"
                  }`}
                >
                  {cat}
                </button>
              ))}

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#b87840] hover:underline cursor-pointer ml-2"
                >
                  <RotateCcw size={12} />
                  Reset Filters
                </button>
              )}
            </div>
          </div>

          {/* FRAME PRODUCTS GRID */}
          {loading ? (
            <div className="py-24 text-center">
              <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-[#b87840] border-t-transparent" />
              <p className="mt-3 text-sm font-semibold text-[#68736e]">
                Loading frame products...
              </p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="rounded-3xl border border-[#dfd6ca] bg-white py-20 text-center shadow-xs">
              <Package className="mx-auto h-12 w-12 text-[#b7beb9]" />
              <p className="mt-3 font-bold text-base text-[#1b2925]">
                No frame products found.
              </p>
              <p className="mt-1 text-xs text-[#7b8580] max-w-sm mx-auto">
                Try selecting a different orientation, category, or clear your search term.
              </p>
              <button
                type="button"
                onClick={handleResetFilters}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#1b2925] px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#b87840] transition cursor-pointer"
              >
                <RotateCcw size={14} />
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
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

export default Frames;
