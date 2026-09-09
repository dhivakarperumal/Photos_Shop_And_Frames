import { useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowUpDown,
  BookOpen,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Filter,
  Gift,
  ImagePlus,
  Package,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Sparkles,
  Tag,
  X,
} from "lucide-react";
import { useSearchParams } from "react-router-dom";
import api, { API_URL } from "../../api";
import PageContainer from "../../CommonComponents/PageContainer";
import PageHeader from "../../CommonComponents/PageHeader";
import ProductCard from "../../CommonComponents/ProductCard";
import GiftCard from "../../CommonComponents/GiftCard";
import AlbumCard from "../../CommonComponents/AlbumCard";
import ProductQuickView from "../../CommonComponents/ProductQuickView";

const resolveImageUrl = (value) => {
  if (!value || typeof value !== "string") return "";
  const trimmed = value.trim();
  if (/^(data:|blob:|https?:\/\/)/i.test(trimmed)) return trimmed;
  const baseUrl = API_URL.replace(/\/api\/?$/, "");
  return `${baseUrl}${trimmed.startsWith("/") ? trimmed : `/${trimmed}`}`;
};

const PRICE_PRESETS = [
  { label: "All Prices", min: "", max: "" },
  { label: "Under ₹500", min: "0", max: "500" },
  { label: "₹500 - ₹1,000", min: "500", max: "1000" },
  { label: "₹1,000 - ₹2,500", min: "1000", max: "2500" },
  { label: "₹2,500+", min: "2500", max: "" },
];

const ORIENTATION_OPTIONS = ["All", "Portrait", "Landscape", "Square"];

const SLOT_OPTIONS = [
  { label: "All Positions", value: "all" },
  { label: "Single Photo (1)", value: "1" },
  { label: "2 - 3 Photos", value: "2-3" },
  { label: "4+ Photos / Collage", value: "4+" },
];

const SORT_OPTIONS = [
  { label: "Featured & Popular", value: "featured" },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
  { label: "Newest Arrivals", value: "latest" },
  { label: "Biggest Discount", value: "discount" },
];

