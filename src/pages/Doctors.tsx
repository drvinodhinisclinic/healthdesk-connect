import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Phone, Award } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { doctorAPI, Doctor } from "@/lib/api";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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

const doctorSchema = z.object({
  Name: z.string().trim().min(1, "Name is required").max(50, "Name must be less than 50 characters"),
  Speciality: z.string().trim().min(1, "Speciality is required").max(50, "Speciality must be less than 50 characters"),
  Phone: z.string().trim().regex(/^\d{10}$/, "Phone must be exactly 10 digits"),
});

type DoctorFormData = z.infer<typeof doctorSchema>;

const Doctors = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: doctors, isLoading, error } = useQuery<Doctor[]>({
    queryKey: ['doctors'],
    queryFn: doctorAPI.getAll,
  });

  const form = useForm<DoctorFormData>({
    resolver: zodResolver(doctorSchema),
    defaultValues: {
      Name: "",
      Speciality: "",
      Phone: "",
    },
  });

  const createDoctorMutation = useMutation({
    mutationFn: doctorAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctors'] });
      toast.success("Doctor added successfully");
      setIsDialogOpen(false);
      form.reset();
    },
    onError: () => {
      toast.error("Failed to add doctor");
    },
  });

  const onSubmit = (data: DoctorFormData) => {
    createDoctorMutation.mutate(data as any);
  };

  useEffect(() => {
    if (error) toast.error("Failed to load doctors");
  }, [error]);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between animate-fade-in">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Doctors</h1>
            <p className="text-muted-foreground">Medical staff directory and information</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-primary hover:opacity-90 transition-opacity shadow-elevated">
                <Plus className="w-4 h-4 mr-2" />
                Add Doctor
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Doctor</DialogTitle>
                <DialogDescription>
                  Enter doctor information to create a new record.
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
                          <Input placeholder="Dr. Jane Smith" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="Speciality"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Speciality</FormLabel>
                        <FormControl>
                          <Input placeholder="Cardiology" {...field} />
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
                      disabled={createDoctorMutation.isPending}
                    >
                      {createDoctorMutation.isPending ? "Adding..." : "Add Doctor"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading doctors...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {doctors?.map((doctor, index) => (
              <Card
                key={doctor.doctorID}
                className="shadow-card hover:shadow-elevated transition-all duration-300 animate-fade-in border-border overflow-hidden"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="h-2 bg-gradient-primary" />
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl font-semibold text-foreground mb-2">
                        {doctor.Name}
                      </CardTitle>
                      <Badge className="bg-secondary text-secondary-foreground">
                        {doctor.Speciality}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Phone className="w-4 h-4 mr-2 text-primary" />
                    {doctor.Phone}
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Award className="w-4 h-4 mr-2 text-primary" />
                    Last updated: {new Date(doctor.lastModified).toLocaleDateString()}
                  </div>
                  <Button variant="outline" className="w-full border-primary text-primary hover:bg-accent">
                    View Schedule
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!isLoading && (!doctors || doctors.length === 0) && (
          <Card className="shadow-card">
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No doctors found in the system.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Doctors;
