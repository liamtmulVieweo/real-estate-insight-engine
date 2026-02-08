import { ReactNode, useState } from "react";
import { useVieweoAuth } from "@/contexts/VieweoAuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { VieweoLogo } from "@/components/VieweoLogo";
import { ArrowLeft, Mail } from "lucide-react";
import { Link } from "react-router-dom";

interface VieweoProtectedRouteProps {
  children: ReactNode;
}

export function VieweoProtectedRoute({ children }: VieweoProtectedRouteProps) {
  const { isAuthenticated, grantAccess } = useVieweoAuth();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    
    setIsSubmitting(true);
    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailRegex.test(email)) {
      grantAccess(email);
    }
    setIsSubmitting(false);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary via-primary to-secondary flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <div className="flex justify-center mb-6">
              <VieweoLogo className="h-10 w-auto" />
            </div>
            
            <h1 className="text-2xl font-bold text-center text-slate-800 mb-2">
              Access Market Leaderboard
            </h1>
            <p className="text-slate-600 text-center mb-6">
              Enter your email to view the AI visibility rankings
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-12"
                  required
                />
              </div>
              <Button 
                type="submit" 
                className="w-full h-12 text-base"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Accessing..." : "View Leaderboard"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Link 
                to="/" 
                className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
