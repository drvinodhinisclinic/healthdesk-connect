import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Calendar, Edit, CheckCircle2, Clock, DollarSign, FileText } from "lucide-react";
import { visitAPI, Visit, patientAPI, doctorAPI, locationAPI, visitTypeAPI, Patient } from "@/lib/api";
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
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { format } from "date-fns";

const visitSchema = z.object({
  patientID: z.string().min(1, "Patient is required"),
  doctorID: z.string().min(1, "Doctor is required"),
  clinicLocationID: z.string().min(1, "Location is required"),
  visitTypeID: z.string().min(1, "Visit type is required"),
  visitDate: z.string().min(1, "Visit date is required"),
  DoctorNotes: z.string().optional(),
});

const editVisitSchema = z.object({
  patientID: z.string().min(1, "Patient is required"),
  doctorID: z.string().min(1, "Doctor is required"),
  clinicLocationID: z.string().min(1, "Location is required"),
  visitTypeID: z.string().min(1, "Visit type is required"),
  visitDate: z.string().min(1, "Visit date is required"),
  DoctorNotes: z.string().optional(),
});

const completeVisitSchema = z.object({
  DoctorNotes: z.string().min(1, "Doctor notes are required"),
  Fee: z.string().min(1, "Consultation fee is required"),
});

type VisitFormData = z.infer<typeof visitSchema>;
type EditVisitFormData = z.infer<typeof editVisitSchema>;
type CompleteVisitFormData = z.infer<typeof completeVisitSchema>;

