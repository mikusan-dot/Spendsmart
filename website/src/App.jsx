import Hero from './components/Hero'
import Features from './components/Features'
import Preview from './components/Preview'
import HowItWorks from './components/HowItWorks'
import CTA from './components/CTA'
import Footer from './components/Footer'

export default function App() {
  return (
    <div className="min-h-screen">
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-lg">
            <span className="w-7 h-7 rounded-lg bg-purple-600 flex items-center justify-center text-xs font-bold">S</span>
            SpendSmart
          </div>
          <div className="flex items-center gap-6 text-sm text-gray-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#preview" className="hover:text-white transition-colors">Preview</a>
            <a
              href="https://github.com/anomalyco/spendsmart/releases/latest"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-medium transition-colors text-sm press"
            >
              Download
            </a>
          </div>
        </div>
      </nav>

      <main>
        <Hero />
        <Features />
        <Preview />
        <HowItWorks />
        <CTA />
      </main>

      <Footer />
    </div>
  )
}
