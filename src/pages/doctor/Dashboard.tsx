import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import {
  Calendar,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  Stethoscope,
  TrendingUp,
  Home,
  Settings,
  HelpCircle,
  FileText,
  MessageSquare,
  Video,
  Star,
  ChevronRight,
  Activity,
  UserPlus,
} from "lucide-react";

const navItems = [
  { title: "Dashboard", url: "/doctor/dashboard", icon: Home },
  { title: "Appointments", url: "/doctor/appointments", icon: Calendar },
  { title: "Patients", url: "/doctor/patients", icon: Users },
  { title: "Schedule", url: "/doctor/schedule", icon: Clock },
  { title: "Messages", url: "/doctor/messages", icon: MessageSquare },
  { title: "Video Consult", url: "/doctor/video", icon: Video },
  { title: "Reports", url: "/doctor/reports", icon: FileText },
  { title: "Settings", url: "/doctor/settings", icon: Settings },
  { title: "Help", url: "/doctor/help", icon: HelpCircle },
];

const todayAppointments = [
  {
    id: 1,
    patient: "Ahmed Ali",
    age: 45,
    time: "9:00 AM",
    type: "Consultation",
    status: "waiting",
    avatar: "AA",
    issue: "Chest pain",
  },
  {
    id: 2,
    patient: "Fatima Hassan",
    age: 32,
    time: "10:30 AM",
    type: "Follow-up",
    status: "completed",
    avatar: "FH",
    issue: "Blood pressure check",
  },
  {
    id: 3,
    patient: "Mohammed Said",
    age: 58,
    time: "11:30 AM",
    type: "Consultation",
    status: "upcoming",
    avatar: "MS",
    issue: "Heart palpitations",
  },
  {
    id: 4,
    patient: "Sara Ahmed",
    age: 28,
    time: "2:00 PM",
    type: "Check-up",
    status: "upcoming",
    avatar: "SA",
    issue: "Annual checkup",
  },
  {
    id: 5,
    patient: "Omar Khan",
    age: 52,
    time: "3:30 PM",
    type: "Follow-up",
    status: "upcoming",
    avatar: "OK",
    issue: "Post-surgery review",
  },
];

const appointmentRequests = [
  {
    id: 1,
    name: "Layla Ahmed",
    date: "Dec 12, 2024",
    time: "3:00 PM",
    type: "New Patient",
    issue: "Heart screening",
  },
  {
    id: 2,
    name: "Hassan Ali",
    date: "Dec 13, 2024",
    time: "10:00 AM",
    type: "Consultation",
    issue: "Shortness of breath",
  },
  {
    id: 3,
    name: "Noor Mohammed",
    date: "Dec 14, 2024",
    time: "2:30 PM",
    type: "Second Opinion",
    issue: "ECG interpretation",
  },
];

const recentPatients = [
  { name: "Ahmed Ali", lastVisit: "Today", condition: "Stable", avatar: "AA" },
  { name: "Fatima Hassan", lastVisit: "Today", condition: "Improving", avatar: "FH" },
  { name: "Khalid Omar", lastVisit: "Yesterday", condition: "Critical", avatar: "KO" },
  { name: "Maryam Said", lastVisit: "2 days ago", condition: "Stable", avatar: "MS" },
];

const stats = [
  { label: "Today's Appointments", value: "8", icon: Calendar, change: "+2", trend: "up" },
  { label: "Total Patients", value: "156", icon: Users, change: "+12", trend: "up" },
  { label: "Completed Today", value: "3", icon: CheckCircle, change: null, trend: null },
  { label: "Pending Reviews", value: "5", icon: Clock, change: "-2", trend: "down" },
];

