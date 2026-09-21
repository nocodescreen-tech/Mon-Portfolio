import ScrollProgress from './components/ScrollProgress'
import SmoothScroll from './components/SmoothScroll'
import FadeSection from './components/FadeSection'
import Nav from './components/Nav'
import Opening from './components/Opening'
import Marquee from './components/Marquee'
import ProjectsCarousel from './components/ProjectsCarousel'
import CaseStudy from './components/CaseStudy'
import Approach from './components/Approach'
import Services from './components/Services'
import Skills from './components/Skills'
import Journey from './components/Journey'
import About from './components/About'
import Contact from './components/Contact'
import Footer from './components/Footer'
import { lazy, Suspense, useEffect, useState } from 'react'

// Admin privé — chargé à la demande, route hash #/admin (pas d'impact sur le bundle public).
const AdminApp = lazy(() => import('./admin/AdminApp'))

// Overlay fluide — chunk séparé, monté une seule fois, et seulement après
// que le navigateur soit idle : zéro impact sur le bundle initial, le FCP
// et l'INP. (L'engine WebGL attend lui-même requestIdleCallback.)
const SplashCursor = lazy(() => import('./components/SplashCursor'))

/** Montage différé de SplashCursor : le site rend et devient interactif d'abord. */
function DeferredSplashCursor() {
  const [mount, setMount] = useState(false)
  useEffect(() => {
    if ('requestIdleCallback' in window) {
      const id = window.requestIdleCallback(() => setMount(true), { timeout: 3000 })
      return () => window.cancelIdleCallback(id)
    }
    const id = window.setTimeout(() => setMount(true), 1000)
    return () => window.clearTimeout(id)
  }, [])
  if (!mount) return null
  return (
    <Suspense fallback={null}>
      <SplashCursor quality="auto" />
    </Suspense>
  )
}

function useAdminRoute() {
  const [isAdmin, setIsAdmin] = useState(() => window.location.hash === '#/admin')
  useEffect(() => {
    const onHash = () => setIsAdmin(window.location.hash === '#/admin')
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])
  return isAdmin
}

/**
 * Portfolio — « Digital product studio ».
 * Direction : minimal, précis, calme, technologique mais humain.
 * Thème sombre par défaut + clair (toggle localStorage).
 * Une scène 3D unique (R3F, lazy, fallback mobile).
 * GSAP (scroll) + Motion (interactions) + Lenis (scroll fluide).
 */
export default function App() {
  const isAdmin = useAdminRoute()

  if (isAdmin) {
    return (
      <Suspense fallback={<div style={{ background: 'var(--bg)', minHeight: '100vh' }} />}>
        <AdminApp />
      </Suspense>
    )
  }

  return (
    <SmoothScroll>
      <div className="relative min-h-screen" style={{ background: 'var(--bg)', color: 'var(--text)' }}>
        <a href="#contenu" className="skip-link">Aller au contenu</a>
        <ScrollProgress />
        {/* Overlay fluide — suit le curseur (souris + tactile), au-dessus du
            contenu, clics traversants ; chunk lazy monté en idle (zéro impact FCP/INP) */}
        <DeferredSplashCursor />
        <Nav />
        <main id="contenu" className="relative z-[1]">
          <Opening />
          <FadeSection><Marquee /></FadeSection>
          <FadeSection><ProjectsCarousel /></FadeSection>
          <FadeSection><CaseStudy /></FadeSection>
          <FadeSection><Approach /></FadeSection>
          <FadeSection><Services /></FadeSection>
          <FadeSection><Skills /></FadeSection>
          <FadeSection><Journey /></FadeSection>
          <FadeSection><About /></FadeSection>
          <FadeSection><Contact /></FadeSection>
        </main>
        <Footer />
      </div>
    </SmoothScroll>
  )
}
