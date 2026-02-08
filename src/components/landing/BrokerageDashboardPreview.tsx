import { motion } from 'framer-motion';
import { Building2, TrendingUp, MapPin, Target, AlertCircle, BarChart3 } from 'lucide-react';

const kpis = [
  { icon: TrendingUp, label: 'UNIQUE PROMPTS', value: '84', color: 'text-emerald-500 bg-emerald-50' },
  { icon: Building2, label: 'MARKETS PRESENT', value: '2', sub: 'of 14 tracked', color: 'text-blue-500 bg-blue-50' },
  { icon: MapPin, label: 'SUBMARKETS', value: '7', sub: 'of 66 tracked', color: 'text-amber-500 bg-amber-50' },
  { icon: Target, label: 'MARKET RANK', value: '#17', sub: 'of 2905', color: 'text-violet-500 bg-violet-50' },
  { icon: AlertCircle, label: 'MISSED MARKETS', value: '12', sub: 'Opportunity gaps', color: 'text-rose-500 bg-rose-50' },
];

const marketData = [
  { market: 'Charleston, SC', mentions: 264, share: '12.3%', rank: '#1 of 399', pct: 99, good: true },
  { market: 'Myrtle Beach, SC', mentions: 1, share: '0.1%', rank: '#183 of 332', pct: 45, good: false },
];

const propertyTypes = [
  { type: 'Industrial', mentions: 256, composition: '96.6%', rank: '#5 of 746' },
  { type: 'Office', mentions: 8, composition: '3.0%', rank: '#168 of 1052' },
  { type: 'Land', mentions: 1, composition: '0.4%', rank: '#367 of 674' },
];

const rankings = [
  { rank: 1, name: 'Colliers', mentions: 2301, diff: '+2,036' },
  { rank: 2, name: 'Colliers | South Carolina', mentions: 966, diff: '+701' },
  { rank: 3, name: 'CBRE', mentions: 869, diff: '+604' },
  { rank: 4, name: 'Avison Young', mentions: 711, diff: '+446' },
  { rank: 5, name: 'Trinity Partners', mentions: 619, diff: '+354' },
];

export function BrokerageDashboardPreview() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.7, duration: 0.6 }}
      className="flex flex-col h-full"
    >
      <div className="text-center mb-4">
        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white/90 text-sm font-medium">
          <Building2 className="w-4 h-4" />
          Brokerage Dashboard Preview
        </span>
      </div>

      <div className="bg-white rounded-xl shadow-2xl overflow-hidden border border-white/20 flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-slate-50 border-b border-slate-200 p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-slate-200 flex items-center justify-center">
                <Building2 className="h-4 w-4 text-slate-500" />
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-800">Charleston Industrial</div>
                <div className="text-[10px] text-slate-500">265 total mentions</div>
              </div>
            </div>
            <div className="flex gap-1.5">
              {['All Markets', 'All Types'].map((f, i) => (
                <div key={i} className="bg-white border border-slate-200 rounded px-2 py-1 text-[9px] text-slate-500">
                  {f}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* KPIs */}
        <div className="p-3 border-b border-slate-200">
          <div className="grid grid-cols-5 gap-1.5">
            {kpis.map((kpi, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.9 + i * 0.05 }}
                className="bg-slate-50 rounded-lg p-2 border border-slate-100"
              >
                <div className={`h-5 w-5 rounded ${kpi.color.split(' ')[1]} flex items-center justify-center mb-1`}>
                  <kpi.icon className={`h-2.5 w-2.5 ${kpi.color.split(' ')[0]}`} />
                </div>
                <div className="text-[8px] text-slate-400 uppercase tracking-wider">{kpi.label}</div>
                <div className="text-sm font-bold text-slate-800">{kpi.value}</div>
                {kpi.sub && <div className="text-[8px] text-slate-400">{kpi.sub}</div>}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Two columns: Market Visibility & Property Types */}
        <div className="grid grid-cols-2 gap-2 p-3 border-b border-slate-200">
          {/* Market Visibility */}
          <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-100">
            <div className="flex items-center gap-1.5 mb-2">
              <BarChart3 className="h-3 w-3 text-slate-400" />
              <span className="text-[10px] font-semibold text-slate-700">Market Visibility</span>
            </div>
            <div className="space-y-1.5">
              {marketData.map((row, i) => (
                <div key={i} className="flex items-center gap-1.5 text-[8px]">
                  <span className="text-slate-600 w-16 truncate">{row.market}</span>
                  <span className="text-slate-500 w-6 text-right">{row.mentions}</span>
                  <span className="text-slate-400 w-8 text-right">{row.share}</span>
                  <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${row.good ? 'bg-emerald-500' : 'bg-rose-400'}`}
                      style={{ width: `${row.pct}%` }}
                    />
                  </div>
                  <span className={`w-6 text-right font-medium ${row.good ? 'text-emerald-600' : 'text-slate-400'}`}>
                    {row.pct}th
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Property Types */}
          <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-100">
            <div className="flex items-center gap-1.5 mb-2">
              <Building2 className="h-3 w-3 text-slate-400" />
              <span className="text-[10px] font-semibold text-slate-700">Property Types</span>
            </div>
            <div className="space-y-1.5">
              {propertyTypes.map((row, i) => (
                <div key={i} className="flex items-center justify-between text-[8px]">
                  <span className="text-slate-600 font-medium">{row.type}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">{row.mentions}</span>
                    <span className="text-slate-400">{row.composition}</span>
                    <span className="text-primary font-medium">{row.rank.split(' ')[0]}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Competitive Rankings */}
        <div className="p-3 flex-1">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-[10px] font-semibold text-slate-800">Brokerage Competitive Rankings</h3>
              <p className="text-[8px] text-slate-400">Compare visibility against competitors</p>
            </div>
          </div>
          <div className="space-y-1">
            {rankings.map((row, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.1 + i * 0.05 }}
                className="flex items-center gap-2 text-[8px]"
              >
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-white text-[7px] font-bold ${
                  row.rank <= 3 ? 'bg-primary' : 'bg-slate-300'
                }`}>
                  {row.rank}
                </span>
                <span className="flex-1 text-slate-700 truncate">{row.name}</span>
                <span className="text-slate-500">{row.mentions.toLocaleString()}</span>
                <span className="text-emerald-600 font-medium">{row.diff}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Gradient overlay */}
        <div className="h-6 bg-gradient-to-t from-white to-transparent -mt-6 relative z-10 pointer-events-none" />
      </div>
    </motion.div>
  );
}
