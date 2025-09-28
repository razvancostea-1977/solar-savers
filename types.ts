import type { Vector3, Quaternion } from 'three';

export interface Controls {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
  fire: boolean;
}

export interface LaserData {
  id: string;
  position: Vector3;
  velocity: Vector3;
  type: 'player' | 'enemy';
  quaternion: Quaternion;
}

export interface EnemyData {
  id: string;
  initialPosition: Vector3;
}

export type GameState = 'intro' | 'playing' | 'paused' | 'won' | 'lost';
