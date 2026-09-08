import { useCallback, useEffect, useState } from 'react'

const KEY = 'rene-portfolio-theme'

/** Lit le thème sauvegardé sinon défaut sombre. */
function readStored() {
  if (typeof window === 'undefined') return 'dark'
  try {
    const saved = window.localStorage.getItem(KEY)
    if (saved === 'light' || saved === 'dark') return saved
  } catch { /* ignore */ }
  return 'dark'
}

/* Store module : plusieurs composants peuvent partager le même thème. */
let cachedTheme = readStored()
const subscribers = new Set()

function commit(theme, animate = false) {
  if (typeof window === 'undefined') return
  cachedTheme = theme
  try {
    window.localStorage.setItem(KEY, theme)
  } catch { /* ignore */ }
  const root = document.documentElement
  root.setAttribute('data-theme', theme)

  if (animate) {
    // Transition fluide des couleurs au changement de thème uniquement.
    root.classList.add('theme-anim')
    clearTimeout(root._themeTimer)
    root._themeTimer = setTimeout(() => root.classList.remove('theme-anim'), 600)
  }
  subscribers.forEach((fn) => fn(theme))
}

export default function useTheme() {
  const [theme, setTheme] = useState(cachedTheme)

  useEffect(() => {
    subscribers.add(setTheme)
    commit(theme)
    return () => subscribers.delete(setTheme)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const toggle = useCallback(() => {
    commit(theme === 'dark' ? 'light' : 'dark', true)
  }, [theme])

  return { theme, toggle }
}
