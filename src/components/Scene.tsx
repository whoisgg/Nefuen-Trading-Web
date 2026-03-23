import { useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import Hazelnut from './Hazelnut'
import Floor from './Floor'
import { Environment } from '@react-three/drei'
import { Physics } from '@react-three/rapier'

function CameraRig() {
  useFrame((state) => {
    const scrollY = window.scrollY
    const maxScroll = Math.max(1, document.body.scrollHeight - window.innerHeight)
    const progress = Math.min(scrollY / maxScroll, 1)

    // Cinematic transition: 
    // Orbit 90 degrees, zoom in from radius 15 to 8, and drop the height.
    const angle = progress * Math.PI * 0.5 
    const radius = THREE.MathUtils.lerp(15, 8, progress)

    state.camera.position.x = Math.sin(angle) * radius
    state.camera.position.z = Math.cos(angle) * radius
    state.camera.position.y = THREE.MathUtils.lerp(5, 2, progress)
    
    // Look slightly to the right as we scroll down so the hazelnuts are framed on the left!
    const lookX = THREE.MathUtils.lerp(0, 3, progress)
    state.camera.lookAt(lookX, 0, 0)
  })
  return null
}

export default function Scene() {
  const [hazelnuts, setHazelnuts] = useState<{ id: number; position: [number, number, number] }[]>([])

  useEffect(() => {
    const interval = setInterval(() => {
      setHazelnuts((prev) => [
        ...prev,
        {
          id: Date.now(),
          position: [(Math.random() - 0.5) * 4, 10 + Math.random() * 2, (Math.random() - 0.5) * 4] as [number, number, number]
        }
      ].slice(-100))
    }, 400)
    
    return () => clearInterval(interval)
  }, [])

  return (
    <>
      <CameraRig />
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
          <Hazelnut key={nut.id} position={nut.position} />
        ))}
      </Physics>
    </>
  )
}
