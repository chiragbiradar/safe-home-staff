import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { Infer, v } from "convex/values";

// default user roles. can add / remove based on the project as needed
export const ROLES = {
  ADMIN: "admin",
  USER: "user",
  WORKER: "worker",
} as const;

export const roleValidator = v.union(
  v.literal(ROLES.ADMIN),
  v.literal(ROLES.USER),
  v.literal(ROLES.WORKER),
);
export type Role = Infer<typeof roleValidator>;

export const SERVICE_CATEGORIES = {
  CLEANING: "cleaning",
  COOKING: "cooking",
  CHILDCARE: "childcare",
  ELDERLY_CARE: "elderly_care",
  DRIVING: "driving",
  PET_CARE: "pet_care",
} as const;

export const serviceCategoryValidator = v.union(
  v.literal(SERVICE_CATEGORIES.CLEANING),
  v.literal(SERVICE_CATEGORIES.COOKING),
  v.literal(SERVICE_CATEGORIES.CHILDCARE),
  v.literal(SERVICE_CATEGORIES.ELDERLY_CARE),
  v.literal(SERVICE_CATEGORIES.DRIVING),
  v.literal(SERVICE_CATEGORIES.PET_CARE),
);

export const VERIFICATION_STATUS = {
  PENDING: "pending",
  VERIFIED: "verified",
  REJECTED: "rejected",
} as const;

export const verificationStatusValidator = v.union(
  v.literal(VERIFICATION_STATUS.PENDING),
  v.literal(VERIFICATION_STATUS.VERIFIED),
  v.literal(VERIFICATION_STATUS.REJECTED),
);

const schema = defineSchema(
  {
    // default auth tables using convex auth.
    ...authTables, // do not remove or modify

    // the users table is the default users table that is brought in by the authTables
    users: defineTable({
      name: v.optional(v.string()), // name of the user. do not remove
      image: v.optional(v.string()), // image of the user. do not remove
      email: v.optional(v.string()), // email of the user. do not remove
      emailVerificationTime: v.optional(v.number()), // email verification time. do not remove
      isAnonymous: v.optional(v.boolean()), // is the user anonymous. do not remove

      role: v.optional(roleValidator), // role of the user. do not remove
      phone: v.optional(v.string()),
      address: v.optional(v.string()),
      city: v.optional(v.string()),
      pincode: v.optional(v.string()),
    }).index("email", ["email"]), // index for the email. do not remove or modify

    // Workers table for domestic help providers
    workers: defineTable({
      userId: v.id("users"),
      name: v.string(),
      phone: v.string(),
      email: v.optional(v.string()),
      age: v.number(),
      gender: v.string(),
      address: v.string(),
      city: v.string(),
      pincode: v.string(),
      profileImage: v.optional(v.string()),
      
      // Service details
      categories: v.array(serviceCategoryValidator),
      experience: v.number(), // years of experience
      hourlyRate: v.number(),
      availability: v.array(v.string()), // days of week
      languages: v.array(v.string()),
      
      // Verification details
      verificationStatus: verificationStatusValidator,
      governmentId: v.string(),
      policeVerification: v.optional(v.string()),
      references: v.array(v.object({
        name: v.string(),
        phone: v.string(),
        relationship: v.string(),
      })),
      
      // Ratings and reviews
      averageRating: v.optional(v.number()),
      totalReviews: v.optional(v.number()),
      
      isActive: v.boolean(),
    })
      .index("by_city", ["city"])
      .index("by_category", ["categories"])
      .index("by_verification", ["verificationStatus"])
      .index("by_user", ["userId"]),

    // Bookings table
    bookings: defineTable({
      customerId: v.id("users"),
      workerId: v.id("workers"),
      serviceCategory: serviceCategoryValidator,
      startDate: v.string(),
      endDate: v.optional(v.string()),
      startTime: v.string(),
      duration: v.number(), // hours
      totalAmount: v.number(),
      status: v.union(
        v.literal("pending"),
        v.literal("confirmed"),
        v.literal("in_progress"),
        v.literal("completed"),
        v.literal("cancelled")
      ),
      specialInstructions: v.optional(v.string()),
      address: v.string(),
      paymentStatus: v.union(
        v.literal("pending"),
        v.literal("paid"),
        v.literal("refunded")
      ),
    })
      .index("by_customer", ["customerId"])
      .index("by_worker", ["workerId"])
      .index("by_status", ["status"]),

    // Reviews table
    reviews: defineTable({
      bookingId: v.id("bookings"),
      customerId: v.id("users"),
      workerId: v.id("workers"),
      rating: v.number(), // 1-5
      comment: v.optional(v.string()),
      serviceQuality: v.number(),
      punctuality: v.number(),
      professionalism: v.number(),
    })
      .index("by_worker", ["workerId"])
      .index("by_customer", ["customerId"])
      .index("by_booking", ["bookingId"]),

    // Service requests from customers
    serviceRequests: defineTable({
      customerId: v.id("users"),
      serviceCategory: serviceCategoryValidator,
      description: v.string(),
      preferredDate: v.string(),
      preferredTime: v.string(),
      duration: v.number(),
      budget: v.number(),
      address: v.string(),
      city: v.string(),
      pincode: v.string(),
      status: v.union(
        v.literal("open"),
        v.literal("matched"),
        v.literal("closed")
      ),
    })
      .index("by_customer", ["customerId"])
      .index("by_category", ["serviceCategory"])
      .index("by_status", ["status"]),
  },
  {
    schemaValidation: false,
  },
);

export default schema;