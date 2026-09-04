import { ArrowUpRight, ImagePlus, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const FrameShowcase = ({ frames }) => (
  <section className="overflow-hidden bg-[#14201d] px-4 py-16 text-white sm:px-8 lg:px-12 lg:py-20">
    <div className="mx-auto max-w-[1320px]">
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.24em] text-[#d5a65a]"><Sparkles className="h-4 w-4" /> Frame collection</p>
          <h2 className="mt-3 max-w-xl text-4xl font-black leading-none tracking-[-0.04em] sm:text-5xl">Give your memories a place to live.</h2>
          <p className="mt-4 max-w-lg text-sm leading-6 text-[#b9c1bc]">Handpicked frame styles made to turn everyday photographs into something worth looking at every day.</p>
        </div>
        <Link to="/shop" className="group inline-flex items-center gap-2 self-start text-sm font-bold text-[#f0cc8d] transition hover:text-white md:self-auto">Explore all frames <ArrowUpRight className="h-4 w-4 transition group-hover:translate-x-1 group-hover:-translate-y-1" /></Link>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {frames.length ? frames.slice(0, 4).map((frame, index) => (
          <Link to="/shop" key={frame.id || frame.uuid || frame.frame_name} className={`group relative overflow-hidden bg-[#25332e] ${index === 1 ? "lg:translate-y-8" : ""}`}>
            <div className="flex aspect-[4/5] items-center justify-center bg-[#e8e0d1] p-8">{frame.frame_image ? <img src={frame.frame_image} alt={frame.frame_name} className="h-full w-full object-contain transition duration-500 group-hover:scale-105" /> : <ImagePlus className="h-12 w-12 text-[#b4a993]" />}</div>
            <div className="flex items-center justify-between px-4 py-4"><div><p className="text-sm font-bold">{frame.frame_name}</p><p className="mt-1 text-[10px] uppercase tracking-[0.16em] text-[#91a49b]">{frame.orientation || "Portrait"}</p></div><ArrowUpRight className="h-4 w-4 text-[#d5a65a] transition group-hover:translate-x-1 group-hover:-translate-y-1" /></div>
          </Link>
        )) : ["Portrait", "Landscape", "Square", "Collage"].map((name, index) => (
          <Link to="/shop" key={name} className={`group bg-[#25332e] ${index === 1 ? "lg:translate-y-8" : ""}`}>
            <div className="flex aspect-[4/5] items-center justify-center bg-[#e8e0d1] p-10"><div className={`flex items-center justify-center border-[10px] border-[#8c6840] bg-[#d4e0d6] shadow-[inset_0_0_0_6px_#f5f0e7,0_14px_20px_rgba(0,0,0,.2)] ${index === 0 ? "h-full w-2/3" : index === 1 ? "h-2/3 w-full" : index === 2 ? "aspect-square w-4/5" : "h-4/5 w-full"}`}><ImagePlus className="h-8 w-8 text-[#8fa394]" /></div></div>
            <div className="flex items-center justify-between px-4 py-4"><div><p className="text-sm font-bold">{name} frames</p><p className="mt-1 text-[10px] uppercase tracking-[0.16em] text-[#91a49b]">Made for your story</p></div><ArrowUpRight className="h-4 w-4 text-[#d5a65a]" /></div>
          </Link>
        ))}
      </div>
    </div>
  </section>
);

export default FrameShowcase;
