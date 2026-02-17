import { motion } from 'framer-motion'
import {
  MapPin,
  Building2,
  Target,
  Link as LinkIcon,
  EyeOff,
  ArrowRight,
  Sparkles,
  TrendingUp,
  MapPinned,
  Award,
  AlertCircle,
  BarChart3,
  Table2,
} from 'lucide-react'

interface UpgradeBannerProps {
  onOpenSubscription: () => void;
}

export function UpgradeBanner({ onOpenSubscription }: UpgradeBannerProps) {
  const features = [
    { icon: MapPin, text: 'Market & sub-market coverage' },
    { icon: Building2, text: 'Property type & role breakdown' },
    { icon: Target, text: 'Competitive positioning' },
    { icon: LinkIcon, text: 'Source attribution' },
    { icon: EyeOff, text: 'Missed visibility gaps' },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="relative w-full overflow-hidden rounded-xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm"
    >
      <div className="relative z-10 grid gap-6 lg:grid-cols-[1fr_1.2fr] lg:items-center">
        {/* Left Content — compact */}
        <div className="space-y-4">
          <div className="space-y-2">
            <span className="inline-flex items-center rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700 ring-1 ring-teal-200/60">
              <Sparkles className="mr-1.5 h-3 w-3" />
              Pro Feature
            </span>
            <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
              See How AI Positions Your Brokerage
            </h2>
          </div>

          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5">
            {features.map((feature, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 + index * 0.05 }}
                className="flex items-center gap-2"
              >
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-slate-100">
                  <feature.icon className="h-3 w-3 text-teal-600" />
                </div>
                <span className="text-xs text-slate-600">{feature.text}</span>
              </motion.li>
            ))}
          </ul>

          <div className="flex items-center gap-3 pt-1">
            <button
              onClick={onOpenSubscription}
              className="inline-flex items-center justify-center rounded-lg bg-teal-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-teal-700 transition-colors group"
            >
              Unlock Dashboard
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </button>
            <button
              onClick={onOpenSubscription}
              className="inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors"
            >
              Learn more
            </button>
          </div>
        </div>

        {/* Right Visual — dashboard preview */}
        <div className="relative hidden lg:block">
          <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 shadow-sm">
            {/* Mini header */}
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-slate-200 flex items-center justify-center">
                  <Building2 className="h-3.5 w-3.5 text-slate-400" />
                </div>
                <div>
                  <div className="h-3 w-20 rounded bg-slate-200" />
                  <div className="mt-1 h-2 w-14 rounded bg-slate-100" />
                </div>
              </div>
              <div className="flex gap-1.5">
                <div className="h-6 w-16 rounded-md bg-slate-100 border border-slate-200" />
                <div className="h-6 w-16 rounded-md bg-slate-100 border border-slate-200" />
              </div>
            </div>

            {/* Metric cards */}
            <div className="grid grid-cols-5 gap-1.5 mb-3">
              {[
                { icon: TrendingUp, color: 'text-teal-500 bg-teal-50', label: 'PROMPTS', value: '829' },
                { icon: Building2, color: 'text-blue-500 bg-blue-50', label: 'MARKETS', value: '12' },
                { icon: MapPinned, color: 'text-violet-500 bg-violet-50', label: 'SUBS', value: '62' },
                { icon: Award, color: 'text-amber-500 bg-amber-50', label: 'RANK', value: '#1' },
                { icon: AlertCircle, color: 'text-rose-500 bg-rose-50', label: 'GAPS', value: '2' },
              ].map((m, i) => (
                <div key={i} className="rounded-lg border border-slate-200 bg-white p-2">
                  <div className={`h-5 w-5 rounded-md ${m.color.split(' ')[1]} flex items-center justify-center mb-1`}>
                    <m.icon className={`h-2.5 w-2.5 ${m.color.split(' ')[0]}`} />
                  </div>
                  <div className="text-[8px] font-semibold text-slate-400 uppercase tracking-wider">{m.label}</div>
                  <div className="text-xs font-bold text-slate-800">{m.value}</div>
                </div>
              ))}
            </div>

            {/* Two tables */}
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-lg border border-slate-200 bg-white p-2.5">
                <div className="flex items-center gap-1.5 mb-2">
                  <BarChart3 className="h-3 w-3 text-slate-400" />
                  <span className="text-[10px] font-semibold text-slate-700">Market Visibility</span>
                </div>
                <div className="space-y-1.5">
                  {[
                    { market: 'Newberry, SC', pct: 85 },
                    { market: 'Spartanburg, SC', pct: 72 },
                    { market: 'Columbia, SC', pct: 65 },
                  ].map((row, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-[9px] text-slate-500 w-20 truncate">{row.market}</span>
                      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${row.pct}%` }} />
                      </div>
                      <span className="text-[9px] font-medium text-slate-400">99th</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-lg border border-slate-200 bg-white p-2.5">
                <div className="flex items-center gap-1.5 mb-2">
                  <Table2 className="h-3 w-3 text-slate-400" />
                  <span className="text-[10px] font-semibold text-slate-700">Property Types</span>
                </div>
                <div className="space-y-1.5">
                  {[
                    { type: 'Industrial', pct: '48.1%', rank: '#1' },
                    { type: 'Office', pct: '28.8%', rank: '#1' },
                    { type: 'Retail', pct: '16.5%', rank: '#1' },
                  ].map((row, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <span className="text-[9px] text-slate-600 font-medium">{row.type}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-[9px] text-slate-400">{row.pct}</span>
                        <span className="text-[9px] font-semibold text-teal-600">{row.rank}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Blur overlay */}
            <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-white/80 via-transparent to-transparent pointer-events-none" />
          </div>
        </div>
      </div>
    </motion.div>
  )
}
