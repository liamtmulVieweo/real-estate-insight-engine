import { motion } from 'framer-motion';
import { Map, Building2, Briefcase } from 'lucide-react';

const methods = [
  {
    title: 'By Market',
    description:
      'Geographic visibility analysis across major metropolitan statistical areas (MSAs) and submarkets.',
    icon: Map,
  },
  {
    title: 'By Property Type',
    description:
      'Deep dive into asset classes including Office, Retail, Industrial, Multifamily, and Life Sciences.',
    icon: Building2,
  },
  {
    title: 'By Role',
    description:
      'Granular analysis of visibility for Tenant Rep, Landlord Rep, Investment Sales, and Debt & Equity roles.',
    icon: Briefcase,
  },
];

export function MethodologySection() {
  return (
    <section className="py-24 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            How It Works
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Vieweo aggregates responses to tens of thousands of CRE-specific AI
            prompts to measure how often brokers and brokerages are mentioned by
            leading AI models.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {methods.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-card rounded-xl p-8 border border-border text-center"
            >
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <item.icon className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">
                {item.title}
              </h3>
              <p className="text-muted-foreground">
                {item.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
