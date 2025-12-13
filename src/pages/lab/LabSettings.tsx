import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import {
  FlaskConical,
  Clock,
  CheckCircle,
  Home,
  Settings,
  HelpCircle,
  Search,
  Package,
  BarChart3,
  Bell,
  Lock,
  Building,
  Printer,
} from "lucide-react";

const navItems = [
  { title: "Dashboard", url: "/lab/dashboard", icon: Home },
  { title: "Pending Tests", url: "/lab/pending", icon: Clock },
  { title: "Completed", url: "/lab/completed", icon: CheckCircle },
  { title: "Sample Tracking", url: "/lab/samples", icon: Search },
  { title: "Inventory", url: "/lab/inventory", icon: Package },
  { title: "Reports", url: "/lab/reports", icon: BarChart3 },
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

  const [notifications, setNotifications] = useState({
    newTests: true,
    urgentTests: true,
    lowInventory: true,
    systemAlerts: true,
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
              <Bell className="h-5 w-5" />
              Notification Preferences
            </CardTitle>
            <CardDescription>Configure alert settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>New Test Requests</Label>
                <p className="text-sm text-muted-foreground">Get notified when new tests are ordered</p>
              </div>
              <Switch
                checked={notifications.newTests}
                onCheckedChange={(checked) =>
                  setNotifications({ ...notifications, newTests: checked })
                }
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Urgent Tests</Label>
                <p className="text-sm text-muted-foreground">Priority alerts for urgent test requests</p>
              </div>
              <Switch
                checked={notifications.urgentTests}
                onCheckedChange={(checked) =>
                  setNotifications({ ...notifications, urgentTests: checked })
                }
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Low Inventory Alerts</Label>
                <p className="text-sm text-muted-foreground">Get notified when supplies are running low</p>
              </div>
              <Switch
                checked={notifications.lowInventory}
                onCheckedChange={(checked) =>
                  setNotifications({ ...notifications, lowInventory: checked })
                }
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>System Alerts</Label>
                <p className="text-sm text-muted-foreground">Important system and maintenance notifications</p>
              </div>
              <Switch
                checked={notifications.systemAlerts}
                onCheckedChange={(checked) =>
                  setNotifications({ ...notifications, systemAlerts: checked })
                }
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Printer className="h-5 w-5" />
              Report Settings
            </CardTitle>
            <CardDescription>Configure report generation preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Default Report Format</Label>
                <Input defaultValue="PDF" />
              </div>
              <div className="space-y-2">
                <Label>Report Header</Label>
                <Input defaultValue="MedLab Diagnostics" />
              </div>
            </div>
            <Button variant="outline">Configure Report Template</Button>
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

export default LabSettings;
