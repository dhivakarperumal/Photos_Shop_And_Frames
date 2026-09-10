import { useEffect, useMemo, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  Camera,
  ChevronLeft,
  ChevronRight,
  Eye,
  Sparkles,
  X,
} from "lucide-react";
import api, { API_URL } from "../../api";
import PageContainer from "../../CommonComponents/PageContainer";

// Fallback curated sample photos in case DB has no albums yet
const FALLBACK_PHOTOS = [
  {
    id: "fb-1",
    src: "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&auto=format&fit=crop&q=80",
    title: "Golden Hour Wedding",
    category: "Wedding",
  },
  {
    id: "fb-2",
    src: "https://images.unsplash.com/photo-1511895426328-dc8714191300?w=800&auto=format&fit=crop&q=80",
    title: "Family Picnic Joy",
    category: "Family",
  },
  {
    id: "fb-3",
    src: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=80",
    title: "Mountain Escape",
    category: "Travel",
  },
  {
    id: "fb-4",
    src: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&auto=format&fit=crop&q=80",
    title: "Natural Portrait",
    category: "Portraits",
  },
  {
    id: "fb-5",
    src: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&auto=format&fit=crop&q=80",
    title: "Minimalist Wall Art",
    category: "Photo Frames",
  },
];

const DEFAULT_IMAGE_FALLBACK =
  "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&auto=format&fit=crop&q=80";

const resolveImageUrl = (value) => {
  if (!value || typeof value !== "string") return "";
  if (/^(data:|blob:|https?:\/\/)/i.test(value)) return value;
  const path = `/${value.replace(/^\/+/, "")}`;
  if (/^\/api\/?$/i.test(API_URL)) return path;
  return `${API_URL.replace(/\/api\/?$/, "")}${path}`;
};

