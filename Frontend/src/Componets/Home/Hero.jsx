import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import api from "../../api";
import {
  FiArrowRight,
  FiUpload,
  FiCheckCircle,
  FiTruck,
  FiShield,
  FiImage,
  FiGift,
  FiLayers,
  FiGrid,
  FiCamera,
  FiUser,
  FiBook,
  FiMaximize,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";

const DEFAULT_BANNER = {
  id: "default",
  title: "Turn Your Memories",
  subtitle: "Into Something Beautiful",
  description:
    "Premium photo printing, custom frames, canvas prints and personalized gifts — all in one place.",
  image: "/images/hero-banner.png",
  mobile_image: "",
  link: "/shop",
  type: "hero",
  active: 1,
};

const features = [
  {
    icon: FiCheckCircle,
    title: "Premium Quality",
    subtitle: "High Quality Materials",
  },
  {
    icon: FiTruck,
    title: "Fast Delivery",
    subtitle: "On Time Delivery",
  },
  {
    icon: FiShield,
    title: "Secure Upload",
    subtitle: "Your Photos Safe",
  },
];

const services = [
  {
    icon: FiCamera,
    title: "Photo Printing",
    subtitle: "High Quality Prints",
    link: "/shop",
  },
  {
    icon: FiMaximize,
    title: "Custom Frames",
    subtitle: "Design Your Frame",
    link: "/shop",
  },
  {
    icon: FiImage,
    title: "Canvas Printing",
    subtitle: "Premium Canvas",
    link: "/shop",
  },
  {
    icon: FiBook,
    title: "Photo Albums",
    subtitle: "Save Your Memories",
    link: "/shop",
  },
  {
    icon: FiUser,
    title: "Passport Photos",
    subtitle: "Instant & Trusted",
    link: "/shop",
  },
  {
    icon: FiGift,
    title: "Photo Gifts",
    subtitle: "Personalized Gifts",
    link: "/shop",
  },
  {
    icon: FiLayers,
    title: "Lamination",
    subtitle: "Long Lasting Finish",
    link: "/shop",
  },
  {
    icon: FiGrid,
    title: "Wall Decor",
    subtitle: "Stylish & Modern",
    link: "/shop",
  },
];

const resolveAssetUrl = (url) => {
  if (!url) return "/images/hero-banner.png";
  if (/^(https?:|data:|blob:)/i.test(url)) return url;
  const clean = String(url).replace(/\\/g, "/");
  const path = clean.startsWith("/") ? clean : `/${clean}`;
  const backendUrl = (import.meta.env.VITE_BACKEND_URL || "http://localhost:5000").replace(/\/$/, "");
  return `${backendUrl}${path}`;
};

const Hero = () => {
  const [banners, setBanners] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  // Fetch banners from /api/banners
  const fetchBanners = useCallback(async () => {
    try {
      const response = await api.get("/banners");
      const data = Array.isArray(response.data) ? response.data : [];
      // Filter for active hero banners
      const activeHeroes = data.filter(
        (b) => (b.type === "hero" || !b.type) && (b.active === 1 || b.active === true || b.active === "1")
      );
      setBanners(activeHeroes);
    } catch (error) {
      console.warn("Could not load banners, using fallback hero banner:", error);
      setBanners([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Refetch banners when window regains focus (e.g. after updating in admin tab)
  useEffect(() => {
    fetchBanners();

    const handleFocus = () => {
      fetchBanners();
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [fetchBanners]);

  const heroBanners = useMemo(() => {
    return banners.length > 0 ? banners : [DEFAULT_BANNER];
  }, [banners]);

  // Autoplay carousel if multiple hero banners exist
  useEffect(() => {
    if (heroBanners.length <= 1 || isHovered) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % heroBanners.length);
    }, 6500);

    return () => clearInterval(timer);
  }, [heroBanners.length, isHovered]);

  const currentBanner = heroBanners[currentIndex] || DEFAULT_BANNER;

  const handlePrev = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? heroBanners.length - 1 : prev - 1));
  };

  const handleNext = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % heroBanners.length);
  };

  // Helper to render headline matching screenshot: "Turn Your Memories" + "Into " in dark bold, "Something Beautiful" in cursive
  const renderHeading = (title, subtitle) => {
    const rawTitle = (title || DEFAULT_BANNER.title).trim();
    const rawSubtitle = (subtitle !== undefined && subtitle !== null ? subtitle : DEFAULT_BANNER.subtitle).trim();

    if (rawSubtitle) {
      const lowerSub = rawSubtitle.toLowerCase();
      if (lowerSub.startsWith("into ")) {
        const cursivePart = rawSubtitle.slice(5).trim();
        return (
          <h1 className="max-w-[650px] text-[2.2rem] sm:text-4xl md:text-5xl lg:text-[3.5rem] xl:text-[3.9rem] font-black leading-[1.04] tracking-[-0.04em] text-[#171717]">
            {rawTitle}
            <span className="mt-1 sm:mt-2 block">
              <span className="text-[#171717] font-black">Into </span>
              <span className="font-['Dancing_Script',cursive] text-[#c18d38] font-semibold italic text-[2.3rem] sm:text-4xl md:text-5xl lg:text-[3.5rem] xl:text-[4rem] tracking-normal leading-[1.05]">
                {cursivePart}
              </span>
            </span>
          </h1>
        );
      }

      return (
        <h1 className="max-w-[650px] text-[2.2rem] sm:text-4xl md:text-5xl lg:text-[3.5rem] xl:text-[3.9rem] font-black leading-[1.04] tracking-[-0.04em] text-[#171717]">
          {rawTitle}
          <span className="mt-1 sm:mt-2 block font-['Dancing_Script',cursive] text-[#c18d38] font-semibold italic text-[2.3rem] sm:text-4xl md:text-5xl lg:text-[3.5rem] xl:text-[4rem] tracking-normal leading-[1.05]">
            {rawSubtitle}
          </span>
        </h1>
      );
    }

    // If subtitle is empty, check if title contains "Into "
    const lower = rawTitle.toLowerCase();
    const intoIndex = lower.indexOf("into ");
    if (intoIndex !== -1) {
      const part1 = rawTitle.substring(0, intoIndex).trim();
      const cursivePart = rawTitle.substring(intoIndex + 5).trim();
      return (
        <h1 className="max-w-[650px] text-[2.2rem] sm:text-4xl md:text-5xl lg:text-[3.5rem] xl:text-[3.9rem] font-black leading-[1.04] tracking-[-0.04em] text-[#171717]">
          {part1}
          <span className="mt-1 sm:mt-2 block">
            <span className="text-[#171717] font-black">Into </span>
            <span className="font-['Dancing_Script',cursive] text-[#c18d38] font-semibold italic text-[2.3rem] sm:text-4xl md:text-5xl lg:text-[3.5rem] xl:text-[4rem] tracking-normal leading-[1.05]">
              {cursivePart}
            </span>
          </span>
        </h1>
      );
    }

    return (
      <h1 className="max-w-[650px] text-[2.2rem] sm:text-4xl md:text-5xl lg:text-[3.5rem] xl:text-[3.9rem] font-black leading-[1.04] tracking-[-0.04em] text-[#171717]">
        {rawTitle}
      </h1>
    );
  };

  const imageSrc = resolveAssetUrl(currentBanner.image);

  return (
    <section className="bg-[#f7f4ee] px-3 py-3 sm:px-4 md:py-5">
      {/* PAGE CONTAINER */}
      <div className="page-container mx-auto w-full max-w-[1480px]">
        <div
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="relative overflow-hidden rounded-[24px] bg-[#f8f5ef] px-5 py-7 shadow-xs sm:px-7 md:px-10 md:py-9 lg:px-12 lg:py-10"
        >
          {/* Soft Ambient Background Lighting */}
          <div className="pointer-events-none absolute -left-28 -top-28 h-72 w-72 rounded-full bg-[#d5aa62]/15 blur-3xl" />
          <div className="pointer-events-none absolute -right-28 bottom-0 h-80 w-80 rounded-full bg-[#d5aa62]/15 blur-3xl" />

          {/* ================= HERO MAIN GRID: LEFT CONTENT & RIGHT IMAGE ================= */}
          <div className="relative grid items-center gap-8 lg:grid-cols-12 lg:gap-10 xl:gap-12">
            {/* ================= LEFT CONTENT (lg:col-span-6) ================= */}
            <div className="z-10 lg:col-span-6 xl:col-span-6">
              {/* Category / Quality Tag */}
              <p className="mb-2 sm:mb-3 text-xs sm:text-sm font-black uppercase tracking-[0.22em] text-[#a9782e]">
                Premium Quality
              </p>

              {/* Dynamic Title and Cursive Subtitle */}
              {renderHeading(currentBanner.title, currentBanner.subtitle)}

              {/* Description Paragraph */}
              <p className="mt-4 sm:mt-5 max-w-[580px] text-sm sm:text-base leading-relaxed text-[#555]">
                {currentBanner.description || DEFAULT_BANNER.description}
              </p>

              {/* Action Buttons */}
              <div className="mt-6 sm:mt-7 flex flex-wrap items-center gap-3 sm:gap-4">
                <Link
                  to={currentBanner.link || "/shop"}
                  className="group inline-flex h-12 items-center justify-center gap-3 rounded-lg bg-[#171717] px-6 text-xs sm:text-sm font-bold uppercase tracking-[0.08em] text-white shadow-[0_6px_20px_rgba(0,0,0,0.18)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#272727]"
                >
                  <span>Shop Frames</span>
                  <FiArrowRight className="text-base transition-transform duration-300 group-hover:translate-x-1" />
                </Link>

                <Link
                  to="/shop"
                  className="group inline-flex h-12 items-center justify-center gap-3 rounded-lg border border-[#c99945] bg-[#d5a342] px-6 text-xs sm:text-sm font-bold uppercase tracking-[0.08em] text-white shadow-[0_6px_20px_rgba(190,140,55,0.25)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#c49135]"
                >
                  <span>Upload Your Photo</span>
                  <FiUpload className="text-base transition-transform duration-300 group-hover:-translate-y-0.5" />
                </Link>
              </div>

              {/* Features / Trust Badges */}
              <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-3">
                {features.map(({ icon: Icon, title, subtitle }) => (
                  <div key={title} className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#1b1b1b] bg-white text-[#1b1b1b] shadow-xs">
                      <Icon className="text-base" />
                    </div>

                    <div>
                      <p className="text-xs sm:text-[13px] font-bold text-[#1b1b1b] leading-tight">
                        {title}
                      </p>
                      <p className="mt-0.5 text-[10px] sm:text-[11px] text-[#666] leading-tight">
                        {subtitle}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ================= RIGHT IMAGE & FLOATING DISCOUNT BADGE (lg:col-span-6) ================= */}
            <div className="relative z-10 flex items-center justify-center lg:col-span-6 xl:col-span-6">
              <div className="relative w-full max-w-[560px]">
                {/* Visual Frame / Image Container */}
                <div className="relative overflow-hidden rounded-[22px] bg-white/60 shadow-[0_16px_36px_rgba(0,0,0,0.12)] border border-[#e8dfcf] transition-all duration-500">
                  <img
                    key={currentBanner.id || currentIndex}
                    src={imageSrc}
                    alt={currentBanner.title || "Featured Frame Collection"}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = "/images/hero-banner.png";
                    }}
                    className="w-full h-[260px] sm:h-[340px] md:h-[390px] lg:h-[430px] object-cover object-center transition-all duration-700 hover:scale-[1.01]"
                  />
                </div>

                {/* Floating Discount Circular Badge matching screenshot */}
                <div className="pointer-events-none absolute -top-3 -right-3 sm:top-3 sm:right-3 md:top-4 md:right-4 z-20 flex h-[120px] w-[120px] sm:h-[142px] sm:w-[142px] md:h-[155px] md:w-[155px] items-center justify-center rounded-full border-[2px] border-dashed border-[#cda25b] bg-[#fbf7ee]/95 shadow-[0_10px_25px_rgba(0,0,0,0.1)] backdrop-blur-xs">
                  {/* Small decorative dots on border */}
                  <span className="absolute -left-1 top-6 sm:top-8 h-2 w-2 rounded-full bg-[#cda25b]" />
                  <span className="absolute -right-1 bottom-6 sm:bottom-8 h-2 w-2 rounded-full bg-[#cda25b]" />

                  <div className="text-center px-2">
                    <p className="text-xl sm:text-2xl md:text-[28px] font-black leading-none text-[#1b1b1b]">
                      10% OFF
                    </p>
                    <p className="mt-1 text-[8px] sm:text-[9.5px] md:text-[10.5px] font-black uppercase tracking-[0.14em] text-[#222]">
                      On First Order
                    </p>
                    <p className="mt-1.5 text-[8px] sm:text-[9.5px] font-bold text-[#b17d2f]">
                      Use Code: FIRST10
                    </p>
                  </div>
                </div>

                {/* Carousel Arrow Controls (if multiple active hero banners) */}
                {heroBanners.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={handlePrev}
                      className="absolute left-2 top-1/2 -translate-y-1/2 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white shadow-md backdrop-blur-xs transition hover:bg-black"
                      aria-label="Previous Banner"
                    >
                      <FiChevronLeft size={20} />
                    </button>
                    <button
                      type="button"
                      onClick={handleNext}
                      className="absolute right-2 top-1/2 -translate-y-1/2 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white shadow-md backdrop-blur-xs transition hover:bg-black"
                      aria-label="Next Banner"
                    >
                      <FiChevronRight size={20} />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Carousel Dot Indicators (if multiple banners) */}
          {heroBanners.length > 1 && (
            <div className="mt-4 flex items-center justify-center gap-2">
              {heroBanners.map((b, idx) => (
                <button
                  key={b.id || idx}
                  type="button"
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-2 transition-all duration-300 rounded-full ${
                    idx === currentIndex
                      ? "w-7 bg-[#c18d38]"
                      : "w-2 bg-[#171717]/25 hover:bg-[#171717]/50"
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          )}

          {/* ================= SERVICES BAR ================= */}
          <div className="relative mt-8 overflow-hidden rounded-[20px] bg-[#171717] shadow-[0_12px_30px_rgba(0,0,0,0.18)] md:mt-10">
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8">
              {services.map(({ icon: Icon, title, subtitle, link }, index) => (
                <Link
                  to={link}
                  key={title}
                  className={`
                    group flex min-h-[112px] cursor-pointer flex-col
                    items-center justify-center px-3 py-4 text-center
                    transition-all duration-300
                    hover:bg-[#222]
                    ${
                      index !== services.length - 1
                        ? "border-b border-[#343434] sm:border-r"
                        : ""
                    }
                    ${
                      index === 1 || index === 3 || index === 5
                        ? "sm:border-r"
                        : ""
                    }
                  `}
                >
                  {/* Icon */}
                  <div className="mb-2.5 flex h-10 w-10 items-center justify-center rounded-lg border border-[#b7893e]/70 bg-[#202020] text-[#d3a34d] transition-all duration-300 group-hover:-translate-y-1 group-hover:bg-[#292929]">
                    <Icon className="text-lg" />
                  </div>

                  {/* Title */}
                  <p className="text-[11px] font-bold leading-tight text-[#f2d29a] sm:text-xs">
                    {title}
                  </p>

                  {/* Subtitle */}
                  <p className="mt-1 text-[9px] leading-tight text-[#bdbdbd]">
                    {subtitle}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;