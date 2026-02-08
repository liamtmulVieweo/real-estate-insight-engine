import { motion } from 'framer-motion';
import { Building2, TrendingUp, MapPin, Target, AlertCircle, BarChart3, Grid3X3, BarChart2 } from 'lucide-react';

const kpis = [
  { icon: TrendingUp, label: 'UNIQUE PROMPTS', value: '509', sub: 'AI queries featuring you', color: 'text-emerald-500 bg-emerald-50' },
  { icon: Building2, label: 'MARKETS PRESENT', value: '10', sub: 'of 14 tracked', color: 'text-blue-500 bg-blue-50' },
  { icon: MapPin, label: 'SUBMARKETS PRESENT', value: '59', sub: 'of 66 tracked', color: 'text-amber-500 bg-amber-50' },
  { icon: Target, label: 'MARKET RANK', value: '#3', sub: 'of 2905 brokerages', color: 'text-violet-500 bg-violet-50' },
  { icon: AlertCircle, label: 'MISSED MARKETS', value: '4', sub: 'Opportunity gaps', color: 'text-rose-500 bg-rose-50' },
];

const marketData = [
  { market: 'Charlotte, South Carolina', mentions: 458, share: '9.8%', rank: '#1', of: '655', pct: 99 },
  { market: 'Greenville, South Carolina', mentions: 177, share: '2.9%', rank: '#6', of: '842', pct: 99 },
  { market: 'Gaffney, South Carolina', mentions: 13, share: '2.8%', rank: '#6', of: '103', pct: 95 },
  { market: 'Spartanburg, South Carolina', mentions: 92, share: '2.6%', rank: '#10', of: '197', pct: 95 },
  { market: 'Charleston, South Carolina', mentions: 36, share: '1.7%', rank: '#10', of: '399', pct: 98 },
];

const propertyTypes = [
  { type: 'office', mentions: 341, composition: '39.2%', rank: '#3', of: '1052' },
  { type: 'industrial', mentions: 315, composition: '36.2%', rank: '#4', of: '746' },
  { type: 'retail', mentions: 112, composition: '12.9%', rank: '#7', of: '1032' },
  { type: 'multifamily', mentions: 80, composition: '9.2%', rank: '#9', of: '777' },
  { type: 'land', mentions: 21, composition: '2.4%', rank: '#11', of: '674' },
];

