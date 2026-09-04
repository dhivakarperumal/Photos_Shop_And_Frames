import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import PageContainer from "../../CommonComponents/PageContainer";
import ProductCard from "../../CommonComponents/ProductCard";

const ProductCollection = ({ products }) => (
  <section className="bg-[#14201d] py-16 text-white lg:py-20">
    <PageContainer>
      <div className="flex flex-col justify-between gap-5 border-b border-[#486057] pb-7 md:flex-row md:items-end">
        <div><p className="text-base font-bold uppercase tracking-[0.24em] text-[#d5a65a]">The studio edit</p></div>
        <Link to="/shop" className="inline-flex items-center gap-2 text-sm font-bold text-white hover:text-[#d5a65a]">Browse products <ArrowUpRight className="h-4 w-4" /></Link>
      </div>
      {products.length ? <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">{products.slice(0, 5).map((product) => <ProductCard key={product.id} product={product} />)}</div> : <div className="mt-10 border border-dashed border-[#486057] py-16 text-center text-sm text-[#b9c1bc]">New studio pieces are being prepared.</div>}
    </PageContainer>
  </section>
);

export default ProductCollection;
