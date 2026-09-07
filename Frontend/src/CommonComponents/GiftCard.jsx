import { ArrowUpRight, Eye, Gift, Heart } from "lucide-react";
import { useContext } from "react";
import { Link } from "react-router-dom";
import { StoreContext } from "../PrivateRouter/StoreContext";

const GiftCard = ({
  gift,
  image,
  fallbackImage,
  onOpen,
  href,
  title = gift.name,
  category = gift.category || "Gift Box",
  itemCount = gift.gift_items?.length || 0,
  size = gift.box_size || "Gift Box",
  outOfStock = false,
  discount = 0,
  price,
  originalPrice,
  metadata,
  secondaryLabel,
}) => {
  const { wishlist = [], toggleWishlist } = useContext(StoreContext) || {};
  const giftId = gift.id || gift.gift_box_id;
  const isFavorite = wishlist.some(
    (item) => String(item.product_id || item.id || item._id) === String(giftId),
  );
  const open = () => onOpen?.(gift);
  const imageContent = image ? (
    <img
      src={image}
      alt={title}
      loading="lazy"
      onError={(event) => {
        if (fallbackImage && event.currentTarget.src !== fallbackImage) event.currentTarget.src = fallbackImage;
      }}
      className="h-full w-full object-contain transition duration-300 group-hover:scale-105"
    />
  ) : <Gift className="h-12 w-12 text-[#b9aa98]" />;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-3xl border border-[#e7ded2] bg-white shadow-xs transition hover:-translate-y-1.5 hover:shadow-xl">
      <div onClick={onOpen ? open : undefined} className={`relative flex h-64 items-center justify-center overflow-hidden bg-[#f4eee6] p-5 ${onOpen ? "cursor-pointer" : ""}`}>
        {href ? <Link to={href} className="h-full w-full">{imageContent}</Link> : imageContent}
        {itemCount > 0 && <span className="absolute bottom-3 left-3 flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur-xs"><Gift className="h-3 w-3 text-[#d4a553]" />{itemCount} Item{itemCount !== 1 ? "s" : ""} Inside</span>}
        <button type="button" onClick={(event) => { event.preventDefault(); event.stopPropagation(); toggleWishlist?.({ ...gift, __wishlistType: "gift" }); }} className={`absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full shadow-sm transition ${isFavorite ? "bg-[#d79d4a] text-[#1d2925]" : "bg-white/90 text-[#555] hover:bg-white hover:text-[#b07838]"}`} aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"} title={isFavorite ? "Remove from favorites" : "Add to favorites"}><Heart className="h-5 w-5" fill={isFavorite ? "currentColor" : "none"} /></button>
        <span className={`absolute right-14 top-3 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider shadow-xs ${outOfStock ? "border border-red-200 bg-red-50 text-red-600" : "bg-white/95 text-[#1a3c36]"}`}>{outOfStock ? "Out of Stock" : size}</span>
        {discount > 0 && <span className="absolute left-3 top-3 rounded-full bg-[#1a3c36] px-2.5 py-1 text-[10px] font-bold text-white shadow-xs">{discount}% OFF</span>}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#b07838]">{category}</p>
        {href ? <Link to={href} className="mt-1.5 truncate text-base font-bold text-[#1d2925] hover:text-[#b07838]" title={title}>{title}</Link> : <button type="button" onClick={open} className="mt-1.5 truncate text-left text-base font-bold text-[#1d2925] hover:text-[#b07838]" title={title}>{title}</button>}
        {metadata && <p className="mt-1 line-clamp-1 truncate text-xs text-[#777]">{metadata}</p>}
        <div className="mt-4 flex items-center justify-between"><div><span className="text-xl font-black text-[#1a3c36]">₹{price || "--"}</span>{originalPrice > price && <span className="ml-2 text-xs text-[#999] line-through">₹{originalPrice}</span>}</div>{secondaryLabel && <span className="max-w-[100px] truncate text-[11px] font-semibold text-[#888]">{secondaryLabel}</span>}</div>
        <div className="mt-auto border-t border-[#f0e8dc] pt-3">{onOpen ? <button type="button" onClick={open} className="flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-[#1a3c36] text-xs font-bold text-white shadow-sm transition hover:bg-[#235048]"><Eye className="h-4 w-4" />View Box &amp; Order</button> : <Link to={href} className="flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-[#1a3c36] text-xs font-bold text-white shadow-sm transition hover:bg-[#235048]"><ArrowUpRight className="h-4 w-4" />Explore</Link>}</div>
      </div>
    </article>
  );
};

export default GiftCard;
