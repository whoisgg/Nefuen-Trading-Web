import { useMemo, useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { RigidBody } from '@react-three/rapier'
import { cameraProgress } from './Scene'
import { useFBX, useTexture, Center } from '@react-three/drei'
import * as THREE from 'three'
import BlobShadow from './BlobShadow'

// --- Procedural Inshell Texture Generator ---
// hilumSize: 0.0 = tiny scar, 1.0 = full current size
function createInshellTexture(hilumSize = 1.0) {
  const canvas = document.createElement('canvas')
  canvas.width = 1024
  canvas.height = 1024
  const context = canvas.getContext('2d')
  
  if (context) {
    // 1. Fill base gradient (Shells are lighter at base, darker near pointy tip)
    const gradient = context.createLinearGradient(0, 0, 0, 1024)
    gradient.addColorStop(0.1, '#3b1c0b')    // Dark, hard tip
    gradient.addColorStop(0.5, '#733c1d')    // Warm rich middle
    gradient.addColorStop(0.9, '#a3643b')    // Lighter, dustier base

    context.fillStyle = gradient
    context.fillRect(0, 0, 1024, 1024)

    // 2. Add thousands of vertical wood-grain striations
    for (let i = 0; i < 15000; i++) {
       const x = Math.random() * 1024
       const y = Math.random() * 1024
       const length = 20 + Math.random() * 180
       
       context.globalAlpha = 0.02 + Math.random() * 0.05
       context.fillStyle = Math.random() > 0.6 ? '#1f0d04' : '#cca078'
       context.fillRect(x, y, 1 + Math.random() * 1.5, length)
    }
    
    // 3. Draw hilum scar at top and bottom poles with variable coverage
    function drawHilum(isTop: boolean) {
      // Scale the scar boundary: hilumSize 1.0 = yBase at 220/804, 0.0 = yBase at ~30/994 (tiny)
      const maxReach = isTop ? 220 : 804
      const minReach = isTop ? 30 : 994
      const yBase = isTop
        ? minReach + (maxReach - minReach) * hilumSize
        : minReach + (maxReach - minReach) * hilumSize

      context!.globalAlpha = 1.0
      context!.filter = 'none'
      
      context!.fillStyle = '#cdae82'
      context!.beginPath()
      context!.moveTo(0, isTop ? 0 : 1024)
      context!.lineTo(1024, isTop ? 0 : 1024)
      
      for(let x=1024; x>=0; x-=5) {
         const variance = Math.sin(x*0.05)*25 + Math.random()*30
         const yNode = isTop ? yBase + variance : yBase - variance
         context!.lineTo(x, yNode)
      }
      context!.fill()

      // Spongy crater dots inside the scar
      const dotBand = isTop ? yBase + 80 : yBase - 80
      for(let i=0; i<15000; i++) {
         const x = Math.random() * 1024
         const y = isTop ? Math.random() * (dotBand + 30) : (dotBand - 30) + Math.random() * (1024 - (dotBand - 30))
         
         const variance = Math.sin(x*0.05)*25
         const limit = isTop ? yBase + variance : yBase - variance
         const isValid = isTop ? y < limit : y > limit
         
         if (isValid) { 
           context!.globalAlpha = 0.5 + Math.random()*0.5
           context!.fillStyle = Math.random() > 0.4 ? '#8f6f4a' : '#e3c6a1'
           context!.beginPath()
           context!.arc(x, y, 1 + Math.random()*3.5, 0, Math.PI*2)
           context!.fill()
         }
      }
      
      // Dark boundary ring
      context!.globalAlpha = 0.6
      context!.lineWidth = 6
      context!.strokeStyle = '#381b0a'
      context!.beginPath()
      for(let x=0; x<=1024; x+=8) {
         const variance = Math.sin(x*0.05)*25
         const yNode = isTop ? yBase + variance : yBase - variance
         if(x===0) context!.moveTo(x, yNode)
         else context!.lineTo(x, yNode)
      }
      context!.stroke()
    }

    drawHilum(true)
    drawHilum(false)
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.wrapS = THREE.ClampToEdgeWrapping
  texture.wrapT = THREE.ClampToEdgeWrapping
  return texture
}

// Pre-generate 4 texture variants with different hilum sizes to add natural visual variety
// hilumSize: 1.0 = full large scar (as designed), 0.25 = quarter-sized scar
const INSHELL_TEXTURES = [
  createInshellTexture(0.8),   // Biggest
  createInshellTexture(0.67),  // Medium large
  createInshellTexture(0.53),  // Medium small
  createInshellTexture(0.4),   // Smallest
]

interface HazelnutProps {
  position: [number, number, number]
  type?: 'kernel' | 'inshell'
  rotation?: [number, number, number]
  angularVelocity?: [number, number, number]
  isHero?: boolean
  gravityScale?: number
  linearDamping?: number
  mode?: 'heroFalling' | 'galleryFalling' | 'finalFalling'
  sensor?: boolean
  castShadow?: boolean
}

export default function Hazelnut({ 
  position, 
  type = 'kernel', 
  rotation = [0, 0, 0], 
  angularVelocity = [0, 0, 0], 
  isHero = false, 
  gravityScale = 1.0,
  linearDamping = 0,
  mode,
  sensor = false,
  castShadow = true
}: HazelnutProps) {
  const rigidBodyRef = useRef<any>(null)
  const meshGroupRef = useRef<THREE.Group>(null)
  const fbx = useFBX('/models/hazelnut/BB_031_huzelnut.fbx')
  
  const [colorMap, normalMap, dispMap] = useTexture([
    '/models/hazelnut/1k_textures/BB_031_hazelnut_01_texture.jpg',
    '/models/hazelnut/1k_textures/BB_031_hazelnut_01_normal.jpg',
    '/models/hazelnut/1k_textures/BB_031_hazelnut_01_disp.jpg',
  ])

  // Pick a random texture variant once per instance (stable via useMemo with no deps)
  const inshellTex = useMemo(() => {
    const idx = Math.floor(Math.random() * INSHELL_TEXTURES.length)
    return INSHELL_TEXTURES[idx]
  }, [])

  const cloned = useMemo(() => {
    colorMap.colorSpace = THREE.SRGBColorSpace
    
    colorMap.flipY = false
    normalMap.flipY = false
    dispMap.flipY = false

    const clone = fbx.clone(true)
    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh
        mesh.castShadow = castShadow
        mesh.receiveShadow = true
        
        if (type === 'kernel') {
          mesh.material = new THREE.MeshStandardMaterial({
            map: colorMap,
            normalMap: normalMap,
            displacementMap: dispMap,
            displacementScale: 0.02,
            roughness: 0.7,
          })
        } else {
          // Inshell material: Photorealistic procedural Canvas texture!
          mesh.material = new THREE.MeshPhysicalMaterial({
            map: inshellTex,
            roughness: 0.4,
            metalness: 0.02,
            clearcoat: 0.8,
            clearcoatRoughness: 0.15,
            normalMap: normalMap, 
            normalScale: new THREE.Vector2(0.6, 0.6),
          })
        }
      }
    })
    return clone
  }, [fbx, colorMap, normalMap, dispMap, type, inshellTex, castShadow])

  // Tracker group inside RigidBody — BlobShadow reads its world position
  const trackerRef = useRef<THREE.Group>(null)

  // Apply initial angular velocity after physics body is created
  useEffect(() => {
    const rb = rigidBodyRef.current
    if (rb && !isHero) {
      rb.setAngvel({ x: angularVelocity[0], y: angularVelocity[1], z: angularVelocity[2] }, true)
    }
  }, [isHero, angularVelocity])

  useFrame((state) => {
    if (!meshGroupRef.current) return

    if (isHero) {
      let scale = 0
      let x = position[0]
      let y = position[1]
      let z = position[2]
      let rotX = rotation[0]
      let rotY = rotation[1]
      let rotZ = rotation[2]

      const isMobile = window.innerWidth < 768
      const responsiveScale = isMobile ? 1.8 : 3.0
      const currentProgress = cameraProgress.current

      // Determine final position based on camera progress
      if (currentProgress <= 0.333) {
        const t = Math.max(0, currentProgress / 0.333)
        const ease = t * t * (3 - 2 * t)
        
        scale = responsiveScale
        x = THREE.MathUtils.lerp(position[0], 4.5, ease)
        y = THREE.MathUtils.lerp(position[1], 0.6, ease)
        z = THREE.MathUtils.lerp(position[2], -1.4, ease)
        
        // Rotate only on the Y axis continuously using elapsedTime additively to prevent unwinding on reverse scroll
        rotX = THREE.MathUtils.lerp(rotation[0], 0, ease)
        rotY = THREE.MathUtils.lerp(rotation[1], 0, ease) + state.clock.elapsedTime * 0.5
        rotZ = THREE.MathUtils.lerp(rotation[2], 0, ease)
      } else {
        const t = Math.min(1, (currentProgress - 0.333) / 0.05)
        scale = THREE.MathUtils.lerp(responsiveScale, 0, t)
        x = 4.5
        y = 0.6
        z = -1.4
        rotX = 0
        rotY = Math.PI * 0.66 + (currentProgress - 0.333) * 2 + state.clock.elapsedTime * 0.5
        rotZ = 0
      }

      meshGroupRef.current.scale.setScalar(scale)
      meshGroupRef.current.position.set(x, y, z)
      meshGroupRef.current.rotation.set(rotX, rotY, rotZ)
    } else if (mode === 'heroFalling') {
      const p = cameraProgress.current
      const shrinkFactor = p < 0.2 ? Math.max(0, 1 - p * 5) : 0
      meshGroupRef.current.scale.setScalar(shrinkFactor)
    } else if (mode === 'galleryFalling') {
      const p = cameraProgress.current
      let shrinkFactor = 0
      if (p > 0.4 && p < 0.6) {
        shrinkFactor = THREE.MathUtils.lerp(0, 0.5, Math.min(1, (p - 0.4) * 10))
      } else if (p >= 0.6) {
        shrinkFactor = THREE.MathUtils.lerp(0.5, 0, Math.min(1, (p - 0.6) * 10))
      }
      meshGroupRef.current.scale.setScalar(shrinkFactor)
    } else if (mode === 'finalFalling') {
      const p = cameraProgress.current
      const factor = p > 0.5 ? Math.min(1, (p - 0.5) * 4) : 0
      meshGroupRef.current.scale.setScalar(factor)
    } else {
      meshGroupRef.current.scale.setScalar(0)
    }
  })

  const content = (
    <group ref={meshGroupRef}>
      <group ref={trackerRef} />
      <Center>
        <primitive object={cloned} scale={type === 'inshell' ? 0.28 : 0.1} />
      </Center>
    </group>
  )

  if (isHero) {
    return <group position={position}>{content}</group>
  }

  return (
    <>
      <RigidBody
        ref={rigidBodyRef}
        colliders="ball"
        sensor={sensor}
        position={position}
        rotation={rotation}
        gravityScale={gravityScale}
        linearDamping={linearDamping}
        restitution={type === 'inshell' ? 0.75 : 0.6}
        friction={type === 'inshell' ? 0.3 : 0.8}
        angularDamping={0.3}
      >
        {content}
      </RigidBody>
      {castShadow && <BlobShadow trackerRef={trackerRef} />}
    </>
  )
}
