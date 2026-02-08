import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, ArrowRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const individualFeatures = [
  'Personal AI Visibility Dashboard',
  'Track your individual listings',
  'Monthly performance summary',
  'Email support',
  'Basic trend insights',
];

const brokerageFeatures = [
  'Full AI Visibility Dashboard access',
  'Individual dashboard for up to 15 brokers',
  'Team collaboration tools',
  'Monthly performance insight reports',
  'Real-time discovery trend analysis',
  'Email & phone support',
  'Quarterly strategy review',
  'API access for data integration',
];

const enterpriseFeatures = [
  'Everything in Brokerage, plus:',
  'Dedicated account manager',
  'Custom integration support',
  'Priority phone & email support',
  'White-label reporting options',
  'Advanced analytics & forecasting',
  'Onboarding & training sessions',
  'SLA guarantees',
];

export function SubscriptionModal({ isOpen, onClose }: SubscriptionModalProps) {
  const [isAnnual, setIsAnnual] = useState(false);

  const monthlyPrices = { individual: 50, brokerage: 399 };
  const annualPrices = {
    individual: Math.round(monthlyPrices.individual * 0.85),
    brokerage: Math.round(monthlyPrices.brokerage * 0.85),
  };

  const currentPrices = isAnnual ? annualPrices : monthlyPrices;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-6xl w-[95vw] max-h-[90vh] overflow-y-auto bg-[#f7f7f7] p-0 gap-0 border-none">
        {/* Custom close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-50 rounded-full p-2 hover:bg-slate-200 transition-colors"
        >
          <X className="h-5 w-5 text-slate-600" />
          <span className="sr-only">Close</span>
        </button>

        <div className="p-6 md:p-8">
          {/* Header */}
          <DialogHeader className="text-center mb-8">
            <DialogTitle className="text-2xl md:text-3xl font-bold text-slate-900">
              Choose Your Plan
            </DialogTitle>
            <DialogDescription className="text-base text-slate-600 mt-2">
              From individual brokers to large firms, we have a solution that fits your needs.
            </DialogDescription>
          </DialogHeader>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <span className={`text-sm font-medium ${!isAnnual ? 'text-slate-900' : 'text-slate-500'}`}>
              Monthly
            </span>
            <Switch
              checked={isAnnual}
              onCheckedChange={setIsAnnual}
              className="data-[state=checked]:bg-emerald-500"
            />
            <span className={`text-sm font-medium ${isAnnual ? 'text-slate-900' : 'text-slate-500'}`}>
              Annual
            </span>
            <AnimatePresence>
              {isAnnual && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.8, x: -10 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.8, x: -10 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  className="bg-emerald-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full"
                >
                  Save 15%
                </motion.span>
              )}
            </AnimatePresence>
          </div>

          {/* Pricing Grid */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Individual Tier */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex flex-col rounded-2xl bg-white shadow-sm overflow-hidden"
            >
              <div className="bg-[#2563a4] p-5">
                <h3 className="text-xl font-semibold text-white">Individual</h3>
                <p className="mt-1 text-sm text-blue-100">
                  For single brokers getting started.
                </p>
              </div>

              <div className="flex flex-1 flex-col p-5">
                <div className="mb-4">
                  <div className="flex items-baseline">
                    <motion.span
                      key={currentPrices.individual}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-4xl font-bold text-slate-900"
                    >
                      ${currentPrices.individual}
                    </motion.span>
                    <span className="text-slate-600 ml-1">/month</span>
                  </div>
                  {isAnnual && (
                    <p className="text-xs text-slate-500 mt-1">
                      ${currentPrices.individual * 12}/year billed annually
                    </p>
                  )}
                </div>

                <ul className="mb-6 space-y-2.5 flex-1">
                  {individualFeatures.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5 text-sm text-slate-600">
                      <CheckCircle2 className="h-4 w-4 text-[#2563a4] shrink-0 mt-0.5" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Button variant="outline" className="w-full border-[#2563a4] text-[#2563a4] hover:bg-[#2563a4]/5">
                  Start Individual
                </Button>
              </div>
            </motion.div>

            {/* Brokerage Tier */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="relative flex flex-col rounded-2xl bg-white shadow-lg border-2 border-[#1a7f8e] overflow-hidden"
            >
              <div className="absolute top-3 right-3 z-10">
                <span className="rounded-full bg-[#1a7f8e] px-3 py-1 text-xs font-semibold text-white uppercase tracking-wider">
                  Popular
                </span>
              </div>

              <div className="bg-[#1a7f8e] p-5">
                <h3 className="text-xl font-semibold text-white">Brokerage</h3>
                <p className="mt-1 text-sm text-teal-100">
                  For teams and growing brokerages.
                </p>
              </div>

              <div className="flex flex-1 flex-col p-5">
                <div className="mb-4">
                  <div className="flex items-baseline">
                    <motion.span
                      key={currentPrices.brokerage}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-4xl font-bold text-slate-900"
                    >
                      ${currentPrices.brokerage}
                    </motion.span>
                    <span className="text-slate-600 ml-1">/month</span>
                  </div>
                  {isAnnual && (
                    <p className="text-xs text-slate-500 mt-1">
                      ${currentPrices.brokerage * 12}/year billed annually
                    </p>
                  )}
                </div>

                <ul className="mb-6 space-y-2.5 flex-1">
                  {brokerageFeatures.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5 text-sm text-slate-600">
                      <CheckCircle2 className="h-4 w-4 text-[#1a7f8e] shrink-0 mt-0.5" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Button className="w-full bg-[#1a7f8e] hover:bg-[#156d7a] text-white">
                  Start Brokerage
                </Button>
              </div>
            </motion.div>

            {/* Enterprise Tier */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col rounded-2xl bg-white shadow-sm overflow-hidden"
            >
              <div className="bg-[#3b82f6] p-5">
                <h3 className="text-xl font-semibold text-white">Enterprise</h3>
                <p className="mt-1 text-sm text-blue-100">
                  For large brokerages requiring custom support.
                </p>
              </div>

              <div className="flex flex-1 flex-col p-5">
                <div className="mb-4">
                  <span className="text-4xl font-bold text-slate-900">Custom</span>
                  <p className="text-xs text-slate-500 mt-1">
                    Tailored pricing based on your needs.
                  </p>
                </div>

                <ul className="mb-6 space-y-2.5 flex-1">
                  {enterpriseFeatures.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5 text-sm text-slate-600">
                      <CheckCircle2 className="h-4 w-4 text-[#3b82f6] shrink-0 mt-0.5" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Button variant="outline" className="w-full gap-2 border-[#3b82f6] text-[#3b82f6] hover:bg-[#3b82f6]/5">
                  Contact Sales
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
