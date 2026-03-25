import { useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import Hazelnut from './Hazelnut'
import { cameraProgress } from './Scene'

export default function FinalFallingNuts() {
  const [hazelnuts, setHazelnuts] = useState<{ id: number; position: [number, number, number]; rotation: [number, number, number]; angVel: [number, number, number] }[]>([])

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout> | null = null
    let isActive = true

    // Pre-populate so the floor is already covered when user arrives
    const initialNuts = Array.from({ length: 200 }, (_, i) => ({
      id: Date.now() + Math.random() + i,
      position: [(Math.random() - 0.5) * 8, Math.random() * 15, (Math.random() - 0.5) * 8] as [number, number, number],
      rotation: [Math.random() * Math.PI * 2, Math.random() * Math.PI * 2, Math.random() * Math.PI * 2] as [number, number, number],
      angVel: [(Math.random() - 0.5) * 8, (Math.random() - 0.5) * 8, (Math.random() - 0.5) * 8] as [number, number, number],
    }))
    setHazelnuts(initialNuts)

    const spawnLoop = () => {
      if (!isActive) return
      
      if (cameraProgress.current > 0.35) {
        setHazelnuts((prev) => {
          return [
            ...prev,
            {
              id: Date.now() + Math.random(),
              position: [(Math.random() - 0.5) * 8, 10 + Math.random() * 5, (Math.random() - 0.5) * 8] as [number, number, number],
              rotation: [Math.random() * Math.PI * 2, Math.random() * Math.PI * 2, Math.random() * Math.PI * 2] as [number, number, number],
              angVel: [(Math.random() - 0.5) * 8, (Math.random() - 0.5) * 8, (Math.random() - 0.5) * 8] as [number, number, number],
            }
          ].slice(-300)
        })
      }
      timeout = setTimeout(spawnLoop, 100)
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

  // Hide when in the hero section
  useFrame(() => {
    if (cameraProgress.current < 0.3 && hazelnuts.length > 0) {
      setHazelnuts([])
    }
  })

  return (
    <>
      {hazelnuts.map((nut) => (
        <Hazelnut 
           key={nut.id} 
           position={nut.position} 
           type="kernel"
           rotation={nut.rotation} 
           angularVelocity={nut.angVel} 
           mode="finalFalling"
           castShadow={false}
        />
      ))}
    </>
  )
}
