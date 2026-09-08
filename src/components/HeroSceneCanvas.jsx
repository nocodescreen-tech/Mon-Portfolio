import * as THREE from 'three'
import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, Environment, ContactShadows } from '@react-three/drei'

/** Drift caméra : profondeur liée au scroll + léger parallax souris. */
function Rig() {
  useFrame((state) => {
    const scroll = window.scrollY || 0
    const { pointer } = state
    // zoom-out très lent quand on descend dans la page
    const targetZ = 6.4 + Math.min(scroll * 0.0006, 1.4)
    state.camera.position.z = THREE.MathUtils.lerp(state.camera.position.z, targetZ, 0.04)
    state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, pointer.x * 0.35, 0.04)
    state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, 0.2 - pointer.y * 0.25, 0.04)
    state.camera.lookAt(0, 0, 0)
  })
  return null
}

/** Objet produit — tore noué + anneau lumineux + petits satellites orbitaux. */
function Product() {
  const group = useRef(null)
  const ring = useRef(null)
  const sats = useRef(null)

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime
    if (group.current) {
      const { pointer } = state
      // rotation continue bien visible
      group.current.rotation.y += delta * 0.5
      // réagit à la souris
      group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, pointer.y * 0.4 + Math.sin(t * 0.8) * 0.15, 0.06)
      group.current.rotation.z = THREE.MathUtils.lerp(group.current.rotation.z, pointer.x * 0.3, 0.06)
      group.current.position.y = Math.sin(t * 0.9) * 0.12
    }
    // anneau qui pulse + tourne
    if (ring.current) {
      ring.current.rotation.z += delta * 0.4
      const s = 1 + Math.sin(t * 1.4) * 0.04
      ring.current.scale.set(s, s, 1)
      ring.current.material.emissiveIntensity = 1 + Math.sin(t * 1.6) * 0.4
    }
    // satellites orbitaux
    if (sats.current) {
      sats.current.children.forEach((sat, i) => {
        const ang = t * 0.8 + (i * Math.PI * 2) / sats.current.children.length
        sat.position.set(Math.cos(ang) * 2.1, Math.sin(ang * 0.7) * 0.6, Math.sin(ang) * 2.1)
        sat.rotation.x += delta * 1.2
        sat.rotation.y += delta * 0.9
      })
    }
  })

  const satsData = [
    { color: '#ff8a4d', size: 0.16 },
    { color: '#ffc46b', size: 0.12 },
    { color: '#c93a12', size: 0.14 },
  ]

  return (
    <group ref={group}>
      {/* tore noué */}
      <mesh castShadow>
        <torusKnotGeometry args={[1.0, 0.3, 220, 30]} />
        <meshStandardMaterial color="#ff5b2e" metalness={0.75} roughness={0.2} emissive="#5e1504" emissiveIntensity={0.35} />
      </mesh>
      {/* anneau lumineux qui pulse */}
      <mesh ref={ring}>
        <torusGeometry args={[1.65, 0.05, 16, 72]} />
        <meshStandardMaterial color="#ff8a4d" emissive="#ff5b2e" emissiveIntensity={1.2} metalness={0.4} roughness={0.3} />
      </mesh>
      {/* satellites */}
      <group ref={sats}>
        {satsData.map((s, i) => (
          <mesh key={i} castShadow>
            <icosahedronGeometry args={[s.size, 0]} />
            <meshStandardMaterial color={s.color} emissive={s.color} emissiveIntensity={0.6} metalness={0.6} roughness={0.3} />
          </mesh>
        ))}
      </group>
    </group>
  )
}

/** Canvas de la scène 3D — animations continues + drift caméra au scroll. */
export default function HeroSceneCanvas() {
  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [0, 0.2, 6.4], fov: 40 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      style={{ width: '100%', height: '100%' }}
      aria-hidden="true"
    >
      <ambientLight intensity={0.6} />
      <directionalLight position={[4, 5, 3]} intensity={1.7} color="#ffffff" />
      <pointLight position={[-4, -2, 2]} intensity={1.2} color="#ff5b2e" />
      <pointLight position={[3, 2, 4]} intensity={0.5} color="#ffc9b3" />

      <Rig />

      <Float speed={1.4} rotationIntensity={0.25} floatIntensity={0.8}>
        <Product />
      </Float>

      <ContactShadows position={[0, -2, 0]} opacity={0.45} scale={9} blur={2.8} far={3.2} color="#000000" />
      <Environment preset="city" />
    </Canvas>
  )
}
