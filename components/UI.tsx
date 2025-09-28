import React from 'react';
import { Html } from '@react-three/drei';
import type { GameState } from '../types';

// --- TYPE DEFINITIONS ---
interface InGameUIProps {
  playerHealth: number;
  planetHealth: number;
}
interface MenuUIProps {
  gameState: GameState;
  startGame?: () => void;
  restartGame?: () => void;
}

// --- INDIVIDUAL MENU COMPONENTS ---
const IntroMenu: React.FC = () => (
  <>
    <h1 className="text-6xl font-bold tracking-widest text-cyan-400 mb-4 animate-pulse-slow">SOLAR SAVERS</h1>
    <p className="text-xl text-white mb-8">Click anywhere to begin your mission</p>
    <div className="text-left max-w-md mx-auto bg-gray-900/50 p-4 rounded border border-gray-700">
      <h2 className="text-lg font-bold text-cyan-400 mb-2">Controls:</h2>
      <ul className="list-inside list-disc text-white">
        <li><span className="font-bold text-cyan-500">Mouse:</span> Look / Aim</li>
        <li><span className="font-bold text-cyan-500">W / S:</span> Move Up / Down</li>
        <li><span className="font-bold text-cyan-500">A / D:</span> Strafe Left / Right</li>
        <li><span className="font-bold text-cyan-500">Spacebar:</span> Fire Laser</li>
        <li><span className="font-bold text-cyan-500">ESC:</span> Pause Game</li>
      </ul>
      <p className="mt-4 text-xs text-gray-400">Note: Ship accelerates forward automatically.</p>
    </div>
  </>
);

const PauseMenu: React.FC = () => (
    <>
      <h1 className="text-5xl font-bold text-cyan-400 mb-4">PAUSED</h1>
      <p className="text-lg text-white">Press ESC to resume</p>
    </>
);

const WinMenu: React.FC<{onRestart: () => void}> = ({ onRestart }) => (
    <>
      <h1 className="text-5xl font-bold text-green-400 mb-4">MISSION ACCOMPLISHED</h1>
      <p className="text-lg text-white mb-8">The planet has been neutralized. Well done, Saver.</p>
      <button onClick={onRestart} className="px-6 py-2 bg-cyan-600 hover:bg-cyan-500 rounded text-white font-bold tracking-wider">
        PLAY AGAIN
      </button>
    </>
);

const LoseMenu: React.FC<{onRestart: () => void}> = ({ onRestart }) => (
    <>
      <h1 className="text-5xl font-bold text-red-500 mb-4">GAME OVER</h1>
      <p className="text-lg text-white mb-8">Your ship has been destroyed. The system remains in peril.</p>
      <button onClick={onRestart} className="px-6 py-2 bg-cyan-600 hover:bg-cyan-500 rounded text-white font-bold tracking-wider">
        RESTART MISSION
      </button>
    </>
);


// --- UI COMPONENT EXPORTS ---

/**
 * AppUI: The main UI for the application, including menus and crosshair.
 * This component should be rendered OUTSIDE the R3F Canvas.
 */
export const AppUI: React.FC<MenuUIProps> = ({ gameState, startGame, restartGame }) => {
  const showCrosshair = gameState === 'playing';
  const isMenuVisible = gameState !== 'playing';

  return (
    <>
      {showCrosshair && (
        <div className="pointer-events-none fixed inset-0 flex items-center justify-center z-10">
          <div className="w-1 h-8 bg-cyan-400 opacity-50"></div>
          <div className="w-8 h-1 bg-cyan-400 opacity-50 absolute"></div>
        </div>
      )}
      {isMenuVisible && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-20"
          onClick={gameState === 'intro' ? startGame : undefined}
          style={{ cursor: gameState === 'intro' ? 'pointer' : 'default' }}
        >
          <div className="text-center text-cyan-300 bg-black/50 p-12 rounded-lg shadow-2xl shadow-cyan-500/20 border border-cyan-700">
              {gameState === 'intro' && <IntroMenu />}
              {gameState === 'paused' && <PauseMenu />}
              {gameState === 'won' && <WinMenu onRestart={restartGame!} />}
              {gameState === 'lost' && <LoseMenu onRestart={restartGame!} />}
          </div>
        </div>
      )}
    </>
  );
};


/**
 * UI: The in-game heads-up display (HUD) with health bars.
 * This component MUST be rendered INSIDE the R3F Canvas.
 */
const UI: React.FC<InGameUIProps> = ({ playerHealth, planetHealth }) => {
  return (
    <Html fullscreen style={{ pointerEvents: 'none' }}>
      <div className="absolute bottom-4 left-4 w-64">
        <p className="text-cyan-400">SHIP INTEGRITY</p>
        <div className="w-full bg-gray-800 rounded-full h-4 border-2 border-cyan-600">
          <div
            className="bg-cyan-400 h-full rounded-full transition-all duration-300"
            style={{ width: `${playerHealth}%` }}
          />
        </div>
      </div>
      <div className="absolute bottom-4 right-4 w-64">
        <p className="text-red-400 text-right">PLANETARY CORE</p>
        <div className="w-full bg-gray-800 rounded-full h-4 border-2 border-red-600">
          <div
            className="bg-red-500 h-full rounded-full transition-all duration-300"
            style={{ width: `${(planetHealth / 1000) * 100}%` }}
          />
        </div>
      </div>
    </Html>
  );
};

export default UI;
