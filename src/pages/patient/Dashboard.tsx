import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import {
  Calendar,
  FileText,
  FlaskConical,
  Clock,
  User,
  ChevronRight,
  Heart,
  Stethoscope,
  Activity,
  Pill,
  AlertCircle,
  TrendingUp,
  Download,
  Home,
  Settings,
  HelpCircle,
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

const upcomingAppointments = [
  {
    id: 1,
    doctor: "Dr. Sarah Johnson",
    specialty: "Cardiologist",
    date: "Dec 10, 2024",
    time: "10:00 AM",
    status: "confirmed",
    avatar: "SJ",
  },
  {
    id: 2,
    doctor: "Dr. Michael Chen",
    specialty: "Neurologist",
    date: "Dec 15, 2024",
    time: "2:30 PM",
    status: "pending",
    avatar: "MC",
  },
  {
    id: 3,
    doctor: "Dr. Emily Williams",
    specialty: "General Physician",
    date: "Dec 20, 2024",
    time: "11:00 AM",
    status: "confirmed",
    avatar: "EW",
  },
];

const recentLabResults = [
  {
    id: 1,
    name: "Complete Blood Count",
    date: "Dec 1, 2024",
    status: "normal",
    doctor: "Dr. Sarah Johnson",
  },
  {
    id: 2,
    name: "Lipid Profile",
    date: "Nov 28, 2024",
    status: "attention",
    doctor: "Dr. Sarah Johnson",
  },
  {
    id: 3,
    name: "HbA1c Test",
    date: "Nov 20, 2024",
    status: "normal",
    doctor: "Dr. Michael Chen",
  },
];

const medications = [
  { name: "Metformin", dosage: "500mg", frequency: "2x daily", remaining: 15 },
  { name: "Lisinopril", dosage: "10mg", frequency: "1x daily", remaining: 8 },
  { name: "Atorvastatin", dosage: "20mg", frequency: "1x daily", remaining: 22 },
];

const vitalHistory = [
  { date: "Dec 5", bp: "120/80", heart: 72, weight: 75 },
  { date: "Nov 28", bp: "118/78", heart: 70, weight: 75.2 },
  { date: "Nov 21", bp: "122/82", heart: 74, weight: 75.5 },
  { date: "Nov 14", bp: "119/79", heart: 71, weight: 75.3 },
];

const PatientDashboard = () => {
  const [user] = useState({
    name: "John Doe",
    email: "john.doe@example.com",
  });

  return (
    <DashboardLayout
      userRole="patient"
      userName={user.name}
      navItems={navItems}
      userIcon={User}
    >
      {/* Welcome Section */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">
          Welcome back, {user.name.split(" ")[0]}!
        </h1>
        <p className="text-muted-foreground">
          Here's an overview of your health dashboard
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          {
            icon: Calendar,
            label: "Upcoming",
            value: "3",
            sublabel: "Appointments",
            color: "primary",
          },
          {
            icon: FlaskConical,
            label: "Pending",
            value: "2",
            sublabel: "Lab Results",
            color: "secondary",
          },
          {
            icon: Pill,
            label: "Active",
            value: "3",
            sublabel: "Medications",
            color: "primary",
          },
          {
            icon: Activity,
            label: "Heart Rate",
            value: "72",
            sublabel: "bpm (Normal)",
            color: "green",
          },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    stat.color === "primary"
                      ? "bg-primary/10 text-primary"
                      : stat.color === "green"
                      ? "bg-green-100 text-green-600"
                      : "bg-secondary/20 text-secondary"
                  }`}
                >
                  <stat.icon className="h-5 w-5" />
                </div>
                <TrendingUp className="h-4 w-4 text-green-500" />
              </div>
              <div className="mt-3">
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-xs text-muted-foreground">
                  {stat.sublabel}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          {
            icon: Calendar,
            label: "Book Appointment",
            href: "/doctors",
            color: "primary",
          },
          {
            icon: FlaskConical,
            label: "Book Lab Test",
            href: "/lab-services",
            color: "secondary",
          },
          {
            icon: FileText,
            label: "My Records",
            href: "/patient/records",
            color: "primary",
          },
          {
            icon: Heart,
            label: "Health Tips",
            href: "/patient/tips",
            color: "secondary",
          },
        ].map((action) => (
          <Link key={action.label} to={action.href}>
            <Card className="hover:shadow-md transition-all cursor-pointer h-full hover:border-primary/50 group">
              <CardContent className="p-4 flex flex-col items-center justify-center text-center gap-2">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${
                    action.color === "primary"
                      ? "bg-primary/10 text-primary"
                      : "bg-secondary/20 text-secondary"
                  }`}
                >
                  <action.icon className="h-6 w-6" />
                </div>
                <span className="text-sm font-medium">{action.label}</span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content - 2 columns */}
        <div className="lg:col-span-2 space-y-6">
          {/* Appointments */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg">Upcoming Appointments</CardTitle>
              <Link
                to="/patient/appointments"
                className="text-primary text-sm hover:underline flex items-center gap-1"
              >
                View All <ChevronRight className="h-4 w-4" />
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingAppointments.map((apt) => (
                  <div
                    key={apt.id}
                    className="flex items-center gap-4 p-4 bg-muted/50 rounded-xl hover:bg-muted transition-colors"
                  >
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                      {apt.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate">{apt.doctor}</h4>
                      <p className="text-sm text-muted-foreground">
                        {apt.specialty}
                      </p>
                      <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{apt.date}</span>
                        <Clock className="h-3.5 w-3.5 ml-2" />
                        <span>{apt.time}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          apt.status === "confirmed"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {apt.status}
                      </span>
                      <Button size="sm" variant="ghost">
                        Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Lab Results */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg">Recent Lab Results</CardTitle>
              <Link
                to="/patient/lab-results"
                className="text-primary text-sm hover:underline flex items-center gap-1"
              >
                View All <ChevronRight className="h-4 w-4" />
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentLabResults.map((result) => (
                  <div
                    key={result.id}
                    className="flex items-center justify-between p-4 bg-muted/50 rounded-xl hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          result.status === "normal"
                            ? "bg-green-100 text-green-600"
                            : "bg-yellow-100 text-yellow-600"
                        }`}
                      >
                        <FlaskConical className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-medium">{result.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {result.date} • {result.doctor}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          result.status === "normal"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {result.status === "normal" ? "Normal" : "Needs Attention"}
                      </span>
                      <Button size="sm" variant="ghost">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - 1 column */}
        <div className="space-y-6">
          {/* Vitals Summary */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Vitals Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-primary/5 rounded-xl text-center">
                  <Heart className="h-5 w-5 text-primary mx-auto mb-1" />
                  <div className="text-lg font-bold">72</div>
                  <div className="text-xs text-muted-foreground">Heart Rate</div>
                </div>
                <div className="p-3 bg-secondary/10 rounded-xl text-center">
                  <Activity className="h-5 w-5 text-secondary mx-auto mb-1" />
                  <div className="text-lg font-bold">120/80</div>
                  <div className="text-xs text-muted-foreground">Blood Pressure</div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Weight</span>
                  <span className="font-medium">75 kg</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">BMI</span>
                  <span className="font-medium">24.2 (Normal)</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Blood Sugar</span>
                  <span className="font-medium">98 mg/dL</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Medications */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Pill className="h-5 w-5 text-primary" />
                Active Medications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {medications.map((med) => (
                <div key={med.name} className="p-3 bg-muted/50 rounded-xl">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-medium text-sm">{med.name}</h4>
                      <p className="text-xs text-muted-foreground">
                        {med.dosage} • {med.frequency}
                      </p>
                    </div>
                    {med.remaining < 10 && (
                      <AlertCircle className="h-4 w-4 text-yellow-500" />
                    )}
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Remaining</span>
                      <span>{med.remaining} pills</span>
                    </div>
                    <Progress
                      value={(med.remaining / 30) * 100}
                      className="h-1.5"
                    />
                  </div>
                </div>
              ))}
              <Button variant="outline" size="sm" className="w-full">
                Refill Prescription
              </Button>
            </CardContent>
          </Card>

          {/* Health Tips */}
          <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Heart className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium text-sm mb-1">Daily Health Tip</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Walking 30 minutes daily can reduce your risk of heart
                    disease by up to 35%. Try to stay active today!
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PatientDashboard;
