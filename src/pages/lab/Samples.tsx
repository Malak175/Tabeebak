import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import {
  FlaskConical,
  Clock,
  CheckCircle,
  Home,
  Settings,
  HelpCircle,
  Search,
  Package,
  BarChart3,
  QrCode,
  MapPin,
  ArrowRight,
} from "lucide-react";

const navItems = [
  { title: "Dashboard", url: "/lab/dashboard", icon: Home },
  { title: "Pending Tests", url: "/lab/pending", icon: Clock },
  { title: "Completed", url: "/lab/completed", icon: CheckCircle },
  { title: "Sample Tracking", url: "/lab/samples", icon: Search },
  { title: "Inventory", url: "/lab/inventory", icon: Package },
  { title: "Reports", url: "/lab/reports", icon: BarChart3 },
  { title: "Settings", url: "/lab/settings", icon: Settings },
  { title: "Help", url: "/lab/help", icon: HelpCircle },
];

const samples = [
  { id: "SMP-001234", patient: "Ahmed Ali", test: "CBC", status: "processing", location: "Lab Station 3", timestamp: "10:30 AM" },
  { id: "SMP-001235", patient: "Fatima Hassan", test: "Lipid Profile", status: "received", location: "Reception", timestamp: "10:15 AM" },
  { id: "SMP-001236", patient: "Mohammed Said", test: "Thyroid", status: "completed", location: "Quality Check", timestamp: "9:45 AM" },
  { id: "SMP-001237", patient: "Sara Ahmed", test: "HbA1c", status: "in-transit", location: "Collection Center", timestamp: "9:30 AM" },
];

const trackingSteps = [
  { name: "Collected", icon: MapPin },
  { name: "In Transit", icon: ArrowRight },
  { name: "Received", icon: Package },
  { name: "Processing", icon: FlaskConical },
  { name: "Quality Check", icon: CheckCircle },
  { name: "Completed", icon: CheckCircle },
];

const LabSamples = () => {
  const [lab] = useState({ name: "MedLab Diagnostics", certification: "NABL Certified" });
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSample, setSelectedSample] = useState<typeof samples[0] | null>(null);

  const getStatusIndex = (status: string) => {
    switch (status) {
      case "in-transit": return 1;
      case "received": return 2;
      case "processing": return 3;
      case "quality-check": return 4;
      case "completed": return 5;
      default: return 0;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-700";
      case "processing": return "bg-blue-100 text-blue-700";
      case "received": return "bg-yellow-100 text-yellow-700";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <DashboardLayout
      userRole="laboratory"
      userName={lab.name}
      userSubtitle={lab.certification}
      navItems={navItems}
      userIcon={FlaskConical}
    >
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Sample Tracking</h1>
        <p className="text-muted-foreground">Track and monitor sample locations in real-time</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Enter sample ID to track..."
              className="pl-10 h-12"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="space-y-3">
            {samples.map((sample) => (
              <Card
                key={sample.id}
                className={`cursor-pointer hover:border-primary/50 transition-colors ${
                  selectedSample?.id === sample.id ? "border-primary" : ""
                }`}
                onClick={() => setSelectedSample(sample)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <QrCode className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{sample.id}</h3>
                        <Badge className={getStatusColor(sample.status)}>
                          {sample.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {sample.patient} • {sample.test}
                      </p>
                      <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        <span>{sample.location}</span>
                        <span>•</span>
                        <span>{sample.timestamp}</span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">Track</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div>
          {selectedSample ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Tracking: {selectedSample.id}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Patient</p>
                    <p className="font-medium">{selectedSample.patient}</p>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Test Type</p>
                    <p className="font-medium">{selectedSample.test}</p>
                  </div>

                  <div className="pt-4">
                    <h4 className="font-medium mb-4">Tracking Progress</h4>
                    <div className="space-y-3">
                      {trackingSteps.map((step, index) => (
                        <div key={step.name} className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              index <= getStatusIndex(selectedSample.status)
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            <step.icon className="h-4 w-4" />
                          </div>
                          <span
                            className={`text-sm ${
                              index <= getStatusIndex(selectedSample.status)
                                ? "font-medium"
                                : "text-muted-foreground"
                            }`}
                          >
                            {step.name}
                          </span>
                          {index === getStatusIndex(selectedSample.status) && (
                            <Badge variant="secondary">Current</Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-muted/30">
              <CardContent className="p-8 text-center">
                <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Select a sample to view tracking details</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default LabSamples;
