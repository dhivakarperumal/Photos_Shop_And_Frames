import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  Gift,
} from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import api, { API_URL } from "../../api";
import CollectionCard from "../../CommonComponents/CollectionCard";
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
  {
    id: "fb-gift-5",
    name: "Personalized Celebration Memory Box",
    category: "Special Moments",
    box_size: "Large",
    material: "Premium Rigid Box",
    box_type: "Magnetic Closure",
    mrp: 2400,
    selling_price: 1899,
    discount_percentage: 21,
    gift_items: [{ name: "Photo Frame" }, { name: "Message Card" }],
    image:
      "https://images.unsplash.com/photo-1513883049090-d0b7439799bf?w=800&auto=format&fit=crop&q=80",
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

  // Filtered gifts (up to 5 items)
  const displayedGifts = useMemo(() => {
    if (activeFilter === "All") return giftList.slice(0, 5);
    const filtered = giftList.filter((gift) => {
      return (gift.category || "").toLowerCase() === activeFilter.toLowerCase();
    });
    return filtered.length > 0 ? filtered.slice(0, 5) : giftList.slice(0, 5);
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="aspect-[4/5] animate-pulse rounded-2xl bg-[#ede5da]"
                />
              ))}
            </div>
          ) : (
            <Swiper
              modules={[Navigation]}
              navigation
              spaceBetween={20}
              slidesPerView={1.15}
              breakpoints={{
                640: { slidesPerView: 2 },
                768: { slidesPerView: 3 },
                1024: { slidesPerView: 4 },
                1280: { slidesPerView: 5 },
              }}
              className="home-showcase-swiper !overflow-visible"
            >
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
                const giftId = gift.id || gift.gift_box_id;
                const isOutOfStock =
                  gift.stock_status === "Out of Stock" || Number(gift.current_stock) <= 0;

                return (
                  <SwiperSlide key={giftId} className="!h-auto">
                    <CollectionCard
                      product={gift}
                      type="gift"
                      image={image}
                      fallbackImage={DEFAULT_GIFT_FALLBACK}
                      title={gift.name}
                      category={gift.category || "Gift Box"}
                      badgeText={itemCount > 0 ? `${itemCount} Item${itemCount !== 1 ? "s" : ""} Inside` : ""}
                      sizeText={gift.box_size || "Gift Box"}
                      isOutOfStock={isOutOfStock}
                      discount={discount}
                      price={sellingPrice}
                      originalPrice={mrp}
                      metadata={gift.description || `${gift.box_type || "Magnetic Closure"} • ${gift.material || "Rigid Box"}`}
                      href={`/gifts?giftId=${giftId}`}
                    />
                  </SwiperSlide>
                );
              })}
            </Swiper>
          )}
        </div>
      </PageContainer>
    </section>
  );
};

export default GiftShowcase;
