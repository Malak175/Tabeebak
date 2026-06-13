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
import AuthLayout from "@/components/auth/AuthLayout";
import { useResetPasswordMutation } from "@/hooks/useAuth";
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
    <AuthLayout backHref="/login" backLabel="Back to Login">
      <CardHeader className="text-center pb-3">
        <CardTitle className="text-3xl font-bold tracking-tight">Reset your password</CardTitle>
        <CardDescription className="mx-auto max-w-lg text-sm text-muted-foreground">
          Set a strong new password for your account. You will be redirected to sign in once the reset completes.
        </CardDescription>
      </CardHeader>

      <div className="space-y-6">
        {resetPasswordMutation.isSuccess ? (
          <div className="rounded-3xl border border-border/80 bg-slate-50 p-6 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
              <CheckCircle className="h-8 w-8" />
            </div>
            <p className="text-sm text-muted-foreground">
              Your password has been reset successfully. Please sign in with your new password.
            </p>
            <Link to="/login" className="mt-6 inline-flex w-full justify-center">
              <Button variant="hero" className="w-full">Go to Login</Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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
      </div>
    </AuthLayout>
  );
};

export default ResetPassword;
