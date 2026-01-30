import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Download,
  Eye,
  TrendingUp,
  TrendingDown,
  Minus,
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

const labResults = [
  {
    id: 1,
    name: "Complete Blood Count (CBC)",
    date: "Dec 1, 2024",
    status: "normal",
    doctor: "Dr. Sarah Johnson",
    lab: "MedLab Diagnostics",
    values: [
      { name: "Hemoglobin", value: "14.5 g/dL", status: "normal", range: "13.5-17.5" },
      { name: "WBC", value: "7,500 /μL", status: "normal", range: "4,500-11,000" },
      { name: "Platelets", value: "250,000 /μL", status: "normal", range: "150,000-400,000" },
    ],
  },
  {
    id: 2,
    name: "Lipid Profile",
    date: "Nov 28, 2024",
    status: "attention",
    doctor: "Dr. Sarah Johnson",
    lab: "MedLab Diagnostics",
    values: [
      { name: "Total Cholesterol", value: "220 mg/dL", status: "high", range: "<200" },
      { name: "LDL", value: "145 mg/dL", status: "high", range: "<100" },
      { name: "HDL", value: "45 mg/dL", status: "low", range: ">40" },
      { name: "Triglycerides", value: "160 mg/dL", status: "normal", range: "<150" },
    ],
  },
  {
    id: 3,
    name: "HbA1c Test",
    date: "Nov 20, 2024",
    status: "normal",
    doctor: "Dr. Michael Chen",
    lab: "City Lab Center",
    values: [
      { name: "HbA1c", value: "5.4%", status: "normal", range: "<5.7%" },
    ],
  },
  {
    id: 4,
    name: "Thyroid Function Test",
    date: "Nov 15, 2024",
    status: "normal",
    doctor: "Dr. Emily Williams",
    lab: "MedLab Diagnostics",
    values: [
      { name: "TSH", value: "2.5 mIU/L", status: "normal", range: "0.4-4.0" },
      { name: "T4", value: "8.2 μg/dL", status: "normal", range: "4.5-12.0" },
    ],
  },
];

const PatientLabResults = () => {
  const [user] = useState({ name: "John Doe" });
  const [selectedResult, setSelectedResult] = useState<typeof labResults[0] | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "normal":
        return "bg-green-100 text-green-700";
      case "attention":
      case "high":
        return "bg-yellow-100 text-yellow-700";
      case "low":
        return "bg-blue-100 text-blue-700";
      case "critical":
        return "bg-red-100 text-red-700";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "high":
        return <TrendingUp className="h-4 w-4 text-yellow-600" />;
      case "low":
        return <TrendingDown className="h-4 w-4 text-blue-600" />;
      default:
        return <Minus className="h-4 w-4 text-green-600" />;
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
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Lab Results</h1>
        <p className="text-muted-foreground">
          View and download your laboratory test results
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {labResults.map((result) => (
            <Card
              key={result.id}
              className={`cursor-pointer transition-all hover:border-primary/50 ${
                selectedResult?.id === result.id ? "border-primary" : ""
              }`}
              onClick={() => setSelectedResult(result)}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex gap-4">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        result.status === "normal"
                          ? "bg-green-100 text-green-600"
                          : "bg-yellow-100 text-yellow-600"
                      }`}
                    >
                      <FlaskConical className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{result.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {result.date} • {result.lab}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Ordered by: {result.doctor}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge className={getStatusColor(result.status)}>
                      {result.status === "normal" ? "All Normal" : "Needs Attention"}
                    </Badge>
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="space-y-6">
          {selectedResult ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{selectedResult.name}</CardTitle>
                <p className="text-sm text-muted-foreground">{selectedResult.date}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedResult.values.map((value, idx) => (
                  <div key={idx} className="p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm">{value.name}</span>
                      {getStatusIcon(value.status)}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-semibold">{value.value}</span>
                      <span className="text-xs text-muted-foreground">
                        Range: {value.range}
                      </span>
                    </div>
                  </div>
                ))}
                <Button className="w-full mt-4">
                  <Download className="h-4 w-4 mr-2" />
                  Download Full Report
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-muted/30">
              <CardContent className="p-8 text-center">
                <FlaskConical className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Select a test result to view details
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PatientLabResults;
