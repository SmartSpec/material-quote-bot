import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";

const Testimonials = () => {
  const testimonials = [
    {
      name: "John Martinez",
      company: "Precision Metalworks",
      role: "Operations Manager",
      content: "SmartSpec cut our quote turnaround time from 2 days to 10 minutes. Game changer for our business.",
      rating: 5,
    },
    {
      name: "Sarah Chen",
      company: "Industrial Fabricators Inc.",
      role: "CEO",
      content: "The real-time commodity pricing has saved us thousands. We're no longer guessing on material costs.",
      rating: 5,
    },
    {
      name: "Mike Johnson",
      company: "Custom Machine Shop",
      role: "Lead Estimator",
      content: "Finally, a quoting system that understands manufacturing. The CAD parser is incredibly accurate.",
      rating: 5,
    },
  ];

  return (
    <section className="py-20 bg-muted/30">
      <div className="container px-4 mx-auto">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">
            Trusted by Manufacturers
          </h2>
          <p className="text-lg text-muted-foreground">
            See what industry leaders are saying about SmartSpec
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <Card
              key={index}
              className="shadow-card hover:shadow-elegant transition-all duration-300 hover:-translate-y-1"
            >
              <CardContent className="p-6">
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-accent text-accent" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-6 italic">
                  "{testimonial.content}"
                </p>
                <div className="border-t border-border pt-4">
                  <p className="font-semibold">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  <p className="text-sm text-primary">{testimonial.company}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
