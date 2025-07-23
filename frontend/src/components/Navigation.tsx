import { Link, useLocation } from "react-router-dom";
import { 
  Home, 
  ShoppingCart, 
  ClipboardList, 
  Shield, 
  BarChart3,
  Menu,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";

const navItems = [
  { to: "/", icon: Home, label: "Dashboard" },
  { to: "/buy-list", icon: ClipboardList, label: "Buy List" },
  { to: "/admin", icon: Shield, label: "Admin Panel" },
  { to: "/reports", icon: BarChart3, label: "Reports" },
];

export function Navigation() {
  const location = useLocation();
  const { isAdmin } = useAuth();
  const [open, setOpen] = useState(false);

  const filteredNavItems = navItems;

  // NavLinks now accepts an optional onClick handler
  const NavLinks = ({ onClick }: { onClick?: () => void }) => (
    <>
      {filteredNavItems.map((item) => {
        const isActive = location.pathname === item.to;
        return (
          <Link
            key={item.to}
            to={item.to}
            onClick={onClick}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-smooth ${
              isActive
                ? "bg-primary text-primary-foreground neon-glow"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
            }`}
          >
            <item.icon className="h-5 w-5" />
            <span className="font-medium">{item.label}</span>
          </Link>
        );
      })}
    </>
  );

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:block w-64 bg-card border-r border-border p-4 fixed left-0 top-0 h-full z-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold gradient-text">
            CompCart
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Purchase & Inventory Dashboard
          </p>
        </div>
        <div className="space-y-2">
          <NavLinks />
        </div>
      </nav>

      {/* Mobile Navigation */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-card/80 backdrop-blur-md border-b border-border z-50 p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold gradient-text">CompCart</h1>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64">
              <div className="mb-8">
                <h1 className="text-2xl font-bold gradient-text">
                  CompCart
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Purchase & Inventory Dashboard
                </p>
              </div>
              <div className="space-y-2">
                <NavLinks onClick={() => setOpen(false)} />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </>
  );
}