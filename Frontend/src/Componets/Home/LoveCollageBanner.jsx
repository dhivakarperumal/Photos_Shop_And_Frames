import React from "react";
import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";
import PageContainer from "../../CommonComponents/PageContainer";

// Default curated couple photos matching the website gallery
export const DEFAULT_LOVE_PHOTOS = [
  {
    id: "p1",
    src: "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&auto=format&fit=crop&q=80",
    alt: "Romantic couple embrace",
  },
  {
    id: "p2",
    src: "https://images.unsplash.com/photo-1511895426328-dc8714191300?w=800&auto=format&fit=crop&q=80",
    alt: "Happy couple laughing together",
  },
  {
    id: "p3",
    src: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&auto=format&fit=crop&q=80",
    alt: "Intimate couple portrait",
  },
  {
    id: "p4",
    src: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&auto=format&fit=crop&q=80",
    alt: "Warm loving couple memory",
  },
];

const WoodLetter = ({ char }) => (
  <div className="relative flex aspect-square w-full select-none items-center justify-center rounded-xs sm:rounded-sm bg-gradient-to-br from-[#303634] via-[#1d2220] to-[#111413] p-1 shadow-[0_8px_18px_rgba(0,0,0,0.65),inset_0_1px_1px_rgba(255,255,255,0.18),inset_0_-1px_2px_rgba(0,0,0,0.8)] border border-white/10 transition-transform duration-300 hover:scale-105">
    {/* Subtle wood-grain line texture */}
    <div
      className="pointer-events-none absolute inset-0 opacity-15 rounded-xs"
      style={{
        backgroundImage:
          "repeating-linear-gradient(45deg, rgba(255,255,255,0.08) 0px, rgba(255,255,255,0.08) 1px, transparent 1px, transparent 6px)",
      }}
    />
    <span
      style={{ fontFamily: "'Cinzel', 'Playfair Display', Georgia, serif" }}
      className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-[#e8e4dc] drop-shadow-[0_3px_5px_rgba(0,0,0,0.9)]"
    >
      {char}
    </span>
  </div>
);

const PhotoTile = ({ photo, fallback }) => (
  <div className="group relative aspect-square w-full overflow-hidden rounded-xs sm:rounded-sm border border-white/20 bg-[#161a19] shadow-[0_10px_22px_rgba(0,0,0,0.6)] transition-all duration-300 hover:scale-105 hover:shadow-[0_14px_28px_rgba(0,0,0,0.8)]">
    <img
      src={photo.src}
      alt={photo.alt || "Love collage photo"}
      loading="lazy"
      onError={(e) => {
        if (fallback) e.currentTarget.src = fallback;
      }}
      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
    />
    {/* Subtle canvas gallery wrap vignette */}
    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-white/10 opacity-60" />
  </div>
);

const LoveCollageBanner = ({
  photos = DEFAULT_LOVE_PHOTOS,
  priceText = "Starting from just ₹1,198/-",
  ctaText = "Shop Now",
  ctaLink = "/shop",
}) => {
  const currentPhotos = photos && photos.length === 4 ? photos : DEFAULT_LOVE_PHOTOS;

  return (
    <section className="relative overflow-hidden bg-[#0d100f] py-10 sm:py-14 lg:py-16 text-white border-t border-white/5">
      <PageContainer>
        {/* TOP BAR: Starting Price Tag */}
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2 px-1">
          <div className="flex items-center gap-2.5">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#38bdf8]/15 text-[#38bdf8]">
              <Sparkles className="h-3 w-3" />
            </span>
            <p className="text-sm sm:text-base font-extrabold text-[#38bdf8] drop-shadow-sm tracking-wide">
              {priceText}
            </p>
          </div>
          <p className="hidden text-xs font-semibold uppercase tracking-wider text-[#d5a65a]/80 sm:block">
            Handcrafted Wooden LOVE Letters &bull; 4 Canvas Photo Tiles
          </p>
        </div>

        {/* MAIN LUXURY ROOM BANNER CARD */}
        <div className="relative w-full overflow-hidden rounded-2xl sm:rounded-3xl border border-white/10 bg-[#121514] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)]">
          {/* ROOM WALL BACKGROUND WITH WARM AMBIENT LIGHTING */}
          <div
            className="relative min-h-[360px] sm:min-h-[420px] md:min-h-[460px] lg:min-h-[490px] w-full overflow-hidden"
            style={{
              background:
                "radial-gradient(circle at 62% 68%, rgba(225, 175, 95, 0.18) 0%, rgba(200, 150, 75, 0.06) 28%, rgba(20, 24, 22, 0.98) 55%, #0e1110 100%)",
            }}
          >
            {/* SUBTLE WALL TEXTURE */}
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.04]"
              style={{
                backgroundImage:
                  "radial-gradient(#ffffff 1px, transparent 1px)",
                backgroundSize: "20px 20px",
              }}
            />

            {/* RIGHT SIDE: CLASSICAL ARCHED WINDOW ARCHITECTURE */}
            <div className="pointer-events-none absolute right-0 top-0 bottom-10 sm:bottom-14 md:bottom-16 w-[180px] sm:w-[240px] md:w-[320px] lg:w-[400px] overflow-hidden flex items-center justify-end">
              <div className="relative h-[85%] w-[85%] max-w-[280px] rounded-t-full border-4 sm:border-6 lg:border-8 border-[#323936] bg-[#090d0b] shadow-[inset_0_10px_30px_rgba(0,0,0,0.9),-10px_0_30px_rgba(0,0,0,0.5)] overflow-hidden">
                {/* Window Exterior Night Garden Atmosphere */}
                <div
                  className="absolute inset-0 bg-cover bg-center opacity-40"
                  style={{
                    backgroundImage:
                      "linear-gradient(to bottom, rgba(14,24,20,0.6) 0%, rgba(6,10,8,0.95) 100%), url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=70')",
                  }}
                />
                {/* Window Panes Grid */}
                <div className="absolute inset-0 flex flex-col">
                  <div className="h-1/3 border-b-2 sm:border-b-4 border-[#323936]/80" />
                  <div className="h-1/3 border-b-2 sm:border-b-4 border-[#323936]/80" />
                  <div className="h-1/3" />
                </div>
                <div className="absolute inset-0 flex justify-center">
                  <div className="h-full w-0.5 sm:w-1 bg-[#323936]/80" />
                </div>
                {/* Subtle Moonlight / Warm Rim on Window Arch */}
                <div className="pointer-events-none absolute inset-0 rounded-t-full shadow-[inset_0_0_20px_rgba(213,166,90,0.12)]" />
              </div>
            </div>

            {/* CENTER-LEFT: THE L-O-V-E COLLAGE DISPLAY ON THE WALL */}
            <div className="relative z-10 flex h-full flex-col justify-center px-4 sm:px-8 md:px-12 lg:px-16 pt-6 sm:pt-8 md:pt-10 pb-16 sm:pb-22 md:pb-26 max-w-[92%] sm:max-w-[78%] md:max-w-[65%] lg:max-w-[58%]">
              <div className="grid grid-cols-4 gap-1.5 sm:gap-2.5 md:gap-3.5 max-w-[460px]">
                {/* ROW 1: [L] [PHOTO 1] [V] [PHOTO 2] */}
                <WoodLetter char="L" />
                <PhotoTile photo={currentPhotos[0]} fallback={DEFAULT_LOVE_PHOTOS[0].src} />
                <WoodLetter char="V" />
                <PhotoTile photo={currentPhotos[1]} fallback={DEFAULT_LOVE_PHOTOS[1].src} />

                {/* ROW 2: [PHOTO 3] [O] [PHOTO 4] [E] */}
                <PhotoTile photo={currentPhotos[2]} fallback={DEFAULT_LOVE_PHOTOS[2].src} />
                <WoodLetter char="O" />
                <PhotoTile photo={currentPhotos[3]} fallback={DEFAULT_LOVE_PHOTOS[3].src} />
                <WoodLetter char="E" />
              </div>
            </div>

            {/* BOTTOM CONSOLE TABLE: WOOD GRAIN SIDEBOARD */}
            <div className="absolute bottom-0 left-0 right-0 h-10 sm:h-14 md:h-16 bg-gradient-to-b from-[#3a291d] via-[#2a1c12] to-[#180f08] border-t-2 border-[#5a402d] shadow-[0_-12px_28px_rgba(0,0,0,0.7)] z-20">
              {/* Wood Grain Highlights */}
              <div
                className="pointer-events-none absolute inset-0 opacity-20"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(90deg, rgba(255,255,255,0.06) 0px, rgba(255,255,255,0.06) 2px, transparent 2px, transparent 12px)",
                }}
              />
              <div className="absolute inset-x-0 top-0 h-0.5 bg-[#8b6547]/50" />
            </div>

            {/* ACCESSORIES ON CONSOLE TABLE: BOOKS + TABLE LAMP */}
            <div className="absolute bottom-10 sm:bottom-14 md:bottom-16 left-[50%] sm:left-[52%] md:left-[55%] z-20 flex items-end gap-3 sm:gap-4 pointer-events-none">
              {/* Stack of Hardcover Books */}
              <div className="flex flex-col items-center drop-shadow-[0_8px_12px_rgba(0,0,0,0.8)] translate-y-1">
                {/* Top Book (Navy) */}
                <div className="h-1.5 sm:h-2 w-14 sm:w-20 md:w-24 rounded-xs bg-[#1d3557] border-l border-white/20" />
                {/* Middle Book (Warm Sand) */}
                <div className="h-2 sm:h-2.5 w-16 sm:w-22 md:w-26 rounded-xs bg-[#d4a373] border-l border-white/20" />
                {/* Bottom Book (Deep Teal) */}
                <div className="h-2.5 sm:h-3 w-18 sm:w-24 md:w-28 rounded-xs bg-[#2a9d8f] border-l border-white/20 shadow-md" />
              </div>

              {/* Modern Table Lamp with Glowing Ambient Shade */}
              <div className="relative flex flex-col items-center">
                {/* Warm Light Glow casting upward and all around */}
                <div className="absolute -top-10 sm:-top-14 h-24 sm:h-32 w-24 sm:w-32 rounded-full bg-[#f5b041]/25 blur-2xl pointer-events-none" />

                {/* Lamp Shade */}
                <div
                  className="relative z-10 h-7 sm:h-9 md:h-11 w-10 sm:w-14 md:w-16 bg-gradient-to-b from-[#f9f7f2] to-[#ebdcc8] shadow-[0_6px_15px_rgba(245,176,65,0.35),0_8px_20px_rgba(0,0,0,0.6)]"
                  style={{
                    clipPath: "polygon(22% 0%, 78% 0%, 100% 100%, 0% 100%)",
                  }}
                />

                {/* Lamp Brass Rod / Neck */}
                <div className="h-4 sm:h-6 md:h-8 w-1 sm:w-1.5 bg-gradient-to-r from-[#d5a65a] via-[#f7d794] to-[#b38338] shadow-sm" />

                {/* Lamp Ceramic Base */}
                <div className="h-4 sm:h-6 md:h-7 w-4 sm:w-6 md:w-7 rounded-t-full bg-gradient-to-b from-[#2d4039] to-[#1a2924] shadow-md border-t border-white/10" />
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM CTA: ORANGE SHOP NOW BUTTON (Centered as in reference image) */}
        <div className="mt-5 sm:mt-6 flex justify-center">
          <Link
            to={ctaLink}
            className="inline-flex items-center justify-center rounded-xl bg-[#f05a28] px-8 sm:px-12 py-3 text-sm sm:text-base font-bold text-white shadow-[0_10px_25px_-5px_rgba(240,90,40,0.45)] hover:bg-[#d94a1d] hover:shadow-[0_15px_30px_-5px_rgba(240,90,40,0.6)] hover:scale-105 active:scale-98 transition-all duration-200 cursor-pointer"
          >
            {ctaText}
          </Link>
        </div>
      </PageContainer>
    </section>
  );
};

export default LoveCollageBanner;
