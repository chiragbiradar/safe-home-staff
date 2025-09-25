import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { motion } from "framer-motion";
import { Search, Star, MapPin, Clock, Phone, Filter, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";

const SERVICE_CATEGORIES = [
  { value: "cleaning", label: "House Cleaning" },
  { value: "cooking", label: "Cooking" },
  { value: "childcare", label: "Child Care" },
  { value: "elderly_care", label: "Elderly Care" },
  { value: "driving", label: "Driving" },
  { value: "pet_care", label: "Pet Care" },
];

const CITIES = [
  "Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Kolkata", "Pune", "Ahmedabad", "Jaipur", "Lucknow"
];

export default function SearchWorkers() {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [minRating, setMinRating] = useState<number | undefined>();
  const [maxRate, setMaxRate] = useState<number | undefined>();

  const workers = useQuery(api.workers.searchWorkers, {
    searchTerm: searchTerm || undefined,
    city: selectedCity || undefined,
    category: selectedCategory || undefined,
    minRating,
    maxRate,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    navigate("/auth");
    return null;
  }

  const handleBookWorker = (workerId: string) => {
    // Show a toast and redirect to a known route to avoid 404
    toast("Booking flow coming soon. Redirecting to your Dashboard.");
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/dashboard")}
              className="mr-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <img
              src="/logo.svg"
              alt="GharSetGo"
              className="h-8 w-8 cursor-pointer mr-4"
              onClick={() => navigate("/")}
            />
            <h1 className="text-2xl font-bold text-gray-900">Find Domestic Help</h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-sm border p-6 mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search Input */}
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by name, skills, or language..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* City Filter */}
            <Select
              value={selectedCity}
              onValueChange={(value) => setSelectedCity(value === "ALL" ? "" : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select City" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Cities</SelectItem>
                {CITIES.map((city) => (
                  <SelectItem key={city} value={city}>
                    {city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Category Filter */}
            <Select
              value={selectedCategory}
              onValueChange={(value) => setSelectedCategory(value === "ALL" ? "" : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Service Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Services</SelectItem>
                {SERVICE_CATEGORIES.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Rating Filter */}
            <Select
              value={minRating?.toString() || ""}
              onValueChange={(value) => setMinRating(value === "ANY" ? undefined : Number(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Min Rating" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ANY">Any Rating</SelectItem>
                <SelectItem value="4">4+ Stars</SelectItem>
                <SelectItem value="4.5">4.5+ Stars</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Clear Filters */}
          {(searchTerm || selectedCity || selectedCategory || minRating) && (
            <div className="mt-4 flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCity("");
                  setSelectedCategory("");
                  setMinRating(undefined);
                  setMaxRate(undefined);
                }}
              >
                Clear Filters
              </Button>
            </div>
          )}
        </motion.div>

        {/* Results */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {!workers ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-200 rounded"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : workers.length === 0 ? (
            <div className="text-center py-12">
              <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No workers found</h3>
              <p className="text-gray-600">Try adjusting your search criteria or filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {workers.map((worker) => (
                <motion.div
                  key={worker._id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{worker.name}</CardTitle>
                          <CardDescription className="flex items-center space-x-1 mt-1">
                            <MapPin className="h-3 w-3" />
                            <span>{worker.city}</span>
                          </CardDescription>
                        </div>
                        {worker.averageRating && (
                          <div className="flex items-center space-x-1 bg-green-50 px-2 py-1 rounded">
                            <Star className="h-3 w-3 fill-green-500 text-green-500" />
                            <span className="text-sm font-medium text-green-700">
                              {worker.averageRating}
                            </span>
                          </div>
                        )}
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      {/* Services */}
                      <div>
                        <div className="flex flex-wrap gap-1">
                          {worker.categories.slice(0, 3).map((category) => (
                            <Badge key={category} variant="secondary" className="text-xs">
                              {SERVICE_CATEGORIES.find(c => c.value === category)?.label || category}
                            </Badge>
                          ))}
                          {worker.categories.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{worker.categories.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Experience and Rate */}
                      <div className="flex justify-between text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>{worker.experience} years exp.</span>
                        </div>
                        <div className="font-semibold text-gray-900">
                          ₹{worker.hourlyRate}/hour
                        </div>
                      </div>

                      {/* Languages */}
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Languages: </span>
                        {worker.languages.join(", ")}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex space-x-2 pt-2">
                        <Button
                          className="flex-1"
                          onClick={() => handleBookWorker(worker._id)}
                        >
                          Book Now
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            toast("Worker profile coming soon. Redirecting to your Dashboard.");
                            navigate("/dashboard");
                          }}
                        >
                          View Profile
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}