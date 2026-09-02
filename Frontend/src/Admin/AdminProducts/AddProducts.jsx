import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Check,
  ChevronRight,
  Coins,
  DollarSign,
  Frame,
  Image as ImageIcon,
  ImagePlus,
  Layers,
  Package,
  Plus,
  RotateCw,
  Save,
  Sparkles,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";
import api from "../../api";
import toast from "react-hot-toast";

const generateUuid = () => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
};

const defaultStandardSizes = [
  "4 x 6 inch",
  "5 x 7 inch",
  "6 x 8 inch",
  "8 x 10 inch",
  "10 x 12 inch",
  "12 x 18 inch",
  "16 x 20 inch",
  "18 x 24 inch",
  "20 x 30 inch",
];

const materialOptions = [
  "Wooden",
  "Teak Wood",
  "MDF Wood",
  "Acrylic",
  "Metal / Aluminium",
  "Canvas Wrap",
  "Glass & Metal",
  "Premium Plastic",
];

const colorOptions = [
  "Natural Wood",
  "Walnut Brown",
  "Classic Black",
  "Modern White",
  "Antique Golden",
  "Brushed Silver",
  "Dark Chocolate",
  "Custom Finish",
];

const AddProducts = () => {
  const navigate = useNavigate();

  // ==========================================
  // BASIC PRODUCT STATE
  // ==========================================
  const [uuid] = useState(generateUuid);
  const [productId, setProductId] = useState("IQF1");
  const [productName, setProductName] = useState("");
  const [category, setCategory] = useState("Photo Frames");
  const [materialType, setMaterialType] = useState("Wooden");
  const [color, setColor] = useState("Natural Wood");
  const [description, setDescription] = useState("");
  const [categoriesList, setCategoriesList] = useState([]);

  // ==========================================
  // SIZE VARIANTS (MRP, OFFER, STOCK)
  // ==========================================
  const [sizeVariants, setSizeVariants] = useState([
    { id: 1, size: "8 x 10 inch", mrp: "999", offerPrice: "799", stock: "50" },
    { id: 2, size: "12 x 18 inch", mrp: "1499", offerPrice: "1199", stock: "30" },
  ]);

  // ==========================================
  // ORIENTATION & MATCHING FRAMES
  // ==========================================
  const [orientation, setOrientation] = useState("Portrait");
  const [availableFrames, setAvailableFrames] = useState([]);
  const [selectedFrame, setSelectedFrame] = useState(null);
  const [loadingFrames, setLoadingFrames] = useState(false);

  // ==========================================
  // SLOT DEMO PHOTOS
  // ==========================================
  const [slotPhotos, setSlotPhotos] = useState({});
  const photoInputRefs = useRef({});
  const [saving, setSaving] = useState(false);

  // ==========================================
  // INITIAL FETCH: NEXT PRODUCT ID & CATEGORIES
  // ==========================================
  useEffect(() => {
    const fetchInitData = async () => {
      try {
        const idRes = await api.get("/products/next-id");
        if (idRes.data?.data) {
          setProductId(idRes.data.data);
        }
      } catch (err) {
        console.warn("Could not fetch next product ID:", err);
      }

      try {
        const catRes = await api.get("/categories");
        if (catRes.data?.data && Array.isArray(catRes.data.data)) {
          setCategoriesList(catRes.data.data);
        }
      } catch (err) {
        console.warn("Could not fetch categories:", err);
      }
    };

    fetchInitData();
  }, []);

  // ==========================================
  // FETCH FRAMES WHEN ORIENTATION CHANGES
  // ==========================================
  useEffect(() => {
    const fetchFramesByOrientation = async () => {
      setLoadingFrames(true);
      try {
        const response = await api.get(`/frames?orientation=${orientation}`);
        const frames = response.data?.data || [];
        setAvailableFrames(frames);

        // If current selected frame doesn't match new orientation, auto select first match or clear
        if (frames.length > 0) {
          setSelectedFrame(frames[0]);
          setSlotPhotos({});
        } else {
          setSelectedFrame(null);
          setSlotPhotos({});
        }
      } catch (err) {
        console.error("Failed to fetch frames by orientation:", err);
      } finally {
        setLoadingFrames(false);
      }
    };

    fetchFramesByOrientation();
  }, [orientation]);

  // ==========================================
  // SIZE VARIANTS MANAGEMENT
  // ==========================================
  const addSizeVariant = () => {
    const newVariant = {
      id: Date.now(),
      size: "6 x 8 inch",
      mrp: "",
      offerPrice: "",
      stock: "10",
    };
    setSizeVariants((prev) => [...prev, newVariant]);
  };

  const updateSizeVariant = (id, field, value) => {
    setSizeVariants((prev) =>
      prev.map((v) => (v.id === id ? { ...v, [field]: value } : v))
    );
  };

  const removeSizeVariant = (id) => {
    if (sizeVariants.length === 1) {
      toast.error("At least one size variant is required.");
      return;
    }
    setSizeVariants((prev) => prev.filter((v) => v.id !== id));
  };

  // ==========================================
  // SLOT PHOTO UPLOAD IN FRAME PREVIEW
  // ==========================================
  const handleSlotPhotoUpload = async (slotId, e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file.");
      return;
    }

    const preview = URL.createObjectURL(file);

    // Save local preview immediately
    setSlotPhotos((prev) => ({
      ...prev,
      [slotId]: { file, preview, url: "" },
    }));

    // Upload to server
    const formData = new FormData();
    formData.append("folder", "products");
    formData.append("file", file);

    try {
      const response = await api.post("/upload", formData);
      const serverUrl = response.data?.url || response.data?.urls?.[0] || "";
      setSlotPhotos((prev) => ({
        ...prev,
        [slotId]: { ...prev[slotId], url: serverUrl },
      }));
      toast.success("Slot photo uploaded!");
    } catch (err) {
      console.warn("Slot photo server upload fallback:", err);
    }
  };

  const removeSlotPhoto = (slotId) => {
    setSlotPhotos((prev) => {
      const updated = { ...prev };
      if (updated[slotId]?.preview) {
        URL.revokeObjectURL(updated[slotId].preview);
      }
      delete updated[slotId];
      return updated;
    });
  };

  // ==========================================
  // SUBMIT FORM
  // ==========================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!productName.trim()) {
      toast.error("Please enter a Product Name.");
      return;
    }

    if (!category.trim()) {
      toast.error("Please select a Category.");
      return;
    }

    // Validate size variants
    for (const v of sizeVariants) {
      if (!v.size.trim() || !v.mrp || !v.offerPrice) {
        toast.error("Please fill Size, MRP, and Offer Price for all size variants.");
        return;
      }
    }

    if (!selectedFrame) {
      toast.error(`Please select a Frame template for ${orientation} orientation.`);
      return;
    }

    setSaving(true);
    try {
      // Map slot photos URL dictionary
      const slotPhotosMap = {};
      Object.keys(slotPhotos).forEach((slotId) => {
        slotPhotosMap[slotId] = slotPhotos[slotId]?.url || slotPhotos[slotId]?.preview || "";
      });

      const payload = {
        uuid,
        product_id: productId,
        product_name: productName.trim(),
        category: category.trim(),
        material_type: materialType,
        color: color,
        description: description.trim(),
        size_variants: sizeVariants.map((v) => ({
          size: v.size.trim(),
          mrp: Number(v.mrp),
          offer_price: Number(v.offerPrice),
          stock: Number(v.stock || 0),
        })),
        orientation,
        frame_id: selectedFrame.id,
        frame_data: {
          id: selectedFrame.id,
          frame_name: selectedFrame.frame_name,
          frame_image: selectedFrame.frame_image,
          photo_slots: selectedFrame.photo_slots || [],
        },
        slot_photos: slotPhotosMap,
        product_images: [selectedFrame.frame_image],
        status: "Active",
      };

      const response = await api.post("/products", payload);

      if (response.data?.success) {
        toast.success(`Product ${productId} created successfully!`);
        navigate("/admin/products");
      } else {
        toast.error(response.data?.message || "Failed to create product.");
      }
    } catch (error) {
      console.error("Create product error:", error);
      toast.error(error.response?.data?.message || "Failed to create product.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f4f6] p-4 md:p-6">
      <div className="mx-auto max-w-[1480px]">
        {/* ================= HEADER ================= */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[#e8d9ba] bg-[#fffaf2] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#9b6b2d]">
              <Sparkles className="h-3.5 w-3.5" />
              Product Catalog Studio
            </div>
            <h1 className="text-[2.1rem] font-bold tracking-[-0.05em] text-[#1f1f1f]">
              Add New Product
            </h1>
            <p className="mt-1 text-[13px] text-[#6b6b6b]">
              Configure product details, size-wise pricing & stock, select frame by orientation, and place demo photos.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/admin/products/frame-setup"
              className="inline-flex items-center gap-2 rounded-xl border border-[#d4a843] bg-[#fffaf0] px-4 py-2.5 text-[14px] font-semibold text-[#8b6528] shadow-sm transition hover:bg-[#fff5e0]"
            >
              <Layers className="h-4 w-4" />
              Frame Setup
            </Link>

            <Link
              to="/admin/products"
              className="inline-flex items-center gap-2 rounded-xl border border-[#e6ddd1] bg-white px-4 py-2.5 text-[14px] font-semibold text-[#2a2a2a] shadow-sm transition hover:bg-[#faf7f3]"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Products
            </Link>
          </div>
        </div>

        {/* ================= MAIN FORM ================= */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 xl:grid-cols-12">
            {/* LEFT COLUMN: PRODUCT SPECS & SIZES (7 COLS) */}
            <div className="space-y-6 xl:col-span-6">
              {/* SECTION 1: PRODUCT DETAILS */}
              <div className="rounded-[22px] border border-[#ebe3d7] bg-white p-5 shadow-sm md:p-6">
                <div className="mb-5 flex items-center gap-3 border-b border-[#f0ebe3] pb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e8f3ef] text-[#1a3c36]">
                    <Package className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-[#202020]">
                      Product Details
                    </h2>
                    <p className="text-xs text-[#8a8a8a]">
                      General specifications and catalog info
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  {/* UUID */}
                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-[#6b6b6b]">
                      UUID
                    </label>
                    <input
                      type="text"
                      value={uuid}
                      readOnly
                      className="h-11 w-full rounded-xl border border-[#e8e1d9] bg-[#f8f7f5] px-3 font-mono text-xs text-[#666] outline-none"
                    />
                  </div>

                  {/* AUTO PRODUCT CODE */}
                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-[#6b6b6b]">
                      Product ID (Auto-Generated)
                    </label>
                    <input
                      type="text"
                      value={productId}
                      readOnly
                      className="h-11 w-full rounded-xl border border-[#e8e1d9] bg-[#f8f7f5] px-3 font-mono text-sm font-bold text-[#1a3c36] outline-none"
                    />
                  </div>

                  {/* PRODUCT NAME */}
                  <div className="md:col-span-2">
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-[#6b6b6b]">
                      Product Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={productName}
                      onChange={(e) => setProductName(e.target.value)}
                      placeholder="e.g. Vintage Teakwood Memories Frame"
                      className="h-11 w-full rounded-xl border border-[#e8e1d9] bg-white px-3.5 text-sm font-medium text-[#222] shadow-sm outline-none transition focus:border-[#d4a553]"
                      required
                    />
                  </div>

                  {/* CATEGORY */}
                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-[#6b6b6b]">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="h-11 w-full rounded-xl border border-[#e8e1d9] bg-white px-3 text-sm text-[#222] shadow-sm outline-none transition focus:border-[#d4a553]"
                    >
                      <option value="Photo Frames">Photo Frames</option>
                      <option value="Wall Frames">Wall Frames</option>
                      <option value="Table Frames">Table Frames</option>
                      <option value="Collage Frames">Collage Frames</option>
                      <option value="Wedding Frames">Wedding Frames</option>
                      <option value="Photo Printing">Photo Printing</option>
                      <option value="Custom Gifts">Custom Gifts</option>
                      {categoriesList.map((cat) => (
                        <option key={cat.category_id || cat.id} value={cat.category_name}>
                          {cat.category_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* MATERIAL */}
                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-[#6b6b6b]">
                      Material Type
                    </label>
                    <select
                      value={materialType}
                      onChange={(e) => setMaterialType(e.target.value)}
                      className="h-11 w-full rounded-xl border border-[#e8e1d9] bg-white px-3 text-sm text-[#222] shadow-sm outline-none transition focus:border-[#d4a553]"
                    >
                      {materialOptions.map((mat) => (
                        <option key={mat} value={mat}>
                          {mat}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* COLOR */}
                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-[#6b6b6b]">
                      Color Finish
                    </label>
                    <select
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="h-11 w-full rounded-xl border border-[#e8e1d9] bg-white px-3 text-sm text-[#222] shadow-sm outline-none transition focus:border-[#d4a553]"
                    >
                      {colorOptions.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* DESCRIPTION */}
                  <div className="md:col-span-2">
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-[#6b6b6b]">
                      Description
                    </label>
                    <textarea
                      rows={3}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Write a concise product summary..."
                      className="w-full rounded-xl border border-[#e8e1d9] bg-white p-3 text-sm text-[#222] shadow-sm outline-none transition focus:border-[#d4a553]"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: SIZE VARIANTS (MRP, OFFER PRICE, STOCK) */}
              <div className="rounded-[22px] border border-[#ebe3d7] bg-white p-5 shadow-sm md:p-6">
                <div className="mb-4 flex items-center justify-between border-b border-[#f0ebe3] pb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#fffaf0] text-[#b87840]">
                      <Coins className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-[#202020]">
                        Size-Wise Pricing & Stock
                      </h2>
                      <p className="text-xs text-[#8a8a8a]">
                        Define MRP, Selling Offer Price, and Stock for each available dimension
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={addSizeVariant}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#1a3c36] px-3.5 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-[#235048]"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add Size
                  </button>
                </div>

                <div className="space-y-3">
                  {sizeVariants.map((variant, index) => (
                    <div
                      key={variant.id}
                      className="flex flex-col gap-3 rounded-xl border border-[#ece4d9] bg-[#fcfbfa] p-3.5 sm:flex-row sm:items-center sm:gap-2"
                    >
                      {/* SIZE SELECT / INPUT */}
                      <div className="flex-1">
                        <label className="mb-1 block text-[11px] font-semibold text-[#666]">
                          Size {index + 1}
                        </label>
                        <input
                          type="text"
                          list="standard-sizes-list"
                          value={variant.size}
                          onChange={(e) =>
                            updateSizeVariant(variant.id, "size", e.target.value)
                          }
                          placeholder="e.g. 8 x 10 inch"
                          className="h-9 w-full rounded-lg border border-[#e2d9cf] bg-white px-2.5 text-xs font-medium text-[#222] outline-none focus:border-[#d4a553]"
                        />
                        <datalist id="standard-sizes-list">
                          {defaultStandardSizes.map((s) => (
                            <option key={s} value={s} />
                          ))}
                        </datalist>
                      </div>

                      {/* MRP */}
                      <div className="w-full sm:w-28">
                        <label className="mb-1 block text-[11px] font-semibold text-[#666]">
                          MRP (₹)
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={variant.mrp}
                          onChange={(e) =>
                            updateSizeVariant(variant.id, "mrp", e.target.value)
                          }
                          placeholder="999"
                          className="h-9 w-full rounded-lg border border-[#e2d9cf] bg-white px-2.5 text-xs text-[#222] outline-none focus:border-[#d4a553]"
                        />
                      </div>

                      {/* OFFER PRICE */}
                      <div className="w-full sm:w-28">
                        <label className="mb-1 block text-[11px] font-semibold text-[#666]">
                          Offer (₹)
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={variant.offerPrice}
                          onChange={(e) =>
                            updateSizeVariant(variant.id, "offerPrice", e.target.value)
                          }
                          placeholder="799"
                          className="h-9 w-full rounded-lg border border-[#e2d9cf] bg-white px-2.5 text-xs font-bold text-[#1a3c36] outline-none focus:border-[#d4a553]"
                        />
                      </div>

                      {/* STOCK */}
                      <div className="w-full sm:w-24">
                        <label className="mb-1 block text-[11px] font-semibold text-[#666]">
                          Stock
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={variant.stock}
                          onChange={(e) =>
                            updateSizeVariant(variant.id, "stock", e.target.value)
                          }
                          placeholder="25"
                          className="h-9 w-full rounded-lg border border-[#e2d9cf] bg-white px-2.5 text-xs text-[#222] outline-none focus:border-[#d4a553]"
                        />
                      </div>

                      {/* DELETE */}
                      <div className="flex sm:pt-4">
                        <button
                          type="button"
                          onClick={() => removeSizeVariant(variant.id)}
                          className="rounded-lg p-2 text-red-500 hover:bg-red-50"
                          title="Remove size"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: ORIENTATION, FRAME SELECTOR & LIVE SLOT PHOTO UPLOADER (5 COLS) */}
            <div className="space-y-6 xl:col-span-6">
              {/* SECTION 3: ORIENTATION & FRAME PICKER */}
              <div className="rounded-[22px] border border-[#ebe3d7] bg-white p-5 shadow-sm md:p-6">
                <div className="mb-4 flex items-center justify-between border-b border-[#f0ebe3] pb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eef2ff] text-[#4f46e5]">
                      <Frame className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-[#202020]">
                        Orientation & Frame Template
                      </h2>
                      <p className="text-xs text-[#8a8a8a]">
                        Filters matching frames created in Frame Setup
                      </p>
                    </div>
                  </div>

                  <span className="rounded-full bg-[#f0f4f2] px-3 py-1 text-xs font-bold text-[#1a3c36]">
                    {availableFrames.length} {orientation} Frame{availableFrames.length !== 1 ? "s" : ""}
                  </span>
                </div>

                {/* ORIENTATION TOGGLES */}
                <div className="mb-5">
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[#6b6b6b]">
                    Select Orientation
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {["Portrait", "Landscape", "Square"].map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => setOrientation(item)}
                        className={`flex h-11 items-center justify-center gap-1.5 rounded-xl border text-xs font-bold transition ${
                          orientation === item
                            ? "border-[#1a3c36] bg-[#1a3c36] text-white shadow-sm"
                            : "border-[#e5dfd5] bg-[#faf8f5] text-[#555] hover:border-[#d4a553]"
                        }`}
                      >
                        <RotateCw className="h-3.5 w-3.5" />
                        {item}
                      </button>
                    ))}
                  </div>
                </div>

                {/* MATCHING FRAMES CAROUSEL / GRID */}
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#6b6b6b]">
                    Choose Frame Template
                  </label>

                  {loadingFrames ? (
                    <div className="py-8 text-center text-xs text-[#888]">
                      Loading {orientation} frames...
                    </div>
                  ) : availableFrames.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-[#e2d9cd] bg-[#faf8f5] p-6 text-center">
                      <div className="mb-2 text-2xl">🖼️</div>
                      <p className="text-xs font-bold text-[#444]">
                        No {orientation} Frame Templates found.
                      </p>
                      <p className="mt-1 text-xs text-[#888]">
                        Create a {orientation} frame template in the Frame Setup page first.
                      </p>
                      <Link
                        to="/admin/products/frame-setup"
                        className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-[#1a3c36] px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Create {orientation} Frame
                      </Link>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {availableFrames.map((fr) => {
                        const isSelected = selectedFrame?.id === fr.id;
                        return (
                          <div
                            key={fr.id}
                            onClick={() => {
                              setSelectedFrame(fr);
                              setSlotPhotos({});
                            }}
                            className={`group relative cursor-pointer overflow-hidden rounded-xl border p-2 text-center transition ${
                              isSelected
                                ? "border-[#1a3c36] bg-[#eef6f3] ring-2 ring-[#1a3c36]/20"
                                : "border-[#e6ddd1] bg-[#faf9f8] hover:border-[#d4a553] hover:bg-white"
                            }`}
                          >
                            <div className="flex h-24 items-center justify-center overflow-hidden rounded-lg bg-white p-1">
                              <img
                                src={fr.frame_image}
                                alt={fr.frame_name}
                                className="h-full w-full object-contain"
                              />
                            </div>
                            <p className="mt-2 truncate text-xs font-bold text-[#222]">
                              {fr.frame_name}
                            </p>
                            <p className="text-[10px] text-[#777]">
                              {fr.photo_slots?.length || 0} Photo Position{fr.photo_slots?.length !== 1 ? "s" : ""}
                            </p>

                            {isSelected && (
                              <div className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#1a3c36] text-white shadow">
                                <Check className="h-3 w-3" />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* SECTION 4: LIVE FRAME PREVIEW & SLOT PHOTO PLACEMENT CANVAS */}
              {selectedFrame && (
                <div className="rounded-[22px] border border-[#ebe3d7] bg-white p-5 shadow-sm md:p-6">
                  <div className="mb-4 flex items-center justify-between border-b border-[#f0ebe3] pb-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#fff0f0] text-[#c93b3b]">
                        <ImagePlus className="h-5 w-5" />
                      </div>
                      <div>
                        <h2 className="text-base font-bold text-[#202020]">
                          Demo Photo Placement
                        </h2>
                        <p className="text-xs text-[#8a8a8a]">
                          Click slots on the frame below to upload preview photos
                        </p>
                      </div>
                    </div>

                    <span className="rounded-full bg-[#fff7e8] px-3 py-1 text-xs font-bold text-[#8b6528]">
                      {Object.keys(slotPhotos).length} / {selectedFrame.photo_slots?.length || 0} Filled
                    </span>
                  </div>

                  {/* FRAME CANVAS */}
                  <div className="relative flex min-h-[380px] items-center justify-center overflow-hidden rounded-2xl border border-[#e8dfd2] bg-[#f5f1eb] p-4">
                    <div className="relative mx-auto w-full max-w-[460px] overflow-hidden rounded-lg shadow-md">
                      {/* FRAME BACKGROUND */}
                      <img
                        src={selectedFrame.frame_image}
                        alt={selectedFrame.frame_name}
                        className="block h-auto w-full select-none"
                      />

                      {/* PHOTO SLOTS */}
                      {(selectedFrame.photo_slots || []).map((slot, index) => {
                        const uploaded = slotPhotos[slot.id];

                        return (
                          <React.Fragment key={slot.id}>
                            <input
                              ref={(el) => {
                                photoInputRefs.current[slot.id] = el;
                              }}
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handleSlotPhotoUpload(slot.id, e)}
                            />

                            <button
                              type="button"
                              onClick={() => photoInputRefs.current[slot.id]?.click()}
                              title={`Upload demo photo for: ${slot.name}`}
                              className="absolute overflow-hidden border-2 border-dashed border-blue-500 bg-white/75 shadow-md backdrop-blur-[1px] transition hover:bg-white/95"
                              style={{
                                top: slot.top,
                                left: slot.left,
                                width: slot.width,
                                height: slot.height,
                                borderRadius: slot.shape === "circle" ? "9999px" : "6px",
                              }}
                            >
                              {uploaded ? (
                                <img
                                  src={uploaded.preview}
                                  alt={slot.name}
                                  className="h-full w-full"
                                  style={{ objectFit: slot.objectFit || "cover" }}
                                />
                              ) : (
                                <div className="flex h-full w-full flex-col items-center justify-center p-1 text-center">
                                  <span className="text-sm sm:text-lg">📷</span>
                                  <span className="mt-0.5 rounded bg-white/90 px-1 py-0.5 text-[9px] font-bold text-[#1a3c36] shadow-xs">
                                    {slot.name}
                                  </span>
                                </div>
                              )}
                            </button>
                          </React.Fragment>
                        );
                      })}
                    </div>
                  </div>

                  {/* SLOT LIST ACTIONS */}
                  <div className="mt-4 space-y-2">
                    {(selectedFrame.photo_slots || []).map((slot, idx) => {
                      const uploaded = slotPhotos[slot.id];
                      return (
                        <div
                          key={slot.id}
                          className="flex items-center justify-between rounded-xl border border-[#e8e2d8] bg-[#faf8f5] px-3 py-2 text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#1a3c36] text-[10px] font-bold text-white">
                              {idx + 1}
                            </span>
                            <span className="font-semibold text-[#333]">
                              {slot.name}
                            </span>
                            {uploaded ? (
                              <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold text-green-700">
                                Photo Added
                              </span>
                            ) : (
                              <span className="text-[10px] text-[#888]">
                                Empty
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => photoInputRefs.current[slot.id]?.click()}
                              className="rounded-lg border border-[#d8d0c5] bg-white px-2.5 py-1 text-[11px] font-semibold text-[#333] hover:bg-[#faf7f3]"
                            >
                              {uploaded ? "Change" : "Upload"}
                            </button>
                            {uploaded && (
                              <button
                                type="button"
                                onClick={() => removeSlotPhoto(slot.id)}
                                className="rounded-lg p-1 text-red-500 hover:bg-red-50"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ================= ACTION BUTTONS FOOTER ================= */}
          <div className="flex flex-col-reverse gap-3 rounded-2xl border-t border-[#e5dfd4] bg-white px-5 py-4 shadow-sm sm:flex-row sm:justify-end">
            <Link
              to="/admin/products"
              className="inline-flex items-center justify-center rounded-xl border border-[#ddd3c8] bg-[#faf8f5] px-6 py-3 text-sm font-semibold text-[#333] transition hover:bg-[#f2ece5]"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1a3c36] px-8 py-3 text-sm font-bold text-white shadow-[0_8px_20px_rgba(26,60,54,0.18)] transition hover:bg-[#224e47] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save className="h-4 w-4" />
              {saving ? "Saving Product..." : "Save Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProducts;
