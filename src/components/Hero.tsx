const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Manufacturing Video Background */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="https://cdn.pixabay.com/video/2024/02/15/200433-914273613_large.mp4" type="video/mp4" />
        </video>
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/85 via-background/70 to-background z-10" />
        {/* Animated grid overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--primary)/0.05)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--primary)/0.05)_1px,transparent_1px)] bg-[size:4rem_4rem] animate-pulse z-10" style={{ animationDuration: "4s" }} />
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
