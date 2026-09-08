import { Link } from "react-router-dom";
import {
  ArrowRight,
  Globe,
  Phone,
  Sparkles,
} from "lucide-react";

/* =========================================================================
   PROMO BANNER ASSETS
   Original frame studio assets and color palette.
========================================================================= */
export const DEFAULT_BANNER_PHOTOS = {
  // Center diamond photo
  diamondCenter:
    "https://images.unsplash.com/photo-1519741497674-611481863552?w=600&auto=format&fit=crop&q=80",
  // Top-left diamond photo
  diamondTopLeft:
    "https://images.unsplash.com/photo-1511895426328-dc8714191300?w=600&auto=format&fit=crop&q=80",
  // Top-right diamond photo
  diamondTopRight:
    "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&auto=format&fit=crop&q=80",
  // Bottom-left diamond photo
  diamondBottomLeft:
    "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80",
  // Bottom-right diamond photo
  diamondBottomRight:
    "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=600&auto=format&fit=crop&q=80",
  // Large semi-circle photo on the right
  heroCircle:
    "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=800&auto=format&fit=crop&q=80",
};

// Reusable diamond card keeping the photo 100% upright
const DiamondCard = ({ img, fallback, isCenter = false }) => (
  <div
    className={`relative w-20 h-20 sm:w-24 sm:h-24 md:w-26 md:h-26 lg:w-28 lg:h-28 overflow-hidden rounded-xs border-2 sm:border-[3px] border-white shadow-xl bg-[#14201d] transition-transform duration-300 hover:scale-105 ${
      isCenter ? "z-20 scale-105 shadow-2xl" : "z-10"
    }`}
  >
    <img
      src={img}
      alt="Gallery memory"
      loading="lazy"
      onError={(e) => {
        e.currentTarget.src = fallback;
      }}
      className="absolute top-1/2 left-1/2 w-[145%] h-[145%] max-w-none -translate-x-1/2 -translate-y-1/2 -rotate-45 object-cover"
    />
  </div>
);

