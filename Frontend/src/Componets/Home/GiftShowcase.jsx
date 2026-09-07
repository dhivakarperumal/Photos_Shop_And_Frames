import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  Gift,
  Package,
  Sparkles,
  Heart,
} from "lucide-react";
import api, { API_URL } from "../../api";
import PageContainer from "../../CommonComponents/PageContainer";

// Fallback curated gift boxes
const FALLBACK_GIFTS = [
  {
    id: "fb-gift-1",
    name: "Celebration Birthday Keepsake Hamper",
    category: "Birthday Gift Box",
    box_size: "Medium",
    material: "Rigid Cardboard",
    box_type: "Magnetic Closure",
    mrp: 1800,
    selling_price: 1450,
    discount_percentage: 19,
    gift_items: [{ name: "Mini Frame" }, { name: "Wish Card" }, { name: "Chocolates" }],
    image:
      "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800&auto=format&fit=crop&q=80",
  },
  {
    id: "fb-gift-2",
    name: "Luxury Anniversary Wooden Treasure Box",
    category: "Anniversary Box",
    box_size: "Large",
    material: "Pine Wood",
    box_type: "Latch Lock",
    mrp: 2600,
    selling_price: 2199,
    discount_percentage: 15,
    gift_items: [{ name: "Acrylic Photo" }, { name: "Greeting Card" }, { name: "Keyring" }],
    image:
      "https://images.unsplash.com/photo-1513201099705-a9746e1e201f?w=800&auto=format&fit=crop&q=80",
  },
  {
    id: "fb-gift-3",
    name: "Heartfelt Memories Couple Hamper",
    category: "Love & Romance",
    box_size: "Medium",
    material: "Velvet Finish Box",
    box_type: "Pull-out Drawer",
    mrp: 2200,
    selling_price: 1750,
    discount_percentage: 20,
    gift_items: [{ name: "Insta Prints" }, { name: "Scented Candle" }, { name: "Stand" }],
    image:
      "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&auto=format&fit=crop&q=80",
  },
  {
    id: "fb-gift-4",
    name: "Festive Joy Personalized Gift Pack",
    category: "Festive & Special",
    box_size: "Standard",
    material: "Premium Rigid Box",
    box_type: "Ribbon Tie",
    mrp: 1500,
    selling_price: 1200,
    discount_percentage: 20,
    gift_items: [{ name: "Custom Magnet" }, { name: "Photo Booklet" }],
    image:
      "https://images.unsplash.com/photo-1543257580-7269da773bf5?w=800&auto=format&fit=crop&q=80",
  },
];

const DEFAULT_GIFT_FALLBACK =
  "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800&auto=format&fit=crop&q=80";

const resolveImageUrl = (value) => {
  if (!value || typeof value !== "string") return "";
  if (/^(data:|blob:|https?:\/\/)/i.test(value)) return value;
  const path = `/${value.replace(/^\/+/, "")}`;
  if (/^\/api\/?$/i.test(API_URL)) return path;
  return `${API_URL.replace(/\/api\/?$/, "")}${path}`;
};

