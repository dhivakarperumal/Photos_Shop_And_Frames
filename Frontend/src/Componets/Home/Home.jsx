import { useEffect, useState } from "react";
import Hero from './Hero';
import FrameShowcase from "./FrameShowcase";
import ProductCollection from "./ProductCollection";
import api from "../../api";

const Home = () => {
  const [frames, setFrames] = useState([]);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const loadCollections = async () => {
      const [frameResult, productResult] = await Promise.allSettled([api.get("/frames?status=Active"), api.get("/products")]);
      if (frameResult.status === "fulfilled") setFrames((frameResult.value.data?.data || []).filter((frame) => (frame.status || "Active") === "Active"));
      if (productResult.status === "fulfilled") setProducts((productResult.value.data?.data || []).filter((product) => (product.status || "Active") === "Active"));
    };
    loadCollections();
  }, []);

  return (
    <>
      <Hero />
      <FrameShowcase frames={frames} />
      <ProductCollection products={products} />
    </>
  );
};

export default Home;
