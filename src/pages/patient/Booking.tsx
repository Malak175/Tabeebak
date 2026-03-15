import { ArrowRight, FlaskConical, Stethoscope, User } from "lucide-react";
import { Link } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { patientBookingNavItems } from "@/components/patient/patientNavigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { getDisplayName } from "@/lib/auth";

const options = [
  {
    title: "Book Doctor",
    description:
      "Browse nearby doctors, review availability, and send an appointment request that the provider can approve or reject.",
    href: "/patient/doctors",
    icon: Stethoscope,
  },
  {
    title: "Book Lab Test",
    description:
      "Find a laboratory, compare branches and services, and submit a lab test request inside the same patient flow.",
    href: "/patient/labs",
    icon: FlaskConical,
  },
];

const PatientBookingEntryPage = () => {
  const { user } = useAuth();
  const userName = getDisplayName(user ?? {});

  return (
    <DashboardLayout userRole="patient" userName={userName} navItems={patientBookingNavItems} userIcon={User}>
      <section className="mb-8 rounded-3xl border bg-gradient-to-r from-primary/10 via-background to-secondary/10 p-8">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">Patient Booking</p>
        <h1 className="mt-3 text-3xl font-bold">Choose the type of request you want to start</h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          This flow creates requests, not instant bookings. You can track status updates, replies, and next steps from one patient requests area.
        </p>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        {options.map((option) => (
          <Card key={option.title} className="overflow-hidden border-0 shadow-sm ring-1 ring-border">
            <CardHeader className="bg-muted/40">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <option.icon className="h-6 w-6" />
              </div>
              <CardTitle className="pt-4">{option.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              <p className="text-sm leading-6 text-muted-foreground">{option.description}</p>
              <Button asChild className="gap-2">
                <Link to={option.href}>
                  Continue
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </DashboardLayout>
  );
};

export default PatientBookingEntryPage;
