import { LucideIcon } from "lucide-react";

interface TestCategoryCardProps {
  name: string;
  count: number;
  icon: LucideIcon;
  isActive?: boolean;
  onClick?: () => void;
}

const TestCategoryCard = ({ name, count, icon: Icon, isActive, onClick }: TestCategoryCardProps) => {
  return (
    <button
      onClick={onClick}
      className={`group relative p-6 rounded-2xl border-2 transition-all duration-300 text-center overflow-hidden ${
        isActive
          ? "border-primary bg-primary/10 shadow-lg"
          : "border-transparent bg-card hover:border-primary/50 hover:shadow-md"
      }`}
    >
      <div className={`w-12 h-12 mx-auto mb-3 rounded-xl flex items-center justify-center transition-colors ${
        isActive ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground"
      }`}>
        <Icon className="h-6 w-6" />
      </div>
      <div className={`text-base font-semibold mb-1 transition-colors ${isActive ? "text-primary" : "group-hover:text-primary"}`}>
        {name}
      </div>
      <div className="text-sm text-muted-foreground">{count} tests</div>
    </button>
  );
};

export default TestCategoryCard;
