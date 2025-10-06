import { useQuery } from "@tanstack/react-query";
import { Users, Stethoscope, ClipboardList, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { dashboardAPI, DashboardStats, RecentActivity } from "@/lib/api";
import { toast } from "sonner";
import { useEffect } from "react";

const Dashboard = () => {
  const { data: stats, isLoading: statsLoading, error: statsError } = useQuery<DashboardStats>({
    queryKey: ['dashboard-stats'],
    queryFn: dashboardAPI.getStats,
  });

  const { data: activities, isLoading: activitiesLoading, error: activitiesError } = useQuery<RecentActivity[]>({
    queryKey: ['dashboard-activity'],
    queryFn: dashboardAPI.getRecentActivity,
  });

  useEffect(() => {
    if (statsError) toast.error("Failed to load dashboard statistics");
    if (activitiesError) toast.error("Failed to load recent activities");
  }, [statsError, activitiesError]);

  const statsConfig = [
    {
      title: "Total Patients",
      value: stats?.totalPatients || 0,
      icon: Users,
      trend: stats?.patientTrend || "Loading...",
      color: "text-primary",
    },
    {
      title: "Active Doctors",
      value: stats?.activeDoctors || 0,
      icon: Stethoscope,
      trend: "Registered",
      color: "text-secondary",
    },
    {
      title: "Today's Visits",
      value: stats?.todayVisits || 0,
      icon: ClipboardList,
      trend: stats?.visitTrend || "Loading...",
      color: "text-primary",
    },
    {
      title: "Clinic Locations",
      value: stats?.totalLocations || 0,
      icon: MapPin,
      trend: "All active",
      color: "text-secondary",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold text-foreground mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's what's happening today.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsConfig.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card 
                key={index} 
                className="shadow-card hover:shadow-elevated transition-all duration-300 animate-fade-in border-border"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <div className={cn("p-2 rounded-lg bg-accent", stat.color)}>
                    <Icon className="w-4 h-4" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-foreground mb-1">
                    {statsLoading ? "..." : stat.value}
                  </div>
                  <p className="text-xs text-muted-foreground">{stat.trend}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card className="shadow-card animate-fade-in" style={{ animationDelay: "400ms" }}>
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-foreground">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {activitiesLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading activities...</div>
            ) : activities && activities.length > 0 ? (
              <div className="space-y-4">
                {activities.map((activity) => (
                  <div 
                    key={activity.id} 
                    className="flex items-center justify-between p-4 bg-accent/50 rounded-lg hover:bg-accent transition-colors duration-200"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{activity.patientName}</p>
                      <p className="text-sm text-muted-foreground">{activity.action}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-primary">{activity.doctorName}</p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No recent activities found
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const cn = (...classes: (string | undefined)[]) => classes.filter(Boolean).join(" ");

export default Dashboard;
