import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Hero from "@/components/Hero";
import WhatIsSmartSpec from "@/components/WhatIsSmartSpec";
import Features from "@/components/Features";
import Testimonials from "@/components/Testimonials";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";

const Index = () => {
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
    <div className="min-h-screen">
      {/* Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-primary">SmartSpec</h1>
          <div className="flex items-center gap-4">
            <Button onClick={() => navigate("/quote")} variant="default">
              Get Quote
            </Button>
            <Button onClick={handleSignOut} variant="outline">
              Sign Out
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <Hero />
      
      {/* What is SmartSpec Section */}
      <WhatIsSmartSpec />

      {/* Features Section */}
      <div id="features">
        <Features />
      </div>

      {/* Testimonials Section */}
      <div id="testimonials">
        <Testimonials />
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Index;
