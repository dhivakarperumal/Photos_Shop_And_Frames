import { useState } from "react";
import { ImagePlus, Sparkles } from "lucide-react";
import PageContainer from "../../CommonComponents/PageContainer";

const orientations = ["Portrait", "Landscape", "Square"];

const FrameShowcase = ({ frames }) => {
  const [selectedOrientation, setSelectedOrientation] = useState("All");
  const visibleFrames = selectedOrientation === "All"
    ? frames
    : frames.filter((frame) => (frame.orientation || "Portrait").toLowerCase() === selectedOrientation.toLowerCase());

  return (
    <section className="overflow-hidden bg-[#14201d] py-16 text-white sm:py-20">
      <PageContainer>
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.24em] text-[#d5a65a]"><Sparkles className="h-4 w-4" /> Frame collection</p>
          {/* <h2 className="mt-3 max-w-xl text-4xl font-black leading-none tracking-[-0.04em] sm:text-5xl">Give your memories a place to live.</h2>
          <p className="mt-4 max-w-lg text-sm leading-6 text-[#b9c1bc]">Handpicked frame styles made to turn everyday photographs into something worth looking at every day.</p> */}
        </div>
        <span className="self-start text-xs font-bold uppercase tracking-[0.18em] text-[#91a49b] md:self-auto">View our frame styles</span>
      </div>

      <div className="mt-9 flex w-fit max-w-full flex-wrap gap-2 rounded-xl bg-[#1d2b27] p-2">
        {["All", ...orientations].map((orientation) => (
          <button
            key={orientation}
            type="button"
            onClick={() => setSelectedOrientation(orientation)}
            className={`rounded-lg px-3 py-2 text-xs font-bold uppercase tracking-[0.12em] transition ${selectedOrientation === orientation ? "bg-[#d5a65a] text-[#14201d]" : "text-[#b9c1bc] hover:bg-[#293b35] hover:text-white"}`}
          >
            {orientation}
          </button>
        ))}
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {visibleFrames.length ? visibleFrames.slice(0, 5).map((frame) => (
          <article key={frame.id || frame.uuid || frame.frame_name} className="overflow-hidden bg-[#25332e]">
            <div className="flex aspect-[4/3] items-center justify-center bg-[#e8e0d1] p-5">{frame.frame_image ? <img src={frame.frame_image} alt={frame.frame_name} className="h-full w-full object-contain" /> : <ImagePlus className="h-10 w-10 text-[#b4a993]" />}</div>
            <div className="px-3 py-3"><p className="truncate text-sm font-bold">{frame.frame_name}</p><p className="mt-1 text-[10px] uppercase tracking-[0.16em] text-[#91a49b]">{frame.orientation || "Portrait"}</p></div>
          </article>
        )) : (
          <div className="col-span-full border border-dashed border-[#486057] px-5 py-12 text-center text-sm text-[#b9c1bc]">No {selectedOrientation.toLowerCase()} frames are available yet.</div>
        )}
      </div>
      </PageContainer>
    </section>
  );
};

export default FrameShowcase;
