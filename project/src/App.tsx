import React, { useState } from 'react';
import { Snake } from './components/Snake';
import { Tetris } from './components/Tetris';
import { Pong } from './components/Pong';
import { Breakout } from './components/Breakout';
import { GameSelector } from './components/GameSelector';
import { Smartphone, Github, Twitter, Heart, Coffee } from 'lucide-react';

type Game = 'snake' | 'tetris' | 'pong' | 'breakout';

function App() {
  const [currentGame, setCurrentGame] = useState<Game>('snake');

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="bg-gray-800 p-8 rounded-3xl shadow-2xl max-w-md w-full">
          <div className="flex items-center justify-center mb-6 space-x-2">
            <Smartphone className="w-6 h-6 text-gray-400" />
            <h1 className="text-2xl font-bold text-gray-200">Retro Games</h1>
          </div>
          <GameSelector currentGame={currentGame} onSelectGame={setCurrentGame} />
          <div className="bg-gray-700 rounded-2xl p-6 shadow-inner">
            {currentGame === 'snake' ? (
              <Snake />
            ) : currentGame === 'tetris' ? (
              <Tetris />
            ) : currentGame === 'pong' ? (
              <Pong />
            ) : (
              <Breakout />
            )}
          </div>
          
          <div className="mt-8 pt-6 border-t border-gray-700">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <Heart className="w-5 h-5 text-red-500" />
                <h2 className="text-lg font-semibold text-gray-300">Support</h2>
              </div>
              <a
                href="https://buymeacoffee.com/thisisisheanesu"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center px-4 py-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors group mx-auto max-w-xs"
              >
                <Coffee className="w-5 h-5 text-gray-300 group-hover:text-gray-200 mr-2" />
                <div className="text-center">
                  <div className="text-sm font-medium text-gray-300 group-hover:text-gray-200">Buy me a coffee</div>
                  <div className="text-xs text-gray-400 group-hover:text-gray-300">Support my work</div>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
      <footer className="bg-gray-800 py-4">
        <div className="container mx-auto px-4 flex justify-center space-x-6">
          <a
            href="https://twitter.com/thisisisisheanesu"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-gray-300 transition-colors"
            aria-label="Twitter Profile"
          >
            <Twitter className="w-6 h-6" />
          </a>
          <a
            href="https://github.com/thisisisisheanesu"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-gray-300 transition-colors"
            aria-label="GitHub Profile"
          >
            <Github className="w-6 h-6" />
          </a>
        </div>
      </footer>
    </div>
  );
}

export default App;