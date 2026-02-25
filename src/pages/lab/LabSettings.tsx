import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import {
  FlaskConical,
  Clock,
  CheckCircle,
  Home,
  Settings,
  HelpCircle,
  Lock,
  Building,
} from "lucide-react";

const navItems = [
  { title: "Dashboard", url: "/lab/dashboard", icon: Home },
  { title: "Pending Tests", url: "/lab/pending", icon: Clock },
  { title: "Completed", url: "/lab/completed", icon: CheckCircle },
  { title: "Settings", url: "/lab/settings", icon: Settings },
  { title: "Help", url: "/lab/help", icon: HelpCircle },
];

const LabSettings = () => {
  const [lab] = useState({
    name: "MedLab Diagnostics",
    certification: "NABL Certified",
    email: "contact@medlab.com",
    phone: "+1 234 567 8900",
    address: "123 Medical Center Drive, Healthcare City",
  });

  return (
    <DashboardLayout
      userRole="laboratory"
      userName={lab.name}
      userSubtitle={lab.certification}
      navItems={navItems}
      userIcon={FlaskConical}
    >
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground">Manage laboratory settings and preferences</p>
      </div>

      <div className="max-w-3xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Laboratory Information
            </CardTitle>
            <CardDescription>Update your laboratory details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Laboratory Name</Label>
                <Input id="name" defaultValue={lab.name} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="certification">Certification</Label>
                <Input id="certification" defaultValue={lab.certification} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" defaultValue={lab.email} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" defaultValue={lab.phone} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input id="address" defaultValue={lab.address} />
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
            <CardDescription>Manage security settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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

export default LabSettings;
