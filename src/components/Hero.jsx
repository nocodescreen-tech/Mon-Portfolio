import { motion } from 'framer-motion'
import { profile, stats } from '../data/content'
import { Magnetic, Counter } from './ui'
const ease = [0.22, 1, 0.36, 1]

/** Rayons de lumière — motif signature LUMO. */
function Rays() {
  const angles = Array.from({ length: 36 }, (_, i) => i * 10)
  return (
    <svg aria-hidden="true" className="absolute inset-0 h-full w-full" viewBox="0 0 800 800">
      <g stroke="#F0B429" strokeOpacity="0.10" strokeWidth="1">
        {angles.map((a) => (
          <line
            key={a}
            x1="400"
            y1="400"
            x2={400 + 420 * Math.cos((a * Math.PI) / 180)}
            y2={400 + 420 * Math.sin((a * Math.PI) / 180)}
          />
        ))}
      </g>
    </svg>
  )
}

const codeLines = [
  { indent: 0, content: "const { developpeur } = await recruter({", color: 'text-mist' },
  { indent: 1, content: "nom: 'René Descartes',", color: 'text-brass-soft' },
  { indent: 1, content: "stack: ['React', 'Node.js', 'PostgreSQL'],", color: 'text-mist' },
  { indent: 1, content: "vision: 'La lumière dans vos idées',", color: 'text-brass-soft' },
  { indent: 1, content: "base: 'Matadi · RDC',", color: 'text-mist' },
  { indent: 0, content: '});', color: 'text-mist' },
]

function CodeWindow() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, rotate: 1.5 }}
      animate={{ opacity: 1, y: 0, rotate: 0 }}
      transition={{ duration: 1, delay: 0.55, ease }}
      className="relative"
    >
      <div className="corner-cut absolute -inset-px bg-gradient-to-br from-brass/50 via-brass/10 to-river/40 blur-[2px]" />
      <div className="corner-cut relative bg-ink-2/95 ring-1 ring-brass/25">
        <div className="flex items-center gap-2 border-b border-brass/15 px-5 py-3.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
          <span className="ml-3 font-mono text-[11px] tracking-wide text-fog">lumo — recrutement.js</span>
        </div>
        <div className="space-y-2.5 px-6 py-7 font-mono text-[13px] md:text-sm leading-relaxed">
          {codeLines.map((line, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.9 + i * 0.18, duration: 0.4 }}
              className={`${line.color} ${line.indent ? 'pl-6' : ''}`}
            >
              <span className="select-none text-brass/40 mr-4 inline-block w-4 text-right">{i + 1}</span>
              {line.content}
            </motion.div>
          ))}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.1 }}
            className="flex items-center gap-2 pt-1 text-river"
          >
            <i className="fa-solid fa-check text-brass-soft text-[11px]" aria-hidden="true" />
            <span>candidature prête — discutons</span>
            <span className="inline-block h-4 w-[7px] bg-brass animate-pulse-soft" />
          </motion.div>
        </div>
      </div>
      <div className="absolute -right-5 -top-5 -z-10 h-40 w-40 rounded-full bg-brass/20 blur-[70px]" />
    </motion.div>
  )
}

function RoleRotator({ roles }) {
  return (
    <span className="relative inline-block max-w-full overflow-hidden align-bottom h-[1.35em]">
      {roles.map((role, i) => (
        <motion.span
          key={role}
          className="block font-display italic text-brass whitespace-nowrap"
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: '0%', opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.3 + i * 0.02, ease }}
        >
          {role}
        </motion.span>
      ))}
    </span>
  )
}