const PromoBanner = ({
  images = DEFAULT_BANNER_PHOTOS,
  logoText = "Q FRAMES",
  scriptTitle = "Special Discount",
  mainTitle = "FRAME SHOP",
  description = "Turn your favorite memories into timeless masterpieces with handcrafted frames, premium prints, and custom layouts.",
  ctaText = "ORDER NOW",
  ctaLink = "/shop",
  phoneNumber = "+91 98765 43210",
  websiteUrl = "www.qframestudio.com",
}) => {
  const photos = { ...DEFAULT_BANNER_PHOTOS, ...images };

  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-r from-[#0d1210] via-[#111816] to-[#0a0d0c] text-white min-h-[380px] lg:h-[400px] xl:h-[420px] flex flex-col justify-between border-y border-white/10 shadow-2xl">
      
      {/* Subtle Ambient Glow */}
      <div className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full bg-[#d5a65a]/10 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-1/2 h-96 w-96 -translate-y-1/2 rounded-full bg-[#d5a65a]/10 blur-3xl" />

      {/* RIGHT SIDE: SEMI-CIRCLE IMAGE (Flush against the section's right edge, 100% height of section) */}
      <div className="absolute right-0 top-0 bottom-0 h-full w-[220px] sm:w-[280px] md:w-[340px] lg:w-[400px] xl:w-[440px] pointer-events-none overflow-hidden flex items-center justify-end z-10">
        {/* Sized with `h-full aspect-square rounded-full translate-x-1/2`
            Zero vertical overflow: perfectly matches the banner height without stretching it! */}
        <div className="h-full aspect-square rounded-full overflow-hidden bg-[#14201d] translate-x-1/2 border-l-4 sm:border-l-[6px] border-white/20 shadow-2xl relative flex items-center justify-center">
          <img
            src={photos.heroCircle}
            alt="Featured circular showcase"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.src = DEFAULT_BANNER_PHOTOS.heroCircle;
            }}
            className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
          />
        </div>
      </div>

      {/* Upper Content Area: Left Text & Center 5-Diamond Grid */}
      <div className="relative z-20 w-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-14 pt-8 sm:pt-10 lg:pt-12 pb-16 lg:pb-12 flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-8 flex-1">
        
        {/* 1. LEFT COLUMN: Logo, Script Title, Main Title, Description, CTA Button */}
        <div className="w-full lg:max-w-[340px] xl:max-w-[390px] shrink-0 flex flex-col items-start text-left">
          {/* Logo / Badge */}
          <div className="flex items-center gap-2 text-white/80 mb-1">
            <Sparkles className="h-4 w-4 text-[#d5a65a]" />
            <span className="text-xs font-bold uppercase tracking-[0.22em] text-white/80">
              {logoText}
            </span>
          </div>

          {/* Handwritten Script Headline */}
          <p
            style={{ fontFamily: "'Dancing Script', cursive" }}
            className="text-3xl sm:text-4xl lg:text-[44px] font-bold text-[#d5a65a] leading-tight tracking-wide drop-shadow-sm"
          >
            {scriptTitle}
          </p>

          {/* Main Bold Title */}
          <h2 className="mt-1 text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight text-white leading-none font-sans drop-shadow-md">
            {mainTitle}
          </h2>

          {/* Description */}
          <p className="mt-3.5 text-xs sm:text-sm text-white/70 leading-relaxed max-w-xs sm:max-w-sm">
            {description}
          </p>

          {/* Order Now CTA Button with Circular Arrow */}
          <div className="mt-6 sm:mt-7">
            <Link
              to={ctaLink}
              className="group inline-flex items-center gap-3 rounded-full bg-[#d5a65a] pl-2.5 pr-5 py-2 text-xs sm:text-sm font-black uppercase tracking-wider text-[#14201d] transition-all duration-300 hover:bg-[#e0b468] hover:shadow-[0_0_20px_rgba(213,166,90,0.4)] hover:scale-105"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-[#14201d] shadow-sm transition-transform duration-300 group-hover:translate-x-0.5">
                <ArrowRight className="h-3.5 w-3.5" />
              </span>
              <span>{ctaText}</span>
            </Link>
          </div>
        </div>

        {/* 2. MIDDLE COLUMN: 5-Diamond Grid */}
        <div className="relative shrink-0 flex items-center justify-center my-4 lg:my-0 lg:mx-auto">
          <div className="relative w-[260px] h-[260px] sm:w-[300px] sm:h-[300px] lg:w-[320px] lg:h-[320px] flex items-center justify-center">
            {/* 3x3 Grid rotated 45 degrees */}
            <div className="grid grid-cols-3 grid-rows-3 gap-1.5 sm:gap-2 rotate-45 transform">
              {/* Row 1 */}
              <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-26 md:h-26 lg:w-28 lg:h-28 pointer-events-none" />
              <DiamondCard
                img={photos.diamondTopRight}
                fallback={DEFAULT_BANNER_PHOTOS.diamondTopRight}
              />
              <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-26 md:h-26 lg:w-28 lg:h-28 pointer-events-none" />

              {/* Row 2 */}
              <DiamondCard
                img={photos.diamondTopLeft}
                fallback={DEFAULT_BANNER_PHOTOS.diamondTopLeft}
              />
              <DiamondCard
                img={photos.diamondCenter}
                fallback={DEFAULT_BANNER_PHOTOS.diamondCenter}
                isCenter
              />
              <DiamondCard
                img={photos.diamondBottomRight}
                fallback={DEFAULT_BANNER_PHOTOS.diamondBottomRight}
              />

              {/* Row 3 */}
              <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-26 md:h-26 lg:w-28 lg:h-28 pointer-events-none" />
              <DiamondCard
                img={photos.diamondBottomLeft}
                fallback={DEFAULT_BANNER_PHOTOS.diamondBottomLeft}
              />
              <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-26 md:h-26 lg:w-28 lg:h-28 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Spacer for layout balance on wide screens */}
        <div className="hidden xl:block w-32 shrink-0 pointer-events-none" />
      </div>

      {/* BOTTOM GEOMETRIC INFO STRIP */}
      <div className="relative w-full z-30 flex items-end overflow-hidden">
        {/* White Contact Bar with Angled Right Edge */}
        <div
          className="relative bg-white text-[#111816] pl-6 sm:pl-10 lg:pl-16 pr-12 sm:pr-16 py-3 flex flex-wrap items-center gap-5 sm:gap-8 shadow-md z-20 shrink-0"
          style={{
            clipPath: "polygon(0 0, calc(100% - 24px) 0, 100% 100%, 0 100%)",
          }}
        >
          {/* Phone */}
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full bg-[#111816] text-white">
              <Phone className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            </div>
            <span className="text-xs sm:text-sm font-black tracking-tight text-[#111816]">
              {phoneNumber}
            </span>
          </div>

          {/* Website */}
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full bg-[#111816] text-white">
              <Globe className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            </div>
            <span className="text-xs sm:text-sm font-bold text-[#374151]">
              {websiteUrl}
            </span>
          </div>
        </div>

        {/* Continuous Golden Accent Ribbon under the diamonds */}
        <div
          className="h-10 sm:h-12 bg-[#d5a65a] -ml-6 w-48 sm:w-64 lg:w-96 shadow-md z-10"
          style={{
            clipPath: "polygon(24px 0, 100% 0, calc(100% - 24px) 100%, 0 100%)",
          }}
        />
      </div>
    </section>
  );
};

export default PromoBanner;
