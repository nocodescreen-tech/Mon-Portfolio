import ScrollProgress from './components/ScrollProgress'
import SmoothScroll from './components/SmoothScroll'
import SplashCursor from './components/SplashCursor'
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
        {/* Overlay fluide — suit le curseur (souris + tactile), au-dessus du contenu, clics traversants */}
        <SplashCursor />
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
