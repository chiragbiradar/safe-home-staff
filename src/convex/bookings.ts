import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getCurrentUser } from "./users";

export const createBooking = mutation({
  args: {
    workerId: v.id("workers"),
    serviceCategory: v.string(),
    startDate: v.string(),
    startTime: v.string(),
    duration: v.number(),
    address: v.string(),
    specialInstructions: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("User must be authenticated");
    }

    const worker = await ctx.db.get(args.workerId);
    if (!worker) {
      throw new Error("Worker not found");
    }

    const totalAmount = worker.hourlyRate * args.duration;

    const bookingId = await ctx.db.insert("bookings", {
      customerId: user._id,
      workerId: args.workerId,
      serviceCategory: args.serviceCategory as any,
      startDate: args.startDate,
      startTime: args.startTime,
      duration: args.duration,
      totalAmount,
      status: "pending",
      address: args.address,
      paymentStatus: "pending",
      specialInstructions: args.specialInstructions,
    });

    return bookingId;
  },
});

export const getUserBookings = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      return [];
    }

    const bookings = await ctx.db
      .query("bookings")
      .withIndex("by_customer", (q) => q.eq("customerId", user._id))
      .collect();

    // Get worker details for each booking
    const bookingsWithWorkers = await Promise.all(
      bookings.map(async (booking) => {
        const worker = await ctx.db.get(booking.workerId);
        return {
          ...booking,
          worker,
        };
      })
    );

    return bookingsWithWorkers;
  },
});

export const getWorkerBookings = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      return [];
    }

    // Find worker profile for this user
    const worker = await ctx.db
      .query("workers")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();

    if (!worker) {
      return [];
    }

    const bookings = await ctx.db
      .query("bookings")
      .withIndex("by_worker", (q) => q.eq("workerId", worker._id))
      .collect();

    // Get customer details for each booking
    const bookingsWithCustomers = await Promise.all(
      bookings.map(async (booking) => {
        const customer = await ctx.db.get(booking.customerId);
        return {
          ...booking,
          customer,
        };
      })
    );

    return bookingsWithCustomers;
  },
});

export const updateBookingStatus = mutation({
  args: {
    bookingId: v.id("bookings"),
    status: v.union(
      v.literal("confirmed"),
      v.literal("in_progress"),
      v.literal("completed"),
      v.literal("cancelled")
    ),
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

    // Check if user has permission to update this booking
    const isCustomer = booking.customerId === user._id;
    const worker = await ctx.db
      .query("workers")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();
    const isWorker = worker && booking.workerId === worker._id;

    if (!isCustomer && !isWorker) {
      throw new Error("Unauthorized to update this booking");
    }

    await ctx.db.patch(args.bookingId, {
      status: args.status,
    });

    return args.bookingId;
  },
});
