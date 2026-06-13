import { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { UserRound, Stethoscope, FlaskConical, Eye, EyeOff, ArrowLeft, Mail, Lock } from "lucide-react";
import { toast } from "sonner";
import { FieldError } from "@/components/ui/field-error";
import AuthLayout from "@/components/auth/AuthLayout";
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

  return (
    <AuthLayout backHref="/" backLabel="Back to Home">
      <CardHeader className="text-center pb-2">
        <CardTitle className="text-3xl font-bold tracking-tight">Sign in to TABEEBAK</CardTitle>
        <CardDescription className="mx-auto max-w-xl text-sm text-muted-foreground">
          Secure access for patients, doctors, and laboratories. Choose the right role and sign in to continue.
        </CardDescription>
      </CardHeader>

      <div className="space-y-6">
        <section>
          <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-muted-foreground mb-3">Select your role</p>
          <div role="tablist" aria-label="Role selection" className="grid gap-3 sm:grid-cols-3">
            {([
              { id: "patient", title: "Patient", subtitle: "Access appointments and health records", icon: UserRound },
              { id: "doctor", title: "Doctor", subtitle: "Review patient requests and care plans", icon: Stethoscope },
              { id: "laboratory", title: "Laboratory", subtitle: "Manage lab orders and results", icon: FlaskConical },
            ] as const).map((option) => {
              const Icon = option.icon;
              const active = selectedRole === option.id;

              return (
                <button
                  key={option.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setSelectedRole(option.id)}
                  className={`group flex min-h-[138px] flex-col justify-between rounded-[1.5rem] border p-4 text-left transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 ${active
                    ? "border-primary bg-primary/10 shadow-lg shadow-primary/10 dark:bg-primary/15"
                    : "border-border bg-card hover:border-primary/70 hover:bg-primary/5 dark:bg-slate-900/70 dark:hover:bg-slate-800/70"
                    }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-sm dark:bg-primary/15">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.35em] ${active ? "bg-primary text-primary-foreground" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"}`}>
                      {active ? "Active" : "Select"}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">{option.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{option.subtitle}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        <form onSubmit={handleSubmit} className="space-y-4">
          {authBootstrapError && !isBootstrappingAuth && (
            <Alert variant="destructive">
              <AlertDescription>{authBootstrapError.message}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-3">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="john.doe@example.com"
                className={`pl-10 ${inputErrorClass("email")}`}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                onBlur={() => handleBlur("email")}
                required
              />
            </div>
            <FieldError message={errors.email} />
          </div>

          <div className="space-y-3">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                className={`pl-10 ${inputErrorClass("password")}`}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                onBlur={() => handleBlur("password")}
                required
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition hover:text-foreground"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <FieldError message={errors.password} />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between text-sm">
            <label className="inline-flex items-center gap-3 rounded-full border border-input bg-muted/60 px-3 py-2 transition hover:border-primary hover:bg-muted dark:bg-muted/30">
              <input type="checkbox" className="h-4 w-4 rounded-sm border-2 border-primary accent-primary" />
              <span className="text-sm">Remember me</span>
            </label>
            <Link to="/forgot-password" className="text-primary hover:underline">
              Forgot password?
            </Link>
          </div>

          <Button type="submit" variant="hero" className="w-full" size="lg" disabled={signInMutation.isPending || hasErrors}>
            {signInMutation.isPending
              ? "Signing in..."
              : `Sign in as ${selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}`}
          </Button>
        </form>

        <div className="border-t border-border/80 pt-4 text-center text-sm text-muted-foreground">
          {selectedRole === "patient" ? (
            <>
              Don't have an account?{" "}
              <Link to="/register" className="text-primary font-medium hover:underline">
                Register here
              </Link>
            </>
          ) : (
            <>
              {selectedRole === "doctor" ? "Doctor" : "Laboratory"} accounts are created by administrators.
              <br />
              <Link to={`/contact?role=${selectedRole === "doctor" ? "Doctor" : "Lab"}`} className="text-primary hover:underline">
                Contact us for access
              </Link>
            </>
          )}
        </div>
      </div>
    </AuthLayout>
  );
};

export default Login;
