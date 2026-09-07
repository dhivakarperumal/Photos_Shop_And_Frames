import { useState } from "react";
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
   You can replace these URLs with your local assets (e.g., "/images/yourphoto.jpg")
   or pass an `images` prop to the PromoBanner component.
========================================================================= */
export const DEFAULT_BANNER_PHOTOS = {
  // Center diamond
  diamondCenter:
    "https://images.unsplash.com/photo-1519741497674-611481863552?w=600&auto=format&fit=crop&q=80",
  // Top-left diamond
  diamondTopLeft:
    "https://images.unsplash.com/photo-1511895426328-dc8714191300?w=600&auto=format&fit=crop&q=80",
  // Top-right diamond
  diamondTopRight:
    "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&auto=format&fit=crop&q=80",
  // Bottom-left diamond
  diamondBottomLeft:
    "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80",
  // Bottom-right diamond
  diamondBottomRight:
    "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=600&auto=format&fit=crop&q=80",
  // Large circular photo bleeding off the right edge
  heroCircle:
    "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=800&auto=format&fit=crop&q=80",
};

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
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-r from-[#0d1210] via-[#111816] to-[#0a0d0c] border border-white/10 shadow-2xl min-h-[380px] lg:min-h-[420px] flex flex-col justify-between">
          {/* Subtle Ambient Glow */}
          <div className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full bg-[#d5a65a]/10 blur-3xl" />
          <div className="pointer-events-none absolute right-0 top-1/2 h-96 w-96 -translate-y-1/2 rounded-full bg-[#d5a65a]/10 blur-3xl" />

          {/* Upper Grid Area: Left Content + Center Diamonds + Right Circle */}
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 items-center gap-8 p-6 sm:p-10 lg:p-12 pb-24 lg:pb-16">
            {/* LEFT COLUMN: Typography & CTA */}
            <div className="lg:col-span-6 xl:col-span-5 flex flex-col items-start text-left">
              {/* Logo / Badge */}
              <div className="flex items-center gap-2 text-white/80 mb-2">
                <Sparkles className="h-4 w-4 text-[#d5a65a]" />
                <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/70">
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
              <h2 className="mt-1 text-4xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight text-white leading-none font-sans drop-shadow-md">
                {mainTitle}
              </h2>

              {/* Subtitle / Description */}
              <p className="mt-3.5 max-w-md text-xs sm:text-sm text-white/70 leading-relaxed">
                {description}
              </p>

              {/* Order Now CTA Button with Circular Arrow */}
              <div className="mt-6 sm:mt-7">
                <Link
                  to={ctaLink}
                  className="group inline-flex items-center gap-3 rounded-full bg-[#d5a65a] pl-2 pr-5 py-2 text-xs sm:text-sm font-black uppercase tracking-wider text-[#14201d] transition-all duration-300 hover:bg-[#e0b468] hover:shadow-[0_0_20px_rgba(213,166,90,0.4)] hover:scale-105"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-[#14201d] shadow-sm transition-transform duration-300 group-hover:translate-x-0.5">
                    <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                  <span>{ctaText}</span>
                </Link>
              </div>
            </div>

            {/* CENTER & RIGHT COLUMN: Diamond Cluster + Hero Circle */}
            <div className="lg:col-span-6 xl:col-span-7 relative flex items-center justify-center min-h-[300px] sm:min-h-[340px] lg:min-h-[360px]">
              {/* DIAMOND COLLAGE CLUSTER */}
              <div className="relative w-[280px] h-[280px] sm:w-[340px] sm:h-[340px] lg:w-[370px] lg:h-[370px] z-10 shrink-0">
                {/* 1. TOP-LEFT DIAMOND */}
                <div className="absolute top-[8%] left-[22%] -translate-x-1/2 -translate-y-1/2 w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 rotate-45 overflow-hidden border-[3px] border-white shadow-2xl rounded-xs bg-[#1a2320]">
                  <img
                    src={photos.diamondTopLeft}
                    alt="Gallery highlight"
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.src = DEFAULT_BANNER_PHOTOS.diamondTopLeft;
                    }}
                    className="absolute top-1/2 left-1/2 w-[145%] h-[145%] max-w-none -translate-x-1/2 -translate-y-1/2 -rotate-45 object-cover"
                  />
                </div>

                {/* 2. TOP-RIGHT DIAMOND */}
                <div className="absolute top-[18%] left-[72%] -translate-x-1/2 -translate-y-1/2 w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 rotate-45 overflow-hidden border-[3px] border-white shadow-2xl rounded-xs bg-[#1a2320]">
                  <img
                    src={photos.diamondTopRight}
                    alt="Gallery highlight"
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.src = DEFAULT_BANNER_PHOTOS.diamondTopRight;
                    }}
                    className="absolute top-1/2 left-1/2 w-[145%] h-[145%] max-w-none -translate-x-1/2 -translate-y-1/2 -rotate-45 object-cover"
                  />
                </div>

                {/* 3. CENTER HERO DIAMOND */}
                <div className="absolute top-[50%] left-[48%] -translate-x-1/2 -translate-y-1/2 w-28 h-28 sm:w-32 sm:h-32 lg:w-36 lg:h-36 rotate-45 overflow-hidden border-4 border-white shadow-[0_10px_35px_rgba(0,0,0,0.6)] rounded-xs z-20 bg-[#1a2320]">
                  <img
                    src={photos.diamondCenter}
                    alt="Featured framed memory"
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.src = DEFAULT_BANNER_PHOTOS.diamondCenter;
                    }}
                    className="absolute top-1/2 left-1/2 w-[145%] h-[145%] max-w-none -translate-x-1/2 -translate-y-1/2 -rotate-45 object-cover"
                  />
                </div>

                {/* 4. BOTTOM-LEFT DIAMOND */}
                <div className="absolute top-[82%] left-[26%] -translate-x-1/2 -translate-y-1/2 w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 rotate-45 overflow-hidden border-[3px] border-white shadow-2xl rounded-xs z-10 bg-[#1a2320]">
                  <img
                    src={photos.diamondBottomLeft}
                    alt="Gallery highlight"
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.src = DEFAULT_BANNER_PHOTOS.diamondBottomLeft;
                    }}
                    className="absolute top-1/2 left-1/2 w-[145%] h-[145%] max-w-none -translate-x-1/2 -translate-y-1/2 -rotate-45 object-cover"
                  />
                </div>

                {/* 5. BOTTOM-RIGHT DIAMOND */}
                <div className="absolute top-[78%] left-[76%] -translate-x-1/2 -translate-y-1/2 w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 rotate-45 overflow-hidden border-[3px] border-white shadow-2xl rounded-xs z-10 bg-[#1a2320]">
                  <img
                    src={photos.diamondBottomRight}
                    alt="Gallery highlight"
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.src = DEFAULT_BANNER_PHOTOS.diamondBottomRight;
                    }}
                    className="absolute top-1/2 left-1/2 w-[145%] h-[145%] max-w-none -translate-x-1/2 -translate-y-1/2 -rotate-45 object-cover"
                  />
                </div>
              </div>

              {/* FAR-RIGHT LARGE HERO CIRCLE BLEEDING OFF THE EDGE */}
              <div className="hidden md:block absolute -right-16 sm:-right-24 lg:-right-32 top-1/2 -translate-y-1/2 w-64 h-64 sm:w-80 sm:h-80 lg:w-96 lg:h-96 rounded-full overflow-hidden border-[6px] border-white/20 shadow-2xl pointer-events-none">
                <img
                  src={photos.heroCircle}
                  alt="Showcase hero circular display"
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.src = DEFAULT_BANNER_PHOTOS.heroCircle;
                  }}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>

          {/* BOTTOM GEOMETRIC INFO STRIP (MATCHING REFERENCE DESIGN) */}
          <div className="relative w-full z-20">
            {/* Golden wedge accent underneath diamonds */}
            <div
              className="absolute right-[15%] sm:right-[20%] lg:right-[32%] bottom-0 w-36 sm:w-48 lg:w-64 h-12 sm:h-14 bg-[#d5a65a]"
              style={{
                clipPath: "polygon(22% 0, 100% 0, 100% 100%, 0% 100%)",
              }}
            />

            {/* White Contact Bar with Angled Right Edge */}
            <div
              className="relative bg-white text-[#111816] px-5 sm:px-8 py-3.5 sm:py-4 flex flex-wrap items-center gap-6 sm:gap-10 shadow-lg w-full max-w-full sm:max-w-xl"
              style={{
                clipPath: "polygon(0 0, 94% 0, 88% 100%, 0 100%)",
              }}
            >
              {/* Phone */}
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#111816] text-white">
                  <Phone className="h-3.5 w-3.5" />
                </div>
                <span className="text-xs sm:text-sm font-black tracking-tight text-[#111816]">
                  {phoneNumber}
                </span>
              </div>

              {/* Website */}
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#111816] text-white">
                  <Globe className="h-3.5 w-3.5" />
                </div>
                <span className="text-xs sm:text-sm font-bold text-[#374151]">
                  {websiteUrl}
                </span>
              </div>
            </div>
          </div>
        </div>
      </PageContainer>
    </section>
  );
};

export default PromoBanner;
