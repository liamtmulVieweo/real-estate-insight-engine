import { motion } from 'framer-motion';
import { ArrowRight, Database } from 'lucide-react';
import vieweoLogoWhite from '@/assets/vieweo-logo-white.png';
import { Link } from 'react-router-dom';
import { LeaderboardPreview } from './LeaderboardPreview';
import { BrokerageDashboardPreview } from './BrokerageDashboardPreview';

export function Hero() {
  return (
    <section className="relative min-h-screen bg-gradient-to-br from-primary via-primary to-secondary overflow-hidden">
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation / Logo Area */}
        <motion.nav
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-12 md:mb-16"
        >
          <div className="flex items-center gap-2">
            <img src={vieweoLogoWhite} alt="Vieweo" className="h-10 w-auto" />
          </div>
          <Link
            to="/vieweo"
            className="text-sm font-medium text-white/90 hover:text-white transition-colors px-4 py-2 rounded-full border border-white/20 hover:border-white/40"
          >
            View Leaderboard
          </Link>
        </motion.nav>

        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white/90 text-sm"
          >
            <Database className="w-4 h-4" />
            63,974 records analyzed
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6 mt-8"
          >
            Measure Your AI Visibility in{' '}
            <span className="text-accent">Commercial Real Estate</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-lg sm:text-xl text-white/80 mb-10 max-w-2xl mx-auto"
          >
            Measure how AI platforms represent you as a broker and your brokerage across thousands of CRE specific prompts. Identify gaps. Seize opportunities.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col items-center justify-center gap-3"
          >
            <Link
              to="/vieweo"
              className="group inline-flex items-center gap-2 px-8 py-4 bg-white text-primary font-semibold rounded-full hover:bg-white/90 transition-all shadow-lg hover:shadow-xl"
            >
              View Market Leaderboard
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/methodology"
              className="px-8 py-4 text-white font-medium hover:text-white/80 transition-colors"
            >
              View Methodology
            </Link>
          </motion.div>
        </div>

        {/* Dashboard Previews - Side by Side */}
        <div className="mt-16 mb-8 grid lg:grid-cols-2 gap-6 items-start">
          <LeaderboardPreview />
          <BrokerageDashboardPreview />
        </div>
      </div>

      {/* Background decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-accent/20 via-transparent to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
      <div className="absolute top-1/4 -right-64 w-[500px] h-[500px] rounded-full bg-accent/10 blur-3xl" />
    </section>
  );
}
