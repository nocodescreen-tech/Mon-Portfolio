import { useEffect, useState, useCallback } from 'react'

/* ============================================================
   Admin — boîte de réception privée (route #/admin).
   SPA autonome. AUTH PAR COOKIE httpOnly : le client ne stocke
   ni n'affiche JAMAIS de token (rien dans localStorage, aucune
   valeur sensible dans le JS/devtools). `credentials: 'include'`
   fait envoyer le cookie automatiquement par le navigateur.
   ============================================================ */

const badge = {
  nouveau: 'bg-[#ff5b2e]/15 text-[#ff8a4d] border-[#ff5b2e]/30',
  lu: 'bg-white/5 text-white/60 border-white/10',
  repondu: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  archive: 'bg-white/5 text-white/40 border-white/10',
}

function fmt(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
}

/** fetch same-origin, cookies inclus, sans aucun token dans le corps/headers. */
async function j(method, url, body) {
  const headers = { 'Content-Type': 'application/json' }
  const res = await fetch(url, { method, headers, credentials: 'include', body: body ? JSON.stringify(body) : undefined })
  const data = await res.json().catch(() => ({}))
  return { ok: res.ok, status: res.status, data }
}

/* ————— Écran login ————— */
function Login({ onLogin }) {
  const [email, setEmail] = useState('')
  const [pw, setPw] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true); setErr('')
    const r = await j('POST', '/api/admin/login', { email, motDePasse: pw })
    setBusy(false)
    if (!r.ok) {
      if (r.status === 429) return setErr('Trop de tentatives. Réessayez dans 15 minutes.')
      return setErr(r.data.error || 'Échec de connexion.')
    }
    onLogin(r.data.admin)
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-6" style={{ background: 'var(--bg)' }}>
      <form onSubmit={submit} className="w-full max-w-sm space-y-5 rounded-2xl border p-8 t-surface t-border" style={{ boxShadow: 'var(--shadow)' }}>
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.25em] t-text3">Espace privé</p>
          <h1 className="mt-1 font-display text-2xl font-semibold t-text">Boîte de réception</h1>
        </div>
        <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" autoComplete="username" required placeholder="Email" className="w-full rounded-xl border px-4 py-3 text-[15px] t-text placeholder:text-[var(--text-3)]" style={{ background: 'var(--bg-3)', borderColor: 'var(--border)' }} />
        <input value={pw} onChange={(e) => setPw(e.target.value)} type="password" autoComplete="current-password" required placeholder="Mot de passe" className="w-full rounded-xl border px-4 py-3 text-[15px] t-text placeholder:text-[var(--text-3)]" style={{ background: 'var(--bg-3)', borderColor: 'var(--border)' }} />
        {err && <p className="text-sm" style={{ color: 'var(--coral)' }}>{err}</p>}
        <button type="submit" disabled={busy} className="w-full rounded-full py-3 text-[15px] font-medium text-white transition-all duration-300 disabled:opacity-60" style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-2))' }}>
          {busy ? 'Connexion…' : 'Se connecter'}
        </button>
        <p className="text-center font-mono text-[11px] t-text3">René Descartes · Portfolio</p>
      </form>
    </div>
  )
}

