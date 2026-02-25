import { Heart, AlertCircle, Activity, Utensils, Dumbbell, Cigarette, Stethoscope } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const keyTakeaways = [
  "Heart disease is a group of conditions that includes coronary heart disease, arrhythmias, heart failure and valve disease.",
  "Heart disease is a major cause of health problems and death, but it's often preventable.",
  "Many types of heart disease can be prevented or treated with healthy lifestyle choices, medications and/or surgery.",
];

const preventionTips = [
  {
    icon: Utensils,
    title: "Eat well",
    description: "Follow healthy eating habits with balanced nutrition to help protect your heart.",
  },
  {
    icon: Dumbbell,
    title: "Exercise regularly",
    description: "Learn how much exercise you need and how to build more activity into your daily life.",
  },
  {
    icon: Cigarette,
    title: "Stop smoking",
    description: "Smoking significantly increases your risk of heart disease. Quitting improves your heart health.",
  },
  {
    icon: Stethoscope,
    title: "See your doctor",
    description: "Regular check-ups help monitor blood pressure, diabetes, and cholesterol levels.",
  },
];

const heartConditions = [
  {
    id: "coronary",
    title: "Coronary Heart Disease",
    content: "Coronary heart disease (CHD) occurs when fatty material (plaque) builds up in the arteries that supply blood to your heart. This plaque gradually clogs your arteries, reducing the flow of blood. CHD can lead to angina (chest pain) or a heart attack.",
  },
  {
    id: "arrhythmias",
    title: "Arrhythmias",
    content: "Arrhythmias are problems with your heart rhythm. Your heart may beat too fast, too slow, or irregularly. While some arrhythmias are harmless, others can be serious and require treatment.",
  },
  {
    id: "heart-failure",
    title: "Heart Failure",
    content: "Heart failure is a condition where your heart isn't pumping blood as well as it should. This doesn't mean your heart has stopped working, but it needs support to work better.",
  },
  {
    id: "valve-disease",
    title: "Valve Disease",
    content: "Heart valve disease occurs when one or more of your heart valves don't work properly. This can affect blood flow through your heart and to the rest of your body.",
  },
];

const HeartDiseaseSection = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-6">
            <Heart className="h-5 w-5" />
            <span className="font-semibold text-sm">Heart Health</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Understanding <span className="text-primary">Heart Disease</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Heart disease is the broad term for conditions that affect the structure and function of the heart muscle.
          </p>
        </div>

        {/* Key Takeaways Box */}
        <div className="max-w-3xl mx-auto mb-16">
          <div className="bg-card border border-border rounded-2xl p-6 md:p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-primary" />
                Key Takeaways
              </h3>
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <Activity className="h-4 w-4" />
                5 min read
              </span>
            </div>
            <ul className="space-y-4">
              {keyTakeaways.map((takeaway, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                  <p className="text-muted-foreground">{takeaway}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Heart Disease Types Accordion */}
        <div className="max-w-3xl mx-auto mb-16">
          <h3 className="text-2xl font-bold mb-6 text-primary">Heart Disease Overview</h3>
          <div className="border-t-4 border-primary mb-6" />
          <Accordion type="single" collapsible className="space-y-2">
            {heartConditions.map((condition) => (
              <AccordionItem
                key={condition.id}
                value={condition.id}
                className="border border-border rounded-lg px-4"
              >
                <AccordionTrigger className="text-left font-semibold hover:text-primary">
                  {condition.title}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {condition.content}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* Prevention Section */}
        <div className="max-w-4xl mx-auto">
          <h3 className="text-2xl md:text-3xl font-bold mb-4 text-center text-primary">
            How Can You Prevent Heart Disease?
          </h3>
          <p className="text-center text-muted-foreground mb-10 max-w-2xl mx-auto">
            In many cases, you can significantly reduce your risk of heart disease by improving your lifestyle choices.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            {preventionTips.map((tip) => (
              <div
                key={tip.title}
                className="flex items-start gap-4 p-6 bg-card border border-border rounded-xl hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <tip.icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">{tip.title}</h4>
                  <p className="text-sm text-muted-foreground">{tip.description}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link to="/doctors">
              <Button variant="hero" size="lg">
                Find a Heart Specialist
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeartDiseaseSection;
