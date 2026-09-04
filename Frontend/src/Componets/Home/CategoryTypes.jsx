import { BookImage, Gift, Image, Images, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import PageContainer from "../../CommonComponents/PageContainer";

const typeIcons = {
  frame: Image,
  gift: Gift,
  album: BookImage,
  albums: BookImage,
};

const CategoryTypes = ({ categories }) => {
  const categoryTypes = [...new Map(
    categories
      .filter((category) => (category.status || "Active") === "Active")
      .map((category) => [
        String(category.category_type || "").trim().toLowerCase(),
        String(category.category_type || "").trim(),
      ])
      .filter(([key, label]) => key && label)
  ).values()];

  if (!categoryTypes.length) return null;

  return (
    <section className="bg-[#f7f3ed] py-12 sm:py-16">
      <PageContainer>
        <div className="flex flex-col justify-between gap-4 border-b border-[#dfd4c5] pb-6 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#b07838]">Shop by collection</p>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-[#1d2925] sm:text-4xl">Find your kind of keepsake.</h2>
          </div>
          <Link to="/shop" className="inline-flex items-center gap-2 text-sm font-bold text-[#1a3c36] hover:text-[#b07838]">
            View all products <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categoryTypes.map((categoryType, index) => {
            const Icon = typeIcons[categoryType.toLowerCase()] || Images;
            return (
              <Link
                key={categoryType}
                to={`/shop?categoryType=${encodeURIComponent(categoryType)}`}
                className="group relative flex min-h-40 items-end overflow-hidden rounded-2xl border border-[#e4d9ca] bg-white p-6 transition hover:-translate-y-1 hover:border-[#b07838] hover:shadow-lg"
              >
                <div className={`absolute right-5 top-5 flex h-14 w-14 items-center justify-center rounded-2xl ${index % 2 === 0 ? "bg-[#f4e4d1] text-[#a05c2a]" : "bg-[#dfeaf8] text-[#3f7db8]"}`}>
                  <Icon className="h-7 w-7" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#b07838]">Collection</p>
                  <h3 className="mt-2 text-2xl font-black text-[#1d2925]">{categoryType}</h3>
                  <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-[#1a3c36]">
                    Explore collection <ArrowUpRight className="h-4 w-4 transition group-hover:translate-x-1 group-hover:-translate-y-1" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </PageContainer>
    </section>
  );
};

export default CategoryTypes;