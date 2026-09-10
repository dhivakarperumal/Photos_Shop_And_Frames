import { useContext, useEffect, useState } from "react";
import {
  BookOpen,
  Check,
  Heart,
  Package,
  Search,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  UploadCloud,
  X,
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api, { API_URL } from "../../api";
import AlbumCard from "../../CommonComponents/AlbumCard";
import ProductQuickView from "../../CommonComponents/ProductQuickView";
import PageContainer from "../../CommonComponents/PageContainer";
import PageHeader from "../../CommonComponents/PageHeader";
import { StoreContext } from "../../PrivateRouter/StoreContext";
import { notifyLoginRequired } from "../../PrivateRouter/StoreContext";
import { useAuth } from "../../PrivateRouter/AuthContext";
import toast from "react-hot-toast";

const resolveImageUrl = (value) => {
  if (!value || typeof value !== "string") return "";
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (/^(data:|blob:|https?:\/\/)/i.test(trimmed)) return trimmed;
  const cleanPath = trimmed.replace(/\\/g, "/");
  const path = cleanPath.startsWith("/") ? cleanPath : `/${cleanPath}`;
  if (/^\/api\/?$/i.test(API_URL)) return path;
  return `${API_URL.replace(/\/api\/?$/, "")}${path}`;
};

const parseJsonArray = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
};

const normalizeAlbum = (album) => {
  const variants = parseJsonArray(album.variants);
  const firstVariant =
    variants.find(
      (v) => v && (v.image || (Array.isArray(v.images) && v.images.length))
    ) ||
    variants[0] ||
    {};

  // Collect all variant images
  const variantImages = [];
  variants.forEach((v) => {
    if (v?.image) variantImages.push(v.image);
    if (Array.isArray(v?.images)) {
      v.images.forEach((img) => variantImages.push(img));
    }
  });

  const rawProductImages = parseJsonArray(album.product_images);
  const allImages = [
    album.thumbnail_image,
    ...rawProductImages,
    ...variantImages,
  ].filter(Boolean);

  const displayImageRaw =
    album.thumbnail_image ||
    firstVariant.image ||
    (Array.isArray(firstVariant.images) ? firstVariant.images[0] : "") ||
    rawProductImages[0] ||
    allImages[0] ||
    "";

  const resolvedImages = [...new Set(allImages.map(resolveImageUrl))];
  const displayImage = resolveImageUrl(displayImageRaw);

  const variantMrp = Number(
    firstVariant.mrp ?? firstVariant.price ?? firstVariant.selling_price ?? 0
  );
  const variantOffer = Number(
    firstVariant.offerPrice ??
      firstVariant.offer_price ??
      firstVariant.price ??
      firstVariant.offer ??
      variantMrp
  );

  let sellingPrice = Number(album.selling_price || 0);
  if (sellingPrice <= 0 && variantMrp > 0) sellingPrice = variantMrp;

  let discountPrice = Number(album.discount_price || 0);
  if (discountPrice <= 0 && variantOffer > 0) discountPrice = variantOffer;
  if (discountPrice <= 0 && sellingPrice > 0) discountPrice = sellingPrice;

  const finalPrice = discountPrice > 0 ? discountPrice : sellingPrice;
  const originalPrice =
    sellingPrice > finalPrice
      ? sellingPrice
      : variantMrp > finalPrice
      ? variantMrp
      : finalPrice;

  let discount = Number(album.discount_percentage || 0);
  if (discount <= 0 && originalPrice > finalPrice && originalPrice > 0) {
    discount = Math.round(((originalPrice - finalPrice) / originalPrice) * 100);
  }

  const stock =
    variants.length > 0
      ? variants.reduce(
          (sum, v) => sum + (Number(v.stock ?? v.stock_quantity ?? 0) || 0),
          0
        )
      : Number(album.stock_quantity || 0);

  const isOutOfStock =
    album.stock_status === "Out of Stock" || stock <= 0;

  return {
    ...album,
    variants,
    displayImage,
    thumbnail_image: displayImage,
    product_images:
      resolvedImages.length > 0
        ? resolvedImages
        : displayImage
        ? [displayImage]
        : [],
    displayPrice: finalPrice,
    displayOriginalPrice: originalPrice,
    displayDiscount: discount,
    selling_price: originalPrice,
    discount_price: finalPrice,
    discount_percentage: discount,
    stock_quantity: stock,
    isOutOfStock,
  };
};

