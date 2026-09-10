import { useEffect, useState } from "react";
import { Mail } from "lucide-react";
import Hero from './Hero';
import CategoryTypes from "./CategoryTypes";
import FrameShowcase from "./FrameShowcase";
import AlbumShowcase from "./AlbumShowcase";
import PromoBanner from "./PromoBanner";
import GiftShowcase from "./GiftShowcase";
import LoveCollageBanner from "./LoveCollageBanner";
import HomeGallery from "./HomeGallery";
import ProductCollection from "./ProductCollection";
import ReviewShowcase from "./ReviewShowcase";
import api from "../../api";

const Home = () => {
  const [frames, setFrames] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (event) => {
    event.preventDefault();

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !trimmedEmail.includes("@")) {
      setSubscribed(false);
      return;
    }

    setSubscribed(true);
    setEmail("");
  };

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
      <LoveCollageBanner />
      <HomeGallery />
      <ReviewShowcase reviews={reviews} />

      <section className="bg-white py-8">
        <div className="mx-auto max-w-7xl px-4">
          <div className="rounded-[26px] border border-[#e9e0d4] bg-white p-5 shadow-[0_16px_40px_rgba(0,0,0,0.08)]">
            <div className="flex flex-col items-center justify-between gap-5 md:flex-row md:gap-4">
              <div className="w-full text-center md:w-auto md:text-left">
                <span className="mb-2 flex items-center justify-center gap-2 text-xs font-black uppercase tracking-[0.22em] text-[#a56e2d] md:justify-start">
                  <Mail className="h-4 w-4" />
                  Stay Updated
                </span>
                <h3 className="text-2xl font-black uppercase leading-tight tracking-[0.12em] text-[#111111]">
                  Join Our Newsletter
                </h3>
                <p className="mt-2 text-sm font-medium leading-relaxed text-[#607062]">
                  Get fresh arrivals, offers and style inspiration.
                </p>
              </div>

              <form onSubmit={handleSubscribe} className="flex w-full max-w-xl flex-col items-stretch gap-3 sm:flex-row sm:items-center md:justify-end">
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="Enter your email"
                  className="h-12 w-full rounded-full border border-[#a88b5a] bg-[#fffdfb] px-4 text-sm font-medium text-[#18291d] outline-none placeholder:text-[#707e73] focus:border-[#e5a936]"
                />
                <button
                  type="submit"
                  className="h-12 rounded-full bg-[#111111] px-7 text-sm font-black uppercase tracking-[0.12em] text-white transition hover:bg-[#3b3b3b] sm:min-w-[150px]"
                >
                  Subscribe
                </button>
              </form>
            </div>

            {subscribed && (
              <div className="mt-4 text-center text-xs font-bold text-[#2a8a5a] md:text-left">
                You are subscribed successfully.
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;
