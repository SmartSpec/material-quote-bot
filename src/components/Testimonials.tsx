import { Card, CardContent } from "@/components/ui/card";
import americanAlloyLogo from "@/assets/american-alloy-logo.png";

const Testimonials = () => {
  const testimonials = [
    {
      name: "Austin Clay",
      company: "American Alloy Fabricators, Inc.",
      role: "",
      content: "Quotes from vendors could take up to a week, in addition to ours which typically take just as long.",
      rating: 5,
    },
    {
      name: "Michael Lynch",
      company: "Tinsley Design & Fabricating",
      role: "",
      content: "Quoting can be a real bottleneck, essentially it determines how fast our work can move.",
      rating: 5,
    },
    {
      name: "Zachary Zufall",
      company: "Stoystown Tank & Steel Co.",
      role: "",
      content: "It is certainly an annoyance to have to wait more than 5 days to receive and/or send out quotes to clients.",
      rating: 5,
    },
  ];

  return (
    <section className="py-20 bg-muted/30">
      <div className="container px-4 mx-auto">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">
            Real Pain Points from Real Manufacturers
          </h2>
          <p className="text-lg text-muted-foreground">
            These manufacturers face the challenges SmartSpec was built to solve
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <Card
              key={index}
              className="shadow-card hover:shadow-elegant transition-all duration-300 hover:-translate-y-1"
            >
              <CardContent className="p-6">
                <p className="text-muted-foreground mb-6 italic">
                  "{testimonial.content}"
                </p>
                <div className="border-t border-border pt-4">
                  <p className="font-semibold">{testimonial.name}</p>
                  {testimonial.role && <p className="text-sm text-muted-foreground">{testimonial.role}</p>}
                  {testimonial.company && (
                    <div className="flex items-center gap-3 mt-1">
                      <p className="text-sm text-primary">{testimonial.company}</p>
                      {testimonial.company === "American Alloy Fabricators, Inc." && (
                        <img 
                          src={americanAlloyLogo} 
                          alt="American Alloy Fabricators logo" 
                          className="h-10 object-contain"
                        />
                      )}
                    </div>
                  )}
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
