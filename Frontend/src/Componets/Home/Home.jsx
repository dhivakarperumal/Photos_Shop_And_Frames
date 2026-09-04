import { useEffect, useState } from "react";
import Hero from './Hero';
import CategoryTypes from "./CategoryTypes";
import FrameShowcase from "./FrameShowcase";
import ProductCollection from "./ProductCollection";
import api from "../../api";

const Home = () => {
  const [frames, setFrames] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const loadCollections = async () => {
      const [frameResult, productResult, categoryResult] = await Promise.allSettled([
        api.get("/frames?status=Active"),
        api.get("/products"),
        api.get("/categories"),
      ]);
      if (frameResult.status === "fulfilled") setFrames((frameResult.value.data?.data || []).filter((frame) => (frame.status || "Active") === "Active"));
      if (productResult.status === "fulfilled") setProducts((productResult.value.data?.data || []).filter((product) => (product.status || "Active") === "Active"));
      if (categoryResult.status === "fulfilled") setCategories(categoryResult.value.data?.data || []);
    };
    loadCollections();
  }, []);

  return (
    <>
      <Hero />
      <CategoryTypes categories={categories} />
      <FrameShowcase frames={frames} />
      <ProductCollection products={products} />
    </>
  );
};

export default Home;