/* ————— Détail : un message + zone réponse ————— */
function Thread({ msg, onBack, onUpdate, onDel, onReply }) {
  const [reponse, setReponse] = useState('')
  const [busy, setBusy] = useState(false)
  const [msgTx, setMsgTx] = useState('')

  const submitReply = async () => {
    if (reponse.trim().length < 5) return
    setBusy(true); setMsgTx('')
    const r = await onReply(msg.id, reponse)
    setBusy(false)
    if (r.ok) { setMsgTx('Réponse envoyée ✓'); setReponse(''); onUpdate(r.data?.message || { ...msg, statut: 'repondu' }) }
    else setMsgTx(r.data?.error || 'Échec de l’envoi.')
  }

  return (
    <div className="space-y-5">
      <button onClick={onBack} className="inline-flex items-center gap-2 text-sm t-text3 hover:text-[var(--accent)] transition-colors">← Retour</button>
      <div className="rounded-2xl border p-6 t-surface t-border">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-display text-xl font-semibold t-text">{msg.sujet}</h2>
            <p className="mt-1 text-sm t-text2"><strong className="t-text">{msg.nom}</strong> · <a href={`mailto:${msg.email}`} className="text-[var(--accent)]">{msg.email}</a></p>
          </div>
          <span className={`rounded-full border px-3 py-1 text-xs font-medium ${badge[msg.statut] || badge.lu}`}>{msg.statut}</span>
        </div>
        <p className="mt-5 whitespace-pre-wrap leading-relaxed t-text" style={{ fontSize: 15 }}>{msg.message}</p>
        <p className="mt-4 font-mono text-[11px] t-text3">Reçu le {fmt(msg.cree_le)}</p>
      </div>

      <div className="rounded-2xl border p-6 t-surface t-border">
        <label className="block font-mono text-[11px] uppercase tracking-wider t-text3">Répondre par email</label>
        <textarea value={reponse} onChange={(e) => setReponse(e.target.value)} rows={5} placeholder="Écrivez votre réponse…" className="mt-3 w-full resize-none rounded-xl border px-4 py-3 text-[15px] t-text placeholder:text-[var(--text-3)] focus:outline-none" style={{ background: 'var(--bg-3)', borderColor: 'var(--border)' }} />
        {msgTx && <p className="mt-2 text-sm" style={{ color: msgTx.includes('✓') ? '#4ade80' : 'var(--coral)' }}>{msgTx}</p>}
        <div className="mt-4 flex flex-wrap gap-3">
          <button onClick={submitReply} disabled={busy} className="rounded-full px-6 py-2.5 text-sm font-medium text-white transition disabled:opacity-60" style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-2))' }}>Envoyer la réponse</button>
          <button onClick={() => onUpdate({ ...msg, favori: !msg.favori })} className="rounded-full border px-5 py-2.5 text-sm t-text hover:border-[var(--accent)] transition-colors t-border">{msg.favori ? '★ Retirer des favoris' : '☆ Marquer en favori'}</button>
          <button onClick={() => onUpdate({ ...msg, statut: 'lu' })} className="rounded-full border px-5 py-2.5 text-sm t-text hover:border-[var(--accent)] transition-colors t-border">Marquer lu</button>
          <button onClick={() => onDel(msg.id)} className="ml-auto rounded-full border px-5 py-2.5 text-sm transition-colors" style={{ color: 'var(--coral)', borderColor: 'var(--border)' }}>Supprimer</button>
        </div>
      </div>
    </div>
  )
}

/* ————— Liste des messages ————— */
function Inbox({ messages, setActive, onUpdate, onDel }) {
  if (!messages.length) {
    return (
      <div className="rounded-2xl border p-10 text-center t-surface t-border">
        <p className="font-display text-lg t-text">Aucun message</p>
        <p className="mt-1 text-sm t-text3">La boîte de réception est vide.</p>
      </div>
    )
  }
  return (
    <div className="space-y-3">
      {messages.map((m) => (
        <div key={m.id} onClick={() => setActive(m.id)} className={`group flex cursor-pointer items-center gap-4 rounded-xl border p-4 transition-all t-surface t-border hover:border-[var(--accent)]/50 ${m.statut === 'nouveau' ? 'border-[#ff5b2e]/40' : ''}`}>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              {m.statut === 'nouveau' && <span className="h-2 w-2 shrink-0 rounded-full bg-[#ff5b2e]" />}
              <p className="truncate text-[15px] font-medium t-text">{m.nom}</p>
              {m.favori && <span className="text-sm text-[#ffb454]">★</span>}
              <span className="ml-auto font-mono text-[11px] t-text3">{fmt(m.cree_le)}</span>
            </div>
            <p className="mt-0.5 truncate text-sm t-text2">{m.sujet} — <span className="t-text3">{m.message}</span></p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <span className={`hidden rounded-full border px-2.5 py-0.5 text-[11px] sm:inline ${badge[m.statut] || badge.lu}`}>{m.statut}</span>
            <button onClick={(e) => { e.stopPropagation(); onUpdate({ ...m, favori: !m.favori }) }} className="opacity-0 transition-opacity group-hover:opacity-100 text-sm">{m.favori ? '★' : '☆'}</button>
            <button onClick={(e) => { e.stopPropagation(); onDel(m.id) }} className="opacity-0 transition-opacity group-hover:opacity-100" style={{ color: 'var(--coral)' }}>✕</button>
          </div>
        </div>
      ))}
      {messages.length >= 50 && <p className="pt-2 text-center font-mono text-xs t-text3">Limite : 50 affichés.</p>}
    </div>
  )
}

