// Gestionnaire de pointeurs — window-level, 100% passifs, zéro allocation
// et zéro calcul par événement : les handlers ne font qu'écrire la position
// brute dans un slot réutilisé. Toutes les conversions (texcoords, deltas,
// correction d'aspect) sont faites au moment du consume, une fois par frame
// maximum — coalescing naturel des événements pointeur.

const TOUCH_SLOTS = 3 // multi-touch simultané plafonné (perf mobile)

export function createPointerInput({ onActivity }) {
  // slot 0 : souris ; 1..3 : touch. Préalloués une seule fois.
  const slots = []
  for (let i = 0; i < 1 + TOUCH_SLOTS; i++) {
    slots.push({
      active: false,
      id: -1,
      isMouse: i === 0,
      // positions brutes en px CSS (converties au consume avec les dims à jour)
      x: 0,
      y: 0,
      px: 0,
      py: 0,
      moved: false,
      burst: false, // pointerdown → éclaboussure consommée au frame suivant
      down: false,
      pendingAnchor: false, // réveil : ignorer le delta de la 1re frame
      color: { r: 0, g: 0, b: 0 },
      colorAt: 0,
    })
  }

  function findTouchSlot(id) {
    for (let i = 1; i < slots.length; i++) {
      if (slots[i].active && slots[i].id === id) return slots[i]
    }
    return null
  }

  function acquireTouchSlot(id) {
    const existing = findTouchSlot(id)
    if (existing) return existing
    for (let i = 1; i < slots.length; i++) {
      if (!slots[i].active) {
        const s = slots[i]
        s.active = true
        s.id = id
        return s
      }
    }
    return null
  }

  function onPointerDown(e) {
    let s
    if (e.pointerType === 'mouse') {
      s = slots[0]
      s.active = true
    } else {
      s = acquireTouchSlot(e.pointerId)
    }
    if (!s) return
    s.down = true
    s.x = e.clientX
    s.y = e.clientY
    s.px = s.x
    s.py = s.y
    s.moved = false
    s.burst = true
    onActivity()
  }

  function onPointerMove(e) {
    let s
    if (e.pointerType === 'mouse') {
      s = slots[0]
      s.active = true
    } else {
      s = findTouchSlot(e.pointerId)
    }
    if (!s) return
    s.x = e.clientX
    s.y = e.clientY
    s.moved = true
    onActivity()
  }

  function onPointerUp(e) {
    const s = e.pointerType === 'mouse' ? slots[0] : findTouchSlot(e.pointerId)
    if (!s) return
    s.down = false
    if (e.pointerType !== 'mouse') {
      s.active = false
      s.id = -1
    }
  }

  function attach() {
    window.addEventListener('pointerdown', onPointerDown, { passive: true })
    window.addEventListener('pointermove', onPointerMove, { passive: true })
    window.addEventListener('pointerup', onPointerUp, { passive: true })
    window.addEventListener('pointercancel', onPointerUp, { passive: true })
  }

  function detach() {
    window.removeEventListener('pointerdown', onPointerDown)
    window.removeEventListener('pointermove', onPointerMove)
    window.removeEventListener('pointerup', onPointerUp)
    window.removeEventListener('pointercancel', onPointerUp)
  }

  // Au réveil, les positions précédentes datent de la veille :
  // la première frame ne doit pas générer de delta (sinon trainée
  // fantôme d'un bout à l'autre de l'écran).
  function reanchor() {
    for (let i = 0; i < slots.length; i++) slots[i].pendingAnchor = true
  }

  return { slots, attach, detach, reanchor }
}
