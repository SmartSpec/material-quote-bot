import { Mail, Phone, MapPin } from "lucide-react";

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-card border-t border-border">
      <div className="container px-4 py-8 mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          {/* Company Info */}
          <div className="flex-shrink-0">
            <button 
              onClick={scrollToTop}
              className="text-left hover:opacity-80 transition-opacity cursor-pointer group"
              aria-label="Scroll to top"
            >
              <h3 className="text-2xl font-bold text-primary mb-2 group-hover:underline">
                SmartSpec
              </h3>
              <p className="text-sm text-muted-foreground max-w-xs">
                Let your CAD drawings speak for themselves
              </p>
            </button>
          </div>

          {/* Quick Links */}
          <div className="flex-shrink-0">
            <h4 className="font-semibold mb-2 text-sm">Quick Links</h4>
            <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
              <li>
                <a href="/" className="hover:text-primary transition-colors">
                  Home
                </a>
              </li>
              <li>
                <a href="/quote" className="hover:text-primary transition-colors">
                  Get Quote
                </a>
              </li>
              <li>
                <a href="#features" className="hover:text-primary transition-colors">
                  Features
                </a>
              </li>
              <li>
                <a href="#testimonials" className="hover:text-primary transition-colors">
                  Testimonials
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="flex-shrink-0">
            <h4 className="font-semibold mb-2 text-sm">Contact</h4>
            <ul className="space-y-1.5 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                <a href="mailto:mekirby@usc.edu" className="hover:text-primary transition-colors">
                  mekirby@usc.edu
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                <a href="tel:5702091638" className="hover:text-primary transition-colors">
                  (570) 209-1638
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 mt-0.5 text-primary flex-shrink-0" />
                <span className="text-xs">
                  Kaprielian Hall, 3620 S Vermont Ave, Los Angeles, CA 90089
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-border text-center text-xs text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} SmartSpec. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
