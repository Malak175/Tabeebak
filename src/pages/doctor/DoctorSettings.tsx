import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Lock,
  User,
} from "lucide-react";

const navItems = [
  { title: "Dashboard", url: "/doctor/dashboard", icon: Home },
  { title: "Appointments", url: "/doctor/appointments", icon: Calendar },
  { title: "Patients", url: "/doctor/patients", icon: Users },
  { title: "Schedule", url: "/doctor/schedule", icon: Clock },
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
              <Lock className="h-5 w-5" />
              Security
            </CardTitle>
            <CardDescription>Manage your account security</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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
