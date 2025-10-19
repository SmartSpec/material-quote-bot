import { Button } from "@/components/ui/button";
import { ArrowRight, Play } from "lucide-react";

const WhatIsSmartSpec = ({ onGetStarted }: { onGetStarted: () => void }) => {

  return (
    <section className="py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/20 to-background" />
      
      <div className="container px-4 mx-auto relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl font-bold mb-6 animate-fade-in">
            What is SmartSpec?
          </h2>
          
          <p className="text-xl text-muted-foreground mb-4 leading-relaxed">
            Accurate, real-time quoting powered by live commodity prices and AI-driven optimization.
          </p>
          
          <p className="text-lg text-muted-foreground mb-8 max-w-3xl mx-auto">
            SmartSpec provides manufacturers with seamless quoting and drawings integration, automatically extracting material requirements 
            and dimensions to generate optimized quotes in seconds. Our platform uses AI algorithms to learn from your 
            previous quotes and workflow data, continuously improving accuracy and efficiency, while maintaining what matters: quality.
          </p>

          <div className="grid md:grid-cols-3 gap-6 mb-12 max-w-4xl mx-auto text-left">
            <div className="p-6 rounded-lg bg-card border border-border">
              <h3 className="font-semibold text-primary mb-2">Real-Time Quoting</h3>
              <p className="text-sm text-muted-foreground">
                Live commodity prices, labor estimates, and floor space calculations ensure accurate quotes every time.
              </p>
            </div>
            <div className="p-6 rounded-lg bg-card border border-border">
              <h3 className="font-semibold text-primary mb-2">Seamless Integration</h3>
              <p className="text-sm text-muted-foreground">
                Upload CAD files, select materials, and automatically receive professional PDF quotes ready for customers.
              </p>
            </div>
            <div className="p-6 rounded-lg bg-card border border-border">
              <h3 className="font-semibold text-primary mb-2">AI-Driven Optimization</h3>
              <p className="text-sm text-muted-foreground">
                Machine learning algorithms analyze your quote history to improve accuracy and identify cost savings.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Button 
              size="lg" 
              className="gap-2 shadow-glow text-lg px-8 py-6"
              onClick={onGetStarted}
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
        </div>
      </div>
    </section>
  );
};

export default WhatIsSmartSpec;
