import React from 'react';
import * as THREE from 'three';

const Planet: React.FC = () => {
  return (
    <group position={[0, 0, -6000]}>
      {/* Planet Body */}
      <mesh>
        <sphereGeometry args={[1000, 64, 64]} />
        <meshStandardMaterial
          color="#444455"
          roughness={0.9}
          metalness={0.2}
        />
      </mesh>
      {/* Weak Spot */}
      <mesh position={[0, 0, 1001]}>
        <cylinderGeometry args={[80, 80, 20, 32]} />
        <meshStandardMaterial
          color="red"
          emissive="red"
          emissiveIntensity={5}
          toneMapped={false}
        />
      </mesh>
       {/* Planet Glow */}
      <pointLight 
        color="#ff8888" 
        intensity={200000} 
        distance={2000} 
        position={[0, 0, 1100]}
      />
    </group>
  );
};

export default Planet;
