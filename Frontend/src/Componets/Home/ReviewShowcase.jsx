import { Star, Quote, UserRound } from "lucide-react";
import { API_URL } from "../../api";

const normalizeAssetUrl = (value) => {
  if (!value) return "";
  if (/^https?:\/\//i.test(value)) return value;

  const baseUrl = API_URL.replace(/\/api\/?$/, "");
  const relativePath = value.startsWith("/") ? value : `/${value}`;
  return `${baseUrl}${relativePath}`;
};

const ReviewShowcase = ({ reviews = [] }) => {
  const visibleReviews = reviews.filter((review) => review?.status !== "Inactive").slice(0, 3);

  return (
    <section className="bg-[#fffaf6] py-12 text-[#213729]">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-8 flex flex-col items-center text-center">
          <span className="mb-3 h-px w-28 bg-[#b28b58]" />
          <h2 className="text-3xl font-black uppercase tracking-[0.18em] text-[#173721] sm:text-4xl">
            Customer Reviews
          </h2>
          <p className="mt-3 text-sm font-medium text-[#607062] sm:text-base">
            Loved by happy customers
          </p>
        </div>

        {visibleReviews.length ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {visibleReviews.map((review, index) => {
              const reviewImage = normalizeAssetUrl(review.review_photo || review.product_image || "");
              const rating = Number(review.rating || 5);

              return (
                <article
                  key={review.id || review.uuid || `${review.reviewer_name}-${index}`}
                  className="group overflow-hidden rounded-4xl border border-[#e7ddcf] bg-white shadow-[0_14px_40px_rgba(23,44,30,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(23,44,30,0.16)]"
                >
                  <div className="relative h-56 overflow-hidden bg-[#f8efe8]">
                    {reviewImage ? (
                      <img src={reviewImage} alt={review.product_name || "Customer review"} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-[linear-gradient(135deg,#e9d6bc,#f5eee7)]">
                        <Quote className="h-14 w-14 text-[#a56e2d]" />
                      </div>
                    )}
                    <span className="absolute left-4 top-4 rounded-full bg-white/92 px-3 py-1 text-[11px] font-black uppercase tracking-[0.2em] text-[#4f6a51] shadow-sm">
                      {review.product_name || "Photo Collection"}
                    </span>
                  </div>

                  <div className="p-5">
                    <div className="mb-3 flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, starIndex) => (
                        <Star
                          key={starIndex}
                          className={`h-4 w-4 ${starIndex < rating ? "fill-[#d49737] text-[#d49737]" : "text-[#d3cfc5]"}`}
                        />
                      ))}
                    </div>

                    <h3 className="mb-2 text-base font-black text-[#173721]">
                      {review.title || "Happy Customer"}
                    </h3>

                    <p className="line-clamp-4 min-h-18 text-sm leading-6 text-[#607062]">
                      “{review.comment || "Beautiful product and great experience."}”
                    </p>

                    <div className="mt-5 flex items-center gap-3 border-t border-[#efe5d9] pt-4">
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#13271f] text-white">
                        <UserRound className="h-4 w-4" />
                      </span>
                      <div>
                        <p className="text-sm font-black text-[#173721]">
                          {review.reviewer_name || "Verified Customer"}
                        </p>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#a28459]">
                          {review?.product_code || "Verified Review"}
                        </p>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="rounded-4xl border border-dashed border-[#b28b58] bg-white px-8 py-10 text-center text-sm font-semibold text-[#607062]">
            No customer reviews yet.
          </div>
        )}
      </div>
    </section>
  );
};

export default ReviewShowcase;