export default function Hero() {
  return (
    <section id="top" className="relative overflow-hidden pt-36 pb-20 md:pt-44 md:pb-24">
      {/* fonds */}
      <div className="blueprint absolute inset-0 opacity-60" aria-hidden="true" />
      <div
        className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_-10%,rgba(240,180,41,0.14),transparent_70%)]"
        aria-hidden="true"
      />
      <div className="absolute right-[-10%] top-[30%] hidden lg:block h-[560px] w-[560px] opacity-70" aria-hidden="true">
        <Rays />
      </div>

      <div className="relative mx-auto grid w-full max-w-6xl gap-16 px-6 md:px-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
        <div className="min-w-0">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15, ease }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-brass/25 bg-ink-2/70 px-4 py-1.5 font-mono text-[11px] md:text-xs tracking-widest uppercase text-brass"
          >
            <i className="fa-solid fa-location-dot text-[11px]" aria-hidden="true" />
            Matadi · Kongo Central · RDC
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 26, filter: 'blur(8px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.9, delay: 0.28, ease }}
            className="font-display text-[15vw] leading-[0.98] font-medium text-mist min-[420px]:text-[13vw] sm:text-6xl md:text-7xl lg:text-[5.2rem]"
          >
            René
            <br />
            <span className="italic text-glow text-brass">Descartes</span>
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.55, ease }}
            className="mt-7 text-[clamp(14px,3.9vw,18px)] md:text-2xl text-mist/90 min-w-0"
          >
            <RoleRotator roles={profile.roles} />
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.7, ease }}
            className="mt-6 max-w-xl text-fog text-base md:text-lg leading-relaxed"
          >
            Je conçois des applications web complètes — du code à l'interface — avec la
            conviction qu'une application bien pensée est une <em className="not-italic text-brass-soft">lumière</em>{' '}
            dans le quotidien de ceux qui l'utilisent.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.85, ease }}
            className="mt-10 flex flex-wrap items-center gap-4"
          >
            <Magnetic>
              <a
                href="#projets"
                className="corner-cut inline-flex items-center gap-2.5 bg-brass px-5 py-3.5 md:px-7 md:py-4 font-mono text-sm font-semibold text-ink transition-all hover:bg-brass-soft hover:shadow-[0_0_40px_rgba(240,180,41,0.4)]"
              >
                Voir mes projets
                <i className="fa-solid fa-arrow-down text-sm" aria-hidden="true" />
              </a>
            </Magnetic>
            <Magnetic>
              <a
                href="#contact"
                className="corner-cut inline-flex items-center gap-2.5 border border-mist/25 px-5 py-3.5 md:px-7 md:py-4 font-mono text-sm text-mist transition-all hover:border-brass hover:text-brass"
              >
                Me contacter
              </a>
            </Magnetic>
            <Magnetic>
              <a
                href={profile.cvUrl}
                download
                className="corner-cut inline-flex items-center gap-2.5 border border-brass/40 bg-ink-2/60 px-5 py-3.5 md:px-7 md:py-4 font-mono text-sm text-brass transition-all hover:bg-brass hover:text-ink hover:shadow-[0_0_32px_rgba(240,180,41,0.4)]"
              >
                <i className="fa-solid fa-file-arrow-down text-sm" aria-hidden="true" />
                Mon CV
              </a>
            </Magnetic>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.05 }}
            className="mt-10 flex flex-wrap items-center gap-x-5 gap-y-3"
          >
            <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-fog">Suivez-moi</span>
            <span className="hidden sm:block h-px w-10 bg-brass/40" />
            {[
              { href: profile.links.linkedin, icon: 'fa-brands fa-linkedin-in', label: 'LinkedIn' },
              { href: profile.links.github, icon: 'fa-brands fa-github', label: 'GitHub' },
              { href: profile.links.facebook, icon: 'fa-brands fa-facebook-f', label: 'Facebook' },
            ].map(({ href, icon, label }) => (
              <Magnetic key={label} strength={0.35}>
                <a
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  className="grid h-10 w-10 sm:h-11 sm:w-11 place-items-center corner-cut-sm bg-ink-2 ring-1 ring-brass/20 text-fog transition-all hover:text-brass hover:ring-brass/60 hover:shadow-[0_0_20px_rgba(240,180,41,0.25)]"
                >
                  <i className={`${icon} text-[14px] sm:text-[15px]`} aria-hidden="true" />
                </a>
              </Magnetic>
            ))}
            <Magnetic strength={0.35}>
              <a
                href={`mailto:${profile.email}`}
                aria-label="Email"
                className="grid h-10 w-10 sm:h-11 sm:w-11 place-items-center corner-cut-sm bg-ink-2 ring-1 ring-brass/20 text-fog transition-all hover:text-brass hover:ring-brass/60"
              >
                <i className="fa-solid fa-envelope text-[14px] sm:text-[15px]" aria-hidden="true" />
              </a>
            </Magnetic>
          </motion.div>
        </div>

        <div className="hidden lg:block">
          <CodeWindow />
        </div>
      </div>

      {/* bandeau statistiques */}
      <div className="relative mx-auto mt-20 w-full max-w-6xl px-6 md:px-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease }}
          className="corner-cut grid grid-cols-2 gap-px overflow-hidden bg-brass/12 md:grid-cols-4"
        >
          {stats.map((s) => (
            <div key={s.label} className="bg-ink-2 px-7 py-8">
              <div className="font-display text-4xl md:text-5xl text-brass">
                <Counter to={s.value} prefix={s.prefix || ''} suffix={s.suffix} />
              </div>
              <p className="mt-2 text-[13px] leading-snug text-fog">{s.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
