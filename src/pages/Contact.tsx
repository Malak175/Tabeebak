import { useEffect, useMemo } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, Phone, MapPin, Clock, Send } from "lucide-react";
import { toast } from "sonner";
import { useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useContactMutation } from "@/hooks/useContactMutation";
import { ContactRole } from "@/types/contact.types";
const IS_DEV = import.meta.env.DEV;

const contactInfo = [
  {
    icon: Phone,
    title: "Phone",
    details: ["+1 234 567 890", "+1 234 567 891"],
  },
  {
    icon: Mail,
    title: "Email",
    details: ["support@tabeebak.com", "info@tabeebak.com"],
  },
  {
    icon: MapPin,
    title: "Address",
    details: ["123 Healthcare Street", "Medical City, MC 12345"],
  },
  {
    icon: Clock,
    title: "Working Hours",
    details: ["Mon - Fri: 8:00 AM - 8:00 PM", "Sat - Sun: 9:00 AM - 5:00 PM"],
  },
];

const schema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Enter a valid email address"),
  role: z.enum(["Doctor", "Lab"]),
  subject: z.string().min(3, "Subject is required"),
  message: z.string().min(10, "Please provide more details"),
});

type FormValues = z.infer<typeof schema>;

const Contact = () => {
  const [params] = useSearchParams();
  const contactMutation = useContactMutation();

  const defaultRole = useMemo<ContactRole>(() => {
    const roleParam = params.get("role");
    return roleParam === "Lab" ? "Lab" : "Doctor";
  }, [params]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      email: "",
      subject: "Request to join TABEEBAK",
      message: "",
      role: defaultRole,
    },
  });

  const onSubmit = (values: FormValues) => {
    if (IS_DEV) {
      console.log("[FORM SUBMIT]", { form: "Contact", formValues: values });
    }
    contactMutation.mutate(values, {
      onSuccess: (response) => {
        toast.success(response.message || "Request submitted successfully");
        reset({
          name: "",
          email: "",
          role: defaultRole,
          subject: "Request to join TABEEBAK",
          message: "",
        });
      },
      onError: (error: Error) => {
        toast.error(error.message);
      },
    });
  };

  useEffect(() => {
    if (!IS_DEV) return;
    if (Object.keys(errors).length > 0) {
      console.error("[FORM VALIDATION ERROR]", { form: "Contact", errors });
    }
  }, [errors]);

  return (
    <main className="min-h-screen bg-muted/30">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-card">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <span className="text-primary font-semibold text-sm uppercase tracking-wider">Contact Us</span>
            <h1 className="text-4xl md:text-5xl font-bold mt-4 mb-4">Join as Doctor or Lab</h1>
            <p className="text-muted-foreground text-lg">
              Doctor and laboratory accounts are created by administrators. Submit your request and our team will contact you.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactInfo.map((info) => (
              <Card key={info.title} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                    <info.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{info.title}</h3>
                  {info.details.map((detail, index) => (
                    <p key={index} className="text-muted-foreground text-sm">
                      {detail}
                    </p>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <Card className="shadow-xl">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold mb-2">Submit Access Request</h2>
                <p className="text-muted-foreground mb-8">
                  Fill out this form for Doctor/Lab onboarding. Admin will review your request.
                </p>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input id="name" placeholder="John Doe" {...register("name")} />
                      {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" placeholder="john@example.com" {...register("email")} />
                      {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="role">Request Type</Label>
                    <select id="role" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" {...register("role")}>
                      <option value="Doctor">Doctor</option>
                      <option value="Lab">Lab</option>
                    </select>
                    {errors.role && <p className="text-xs text-destructive">{errors.role.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input id="subject" placeholder="Request to join TABEEBAK" {...register("subject")} />
                    {errors.subject && <p className="text-xs text-destructive">{errors.subject.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      placeholder="Tell us about your specialization, clinic/lab, and why you want to join..."
                      rows={5}
                      {...register("message")}
                    />
                    {errors.message && <p className="text-xs text-destructive">{errors.message.message}</p>}
                  </div>

                  <Button type="submit" variant="hero" size="lg" className="w-full" disabled={contactMutation.isPending}>
                    {contactMutation.isPending ? (
                      "Sending..."
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        Submit Request
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
};

export default Contact;
