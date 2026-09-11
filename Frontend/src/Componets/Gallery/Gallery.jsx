import { useEffect, useMemo, useState } from "react";
import {
  Camera,
  ChevronDown,
  CircleUserRound,
  Gift,
  Grid2X2,
  Heart,
  Image,
  Leaf,
  List,
  Loader2,
  Plane,
  PawPrint,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import api, { API_URL } from "../../api";
import PageContainer from "../../CommonComponents/PageContainer";
import PageHeader from "../../CommonComponents/PageHeader";

const categoryIcons = {
  Family: Users,
  Wedding: Heart,
  Travel: Plane,
  Kids: CircleUserRound,
  Pets: PawPrint,
  Nature: Leaf,
  Events: Gift,
  Frames: Image,
  Gifts: Gift,
};

const imageUrl = (value) => {
  if (!value || typeof value !== "string") return "";
  if (/^(data:|blob:|https?:\/\/)/i.test(value)) return value;
  const path = `/${value.replace(/^\/+/, "")}`;
  if (/^\/api\/?$/i.test(API_URL)) return path;
  return `${API_URL.replace(/\/api\/?$/, "")}${path}`;
};

const readPhotos = (album) => {
  const photos = Array.isArray(album.photos) ? album.photos : [];
  return photos
    .map((photo, index) => ({
      src: imageUrl(photo),
      category: album.category || "Frames",
      title: album.title || "Customer memory",
      id: `${album.album_id || album.id}-${index}`,
    }))
    .filter((photo) => photo.src);
};

const Gallery = () => {
  const [albums, setAlbums] = useState([]);
  const [activeCategory, setActiveCategory] = useState("All Photos");
  const [sort, setSort] = useState("Latest");
  const [visibleCount, setVisibleCount] = useState(20);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("card");

  useEffect(() => {
    const loadGallery = async () => {
      try {
        const response = await api.get("/gallery");
        const activeAlbums = (
          Array.isArray(response.data?.data) ? response.data.data : []
        ).filter((album) => (album.status || "Active") === "Active");
        const details = await Promise.all(
          activeAlbums.map(async (album) => {
            try {
              const detail = await api.get(`/gallery/${album.album_id}`);
              return detail.data?.data || album;
            } catch {
              return album;
            }
          }),
        );
        setAlbums(details);
      } catch (error) {
        console.error("Failed to load public gallery:", error);
      } finally {
        setLoading(false);
      }
    };
    loadGallery();
  }, []);

  const photos = useMemo(() => {
    const allPhotos = albums.flatMap(readPhotos);
    const filtered =
      activeCategory === "All Photos"
        ? allPhotos
        : allPhotos.filter(
            (photo) =>
              photo.category.toLowerCase() === activeCategory.toLowerCase(),
          );
    return sort === "Latest" ? filtered : [...filtered].reverse();
  }, [albums, activeCategory, sort]);

  const galleryCategories = useMemo(() => {
    const names = albums
      .map((album) => String(album.category || "").trim())
      .filter(Boolean);
    return [
      "All Photos",
      ...names.filter(
        (name, index) =>
          names.findIndex(
            (item) => item.toLowerCase() === name.toLowerCase(),
          ) === index,
      ),
    ];
  }, [albums]);

  useEffect(() => setVisibleCount(20), [activeCategory, sort]);

  return (
    <main className="bg-[#fffdfa] text-[#101d35]">
      <PageHeader title="Gallery" />
      <section className="relative z-0 overflow-visible border-b border-[#eadfd5] bg-[#f4eee9]">
        <PageContainer>
          <div className="grid min-h-[280px] items-center gap-6 py-7 sm:py-10 lg:grid-cols-[0.82fr_1.18fr] lg:gap-8 lg:py-12">
            <div className="relative z-10 max-w-xl text-center sm:text-left sm:pl-2">
              <h1 className="mt-2 text-3xl font-black leading-[1.08] tracking-tight sm:text-4xl md:text-5xl">
                Moments Framed
                <br />
                <span className="font-serif font-medium italic text-[#ed741d]">
                  Memories Forever
                </span>
              </h1>
              <p className="mx-auto mt-3 max-w-md text-xs sm:text-sm leading-5 sm:leading-6 text-[#344052] sm:mx-0">
                Explore beautiful memories captured by our customers and framed
                with love.
              </p>
            </div>

            <div className="relative flex min-h-[220px] sm:min-h-[260px] items-end justify-center lg:min-h-[300px] pb-2">
              <div className="absolute bottom-0 left-1/4 h-24 w-24 rounded-full bg-[#6d914d]/20 blur-2xl" />
              <div className="relative flex w-full max-w-sm sm:max-w-xl md:max-w-2xl items-end justify-center gap-3 sm:gap-4 px-2 sm:px-4">
                {/* Left Frame (Gold) - visible on sm+ screens */}
                <div className="hidden sm:block w-32 md:w-44 aspect-[3/4] shrink-0 rounded-sm border-[6px] md:border-[7px] border-[#c7a16b] bg-white p-1 shadow-xl transition-transform duration-300 hover:-translate-y-1">
                  <img
                    src="/images/1.png"
                    alt="Frame collection"
                    className="h-full w-full object-cover object-center"
                  />
                </div>

                {/* Center Frame (Black) - main centerpiece with true 3:4 frame proportions */}
                <div className="w-[50%] max-w-[190px] sm:w-44 md:w-56 aspect-[3/4] shrink-0 rounded-sm border-[7px] sm:border-[9px] border-[#252525] bg-white p-1 shadow-2xl transition-transform duration-300 hover:-translate-y-1">
                  <img
                    src={imageUrl(albums[0]?.photos?.[0]) || "/images/1.png"}
                    alt="Featured framed memory"
                    className="h-full w-full object-cover object-center"
                  />
                </div>

                {/* Right Frame (Rich Wood) - companion frame */}
                <div className="w-[42%] max-w-[160px] sm:w-36 md:w-48 aspect-[3/4] shrink-0 rounded-sm border-[6px] sm:border-[7px] border-[#9b5b2c] bg-white p-1 shadow-xl transition-transform duration-300 hover:-translate-y-1">
                  <img
                    src={imageUrl(albums[0]?.photos?.[1]) || "/images/1.png"}
                    alt="Featured framed landscape"
                    className="h-full w-full object-cover object-center"
                  />
                </div>
              </div>
            </div>
          </div>
        </PageContainer>

        {/* RESPONSIVE CATEGORY BAR */}
        <div className="relative z-30 mx-auto -mb-6 sm:-mb-8 max-w-6xl px-3 sm:px-4">
          <div className="relative z-30 flex items-center gap-2 overflow-x-auto rounded-2xl border border-[#eee8e1] bg-white p-2 shadow-[0_8px_25px_rgba(31,31,31,0.1)] scrollbar-none sm:grid sm:grid-cols-5 md:grid-cols-8 lg:grid-cols-10 sm:gap-1">
            {galleryCategories.map((label) => {
              const Icon =
                label === "All Photos"
                  ? Grid2X2
                  : categoryIcons[label] || Image;
              const isSelected = activeCategory === label;
              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => setActiveCategory(label)}
                  className={`flex shrink-0 min-w-[76px] sm:min-w-0 flex-col items-center gap-1.5 rounded-xl px-2.5 sm:px-1 py-2.5 sm:py-3 text-[10px] font-bold transition ${
                    isSelected
                      ? "bg-[#fff0e3] text-[#ed741d] shadow-2xs"
                      : "text-[#4b5563] hover:bg-[#f8f5f2] hover:text-[#101d35]"
                  }`}
                >
                  <Icon
                    className={`h-5 w-5 transition-transform duration-200 ${
                      isSelected ? "scale-110 text-[#ed741d]" : "text-[#6b7280]"
                    }`}
                  />
                  <span className="whitespace-nowrap sm:truncate text-center">
                    {label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section id="gallery-grid" className="pt-12 sm:pt-16">
        <PageContainer>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs font-semibold text-[#303b4b]">
              Showing{" "}
              {photos.length ? `1-${Math.min(visibleCount, photos.length)}` : 0}{" "}
              of {photos.length} photos
            </p>
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 rounded-md border border-[#e0ddd9] bg-white px-3 py-2 text-xs text-[#4b5563]">
                Sort by:
                <select
                  value={sort}
                  onChange={(event) => setSort(event.target.value)}
                  className="bg-transparent font-semibold outline-none"
                >
                  <option>Latest</option>
                  <option>Oldest</option>
                </select>
                <ChevronDown className="h-3.5 w-3.5" />
              </label>
              <button
                type="button"
                onClick={() => setViewMode("card")}
                className={`flex h-9 w-9 items-center justify-center rounded-md ${viewMode === "card" ? "bg-[#102139] text-white" : "border border-[#dedbd7] text-[#667085]"}`}
                aria-label="Card view"
                aria-pressed={viewMode === "card"}
                title="Card view"
              >
                <Grid2X2 className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={`flex h-9 w-9 items-center justify-center rounded-md ${viewMode === "table" ? "bg-[#102139] text-white" : "border border-[#dedbd7] text-[#667085]"}`}
                aria-label="Table view"
                aria-pressed={viewMode === "table"}
                title="Table view"
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
          {loading ? (
            <div className="flex justify-center py-24">
              <Loader2 className="h-8 w-8 animate-spin text-[#ed741d]" />
            </div>
          ) : photos.length === 0 ? (
            <div className="rounded-2xl border border-[#eadfd5] bg-[#faf7f3] py-24 text-center text-sm text-[#647080]">
              No gallery photos available yet.
            </div>
          ) : (
            <div
              className={
                viewMode === "card"
                  ? "grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
                  : "overflow-hidden rounded-xl border border-[#e7e0d8] bg-white"
              }
            >
              {photos.slice(0, visibleCount).map((photo, index) => (
                <button
                  key={photo.id}
                  type="button"
                  onClick={() => setSelectedPhoto(photo)}
                  className={
                    viewMode === "card"
                      ? "group relative aspect-square overflow-hidden rounded-xl bg-[#eee7df] text-left shadow-2xs transition hover:shadow-md"
                      : "flex w-full items-center gap-4 border-b border-[#eee8e1] p-3 text-left last:border-b-0 hover:bg-[#faf7f3]"
                  }
                >
                  <span
                    className={
                      viewMode === "table"
                        ? "w-10 shrink-0 text-xs font-semibold text-[#9a6a39]"
                        : "hidden"
                    }
                  >
                    {index + 1}
                  </span>
                  <img
                    src={photo.src}
                    alt={photo.title}
                    loading="lazy"
                    className={
                      viewMode === "card"
                        ? "h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        : "h-20 w-24 shrink-0 rounded-lg object-cover"
                    }
                  />
                  <span
                    className={
                      viewMode === "card"
                        ? "absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-2.5 text-[11px] font-semibold text-white transition sm:translate-y-full sm:bg-black/65 sm:group-hover:translate-y-0"
                        : "text-sm font-bold text-[#263448]"
                    }
                  >
                    {photo.title}
                  </span>
                </button>
              ))}
            </div>
          )}
          {!loading && visibleCount < photos.length && (
            <div className="flex justify-center py-6">
              <button
                type="button"
                onClick={() => setVisibleCount((count) => count + 20)}
                className="inline-flex items-center gap-2 rounded-xl border border-[#cfd4d9] bg-white px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-[#263448] shadow-xs hover:border-[#ed741d] hover:text-[#ed741d]"
              >
                Load more <Loader2 className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </PageContainer>
      </section>

      <section className="mt-8 border-y border-[#eee8e1] bg-[#fffdfa]">
        <PageContainer>
          <div className="grid gap-4 py-5 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-center gap-3 border-[#eee8e1] px-2 lg:border-r">
              <Sparkles className="h-7 w-7 text-[#ed741d]" />
              <div>
                <p className="text-[11px] font-bold">High Quality Prints</p>
                <p className="text-[10px] text-[#657080]">
                  Vibrant &amp; long lasting
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 border-[#eee8e1] px-2 sm:border-r">
              <Camera className="h-7 w-7 text-[#ed741d]" />
              <div>
                <p className="text-[11px] font-bold">Beautifully Framed</p>
                <p className="text-[10px] text-[#657080]">
                  With love &amp; precision
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 border-[#eee8e1] px-2 lg:border-r">
              <Heart className="h-7 w-7 text-[#ed741d]" />
              <div>
                <p className="text-[11px] font-bold">Customer Memories</p>
                <p className="text-[10px] text-[#657080]">Shared with pride</p>
              </div>
            </div>
            <div className="flex items-center gap-3 px-2">
              <Users className="h-7 w-7 text-[#ed741d]" />
              <div>
                <p className="text-[11px] font-bold">Join Our Community</p>
                <p className="text-[10px] text-[#657080]">Share your moments</p>
              </div>
            </div>
          </div>
        </PageContainer>
      </section>
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-[#081321]/85 p-4"
          role="dialog"
          aria-modal="true"
          onMouseDown={(event) =>
            event.target === event.currentTarget && setSelectedPhoto(null)
          }
        >
          <div className="relative max-h-[90vh] max-w-4xl rounded-2xl bg-white p-2 sm:p-3 shadow-2xl">
            <button
              type="button"
              onClick={() => setSelectedPhoto(null)}
              className="absolute right-2 top-2 sm:-right-3 sm:-top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-[#ed741d] text-white shadow-md hover:bg-[#d66515] transition"
              aria-label="Close image"
            >
              <X className="h-4 w-4" />
            </button>
            <img
              src={selectedPhoto.src}
              alt={selectedPhoto.title}
              className="max-h-[78vh] sm:max-h-[82vh] max-w-full rounded-xl object-contain mx-auto"
            />
            {selectedPhoto.title && (
              <p className="mt-2 text-center text-xs font-bold text-[#1d2925] truncate px-3">
                {selectedPhoto.title}
              </p>
            )}
          </div>
        </div>
      )}
    </main>
  );
};

export default Gallery;
