import { profile } from '../data/content'

export default function Footer() {
  return (
    <footer className="border-t border-brass/10 bg-ink-2/50">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-6 px-6 py-10 md:flex-row md:justify-between md:px-10">
        <div className="flex items-baseline gap-3">
          <span className="font-display italic font-bold text-2xl leading-none text-brass">RD</span>
          <div className="text-left">
            <div className="font-display text-mist">René Descartes</div>
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-fog">Full Stack · UI/UX · RDC</div>
          </div>
        </div>

        <p className="flex items-center gap-1.5 text-center font-mono text-[12px] text-fog">
          Conçu avec <i className="fa-solid fa-heart text-brass" aria-hidden="true" /> et méthode à Matadi —{' '}
          {new Date().getFullYear()}
        </p>

        <a
          href="#top"
          className="corner-cut-sm inline-flex items-center gap-2 border border-brass/25 px-4 py-2.5 font-mono text-[12px] text-brass transition-all hover:bg-brass hover:text-ink"
        >
          Retour en haut <i className="fa-solid fa-arrow-up text-[11px]" aria-hidden="true" />
        </a>
      </div>
      <div className="border-t border-brass/8 py-3 text-center font-mono text-[11px] text-fog/60">
        {profile.email} · {profile.phone}
      </div>
    </footer>
  )
}
