import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { motion } from "framer-motion";
import { Calendar, Clock, MapPin, Star, User, Phone, Mail } from "lucide-react";
import { useNavigate } from "react-router";
import { toast } from "sonner";

export default function Dashboard() {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const bookings = useQuery(api.bookings.getUserBookings);

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "confirmed": return "bg-blue-100 text-blue-800";
      case "in_progress": return "bg-purple-100 text-purple-800";
      case "completed": return "bg-green-100 text-green-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <img
                src="/logo.svg"
                alt="GharSetGo"
                className="h-8 w-8 cursor-pointer"
                onClick={() => navigate("/")}
              />
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => navigate("/search")}
              >
                Find Help
              </Button>
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-gray-500" />
                <span className="text-sm font-medium">{user.name || user.email}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user.name || "User"}!
          </h2>
          <p className="text-gray-600">
            Manage your bookings and find trusted domestic help services.
          </p>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate("/search")}>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Find Domestic Help</CardTitle>
              <CardDescription>Browse verified workers in your area</CardDescription>
            </CardHeader>
          </Card>
          
          <Card
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => toast("Become a Worker flow is coming soon.")}
          >
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Become a Worker</CardTitle>
              <CardDescription>Join our platform as a service provider</CardDescription>
            </CardHeader>
          </Card>
          
          <Card
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => {
              window.location.href = "tel:+919876543210";
            }}
          >
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Emergency Support</CardTitle>
              <CardDescription>24/7 customer support available</CardDescription>
            </CardHeader>
          </Card>
        </motion.div>

        {/* Recent Bookings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Your Bookings</span>
              </CardTitle>
              <CardDescription>
                Track your current and past service bookings
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!bookings || bookings.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings yet</h3>
                  <p className="text-gray-600 mb-4">Start by finding domestic help services in your area.</p>
                  <Button onClick={() => navigate("/search")}>
                    Find Services
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {bookings.map((booking) => (
                    <motion.div
                      key={booking._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="border rounded-lg p-4 hover:shadow-sm transition-shadow"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-semibold text-lg">{booking.worker?.name}</h4>
                          <p className="text-gray-600 capitalize">{booking.serviceCategory.replace('_', ' ')}</p>
                        </div>
                        <Badge className={getStatusColor(booking.status)}>
                          {booking.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(booking.startDate)}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4" />
                          <span>{booking.startTime} ({booking.duration}h)</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4" />
                          <span className="truncate">{booking.address}</span>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center mt-4">
                        <div className="flex items-center space-x-4">
                          {booking.worker?.averageRating && (
                            <div className="flex items-center space-x-1">
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              <span className="text-sm font-medium">{booking.worker.averageRating}</span>
                            </div>
                          )}
                          <span className="text-lg font-semibold">₹{booking.totalAmount}</span>
                        </div>
                        
                        <div className="flex space-x-2">
                          {booking.worker?.phone && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                if (booking.worker?.phone) {
                                  window.location.href = `tel:${booking.worker.phone}`;
                                } else {
                                  toast("Worker phone not available.");
                                }
                              }}
                            >
                              <Phone className="h-4 w-4 mr-1" />
                              Contact
                            </Button>
                          )}
                          {booking.status === "completed" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => toast("Review flow is coming soon.")}
                            >
                              <Star className="h-4 w-4 mr-1" />
                              Review
                            </Button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}