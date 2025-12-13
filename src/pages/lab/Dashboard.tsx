import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import {
  FlaskConical,
  Clock,
  User,
  CheckCircle,
  FileText,
  Upload,
  TrendingUp,
  AlertCircle,
  Home,
  Settings,
  HelpCircle,
  Search,
  Package,
  Printer,
  ChevronRight,
  Download,
  Eye,
  BarChart3,
  Microscope,
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

const pendingTests = [
  {
    id: 1,
    patient: "Ahmed Ali",
    test: "Complete Blood Count",
    doctor: "Dr. Sarah Johnson",
    date: "Dec 7, 2024",
    priority: "urgent",
    sampleId: "SMP-001234",
    progress: 75,
  },
  {
    id: 2,
    patient: "Fatima Hassan",
    test: "Lipid Profile",
    doctor: "Dr. Michael Chen",
    date: "Dec 7, 2024",
    priority: "urgent",
    sampleId: "SMP-001235",
    progress: 40,
  },
  {
    id: 3,
    patient: "Mohammed Said",
    test: "Thyroid Function",
    doctor: "Dr. Emily Williams",
    date: "Dec 6, 2024",
    priority: "normal",
    sampleId: "SMP-001236",
    progress: 90,
  },
  {
    id: 4,
    patient: "Sara Ahmed",
    test: "HbA1c",
    doctor: "Dr. Sarah Johnson",
    date: "Dec 6, 2024",
    priority: "normal",
    sampleId: "SMP-001237",
    progress: 20,
  },
  {
    id: 5,
    patient: "Omar Khan",
    test: "Liver Function Test",
    doctor: "Dr. Michael Chen",
    date: "Dec 6, 2024",
    priority: "normal",
    sampleId: "SMP-001238",
    progress: 60,
  },
];

const recentUploads = [
  { id: 1, patient: "Khalid Omar", test: "Kidney Function", time: "15 min ago", status: "delivered" },
  { id: 2, patient: "Maryam Said", test: "Electrolytes Panel", time: "30 min ago", status: "delivered" },
  { id: 3, patient: "Yusuf Ali", test: "CBC", time: "1 hour ago", status: "pending" },
  { id: 4, patient: "Aisha Hassan", test: "Urine Analysis", time: "2 hours ago", status: "delivered" },
];

const stats = [
  { label: "Pending Tests", value: "12", icon: Clock, color: "primary", change: "+3" },
  { label: "Completed Today", value: "28", icon: CheckCircle, color: "green", change: "+5" },
  { label: "Total This Month", value: "342", icon: FileText, color: "secondary", change: "+45" },
  { label: "Urgent Tests", value: "3", icon: AlertCircle, color: "red", change: "-1" },
];

const inventoryAlerts = [
  { item: "Blood Collection Tubes", remaining: 45, reorderPoint: 50 },
  { item: "Reagent Kit A", remaining: 12, reorderPoint: 20 },
  { item: "Glucose Strips", remaining: 85, reorderPoint: 100 },
];

const LabDashboard = () => {
  const [lab] = useState({
    name: "MedLab Diagnostics",
    type: "Laboratory",
    certification: "NABL Certified",
  });

  const getPriorityColor = (priority: string) => {
    return priority === "urgent"
      ? "bg-red-100 text-red-700"
      : "bg-muted text-muted-foreground";
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 75) return "bg-green-500";
    if (progress >= 50) return "bg-yellow-500";
    return "bg-primary";
  };

  return (
    <DashboardLayout
      userRole="laboratory"
      userName={lab.name}
      userSubtitle={lab.certification}
      navItems={navItems}
      userIcon={FlaskConical}
    >
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">
            Laboratory Dashboard
          </h1>
          <p className="text-muted-foreground">
            Manage test results and patient samples efficiently
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="gap-1">
            <Microscope className="h-3 w-3" />
            {lab.certification}
          </Badge>
          <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-1.5 animate-pulse" />
            All Systems Active
          </Badge>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    stat.color === "primary"
                      ? "bg-primary/10 text-primary"
                      : stat.color === "green"
                      ? "bg-green-100 text-green-600"
                      : stat.color === "red"
                      ? "bg-red-100 text-red-600"
                      : "bg-secondary/20 text-secondary"
                  }`}
                >
                  <stat.icon className="h-5 w-5" />
                </div>
                <span
                  className={`flex items-center text-sm font-medium ${
                    stat.change.startsWith("+") ? "text-green-600" : "text-red-600"
                  }`}
                >
                  <TrendingUp
                    className={`h-3.5 w-3.5 mr-1 ${
                      stat.change.startsWith("-") ? "rotate-180" : ""
                    }`}
                  />
                  {stat.change}
                </span>
              </div>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Pending Tests - 2 columns */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg">Pending Tests</CardTitle>
              <Link
                to="/lab/pending"
                className="text-primary text-sm hover:underline flex items-center gap-1"
              >
                View All <ChevronRight className="h-4 w-4" />
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {pendingTests.map((test) => (
                  <div
                    key={test.id}
                    className="p-4 bg-muted/50 rounded-xl hover:bg-muted transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-primary/10 text-primary text-sm">
                          {test.patient
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{test.patient}</h4>
                          {test.priority === "urgent" && (
                            <Badge variant="destructive" className="text-xs">
                              Urgent
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-foreground">{test.test}</p>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-muted-foreground">
                          <span>Sample: {test.sampleId}</span>
                          <span>{test.doctor}</span>
                          <span>{test.date}</span>
                        </div>
                        <div className="mt-3">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-muted-foreground">Progress</span>
                            <span className="font-medium">{test.progress}%</span>
                          </div>
                          <Progress value={test.progress} className="h-1.5" />
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Button size="sm" variant="hero">
                          <Upload className="h-4 w-4 mr-1" />
                          Upload
                        </Button>
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4 mr-1" />
                          Details
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Test Analytics */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Weekly Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-4 gap-4 text-center">
                <div className="p-4 bg-primary/5 rounded-xl">
                  <div className="text-2xl font-bold text-primary">156</div>
                  <div className="text-xs text-muted-foreground">Total Tests</div>
                </div>
                <div className="p-4 bg-green-50 rounded-xl">
                  <div className="text-2xl font-bold text-green-600">142</div>
                  <div className="text-xs text-muted-foreground">Completed</div>
                </div>
                <div className="p-4 bg-yellow-50 rounded-xl">
                  <div className="text-2xl font-bold text-yellow-600">12</div>
                  <div className="text-xs text-muted-foreground">In Progress</div>
                </div>
                <div className="p-4 bg-secondary/10 rounded-xl">
                  <div className="text-2xl font-bold text-secondary">4.2h</div>
                  <div className="text-xs text-muted-foreground">Avg. Time</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - 1 column */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="hero" className="w-full justify-start">
                <Upload className="h-4 w-4 mr-2" />
                Upload New Result
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Search className="h-4 w-4 mr-2" />
                Track Sample
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Printer className="h-4 w-4 mr-2" />
                Print Reports
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Package className="h-4 w-4 mr-2" />
                Check Inventory
              </Button>
            </CardContent>
          </Card>

          {/* Recent Uploads */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg">Recent Uploads</CardTitle>
              <Link to="/lab/completed" className="text-primary text-sm hover:underline">
                View All
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentUploads.map((upload) => (
                  <div
                    key={upload.id}
                    className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl"
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        upload.status === "delivered"
                          ? "bg-green-100 text-green-600"
                          : "bg-yellow-100 text-yellow-600"
                      }`}
                    >
                      {upload.status === "delivered" ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <Clock className="h-4 w-4" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{upload.patient}</p>
                      <p className="text-xs text-muted-foreground">{upload.test}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">{upload.time}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Inventory Alerts */}
          <Card className="border-yellow-200 bg-yellow-50/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
                Inventory Alerts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {inventoryAlerts.map((item) => (
                <div key={item.item} className="p-3 bg-background rounded-xl">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">{item.item}</span>
                    <span
                      className={`text-xs font-medium ${
                        item.remaining < item.reorderPoint
                          ? "text-red-600"
                          : "text-green-600"
                      }`}
                    >
                      {item.remaining} left
                    </span>
                  </div>
                  <Progress
                    value={(item.remaining / item.reorderPoint) * 100}
                    className="h-1.5"
                  />
                </div>
              ))}
              <Button variant="outline" size="sm" className="w-full">
                Order Supplies
              </Button>
            </CardContent>
          </Card>

          {/* Lab Info */}
          <Card className="bg-gradient-to-br from-secondary/10 to-primary/5 border-secondary/20">
            <CardContent className="p-4 text-center">
              <FlaskConical className="h-10 w-10 text-secondary mx-auto mb-3" />
              <h3 className="font-semibold mb-1">{lab.name}</h3>
              <p className="text-sm text-muted-foreground mb-3">
                {lab.certification}
              </p>
              <div className="flex items-center justify-center gap-2 text-sm text-green-600">
                <CheckCircle className="h-4 w-4" />
                Quality Assured
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default LabDashboard;
