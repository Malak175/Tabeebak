import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
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
  Bell,
  Lock,
  User,
  CreditCard,
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

const DoctorSettings = () => {
  const [doctor] = useState({
    name: "Dr. Sarah Johnson",
    specialty: "Cardiologist",
    email: "sarah.johnson@tabeebak.com",
    phone: "+1 234 567 8900",
  });

  const [notifications, setNotifications] = useState({
    newAppointments: true,
    appointmentReminders: true,
    patientMessages: true,
    labResults: true,
  });

  return (
    <DashboardLayout
      userRole="doctor"
      userName={doctor.name}
      userSubtitle={doctor.specialty}
      navItems={navItems}
      userIcon={Stethoscope}
    >
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground">Manage your profile and preferences</p>
      </div>

      <div className="max-w-3xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Information
            </CardTitle>
            <CardDescription>Update your professional profile</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" defaultValue={doctor.name} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="specialty">Specialty</Label>
                <Input id="specialty" defaultValue={doctor.specialty} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" defaultValue={doctor.email} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" defaultValue={doctor.phone} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">Professional Bio</Label>
              <Textarea
                id="bio"
                placeholder="Write a brief description about yourself..."
                defaultValue="Board-certified cardiologist with 12 years of experience specializing in preventive cardiology and heart failure management."
              />
            </div>
            <Button>Save Changes</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notification Preferences
            </CardTitle>
            <CardDescription>Choose what notifications you receive</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>New Appointment Requests</Label>
                <p className="text-sm text-muted-foreground">Get notified when patients request appointments</p>
              </div>
              <Switch
                checked={notifications.newAppointments}
                onCheckedChange={(checked) =>
                  setNotifications({ ...notifications, newAppointments: checked })
                }
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Appointment Reminders</Label>
                <p className="text-sm text-muted-foreground">Receive reminders before scheduled appointments</p>
              </div>
              <Switch
                checked={notifications.appointmentReminders}
                onCheckedChange={(checked) =>
                  setNotifications({ ...notifications, appointmentReminders: checked })
                }
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Patient Messages</Label>
                <p className="text-sm text-muted-foreground">Get notified when patients send messages</p>
              </div>
              <Switch
                checked={notifications.patientMessages}
                onCheckedChange={(checked) =>
                  setNotifications({ ...notifications, patientMessages: checked })
                }
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Lab Results</Label>
                <p className="text-sm text-muted-foreground">Receive alerts when patient lab results are ready</p>
              </div>
              <Switch
                checked={notifications.labResults}
                onCheckedChange={(checked) =>
                  setNotifications({ ...notifications, labResults: checked })
                }
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Availability Settings
            </CardTitle>
            <CardDescription>Configure your working hours and appointment slots</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Slot Duration</Label>
                <Input defaultValue="30 minutes" />
              </div>
              <div className="space-y-2">
                <Label>Break Between Slots</Label>
                <Input defaultValue="5 minutes" />
              </div>
            </div>
            <Button variant="outline">Manage Schedule</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Security
            </CardTitle>
            <CardDescription>Manage your account security</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Two-Factor Authentication</Label>
                <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
              </div>
              <Button variant="outline">Enable</Button>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Change Password</Label>
                <p className="text-sm text-muted-foreground">Update your password regularly</p>
              </div>
              <Button variant="outline">Update</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default DoctorSettings;
