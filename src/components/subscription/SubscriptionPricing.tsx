import { motion } from 'framer-motion'
import { CheckCircle2, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

const individualFeatures = [
  'Personal AI Visibility Dashboard',
  'Track your individual listings',
  'Monthly performance summary',
  'Email support',
  'Basic trend insights',
]

const brokerageFeatures = [
  'Full AI Visibility Dashboard access',
  'Team collaboration tools',
  'Monthly performance insight reports',
  'Real-time discovery trend analysis',
  'Email & phone support',
  'Quarterly strategy review',
  'API access for data integration',
]

const enterpriseFeatures = [
  'Everything in Brokerage, plus:',
  'Dedicated account manager',
  'Custom integration support',
  'Priority phone & email support',
  'White-label reporting options',
  'Advanced analytics & forecasting',
  'Onboarding & training sessions',
  'SLA guarantees',
]

export function SubscriptionPricing() {
  return (
    <section id="pricing" className="bg-slate-50 py-20">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Choose Your Plan
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            From individual brokers to large firms, we have a solution that fits
            your needs.
          </p>
        </div>

        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-3">
          {/* Individual Tier */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="flex flex-col rounded-2xl border border-slate-200 bg-white shadow-sm"
          >
            <div className="border-b border-slate-100 p-6">
              <h3 className="text-xl font-semibold text-slate-900">Individual</h3>
              <p className="mt-1 text-sm text-slate-500">
                For single brokers getting started.
              </p>
            </div>

            <div className="flex flex-1 flex-col p-6">
              <div className="mb-6">
                <span className="text-4xl font-bold text-slate-900">$50</span>
                <span className="text-slate-600">/month</span>
              </div>
              <p className="text-xs text-slate-500 mb-6">
                Billed monthly. Cancel anytime.
              </p>

              <ul className="mb-8 space-y-3 flex-1">
                {individualFeatures.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm text-slate-600">
                    <CheckCircle2 className="h-5 w-5 text-teal-500 shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Button variant="outline" className="w-full">
                Start Individual
              </Button>
            </div>
          </motion.div>

          {/* Brokerage Tier */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="relative flex flex-col rounded-2xl border-2 border-teal-500 bg-white shadow-lg"
          >
            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
              <span className="rounded-full bg-teal-500 px-4 py-1 text-xs font-semibold text-white uppercase tracking-wider">
                Popular
              </span>
            </div>

            <div className="border-b border-slate-100 p-6 pt-8">
              <h3 className="text-xl font-semibold text-slate-900">Brokerage</h3>
              <p className="mt-1 text-sm text-slate-500">
                For teams and growing brokerages.
              </p>
            </div>

            <div className="flex flex-1 flex-col p-6">
              <div className="mb-6">
                <span className="text-4xl font-bold text-slate-900">$399</span>
                <span className="text-slate-600">/month</span>
              </div>
              <p className="text-xs text-slate-500 mb-6">
                Billed monthly. Cancel anytime.
              </p>

              <ul className="mb-8 space-y-3 flex-1">
                {brokerageFeatures.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm text-slate-600">
                    <CheckCircle2 className="h-5 w-5 text-teal-500 shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Button className="w-full bg-teal-600 hover:bg-teal-700">
                Start Brokerage
              </Button>
            </div>
          </motion.div>

          {/* Enterprise Tier */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="flex flex-col rounded-2xl border border-slate-200 bg-white shadow-sm"
          >
            <div className="border-b border-slate-100 p-6">
              <h3 className="text-xl font-semibold text-slate-900">Enterprise</h3>
              <p className="mt-1 text-sm text-slate-500">
                For large brokerages requiring custom support.
              </p>
            </div>

            <div className="flex flex-1 flex-col p-6">
              <div className="mb-6">
                <span className="text-4xl font-bold text-slate-900">Custom</span>
              </div>
              <p className="text-xs text-slate-500 mb-6">
                Tailored pricing based on your needs.
              </p>

              <ul className="mb-8 space-y-3 flex-1">
                {enterpriseFeatures.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm text-slate-600">
                    <CheckCircle2 className="h-5 w-5 text-teal-500 shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Button variant="outline" className="w-full gap-2">
                Contact Sales
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
