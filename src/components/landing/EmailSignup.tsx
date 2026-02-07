import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Loader2, ArrowRight } from 'lucide-react';
import { useVieweoAuth } from '@/contexts/VieweoAuthContext';
import { z } from 'zod';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const emailSchema = z.object({
  email: z.string().trim().email({ message: "Please enter a valid email address" }).max(255, { message: "Email is too long" })
});

export function EmailSignup() {
  const navigate = useNavigate();
  const { grantAccess } = useVieweoAuth();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate email format
    const result = emailSchema.safeParse({ email });
    if (!result.success) {
      toast.error(result.error.errors[0].message);
      return;
    }

    setIsSubmitting(true);

    try {
      // Store email for lead tracking (ignore duplicates)
      await supabase
        .from('email_signups')
        .insert({ email: result.data.email })
        .then(() => {});

      // Grant access and redirect to dashboard
      grantAccess(result.data.email);
      toast.success('Welcome to Vieweo!');
      navigate('/vieweo');
    } catch (error) {
      console.error('Signup error:', error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="signup" className="py-24 bg-gradient-to-br from-primary via-primary to-secondary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto text-center"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Get Full Access to Your AI Visibility Data
          </h2>
          <p className="text-lg text-white/80 mb-10">
            Join leading CRE professionals monitoring their digital presence.
          </p>

          {!showEmailForm ? (
            <button
              onClick={() => setShowEmailForm(true)}
              className="px-10 py-5 bg-white text-primary font-semibold rounded-full hover:bg-white/90 transition-all shadow-lg text-lg flex items-center justify-center gap-3 mx-auto"
            >
              Get Full Access
              <ArrowRight className="w-5 h-5" />
            </button>
          ) : (
            <motion.form
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-md mx-auto"
              onSubmit={handleSubmit}
            >
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your work email"
                  disabled={isSubmitting}
                  autoFocus
                  className="flex-1 px-5 py-4 rounded-full bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-4 bg-white text-primary font-semibold rounded-full hover:bg-white/90 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      Continue
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
              <p className="flex items-center justify-center gap-2 text-white/60 text-sm mt-4">
                <Lock className="w-4 h-4" />
                We respect your privacy. No spam, ever.
              </p>
            </motion.form>
          )}
        </motion.div>
      </div>
    </section>
  );
}
