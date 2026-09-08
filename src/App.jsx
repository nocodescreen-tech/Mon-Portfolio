import ScrollProgress from './components/ScrollProgress'
import SmoothScroll from './components/SmoothScroll'
import Aurora from './components/Aurora'
import Nav from './components/Nav'
import Opening from './components/Opening'
import Marquee from './components/Marquee'
import Projects from './components/Projects'
import CaseStudy from './components/CaseStudy'
import Approach from './components/Approach'
import Services from './components/Services'
import Skills from './components/Skills'
import Journey from './components/Journey'
import About from './components/About'
import Contact from './components/Contact'
import Footer from './components/Footer'

/**
 * Portfolio — « Digital product studio ».
 * Direction : minimal, précis, calme, technologique mais humain.
 * Thème sombre par défaut + clair (toggle localStorage).
 * Une scène 3D unique (R3F, lazy, fallback mobile).
 * GSAP (scroll) + Motion (interactions) + Lenis (scroll fluide).
 */
export default function App() {
  return (
    <SmoothScroll>
      <div className="relative min-h-screen" style={{ background: 'var(--bg)', color: 'var(--text)' }}>
        <a href="#contenu" className="skip-link">Aller au contenu</a>
        <ScrollProgress />
        <Aurora className="fixed inset-0 z-0" />
        <Nav />
        <main id="contenu">
          <Opening />
          <Marquee />
          <Projects />
          <CaseStudy />
          <Approach />
          <Services />
          <Skills />
          <Journey />
          <About />
          <Contact />
        </main>
        <Footer />
      </div>
    </SmoothScroll>
  )
}
