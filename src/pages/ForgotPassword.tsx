import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Mail, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { useForgotPasswordMutation } from "@/hooks/useAuth";
import logo from "@/assets/logo.png";
const IS_DEV = import.meta.env.DEV;

const schema = z.object({
  email: z.string().email("Enter a valid email address"),
});

type FormValues = z.infer<typeof schema>;

const ForgotPassword = () => {
  const forgotPasswordMutation = useForgotPasswordMutation();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (values: FormValues) => {
    if (IS_DEV) {
      console.log("[FORM SUBMIT]", { form: "ForgotPassword", formValues: values });
    }
    forgotPasswordMutation.mutate(values, {
      onSuccess: (response) => {
        toast.success(response.message);
      },
      onError: (error: Error) => {
        toast.error(error.message);
      },
    });
  };

  useEffect(() => {
    if (!IS_DEV) return;
    if (Object.keys(errors).length > 0) {
      console.error("[FORM VALIDATION ERROR]", { form: "ForgotPassword", errors });
    }
  }, [errors]);

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
            <CardTitle className="text-2xl">Forgot Password</CardTitle>
            <CardDescription>
              {forgotPasswordMutation.isSuccess
                ? "Check your email for a reset link"
                : "Enter your email and we'll send you a reset link"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {forgotPasswordMutation.isSuccess ? (
              <div className="flex flex-col items-center gap-4 py-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-primary" />
                </div>
                <p className="text-sm text-muted-foreground text-center">
                  If the email exists, you will receive a password reset link.
                </p>
                <Button variant="outline" className="w-full mt-2" onClick={() => forgotPasswordMutation.reset()}>
                  Try another email
                </Button>
                <Link to="/login" className="text-sm text-primary hover:underline mt-2">
                  Return to login
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      className="pl-10"
                      {...register("email")}
                    />
                  </div>
                  {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
                </div>
                <Button type="submit" variant="hero" className="w-full" size="lg" disabled={forgotPasswordMutation.isPending}>
                  {forgotPasswordMutation.isPending ? "Sending..." : "Send Reset Link"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ForgotPassword;
