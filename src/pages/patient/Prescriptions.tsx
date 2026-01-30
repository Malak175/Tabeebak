import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import {
  Calendar,
  FileText,
  FlaskConical,
  User,
  Heart,
  Pill,
  Home,
  Settings,
  HelpCircle,
  AlertCircle,
  Clock,
  RefreshCw,
  ShoppingCart,
} from "lucide-react";

const navItems = [
  { title: "Dashboard", url: "/patient/dashboard", icon: Home },
  { title: "Appointments", url: "/patient/appointments", icon: Calendar },
  { title: "Lab Results", url: "/patient/lab-results", icon: FlaskConical },
  { title: "Medical Records", url: "/patient/records", icon: FileText },
  { title: "Prescriptions", url: "/patient/prescriptions", icon: Pill },
  { title: "Health Tips", url: "/patient/tips", icon: Heart },
  { title: "Settings", url: "/patient/settings", icon: Settings },
  { title: "Help", url: "/patient/help", icon: HelpCircle },
];

const activePrescriptions = [
  {
    id: 1,
    name: "Metformin",
    dosage: "500mg",
    frequency: "2 times daily",
    duration: "30 days",
    remaining: 15,
    total: 60,
    doctor: "Dr. Sarah Johnson",
    date: "Nov 15, 2024",
    instructions: "Take with meals",
    status: "active",
  },
  {
    id: 2,
    name: "Lisinopril",
    dosage: "10mg",
    frequency: "Once daily",
    duration: "30 days",
    remaining: 8,
    total: 30,
    doctor: "Dr. Sarah Johnson",
    date: "Nov 15, 2024",
    instructions: "Take in the morning",
    status: "low",
  },
  {
    id: 3,
    name: "Atorvastatin",
    dosage: "20mg",
    frequency: "Once daily at bedtime",
    duration: "30 days",
    remaining: 22,
    total: 30,
    doctor: "Dr. Michael Chen",
    date: "Nov 20, 2024",
    instructions: "Take at night before sleep",
    status: "active",
  },
];

const pastPrescriptions = [
  {
    id: 4,
    name: "Amoxicillin",
    dosage: "500mg",
    frequency: "3 times daily",
    duration: "7 days",
    doctor: "Dr. Emily Williams",
    date: "Oct 10, 2024",
    status: "completed",
  },
  {
    id: 5,
    name: "Ibuprofen",
    dosage: "400mg",
    frequency: "As needed",
    duration: "5 days",
    doctor: "Dr. Emily Williams",
    date: "Oct 5, 2024",
    status: "completed",
  },
];

const PatientPrescriptions = () => {
  const [user] = useState({ name: "John Doe" });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-700";
      case "low":
        return "bg-yellow-100 text-yellow-700";
      case "completed":
        return "bg-muted text-muted-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <DashboardLayout
      userRole="patient"
      userName={user.name}
      navItems={navItems}
      userIcon={User}
    >
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Prescriptions</h1>
        <p className="text-muted-foreground">
          Manage your medications and refill requests
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Pill className="h-5 w-5 text-primary" />
                Active Prescriptions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {activePrescriptions.map((rx) => (
                <div
                  key={rx.id}
                  className="p-4 bg-muted/50 rounded-xl space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-lg">{rx.name}</h4>
                        <Badge className={getStatusColor(rx.status)}>
                          {rx.status === "low" ? "Low Stock" : "Active"}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground">
                        {rx.dosage} • {rx.frequency}
                      </p>
                    </div>
                    {rx.status === "low" && (
                      <AlertCircle className="h-5 w-5 text-yellow-500" />
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Prescribed by:</span>
                      <p className="font-medium">{rx.doctor}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Date:</span>
                      <p className="font-medium">{rx.date}</p>
                    </div>
                  </div>
                  <div className="p-3 bg-background rounded-lg">
                    <p className="text-sm text-muted-foreground mb-2">
                      <Clock className="h-4 w-4 inline mr-1" />
                      {rx.instructions}
                    </p>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Remaining</span>
                      <span className="font-medium">{rx.remaining} of {rx.total} pills</span>
                    </div>
                    <Progress value={(rx.remaining / rx.total) * 100} className="h-2" />
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Request Refill
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Order Online
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-muted-foreground">Past Prescriptions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {pastPrescriptions.map((rx) => (
                <div
                  key={rx.id}
                  className="flex items-center justify-between p-4 bg-muted/30 rounded-xl"
                >
                  <div>
                    <h4 className="font-medium">{rx.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {rx.dosage} • {rx.frequency} • {rx.date}
                    </p>
                  </div>
                  <Badge variant="outline">Completed</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
            <CardContent className="p-6">
              <div className="text-center mb-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <Pill className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold text-lg">Medication Reminders</h3>
                <p className="text-sm text-muted-foreground">
                  Never miss a dose with our reminder system
                </p>
              </div>
              <Button className="w-full">Set Up Reminders</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <RefreshCw className="h-4 w-4 mr-2" />
                Request All Refills
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <FileText className="h-4 w-4 mr-2" />
                Download Prescription List
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <AlertCircle className="h-4 w-4 mr-2" />
                Report Side Effects
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PatientPrescriptions;
