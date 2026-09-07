import { useContext, useEffect, useMemo, useState } from "react";
import {
  Check,
  Gift,
  Heart,
  ImagePlus,
  Minus,
  Plus,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  UploadCloud,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api";
import { StoreContext } from "../PrivateRouter/StoreContext";

const getImages = (item, type) => {
  const images = type === "album"
    ? [item.thumbnail_image, ...(Array.isArray(item.product_images) ? item.product_images : [])]
    : [item.image, ...(Array.isArray(item.images) ? item.images : [])];
  return [...new Set(images.filter(Boolean))];
};

const ProductQuickView = ({ item, type, image, onClose }) => {
  const isAlbum = type === "album";
  const { addToCart, wishlist = [], toggleWishlist } = useContext(StoreContext) || {};
  const navigate = useNavigate();
  const [imageIndex, setImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [uploading, setUploading] = useState(false);
  const [customFields, setCustomFields] = useState({
    title: "",
    note: "",
    photo: null,
  });

  useEffect(() => {
    setImageIndex(0);
    setQuantity(1);
    setCustomFields({ title: "", note: "", photo: null });
  }, [item, type]);

  useEffect(() => {
    const handleKeyDown = (event) => event.key === "Escape" && onClose();
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const images = useMemo(() => getImages(item, type), [item, type]);
  const currentImage = images[imageIndex] || image;
  const id = item.id || item.product_id || item.gift_box_id;
  const title = isAlbum ? item.product_name : item.name;
  const category = isAlbum ? item.sub_category || item.occasion || "Photo Album" : item.category || "Gift Box";
  const originalPrice = Number(isAlbum ? item.selling_price || 0 : item.mrp || 0);
  const price = Number(isAlbum ? item.discount_price || item.selling_price || 0 : item.selling_price || item.mrp || 0);
  const isFavorite = wishlist.some((entry) => String(entry.product_id || entry.id || entry._id) === String(id));
  const hasCustomization = isAlbum || item.customization?.customerName || item.customization?.customMessage || item.customization?.photoUpload;

  const updateField = (field, value) => setCustomFields((current) => ({ ...current, [field]: value }));

  const uploadPhoto = async (file) => {
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    setUploading(true);
    try {
      const response = await api.post("/upload", formData);
      updateField("photo", response.data?.url || response.data?.fileUrl);
      toast.success("Photo uploaded successfully");
    } catch (error) {
      toast.error("Could not upload photo");
    } finally {
      setUploading(false);
    }
  };

  const getCustomization = () => {
    if (!customFields.title && !customFields.note && !customFields.photo) return null;
    return isAlbum
      ? { coverTitle: customFields.title, note: customFields.note, coverPhoto: customFields.photo }
      : { name: customFields.title, msg: customFields.note, photo: customFields.photo };
  };

  const productPayload = isAlbum
    ? {
        id,
        product_name: title,
        category: item.category || "Albums",
        price,
        product_images: images,
        image: currentImage,
      }
    : {
        id,
        product_name: title,
        category,
        price,
        product_images: images,
        image: currentImage,
      };

  const addItemToCart = async () => {
    const success = await addToCart?.(productPayload, {
      size: isAlbum ? item.size || `${item.total_pages || 40} Pages` : item.box_size || "Standard Box",
      price,
      quantity,
      preview_image: currentImage,
      slot_photos: getCustomization(),
    });
    if (success !== false) onClose();
  };

  const buyNow = () => {
    navigate("/checkout", {
      state: {
        checkoutItems: [{
          product_id: id,
          product_name: title,
          category,
          size: isAlbum ? item.size || `${item.total_pages || 40} Pages` : item.box_size || "Standard Box",
          price,
          quantity,
          product_image: currentImage,
          slot_photos: getCustomization(),
        }],
      },
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/75 p-3 backdrop-blur-sm sm:p-5" role="dialog" aria-modal="true" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div className="relative my-4 grid w-full max-w-4xl gap-5 rounded-3xl border border-[#eadfce] bg-white p-4 shadow-2xl sm:p-6 md:grid-cols-[280px_minmax(0,1fr)] lg:grid-cols-[320px_minmax(0,1fr)]">
        <button type="button" onClick={onClose} className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full text-[#777] transition hover:bg-[#f4efe8]" aria-label="Close product details"><X className="h-5 w-5" /></button>

        <div className="space-y-3 pt-1">
          <div className="flex aspect-square items-center justify-center overflow-hidden rounded-2xl border border-[#e8dfd2] bg-[#fbf9f6] p-4">
            {currentImage ? <img src={currentImage} alt={title} className="h-full w-full object-contain" /> : (isAlbum ? <ImagePlus className="h-14 w-14 text-[#c9bba9]" /> : <Gift className="h-14 w-14 text-[#c9bba9]" />)}
          </div>
          {images.length > 1 && <div className="flex gap-2 overflow-x-auto pb-1">{images.map((itemImage, index) => <button key={`${itemImage}-${index}`} type="button" onClick={() => setImageIndex(index)} className={`h-14 w-14 shrink-0 overflow-hidden rounded-xl border-2 bg-[#f8f4ee] p-1 ${imageIndex === index ? "border-[#1a3c36]" : "border-transparent opacity-70"}`}><img src={itemImage} alt={`${title} ${index + 1}`} className="h-full w-full object-contain" /></button>)}</div>}
          <div className="rounded-2xl border border-[#e8dfd2] bg-[#fdfcfb] p-3.5 text-xs">
            <h4 className="border-b border-[#eee] pb-2 text-[10px] font-bold uppercase tracking-wider text-[#b07838]">{isAlbum ? "Album Specifications" : "Box Specifications"}</h4>
            {isAlbum ? <><Spec label="Dimensions" value={item.size || "12 x 18 Inches"} /><Spec label="Total Pages" value={`${item.total_pages || 40} (${item.sheet_count || 20} Sheets)`} /><Spec label="Cover Material" value={item.cover_material || "Leatherette"} /><Spec label="Binding" value={item.binding_type || "Lay Flat"} /><Spec label="Paper Quality" value={item.page_thickness || "300 GSM"} /></> : <><Spec label="Category" value={category} /><Spec label="Box Size" value={item.box_size || "Standard"} /><Spec label="Material" value={item.material || "Premium Box"} /><Spec label="Items" value={`${item.gift_items?.length || 0} Included`} /></>}
          </div>
        </div>

        <div className="flex min-h-0 flex-col pt-1 md:max-h-[calc(100vh-5rem)] md:overflow-y-auto md:pr-1">
          <div>
            <span className="inline-flex rounded-full bg-[#f2ecdf] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#9b6b2d]">{category}</span>
            <h2 className="mt-2 pr-8 text-2xl font-black leading-tight text-[#1d2925] sm:text-3xl">{title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-[#777]">{item.short_description || item.description || (isAlbum ? `${item.cover_material || "Premium cover"} • ${item.page_thickness || "300 GSM"}` : `${item.box_type || "Magnetic Closure"} • ${item.material || "Premium Box"}`)}</p>
            <div className="mt-4 flex items-baseline gap-3"><span className="text-2xl font-black text-[#1a3c36]">₹{price.toLocaleString()}</span>{originalPrice > price && <><span className="text-sm text-[#999] line-through">₹{originalPrice.toLocaleString()}</span><span className="rounded-md bg-[#eef6f3] px-2 py-0.5 text-xs font-bold text-[#1b794b]">Save ₹{(originalPrice - price).toLocaleString()}</span></>}</div>

            {isAlbum && <CustomizationFields titleLabel="Names / Cover Title" noteLabel="Dedication Note / Subtitle" titlePlaceholder="e.g., Rahul & Priya • Wedding Memories" notePlaceholder="Add a special date, message, or chapter title..." fields={customFields} updateField={updateField} uploadPhoto={uploadPhoto} uploading={uploading} />}
            {!isAlbum && hasCustomization && <CustomizationFields titleLabel="Recipient Name" noteLabel="Handwritten Note / Message" titlePlaceholder="e.g., Happy Birthday Rahul" notePlaceholder="Add a heartfelt message for the card..." fields={customFields} updateField={updateField} uploadPhoto={uploadPhoto} uploading={uploading} />}

            {!isAlbum && item.gift_items?.length > 0 && <div className="mt-4 rounded-2xl border border-[#ebe3d7] bg-[#faf8f5] p-3.5"><h4 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#9b6b2d]"><Gift className="h-3.5 w-3.5" /> Items Included ({item.gift_items.length})</h4><p className="mt-2 text-xs text-[#555]">{item.gift_items.map((giftItem) => giftItem.name).filter(Boolean).join(" • ")}</p></div>}
          </div>

          <div className="mt-5 border-t border-[#f0e8dc] pt-4"><div className="mb-4 flex items-center justify-between"><div className="flex items-center gap-2"><span className="text-xs font-bold text-[#555]">Quantity</span><button type="button" onClick={() => toggleWishlist?.({ ...item, __wishlistType: type })} className={`flex h-9 w-9 items-center justify-center rounded-full border ${isFavorite ? "border-[#d79d4a] bg-[#d79d4a] text-[#1d2925]" : "border-[#e5ded4] bg-[#faf8f5] text-[#777]"}`} aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}><Heart className="h-4 w-4" fill={isFavorite ? "currentColor" : "none"} /></button></div><div className="inline-flex items-center rounded-xl border border-[#d8cfc3] bg-white p-1"><button type="button" onClick={() => setQuantity((value) => Math.max(1, value - 1))} className="flex h-7 w-7 items-center justify-center rounded-lg text-sm font-bold text-[#555] hover:bg-[#f4efe8]"><Minus className="h-3 w-3" /></button><span className="w-8 text-center text-xs font-bold text-[#1d2925]">{quantity}</span><button type="button" onClick={() => setQuantity((value) => value + 1)} className="flex h-7 w-7 items-center justify-center rounded-lg text-sm font-bold text-[#555] hover:bg-[#f4efe8]"><Plus className="h-3 w-3" /></button></div></div><div className="grid grid-cols-2 gap-3"><button type="button" onClick={addItemToCart} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#1a3c36] bg-white py-3 text-xs font-bold text-[#1a3c36] hover:bg-[#f7f4ef]"><ShoppingCart className="h-4 w-4" /> Add to Cart</button><button type="button" onClick={buyNow} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#1a3c36] py-3 text-xs font-bold text-white hover:bg-[#235048]"><ShoppingBag className="h-4 w-4" /> Buy Now</button></div></div>
        </div>
      </div>
    </div>
  );
};

const Spec = ({ label, value }) => <div className="flex justify-between gap-3 border-b border-[#f2eee8] py-1.5 last:border-0"><span className="text-[#777]">{label}</span><span className="text-right font-bold text-[#1d2925]">{value}</span></div>;

const CustomizationFields = ({ titleLabel, noteLabel, titlePlaceholder, notePlaceholder, fields, updateField, uploadPhoto, uploading }) => <div className="mt-5 space-y-3 rounded-2xl border border-[#ebdcc8] bg-[#fdfbf8] p-4"><h4 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#9b6b2d]"><Sparkles className="h-3.5 w-3.5" /> Personalize Your {titleLabel.includes("Cover") ? "Album Cover" : "Gift Box"}</h4><div><label className="block text-[11px] font-bold text-[#444]">{titleLabel}:</label><input type="text" value={fields.title} onChange={(event) => updateField("title", event.target.value)} placeholder={titlePlaceholder} className="mt-1 w-full rounded-xl border border-[#d8cfc3] bg-white px-3 py-2 text-xs outline-none focus:border-[#1a3c36]" /></div><div><label className="block text-[11px] font-bold text-[#444]">{noteLabel}:</label><textarea rows="2" value={fields.note} onChange={(event) => updateField("note", event.target.value)} placeholder={notePlaceholder} className="mt-1 w-full resize-none rounded-xl border border-[#d8cfc3] bg-white px-3 py-2 text-xs outline-none focus:border-[#1a3c36]" /></div><label className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-[#1a3c36] bg-white px-3 py-2 text-xs font-bold text-[#1a3c36] hover:bg-[#f4efe8]"><UploadCloud className="h-3.5 w-3.5" /> {uploading ? "Uploading..." : "Upload Photo"}{fields.photo && <Check className="h-3.5 w-3.5 text-[#1b794b]" />}<input type="file" accept="image/*" className="hidden" disabled={uploading} onChange={(event) => uploadPhoto(event.target.files?.[0])} /></label></div>;

export default ProductQuickView;
