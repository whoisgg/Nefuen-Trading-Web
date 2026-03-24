import { useMemo } from 'react'
import { RigidBody } from '@react-three/rapier'
import { useFBX, useTexture } from '@react-three/drei'
import * as THREE from 'three'

// --- Procedural Inshell Texture Generator ---
function createInshellTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 1024
  canvas.height = 1024
  const context = canvas.getContext('2d')
  
  if (context) {
    // 1. Fill base gradient (Shells are lighter at base, darker near pointy tip)
    const gradient = context.createLinearGradient(0, 0, 0, 1024)
    gradient.addColorStop(0.1, '#3b1c0b')    // Dark, hard tip
    gradient.addColorStop(0.5, '#733c1d')  // Warm rich middle
    gradient.addColorStop(0.9, '#a3643b')    // Lighter, dustier base

    context.fillStyle = gradient
    context.fillRect(0, 0, 1024, 1024)

    // 2. Add thousands of vertical wood-grain striations
    for (let i = 0; i < 15000; i++) {
       const x = Math.random() * 1024
       const y = Math.random() * 1024
       const length = 20 + Math.random() * 180
       
       context.globalAlpha = 0.02 + Math.random() * 0.05
       // Mix of dark grooves and lighter scratches
       context.fillStyle = Math.random() > 0.6 ? '#1f0d04' : '#cca078'
       
       // Vertical-ish lines
       context.fillRect(x, y, 1 + Math.random() * 1.5, length)
    }
    
    // 4. Add the massive rough spongy scar (hilum) at the poles to perfectly match the photo texture!
    function drawHilum(isTop: boolean) {
      context!.globalAlpha = 1.0
      context!.filter = 'none'
      
      context!.fillStyle = '#cdae82' // Pale tan / distinct beige color of the scar
      context!.beginPath()
      context!.moveTo(0, isTop ? 0 : 1024)
      context!.lineTo(1024, isTop ? 0 : 1024)
      
      // Jagged boundary wrapping around the sphere
      for(let x=1024; x>=0; x-=5) {
         const yBase = isTop ? 220 : 804
         const variance = Math.sin(x*0.05)*25 + Math.random()*30
         const yNode = isTop ? yBase + variance : yBase - variance
         context!.lineTo(x, yNode)
      }
      context!.fill()

      // 15,000 Spongy crater dots heavily clustered to simulate the rough dimpled texture shown in the photo
      for(let i=0; i<15000; i++) {
         const x = Math.random() * 1024
         const y = isTop ? Math.random() * 300 : 724 + Math.random() * 300
         
         const yBase = isTop ? 220 : 804
         const variance = Math.sin(x*0.05)*25
         const limit = isTop ? yBase + variance : yBase - variance
         const isValid = isTop ? y < limit : y > limit
         
         if (isValid) { 
           context!.globalAlpha = 0.5 + Math.random()*0.5
           context!.fillStyle = Math.random() > 0.4 ? '#8f6f4a' : '#e3c6a1' // Dark divots and bright highlights
           context!.beginPath()
           context!.arc(x, y, 1 + Math.random()*3.5, 0, Math.PI*2) // Larger radius to mimic deeply cratered sponge
           context!.fill()
         }
      }
      
      // Dark boundary ring between the auburn shell and the pale scar
      context!.globalAlpha = 0.6
      context!.lineWidth = 6
      context!.strokeStyle = '#381b0a'
      context!.beginPath()
      for(let x=0; x<=1024; x+=8) {
         const yBase = isTop ? 220 : 804
         const variance = Math.sin(x*0.05)*25
         const yNode = isTop ? yBase + variance : yBase - variance
         if(x===0) context!.moveTo(x, yNode)
         else context!.lineTo(x, yNode)
      }
      context!.stroke()
    }

    drawHilum(true)  // Cap the top pole with the massive spongy scar
    drawHilum(false) // Cap the bottom pole as well guarantees alignment regardless of FBX UV rotation
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  // Prevent wrapping seams if possible
  texture.wrapS = THREE.ClampToEdgeWrapping
  texture.wrapT = THREE.ClampToEdgeWrapping
  return texture
}

// Generate the high-res texture EXACTLY ONCE globally to save memory across all 100 physical instances!
const INSHELL_TEXTURE = createInshellTexture()

interface HazelnutProps {
  position: [number, number, number]
  type?: 'kernel' | 'inshell'
}

export default function Hazelnut({ position, type = 'kernel' }: HazelnutProps) {
  const fbx = useFBX('/models/hazelnut/BB_031_huzelnut.fbx')
  
  const [colorMap, normalMap, dispMap] = useTexture([
    '/models/hazelnut/1k_textures/BB_031_hazelnut_01_texture.jpg',
    '/models/hazelnut/1k_textures/BB_031_hazelnut_01_normal.jpg',
    '/models/hazelnut/1k_textures/BB_031_hazelnut_01_disp.jpg',
  ])

  const cloned = useMemo(() => {
    colorMap.colorSpace = THREE.SRGBColorSpace
    
    colorMap.flipY = false
    normalMap.flipY = false
    dispMap.flipY = false

    const clone = fbx.clone(true)
    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh
        mesh.castShadow = true
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
            map: INSHELL_TEXTURE, 
            roughness: 0.4,       // Wood base shine
            metalness: 0.02,
            clearcoat: 0.8,       // Shell highly polished
            clearcoatRoughness: 0.15,
            normalMap: normalMap, 
            normalScale: new THREE.Vector2(0.6, 0.6), // Subtle physical bumps, let texture gradient do the visual lifting
          })
        }
      }
    })
    return clone
  }, [fbx, colorMap, normalMap, dispMap, type])

  return (
    <RigidBody 
      colliders="ball" 
      position={position} 
      restitution={type === 'inshell' ? 0.75 : 0.6} // Shells are bouncier and harder
      friction={type === 'inshell' ? 0.3 : 0.8}     // Shells slide easily compared to kernels
    >
      <primitive object={cloned} scale={type === 'inshell' ? 0.28 : 0.1} />
    </RigidBody>
  )
}
