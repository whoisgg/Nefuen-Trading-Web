import { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import Hazelnut from './Hazelnut'
import Floor from './Floor'
import HeroFallingNuts from './HeroFallingNuts'
import GalleryFallingNuts from './GalleryFallingNuts'
import FinalFallingNuts from './FinalFallingNuts'
import { Environment } from '@react-three/drei'
import { Physics } from '@react-three/rapier'

// Shared progress value — updated by App via window event
export let targetProgress = 0
export const cameraProgress = { current: 0 }
window.addEventListener('section-change', ((e: CustomEvent) => {
  targetProgress = e.detail.progress
}) as EventListener)

function CameraRig() {
  const progressRef = useRef(0)

  useFrame((state, delta) => {
    // Smoothly interpolate toward target (silky camera movement)
    progressRef.current += (targetProgress - progressRef.current) * Math.min(delta * 3, 1)
    cameraProgress.current = progressRef.current
    const progress = progressRef.current

    const isMobile = window.innerWidth < 768

    let angle, radius, y, lookX, lookY

    if (progress < 0.333) {
      const t = progress / 0.333
      const ease = t * t * (3 - 2 * t)
      angle = THREE.MathUtils.lerp(0, Math.PI * 0.5, ease)
      radius = THREE.MathUtils.lerp(15, isMobile ? 10 : 6, ease)
      y = THREE.MathUtils.lerp(5, 2, ease)
      lookX = THREE.MathUtils.lerp(0, isMobile ? 0 : 3, ease)
      lookY = THREE.MathUtils.lerp(0, 0, ease)
    } else if (progress < 0.666) {
      const t = (progress - 0.333) / 0.333
      const ease = t * t * (3 - 2 * t)
      angle = THREE.MathUtils.lerp(Math.PI * 0.5, Math.PI, ease)
      radius = THREE.MathUtils.lerp(isMobile ? 10 : 6, isMobile ? 8 : 5, ease)
      y = THREE.MathUtils.lerp(2, 1, ease)
      lookX = THREE.MathUtils.lerp(isMobile ? 0 : 3, isMobile ? 0 : -3, ease)
      lookY = THREE.MathUtils.lerp(0, 0, ease)
    } else {
      const t = (progress - 0.666) / 0.334
      const ease = t * t * (3 - 2 * t)
      angle = THREE.MathUtils.lerp(Math.PI, Math.PI * 1.5, ease)
      radius = THREE.MathUtils.lerp(isMobile ? 10 : 6, isMobile ? 16 : 14, ease)
      y = THREE.MathUtils.lerp(1, 8, ease)
      lookX = THREE.MathUtils.lerp(isMobile ? 0 : -3, 0, ease)
      lookY = THREE.MathUtils.lerp(0, 0, ease)
    }

    state.camera.position.x = Math.sin(angle) * radius
    state.camera.position.z = Math.cos(angle) * radius
    state.camera.position.y = y

    state.camera.lookAt(lookX, lookY, 0)
  })
  return null
}

export default function Scene({ onLoaded }: { onLoaded?: () => void }) {
  useEffect(() => {
    if (onLoaded) onLoaded()
  }, [onLoaded])

  return (
    <>
      <CameraRig />
      <color attach="background" args={['#ffffff']} />
      <fog attach="fog" args={['#ffffff', 10, 40]} />
      
      <directionalLight
        position={[4, 10, 2]}
        intensity={2.8}
      />

      <Environment preset="studio" />

      <Hazelnut position={[0, 0, 0]} isHero={true} type="inshell" />
      <Physics timeStep="vary">
        <Floor />
        <HeroFallingNuts />
        <GalleryFallingNuts />
        <FinalFallingNuts />
      </Physics>
    </>
  )
}
