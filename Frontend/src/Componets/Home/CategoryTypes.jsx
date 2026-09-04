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
    <section className="bg-[#f7f3ed] py-12 sm:py-16">
      <PageContainer>
        <div className="flex items-end justify-between border-b border-[#dfd4c5] pb-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#b07838]">Shop by category</p>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-[#1d2925] sm:text-4xl">Made for every memory.</h2>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 justify-items-center gap-8 sm:grid-cols-3">
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
                className="group flex w-full max-w-[220px] flex-col items-center text-center"
              >
                <div className={`flex aspect-square w-full items-center justify-center overflow-hidden rounded-full border-8 border-white shadow-[0_8px_24px_rgba(54,44,34,0.14)] transition duration-300 group-hover:scale-105 group-hover:shadow-[0_12px_30px_rgba(54,44,34,0.2)] ${index % 2 === 0 ? "bg-[#f4e4d1] text-[#a05c2a]" : "bg-[#dfeaf8] text-[#3f7db8]"}`}>
                  {image ? <img src={image} alt={`${label} category`} className="h-full w-full object-cover" /> : <Icon className="h-14 w-14" />}
                </div>
                <h3 className="mt-4 text-2xl font-black text-[#1d2925]">{label}</h3>
                <span className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-[#1a3c36]">
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