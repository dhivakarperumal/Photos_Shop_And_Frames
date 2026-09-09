import { Link } from "react-router-dom";
import {
  ArrowRight,
  Sparkles,
} from "lucide-react";
import PageContainer from "../../CommonComponents/PageContainer";

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

// Reusable diamond card keeping the photo 100% upright with clean non-overlapping borders
const DiamondCard = ({ img, fallback }) => (
  <div className="relative w-full h-full aspect-square overflow-hidden rounded-[2px] border-2 sm:border-[3px] border-white shadow-xl bg-[#14201d] transition-all duration-300 hover:brightness-110">
    <img
      src={img}
      alt="Gallery memory"
      loading="lazy"
      onError={(e) => {
        e.currentTarget.src = fallback;
      }}
      className="absolute top-1/2 left-1/2 w-[145%] h-[145%] max-w-none -translate-x-1/2 -translate-y-1/2 -rotate-45 object-cover pointer-events-none select-none"
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
}) => {
  const photos = { ...DEFAULT_BANNER_PHOTOS, ...images };

  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-r from-[#0d1210] via-[#111816] to-[#0a0d0c] text-white min-h-[480px] sm:min-h-[520px] lg:h-[540px] xl:h-[580px] flex items-center border-y border-white/10 shadow-2xl">
      
      {/* Subtle Ambient Glow */}
      <div className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full bg-[#d5a65a]/10 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-1/2 h-96 w-96 -translate-y-1/2 rounded-full bg-[#d5a65a]/10 blur-3xl" />

      {/* RIGHT SIDE: ENLARGED SEMI-CIRCLE IMAGE (Flush against the section's right edge, 100% height of banner) */}
      <div className="absolute right-0 top-0 bottom-0 h-full w-[260px] sm:w-[320px] md:w-[380px] lg:w-[460px] xl:w-[540px] pointer-events-none overflow-hidden flex items-center justify-end z-10">
        <div className="h-full aspect-square rounded-full overflow-hidden bg-[#14201d] translate-x-1/2 border-l-4 sm:border-l-[6px] lg:border-l-8 border-white/20 shadow-2xl relative flex items-center justify-center">
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

      {/* PAGE CONTAINER ALIGNMENT
          Ensures the left text ("✨ Q FRAMES", "Special Discount", "FRAME SHOP", description, button)
          aligns precisely with the Navbar logo and other page sections. */}
      <PageContainer className="relative z-20 w-full">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-10 py-8 lg:py-3 xl:py-4">
          
          {/* 1. LEFT COLUMN: Logo, Script Title, Main Title, Description, CTA Button */}
          <div className="w-full lg:max-w-[420px] xl:max-w-[500px] shrink-0 flex flex-col items-start text-left">
            {/* Logo / Badge */}
            <div className="flex items-center gap-2 text-white/90 mb-2">
              <Sparkles className="h-5 w-5 text-[#d5a65a]" />
              <span className="text-xs sm:text-sm font-bold uppercase tracking-[0.25em] text-[#d5a65a]">
                {logoText}
              </span>
            </div>

            {/* Handwritten Script Headline - Larger */}
            <p
              style={{ fontFamily: "'Dancing Script', cursive" }}
              className="text-4xl sm:text-5xl lg:text-6xl xl:text-[68px] font-bold text-[#d5a65a] leading-tight tracking-wide drop-shadow-sm"
            >
              {scriptTitle}
            </p>

            {/* Main Bold Title - Larger */}
            <h2 className="mt-1 text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black uppercase tracking-tight text-white leading-none font-sans drop-shadow-md">
              {mainTitle}
            </h2>

            {/* Description - Larger text & wider container */}
            <p className="mt-4 sm:mt-5 text-sm sm:text-base lg:text-lg text-white/80 leading-relaxed max-w-sm sm:max-w-md xl:max-w-lg font-normal">
              {description}
            </p>

            {/* Order Now CTA Button with Circular Arrow - Scaled Up */}
            <div className="mt-7 sm:mt-8">
              <Link
                to={ctaLink}
                className="group inline-flex items-center gap-3.5 rounded-full bg-[#d5a65a] pl-3 pr-6 py-2.5 sm:py-3 text-sm sm:text-base font-black uppercase tracking-wider text-[#14201d] transition-all duration-300 hover:bg-[#e0b468] hover:shadow-[0_0_24px_rgba(213,166,90,0.45)] hover:scale-105"
              >
                <span className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-white text-[#14201d] shadow-sm transition-transform duration-300 group-hover:translate-x-1">
                  <ArrowRight className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
                </span>
                <span>{ctaText}</span>
              </Link>
            </div>
          </div>

          {/* 2. MIDDLE COLUMN: 5-Diamond Grid (Further enlarged, exact placement preserved) */}
          <div className="relative shrink-0 flex items-center justify-center my-6 lg:my-0 lg:mx-auto">
            <div className="relative w-[250px] h-[250px] sm:w-[275px] sm:h-[275px] md:w-[310px] md:h-[310px] lg:w-[350px] lg:h-[350px] xl:w-[385px] xl:h-[385px] flex items-center justify-center">
              {/* 3x3 Grid rotated 45 degrees */}
              <div className="grid grid-cols-3 grid-rows-3 gap-2.5 sm:gap-3 lg:gap-3.5 xl:gap-4 w-full h-full rotate-45 transform">
                {/* Row 1 */}
                <div className="w-full h-full pointer-events-none" />
                <DiamondCard
                  img={photos.diamondTopRight}
                  fallback={DEFAULT_BANNER_PHOTOS.diamondTopRight}
                />
                <div className="w-full h-full pointer-events-none" />

                {/* Row 2 */}
                <DiamondCard
                  img={photos.diamondTopLeft}
                  fallback={DEFAULT_BANNER_PHOTOS.diamondTopLeft}
                />
                <DiamondCard
                  img={photos.diamondCenter}
                  fallback={DEFAULT_BANNER_PHOTOS.diamondCenter}
                />
                <DiamondCard
                  img={photos.diamondBottomRight}
                  fallback={DEFAULT_BANNER_PHOTOS.diamondBottomRight}
                />

                {/* Row 3 */}
                <div className="w-full h-full pointer-events-none" />
                <DiamondCard
                  img={photos.diamondBottomLeft}
                  fallback={DEFAULT_BANNER_PHOTOS.diamondBottomLeft}
                />
                <div className="w-full h-full pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Spacer for layout balance on desktop screens so diamonds stay clear of semi-circle */}
          <div className="hidden lg:block w-28 xl:w-44 2xl:w-52 shrink-0 pointer-events-none" />
        </div>
      </PageContainer>
    </section>
  );
};

export default PromoBanner;
