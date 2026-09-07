import { useContext, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  BookOpen,
  Heart,
} from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import api, { API_URL } from "../../api";
import PageContainer from "../../CommonComponents/PageContainer";
import { StoreContext } from "../../PrivateRouter/StoreContext";

// Fallback albums in case DB has few or no albums
const FALLBACK_ALBUMS = [
  {
    id: "fb-alb-1",
    product_name: "Heritage Wedding Lay-Flat Album",
    sub_category: "Wedding",
    occasion: "Wedding",
    size: "12 x 18 Inches",
    total_pages: 40,
    cover_material: "Leatherette",
    selling_price: 2499,
    discount_price: 1899,
    thumbnail_image:
      "https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&auto=format&fit=crop&q=80",
  },
  {
    id: "fb-alb-2",
    product_name: "Royal Anniversary Memory Book",
    sub_category: "Anniversary",
    occasion: "Anniversary",
    size: "10 x 14 Inches",
    total_pages: 36,
    cover_material: "Matte Hardcover",
    selling_price: 1999,
    discount_price: 1499,
    thumbnail_image:
      "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&auto=format&fit=crop&q=80",
  },
  {
    id: "fb-alb-3",
    product_name: "Cherished Family Chronicle",
    sub_category: "Family",
    occasion: "Family",
    size: "12 x 12 Inches",
    total_pages: 50,
    cover_material: "Linen Hardcover",
    selling_price: 2799,
    discount_price: 2199,
    thumbnail_image:
      "https://images.unsplash.com/photo-1532012164546-f432f2e3edd3?w=800&auto=format&fit=crop&q=80",
  },
  {
    id: "fb-alb-4",
    product_name: "Baby First Year Milestones",
    sub_category: "Baby & Kids",
    occasion: "Baby",
    size: "8 x 10 Inches",
    total_pages: 30,
    cover_material: "Silk Touch",
    selling_price: 1599,
    discount_price: 1199,
    thumbnail_image:
      "https://images.unsplash.com/photo-1516541196182-6bdb0516ed27?w=800&auto=format&fit=crop&q=80",
  },
  {
    id: "fb-alb-5",
    product_name: "Golden Hour Travel Journal",
    sub_category: "Travel",
    occasion: "Travel",
    size: "10 x 10 Inches",
    total_pages: 32,
    cover_material: "Textured Hardcover",
    selling_price: 1899,
    discount_price: 1399,
    thumbnail_image:
      "https://images.unsplash.com/photo-1511108690759-009324a90311?w=800&auto=format&fit=crop&q=80",
  },
];

const DEFAULT_ALBUM_FALLBACK =
  "https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&auto=format&fit=crop&q=80";

const resolveImageUrl = (value) => {
  if (!value || typeof value !== "string") return "";
  if (/^(data:|blob:|https?:\/\/)/i.test(value)) return value;
  const path = `/${value.replace(/^\/+/, "")}`;
  if (/^\/api\/?$/i.test(API_URL)) return path;
  return `${API_URL.replace(/\/api\/?$/, "")}${path}`;
};