const Albums = () => {
  const { user } = useAuth();
  const legacyModalEnabled = () => false;
  const [albums, setAlbums] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("latest");
  const [loading, setLoading] = useState(true);
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [modalQuantity, setModalQuantity] = useState(1);
  const [modalImageIndex, setModalImageIndex] = useState(0);
  const [customFields, setCustomFields] = useState({
    coverTitle: "",
    dedicationNote: "",
    coverPhoto: null,
  });

  const { addToCart, wishlist = [], toggleWishlist } = useContext(StoreContext);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Load albums from backend API
  useEffect(() => {
    const fetchAlbums = async () => {
      try {
        setLoading(true);
        const response = await api.get("/albums");
        const rows = Array.isArray(response.data?.data) ? response.data.data : [];
        const activeAlbums = rows
          .map(normalizeAlbum)
          .filter(
            (a) => (a.status || "Active").toLowerCase() === "active"
          );
        setAlbums(activeAlbums);

        // Derive categories/occasions
        const categorySet = new Set();
        activeAlbums.forEach((album) => {
          if (album.sub_category) categorySet.add(album.sub_category);
          if (album.occasion) categorySet.add(album.occasion);
          if (album.category && album.category !== "Albums") categorySet.add(album.category);
        });
        setCategories(Array.from(categorySet));
      } catch (error) {
        console.error("Failed to load albums:", error);
        toast.error("Could not load photo albums");
      } finally {
        setLoading(false);
      }
    };

    fetchAlbums();
  }, []);

  useEffect(() => {
    const albumId = searchParams.get("albumId");
    if (!albumId || !albums.length) return;
    const album = albums.find((item) => String(item.id || item.product_id) === albumId);
    if (album) {
      setSelectedAlbum(album);
    }
  }, [albums, searchParams]);

  // Filter and sort albums
  const filteredAlbums = albums
    .filter((album) => {
      const matchesCategory =
        selectedCategory === "All" ||
        album.sub_category === selectedCategory ||
        album.occasion === selectedCategory ||
        album.category === selectedCategory;
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !query ||
        album.product_name?.toLowerCase().includes(query) ||
        album.sub_category?.toLowerCase().includes(query) ||
        album.occasion?.toLowerCase().includes(query) ||
        album.theme?.toLowerCase().includes(query) ||
        album.description?.toLowerCase().includes(query);
      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      const priceA = Number(a.displayPrice || a.discount_price || a.selling_price || 0);
      const priceB = Number(b.displayPrice || b.discount_price || b.selling_price || 0);
      if (sortBy === "price-low") return priceA - priceB;
      if (sortBy === "price-high") return priceB - priceA;
      if (sortBy === "pages") return (b.total_pages || 0) - (a.total_pages || 0);
      return new Date(b.created_at || 0) - new Date(a.created_at || 0);
    });

  // Open album details modal
  const openAlbumModal = (album) => {
    setSelectedAlbum(album);
    setModalQuantity(1);
    setModalImageIndex(0);
    setCustomFields({
      coverTitle: "",
      dedicationNote: "",
      coverPhoto: null,
    });
  };

  // Add album to cart
  const handleAddToCart = async (e, album, quantity = 1) => {
    if (e) e.stopPropagation();
    const price = Number(album.displayPrice || album.discount_price || album.selling_price || 0);
    const mainImg = album.displayImage || album.thumbnail_image || album.product_images?.[0] || "";
    const productImages = Array.isArray(album.product_images) && album.product_images.length
      ? album.product_images
      : mainImg ? [mainImg] : [];

    const productPayload = {
      id: album.id,
      item_type: "album",
      product_name: album.product_name,
      category: album.category || "Albums",
      price: price,
      product_images: productImages,
      image: mainImg,
    };

    const options = {
      item_type: "album",
      size: album.size || `${album.total_pages || 40} Pages`,
      price: price,
      quantity: quantity,
      preview_image: mainImg,
      slot_photos: customFields.coverPhoto || customFields.coverTitle
        ? {
            coverPhoto: customFields.coverPhoto,
            coverTitle: customFields.coverTitle,
            note: customFields.dedicationNote,
          }
        : null,
    };

    const success = await addToCart(productPayload, options);
    if (success) {
      if (selectedAlbum) setSelectedAlbum(null);
    }
  };

  // Buy now direct checkout
  const handleBuyNow = (album, quantity = 1) => {
    if (!user?.user_id) {
      notifyLoginRequired("Please login before buying this album");
      return;
    }
    const price = Number(album.displayPrice || album.discount_price || album.selling_price || 0);
    const mainImg = album.displayImage || album.thumbnail_image || album.product_images?.[0] || "";

    const checkoutItem = {
      product_id: album.id,
      item_type: "album",
      product_name: album.product_name,
      category: album.category || "Albums",
      size: album.size || `${album.total_pages || 40} Pages`,
      price: price,
      quantity: quantity,
      product_image: mainImg,
      slot_photos: customFields.coverPhoto || customFields.coverTitle
        ? {
            coverPhoto: customFields.coverPhoto,
            coverTitle: customFields.coverTitle,
            note: customFields.dedicationNote,
          }
        : null,
    };

    setSelectedAlbum(null);
    navigate("/checkout", { state: { checkoutItems: [checkoutItem] } });
  };

  // Handle custom photo upload in modal
  const handleCoverPhotoUpload = async (file) => {
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    try {
      toast.loading("Uploading cover photo...", { id: "uploadCover" });
      const res = await api.post("/upload", formData);
      const url = res.data?.url || res.data?.fileUrl;
      setCustomFields((prev) => ({ ...prev, coverPhoto: url }));
      toast.success("Cover photo uploaded successfully!", { id: "uploadCover" });
    } catch (err) {
      console.error("Cover photo upload failed:", err);
      toast.error("Failed to upload photo", { id: "uploadCover" });
    }
  };

  return (
    <main className="min-h-screen bg-[#f7f3ed]">
      <PageHeader title="Albums" />
      <PageContainer className="py-10">
        <div>
          {/* HEADER / INTRO */}
          <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#b07838]">
                Q Frame Studio
              </p>
              <h1 className="mt-2 text-3xl font-black tracking-tight text-[#1d2925] sm:text-4xl">
                Crafted Photo Albums &amp; Keepsakes
              </h1>
              <p className="mt-2 max-w-xl text-sm text-[#6b6b63]">
                Cherish your special milestones with high-definition lay-flat photo albums, luxury leatherette covers, and customized page prints delivered to your home.
              </p>
            </div>

            <span className="inline-flex items-center gap-2 rounded-full border border-[#e2d9cd] bg-white px-4 py-2 text-xs font-bold text-[#5d675f] shadow-xs">
              <BookOpen className="h-4 w-4 text-[#b07838]" /> {filteredAlbums.length} Available Albums
            </span>
          </div>

          {/* SEARCH AND SORT BAR */}
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#999]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search albums by name, occasion, theme..."
                className="w-full rounded-2xl border border-[#e2d9cd] bg-white py-2.5 pl-10 pr-4 text-xs font-medium text-[#1d2925] outline-none transition placeholder:text-[#999] focus:border-[#1a3c36] focus:ring-1 focus:ring-[#1a3c36]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#999] hover:text-[#333]"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[#777]">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="rounded-xl border border-[#e2d9cd] bg-white px-3 py-2 text-xs font-bold text-[#1d2925] outline-none transition hover:border-[#b07838]"
              >
                <option value="latest">Latest</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="pages">Most Pages</option>
              </select>
            </div>
          </div>

          {/* CATEGORY / OCCASION FILTER PILLS */}
          <div className="mb-8 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setSelectedCategory("All")}
              className={`rounded-full px-4 py-2 text-xs font-bold transition ${
                selectedCategory === "All"
                  ? "bg-[#1a3c36] text-white shadow-sm"
                  : "border border-[#e0d6c8] bg-white text-[#555] hover:border-[#b07838]"
              }`}
            >
              All Albums ({albums.length})
            </button>

            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-full px-4 py-2 text-xs font-bold transition ${
                  selectedCategory === cat
                    ? "bg-[#1a3c36] text-white shadow-sm"
                    : "border border-[#e0d6c8] bg-white text-[#555] hover:border-[#b07838]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* ALBUMS GRID (MATCHING SHOP PRODUCT CARD DESIGN) */}
          {loading ? (
            <div className="py-24 text-center">
              <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-[#b07838] border-t-transparent" />
              <p className="mt-3 text-sm font-semibold text-[#777]">
                Loading handcrafted albums...
              </p>
            </div>
          ) : filteredAlbums.length === 0 ? (
            <div className="rounded-3xl border border-[#e7ded2] bg-white py-20 text-center text-sm text-[#777]">
              <Package className="mx-auto h-12 w-12 text-[#ccc]" />
              <p className="mt-3 font-semibold text-[#444]">
                No photo albums found in this category.
              </p>
              <p className="mt-1 text-xs text-[#999]">
                Check back soon or explore our other collections.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
              {filteredAlbums.map((album) => {
                const totalPages = album.total_pages || 40;
                const albumId = album.id || album.product_id;

                return (
                  <AlbumCard
                    key={albumId}
                    album={album}
                    image={album.displayImage || album.thumbnail_image}
                    title={album.product_name}
                    category={album.sub_category || album.occasion || album.category || "Photo Album"}
                    badgeText={`${totalPages} Pages • Lay Flat`}
                    size={album.size || album.orientation || "Album"}
                    outOfStock={album.isOutOfStock}
                    discount={album.displayDiscount}
                    price={album.displayPrice}
                    originalPrice={album.displayOriginalPrice}
                    metadata={`${album.cover_material || "Hard Cover"} • ${album.page_thickness || "300 GSM"}`}
                    secondaryLabel={album.binding_type}
                    href={`/albums/${album.product_id || album.id}`}
                    onOpen={openAlbumModal}
                  />
                );
              })}
            </div>
          )}
        </div>
      </PageContainer>

      {/* ================= ALBUM PREVIEW & ORDER MODAL ================= */}
      {selectedAlbum && <ProductQuickView item={selectedAlbum} type="album" image={selectedAlbum.displayImage || selectedAlbum.thumbnail_image} onClose={() => setSelectedAlbum(null)} />}
      {legacyModalEnabled() && selectedAlbum && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs overflow-y-auto"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative my-8 w-full max-w-3xl rounded-3xl border border-[#ebdcc8] bg-white p-6 shadow-2xl md:p-8">
            <button
              type="button"
              onClick={() => setSelectedAlbum(null)}
              className="absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-full text-[#999] hover:bg-[#f4efe8] hover:text-[#333]"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-12">
              {/* LEFT COLUMN: IMAGES & SPECS (5 COLS) */}
              <div className="md:col-span-5 space-y-4">
                {/* MAIN IMAGE PREVIEW */}
                <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-2xl border border-[#e8dfd2] bg-[#fbf9f6] p-4">
                  {selectedAlbum.product_images?.[modalImageIndex] ||
                  selectedAlbum.thumbnail_image ? (
                    <img
                      src={
                        selectedAlbum.product_images?.[modalImageIndex] ||
                        selectedAlbum.thumbnail_image
                      }
                      alt={selectedAlbum.product_name}
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <BookOpen className="h-16 w-16 text-[#ccc]" />
                  )}
                </div>

                {/* THUMBNAILS CAROUSEL */}
                {selectedAlbum.product_images?.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {selectedAlbum.product_images.map((img, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setModalImageIndex(idx)}
                        className={`h-14 w-14 shrink-0 overflow-hidden rounded-xl border-2 p-1 transition ${
                          modalImageIndex === idx
                            ? "border-[#1a3c36] shadow-xs"
                            : "border-transparent bg-[#f7f2ea] opacity-70 hover:opacity-100"
                        }`}
                      >
                        <img
                          src={img}
                          alt={`Thumbnail ${idx + 1}`}
                          className="h-full w-full object-contain"
                        />
                      </button>
                    ))}
                  </div>
                )}

                {/* ALBUM SPECIFICATIONS CHIPS */}
                <div className="rounded-2xl border border-[#e8dfd2] bg-[#fdfcfb] p-3.5 text-xs space-y-2">
                  <h4 className="font-bold border-b border-[#eee] pb-1.5 uppercase tracking-wider text-[10px] text-[#b07838]">
                    Album Specifications
                  </h4>
                  <div className="flex justify-between text-[#666]">
                    <span>Dimensions:</span>
                    <span className="font-bold text-[#1d2925]">{selectedAlbum.size || "12 x 18 Inches"}</span>
                  </div>
                  <div className="flex justify-between text-[#666]">
                    <span>Total Pages:</span>
                    <span className="font-bold text-[#1d2925]">{selectedAlbum.total_pages || 40} ({selectedAlbum.sheet_count || 20} Sheets)</span>
                  </div>
                  <div className="flex justify-between text-[#666]">
                    <span>Cover Material:</span>
                    <span className="font-bold text-[#1d2925]">{selectedAlbum.cover_material || "Leatherette"}</span>
                  </div>
                  <div className="flex justify-between text-[#666]">
                    <span>Binding:</span>
                    <span className="font-bold text-[#1d2925]">{selectedAlbum.binding_type || "Lay Flat"}</span>
                  </div>
                  <div className="flex justify-between text-[#666]">
                    <span>Paper Quality:</span>
                    <span className="font-bold text-[#1d2925]">{selectedAlbum.page_thickness || "300 GSM"}</span>
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: DETAILS, CUSTOMIZATION & ACTIONS (7 COLS) */}
              <div className="md:col-span-7 flex flex-col justify-between">
                <div>
                  <span className="inline-block rounded-full bg-[#f2ecdf] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#9b6b2d]">
                    {selectedAlbum.sub_category || selectedAlbum.occasion || "Photo Album"}
                  </span>

                  <h2 className="mt-2 text-2xl font-black text-[#1d2925]">
                    {selectedAlbum.product_name}
                  </h2>

                  {selectedAlbum.short_description && (
                    <p className="mt-2 text-xs leading-relaxed text-[#666]">
                      {selectedAlbum.short_description}
                    </p>
                  )}

                  {/* PRICE & DISCOUNT */}
                  <div className="mt-4 flex items-baseline gap-3">
                    <span className="text-2xl font-black text-[#1a3c36]">
                      ₹{selectedAlbum.discount_price || selectedAlbum.selling_price}
                    </span>
                    {selectedAlbum.selling_price > (selectedAlbum.discount_price || 0) && (
                      <span className="text-sm text-[#999] line-through">
                        ₹{selectedAlbum.selling_price}
                      </span>
                    )}
                    {selectedAlbum.selling_price > (selectedAlbum.discount_price || 0) && (
                      <span className="rounded-md bg-[#eef6f3] px-2 py-0.5 text-xs font-bold text-[#1b794b]">
                        Save ₹{selectedAlbum.selling_price - selectedAlbum.discount_price}
                      </span>
                    )}
                  </div>

                  {/* PERSONALIZATION OPTIONS */}
                  <div className="mt-5 space-y-3 rounded-2xl border border-[#ebdcc8] bg-[#fdfbf8] p-4">
                    <h4 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#9b6b2d]">
                      <Sparkles className="h-3.5 w-3.5" /> Personalize Your Album Cover
                    </h4>

                    <div>
                      <label className="block text-[11px] font-bold text-[#444]">
                        Names / Cover Title:
                      </label>
                      <input
                        type="text"
                        value={customFields.coverTitle}
                        onChange={(e) =>
                          setCustomFields((prev) => ({
                            ...prev,
                            coverTitle: e.target.value,
                          }))
                        }
                        placeholder="e.g., Rahul &amp; Priya • Wedding Memories"
                        className="mt-1 w-full rounded-xl border border-[#d8cfc3] bg-white px-3 py-2 text-xs outline-none focus:border-[#1a3c36]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-[#444]">
                        Dedication Note / Subtitle:
                      </label>
                      <textarea
                        rows="2"
                        value={customFields.dedicationNote}
                        onChange={(e) =>
                          setCustomFields((prev) => ({
                            ...prev,
                            dedicationNote: e.target.value,
                          }))
                        }
                        placeholder="Add a special date, message, or chapter title..."
                        className="mt-1 w-full resize-none rounded-xl border border-[#d8cfc3] bg-white px-3 py-2 text-xs outline-none focus:border-[#1a3c36]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-[#444]">
                        Cover Photo (Optional):
                      </label>
                      <div className="mt-1 flex items-center gap-2">
                        <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-[#1a3c36] bg-white px-3 py-2 text-xs font-bold text-[#1a3c36] transition hover:bg-[#f4efe8]">
                          <UploadCloud className="h-3.5 w-3.5" /> Upload Photo
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleCoverPhotoUpload(file);
                            }}
                          />
                        </label>
                        {customFields.coverPhoto && (
                          <span className="flex items-center gap-1 text-[11px] font-semibold text-[#1b794b]">
                            <Check className="h-3 w-3" /> Photo Attached
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 rounded-2xl border border-[#d8cfc3] bg-[#f7f4ef] p-3 text-xs text-[#555]">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#1a3c36]">Interior Photos Upload:</span>
                        <span className="rounded-full bg-[#1a3c36] px-2 py-0.5 text-[10px] font-bold text-white">
                          Up to {((Number(selectedAlbum.sheet_count) || Math.round(Number(selectedAlbum.total_pages || 40) / 2) || 20) * 2)} Photos
                        </span>
                      </div>
                      <p className="mt-1 text-[11px] text-[#666]">
                        To upload all your album photos (2 per sheet), customize sizes, and personalize spreads:
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          const targetId = selectedAlbum.product_id || selectedAlbum.id;
                          setSelectedAlbum(null);
                          navigate(`/albums/${targetId}`);
                        }}
                        className="mt-2 inline-flex items-center gap-1 font-bold text-[#b07838] hover:underline"
                      >
                        Open Full Album Studio & Upload Photos &rarr;
                      </button>
                    </div>
                  </div>
                </div>

                {/* MODAL FOOTER: QUANTITY & ACTION BUTTONS */}
                <div className="mt-6 border-t border-[#f0e8dc] pt-4">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#555]">Quantity</span>
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          toggleWishlist?.({ ...selectedAlbum, __wishlistType: "album" });
                        }}
                        className={`flex h-9 w-9 items-center justify-center rounded-full border transition ${
                          wishlist.some((item) => String(item.product_id || item.id || item._id) === String(selectedAlbum.id || selectedAlbum.product_id))
                            ? "border-[#d79d4a] bg-[#d79d4a] text-[#1d2925]"
                            : "border-[#e5ded4] bg-[#faf8f5] text-[#777] hover:border-[#d79d4a] hover:text-[#b07838]"
                        }`}
                        aria-label={
                          wishlist.some((item) => String(item.product_id || item.id || item._id) === String(selectedAlbum.id || selectedAlbum.product_id))
                            ? "Remove from favorites"
                            : "Add to favorites"
                        }
                        title={
                          wishlist.some((item) => String(item.product_id || item.id || item._id) === String(selectedAlbum.id || selectedAlbum.product_id))
                            ? "Remove from favorites"
                            : "Add to favorites"
                        }
                      >
                        <Heart className="h-4 w-4" fill={wishlist.some((item) => String(item.product_id || item.id || item._id) === String(selectedAlbum.id || selectedAlbum.product_id)) ? "currentColor" : "none"} />
                      </button>
                    </div>
                    <div className="inline-flex items-center rounded-xl border border-[#d8cfc3] bg-white p-1">
                      <button
                        type="button"
                        onClick={() => setModalQuantity((q) => Math.max(1, q - 1))}
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-sm font-bold text-[#555] transition hover:bg-[#f4efe8]"
                      >
                        -
                      </button>
                      <span className="w-8 text-center text-xs font-bold text-[#1d2925]">
                        {modalQuantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => setModalQuantity((q) => q + 1)}
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-sm font-bold text-[#555] transition hover:bg-[#f4efe8]"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={(e) => handleAddToCart(e, selectedAlbum, modalQuantity)}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#1a3c36] bg-white py-3 text-xs font-bold text-[#1a3c36] transition hover:bg-[#f7f4ef]"
                    >
                      <ShoppingCart className="h-4 w-4" /> Add to Cart
                    </button>

                    <button
                      type="button"
                      onClick={() => handleBuyNow(selectedAlbum, modalQuantity)}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#1a3c36] py-3 text-xs font-bold text-white shadow-md transition hover:bg-[#235048]"
                    >
                      <ShoppingBag className="h-4 w-4" /> Buy Now
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default Albums;
