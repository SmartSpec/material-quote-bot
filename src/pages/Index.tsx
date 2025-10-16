import Hero from "@/components/Hero";
import Features from "@/components/Features";
import CADUpload from "@/components/CADUpload";
import CommodityPricing from "@/components/CommodityPricing";
import QuoteForm from "@/components/QuoteForm";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Hero />
      
      <section className="py-20 container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Generate Your First Quote</h2>
            <p className="text-lg text-muted-foreground">
              Upload your CAD file and configure your specifications to get started
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-2 mb-8">
            <CADUpload />
            <QuoteForm />
          </div>

          <div className="mt-6">
            <CommodityPricing />
          </div>
        </div>
      </section>

      <Features />

      <section className="py-20 bg-gradient-hero">
        <div className="container px-4 mx-auto text-center">
          <h2 className="text-4xl font-bold text-primary-foreground mb-6">
            Ready to Transform Your Quoting Process?
          </h2>
          <p className="text-xl text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
            Join manufacturers who have reduced their quote time by 10x while improving accuracy
          </p>
          <button className="px-8 py-4 text-lg font-semibold rounded-lg bg-accent text-accent-foreground hover:bg-accent/90 transition-colors shadow-glow">
            Start Free Trial
          </button>
        </div>
      </section>
    </div>
  );
};

export default Index;
