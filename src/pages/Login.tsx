import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserRound, Stethoscope, FlaskConical, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import logo from "@/assets/logo.png";
import axios from "axios";

type UserRole = "patient" | "doctor" | "laboratory";

const Login = () => {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<UserRole>("patient");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
    
      const payload = {
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      };

     
      const response = await axios.post('http://localhost:51234/auth/signin', payload);


      if (response.status === 200) {
        const { token, role, full_name, user_id } = response.data;

        
        localStorage.setItem("token", token);
        localStorage.setItem("userRole", role);
        localStorage.setItem("userName", full_name);
        localStorage.setItem("userId", user_id);

        toast.success(`Welcome back, ${full_name}!`);

    
        const userRole = role.toLowerCase();
        
        if (userRole === "patient") {
          navigate("/patient/dashboard");
        } else if (userRole === "doctor") {
          navigate("/doctor/dashboard");
        } else if (userRole === "lab" || userRole === "laboratory") {
          navigate("/lab/dashboard");
        } else {
          navigate("/dashboard"); 
        }
      }
    } catch (error: any) {
      console.error("Login Error:", error);
      
   
      const errorMessage = error.response?.data?.message || "Invalid email or password. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const roleIcons = {
    patient: UserRound,
    doctor: Stethoscope,
    laboratory: FlaskConical,
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
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">
          <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>

          <Card className="border-0 shadow-xl">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl">Sign In</CardTitle>
              <CardDescription>Choose your role and enter your credentials</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={selectedRole} onValueChange={(v) => setSelectedRole(v as UserRole)} className="mb-6">
                <TabsList className="grid grid-cols-3 w-full">
                  {(["patient", "doctor", "laboratory"] as const).map((role) => {
                    const Icon = roleIcons[role];
                    return (
                      <TabsTrigger
                        key={role}
                        value={role}
                        className="flex flex-col gap-1 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                      >
                        <Icon className="h-4 w-4" />
                        <span className="text-xs capitalize">{role}</span>
                      </TabsTrigger>
                    );
                  })}
                </TabsList>
              </Tabs>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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
                </div>

                <Button type="submit" variant="hero" className="w-full" size="lg" disabled={isLoading}>
                  {isLoading ? "Checking credentials..." : `Sign In as ${selectedRole}`}
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
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Login;