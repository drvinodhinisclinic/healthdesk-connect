import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Phone, Award } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { doctorAPI, Doctor } from "@/lib/api";
import { toast } from "sonner";
import { useEffect } from "react";

const Doctors = () => {
  const { data: doctors, isLoading, error } = useQuery<Doctor[]>({
    queryKey: ['doctors'],
    queryFn: doctorAPI.getAll,
  });

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
          <Button className="bg-gradient-primary hover:opacity-90 transition-opacity shadow-elevated">
            <Plus className="w-4 h-4 mr-2" />
            Add Doctor
          </Button>
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
