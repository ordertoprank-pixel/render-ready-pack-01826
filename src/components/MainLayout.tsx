import { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { Package, Wand2 } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface MainLayoutProps {
  children: ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <div className="min-h-screen flex">
      {/* Side Navigation */}
      <aside className="w-20 border-r border-border bg-background/80 backdrop-blur-sm flex flex-col items-center py-6 gap-4 fixed h-full z-10">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-4">
          <Package className="w-7 h-7 text-primary-foreground" />
        </div>
        
        <nav className="flex flex-col gap-2">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `w-14 h-14 rounded-xl flex items-center justify-center transition-all ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-lg"
                  : "hover:bg-muted text-muted-foreground"
              }`
            }
            title="Mockup Creator"
          >
            <Package className="w-6 h-6" />
          </NavLink>
          
          <NavLink
            to="/ai-generator"
            className={({ isActive }) =>
              `w-14 h-14 rounded-xl flex items-center justify-center transition-all ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-lg"
                  : "hover:bg-muted text-muted-foreground"
              }`
            }
            title="AI Generator"
          >
            <Wand2 className="w-6 h-6" />
          </NavLink>
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 ml-20">
        {children}
      </div>
    </div>
  );
};
