import { useEffect, useMemo, useState } from "react";
import { Camera, ChevronDown, ChevronRight, CircleUserRound, Gift, Grid2X2, Heart, Image, Leaf, List, Loader2, Plane, PawPrint, Sparkles, Users, X } from "lucide-react";
import api, { API_URL } from "../../api";
import PageContainer from "../../CommonComponents/PageContainer";

const categories = [
  ["All Photos", Grid2X2], ["Family", Users], ["Wedding", Heart], ["Travel", Plane], ["Kids", CircleUserRound],
  ["Pets", PawPrint], ["Nature", Leaf], ["Events", Gift], ["Frames", Image], ["Gifts", Gift],
];

const imageUrl = (value) => {
  if (!value || typeof value !== "string") return "";
  if (/^(data:|blob:|https?:\/\/)/i.test(value)) return value;
  const path = `/${value.replace(/^\/+/, "")}`;
  if (/^\/api\/?$/i.test(API_URL)) return path;
  return `${API_URL.replace(/\/api\/?$/, "")}${path}`;
};

const readPhotos = (album) => {
  const photos = Array.isArray(album.photos) ? album.photos : [];
  return photos.map((photo, index) => ({
    src: imageUrl(photo),
    category: album.category || "Frames",
    title: album.title || "Customer memory",
    id: `${album.album_id || album.id}-${index}`,
  })).filter((photo) => photo.src);
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
        const activeAlbums = (Array.isArray(response.data?.data) ? response.data.data : []).filter((album) => (album.status || "Active") === "Active");
        const details = await Promise.all(activeAlbums.map(async (album) => {
          try {
            const detail = await api.get(`/gallery/${album.album_id}`);
            return detail.data?.data || album;
          } catch { return album; }
        }));
        setAlbums(details);
      } catch (error) {
        console.error("Failed to load public gallery:", error);
      } finally { setLoading(false); }
    };
    loadGallery();
  }, []);

  const photos = useMemo(() => {
    const allPhotos = albums.flatMap(readPhotos);
    const filtered = activeCategory === "All Photos"
      ? allPhotos
      : allPhotos.filter((photo) => photo.category.toLowerCase().includes(activeCategory.toLowerCase().replace(" photos", "")) || activeCategory === "Frames");
    return sort === "Latest" ? filtered : [...filtered].reverse();
  }, [albums, activeCategory, sort]);

  useEffect(() => setVisibleCount(20), [activeCategory, sort]);

  return (
    <main className="bg-[#fffdfa] text-[#101d35]">
      <section className="relative z-0 overflow-visible border-b border-[#eadfd5] bg-[#f4eee9] pt-28">
        <PageContainer>
          <div className="grid min-h-[330px] items-center gap-8 py-10 lg:grid-cols-[0.82fr_1.18fr] lg:py-12">
            <div className="relative z-10 max-w-xl pl-2"><p className="text-xs font-bold uppercase tracking-[0.22em] text-[#d8791f]">Our gallery</p><h1 className="mt-2 text-4xl font-black leading-[1.05] tracking-tight sm:text-5xl">Moments Framed<br /><span className="font-serif font-medium italic text-[#ed741d]">Memories Forever</span></h1><p className="mt-4 max-w-md text-sm leading-6 text-[#344052]">Explore beautiful memories captured by our customers and framed with love.</p><a href="#gallery-grid" className="mt-5 inline-flex items-center gap-2 rounded-md bg-[#102139] px-4 py-3 text-[11px] font-bold uppercase tracking-wide text-white shadow-sm hover:bg-[#1d3552]">Submit your photo <ChevronRight className="h-4 w-4" /></a></div>
            <div className="relative flex min-h-[260px] items-end justify-center lg:min-h-[300px]"><div className="absolute bottom-0 left-0 h-24 w-24 rounded-full bg-[#6d914d]/20 blur-2xl" /><div className="relative grid w-full max-w-2xl grid-cols-3 items-end gap-3 px-4"><div className="hidden h-36 rounded-t-sm border-[7px] border-[#c7a16b] bg-white shadow-xl sm:block"><img src="/images/1.png" alt="Frame collection" className="h-full w-full object-cover object-left" /></div><div className="h-64 rounded-sm border-[9px] border-[#252525] bg-white p-1 shadow-2xl sm:h-72"><img src={imageUrl(albums[0]?.photos?.[0]) || "/images/1.png"} alt="Featured framed memory" className="h-full w-full object-cover" /></div><div className="h-48 rounded-sm border-[7px] border-[#9b5b2c] bg-white p-1 shadow-xl sm:h-56"><img src={imageUrl(albums[0]?.photos?.[1]) || "/images/1.png"} alt="Featured framed landscape" className="h-full w-full object-cover" /></div></div></div>
          </div>
        </PageContainer>
              <div className="relative z-30 mx-auto -mb-8 max-w-6xl px-4"><div className="relative z-30 grid grid-cols-5 gap-1 rounded-2xl border border-[#eee8e1] bg-white p-2 shadow-[0_8px_25px_rgba(31,31,31,0.1)] sm:grid-cols-10">{categories.map(([label, Icon]) => <button key={label} type="button" onClick={() => setActiveCategory(label)} className={`flex min-w-0 flex-col items-center gap-1.5 rounded-xl px-1 py-3 text-[9px] font-semibold transition sm:text-[10px] ${activeCategory === label ? "bg-[#fff0e3] text-[#ed741d]" : "text-[#384151] hover:bg-[#f8f5f2]"}`}><Icon className={`h-5 w-5 ${activeCategory === label ? "text-[#ed741d]" : "text-[#4b5563]"}`} /><span className="truncate">{label}</span></button>)}</div></div>
      </section>

      <section id="gallery-grid" className="pt-16"><PageContainer><div className="mb-4 flex flex-wrap items-center justify-between gap-3"><p className="text-xs font-semibold text-[#303b4b]">Showing {photos.length ? `1-${Math.min(visibleCount, photos.length)}` : 0} of {photos.length} photos</p><div className="flex items-center gap-2"><label className="flex items-center gap-2 rounded-md border border-[#e0ddd9] bg-white px-3 py-2 text-xs text-[#4b5563]">Sort by:<select value={sort} onChange={(event) => setSort(event.target.value)} className="bg-transparent font-semibold outline-none"><option>Latest</option><option>Oldest</option></select><ChevronDown className="h-3.5 w-3.5" /></label><button type="button" onClick={() => setViewMode("card")} className={`flex h-9 w-9 items-center justify-center rounded-md ${viewMode === "card" ? "bg-[#102139] text-white" : "border border-[#dedbd7] text-[#667085]"}`} aria-label="Card view" aria-pressed={viewMode === "card"} title="Card view"><Grid2X2 className="h-4 w-4" /></button><button type="button" onClick={() => setViewMode("table")} className={`flex h-9 w-9 items-center justify-center rounded-md ${viewMode === "table" ? "bg-[#102139] text-white" : "border border-[#dedbd7] text-[#667085]"}`} aria-label="Table view" aria-pressed={viewMode === "table"} title="Table view"><List className="h-4 w-4" /></button></div></div>
        {loading ? <div className="flex justify-center py-24"><Loader2 className="h-8 w-8 animate-spin text-[#ed741d]" /></div> : photos.length === 0 ? <div className="rounded-2xl border border-[#eadfd5] bg-[#faf7f3] py-24 text-center text-sm text-[#647080]">No gallery photos available yet.</div> : <div className={viewMode === "card" ? "grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5" : "overflow-hidden rounded-xl border border-[#e7e0d8] bg-white"}>{photos.slice(0, visibleCount).map((photo, index) => <button key={photo.id} type="button" onClick={() => setSelectedPhoto(photo)} className={viewMode === "card" ? "group relative aspect-square overflow-hidden rounded-md bg-[#eee7df] text-left" : "flex w-full items-center gap-4 border-b border-[#eee8e1] p-3 text-left last:border-b-0 hover:bg-[#faf7f3]"}><span className={viewMode === "table" ? "w-10 shrink-0 text-xs font-semibold text-[#9a6a39]" : "hidden"}>{index + 1}</span><img src={photo.src} alt={photo.title} loading="lazy" className={viewMode === "card" ? "h-full w-full object-cover transition duration-500 group-hover:scale-105" : "h-20 w-24 shrink-0 rounded-lg object-cover"} /><span className={viewMode === "card" ? "absolute inset-x-0 bottom-0 translate-y-full bg-black/65 px-3 py-2 text-[10px] font-semibold text-white transition group-hover:translate-y-0" : "text-sm font-bold text-[#263448]"}>{photo.title}</span></button>)}</div>}
        {!loading && visibleCount < photos.length && <div className="flex justify-center py-6"><button type="button" onClick={() => setVisibleCount((count) => count + 20)} className="inline-flex items-center gap-2 rounded-md border border-[#cfd4d9] bg-white px-5 py-2.5 text-[10px] font-bold uppercase text-[#263448] hover:border-[#ed741d] hover:text-[#ed741d]">Load more <Loader2 className="h-3.5 w-3.5" /></button></div>}
      </PageContainer></section>

      <section className="mt-8 border-y border-[#eee8e1] bg-[#fffdfa]"><PageContainer><div className="grid gap-4 py-5 sm:grid-cols-2 lg:grid-cols-4"><div className="flex items-center gap-3 border-[#eee8e1] px-2 lg:border-r"><Sparkles className="h-7 w-7 text-[#ed741d]" /><div><p className="text-[11px] font-bold">High Quality Prints</p><p className="text-[10px] text-[#657080]">Vibrant &amp; long lasting</p></div></div><div className="flex items-center gap-3 border-[#eee8e1] px-2 sm:border-r"><Camera className="h-7 w-7 text-[#ed741d]" /><div><p className="text-[11px] font-bold">Beautifully Framed</p><p className="text-[10px] text-[#657080]">With love &amp; precision</p></div></div><div className="flex items-center gap-3 border-[#eee8e1] px-2 lg:border-r"><Heart className="h-7 w-7 text-[#ed741d]" /><div><p className="text-[11px] font-bold">Customer Memories</p><p className="text-[10px] text-[#657080]">Shared with pride</p></div></div><div className="flex items-center gap-3 px-2"><Users className="h-7 w-7 text-[#ed741d]" /><div><p className="text-[11px] font-bold">Join Our Community</p><p className="text-[10px] text-[#657080]">Share your moments</p></div></div></div></PageContainer></section>
      {selectedPhoto && <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[#081321]/85 p-4" role="dialog" aria-modal="true" onMouseDown={(event) => event.target === event.currentTarget && setSelectedPhoto(null)}><div className="relative max-h-[90vh] max-w-4xl rounded-xl bg-white p-2 shadow-2xl"><button type="button" onClick={() => setSelectedPhoto(null)} className="absolute -right-3 -top-3 flex h-9 w-9 items-center justify-center rounded-full bg-[#ed741d] text-white" aria-label="Close image"><X className="h-4 w-4" /></button><img src={selectedPhoto.src} alt={selectedPhoto.title} className="max-h-[82vh] max-w-full rounded-lg object-contain" /></div></div>}
    </main>
  );
};

export default Gallery;
