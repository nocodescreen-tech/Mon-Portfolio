import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { timeline } from '../data/content'
import { Reveal } from './motion'
import SectionHeading from './SectionHeading'

/**
 * Parcours — flux d'animation : la ligne se dessine au scroll et chaque
 * jalon apparaît en cascade, de haut en bas (comme une frise qui avance).
 */
export default function Journey() {
  const wrap = useRef(null)
  const { scrollYProgress } = useScroll({ target: wrap, offset: ['start 72%', 'end 62%'] })
  const scaleY = useTransform(scrollYProgress, [0, 1], [0, 1])

  return (
    <section id="parcours" className="relative py-24 md:py-32">
      <div className="mx-auto w-full max-w-5xl px-6 md:px-10">
        <SectionHeading
          label="Parcours"
          title="Mon parcours"
          desc="Quelques dates qui racontent d'où je viens et comment je travaille aujourd'hui."
        />

        <div ref={wrap} className="relative">
          {/* rail de fond */}
          <span
            aria-hidden="true"
            className="absolute left-0 top-3 bottom-8 w-[2px]"
            style={{ background: 'var(--border)' }}
          />
          {/* flux accent qui se dessine au scroll */}
          <motion.span
            aria-hidden="true"
            className="absolute left-0 top-3 bottom-8 w-[2px] origin-top"
            style={{ background: 'linear-gradient(180deg, var(--accent), var(--accent-2))', scaleY }}
          />

          <div>
            {timeline.map((item, i) => (
              <Reveal key={item.period + item.title} delay={i * 0.05}>
                <div className="relative border-b pb-8 pl-9 last:border-0 last:pb-0" style={{ borderColor: 'var(--border)' }}>
                  {/* jalon sur le rail */}
                  <span
                    aria-hidden="true"
                    className="absolute left-[-5px] top-2 h-3 w-3 rounded-full"
                    style={{
                      background: item.tag === 'Diplôme' ? 'var(--accent)' : 'var(--surface-2)',
                      border: '2px solid var(--accent)',
                      boxShadow: item.tag === 'Diplôme' ? '0 0 0 4px var(--glow)' : undefined,
                    }}
                  />

                  <div className="flex flex-wrap items-center gap-3 pt-1">
                    <span className="font-mono text-[13px] uppercase tracking-[0.15em] t-accent">{item.period}</span>
                    <span
                      className="chip-fx rounded-full border px-2.5 py-0.5 font-mono text-[11px] t-text3"
                      style={{ borderColor: 'var(--border)' }}
                    >
                      {item.tag}
                    </span>
                  </div>

                  <h3 className="mt-2 font-display text-xl font-semibold t-text md:text-2xl">{item.title}</h3>
                  <p className="mt-1 text-[15px] leading-relaxed t-text2">{item.place}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
