import { motion } from 'framer-motion'
import { BarChart3, Search, TrendingUp, Users } from 'lucide-react'

const features = [
  {
    title: 'AI Visibility Dashboard',
    description:
      'Real-time monitoring of your properties across major AI platforms. Track how AI systems discover, interpret, and present your listings to potential tenants and investors.',
    icon: BarChart3,
  },
  {
    title: 'Monthly Performance Insights',
    description:
      'Receive detailed reports on visibility trends and market positioning. Our data-driven recommendations help you optimize your digital footprint for maximum reach.',
    icon: TrendingUp,
  },
  {
    title: 'Discovery Trend Updates',
    description:
      'Stay ahead of the curve with updates on evolving AI search patterns. Understand exactly how prospects are finding commercial properties in the new search landscape.',
    icon: Search,
  },
  {
    title: 'Expert Access',
    description:
      'Optional direct consultation with AI visibility specialists. Get strategic guidance for complex optimization needs and bespoke market analysis.',
    icon: Users,
  },
]

export function SubscriptionFeatures() {
  return (
    <section className="bg-white py-20">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Comprehensive Market Intelligence
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Our platform provides the tools and insights you need to maintain a
            competitive edge in an AI-first world.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="relative rounded-xl border border-slate-200 bg-slate-50/50 p-6 hover:shadow-md transition-shadow"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-teal-100">
                <feature.icon className="h-6 w-6 text-teal-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
