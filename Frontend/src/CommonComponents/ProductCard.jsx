import { Eye, ImagePlus, Package } from "lucide-react";
import { Link } from "react-router-dom";

const ProductCard = ({ product }) => {
  const variant = product.size_variants?.[0] || {};
  const image = product.product_images?.[0] || product.frame_data?.frame_image;
  const slotCount = product.frame_data?.photo_slots?.length || 0;
  const productPath = `/products/${product.id}`;

  return (
    <article className="group flex flex-col overflow-hidden rounded-3xl border border-[#e7ded2] bg-white shadow-xs transition hover:-translate-y-1.5 hover:shadow-xl">
      <Link
        to={productPath}
        className="relative flex h-64 items-center justify-center overflow-hidden bg-[#f4eee6] p-5"
      >
        {image ? (
          <img
            src={image}
            alt={product.product_name}
            className="h-full w-full object-contain transition duration-300 group-hover:scale-105"
          />
        ) : (
          <ImagePlus className="h-12 w-12 text-[#b9aa98]" />
        )}

        {slotCount > 0 && (
          <span className="absolute bottom-3 left-3 rounded-full bg-black/60 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur-xs">
            {slotCount} Photo Position{slotCount !== 1 ? "s" : ""}
          </span>
        )}

        <span className="absolute right-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#666] shadow-xs">
          {product.orientation || "Portrait"}
        </span>
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#b07838]">
          {product.category || "Photo Frame"}
        </p>

        <Link to={productPath}>
          <h2 className="mt-1.5 truncate text-base font-bold text-[#1d2925] hover:text-[#b07838]">
            {product.product_name}
          </h2>
        </Link>

        <div className="mt-4 flex items-center justify-between">
          <div>
            <span className="text-xl font-black text-[#1a3c36]">
              ₹{variant.offer_price || variant.mrp || "--"}
            </span>
            {variant.mrp && variant.offer_price && variant.mrp > variant.offer_price && (
              <span className="ml-2 text-xs text-[#999] line-through">₹{variant.mrp}</span>
            )}
          </div>

          {product.size_variants?.length > 1 && (
            <span className="text-[11px] font-semibold text-[#888]">
              {product.size_variants.length} Sizes
            </span>
          )}
        </div>

        <div className="mt-auto border-t border-[#f0e8dc] pt-3">
          <Link
            to={productPath}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-[#1a3c36] text-xs font-bold text-white shadow-sm transition hover:bg-[#235048]"
          >
            {slotCount > 0 ? <ImagePlus className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {slotCount > 0 ? "Customize Photos" : "View Product Details"}
          </Link>
        </div>
      </div>
    </article>
  );
};

export default ProductCard;