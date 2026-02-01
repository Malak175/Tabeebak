import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import {
  Calendar,
  Users,
  Clock,
  Stethoscope,
  Home,
  Settings,
  HelpCircle,
  FileText,
  MessageSquare,
  Video,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const navItems = [
  { title: "Dashboard", url: "/doctor/dashboard", icon: Home },
  { title: "Appointments", url: "/doctor/appointments", icon: Calendar },
  { title: "Patients", url: "/doctor/patients", icon: Users },
  { title: "Schedule", url: "/doctor/schedule", icon: Clock },
  { title: "Settings", url: "/doctor/settings", icon: Settings },
  { title: "Help", url: "/doctor/help", icon: HelpCircle },
];

const appointments = [
  { id: 1, patient: "Ahmed Ali", age: 45, time: "9:00 AM", type: "Consultation", status: "completed", avatar: "AA", issue: "Chest pain" },
  { id: 2, patient: "Fatima Hassan", age: 32, time: "10:30 AM", type: "Follow-up", status: "completed", avatar: "FH", issue: "Blood pressure" },
  { id: 3, patient: "Mohammed Said", age: 58, time: "11:30 AM", type: "Consultation", status: "in-progress", avatar: "MS", issue: "Heart palpitations" },
  { id: 4, patient: "Sara Ahmed", age: 28, time: "2:00 PM", type: "Check-up", status: "upcoming", avatar: "SA", issue: "Annual checkup" },
  { id: 5, patient: "Omar Khan", age: 52, time: "3:30 PM", type: "Follow-up", status: "upcoming", avatar: "OK", issue: "Post-surgery" },
  { id: 6, patient: "Layla Mahmoud", age: 40, time: "4:30 PM", type: "Consultation", status: "upcoming", avatar: "LM", issue: "Shortness of breath" },
];

const DoctorAppointments = () => {
  const [doctor] = useState({ name: "Dr. Sarah Johnson", specialty: "Cardiologist" });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-700";
      case "in-progress": return "bg-blue-100 text-blue-700";
      case "upcoming": return "bg-muted text-muted-foreground";
      case "cancelled": return "bg-red-100 text-red-700";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <DashboardLayout
      userRole="doctor"
      userName={doctor.name}
      userSubtitle={doctor.specialty}
      navItems={navItems}
      userIcon={Stethoscope}
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Appointments</h1>
          <p className="text-muted-foreground">Manage your patient appointments</p>
        </div>
        <div className="flex items-center gap-2 bg-muted rounded-lg p-1">
          <Button variant="ghost" size="icon">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="px-4 font-medium">December 10, 2024</span>
          <Button variant="ghost" size="icon">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList>
          <TabsTrigger value="all">All ({appointments.length})</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {appointments.map((apt) => (
            <Card key={apt.id}>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="text-center min-w-[80px]">
                    <div className="text-lg font-semibold">{apt.time}</div>
                    <div className="text-xs text-muted-foreground">{apt.type}</div>
                  </div>
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-primary/10 text-primary">{apt.avatar}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{apt.patient}</h3>
                      <span className="text-sm text-muted-foreground">{apt.age} years</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{apt.issue}</p>
                  </div>
                  <Badge className={getStatusColor(apt.status)}>{apt.status}</Badge>
                  <div className="flex gap-2">
                    {apt.status === "in-progress" && (
                      <Button variant="hero" size="sm">Continue</Button>
                    )}
                    {apt.status === "upcoming" && (
                      <>
                        <Button variant="hero" size="sm">Start</Button>
                        <Button variant="outline" size="sm">Reschedule</Button>
                      </>
                    )}
                    {apt.status === "completed" && (
                      <Button variant="outline" size="sm">View Notes</Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="upcoming" className="space-y-4">
          {appointments.filter(a => a.status === "upcoming").map((apt) => (
            <Card key={apt.id}>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="text-center min-w-[80px]">
                    <div className="text-lg font-semibold">{apt.time}</div>
                    <div className="text-xs text-muted-foreground">{apt.type}</div>
                  </div>
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-primary/10 text-primary">{apt.avatar}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="font-semibold">{apt.patient}</h3>
                    <p className="text-sm text-muted-foreground">{apt.issue}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="hero" size="sm">Start</Button>
                    <Button variant="outline" size="sm">Reschedule</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {appointments.filter(a => a.status === "completed").map((apt) => (
            <Card key={apt.id} className="opacity-80">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="text-center min-w-[80px]">
                    <div className="text-lg font-semibold">{apt.time}</div>
                    <div className="text-xs text-muted-foreground">{apt.type}</div>
                  </div>
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-muted text-muted-foreground">{apt.avatar}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="font-semibold">{apt.patient}</h3>
                    <p className="text-sm text-muted-foreground">{apt.issue}</p>
                  </div>
                  <Badge className="bg-green-100 text-green-700">Completed</Badge>
                  <Button variant="outline" size="sm">View Notes</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default DoctorAppointments;
