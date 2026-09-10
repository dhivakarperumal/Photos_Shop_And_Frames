
import React from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  Heart,
  Sparkles,
  Camera,
  Gift,
} from "lucide-react";
import PageContainer from "../../CommonComponents/PageContainer";

export const DEFAULT_LOVE_PHOTOS = [
  {
    id: "p1",
    src: "https://images.unsplash.com/photo-1519741497674-611481863552?w=900&auto=format&fit=crop&q=85",
    alt: "Romantic couple embrace",
  },
  {
    id: "p2",
    src: "https://images.unsplash.com/photo-1511895426328-dc8714191300?w=900&auto=format&fit=crop&q=85",
    alt: "Happy couple",
  },
  {
    id: "p3",
    src: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=900&auto=format&fit=crop&q=85",
    alt: "Couple portrait",
  },
  {
    id: "p4",
    src: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=900&auto=format&fit=crop&q=85",
    alt: "Love memory",
  },
];

const WoodLetter = ({ char }) => (
  <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-lg border border-white/10 bg-gradient-to-br from-[#3b403c] via-[#242a27] to-[#111513] shadow-[0_8px_18px_rgba(0,0,0,0.55)]">
    <div
      className="absolute inset-0 opacity-15"
      style={{
        backgroundImage:
          "repeating-linear-gradient(45deg,rgba(255,255,255,.08) 0px,rgba(255,255,255,.08) 1px,transparent 1px,transparent 7px)",
      }}
    />

    <span
      className="relative text-3xl font-black text-[#eee9df] sm:text-4xl md:text-5xl lg:text-6xl"
      style={{
        fontFamily: "'Cinzel','Playfair Display',Georgia,serif",
      }}
    >
      {char}
    </span>
  </div>
);

const PhotoTile = ({ photo }) => (
  <div className="group relative aspect-square overflow-hidden rounded-lg border border-white/10 bg-[#151a18]">
    <img
      src={photo.src}
      alt={photo.alt}
      loading="lazy"
      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
    />

    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
  </div>
);

const LoveCollageBanner = ({
  photos = DEFAULT_LOVE_PHOTOS,
  priceText = "Starting from ₹599/-",
  ctaText = "Shop Now",
  ctaLink = "/shop",
}) => {
  const currentPhotos =
    photos?.length === 4 ? photos : DEFAULT_LOVE_PHOTOS;

  return (
    <section className="relative overflow-hidden bg-[#0d1210] py-8 text-white sm:py-10 lg:py-12">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 top-10 h-64 w-64 rounded-full bg-[#d5a65a]/5 blur-3xl" />
        <div className="absolute -right-32 bottom-0 h-72 w-72 rounded-full bg-[#2a9d8f]/5 blur-3xl" />
      </div>

      <PageContainer>
        {/* Small Header */}
        <div className="relative z-10 mb-6 text-center">
          <div className="mb-1 flex items-center justify-center gap-2">
            <span className="h-px w-8 bg-[#d5a65a]/50" />
            <Heart className="h-3.5 w-3.5 fill-[#d5a65a] text-[#d5a65a]" />
            <span className="h-px w-8 bg-[#d5a65a]/50" />
          </div>

          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#d5a65a]">
            Love Collection
          </p>

          <h2
            className="mt-1 text-2xl font-black sm:text-3xl"
            style={{
              fontFamily: "'Playfair Display',Georgia,serif",
            }}
          >
            Turn Moments Into{" "}
            <span className="text-[#d5a65a]">Memories</span>
          </h2>
        </div>

        {/* THREE COLUMNS */}
        <div className="relative z-10 grid gap-4 lg:grid-cols-[0.85fr_1.35fr_0.85fr]">
          
          {/* ================= LEFT ================= */}
          <div className="flex flex-col justify-center rounded-2xl border border-white/10 bg-gradient-to-br from-[#17201c] to-[#101513] p-5 sm:p-6">
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-[#d5a65a]/10">
              <Sparkles className="h-4 w-4 text-[#d5a65a]" />
            </div>

            <h3
              className="text-2xl font-black leading-tight sm:text-3xl"
              style={{
                fontFamily: "'Playfair Display',Georgia,serif",
              }}
            >
              Your story deserves to be{" "}
              <span className="text-[#d5a65a]">remembered.</span>
            </h3>

            <p className="mt-3 text-xs leading-6 text-white/55 sm:text-sm">
              Turn your favorite photographs into a beautiful handcrafted
              memory that lasts forever.
            </p>

            {/* Only 2 features */}
            <div className="mt-4 space-y-2.5">
              <div className="flex items-center gap-2.5">
                <Camera className="h-4 w-4 text-[#d5a65a]" />
                <span className="text-xs text-white/70">
                  4 Personalized Photo Tiles
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                <Gift className="h-4 w-4 text-[#d5a65a]" />
                <span className="text-xs text-white/70">
                  Beautiful Handmade Gift
                </span>
              </div>
            </div>

            <div className="mt-5">
              <p className="mb-2 text-xs font-bold text-[#d5a65a]">
                {priceText}
              </p>

              <Link
                to={ctaLink}
                className="group inline-flex items-center gap-2 rounded-lg bg-[#f05a28] px-5 py-2.5 text-xs font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-[#df4d20]"
              >
                {ctaText}
                <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            </div>
          </div>

          {/* ================= CENTER ================= */}
          <div className="relative flex items-center justify-center overflow-hidden rounded-2xl border border-[#d5a65a]/15 bg-gradient-to-br from-[#202a25] via-[#151c19] to-[#0c110f] px-5 py-6 sm:px-8">
            
            {/* Glow */}
            <div className="absolute left-1/2 top-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#d5a65a]/8 blur-3xl" />

            <div className="relative z-10 w-full max-w-[430px]">
              
              {/* Label */}
              <div className="mb-4 flex justify-center">
                <span className="flex items-center gap-1.5 rounded-full border border-white/10 bg-black/20 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.2em] text-white/60">
                  <Heart className="h-3 w-3 fill-[#d5a65a] text-[#d5a65a]" />
                  Made With Love
                </span>
              </div>

              {/* LOVE */}
              <div className="grid grid-cols-4 gap-1.5 sm:gap-2.5">
                <WoodLetter char="L" />
                <PhotoTile photo={currentPhotos[0]} />
                <WoodLetter char="V" />
                <PhotoTile photo={currentPhotos[1]} />

                <PhotoTile photo={currentPhotos[2]} />
                <WoodLetter char="O" />
                <PhotoTile photo={currentPhotos[3]} />
                <WoodLetter char="E" />
              </div>

              <div className="mt-4 text-center">
                <p
                  className="text-base font-bold text-white/85 sm:text-lg"
                  style={{
                    fontFamily: "'Playfair Display',Georgia,serif",
                  }}
                >
                  Love captured forever.
                </p>

                <p className="mt-0.5 text-[9px] uppercase tracking-[0.18em] text-[#d5a65a]/60">
                  Your memories • Your story
                </p>
              </div>
            </div>
          </div>

          {/* ================= RIGHT ================= */}
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#151b18]">
            
            {/* Smaller image */}
            <div className="relative h-[190px] overflow-hidden sm:h-[220px]">
              <img
                src={currentPhotos[1].src}
                alt="Beautiful love memory"
                className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-[#151b18] via-transparent to-black/10" />

              <div className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-black/30 backdrop-blur-md">
                <Heart className="h-3.5 w-3.5 fill-white text-white" />
              </div>

              <div className="absolute bottom-3 left-3">
                <span className="rounded-full bg-black/40 px-2.5 py-1 text-[8px] font-bold uppercase tracking-wider text-white backdrop-blur-md">
                  Your Memory
                </span>
              </div>
            </div>

            <div className="p-5">
              <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-[#d5a65a]">
                Keep It Close
              </p>

              <h3
                className="mt-1.5 text-xl font-black leading-tight"
                style={{
                  fontFamily: "'Playfair Display',Georgia,serif",
                }}
              >
                A little piece of your story.
              </h3>

              <p className="mt-2 text-xs leading-5 text-white/45">
                Give your favorite moments a beautiful place to live.
              </p>

              <div className="mt-4 flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#d5a65a]" />
                <span className="text-[10px] text-white/45">
                  Crafted for memories
                </span>
              </div>
            </div>
          </div>
        </div>
      </PageContainer>
    </section>
  );
};

export default LoveCollageBanner;

