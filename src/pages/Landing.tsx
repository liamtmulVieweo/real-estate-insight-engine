import { Hero, WhySection, MethodologySection, Features, EmailSignup } from '@/components/landing';
import vieweoLogoWhite from '@/assets/vieweo-logo-white.png';
import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <div className="min-h-screen">
      <main>
        <Hero />
        <WhySection />
        <MethodologySection />
        <Features />
        <EmailSignup />
      </main>

      <footer className="bg-foreground py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <img src={vieweoLogoWhite} alt="Vieweo" className="h-8 w-auto" />
          </div>
          <p className="text-white/60 text-sm text-center mb-4">
            © {new Date().getFullYear()} Vieweo, Inc. All rights reserved.
          </p>
          <div className="flex items-center justify-center gap-6">
            <Link to="/methodology" className="text-white/60 hover:text-white/80 text-sm transition-colors">
              Methodology
            </Link>
            <Link to="/privacy" className="text-white/60 hover:text-white/80 text-sm transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-white/60 hover:text-white/80 text-sm transition-colors">
              Terms of Use
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
