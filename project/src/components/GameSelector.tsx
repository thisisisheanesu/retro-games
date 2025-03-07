import React from 'react';
import { Cake as SnakeIcon, Square, CircleDot, Grid } from 'lucide-react';

type Game = 'snake' | 'tetris' | 'pong' | 'breakout';

interface GameSelectorProps {
  currentGame: Game;
  onSelectGame: (game: Game) => void;
}

export function GameSelector({ currentGame, onSelectGame }: GameSelectorProps) {
  return (
    <div className="flex justify-center space-x-4 mb-6 flex-wrap gap-y-2">
      <button
        onClick={() => onSelectGame('snake')}
        className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
          currentGame === 'snake'
            ? 'bg-[#879372] text-black'
            : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
        }`}
      >
        <SnakeIcon className="w-4 h-4" />
        <span>Snake</span>
      </button>
      <button
        onClick={() => onSelectGame('tetris')}
        className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
          currentGame === 'tetris'
            ? 'bg-[#879372] text-black'
            : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
        }`}
      >
        <Square className="w-4 h-4" />
        <span>Tetris</span>
      </button>
      <button
        onClick={() => onSelectGame('pong')}
        className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
          currentGame === 'pong'
            ? 'bg-[#879372] text-black'
            : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
        }`}
      >
        <CircleDot className="w-4 h-4" />
        <span>Pong</span>
      </button>
      <button
        onClick={() => onSelectGame('breakout')}
        className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
          currentGame === 'breakout'
            ? 'bg-[#879372] text-black'
            : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
        }`}
      >
        <Grid className="w-4 h-4" />
        <span>Breakout</span>
      </button>
    </div>
  );
}