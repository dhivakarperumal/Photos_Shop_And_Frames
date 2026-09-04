import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import { Link } from "react-router-dom";
import api from "../../api";
import PageContainer from "../../CommonComponents/PageContainer";

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
} from "react-icons/fi";

/* =========================================================
   TRUST FEATURES
========================================================= */

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

/* =========================================================
   SERVICES
========================================================= */

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

/* =========================================================
   IMAGE URL
========================================================= */

const resolveAssetUrl = (url) => {
  if (!url) return "";

  const value = String(url).trim();

  if (!value) return "";

  // Already a full URL
  if (/^(https?:|data:|blob:)/i.test(value)) {
    return value;
  }

  // Convert Windows path separators
  const cleanPath = value.replace(/\\/g, "/");

  const path = cleanPath.startsWith("/")
    ? cleanPath
    : `/${cleanPath}`;

  const backendUrl = (
    import.meta.env.VITE_BACKEND_URL ||
    "http://localhost:5000"
  ).replace(/\/$/, "");

  return `${backendUrl}${path}`;
};

/* =========================================================
   BANNER LINK
   Supports both internal and external URLs
========================================================= */

const BannerLink = ({
  to,
  children,
  className = "",
  ...props
}) => {
  const destination = to || "/shop";

  const isExternal =
    /^https?:\/\//i.test(destination);

  if (isExternal) {
    return (
      <a
        href={destination}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
        {...props}
      >
        {children}
      </a>
    );
  }

  return (
    <Link
      to={destination}
      className={className}
      {...props}
    >
      {children}
    </Link>
  );
};

/* =========================================================
   HERO COMPONENT
========================================================= */

