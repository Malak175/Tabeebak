import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
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
  AlertCircle,
  Plus,
  ShoppingCart,
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

const inventoryItems = [
  { id: 1, name: "Blood Collection Tubes", category: "Consumables", stock: 45, minStock: 50, unit: "boxes", status: "low" },
  { id: 2, name: "Reagent Kit A (CBC)", category: "Reagents", stock: 12, minStock: 20, unit: "kits", status: "low" },
  { id: 3, name: "Glucose Strips", category: "Consumables", stock: 85, minStock: 100, unit: "boxes", status: "low" },
  { id: 4, name: "Urine Containers", category: "Consumables", stock: 200, minStock: 100, unit: "pieces", status: "ok" },
  { id: 5, name: "Reagent Kit B (Lipid)", category: "Reagents", stock: 35, minStock: 15, unit: "kits", status: "ok" },
  { id: 6, name: "Gloves (Medium)", category: "PPE", stock: 150, minStock: 50, unit: "boxes", status: "ok" },
  { id: 7, name: "Syringes 5ml", category: "Consumables", stock: 300, minStock: 200, unit: "pieces", status: "ok" },
  { id: 8, name: "Alcohol Swabs", category: "Consumables", stock: 25, minStock: 50, unit: "boxes", status: "low" },
];

const categories = ["All", "Consumables", "Reagents", "PPE", "Equipment"];

const LabInventory = () => {
  const [lab] = useState({ name: "MedLab Diagnostics", certification: "NABL Certified" });
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredItems = inventoryItems.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
    (selectedCategory === "All" || item.category === selectedCategory)
  );

  const lowStockCount = inventoryItems.filter(i => i.status === "low").length;

  return (
    <DashboardLayout
      userRole="laboratory"
      userName={lab.name}
      userSubtitle={lab.certification}
      navItems={navItems}
      userIcon={FlaskConical}
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Inventory Management</h1>
          <p className="text-muted-foreground">Track and manage laboratory supplies</p>
        </div>
        <div className="flex items-center gap-4">
          {lowStockCount > 0 && (
            <Badge variant="destructive" className="gap-1">
              <AlertCircle className="h-3 w-3" />
              {lowStockCount} Low Stock
            </Badge>
          )}
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Categories</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`w-full p-3 rounded-lg text-left text-sm font-medium transition-colors ${
                    selectedCategory === cat
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-yellow-50/50 border-yellow-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
                <h4 className="font-medium">Low Stock Alert</h4>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                {lowStockCount} items need to be reordered
              </p>
              <Button variant="outline" className="w-full">
                <ShoppingCart className="h-4 w-4 mr-2" />
                Order Supplies
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-3 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search inventory..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {filteredItems.map((item) => (
              <Card key={item.id} className={item.status === "low" ? "border-yellow-300" : ""}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold">{item.name}</h3>
                      <Badge variant="outline" className="mt-1">{item.category}</Badge>
                    </div>
                    {item.status === "low" && (
                      <Badge variant="destructive" className="gap-1">
                        <AlertCircle className="h-3 w-3" />
                        Low
                      </Badge>
                    )}
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Current Stock</span>
                      <span className="font-medium">{item.stock} {item.unit}</span>
                    </div>
                    <Progress
                      value={(item.stock / (item.minStock * 2)) * 100}
                      className={`h-2 ${item.status === "low" ? "[&>div]:bg-yellow-500" : ""}`}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Min: {item.minStock}</span>
                      <span>Max: {item.minStock * 2}</span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="w-full mt-3">
                    Reorder
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default LabInventory;
