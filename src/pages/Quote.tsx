import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import PDFUpload from "@/components/PDFUpload";
import CADUpload from "@/components/CADUpload";
import CommodityPricing from "@/components/CommodityPricing";
import QuoteForm from "@/components/QuoteForm";

const Quote = () => {
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button onClick={() => navigate("/")} variant="ghost" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Button>
          <h1 className="text-2xl font-bold text-primary">SmartSpec</h1>
          <Button onClick={handleSignOut} variant="outline">
            Sign Out
          </Button>
        </div>
      </div>

      <section className="py-20 container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Generate Your Quote</h2>
            <p className="text-lg text-muted-foreground">
              Upload your drawings and configure your specifications to get started
            </p>
          </div>

          <div className="mb-8">
            <PDFUpload />
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
    </div>
  );
};

export default Quote;
