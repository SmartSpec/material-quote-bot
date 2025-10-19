const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Manufacturing Background Video/Image Overlay */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background z-10" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?q=80&w=2940')] bg-cover bg-center opacity-30" />
        {/* Animated overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--primary)/0.05)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--primary)/0.05)_1px,transparent_1px)] bg-[size:4rem_4rem] animate-pulse" style={{ animationDuration: "4s" }} />
      </div>
      
      <div className="container relative z-20 px-4 py-32 mx-auto">
        <div className="max-w-5xl mx-auto text-center">
          <div className="animate-fade-in" style={{ animationDelay: "0.2s", animationFillMode: "both" }}>
            <h1 className="mb-6 text-7xl font-bold tracking-tight md:text-8xl lg:text-9xl">
              SmartSpec
            </h1>
          </div>
          
          <div className="animate-fade-in" style={{ animationDelay: "0.5s", animationFillMode: "both" }}>
            <p className="mb-12 text-3xl font-light tracking-wide text-muted-foreground">
              Let your CAD drawings speak for themselves
            </p>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 animate-bounce">
        <div className="w-6 h-10 rounded-full border-2 border-primary/50 flex items-start justify-center p-2">
          <div className="w-1 h-3 rounded-full bg-primary/50 animate-pulse" />
        </div>
      </div>
    </section>
  );
};

export default Hero;
