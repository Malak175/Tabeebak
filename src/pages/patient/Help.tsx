import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
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
  Search,
  MessageCircle,
  Phone,
  Mail,
  Book,
  Video,
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

const faqs = [
  {
    question: "How do I book an appointment?",
    answer: "Navigate to the 'Doctors' page from the main menu, browse available doctors, and click 'Book Appointment' on your preferred doctor's profile. Select your preferred date and time, then confirm your booking."
  },
  {
    question: "How can I view my lab results?",
    answer: "Go to 'Lab Results' in your dashboard. All your test results are listed there. Click on any result to view detailed information. You can also download reports as PDF."
  },
  {
    question: "How do I request a prescription refill?",
    answer: "Visit the 'Prescriptions' section, find the medication you need refilled, and click 'Request Refill'. Your doctor will review and approve the request."
  },
  {
    question: "Can I have a video consultation with my doctor?",
    answer: "Yes! When booking an appointment, select 'Video Call' as the consultation type. You'll receive a link to join the video call at your scheduled time."
  },
  {
    question: "How do I update my personal information?",
    answer: "Go to 'Settings' in your dashboard and click on 'Profile Information'. You can update your name, email, phone number, and other personal details there."
  },
  {
    question: "How secure is my medical data?",
    answer: "We use industry-standard encryption and security measures to protect your data. All communications are encrypted, and we comply with healthcare data protection regulations."
  },
];

const PatientHelp = () => {
  const [user] = useState({ name: "John Doe" });
  const [searchQuery, setSearchQuery] = useState("");

  const filteredFaqs = faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout
      userRole="patient"
      userName={user.name}
      navItems={navItems}
      userIcon={User}
    >
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Help Center</h1>
        <p className="text-muted-foreground">
          Find answers to common questions or contact support
        </p>
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
                <MessageCircle className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-1">Live Chat</h3>
              <p className="text-sm text-muted-foreground">Chat with our support team</p>
            </CardContent>
          </Card>
          <Card className="hover:border-primary/50 transition-colors cursor-pointer">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <Phone className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-1">Call Us</h3>
              <p className="text-sm text-muted-foreground">+1 800 123 4567</p>
            </CardContent>
          </Card>
          <Card className="hover:border-primary/50 transition-colors cursor-pointer">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <Mail className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-1">Email Support</h3>
              <p className="text-sm text-muted-foreground">support@tabeebak.com</p>
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
                  <AccordionTrigger className="text-left">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
            {filteredFaqs.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                No results found. Try a different search term.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Video className="h-5 w-5" />
              Video Tutorials
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              <Video className="h-4 w-4 mr-2" />
              How to Book an Appointment
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Video className="h-4 w-4 mr-2" />
              Understanding Your Lab Results
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Video className="h-4 w-4 mr-2" />
              Managing Your Prescriptions
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default PatientHelp;
