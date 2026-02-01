import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  Apple,
  Activity,
  Moon,
  Droplets,
  Brain,
  Salad,
  Footprints,
  Smile,
} from "lucide-react";

const navItems = [
  { title: "Dashboard", url: "/patient/dashboard", icon: Home },
  { title: "Appointments", url: "/patient/appointments", icon: Calendar },
  { title: "Lab Results", url: "/patient/lab-results", icon: FlaskConical },
  { title: "Health Tips", url: "/patient/tips", icon: Heart },
  { title: "Settings", url: "/patient/settings", icon: Settings },
  { title: "Help", url: "/patient/help", icon: HelpCircle },
];

const healthTips = [
  {
    id: 1,
    title: "Heart-Healthy Diet",
    description: "Include more omega-3 fatty acids in your diet. Fish, walnuts, and flaxseeds are excellent sources that support heart health.",
    category: "Nutrition",
    icon: Heart,
    color: "bg-red-100 text-red-600",
  },
  {
    id: 2,
    title: "Stay Hydrated",
    description: "Drink at least 8 glasses of water daily. Proper hydration supports all bodily functions and helps maintain energy levels.",
    category: "Wellness",
    icon: Droplets,
    color: "bg-blue-100 text-blue-600",
  },
  {
    id: 3,
    title: "Regular Exercise",
    description: "Aim for 30 minutes of moderate exercise 5 days a week. Walking, swimming, or cycling can significantly improve cardiovascular health.",
    category: "Fitness",
    icon: Activity,
    color: "bg-green-100 text-green-600",
  },
  {
    id: 4,
    title: "Quality Sleep",
    description: "Get 7-9 hours of quality sleep each night. Good sleep is essential for heart health, mental clarity, and immune function.",
    category: "Wellness",
    icon: Moon,
    color: "bg-purple-100 text-purple-600",
  },
  {
    id: 5,
    title: "Mental Health Matters",
    description: "Practice stress-reduction techniques like meditation, deep breathing, or yoga. Mental health directly impacts physical health.",
    category: "Mental Health",
    icon: Brain,
    color: "bg-pink-100 text-pink-600",
  },
  {
    id: 6,
    title: "Eat More Vegetables",
    description: "Fill half your plate with vegetables at each meal. They provide essential vitamins, minerals, and fiber for optimal health.",
    category: "Nutrition",
    icon: Salad,
    color: "bg-emerald-100 text-emerald-600",
  },
];

const dailyGoals = [
  { name: "Steps", target: 10000, current: 6500, icon: Footprints, unit: "steps" },
  { name: "Water", target: 8, current: 5, icon: Droplets, unit: "glasses" },
  { name: "Sleep", target: 8, current: 7, icon: Moon, unit: "hours" },
  { name: "Fruits", target: 5, current: 3, icon: Apple, unit: "servings" },
];

const PatientHealthTips = () => {
  const [user] = useState({ name: "John Doe" });

  return (
    <DashboardLayout
      userRole="patient"
      userName={user.name}
      navItems={navItems}
      userIcon={User}
    >
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Health Tips</h1>
        <p className="text-muted-foreground">
          Personalized wellness advice and daily goals
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            {healthTips.map((tip) => (
              <Card key={tip.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className={`w-12 h-12 rounded-xl ${tip.color} flex items-center justify-center mb-4`}>
                    <tip.icon className="h-6 w-6" />
                  </div>
                  <Badge variant="outline" className="mb-2">{tip.category}</Badge>
                  <h3 className="font-semibold text-lg mb-2">{tip.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {tip.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Daily Goals
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {dailyGoals.map((goal) => (
                <div key={goal.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <goal.icon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{goal.name}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {goal.current}/{goal.target} {goal.unit}
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${Math.min((goal.current / goal.target) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Smile className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Daily Motivation</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    "The greatest wealth is health. Take care of your body, it's the only place you have to live."
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">- Jim Rohn</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Wellness Resources</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <Heart className="h-4 w-4 mr-2" />
                Heart Health Guide
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Activity className="h-4 w-4 mr-2" />
                Exercise Videos
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Salad className="h-4 w-4 mr-2" />
                Healthy Recipes
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PatientHealthTips;
