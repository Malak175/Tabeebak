import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  FolderOpen,
  Upload,
  File,
  Image,
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

const records = [
  {
    id: 1,
    name: "Annual Health Checkup Report",
    type: "Report",
    date: "Nov 15, 2024",
    doctor: "Dr. Emily Williams",
    size: "2.4 MB",
    icon: FileText,
  },
  {
    id: 2,
    name: "ECG Report",
    type: "Diagnostic",
    date: "Nov 10, 2024",
    doctor: "Dr. Sarah Johnson",
    size: "1.2 MB",
    icon: Heart,
  },
  {
    id: 3,
    name: "Chest X-Ray",
    type: "Imaging",
    date: "Oct 25, 2024",
    doctor: "Dr. Sarah Johnson",
    size: "5.8 MB",
    icon: Image,
  },
  {
    id: 4,
    name: "Blood Test Results",
    type: "Lab Report",
    date: "Oct 20, 2024",
    doctor: "Dr. Michael Chen",
    size: "856 KB",
    icon: FlaskConical,
  },
  {
    id: 5,
    name: "Prescription - Cardiac Care",
    type: "Prescription",
    date: "Oct 15, 2024",
    doctor: "Dr. Sarah Johnson",
    size: "124 KB",
    icon: Pill,
  },
];

const categories = [
  { name: "All Records", count: 15 },
  { name: "Lab Reports", count: 6 },
  { name: "Prescriptions", count: 4 },
  { name: "Imaging", count: 3 },
  { name: "Diagnostics", count: 2 },
];

const PatientRecords = () => {
  const [user] = useState({ name: "John Doe" });
  const [selectedCategory, setSelectedCategory] = useState("All Records");

  return (
    <DashboardLayout
      userRole="patient"
      userName={user.name}
      navItems={navItems}
      userIcon={User}
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Medical Records</h1>
          <p className="text-muted-foreground">
            Access and manage all your medical documents
          </p>
        </div>
        <Button className="gap-2">
          <Upload className="h-4 w-4" />
          Upload Document
        </Button>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <FolderOpen className="h-5 w-5" />
                Categories
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {categories.map((cat) => (
                <button
                  key={cat.name}
                  onClick={() => setSelectedCategory(cat.name)}
                  className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors ${
                    selectedCategory === cat.name
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  }`}
                >
                  <span className="text-sm font-medium">{cat.name}</span>
                  <Badge
                    variant={selectedCategory === cat.name ? "secondary" : "outline"}
                  >
                    {cat.count}
                  </Badge>
                </button>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-primary/5 to-secondary/5">
            <CardContent className="p-4">
              <div className="text-center">
                <File className="h-10 w-10 text-primary mx-auto mb-3" />
                <h4 className="font-medium mb-1">Storage Used</h4>
                <p className="text-2xl font-bold text-primary">12.4 MB</p>
                <p className="text-xs text-muted-foreground">of 100 MB free storage</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-3 space-y-4">
          {records.map((record) => (
            <Card key={record.id} className="hover:border-primary/50 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <record.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{record.name}</h3>
                    <div className="flex flex-wrap gap-2 mt-1">
                      <Badge variant="outline">{record.type}</Badge>
                      <span className="text-sm text-muted-foreground">
                        {record.date}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        • {record.doctor}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground">{record.size}</span>
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
      </div>
    </DashboardLayout>
  );
};

export default PatientRecords;
