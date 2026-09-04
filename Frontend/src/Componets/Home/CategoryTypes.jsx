import { ArrowUpRight, BookImage, Gift, Image } from "lucide-react";
import { Link } from "react-router-dom";
import PageContainer from "../../CommonComponents/PageContainer";

const categoryDefinitions = [
  { key: "frame", label: "Frames", icon: Image },
  { key: "gift", label: "Gifts", icon: Gift },
  { key: "album", label: "Albums", icon: BookImage },
];

const normalizeImageUrl = (value) => {
  if (!value) return "";
  if (value.startsWith("http://") || value.startsWith("https://")) return value;

  const rawApiUrl = import.meta.env.VITE_API_URL || "/api";
  const baseUrl = rawApiUrl.replace(/\/api\/?$/, "");
  const relativePath = value.startsWith("/") ? value : `/${value}`;
  return `${baseUrl}${relativePath}`;
};

const CategoryTypes = ({ categories }) => {
  return (
    <section className="border-t border-[#30443e] bg-[#14201d] py-7 text-white sm:py-9">
      <PageContainer>
        <div className="flex items-center justify-center gap-3">
          <span className="h-px w-16 bg-[#486057] sm:w-28" />
          <p className="text-base font-bold uppercase tracking-[0.24em] text-[#b07838]">Shop by category</p>
          <span className="h-px w-16 bg-[#486057] sm:w-28" />
        </div>

        <div className="mx-auto mt-6 grid max-w-[560px] grid-cols-3 justify-items-center gap-5 sm:mt-7 sm:gap-10">
          {categoryDefinitions.map(({ key, label, icon: Icon }, index) => {
            const category = categories.find((item) => {
              const type = String(item.category_type || "").trim().toLowerCase();
              return (type === key || (key === "album" && type === "albums"))
                && (item.status || "Active") === "Active";
            });
            const image = normalizeImageUrl(category?.category_image || "");

            return (
              <Link
                key={key}
                to={`/shop?categoryType=${encodeURIComponent(label)}`}
                className="group flex w-24 flex-col items-center text-center sm:w-32"
              >
                <div className={`flex aspect-square w-full items-center justify-center overflow-hidden rounded-full border-4 border-white shadow-[0_5px_16px_rgba(54,44,34,0.14)] transition duration-300 group-hover:scale-105 group-hover:shadow-[0_8px_22px_rgba(54,44,34,0.2)] ${index % 2 === 0 ? "bg-[#f4e4d1] text-[#a05c2a]" : "bg-[#dfeaf8] text-[#3f7db8]"}`}>
                  {image ? <img src={image} alt={`${label} category`} className="h-full w-full object-cover" /> : <Icon className="h-9 w-9 sm:h-11 sm:w-11" />}
                </div>
                <h3 className="mt-2 text-base font-black text-white sm:text-lg">{label}</h3>
                <span className="mt-1 inline-flex items-center gap-1 text-[10px] font-bold text-[#d5a65a] sm:text-xs">
                  Explore <ArrowUpRight className="h-4 w-4 transition group-hover:translate-x-1 group-hover:-translate-y-1" />
                </span>
              </Link>
            );
          })}
        </div>
      </PageContainer>
    </section>
  );
};

export default CategoryTypes;