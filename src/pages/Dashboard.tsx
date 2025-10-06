import { Users, Stethoscope, ClipboardList, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Dashboard = () => {
  const stats = [
    {
      title: "Total Patients",
      value: "1,247",
      icon: Users,
      trend: "+12% from last month",
      color: "text-primary",
    },
    {
      title: "Active Doctors",
      value: "23",
      icon: Stethoscope,
      trend: "2 new this month",
      color: "text-secondary",
    },
    {
      title: "Today's Visits",
      value: "45",
      icon: ClipboardList,
      trend: "15 completed",
      color: "text-primary",
    },
    {
      title: "Clinic Locations",
      value: "5",
      icon: MapPin,
      trend: "All active",
      color: "text-secondary",
    },
  ];

  const recentActivities = [
    { patient: "John Doe", action: "New visit recorded", time: "10 min ago", doctor: "Dr. Smith" },
    { patient: "Jane Smith", action: "Follow-up scheduled", time: "25 min ago", doctor: "Dr. Johnson" },
    { patient: "Mike Brown", action: "Prescription updated", time: "1 hour ago", doctor: "Dr. Williams" },
    { patient: "Sarah Davis", action: "New patient registered", time: "2 hours ago", doctor: "Dr. Martinez" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold text-foreground mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's what's happening today.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
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
                  <div className="text-3xl font-bold text-foreground mb-1">{stat.value}</div>
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
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div 
                  key={index} 
                  className="flex items-center justify-between p-4 bg-accent/50 rounded-lg hover:bg-accent transition-colors duration-200"
                >
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{activity.patient}</p>
                    <p className="text-sm text-muted-foreground">{activity.action}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-primary">{activity.doctor}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const cn = (...classes: (string | undefined)[]) => classes.filter(Boolean).join(" ");

export default Dashboard;
