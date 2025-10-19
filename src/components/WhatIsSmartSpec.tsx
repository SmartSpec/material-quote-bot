import { Button } from "@/components/ui/button";
import { ArrowRight, Play } from "lucide-react";
import { useNavigate } from "react-router-dom";

const WhatIsSmartSpec = () => {
  const navigate = useNavigate();

  const stats = [
    { value: "10x", label: "Faster Quotes" },
    { value: "99%", label: "Accuracy Rate" },
    { value: "24/7", label: "Live Pricing" },
    { value: "$2M+", label: "Saved Annually" },
  ];

  return (
    <section className="py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/20 to-background" />
      
      <div className="container px-4 mx-auto relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl font-bold mb-6 animate-fade-in">
            What is SmartSpec?
          </h2>
          
          <p className="text-xl text-muted-foreground mb-4 leading-relaxed">
            The intelligent quoting platform that transforms how manufacturers price their work.
          </p>
          
          <p className="text-lg text-muted-foreground mb-12 max-w-3xl mx-auto">
            Upload CAD files, get instant quotes powered by real-time commodity pricing, 
            and close deals faster than ever before. Built for fabricators who value precision and speed.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Button 
              size="lg" 
              className="gap-2 shadow-glow text-lg px-8 py-6"
              onClick={() => navigate("/quote")}
            >
              Get Started
              <ArrowRight className="w-5 h-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="gap-2 text-lg px-8 py-6"
            >
              <Play className="w-5 h-5" />
              Watch Demo
            </Button>
          </div>

          {/* Key Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20">
            {stats.map((stat, index) => (
              <div 
                key={index}
                className="p-6 rounded-lg bg-card border border-border shadow-card hover:shadow-elegant transition-all duration-300 hover:-translate-y-1"
              >
                <div className="text-4xl font-bold text-primary mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhatIsSmartSpec;
