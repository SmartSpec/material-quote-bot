import { Button } from "@/components/ui/button";
import { ArrowRight, Zap } from "lucide-react";

const Hero = () => {
  return (
    <section className="relative min-h-[600px] flex items-center justify-center overflow-hidden bg-gradient-hero">
      {/* Animated background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--primary)/0.1)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--primary)/0.1)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
      
      <div className="container relative z-10 px-4 py-20 mx-auto">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="mb-4 text-6xl font-bold tracking-tight text-primary-foreground md:text-7xl lg:text-8xl">
            SmartSpec
          </h1>
          
          <p className="mb-8 text-2xl text-primary-foreground/90 font-light tracking-wide">
            Let your CAD drawings speak for themselves
          </p>
          
          <p className="mb-8 text-lg text-primary-foreground/70 max-w-2xl mx-auto">
            Upload your CAD file and get instant, dynamically updated quotes based on real-time commodity prices. 
            Transform your quoting process from hours to seconds.
          </p>
          
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" className="gap-2 shadow-glow">
              Get Started
              <ArrowRight className="w-4 h-4" />
            </Button>
            <Button size="lg" variant="outline" className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/20">
              Watch Demo
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-8 mt-16 text-primary-foreground/90">
            <div>
              <div className="text-3xl font-bold text-accent">10x</div>
              <div className="text-sm">Faster Quotes</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-accent">99%</div>
              <div className="text-sm">Accuracy Rate</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-accent">24/7</div>
              <div className="text-sm">Live Pricing</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
