import { useMemo, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import PageContainer from "../../CommonComponents/PageContainer";
import ProductCard from "../../CommonComponents/ProductCard";

const ProductCollection = ({ products }) => {
  const [activeFilter, setActiveFilter] = useState("All");

  // Get unique product categories
  const filterOptions = useMemo(() => {
    const categories = new Set();

    products.forEach((product) => {
      if (product.category) {
        categories.add(product.category);
      }
    });

    return ["All", ...Array.from(categories)];
  }, [products]);

  // Filter products
  const filteredProducts = useMemo(() => {
    if (activeFilter === "All") {
      return products.slice(0, 5);
    }

    const filtered = products.filter(
      (product) =>
        (product.category || "").toLowerCase() ===
        activeFilter.toLowerCase()
    );

    return filtered.slice(0, 5);
  }, [products, activeFilter]);

  return (
    <section className="bg-[#14201d] py-16 text-white lg:py-20">
      <PageContainer>

        {/* Header */}
        <div className="relative flex flex-col justify-between gap-5 border-b border-[#486057] pb-7 md:flex-row md:items-center">

          {/* Title */}
          <div className="shrink-0">
            <p className="text-base font-bold uppercase tracking-[0.24em] text-[#d5a65a]">
              The Studio Edit
            </p>
          </div>

          {/* Center Filters */}
          <div className="flex-1 flex items-center justify-center min-w-0">
            <div className="flex items-center justify-center gap-2 overflow-x-auto max-w-full pb-1 scrollbar-none">
              {filterOptions.map((filter) => {
                const isActive =
                  activeFilter.toLowerCase() === filter.toLowerCase();

                return (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => setActiveFilter(filter)}
                    className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold tracking-wide transition-all duration-200 ${
                      isActive
                        ? "bg-[#d5a65a] text-[#14201d] shadow-sm"
                        : "border border-[#486057] bg-[#1b2b26] text-[#c5cec9] hover:border-[#d5a65a] hover:text-[#d5a65a]"
                    }`}
                  >
                    {filter}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Browse Products */}
          <Link
            to="/shop"
            className="group shrink-0 inline-flex items-center justify-center gap-2 text-sm font-bold text-white transition hover:text-[#d5a65a]"
          >
            Browse Products
            <ArrowUpRight className="h-4 w-4 transition duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>

        {/* Products */}
        {filteredProducts.length ? (
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
              />
            ))}
          </div>
        ) : (
          <div className="mt-10 border border-dashed border-[#486057] py-16 text-center text-sm text-[#b9c1bc]">
            No products found in "{activeFilter}".
          </div>
        )}

      </PageContainer>
    </section>
  );
};

export default ProductCollection;

