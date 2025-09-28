
import React, { useRef } from 'react';
// FIX: Switched to namespace import for `@react-three/fiber` to resolve module resolution issues.
import * as ReactThreeFiber from '@react-three/fiber';
import { Vector3 } from 'three';
import { useInput } from '../hooks/useInput';

const FORWARD_SPEED = 40;
const STRAFE_SPEED = 25;
const VERTICAL_SPEED = 25;
const FIRE_RATE = 200; // Milliseconds between shots
const LASER_SPEED = 200;

// Gun position offsets
const GUN_SEPARATION = 1.5;
const GUN_VERTICAL_OFFSET = 0.6;
const GUN_FORWARD_OFFSET = 2;

interface PlayerProps {
  addLaser: (position: Vector3, velocity: Vector3) => void;
}

const Player: React.FC<PlayerProps> = ({ addLaser }) => {
  const { camera } = ReactThreeFiber.useThree();
  const controls = useInput();
  
  const lastShotTime = useRef(0);

  ReactThreeFiber.useFrame((state, delta) => {
    const clampedDelta = Math.min(delta, 0.1);
    
    // Movement refactored to use direct local translation for smoother controls
    const strafeDirection = (controls.right ? 1 : 0) - (controls.left ? 1 : 0);
    const verticalDirection = (controls.up ? 1 : 0) - (controls.down ? 1 : 0);

    // Auto-forward movement
    camera.translateZ(-FORWARD_SPEED * clampedDelta);
    // Strafe and vertical movement
    camera.translateX(strafeDirection * STRAFE_SPEED * clampedDelta);
    camera.translateY(verticalDirection * VERTICAL_SPEED * clampedDelta);


    // Shooting logic
    if (controls.fire && state.clock.elapsedTime * 1000 - lastShotTime.current > FIRE_RATE) {
      lastShotTime.current = state.clock.elapsedTime * 1000;
      
      const direction = new Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
      const right = new Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
      const up = new Vector3(0, 1, 0).applyQuaternion(camera.quaternion);

      const targetPoint = new Vector3().addVectors(camera.position, direction.clone().multiplyScalar(1000));
      const gunBasePosition = camera.position.clone().add(direction.clone().multiplyScalar(GUN_FORWARD_OFFSET));
      const rightOffset = right.clone().multiplyScalar(GUN_SEPARATION / 2);
      const downOffset = up.clone().multiplyScalar(-GUN_VERTICAL_OFFSET);
      
      const leftGunPosition = new Vector3().add(gunBasePosition).sub(rightOffset).add(downOffset);
      const rightGunPosition = new Vector3().add(gunBasePosition).add(rightOffset).add(downOffset);

      const leftLaserVelocity = new Vector3().subVectors(targetPoint, leftGunPosition).normalize().multiplyScalar(LASER_SPEED);
      const rightLaserVelocity = new Vector3().subVectors(targetPoint, rightGunPosition).normalize().multiplyScalar(LASER_SPEED);

      addLaser(leftGunPosition, leftLaserVelocity);
      addLaser(rightGunPosition, rightLaserVelocity);
    }
  });

  return null;
};

export default Player;