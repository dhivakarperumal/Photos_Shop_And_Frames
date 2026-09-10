import { Calendar, Check, Quote, Star, UserRound } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import { API_URL } from "../../api";
import PageContainer from "../../CommonComponents/PageContainer";

const normalizeAssetUrl = (value) => {
  if (!value) return "";
  if (/^https?:\/\//i.test(value)) return value;

  const baseUrl = API_URL.replace(/\/api\/?$/, "");
  const relativePath = value.startsWith("/") ? value : `/${value}`;
  return `${baseUrl}${relativePath}`;
};

const ReviewShowcase = ({ reviews = [] }) => {
  const activeReviews = reviews.filter((review) => review?.status !== "Inactive");

  return (
    <section className="bg-[#322d29] py-8 text-[#e7efea]">
      <PageContainer>
        <div className="mb-5 flex flex-col items-center text-center">
          <span className="mb-2 h-px w-24 bg-[#b28b58]" />
          <h2 className="text-3xl font-black uppercase tracking-[0.18em] text-[#f8eee5] sm:text-4xl">
            Customer Reviews
          </h2>
          <p className="mt-2 text-sm font-medium text-[#e3d0bd] sm:text-base">
            Loved by happy customers
          </p>
        </div>

        {activeReviews.length ? (
          <div className="relative w-full">
            <style>
              {`
                .review-showcase-swiper {
                  padding: 1.5rem 3rem !important;
                }
                .review-showcase-swiper .swiper-wrapper {
                  align-items: stretch;
                }
                .review-showcase-swiper .swiper-button-next,
                .review-showcase-swiper .swiper-button-prev {
                  color: #173721 !important;
                  background-color: white !important;
                  width: 44px !important;
                  height: 44px !important;
                  border-radius: 50% !important;
                  box-shadow: 0 4px 15px rgba(23,44,30,0.15) !important;
                  margin-top: -22px !important;
                }
                .review-showcase-swiper .swiper-button-next:after,
                .review-showcase-swiper .swiper-button-prev:after {
                  font-size: 18px !important;
                  font-weight: 900 !important;
                }
                .review-showcase-swiper .swiper-button-next {
                  right: 0 !important;
                }
                .review-showcase-swiper .swiper-button-prev {
                  left: 0 !important;
                }
                .review-showcase-swiper .swiper-button-disabled {
                  opacity: 0.4 !important;
                  pointer-events: none !important;
                }

                @media (max-width: 640px) {
                  .review-showcase-swiper {
                    padding: 0 0.5rem !important;
                  }
                  .review-showcase-swiper .swiper-slide article {
                    margin: 0 auto;
                    width: 100%;
                  }
                }
              `}
            </style>
            <Swiper
              modules={[Navigation, Autoplay]}
              // navigation
              autoplay={{ delay: 3500, disableOnInteraction: false }}
              spaceBetween={24}
              slidesPerView={1}
              breakpoints={{
                0: { slidesPerView: 1, spaceBetween: 16 },
                640: { slidesPerView: 1, spaceBetween: 16 },
                768: { slidesPerView: 2, spaceBetween: 20 },
                1024: { slidesPerView: 4, spaceBetween: 24 },
              }}
              className="review-showcase-swiper"
            >
              {activeReviews.map((review, index) => {
                const reviewImage = normalizeAssetUrl(review.review_photo || review.product_image || "");
                const productImage = normalizeAssetUrl(review.product_image || review.review_photo || "");
                const rating = Number(review.rating || 5);
                const reviewer = review.reviewer_name || "Priya Sharma";
                const productName = review.product_name || "Pink Romance Bouquet";
                const date = review.reviewed_at || review.created_at || "2025-08-28T00:00:00.000Z";
                const reviewDate = new Date(date).toLocaleDateString("en-US", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                });

                return (
                  <SwiperSlide key={review.id || review.uuid || `${review.reviewer_name}-${index}`} className="h-auto!">
                    <article
                      className="w-full h-full overflow-hidden rounded-[26px] border border-[#eadfce] bg-[#fffdfb] p-6 shadow-[0_20px_50px_rgba(23,44,30,0.10)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(23,44,30,0.14)]"
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-full border-2 border-[#f4dcb6] bg-[#f5e7d7]">
                          {reviewImage ? (
                            <img src={reviewImage} alt={reviewer} className="h-full w-full object-cover" />
                          ) : (
                            <span className="flex h-full w-full items-center justify-center text-[#173721]">
                              <UserRound className="h-8 w-8" />
                            </span>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <h3 className="text-lg font-extrabold leading-none text-[#1f2937]">
                            {reviewer}
                          </h3>

                          <div className="mt-2 flex items-center gap-1">
                            {Array.from({ length: 5 }).map((_, starIndex) => (
                              <Star
                                key={starIndex}
                                className={`h-4 w-4 ${starIndex < rating ? "fill-[#e5a936] text-[#e5a936]" : "text-[#d3cfc5]"}`}
                              />
                            ))}
                          </div>

                          <div className="mt-2 flex items-center gap-2 text-[12px] font-bold text-[#2a8a5a]">
                            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#dbf1e4]">
                              <Check className="h-3 w-3" />
                            </span>
                            <span>Verified Purchase</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-5 rounded-[22px] border border-[#efe5d9] bg-white p-3">
                        <p className="text-[16px] font-medium leading-7 text-[#344b3e]">
                          “{review.comment || "The bouquet was absolutely beautiful! Fresh flowers, great packing and delivered on time. It made my day extra special!"}”
                        </p>
                      </div>

                      <div className="mt-4 flex items-center gap-4 rounded-2xl border border-[#e5d8c8] bg-[#f8f2ec] p-3">
                        <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-[#e7dcca] bg-white">
                          {productImage ? (
                            <img src={productImage} alt={productName} className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-[#edd8be]">
                              <Quote className="h-8 w-8 text-[#8a5720]" />
                            </div>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <h4 className="text-lg font-black text-[#17251c]">
                            {productName}
                          </h4>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center gap-2 text-[12px] font-bold text-[#6a716b]">
                        <Calendar className="h-4 w-4 text-[#a56e2d]" />
                        <span>{reviewDate}</span>
                      </div>
                    </article>
                  </SwiperSlide>
                );
              })}
            </Swiper>
          </div>
        ) : (
          <div className="rounded-4xl border border-dashed border-[#b28b58] bg-white px-8 py-10 text-center text-sm font-semibold text-[#607062]">
            No customer reviews yet.
          </div>
        )}
      </PageContainer>
    </section>
  );
};

export default ReviewShowcase;