const AlbumShowcase = () => {
  const [albums, setAlbums] = useState([]);
  const [activeFilter, setActiveFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const { wishlist = [], toggleWishlist } = useContext(StoreContext) || {};

  useEffect(() => {
    let isMounted = true;
    const fetchAlbums = async () => {
      try {
        const response = await api.get("/albums");
        const rows = Array.isArray(response.data?.data) ? response.data.data : [];
        const activeAlbums = rows.filter(
          (a) => (a.status || "Active").toLowerCase() === "active"
        );
        if (isMounted) {
          setAlbums(activeAlbums);
        }
      } catch (error) {
        console.warn("Album showcase fetch fallback:", error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    fetchAlbums();
    return () => {
      isMounted = false;
    };
  }, []);

  const albumList = useMemo(() => {
    return albums.length > 0 ? albums : FALLBACK_ALBUMS;
  }, [albums]);

  // Extract distinct occasions / sub_categories
  const filterOptions = useMemo(() => {
    const set = new Set();
    albumList.forEach((album) => {
      const cat = album.sub_category || album.occasion;
      if (cat) set.add(cat);
    });
    return ["All", ...Array.from(set)];
  }, [albumList]);

  // Filtered albums
  const displayedAlbums = useMemo(() => {
    if (activeFilter === "All") return albumList.slice(0, 5);
    const filtered = albumList.filter((album) => {
      const cat = (album.sub_category || album.occasion || "").toLowerCase();
      return cat === activeFilter.toLowerCase();
    });
    return filtered.length > 0 ? filtered.slice(0, 5) : albumList.slice(0, 5);
  }, [albumList, activeFilter]);

  return (
    <section className="relative overflow-hidden bg-[#fffdfa] py-14 sm:py-18 lg:py-20 border-t border-[#eee5d8]">
      <PageContainer>
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 sm:pb-8 border-b border-[#ebdcca]">
          <div>
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-[#b07838]" />
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#b07838]">
                Handcrafted Keepsakes
              </p>
            </div>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-[#14201d] sm:text-3xl lg:text-4xl">
              Signature Photo{" "}
              <span className="font-serif italic font-normal text-[#b07838]">
                Albums &amp; Books
              </span>
            </h2>
            <p className="mt-2 max-w-xl text-xs sm:text-sm text-[#5d6863]">
              Lay-flat bindings, luxury leatherette covers, and archival-grade photo
              prints crafted to tell your story beautifully.
            </p>
          </div>

          <Link
            to="/albums"
            className="group inline-flex items-center gap-2 self-start md:self-auto rounded-lg border border-[#d6c7b2] bg-white px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-[#14201d] transition hover:border-[#14201d] hover:bg-[#14201d] hover:text-white shadow-xs"
          >
            <span>View All Albums</span>
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
                    : "bg-[#f4efe8] text-[#55635e] hover:bg-[#eae2d7] hover:text-[#14201d]"
                }`}
              >
                {filter}
              </button>
            );
          })}
        </div>

        {/* Albums Grid */}
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
              {displayedAlbums.map((album) => {
                const image =
                  resolveImageUrl(album.thumbnail_image) ||
                  resolveImageUrl(album.product_images?.[0]) ||
                  DEFAULT_ALBUM_FALLBACK;
                const sellingPrice = Number(album.selling_price || 0);
                const discountPrice = Number(
                  album.discount_price || sellingPrice
                );
                const discountPercentage =
                  album.discount_percentage ||
                  (sellingPrice > discountPrice
                    ? Math.round(
                        ((sellingPrice - discountPrice) / sellingPrice) * 100
                      )
                    : 0);
                const albumId = album.id || album.product_id;
                const isOutOfStock =
                  album.stock_status === "Out of Stock" || Number(album.stock_quantity) <= 0;
                const isFavorite = wishlist.some(
                  (item) => String(item.product_id || item.id || item._id) === String(albumId),
                );

                return (
                  <SwiperSlide key={albumId} className="!h-auto">
                    <article className="group flex h-full flex-col overflow-hidden rounded-3xl border border-[#e7ded2] bg-white shadow-xs transition hover:-translate-y-1.5 hover:shadow-xl">
                    {/* Image Area */}
                    <div className="relative flex h-64 cursor-pointer items-center justify-center overflow-hidden bg-[#f4eee6] p-5">
                      <Link to={`/albums?albumId=${albumId}`} className="h-full w-full">
                        <img src={image} alt={album.product_name} loading="lazy" onError={(e) => { e.currentTarget.src = DEFAULT_ALBUM_FALLBACK; }} className="h-full w-full object-contain transition duration-300 group-hover:scale-105" />
                      </Link>

                      {/* Badges */}
                      <span className="absolute bottom-3 left-3 flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur-xs">
                        <BookOpen className="h-3 w-3 text-[#d4a553]" />
                        {album.total_pages || 40} Pages • Lay Flat
                      </span>

                      <button type="button" onClick={(event) => { event.preventDefault(); event.stopPropagation(); toggleWishlist?.({ ...album, __wishlistType: "album" }); }} className={`absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full shadow-sm transition ${isFavorite ? "bg-[#d79d4a] text-[#1d2925]" : "bg-white/90 text-[#555] hover:bg-white hover:text-[#b07838]"}`} aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"} title={isFavorite ? "Remove from favorites" : "Add to favorites"}>
                        <Heart className="h-5 w-5" fill={isFavorite ? "currentColor" : "none"} />
                      </button>
                      <span className={`absolute right-14 top-3 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider shadow-xs ${isOutOfStock ? "border border-red-200 bg-red-50 text-red-600" : "bg-white/95 text-[#1a3c36]"}`}>
                        {isOutOfStock ? "Out of Stock" : album.size || "Album"}
                      </span>
                      {discountPercentage > 0 && <span className="absolute left-3 top-3 rounded-full bg-[#1a3c36] px-2.5 py-1 text-[10px] font-bold text-white shadow-xs">{discountPercentage}% OFF</span>}
                    </div>

                    {/* Content */}
                    <div className="flex flex-1 flex-col p-5">
                      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#b07838]">{album.sub_category || album.occasion || "Photo Album"}</p>
                      <Link to={`/albums?albumId=${albumId}`} className="mt-1.5 truncate text-base font-bold text-[#1d2925] hover:text-[#b07838]" title={album.product_name}>{album.product_name}</Link>
                      <p className="mt-1 truncate text-xs text-[#777]">{album.cover_material || "Hard Cover"} • {album.page_thickness || "300 GSM"}</p>
                      <div className="mt-4 flex items-center justify-between">
                        <div><span className="text-xl font-black text-[#1a3c36]">₹{discountPrice || sellingPrice || "--"}</span>{sellingPrice > discountPrice && <span className="ml-2 text-xs text-[#999] line-through">₹{sellingPrice}</span>}</div>
                        <Link to={`/albums?albumId=${albumId}`} className="inline-flex items-center gap-1 rounded-lg bg-[#14201d] px-3 py-1.5 text-[11px] font-bold text-white transition hover:bg-[#b07838]"><span>Explore</span><ArrowUpRight className="h-3.5 w-3.5" /></Link>
                      </div>
                    </div>
                    </article>
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

export default AlbumShowcase;
