
import React from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  Heart,
  Sparkles,
  Camera,
  Gift,
  Star,
} from "lucide-react";
import PageContainer from "../../CommonComponents/PageContainer";

// -----------------------------------------------------
// DEFAULT LOVE PHOTOS
// -----------------------------------------------------

export const DEFAULT_LOVE_PHOTOS = [
  {
    id: "p1",
    src: "https://images.unsplash.com/photo-1519741497674-611481863552?w=900&auto=format&fit=crop&q=85",
    alt: "Romantic couple embrace",
  },
  {
    id: "p2",
    src: "https://images.unsplash.com/photo-1511895426328-dc8714191300?w=900&auto=format&fit=crop&q=85",
    alt: "Happy couple laughing together",
  },
  {
    id: "p3",
    src: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=900&auto=format&fit=crop&q=85",
    alt: "Intimate couple portrait",
  },
  {
    id: "p4",
    src: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=900&auto=format&fit=crop&q=85",
    alt: "Warm loving couple memory",
  },
];

// -----------------------------------------------------
// WOOD LOVE LETTER
// -----------------------------------------------------

const WoodLetter = ({ char }) => {
  return (
    <div
      className="
        relative flex aspect-square w-full items-center justify-center
        overflow-hidden rounded-xl
        border border-white/10
        bg-gradient-to-br from-[#3b403c] via-[#242a27] to-[#111513]
        shadow-[0_12px_30px_rgba(0,0,0,0.55)]
        transition-all duration-500
        hover:-translate-y-1 hover:scale-[1.03]
      "
    >
      {/* Wood texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg, rgba(255,255,255,0.08) 0px, rgba(255,255,255,0.08) 1px, transparent 1px, transparent 7px)",
        }}
      />

      {/* Inner border */}
      <div className="pointer-events-none absolute inset-1 rounded-lg border border-[#d5a65a]/20" />

      <span
        className="
          relative z-10
          text-4xl font-black
          tracking-tight text-[#eee9df]
          drop-shadow-[0_4px_7px_rgba(0,0,0,0.9)]
          sm:text-5xl
          md:text-6xl
          lg:text-7xl
        "
        style={{
          fontFamily: "'Cinzel', 'Playfair Display', Georgia, serif",
        }}
      >
        {char}
      </span>
    </div>
  );
};

// -----------------------------------------------------
// PHOTO TILE
// -----------------------------------------------------

const PhotoTile = ({ photo }) => {
  return (
    <div
      className="
        group relative aspect-square overflow-hidden rounded-xl
        border border-white/15
        bg-[#151a18]
        shadow-[0_12px_30px_rgba(0,0,0,0.55)]
      "
    >
      <img
        src={photo.src}
        alt={photo.alt || "Love memory"}
        loading="lazy"
        className="
          h-full w-full object-cover
          transition-transform duration-700
          group-hover:scale-110
        "
      />

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-white/10" />

      <div
        className="
          pointer-events-none absolute inset-0
          opacity-0 transition-opacity duration-500
          group-hover:opacity-100
          ring-1 ring-inset ring-[#d5a65a]/50
        "
      />
    </div>
  );
};

// -----------------------------------------------------
// MAIN COMPONENT
// -----------------------------------------------------

const LoveCollageBanner = ({
  photos = DEFAULT_LOVE_PHOTOS,
  priceText = "Starting from just ₹1,198/-",
  ctaText = "Create Your Memory",
  ctaLink = "/shop",
}) => {
  const currentPhotos =
    photos && photos.length === 4 ? photos : DEFAULT_LOVE_PHOTOS;

  return (
    <section className="relative overflow-hidden bg-[#0d1210] py-14 text-white sm:py-16 lg:py-20">
      {/* ------------------------------------------------
          BACKGROUND DECORATION
      ------------------------------------------------ */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 top-10 h-80 w-80 rounded-full bg-[#d5a65a]/5 blur-3xl" />

        <div className="absolute -right-40 bottom-0 h-96 w-96 rounded-full bg-[#2a9d8f]/5 blur-3xl" />

        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "radial-gradient(#ffffff 1px, transparent 1px)",
            backgroundSize: "22px 22px",
          }}
        />
      </div>

      <PageContainer>
        {/* ------------------------------------------------
            SECTION HEADER
        ------------------------------------------------ */}

        <div className="relative z-10 mb-10 text-center">
          <div className="mb-3 flex items-center justify-center gap-2">
            <span className="h-px w-10 bg-[#d5a65a]/50" />

            <Heart className="h-4 w-4 fill-[#d5a65a] text-[#d5a65a]" />

            <span className="h-px w-10 bg-[#d5a65a]/50" />
          </div>

          <p className="mb-2 text-xs font-bold uppercase tracking-[0.28em] text-[#d5a65a]">
            Made For Your Beautiful Moments
          </p>

          <h2
            className="text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl"
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
            }}
          >
            Turn Your Love Into{" "}
            <span className="text-[#d5a65a]">Something Timeless</span>
          </h2>
        </div>

        {/* ------------------------------------------------
            THREE SECTION LAYOUT
        ------------------------------------------------ */}

        <div className="relative z-10 grid items-stretch gap-5 lg:grid-cols-[0.85fr_1.5fr_0.85fr]">
          {/* =================================================
              LEFT CONTENT
          ================================================= */}

          <div
            className="
              relative flex flex-col justify-between
              overflow-hidden rounded-3xl
              border border-white/10
              bg-gradient-to-br from-[#17201c] to-[#101513]
              p-6
              shadow-[0_25px_60px_rgba(0,0,0,0.35)]
              sm:p-8
            "
          >
            {/* Decorative heart */}
            <div className="absolute -right-8 -top-8 opacity-[0.04]">
              <Heart className="h-40 w-40 fill-white" />
            </div>

            <div className="relative z-10">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#d5a65a]/20 bg-[#d5a65a]/5 px-3 py-1.5">
                <Sparkles className="h-3.5 w-3.5 text-[#d5a65a]" />

                <span className="text-[11px] font-bold uppercase tracking-wider text-[#d5a65a]">
                  Special Collection
                </span>
              </div>

              <h3
                className="
                  max-w-xs
                  text-3xl font-black leading-tight
                  text-[#f3eee5]
                  sm:text-4xl
                "
                style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                }}
              >
                Your story deserves to be{" "}
                <span className="text-[#d5a65a]">remembered.</span>
              </h3>

              <p className="mt-5 text-sm leading-7 text-white/60">
                Transform your favorite moments into a beautiful keepsake.
                Our handcrafted LOVE collection brings your photographs
                together with timeless wooden letters.
              </p>

              {/* Features */}
              <div className="mt-7 space-y-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#d5a65a]/10">
                    <Camera className="h-4 w-4 text-[#d5a65a]" />
                  </span>

                  <div>
                    <p className="text-sm font-bold text-white">
                      Your Favorite Photos
                    </p>

                    <p className="text-xs text-white/45">
                      Turn moments into memories
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#d5a65a]/10">
                    <Gift className="h-4 w-4 text-[#d5a65a]" />
                  </span>

                  <div>
                    <p className="text-sm font-bold text-white">
                      Beautifully Crafted
                    </p>

                    <p className="text-xs text-white/45">
                      Made to become a special gift
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#d5a65a]/10">
                    <Star className="h-4 w-4 text-[#d5a65a]" />
                  </span>

                  <div>
                    <p className="text-sm font-bold text-white">
                      Made To Last
                    </p>

                    <p className="text-xs text-white/45">
                      A memory you can keep forever
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative z-10 mt-8">
              <p className="mb-3 text-sm font-bold text-[#d5a65a]">
                {priceText}
              </p>

              <Link
                to={ctaLink}
                className="
                  group inline-flex w-full items-center justify-center
                  gap-2 rounded-xl
                  bg-[#f05a28]
                  px-5 py-3.5
                  text-sm font-bold text-white
                  shadow-[0_12px_25px_rgba(240,90,40,0.25)]
                  transition-all duration-300
                  hover:-translate-y-1
                  hover:bg-[#df4d20]
                  hover:shadow-[0_18px_35px_rgba(240,90,40,0.35)]
                "
              >
                {ctaText}

                <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            </div>
          </div>

          {/* =================================================
              CENTER CREATIVE LOVE BANNER
          ================================================= */}

          <div
            className="
              relative flex min-h-[430px] items-center justify-center
              overflow-hidden rounded-3xl
              border border-[#d5a65a]/15
              bg-gradient-to-br
              from-[#202a25]
              via-[#151c19]
              to-[#0c110f]
              p-5
              shadow-[0_30px_70px_rgba(0,0,0,0.5)]
              sm:min-h-[500px]
              sm:p-8
            "
          >
            {/* Center glow */}
            <div className="pointer-events-none absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#d5a65a]/8 blur-3xl" />

            {/* Top label */}
            <div className="absolute left-1/2 top-5 z-20 -translate-x-1/2 sm:top-7">
              <div className="flex items-center gap-2 whitespace-nowrap rounded-full border border-white/10 bg-black/20 px-4 py-2 backdrop-blur-sm">
                <Heart className="h-3.5 w-3.5 fill-[#d5a65a] text-[#d5a65a]" />

                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/70">
                  Love Collection
                </span>
              </div>
            </div>

            {/* LOVE COLLAGE */}
            <div className="relative z-10 mt-8 w-full max-w-[480px]">
              {/* Decorative floating hearts */}
              <div className="absolute -left-3 top-1/2 z-20 hidden -translate-y-1/2 sm:block">
                <div className="flex h-9 w-9 rotate-[-12deg] items-center justify-center rounded-full border border-[#d5a65a]/20 bg-[#17201c] shadow-lg">
                  <Heart className="h-4 w-4 fill-[#d5a65a] text-[#d5a65a]" />
                </div>
              </div>

              <div className="absolute -right-3 top-1/3 z-20 hidden sm:block">
                <div className="flex h-8 w-8 rotate-[12deg] items-center justify-center rounded-full border border-[#d5a65a]/20 bg-[#17201c] shadow-lg">
                  <Heart className="h-3.5 w-3.5 fill-[#d5a65a] text-[#d5a65a]" />
                </div>
              </div>

              {/* Main collage */}
              <div className="grid grid-cols-4 gap-2 sm:gap-3">
                <WoodLetter char="L" />

                <PhotoTile photo={currentPhotos[0]} />

                <WoodLetter char="V" />

                <PhotoTile photo={currentPhotos[1]} />

                <PhotoTile photo={currentPhotos[2]} />

                <WoodLetter char="O" />

                <PhotoTile photo={currentPhotos[3]} />

                <WoodLetter char="E" />
              </div>

              {/* Bottom message */}
              <div className="mt-5 text-center">
                <p
                  className="text-lg font-bold text-white/90 sm:text-xl"
                  style={{
                    fontFamily: "'Playfair Display', Georgia, serif",
                  }}
                >
                  Love captured. Memories preserved.
                </p>

                <p className="mt-1 text-[11px] uppercase tracking-[0.2em] text-[#d5a65a]/70">
                  Forever starts with a photograph
                </p>
              </div>
            </div>

            {/* Bottom gold line */}
            <div className="absolute bottom-0 left-1/2 h-1 w-24 -translate-x-1/2 rounded-full bg-[#d5a65a]/60 blur-[1px]" />
          </div>

          {/* =================================================
              RIGHT MEMORY CARD
          ================================================= */}

          <div
            className="
              relative flex flex-col overflow-hidden
              rounded-3xl
              border border-white/10
              bg-[#151b18]
              shadow-[0_25px_60px_rgba(0,0,0,0.4)]
            "
          >
            {/* Image */}
            <div className="relative h-[260px] overflow-hidden sm:h-[300px] lg:h-[300px]">
              <img
                src={currentPhotos[0].src}
                alt="Beautiful memory"
                className="
                  h-full w-full object-cover
                  transition-transform duration-700
                  hover:scale-105
                "
              />

              <div className="absolute inset-0 bg-gradient-to-t from-[#151b18] via-transparent to-black/10" />

              {/* Floating heart */}
              <div className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-black/30 backdrop-blur-md">
                <Heart className="h-4 w-4 fill-white text-white" />
              </div>

              {/* Image label */}
              <div className="absolute bottom-4 left-4">
                <span className="rounded-full bg-black/40 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-white backdrop-blur-md">
                  One Beautiful Memory
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="flex flex-1 flex-col justify-between p-6">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#d5a65a]">
                  Keep It Close
                </p>

                <h3
                  className="mt-2 text-2xl font-black leading-tight text-white"
                  style={{
                    fontFamily: "'Playfair Display', Georgia, serif",
                  }}
                >
                  A little piece of your story.
                </h3>

                <p className="mt-3 text-sm leading-6 text-white/50">
                  Give your favorite photograph a place where it can be seen,
                  remembered, and treasured every day.
                </p>
              </div>

              {/* Mini stats */}
              <div className="mt-7 grid grid-cols-2 gap-2">
                <div className="rounded-xl border border-white/5 bg-white/[0.025] p-3">
                  <p className="text-lg font-black text-[#d5a65a]">04</p>
                  <p className="mt-0.5 text-[10px] uppercase tracking-wider text-white/40">
                    Photo Tiles
                  </p>
                </div>

                <div className="rounded-xl border border-white/5 bg-white/[0.025] p-3">
                  <p className="text-lg font-black text-[#d5a65a]">01</p>
                  <p className="mt-0.5 text-[10px] uppercase tracking-wider text-white/40">
                    Love Story
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ------------------------------------------------
            BOTTOM NOTE
        ------------------------------------------------ */}

        <div className="relative z-10 mt-7 flex items-center justify-center gap-3 text-center">
          <span className="h-px w-10 bg-white/10 sm:w-20" />

          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/30 sm:text-xs">
            Crafted with care • Made for memories • Designed with love
          </p>

          <span className="h-px w-10 bg-white/10 sm:w-20" />
        </div>
      </PageContainer>
    </section>
  );
};

export default LoveCollageBanner;

