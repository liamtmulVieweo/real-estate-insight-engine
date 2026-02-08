import { motion } from 'framer-motion';
import { Building2, TrendingUp, MapPin, Target, AlertCircle, BarChart3, Table, Search } from 'lucide-react';

const kpis = [
  { icon: TrendingUp, label: 'UNIQUE PROMPTS', value: '509', sub: 'AI queries featuring you', color: 'text-emerald-500 bg-emerald-50' },
  { icon: Building2, label: 'MARKETS PRESENT', value: '10', sub: 'of 14 tracked', color: 'text-blue-500 bg-blue-50' },
  { icon: MapPin, label: 'SUBMARKETS PRESENT', value: '59', sub: 'of 66 tracked', color: 'text-amber-500 bg-amber-50' },
  { icon: Target, label: 'MARKET RANK', value: '#3', sub: 'of 2905 brokerages', color: 'text-violet-500 bg-violet-50' },
  { icon: AlertCircle, label: 'MISSED MARKETS', value: '4', sub: 'Opportunity gaps', color: 'text-rose-500 bg-rose-50' },
];

const marketData = [
  { market: 'Charlotte, South Carolina', mentions: 458, share: '9.8%', rank: '#1', total: 655, pct: 99 },
  { market: 'Greenville, South Carolina', mentions: 177, share: '2.9%', rank: '#6', total: 842, pct: 99 },
  { market: 'Gaffney, South Carolina', mentions: 13, share: '2.8%', rank: '#6', total: 103, pct: 95 },
  { market: 'Spartanburg, South Carolina', mentions: 92, share: '2.6%', rank: '#10', total: 197, pct: 95 },
  { market: 'Charleston, South Carolina', mentions: 36, share: '1.7%', rank: '#10', total: 399, pct: 98 },
];

const propertyTypes = [
  { type: 'office', mentions: 341, composition: '39.2%', rank: '#3', total: 1052 },
  { type: 'industrial', mentions: 315, composition: '36.2%', rank: '#4', total: 746 },
  { type: 'retail', mentions: 112, composition: '12.9%', rank: '#7', total: 1032 },
  { type: 'multifamily', mentions: 80, composition: '9.2%', rank: '#9', total: 777 },
  { type: 'land', mentions: 21, composition: '2.4%', rank: '#11', total: 674 },
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
                <div className="inline-flex items-center px-1.5 py-0.5 rounded bg-primary text-white text-[8px] font-medium">
                  869 total mentions
                </div>
              </div>
            </div>
            <div className="flex gap-1.5 items-center text-[9px] text-slate-400">
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
          <div className="bg-white rounded-lg border border-slate-200">
            <div className="flex items-center justify-between p-2 border-b border-slate-100">
              <div>
                <div className="text-[10px] font-semibold text-slate-800">Market Visibility</div>
                <div className="text-[7px] text-slate-400">Where your brokerage appears most frequently</div>
              </div>
              <div className="flex gap-0.5 bg-slate-100 rounded p-0.5">
                <div className="bg-white rounded p-1 shadow-sm">
                  <Table className="h-2.5 w-2.5 text-slate-600" />
                </div>
                <div className="p-1">
                  <BarChart3 className="h-2.5 w-2.5 text-slate-400" />
                </div>
              </div>
            </div>
            <div className="p-1.5">
              <table className="w-full text-[7px]">
                <thead>
                  <tr className="text-slate-400 border-b border-slate-100">
                    <th className="text-left py-1 font-medium">Market</th>
                    <th className="text-right py-1 font-medium">Mentions</th>
                    <th className="text-right py-1 font-medium">Share of Mentions</th>
                    <th className="text-right py-1 font-medium">Rank</th>
                    <th className="text-right py-1 font-medium">Percentile</th>
                  </tr>
                </thead>
                <tbody>
                  {marketData.map((row, i) => (
                    <tr key={i} className="border-b border-slate-50">
                      <td className="py-1 text-slate-700 truncate max-w-[80px]">{row.market}</td>
                      <td className="py-1 text-right text-slate-600">{row.mentions}</td>
                      <td className="py-1 text-right text-slate-500">{row.share}</td>
                      <td className="py-1 text-right">
                        <span className="text-primary font-semibold">{row.rank}</span>
                        <span className="text-slate-400 ml-0.5">of {row.total}</span>
                      </td>
                      <td className="py-1">
                        <div className="flex items-center justify-end gap-1">
                          <div className="w-8 h-1 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${row.pct}%` }} />
                          </div>
                          <span className="text-slate-600 w-5 text-right">{row.pct}th</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Property Types */}
          <div className="bg-white rounded-lg border border-slate-200">
            <div className="p-2 border-b border-slate-100">
              <div className="text-[10px] font-semibold text-slate-800">Property Types</div>
              <div className="text-[7px] text-slate-400">Top property types by mention count (All Markets)</div>
            </div>
            <div className="p-1.5">
              <table className="w-full text-[7px]">
                <thead>
                  <tr className="text-slate-400 border-b border-slate-100">
                    <th className="text-left py-1 font-medium">Property Type</th>
                    <th className="text-right py-1 font-medium">Mentions</th>
                    <th className="text-right py-1 font-medium">Composition</th>
                    <th className="text-right py-1 font-medium">Rank</th>
                  </tr>
                </thead>
                <tbody>
                  {propertyTypes.map((row, i) => (
                    <tr key={i} className="border-b border-slate-50">
                      <td className="py-1 text-slate-700">{row.type}</td>
                      <td className="py-1 text-right text-slate-600">{row.mentions}</td>
                      <td className="py-1 text-right text-slate-500">{row.composition}</td>
                      <td className="py-1 text-right">
                        <span className="text-primary font-semibold">{row.rank}</span>
                        <span className="text-slate-400 ml-0.5">of {row.total}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
            <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5">
              <Search className="h-2 w-2 text-slate-400" />
              <span className="text-[7px] text-slate-400">Search brokerages...</span>
            </div>
          </div>
          <table className="w-full text-[7px]">
            <thead>
              <tr className="text-slate-400 border-b border-slate-100">
                <th className="text-left py-1 font-medium">Rank</th>
                <th className="text-left py-1 font-medium">Brokerage</th>
                <th className="text-right py-1 font-medium">Mentions</th>
                <th className="text-right py-1 font-medium">vs Target</th>
              </tr>
            </thead>
            <tbody>
              {rankings.map((row, i) => (
                <motion.tr
                  key={i}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.1 + i * 0.05 }}
                  className={`border-b border-slate-50 ${row.isTarget ? 'bg-primary/5' : ''}`}
                >
                  <td className="py-1.5">
                    <span className={`w-4 h-4 inline-flex items-center justify-center rounded-full text-[7px] font-bold ${
                      row.rank <= 3 ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {row.rank}
                    </span>
                  </td>
                  <td className="py-1.5 text-slate-700">
                    {row.name}
                    {row.isTarget && (
                      <span className="ml-1 px-1 py-0.5 bg-primary text-white text-[6px] rounded font-medium">You</span>
                    )}
                  </td>
                  <td className="py-1.5 text-right text-slate-600">{row.mentions.toLocaleString()}</td>
                  <td className={`py-1.5 text-right font-medium ${
                    row.diff.startsWith('+') ? 'text-emerald-600' : row.diff.startsWith('-') ? 'text-rose-500' : 'text-slate-400'
                  }`}>
                    {row.diff}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
