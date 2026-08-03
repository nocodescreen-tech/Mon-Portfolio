import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { profile } from '../data/content'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

const STATUS = {
  idle: 'idle',
  sending: 'sending',
  success: 'success',
  error: 'error',
}

/**
 * Formulaire de contact VALIDE :
 * - validation client (nom, email, message, honeypot anti-spam)
 * - envoi POST vers /api/contact (fonction serverless Vercel)
 * - repli mailto si l'API est injoignable (dev local)
 */
export default function ContactForm() {
  const [status, setStatus] = useState(STATUS.idle)
  const [errors, setErrors] = useState({})
  const [message, setMessage] = useState('')

  const validate = (fd) => {
    const errs = {}
    const nom = (fd.get('nom') || '').trim()
    const email = (fd.get('email') || '').trim()
    const msg = (fd.get('message') || '').trim()
    if (nom.length < 2) errs.nom = 'Votre nom est requis (2 caractères minimum).'
    if (!EMAIL_RE.test(email)) errs.email = 'Adresse email invalide.'
    if (msg.length < 10) errs.message = 'Un message d’au moins 10 caractères, s’il vous plaît.'
    return errs
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)

    // Honeypot : un bot remplit ce champ caché
    if (fd.get('website')) return

    const errs = validate(fd)
    setErrors(errs)
    if (Object.keys(errs).length > 0) return

    setStatus(STATUS.sending)
    setMessage('')

    const payload = {
      nom: fd.get('nom').trim(),
      email: fd.get('email').trim(),
      sujet: (fd.get('sujet') || '').trim(),
      message: fd.get('message').trim(),
    }

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (res.status === 429) {
        setStatus(STATUS.error)
        setMessage('Trop de messages envoyés récemment. Réessayez dans quelques minutes.')
        return
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setStatus(STATUS.success)
      e.currentTarget.reset()
      setMessage('Message envoyé ! Je reviens vers vous très vite. ✨')
    } catch (err) {
      // Repli : l'API n'est pas déployée ici (dev local) → mailto pré-rempli
      const subject = encodeURIComponent(`Portfolio — ${payload.sujet || 'Nouveau projet'}`)
      const body = encodeURIComponent(`Nom : ${payload.nom}\nEmail : ${payload.email}\n\n${payload.message}`)
      window.location.href = `mailto:${profile.email}?subject=${subject}&body=${body}`
      setStatus(STATUS.success)
      setMessage("Votre messagerie s'ouvre avec le message pré-rempli — il ne reste qu'à l'envoyer.")
    }
  }

  const fieldClass = (name) =>
    `w-full corner-cut-sm border bg-ink px-4 py-3.5 text-[14px] text-mist placeholder:text-fog/60 outline-none transition-colors focus:border-brass ${
      errors[name] ? 'form-field-error' : 'border-brass/20'
    }`

  return (
    <form className="mt-7 space-y-4" onSubmit={onSubmit} noValidate>
      {/* honeypot anti-spam — invisible pour les humains */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="hidden"
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <input name="nom" required placeholder="Votre nom" className={fieldClass('nom')} />
          {errors.nom && <p className="form-error-msg" role="alert">{errors.nom}</p>}
        </div>
        <div>
          <input name="email" required type="email" placeholder="Votre email" className={fieldClass('email')} />
          {errors.email && <p className="form-error-msg" role="alert">{errors.email}</p>}
        </div>
      </div>
      <input name="sujet" placeholder="Sujet (optionnel)" className={fieldClass('sujet')} />
      <div>
        <textarea
          name="message"
          required
          rows={4}
          placeholder="Votre message…"
          className={`${fieldClass('message')} resize-none`}
        />
        {errors.message && <p className="form-error-msg" role="alert">{errors.message}</p>}
      </div>

      <AnimatePresence>
        {status === STATUS.success && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-3 rounded-sm border border-[#4fbf8f]/40 bg-[#4fbf8f]/10 px-4 py-3 text-[13px] text-[#8fe0b8]"
            role="status"
          >
            <i className="fa-solid fa-circle-check" aria-hidden="true" />
            {message}
          </motion.div>
        )}
        {status === STATUS.error && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-3 rounded-sm border border-[#e0704f]/40 bg-[#e0704f]/10 px-4 py-3 text-[13px] text-[#ff9d7a]"
            role="alert"
          >
            <i className="fa-solid fa-triangle-exclamation" aria-hidden="true" />
            Une erreur est survenue. Réessayez ou écrivez-moi directement par email.
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <button
          type="submit"
          disabled={status === STATUS.sending}
          className="corner-cut inline-flex items-center gap-3 bg-brass px-7 py-3.5 font-mono text-sm font-semibold text-ink transition-all hover:bg-brass-soft hover:shadow-[0_0_32px_rgba(240,180,41,0.4)] disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {status === STATUS.sending ? (
            <>
              <i className="fa-solid fa-circle-notch fa-spin" aria-hidden="true" />
              Envoi en cours…
            </>
          ) : (
            <>
              Envoyer le message
              <i className="fa-solid fa-paper-plane" aria-hidden="true" />
            </>
          )}
        </button>
        <p className="font-mono text-[11px] text-fog/70">
          <i className="fa-solid fa-shield-halved mr-1.5 text-brass/70" aria-hidden="true" />
          Anti-spam + validation inclus
        </p>
      </div>
    </form>
  )
}
