import { ArrowUpRight, Package } from "lucide-react";
import { Link } from "react-router-dom";

const ProductCollection = ({ products }) => (
  <section className="bg-[#f7f3ed] px-4 py-16 sm:px-8 lg:px-12 lg:py-20">
    <div className="mx-auto max-w-[1320px]">
      <div className="flex flex-col justify-between gap-5 border-b border-[#dfd4c5] pb-7 md:flex-row md:items-end">
        <div><p className="text-xs font-bold uppercase tracking-[0.24em] text-[#b07838]">The studio edit</p><h2 className="mt-3 text-4xl font-black tracking-[-0.04em] text-[#1d2925] sm:text-5xl">Made for the moments between.</h2></div>
        <Link to="/shop" className="inline-flex items-center gap-2 text-sm font-bold text-[#1a3c36] hover:text-[#b07838]">Browse products <ArrowUpRight className="h-4 w-4" /></Link>
      </div>
      {products.length ? <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{products.slice(0, 4).map((product) => { const variant = product.size_variants?.[0] || {}; const image = product.product_images?.[0] || product.frame_data?.frame_image; return <article key={product.id} className="group border border-[#e5dbce] bg-white p-3 transition hover:-translate-y-1 hover:shadow-xl"><Link to={`/products/${product.id}`} className="flex aspect-square items-center justify-center overflow-hidden bg-[#f1ebe2] p-5">{image ? <img src={image} alt={product.product_name} className="h-full w-full object-contain transition duration-500 group-hover:scale-105" /> : <Package className="h-12 w-12 text-[#c7b9a7]" />}</Link><div className="px-2 pb-2 pt-4"><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#b07838]">{product.category || "Studio product"}</p><Link to={`/products/${product.id}`}><h3 className="mt-2 truncate text-base font-bold text-[#1d2925]">{product.product_name}</h3></Link><div className="mt-4 flex items-center justify-between"><span className="text-lg font-black text-[#1a3c36]">₹{variant.offer_price || variant.mrp || "--"}</span><ArrowUpRight className="h-4 w-4 text-[#b07838] transition group-hover:translate-x-1 group-hover:-translate-y-1" /></div></div></article>; })}</div> : <div className="mt-10 border border-dashed border-[#d9cdbc] py-16 text-center text-sm text-[#777]">New studio pieces are being prepared.</div>}
    </div>
  </section>
);

export default ProductCollection;
