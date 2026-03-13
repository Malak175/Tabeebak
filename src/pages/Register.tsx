import { useState, useMemo, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, EyeOff, ArrowLeft, UserRound, Heart, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { FieldError } from "@/components/ui/field-error";
import logo from "@/assets/logo.png";
import { useAuth, useRegisterMutation } from "@/hooks/useAuth";
import { routeByRole } from "@/services/auth.service";

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
  const [isLoading, setIsLoading] = useState(false);
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
      const hasNumber = /\d/.test(formData.password);
      const hasSpecial = /[!@#$%^&*()_+\-=()[\]{};':"\\|,.<>/?]/.test(formData.password);
      if (formData.password.length < 8 || !hasNumber || !hasSpecial) {
        e.password = "Password must be at least 8 characters and include numbers and special characters";
      }
    }

    // Confirm password
    if (touched.confirmPassword && formData.confirmPassword && formData.password !== formData.confirmPassword) {
      e.confirmPassword = "Passwords do not match";
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
    const hasValidPassword =
      formData.password.length >= 8 &&
      /\d/.test(formData.password) &&
      /[^A-Za-z0-9]/.test(formData.password);
    const passwordsMatch = formData.password === formData.confirmPassword;
    if (!hasPhone || !hasValidAge || !hasValidPassword || !passwordsMatch) {
      if (IS_DEV) {
        console.error("[FORM VALIDATION ERROR]", {
          form: "Register",
          hasPhone,
          hasValidAge,
          hasValidPassword,
          passwordsMatch,
        });
      }
      toast.error("Please fix the errors before submitting");
      return;
    }

    setIsLoading(true);
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
        onSettled: () => setIsLoading(false),
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
    <div className="min-h-screen flex">
      {/* Left Panel - Decorative */}
      <div className="hidden lg:flex lg:w-1/2 gradient-hero relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMtNi42MjcgMC0xMiA1LjM3My0xMiAxMnM1LjM3MyAxMiAxMiAxMiAxMi01LjM3MyAxMi0xMi01LjM3My0xMi0xMi0xMnoiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLW9wYWNpdHk9Ii4xIi8+PC9nPjwvc3ZnPg==')] opacity-20" />

        <div className="relative z-10 flex flex-col justify-center items-center w-full p-12 text-primary-foreground">
          <img src={logo} alt="TABEEBAK" className="h-24 w-24 object-contain rounded-full mb-8" />
          <h1 className="text-4xl font-bold mb-4">Join TABEEBAK</h1>
          <p className="text-xl text-primary-foreground/80 text-center max-w-md mb-12">
            Create your patient account and start your journey to better health.
          </p>

          <div className="bg-primary-foreground/10 backdrop-blur-sm rounded-2xl p-8 max-w-sm">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Heart className="h-5 w-5 animate-heartbeat" />
              Why Join Us?
            </h3>
            <ul className="space-y-3 text-sm text-primary-foreground/90">
              <li className="flex items-start gap-2">
                <span className="text-primary-foreground font-bold">✓</span>
                Book appointments with top doctors
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-foreground font-bold">✓</span>
                Access your medical records anytime
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-foreground font-bold">✓</span>
                View lab results online
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-foreground font-bold">✓</span>
                Secure and private platform
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Right Panel - Registration Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background overflow-y-auto">
        <div className="w-full max-w-md py-8">
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
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <UserRound className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">Patient Registration</CardTitle>
              <CardDescription>Create your account to access healthcare services</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      placeholder="John"
                      className={inputErrorClass("firstName")}
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value.toLowerCase() })}
                      onBlur={() => handleBlur("firstName")}
                      required
                    />
                    <FieldError message={errors.firstName} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      placeholder="Doe"
                      className={inputErrorClass("lastName")}
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value.toLowerCase() })}
                      onBlur={() => handleBlur("lastName")}
                      required
                    />
                    <FieldError message={errors.lastName} />
                  </div>
                </div>

                {/* Email with duplicate warning */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john.doe@example.com"
                    className={errors.email ? "border-amber-400/70 focus-visible:ring-amber-400/40" : ""}
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    onBlur={() => handleBlur("email")}
                    required
                  />
                  {errors.email && (
                    <div className="flex items-center gap-2 bg-destructive/5 border border-destructive/20 rounded-lg px-3 py-2 animate-fade-in">
                      <AlertTriangle className="h-4 w-4 text-destructive/70 shrink-0" />
                      <p className="text-xs font-medium text-destructive">{errors.email}</p>
                    </div>
                  )}
                </div>

                {/* Phone with digits-only filter */}
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

                <div className="grid grid-cols-2 gap-4">
                  {/* Date of birth with max date */}
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

                {/* Password with strength validation */}
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="At least 8 characters"
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

                {/* Confirm Password */}
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      className={inputErrorClass("confirmPassword")}
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      onBlur={() => handleBlur("confirmPassword")}
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <FieldError message={errors.confirmPassword} />
                </div>

                <label htmlFor="terms" className="flex items-start gap-3 cursor-pointer bg-muted/50 border border-input rounded-md px-3 py-3 hover:bg-muted transition-colors">
                  <input type="checkbox" id="terms" className="h-4 w-4 mt-0.5 rounded-none border-2 border-primary accent-primary" required />
                  <span className="text-sm text-foreground">
                    I agree to the{" "}
                    <Link to="/terms" className="text-primary hover:underline">
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link to="/privacy" className="text-primary hover:underline">
                      Privacy Policy
                    </Link>
                  </span>
                </label>

                <Button type="submit" variant="hero" className="w-full" size="lg" disabled={isLoading || hasErrors}>
                  {isLoading ? "Creating Account..." : "Create Account"}
                </Button>
              </form>

              <p className="text-center text-sm text-muted-foreground mt-6">
                Already have an account?{" "}
                <Link to="/login" className="text-primary font-medium hover:underline">
                  Sign in here
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Register;