const rankings = [
  { rank: 1, name: 'Colliers', mentions: 2301, diff: '+1,432', isTarget: false },
  { rank: 2, name: 'Colliers | South Carolina', mentions: 966, diff: '+97', isTarget: false },
  { rank: 3, name: 'CBRE', mentions: 869, diff: '0', isTarget: true },
  { rank: 4, name: 'Avison Young', mentions: 711, diff: '-158', isTarget: false },
  { rank: 5, name: 'Trinity Partners', mentions: 619, diff: '-250', isTarget: false },
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
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Building2 className="h-4 w-4 text-primary" />
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-800">CBRE</div>
                <div className="inline-flex px-2 py-0.5 bg-primary text-white text-[9px] rounded-full font-medium">
                  869 total mentions
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-[9px] text-slate-500">
              <span>Filters:</span>
              {['All Markets', 'All Property Types', 'All Roles'].map((f, i) => (
                <div key={i} className="bg-white border border-slate-200 rounded px-2 py-1 text-slate-600">
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
                <div className="text-[7px] text-slate-400 uppercase tracking-wider">{kpi.label}</div>
                <div className="text-sm font-bold text-slate-800">{kpi.value}</div>
                {kpi.sub && <div className="text-[7px] text-slate-400">{kpi.sub}</div>}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Two columns: Market Visibility & Property Types */}
        <div className="grid grid-cols-2 gap-2 p-3 border-b border-slate-200">
          {/* Market Visibility */}
          <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-semibold text-slate-700">Market Visibility</span>
                </div>
                <p className="text-[7px] text-slate-400">Where your brokerage appears most frequently</p>
              </div>
              <div className="flex gap-1">
                <div className="p-1 rounded bg-slate-200">
                  <Grid3X3 className="h-2.5 w-2.5 text-slate-500" />
                </div>
                <div className="p-1 rounded bg-white border border-slate-200">
                  <BarChart2 className="h-2.5 w-2.5 text-slate-400" />
                </div>
              </div>
            </div>
            {/* Table Header */}
            <div className="flex items-center gap-1 text-[6px] text-slate-400 uppercase mb-1 px-0.5">
              <span className="w-20">Market</span>
              <span className="w-8 text-right">Mentions</span>
              <span className="w-10 text-right">Share</span>
              <span className="w-12 text-right">Rank</span>
              <span className="flex-1 text-right">Percentile</span>
            </div>
            <div className="space-y-1">
              {marketData.map((row, i) => (
                <div key={i} className="flex items-center gap-1 text-[7px] px-0.5">
                  <span className="text-slate-600 w-20 truncate">{row.market}</span>
                  <span className="text-slate-700 w-8 text-right font-medium">{row.mentions}</span>
                  <span className="text-slate-400 w-10 text-right">{row.share}</span>
                  <span className="w-12 text-right">
                    <span className="text-primary font-medium">{row.rank}</span>
                    <span className="text-slate-300"> of {row.of}</span>
                  </span>
                  <div className="flex-1 flex items-center gap-1 justify-end">
                    <div className="w-10 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-emerald-500"
                        style={{ width: `${row.pct}%` }}
                      />
                    </div>
                    <span className="text-emerald-600 font-medium w-5 text-right">{row.pct}th</span>
                    {i === 0 && <span className="text-slate-300">▲</span>}
                    {i === marketData.length - 1 && <span className="text-slate-300">▼</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Property Types */}
          <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-100">
            <div className="mb-2">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-semibold text-slate-700">Property Types</span>
              </div>
              <p className="text-[7px] text-slate-400">Top property types by mention count (All Markets)</p>
            </div>
            {/* Table Header */}
            <div className="flex items-center justify-between text-[6px] text-slate-400 uppercase mb-1 px-0.5">
              <span>Property Type</span>
              <div className="flex items-center gap-3">
                <span>Mentions</span>
                <span>Composition</span>
                <span>Rank</span>
              </div>
            </div>
            <div className="space-y-1">
              {propertyTypes.map((row, i) => (
                <div key={i} className="flex items-center justify-between text-[7px] px-0.5">
                  <span className="text-slate-600">{row.type}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-700 font-medium w-8 text-right">{row.mentions}</span>
                    <span className="text-slate-400 w-10 text-right">{row.composition}</span>
                    <span className="w-12 text-right">
                      <span className="text-primary font-medium">{row.rank}</span>
                      <span className="text-slate-300"> of {row.of}</span>
                    </span>
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
              <p className="text-[7px] text-slate-400">Compare your visibility against direct competitors</p>
            </div>
            <div className="bg-slate-100 rounded px-2 py-1 text-[7px] text-slate-400 flex items-center gap-1">
              <span>Search brokerages...</span>
            </div>
          </div>
          {/* Table Header */}
          <div className="flex items-center gap-2 text-[6px] text-slate-400 uppercase mb-1 px-1">
            <span className="w-6">Rank</span>
            <span className="flex-1">Brokerage</span>
            <span className="w-12 text-right">Mentions</span>
            <span className="w-12 text-right">vs Target</span>
          </div>
          <div className="space-y-1">
            {rankings.map((row, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.1 + i * 0.05 }}
                className={`flex items-center gap-2 text-[8px] px-1 py-0.5 rounded ${
                  row.isTarget ? 'bg-emerald-50' : ''
                }`}
              >
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-white text-[7px] font-bold ${
                  row.rank <= 3 ? 'bg-primary' : 'bg-slate-300 text-slate-600'
                }`}>
                  {row.rank}
                </span>
                <span className="flex-1 text-slate-700 truncate flex items-center gap-1">
                  {row.name}
                  {row.isTarget && (
                    <span className="px-1.5 py-0.5 bg-slate-700 text-white text-[6px] rounded font-medium">
                      You
                    </span>
                  )}
                </span>
                <span className="text-slate-600 w-12 text-right">{row.mentions.toLocaleString()}</span>
                <span className={`w-12 text-right font-medium ${
                  row.diff.startsWith('+') ? 'text-emerald-600' : 
                  row.diff.startsWith('-') ? 'text-rose-500' : 'text-slate-400'
                }`}>
                  {row.diff}
                </span>
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
