import { Link } from "react-router-dom";
import {
  AlertCircle,
  ArrowRight,
  Clock,
  FlaskConical,
  Shield,
  TestTubeDiagonal,
  Truck,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { useLabProfileQuery, useLabServicesQuery } from "@/hooks/useLabProfile";

const formatPrice = (price?: number | null, currency?: string | null) => {
  if (price === null || price === undefined) {
    return "Price pending";
  }

  const normalizedCurrency = (currency ?? "USD").toUpperCase();

  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: normalizedCurrency,
      maximumFractionDigits: 0,
    }).format(price);
  } catch {
    return `${normalizedCurrency} ${price}`;
  }
};

const statusCards = [
  {
    icon: Shield,
    title: "Verified backend scope",
    description: "Live lab services are currently available for authenticated laboratory accounts.",
  },
  {
    icon: TestTubeDiagonal,
    title: "Public catalog pending",
    description: "Patient-facing test discovery and booking still need a dedicated public API.",
  },
  {
    icon: Truck,
    title: "Home collection",
    description: "Availability is driven by each lab profile once the public catalog is connected.",
  },
];

const LabServices = () => {
  const { user } = useAuth();
  const isLabUser = user?.role === "Lab";
  const profileQuery = useLabProfileQuery(isLabUser);
  const servicesQuery = useLabServicesQuery(isLabUser);
  const activeServices =
    servicesQuery.data?.filter((service) => service.isActive !== false) ?? [];

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <section className="relative overflow-hidden pb-20 pt-24">
        <div className="gradient-hero absolute inset-0" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.18),_transparent_55%)]" />

        <div className="container relative mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center">
            <Badge className="mb-6 border-white/20 bg-white/10 text-primary-foreground hover:bg-white/10">
              Lab services status
            </Badge>
            <h1 className="mb-6 text-4xl font-bold leading-tight text-primary-foreground md:text-5xl">
              {isLabUser ? "Live laboratory services" : "Lab services catalog"}
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-primary-foreground/85">
              {isLabUser
                ? "This view now reflects the services returned by your authenticated laboratory profile instead of placeholder marketing cards."
                : "The public patient-facing lab catalog is not connected to backend search or booking yet, so this page now shows implementation status instead of fake production data."}
            </p>
          </div>
        </div>
      </section>

      <section className="border-y border-border/60 bg-card py-8">
        <div className="container mx-auto grid gap-6 px-4 md:grid-cols-3">
          {statusCards.map((item) => (
            <div key={item.title} className="flex items-start gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <item.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold text-foreground">{item.title}</p>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          {isLabUser ? (
            <div className="space-y-8">
              <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-foreground">Your live services</h2>
                  <p className="text-muted-foreground">
                    Loaded from the laboratory profile APIs that already power the authenticated lab workflow.
                  </p>
                </div>
                <Button asChild variant="outline" className="gap-2">
                  <Link to="/lab/settings">
                    Manage in Lab Settings
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>

              {profileQuery.isError ? (
                <Alert variant="destructive">
                  <AlertTitle>Unable to load lab profile</AlertTitle>
                  <AlertDescription>{(profileQuery.error as Error).message}</AlertDescription>
                </Alert>
              ) : null}

              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Laboratory</CardDescription>
                    <CardTitle>{profileQuery.data?.displayName || user?.displayName || "Current lab"}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground">
                    {profileQuery.data?.accreditation || "Accreditation was not returned by the API."}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Home collection</CardDescription>
                    <CardTitle>
                      {profileQuery.data?.homeCollectionAvailable ? "Available" : "Not enabled"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground">
                    Availability comes from `/api/v1/labs/me/profile`.
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Active services</CardDescription>
                    <CardTitle>{activeServices.length}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground">
                    Count based on `/api/v1/labs/me/services`.
                  </CardContent>
                </Card>
              </div>

              {servicesQuery.isLoading ? (
                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {[0, 1, 2].map((index) => (
                    <Card key={index}>
                      <CardHeader>
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-6 w-40" />
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-5/6" />
                        <Skeleton className="h-10 w-full" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : servicesQuery.isError ? (
                <Alert variant="destructive">
                  <AlertTitle>Unable to load live lab services</AlertTitle>
                  <AlertDescription>{(servicesQuery.error as Error).message}</AlertDescription>
                </Alert>
              ) : activeServices.length ? (
                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {activeServices.map((service) => (
                    <Card key={service.id} className="border-border/70">
                      <CardHeader>
                        <div className="flex items-center justify-between gap-3">
                          <Badge variant="outline">{service.category || "Uncategorized"}</Badge>
                          <span className="text-sm font-semibold text-primary">
                            {formatPrice(service.price, service.currency)}
                          </span>
                        </div>
                        <CardTitle>{service.name || "Unnamed service"}</CardTitle>
                        <CardDescription>
                          {service.description || "No service description was returned."}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-primary" />
                          <span>{service.turnaroundTime || "Turnaround time pending"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FlaskConical className="h-4 w-4 text-primary" />
                          <span>{service.sampleType || "Sample type pending"}</span>
                        </div>
                        <p>
                          {service.preparationInstructions || "Preparation instructions have not been added yet."}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center text-muted-foreground">
                    No active services were returned for this lab yet. Add them from Lab Settings when the backend catalog is ready.
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <div className="mx-auto max-w-4xl space-y-6">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Public catalog not connected yet</AlertTitle>
                <AlertDescription>
                  The current backend scope exposes laboratory service data for authenticated lab accounts only. Public patient search and booking still need dedicated endpoints before this page can show real catalog results.
                </AlertDescription>
              </Alert>

              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>What is live today</CardTitle>
                    <CardDescription>Already implemented in the authenticated laboratory flow.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm text-muted-foreground">
                    <p>Lab dashboard metrics are loaded from live laboratory endpoints.</p>
                    <p>Branch and service management already use the authenticated `labs/me` APIs.</p>
                    <p>Pending and completed lab workflow pages are backed by live order and result queries.</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>What still needs backend support</CardTitle>
                    <CardDescription>Required before public users can browse real lab tests here.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm text-muted-foreground">
                    <p>Public test catalog endpoint for patient browsing.</p>
                    <p>Public lab partner discovery endpoint.</p>
                    <p>Patient-side booking flow for selecting and reserving a test.</p>
                  </CardContent>
                </Card>
              </div>

              <div className="flex flex-col gap-4 sm:flex-row">
                <Button asChild className="gap-2">
                  <Link to="/contact">
                    Contact support
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link to="/login">Lab sign in</Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
};

export default LabServices;
