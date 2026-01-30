import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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
  VideoOff,
  Mic,
  MicOff,
  Phone,
  Monitor,
  MoreVertical,
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

const upcomingVideoCalls = [
  { id: 1, patient: "Mohammed Said", time: "11:30 AM", status: "starting-soon", avatar: "MS" },
  { id: 2, patient: "Fatima Hassan", time: "3:00 PM", status: "scheduled", avatar: "FH" },
  { id: 3, patient: "Omar Khan", time: "4:30 PM", status: "scheduled", avatar: "OK" },
];

const recentVideoCalls = [
  { id: 4, patient: "Ahmed Ali", date: "Dec 9, 2024", duration: "25 min", avatar: "AA" },
  { id: 5, patient: "Sara Ahmed", date: "Dec 8, 2024", duration: "30 min", avatar: "SA" },
  { id: 6, patient: "Layla Mahmoud", date: "Dec 7, 2024", duration: "20 min", avatar: "LM" },
];

const DoctorVideoConsult = () => {
  const [doctor] = useState({ name: "Dr. Sarah Johnson", specialty: "Cardiologist" });
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);

  return (
    <DashboardLayout
      userRole="doctor"
      userName={doctor.name}
      userSubtitle={doctor.specialty}
      navItems={navItems}
      userIcon={Stethoscope}
    >
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Video Consultations</h1>
        <p className="text-muted-foreground">Conduct virtual appointments with patients</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardContent className="p-0">
              <div className="aspect-video bg-gradient-to-br from-muted to-muted/50 rounded-t-lg flex items-center justify-center relative">
                <div className="text-center">
                  <Video className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Active Call</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Start a video consultation with a patient
                  </p>
                  <Button className="gap-2">
                    <Video className="h-4 w-4" />
                    Start New Call
                  </Button>
                </div>
                
                <div className="absolute bottom-4 right-4 w-32 h-24 bg-card rounded-lg shadow-lg flex items-center justify-center">
                  <div className="text-center">
                    <Avatar className="h-10 w-10 mx-auto mb-1">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">You</AvatarFallback>
                    </Avatar>
                    <p className="text-xs">Preview</p>
                  </div>
                </div>
              </div>
              
              <div className="p-4 border-t flex items-center justify-center gap-4">
                <Button
                  variant={isMicOn ? "outline" : "destructive"}
                  size="icon"
                  className="rounded-full h-12 w-12"
                  onClick={() => setIsMicOn(!isMicOn)}
                >
                  {isMicOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
                </Button>
                <Button
                  variant={isVideoOn ? "outline" : "destructive"}
                  size="icon"
                  className="rounded-full h-12 w-12"
                  onClick={() => setIsVideoOn(!isVideoOn)}
                >
                  {isVideoOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
                </Button>
                <Button variant="outline" size="icon" className="rounded-full h-12 w-12">
                  <Monitor className="h-5 w-5" />
                </Button>
                <Button variant="destructive" size="icon" className="rounded-full h-12 w-12">
                  <Phone className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="rounded-full h-12 w-12">
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Calls</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentVideoCalls.map((call) => (
                  <div key={call.id} className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                    <Avatar>
                      <AvatarFallback className="bg-primary/10 text-primary">{call.avatar}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h4 className="font-medium">{call.patient}</h4>
                      <p className="text-sm text-muted-foreground">{call.date} • {call.duration}</p>
                    </div>
                    <Button variant="outline" size="sm">View Notes</Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Today's Video Calls</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {upcomingVideoCalls.map((call) => (
                <div key={call.id} className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <Avatar>
                      <AvatarFallback className="bg-primary/10 text-primary">{call.avatar}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-medium">{call.patient}</h4>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {call.time}
                      </div>
                    </div>
                  </div>
                  {call.status === "starting-soon" ? (
                    <Button className="w-full" variant="hero">
                      <Video className="h-4 w-4 mr-2" />
                      Join Now
                    </Button>
                  ) : (
                    <Button className="w-full" variant="outline">
                      <Video className="h-4 w-4 mr-2" />
                      Start Call
                    </Button>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>• Ensure good lighting and a quiet environment</p>
              <p>• Test your camera and microphone before calls</p>
              <p>• Have patient records ready before starting</p>
              <p>• Use screen share to explain test results</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DoctorVideoConsult;
