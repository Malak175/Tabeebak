import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import {
  Calendar,
  FlaskConical,
  User,
  Heart,
  Home,
  Settings,
  HelpCircle,
  Download,
  Eye,
  TrendingUp,
  TrendingDown,
  Minus,
  Brain,
  AlertTriangle,
  CheckCircle,
  Info,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";

const navItems = [
  { title: "Dashboard", url: "/patient/dashboard", icon: Home },
  { title: "Appointments", url: "/patient/appointments", icon: Calendar },
  { title: "Lab Results", url: "/patient/lab-results", icon: FlaskConical },
  { title: "Health Tips", url: "/patient/tips", icon: Heart },
  { title: "Settings", url: "/patient/settings", icon: Settings },
  { title: "Help", url: "/patient/help", icon: HelpCircle },
];

const labResults = [
  {
    id: 1,
    name: "Complete Blood Count (CBC)",
    date: "Dec 1, 2024",
    status: "normal",
    doctor: "Dr. Sarah Johnson",
    lab: "MedLab Diagnostics",
    aiRiskPrediction: {
      overallRisk: 12,
      riskLevel: "low",
      conditions: [
        { name: "Anemia Risk", percentage: 8, level: "low" },
        { name: "Infection Risk", percentage: 15, level: "low" },
        { name: "Blood Disorder Risk", percentage: 5, level: "low" },
      ],
      recommendation: "Your blood count values are within normal ranges. Continue maintaining a healthy lifestyle.",
    },
    values: [
      { name: "Hemoglobin", value: "14.5 g/dL", status: "normal", range: "13.5-17.5" },
      { name: "WBC", value: "7,500 /μL", status: "normal", range: "4,500-11,000" },
      { name: "Platelets", value: "250,000 /μL", status: "normal", range: "150,000-400,000" },
    ],
  },
  {
    id: 2,
    name: "Lipid Profile",
    date: "Nov 28, 2024",
    status: "attention",
    doctor: "Dr. Sarah Johnson",
    lab: "MedLab Diagnostics",
    aiRiskPrediction: {
      overallRisk: 68,
      riskLevel: "moderate",
      conditions: [
        { name: "Heart Disease Risk", percentage: 72, level: "high" },
        { name: "Stroke Risk", percentage: 58, level: "moderate" },
        { name: "Atherosclerosis Risk", percentage: 65, level: "moderate" },
      ],
      recommendation: "Your cholesterol levels are elevated. Consider dietary changes, regular exercise, and consult with your doctor about treatment options.",
    },
    values: [
      { name: "Total Cholesterol", value: "220 mg/dL", status: "high", range: "<200" },
      { name: "LDL", value: "145 mg/dL", status: "high", range: "<100" },
      { name: "HDL", value: "45 mg/dL", status: "low", range: ">40" },
      { name: "Triglycerides", value: "160 mg/dL", status: "normal", range: "<150" },
    ],
  },
  {
    id: 3,
    name: "HbA1c Test",
    date: "Nov 20, 2024",
    status: "normal",
    doctor: "Dr. Sarah Johnson",
    lab: "City Lab Center",
    aiRiskPrediction: {
      overallRisk: 18,
      riskLevel: "low",
      conditions: [
        { name: "Diabetes Risk", percentage: 18, level: "low" },
        { name: "Pre-diabetes Risk", percentage: 22, level: "low" },
      ],
      recommendation: "Your blood sugar control is excellent. Maintain your current diet and exercise routine.",
    },
    values: [
      { name: "HbA1c", value: "5.4%", status: "normal", range: "<5.7%" },
    ],
  },
  {
    id: 4,
    name: "Thyroid Function Test",
    date: "Nov 15, 2024",
    status: "normal",
    doctor: "Dr. Sarah Johnson",
    lab: "MedLab Diagnostics",
    aiRiskPrediction: {
      overallRisk: 10,
      riskLevel: "low",
      conditions: [
        { name: "Hypothyroidism Risk", percentage: 8, level: "low" },
        { name: "Hyperthyroidism Risk", percentage: 12, level: "low" },
      ],
      recommendation: "Your thyroid function is normal. No immediate concerns detected.",
    },
    values: [
      { name: "TSH", value: "2.5 mIU/L", status: "normal", range: "0.4-4.0" },
      { name: "T4", value: "8.2 μg/dL", status: "normal", range: "4.5-12.0" },
    ],
  },
];

const PatientLabResults = () => {
  const [user] = useState({ name: "John Doe" });
  const [selectedResult, setSelectedResult] = useState<typeof labResults[0] | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "normal":
        return "bg-green-100 text-green-700";
      case "attention":
      case "high":
        return "bg-yellow-100 text-yellow-700";
      case "low":
        return "bg-blue-100 text-blue-700";
      case "critical":
        return "bg-red-100 text-red-700";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "high":
        return <TrendingUp className="h-4 w-4 text-yellow-600" />;
      case "low":
        return <TrendingDown className="h-4 w-4 text-blue-600" />;
      default:
        return <Minus className="h-4 w-4 text-green-600" />;
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case "low":
        return "text-green-600";
      case "moderate":
        return "text-yellow-600";
      case "high":
        return "text-red-600";
      default:
        return "text-muted-foreground";
    }
  };

  const getRiskBgColor = (level: string) => {
    switch (level) {
      case "low":
        return "bg-green-500";
      case "moderate":
        return "bg-yellow-500";
      case "high":
        return "bg-red-500";
      default:
        return "bg-muted";
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case "low":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "moderate":
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case "high":
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      default:
        return <Info className="h-5 w-5 text-muted-foreground" />;
    }
  };

  return (
    <DashboardLayout
      userRole="patient"
      userName={user.name}
      navItems={navItems}
      userIcon={User}
    >
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Lab Results</h1>
        <p className="text-muted-foreground">
          View and download your laboratory test results
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {labResults.map((result) => (
            <Card
              key={result.id}
              className={`cursor-pointer transition-all hover:border-primary/50 ${
                selectedResult?.id === result.id ? "border-primary" : ""
              }`}
              onClick={() => setSelectedResult(result)}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex gap-4">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        result.status === "normal"
                          ? "bg-green-100 text-green-600"
                          : "bg-yellow-100 text-yellow-600"
                      }`}
                    >
                      <FlaskConical className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{result.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {result.date} • {result.lab}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Ordered by: {result.doctor}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge className={getStatusColor(result.status)}>
                      {result.status === "normal" ? "All Normal" : "Needs Attention"}
                    </Badge>
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="space-y-6">
          {selectedResult ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{selectedResult.name}</CardTitle>
                <p className="text-sm text-muted-foreground">{selectedResult.date}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedResult.values.map((value, idx) => (
                  <div key={idx} className="p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm">{value.name}</span>
                      {getStatusIcon(value.status)}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-semibold">{value.value}</span>
                      <span className="text-xs text-muted-foreground">
                        Range: {value.range}
                      </span>
                    </div>
                  </div>
                ))}

                {/* AI Risk Prediction Section */}
                {selectedResult.aiRiskPrediction && (
                  <div className="mt-6 p-4 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-xl border border-primary/20">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <Brain className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm">AI Risk Analysis</h4>
                        <p className="text-xs text-muted-foreground">Powered by advanced AI prediction</p>
                      </div>
                    </div>

                    {/* Overall Risk Score */}
                    <div className="mb-4 p-3 bg-background rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Overall Risk Score</span>
                        {getRiskIcon(selectedResult.aiRiskPrediction.riskLevel)}
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex-1">
                          <Progress 
                            value={selectedResult.aiRiskPrediction.overallRisk} 
                            className={`h-3 ${getRiskBgColor(selectedResult.aiRiskPrediction.riskLevel)}`}
                          />
                        </div>
                        <span className={`text-2xl font-bold ${getRiskColor(selectedResult.aiRiskPrediction.riskLevel)}`}>
                          {selectedResult.aiRiskPrediction.overallRisk}%
                        </span>
                      </div>
                      <p className={`text-xs mt-1 capitalize ${getRiskColor(selectedResult.aiRiskPrediction.riskLevel)}`}>
                        {selectedResult.aiRiskPrediction.riskLevel} Risk Level
                      </p>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-3 text-center">
                      * AI predictions are for informational purposes only. Always consult your doctor for medical advice.
                    </p>
                  </div>
                )}

                <Button className="w-full mt-4">
                  <Download className="h-4 w-4 mr-2" />
                  Download Full Report
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-muted/30">
              <CardContent className="p-8 text-center">
                <FlaskConical className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Select a test result to view details
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PatientLabResults;
