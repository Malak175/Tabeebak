import { useEffect, useState } from "react";
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
import { useAuth, useChangePasswordMutation, useUpdateProfileMutation } from "@/hooks/useAuth";
import { toast } from "sonner";
import { validatePasswordPolicy } from "@/lib/password-policy";

const navItems = [
  { title: "Dashboard", url: "/lab/dashboard", icon: Home },
  { title: "Pending Tests", url: "/lab/pending", icon: Clock },
  { title: "Completed", url: "/lab/completed", icon: CheckCircle },
  { title: "Settings", url: "/lab/settings", icon: Settings },
  { title: "Help", url: "/lab/help", icon: HelpCircle },
];

const LabSettings = () => {
  const { user } = useAuth();
  const updateProfileMutation = useUpdateProfileMutation();
  const changePasswordMutation = useChangePasswordMutation();

  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
  });

  useEffect(() => {
    if (!user) return;
    setForm({
      name: user.name ?? "",
      phone: user.phone ?? "",
      address: "",
    });
  }, [user]);

  const submitProfile = () => {
    updateProfileMutation.mutate(
      { name: form.name, phone: form.phone },
      {
        onSuccess: () => toast.success("Laboratory profile updated successfully"),
        onError: (error: Error) => toast.error(error.message),
      },
    );
  };

  const submitPassword = () => {
    const passwordError = validatePasswordPolicy(passwordForm.newPassword);
    if (passwordError) {
      toast.error(passwordError);
      return;
    }

    changePasswordMutation.mutate(passwordForm, {
      onSuccess: (response) => {
        toast.success(response.message);
        setPasswordForm({ currentPassword: "", newPassword: "" });
      },
      onError: (error: Error) => toast.error(error.message),
    });
  };

  return (
    <DashboardLayout
      userRole="laboratory"
      userName={user?.name ?? "Laboratory"}
      userSubtitle={user?.role ?? "Lab"}
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
                <Input id="name" value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={user?.email ?? ""} disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" value={form.phone} onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input id="address" value={form.address} onChange={(event) => setForm((current) => ({ ...current, address: event.target.value }))} />
            </div>
            <Button onClick={submitProfile} disabled={updateProfileMutation.isPending}>Save Changes</Button>
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
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input id="currentPassword" type="password" value={passwordForm.currentPassword} onChange={(event) => setPasswordForm((current) => ({ ...current, currentPassword: event.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input id="newPassword" type="password" value={passwordForm.newPassword} onChange={(event) => setPasswordForm((current) => ({ ...current, newPassword: event.target.value }))} />
            </div>
            <Button variant="outline" onClick={submitPassword} disabled={changePasswordMutation.isPending}>Update</Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default LabSettings;
