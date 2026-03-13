import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { useResetPasswordMutation } from "@/hooks/useAuth";
import logo from "@/assets/logo.png";
import {
  PASSWORD_CONFIRM_REQUIRED_MESSAGE,
  PASSWORD_POLICY_MESSAGE,
  PASSWORDS_DO_NOT_MATCH_MESSAGE,
  isPasswordPolicyValid,
  passwordsMatch,
} from "@/lib/password-policy";

const schema = z
  .object({
    password: z
      .string()
      .refine(isPasswordPolicyValid, PASSWORD_POLICY_MESSAGE),
    confirmPassword: z.string().min(1, PASSWORD_CONFIRM_REQUIRED_MESSAGE),
  })
  .refine((values) => passwordsMatch(values.password, values.confirmPassword), {
    path: ["confirmPassword"],
    message: PASSWORDS_DO_NOT_MATCH_MESSAGE,
  });

type FormValues = z.infer<typeof schema>;

const ResetPassword = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get("token") ?? "";
  const resetPasswordMutation = useResetPasswordMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = (values: FormValues) => {
    if (!token) {
      toast.error("Reset token is missing from the URL.");
      return;
    }

    resetPasswordMutation.mutate(
      { token, newPassword: values.password },
      {
        onSuccess: (response) => {
          toast.success(response.message);
          setTimeout(() => navigate("/login"), 1200);
        },
        onError: (error: Error) => toast.error(error.message),
      },
    );
  };

  useEffect(() => {
    if (!token) {
      toast.error("Invalid or missing reset token.");
    }
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-background">
      <div className="w-full max-w-md">
        <Link to="/login" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="h-4 w-4" />
          Back to Login
        </Link>

        <div className="flex items-center gap-3 mb-8">
          <img src={logo} alt="TABEEBAK" className="h-10 w-10 object-contain rounded-full" />
          <span className="text-2xl font-bold text-gradient">TABEEBAK</span>
        </div>

        <Card className="border-0 shadow-xl">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl">Reset Password</CardTitle>
            <CardDescription>
              {resetPasswordMutation.isSuccess ? "Password updated successfully" : "Enter your new password"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {resetPasswordMutation.isSuccess ? (
              <div className="flex flex-col items-center gap-4 py-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-primary" />
                </div>
                <p className="text-sm text-muted-foreground text-center">Your password has been reset. You can now sign in.</p>
                <Link to="/login" className="w-full">
                  <Button variant="hero" className="w-full">Go to Login</Button>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">New Password</Label>
                  <Input id="password" type="password" placeholder="Enter your new password" {...register("password")} />
                  {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input id="confirmPassword" type="password" placeholder="Confirm your new password" {...register("confirmPassword")} />
                  {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>}
                </div>

                <Button type="submit" variant="hero" className="w-full" size="lg" disabled={resetPasswordMutation.isPending || !token}>
                  {resetPasswordMutation.isPending ? "Resetting..." : "Reset Password"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ResetPassword;