const Hero = () => {
  const [banners, setBanners] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  /* =======================================================
     FETCH BANNERS FROM BACKEND
  ======================================================= */

  const fetchBanners = useCallback(async () => {
    try {
      const response = await api.get("/banners");

      const data = Array.isArray(response.data)
        ? response.data
        : [];

      /*
       * ONLY ACTIVE HERO BANNERS
       *
       * No frontend fallback.
       * No default banner.
       */

      const activeHeroBanners = data.filter(
        (banner) => {
          const isHero =
            banner.type === "hero";

          const isActive =
            banner.active === true ||
            banner.active === 1 ||
            banner.active === "1";

          return isHero && isActive;
        }
      );

      setBanners(activeHeroBanners);
    } catch (error) {
      console.error(
        "Failed to load hero banners:",
        error
      );

      setBanners([]);
    } finally {
      setLoading(false);
    }
  }, []);

  /* =======================================================
     INITIAL LOAD
  ======================================================= */

  useEffect(() => {
    fetchBanners();
  }, [fetchBanners]);

  /* =======================================================
     REFRESH WHEN TAB / WINDOW BECOMES ACTIVE
  ======================================================= */

  useEffect(() => {
    const handleFocus = () => {
      fetchBanners();
    };

    const handleVisibilityChange = () => {
      if (
        document.visibilityState === "visible"
      ) {
        fetchBanners();
      }
    };

    window.addEventListener(
      "focus",
      handleFocus
    );

    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange
    );

    return () => {
      window.removeEventListener(
        "focus",
        handleFocus
      );

      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );
    };
  }, [fetchBanners]);

  /* =======================================================
     BACKEND BANNERS ONLY
  ======================================================= */

  const heroBanners = useMemo(() => {
    return banners;
  }, [banners]);

  /* =======================================================
     KEEP CURRENT INDEX VALID
  ======================================================= */

  useEffect(() => {
    setCurrentIndex((previousIndex) => {
      if (heroBanners.length === 0) {
        return 0;
      }

      if (
        previousIndex >=
        heroBanners.length
      ) {
        return 0;
      }

      return previousIndex;
    });
  }, [heroBanners.length]);

  /* =======================================================
     AUTOPLAY
  ======================================================= */

  useEffect(() => {
    if (
      heroBanners.length <= 1
    ) {
      return;
    }

    const timer = setInterval(() => {
      setCurrentIndex((previousIndex) => {
        return (
          (previousIndex + 1) %
          heroBanners.length
        );
      });
    }, 6500);

    return () => {
      clearInterval(timer);
    };
  }, [
    heroBanners.length,
  ]);

  /* =======================================================
     IF NO BACKEND HERO BANNER
     
     DO NOT SHOW ANYTHING.
     
     No fallback.
     No default image.
     No default title.
  ======================================================= */

  if (
    !loading &&
    heroBanners.length === 0
  ) {
    return null;
  }

  /* =======================================================
     CURRENT BANNER
  ======================================================= */

  const currentBanner =
    heroBanners[currentIndex];

  if (!currentBanner) {
    return null;
  }

  /* =======================================================
     HEADING
  ======================================================= */

  const renderHeading = (
    title,
    subtitle
  ) => {
    const rawTitle =
      String(title || "").trim();

    const rawSubtitle =
      String(subtitle || "").trim();

    /*
     * No title from backend =
     * don't create fake frontend title.
     */

    if (!rawTitle && !rawSubtitle) {
      return null;
    }

    /*
     * Subtitle starts with "Into "
     *
     * Example:
     *
     * Title:
     * Turn Your Memories
     *
     * Subtitle:
     * Into Something Beautiful
     */

    if (
      rawSubtitle &&
      rawSubtitle
        .toLowerCase()
        .startsWith("into ")
    ) {
      const cursivePart =
        rawSubtitle
          .slice(5)
          .trim();

      return (
        <h1
          className="
            max-w-[650px]
            text-[2.2rem]
            sm:text-4xl
            md:text-5xl
            lg:text-[3.5rem]
            xl:text-[3.9rem]
            font-black
            leading-[1.04]
            tracking-[-0.04em]
            text-[#171717]
          "
        >
          {rawTitle}

          <span
            className="
              mt-1
              sm:mt-2
              block
            "
          >
            <span
              className="
                text-[#171717]
                font-black
              "
            >
              Into{" "}
            </span>

            <span
              className="
                font-['Dancing_Script',cursive]
                text-[#c18d38]
                font-semibold
                italic
                text-[2.3rem]
                sm:text-4xl
                md:text-5xl
                lg:text-[3.5rem]
                xl:text-[4rem]
                tracking-normal
                leading-[1.05]
              "
            >
              {cursivePart}
            </span>
          </span>
        </h1>
      );
    }

    /*
     * Normal title + subtitle
     */

    return (
      <h1
        className="
          max-w-[650px]
          text-[2.2rem]
          sm:text-4xl
          md:text-5xl
          lg:text-[3.5rem]
          xl:text-[3.9rem]
          font-black
          leading-[1.04]
          tracking-[-0.04em]
          text-[#171717]
        "
      >
        {rawTitle}

        {rawSubtitle && (
          <span
            className="
              mt-1
              sm:mt-2
              block
              font-['Dancing_Script',cursive]
              text-[#c18d38]
              font-semibold
              italic
              text-[2.3rem]
              sm:text-4xl
              md:text-5xl
              lg:text-[3.5rem]
              xl:text-[4rem]
              tracking-normal
              leading-[1.05]
            "
          >
            {rawSubtitle}
          </span>
        )}
      </h1>
    );
  };

  /* =======================================================
     IMAGES
  ======================================================= */

  const desktopImage =
    resolveAssetUrl(
      currentBanner.image
    );

  const mobileImage =
    currentBanner.mobile_image
      ? resolveAssetUrl(
        currentBanner.mobile_image
      )
      : desktopImage;

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <section
      className="
        bg-[#f7f4ee]
        overflow-x-hidden
        px-0
        py-0
      "
    >

      <div
        className="
            relative
            min-w-0
            overflow-x-hidden
            py-6
            sm:py-8
            md:py-10
          "
      >
        <PageContainer>
          {/* =================================================
              AMBIENT BACKGROUND
          ================================================= */}

          <div
            className="
              pointer-events-none
              absolute
              -left-28
              -top-28
              h-72
              w-72
              rounded-full
              bg-[#d5aa62]/15
              blur-3xl
            "
          />

          <div
            className="
              pointer-events-none
              absolute
              -right-28
              bottom-0
              h-80
              w-80
              rounded-full
              bg-[#d5aa62]/15
              blur-3xl
            "
          />

          {/* =================================================
              HERO GRID
          ================================================= */}

          <div
            className="
              relative
              min-w-0
              grid
              items-center
              gap-8
              lg:grid-cols-12
              lg:items-stretch
                  lg:min-h-[560px]
              lg:gap-10
              xl:gap-12
            "
          >
            {/* =================================================
                LEFT CONTENT
            ================================================= */}

            <div
              className="
                z-10
                min-w-0
                lg:col-span-6
                xl:col-span-6
              "
            >
              {/* Premium Quality */}

              <p
                className="
                  mb-2
                  sm:mb-3
                  text-xs
                  sm:text-sm
                  font-black
                  uppercase
                  tracking-[0.22em]
                  text-[#a9782e]
                "
              >
                Premium Quality
              </p>

              {/* Backend Title / Subtitle */}

              {renderHeading(
                currentBanner.title,
                currentBanner.subtitle
              )}

              {/* Backend Description */}

              {currentBanner.description && (
                <p
                  className="
                    mt-4
                    sm:mt-5
                    max-w-[580px]
                    text-sm
                    sm:text-base
                    leading-relaxed
                    text-[#555]
                  "
                >
                  {currentBanner.description}
                </p>
              )}

              {/* =================================================
                  ACTION BUTTONS
              ================================================= */}

              <div
                className="
                  mt-6
                  sm:mt-7
                  flex
                  flex-wrap
                  items-center
                  gap-3
                  sm:gap-4
                "
              >
                {/* Backend Link */}

                <BannerLink
                  to={
                    currentBanner.link ||
                    "/shop"
                  }
                  className="
                    group
                    inline-flex
                      lg:h-[560px]
                    items-center
                    justify-center
                    gap-3
                    rounded-lg
                    bg-[#171717]
                    px-6
                    text-xs
                    sm:text-sm
                    font-bold
                    uppercase
                    tracking-[0.08em]
                    text-white
                    shadow-[0_6px_20px_rgba(0,0,0,0.18)]
                    transition-all
                    duration-300
                    hover:-translate-y-0.5
                    hover:bg-[#272727]
                  "
                >
                  <span>
                    Shop Frames
                  </span>

                  <FiArrowRight
                    className="
                      text-base
                      transition-transform
                      duration-300
                      group-hover:translate-x-1
                    "
                  />
                </BannerLink>

                {/* Upload */}

                <Link
                  to="/shop"
                  className="
                    group
                    inline-flex
                    h-12
                    items-center
                    justify-center
                    gap-3
                    rounded-lg
                    border
                    border-[#c99945]
                    bg-[#d5a342]
                    px-6
                    text-xs
                    sm:text-sm
                    font-bold
                    uppercase
                    tracking-[0.08em]
                    text-white
                    shadow-[0_6px_20px_rgba(190,140,55,0.25)]
                    transition-all
                    duration-300
                    hover:-translate-y-0.5
                    hover:bg-[#c49135]
                  "
                >
                  <span>
                    Upload Your Photo
                  </span>

                  <FiUpload
                    className="
                      text-base
                      transition-transform
                      duration-300
                      group-hover:-translate-y-0.5
                    "
                  />
                </Link>
              </div>

              {/* =================================================
                  TRUST FEATURES
              ================================================= */}

              <div
                className="
                  mt-8
                  grid
                  grid-cols-1
                  gap-4
                  sm:grid-cols-3
                  sm:gap-3
                "
              >
                {features.map(
                  ({
                    icon: Icon,
                    title,
                    subtitle,
                  }) => (
                    <div
                      key={title}
                      className="
                        flex
                        items-center
                        gap-3
                      "
                    >
                      <div
                        className="
                          flex
                          h-9
                          w-9
                          shrink-0
                          items-center
                          justify-center
                          rounded-full
                          border
                          border-[#1b1b1b]
                          bg-white
                          text-[#1b1b1b]
                          shadow-xs
                        "
                      >
                        <Icon
                          className="text-base"
                        />
                      </div>

                      <div>
                        <p
                          className="
                            text-xs
                            sm:text-[13px]
                            font-bold
                            leading-tight
                            text-[#1b1b1b]
                          "
                        >
                          {title}
                        </p>

                        <p
                          className="
                            mt-0.5
                            text-[10px]
                            sm:text-[11px]
                            leading-tight
                            text-[#666]
                          "
                        >
                          {subtitle}
                        </p>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* =================================================
                RIGHT IMAGE
            ================================================= */}

            <div
              className="
                relative
                z-10
                flex
                min-w-0
                h-[250px]
                items-center
                justify-center
                sm:h-[360px]
                lg:col-span-6
                lg:h-[420px]
                xl:col-span-6
              "
            >
              <div
                className="
                  relative
                  w-full
                  self-stretch
                "
              >
                {/* Image */}

                <div
                  className="
                    relative
                    h-full
                    overflow-hidden
                    rounded-[24px]
                  "
                >
                    <picture className="block h-full">
                    {/* Mobile Banner */}

                    {mobileImage && (
                      <source
                        media="(max-width: 767px)"
                        srcSet={mobileImage}
                      />
                    )}

                    {/* Desktop Banner */}

                    {desktopImage && (
                      <img
                        key={
                          currentBanner.id ||
                          currentIndex
                        }
                        src={desktopImage}
                        alt={
                          currentBanner.title ||
                          "Hero Banner"
                        }
                        onError={(
                          event
                        ) => {
                          /*
                           * IMPORTANT:
                           * Do NOT replace with a
                           * frontend fallback image.
                           *
                           * If backend image fails,
                           * simply hide broken image.
                           */

                          event.currentTarget.style.display =
                            "none";
                        }}
                        className="
                          block
                          max-w-full
                          w-full
                          h-full
                          object-cover
                          object-center
                          hero-banner-transition
                        "
                      />
                    )}
                  </picture>
                </div>

                {/* =================================================
                    DISCOUNT BADGE
                ================================================= */}

                {/* <div
                  className="
                    pointer-events-none
                    absolute
                    -top-3
                    -right-3
                    sm:top-3
                    sm:right-3
                    md:top-4
                    md:right-4
                    z-20
                    flex
                    h-[120px]
                    w-[120px]
                    sm:h-[142px]
                    sm:w-[142px]
                    md:h-[155px]
                    md:w-[155px]
                    items-center
                    justify-center
                    rounded-full
                    border-[2px]
                    border-dashed
                    border-[#cda25b]
                    bg-[#fbf7ee]/95
                    shadow-[0_10px_25px_rgba(0,0,0,0.1)]
                    backdrop-blur-xs
                  "
                >
                  <span
                    className="
                      absolute
                      -left-1
                      top-6
                      sm:top-8
                      h-2
                      w-2
                      rounded-full
                      bg-[#cda25b]
                    "
                  />

                  <span
                    className="
                      absolute
                      -right-1
                      bottom-6
                      sm:bottom-8
                      h-2
                      w-2
                      rounded-full
                      bg-[#cda25b]
                    "
                  />

                  <div
                    className="
                      px-2
                      text-center
                    "
                  >
                    <p
                      className="
                        text-xl
                        sm:text-2xl
                        md:text-[28px]
                        font-black
                        leading-none
                        text-[#1b1b1b]
                      "
                    >
                      10% OFF
                    </p>

                    <p
                      className="
                        mt-1
                        text-[8px]
                        sm:text-[9.5px]
                        md:text-[10.5px]
                        font-black
                        uppercase
                        tracking-[0.14em]
                        text-[#222]
                      "
                    >
                      On First Order
                    </p>

                    <p
                      className="
                        mt-1.5
                        text-[8px]
                        sm:text-[9.5px]
                        md:text-[10.5px]
                        font-bold
                        text-[#b17d2f]
                      "
                    >
                      Use Code: FIRST10
                    </p>
                  </div>
                </div> */}

              </div>
            </div>
          </div>

          {/* =================================================
              SERVICES BAR
          ================================================= */}

          <div
            className="
              relative
              mt-8
              overflow-hidden
              rounded-[20px]
              bg-[#171717]
              shadow-[0_12px_30px_rgba(0,0,0,0.18)]
              md:mt-10
            "
          >
            <div
              className="
                grid
                grid-cols-2
                sm:grid-cols-4
                lg:grid-cols-8
              "
            >
              {services.map(
                (
                  {
                    icon: Icon,
                    title,
                    subtitle,
                    link,
                  },
                  index
                ) => (
                  <Link
                    to={link}
                    key={title}
                    className={`
                      group
                      flex
                      min-h-[112px]
                      cursor-pointer
                      flex-col
                      items-center
                      justify-center
                      px-3
                      py-4
                      text-center
                      transition-all
                      duration-300
                      hover:bg-[#222]

                      ${index !==
                        services.length - 1
                        ? "border-b border-[#343434] sm:border-r"
                        : ""
                      }

                      ${index === 1 ||
                        index === 3 ||
                        index === 5
                        ? "sm:border-r"
                        : ""
                      }
                    `}
                  >
                    <div
                      className="
                        mb-2.5
                        flex
                        h-10
                        w-10
                        items-center
                        justify-center
                        rounded-lg
                        border
                        border-[#b7893e]/70
                        bg-[#202020]
                        text-[#d3a34d]
                        transition-all
                        duration-300
                        group-hover:-translate-y-1
                        group-hover:bg-[#292929]
                      "
                    >
                      <Icon className="text-lg" />
                    </div>

                    <p
                      className="
                        text-[11px]
                        font-bold
                        leading-tight
                        text-[#f2d29a]
                        sm:text-xs
                      "
                    >
                      {title}
                    </p>

                    <p
                      className="
                        mt-1
                        text-[9px]
                        leading-tight
                        text-[#bdbdbd]
                      "
                    >
                      {subtitle}
                    </p>
                  </Link>
                )
              )}
            </div>
          </div>
        </PageContainer>
      </div>

    </section>
  );
};

export default Hero;