const HomeGallery = () => {
  const [albums, setAlbums] = useState([]);
  const [activeFilter, setActiveFilter] = useState("All");
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchGallery = async () => {
      try {
        const response = await api.get("/gallery");
        const activeAlbums = (
          Array.isArray(response.data?.data) ? response.data.data : []
        ).filter((album) => (album.status || "Active") === "Active");

        const detailedAlbums = await Promise.all(
          activeAlbums.map(async (album) => {
            try {
              const detail = await api.get(`/gallery/${album.album_id}`);
              return detail.data?.data || album;
            } catch {
              return album;
            }
          })
        );

        if (isMounted) {
          setAlbums(detailedAlbums);
        }
      } catch (error) {
        console.warn("Home gallery fetch fallback:", error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchGallery();
    return () => {
      isMounted = false;
    };
  }, []);

  // Extract all photos from albums
  const allPhotos = useMemo(() => {
    const list = [];
    albums.forEach((album) => {
      const category = album.category || "Photo Frames";
      const title = album.title || "Framed Memory";

      if (Array.isArray(album.photos) && album.photos.length > 0) {
        album.photos.forEach((photo, idx) => {
          const src = resolveImageUrl(photo);
          if (src) {
            list.push({
              id: `${album.album_id || album.id}-${idx}`,
              src,
              title,
              category,
            });
          }
        });
      } else if (album.cover_image) {
        const src = resolveImageUrl(album.cover_image);
        if (src) {
          list.push({
            id: `${album.album_id || album.id}-cover`,
            src,
            title,
            category,
          });
        }
      }
    });

    return list.length > 0 ? list : FALLBACK_PHOTOS;
  }, [albums]);

  // Extract distinct category filters
  const categories = useMemo(() => {
    const set = new Set();
    allPhotos.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return ["All", ...Array.from(set)];
  }, [allPhotos]);

  // Filter photos and strictly slice to 5 for exactly ONE row on desktop
  const displayedPhotos = useMemo(() => {
    const filtered =
      activeFilter === "All"
        ? allPhotos
        : allPhotos.filter(
          (p) => p.category?.toLowerCase() === activeFilter.toLowerCase()
        );
    return filtered.slice(0, 5);
  }, [allPhotos, activeFilter]);

  const selectedPhoto =
    selectedPhotoIndex !== null && displayedPhotos[selectedPhotoIndex]
      ? displayedPhotos[selectedPhotoIndex]
      : null;

  const handlePrev = useCallback(() => {
    if (selectedPhotoIndex === null) return;
    setSelectedPhotoIndex((prev) =>
      prev === 0 ? displayedPhotos.length - 1 : prev - 1
    );
  }, [selectedPhotoIndex, displayedPhotos.length]);

  const handleNext = useCallback(() => {
    if (selectedPhotoIndex === null) return;
    setSelectedPhotoIndex((prev) =>
      prev === displayedPhotos.length - 1 ? 0 : prev + 1
    );
  }, [selectedPhotoIndex, displayedPhotos.length]);

  // Keyboard navigation (Escape, ArrowLeft, ArrowRight)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (selectedPhotoIndex === null) return;
      if (e.key === "Escape") setSelectedPhotoIndex(null);
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
    };
    if (selectedPhotoIndex !== null) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedPhotoIndex, handlePrev, handleNext]);

  return (
    <section className="relative overflow-hidden bg-[#fffdfa] py-14 sm:py-18 lg:py-20 border-t border-[#eee5d8]">
      <PageContainer>
       
        {/* Section Header */}
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-5 pb-6 sm:pb-8 border-b border-[#ebdcca]">

          {/* Captured & Framed */}
          <div className="shrink-0">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[#b07838]" />
              <p className="text-base font-bold uppercase tracking-[0.24em] text-[#b07838]">
                Captured &amp; Framed
              </p>
            </div>
          </div>

          {/* Center Filter Bar */}
          <div className="flex-1 flex items-center justify-center min-w-0">
            <div className="flex items-center justify-center gap-2 overflow-x-auto max-w-full pb-1 scrollbar-none">
              {categories.map((cat) => {
                const isActive =
                  activeFilter.toLowerCase() === cat.toLowerCase();

                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => {
                      setActiveFilter(cat);
                      setSelectedPhotoIndex(null);
                    }}
                    className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold tracking-wide transition-all duration-200 ${isActive
                        ? "bg-[#14201d] text-white shadow-sm ring-2 ring-[#14201d]/15"
                        : "bg-[#f4efe8] text-[#55635e] hover:bg-[#eae2d7] hover:text-[#14201d]"
                      }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* View Full Gallery */}
          <Link
            to="/gallery"
            className="group shrink-0 inline-flex items-center justify-center gap-2 rounded-lg border border-[#d6c7b2] bg-white px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-[#14201d] transition hover:border-[#14201d] hover:bg-[#14201d] hover:text-white shadow-xs"
          >
            <span>View Full Gallery</span>
            <ArrowUpRight className="h-4 w-4 transition duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>
        


        {/* Gallery Content - 5 items in 1 row on desktop */}
        <div className="mt-7">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="aspect-[4/5] animate-pulse rounded-xl bg-[#ede5da]"
                />
              ))}
            </div>
          ) : displayedPhotos.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[#d6c7b2] bg-[#fcf9f5] py-14 text-center">
              <Camera className="mx-auto h-8 w-8 text-[#b07838]/60" />
              <p className="mt-2 text-sm font-semibold text-[#14201d]">
                No photos found in "{activeFilter}"
              </p>
              <button
                type="button"
                onClick={() => setActiveFilter("All")}
                className="mt-3 inline-flex text-xs font-bold uppercase tracking-wider text-[#b07838] underline hover:text-[#8a5720]"
              >
                Show All Photos
              </button>
            </div>
          ) : (
            /* Responsive Grid: 2 on mobile, 3 on small tablets, 4 on medium, exactly 5 in 1 row on desktop */
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
              {displayedPhotos.map((photo, index) => (
                <article
                  key={photo.id || index}
                  onClick={() => setSelectedPhotoIndex(index)}
                  className="group relative aspect-[4/5] overflow-hidden rounded-xl bg-[#eee7df] border border-[#e4d8c8] shadow-xs cursor-pointer transition-all duration-300 hover:shadow-lg hover:border-[#b07838]/50"
                >
                  <img
                    src={photo.src}
                    alt={photo.title || "Gallery memory"}
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.src = DEFAULT_IMAGE_FALLBACK;
                    }}
                    className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                  />

                  {/* Gradient Overlay & Captions */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-3 sm:p-4 text-white">
                    <div className="flex justify-between items-start">
                      <span className="rounded-full bg-white/25 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-semibold tracking-wider uppercase text-white">
                        {photo.category}
                      </span>
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20 backdrop-blur-md text-white transition hover:bg-white hover:text-[#14201d]">
                        <Eye className="h-3.5 w-3.5" />
                      </span>
                    </div>

                    <div>
                      <p className="line-clamp-1 text-xs sm:text-sm font-bold text-white">
                        {photo.title}
                      </p>
                      <span className="mt-1 inline-flex items-center gap-1 text-[10px] text-[#e0b987] font-semibold">
                        Click to view
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </PageContainer>

      {/* Lightbox Modal */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
          onClick={() => setSelectedPhotoIndex(null)}
        >
          <div
            className="relative max-h-[90vh] max-w-3xl w-full overflow-hidden rounded-2xl bg-white shadow-2xl transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setSelectedPhotoIndex(null)}
              className="absolute right-3 top-3 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm transition hover:bg-black"
              aria-label="Close image"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Modal Image Area with Prev/Next Navigation */}
            <div className="relative flex items-center justify-center bg-[#14201d] max-h-[75vh] min-h-[300px]">
              {displayedPhotos.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePrev();
                    }}
                    className="absolute left-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition hover:bg-black hover:scale-105"
                    aria-label="Previous photo"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNext();
                    }}
                    className="absolute right-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition hover:bg-black hover:scale-105"
                    aria-label="Next photo"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>
                </>
              )}

              <img
                src={selectedPhoto.src}
                alt={selectedPhoto.title}
                onError={(e) => {
                  e.currentTarget.src = DEFAULT_IMAGE_FALLBACK;
                }}
                className="max-h-[75vh] w-auto max-w-full object-contain"
              />
            </div>

            {/* Modal Details */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 border-t border-[#f0e7dc]">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#b07838]">
                  {selectedPhoto.category}
                </span>
                <h3 className="text-base font-bold text-[#14201d]">
                  {selectedPhoto.title}
                </h3>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-xs text-[#7d8783]">
                  {selectedPhotoIndex + 1} of {displayedPhotos.length}
                </span>
                <Link
                  to="/gallery"
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#b07838] hover:text-[#8a5720]"
                  onClick={() => setSelectedPhotoIndex(null)}
                >
                  Explore in Gallery <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default HomeGallery;
