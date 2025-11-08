"use client";

import { useState } from "react";
import Image from "next/image";
import type { Review, RatingDistribution } from "@/lib/profiles";

interface ReviewsSectionProps {
  reviews: Review[];
  averageRating: number;
  totalReviews: number;
  ratingDistribution: RatingDistribution;
}

export default function ReviewsSection({
  reviews,
  averageRating,
  totalReviews,
  ratingDistribution,
}: ReviewsSectionProps) {
  const [filter, setFilter] = useState<"all" | "withPhotos">("all");

  const filteredReviews =
    filter === "withPhotos"
      ? reviews.filter((r) => r.images && r.images.length > 0)
      : reviews;

  const maxCount = Math.max(...Object.values(ratingDistribution));

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`h-4 w-4 ${
              star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "fill-zinc-200 text-zinc-200 dark:fill-zinc-700 dark:text-zinc-700"
            }`}
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) {
      const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
      if (diffInHours === 0) {
        const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
        return `${diffInMinutes}m trước`;
      }
      return `${diffInHours}h trước`;
    } else if (diffInDays < 30) {
      return `${diffInDays} ngày trước`;
    } else if (diffInDays < 365) {
      const months = Math.floor(diffInDays / 30);
      return `${months} tháng trước`;
    } else {
      const years = Math.floor(diffInDays / 365);
      return `${years} năm trước`;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-black dark:text-white">
          Đánh giá & Xếp hạng
        </h2>
        <button className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
          Viết đánh giá
        </button>
      </div>

      {/* Rating Summary */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Average Rating */}
        <div className="text-center">
          <div className="text-5xl font-bold text-black dark:text-white">
            {averageRating.toFixed(1)}
          </div>
          <div className="mt-2 flex justify-center">{renderStars(averageRating)}</div>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            {totalReviews} Tổng số đánh giá
          </p>
        </div>

        {/* Rating Distribution */}
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map((rating) => {
            const count = ratingDistribution[rating as keyof RatingDistribution];
            const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;

            return (
              <div key={rating} className="flex items-center gap-3 text-sm">
                <span className="w-3 text-zinc-700 dark:text-zinc-300">{rating}</span>
                <svg className="h-4 w-4 fill-yellow-400 text-yellow-400" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <div className="flex-1">
                  <div className="h-2 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
                    <div
                      className="h-full bg-yellow-400"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
                <span className="w-8 text-right text-zinc-600 dark:text-zinc-400">
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-4 border-b border-zinc-200 dark:border-zinc-800">
        <button
          onClick={() => setFilter("all")}
          className={`pb-3 text-sm font-medium transition-colors ${
            filter === "all"
              ? "border-b-2 border-black text-black dark:border-white dark:text-white"
              : "text-zinc-600 hover:text-black dark:text-zinc-400 dark:hover:text-white"
          }`}
        >
          Lọc theo xếp hạng:
        </button>
        <button
          onClick={() => setFilter("all")}
          className={`pb-3 text-sm transition-colors ${
            filter === "all"
              ? "font-medium text-black dark:text-white"
              : "text-zinc-600 hover:text-black dark:text-zinc-400 dark:hover:text-white"
          }`}
        >
          Tất cả xếp hạng
        </button>
        <button
          onClick={() => setFilter("withPhotos")}
          className={`pb-3 text-sm transition-colors ${
            filter === "withPhotos"
              ? "font-medium text-black dark:text-white"
              : "text-zinc-600 hover:text-black dark:text-zinc-400 dark:hover:text-white"
          }`}
        >
          Có ảnh
        </button>
      </div>

      {/* Reviews List */}
      <div className="space-y-6">
        {filteredReviews.length === 0 ? (
          <div className="py-12 text-center text-zinc-500 dark:text-zinc-400">
            Chưa có đánh giá nào
          </div>
        ) : (
          filteredReviews.map((review) => (
            <div
              key={review.id}
              className="border-b border-zinc-200 pb-6 last:border-b-0 dark:border-zinc-800"
            >
              {/* Review Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative h-12 w-12 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                    {review.employer_avatar ? (
                      <Image
                        src={review.employer_avatar}
                        alt={review.employer_name || "User"}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-lg font-semibold text-zinc-600 dark:text-zinc-400">
                        {(review.employer_name || "?")[0].toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-black dark:text-white">
                        {review.employer_name || "Anonymous"}
                      </p>
                      {review.is_verified_purchase && (
                        <span className="rounded bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-200">
                          Đã xác minh mua hàng
                        </span>
                      )}
                    </div>
                    <div className="mt-1 flex items-center gap-2">
                      {renderStars(review.rating)}
                      <span className="text-xs text-zinc-500 dark:text-zinc-400">
                        {formatDate(review.created_at)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Review Content */}
              {review.title && (
                <h4 className="mt-3 font-medium text-black dark:text-white">
                  {review.title}
                </h4>
              )}
              {review.comment && (
                <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">
                  {review.comment}
                </p>
              )}

              {/* Review Images */}
              {review.images && review.images.length > 0 && (
                <div className="mt-3 flex gap-2">
                  {review.images.map((image, idx) => (
                    <div
                      key={idx}
                      className="relative h-20 w-20 overflow-hidden rounded-lg"
                    >
                      <Image
                        src={image}
                        alt={`Review image ${idx + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Action Buttons */}
              <div className="mt-4 flex items-center gap-4 text-sm">
                <button className="flex items-center gap-1 text-zinc-600 hover:text-black dark:text-zinc-400 dark:hover:text-white">
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                    />
                  </svg>
                  Hữu ích ({review.helpful_count})
                </button>
                <button className="text-zinc-600 hover:text-black dark:text-zinc-400 dark:hover:text-white">
                  Trả lời
                </button>
                <button className="text-zinc-600 hover:text-black dark:text-zinc-400 dark:hover:text-white">
                  Báo cáo
                </button>
              </div>

              {/* Worker Response */}
              {review.worker_response && (
                <div className="mt-4 rounded-xl bg-zinc-50 p-4 dark:bg-zinc-900/50">
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                      SP
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-black dark:text-white">
                        Phản hồi từ người bán
                      </p>
                      <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-300">
                        {review.worker_response}
                      </p>
                      {review.response_created_at && (
                        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                          {formatDate(review.response_created_at)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Load More */}
      {filteredReviews.length > 0 && (
        <div className="text-center">
          <button className="rounded-xl border border-black/10 px-6 py-3 font-medium text-black transition-all hover:bg-black/5 dark:border-white/15 dark:text-white dark:hover:bg-white/10">
            Xem thêm đánh giá
          </button>
        </div>
      )}
    </div>
  );
}

