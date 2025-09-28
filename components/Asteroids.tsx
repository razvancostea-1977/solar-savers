import * as THREE from 'three';
import React, { useRef, useMemo, useEffect } from 'react';

const count = 2000;
const range = 2500;

export default function Asteroids() {
  const instancedMeshRef = useRef<THREE.InstancedMesh>(null!);

  // Create a single, non-uniform, bumpy asteroid geometry to be instanced.
  // This is more performant than creating unique geometry for each asteroid.
  const asteroidGeometry = useMemo(() => {
    const geometry = new THREE.IcosahedronGeometry(1, 1);
    const positions = geometry.attributes.position.array;

    for (let i = 0; i < positions.length; i += 3) {
      const vec = new THREE.Vector3(positions[i], positions[i + 1], positions[i + 2]);
      // Displace each vertex randomly along its normal to create an irregular shape
      vec.normalize().multiplyScalar(Math.random() * 0.3 + 0.9); 
      positions[i] = vec.x;
      positions[i + 1] = vec.y;
      positions[i + 2] = vec.z;
    }

    geometry.attributes.position.needsUpdate = true;
    geometry.computeVertexNormals(); // Recalculate normals for correct lighting
    return geometry;
  }, []);

  const asteroidData = useMemo(() => {
    const data = [];
    for (let i = 0; i < count; i++) {
      // Position asteroids randomly within a large cubic area
      const position = new THREE.Vector3(
        (Math.random() - 0.5) * range,
        (Math.random() - 0.5) * range,
        (Math.random() - 0.5) * range
      );

      // Ensure asteroids aren't clustered too close to the player's starting point
      if (position.length() < 200) {
        position.setLength(200 + Math.random() * (range / 2));
      }
      
      const rotation = new THREE.Euler(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );
      
      const scale = Math.random() * 8 + 3; // Make asteroids a bit larger and more varied

      data.push({ position, rotation, scale });
    }
    return data;
  }, []);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Create an array of random gray colors for each instance
  const colorArray = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const color = new THREE.Color();
      const randomness = Math.random() * 0.4 + 0.2; // Shades of gray
      color.setRGB(randomness, randomness, randomness);
      color.toArray(arr, i * 3);
    }
    return arr;
  }, []);

  // Set the initial transforms for each asteroid instance
  useEffect(() => {
    if (!instancedMeshRef.current) return;
    
    asteroidData.forEach((data, i) => {
      dummy.position.copy(data.position);
      dummy.rotation.copy(data.rotation);
      dummy.scale.set(data.scale, data.scale, data.scale);
      dummy.updateMatrix();
      instancedMeshRef.current.setMatrixAt(i, dummy.matrix);
    });
    // Important: Update the instance matrix after setting all transforms
    instancedMeshRef.current.instanceMatrix.needsUpdate = true;
  }, [asteroidData, dummy]);

  return (
    <instancedMesh ref={instancedMeshRef} args={[asteroidGeometry, undefined, count]}>
      <meshStandardMaterial roughness={0.9} vertexColors />
      <instancedBufferAttribute attach="instanceColor" args={[colorArray, 3]} />
    </instancedMesh>
  );
}