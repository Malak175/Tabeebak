import { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserRound, Stethoscope, FlaskConical, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { FieldError } from "@/components/ui/field-error";
import logo from "@/assets/logo.png";
import { routeByRole } from "@/lib/auth";
import { useAuth, useSignInMutation } from "@/hooks/useAuth";
import { Alert, AlertDescription } from "@/components/ui/alert";

type LoginRole = "patient" | "doctor" | "laboratory";
const IS_DEV = import.meta.env.DEV;

type FieldErrors = {
  email?: string;
  password?: string;
};

const Login = () => {
  const navigate = useNavigate();
  const { authBootstrapError, isAuthenticated, isBootstrappingAuth, user, logout } = useAuth();
  const signInMutation = useSignInMutation();
  const [selectedRole, setSelectedRole] = useState<LoginRole>("patient");
  const [showPassword, setShowPassword] = useState(false);
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

  useEffect(() => {
    if (!IS_DEV) return;
    if (Object.keys(errors).length > 0) {
      console.error("[FORM VALIDATION ERROR]", { form: "Login", errors });
    }
  }, [errors]);

  const inputErrorClass = (field: keyof FieldErrors) =>
    errors[field] ? "border-destructive/60 focus-visible:ring-destructive/40" : "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (IS_DEV) {
      console.log("[FORM SUBMIT]", { form: "Login", formValues: formData });
    }
    setTouched({ email: true, password: true });

    if (!formData.email.trim() || !formData.password || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      if (IS_DEV) {
        console.error("[FORM VALIDATION ERROR]", {
          form: "Login",
          emailValid: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email),
          hasPassword: Boolean(formData.password),
        });
      }
      toast.error("Please fix the errors before submitting");
      return;
    }

    signInMutation.mutate(
      { email: formData.email.trim(), password: formData.password },
      {
        onSuccess: (me) => {
          const selectedRoleMap: Record<LoginRole, "Patient" | "Doctor" | "Lab"> = {
            patient: "Patient",
            doctor: "Doctor",
            laboratory: "Lab",
          };

          const requestedRole = selectedRoleMap[selectedRole];
          if (me.role !== requestedRole) {
            logout();
            toast.error(`This account is not a ${selectedRole} account.`);
            return;
          }

          toast.success("Welcome back!");
          navigate(routeByRole(me.role));
        },
        onError: (error: Error) => {
          toast.error(error.message);
        },
      },
    );
  };

  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(routeByRole(user.role), { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

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
    <div className="min-h-screen flex">
      {/* Left Panel - Decorative */}
      <div className="hidden lg:flex lg:w-1/2 gradient-hero relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMtNi42MjcgMC0xMiA1LjM3My0xMiAxMnM1LjM3MyAxMiAxMiAxMiAxMi01LjM3MyAxMi0xMi01LjM3My0xMi0xMi0xMnoiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLW9wYWNpdHk9Ii4xIi8+PC9nPjwvc3ZnPg==')] opacity-20" />

        <div className="relative z-10 flex flex-col justify-center items-center w-full p-12 text-primary-foreground">
          <img src={logo} alt="TABEEBAK" className="h-24 w-24 object-contain rounded-full mb-8" />
          <h1 className="text-4xl font-bold mb-4">Welcome to TABEEBAK</h1>
          <p className="text-xl text-primary-foreground/80 text-center max-w-md">
            Your trusted healthcare platform connecting patients, doctors, and laboratories.
          </p>

          <div className="mt-12 grid grid-cols-3 gap-8">
            {[
              { icon: UserRound, label: "Patients" },
              { icon: Stethoscope, label: "Doctors" },
              { icon: FlaskConical, label: "Labs" },
            ].map((item) => (
              <div key={item.label} className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary-foreground/20 flex items-center justify-center mx-auto mb-2">
                  <item.icon className="h-8 w-8" />
                </div>
                <span className="text-sm">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">
          <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>

          <div className="lg:hidden flex items-center gap-3 mb-8">
            <img src={logo} alt="TABEEBAK" className="h-10 w-10 object-contain rounded-full" />
            <span className="text-2xl font-bold text-gradient">TABEEBAK</span>
          </div>

          <Card className="border-0 shadow-xl">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl">Sign In</CardTitle>
              <CardDescription>Choose your role and enter your credentials</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Role Selection Tabs */}
              <Tabs value={selectedRole} onValueChange={(v) => setSelectedRole(v as LoginRole)} className="mb-6">
                <TabsList className="grid h-auto w-full grid-cols-3 gap-0 rounded-xl bg-muted p-1 overflow-hidden">
                  {(["patient", "doctor", "laboratory"] as const).map((role) => {
                    const Icon = roleIcons[role];
                    return (
                      <TabsTrigger
                        key={role}
                        value={role}
                        className="h-full w-full min-w-0 flex flex-col items-center justify-center gap-1 rounded-lg px-2 py-2 text-center data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                      >
                        <Icon className="h-4 w-4" />
                        <span className="text-xs capitalize leading-tight">{role}</span>
                      </TabsTrigger>
                    );
                  })}
                </TabsList>
              </Tabs>

              <form onSubmit={handleSubmit} className="space-y-4">
                {authBootstrapError && !isBootstrappingAuth && (
                  <Alert variant="destructive">
                    <AlertDescription>{authBootstrapError.message}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    className={inputErrorClass("email")}
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    onBlur={() => handleBlur("email")}
                    required
                  />
                  <FieldError message={errors.email} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      className={inputErrorClass("password")}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      onBlur={() => handleBlur("password")}
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <FieldError message={errors.password} />
                </div>

                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-3 cursor-pointer bg-muted/50 border border-input rounded-md px-3 py-2 hover:bg-muted transition-colors">
                    <input type="checkbox" className="h-4 w-4 rounded-none border-2 border-primary accent-primary" />
                    <span className="text-foreground">Remember me</span>
                  </label>
                  <Link to="/forgot-password" className="text-primary hover:underline">
                    Forgot password?
                  </Link>
                </div>

                <Button
                  type="submit"
                  variant="hero"
                  className="w-full"
                  size="lg"
                  disabled={signInMutation.isPending || hasErrors}
                >
                  {signInMutation.isPending
                    ? "Signing in..."
                    : `Sign In as ${selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}`}
                </Button>
              </form>

              {selectedRole === "patient" && (
                <p className="text-center text-sm text-muted-foreground mt-6">
                  Don't have an account?{" "}
                  <Link to="/register" className="text-primary font-medium hover:underline">
                    Register here
                  </Link>
                </p>
              )}

              {selectedRole !== "patient" && (
                <p className="text-center text-sm text-muted-foreground mt-6">
                  {selectedRole === "doctor" ? "Doctor" : "Laboratory"} accounts are created by administrators.
                  <br />
                  <Link to={`/contact?role=${selectedRole === "doctor" ? "Doctor" : "Lab"}`} className="text-primary hover:underline">
                    Contact us for access
                  </Link>
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Login;
