import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Phone, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { patientAPI, Patient } from "@/lib/api";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const patientSchema = z.object({
  Name: z.string().trim().min(1, "Name is required").max(50, "Name must be less than 50 characters"),
  DOB: z.string().min(1, "Date of birth is required"),
  Phone: z.string().trim().regex(/^\d{10}$/, "Phone must be exactly 10 digits"),
  Height: z.string().min(1, "Height is required").transform((val) => parseInt(val, 10)),
  Weight: z.string().min(1, "Weight is required").transform((val) => parseFloat(val)),
  Address: z.string().trim().min(1, "Address is required").max(100, "Address must be less than 100 characters"),
  Remarks: z.string().max(100, "Remarks must be less than 100 characters").optional(),
});

type PatientFormData = z.infer<typeof patientSchema>;

const Patients = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: patients, isLoading, error } = useQuery<Patient[]>({
    queryKey: ['patients'],
    queryFn: patientAPI.getAll,
  });

  const form = useForm<PatientFormData>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      Name: "",
      DOB: "",
      Phone: "",
      Height: "" as any,
      Weight: "" as any,
      Address: "",
      Remarks: "",
    },
  });

  const createPatientMutation = useMutation({
    mutationFn: patientAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      toast.success("Patient added successfully");
      setIsDialogOpen(false);
      form.reset();
    },
    onError: () => {
      toast.error("Failed to add patient");
    },
  });

  const onSubmit = (data: PatientFormData) => {
    createPatientMutation.mutate(data as any);
  };

  useEffect(() => {
    if (error) toast.error("Failed to load patients");
  }, [error]);

  const filteredPatients = patients?.filter((patient) =>
    patient.Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.Phone.includes(searchTerm)
  ) || [];

  const calculateAge = (dob: string) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between animate-fade-in">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Patients</h1>
            <p className="text-muted-foreground">Manage patient records and information</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-primary hover:opacity-90 transition-opacity shadow-elevated">
                <Plus className="w-4 h-4 mr-2" />
                Add Patient
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Patient</DialogTitle>
                <DialogDescription>
                  Enter patient information to create a new record.
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="Name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="DOB"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date of Birth</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="Phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input placeholder="1234567890" maxLength={10} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="Height"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Height (cm)</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="170" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="Weight"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Weight (kg)</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.1" placeholder="70.5" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="Address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Textarea placeholder="123 Main St, City, State" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="Remarks"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Remarks (Optional)</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Any additional notes..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="bg-gradient-primary hover:opacity-90"
                      disabled={createPatientMutation.isPending}
                    >
                      {createPatientMutation.isPending ? "Adding..." : "Add Patient"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="mb-6 shadow-card animate-fade-in" style={{ animationDelay: "100ms" }}>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search patients by name or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-background border-border"
              />
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading patients...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPatients.map((patient, index) => (
              <Card
                key={patient.patientid}
                className="shadow-card hover:shadow-elevated transition-all duration-300 cursor-pointer animate-fade-in border-border"
                style={{ animationDelay: `${(index + 2) * 100}ms` }}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl font-semibold text-foreground mb-1">
                        {patient.Name}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {calculateAge(patient.DOB)} years old
                      </p>
                    </div>
                    <Badge className="bg-primary text-primary-foreground">
                      Active
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Phone className="w-4 h-4 mr-2 text-primary" />
                    {patient.Phone}
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4 mr-2 text-primary" />
                    DOB: {new Date(patient.DOB).toLocaleDateString()}
                  </div>
                  <div className="pt-3 border-t border-border">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Height:</span>
                        <span className="ml-1 font-medium text-foreground">{patient.Height} cm</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Weight:</span>
                        <span className="ml-1 font-medium text-foreground">{patient.Weight} kg</span>
                      </div>
                    </div>
                  </div>
                  {patient.Remarks && (
                    <div className="pt-2">
                      <p className="text-xs text-muted-foreground">Remarks:</p>
                      <p className="text-sm text-foreground">{patient.Remarks}</p>
                    </div>
                  )}
                  <Button variant="outline" className="w-full mt-4 border-primary text-primary hover:bg-accent">
                    View Details
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!isLoading && filteredPatients.length === 0 && (
          <Card className="shadow-card">
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No patients found matching your search.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Patients;
