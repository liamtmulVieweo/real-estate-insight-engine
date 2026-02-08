import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export function EmailSignup() {
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
            See Who AI Recommends in Your Market
          </h2>
          <p className="text-lg text-white/80 mb-10">
            Explore how AI platforms represent CRE professionals across thousands of queries.
          </p>

          <Link
            to="/vieweo"
            className="inline-flex items-center gap-3 px-10 py-5 bg-white text-primary font-semibold rounded-full hover:bg-white/90 transition-all shadow-lg text-lg"
          >
            View Market Leaderboard
            <ArrowRight className="w-5 h-5" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
