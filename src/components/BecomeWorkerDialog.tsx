import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "react-router";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
};

const SERVICE_VALUES: Array<string> = [
  "cleaning",
  "cooking",
  "childcare",
  "elderly_care",
  "driving",
  "pet_care",
];

export default function BecomeWorkerDialog({ open, onOpenChange, onSuccess }: Props) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const createWorker = useMutation(api.workers.createWorkerProfile);

  // Basic form state
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("+91-");
  const [age, setAge] = useState<number>(25);
  const [gender, setGender] = useState<string>("Male");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [pincode, setPincode] = useState("");
  const [categoriesText, setCategoriesText] = useState("cleaning,cooking");
  const [experience, setExperience] = useState<number>(2);
  const [hourlyRate, setHourlyRate] = useState<number>(300);
  const [availabilityText, setAvailabilityText] = useState("Monday,Tuesday,Wednesday,Thursday,Friday");
  const [languagesText, setLanguagesText] = useState("Hindi,English");
  const [governmentId, setGovernmentId] = useState("");
  // Single reference (required by schema as array)
  const [refName, setRefName] = useState("");
  const [refPhone, setRefPhone] = useState("");
  const [refRelation, setRefRelation] = useState("");

  const [submitting, setSubmitting] = useState(false);

  const parseCSV = (str: string): Array<string> =>
    str
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

  const validateCategories = (cats: Array<string>) => cats.every((c) => SERVICE_VALUES.includes(c));

  const resetForm = () => {
    setName("");
    setPhone("+91-");
    setAge(25);
    setGender("Male");
    setAddress("");
    setCity("");
    setPincode("");
    setCategoriesText("cleaning,cooking");
    setExperience(2);
    setHourlyRate(300);
    setAvailabilityText("Monday,Tuesday,Wednesday,Thursday,Friday");
    setLanguagesText("Hindi,English");
    setGovernmentId("");
    setRefName("");
    setRefPhone("");
    setRefRelation("");
  };

  const handleSubmit = async () => {
    if (!isAuthenticated) {
      navigate("/auth");
      return;
    }

    // Basic validations
    if (!name.trim() || !phone.trim() || !address.trim() || !city.trim() || !pincode.trim() || !governmentId.trim()) {
      toast("Please fill all required fields.");
      return;
    }

    const categories = parseCSV(categoriesText);
    if (!validateCategories(categories)) {
      toast("Invalid categories. Use: cleaning, cooking, childcare, elderly_care, driving, pet_care");
      return;
    }

    const availability = parseCSV(availabilityText);
    const languages = parseCSV(languagesText);
    const references = [
      {
        name: refName || "Reference",
        phone: refPhone || "+91-0000000000",
        relationship: refRelation || "Previous Employer",
      },
    ];

    try {
      setSubmitting(true);
      await createWorker({
        name,
        phone,
        age: Number(age),
        gender,
        address,
        city,
        pincode,
        categories: categories as any,
        experience: Number(experience),
        hourlyRate: Number(hourlyRate),
        availability,
        languages,
        governmentId,
        references,
      });
      toast("Worker profile created! Verification pending.");
      resetForm();
      onOpenChange(false);
      onSuccess?.();
    } catch (e: any) {
      toast(e?.message || "Failed to create worker profile.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Become a Worker</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 max-h-[70vh] overflow-auto pr-1">
          {/* Personal */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Full Name</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Phone</label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91-XXXXXXXXXX" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Age</label>
              <Input type="number" min={18} value={age} onChange={(e) => setAge(Number(e.target.value))} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Gender</label>
              <Select value={gender} onValueChange={setGender}>
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Address */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium mb-1">Address</label>
              <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Street, Area" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">City</label>
              <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="City" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Pincode</label>
              <Input value={pincode} onChange={(e) => setPincode(e.target.value)} placeholder="XXXXXX" />
            </div>
          </div>

          {/* Service & Experience */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-3">
              <label className="block text-sm font-medium mb-1">
                Service Categories (comma separated)
              </label>
              <Input
                value={categoriesText}
                onChange={(e) => setCategoriesText(e.target.value)}
                placeholder="cleaning,cooking,childcare"
              />
              <p className="text-xs text-gray-500 mt-1">
                Allowed: cleaning, cooking, childcare, elderly_care, driving, pet_care
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Experience (years)</label>
              <Input type="number" min={0} value={experience} onChange={(e) => setExperience(Number(e.target.value))} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Hourly Rate (₹)</label>
              <Input type="number" min={100} value={hourlyRate} onChange={(e) => setHourlyRate(Number(e.target.value))} />
            </div>
          </div>

          {/* Availability & Languages */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Availability (comma separated)</label>
              <Input
                value={availabilityText}
                onChange={(e) => setAvailabilityText(e.target.value)}
                placeholder="Monday,Tuesday,Friday"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Languages (comma separated)</label>
              <Input
                value={languagesText}
                onChange={(e) => setLanguagesText(e.target.value)}
                placeholder="Hindi,English"
              />
            </div>
          </div>

          {/* Verification */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-3">
              <label className="block text-sm font-medium mb-1">Government ID</label>
              <Input value={governmentId} onChange={(e) => setGovernmentId(e.target.value)} placeholder="AADHAARXXXX" />
            </div>
          </div>

          {/* Reference */}
          <div>
            <div className="text-sm font-medium mb-2">Reference (optional but recommended)</div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input value={refName} onChange={(e) => setRefName(e.target.value)} placeholder="Name" />
              <Input value={refPhone} onChange={(e) => setRefPhone(e.target.value)} placeholder="Phone" />
              <Input value={refRelation} onChange={(e) => setRefRelation(e.target.value)} placeholder="Relationship" />
            </div>
          </div>
        </div>

        <DialogFooter className="mt-4 flex gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Submitting..." : "Create Profile"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
