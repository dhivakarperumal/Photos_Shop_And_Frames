import { Link } from "react-router-dom";
import {
  ArrowRight,
  Globe,
  Phone,
  Sparkles,
} from "lucide-react";
import PageContainer from "../../CommonComponents/PageContainer";

/* =========================================================================
   REPLACE THESE IMAGES WITH YOUR OWN PHOTOS
   You can easily replace these image URLs with your local images
   or pass a custom `images` prop to the PromoBanner component.
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
  // Large circular photo on the right
  heroCircle:
    "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=800&auto=format&fit=crop&q=80",
};

// Reusable diamond card keeping the photo 100% upright
const DiamondCard = ({ img, fallback, isCenter = false }) => (
  <div
    className={`relative w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 overflow-hidden rounded-xs border-2 sm:border-[3px] border-white shadow-xl bg-[#14201d] transition-transform duration-300 hover:scale-105 ${
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
    <section className="relative overflow-hidden bg-[#0a0d0c] py-10 sm:py-14 text-white">
      <PageContainer>
        {/* Main Banner Card */}
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-r from-[#0d1210] via-[#111816] to-[#0a0d0c] border border-white/10 shadow-2xl min-h-[420px] flex flex-col justify-between">
          {/* Subtle Ambient Glow */}
          <div className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full bg-[#d5a65a]/10 blur-3xl" />
          <div className="pointer-events-none absolute right-0 top-1/2 h-96 w-96 -translate-y-1/2 rounded-full bg-[#d5a65a]/10 blur-3xl" />

          {/* Upper Content Area with 3 Balanced Sections: Left Text | Center Diamonds | Right Circle */}
          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-8 xl:gap-12 px-6 sm:px-10 lg:px-12 xl:px-14 pt-8 sm:pt-10 lg:pt-12 pb-16 lg:pb-14">
            
            {/* 1. LEFT COLUMN: Logo, Titles, Description, CTA Button */}
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
              <p className="mt-3.5 text-xs sm:text-sm text-white/70 leading-relaxed">
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

            {/* 2. MIDDLE COLUMN: Perfectly Aligned 5-Diamond Grid */}
            <div className="relative shrink-0 flex items-center justify-center my-4 lg:my-0 lg:mx-auto">
              <div className="relative w-[280px] h-[280px] sm:w-[320px] sm:h-[320px] lg:w-[340px] lg:h-[340px] flex items-center justify-center">
                {/* 3x3 Grid rotated 45 degrees forming an exact geometric cross */}
                <div className="grid grid-cols-3 grid-rows-3 gap-1.5 sm:gap-2 rotate-45 transform">
                  {/* Row 1 */}
                  <div className="w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 pointer-events-none" />
                  <DiamondCard
                    img={photos.diamondTopRight}
                    fallback={DEFAULT_BANNER_PHOTOS.diamondTopRight}
                  />
                  <div className="w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 pointer-events-none" />

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
                  <div className="w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 pointer-events-none" />
                  <DiamondCard
                    img={photos.diamondBottomLeft}
                    fallback={DEFAULT_BANNER_PHOTOS.diamondBottomLeft}
                  />
                  <div className="w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* 3. RIGHT COLUMN: Large Hero Circle with Clear Gap from Diamonds */}
            <div className="relative shrink-0 hidden lg:flex items-center justify-end">
              <div className="relative w-56 h-56 xl:w-72 xl:h-72 rounded-full overflow-hidden border-[5px] border-white/20 shadow-2xl bg-[#14201d] -mr-8 xl:-mr-12">
                <img
                  src={photos.heroCircle}
                  alt="Featured circular showcase"
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.src = DEFAULT_BANNER_PHOTOS.heroCircle;
                  }}
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                />
              </div>
            </div>

          </div>

          {/* BOTTOM GEOMETRIC INFO STRIP */}
          <div className="relative w-full z-20 flex items-end overflow-hidden">
            {/* White Contact Bar with Angled Right Edge */}
            <div
              className="relative bg-white text-[#111816] pl-5 sm:pl-8 pr-12 sm:pr-16 py-3 sm:py-3.5 flex flex-wrap items-center gap-5 sm:gap-8 shadow-md z-10 shrink-0"
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
              className="h-10 sm:h-12 bg-[#d5a65a] -ml-6 w-48 sm:w-64 lg:w-96 shadow-md"
              style={{
                clipPath: "polygon(24px 0, 100% 0, calc(100% - 24px) 100%, 0 100%)",
              }}
            />
          </div>
        </div>
      </PageContainer>
    </section>
  );
};

export default PromoBanner;
