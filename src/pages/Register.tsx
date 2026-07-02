import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, EyeOff, ArrowLeft, UserRound, Heart, AlertTriangle, Mail, Lock, Phone, CalendarDays } from "lucide-react";
import { toast } from "sonner";
import { FieldError } from "@/components/ui/field-error";
import logo from "@/assets/logo.png";

const SIMULATED_EXISTING_EMAILS = ["test@example.com", "john@example.com", "admin@tabeebak.com"];

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
    d.setFullYear(d.getFullYear() - 16);
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

    // Date of birth - must be at least 16
    if (touched.dateOfBirth && formData.dateOfBirth) {
      const birth = new Date(formData.dateOfBirth);
      const today = new Date();
      let age = today.getFullYear() - birth.getFullYear();
      const m = today.getMonth() - birth.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
      if (age < 16) {
        e.dateOfBirth = "You must be at least 16 years old";
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
      } else if (SIMULATED_EXISTING_EMAILS.includes(formData.email.toLowerCase())) {
        e.email = "This email is already registered";
      }
    }

    return e;
  }, [formData, touched]);

  const hasErrors = Object.keys(errors).length > 0;

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handlePhoneChange = (value: string) => {
    // Only allow digits
    const digits = value.replace(/\D/g, "").slice(0, 11);
    setFormData({ ...formData, phone: digits });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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
      return age >= 16;
    })();
    const hasValidPassword =
      formData.password.length >= 8 &&
      /\d/.test(formData.password) &&
      /[^A-Za-z0-9]/.test(formData.password);
    const passwordsMatch = formData.password === formData.confirmPassword;
    const emailNotTaken = !SIMULATED_EXISTING_EMAILS.includes(formData.email.toLowerCase());

    if (!hasPhone || !hasValidAge || !hasValidPassword || !passwordsMatch || !emailNotTaken) {
      toast.error("Please fix the errors before submitting");
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast.success("Registration successful! Please login to continue.");
      navigate("/login");
    }, 1500);
  };

  const inputErrorClass = (field: keyof FieldErrors) =>
    errors[field] ? "border-destructive/60 focus-visible:ring-destructive/40" : "";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto flex min-h-screen flex-col lg:flex-row">
        <div className="relative hidden w-full lg:flex lg:w-1/2 items-center justify-center overflow-hidden bg-gradient-to-br from-blue-950 via-slate-950 to-primary px-12 py-16">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.16),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(255,255,255,0.08),_transparent_40%)]" />
          <div className="relative z-10 max-w-xl text-white">
            <img src={logo} alt="TABEEBAK" className="h-24 w-24 rounded-full border border-white/20 object-cover shadow-xl" />
            <h1 className="mt-8 text-4xl font-semibold tracking-tight">Join TABEEBAK</h1>
            <p className="mt-4 max-w-md text-base leading-7 text-white/80">
              Create your patient account and start your journey to better health.
            </p>
            <div className="mt-12 rounded-3xl border border-white/10 bg-white/10 p-8 shadow-sm backdrop-blur-sm">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-white">
                <Heart className="h-5 w-5 animate-heartbeat" />
                Why Join Us?
              </h3>
              <ul className="space-y-3 text-sm text-white/80">
                <li className="flex items-start gap-2">
                  <span className="text-white font-bold">✓</span>
                  Book appointments with top doctors
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-white font-bold">✓</span>
                  Access your medical records anytime
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-white font-bold">✓</span>
                  View lab results online
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-white font-bold">✓</span>
                  Secure and private platform
                </li>
              </ul>
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
                <CardTitle className="text-3xl">Patient Registration</CardTitle>
                <CardDescription className="mx-auto mt-2 max-w-xs text-base text-slate-500 dark:text-slate-400">
                  Create your account to access healthcare services.
                </CardDescription>
              </CardHeader>
              <CardContent className="px-8 pt-6 pb-8">
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                          <UserRound className="h-4 w-4" />
                        </div>
                        <Input
                          id="firstName"
                          placeholder="John"
                          className={`pl-10 ${inputErrorClass("firstName")}`}
                          value={formData.firstName}
                          onChange={(e) => setFormData({ ...formData, firstName: e.target.value.toLowerCase() })}
                          onBlur={() => handleBlur("firstName")}
                          required
                        />
                      </div>
                      <FieldError message={errors.firstName} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                          <UserRound className="h-4 w-4" />
                        </div>
                        <Input
                          id="lastName"
                          placeholder="Doe"
                          className={`pl-10 ${inputErrorClass("lastName")}`}
                          value={formData.lastName}
                          onChange={(e) => setFormData({ ...formData, lastName: e.target.value.toLowerCase() })}
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
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                        <Mail className="h-4 w-4" />
                      </div>
                      <Input
                        id="email"
                        type="email"
                        placeholder="john.doe@example.com"
                        className={`pl-10 ${errors.email ? "border-amber-400/70 focus-visible:ring-amber-400/40" : ""}`}
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
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                        <Phone className="h-4 w-4" />
                      </div>
                      <Input
                        id="phone"
                        type="tel"
                        inputMode="numeric"
                        placeholder="01234567890"
                        className={`pl-10 ${inputErrorClass("phone")}`}
                        value={formData.phone}
                        onChange={(e) => handlePhoneChange(e.target.value)}
                        onBlur={() => handleBlur("phone")}
                        required
                      />
                    </div>
                    <FieldError message={errors.phone} />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="dateOfBirth">Date of Birth</Label>
                      <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                          <CalendarDays className="h-4 w-4" />
                        </div>
                        <Input
                          id="dateOfBirth"
                          type="date"
                          max={maxDateOfBirth}
                          className={`pl-10 ${inputErrorClass("dateOfBirth")}`}
                          value={formData.dateOfBirth}
                          onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                          onBlur={() => handleBlur("dateOfBirth")}
                          required
                        />
                      </div>
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
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                        <Lock className="h-4 w-4" />
                      </div>
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="At least 8 characters"
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

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                        <Lock className="h-4 w-4" />
                      </div>
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm your password"
                        className={`pl-10 pr-12 ${inputErrorClass("confirmPassword")}`}
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        onBlur={() => handleBlur("confirmPassword")}
                        required
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-2"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    <FieldError message={errors.confirmPassword} />
                  </div>

                  <label htmlFor="terms" className="flex items-start gap-3 cursor-pointer rounded-2xl border border-input bg-muted/50 px-4 py-3 text-sm transition-colors hover:bg-muted dark:border-slate-700 dark:bg-slate-800/70">
                    <input type="checkbox" id="terms" className="h-4 w-4 mt-1 rounded-sm border-2 border-primary accent-primary" required />
                    <span className="text-slate-700 dark:text-slate-300">
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

                  <Button type="submit" variant="hero" className="w-full tracking-wide" size="lg" disabled={isLoading || hasErrors}>
                    {isLoading ? "Creating Account..." : "Create Account"}
                  </Button>
                </form>

                <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-6">
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
    </div>
  );
};

export default Register;
