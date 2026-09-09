import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  BookOpen,
} from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import api, { API_URL } from "../../api";
import AlbumCard from "../../CommonComponents/AlbumCard";
import PageContainer from "../../CommonComponents/PageContainer";
import ProductQuickView from "../../CommonComponents/ProductQuickView";

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
  const [selectedAlbum, setSelectedAlbum] = useState(null);

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

                return (
                  <SwiperSlide key={albumId} className="!h-auto">
                    <AlbumCard
                      album={album}
                      image={image}
                      fallbackImage={DEFAULT_ALBUM_FALLBACK}
                      title={album.product_name}
                      category={album.sub_category || album.occasion || "Photo Album"}
                      badgeText={`${album.total_pages || 40} Pages • Lay Flat`}
                      size={album.size || album.orientation || "Album"}
                      outOfStock={isOutOfStock}
                      discount={discountPercentage}
                      price={discountPrice || sellingPrice}
                      originalPrice={sellingPrice}
                      metadata={`${album.cover_material || "Hard Cover"} • ${album.page_thickness || "300 GSM"}`}
                      onOpen={setSelectedAlbum}
                    />
                  </SwiperSlide>
                );
              })}
            </Swiper>
          )}
        </div>
      </PageContainer>
      {selectedAlbum && <ProductQuickView item={selectedAlbum} type="album" image={resolveImageUrl(selectedAlbum.thumbnail_image) || resolveImageUrl(selectedAlbum.product_images?.[0]) || DEFAULT_ALBUM_FALLBACK} onClose={() => setSelectedAlbum(null)} />}
    </section>
  );
};

export default AlbumShowcase;