const Visits = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false);
  const [selectedVisit, setSelectedVisit] = useState<Visit | null>(null);
  const [patientSearchOpen, setPatientSearchOpen] = useState(false);
  const [editPatientSearchOpen, setEditPatientSearchOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: visits, isLoading } = useQuery<Visit[]>({
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

  const { data: visitTypes } = useQuery({
    queryKey: ['visitTypes'],
    queryFn: visitTypeAPI.getAll,
  });

  const form = useForm<VisitFormData>({
    resolver: zodResolver(visitSchema),
    defaultValues: {
      patientID: "",
      doctorID: "",
      clinicLocationID: "",
      visitTypeID: "1",
      visitDate: format(new Date(), "yyyy-MM-dd"),
      DoctorNotes: "",
    },
  });

  const editForm = useForm<EditVisitFormData>({
    resolver: zodResolver(editVisitSchema),
    defaultValues: {
      patientID: "",
      doctorID: "",
      clinicLocationID: "",
      visitTypeID: "",
      visitDate: "",
      DoctorNotes: "",
    },
  });

  const completeForm = useForm<CompleteVisitFormData>({
    resolver: zodResolver(completeVisitSchema),
    defaultValues: {
      DoctorNotes: "",
      Fee: "",
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

  const updateVisitMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => 
      visitAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['visits'] });
      toast.success("Visit updated successfully");
      setEditDialogOpen(false);
      editForm.reset();
    },
    onError: () => {
      toast.error("Failed to update visit");
    },
  });

  const completeVisitMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: CompleteVisitFormData }) => 
      visitAPI.update(id, { 
        DoctorNotes: data.DoctorNotes,
        Fee: parseFloat(data.Fee),
        IsCompleted: 1 
      } as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['visits'] });
      toast.success("Visit completed successfully");
      setCompleteDialogOpen(false);
      completeForm.reset();
    },
    onError: () => {
      toast.error("Failed to complete visit");
    },
  });

  const onSubmit = async (data: VisitFormData) => {
    const visitData = {
      patientID: parseInt(data.patientID),
      doctorID: parseInt(data.doctorID),
      clinicLocationID: parseInt(data.clinicLocationID),
      visitTypeID: parseInt(data.visitTypeID),
      visitDate: data.visitDate,
      DoctorNotes: data.DoctorNotes || null,
      Followup: null,
      Fee: null,
      prescriptionImage1: null,
      prescriptionImage2: null,
      IsCompleted: 0,
    };
    createVisitMutation.mutate(visitData as any);
  };

  const onEditSubmit = async (data: EditVisitFormData) => {
    if (selectedVisit) {
      const visitData = {
        patientID: parseInt(data.patientID),
        doctorID: parseInt(data.doctorID),
        clinicLocationID: parseInt(data.clinicLocationID),
        visitTypeID: parseInt(data.visitTypeID),
        visitDate: data.visitDate,
        DoctorNotes: data.DoctorNotes || null,
      };
      updateVisitMutation.mutate({ id: selectedVisit.visitID, data: visitData });
    }
  };

  const onCompleteSubmit = async (data: CompleteVisitFormData) => {
    if (selectedVisit) {
      completeVisitMutation.mutate({ id: selectedVisit.visitID, data });
    }
  };

  const handleEditVisit = (visit: Visit) => {
    setSelectedVisit(visit);
    editForm.reset({
      patientID: visit.patientID.toString(),
      doctorID: visit.doctorID.toString(),
      clinicLocationID: visit.clinicLocationID.toString(),
      visitTypeID: visit.visitTypeID.toString(),
      visitDate: visit.visitDate || format(new Date(), "yyyy-MM-dd"),
      DoctorNotes: visit.DoctorNotes || "",
    });
    setEditDialogOpen(true);
  };

  const handleCompleteVisit = (visit: Visit) => {
    setSelectedVisit(visit);
    completeForm.reset({
      DoctorNotes: visit.DoctorNotes || "",
      Fee: visit.Fee ? visit.Fee.toString() : "",
    });
    setCompleteDialogOpen(true);
  };

  // Group and sort visits
  const pendingVisits = visits?.filter(v => v.IsCompleted === 0)
    .sort((a, b) => {
      const dateA = new Date(a.visitDate || 0).getTime();
      const dateB = new Date(b.visitDate || 0).getTime();
      return dateB - dateA;
    }) || [];

  const completedVisits = visits?.filter(v => v.IsCompleted === 1)
    .sort((a, b) => {
      const dateA = new Date(a.visitDate || 0).getTime();
      const dateB = new Date(b.visitDate || 0).getTime();
      return dateB - dateA;
    }) || [];

  const PatientCombobox = ({ 
    value, 
    onChange, 
    open, 
    setOpen 
  }: { 
    value: string; 
    onChange: (value: string) => void;
    open: boolean;
    setOpen: (open: boolean) => void;
  }) => {
    const selectedPatient = patients?.find((p: Patient) => p.patientid.toString() === value);
    
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {selectedPatient ? selectedPatient.Name : "Select patient..."}
            <Calendar className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput placeholder="Search patient..." />
            <CommandList>
              <CommandEmpty>No patient found.</CommandEmpty>
              <CommandGroup>
                {patients?.map((patient: Patient) => (
                  <CommandItem
                    key={patient.patientid}
                    value={patient.Name}
                    onSelect={() => {
                      onChange(patient.patientid.toString());
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === patient.patientid.toString() ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {patient.Name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    );
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
                  <FormField
                    control={form.control}
                    name="patientID"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Patient *</FormLabel>
                        <PatientCombobox
                          value={field.value}
                          onChange={field.onChange}
                          open={patientSearchOpen}
                          setOpen={setPatientSearchOpen}
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="visitDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Visit Date *</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="doctorID"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Doctor *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select doctor" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {doctors?.map((doctor) => (
                                <SelectItem key={doctor.doctorID} value={doctor.doctorID.toString()}>
                                  {doctor.Name}
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
                      name="clinicLocationID"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location *</FormLabel>
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
                  </div>

                  <FormField
                    control={form.control}
                    name="visitTypeID"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Visit Type *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select visit type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {visitTypes?.map((type) => (
                              <SelectItem key={type.visitTypeID} value={type.visitTypeID.toString()}>
                                {type.Description}
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
                    name="DoctorNotes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes (Optional)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Enter visit notes..." 
                            className="min-h-[100px]"
                            {...field} 
                          />
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
          <div className="space-y-8">
            {/* Pending Visits */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-secondary" />
                <h2 className="text-2xl font-semibold text-foreground">
                  Pending Visits
                </h2>
                <Badge variant="secondary" className="ml-2">
                  {pendingVisits.length}
                </Badge>
              </div>
              {pendingVisits.length === 0 ? (
                <Card className="shadow-card">
                  <CardContent className="py-12 text-center">
                    <p className="text-muted-foreground">No pending visits</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {pendingVisits.map((visit, index) => (
                    <Card
                      key={visit.visitID}
                      className="shadow-card hover:shadow-elevated transition-all duration-300 animate-fade-in border-l-4 border-l-secondary"
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
                          <Badge variant="secondary" className="ml-2">
                            <Clock className="w-3 h-3 mr-1" />
                            Pending
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {visit.visitDate && (
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Calendar className="w-4 h-4 mr-2" />
                              {format(new Date(visit.visitDate), "PPP")}
                            </div>
                          )}
                          <div className="flex items-center text-sm text-muted-foreground">
                            <FileText className="w-4 h-4 mr-2" />
                            {visit.visitTypeName || "Regular Visit"}
                          </div>
                          {visit.DoctorNotes && (
                            <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                              {visit.DoctorNotes}
                            </p>
                          )}
                          <div className="flex gap-2 mt-4">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditVisit(visit)}
                              className="flex-1"
                            >
                              <Edit className="w-4 h-4 mr-1" />
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleCompleteVisit(visit)}
                              className="flex-1 bg-gradient-primary hover:opacity-90"
                            >
                              <CheckCircle2 className="w-4 h-4 mr-1" />
                              Complete
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Completed Visits */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle2 className="w-5 h-5 text-primary" />
                <h2 className="text-2xl font-semibold text-foreground">
                  Completed Visits
                </h2>
                <Badge className="ml-2 bg-primary text-primary-foreground">
                  {completedVisits.length}
                </Badge>
              </div>
              {completedVisits.length === 0 ? (
                <Card className="shadow-card">
                  <CardContent className="py-12 text-center">
                    <p className="text-muted-foreground">No completed visits</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {completedVisits.map((visit, index) => (
                    <Card
                      key={visit.visitID}
                      className="shadow-card hover:shadow-elevated transition-all duration-300 animate-fade-in border-l-4 border-l-primary opacity-80"
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
                          <Badge className="ml-2 bg-primary text-primary-foreground">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Completed
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {visit.visitDate && (
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Calendar className="w-4 h-4 mr-2" />
                              {format(new Date(visit.visitDate), "PPP")}
                            </div>
                          )}
                          <div className="flex items-center text-sm text-muted-foreground">
                            <FileText className="w-4 h-4 mr-2" />
                            {visit.visitTypeName || "Regular Visit"}
                          </div>
                          {visit.Fee && (
                            <div className="flex items-center text-sm font-medium text-foreground">
                              <DollarSign className="w-4 h-4 mr-2" />
                              ₹{visit.Fee}
                            </div>
                          )}
                          {visit.DoctorNotes && (
                            <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                              {visit.DoctorNotes}
                            </p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Visit</DialogTitle>
            <DialogDescription>
              Update visit details for {selectedVisit?.patientName}
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="patientID"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Patient *</FormLabel>
                    <PatientCombobox
                      value={field.value}
                      onChange={field.onChange}
                      open={editPatientSearchOpen}
                      setOpen={setEditPatientSearchOpen}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="visitDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Visit Date *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="doctorID"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Doctor *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select doctor" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {doctors?.map((doctor) => (
                            <SelectItem key={doctor.doctorID} value={doctor.doctorID.toString()}>
                              {doctor.Name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="clinicLocationID"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
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
              </div>

              <FormField
                control={editForm.control}
                name="visitTypeID"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Visit Type *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select visit type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {visitTypes?.map((type) => (
                          <SelectItem key={type.visitTypeID} value={type.visitTypeID.toString()}>
                            {type.Description}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="DoctorNotes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes (Optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter visit notes..." 
                        className="min-h-[100px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-gradient-primary hover:opacity-90"
                  disabled={updateVisitMutation.isPending}
                >
                  {updateVisitMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Complete Visit Dialog */}
      <Dialog open={completeDialogOpen} onOpenChange={setCompleteDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Complete Visit</DialogTitle>
            <DialogDescription>
              Add final notes and fee to complete this visit.
            </DialogDescription>
          </DialogHeader>
          <Form {...completeForm}>
            <form onSubmit={completeForm.handleSubmit(onCompleteSubmit)} className="space-y-4">
              <FormField
                control={completeForm.control}
                name="DoctorNotes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Doctor Notes *</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter consultation notes, diagnosis, and treatment plan..." 
                        className="min-h-[150px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={completeForm.control}
                name="Fee"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Consultation Fee *</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="500.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCompleteDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-gradient-primary hover:opacity-90"
                  disabled={completeVisitMutation.isPending}
                >
                  {completeVisitMutation.isPending ? "Completing..." : "Complete Visit"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Visits;
