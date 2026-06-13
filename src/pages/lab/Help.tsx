import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import {
  FlaskConical,
  Bell,
  Clock,
  CheckCircle,
  Home,
  Settings,
  HelpCircle,
  Search,
  Phone,
  Mail,
  Book,
  Headphones,
} from "lucide-react";

const navItems = [
  { title: "Dashboard", url: "/lab/dashboard", icon: Home },
  { title: "Inbox", url: "/lab/requests", icon: Bell },
  { title: "Active Work", url: "/lab/pending", icon: Clock },
  { title: "Results Ready & Archive", url: "/lab/completed", icon: CheckCircle },
  { title: "Settings", url: "/lab/settings", icon: Settings },
  { title: "Help", url: "/lab/help", icon: HelpCircle },
];

const faqs = [
  {
    question: "How do I process a new order from Inbox?",
    answer:
      "Open the order from Inbox, review the request details, then approve to move it into Active Work. Reject only when the request cannot be processed."
  },
  {
    question: "How do I update workflow status in Active Work?",
    answer:
      "From the order details page, use the workflow status control to move between collection and processing steps. Keep internal notes updated for audit clarity."
  },
  {
    question: "How do I upload a result?",
    answer:
      "When an order is In Progress, open it from Active Work and use Result Upload. After upload, the order moves to Results Ready."
  },
  {
    question: "When should I move an order to Completed?",
    answer:
      "Move an order from Results Ready to Completed once result hand-off is confirmed. Completed and Rejected orders are listed in Archive."
  },
  {
    question: "Why are replies disabled on some orders?",
    answer:
      "Shared replies are disabled after a workflow reaches terminal states (Completed or Rejected). Use active workflow stages for patient communication."
  },
];

const LabHelp = () => {
  const [lab] = useState({ name: "MedLab Diagnostics", certification: "NABL Certified" });
  const [searchQuery, setSearchQuery] = useState("");

  const filteredFaqs = faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout
      userRole="laboratory"
      userName={lab.name}
      userSubtitle={lab.certification}
      navItems={navItems}
      userIcon={FlaskConical}
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
              <p className="text-sm text-muted-foreground">labs@tabeebak.com</p>
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
      </div>
    </DashboardLayout>
  );
};

export default LabHelp;
