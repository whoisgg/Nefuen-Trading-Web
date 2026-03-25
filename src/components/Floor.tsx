import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { RigidBody, CuboidCollider } from '@react-three/rapier'
import { cameraProgress } from './Scene'

export default function Floor() {
  const rbRef = useRef<any>(null)
  
  useFrame(() => {
    if (rbRef.current) {
      if (cameraProgress.current > 0.4) {
        rbRef.current.setNextKinematicTranslation({ x: 0, y: -100, z: 0 })
      } else {
        rbRef.current.setNextKinematicTranslation({ x: 0, y: 0, z: 0 })
      }
    }
  })

  return (
    <RigidBody type="kinematicPosition" ref={rbRef} colliders={false}>
      {/* Explicit thick collider to prevent tunneling. Top face is at y = -0.5 */}
      <CuboidCollider args={[500, 1, 500]} position={[0, -1.5, 0]} />
      
      <mesh receiveShadow position={[0, -0.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1000, 1000]} />
        <shadowMaterial transparent opacity={0.6} />
      </mesh>
    </RigidBody>
  )
}
