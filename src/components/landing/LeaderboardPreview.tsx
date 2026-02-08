import { motion } from 'framer-motion';
import { Filter, BarChart3, Users, Building2, FileText, Table2 } from 'lucide-react';

const brokerages = [
  { name: 'CBRE', value: 4800 },
  { name: 'JLL', value: 3600 },
  { name: 'Cushman & Wakefield', value: 3200 },
  { name: 'Colliers', value: 2900 },
  { name: 'Newmark', value: 1800 },
  { name: 'Marcus & Millichap', value: 1700 },
  { name: 'Avison Young', value: 1500 },
  { name: 'Kidder Mathews', value: 1400 },
  { name: 'Transwestern', value: 1200 },
  { name: 'Lee & Associates', value: 1100 },
];

const maxValue = brokerages[0].value;

export function LeaderboardPreview() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, duration: 0.6 }}
      className="mt-16 mb-8"
    >
      <div className="text-center mb-6">
        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white/90 text-sm font-medium">
          <BarChart3 className="w-4 h-4" />
          Market Leaderboard Preview
        </span>
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-2xl overflow-hidden border border-white/20">
          {/* Filters Header */}
          <div className="bg-slate-50 border-b border-slate-200 p-4">
            <div className="flex items-center gap-2 text-slate-600 text-sm mb-3">
              <Filter className="w-4 h-4" />
              <span className="font-medium">Filters</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {['All Markets', 'All Types', 'All Roles', 'All Entities'].map((filter, i) => (
                <div
                  key={i}
                  className="bg-white border border-slate-200 rounded-md px-3 py-2 text-xs text-slate-500"
                >
                  {filter}
                </div>
              ))}
            </div>
          </div>

          {/* Stats Summary */}
          <div className="p-4 border-b border-slate-200">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1 h-4 bg-primary rounded-full" />
              <span className="font-semibold text-slate-800 text-sm">Market AI Coverage Summary</span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Prompts Evaluated</div>
                <div className="text-xl font-bold text-slate-800">7,041</div>
              </div>
              <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Unique Brokers</div>
                <div className="text-xl font-bold text-slate-800">5,717</div>
              </div>
              <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Unique Brokerages</div>
                <div className="text-xl font-bold text-slate-800">4,784</div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-slate-200 px-4">
            <div className="flex gap-1">
              {[
                { icon: BarChart3, label: 'Brokerages', active: true },
                { icon: Users, label: 'Brokers', active: false },
                { icon: FileText, label: 'Prompts', active: false },
                { icon: Table2, label: 'Raw Data', active: false },
              ].map((tab, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium border-b-2 -mb-px ${
                    tab.active
                      ? 'border-primary text-primary'
                      : 'border-transparent text-slate-500'
                  }`}
                >
                  <tab.icon className="w-3.5 h-3.5" />
                  {tab.label}
                </div>
              ))}
            </div>
          </div>

          {/* Chart Section */}
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-800 text-sm">Most Visible Brokerages</h3>
              <div className="bg-slate-100 rounded-md px-3 py-1.5 text-xs text-slate-500 flex items-center gap-2">
                <span>Search brokerages...</span>
              </div>
            </div>

            <div className="space-y-2">
              {brokerages.map((brokerage, index) => (
                <motion.div
                  key={brokerage.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 + index * 0.05 }}
                  className="flex items-center gap-3"
                >
                  <span className="text-[11px] text-slate-600 w-32 text-right truncate">
                    {brokerage.name}
                  </span>
                  <div className="flex-1 h-5 bg-slate-100 rounded overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(brokerage.value / maxValue) * 100}%` }}
                      transition={{ delay: 1 + index * 0.05, duration: 0.5 }}
                      className="h-full rounded"
                      style={{
                        background: `linear-gradient(90deg, hsl(201 65% 34%) 0%, hsl(175 50% 45%) 100%)`,
                      }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 w-12 text-right">
                    {brokerage.value.toLocaleString()}
                  </span>
                </motion.div>
              ))}
            </div>

            <p className="text-[10px] text-slate-400 mt-4 italic">
              Shows which firms AI most frequently names in response to discovery prompts
            </p>
          </div>

          {/* Gradient overlay to suggest more content */}
          <div className="h-8 bg-gradient-to-t from-white to-transparent -mt-8 relative z-10 pointer-events-none" />
        </div>
      </div>
    </motion.div>
  );
}
