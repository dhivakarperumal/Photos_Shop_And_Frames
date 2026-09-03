import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ImagePlus, Package } from "lucide-react";
import api from "../../api";

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get("/products");
        const rows = Array.isArray(response.data?.data) ? response.data.data : [];
        setProducts(rows.filter((product) => (product.status || "Active") === "Active"));
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <main className="min-h-screen bg-[#f7f3ed] px-4 py-10 md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#b07838]">Q Frame Studio</p>
            <h1 className="mt-2 text-4xl font-black tracking-tight text-[#1d2925]">Shop our frames</h1>
            <p className="mt-2 max-w-xl text-sm text-[#6b6b63]">Beautiful frames made for the photographs you want to keep close.</p>
          </div>
          <span className="hidden items-center gap-2 text-sm font-semibold text-[#5d675f] sm:flex">
            <Package className="h-4 w-4" /> {products.length} products
          </span>
        </div>

        {loading ? (
          <div className="py-20 text-center text-sm text-[#777]">Loading products...</div>
        ) : products.length === 0 ? (
          <div className="rounded-2xl border border-[#e7ded2] bg-white py-20 text-center text-sm text-[#777]">No products available yet.</div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => {
              const variant = product.size_variants?.[0] || {};
              const image = product.product_images?.[0] || product.frame_data?.frame_image;

              return (
                <article key={product.id} className="overflow-hidden rounded-2xl border border-[#e7ded2] bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                  <div className="flex h-64 items-center justify-center bg-[#f3eee7] p-5">
                    {image ? <img src={image} alt={product.product_name} className="h-full w-full object-contain" /> : <ImagePlus className="h-12 w-12 text-[#b9aa98]" />}
                  </div>
                  <div className="p-5">
                    <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#b07838]">{product.category}</p>
                    <h2 className="mt-2 truncate text-lg font-bold text-[#1d2925]">{product.product_name}</h2>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-lg font-black text-[#1a3c36]">₹{variant.offer_price || "--"}</span>
                      {variant.mrp && <span className="text-xs text-[#999] line-through">₹{variant.mrp}</span>}
                    </div>
                    <Link to={`/admin/products/edit/${product.id}`} className="mt-5 flex h-10 items-center justify-center rounded-xl bg-[#1a3c36] text-xs font-bold text-white transition hover:bg-[#235048]">
                      Customize photos
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
};

export default Shop;
