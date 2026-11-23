import { Brain, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";

const Header = () => {
  return (
    <header className="bg-background/80 backdrop-blur-md border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-primary rounded-lg shadow-soft">
            <Brain className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">CMC StrokeVision</h1>
            <p className="text-sm text-muted-foreground">AI-Powered Stroke Detection</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="hidden md:flex items-center space-x-2 text-sm text-muted-foreground">
            <Activity className="w-4 h-4 text-success" />
            <span>System Online</span>
          </div>
          <Button variant="outline" size="sm">
            Help & Support
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;