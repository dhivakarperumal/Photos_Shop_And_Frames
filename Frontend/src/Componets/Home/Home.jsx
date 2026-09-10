import { useEffect, useState } from "react";
import Hero from './Hero';
import CategoryTypes from "./CategoryTypes";
import FrameShowcase from "./FrameShowcase";
import AlbumShowcase from "./AlbumShowcase";
import PromoBanner from "./PromoBanner";
import GiftShowcase from "./GiftShowcase";
import HomeGallery from "./HomeGallery";
import ProductCollection from "./ProductCollection";
import ReviewShowcase from "./ReviewShowcase";
import api from "../../api";

const Home = () => {
  const [frames, setFrames] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    const loadCollections = async () => {
      const [frameResult, productResult, categoryResult, reviewResult] = await Promise.allSettled([
        api.get("/frames?status=Active"),
        api.get("/products"),
        api.get("/categories"),
        api.get("/reviews"),
      ]);
      if (frameResult.status === "fulfilled") setFrames((frameResult.value.data?.data || []).filter((frame) => (frame.status || "Active") === "Active"));
      if (productResult.status === "fulfilled") setProducts((productResult.value.data?.data || []).filter((product) => (product.status || "Active") === "Active"));
      if (categoryResult.status === "fulfilled") setCategories(categoryResult.value.data?.data || []);
      if (reviewResult.status === "fulfilled") setReviews(reviewResult.value.data?.data || []);
    };
    loadCollections();
  }, []);

  return (
    <>
      <Hero />
      <CategoryTypes categories={categories} />
      <FrameShowcase frames={frames} />
      <ProductCollection products={products} />
      <AlbumShowcase />
      <PromoBanner />
      <GiftShowcase />
      <ReviewShowcase reviews={reviews} />
      <HomeGallery />
    </>
  );
};

export default Home;
