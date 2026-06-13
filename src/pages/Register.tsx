import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CardContent, CardHeader, CardDescription, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, EyeOff, ArrowLeft, UserRound, Mail, Lock } from "lucide-react";
import { toast } from "sonner";
import { FieldError } from "@/components/ui/field-error";
import AuthLayout from "@/components/auth/AuthLayout";
import { useAuth, useRegisterMutation } from "@/hooks/useAuth";
import { routeByRole } from "@/lib/auth";
import {
  PASSWORD_POLICY_MESSAGE,
  PASSWORDS_DO_NOT_MATCH_MESSAGE,
  isPasswordPolicyValid,
  passwordsMatch,
} from "@/lib/password-policy";

const IS_DEV = import.meta.env.DEV;

type FieldErrors = {
  firstName?: string;
  lastName?: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  password?: string;
  confirmPassword?: string;
  email?: string;
};

const Register = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const registerMutation = useRegisterMutation();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    gender: "",
    password: "",
    confirmPassword: "",
  });

  const maxDateOfBirth = useMemo(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - 18);
    return d.toISOString().split("T")[0];
  }, []);

  const errors = useMemo<FieldErrors>(() => {
    const e: FieldErrors = {};

    // Required empty checks
    if (touched.firstName && !formData.firstName.trim()) {
      e.firstName = "Please fill out this field";
    }
    if (touched.lastName && !formData.lastName.trim()) {
      e.lastName = "Please fill out this field";
    }
    if (touched.email && !formData.email.trim()) {
      e.email = "Please fill out this field";
    }
    if (touched.phone && !formData.phone) {
      e.phone = "Please fill out this field";
    }
    if (touched.dateOfBirth && !formData.dateOfBirth) {
      e.dateOfBirth = "Please fill out this field";
    }
    if (touched.gender && !formData.gender) {
      e.gender = "Please fill out this field";
    }
    if (touched.password && !formData.password) {
      e.password = "Please fill out this field";
    }
    if (touched.confirmPassword && !formData.confirmPassword) {
      e.confirmPassword = "Please fill out this field";
    }

    // Phone
    if (touched.phone && formData.phone) {
      if (!/^\d*$/.test(formData.phone)) {
        e.phone = "Phone number must contain numbers only";
      } else if (formData.phone.length !== 11) {
        e.phone = "Phone number must be exactly 11 digits";
      }
    }

    // Date of birth - must be at least 18
    if (touched.dateOfBirth && formData.dateOfBirth) {
      const birth = new Date(formData.dateOfBirth);
      const today = new Date();
      let age = today.getFullYear() - birth.getFullYear();
      const m = today.getMonth() - birth.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
      if (age < 18) {
        e.dateOfBirth = "You must be at least 18 years old";
      }
    }

    // Password
    if (touched.password && formData.password) {
      if (!isPasswordPolicyValid(formData.password)) {
        e.password = PASSWORD_POLICY_MESSAGE;
      }
    }

    // Confirm password
    if (touched.confirmPassword && formData.confirmPassword && !passwordsMatch(formData.password, formData.confirmPassword)) {
      e.confirmPassword = PASSWORDS_DO_NOT_MATCH_MESSAGE;
    }

    // Email format + duplicate check
    if (touched.email && formData.email) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        e.email = "Please enter a valid email address (e.g. name@example.com)";
      }
    }

    return e;
  }, [formData, touched]);

  const hasErrors = Object.keys(errors).length > 0;

  useEffect(() => {
    if (!IS_DEV) return;
    if (Object.keys(errors).length > 0) {
      console.error("[FORM VALIDATION ERROR]", { form: "Register", errors });
    }
  }, [errors]);

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handlePhoneChange = (value: string) => {
    // Only allow digits
    const digits = value.replace(/\D/g, "").slice(0, 11);
    setFormData({ ...formData, phone: digits });
  };

  const normalizePhoneToE164 = (value: string) => {
    const digits = value.replace(/\D/g, "");
    if (digits.startsWith("0")) {
      return `+20${digits.slice(1)}`;
    }
    return `+${digits}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (IS_DEV) {
      console.log("[FORM SUBMIT]", { form: "Register", formValues: formData });
    }

    // Touch all fields to show errors
    setTouched({ firstName: true, lastName: true, phone: true, dateOfBirth: true, password: true, confirmPassword: true, email: true, gender: true });

    // Re-validate
    const hasPhone = formData.phone && /^\d{11}$/.test(formData.phone);
    const hasValidAge = (() => {
      if (!formData.dateOfBirth) return false;
      const birth = new Date(formData.dateOfBirth);
      const today = new Date();
      let age = today.getFullYear() - birth.getFullYear();
      const m = today.getMonth() - birth.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
      return age >= 18;
    })();
    const hasValidPassword = isPasswordPolicyValid(formData.password);
    const confirmPasswordMatches = passwordsMatch(formData.password, formData.confirmPassword);
    if (!hasPhone || !hasValidAge || !hasValidPassword || !confirmPasswordMatches) {
      if (IS_DEV) {
        console.error("[FORM VALIDATION ERROR]", {
          form: "Register",
          hasPhone,
          hasValidAge,
          hasValidPassword,
          passwordsMatch: confirmPasswordMatches,
        });
      }
      toast.error("Please fix the errors before submitting");
      return;
    }

    registerMutation.mutate(
      {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        phone: normalizePhoneToE164(formData.phone),
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        password: formData.password,
        role: "Patient",
      },
      {
        onSuccess: () => {
          toast.success("Registration successful. Please sign in to continue.");
          navigate("/login");
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

  const inputErrorClass = (field: keyof FieldErrors) =>
    errors[field] ? "border-destructive/60 focus-visible:ring-destructive/40" : "";

  return (
    <AuthLayout backHref="/" backLabel="Back to Home">
      <CardHeader className="text-center pb-2">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary dark:bg-primary/15">
          <UserRound className="h-8 w-8" />
        </div>
        <CardTitle className="text-3xl font-bold tracking-tight">Patient Registration</CardTitle>
        <CardDescription className="mx-auto max-w-xl text-sm text-muted-foreground">
          Create your patient account to book appointments, track health records, and receive care.
        </CardDescription>
      </CardHeader>

      <div className="space-y-6">
        <div className="rounded-3xl border border-border/80 bg-card p-5 text-sm text-muted-foreground dark:bg-slate-900/70">
          <p className="font-semibold">For patient accounts only</p>
          <p className="mt-2">
            Doctor and laboratory access is provisioned by administrators. If you represent a healthcare provider,
            please contact support.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <div className="relative">
                <UserRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="firstName"
                  placeholder="John"
                  className={`pl-10 ${inputErrorClass("firstName")}`}
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  onBlur={() => handleBlur("firstName")}
                  required
                />
              </div>
              <FieldError message={errors.firstName} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <div className="relative">
                <UserRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="lastName"
                  placeholder="Doe"
                  className={`pl-10 ${inputErrorClass("lastName")}`}
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  onBlur={() => handleBlur("lastName")}
                  required
                />
              </div>
              <FieldError message={errors.lastName} />
            </div>
          </div>

          <div className="space-y-2">
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

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              inputMode="numeric"
              placeholder="01234567890"
              className={inputErrorClass("phone")}
              value={formData.phone}
              onChange={(e) => handlePhoneChange(e.target.value)}
              onBlur={() => handleBlur("phone")}
              required
            />
            <FieldError message={errors.phone} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Date of Birth</Label>
              <Input
                id="dateOfBirth"
                type="date"
                max={maxDateOfBirth}
                className={inputErrorClass("dateOfBirth")}
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                onBlur={() => handleBlur("dateOfBirth")}
                required
              />
              <FieldError message={errors.dateOfBirth} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <Select
                value={formData.gender}
                onValueChange={(value) => {
                  setFormData({ ...formData, gender: value });
                  setTouched((prev) => ({ ...prev, gender: true }));
                }}
              >
                <SelectTrigger className={errors.gender ? "border-destructive/60 focus-visible:ring-destructive/40" : ""}>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                </SelectContent>
              </Select>
              <FieldError message={errors.gender} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="At least 8 characters"
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

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm your password"
                className={`pl-10 ${inputErrorClass("confirmPassword")}`}
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                onBlur={() => handleBlur("confirmPassword")}
                required
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition hover:text-foreground"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <FieldError message={errors.confirmPassword} />
          </div>

          <label htmlFor="terms" className="flex items-start gap-3 cursor-pointer rounded-3xl border border-input bg-muted/50 px-4 py-3 transition hover:border-primary hover:bg-muted dark:bg-muted/30">
            <input type="checkbox" id="terms" className="h-4 w-4 mt-1 rounded-sm border-2 border-primary accent-primary" required />
            <span className="text-sm text-foreground">
              I agree to the{' '}
              <Link to="/terms" className="text-primary hover:underline">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link to="/privacy" className="text-primary hover:underline">
                Privacy Policy
              </Link>
            </span>
          </label>

          <Button type="submit" variant="hero" className="w-full" size="lg" disabled={registerMutation.isPending || hasErrors}>
            {registerMutation.isPending ? "Creating Account..." : "Create Account"}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-4">
          Already have an account?{' '}
          <Link to="/login" className="text-primary font-medium hover:underline">
            Sign in here
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default Register;
