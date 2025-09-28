
import React, { useState, useRef, useCallback } from 'react';
import Game from './components/Game';
// FIX: The app was using the wrong UI component for the menu.
// The default export 'UI' is the in-game HUD and must be rendered inside a Canvas.
// 'AppUI' is the correct component for the out-of-game menus.
import { AppUI } from './components/UI';
import type { PointerLockControls as PointerLockControlsImpl } from 'three-stdlib';
import type { GameState } from './types';

export default function App() {
  const [gameState, setGameState] = useState<GameState>('intro');
  const [gameId, setGameId] = useState(0); // Used to force re-mount and reset Game state
  const controlsRef = useRef<PointerLockControlsImpl>(null);

  const startGame = useCallback(() => {
    if (controlsRef.current) {
      controlsRef.current.lock();
    }
  }, []);
  
  const restartGame = useCallback(() => {
    setGameId(prevId => prevId + 1);
    setGameState('intro');
  }, []);

  const onLock = useCallback(() => {
    // Don't start playing if the game is already over
    if (gameState !== 'won' && gameState !== 'lost') {
      setGameState('playing');
    }
  }, [gameState]);

  const onUnlock = useCallback(() => {
    // Only pause if the game is currently being played
    if (gameState === 'playing') {
      setGameState('paused');
    }
  }, [gameState]);

  return (
    <div className="w-screen h-screen bg-black text-white">
      {/* FIX: Use the correct AppUI component for menus. */}
      <AppUI gameState={gameState} startGame={startGame} restartGame={restartGame} />
      <Game 
        key={gameId} 
        ref={controlsRef} 
        onLock={onLock} 
        onUnlock={onUnlock} 
        setGameState={setGameState}
        isMuted={gameState !== 'playing'}
      />
    </div>
  );
}