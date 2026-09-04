import React, { useContext, useEffect, useState } from "react";
import {
  Check,
  Eye,
  Gift,
  Heart,
  Image as ImageIcon,
  Package,
  Plus,
  Search,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  Truck,
  UploadCloud,
  X,
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../../api";
import PageContainer from "../../CommonComponents/PageContainer";
import PageHeader from "../../CommonComponents/PageHeader";
import { StoreContext } from "../../PrivateRouter/StoreContext";
import toast from "react-hot-toast";

const Gifts = () => {
  const [gifts, setGifts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("latest");
  const [loading, setLoading] = useState(true);
  const [selectedGift, setSelectedGift] = useState(null);
  const [modalQuantity, setModalQuantity] = useState(1);
  const [modalImageIndex, setModalImageIndex] = useState(0);
  const [customFields, setCustomFields] = useState({
    recipientName: "",
    message: "",
    customPhoto: null,
  });

  const { addToCart, openCart } = useContext(StoreContext);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Load gifts from backend API
  useEffect(() => {
    const fetchGifts = async () => {
      try {
        const [giftsRes, catRes] = await Promise.all([
          api.get("/gift-boxes"),
          api.get("/categories").catch(() => ({ data: { data: [] } })),
        ]);

        const rows = Array.isArray(giftsRes.data?.data) ? giftsRes.data.data : [];
        setGifts(rows);

        // Derive categories
        const catRows = Array.isArray(catRes.data?.data) ? catRes.data.data : [];
        const giftCatNames = new Set(
          rows.map((g) => g.category).filter(Boolean)
        );
        catRows
          .filter((c) => {
            const type = String(c.category_type || "").toLowerCase();
            return type === "gift" || type === "gifts";
          })
          .forEach((c) => {
            if (c.category_name) giftCatNames.add(c.category_name);
          });

        setCategories(Array.from(giftCatNames));
      } catch (error) {
        console.error("Failed to load gifts:", error);
        toast.error("Could not load gift boxes");
      } finally {
        setLoading(false);
      }
    };

    fetchGifts();
  }, []);

  // Filter and sort gifts
  const filteredGifts = gifts
    .filter((gift) => {
      const matchesCategory =
        selectedCategory === "All" || gift.category === selectedCategory;
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !query ||
        gift.name?.toLowerCase().includes(query) ||
        gift.category?.toLowerCase().includes(query) ||
        gift.description?.toLowerCase().includes(query) ||
        gift.theme?.toLowerCase().includes(query);
      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === "price-low") {
        return Number(a.selling_price || a.mrp || 0) - Number(b.selling_price || b.mrp || 0);
      }
      if (sortBy === "price-high") {
        return Number(b.selling_price || b.mrp || 0) - Number(a.selling_price || a.mrp || 0);
      }
      return new Date(b.created_at || 0) - new Date(a.created_at || 0);
    });

  // Handle opening modal
  const openGiftModal = (gift) => {
    setSelectedGift(gift);
    setModalQuantity(1);
    setModalImageIndex(0);
    setCustomFields({
      recipientName: "",
      message: "",
      customPhoto: null,
    });
  };

  // Add to cart action
  const handleAddToCart = async (e, gift, quantity = 1) => {
    if (e) e.stopPropagation();
    const price = Number(gift.selling_price || gift.mrp || 0);

    const productPayload = {
      id: gift.id,
      product_name: gift.name,
      category: gift.category || "Gift Box",
      price: price,
      product_images: gift.images?.length ? gift.images : [gift.image],
      image: gift.image,
    };

    const options = {
      size: gift.box_size || "Standard Box",
      price: price,
      quantity: quantity,
      preview_image: gift.image,
      slot_photos: customFields.customPhoto
        ? { photo: customFields.customPhoto, name: customFields.recipientName, msg: customFields.message }
        : null,
    };

    const success = await addToCart(productPayload, options);
    if (success) {
      if (selectedGift) setSelectedGift(null);
    }
  };

  // Buy now direct checkout
  const handleBuyNow = (gift, quantity = 1) => {
    const price = Number(gift.selling_price || gift.mrp || 0);
    const checkoutItem = {
      product_id: gift.id,
      product_name: gift.name,
      category: gift.category || "Gift Box",
      size: gift.box_size || "Standard Box",
      price: price,
      quantity: quantity,
      product_image: gift.image || gift.images?.[0] || "",
      slot_photos: customFields.customPhoto
        ? { photo: customFields.customPhoto, name: customFields.recipientName, msg: customFields.message }
        : null,
    };

    setSelectedGift(null);
    navigate("/checkout", { state: { checkoutItems: [checkoutItem] } });
  };

  // Handle custom photo upload in modal
  const handleCustomPhotoUpload = async (file) => {
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    try {
      toast.loading("Uploading photo...", { id: "uploadPhoto" });
      const res = await api.post("/upload", formData);
      const url = res.data?.url || res.data?.fileUrl;
      setCustomFields((prev) => ({ ...prev, customPhoto: url }));
      toast.success("Photo uploaded successfully!", { id: "uploadPhoto" });
    } catch (err) {
      console.error("Photo upload failed:", err);
      toast.error("Failed to upload photo", { id: "uploadPhoto" });
    }
  };

  return (
    <main className="min-h-screen bg-[#f7f3ed]">
      <PageHeader title="Gifts" />
      <PageContainer className="py-10">
        <div>
          {/* HEADER / INTRO */}
          <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#b07838]">
                Q Frame Studio
              </p>
              <h1 className="mt-2 text-3xl font-black tracking-tight text-[#1d2925] sm:text-4xl">
                Curated Gift Boxes &amp; Hampers
              </h1>
              <p className="mt-2 max-w-xl text-sm text-[#6b6b63]">
                Handcrafted gift sets combining custom photo frames, keepsakes, and personalized celebrations delivered to your doorstep.
              </p>
            </div>

            <span className="inline-flex items-center gap-2 rounded-full border border-[#e2d9cd] bg-white px-4 py-2 text-xs font-bold text-[#5d675f] shadow-xs">
              <Gift className="h-4 w-4 text-[#b07838]" /> {filteredGifts.length} Available Gift Boxes
            </span>
          </div>

          {/* SEARCH AND SORT BAR */}
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {/* Search Input */}
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#999]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search gift boxes by name, theme..."
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

            {/* Sort Select */}
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
              </select>
            </div>
          </div>

          {/* CATEGORY FILTER PILLS */}
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
              All Gifts ({gifts.length})
            </button>

            {categories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setSelectedCategory(category)}
                className={`rounded-full px-4 py-2 text-xs font-bold transition ${
                  selectedCategory === category
                    ? "bg-[#1a3c36] text-white shadow-sm"
                    : "border border-[#e0d6c8] bg-white text-[#555] hover:border-[#b07838]"
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* GIFTS GRID (MATCHING SHOP PRODUCT CARD DESIGN) */}
          {loading ? (
            <div className="py-24 text-center">
              <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-[#b07838] border-t-transparent" />
              <p className="mt-3 text-sm font-semibold text-[#777]">
                Loading curated gifts...
              </p>
            </div>
          ) : filteredGifts.length === 0 ? (
            <div className="rounded-3xl border border-[#e7ded2] bg-white py-20 text-center text-sm text-[#777]">
              <Package className="mx-auto h-12 w-12 text-[#ccc]" />
              <p className="mt-3 font-semibold text-[#444]">
                No gift boxes found in this category.
              </p>
              <p className="mt-1 text-xs text-[#999]">
                Check back soon or explore our other collections.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
              {filteredGifts.map((gift) => {
                const image = gift.image || gift.images?.[0];
                const itemsCount = gift.gift_items?.length || 0;
                const mrp = Number(gift.mrp || 0);
                const sellingPrice = Number(gift.selling_price || mrp);
                const discount =
                  gift.discount_percentage ||
                  (mrp > sellingPrice ? Math.round(((mrp - sellingPrice) / mrp) * 100) : 0);
                const isOutOfStock =
                  gift.stock_status === "Out of Stock" ||
                  Number(gift.current_stock) <= 0;

                return (
                  <article
                    key={gift.id || gift.gift_box_id}
                    className="group flex flex-col overflow-hidden rounded-3xl border border-[#e7ded2] bg-white shadow-xs transition hover:-translate-y-1.5 hover:shadow-xl"
                  >
                    {/* PRODUCT IMAGE AREA (MATCHING SHOP CARD) */}
                    <div
                      onClick={() => openGiftModal(gift)}
                      className="relative flex h-64 items-center justify-center overflow-hidden bg-[#f4eee6] p-5 cursor-pointer"
                    >
                      {image ? (
                        <img
                          src={image}
                          alt={gift.name}
                          className="h-full w-full object-contain transition duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <Gift className="h-12 w-12 text-[#b9aa98]" />
                      )}

                      {/* ITEMS COUNT BADGE */}
                      {itemsCount > 0 && (
                        <span className="absolute bottom-3 left-3 flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur-xs">
                          <Gift className="h-3 w-3 text-[#d4a553]" />
                          {itemsCount} Item{itemsCount !== 1 ? "s" : ""} Inside
                        </span>
                      )}

                      {/* STATUS OR SIZE BADGE */}
                      <span
                        className={`absolute right-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider shadow-xs ${
                          isOutOfStock
                            ? "border border-red-200 bg-red-50 text-red-600"
                            : "bg-white/95 text-[#1a3c36]"
                        }`}
                      >
                        {isOutOfStock ? "Out of Stock" : gift.box_size || "Gift Box"}
                      </span>

                      {/* DISCOUNT BADGE */}
                      {discount > 0 && (
                        <span className="absolute left-3 top-3 rounded-full bg-[#1a3c36] px-2.5 py-1 text-[10px] font-bold text-white shadow-xs">
                          {discount}% OFF
                        </span>
                      )}
                    </div>

                    {/* PRODUCT DETAILS AREA (MATCHING SHOP CARD) */}
                    <div className="flex flex-1 flex-col p-5">
                      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#b07838]">
                        {gift.category || "Gift Box"}
                      </p>

                      <h2
                        onClick={() => openGiftModal(gift)}
                        className="mt-1.5 truncate text-base font-bold text-[#1d2925] hover:text-[#b07838] cursor-pointer"
                        title={gift.name}
                      >
                        {gift.name}
                      </h2>

                      {gift.description && (
                        <p className="mt-1 line-clamp-2 text-xs text-[#777]">
                          {gift.description}
                        </p>
                      )}

                      {/* PRICING (MATCHING SHOP CARD) */}
                      <div className="mt-4 flex items-center justify-between">
                        <div>
                          <span className="text-xl font-black text-[#1a3c36]">
                            ₹{sellingPrice || "--"}
                          </span>
                          {mrp > sellingPrice && (
                            <span className="ml-2 text-xs text-[#999] line-through">
                              ₹{mrp}
                            </span>
                          )}
                        </div>

                        {gift.theme && (
                          <span className="truncate max-w-[100px] text-[11px] font-semibold text-[#888]">
                            {gift.theme}
                          </span>
                        )}
                      </div>

                      {/* CARD ACTIONS */}
                      <div className="mt-auto border-t border-[#f0e8dc] pt-3 flex gap-2">
                        <button
                          type="button"
                          onClick={() => openGiftModal(gift)}
                          className="flex h-11 flex-1 items-center justify-center gap-2 rounded-2xl bg-[#1a3c36] text-xs font-bold text-white shadow-sm transition hover:bg-[#235048]"
                        >
                          <Eye className="h-4 w-4" />
                          View Box &amp; Order
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </PageContainer>

      {/* ================= GIFT DETAILS & CUSTOMIZATION MODAL ================= */}
      {selectedGift && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs overflow-y-auto"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative my-8 w-full max-w-3xl rounded-3xl border border-[#ebdcc8] bg-white p-6 shadow-2xl md:p-8">
            {/* CLOSE BUTTON */}
            <button
              type="button"
              onClick={() => setSelectedGift(null)}
              className="absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-full text-[#999] hover:bg-[#f4efe8] hover:text-[#333]"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-12">
              {/* LEFT COLUMN: IMAGES & SPECS (5 COLS) */}
              <div className="md:col-span-5 space-y-4">
                {/* MAIN IMAGE PREVIEW */}
                <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-2xl border border-[#e8dfd2] bg-[#fbf9f6] p-4">
                  {selectedGift.images?.[modalImageIndex] || selectedGift.image ? (
                    <img
                      src={selectedGift.images?.[modalImageIndex] || selectedGift.image}
                      alt={selectedGift.name}
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <Gift className="h-16 w-16 text-[#ccc]" />
                  )}
                </div>

                {/* THUMBNAILS CAROUSEL */}
                {selectedGift.images?.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {selectedGift.images.map((img, idx) => (
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

                {/* SPECIFICATIONS CHIPS */}
                <div className="rounded-2xl border border-[#e8dfd2] bg-[#fdfcfb] p-3.5 text-xs space-y-2">
                  <h4 className="font-bold text-[#1d2925] border-b border-[#eee] pb-1.5 uppercase tracking-wider text-[10px] text-[#b07838]">
                    Box Specifications
                  </h4>
                  <div className="flex justify-between text-[#666]">
                    <span>Category:</span>
                    <span className="font-bold text-[#1d2925]">{selectedGift.category}</span>
                  </div>
                  {selectedGift.box_size && (
                    <div className="flex justify-between text-[#666]">
                      <span>Box Size:</span>
                      <span className="font-bold text-[#1d2925]">{selectedGift.box_size}</span>
                    </div>
                  )}
                  {selectedGift.material && (
                    <div className="flex justify-between text-[#666]">
                      <span>Material:</span>
                      <span className="font-bold text-[#1d2925]">{selectedGift.material}</span>
                    </div>
                  )}
                  {selectedGift.box_type && (
                    <div className="flex justify-between text-[#666]">
                      <span>Box Type:</span>
                      <span className="font-bold text-[#1d2925]">{selectedGift.box_type}</span>
                    </div>
                  )}
                  {selectedGift.theme && (
                    <div className="flex justify-between text-[#666]">
                      <span>Theme:</span>
                      <span className="font-bold text-[#1d2925]">{selectedGift.theme}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* RIGHT COLUMN: DETAILS, INCLUDED ITEMS, CUSTOMIZATION, ORDER (7 COLS) */}
              <div className="md:col-span-7 flex flex-col justify-between">
                <div>
                  <span className="inline-block rounded-full bg-[#f2ecdf] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#9b6b2d]">
                    {selectedGift.category || "Curated Gift Box"}
                  </span>

                  <h2 className="mt-2 text-2xl font-black text-[#1d2925]">
                    {selectedGift.name}
                  </h2>

                  {selectedGift.description && (
                    <p className="mt-2 text-xs leading-relaxed text-[#666]">
                      {selectedGift.description}
                    </p>
                  )}

                  {/* PRICE & DISCOUNT */}
                  <div className="mt-4 flex items-baseline gap-3">
                    <span className="text-2xl font-black text-[#1a3c36]">
                      ₹{selectedGift.selling_price || selectedGift.mrp}
                    </span>
                    {selectedGift.mrp > selectedGift.selling_price && (
                      <span className="text-sm text-[#999] line-through">
                        ₹{selectedGift.mrp}
                      </span>
                    )}
                    {selectedGift.mrp > selectedGift.selling_price && (
                      <span className="rounded-md bg-[#eef6f3] px-2 py-0.5 text-xs font-bold text-[#1b794b]">
                        Save ₹{selectedGift.mrp - selectedGift.selling_price}
                      </span>
                    )}
                  </div>

                  {/* INCLUDED ITEMS LIST */}
                  {selectedGift.gift_items?.length > 0 && (
                    <div className="mt-5 rounded-2xl border border-[#ebe3d7] bg-[#faf8f5] p-3.5">
                      <h4 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#9b6b2d]">
                        <Gift className="h-3.5 w-3.5" /> Items Included in this Box ({selectedGift.gift_items.length})
                      </h4>
                      <div className="mt-2.5 space-y-2 max-h-40 overflow-y-auto pr-1">
                        {selectedGift.gift_items.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-2.5 rounded-xl border border-[#ebdccb] bg-white p-2 text-xs"
                          >
                            <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-[#f4eee6]">
                              {item.image ? (
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center text-[#bbb]">
                                  <Package className="h-4 w-4" />
                                </div>
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-bold text-[#1d2925] truncate">
                                {item.name}
                              </p>
                              <p className="text-[10px] text-[#777]">
                                Qty: {item.quantity || 1}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* CUSTOMIZATION SECTION */}
                  {(selectedGift.customization?.customerName ||
                    selectedGift.customization?.customMessage ||
                    selectedGift.customization?.photoUpload) && (
                    <div className="mt-5 space-y-3 rounded-2xl border border-[#ebdcc8] bg-[#fdfbf8] p-4">
                      <h4 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#9b6b2d]">
                        <Sparkles className="h-3.5 w-3.5" /> Personalize Your Gift Box
                      </h4>

                      {selectedGift.customization?.customerName && (
                        <div>
                          <label className="block text-[11px] font-bold text-[#444]">
                            Recipient Name:
                          </label>
                          <input
                            type="text"
                            value={customFields.recipientName}
                            onChange={(e) =>
                              setCustomFields((prev) => ({
                                ...prev,
                                recipientName: e.target.value,
                              }))
                            }
                            placeholder="e.g., Happy Birthday Rahul"
                            className="mt-1 w-full rounded-xl border border-[#d8cfc3] bg-white px-3 py-2 text-xs outline-none focus:border-[#1a3c36]"
                          />
                        </div>
                      )}

                      {selectedGift.customization?.customMessage && (
                        <div>
                          <label className="block text-[11px] font-bold text-[#444]">
                            Handwritten Note / Message:
                          </label>
                          <textarea
                            rows="2"
                            value={customFields.message}
                            onChange={(e) =>
                              setCustomFields((prev) => ({
                                ...prev,
                                message: e.target.value,
                              }))
                            }
                            placeholder="Add a heartfelt message for the card..."
                            className="mt-1 w-full resize-none rounded-xl border border-[#d8cfc3] bg-white px-3 py-2 text-xs outline-none focus:border-[#1a3c36]"
                          />
                        </div>
                      )}

                      {selectedGift.customization?.photoUpload && (
                        <div>
                          <label className="block text-[11px] font-bold text-[#444]">
                            Attach Memory Photo (Optional):
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
                                  if (file) handleCustomPhotoUpload(file);
                                }}
                              />
                            </label>
                            {customFields.customPhoto && (
                              <span className="flex items-center gap-1 text-[11px] font-semibold text-[#1b794b]">
                                <Check className="h-3 w-3" /> Photo Attached
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* MODAL FOOTER: QUANTITY & ACTION BUTTONS */}
                <div className="mt-6 border-t border-[#f0e8dc] pt-4">
                  <div className="mb-4 flex items-center justify-between">
                    <span className="text-xs font-bold text-[#555]">Quantity</span>
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
                      onClick={(e) => handleAddToCart(e, selectedGift, modalQuantity)}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#1a3c36] bg-white py-3 text-xs font-bold text-[#1a3c36] transition hover:bg-[#f7f4ef]"
                    >
                      <ShoppingCart className="h-4 w-4" /> Add to Cart
                    </button>

                    <button
                      type="button"
                      onClick={() => handleBuyNow(selectedGift, modalQuantity)}
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

export default Gifts;
