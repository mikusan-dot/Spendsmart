import useInView from '../hooks/useInView'
import { Download, Plus, BarChart3, Zap } from 'lucide-react'

const steps = [
  {
    icon: Download,
    title: 'Get the App',
    desc: 'Install SpendSmart on your Android device or use it in your browser.',
  },
  {
    icon: Plus,
    title: 'Add Expenses',
    desc: 'Log your spending in seconds. Categorize, tag, and stay organized.',
  },
  {
    icon: BarChart3,
    title: 'Track Progress',
    desc: 'Watch your spending habits take shape with charts and budget alerts.',
  },
  {
    icon: Zap,
    title: 'Level Up',
    desc: 'Earn XP, unlock achievements, and build better financial habits.',
  },
]

export default function HowItWorks() {
  const [ref, inView] = useInView()

  return (
    <section className="py-24 px-4 bg-[var(--bg-secondary)] overflow-hidden">
      <div
        ref={ref}
        className={`max-w-5xl mx-auto transition-all duration-700 ${
          inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">How It Works</h2>
          <p className="text-gray-400 text-lg">Get started in minutes — no sign-up required.</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((s, i) => (
            <div
              key={s.title}
              className={`text-center transition-all duration-500 ${
                inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: `${i * 150}ms` }}
            >
              <div className="relative inline-flex mb-6">
                <div className="w-16 h-16 rounded-2xl bg-purple-600/20 flex items-center justify-center">
                  <s.icon size={28} className="text-purple-400" />
                </div>
                <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-purple-600 text-sm font-bold flex items-center justify-center">
                  {i + 1}
                </div>
              </div>
              <h3 className="font-semibold text-lg mb-2">{s.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
