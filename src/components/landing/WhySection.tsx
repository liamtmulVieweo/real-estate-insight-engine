import { motion, type Easing } from 'framer-motion';
import { Map, Activity, ListTodo, ArrowRight } from 'lucide-react';

export function WhySection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: 'easeOut' as Easing }
    }
  };

  const scrollToSignup = () => {
    document.getElementById('signup')?.scrollIntoView({
      behavior: 'smooth',
    });
  };

  return (
    <section className="bg-muted py-12 md:py-16 border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section 1: Why this matters */}
        <div className="max-w-3xl mx-auto text-center mb-12 md:mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8 tracking-tight">
              AI Visibility drives leads. <br className="hidden md:block" />
              <span className="text-primary">Leads drive sales.</span>
            </h2>

            <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
              <p>
                Buyers are already asking AI tools who to trust, who to contact, and who to work with.
                If you're not visible — or inaccurately represented — you're invisible at the moment intent is highest.
              </p>
              <p className="font-medium text-foreground">
                AI visibility isn't branding. It's distribution. And distribution is what turns awareness
                into leads and leads into closed deals.
              </p>
            </div>
          </motion.div>
        </div>

        {/* Section 2: How we help */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
        >
          <div className="text-center mb-10">
            <motion.h3
              variants={itemVariants}
              className="text-2xl md:text-3xl font-semibold text-foreground"
            >
              We help you turn AI visibility into measurable business impact — step by step.
            </motion.h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {/* Card 1 */}
            <motion.div
              variants={itemVariants}
              className="bg-card border border-border rounded-xl p-5 hover:border-primary/30 transition-colors duration-300 shadow-sm"
            >
              <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Map className="h-5 w-5 text-primary" />
              </div>
              <h4 className="text-lg font-bold text-foreground mb-1">Understand your footprint</h4>
              <p className="text-primary font-medium mb-3 text-xs uppercase tracking-wide">See how AI sees you</p>
              <p className="text-muted-foreground text-sm leading-relaxed">
                We map where and how you appear in AI-generated answers, showing what's visible, what's missing, and what's misrepresented.
              </p>
            </motion.div>

            {/* Card 2 */}
            <motion.div
              variants={itemVariants}
              className="bg-card border border-border rounded-xl p-5 hover:border-primary/30 transition-colors duration-300 shadow-sm"
            >
              <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Activity className="h-5 w-5 text-primary" />
              </div>
              <h4 className="text-lg font-bold text-foreground mb-1">Diagnose what's going wrong</h4>
              <p className="text-primary font-medium mb-3 text-xs uppercase tracking-wide">Identify the gaps</p>
              <p className="text-muted-foreground text-sm leading-relaxed">
                We analyze accuracy, positioning, and consistency to understand why AI systems may overlook you — and where others are winning.
              </p>
            </motion.div>

            {/* Card 3 */}
            <motion.div
              variants={itemVariants}
              className="bg-card border border-border rounded-xl p-5 hover:border-primary/30 transition-colors duration-300 shadow-sm"
            >
              <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <ListTodo className="h-5 w-5 text-primary" />
              </div>
              <h4 className="text-lg font-bold text-foreground mb-1">Create actionable steps</h4>
              <p className="text-primary font-medium mb-3 text-xs uppercase tracking-wide">Turn insight into action</p>
              <p className="text-muted-foreground text-sm leading-relaxed">
                You receive clear, prioritized actions to improve how often and how accurately you're surfaced in AI-generated responses.
              </p>
            </motion.div>
          </div>

        </motion.div>
      </div>
    </section>
  );
}
