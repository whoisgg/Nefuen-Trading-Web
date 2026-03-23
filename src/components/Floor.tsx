import { RigidBody, CuboidCollider } from '@react-three/rapier'

export default function Floor() {
  return (
    <RigidBody type="fixed" colliders={false}>
      {/* Explicit thick collider to prevent tunneling. Top face is at y = -0.5 */}
      <CuboidCollider args={[500, 1, 500]} position={[0, -1.5, 0]} />
      
      <mesh receiveShadow position={[0, -0.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1000, 1000]} />
        <shadowMaterial transparent opacity={0.6} />
      </mesh>
    </RigidBody>
  )
}
