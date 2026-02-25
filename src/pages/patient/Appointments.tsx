import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import {
  Calendar,
  FlaskConical,
  Clock,
  User,
  Heart,
  Home,
  Settings,
  HelpCircle,
  Plus,
  MapPin,
  Phone,
  Video,
  X,
} from "lucide-react";

const navItems = [
  { title: "Dashboard", url: "/patient/dashboard", icon: Home },
  { title: "Appointments", url: "/patient/appointments", icon: Calendar },
  { title: "Lab Results", url: "/patient/lab-results", icon: FlaskConical },
  { title: "Health Tips", url: "/patient/tips", icon: Heart },
  { title: "Settings", url: "/patient/settings", icon: Settings },
  { title: "Help", url: "/patient/help", icon: HelpCircle },
];

const upcomingAppointments = [
  {
    id: 1,
    doctor: "Dr. Sarah Johnson",
    specialty: "Cardiologist",
    date: "Dec 10, 2024",
    time: "10:00 AM",
    status: "confirmed",
    type: "In-Person",
    location: "Main Hospital, Room 201",
    avatar: "SJ",
  },
  {
    id: 2,
    doctor: "Dr. Michael Chen",
    specialty: "Neurologist",
    date: "Dec 15, 2024",
    time: "2:30 PM",
    status: "pending",
    type: "Video Call",
    location: "Online",
    avatar: "MC",
  },
  {
    id: 3,
    doctor: "Dr. Emily Williams",
    specialty: "General Physician",
    date: "Dec 20, 2024",
    time: "11:00 AM",
    status: "confirmed",
    type: "In-Person",
    location: "City Clinic, Room 105",
    avatar: "EW",
  },
];

const pastAppointments = [
  {
    id: 4,
    doctor: "Dr. Sarah Johnson",
    specialty: "Cardiologist",
    date: "Nov 25, 2024",
    time: "9:00 AM",
    status: "completed",
    type: "In-Person",
    location: "Main Hospital, Room 201",
    avatar: "SJ",
  },
  {
    id: 5,
    doctor: "Dr. Ahmed Hassan",
    specialty: "Dermatologist",
    date: "Nov 10, 2024",
    time: "3:00 PM",
    status: "completed",
    type: "Video Call",
    location: "Online",
    avatar: "AH",
  },
];

const PatientAppointments = () => {
  const [user] = useState({ name: "John Doe" });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-700";
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "completed":
        return "bg-muted text-muted-foreground";
      case "cancelled":
        return "bg-red-100 text-red-700";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <DashboardLayout
      userRole="patient"
      userName={user.name}
      navItems={navItems}
      userIcon={User}
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">My Appointments</h1>
          <p className="text-muted-foreground">
            Manage and view all your medical appointments
          </p>
        </div>
        <Link to="/doctors">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Book Appointment
          </Button>
        </Link>
      </div>

      <Tabs defaultValue="upcoming" className="space-y-6">
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming ({upcomingAppointments.length})</TabsTrigger>
          <TabsTrigger value="past">Past ({pastAppointments.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-4">
          {upcomingAppointments.map((apt) => (
            <Card key={apt.id}>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-lg">
                    {apt.avatar}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-lg">{apt.doctor}</h3>
                      <Badge className={getStatusColor(apt.status)}>
                        {apt.status}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground">{apt.specialty}</p>
                    <div className="flex flex-wrap gap-4 mt-3 text-sm">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>{apt.date}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{apt.time}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        {apt.type === "Video Call" ? (
                          <Video className="h-4 w-4" />
                        ) : (
                          <MapPin className="h-4 w-4" />
                        )}
                        <span>{apt.location}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {apt.type === "Video Call" && apt.status === "confirmed" && (
                      <Button variant="hero">
                        <Video className="h-4 w-4 mr-2" />
                        Join Call
                      </Button>
                    )}
                    <Button variant="outline">
                      <Phone className="h-4 w-4 mr-2" />
                      Contact
                    </Button>
                    <Button variant="outline" className="text-red-600 hover:text-red-700">
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="past" className="space-y-4">
          {pastAppointments.map((apt) => (
            <Card key={apt.id} className="opacity-80">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center text-muted-foreground font-semibold text-lg">
                    {apt.avatar}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-lg">{apt.doctor}</h3>
                      <Badge className={getStatusColor(apt.status)}>
                        {apt.status}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground">{apt.specialty}</p>
                    <div className="flex flex-wrap gap-4 mt-3 text-sm">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>{apt.date}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{apt.time}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline">View Summary</Button>
                    <Button variant="outline">Book Again</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default PatientAppointments;
