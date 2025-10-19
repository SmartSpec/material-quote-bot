import { Card, CardContent } from "@/components/ui/card";
import americanAlloyLogo from "@/assets/american-alloy-logo.png";
import tinsleyLogo from "@/assets/tinsley-logo.png";
import stoystownLogo from "@/assets/stoystown-logo.png";
import manufacturingBackground from "@/assets/manufacturing-background.png";

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
    <section className="py-20 relative bg-muted/30">
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-10"
        style={{ backgroundImage: `url(${manufacturingBackground})` }}
      />
      <div className="container px-4 mx-auto relative z-10">
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
              className="shadow-card hover:shadow-elegant transition-all duration-300 hover:-translate-y-1 flex flex-col"
            >
              <CardContent className="p-6 flex flex-col flex-1">
                <p className="text-muted-foreground mb-6 italic flex-1 min-h-[120px] flex items-center">
                  "{testimonial.content}"
                </p>
                <div className="border-t border-border pt-4">
                  <p className="font-semibold">{testimonial.name}</p>
                  {testimonial.role && <p className="text-sm text-muted-foreground">{testimonial.role}</p>}
                  {testimonial.company && (
                    <div className="flex items-center gap-3 mt-0.5">
                      <p className="text-sm text-primary">{testimonial.company}</p>
                      {testimonial.company === "American Alloy Fabricators, Inc." && (
                        <img 
                          src={americanAlloyLogo} 
                          alt="American Alloy Fabricators logo" 
                          className="h-16 object-contain"
                        />
                      )}
                      {testimonial.company === "Tinsley Design & Fabricating" && (
                        <img 
                          src={tinsleyLogo} 
                          alt="Tinsley Design & Fabricating logo" 
                          className="h-16 object-contain"
                        />
                      )}
                      {testimonial.company === "Stoystown Tank & Steel Co." && (
                        <img 
                          src={stoystownLogo} 
                          alt="Stoystown Tank & Steel Co. logo" 
                          className="h-16 object-contain"
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
