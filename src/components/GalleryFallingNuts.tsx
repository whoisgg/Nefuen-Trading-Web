import { useState, useEffect } from 'react'
import Hazelnut from './Hazelnut'

export default function GalleryFallingNuts() {
  const [hazelnuts, setHazelnuts] = useState<{ id: number; position: [number, number, number]; type: 'kernel' | 'inshell'; rotation: [number, number, number]; angVel: [number, number, number]; gravityScale: number; linearDamping: number }[]>([])

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout> | null = null
    let isActive = true

    // Pre-populate so the screen is immediately full of randomly distributed falling nuts
    const initialNuts = Array.from({ length: 150 }, (_, i) => ({
      id: Date.now() + Math.random() + i,
      position: [(Math.random() - 0.5) * 20, (Math.random() * 25) - 5, (Math.random() - 0.5) * 8] as [number, number, number],
      type: (Math.random() > 0.5 ? 'kernel' : 'inshell') as 'kernel' | 'inshell',
      rotation: [Math.random() * Math.PI * 2, Math.random() * Math.PI * 2, Math.random() * Math.PI * 2] as [number, number, number],
      angVel: [(Math.random() - 0.5) * 8, (Math.random() - 0.5) * 8, (Math.random() - 0.5) * 8] as [number, number, number],
      gravityScale: 0.05 + Math.random() * 0.15,
      linearDamping: 0.5 + Math.random() * 1.5,
    }))
    setHazelnuts(initialNuts)

    const spawnLoop = () => {
      if (!isActive) return
      
      setHazelnuts((prev) => {
        return [
          ...prev,
          {
            id: Date.now() + Math.random(),
            position: [(Math.random() - 0.5) * 20, 10 + Math.random() * 5, (Math.random() - 0.5) * 8] as [number, number, number],
            type: (Math.random() > 0.5 ? 'kernel' : 'inshell') as 'kernel' | 'inshell',
            rotation: [Math.random() * Math.PI * 2, Math.random() * Math.PI * 2, Math.random() * Math.PI * 2] as [number, number, number],
            angVel: [(Math.random() - 0.5) * 8, (Math.random() - 0.5) * 8, (Math.random() - 0.5) * 8] as [number, number, number],
            gravityScale: 0.05 + Math.random() * 0.15,
            linearDamping: 0.5 + Math.random() * 1.5,
          }
        ].slice(-150)
      })
      timeout = setTimeout(spawnLoop, 150)
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

  return (
    <>
      {hazelnuts.map((nut) => (
        <Hazelnut 
           key={nut.id} 
           position={nut.position} 
           type={nut.type} 
           rotation={nut.rotation} 
           angularVelocity={nut.angVel} 
           gravityScale={nut.gravityScale}
           linearDamping={nut.linearDamping}
           mode="galleryFalling"
           sensor={true}
           castShadow={false}
        />
      ))}
    </>
  )
}
