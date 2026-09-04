import { useEffect, useState } from "react";
import { ArrowUpRight, ImagePlus, Package, Sparkles } from "lucide-react";
import Hero from './Hero';
import { Link } from "react-router-dom";
import api from "../../api";

const FrameShowcase = ({ frames }) => (
  <section className="overflow-hidden bg-[#14201d] px-4 py-16 text-white sm:px-8 lg:px-12 lg:py-20">
    <div className="mx-auto max-w-[1320px]">
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.24em] text-[#d5a65a]">
            <Sparkles className="h-4 w-4" /> Frame collection
          </p>
          <h2 className="mt-3 max-w-xl text-4xl font-black leading-none tracking-[-0.04em] sm:text-5xl">
            Give your memories a place to live.
          </h2>
          <p className="mt-4 max-w-lg text-sm leading-6 text-[#b9c1bc]">
            Handpicked frame styles made to turn everyday photographs into something worth looking at every day.
          </p>
        </div>
        <Link to="/shop" className="group inline-flex items-center gap-2 self-start text-sm font-bold text-[#f0cc8d] transition hover:text-white md:self-auto">
          Explore all frames <ArrowUpRight className="h-4 w-4 transition group-hover:translate-x-1 group-hover:-translate-y-1" />
        </Link>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {frames.length ? frames.slice(0, 4).map((frame, index) => (
          <Link to="/shop" key={frame.id || frame.uuid || frame.frame_name} className={`group relative overflow-hidden bg-[#25332e] ${index === 1 ? "lg:translate-y-8" : ""}`}>
            <div className="flex aspect-[4/5] items-center justify-center bg-[#e8e0d1] p-8">
              {frame.frame_image ? <img src={frame.frame_image} alt={frame.frame_name} className="h-full w-full object-contain transition duration-500 group-hover:scale-105" /> : <ImagePlus className="h-12 w-12 text-[#b4a993]" />}
            </div>
            <div className="flex items-center justify-between px-4 py-4">
              <div><p className="text-sm font-bold">{frame.frame_name}</p><p className="mt-1 text-[10px] uppercase tracking-[0.16em] text-[#91a49b]">{frame.orientation || "Portrait"}</p></div>
              <ArrowUpRight className="h-4 w-4 text-[#d5a65a] transition group-hover:translate-x-1 group-hover:-translate-y-1" />
            </div>
          </Link>
        )) : ["Portrait", "Landscape", "Square", "Collage"].map((name, index) => (
          <Link to="/shop" key={name} className={`group bg-[#25332e] ${index === 1 ? "lg:translate-y-8" : ""}`}>
            <div className="flex aspect-[4/5] items-center justify-center bg-[#e8e0d1] p-10">
              <div className={`flex items-center justify-center border-[10px] border-[#8c6840] bg-[#d4e0d6] shadow-[inset_0_0_0_6px_#f5f0e7,0_14px_20px_rgba(0,0,0,.2)] ${index === 0 ? "h-full w-2/3" : index === 1 ? "h-2/3 w-full" : index === 2 ? "aspect-square w-4/5" : "h-4/5 w-full"}`}><ImagePlus className="h-8 w-8 text-[#8fa394]" /></div>
            </div>
            <div className="flex items-center justify-between px-4 py-4"><div><p className="text-sm font-bold">{name} frames</p><p className="mt-1 text-[10px] uppercase tracking-[0.16em] text-[#91a49b]">Made for your story</p></div><ArrowUpRight className="h-4 w-4 text-[#d5a65a]" /></div>
          </Link>
        ))}
      </div>
    </div>
  </section>
);

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

const Home = () => {
  const [frames, setFrames] = useState([]);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const loadCollections = async () => {
      const [frameResult, productResult] = await Promise.allSettled([api.get("/frames?status=Active"), api.get("/products")]);
      if (frameResult.status === "fulfilled") setFrames((frameResult.value.data?.data || []).filter((frame) => (frame.status || "Active") === "Active"));
      if (productResult.status === "fulfilled") setProducts((productResult.value.data?.data || []).filter((product) => (product.status || "Active") === "Active"));
    };
    loadCollections();
  }, []);

  return (
    <>
      <Hero />
      <FrameShowcase frames={frames} />
      <ProductCollection products={products} />
    </>
  );
};

export default Home;
