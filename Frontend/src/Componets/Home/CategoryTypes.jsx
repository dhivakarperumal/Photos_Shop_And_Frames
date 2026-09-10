import { useRef } from "react";
import { ArrowUpRight, BookImage, ChevronLeft, ChevronRight, Gift, Image } from "lucide-react";
import { Link } from "react-router-dom";
import { API_URL } from "../../api";
import PageContainer from "../../CommonComponents/PageContainer";

const categoryDefinitions = [
  { key: "frame", label: "Frames", icon: Image, path: "/frames" },
  { key: "gift", label: "Gifts", icon: Gift, path: "/gifts" },
  { key: "album", label: "Albums", icon: BookImage, path: "/albums" },
];

const normalizeImageUrl = (value) => {
  if (!value) return "";
  if (/^https?:\/\//i.test(value)) return value;

  const baseUrl = API_URL.replace(/\/api\/?$/, "");
  const relativePath = value.startsWith("/") ? value : `/${value}`;
  return `${baseUrl}${relativePath}`;
};

const CategoryTypes = ({ categories }) => {
  const sliderRef = useRef(null);

  const scrollCategories = (direction = 1) => {
    if (!sliderRef.current) return;
    sliderRef.current.scrollBy({
      left: direction * 260,
      behavior: "smooth",
    });
  };

  return (
    <section className="border-t border-[#30443e] bg-[#14201d] py-7 text-white sm:py-9">
      <PageContainer>
        <div className="flex items-center justify-center gap-3">
          <span className="h-px w-16 bg-[#486057] sm:w-28" />
          <p className="text-base font-bold uppercase tracking-[0.24em] text-[#b07838]">Shop by category</p>
          <span className="h-px w-16 bg-[#486057] sm:w-28" />
        </div>

        <div className="relative mx-auto mt-6">
          <button
            type="button"
            onClick={() => scrollCategories(-1)}
            className="absolute left-0 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-[#d7b77a] bg-[#14201d]/90 text-[#f8ddaa] shadow-lg transition hover:bg-[#b07838] hover:text-white md:flex"
            aria-label="Previous category"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <div ref={sliderRef} className="overflow-x-auto scrollbar-none">
            <div className="mx-auto flex min-w-max justify-center gap-5 sm:gap-10 md:gap-12">
              {categoryDefinitions.map(({ key, label, icon: Icon, path }, index) => {
                const category = categories.find((item) => {
                  const type = String(item.category_type || "").trim().toLowerCase();
                  return (type === key || (key === "album" && type === "albums"))
                    && (item.status || "Active") === "Active";
                });
                const image = normalizeImageUrl(category?.category_image || "");

                return (
                  <Link
                    key={key}
                    to={path}
                    className="group flex w-24 shrink-0 flex-col items-center text-center sm:w-32"
                  >
                    <div className={`flex aspect-square w-full items-center justify-center overflow-hidden rounded-full border-4 border-white bg-cover bg-center shadow-[0_5px_16px_rgba(54,44,34,0.14)] transition duration-300 group-hover:scale-105 group-hover:shadow-[0_8px_22px_rgba(54,44,34,0.2)] ${index % 2 === 0 ? "bg-[#f4e4d1] text-[#a05c2a]" : "bg-[#dfeaf8] text-[#3f7db8]"}`}>
                      {image ? (
                        <img src={image} alt={`${label} category`} className="h-full w-full object-cover" />
                      ) : (
                        <Icon className="h-9 w-9 sm:h-11 sm:w-11" />
                      )}
                    </div>
                    <h3 className="mt-2 text-base font-black text-white sm:text-lg">{label}</h3>
                    <span className="mt-1 inline-flex items-center gap-1 text-[10px] font-bold text-[#d5a65a] sm:text-xs">
                      Explore <ArrowUpRight className="h-4 w-4 transition group-hover:translate-x-1 group-hover:-translate-y-1" />
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>

          <button
            type="button"
            onClick={() => scrollCategories(1)}
            className="absolute right-0 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-[#d7b77a] bg-[#14201d]/90 text-[#f8ddaa] shadow-lg transition hover:bg-[#b07838] hover:text-white md:flex"
            aria-label="Next category"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </PageContainer>
    </section>
  );
};

export default CategoryTypes;