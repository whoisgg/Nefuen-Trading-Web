import { useMemo } from 'react'
import { RigidBody } from '@react-three/rapier'
import { useFBX, useTexture } from '@react-three/drei'
import * as THREE from 'three'

export default function Hazelnut({ position }: { position: [number, number, number] }) {
  const fbx = useFBX('/models/hazelnut/BB_031_huzelnut.fbx')
  
  const [colorMap, normalMap, dispMap] = useTexture([
    '/models/hazelnut/1k_textures/BB_031_hazelnut_01_texture.jpg',
    '/models/hazelnut/1k_textures/BB_031_hazelnut_01_normal.jpg',
    '/models/hazelnut/1k_textures/BB_031_hazelnut_01_disp.jpg',
  ])

  const cloned = useMemo(() => {
    colorMap.colorSpace = THREE.SRGBColorSpace
    
    // Sometimes UVs require flipping on imported textures
    colorMap.flipY = false
    normalMap.flipY = false
    dispMap.flipY = false

    const clone = fbx.clone()
    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh
        mesh.castShadow = true
        mesh.receiveShadow = true
        mesh.material = new THREE.MeshStandardMaterial({
          map: colorMap,
          normalMap: normalMap,
          displacementMap: dispMap,
          displacementScale: 0.02,
          roughness: 0.7,
        })
      }
    })
    return clone
  }, [fbx, colorMap, normalMap, dispMap])

  return (
    <RigidBody 
      colliders="ball" 
      position={position} 
      restitution={0.6}
      friction={0.8}
    >
      {/* Scaling down the FBX model to match the original sphere size */}
      <primitive object={cloned} scale={0.1} />
    </RigidBody>
  )
}
