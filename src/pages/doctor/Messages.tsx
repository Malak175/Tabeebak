import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  Send,
  Paperclip,
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

const conversations = [
  { id: 1, name: "Ahmed Ali", lastMessage: "Thank you doctor, I'll follow the prescription.", time: "2 min ago", unread: true, avatar: "AA" },
  { id: 2, name: "Fatima Hassan", lastMessage: "When should I schedule my next visit?", time: "15 min ago", unread: true, avatar: "FH" },
  { id: 3, name: "Mohammed Said", lastMessage: "The new medication is working well.", time: "1 hour ago", unread: false, avatar: "MS" },
  { id: 4, name: "Sara Ahmed", lastMessage: "I've uploaded my latest test results.", time: "3 hours ago", unread: false, avatar: "SA" },
  { id: 5, name: "Omar Khan", lastMessage: "See you at the appointment tomorrow.", time: "Yesterday", unread: false, avatar: "OK" },
];

const messages = [
  { id: 1, sender: "patient", text: "Good morning Dr. Johnson. I wanted to update you on my condition.", time: "9:00 AM" },
  { id: 2, sender: "doctor", text: "Good morning Ahmed! Please go ahead and tell me how you're feeling.", time: "9:02 AM" },
  { id: 3, sender: "patient", text: "The chest pain has reduced significantly since I started the new medication.", time: "9:05 AM" },
  { id: 4, sender: "doctor", text: "That's great to hear! Are you experiencing any side effects?", time: "9:07 AM" },
  { id: 5, sender: "patient", text: "No side effects so far. I'm also following the diet plan you recommended.", time: "9:10 AM" },
  { id: 6, sender: "doctor", text: "Excellent! Keep up the good work. Continue with the medication as prescribed and we'll review again at your next appointment.", time: "9:12 AM" },
  { id: 7, sender: "patient", text: "Thank you doctor, I'll follow the prescription.", time: "9:15 AM" },
];

const DoctorMessages = () => {
  const [doctor] = useState({ name: "Dr. Sarah Johnson", specialty: "Cardiologist" });
  const [selectedConversation, setSelectedConversation] = useState(conversations[0]);
  const [newMessage, setNewMessage] = useState("");

  return (
    <DashboardLayout
      userRole="doctor"
      userName={doctor.name}
      userSubtitle={doctor.specialty}
      navItems={navItems}
      userIcon={Stethoscope}
    >
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Messages</h1>
        <p className="text-muted-foreground">Communicate with your patients</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 h-[calc(100vh-220px)]">
        <Card className="lg:col-span-1">
          <CardHeader className="pb-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search conversations..." className="pl-9" />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[calc(100vh-340px)]">
              {conversations.map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => setSelectedConversation(conv)}
                  className={`flex items-center gap-3 p-4 cursor-pointer hover:bg-muted/50 transition-colors border-b ${
                    selectedConversation.id === conv.id ? "bg-muted/50" : ""
                  }`}
                >
                  <Avatar>
                    <AvatarFallback className="bg-primary/10 text-primary">{conv.avatar}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-sm">{conv.name}</h4>
                      <span className="text-xs text-muted-foreground">{conv.time}</span>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{conv.lastMessage}</p>
                  </div>
                  {conv.unread && (
                    <div className="w-2 h-2 bg-primary rounded-full" />
                  )}
                </div>
              ))}
            </ScrollArea>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 flex flex-col">
          <CardHeader className="border-b">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarFallback className="bg-primary/10 text-primary">
                  {selectedConversation.avatar}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-lg">{selectedConversation.name}</CardTitle>
                <p className="text-sm text-muted-foreground">Patient</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1 p-0 flex flex-col">
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender === "doctor" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[70%] p-3 rounded-2xl ${
                        msg.sender === "doctor"
                          ? "bg-primary text-primary-foreground rounded-br-sm"
                          : "bg-muted rounded-bl-sm"
                      }`}
                    >
                      <p className="text-sm">{msg.text}</p>
                      <p className={`text-xs mt-1 ${
                        msg.sender === "doctor" ? "text-primary-foreground/70" : "text-muted-foreground"
                      }`}>
                        {msg.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <Button variant="ghost" size="icon">
                  <Paperclip className="h-5 w-5" />
                </Button>
                <Input
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-1"
                />
                <Button>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default DoctorMessages;
