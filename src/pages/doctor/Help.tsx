import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import {
  Calendar,
  Users,
  Clock,
  Stethoscope,
  Home,
  Settings,
  HelpCircle,
  FileText,
  MessageSquare,
  Video,
  Search,
  Phone,
  Mail,
  Book,
  Headphones,
} from "lucide-react";

const navItems = [
  { title: "Dashboard", url: "/doctor/dashboard", icon: Home },
  { title: "Appointments", url: "/doctor/appointments", icon: Calendar },
  { title: "Patients", url: "/doctor/patients", icon: Users },
  { title: "Schedule", url: "/doctor/schedule", icon: Clock },
  { title: "Messages", url: "/doctor/messages", icon: MessageSquare },
  { title: "Video Consult", url: "/doctor/video", icon: Video },
  { title: "Reports", url: "/doctor/reports", icon: FileText },
  { title: "Settings", url: "/doctor/settings", icon: Settings },
  { title: "Help", url: "/doctor/help", icon: HelpCircle },
];

const faqs = [
  {
    question: "How do I manage my appointment schedule?",
    answer: "Navigate to the 'Schedule' section to view and manage your weekly availability. You can block time slots, set working hours, and configure appointment durations."
  },
  {
    question: "How do I start a video consultation?",
    answer: "Go to 'Video Consult' section. When it's time for a scheduled video call, click 'Join Now' or 'Start Call'. Ensure your camera and microphone are working properly."
  },
  {
    question: "How can I view patient medical records?",
    answer: "Click on any patient in the 'Patients' section, then select 'View Full Record' to access their complete medical history, lab results, and previous appointments."
  },
  {
    question: "How do I write and send prescriptions?",
    answer: "From a patient's record or during an appointment, click 'Write Prescription'. Fill in the medication details and send it directly to the patient or their preferred pharmacy."
  },
  {
    question: "How do I handle appointment requests?",
    answer: "New appointment requests appear on your dashboard and in the Appointments section. Review the patient's information and click 'Accept' or 'Decline' accordingly."
  },
];

const DoctorHelp = () => {
  const [doctor] = useState({ name: "Dr. Sarah Johnson", specialty: "Cardiologist" });
  const [searchQuery, setSearchQuery] = useState("");

  const filteredFaqs = faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
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
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Help Center</h1>
        <p className="text-muted-foreground">Get support and find answers to your questions</p>
      </div>

      <div className="max-w-3xl space-y-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search for help..."
            className="pl-10 h-12"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <Card className="hover:border-primary/50 transition-colors cursor-pointer">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <Headphones className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-1">Technical Support</h3>
              <p className="text-sm text-muted-foreground">24/7 support available</p>
            </CardContent>
          </Card>
          <Card className="hover:border-primary/50 transition-colors cursor-pointer">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <Phone className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-1">Call Support</h3>
              <p className="text-sm text-muted-foreground">+1 800 123 4567</p>
            </CardContent>
          </Card>
          <Card className="hover:border-primary/50 transition-colors cursor-pointer">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <Mail className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-1">Email Support</h3>
              <p className="text-sm text-muted-foreground">doctors@tabeebak.com</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Book className="h-5 w-5" />
              Frequently Asked Questions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {filteredFaqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">{faq.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Resources</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              <Video className="h-4 w-4 mr-2" />
              Video Call Best Practices
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <FileText className="h-4 w-4 mr-2" />
              Documentation Guidelines
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Users className="h-4 w-4 mr-2" />
              Patient Communication Tips
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default DoctorHelp;
