import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Calendar, DollarSign, FileText, Image as ImageIcon, CheckCircle2 } from "lucide-react";
import { visitAPI, Visit, patientAPI, doctorAPI, locationAPI, visitTypeAPI } from "@/lib/api";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const visitSchema = z.object({
  patientID: z.string().min(1, "Patient is required"),
  doctorID: z.string().min(1, "Doctor is required"),
  clinicLocationID: z.string().min(1, "Location is required"),
  visitTypeID: z.string().min(1, "Visit type is required"),
  DoctorNotes: z.string().min(1, "Doctor notes are required"),
  Followup: z.string().optional(),
  Fee: z.string().min(1, "Fee is required").transform((val) => parseFloat(val)),
  prescriptionImage1: z.any().optional(),
  prescriptionImage2: z.any().optional(),
});

type VisitFormData = z.infer<typeof visitSchema>;

const Visits = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedVisit, setSelectedVisit] = useState<Visit | null>(null);
  const queryClient = useQueryClient();

  const { data: visits, isLoading, error } = useQuery<Visit[]>({
    queryKey: ['visits'],
    queryFn: visitAPI.getAll,
  });

  const { data: patients } = useQuery({
    queryKey: ['patients'],
    queryFn: patientAPI.getAll,
  });

  const { data: doctors } = useQuery({
    queryKey: ['doctors'],
    queryFn: doctorAPI.getAll,
  });

  const { data: locations } = useQuery({
    queryKey: ['locations'],
    queryFn: locationAPI.getAll,
  });

  const { data: visitTypes, isLoading: isLoadingVisitTypes, error: visitTypesError } = useQuery({
    queryKey: ['visitTypes'],
    queryFn: visitTypeAPI.getAll,
  });

  // Debug: Log visit types data
  useEffect(() => {
    console.log('Visit Types Data:', visitTypes);
    console.log('Visit Types Loading:', isLoadingVisitTypes);
    console.log('Visit Types Error:', visitTypesError);
  }, [visitTypes, isLoadingVisitTypes, visitTypesError]);

  const form = useForm<VisitFormData>({
    resolver: zodResolver(visitSchema),
    defaultValues: {
      patientID: "",
      doctorID: "",
      clinicLocationID: "",
      visitTypeID: "1",
      DoctorNotes: "",
      Followup: "",
      Fee: "" as any,
    },
  });

  const createVisitMutation = useMutation({
    mutationFn: visitAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['visits'] });
      toast.success("Visit added successfully");
      setIsDialogOpen(false);
      form.reset();
    },
    onError: () => {
      toast.error("Failed to add visit");
    },
  });

  const onSubmit = async (data: VisitFormData) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (key === 'prescriptionImage1' || key === 'prescriptionImage2') {
        if (data[key] && data[key][0]) {
          formData.append(key, data[key][0]);
        }
      } else {
        formData.append(key, data[key]);
      }
    });
    createVisitMutation.mutate(formData as any);
  };

  const markCompletedMutation = useMutation({
    mutationFn: (id: number) => visitAPI.update(id, { isCompleted: true } as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['visits'] });
      toast.success("Visit marked as completed");
    },
    onError: () => {
      toast.error("Failed to mark visit as completed");
    },
  });

  useEffect(() => {
    if (error) toast.error("Failed to load visits");
  }, [error]);

  const getStatusFromDate = (followupDate: string) => {
    const today = new Date();
    const followup = new Date(followupDate);
    return followup > today ? "Scheduled" : "Completed";
  };

  const getStatusColor = (status: string) => {
    return status === "Completed" 
      ? "bg-primary text-primary-foreground" 
      : "bg-secondary text-secondary-foreground";
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between animate-fade-in">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Visits</h1>
            <p className="text-muted-foreground">Track patient visits and appointments</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-primary hover:opacity-90 transition-opacity shadow-elevated">
                <Plus className="w-4 h-4 mr-2" />
                New Visit
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Visit</DialogTitle>
                <DialogDescription>
                  Record a new patient visit with details.
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="patientID"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Patient</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select patient" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {patients?.map((patient) => (
                                <SelectItem key={patient.patientid} value={patient.patientid.toString()}>
                                  {patient.Name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="doctorID"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Doctor</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select doctor" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {doctors?.map((doctor) => (
                                <SelectItem key={doctor.doctorID} value={doctor.doctorID.toString()}>
                                  {doctor.Name} - {doctor.Speciality}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="clinicLocationID"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Clinic Location</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select location" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {locations?.map((location) => (
                                <SelectItem key={location.LocationID} value={location.LocationID.toString()}>
                                  {location.LocationName}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="visitTypeID"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Visit Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select visit type" />
                              </SelectTrigger>
                            </FormControl>
                  <SelectContent>
                    {isLoadingVisitTypes && (
                      <SelectItem value="loading" disabled>Loading...</SelectItem>
                    )}
                    {visitTypesError && (
                      <SelectItem value="error" disabled>Error loading visit types</SelectItem>
                    )}
                    {visitTypes && visitTypes.length > 0 ? (
                      visitTypes.map((type) => (
                        <SelectItem key={type.visitTypeID} value={type.visitTypeID.toString()}>
                          {type.Description}
                        </SelectItem>
                      ))
                    ) : !isLoadingVisitTypes && !visitTypesError ? (
                      <SelectItem value="empty" disabled>No visit types found</SelectItem>
                    ) : null}
                  </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="DoctorNotes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Doctor Notes</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Enter consultation notes, diagnosis, and treatment plan..." 
                            className="min-h-[100px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="Fee"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Consultation Fee</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" placeholder="500.00" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="Followup"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Follow-up Date (Optional)</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="prescriptionImage1"
                      render={({ field: { value, onChange, ...field } }) => (
                        <FormItem>
                          <FormLabel>Prescription Image 1 (Optional)</FormLabel>
                          <FormControl>
                            <Input
                              type="file"
                              accept="image/*"
                              onChange={(e) => onChange(e.target.files)}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="prescriptionImage2"
                      render={({ field: { value, onChange, ...field } }) => (
                        <FormItem>
                          <FormLabel>Prescription Image 2 (Optional)</FormLabel>
                          <FormControl>
                            <Input
                              type="file"
                              accept="image/*"
                              onChange={(e) => onChange(e.target.files)}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

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
                      disabled={createVisitMutation.isPending}
                    >
                      {createVisitMutation.isPending ? "Adding..." : "Add Visit"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading visits...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {visits?.map((visit, index) => (
              <Card
                key={visit.visitID}
                className="shadow-card hover:shadow-elevated transition-all duration-300 animate-fade-in border-border"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl font-semibold text-foreground mb-1">
                        {visit.patientName || `Patient ID: ${visit.patientID}`}
                      </CardTitle>
                      <p className="text-sm text-primary font-medium">
                        {visit.doctorName || `Doctor ID: ${visit.doctorID}`}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Badge className={getStatusColor(getStatusFromDate(visit.Followup))}>
                        {getStatusFromDate(visit.Followup)}
                      </Badge>
                      {visit.isCompleted && (
                        <Badge className="bg-green-500 text-white">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Completed
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center text-sm">
                      <Calendar className="w-4 h-4 mr-2 text-primary" />
                      <div>
                        <p className="text-muted-foreground text-xs">Follow-up</p>
                        <p className="font-medium text-foreground">
                          {new Date(visit.Followup).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center text-sm">
                      <DollarSign className="w-4 h-4 mr-2 text-primary" />
                      <div>
                        <p className="text-muted-foreground text-xs">Fee</p>
                        <p className="font-medium text-foreground">₹{visit.Fee}</p>
                      </div>
                    </div>
                  </div>
                  
                  {visit.DoctorNotes && (
                    <div className="flex items-start text-sm">
                      <FileText className="w-4 h-4 mr-2 text-primary mt-0.5" />
                      <div className="flex-1">
                        <p className="text-muted-foreground text-xs">Doctor's Notes</p>
                        <p className="text-foreground">{visit.DoctorNotes}</p>
                      </div>
                    </div>
                  )}

                  <div className="pt-4 border-t border-border">
                    <p className="text-xs text-muted-foreground mb-1">Location</p>
                    <p className="text-sm font-medium text-foreground">
                      {visit.locationName || `Location ID: ${visit.clinicLocationID}`}
                    </p>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button 
                      variant="outline" 
                      className="flex-1 border-primary text-primary hover:bg-accent"
                      onClick={() => {
                        setSelectedVisit(visit);
                        setViewDialogOpen(true);
                      }}
                    >
                      View Details
                    </Button>
                    {!visit.isCompleted && (
                      <Button 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => markCompletedMutation.mutate(visit.visitID)}
                        disabled={markCompletedMutation.isPending}
                      >
                        Mark Completed
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!isLoading && (!visits || visits.length === 0) && (
          <Card className="shadow-card">
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No visits found in the system.</p>
            </CardContent>
          </Card>
        )}

        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Visit Details</DialogTitle>
              <DialogDescription>
                Complete visit information and prescription images
              </DialogDescription>
            </DialogHeader>
            {selectedVisit && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Patient</p>
                    <p className="font-medium">{selectedVisit.patientName || `ID: ${selectedVisit.patientID}`}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Doctor</p>
                    <p className="font-medium">{selectedVisit.doctorName || `ID: ${selectedVisit.doctorID}`}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Location</p>
                    <p className="font-medium">{selectedVisit.locationName || `ID: ${selectedVisit.clinicLocationID}`}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Visit Type</p>
                    <p className="font-medium">{selectedVisit.visitTypeName || `ID: ${selectedVisit.visitTypeID}`}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Fee</p>
                    <p className="font-medium">₹{selectedVisit.Fee}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Follow-up Date</p>
                    <p className="font-medium">{new Date(selectedVisit.Followup).toLocaleDateString()}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-2">Doctor's Notes</p>
                  <p className="text-foreground bg-muted p-3 rounded-md">{selectedVisit.DoctorNotes}</p>
                </div>

                {(selectedVisit.prescriptionImage1 || selectedVisit.prescriptionImage2) && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-3 flex items-center gap-2">
                      <ImageIcon className="w-4 h-4" />
                      Prescription Images
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      {selectedVisit.prescriptionImage1 && (
                        <div className="border rounded-lg overflow-hidden">
                          <img 
                            src={selectedVisit.prescriptionImage1} 
                            alt="Prescription 1" 
                            className="w-full h-auto"
                          />
                        </div>
                      )}
                      {selectedVisit.prescriptionImage2 && (
                        <div className="border rounded-lg overflow-hidden">
                          <img 
                            src={selectedVisit.prescriptionImage2} 
                            alt="Prescription 2" 
                            className="w-full h-auto"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex justify-end pt-4">
                  <Button onClick={() => setViewDialogOpen(false)}>
                    Close
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Visits;
