import React from "react";
import {
  FiArrowRight,
  FiUpload,
  FiCheckCircle,
  FiClock,
  FiShield,
  FiImage,
  FiGift,
  FiLayers,
  FiGrid,
  FiPackage,
  FiCamera,
  FiCreditCard,
  FiUser,
  FiScissors,
  FiMaximize
} from "react-icons/fi";

const features = [
  {
    icon: FiCheckCircle,
    title: "Premium Quality",
    subtitle: "High Quality Materials",
  },
  {
    icon: FiClock,
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
  },
  {
    icon: FiMaximize,
    title: "Custom Frames",
    subtitle: "Design Your Frame",
  },
  {
    icon: FiImage,
    title: "Canvas Printing",
    subtitle: "Premium Canvas",
  },
  {
    icon: FiCreditCard,
    title: "Photo Albums",
    subtitle: "Save Your Memories",
  },
  {
    icon: FiUser,
    title: "Passport Photos",
    subtitle: "Instant & Trusted",
  },
  {
    icon: FiGift,
    title: "Photo Gifts",
    subtitle: "Personalized Gifts",
  },
  {
    icon: FiLayers,
    title: "Lamination",
    subtitle: "Long Lasting Finish",
  },
  {
    icon: FiGrid,
    title: "Wall Decor",
    subtitle: "Stylish & Modern",
  },
];

const Hero = () => {
  return (
    <section className="bg-[#f7f4ee] px-3 py-3 sm:px-4 md:py-5">
      {/* PAGE CONTAINER */}
      <div className="page-container mx-auto w-full max-w-[1480px]">
        <div className="relative overflow-hidden rounded-[24px] bg-[#f8f5ef] px-5 py-7 shadow-sm sm:px-7 md:px-10 md:py-9 lg:px-12 lg:py-10">

          {/* Soft Background Decorations */}
          <div className="pointer-events-none absolute -left-32 -top-32 h-72 w-72 rounded-full bg-[#d5aa62]/10 blur-3xl" />

          <div className="pointer-events-none absolute -right-32 bottom-0 h-80 w-80 rounded-full bg-[#d5aa62]/10 blur-3xl" />

          {/* ================= HERO CONTENT ================= */}
          <div className="relative grid items-center gap-8 lg:grid-cols-[1.15fr_1fr_0.55fr] xl:gap-10">

            {/* ================= LEFT CONTENT ================= */}
            <div className="z-10">

              <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.2em] text-[#a9782e] sm:text-sm">
                Premium Quality
              </p>

              <h1 className="max-w-[650px] text-[2.4rem] font-black leading-[0.95] tracking-[-0.055em] text-[#171717] sm:text-5xl md:text-6xl lg:text-[4.2rem] xl:text-[4.6rem]">
                Turn Your Memories
                <span className="mt-2 block font-light italic tracking-[-0.04em] text-[#c18d38]">
                  Into Something Beautiful
                </span>
              </h1>

              <p className="mt-5 max-w-[620px] text-sm leading-6 text-[#555] sm:text-base sm:leading-7">
                Premium photo printing, custom frames, canvas prints and
                personalized gifts — all in one place.
              </p>

              {/* Buttons */}
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">

                <button
                  type="button"
                  className="group inline-flex h-12 items-center justify-center gap-3 rounded-lg bg-[#171717] px-6 text-xs font-bold uppercase tracking-[0.08em] text-white shadow-[0_8px_20px_rgba(0,0,0,0.15)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#252525]"
                >
                  Shop Frames
                  <FiArrowRight className="text-base transition-transform duration-300 group-hover:translate-x-1" />
                </button>

                <button
                  type="button"
                  className="group inline-flex h-12 items-center justify-center gap-3 rounded-lg border border-[#c99945] bg-[#d5a342] px-6 text-xs font-bold uppercase tracking-[0.08em] text-white shadow-[0_8px_20px_rgba(190,140,55,0.2)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#c49135]"
                >
                  Upload Your Photo
                  <FiUpload className="text-base transition-transform duration-300 group-hover:-translate-y-0.5" />
                </button>

              </div>

              {/* ================= FEATURES ================= */}
              <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-3 sm:gap-3">

                {features.map(({ icon: Icon, title, subtitle }) => (
                  <div
                    key={title}
                    className="flex items-center gap-3"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#222] bg-white text-[#222]">
                      <Icon className="text-base" />
                    </div>

                    <div>
                      <p className="text-xs font-bold text-[#222] sm:text-[13px]">
                        {title}
                      </p>

                      <p className="mt-0.5 text-[10px] text-[#666] sm:text-[11px]">
                        {subtitle}
                      </p>
                    </div>
                  </div>
                ))}

              </div>
            </div>

            {/* ================= FRAME IMAGE ================= */}
            <div className="relative flex items-center justify-center">

              {/* Glow */}
              <div className="absolute h-64 w-64 rounded-full bg-[#cda15d]/10 blur-3xl sm:h-80 sm:w-80" />

              <div className="relative w-full max-w-[390px]">

                {/* Frame Shadow */}
                <div className="absolute inset-x-5 bottom-2 h-8 rounded-full bg-black/20 blur-2xl" />

                {/* Actual Frame */}
                <img
                  src="/assets/family-frame.png"
                  alt="Family Photo Frame"
                  className="relative z-10 mx-auto w-full object-contain drop-shadow-[0_25px_25px_rgba(0,0,0,0.22)]"
                />

              </div>
            </div>

            {/* ================= OFFER ================= */}
            <div className="flex items-center justify-center lg:justify-end">

              <div className="relative flex h-[145px] w-[145px] items-center justify-center rounded-full border-[2px] border-dashed border-[#c99746] bg-[#f9f4e9] shadow-[0_12px_30px_rgba(0,0,0,0.08)] sm:h-[160px] sm:w-[160px]">

                {/* Small decorative dots */}
                <span className="absolute -left-1 top-7 h-2 w-2 rounded-full bg-[#c99746]" />
                <span className="absolute -right-1 bottom-8 h-2 w-2 rounded-full bg-[#c99746]" />

                <div className="text-center">

                  <p className="text-[30px] font-black leading-none text-[#1b1b1b]">
                    10%
                  </p>

                  <p className="mt-1 text-[11px] font-black uppercase tracking-[0.12em] text-[#222]">
                    Off
                  </p>

                  <p className="mt-2 text-[9px] font-semibold uppercase tracking-[0.08em] text-[#666]">
                    On First Order
                  </p>

                  <p className="mt-2 text-[9px] font-bold text-[#b17d2f]">
                    Use Code: FIRST10
                  </p>

                </div>
              </div>
            </div>

          </div>

          {/* ================= SERVICES BAR ================= */}
          <div className="relative mt-8 overflow-hidden rounded-[20px] bg-[#171717] shadow-[0_12px_30px_rgba(0,0,0,0.18)] md:mt-10">

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8">

              {services.map(({ icon: Icon, title, subtitle }, index) => (
                <div
                  key={title}
                  className={`
                    group flex min-h-[112px] cursor-pointer flex-col
                    items-center justify-center px-3 py-4 text-center
                    transition-all duration-300
                    hover:bg-[#222]
                    ${index !== services.length - 1
                      ? "border-b border-[#343434] sm:border-r"
                      : ""
                    }
                    ${index === 1 || index === 3 || index === 5
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

                </div>
              ))}

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Hero;