import React, { useState, useEffect, useCallback } from 'react';
import { HelpCircle } from 'lucide-react';

type Position = {
  x: number;
  y: number;
};

const GRID_SIZE = 20;
const CELL_SIZE = 15;
const GAME_SPEED = 50;
const ENEMY_ROWS = 3;
const ENEMIES_PER_ROW = 8;
const INITIAL_MOVE_INTERVAL = 800;
const SPEED_INCREASE_INTERVAL = 10000; // Speed increases every 10 seconds
const SPEED_INCREASE_FACTOR = 0.9; // Each speed increase makes movement 10% faster
const MIN_MOVE_INTERVAL = 200; // Fastest possible movement speed

export function SpaceInvaders() {
  const [player, setPlayer] = useState<Position>({ x: 10, y: 18 });
  const [bullets, setBullets] = useState<Position[]>([]);
  const [enemies, setEnemies] = useState<Position[]>([]);
  const [enemyDirection, setEnemyDirection] = useState<1 | -1>(1);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [moveInterval, setMoveInterval] = useState(INITIAL_MOVE_INTERVAL);

  const initializeEnemies = useCallback(() => {
    const newEnemies: Position[] = [];
    for (let row = 0; row < ENEMY_ROWS; row++) {
      for (let col = 0; col < ENEMIES_PER_ROW; col++) {
        newEnemies.push({
          x: col * 2 + 2,
          y: row + 2,
        });
      }
    }
    setEnemies(newEnemies);
    setMoveInterval(INITIAL_MOVE_INTERVAL);
  }, []);

  const resetGame = () => {
    setPlayer({ x: 10, y: 18 });
    setBullets([]);
    initializeEnemies();
    setEnemyDirection(1);
    setGameOver(false);
    setScore(0);
    setIsPaused(false);
  };

  useEffect(() => {
    initializeEnemies();
  }, [initializeEnemies]);

  // Increase enemy speed over time
  useEffect(() => {
    if (gameOver || isPaused) return;

    const speedInterval = setInterval(() => {
      setMoveInterval(current => {
        const newInterval = current * SPEED_INCREASE_FACTOR;
        return Math.max(newInterval, MIN_MOVE_INTERVAL);
      });
    }, SPEED_INCREASE_INTERVAL);

    return () => clearInterval(speedInterval);
  }, [gameOver, isPaused]);

  // Regular side-to-side movement with random variations
  const moveEnemies = useCallback(() => {
    if (gameOver || isPaused || enemies.length === 0) return;

    const leftmostEnemy = Math.min(...enemies.map(e => e.x));
    const rightmostEnemy = Math.max(...enemies.map(e => e.x));
    const lowestEnemy = Math.max(...enemies.map(e => e.y));

    if (lowestEnemy >= player.y - 1) {
      setGameOver(true);
      return;
    }

    let newDirection = enemyDirection;
    let moveDown = false;

    if (
      (rightmostEnemy >= GRID_SIZE - 2 && enemyDirection === 1) ||
      (leftmostEnemy <= 1 && enemyDirection === -1)
    ) {
      newDirection = (enemyDirection * -1) as 1 | -1;
      moveDown = true;
    }

    setEnemies(prev =>
      prev.map(enemy => ({
        x: moveDown
          ? enemy.x
          : Math.max(
              1,
              Math.min(
                GRID_SIZE - 2,
                enemy.x + newDirection + (Math.random() > 0.9 ? newDirection : 0)
              )
            ),
        y: enemy.y + (moveDown ? 1 : 0) + (Math.random() > 0.95 ? 1 : 0),
      }))
    );
    setEnemyDirection(newDirection);
  }, [enemies, enemyDirection, gameOver, isPaused, player.y]);

  // Regular movement interval
  useEffect(() => {
    const interval = setInterval(moveEnemies, moveInterval);
    return () => clearInterval(interval);
  }, [moveEnemies, moveInterval]);

  const moveBullets = useCallback(() => {
    if (gameOver || isPaused) return;

    setBullets(prev => {
      const newBullets = prev
        .map(bullet => ({ ...bullet, y: bullet.y - 1 }))
        .filter(bullet => bullet.y >= 0);

      setEnemies(prevEnemies => {
        const remainingEnemies = prevEnemies.filter(enemy => {
          const hit = newBullets.some(
            bullet => bullet.x === enemy.x && bullet.y === enemy.y
          );
          if (hit) {
            setScore(s => s + 10);
          }
          return !hit;
        });

        if (remainingEnemies.length === 0) {
          initializeEnemies();
          setScore(s => s + 50);
        }

        return remainingEnemies;
      });

      return newBullets.filter(bullet => {
        return !enemies.some(
          enemy => bullet.x === enemy.x && bullet.y === enemy.y
        );
      });
    });
  }, [gameOver, isPaused, enemies, initializeEnemies]);

  useEffect(() => {
    const gameLoop = setInterval(moveBullets, GAME_SPEED);
    return () => clearInterval(gameLoop);
  }, [moveBullets]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (gameOver) return;

      switch (e.key) {
        case 'ArrowLeft':
          setPlayer(p => ({
            ...p,
            x: Math.max(0, p.x - 1),
          }));
          break;
        case 'ArrowRight':
          setPlayer(p => ({
            ...p,
            x: Math.min(GRID_SIZE - 1, p.x + 1),
          }));
          break;
        case ' ':
          if (e.target === document.body) {
            e.preventDefault();
          }
          if (!isPaused) {
            setBullets(prev => {
              if (prev.length < 3) {
                return [...prev, { x: player.x, y: player.y - 1 }];
              }
              return prev;
            });
          }
          break;
        case 'p':
          setIsPaused(p => !p);
          break;
        case 'h':
          setShowHelp(h => !h);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameOver, isPaused, player.x, player.y]);

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
        <div 
          className="grid gap-0 border-4 border-[#626b51]"
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${GRID_SIZE}, ${CELL_SIZE}px)`,
            width: `${GRID_SIZE * CELL_SIZE}px`,
            height: `${GRID_SIZE * CELL_SIZE}px`
          }}
        >
          {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => {
            const x = i % GRID_SIZE;
            const y = Math.floor(i / GRID_SIZE);
            const isPlayer = player.x === x && player.y === y;
            const enemy = enemies.find(e => e.x === x && e.y === y);
            const isBullet = bullets.some(b => b.x === x && b.y === y);

            let cellContent = '';
            if (isPlayer) {
              cellContent = '▲';
            } else if (enemy) {
              cellContent = '👾';
            } else if (isBullet) {
              cellContent = '•';
            }

            return (
              <div
                key={i}
                style={{ width: CELL_SIZE, height: CELL_SIZE }}
                className={`${
                  cellContent
                    ? 'bg-[#2a2a2a] text-[#879372] flex items-center justify-center text-xs'
                    : 'bg-[#a8b18a]'
                } border border-[#626b51]`}
              >
                {cellContent}
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
                    <li>← → : Move ship</li>
                    <li>Space : Shoot</li>
                    <li>P : Pause game</li>
                    <li>H : Show/hide help</li>
                  </ul>
                  <p className="text-sm mb-4">
                    Shoot the aliens before they reach you!<br />
                    Watch out - they get faster and more unpredictable!
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