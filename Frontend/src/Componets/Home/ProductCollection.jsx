import { ArrowUpRight, Package } from "lucide-react";
import { Link } from "react-router-dom";
import PageContainer from "../../CommonComponents/PageContainer";
import ProductCard from "../../CommonComponents/ProductCard";

const ProductCollection = ({ products }) => (
  <section className="bg-[#f7f3ed] px-4 py-16 sm:px-8 lg:px-12 lg:py-20">
    <PageContainer>
      <div className="flex flex-col justify-between gap-5 border-b border-[#dfd4c5] pb-7 md:flex-row md:items-end">
        <div><p className="text-xs font-bold uppercase tracking-[0.24em] text-[#b07838]">The studio edit</p><h2 className="mt-3 text-4xl font-black tracking-[-0.04em] text-[#1d2925] sm:text-5xl">Made for the moments between.</h2></div>
        <Link to="/shop" className="inline-flex items-center gap-2 text-sm font-bold text-[#1a3c36] hover:text-[#b07838]">Browse products <ArrowUpRight className="h-4 w-4" /></Link>
      </div>
      {products.length ? <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">{products.slice(0, 5).map((product) => <ProductCard key={product.id} product={product} />)}</div> : <div className="mt-10 border border-dashed border-[#d9cdbc] py-16 text-center text-sm text-[#777]">New studio pieces are being prepared.</div>}
    </PageContainer>
  </section>
);

export default ProductCollection;
