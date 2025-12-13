import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
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
  Phone,
  Mail,
  Book,
  Headphones,
  Video,
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

const faqs = [
  {
    question: "How do I upload test results?",
    answer: "Go to 'Pending Tests', find the test you want to complete, and click 'Upload Result'. You can upload the results file and it will be automatically sent to the doctor and patient."
  },
  {
    question: "How do I track a sample?",
    answer: "Navigate to 'Sample Tracking' and enter the sample ID. You'll see the complete tracking history including current location, status, and timestamps."
  },
  {
    question: "How do I manage inventory alerts?",
    answer: "Visit 'Inventory' to see all items. Items with low stock are highlighted. You can set minimum stock levels for each item and receive automatic alerts when they run low."
  },
  {
    question: "How do I handle urgent tests?",
    answer: "Urgent tests are marked with a red 'Urgent' badge and appear at the top of your pending list. Prioritize these tests and upload results as soon as they're ready."
  },
  {
    question: "How do I generate reports?",
    answer: "Go to 'Reports' section to view analytics and generate various reports. You can download monthly performance reports, test volume analysis, and inventory usage reports."
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

        <Card>
          <CardHeader>
            <CardTitle>Quick Resources</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              <Video className="h-4 w-4 mr-2" />
              System Tutorial Videos
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Book className="h-4 w-4 mr-2" />
              User Documentation
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <FlaskConical className="h-4 w-4 mr-2" />
              Lab Protocol Guidelines
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default LabHelp;
