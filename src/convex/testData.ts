import { mutation } from "./_generated/server";

export const seedTestData = mutation({
  args: {},
  handler: async (ctx) => {
    // Create test workers
    const testWorkers = [
      {
        userId: "test-user-1" as any,
        name: "Priya Sharma",
        phone: "+91-9876543210",
        email: "priya@example.com",
        age: 28,
        gender: "Female",
        address: "Andheri West, Mumbai",
        city: "Mumbai",
        pincode: "400058",
        categories: ["cleaning", "cooking"] as any,
        experience: 5,
        hourlyRate: 350,
        availability: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        languages: ["Hindi", "English", "Marathi"],
        verificationStatus: "verified" as any,
        governmentId: "AADHAAR123456789",
        references: [
          {
            name: "Mrs. Gupta",
            phone: "+91-9876543211",
            relationship: "Previous Employer"
          }
        ],
        averageRating: 4.8,
        totalReviews: 25,
        isActive: true,
      },
      {
        userId: "test-user-2" as any,
        name: "Rajesh Kumar",
        phone: "+91-9876543212",
        email: "rajesh@example.com",
        age: 35,
        gender: "Male",
        address: "Connaught Place, Delhi",
        city: "Delhi",
        pincode: "110001",
        categories: ["driving", "elderly_care"] as any,
        experience: 8,
        hourlyRate: 450,
        availability: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        languages: ["Hindi", "English", "Punjabi"],
        verificationStatus: "verified" as any,
        governmentId: "AADHAAR987654321",
        references: [
          {
            name: "Mr. Singh",
            phone: "+91-9876543213",
            relationship: "Previous Employer"
          }
        ],
        averageRating: 4.6,
        totalReviews: 18,
        isActive: true,
      },
      {
        userId: "test-user-3" as any,
        name: "Anita Patel",
        phone: "+91-9876543214",
        email: "anita@example.com",
        age: 32,
        gender: "Female",
        address: "Koramangala, Bangalore",
        city: "Bangalore",
        pincode: "560034",
        categories: ["childcare", "cleaning"] as any,
        experience: 6,
        hourlyRate: 400,
        availability: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        languages: ["English", "Hindi", "Kannada"],
        verificationStatus: "verified" as any,
        governmentId: "AADHAAR456789123",
        references: [
          {
            name: "Mrs. Reddy",
            phone: "+91-9876543215",
            relationship: "Previous Employer"
          }
        ],
        averageRating: 4.9,
        totalReviews: 32,
        isActive: true,
      },
      {
        userId: "test-user-4" as any,
        name: "Mohammed Ali",
        phone: "+91-9876543216",
        email: "mohammed@example.com",
        age: 29,
        gender: "Male",
        address: "Banjara Hills, Hyderabad",
        city: "Hyderabad",
        pincode: "500034",
        categories: ["cooking", "pet_care"] as any,
        experience: 4,
        hourlyRate: 320,
        availability: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        languages: ["Hindi", "English", "Telugu", "Urdu"],
        verificationStatus: "verified" as any,
        governmentId: "AADHAAR789123456",
        references: [
          {
            name: "Dr. Khan",
            phone: "+91-9876543217",
            relationship: "Previous Employer"
          }
        ],
        averageRating: 4.7,
        totalReviews: 15,
        isActive: true,
      },
      {
        userId: "test-user-5" as any,
        name: "Sunita Devi",
        phone: "+91-9876543218",
        email: "sunita@example.com",
        age: 38,
        gender: "Female",
        address: "T. Nagar, Chennai",
        city: "Chennai",
        pincode: "600017",
        categories: ["elderly_care", "cooking"] as any,
        experience: 10,
        hourlyRate: 380,
        availability: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        languages: ["Tamil", "English", "Hindi"],
        verificationStatus: "verified" as any,
        governmentId: "AADHAAR321654987",
        references: [
          {
            name: "Mrs. Iyer",
            phone: "+91-9876543219",
            relationship: "Previous Employer"
          }
        ],
        averageRating: 4.5,
        totalReviews: 28,
        isActive: true,
      }
    ];

    // Insert test workers
    for (const worker of testWorkers) {
      await ctx.db.insert("workers", worker);
    }

    return { message: "Test data seeded successfully", workersCreated: testWorkers.length };
  },
});
