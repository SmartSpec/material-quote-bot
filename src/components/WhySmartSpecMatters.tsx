import weldingBackground from "@/assets/welding-background.png";

const WhySmartSpecMatters = () => {
  const stats = [
    { value: "86%", label: "Lost Deals Due to Slow Quoting" },
    { value: "$2.5M", label: "Revenue Leaked Annually" },
    { value: "2+ Days", label: "Average Quote Time" },
    { value: "<50%", label: "Typical Bid Win Rate" },
  ];

  return (
    <section className="py-20 bg-muted/50 border-y border-border relative overflow-hidden">
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-30"
        style={{ backgroundImage: `url(${weldingBackground})` }}
      />
      <div className="container px-4 mx-auto relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-3">
            Why SmartSpec Matters
          </h2>
          <p className="text-lg text-foreground font-semibold mb-8">
            Without SmartSpec automated quoting:
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
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

export default WhySmartSpecMatters;
