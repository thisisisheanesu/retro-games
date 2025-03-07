import React, { useState, useEffect, useCallback } from 'react';
import { HelpCircle } from 'lucide-react';

type Position = {
  x: number;
  y: number;
};

type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

const GRID_SIZE = 20;
const CELL_SIZE = 15;
const GAME_SPEED = 100;

export function Snake() {
  const [snake, setSnake] = useState<Position[]>([{ x: 10, y: 10 }]);
  const [food, setFood] = useState<Position>({ x: 15, y: 15 });
  const [direction, setDirection] = useState<Direction>('RIGHT');
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const generateFood = useCallback(() => {
    const newFood = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    };
    setFood(newFood);
  }, []);

  const resetGame = () => {
    setSnake([{ x: 10, y: 10 }]);
    setDirection('RIGHT');
    setGameOver(false);
    setScore(0);
    generateFood();
    setIsPaused(false);
  };

  const checkCollision = (head: Position) => {
    if (
      head.x < 0 ||
      head.x >= GRID_SIZE ||
      head.y < 0 ||
      head.y >= GRID_SIZE
    ) {
      return true;
    }

    for (let i = 1; i < snake.length; i++) {
      if (head.x === snake[i].x && head.y === snake[i].y) {
        return true;
      }
    }
    return false;
  };

  const moveSnake = useCallback(() => {
    if (gameOver || isPaused) return;

    const head = { ...snake[0] };
    switch (direction) {
      case 'UP':
        head.y -= 1;
        break;
      case 'DOWN':
        head.y += 1;
        break;
      case 'LEFT':
        head.x -= 1;
        break;
      case 'RIGHT':
        head.x += 1;
        break;
    }

    if (checkCollision(head)) {
      setGameOver(true);
      return;
    }

    const newSnake = [head];
    const ateFood = head.x === food.x && head.y === food.y;

    if (ateFood) {
      setScore(s => s + 1);
      generateFood();
    }

    for (let i = 0; i < snake.length - (ateFood ? 0 : 1); i++) {
      newSnake.push({ ...snake[i] });
    }

    setSnake(newSnake);
  }, [snake, direction, food, gameOver, isPaused, generateFood]);

  useEffect(() => {
    const gameLoop = setInterval(moveSnake, GAME_SPEED);
    return () => clearInterval(gameLoop);
  }, [moveSnake]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
          if (direction !== 'DOWN') setDirection('UP');
          break;
        case 'ArrowDown':
          if (direction !== 'UP') setDirection('DOWN');
          break;
        case 'ArrowLeft':
          if (direction !== 'RIGHT') setDirection('LEFT');
          break;
        case 'ArrowRight':
          if (direction !== 'LEFT') setDirection('RIGHT');
          break;
        case ' ':
          setIsPaused(p => !p);
          break;
        case 'h':
          setShowHelp(h => !h);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [direction]);

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative bg-[#879372] p-4 rounded-lg shadow-inner">
        <button
          onClick={() => setShowHelp(true)}
          className="absolute -top-2 -right-2 bg-[#879372] p-2 rounded-full hover:bg-[#626b51] transition-colors"
          title="Show Controls"
        >
          <HelpCircle className="w-5 h-5 text-[#2a2a2a]" />
        </button>
        <div className="grid grid-cols-20 gap-0 border-4 border-[#626b51]">
          {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => {
            const x = i % GRID_SIZE;
            const y = Math.floor(i / GRID_SIZE);
            const isSnake = snake.some(pos => pos.x === x && pos.y === y);
            const isFood = food.x === x && food.y === y;
            const isHead = snake[0].x === x && snake[0].y === y;

            return (
              <div
                key={i}
                style={{ width: CELL_SIZE, height: CELL_SIZE }}
                className={`${
                  isSnake
                    ? 'bg-[#2a2a2a] flex items-center justify-center text-xs'
                    : isFood
                    ? 'bg-[#2a2a2a] flex items-center justify-center text-xs'
                    : 'bg-[#a8b18a]'
                } border border-[#626b51]`}
              >
                {isHead ? '◆' : isSnake ? '■' : isFood ? '●' : ''}
              </div>
            );
          })}
        </div>
        {(gameOver || isPaused || showHelp) && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-[#879372] p-6 rounded-lg shadow-lg text-[#2a2a2a] text-center">
              {showHelp ? (
                <>
                  <h3 className="text-xl font-bold mb-4">Controls</h3>
                  <ul className="space-y-2 text-left mb-4">
                    <li>← → ↑ ↓ : Move snake</li>
                    <li>Space : Pause game</li>
                    <li>H : Show/hide help</li>
                  </ul>
                  <p className="text-sm mb-4">
                    Collect food (●) to grow longer.<br />
                    Don't hit the walls or yourself!
                  </p>
                  <button
                    onClick={() => setShowHelp(false)}
                    className="px-4 py-2 bg-[#2a2a2a] text-[#879372] rounded hover:bg-[#626b51]"
                  >
                    Close
                  </button>
                </>
              ) : (
                <>
                  <p className="text-xl font-bold mb-2">
                    {gameOver ? 'Game Over!' : 'Paused'}
                  </p>
                  {gameOver && (
                    <button
                      onClick={resetGame}
                      className="px-4 py-2 bg-[#2a2a2a] text-[#879372] rounded hover:bg-[#626b51]"
                    >
                      Play Again
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
      <div className="text-[#2a2a2a] text-xl font-bold">Score: {score}</div>
      <div className="text-sm text-gray-600">
        Press H for controls
      </div>
    </div>
  );
}