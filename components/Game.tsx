
import React, { forwardRef, useState, useMemo, useRef, useEffect, Suspense } from 'react';
// FIX: Switched to namespace import for `@react-three/fiber` to resolve module resolution issues.
import * as ReactThreeFiber from '@react-three/fiber';
import { PointerLockControls } from '@react-three/drei';
import * as THREE from 'three';
import type { PointerLockControls as PointerLockControlsImpl } from 'three-stdlib';

import Player from './Player';
import Starfield from './Starfield';
import Asteroids from './Asteroids';
import Planet from './Planet';
import Enemy from './Enemy';
import type { LaserData, EnemyData, GameState } from '../types';
import UI from './UI';

interface GameProps {
  onLock: () => void;
  onUnlock: () => void;
  setGameState: (state: GameState) => void;
  isMuted: boolean;
}

const LASER_MAX_DISTANCE = 400;
const INITIAL_PLAYER_HEALTH = 100;
const INITIAL_PLANET_HEALTH = 1000;
const WEAK_SPOT_POSITION = new THREE.Vector3(0, 0, -4999);
const WEAK_SPOT_RADIUS = 80;
const PLANET_POSITION = new THREE.Vector3(0, 0, -6000);
const PLANET_RADIUS = 1000;
const PLAYER_HITBOX_RADIUS = 4;

const Scene = ({ setGameState, isMuted }: { setGameState: (state: GameState) => void, isMuted: boolean }) => {
  const { camera } = ReactThreeFiber.useThree();
  const [lasers, setLasers] = useState<LaserData[]>([]);
  const [enemies] = useState<EnemyData[]>(() => {
    return Array.from({ length: 5 }, (_, i) => ({
      id: `enemy_${i}`,
      initialPosition: new THREE.Vector3((i - 2) * 80, Math.random() * 50 - 25, -400 - Math.random() * 200),
    }));
  });

  const [playerHealth, setPlayerHealth] = useState(INITIAL_PLAYER_HEALTH);
  const [planetHealth, setPlanetHealth] = useState(INITIAL_PLANET_HEALTH);

  const playerPositionRef = useRef(camera.position);

  // --- AUDIO SETUP ---
  const { listener, audioLoader } = useMemo(() => {
    const listener = new THREE.AudioListener();
    camera.add(listener);
    const audioLoader = new THREE.AudioLoader();
    return { listener, audioLoader };
  }, [camera]);
  
  const laserSound = useRef<THREE.Audio>();
  const backgroundMusic = useRef<THREE.Audio>();

  useEffect(() => {
    // Load laser sound
    audioLoader.load(
        'https://raw.githubusercontent.com/rbrown101010/soundsvideogame/main/quick_single_blaster-%25231-1758412448487.mp3',
        (buffer) => {
          const sound = new THREE.Audio(listener);
          sound.setBuffer(buffer);
          sound.setVolume(0.5);
          laserSound.current = sound;
        }
    );
    // Load and play background music
    audioLoader.load(
        'https://raw.githubusercontent.com/rbrown101010/soundsvideogame/main/Galactic%20Firestorm.mp3',
        (buffer) => {
            const music = new THREE.Audio(listener);
            music.setBuffer(buffer);
            music.setLoop(true);
            music.setVolume(0.25);
            backgroundMusic.current = music;
            if (!isMuted) music.play();
        }
    );
    return () => {
        camera.remove(listener);
        backgroundMusic.current?.stop();
    };
  }, [audioLoader, listener, camera, isMuted]);

  useEffect(() => {
    if (backgroundMusic.current) {
        if (isMuted) {
            backgroundMusic.current.pause();
        } else {
            backgroundMusic.current.play();
        }
    }
  }, [isMuted]);

  const playLaserSound = () => {
    if (laserSound.current?.isPlaying) {
      laserSound.current.stop();
    }
    laserSound.current?.play();
  };

  const addLaser = (position: THREE.Vector3, velocity: THREE.Vector3, type: 'player' | 'enemy') => {
    const quaternion = new THREE.Quaternion();
    const direction = velocity.clone().normalize();
    quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction);
    setLasers((prev) => [...prev, { id: Math.random().toString(), position: position.clone(), velocity: velocity.clone(), type, quaternion }]);
  };

  const addPlayerLaser = (position: THREE.Vector3, velocity: THREE.Vector3) => {
    addLaser(position, velocity, 'player');
    playLaserSound();
  };
  const addEnemyLaser = (position: THREE.Vector3, velocity: THREE.Vector3) => addLaser(position, velocity, 'enemy');

  ReactThreeFiber.useFrame((_, delta) => {
    playerPositionRef.current.copy(camera.position);

    const remainingLasers: LaserData[] = [];
    let planetDamage = 0;
    let playerDamage = 0;

    for (const laser of lasers) {
      laser.position.addScaledVector(laser.velocity, delta);
      let laserHit = false;

      if (laser.type === 'player' && laser.position.distanceTo(WEAK_SPOT_POSITION) < WEAK_SPOT_RADIUS) {
        planetDamage += 10;
        laserHit = true;
      } else if (laser.type === 'enemy' && laser.position.distanceTo(camera.position) < PLAYER_HITBOX_RADIUS) {
        playerDamage += 5;
        laserHit = true;
      }
      
      const distanceTravelled = laser.position.lengthSq(); // Simple check from origin
      if (!laserHit && distanceTravelled < (LASER_MAX_DISTANCE + 6000) ** 2) {
        remainingLasers.push(laser);
      }
    }

    if (planetDamage > 0) setPlanetHealth(h => Math.max(0, h - planetDamage));
    if (playerDamage > 0) setPlayerHealth(h => Math.max(0, h - playerDamage));

    setLasers(remainingLasers);
    
    // Check win/loss conditions
    if (planetHealth <= 0) setGameState('won');
    if (playerHealth <= 0) setGameState('lost');
    if (camera.position.distanceTo(PLANET_POSITION) < PLANET_RADIUS) setGameState('lost');
  });

  return (
    <>
      <ambientLight intensity={0.1} />
      <directionalLight position={[50, 50, 50]} intensity={1.0} />
      <Starfield />
      <Asteroids />
      <Planet />
      <Player addLaser={addPlayerLaser} />
      <Suspense fallback={null}>
        <UI playerHealth={playerHealth} planetHealth={planetHealth} />
      </Suspense>
      {enemies.map((enemy) => (
        <Enemy key={enemy.id} initialPosition={enemy.initialPosition} playerPosition={playerPositionRef.current} addLaser={addEnemyLaser} />
      ))}
      {lasers.map((laser) => (
        <mesh key={laser.id} position={laser.position} quaternion={laser.quaternion}>
          <cylinderGeometry args={[0.1, 0.1, 7, 8]} />
          <meshStandardMaterial color={laser.type === 'player' ? '#00ffff' : '#ff4444'} emissive={laser.type === 'player' ? '#00ffff' : '#ff0000'} emissiveIntensity={4} toneMapped={false} />
        </mesh>
      ))}
    </>
  );
};

const Game = forwardRef<PointerLockControlsImpl, GameProps>(({ onLock, onUnlock, setGameState, isMuted }, ref) => {
  return (
    <ReactThreeFiber.Canvas camera={{ fov: 75, position: [0, 0, 5], far: 10000 }}>
      <Scene setGameState={setGameState} isMuted={isMuted} />
      <PointerLockControls ref={ref} onLock={onLock} onUnlock={onUnlock} />
    </ReactThreeFiber.Canvas>
  );
});

export default Game;