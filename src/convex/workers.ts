import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getCurrentUser } from "./users";

export const getAllWorkers = query({
  args: {
    city: v.optional(v.string()),
    category: v.optional(v.string()),
    minRating: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let workers;
    
    if (args.city) {
      workers = await ctx.db
        .query("workers")
        .withIndex("by_city", (q) => q.eq("city", args.city!))
        .filter((q) => q.eq(q.field("verificationStatus"), "verified"))
        .filter((q) => q.eq(q.field("isActive"), true))
        .collect();
    } else {
      workers = await ctx.db
        .query("workers")
        .filter((q) => q.eq(q.field("verificationStatus"), "verified"))
        .filter((q) => q.eq(q.field("isActive"), true))
        .collect();
    }

    // Filter by category if provided
    let filteredWorkers = workers;
    if (args.category) {
      filteredWorkers = workers.filter(worker => 
        worker.categories.includes(args.category as any)
      );
    }

    // Filter by minimum rating if provided
    if (args.minRating) {
      filteredWorkers = filteredWorkers.filter(worker => 
        (worker.averageRating || 0) >= args.minRating!
      );
    }

    return filteredWorkers;
  },
});

export const getWorkerById = query({
  args: { workerId: v.id("workers") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.workerId);
  },
});

export const getWorkerReviews = query({
  args: { workerId: v.id("workers") },
  handler: async (ctx, args) => {
    const reviews = await ctx.db
      .query("reviews")
      .withIndex("by_worker", (q) => q.eq("workerId", args.workerId))
      .collect();

    // Get customer details for each review
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

export const createWorkerProfile = mutation({
  args: {
    name: v.string(),
    phone: v.string(),
    age: v.number(),
    gender: v.string(),
    address: v.string(),
    city: v.string(),
    pincode: v.string(),
    categories: v.array(v.string()),
    experience: v.number(),
    hourlyRate: v.number(),
    availability: v.array(v.string()),
    languages: v.array(v.string()),
    governmentId: v.string(),
    references: v.array(v.object({
      name: v.string(),
      phone: v.string(),
      relationship: v.string(),
    })),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("User must be authenticated");
    }

    const workerId = await ctx.db.insert("workers", {
      userId: user._id,
      name: args.name,
      phone: args.phone,
      age: args.age,
      gender: args.gender,
      address: args.address,
      city: args.city,
      pincode: args.pincode,
      categories: args.categories as any,
      experience: args.experience,
      hourlyRate: args.hourlyRate,
      availability: args.availability,
      languages: args.languages,
      governmentId: args.governmentId,
      references: args.references,
      verificationStatus: "pending",
      isActive: true,
    });

    return workerId;
  },
});

export const searchWorkers = query({
  args: {
    searchTerm: v.optional(v.string()),
    city: v.optional(v.string()),
    category: v.optional(v.string()),
    minRating: v.optional(v.number()),
    maxRate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let workers = await ctx.db
      .query("workers")
      .filter((q) => q.eq(q.field("verificationStatus"), "verified"))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    // Apply filters
    if (args.city) {
      workers = workers.filter(worker => worker.city.toLowerCase() === args.city!.toLowerCase());
    }

    if (args.category) {
      workers = workers.filter(worker => 
        worker.categories.includes(args.category as any)
      );
    }

    if (args.minRating) {
      workers = workers.filter(worker => 
        (worker.averageRating || 0) >= args.minRating!
      );
    }

    if (args.maxRate) {
      workers = workers.filter(worker => worker.hourlyRate <= args.maxRate!);
    }

    if (args.searchTerm) {
      const term = args.searchTerm.toLowerCase();
      workers = workers.filter(worker => 
        worker.name.toLowerCase().includes(term) ||
        worker.categories.some(cat => cat.toLowerCase().includes(term)) ||
        worker.languages.some(lang => lang.toLowerCase().includes(term))
      );
    }

    return workers;
  },
});