/* ————— Coquille (shell) avec en-tête + navigation ————— */
function Shell({ admin, view, setView, setActive, onLogout, children }) {
  const nav = [
    { id: 'inbox', label: 'Boîte de réception' },
    { id: 'dashboard', label: 'Tableau de bord' },
  ]
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <header className="sticky top-0 z-20 border-b backdrop-blur" style={{ background: 'color-mix(in srgb, var(--bg) 80%, transparent)', borderColor: 'var(--border)' }}>
        <div className="mx-auto flex max-w-5xl items-center gap-6 px-6 py-4">
          <span className="font-display text-lg font-semibold t-text">René<span style={{ color: 'var(--accent)' }}>.</span></span>
          <nav className="flex items-center gap-1">
            {nav.map((n) => (
              <button key={n.id} onClick={() => { setView(n.id); setActive(null) }} className={`rounded-full px-4 py-1.5 text-sm transition-colors ${view === n.id ? 't-text' : 't-text3 hover:t-text'}`} style={view === n.id ? { background: 'var(--surface-2)' } : {}}>{n.label}</button>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-3">
            <span className="font-mono text-xs t-text3">{admin?.email}</span>
            <button onClick={onLogout} className="rounded-full border px-4 py-1.5 text-sm t-text hover:border-[var(--accent)] transition-colors t-border">Déconnexion</button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-8">{children}</main>
    </div>
  )
}

/* ————— Tableau de bord ————— */
function Dashboard({ stats }) {
  const cards = [
    { label: 'Total', val: stats?.total ?? 0 },
    { label: 'Nouveaux', val: stats?.nouveaux ?? 0 },
    { label: 'Favoris', val: stats?.favoris ?? 0 },
    { label: 'Répondus', val: stats?.repondus ?? 0 },
  ]
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-2xl border p-5 t-surface t-border">
            <p className="font-mono text-[11px] uppercase tracking-wider t-text3">{c.label}</p>
            <p className="mt-1 font-display text-3xl font-semibold t-text">{c.val}</p>
          </div>
        ))}
      </div>
      <div className="rounded-2xl border p-6 t-surface t-border">
        <p className="font-mono text-[11px] uppercase tracking-wider t-text3">Activité — 7 derniers jours</p>
        <div className="mt-4 flex h-32 items-end gap-2">
          {(stats?.dernier7 || []).map((d) => (
            <div key={d.jour} className="flex flex-1 flex-col items-center justify-end gap-1">
              <span className="text-xs font-medium t-text">{d.n}</span>
              <div title={d.jour} className="w-full rounded-t" style={{ height: Math.max(6, d.n * 12), background: `linear-gradient(180deg, var(--accent), var(--accent-2))` }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ————— Point d'entrée ————— */
export default function AdminApp() {
  const [admin, setAdmin] = useState(null)
  const [view, setView] = useState('inbox')
  const [messages, setMessages] = useState([])
  const [stats, setStats] = useState(null)
  const [active, setActive] = useState(null)
  const [authFailed, setAuthFailed] = useState(false)

  const load = useCallback(async () => {
    // Si cookie valide → messages + stats ; sinon 401 → écran de connexion.
    const r = await j('GET', '/api/admin/messages?limite=50')
    if (r.status === 401) { setAuthFailed(true); setAdmin(null); return }
    if (r.ok) setMessages(r.data.messages)
    const s = await j('GET', '/api/admin/stats')
    if (s.status === 401) { setAuthFailed(true); setAdmin(null); return }
    if (s.ok) setStats(s.data.stats)
  }, [])

  // Vérifie la session au montage (cookie envoyé automatiquement).
  useEffect(() => { load() }, [load])

  const patch = async (m) => {
    const r = await j('PATCH', '/api/admin/messages', { id: m.id, statut: m.statut, favori: m.favori })
    if (r.ok) setMessages((prev) => prev.map((x) => (x.id === m.id ? r.data.message : x)))
    if (r.status === 401) { setAuthFailed(true); setAdmin(null) }
    return r
  }
  const del = async (id) => {
    const r = await j('DELETE', '/api/admin/messages', { id })
    if (r.ok) { setMessages((prev) => prev.filter((x) => x.id !== id)); if (active === id) setActive(null) }
    return r
  }
  const reply = async (id, reponse) => {
    const r = await j('POST', '/api/admin/repondre', { id, reponse })
    if (r.ok) {
      const mm = await j('GET', `/api/admin/messages?id=${id}`)
      if (mm.data.message) setMessages((prev) => prev.map((x) => (x.id === id ? mm.data.message : x)))
    }
    return r
  }

  // Connexion établie (cookie posé) → recharger.
  const handleLogin = () => { setAuthFailed(false); setAdmin({ ok: true }); load() }
  const logout = async () => { await j('POST', '/api/admin/logout'); setAuthFailed(true); setAdmin(null); setMessages([]) }

  if (authFailed || !admin) return <Login onLogin={handleLogin} />

  const current = messages.find((m) => m.id === active) || null

  return (
    <Shell admin={{ email: 'admin' }} view={view} setView={setView} setActive={setActive} onLogout={logout}>
      {view === 'dashboard' && <Dashboard stats={stats} />}
      {view === 'inbox' && current ? (
        <Thread msg={current} onBack={() => setActive(null)} onUpdate={patch} onDel={del} onReply={reply} />
      ) : (
        <Inbox messages={messages} setActive={setActive} onUpdate={patch} onDel={del} />
      )}
    </Shell>
  )
}