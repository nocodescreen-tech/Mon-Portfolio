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

function commit(theme) {
  if (typeof window === 'undefined') return
  cachedTheme = theme
  try {
    window.localStorage.setItem(KEY, theme)
  } catch { /* ignore */ }
  requestAnimationFrame(() => {
    document.documentElement.setAttribute('data-theme', theme)
  })
  // Inutile de poser/retirer une classe d'animation : le changement est instantané.
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
    commit(theme === 'dark' ? 'light' : 'dark')
  }, [theme])

  return { theme, toggle }
}
