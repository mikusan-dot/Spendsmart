import useInView from '../hooks/useInView'
import {
  Wallet,
  PieChart,
  Brain,
  Target,
  WifiOff,
  Trophy,
  Palette,
  Smartphone,
} from 'lucide-react'

const features = [
  {
    icon: Wallet,
    title: 'Expense Tracking',
    desc: 'Log expenses instantly with categories like Food, Travel, Shopping, Bills & more.',
  },
  {
    icon: PieChart,
    title: 'Beautiful Charts',
    desc: 'Visualize your spending patterns with interactive Recharts-powered graphs.',
  },
  {
    icon: Brain,
    title: 'AI Insights',
    desc: 'Get smart suggestions and analysis of your spending habits.',
  },
  {
    icon: Target,
    title: 'Budget Management',
    desc: 'Set category-wise budgets and track your progress in real time.',
  },
  {
    icon: WifiOff,
    title: 'Offline First',
    desc: 'Works seamlessly offline with localStorage fallback and auto-sync.',
  },
  {
    icon: Trophy,
    title: 'Gamification',
    desc: 'Earn XP, level up, and unlock achievements as you build better habits.',
  },
  {
    icon: Palette,
    title: '7 Dark Themes',
    desc: 'Choose from beautifully crafted dark themes that match your style.',
  },
  {
    icon: Smartphone,
    title: 'Cross-Device Sync',
    desc: 'Sync your data across devices via shared UID — no account needed.',
  },
]

export default function Features() {
  const [ref, inView] = useInView()

  return (
    <section id="features" className="py-24 px-4 overflow-hidden">
      <div
        ref={ref}
        className={`max-w-6xl mx-auto transition-all duration-700 ${
          inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Everything You Need
          </h2>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            SpendSmart packs powerful features into a clean, intuitive interface.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((f, i) => (
            <div
              key={f.title}
              className={`glass rounded-2xl p-6 hover:bg-white/[0.06] transition-all duration-500 group ${
                inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: `${i * 80}ms` }}
            >
              <div className="w-10 h-10 rounded-lg bg-purple-600/20 flex items-center justify-center mb-4 group-hover:bg-purple-600/30 transition-colors">
                <f.icon size={20} className="text-purple-400" />
              </div>
              <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
