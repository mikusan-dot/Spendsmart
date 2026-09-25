import { Wallet, ExternalLink, Mail } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="py-12 px-4 border-t border-white/5">
      <div className="max-w-5xl mx-auto">
        <div className="grid sm:grid-cols-3 gap-8 mb-10">
          <div>
            <div className="flex items-center gap-2 text-xl font-bold mb-3">
              <Wallet size={22} className="text-purple-400" />
              SpendSmart
            </div>
            <p className="text-gray-500 text-sm leading-relaxed">
              Take control of your finances with a gamified, offline-first expense tracker.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Product</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><a href="#features" className="hover:text-purple-400 transition-colors">Features</a></li>
              <li><a href="https://github.com/anomalyco/spendsmart/releases/latest" target="_blank" rel="noopener noreferrer" className="hover:text-purple-400 transition-colors">Download</a></li>
              <li><a href="#" className="hover:text-purple-400 transition-colors">Privacy</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Connect</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li>
                <a href="https://github.com/anomalyco/spendsmart" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 hover:text-purple-400 transition-colors">
                  <ExternalLink size={14} /> GitHub
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="text-center text-sm text-gray-600 border-t border-white/5 pt-8">
          &copy; {new Date().getFullYear()} SpendSmart. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
