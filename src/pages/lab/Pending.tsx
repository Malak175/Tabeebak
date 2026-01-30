import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
  Upload,
  Eye,
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
  { id: 1, patient: "Ahmed Ali", test: "Complete Blood Count", doctor: "Dr. Sarah Johnson", date: "Dec 10, 2024", priority: "urgent", sampleId: "SMP-001234", progress: 75 },
  { id: 2, patient: "Fatima Hassan", test: "Lipid Profile", doctor: "Dr. Michael Chen", date: "Dec 10, 2024", priority: "urgent", sampleId: "SMP-001235", progress: 40 },
  { id: 3, patient: "Mohammed Said", test: "Thyroid Function", doctor: "Dr. Emily Williams", date: "Dec 9, 2024", priority: "normal", sampleId: "SMP-001236", progress: 90 },
  { id: 4, patient: "Sara Ahmed", test: "HbA1c", doctor: "Dr. Sarah Johnson", date: "Dec 9, 2024", priority: "normal", sampleId: "SMP-001237", progress: 20 },
  { id: 5, patient: "Omar Khan", test: "Liver Function Test", doctor: "Dr. Michael Chen", date: "Dec 9, 2024", priority: "normal", sampleId: "SMP-001238", progress: 60 },
  { id: 6, patient: "Layla Mahmoud", test: "Kidney Function", doctor: "Dr. Emily Williams", date: "Dec 8, 2024", priority: "urgent", sampleId: "SMP-001239", progress: 85 },
];

const LabPending = () => {
  const [lab] = useState({ name: "MedLab Diagnostics", certification: "NABL Certified" });
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTests = pendingTests.filter(test =>
    test.patient.toLowerCase().includes(searchQuery.toLowerCase()) ||
    test.sampleId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout
      userRole="laboratory"
      userName={lab.name}
      userSubtitle={lab.certification}
      navItems={navItems}
      userIcon={FlaskConical}
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Pending Tests</h1>
          <p className="text-muted-foreground">Manage and process pending laboratory tests</p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="text-red-600 border-red-200">
            {pendingTests.filter(t => t.priority === "urgent").length} Urgent
          </Badge>
          <Badge variant="outline">
            {pendingTests.length} Total Pending
          </Badge>
        </div>
      </div>

      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search by patient or sample ID..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-4">
        {filteredTests.map((test) => (
          <Card key={test.id}>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {test.patient.split(" ").map(n => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold">{test.patient}</h3>
                    {test.priority === "urgent" && (
                      <Badge variant="destructive">Urgent</Badge>
                    )}
                  </div>
                  <p className="font-medium text-primary">{test.test}</p>
                  <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
                    <span>Sample: {test.sampleId}</span>
                    <span>{test.doctor}</span>
                    <span>{test.date}</span>
                  </div>
                </div>
                <div className="w-full md:w-48">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">{test.progress}%</span>
                  </div>
                  <Progress value={test.progress} className="h-2" />
                </div>
                <div className="flex gap-2">
                  <Button variant="hero" size="sm">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Result
                  </Button>
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    Details
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </DashboardLayout>
  );
};

export default LabPending;
