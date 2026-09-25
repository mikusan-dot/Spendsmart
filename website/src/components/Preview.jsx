import useInView from '../hooks/useInView'
import { Smartphone } from 'lucide-react'

const totalImages = 8
const startIndex = 1

function PhoneFrame({ src, index }) {
  return (
    <div className="relative mx-auto w-[200px] md:w-[230px]">
      <div className="relative rounded-[2.5rem] border-2 border-white/10 bg-[var(--bg-secondary)] p-3 shadow-2xl">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-5 bg-[var(--bg-secondary)] rounded-b-xl z-10 flex items-center justify-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-gray-600" />
          <div className="w-6 h-1.5 rounded-full bg-gray-600" />
        </div>

        <div className="overflow-hidden rounded-[1.75rem] bg-[var(--bg)]">
          <img
            src={src}
            alt={`SpendSmart screen ${index + 1}`}
            className="w-full aspect-[9/19] object-cover"
            loading="lazy"
          />
        </div>

        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-28 h-1 rounded-full bg-gray-600" />
      </div>
    </div>
  )
}

export default function Preview() {
  const [ref, inView] = useInView()

  return (
    <section id="preview" className="py-24 px-4 overflow-hidden">
      <div
        ref={ref}
        className={`max-w-6xl mx-auto transition-all duration-700 ${
          inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6 text-sm text-purple-300">
            <Smartphone size={14} />
            App Preview
          </div>
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Beautiful by Design
          </h2>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            Clean, dark-themed interface with smooth animations and intuitive navigation.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {Array.from({ length: totalImages }, (_, i) => (
            <div
              key={i}
              className={`transition-all duration-700 ${
                inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              <PhoneFrame src={`/screenshots/screen${i + startIndex}.jpeg`} index={i} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
