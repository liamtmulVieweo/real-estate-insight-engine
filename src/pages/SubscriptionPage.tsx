import { Link } from 'react-router-dom'
import { VieweoLogo } from '@/components/VieweoLogo'
import { Button } from '@/components/ui/button'
import {
  SubscriptionHero,
  SubscriptionFeatures,
  SubscriptionPricing,
  SubscriptionFAQ,
} from '@/components/subscription'
import { useAuth } from '@/hooks/useAuth'
import { LogIn, LogOut } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function SubscriptionPage() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <Link to="/">
              <VieweoLogo className="h-8 w-auto" />
            </Link>

            <nav className="hidden md:flex items-center gap-8">
              <a href="#pricing" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
                Pricing
              </a>
              <Link to="/vieweo" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
                Leaderboard
              </Link>
              <Link to="/methodology" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
                Methodology
              </Link>
            </nav>

            <div className="flex items-center gap-3">
              {user ? (
                <Button variant="outline" size="sm" onClick={signOut} className="gap-2">
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </Button>
              ) : (
                <Button variant="outline" size="sm" onClick={() => navigate('/auth?redirect=/subscribe')} className="gap-2">
                  <LogIn className="h-4 w-4" />
                  Sign In
                </Button>
              )}
              <Button size="sm" asChild>
                <a href="#pricing">Get Started</a>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main>
        <SubscriptionHero />
        <SubscriptionFeatures />
        <SubscriptionPricing />
        <SubscriptionFAQ />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-slate-50 py-12">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <VieweoLogo className="h-8 w-auto mb-4" />
              <p className="text-sm text-slate-500">
                Strategic visibility for the modern commercial real estate firm.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-slate-900 mb-4">Product</h4>
              <ul className="space-y-2">
                <li><Link to="/vieweo" className="text-sm text-slate-600 hover:text-slate-900">Leaderboard</Link></li>
                <li><a href="#pricing" className="text-sm text-slate-600 hover:text-slate-900">Pricing</a></li>
                <li><Link to="/methodology" className="text-sm text-slate-600 hover:text-slate-900">Methodology</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-slate-900 mb-4">Company</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-sm text-slate-600 hover:text-slate-900">About</a></li>
                <li><a href="mailto:contact@vieweo.com" className="text-sm text-slate-600 hover:text-slate-900">Contact</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-slate-900 mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-sm text-slate-600 hover:text-slate-900">Privacy</a></li>
                <li><a href="#" className="text-sm text-slate-600 hover:text-slate-900">Terms</a></li>
              </ul>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-slate-200">
            <p className="text-sm text-slate-500 text-center">
              © {new Date().getFullYear()} Vieweo Inc. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
