import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import api, { API_URL } from "../../api";
import PageContainer from "../../CommonComponents/PageContainer";
import ProductCard from "../../CommonComponents/ProductCard";
import AlbumCard from "../../CommonComponents/AlbumCard";
import GiftCard from "../../CommonComponents/GiftCard";

const resolveImageUrl = (value) => {
  if (!value || typeof value !== "string") return "";
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (/^(data:|blob:|https?:\/\/)/i.test(trimmed)) return trimmed;
  const cleanPath = trimmed.replace(/\\/g, "/");
  const path = cleanPath.startsWith("/") ? cleanPath : `/${cleanPath}`;
  if (/^\/api\/?$/i.test(API_URL)) return path;
  return `${API_URL.replace(/\/api\/?$/, "")}${path}`;
};

const RelatedProducts = ({
  product,
  album,
  gift,
  item,
  type,
  className = "pb-16 pt-8",
}) => {
  const [relatedItems, setRelatedItems] = useState([]);
  const targetItem = item || album || gift || product;

  const computedType = useMemo(() => {
    if (type) return String(type).toLowerCase();
    if (album) return "album";
    if (gift) return "gift";
    if (product) {
      if (
        product.item_type === "album" ||
        product.total_pages ||
        String(product.category || "").toLowerCase().includes("album")
      ) {
        return "album";
      }
      if (
        product.item_type === "gift" ||
        product.gift_box_id ||
        String(product.category || "").toLowerCase().includes("gift")
      ) {
        return "gift";
      }
      return "frame";
    }
    return "frame";
  }, [type, album, gift, product]);

  useEffect(() => {
    let isCurrent = true;

    const fetchRelated = async () => {
      if (!targetItem) {
        setRelatedItems([]);
        return;
      }

      const currentId = String(
        targetItem.id ||
        targetItem.product_id ||
        targetItem.gift_box_id ||
        ""
      );

      try {
        if (computedType === "album") {
          const response = await api.get("/albums");
          const allAlbums = Array.isArray(response.data?.data) ? response.data.data : [];
          const activeAlbums = allAlbums.filter(
            (a) =>
              String(a.id || a.product_id) !== currentId &&
              String(a.status || "Active").toLowerCase() === "active"
          );

          const currentCat = String(
            targetItem.sub_category || targetItem.category || targetItem.occasion || ""
          ).toLowerCase();

          const sameCategory = activeAlbums.filter((a) => {
            const aCat = String(a.sub_category || a.category || a.occasion || "").toLowerCase();
            return aCat && currentCat && (aCat === currentCat || aCat.includes(currentCat) || currentCat.includes(aCat));
          });

          if (isCurrent) {
            setRelatedItems((sameCategory.length > 0 ? sameCategory : activeAlbums).slice(0, 10));
          }
        } else if (computedType === "gift") {
          const response = await api.get("/gift-boxes");
          const allGifts = Array.isArray(response.data?.data) ? response.data.data : [];
          const activeGifts = allGifts.filter(
            (g) =>
              String(g.id || g.gift_box_id) !== currentId &&
              String(g.stock_status || "").toLowerCase() !== "discontinued"
          );

          const currentCat = String(targetItem.category || targetItem.theme || "").toLowerCase();
          const sameCategory = activeGifts.filter((g) => {
            const gCat = String(g.category || g.theme || "").toLowerCase();
            return gCat && currentCat && gCat === currentCat;
          });

          if (isCurrent) {
            setRelatedItems((sameCategory.length > 0 ? sameCategory : activeGifts).slice(0, 10));
          }
        } else {
          // Frames / Products
          const response = await api.get("/products");
          const products = Array.isArray(response.data?.data) ? response.data.data : [];
          const photoFrames = products.filter(
            (p) =>
              String(p.id) !== currentId &&
              p.frame_data?.photo_slots?.length > 0 &&
              String(p.status || "Active").toLowerCase() === "active"
          );

          const currentCat = String(targetItem.category || "").toLowerCase();
          const sameCategory = photoFrames.filter(
            (p) => String(p.category || "").toLowerCase() === currentCat
          );

          if (isCurrent) {
            setRelatedItems((sameCategory.length > 0 ? sameCategory : photoFrames).slice(0, 10));
          }
        }
      } catch (error) {
        console.error("Fetch related products error:", error);
        if (isCurrent) setRelatedItems([]);
      }
    };

    fetchRelated();

    return () => {
      isCurrent = false;
    };
  }, [targetItem, computedType]);

  const headerInfo = useMemo(() => {
    if (computedType === "album") {
      return {
        subtitle: "Cherish More Memories",
        title: "Related Photo Albums",
        viewAllLink: "/albums",
        viewAllText: "View all albums",
      };
    }
    if (computedType === "gift") {
      return {
        subtitle: "More Surprises",
        title: "Related Gift Boxes",
        viewAllLink: "/gifts",
        viewAllText: "View all gift boxes",
      };
    }
    return {
      subtitle: "More to frame",
      title: "Related photo frames",
      viewAllLink: "/frames",
      viewAllText: "View all frames",
    };
  }, [computedType]);

  if (relatedItems.length === 0) return null;

  return (
    <PageContainer className={className}>
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#b07838]">
            {headerInfo.subtitle}
          </p>
          <h2 className="mt-1 text-2xl font-black text-[#1d2925]">
            {headerInfo.title}
          </h2>
        </div>
        <Link
          to={headerInfo.viewAllLink}
          className="text-xs font-bold text-[#1a3c36] hover:text-[#b07838] transition hover:underline"
        >
          {headerInfo.viewAllText} &rarr;
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
          1280: { slidesPerView: 4.5 },
        }}
        className="!overflow-visible"
      >
        {relatedItems.map((rel) => {
          if (computedType === "album") {
            const albumId = rel.product_id || rel.id;
            return (
              <SwiperSlide key={albumId} className="!h-auto">
                <AlbumCard
                  album={rel}
                  image={resolveImageUrl(rel.thumbnail_image || rel.image)}
                  title={rel.product_name}
                  category={rel.sub_category || rel.occasion || rel.category || "Photo Album"}
                  size={rel.size || "12 x 18 Inches"}
                  pages={rel.total_pages || 40}
                  price={Number(rel.discount_price || rel.selling_price || 0)}
                  originalPrice={Number(rel.selling_price || 0)}
                  href={`/albums/${albumId}`}
                />
              </SwiperSlide>
            );
          }

          if (computedType === "gift") {
            const giftId = rel.gift_box_id || rel.id;
            return (
              <SwiperSlide key={giftId} className="!h-auto">
                <GiftCard
                  gift={rel}
                  image={resolveImageUrl(rel.image)}
                  title={rel.name}
                  category={rel.category || "Gift Box"}
                  size={rel.box_size || "Gift Box"}
                  price={Number(rel.selling_price || rel.mrp || 0)}
                  originalPrice={Number(rel.mrp || 0)}
                  itemCount={rel.gift_items?.length || 0}
                  href={`/gifts/${giftId}`}
                />
              </SwiperSlide>
            );
          }

          return (
            <SwiperSlide key={rel.id} className="!h-auto">
              <ProductCard product={rel} />
            </SwiperSlide>
          );
        })}
      </Swiper>
    </PageContainer>
  );
};

export default RelatedProducts;
