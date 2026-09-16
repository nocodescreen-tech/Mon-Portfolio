import { useEffect, useRef } from 'react'

const TAU = Math.PI * 2

/** Rotation d'un point 3D autour de X puis Y. */
function rot(p, rx, ry) {
  let { x, y, z } = p
  const cosX = Math.cos(rx), sinX = Math.sin(rx)
  let y1 = y * cosX - z * sinX
  let z1 = y * sinX + z * cosX
  const cosY = Math.cos(ry), sinY = Math.sin(ry)
  let x2 = x * cosY + z1 * sinY
  let z2 = -x * sinY + z1 * cosY
  return { x: x2, y: y1, z: z2 }
}

/**
 * HeroSceneCanvas — « faux » 3D en Canvas 2D (aucune lib, ~10 kB).
 * Un tore en points, un anneau pulsant et des satellites orbitent ;
 * l'ensemble suit le curseur et recule très légèrement au scroll.
 * Tailles en pixels fixes (pas multipliées par l'échelle de projection).
 */
export default function HeroSceneCanvas() {
  const wrapRef = useRef(null)
  const canvasRef = useRef(null)

  useEffect(() => {
    const wrap = wrapRef.current
    const canvas = canvasRef.current
    if (!wrap || !canvas) return
    const ctx = canvas.getContext('2d')

    let W = 0, H = 0, dpr = 1
    let raf = 0
    const pointer = { x: 0, y: 0 }
    let scrollY = 0

    // tore en grille de points (coords 3D unitaires)
    const R = 1.15, r = 0.4
    const NU = 46, NV = 24
    const torus = []
    for (let i = 0; i < NU; i++) {
      for (let j = 0; j < NV; j++) {
        const u = (i / NU) * TAU
        const v = (j / NV) * TAU
        torus.push({
          x: (R + r * Math.cos(v)) * Math.cos(u),
          y: r * Math.sin(v),
          z: (R + r * Math.cos(v)) * Math.sin(u),
        })
      }
    }
    const sats = [0, 1, 2].map((i) => ({ phase: (i / 3) * TAU }))

    const resize = () => {
      const rect = wrap.getBoundingClientRect()
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      W = rect.width
      H = rect.height
      canvas.width = W * dpr
      canvas.height = H * dpr
      canvas.style.width = `${W}px`
      canvas.style.height = `${H}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const onPointer = (e) => {
      const rect = wrap.getBoundingClientRect()
      pointer.x = ((e.clientX - rect.left) / rect.width - 0.5) * 2
      pointer.y = ((e.clientY - rect.top) / rect.height - 0.5) * 2
    }
    const onScroll = () => { scrollY = window.scrollY }

    resize()
    window.addEventListener('resize', resize)
    wrap.addEventListener('pointermove', onPointer, { passive: true })
    window.addEventListener('scroll', onScroll, { passive: true })

    const dist = 4.4

    const draw = (t) => {
      ctx.clearRect(0, 0, W, H)
      const cx = W / 2
      const cy = H / 2 + 10
      // échelle de projection = pixels par unité 3D
      const f = Math.min(W, H) * 0.42

      const ry = t * 0.5
      const rx = 0.45 + pointer.y * 0.3
      const rz = pointer.x * 0.22
      const zoom = 1 - Math.min(scrollY * 0.0012, 0.35)

      const project = (p) => {
        let q = rot(p, rx, ry)
        const c = Math.cos(rz), s = Math.sin(rz)
        const qx = q.x * c - q.y * s
        const qy = q.x * s + q.y * c
        const scale = (f * zoom) / (q.z + dist)
        return { x: cx + qx * scale, y: cy - qy * scale, depth: (q.z + dist) / (dist + 1.6) }
      }

      // anneau (dans le plan, pulse)
      const ringR = 1.7 * (1 + Math.sin(t * 1.4) * 0.04)
      const ringPts = []
      for (let a = 0; a <= 72; a++) {
        ringPts.push(project({ x: Math.cos(a / 72 * TAU) * ringR, y: Math.sin(a / 72 * TAU) * ringR, z: 0 }))
      }
      ctx.strokeStyle = 'rgba(255,138,77,0.55)'
      ctx.lineWidth = 2
      ctx.beginPath()
      ringPts.forEach((pt, i) => (i === 0 ? ctx.moveTo(pt.x, pt.y) : ctx.lineTo(pt.x, pt.y)))
      ctx.stroke()

      // satellites orbitaux (tailles en pixels fixes)
      sats.forEach((sat) => {
        const ang = t * 0.9 + sat.phase
        const pos = project({
          x: Math.cos(ang) * 2.2,
          y: Math.sin(ang * 0.7) * 0.6,
          z: Math.sin(ang) * 2.2,
        })
        const glow = 10
        const g = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, glow * 2)
        g.addColorStop(0, 'rgba(255,138,77,0.95)')
        g.addColorStop(1, 'rgba(255,138,77,0)')
        ctx.fillStyle = g
        ctx.beginPath()
        ctx.arc(pos.x, pos.y, glow * 2, 0, TAU)
        ctx.fill()
        ctx.fillStyle = '#ffc46b'
        ctx.beginPath()
        ctx.arc(pos.x, pos.y, 4, 0, TAU)
        ctx.fill()
      })

      // tore en points (taille/opacité liées à la profondeur, pas à l'échelle)
      torus.forEach((p) => {
        const pt = project(p)
        const near = Math.max(0, Math.min(1, 1 - pt.depth)) // plus proche → plus clair
        const size = 1.1 + near * 1.4
        ctx.fillStyle = `rgba(255,${Math.round(110 + near * 40)},${Math.round(70 + near * 20)},${0.3 + near * 0.7})`
        ctx.beginPath()
        ctx.arc(pt.x, pt.y, size, 0, TAU)
        ctx.fill()
      })

      // cœur flamme qui pulse (rayon en pixels fixes)
      const core = project({ x: 0, y: 0, z: 0 })
      const crad = 18 + Math.sin(t * 2) * 3
      const cg = ctx.createRadialGradient(core.x, core.y, 0, core.x, core.y, crad * 3)
      cg.addColorStop(0, 'rgba(255,91,46,0.85)')
      cg.addColorStop(1, 'rgba(255,91,46,0)')
      ctx.fillStyle = cg
      ctx.beginPath()
      ctx.arc(core.x, core.y, crad * 3, 0, TAU)
      ctx.fill()

      raf = requestAnimationFrame(draw)
    }

    raf = requestAnimationFrame(draw)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      window.removeEventListener('scroll', onScroll)
      wrap.removeEventListener('pointermove', onPointer)
    }
  }, [])

  return (
    <div ref={wrapRef} className="relative h-full w-full" aria-hidden="true">
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  )
}
