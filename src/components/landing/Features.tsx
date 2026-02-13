import { motion } from 'framer-motion';
import { BarChart3, PieChart, Users, TrendingUp } from 'lucide-react';

const features = [
  {
    title: 'Market Analysis',
    description:
      'Track your visibility across every major CRE market to identify regional strengths and weaknesses.',
    icon: BarChart3,
  },
  {
    title: 'Property Type Insights',
    description:
      'Understand how AI models perceive your expertise across specific asset classes and property types.',
    icon: PieChart,
  },
  {
    title: 'Role-Based Metrics',
    description:
      'See exactly how AI categorizes your professional focus, whether tenant rep, agency, or capital markets.',
    icon: Users,
  },
  {
    title: 'Competitive Benchmarking',
    description:
      'Compare your AI share of voice against market leaders and direct competitors in your sector.',
    icon: TrendingUp,
  },
];

export function Features() {
  return (
    <section className="py-12 md:py-16 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Comprehensive AI Visibility Analytics
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Get the data you need to optimize your digital footprint for the AI era.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-card rounded-xl p-6 border border-border hover:shadow-lg transition-shadow"
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-muted-foreground text-sm">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
