const ITEMS = [
  'React.js', 'Node.js', 'Express.js', 'PostgreSQL', 'Tailwind CSS',
  'REST API', 'JWT', 'Google OAuth', 'RBAC', 'Git', 'Vercel', 'Railway',
  'UI/UX', 'Maintenance', 'Réseaux',
]

export default function Marquee() {
  const row = [...ITEMS, ...ITEMS]
  return (
    <div className="relative overflow-hidden border-y border-brass/12 bg-ink-2/70 py-4" aria-hidden="true">
      <div className="flex w-max animate-marquee items-center gap-8">
        {row.map((item, i) => (
          <span key={i} className="flex items-center gap-8 whitespace-nowrap">
            <span className="font-mono text-[13px] uppercase tracking-[0.18em] text-fog">{item}</span>
            <span className="h-1.5 w-1.5 rotate-45 bg-brass/60" />
          </span>
        ))}
      </div>
    </div>
  )
}
