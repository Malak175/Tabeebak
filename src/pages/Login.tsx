import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserRound, Stethoscope, FlaskConical, Mail, Lock, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { FieldError } from "@/components/ui/field-error";
import logo from "@/assets/logo.png";

type UserRole = "patient" | "doctor" | "laboratory";

type FieldErrors = {
  email?: string;
  password?: string;
};

const Login = () => {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<UserRole>("patient");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const errors = useMemo<FieldErrors>(() => {
    const e: FieldErrors = {};

    if (touched.email && !formData.email.trim()) {
      e.email = "Please fill out this field";
    } else if (touched.email && formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      e.email = "Please enter a valid email address (e.g. name@example.com)";
    }

    if (touched.password && !formData.password) {
      e.password = "Please fill out this field";
    }

    return e;
  }, [formData, touched]);

  const hasErrors = Object.keys(errors).length > 0;

  const inputErrorClass = (field: keyof FieldErrors) =>
    errors[field] ? "border-destructive/60 focus-visible:ring-destructive/40" : "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ email: true, password: true });

    if (!formData.email.trim() || !formData.password || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast.error("Please fix the errors before submitting");
      return;
    }

    setIsLoading(true);

    // Simulate login
    setTimeout(() => {
      setIsLoading(false);
      toast.success(`Welcome back! Logged in as ${selectedRole}`);

      // Navigate to appropriate dashboard
      switch (selectedRole) {
        case "patient":
          navigate("/patient/dashboard");
          break;
        case "doctor":
          navigate("/doctor/dashboard");
          break;
        case "laboratory":
          navigate("/lab/dashboard");
          break;
      }
    }, 1500);
  };

  const roleIcons = {
    patient: UserRound,
    doctor: Stethoscope,
    laboratory: FlaskConical,
  };

  const roleColors = {
    patient: "primary",
    doctor: "secondary",
    laboratory: "primary",
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto flex min-h-screen flex-col lg:flex-row">
        <div className="relative hidden w-full lg:flex lg:w-1/2 items-center justify-center overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950 to-primary px-12 py-16">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.18),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(255,255,255,0.08),_transparent_40%)]" />
          <div className="relative z-10 max-w-xl text-white">
            <img src={logo} alt="TABEEBAK" className="h-24 w-24 rounded-full border border-white/20 object-cover shadow-xl" />
            <h1 className="mt-8 text-4xl font-semibold tracking-tight">Welcome to TABEEBAK</h1>
            <p className="mt-4 max-w-md text-base leading-7 text-white/80">
              Your trusted healthcare platform connecting patients, doctors, and laboratories with clarity and confidence.
            </p>
            <div className="mt-12 grid grid-cols-3 gap-6">
              {[
                { icon: UserRound, label: "Patients" },
                { icon: Stethoscope, label: "Doctors" },
                { icon: FlaskConical, label: "Labs" },
              ].map((item) => (
                <div key={item.label} className="rounded-3xl border border-white/10 bg-white/10 p-5 text-center shadow-sm backdrop-blur-sm transition-all hover:-translate-y-1 hover:bg-white/15">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl bg-white/10 text-white shadow-sm">
                    <item.icon className="h-6 w-6" />
                  </div>
                  <p className="mt-4 text-sm font-medium text-white/90">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex w-full lg:w-1/2 items-center justify-center px-6 py-10 sm:px-10">
          <div className="w-full max-w-md">
            <Link to="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white mb-8 transition-colors">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>

            <div className="lg:hidden flex items-center gap-3 mb-8">
              <img src={logo} alt="TABEEBAK" className="h-10 w-10 object-contain rounded-full" />
              <span className="text-2xl font-semibold text-slate-900 dark:text-white">TABEEBAK</span>
            </div>

            <Card className="overflow-hidden rounded-[28px] border border-slate-200/70 bg-white/95 shadow-[0_30px_80px_-30px_rgba(15,23,42,0.25)] transition-transform duration-300 hover:-translate-y-1 dark:border-slate-700/70 dark:bg-slate-900/95">
              <CardHeader className="text-center pb-0">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary shadow-sm">
                  <UserRound className="h-7 w-7" />
                </div>
                <CardTitle className="text-3xl">Sign In</CardTitle>
                <CardDescription className="mx-auto mt-2 max-w-xs text-base text-slate-500 dark:text-slate-400">
                  Secure access for patients, doctors, and laboratories.
                </CardDescription>
              </CardHeader>
              <CardContent className="px-8 pt-6 pb-8">
                <Tabs value={selectedRole} onValueChange={(v) => setSelectedRole(v as UserRole)} className="mb-6">
                  <TabsList className="grid grid-cols-3 gap-2 rounded-2xl bg-slate-100 p-1 dark:bg-slate-800">
                    {(["patient", "doctor", "laboratory"] as const).map((role) => {
                      const Icon = roleIcons[role];
                      return (
                        <TabsTrigger
                          key={role}
                          value={role}
                          className="flex flex-col items-center justify-center gap-1 rounded-xl border border-transparent bg-transparent px-3 py-3 text-xs font-semibold text-slate-600 transition-all duration-200 hover:border-slate-300 hover:bg-white hover:text-slate-900 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm dark:text-slate-300 dark:hover:bg-slate-700"
                        >
                          <Icon className="h-4 w-4" />
                          <span className="capitalize">{role}</span>
                        </TabsTrigger>
                      );
                    })}
                  </TabsList>
                </Tabs>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                        <Mail className="h-4 w-4" />
                      </div>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        className={`pl-10 ${inputErrorClass("email")}`}
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        onBlur={() => handleBlur("email")}
                        required
                      />
                    </div>
                    <FieldError message={errors.email} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                        <Lock className="h-4 w-4" />
                      </div>
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        className={`pl-10 pr-12 ${inputErrorClass("password")}`}
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        onBlur={() => handleBlur("password")}
                        required
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-2"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    <FieldError message={errors.password} />
                  </div>

                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between text-sm">
                    <label className="inline-flex items-center gap-3 rounded-full border border-input bg-muted/50 px-3 py-2 text-slate-600 transition-colors hover:bg-muted hover:text-slate-900 dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-300">
                      <input type="checkbox" className="h-4 w-4 rounded-sm border-primary accent-primary" />
                      <span>Remember me</span>
                    </label>
                    <Link to="/forgot-password" className="text-primary hover:underline">
                      Forgot password?
                    </Link>
                  </div>

                  <Button type="submit" variant="hero" className="w-full tracking-wide" size="lg" disabled={isLoading || hasErrors}>
                    {isLoading ? "Signing in..." : `Sign In as ${selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}`}
                  </Button>
                </form>

                {selectedRole === "patient" && (
                  <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-6">
                    Don't have an account?{" "}
                    <Link to="/register" className="text-primary font-medium hover:underline">
                      Register here
                    </Link>
                  </p>
                )}

                {selectedRole !== "patient" && (
                  <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-6">
                    {selectedRole === "doctor" ? "Doctor" : "Laboratory"} accounts are created by administrators.
                    <br />
                    <Link to="/contact" className="text-primary hover:underline">
                      Contact us for access
                    </Link>
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
