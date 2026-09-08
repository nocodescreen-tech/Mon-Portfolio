import Card from './Card'
import SectionHeading from './SectionHeading'
import { GroupReveal } from './motion'

const STEPS = [
  { n: '01', k: 'Comprendre', v: "J'écoute le besoin réel et je me mets à la place de l'utilisateur." },
  { n: '02', k: 'Structurer', v: "Je clarifie le contenu et les données avant d'écrire la moindre ligne de code." },
  { n: '03', k: 'Concevoir', v: 'Je dessine une interface claire, guidée par un usage réel.' },
  { n: '04', k: 'Développer', v: 'Je construis du frontend au backend, simplement et proprement.' },
  { n: '05', k: 'Tester', v: "Je vérifie au fur et à mesure, sur de vrais scénarios d'usage." },
  { n: '06', k: 'Améliorer', v: "J'apprends des retours et j'itère sans casser ce qui fonctionne." },
]

/**
 * Approche — méthode en 6 étapes.
 * Cartes numérotées : chiffre fantôme, spotlight au survol, entrée en vague.
 */
export default function Approach() {
  return (
    <section id="approche" className="relative py-24 md:py-32">
      <div className="mx-auto w-full max-w-6xl px-6 md:px-10">
        <SectionHeading label="Approche" title="Comment je travaille" />

        <GroupReveal className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" stagger={0.07}>
          {STEPS.map((s) => (
            <Card key={s.n} hover spotlight className="p-6 md:p-7">
              {/* chiffre fantôme en fond */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -top-3 right-3 font-display text-[6.5rem] font-semibold leading-none opacity-[0.05] select-none"
              >
                {s.n}
              </span>

              <span className="font-mono text-[11px] uppercase tracking-[0.2em] t-accent">Étape {s.n}</span>
              <h3 className="mt-3 font-display text-2xl font-semibold t-text">{s.k}</h3>
              <p className="mt-2 max-w-[38ch] text-[15px] leading-relaxed t-text2">{s.v}</p>
            </Card>
          ))}
        </GroupReveal>
      </div>
    </section>
  )
}
