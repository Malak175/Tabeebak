import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  Plus,
} from "lucide-react";

const navItems = [
  { title: "Dashboard", url: "/doctor/dashboard", icon: Home },
  { title: "Appointments", url: "/doctor/appointments", icon: Calendar },
  { title: "Patients", url: "/doctor/patients", icon: Users },
  { title: "Schedule", url: "/doctor/schedule", icon: Clock },
  { title: "Settings", url: "/doctor/settings", icon: Settings },
  { title: "Help", url: "/doctor/help", icon: HelpCircle },
];

const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const timeSlots = ["9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM"];

const scheduleData = {
  "Mon": [
    { time: "9:00 AM", patient: "Ahmed Ali", type: "Consultation" },
    { time: "11:00 AM", patient: "Sara Ahmed", type: "Follow-up" },
    { time: "2:00 PM", patient: "Omar Khan", type: "Check-up" },
  ],
  "Tue": [
    { time: "10:00 AM", patient: "Fatima Hassan", type: "Consultation" },
    { time: "3:00 PM", patient: "Mohammed Said", type: "Video Call" },
  ],
  "Wed": [
    { time: "9:00 AM", patient: "Layla Mahmoud", type: "Consultation" },
    { time: "11:00 AM", patient: "Khalid Omar", type: "Follow-up" },
    { time: "2:00 PM", patient: "Maryam Said", type: "Check-up" },
    { time: "4:00 PM", patient: "Yusuf Ali", type: "Consultation" },
  ],
  "Thu": [
    { time: "10:00 AM", patient: "Aisha Hassan", type: "Follow-up" },
    { time: "2:00 PM", patient: "Hassan Ali", type: "Consultation" },
  ],
  "Fri": [
    { time: "9:00 AM", patient: "Noor Mohammed", type: "Check-up" },
  ],
  "Sat": [],
  "Sun": [],
};

const DoctorSchedule = () => {
  const [doctor] = useState({ name: "Dr. Sarah Johnson", specialty: "Cardiologist" });

  const getAppointment = (day: string, time: string) => {
    const daySchedule = scheduleData[day as keyof typeof scheduleData] || [];
    return daySchedule.find(apt => apt.time === time);
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
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Weekly Schedule</h1>
          <p className="text-muted-foreground">Manage your availability and appointments</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-muted rounded-lg p-1">
            <Button variant="ghost" size="icon">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="px-4 font-medium">Dec 9 - 15, 2024</span>
            <Button variant="ghost" size="icon">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Block Time
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="border-b">
                <th className="p-4 text-left font-medium text-muted-foreground w-24">Time</th>
                {weekDays.map((day) => (
                  <th key={day} className="p-4 text-center font-medium">
                    <div>{day}</div>
                    <div className="text-xs text-muted-foreground font-normal">
                      {day === "Mon" ? "Dec 9" : 
                       day === "Tue" ? "Dec 10" :
                       day === "Wed" ? "Dec 11" :
                       day === "Thu" ? "Dec 12" :
                       day === "Fri" ? "Dec 13" :
                       day === "Sat" ? "Dec 14" : "Dec 15"}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {timeSlots.map((time) => (
                <tr key={time} className="border-b">
                  <td className="p-4 text-sm text-muted-foreground">{time}</td>
                  {weekDays.map((day) => {
                    const apt = getAppointment(day, time);
                    return (
                      <td key={day} className="p-2">
                        {apt ? (
                          <div className="p-2 bg-primary/10 rounded-lg text-center">
                            <p className="text-sm font-medium truncate">{apt.patient}</p>
                            <Badge variant="outline" className="text-xs mt-1">
                              {apt.type}
                            </Badge>
                          </div>
                        ) : (
                          <div className="h-16 hover:bg-muted/50 rounded-lg cursor-pointer transition-colors" />
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-3 gap-6 mt-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Working Hours</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Monday - Friday</span>
              <span>9:00 AM - 5:00 PM</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Saturday</span>
              <span>Closed</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Sunday</span>
              <span>Closed</span>
            </div>
            <Button variant="outline" className="w-full mt-4">Edit Hours</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">This Week Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Total Appointments</span>
              <span className="text-2xl font-bold">12</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Video Calls</span>
              <span className="text-2xl font-bold">2</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Available Slots</span>
              <span className="text-2xl font-bold text-green-600">28</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default DoctorSchedule;
