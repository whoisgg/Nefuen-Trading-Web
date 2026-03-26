import { useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import Hazelnut from './Hazelnut'
import { cameraProgress } from './Scene'

let heroNutCounter = 0

export default function HeroFallingNuts() {
  const [hazelnuts, setHazelnuts] = useState<{ id: string; position: [number, number, number]; rotation: [number, number, number]; angVel: [number, number, number] }[]>([])

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout> | null = null
    let isActive = true

    const spawnLoop = () => {
      if (!isActive) return
      
      // Only spawn if we are in/near the Hero section
      if (cameraProgress.current < 0.25) {
        setHazelnuts((prev) => {
          return [
            ...prev,
            {
              id: `hero-${heroNutCounter++}-${Date.now()}`,
              position: [(Math.random() - 0.5) * 4, 10 + Math.random() * 2, (Math.random() - 0.5) * 4] as [number, number, number],
              rotation: [Math.random() * Math.PI * 2, Math.random() * Math.PI * 2, Math.random() * Math.PI * 2] as [number, number, number],
              angVel: [(Math.random() - 0.5) * 8, (Math.random() - 0.5) * 8, (Math.random() - 0.5) * 8] as [number, number, number],
            }
          ].slice(-80)
        })
      }
      timeout = setTimeout(spawnLoop, 400)
    }

    const handleVisibility = () => {
      if (document.hidden && timeout) { clearTimeout(timeout); timeout = null }
      else if (!document.hidden && !timeout) spawnLoop()
    }

    document.addEventListener('visibilitychange', handleVisibility)
    spawnLoop()

    return () => {
      isActive = false
      if (timeout) clearTimeout(timeout)
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [])

  // Clear array when out of view — deferred to avoid Rapier concurrent access
  useFrame(() => {
    if (cameraProgress.current > 0.35 && hazelnuts.length > 0) {
      setHazelnuts([])
    }
  })

  return (
    <>
      {hazelnuts.map((nut) => (
        <Hazelnut 
           key={nut.id} 
           position={nut.position} 
           type="inshell" 
           rotation={nut.rotation} 
           angularVelocity={nut.angVel} 
           mode="heroFalling"
        />
      ))}
    </>
  )
}
