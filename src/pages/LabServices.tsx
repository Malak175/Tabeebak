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
    title: "Verified scope",
    description: "Live lab services are available for authenticated laboratory accounts.",
  },
  {
    icon: TestTubeDiagonal,
    title: "Public catalog",
    description: "Patient-facing test discovery and booking will appear here as they become available.",
  },
  {
    icon: Truck,
    title: "Home collection",
    description: "Availability is driven by each lab profile.",
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
                ? "This view reflects the services available for your laboratory profile."
                : "The public patient-facing lab catalog will appear here once available."}
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
                    Loaded from your laboratory profile.
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
                    {profileQuery.data?.accreditation || "Accreditation not available yet."}
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
                    Availability is managed in your lab profile.
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Active services</CardDescription>
                    <CardTitle>{activeServices.length}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground">
                    Count based on your active services.
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
                          <span>{service.sampleType || "Sample type not available yet"}</span>
                        </div>
                          <p>{service.preparationInstructions || "Preparation instructions not available yet."}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center text-muted-foreground">
                    No active services yet. Add them in Lab Settings to make them available.
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <div className="mx-auto max-w-4xl space-y-6">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Public catalog coming soon</AlertTitle>
                <AlertDescription>
                  Laboratory service data is currently available for authenticated lab accounts only. Public search and booking will appear here once available.
                </AlertDescription>
              </Alert>

              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>What is live today</CardTitle>
                    <CardDescription>Already implemented in the authenticated laboratory flow.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm text-muted-foreground">
                    <p>Lab dashboard metrics are live for authenticated lab accounts.</p>
                    <p>Branch and service management are available in lab settings.</p>
                    <p>Pending and completed lab workflow pages are available for active labs.</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>What is coming next</CardTitle>
                    <CardDescription>Required before public users can browse real lab tests here.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm text-muted-foreground">
                    <p>Public test catalog for patient browsing.</p>
                    <p>Public lab partner discovery.</p>
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