const ITEMS_PER_PAGE = 12;

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const productsTopRef = useRef(null);
  const isInitialMount = useRef(true);

  // Pagination state
  const pageParam = parseInt(searchParams.get("page") || "1", 10);
  const [currentPage, setCurrentPage] = useState(
    Number.isInteger(pageParam) && pageParam > 0 ? pageParam : 1
  );

  // Raw fetched data
  const [frames, setFrames] = useState([]);
  const [gifts, setGifts] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Quick View State (for Gifts & Albums)
  const [quickViewItem, setQuickViewItem] = useState(null);

  // Mobile Filter Drawer Toggle
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Filter States initialized from URL or Defaults
  const typeParam = searchParams.get("type");
  const initialType = ["all", "frame", "gift", "album"].includes(typeParam)
    ? typeParam
    : typeParam === "frames"
    ? "frame"
    : typeParam === "gifts"
    ? "gift"
    : typeParam === "albums"
    ? "album"
    : "all";

  const [selectedType, setSelectedType] = useState(initialType);
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("category") || "all"
  );
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("search") || ""
  );
  const [pricePreset, setPricePreset] = useState("All Prices");
  const [customPrice, setCustomPrice] = useState({
    min: searchParams.get("minPrice") || "",
    max: searchParams.get("maxPrice") || "",
  });
  const [selectedOrientation, setSelectedOrientation] = useState(
    searchParams.get("orientation") || "All"
  );
  const [selectedSlots, setSelectedSlots] = useState(
    searchParams.get("slots") || "all"
  );
  const [inStockOnly, setInStockOnly] = useState(
    searchParams.get("inStock") === "true"
  );
  const [discountOnly, setDiscountOnly] = useState(
    searchParams.get("onSale") === "true"
  );
  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "featured");

  // Accordion open/collapse states for sidebar
  const [collapsedSections, setCollapsedSections] = useState({
    type: false,
    search: false,
    category: false,
    price: false,
    orientation: false,
    slots: false,
    availability: false,
  });

  const toggleSection = (section) => {
    setCollapsedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  // Sync state if URL searchParams change
  useEffect(() => {
    const urlType = searchParams.get("type");
    if (urlType) {
      const normalized =
        urlType === "frames"
          ? "frame"
          : urlType === "gifts"
          ? "gift"
          : urlType === "albums"
          ? "album"
          : urlType;
      if (["all", "frame", "gift", "album"].includes(normalized)) {
        setSelectedType(normalized);
      }
    }
    const urlCategory = searchParams.get("category");
    if (urlCategory !== null) setSelectedCategory(urlCategory);
    const urlSearch = searchParams.get("search");
    if (urlSearch !== null) setSearchQuery(urlSearch);

    const urlPage = parseInt(searchParams.get("page") || "1", 10);
    if (Number.isInteger(urlPage) && urlPage > 0) {
      setCurrentPage(urlPage);
    } else {
      setCurrentPage(1);
    }
  }, [searchParams]);

  // Fetch all 3 product lines + categories simultaneously
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [prodRes, giftsRes, albumsRes, catRes] = await Promise.all([
          api.get("/products").catch(() => ({ data: { data: [] } })),
          api.get("/gift-boxes").catch(() => ({ data: { data: [] } })),
          api.get("/albums").catch(() => ({ data: { data: [] } })),
          api.get("/categories").catch(() => ({ data: { data: [] } })),
        ]);

        // Process Frames
        const rawProds = Array.isArray(prodRes.data?.data)
          ? prodRes.data.data
          : [];
        const activeFrames = rawProds
          .filter((p) => (p.status || "Active").toLowerCase() === "active")
          .map((p) => {
            const variant = p.size_variants?.[0] || {};
            const offerPrice = Number(
              variant.offer_price ||
                variant.mrp ||
                p.offer_price ||
                p.price ||
                0
            );
            const mrp = Number(variant.mrp || p.mrp || offerPrice || 0);
            const discount =
              mrp > offerPrice
                ? Math.round(((mrp - offerPrice) / mrp) * 100)
                : 0;
            const slotCount = p.frame_data?.photo_slots?.length || 0;

            return {
              ...p,
              __type: "frame",
              __id: `frame-${p.id || p.product_id}`,
              __title: p.product_name || "Custom Frame",
              __category: p.category || "Photo Frame",
              __price: offerPrice,
              __mrp: mrp,
              __discount: discount,
              __image:
                p.product_images?.[0] || p.frame_data?.frame_image || "",
              __inStock: true,
              __orientation: p.orientation || "Portrait",
              __slotCount: slotCount,
              __createdAt: p.created_at || "",
            };
          });
        setFrames(activeFrames);

        // Process Gifts
        const rawGifts = Array.isArray(giftsRes.data?.data)
          ? giftsRes.data.data
          : [];
        const activeGifts = rawGifts
          .filter(
            (g) =>
              (g.status || "Active").toLowerCase() === "active" &&
              g.is_active !== false
          )
          .map((g) => {
            const sellingPrice = Number(g.selling_price || g.mrp || 0);
            const mrp = Number(g.mrp || sellingPrice || 0);
            const discount =
              mrp > sellingPrice
                ? Math.round(((mrp - sellingPrice) / mrp) * 100)
                : 0;
            const inStock =
              g.stock_status !== "Out of Stock" &&
              Number(g.current_stock ?? 1) > 0;

            return {
              ...g,
              __type: "gift",
              __id: `gift-${g.id || g.gift_box_id}`,
              __title: g.name || "Gift Box",
              __category: g.category || "Gift Box",
              __price: sellingPrice,
              __mrp: mrp,
              __discount: discount,
              __image: resolveImageUrl(g.image || g.product_images?.[0] || ""),
              __inStock: inStock,
              __orientation: "Square",
              __slotCount: 0,
              __createdAt: g.created_at || "",
            };
          });
        setGifts(activeGifts);

        // Process Albums
        const rawAlbums = Array.isArray(albumsRes.data?.data)
          ? albumsRes.data.data
          : [];
        const activeAlbums = rawAlbums
          .filter((a) => (a.status || "Active").toLowerCase() === "active")
          .map((a) => {
            const sellingPrice = Number(
              a.discount_price || a.selling_price || 0
            );
            const mrp = Number(a.selling_price || sellingPrice || 0);
            const discount =
              mrp > sellingPrice
                ? Math.round(((mrp - sellingPrice) / mrp) * 100)
                : 0;
            const inStock = a.stock_status !== "Out of Stock";

            return {
              ...a,
              __type: "album",
              __id: `album-${a.id || a.product_id}`,
              __title: a.product_name || "Photo Album",
              __category:
                a.sub_category ||
                a.occasion ||
                a.category ||
                "Photo Album",
              __price: sellingPrice,
              __mrp: mrp,
              __discount: discount,
              __image: resolveImageUrl(
                a.thumbnail_image || a.image || a.product_images?.[0] || ""
              ),
              __inStock: inStock,
              __orientation: a.orientation || "Portrait",
              __slotCount: 0,
              __createdAt: a.created_at || "",
            };
          });
        setAlbums(activeAlbums);

        // Process Categories
        const rawCats = Array.isArray(catRes.data?.data)
          ? catRes.data.data
          : [];
        setCategoriesList(rawCats);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Combined all items list
  const allItems = useMemo(() => {
    return [...frames, ...gifts, ...albums];
  }, [frames, gifts, albums]);

  // Categories available based on current product type
  const availableCategories = useMemo(() => {
    const counts = {};

    const targetList =
      selectedType === "frame"
        ? frames
        : selectedType === "gift"
        ? gifts
        : selectedType === "album"
        ? albums
        : allItems;

    targetList.forEach((item) => {
      const cat = item.__category || "General";
      counts[cat] = (counts[cat] || 0) + 1;

      // For albums, also count occasion if different
      if (item.__type === "album" && item.occasion && item.occasion !== cat) {
        counts[item.occasion] = (counts[item.occasion] || 0) + 1;
      }
    });

    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [selectedType, frames, gifts, albums, allItems]);

  // Handle Preset Price Click
  const handlePricePresetSelect = (preset) => {
    setPricePreset(preset.label);
    setCustomPrice({ min: preset.min, max: preset.max });
  };

  // Reset all filters
  const handleResetFilters = () => {
    setSelectedType("all");
    setSelectedCategory("all");
    setSearchQuery("");
    setPricePreset("All Prices");
    setCustomPrice({ min: "", max: "" });
    setSelectedOrientation("All");
    setSelectedSlots("all");
    setInStockOnly(false);
    setDiscountOnly(false);
    setSortBy("featured");
    setCurrentPage(1);
    setSearchParams({});
  };

  // Filter and Sort Items
  const filteredItems = useMemo(() => {
    return allItems
      .filter((item) => {
        // 1. Type filter
        if (selectedType !== "all" && item.__type !== selectedType) {
          return false;
        }

        // 2. Category filter
        if (selectedCategory !== "all") {
          const itemCat = String(item.__category || "").toLowerCase();
          const target = String(selectedCategory).toLowerCase();
          const matchesCat =
            itemCat === target ||
            (item.__type === "album" &&
              (String(item.occasion || "").toLowerCase() === target ||
                String(item.sub_category || "").toLowerCase() === target));
          if (!matchesCat) return false;
        }

        // 3. Search query
        if (searchQuery.trim()) {
          const q = searchQuery.trim().toLowerCase();
          const matches =
            item.__title?.toLowerCase().includes(q) ||
            item.__category?.toLowerCase().includes(q) ||
            item.description?.toLowerCase().includes(q) ||
            item.material?.toLowerCase().includes(q) ||
            item.theme?.toLowerCase().includes(q) ||
            item.occasion?.toLowerCase().includes(q);
          if (!matches) return false;
        }

        // 4. Price filter
        if (customPrice.min !== "" && item.__price < Number(customPrice.min)) {
          return false;
        }
        if (customPrice.max !== "" && item.__price > Number(customPrice.max)) {
          return false;
        }

        // 5. Orientation filter (frames and albums)
        if (selectedOrientation !== "All") {
          if (
            (item.__orientation || "Portrait").toLowerCase() !==
            selectedOrientation.toLowerCase()
          ) {
            return false;
          }
        }

        // 6. Photo Slots (Frames only)
        if (selectedSlots !== "all") {
          if (item.__type !== "frame") return false;
          if (selectedSlots === "1" && item.__slotCount !== 1) return false;
          if (
            selectedSlots === "2-3" &&
            (item.__slotCount < 2 || item.__slotCount > 3)
          )
            return false;
          if (selectedSlots === "4+" && item.__slotCount < 4) return false;
        }

        // 7. In Stock filter
        if (inStockOnly && !item.__inStock) {
          return false;
        }

        // 8. Discount / On Sale filter
        if (discountOnly && item.__discount <= 0) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "price_asc") return a.__price - b.__price;
        if (sortBy === "price_desc") return b.__price - a.__price;
        if (sortBy === "latest") {
          return (
            new Date(b.__createdAt || 0) - new Date(a.__createdAt || 0)
          );
        }
        if (sortBy === "discount") return b.__discount - a.__discount;
        return 0; // Default order
      });
  }, [
    allItems,
    selectedType,
    selectedCategory,
    searchQuery,
    customPrice,
    selectedOrientation,
    selectedSlots,
    inStockOnly,
    discountOnly,
    sortBy,
  ]);

  // Reset to page 1 whenever any filter or sort option changes
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    setCurrentPage(1);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete("page");
      return next;
    });
  }, [
    selectedType,
    selectedCategory,
    searchQuery,
    customPrice.min,
    customPrice.max,
    selectedOrientation,
    selectedSlots,
    inStockOnly,
    discountOnly,
    sortBy,
    setSearchParams,
  ]);

  // Total pages based on 8 items per page
  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);

  // Clamp current page if items count shrinks
  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  // Paginated items for current page
  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredItems.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredItems, currentPage]);

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages || newPage === currentPage) return;
    setCurrentPage(newPage);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (newPage === 1) {
        next.delete("page");
      } else {
        next.set("page", String(newPage));
      }
      return next;
    });
    if (productsTopRef.current) {
      productsTopRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const getPageNumbers = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (currentPage <= 4) {
      return [1, 2, 3, 4, 5, "...", totalPages];
    }
    if (currentPage >= totalPages - 3) {
      return [
        1,
        "...",
        totalPages - 4,
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ];
    }
    return [
      1,
      "...",
      currentPage - 1,
      currentPage,
      currentPage + 1,
      "...",
      totalPages,
    ];
  };

  // Active filter count for badge
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedType !== "all") count++;
    if (selectedCategory !== "all") count++;
    if (searchQuery.trim()) count++;
    if (customPrice.min !== "" || customPrice.max !== "") count++;
    if (selectedOrientation !== "All") count++;
    if (selectedSlots !== "all") count++;
    if (inStockOnly) count++;
    if (discountOnly) count++;
    return count;
  }, [
    selectedType,
    selectedCategory,
    searchQuery,
    customPrice,
    selectedOrientation,
    selectedSlots,
    inStockOnly,
    discountOnly,
  ]);

  // Dynamic header titles based on selection
  const headerContent = useMemo(() => {
    switch (selectedType) {
      case "frame":
        return {
          badge: "Frames Collection",
          title: "Custom Photo Frames",
          desc: "Studio-crafted photo frames customized with your memorable photos, precision cut mats, and varied layouts.",
        };
      case "gift":
        return {
          badge: "Gift Studio",
          title: "Curated Gift Boxes & Hampers",
          desc: "Thoughtful gift hampers and customized boxes with personalized keepsakes, handwritten notes, and photo cards.",
        };
      case "album":
        return {
          badge: "Photo Albums",
          title: "Lay-Flat Keepsake Albums",
          desc: "Handcrafted photobooks and premium flush-mount albums to cherish your wedding, baby, and milestone memories.",
        };
      default:
        return {
          badge: "Full Studio Store",
          title: "Shop All Collections",
          desc: "Explore every frame, bespoke gift hamper, and photo album crafted by Q Frame Studio.",
        };
    }
  }, [selectedType]);

  // Reusable Sidebar Content
  const renderSidebarContent = () => (
    <div className="space-y-6 text-sm text-[#1b2925]">
      
      {/* 1. PRODUCT TYPE TABS */}
      <div className="border-b border-[#e8dfd2] pb-5">
        <div
          onClick={() => toggleSection("type")}
          className="flex cursor-pointer items-center justify-between font-bold text-[#1b2925] uppercase tracking-wider text-xs"
        >
          <span className="flex items-center gap-1.5 text-[#b87840]">
            <Package size={14} /> Product Type
          </span>
          {collapsedSections.type ? (
            <ChevronDown size={15} />
          ) : (
            <ChevronUp size={15} />
          )}
        </div>

        {!collapsedSections.type && (
          <div className="mt-3 space-y-1.5">
            {[
              { id: "all", label: "All Collections", count: allItems.length, icon: Package },
              { id: "frame", label: "Photo Frames", count: frames.length, icon: ImagePlus },
              { id: "gift", label: "Gift Boxes", count: gifts.length, icon: Gift },
              { id: "album", label: "Photo Albums", count: albums.length, icon: BookOpen },
            ].map((t) => {
              const Icon = t.icon;
              const isSelected = selectedType === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    setSelectedType(t.id);
                    setSelectedCategory("all"); // reset category when type changes
                    setSearchParams((prev) => {
                      const next = new URLSearchParams(prev);
                      if (t.id === "all") next.delete("type");
                      else next.set("type", t.id);
                      next.delete("category");
                      return next;
                    });
                  }}
                  className={`group flex w-full items-center justify-between rounded-xl px-3 py-2.5 transition-all text-left cursor-pointer ${
                    isSelected
                      ? "bg-[#1b2925] text-white font-semibold shadow-xs"
                      : "hover:bg-[#f4eee6] text-[#4a5550]"
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <Icon
                      size={15}
                      className={
                        isSelected
                          ? "text-[#edcca3]"
                          : "text-[#b87840] group-hover:text-[#1b2925]"
                      }
                    />
                    <span>{t.label}</span>
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                      isSelected
                        ? "bg-white/20 text-white"
                        : "bg-[#eee7de] text-[#7b6a58]"
                    }`}
                  >
                    {t.count}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 2. SEARCH INPUT */}
      <div className="border-b border-[#e8dfd2] pb-5">
        <div
          onClick={() => toggleSection("search")}
          className="flex cursor-pointer items-center justify-between font-bold text-[#1b2925] uppercase tracking-wider text-xs"
        >
          <span className="flex items-center gap-1.5 text-[#b87840]">
            <Search size={14} /> Search Products
          </span>
          {collapsedSections.search ? (
            <ChevronDown size={15} />
          ) : (
            <ChevronUp size={15} />
          )}
        </div>

        {!collapsedSections.search && (
          <div className="relative mt-3">
            <input
              type="text"
              placeholder="Search by name, theme..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSearchParams((prev) => {
                  const next = new URLSearchParams(prev);
                  if (e.target.value.trim())
                    next.set("search", e.target.value.trim());
                  else next.delete("search");
                  return next;
                });
              }}
              className="h-10 w-full rounded-xl border border-[#ddd6ce] bg-white pl-9 pr-8 text-xs outline-none transition focus:border-[#b87840] focus:ring-1 focus:ring-[#b87840]"
            />
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8c9691]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setSearchParams((prev) => {
                    const next = new URLSearchParams(prev);
                    next.delete("search");
                    return next;
                  });
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8c9691] hover:text-[#1b2925]"
              >
                <X size={14} />
              </button>
            )}
          </div>
        )}
      </div>

      {/* 3. CATEGORIES FILTER */}
      <div className="border-b border-[#e8dfd2] pb-5">
        <div
          onClick={() => toggleSection("category")}
          className="flex cursor-pointer items-center justify-between font-bold text-[#1b2925] uppercase tracking-wider text-xs"
        >
          <span className="flex items-center gap-1.5 text-[#b87840]">
            <Tag size={14} /> Categories
          </span>
          {collapsedSections.category ? (
            <ChevronDown size={15} />
          ) : (
            <ChevronUp size={15} />
          )}
        </div>

        {!collapsedSections.category && (
          <div className="mt-3 max-h-56 space-y-1 overflow-y-auto pr-1">
            <button
              type="button"
              onClick={() => setSelectedCategory("all")}
              className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs transition cursor-pointer ${
                selectedCategory === "all"
                  ? "bg-[#f4eee6] font-bold text-[#b87840]"
                  : "text-[#4a5550] hover:bg-[#faf8f5]"
              }`}
            >
              <span>All Categories</span>
              <span className="text-[11px] text-[#7b8580]">
                ({filteredItems.length})
              </span>
            </button>

            {availableCategories.map((cat) => {
              const isSelected = selectedCategory === cat.name;
              return (
                <button
                  key={cat.name}
                  type="button"
                  onClick={() =>
                    setSelectedCategory((prev) =>
                      prev === cat.name ? "all" : cat.name
                    )
                  }
                  className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs transition cursor-pointer ${
                    isSelected
                      ? "bg-[#f4eee6] font-bold text-[#b87840]"
                      : "text-[#4a5550] hover:bg-[#faf8f5]"
                  }`}
                >
                  <span className="truncate">{cat.name}</span>
                  <span className="text-[11px] text-[#7b8580] ml-2">
                    ({cat.count})
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. PRICE RANGE FILTER */}
      <div className="border-b border-[#e8dfd2] pb-5">
        <div
          onClick={() => toggleSection("price")}
          className="flex cursor-pointer items-center justify-between font-bold text-[#1b2925] uppercase tracking-wider text-xs"
        >
          <span className="flex items-center gap-1.5 text-[#b87840]">
            ₹ Price Range
          </span>
          {collapsedSections.price ? (
            <ChevronDown size={15} />
          ) : (
            <ChevronUp size={15} />
          )}
        </div>

        {!collapsedSections.price && (
          <div className="mt-3 space-y-3">
            {/* Quick chips */}
            <div className="flex flex-wrap gap-1.5">
              {PRICE_PRESETS.map((preset) => {
                const isSelected =
                  pricePreset === preset.label &&
                  customPrice.min === preset.min &&
                  customPrice.max === preset.max;
                return (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => handlePricePresetSelect(preset)}
                    className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition cursor-pointer ${
                      isSelected
                        ? "bg-[#1b2925] text-white"
                        : "border border-[#ddd6ce] bg-white text-[#5a6661] hover:border-[#b87840]"
                    }`}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>

            {/* Min / Max inputs */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <div>
                <label className="text-[10px] uppercase font-bold text-[#7b8580]">
                  Min Price (₹)
                </label>
                <input
                  type="number"
                  placeholder="Min"
                  value={customPrice.min}
                  onChange={(e) => {
                    setPricePreset("");
                    setCustomPrice((prev) => ({ ...prev, min: e.target.value }));
                  }}
                  className="mt-1 h-9 w-full rounded-lg border border-[#ddd6ce] bg-white px-2.5 text-xs outline-none focus:border-[#b87840]"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-[#7b8580]">
                  Max Price (₹)
                </label>
                <input
                  type="number"
                  placeholder="Max"
                  value={customPrice.max}
                  onChange={(e) => {
                    setPricePreset("");
                    setCustomPrice((prev) => ({ ...prev, max: e.target.value }));
                  }}
                  className="mt-1 h-9 w-full rounded-lg border border-[#ddd6ce] bg-white px-2.5 text-xs outline-none focus:border-[#b87840]"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 5. ORIENTATION (For frames & albums) */}
      {(selectedType === "all" ||
        selectedType === "frame" ||
        selectedType === "album") && (
        <div className="border-b border-[#e8dfd2] pb-5">
          <div
            onClick={() => toggleSection("orientation")}
            className="flex cursor-pointer items-center justify-between font-bold text-[#1b2925] uppercase tracking-wider text-xs"
          >
            <span className="flex items-center gap-1.5 text-[#b87840]">
              Orientation
            </span>
            {collapsedSections.orientation ? (
              <ChevronDown size={15} />
            ) : (
              <ChevronUp size={15} />
            )}
          </div>

          {!collapsedSections.orientation && (
            <div className="mt-3 flex flex-wrap gap-2">
              {ORIENTATION_OPTIONS.map((ori) => {
                const isSelected = selectedOrientation === ori;
                return (
                  <button
                    key={ori}
                    type="button"
                    onClick={() => setSelectedOrientation(ori)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
                      isSelected
                        ? "bg-[#1b2925] text-white shadow-xs"
                        : "border border-[#ddd6ce] bg-white text-[#5a6661] hover:border-[#b87840]"
                    }`}
                  >
                    {ori}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 6. PHOTO SLOTS / POSITIONS (For frames) */}
      {(selectedType === "all" || selectedType === "frame") && (
        <div className="border-b border-[#e8dfd2] pb-5">
          <div
            onClick={() => toggleSection("slots")}
            className="flex cursor-pointer items-center justify-between font-bold text-[#1b2925] uppercase tracking-wider text-xs"
          >
            <span className="flex items-center gap-1.5 text-[#b87840]">
              Frame Photo Slots
            </span>
            {collapsedSections.slots ? (
              <ChevronDown size={15} />
            ) : (
              <ChevronUp size={15} />
            )}
          </div>

          {!collapsedSections.slots && (
            <div className="mt-3 space-y-1.5">
              {SLOT_OPTIONS.map((opt) => {
                const isSelected = selectedSlots === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setSelectedSlots(opt.value)}
                    className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs transition cursor-pointer ${
                      isSelected
                        ? "bg-[#f4eee6] font-bold text-[#b87840]"
                        : "text-[#4a5550] hover:bg-[#faf8f5]"
                    }`}
                  >
                    <span>{opt.label}</span>
                    {isSelected && <Check size={13} className="text-[#b87840]" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 7. AVAILABILITY & DISCOUNTS */}
      <div className="pb-2">
        <div
          onClick={() => toggleSection("availability")}
          className="flex cursor-pointer items-center justify-between font-bold text-[#1b2925] uppercase tracking-wider text-xs"
        >
          <span className="flex items-center gap-1.5 text-[#b87840]">
            Preferences & Deals
          </span>
          {collapsedSections.availability ? (
            <ChevronDown size={15} />
          ) : (
            <ChevronUp size={15} />
          )}
        </div>

        {!collapsedSections.availability && (
          <div className="mt-3 space-y-2.5">
            <label className="flex cursor-pointer items-center gap-2.5 text-xs font-medium text-[#4a5550]">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="h-4 w-4 rounded border-[#ddd6ce] text-[#1b2925] focus:ring-[#b87840]"
              />
              <span>In Stock Only</span>
            </label>

            <label className="flex cursor-pointer items-center gap-2.5 text-xs font-medium text-[#4a5550]">
              <input
                type="checkbox"
                checked={discountOnly}
                onChange={(e) => setDiscountOnly(e.target.checked)}
                className="h-4 w-4 rounded border-[#ddd6ce] text-[#1b2925] focus:ring-[#b87840]"
              />
              <span>On Sale / Special Discount</span>
            </label>
          </div>
        )}
      </div>

      {/* CLEAR FILTERS BUTTON */}
      {activeFiltersCount > 0 && (
        <button
          type="button"
          onClick={handleResetFilters}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#dfd6ca] bg-white py-2.5 text-xs font-bold uppercase tracking-wider text-[#b87840] hover:bg-[#f4eee6] transition cursor-pointer"
        >
          <RotateCcw size={14} />
          Reset All Filters ({activeFiltersCount})
        </button>
      )}
    </div>
  );

  return (
    <main className="min-h-screen bg-[#f8f6f1]">
      <PageHeader title="Shop" />

      <PageContainer className="py-8 sm:py-12">
        {/* TOP HEADER SECTION */}
        <div className="mb-8 flex flex-col justify-between gap-5 border-b border-[#dfd6ca] pb-6 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#b87840]">
              {headerContent.badge}
            </p>
            <h1 className="mt-1.5 font-serif text-3xl font-bold tracking-tight text-[#1b2925] sm:text-4xl">
              {headerContent.title}
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-[#68736e]">
              {headerContent.desc}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Active Count Badge */}
            <span className="inline-flex items-center gap-2 rounded-xl border border-[#dfd6ca] bg-white px-4 py-2 text-xs font-bold text-[#1b2925] shadow-2xs">
              <Package className="h-4 w-4 text-[#b87840]" />
              <span>
                {loading
                  ? "Loading products..."
                  : filteredItems.length === 0
                  ? "0 products"
                  : `Showing ${(currentPage - 1) * ITEMS_PER_PAGE + 1}–${Math.min(
                      currentPage * ITEMS_PER_PAGE,
                      filteredItems.length
                    )} of ${filteredItems.length} products`}
              </span>
            </span>

            {/* Mobile Filter Toggle Button */}
            <button
              type="button"
              onClick={() => setIsMobileFilterOpen(true)}
              className="inline-flex lg:hidden items-center gap-2 rounded-xl bg-[#1b2925] px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#b87840] transition cursor-pointer"
            >
              <SlidersHorizontal size={15} />
              <span>Filters</span>
              {activeFiltersCount > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#b87840] text-[10px] font-bold text-white">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* CONTROLS BAR: ACTIVE FILTER PILLS & SORT DROPDOWN */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          
          {/* Active Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 min-w-0 flex-1">
            {activeFiltersCount > 0 && (
              <span className="text-xs font-bold uppercase tracking-wider text-[#7b8580] mr-1">
                Active:
              </span>
            )}

            {selectedType !== "all" && (
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-[#e8dfd2] bg-white px-2.5 py-1 text-xs font-medium text-[#1b2925]">
                <span>
                  Type:{" "}
                  <strong>
                    {selectedType === "frame"
                      ? "Frames"
                      : selectedType === "gift"
                      ? "Gifts"
                      : "Albums"}
                  </strong>
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedType("all")}
                  className="hover:text-[#c24130]"
                >
                  <X size={13} />
                </button>
              </span>
            )}

            {selectedCategory !== "all" && (
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-[#e8dfd2] bg-white px-2.5 py-1 text-xs font-medium text-[#1b2925]">
                <span>
                  Category: <strong>{selectedCategory}</strong>
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedCategory("all")}
                  className="hover:text-[#c24130]"
                >
                  <X size={13} />
                </button>
              </span>
            )}

            {searchQuery && (
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-[#e8dfd2] bg-white px-2.5 py-1 text-xs font-medium text-[#1b2925]">
                <span>
                  Search: <strong>&ldquo;{searchQuery}&rdquo;</strong>
                </span>
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="hover:text-[#c24130]"
                >
                  <X size={13} />
                </button>
              </span>
            )}

            {(customPrice.min !== "" || customPrice.max !== "") && (
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-[#e8dfd2] bg-white px-2.5 py-1 text-xs font-medium text-[#1b2925]">
                <span>
                  Price: ₹{customPrice.min || "0"} - ₹{customPrice.max || "Max"}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setPricePreset("All Prices");
                    setCustomPrice({ min: "", max: "" });
                  }}
                  className="hover:text-[#c24130]"
                >
                  <X size={13} />
                </button>
              </span>
            )}

            {selectedOrientation !== "All" && (
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-[#e8dfd2] bg-white px-2.5 py-1 text-xs font-medium text-[#1b2925]">
                <span>
                  Orientation: <strong>{selectedOrientation}</strong>
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedOrientation("All")}
                  className="hover:text-[#c24130]"
                >
                  <X size={13} />
                </button>
              </span>
            )}

            {selectedSlots !== "all" && (
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-[#e8dfd2] bg-white px-2.5 py-1 text-xs font-medium text-[#1b2925]">
                <span>
                  Slots:{" "}
                  <strong>
                    {SLOT_OPTIONS.find((s) => s.value === selectedSlots)?.label}
                  </strong>
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedSlots("all")}
                  className="hover:text-[#c24130]"
                >
                  <X size={13} />
                </button>
              </span>
            )}

            {inStockOnly && (
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-[#c3e6d1] bg-[#e1f2e8] px-2.5 py-1 text-xs font-medium text-[#28724a]">
                <span>In Stock Only</span>
                <button
                  type="button"
                  onClick={() => setInStockOnly(false)}
                  className="hover:text-[#c24130]"
                >
                  <X size={13} />
                </button>
              </span>
            )}

            {discountOnly && (
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-[#f5c6cb] bg-[#fae5e2] px-2.5 py-1 text-xs font-medium text-[#a43e32]">
                <span>On Sale</span>
                <button
                  type="button"
                  onClick={() => setDiscountOnly(false)}
                  className="hover:text-[#c24130]"
                >
                  <X size={13} />
                </button>
              </span>
            )}

            {activeFiltersCount > 0 && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-xs font-bold text-[#b87840] hover:underline cursor-pointer ml-1"
              >
                Clear all
              </button>
            )}
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-center">
            <span className="text-xs font-bold uppercase tracking-wider text-[#7b8580] flex items-center gap-1">
              <ArrowUpDown size={13} /> Sort:
            </span>
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setSearchParams((prev) => {
                  const next = new URLSearchParams(prev);
                  next.set("sort", e.target.value);
                  return next;
                });
              }}
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

        {/* MAIN BODY: 2-COLUMN LAYOUT (SIDEBAR + GRID) */}
        <div className="flex flex-col lg:flex-row items-start gap-8">
          
          {/* DESKTOP FILTER SIDEBAR */}
          <aside className="hidden lg:block w-72 xl:w-80 shrink-0 sticky top-24">
            <div className="rounded-2xl border border-[#dfd6ca] bg-white p-6 shadow-xs">
              <div className="mb-5 flex items-center justify-between border-b border-[#eee8df] pb-4">
                <h3 className="font-serif text-base font-bold text-[#1b2925] flex items-center gap-2">
                  <SlidersHorizontal size={17} className="text-[#b87840]" />
                  Filter Catalog
                </h3>
                {activeFiltersCount > 0 && (
                  <span className="rounded-full bg-[#f4eee6] px-2.5 py-0.5 text-xs font-bold text-[#b87840]">
                    {activeFiltersCount} Active
                  </span>
                )}
              </div>

              {renderSidebarContent()}
            </div>
          </aside>

          {/* PRODUCT GRID */}
          <section ref={productsTopRef} className="flex-1 w-full min-w-0 scroll-mt-24">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-28 text-center">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#b87840] border-t-transparent" />
                <p className="mt-4 text-sm font-semibold text-[#68736e]">
                  Loading catalog collection...
                </p>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="rounded-3xl border border-[#dfd6ca] bg-white p-12 text-center shadow-xs">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#f4eee6] text-[#b87840]">
                  <Package size={30} />
                </div>
                <h3 className="mt-4 text-lg font-bold text-[#1b2925]">
                  No products found
                </h3>
                <p className="mx-auto mt-1 max-w-sm text-xs text-[#7b8580] leading-relaxed">
                  We could not find any products matching your active filters. Try
                  resetting some criteria or search query.
                </p>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#1b2925] px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#b87840] transition cursor-pointer"
                >
                  <RotateCcw size={14} />
                  Reset All Filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5 sm:gap-6">
                  {paginatedItems.map((item) => {
                    // 1. Gift Box Card
                    if (item.__type === "gift") {
                      return (
                        <GiftCard
                          key={item.__id}
                          gift={item}
                          image={item.__image}
                          price={item.__price}
                          originalPrice={item.__mrp}
                          discount={item.__discount}
                          onOpen={() =>
                            setQuickViewItem({
                              item,
                              type: "gift",
                              image: item.__image,
                            })
                          }
                        />
                      );
                    }

                    // 2. Photo Album Card
                    if (item.__type === "album") {
                      return (
                        <AlbumCard
                          key={item.__id}
                          album={item}
                          image={item.__image}
                          price={item.__price}
                          originalPrice={item.__mrp}
                          discount={item.__discount}
                          onOpen={() =>
                            setQuickViewItem({
                              item,
                              type: "album",
                              image: item.__image,
                            })
                          }
                        />
                      );
                    }

                    // 3. Photo Frame Product Card
                    return (
                      <ProductCard
                        key={item.__id}
                        product={item}
                      />
                    );
                  })}
                </div>

                {/* PAGINATION CONTROLS */}
                {totalPages > 1 && (
                  <div className="mt-10 flex flex-col items-center justify-between gap-4 rounded-2xl border border-[#dfd6ca] bg-white px-5 py-4 shadow-2xs sm:flex-row">
                    <div className="text-xs font-semibold text-[#68736e]">
                      Showing{" "}
                      <span className="font-bold text-[#1b2925]">
                        {(currentPage - 1) * ITEMS_PER_PAGE + 1}
                      </span>{" "}
                      to{" "}
                      <span className="font-bold text-[#1b2925]">
                        {Math.min(
                          currentPage * ITEMS_PER_PAGE,
                          filteredItems.length
                        )}
                      </span>{" "}
                      of{" "}
                      <span className="font-bold text-[#1b2925]">
                        {filteredItems.length}
                      </span>{" "}
                      products (Page {currentPage} of {totalPages})
                    </div>

                    <nav
                      aria-label="Shop catalog pagination"
                      className="flex items-center gap-1 sm:gap-1.5"
                    >
                      {/* Previous Page Button */}
                      <button
                        type="button"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage <= 1}
                        aria-label="Previous page"
                        className="flex h-9 items-center gap-1 rounded-xl border border-[#dfd6ca] bg-white px-3 text-xs font-bold text-[#1b2925] shadow-2xs transition hover:border-[#b87840] hover:text-[#b87840] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-[#dfd6ca] disabled:hover:text-[#1b2925] cursor-pointer"
                      >
                        <ChevronLeft size={16} />
                        <span className="hidden sm:inline">Previous</span>
                      </button>

                      {/* Page numbers */}
                      {getPageNumbers().map((page, idx) => {
                        if (page === "...") {
                          return (
                            <span
                              key={`ellipsis-${idx}`}
                              className="flex h-9 w-8 items-center justify-center text-xs font-bold text-[#8c9691]"
                            >
                              &hellip;
                            </span>
                          );
                        }

                        const isCurrent = currentPage === page;
                        return (
                          <button
                            key={`page-${page}`}
                            type="button"
                            onClick={() => handlePageChange(page)}
                            aria-current={isCurrent ? "page" : undefined}
                            className={`flex h-9 min-w-9 items-center justify-center rounded-xl px-2.5 text-xs font-bold transition cursor-pointer ${
                              isCurrent
                                ? "bg-[#1b2925] text-white shadow-xs"
                                : "border border-[#dfd6ca] bg-white text-[#4a5550] shadow-2xs hover:border-[#b87840] hover:text-[#b87840]"
                            }`}
                          >
                            {page}
                          </button>
                        );
                      })}

                      {/* Next Page Button */}
                      <button
                        type="button"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage >= totalPages}
                        aria-label="Next page"
                        className="flex h-9 items-center gap-1 rounded-xl border border-[#dfd6ca] bg-white px-3 text-xs font-bold text-[#1b2925] shadow-2xs transition hover:border-[#b87840] hover:text-[#b87840] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-[#dfd6ca] disabled:hover:text-[#1b2925] cursor-pointer"
                      >
                        <span className="hidden sm:inline">Next</span>
                        <ChevronRight size={16} />
                      </button>
                    </nav>
                  </div>
                )}
              </>
            )}
          </section>
        </div>
      </PageContainer>

      {/* MOBILE SLIDE-OVER FILTER DRAWER */}
      {isMobileFilterOpen && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs lg:hidden"
          role="dialog"
          aria-modal="true"
          onClick={() => setIsMobileFilterOpen(false)}
        >
          <div
            className="flex h-full w-full max-w-sm flex-col bg-white shadow-2xl animate-in slide-in-from-right duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-[#eee8df] px-5 py-4">
              <h3 className="font-serif text-base font-bold text-[#1b2925] flex items-center gap-2">
                <SlidersHorizontal size={17} className="text-[#b87840]" />
                Filter Products
              </h3>
              <button
                type="button"
                onClick={() => setIsMobileFilterOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-[#7b8580] hover:bg-[#f4eee6] hover:text-[#1b2925] transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto px-5 py-5">
              {renderSidebarContent()}
            </div>

            {/* Drawer Footer */}
            <div className="flex items-center gap-3 border-t border-[#eee8df] bg-[#fcfbf9] px-5 py-3.5">
              <button
                type="button"
                onClick={handleResetFilters}
                className="flex-1 rounded-xl border border-[#dfd6ca] bg-white py-2.5 text-xs font-bold text-[#68736e] hover:bg-[#f4eee6] transition"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={() => setIsMobileFilterOpen(false)}
                className="flex-1 rounded-xl bg-[#1b2925] py-2.5 text-xs font-bold text-white hover:bg-[#b87840] transition"
              >
                View ({filteredItems.length})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PRODUCT QUICK VIEW MODAL (FOR GIFTS & ALBUMS) */}
      {quickViewItem && (
        <ProductQuickView
          item={quickViewItem.item}
          type={quickViewItem.type}
          image={quickViewItem.image}
          onClose={() => setQuickViewItem(null)}
        />
      )}
    </main>
  );
};

export default Shop;
