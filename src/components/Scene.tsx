import { useState, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import Hazelnut from './Hazelnut'
import Floor from './Floor'
import { Environment } from '@react-three/drei'
import { Physics } from '@react-three/rapier'

// Fixes PCFSoftShadowMap deprecation warning — must be set from inside Canvas context
function ShadowConfig() {
  const { gl } = useThree()
  useEffect(() => {
    gl.shadowMap.type = THREE.PCFShadowMap
  }, [gl])
  return null
}

function CameraRig() {
  useFrame((state) => {
    const scrollY = window.scrollY
    const maxScroll = Math.max(1, document.body.scrollHeight - window.innerHeight)
    const progress = Math.min(scrollY / maxScroll, 1)

    const isMobile = window.innerWidth < 768;

    let angle, radius, y, lookX, lookY;
    
    if (progress < 0.333) {
      // Hero to Section 1
      const t = progress / 0.333
      const ease = t * t * (3 - 2 * t)
      angle = THREE.MathUtils.lerp(0, Math.PI * 0.5, ease)
      radius = THREE.MathUtils.lerp(15, isMobile ? 12 : 8, ease)
      y = THREE.MathUtils.lerp(5, 2, ease)
      lookX = THREE.MathUtils.lerp(0, isMobile ? 0 : 3, ease)
      lookY = THREE.MathUtils.lerp(0, isMobile ? 2 : 0, ease)
    } else if (progress < 0.666) {
      // Section 1 to Section 2
      const t = (progress - 0.333) / 0.333
      const ease = t * t * (3 - 2 * t)
      angle = THREE.MathUtils.lerp(Math.PI * 0.5, Math.PI, ease)
      radius = THREE.MathUtils.lerp(isMobile ? 12 : 8, isMobile ? 10 : 6, ease)
      y = THREE.MathUtils.lerp(2, 1, ease)
      lookX = THREE.MathUtils.lerp(isMobile ? 0 : 3, isMobile ? 0 : -3, ease)
      lookY = THREE.MathUtils.lerp(isMobile ? 2 : 0, isMobile ? 2 : 0, ease)
    } else {
      // Section 2 to Section 3
      const t = (progress - 0.666) / 0.334
      const ease = t * t * (3 - 2 * t)
      angle = THREE.MathUtils.lerp(Math.PI, Math.PI * 1.5, ease)
      radius = THREE.MathUtils.lerp(isMobile ? 10 : 6, isMobile ? 16 : 14, ease)
      y = THREE.MathUtils.lerp(1, 8, ease)
      lookX = THREE.MathUtils.lerp(isMobile ? 0 : -3, 0, ease)
      lookY = THREE.MathUtils.lerp(isMobile ? 2 : 0, 0, ease)
    }

    state.camera.position.x = Math.sin(angle) * radius
    state.camera.position.z = Math.cos(angle) * radius
    state.camera.position.y = y
    
    state.camera.lookAt(lookX, lookY, 0)
  })
  return null
}

export default function Scene() {
  const [hazelnuts, setHazelnuts] = useState<{ id: number; position: [number, number, number]; type: 'kernel' | 'inshell' }[]>([])

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null

    const spawnNut = () => {
      setHazelnuts((prev) => {
        const typeMix: 'kernel' | 'inshell' = 'inshell' // Temporarily all inshell — kernel code preserved in Hazelnut.tsx
        return [
          ...prev,
          {
            id: Date.now(),
            position: [(Math.random() - 0.5) * 4, 10 + Math.random() * 2, (Math.random() - 0.5) * 4] as [number, number, number],
            type: typeMix
          }
        ].slice(-100)
      })
    }

    const startInterval = () => {
      if (!interval) interval = setInterval(spawnNut, 400)
    }

    const stopInterval = () => {
      if (interval) { clearInterval(interval); interval = null }
    }

    // Pause when tab is hidden, resume when visible
    const handleVisibility = () => {
      if (document.hidden) stopInterval()
      else startInterval()
    }

    document.addEventListener('visibilitychange', handleVisibility)
    startInterval()

    return () => {
      stopInterval()
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [])

  return (
    <>
      <CameraRig />
      <ShadowConfig />
      <color attach="background" args={['#ffffff']} />
      <fog attach="fog" args={['#ffffff', 10, 40]} />
      
      <directionalLight 
        castShadow 
        position={[4, 10, 2]} 
        intensity={2.8} 
        shadow-mapSize={[4096, 4096]} 
        shadow-camera-far={20}
        shadow-camera-left={-6}
        shadow-camera-right={6}
        shadow-camera-top={6}
        shadow-camera-bottom={-6}
        shadow-bias={-0.0001}
      />

      <Environment preset="studio" />

      <Physics>
        <Floor />
        {hazelnuts.map((nut) => (
          <Hazelnut key={nut.id} position={nut.position} type={nut.type} />
        ))}
      </Physics>
    </>
  )
}
