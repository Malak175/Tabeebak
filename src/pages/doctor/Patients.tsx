import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import {
  Calendar,
  Users,
  Clock,
  Stethoscope,
  Home,
  Settings,
  HelpCircle,
  MessageSquare,
  Search,
  Phone,
  Mail,
  ChevronRight,
} from "lucide-react";

const navItems = [
  { title: "Dashboard", url: "/doctor/dashboard", icon: Home },
  { title: "Appointments", url: "/doctor/appointments", icon: Calendar },
  { title: "Patients", url: "/doctor/patients", icon: Users },
  { title: "Schedule", url: "/doctor/schedule", icon: Clock },
  { title: "Settings", url: "/doctor/settings", icon: Settings },
  { title: "Help", url: "/doctor/help", icon: HelpCircle },
];

const patients = [
  { id: 1, name: "Ahmed Ali", age: 45, gender: "Male", phone: "+1 234 567 8901", email: "ahmed@email.com", lastVisit: "Dec 10, 2024", condition: "Stable", avatar: "AA", diagnosis: "Hypertension" },
  { id: 2, name: "Fatima Hassan", age: 32, gender: "Female", phone: "+1 234 567 8902", email: "fatima@email.com", lastVisit: "Dec 10, 2024", condition: "Improving", avatar: "FH", diagnosis: "Arrhythmia" },
  { id: 3, name: "Mohammed Said", age: 58, gender: "Male", phone: "+1 234 567 8903", email: "mohammed@email.com", lastVisit: "Dec 8, 2024", condition: "Critical", avatar: "MS", diagnosis: "Heart Failure" },
  { id: 4, name: "Sara Ahmed", age: 28, gender: "Female", phone: "+1 234 567 8904", email: "sara@email.com", lastVisit: "Dec 5, 2024", condition: "Stable", avatar: "SA", diagnosis: "Preventive Care" },
  { id: 5, name: "Omar Khan", age: 52, gender: "Male", phone: "+1 234 567 8905", email: "omar@email.com", lastVisit: "Dec 3, 2024", condition: "Stable", avatar: "OK", diagnosis: "Post-Surgery" },
  { id: 6, name: "Layla Mahmoud", age: 40, gender: "Female", phone: "+1 234 567 8906", email: "layla@email.com", lastVisit: "Nov 28, 2024", condition: "Improving", avatar: "LM", diagnosis: "Coronary Disease" },
];

const DoctorPatients = () => {
  const [doctor] = useState({ name: "Dr. Sarah Johnson", specialty: "Cardiologist" });
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<typeof patients[0] | null>(null);

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case "Stable": return "bg-green-100 text-green-700";
      case "Improving": return "bg-blue-100 text-blue-700";
      case "Critical": return "bg-red-100 text-red-700";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const filteredPatients = patients.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout
      userRole="doctor"
      userName={doctor.name}
      userSubtitle={doctor.specialty}
      navItems={navItems}
      userIcon={Stethoscope}
    >
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">My Patients</h1>
        <p className="text-muted-foreground">View and manage your patient records</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search patients..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="space-y-3">
            {filteredPatients.map((patient) => (
              <Card
                key={patient.id}
                className={`cursor-pointer hover:border-primary/50 transition-colors ${
                  selectedPatient?.id === patient.id ? "border-primary" : ""
                }`}
                onClick={() => setSelectedPatient(patient)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-primary/10 text-primary">{patient.avatar}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{patient.name}</h3>
                        <span className="text-sm text-muted-foreground">
                          {patient.age} yrs, {patient.gender}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{patient.diagnosis}</p>
                      <p className="text-xs text-muted-foreground mt-1">Last visit: {patient.lastVisit}</p>
                    </div>
                    <Badge className={getConditionColor(patient.condition)}>{patient.condition}</Badge>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div>
          {selectedPatient ? (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="bg-primary/10 text-primary text-xl">
                      {selectedPatient.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle>{selectedPatient.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {selectedPatient.age} years, {selectedPatient.gender}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedPatient.phone}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedPatient.email}</span>
                  </div>
                </div>

                <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Diagnosis</span>
                    <span className="font-medium">{selectedPatient.diagnosis}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Condition</span>
                    <Badge className={getConditionColor(selectedPatient.condition)}>
                      {selectedPatient.condition}
                    </Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Last Visit</span>
                    <span className="font-medium">{selectedPatient.lastVisit}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Button className="w-full">View Full Record</Button>
                  <Button variant="outline" className="w-full">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Send Message
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Calendar className="h-4 w-4 mr-2" />
                    Schedule Appointment
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-muted/30">
              <CardContent className="p-8 text-center">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Select a patient to view details</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DoctorPatients;
