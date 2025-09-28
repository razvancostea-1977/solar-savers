
import React, { useRef } from 'react';
// FIX: Switched to namespace import for `@react-three/fiber` to resolve module resolution issues.
import * as ReactThreeFiber from '@react-three/fiber';
import * as THREE from 'three';

interface EnemyProps {
  initialPosition: THREE.Vector3;
  playerPosition: THREE.Vector3;
  addLaser: (position: THREE.Vector3, velocity: THREE.Vector3) => void;
}

const FIRE_RATE = 2000; // ms
const LASER_SPEED = 100;

const Enemy: React.FC<EnemyProps> = ({ initialPosition, playerPosition, addLaser }) => {
  const meshRef = useRef<THREE.Mesh>(null!);
  const lastShotTime = useRef(0);

  // Use a random offset for movement to desynchronize enemies
  const movementOffset = useRef(Math.random() * Math.PI * 2);

  ReactThreeFiber.useFrame((state) => {
    if (!meshRef.current) return;

    // Movement logic: simple oscillation
    const time = state.clock.elapsedTime + movementOffset.current;
    const newPosition = initialPosition.clone();
    newPosition.x += Math.sin(time * 0.5) * 40;
    newPosition.y += Math.cos(time * 0.7) * 30;
    meshRef.current.position.copy(newPosition);

    // Look at player
    meshRef.current.lookAt(playerPosition);

    // Shooting logic
    const now = state.clock.elapsedTime * 1000;
    if (now - lastShotTime.current > FIRE_RATE) {
      lastShotTime.current = now;

      // Calculate direction to player
      const direction = new THREE.Vector3()
        .subVectors(playerPosition, meshRef.current.position)
        .normalize();

      const laserPosition = meshRef.current.position.clone().add(direction.clone().multiplyScalar(5));
      const laserVelocity = direction.clone().multiplyScalar(LASER_SPEED);
      
      addLaser(laserPosition, laserVelocity);
    }
  });

  return (
    <mesh ref={meshRef} position={initialPosition} scale={6}>
      <coneGeometry args={[1, 3, 8]} />
      <meshStandardMaterial color="#880808" roughness={0.5} />
    </mesh>
  );
};

export default Enemy;