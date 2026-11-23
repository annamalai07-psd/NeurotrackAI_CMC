import { ArrowRight, Shield, Zap, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import heroImage from "@/assets/medical-hero.jpg";

const HeroSection = ({ onStartAnalysis }: { onStartAnalysis?: () => void }) => {
  return (
    <section className="relative py-20 bg-gradient-calm overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Hero Content */}
          <div className="space-y-8 animate-fade-in">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground leading-tight">
                Advanced AI Stroke
                <span className="text-primary block">Detection System</span>
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Empowering healthcare professionals with instant, accurate stroke detection 
                from CT scans. Saving lives through precision and speed.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" variant="default" className="bg-gradient-medical" onClick={onStartAnalysis}>
                Start Analysis
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
              <Button variant="outline" size="lg">
                View Documentation
              </Button>
            </div>
            
            {/* Trust Indicators */}
            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-border/50">
              <div className="text-center space-y-2">
                <div className="p-3 bg-success/10 rounded-full w-fit mx-auto">
                  <Shield className="w-6 h-6 text-success" />
                </div>
                <p className="text-sm font-medium text-foreground">HIPAA Compliant</p>
              </div>
              <div className="text-center space-y-2">
                <div className="p-3 bg-primary/10 rounded-full w-fit mx-auto">
                  <Zap className="w-6 h-6 text-primary" />
                </div>
                <p className="text-sm font-medium text-foreground">Instant Results</p>
              </div>
              <div className="text-center space-y-2">
                <div className="p-3 bg-accent/10 rounded-full w-fit mx-auto">
                  <Heart className="w-6 h-6 text-accent" />
                </div>
                <p className="text-sm font-medium text-foreground">Patient-Centered</p>
              </div>
            </div>
          </div>
          
          {/* Hero Image */}
          <div className="relative animate-fade-in">
            <Card className="overflow-hidden shadow-card">
              <CardContent className="p-0">
                <img 
                  src={heroImage} 
                  alt="Modern CT scan equipment in hospital setting"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent"></div>
              </CardContent>
            </Card>
            
            {/* Floating Status Card */}
            <Card className="absolute -bottom-4 -left-4 p-4 shadow-medical bg-background border-primary/20 hover-lift transition-all duration-300">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-success rounded-full animate-pulse-medical"></div>
                <div>
                  <p className="text-sm font-medium text-foreground">AI System Active</p>
                  <p className="text-xs text-muted-foreground">Ready for Analysis</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;