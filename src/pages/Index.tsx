import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Hero from "@/components/Hero";
import WhatIsSmartSpec from "@/components/WhatIsSmartSpec";
import WhySmartSpecMatters from "@/components/WhySmartSpecMatters";
import Features from "@/components/Features";
import Testimonials from "@/components/Testimonials";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import logo from "@/assets/smartspec-logo.png";

const Index = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check auth status but don't redirect
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setIsLoggedIn(false);
  };

  const handleGetStarted = () => {
    if (isLoggedIn) {
      navigate("/quote");
    } else {
      navigate("/auth");
    }
  };

  return (
    <div className="min-h-screen">
      {/* Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center p-2">
              <img src={logo} alt="SmartSpec Logo" className="w-full h-full object-contain brightness-0 invert" />
            </div>
            <h1 className="text-2xl font-bold text-primary">SmartSpec</h1>
          </div>
          <div className="flex items-center gap-4">
            {isLoggedIn ? (
              <>
                <Button onClick={() => navigate("/quote")} variant="default">
                  Get Quote
                </Button>
                <Button onClick={handleSignOut} variant="outline">
                  Sign Out
                </Button>
              </>
            ) : (
              <Button onClick={handleGetStarted} variant="default">
                Get Started
              </Button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <Hero onGetStarted={handleGetStarted} />
      
      {/* What is SmartSpec Section */}
      <WhatIsSmartSpec onGetStarted={handleGetStarted} />

      {/* Why SmartSpec Matters Section */}
      <WhySmartSpecMatters />

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
