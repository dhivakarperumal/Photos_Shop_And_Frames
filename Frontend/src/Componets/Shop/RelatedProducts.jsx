import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import api from "../../api";
import PageContainer from "../../CommonComponents/PageContainer";
import ProductCard from "../../CommonComponents/ProductCard";

const RelatedProducts = ({ product }) => {
  const [relatedProducts, setRelatedProducts] = useState([]);

  useEffect(() => {
    let isCurrent = true;

    const fetchRelatedProducts = async () => {
      if (!product) {
        setRelatedProducts([]);
        return;
      }

      try {
        const response = await api.get("/products");
        const products = Array.isArray(response.data?.data) ? response.data.data : [];
        const photoFrames = products.filter(
          (item) =>
            String(item.id) !== String(product.id) &&
            item.frame_data?.photo_slots?.length > 0 &&
            String(item.status || "Active").toLowerCase() === "active",
        );
        const sameCategory = photoFrames.filter(
          (item) => String(item.category || "").toLowerCase() === String(product.category || "").toLowerCase(),
        );

        if (isCurrent) {
          setRelatedProducts((sameCategory.length > 0 ? sameCategory : photoFrames).slice(0, 8));
        }
      } catch (error) {
        console.error("Fetch related products error:", error);
        if (isCurrent) setRelatedProducts([]);
      }
    };

    fetchRelatedProducts();

    return () => {
      isCurrent = false;
    };
  }, [product]);

  if (relatedProducts.length === 0) return null;

  return (
    <PageContainer className="pb-16 pt-2">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#b07838]">More to frame</p>
          <h2 className="mt-1 text-2xl font-black text-[#1d2925]">Related photo frames</h2>
        </div>
        <Link to="/frames" className="text-xs font-bold text-[#1a3c36] hover:text-[#b07838]">
          View all frames
        </Link>
      </div>

      <Swiper
        modules={[Navigation]}
        navigation
        spaceBetween={20}
        slidesPerView={1.15}
        breakpoints={{
          640: { slidesPerView: 2 },
          768: { slidesPerView: 3 },
          1024: { slidesPerView: 4 },
          1280: { slidesPerView: 5 },
        }}
        className="!overflow-visible"
      >
        {relatedProducts.map((relatedProduct) => (
          <SwiperSlide key={relatedProduct.id} className="!h-auto">
            <ProductCard product={relatedProduct} />
          </SwiperSlide>
        ))}
      </Swiper>
    </PageContainer>
  );
};

export default RelatedProducts;
