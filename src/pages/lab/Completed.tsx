import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
  Eye,
} from "lucide-react";

const navItems = [
  { title: "Dashboard", url: "/lab/dashboard", icon: Home },
  { title: "Pending Tests", url: "/lab/pending", icon: Clock },
  { title: "Completed", url: "/lab/completed", icon: CheckCircle },
  { title: "Settings", url: "/lab/settings", icon: Settings },
  { title: "Help", url: "/lab/help", icon: HelpCircle },
];

const completedTests = [
  { id: 1, patient: "Khalid Omar", test: "Kidney Function", doctor: "Dr. Sarah Johnson", date: "Dec 10, 2024", time: "15 min ago", sampleId: "SMP-001230", status: "delivered" },
  { id: 2, patient: "Maryam Said", test: "Electrolytes Panel", doctor: "Dr. Michael Chen", date: "Dec 10, 2024", time: "30 min ago", sampleId: "SMP-001231", status: "delivered" },
  { id: 3, patient: "Yusuf Ali", test: "CBC", doctor: "Dr. Emily Williams", date: "Dec 10, 2024", time: "1 hour ago", sampleId: "SMP-001232", status: "pending-delivery" },
  { id: 4, patient: "Aisha Hassan", test: "Urine Analysis", doctor: "Dr. Sarah Johnson", date: "Dec 10, 2024", time: "2 hours ago", sampleId: "SMP-001233", status: "delivered" },
  { id: 5, patient: "Hassan Ali", test: "Blood Sugar", doctor: "Dr. Michael Chen", date: "Dec 9, 2024", time: "Yesterday", sampleId: "SMP-001220", status: "delivered" },
  { id: 6, patient: "Noor Mohammed", test: "Lipid Profile", doctor: "Dr. Emily Williams", date: "Dec 9, 2024", time: "Yesterday", sampleId: "SMP-001221", status: "delivered" },
];

const LabCompleted = () => {
  const [lab] = useState({ name: "MedLab Diagnostics", certification: "NABL Certified" });
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTests = completedTests.filter(test =>
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
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Completed Tests</h1>
          <p className="text-muted-foreground">View and manage completed test results</p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="secondary" className="text-green-600">
            {completedTests.filter(t => t.status === "delivered").length} Delivered
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
                  <AvatarFallback className="bg-green-100 text-green-600">
                    {test.patient.split(" ").map(n => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold">{test.patient}</h3>
                    <Badge className={test.status === "delivered" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}>
                      {test.status === "delivered" ? "Delivered" : "Pending Delivery"}
                    </Badge>
                  </div>
                  <p className="font-medium text-primary">{test.test}</p>
                  <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
                    <span>Sample: {test.sampleId}</span>
                    <span>{test.doctor}</span>
                    <span>{test.time}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    View
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

export default LabCompleted;
