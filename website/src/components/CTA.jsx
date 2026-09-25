import useInView from '../hooks/useInView'
import { Smartphone, ArrowRight, Sparkles, Shield, Zap } from 'lucide-react'

export default function CTA() {
  const [ref, inView] = useInView()

  return (
    <section id="download" className="py-24 px-4 bg-[var(--bg-secondary)]">
      <div
        ref={ref}
        className={`max-w-4xl mx-auto text-center transition-all duration-700 ${
          inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6 text-sm text-purple-300">
          <Sparkles size={14} />
          Get Started Today
        </div>

        <h2 className="text-3xl md:text-5xl font-bold mb-4">
          Ready to Take Control?
        </h2>
        <p className="text-gray-400 text-lg max-w-xl mx-auto mb-10">
          Join thousands of users who have transformed their financial habits with SpendSmart.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
          <a
            href="https://github.com/anomalyco/spendsmart/releases/latest"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold transition-all duration-200 glow press text-lg"
          >
            <Smartphone size={20} />
            Download APK
          </a>
          <a
            href="#features"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl glass hover:bg-white/10 text-white font-semibold transition-all duration-200 press text-lg"
          >
            Learn More
            <ArrowRight size={20} />
          </a>
        </div>

        <div className="flex flex-wrap justify-center gap-8 text-sm text-gray-500">
          <span className="inline-flex items-center gap-1.5">
            <Shield size={14} className="text-purple-400" /> No account required
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Zap size={14} className="text-purple-400" /> Works offline
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Sparkles size={14} className="text-purple-400" /> Free to use
          </span>
        </div>
      </div>
    </section>
  )
}