const DoctorDashboard = () => {
  const [doctor] = useState({
    name: "Dr. Sarah Johnson",
    specialty: "Cardiologist",
    rating: 4.8,
    experience: "12 years",
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-700";
      case "waiting":
        return "bg-yellow-100 text-yellow-700";
      case "upcoming":
        return "bg-muted text-muted-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case "Stable":
        return "text-green-600";
      case "Improving":
        return "text-blue-600";
      case "Critical":
        return "text-red-600";
      default:
        return "text-muted-foreground";
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
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">
            Good Morning, Dr. {doctor.name.split(" ")[1]}!
          </h1>
          <p className="text-muted-foreground">
            You have{" "}
            {todayAppointments.filter((a) => a.status !== "completed").length}{" "}
            appointments scheduled today
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-sm">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="font-medium">{doctor.rating}</span>
            <span className="text-muted-foreground">rating</span>
          </div>
          <Badge variant="secondary">{doctor.experience} exp</Badge>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <stat.icon className="h-5 w-5 text-primary" />
                </div>
                {stat.change && (
                  <span
                    className={`flex items-center text-sm font-medium ${
                      stat.trend === "up" ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    <TrendingUp
                      className={`h-3.5 w-3.5 mr-1 ${
                        stat.trend === "down" ? "rotate-180" : ""
                      }`}
                    />
                    {stat.change}
                  </span>
                )}
              </div>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Today's Schedule - 2 columns */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg">Today's Schedule</CardTitle>
              <Link
                to="/doctor/schedule"
                className="text-primary text-sm hover:underline flex items-center gap-1"
              >
                Full Schedule <ChevronRight className="h-4 w-4" />
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {todayAppointments.map((apt) => (
                  <div
                    key={apt.id}
                    className="flex items-center gap-4 p-4 bg-muted/50 rounded-xl hover:bg-muted transition-colors"
                  >
                    <div className="text-center min-w-[70px]">
                      <div className="text-sm font-semibold">{apt.time}</div>
                      <div className="text-xs text-muted-foreground">{apt.type}</div>
                    </div>
                    <Avatar className="h-10 w-10 bg-primary/10 text-primary">
                      <AvatarFallback className="bg-primary/10 text-primary text-sm">
                        {apt.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{apt.patient}</h4>
                        <span className="text-xs text-muted-foreground">
                          {apt.age} yrs
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {apt.issue}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(
                          apt.status
                        )}`}
                      >
                        {apt.status}
                      </span>
                      {apt.status === "waiting" && (
                        <Button size="sm" variant="hero">
                          Start
                        </Button>
                      )}
                      {apt.status === "upcoming" && (
                        <Button size="sm" variant="outline">
                          View
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Patients */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg">Recent Patients</CardTitle>
              <Link
                to="/doctor/patients"
                className="text-primary text-sm hover:underline flex items-center gap-1"
              >
                All Patients <ChevronRight className="h-4 w-4" />
              </Link>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 gap-4">
                {recentPatients.map((patient) => (
                  <div
                    key={patient.name}
                    className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl hover:bg-muted transition-colors cursor-pointer"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary/10 text-primary text-sm">
                        {patient.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate">
                        {patient.name}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        {patient.lastVisit}
                      </p>
                    </div>
                    <span className={`text-xs font-medium ${getConditionColor(patient.condition)}`}>
                      {patient.condition}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - 1 column */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="hero" className="w-full justify-start">
                <Video className="h-4 w-4 mr-2" />
                Start Video Consult
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Calendar className="h-4 w-4 mr-2" />
                Manage Schedule
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <FileText className="h-4 w-4 mr-2" />
                Write Prescription
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <MessageSquare className="h-4 w-4 mr-2" />
                Messages (3 new)
              </Button>
            </CardContent>
          </Card>

          {/* Appointment Requests */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg">New Requests</CardTitle>
              <Badge variant="secondary">{appointmentRequests.length}</Badge>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {appointmentRequests.map((request) => (
                  <div
                    key={request.id}
                    className="p-3 bg-muted/50 rounded-xl space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <UserPlus className="h-4 w-4 text-primary" />
                        <span className="font-medium text-sm">{request.name}</span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {request.type}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{request.issue}</p>
                    <div className="text-xs text-muted-foreground">
                      {request.date} at {request.time}
                    </div>
                    <div className="flex gap-2 pt-1">
                      <Button size="sm" variant="hero" className="flex-1">
                        <CheckCircle className="h-3.5 w-3.5 mr-1" />
                        Accept
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        <XCircle className="h-3.5 w-3.5 mr-1" />
                        Decline
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Today's Summary */}
          <Card className="bg-gradient-to-br from-secondary/10 to-primary/5 border-secondary/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-4">
                <Activity className="h-5 w-5 text-secondary" />
                <h4 className="font-semibold">Today's Summary</h4>
              </div>
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="p-2 bg-background/50 rounded-lg">
                  <div className="text-xl font-bold text-green-600">3</div>
                  <div className="text-xs text-muted-foreground">Completed</div>
                </div>
                <div className="p-2 bg-background/50 rounded-lg">
                  <div className="text-xl font-bold text-yellow-600">1</div>
                  <div className="text-xs text-muted-foreground">Waiting</div>
                </div>
                <div className="p-2 bg-background/50 rounded-lg">
                  <div className="text-xl font-bold text-blue-600">4</div>
                  <div className="text-xs text-muted-foreground">Upcoming</div>
                </div>
                <div className="p-2 bg-background/50 rounded-lg">
                  <div className="text-xl font-bold text-primary">2h 30m</div>
                  <div className="text-xs text-muted-foreground">Avg. Time</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DoctorDashboard;
