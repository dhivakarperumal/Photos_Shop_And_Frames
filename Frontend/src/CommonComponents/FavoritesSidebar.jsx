import { useContext, useEffect } from "react";
import { Heart, Package, Trash2, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { StoreContext } from "../PrivateRouter/StoreContext";

const FavoritesSidebar = () => {
  const navigate = useNavigate();
  const {
    wishlist = [],
    removeFromWishlist,
    isFavoritesOpen,
    closeFavorites,
    loadingWishlist,
  } = useContext(StoreContext);

  useEffect(() => {
    if (!isFavoritesOpen) return undefined;
    document.body.style.overflow = "hidden";
    const handleKeyDown = (event) => {
      if (event.key === "Escape") closeFavorites();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isFavoritesOpen, closeFavorites]);

  if (!isFavoritesOpen) return null;

  const getImage = (item) => item.image || item.product_image || item.product_images?.[0];
  const getName = (item) => item.product_name || item.name || "Favorite item";
  const getId = (item) => item.id || item._id || item.product_id;

  return (
    <div className="fixed inset-0 z-[999999] flex justify-end bg-black/65 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Favorites">
      <button type="button" className="absolute inset-0 h-full w-full cursor-default" onClick={closeFavorites} aria-label="Close favorites" />
      <aside className="relative z-10 flex h-full w-full max-w-md flex-col bg-white shadow-2xl sm:max-w-lg">
        <div className="flex items-center justify-between border-b border-[#eee5d8] bg-[#faf8f5] px-5 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#d79d4a] text-[#1d1d1d]"><Heart className="h-4 w-4" /></div>
            <div><h2 className="text-base font-black text-[#1d2925]">Favorites</h2><p className="text-[11px] text-[#777]">{wishlist.length} saved item{wishlist.length !== 1 ? "s" : ""}</p></div>
          </div>
          <button type="button" onClick={closeFavorites} className="flex h-8 w-8 items-center justify-center rounded-full text-[#777] transition hover:bg-[#ede5d8] hover:text-[#222]" aria-label="Close favorites"><X className="h-4 w-4" /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-5">
          {loadingWishlist ? (
            <div className="flex h-64 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-3 border-[#1a3c36] border-t-transparent" /></div>
          ) : wishlist.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center py-16 text-center"><div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#f4eee5] text-[#b07838]"><Heart className="h-9 w-9" /></div><h3 className="mt-4 text-lg font-bold text-[#1d2925]">No favorites yet</h3><p className="mt-1 max-w-xs text-xs text-[#777]">Save products you love and find them here.</p><button type="button" onClick={() => { closeFavorites(); navigate("/shop"); }} className="mt-6 rounded-xl bg-[#1a3c36] px-6 py-2.5 text-xs font-bold text-white shadow transition hover:bg-[#235048]">Explore Frames</button></div>
          ) : (
            <div className="space-y-3.5">{wishlist.map((item) => { const image = getImage(item); return <div key={getId(item)} className="flex gap-3 rounded-2xl border border-[#ece4d8] bg-[#fdfcfb] p-3"><div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[#ebdccb] bg-[#f7f3ed] p-1">{image ? <img src={image} alt={getName(item)} className="h-full w-full object-contain" /> : <Package className="h-6 w-6 text-[#b9aa98]" />}</div><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-2"><h3 className="truncate text-sm font-bold text-[#1d2925]">{getName(item)}</h3><button type="button" onClick={() => removeFromWishlist(getId(item))} className="text-[#999] transition hover:text-[#d04d4d]" title="Remove from favorites" aria-label={`Remove ${getName(item)} from favorites`}><Trash2 className="h-4 w-4" /></button></div><p className="mt-2 text-sm font-bold text-[#1a3c36]">₹{Number(item.price || item.offer_price || 0).toLocaleString("en-IN")}</p><button type="button" onClick={() => { closeFavorites(); navigate(`/products/${item.product_id || getId(item)}`); }} className="mt-3 text-xs font-bold text-[#b07838] underline underline-offset-2">View product</button></div></div>; })}</div>
          )}
        </div>
      </aside>
    </div>
  );
};

export default FavoritesSidebar;
