import { motion } from 'framer-motion'
import { timeline } from '../data/content'
import { Section, Reveal } from './ui'

export default function Journey() {
  return (
    <Section
      id="parcours"
      label="parcours"
      title={
        <>
          Formation & <span className="italic text-brass">expérience</span>
        </>
      }
      kicker="Un parcours construit sur l'apprentissage continu : technique, réseaux, langues et pratique."
      className="bg-ink-2/40 border-y border-brass/8"
    >
      <div className="relative mx-auto max-w-3xl">
        {/* ligne qui se dessine au scroll */}
        <motion.div
          initial={{ scaleY: 0 }}
          whileInView={{ scaleY: 1 }}
          viewport={{ once: true, margin: '-120px' }}
          transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
          className="absolute left-[19px] top-2 bottom-2 w-px origin-top bg-gradient-to-b from-brass via-brass/50 to-river/30"
          aria-hidden="true"
        />

        <div className="space-y-10">
          {timeline.map((item, i) => (
            <Reveal key={i} delay={i * 0.08}>
              <div className="relative flex gap-7 pl-0">
                <div className="relative z-10 mt-1 grid h-10 w-10 shrink-0 place-items-center corner-cut-sm bg-ink-2 ring-1 ring-brass/40">
                  <i
                    className={`${item.type === 'formation' ? 'fa-solid fa-graduation-cap' : 'fa-solid fa-briefcase'} text-brass text-[15px]`}
                    aria-hidden="true"
                  />
                </div>
                <div className="corner-cut flex-1 border border-brass/12 bg-ink p-6 transition-colors hover:border-brass/45">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-mono text-xs text-brass">{item.period}</span>
                    <span className="corner-cut-sm border border-brass/25 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-widest text-brass-soft">
                      {item.tag}
                    </span>
                  </div>
                  <h3 className="mt-3 font-display text-xl text-mist">{item.title}</h3>
                  <p className="mt-1.5 text-[13px] text-fog">{item.place}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </Section>
  )
}
