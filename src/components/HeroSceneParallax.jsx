import { useEffect, useRef } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { motion, useScroll, useTransform } from 'framer-motion'

/**
 * HeroSceneParallax - Tiny 3D scene inspired by Horizon & getLayers.
 * - Lightweight cube that floats and slowly rotates.
 * - Background gradient that follows scroll.
 * - Text overlay using framer-motion reveal.
 */
export default function HeroSceneParallax() {
  return (
    <section className="relative h-[calc(100vh-2rem)] w-full" style={{marginTop: '2rem'}}>
      {/* 3D canvas */}
      <Canvas camera={{ position: [0, 0.5, 5], fov: 35 }}
        gl={{ powerPreference: 'high-performance', antialias: true }}
        className="w-full h-full absolute inset-0 -z-10"
      >
        <color attach="background" args={['var(--bg)']} />
        <ambientLight intensity={0.6} />
        <pointLight position={[2, 5, 3]} intensity={0.8} />
        <FloatingCube />
      </Canvas>
      {/* Overlay text */}
      <motion.div
        className="relative flex h-full items-center justify-center text-center px-4"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
      >
        <h1 className="font-display font-semibold text-6xl md:text-7xl leading-tight t-text" style={{fontSize:'clamp(3rem,10vw,7rem)', letterSpacing:'-0.04em'}}>
          <span className="block" style={{fontWeight:'normal',color:'var(--accent)'}}>Floating</span>
          <span className="block" style={{fontWeight:'normal',color:'var(--accent-2)'}}>Hero</span>
        </h1>
      </motion.div>
    </section>
  )
}

function FloatingCube() {
  const ref = useRef()
  const { viewport } = useThree()
  const { scrollYProgress } = useScroll({ style: { opacity: 'none' } })
  const rotationY = useTransform(scrollYProgress, [0, 1], [0, Math.PI * 2])

  useEffect(() => {
    if (!ref.current) return
    const animate = () => {
      if (ref.current) {
        // Rotate slowly around Y and Z
        ref.current.rotation.y += 0.004
        ref.current.rotation.z += 0.002
      }
    }
    const id = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(id)
  }, [])

  return (
    <group ref={ref} position={[0, 0, 0]} scale={[1.2, 1.2, 1.2]}
      rotation={[0, 0, 0]}
      rotation-y={rotationY}
    >
      <mesh castShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="var(--accent)" roughness={0.25} metalness={0.4} />
      </mesh>
    </group>
  )
}
