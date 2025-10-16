import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap, Shield, Clock, TrendingUp, FileCheck, Cpu } from "lucide-react";

const Features = () => {
  const features = [
    {
      icon: Zap,
      title: "Instant Quotes",
      description: "Generate accurate quotes in seconds, not hours. Upload CAD, get results instantly.",
    },
    {
      icon: TrendingUp,
      title: "Real-Time Pricing",
      description: "Live commodity data integration ensures quotes reflect current market conditions.",
    },
    {
      icon: Cpu,
      title: "Smart CAD Parser",
      description: "Automatically extracts material, dimensions, and volume from your CAD files.",
    },
    {
      icon: Clock,
      title: "Valid Period Tracking",
      description: "Quotes include validity periods with automatic escalation clauses for price changes.",
    },
    {
      icon: Shield,
      title: "Risk Management",
      description: "Built-in volatility factors and risk premiums protect your margins.",
    },
    {
      icon: FileCheck,
      title: "PDF Export",
      description: "Professional PDF quotes ready for customers with detailed line-item breakdowns.",
    },
  ];

  return (
    <section className="py-20 bg-muted/30">
      <div className="container px-4 mx-auto">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">
            Everything You Need for Automated Quoting
          </h2>
          <p className="text-lg text-muted-foreground">
            Built for fabricators, manufacturers, and job shops who need fast, accurate quotes
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card
                key={index}
                className="shadow-card hover:shadow-elegant transition-all duration-300 hover:-translate-y-1"
              >
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;
