import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { targetProgress } from './Scene'

const FLOOR_Y = -0.5
const MAX_HEIGHT = 12
const MIN_SCALE = 0.08
const MAX_SCALE = 0.55
const MIN_OPACITY = 0.0
const MAX_OPACITY = 0.5

function createShadowTexture(): THREE.Texture {
  const size = 256
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!

  const cx = size / 2
  const gradient = ctx.createRadialGradient(cx, cx, 0, cx, cx, cx)
  gradient.addColorStop(0, 'rgba(0, 0, 0, 1)')
  gradient.addColorStop(0.25, 'rgba(0, 0, 0, 0.8)')
  gradient.addColorStop(0.5, 'rgba(0, 0, 0, 0.35)')
  gradient.addColorStop(0.75, 'rgba(0, 0, 0, 0.08)')
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0)')

  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, size, size)

  const texture = new THREE.CanvasTexture(canvas)
  texture.needsUpdate = true
  return texture
}

let sharedTex: THREE.CanvasTexture | null = null
function getShadowTexture() {
  if (!sharedTex) sharedTex = createShadowTexture() as THREE.CanvasTexture
  return sharedTex
}

const _worldPos = new THREE.Vector3()

export default function BlobShadow({ trackerRef }: { trackerRef: React.RefObject<THREE.Group | null> }) {
  const meshRef = useRef<THREE.Mesh>(null)
  const shadowTexture = useMemo(() => getShadowTexture(), [])

  useFrame(() => {
    if (!meshRef.current || !trackerRef.current) return

    trackerRef.current.getWorldPosition(_worldPos)

    const heightAboveFloor = Math.max(0, _worldPos.y - FLOOR_Y)
    const t = Math.min(heightAboveFloor / MAX_HEIGHT, 1)

    const scale = THREE.MathUtils.lerp(MAX_SCALE, MIN_SCALE, t)
    meshRef.current.scale.set(scale, scale, 1)

    const baseOpacity = THREE.MathUtils.lerp(MAX_OPACITY, MIN_OPACITY, t)
    const fadeOutFactor = Math.max(0, 1 - targetProgress * 6)
    ;(meshRef.current.material as THREE.MeshBasicMaterial).opacity = baseOpacity * fadeOutFactor

    meshRef.current.position.set(_worldPos.x, FLOOR_Y + 0.01, _worldPos.z)
  })

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} frustumCulled={false}>
      <planeGeometry args={[2, 2]} />
      <meshBasicMaterial
        map={shadowTexture}
        transparent
        opacity={0}
        depthWrite={false}
        blending={THREE.NormalBlending}
      />
    </mesh>
  )
}