const GiftShowcase = () => {
  const [gifts, setGifts] = useState([]);
  const [activeFilter, setActiveFilter] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchGifts = async () => {
      try {
        const response = await api.get("/gift-boxes");
        const rows = Array.isArray(response.data?.data) ? response.data.data : [];
        if (isMounted) {
          setGifts(rows);
        }
      } catch (error) {
        console.warn("Gift showcase fetch fallback:", error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    fetchGifts();
    return () => {
      isMounted = false;
    };
  }, []);

  const giftList = useMemo(() => {
    return gifts.length > 0 ? gifts : FALLBACK_GIFTS;
  }, [gifts]);

  // Extract unique categories
  const filterOptions = useMemo(() => {
    const set = new Set();
    giftList.forEach((gift) => {
      if (gift.category) set.add(gift.category);
    });
    return ["All", ...Array.from(set)];
  }, [giftList]);

  // Filtered gifts (up to 4 items)
  const displayedGifts = useMemo(() => {
    if (activeFilter === "All") return giftList.slice(0, 4);
    const filtered = giftList.filter((gift) => {
      return (gift.category || "").toLowerCase() === activeFilter.toLowerCase();
    });
    return filtered.length > 0 ? filtered.slice(0, 4) : giftList.slice(0, 4);
  }, [giftList, activeFilter]);

  return (
    <section className="relative overflow-hidden bg-[#f7f3ed] py-14 sm:py-18 lg:py-20 border-t border-[#eee5d8]">
      <PageContainer>
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 sm:pb-8 border-b border-[#ebdcca]">
          <div>
            <div className="flex items-center gap-2">
              <Gift className="h-4 w-4 text-[#b07838]" />
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#b07838]">
                Curated Gift Boxes
              </p>
            </div>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-[#14201d] sm:text-3xl lg:text-4xl">
              Thoughtful Gifts &amp;{" "}
              <span className="font-serif italic font-normal text-[#b07838]">
                Keepsake Boxes
              </span>
            </h2>
            <p className="mt-2 max-w-xl text-xs sm:text-sm text-[#5d6863]">
              Express affection with customizable gift hampers, engraved memory boxes,
              and surprise photo bundles for every milestone.
            </p>
          </div>

          <Link
            to="/gifts"
            className="group inline-flex items-center gap-2 self-start md:self-auto rounded-lg border border-[#d6c7b2] bg-white px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-[#14201d] transition hover:border-[#14201d] hover:bg-[#14201d] hover:text-white shadow-xs"
          >
            <span>Explore Gift Boxes</span>
            <ArrowUpRight className="h-4 w-4 transition duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>

        {/* Filter Pills */}
        <div className="mt-7 flex items-center justify-start sm:justify-center overflow-x-auto pb-2 scrollbar-none gap-2">
          {filterOptions.map((filter) => {
            const isActive = activeFilter.toLowerCase() === filter.toLowerCase();
            return (
              <button
                key={filter}
                type="button"
                onClick={() => setActiveFilter(filter)}
                className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold tracking-wide transition-all duration-200 ${
                  isActive
                    ? "bg-[#14201d] text-white shadow-sm ring-2 ring-[#14201d]/15"
                    : "bg-white text-[#55635e] hover:bg-[#ede5d8] hover:text-[#14201d] border border-[#e2d7c9]"
                }`}
              >
                {filter}
              </button>
            );
          })}
        </div>

        {/* Gifts Grid */}
        <div className="mt-7">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="aspect-[4/5] animate-pulse rounded-2xl bg-[#ede5da]"
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {displayedGifts.map((gift) => {
                const image =
                  resolveImageUrl(gift.image) ||
                  resolveImageUrl(gift.images?.[0]) ||
                  DEFAULT_GIFT_FALLBACK;
                const sellingPrice = Number(gift.selling_price || gift.mrp || 0);
                const mrp = Number(gift.mrp || sellingPrice);
                const discount =
                  gift.discount_percentage ||
                  (mrp > sellingPrice
                    ? Math.round(((mrp - sellingPrice) / mrp) * 100)
                    : 0);
                const itemCount = Array.isArray(gift.gift_items)
                  ? gift.gift_items.length
                  : 0;

                return (
                  <article
                    key={gift.id || gift.gift_box_id}
                    className="group flex flex-col overflow-hidden rounded-2xl border border-[#e5dbce] bg-white shadow-xs transition duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-[#b07838]/40"
                  >
                    {/* Image Area */}
                    <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-[#eee7df] p-4">
                      <img
                        src={image}
                        alt={gift.name}
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.src = DEFAULT_GIFT_FALLBACK;
                        }}
                        className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-105"
                      />

                      {/* Badges */}
                      {itemCount > 0 && (
                        <span className="absolute bottom-2.5 left-2.5 flex items-center gap-1 rounded-full bg-black/65 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur-xs">
                          <Package className="h-3 w-3 text-[#e0b987]" />
                          {itemCount} Items Included
                        </span>
                      )}

                      {discount > 0 && (
                        <span className="absolute top-2.5 right-2.5 rounded-full bg-[#b07838] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-xs">
                          {discount}% OFF
                        </span>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex flex-1 flex-col justify-between p-4">
                      <div>
                        <div className="flex items-center justify-between text-[11px] font-semibold text-[#8a8176]">
                          <span className="truncate">{gift.category || "Gift Box"}</span>
                          <span>{gift.box_size || "Standard"}</span>
                        </div>
                        <h3 className="mt-1 line-clamp-1 text-sm font-bold text-[#14201d] group-hover:text-[#b07838] transition">
                          {gift.name}
                        </h3>
                        {gift.box_type && (
                          <p className="mt-0.5 text-[10px] text-[#7d8783] truncate">
                            {gift.box_type} • {gift.material || "Rigid Box"}
                          </p>
                        )}
                      </div>

                      <div className="mt-4 flex items-center justify-between pt-3 border-t border-[#f0e8dd]">
                        <div>
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-base font-black text-[#14201d]">
                              ₹{sellingPrice.toLocaleString()}
                            </span>
                            {mrp > sellingPrice && (
                              <span className="text-xs text-[#9c958b] line-through">
                                ₹{mrp.toLocaleString()}
                              </span>
                            )}
                          </div>
                        </div>

                        <Link
                          to="/gifts"
                          className="inline-flex items-center gap-1 rounded-lg bg-[#14201d] px-3 py-1.5 text-[11px] font-bold text-white transition hover:bg-[#b07838]"
                        >
                          <span>Explore</span>
                          <ArrowUpRight className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </PageContainer>
    </section>
  );
};

export default GiftShowcase;
