import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getCurrentUser } from "./users";

export const createReview = mutation({
  args: {
    bookingId: v.id("bookings"),
    rating: v.number(),
    comment: v.optional(v.string()),
    serviceQuality: v.number(),
    punctuality: v.number(),
    professionalism: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("User must be authenticated");
    }

    const booking = await ctx.db.get(args.bookingId);
    if (!booking) {
      throw new Error("Booking not found");
    }

    if (booking.customerId !== user._id) {
      throw new Error("Unauthorized to review this booking");
    }

    if (booking.status !== "completed") {
      throw new Error("Can only review completed bookings");
    }

    // Check if review already exists
    const existingReview = await ctx.db
      .query("reviews")
      .withIndex("by_booking", (q) => q.eq("bookingId", args.bookingId))
      .first();

    if (existingReview) {
      throw new Error("Review already exists for this booking");
    }

    const reviewId = await ctx.db.insert("reviews", {
      bookingId: args.bookingId,
      customerId: user._id,
      workerId: booking.workerId,
      rating: args.rating,
      comment: args.comment,
      serviceQuality: args.serviceQuality,
      punctuality: args.punctuality,
      professionalism: args.professionalism,
    });

    // Update worker's average rating
    await updateWorkerRating(ctx, booking.workerId);

    return reviewId;
  },
});

async function updateWorkerRating(ctx: any, workerId: any) {
  const reviews = await ctx.db
    .query("reviews")
    .withIndex("by_worker", (q: any) => q.eq("workerId", workerId))
    .collect();

  if (reviews.length > 0) {
    const totalRating = reviews.reduce((sum: number, review: any) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length;

    await ctx.db.patch(workerId, {
      averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
      totalReviews: reviews.length,
    });
  }
}

export const getReviewsByWorker = query({
  args: { workerId: v.id("workers") },
  handler: async (ctx, args) => {
    const reviews = await ctx.db
      .query("reviews")
      .withIndex("by_worker", (q) => q.eq("workerId", args.workerId))
      .collect();

    const reviewsWithCustomers = await Promise.all(
      reviews.map(async (review) => {
        const customer = await ctx.db.get(review.customerId);
        return {
          ...review,
          customerName: customer?.name || "Anonymous",
        };
      })
    );

    return reviewsWithCustomers;
  },
});