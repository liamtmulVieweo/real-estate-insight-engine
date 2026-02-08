import { motion } from 'framer-motion'
import { ArrowRight, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'

export function SubscriptionHero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-slate-50 to-white py-20 sm:py-28">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-3xl text-center"
        >
          <span className="inline-flex items-center rounded-full bg-teal-50 px-4 py-1.5 text-sm font-medium text-teal-700 ring-1 ring-teal-200/60 mb-6">
            <span className="mr-2 h-1.5 w-1.5 rounded-full bg-teal-500" />
            Enterprise Grade Analytics
          </span>

          <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
            Strategic AI Visibility for Commercial Real Estate
          </h1>

          <p className="mt-6 text-lg text-slate-600 leading-relaxed">
            Monitor performance, track discovery trends, and gain clarity on
            your AI-driven market presence with ongoing expert insights designed
            for modern firms.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="gap-2" asChild>
              <a href="#pricing">
                Start Your Subscription
                <ArrowRight className="h-4 w-4" />
              </a>
            </Button>
            <Button variant="outline" size="lg" className="gap-2" asChild>
              <a href="mailto:contact@vieweo.com">
                <Mail className="h-4 w-4" />
                Get in Touch
              </a>
            </Button>
          </div>
        </motion.div>
      </div>

      {/* Abstract Background Elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -right-1/4 h-[800px] w-[800px] rounded-full bg-gradient-to-br from-teal-100/40 to-transparent blur-3xl" />
        <div className="absolute -bottom-1/2 -left-1/4 h-[600px] w-[600px] rounded-full bg-gradient-to-tr from-blue-100/30 to-transparent blur-3xl" />
      </div>
    </section>
  )
}
