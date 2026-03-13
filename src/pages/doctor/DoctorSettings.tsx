import { useEffect, useState } from "react";
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
  Lock,
  User,
} from "lucide-react";
import { useAuth, useChangePasswordMutation, useUpdateProfileMutation } from "@/hooks/useAuth";
import { toast } from "sonner";
import { validatePasswordPolicy } from "@/lib/password-policy";

const navItems = [
  { title: "Dashboard", url: "/doctor/dashboard", icon: Home },
  { title: "Appointments", url: "/doctor/appointments", icon: Calendar },
  { title: "Patients", url: "/doctor/patients", icon: Users },
  { title: "Schedule", url: "/doctor/schedule", icon: Clock },
  { title: "Settings", url: "/doctor/settings", icon: Settings },
  { title: "Help", url: "/doctor/help", icon: HelpCircle },
];

const DoctorSettings = () => {
  const { user } = useAuth();
  const updateProfileMutation = useUpdateProfileMutation();
  const changePasswordMutation = useChangePasswordMutation();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    bio: "",
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
  });

  useEffect(() => {
    if (!user) return;
    const [firstName = "", lastName = ""] = (user.name ?? "").split(" ");
    setForm({
      firstName: user.firstName ?? firstName,
      lastName: user.lastName ?? lastName,
      phone: user.phone ?? "",
      bio: "",
    });
  }, [user]);

  const submitProfile = () => {
    updateProfileMutation.mutate(
      {
        firstName: form.firstName,
        lastName: form.lastName,
        phone: form.phone,
      },
      {
        onSuccess: () => toast.success("Profile updated successfully"),
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
      userRole="doctor"
      userName={user?.name ?? "Doctor"}
      userSubtitle={user?.role ?? "Doctor"}
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
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" value={form.firstName} onChange={(event) => setForm((current) => ({ ...current, firstName: event.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" value={form.lastName} onChange={(event) => setForm((current) => ({ ...current, lastName: event.target.value }))} />
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
              <Label htmlFor="bio">Professional Bio</Label>
              <Textarea id="bio" value={form.bio} onChange={(event) => setForm((current) => ({ ...current, bio: event.target.value }))} />
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
            <CardDescription>Manage your account security</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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

export default DoctorSettings;
