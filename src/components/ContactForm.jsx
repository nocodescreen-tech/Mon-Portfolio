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
    if (nom.length < 2) errs.nom = 'Dites-moi au moins comment vous vous appelez.'
    if (!EMAIL_RE.test(email)) errs.email = 'Cette adresse email ne semble pas valide.'
    if (msg.length < 10) errs.message = 'Dites-m\u2019en un peu plus sur votre projet — quelques lignes suffisent.'
    return errs
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    const formEl = e.currentTarget
    const fd = new FormData(formEl)

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
        setMessage('Vous avez envoyé beaucoup de messages d\u2019un coup. Reposez-vous quelques minutes et réessayez.')
        return
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setStatus(STATUS.success)
      formEl.reset()
      setMessage('Merci ! Votre message est bien parti — je vous réponds rapidement.')
    } catch {
      // Repli : l'API n'est pas déployée ici (dev local) → mailto pré-rempli
      const subject = encodeURIComponent(`Portfolio — ${payload.sujet || 'Nouveau projet'}`)
      const body = encodeURIComponent(`Nom : ${payload.nom}\nEmail : ${payload.email}\n\n${payload.message}`)
      window.location.href = `mailto:${profile.email}?subject=${subject}&body=${body}`
      setStatus(STATUS.success)
      setMessage("Votre messagerie s'est ouverte avec le message pré-rempli — il ne reste qu'à l'envoyer.")
    }
  }

  const fieldClass = (name) =>
    `w-full rounded-xl border px-4 py-3.5 text-[15px] t-text placeholder:text-[var(--text-3)] ${
      errors[name] ? 'form-field-error' : 't-border'
    }`

  return (
    <form className="contact-form mt-7 space-y-4" onSubmit={onSubmit} noValidate>
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
          <input name="nom" required placeholder="Comment vous appelez-vous ?" className={fieldClass('nom')} />
          {errors.nom && <p className="form-error-msg" role="alert">{errors.nom}</p>}
        </div>
        <div>
          <input name="email" required type="email" placeholder="Où puis-je vous répondre ?" className={fieldClass('email')} />
          {errors.email && <p className="form-error-msg" role="alert">{errors.email}</p>}
        </div>
      </div>
      <input name="sujet" placeholder="Le sujet (facultatif)" className={fieldClass('sujet')} />
      <div>
        <textarea
          name="message"
          required
          rows={4}
          placeholder="Racontez-moi votre projet…"
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
            className="form-msg form-msg-success"
            role="status"
          >
            <i className="fa-solid fa-circle-check" aria-hidden="true" />
            <span>{message}</span>
          </motion.div>
        )}
        {status === STATUS.error && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="form-msg form-msg-error"
            role="alert"
          >
            <i className="fa-solid fa-triangle-exclamation" aria-hidden="true" />
            <span>Une erreur est survenue. Réessayez ou écrivez-moi directement par email.</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <button
          type="submit"
          disabled={status === STATUS.sending}
          className="inline-flex items-center justify-center gap-3 rounded-full px-7 py-3.5 text-[15px] font-medium text-white transition-all duration-300 hover:-translate-y-0.5 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
          style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-2))' }}
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
        <p className="font-mono text-xs" style={{ color: 'var(--text-3)' }}>Réponse rapide, sans spam.</p>
      </div>
    </form>
  )
}
