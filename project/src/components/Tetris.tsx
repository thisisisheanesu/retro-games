import React, { useState, useEffect, useCallback } from 'react';
import { HelpCircle } from 'lucide-react';

type Position = {
  x: number;
  y: number;
};

type Piece = Position[];
type Grid = string[][];

const GRID_WIDTH = 10;
const GRID_HEIGHT = 20;
const CELL_SIZE = 25;

const TETROMINOS = {
  I: [[0, 0], [0, -1], [0, 1], [0, 2]],
  O: [[0, 0], [0, 1], [1, 0], [1, 1]],
  T: [[0, 0], [-1, 0], [1, 0], [0, 1]],
  S: [[0, 0], [-1, 0], [0, 1], [1, 1]],
  Z: [[0, 0], [1, 0], [0, 1], [-1, 1]],
  J: [[0, 0], [0, -1], [0, 1], [-1, 1]],
  L: [[0, 0], [0, -1], [0, 1], [1, 1]],
};

const COLORS = {
  I: '#00f0f0',
  O: '#f0f000',
  T: '#a000f0',
  S: '#00f000',
  Z: '#f00000',
  J: '#0000f0',
  L: '#f0a000',
};

export function Tetris() {
  const [grid, setGrid] = useState<Grid>([]);
  const [currentPiece, setCurrentPiece] = useState<Piece>([]);
  const [currentPos, setCurrentPos] = useState<Position>({ x: 0, y: 0 });
  const [currentType, setCurrentType] = useState<keyof typeof TETROMINOS>('I');
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [level, setLevel] = useState(1);
  const [dropSpeed, setDropSpeed] = useState(1000);

  const initializeGrid = useCallback(() => {
    const newGrid: Grid = [];
    for (let y = 0; y < GRID_HEIGHT; y++) {
      newGrid[y] = Array(GRID_WIDTH).fill('');
    }
    return newGrid;
  }, []);

  const spawnPiece = useCallback(() => {
    const types = Object.keys(TETROMINOS) as (keyof typeof TETROMINOS)[];
    const type = types[Math.floor(Math.random() * types.length)];
    const piece = TETROMINOS[type].map(([x, y]) => ({ x, y }));
    setCurrentType(type);
    setCurrentPiece(piece);
    setCurrentPos({ x: Math.floor(GRID_WIDTH / 2), y: 1 });
  }, []);

  const resetGame = useCallback(() => {
    setGrid(initializeGrid());
    setScore(0);
    setLevel(1);
    setDropSpeed(1000);
    setGameOver(false);
    setIsPaused(false);
    spawnPiece();
  }, [initializeGrid, spawnPiece]);

  useEffect(() => {
    resetGame();
  }, [resetGame]);

  const isValidMove = useCallback(
    (piece: Piece, pos: Position) => {
      return piece.every(({ x, y }) => {
        const newX = x + pos.x;
        const newY = y + pos.y;
        return (
          newX >= 0 &&
          newX < GRID_WIDTH &&
          newY >= 0 &&
          newY < GRID_HEIGHT &&
          (!grid[newY] || !grid[newY][newX])
        );
      });
    },
    [grid]
  );

  const rotatePiece = useCallback(() => {
    const rotated = currentPiece.map(({ x, y }) => ({
      x: -y,
      y: x,
    }));
    if (isValidMove(rotated, currentPos)) {
      setCurrentPiece(rotated);
    }
  }, [currentPiece, currentPos, isValidMove]);

  const mergePiece = useCallback(() => {
    const newGrid = grid.map(row => [...row]);
    currentPiece.forEach(({ x, y }) => {
      const newX = x + currentPos.x;
      const newY = y + currentPos.y;
      if (newY >= 0) {
        newGrid[newY][newX] = currentType;
      }
    });
    return newGrid;
  }, [grid, currentPiece, currentPos, currentType]);

  const clearLines = useCallback((newGrid: Grid) => {
    let linesCleared = 0;
    const clearedGrid = newGrid.filter(row => {
      const isLineFull = row.every(cell => cell !== '');
      if (isLineFull) linesCleared++;
      return !isLineFull;
    });

    while (clearedGrid.length < GRID_HEIGHT) {
      clearedGrid.unshift(Array(GRID_WIDTH).fill(''));
    }

    if (linesCleared > 0) {
      setScore(prev => prev + linesCleared * 100 * level);
      if (score > level * 1000) {
        setLevel(prev => prev + 1);
        setDropSpeed(prev => Math.max(100, prev * 0.8));
      }
    }

    return clearedGrid;
  }, [level, score]);

  const movePiece = useCallback(
    (dx: number, dy: number) => {
      const newPos = { x: currentPos.x + dx, y: currentPos.y + dy };
      if (isValidMove(currentPiece, newPos)) {
        setCurrentPos(newPos);
        return true;
      }
      return false;
    },
    [currentPiece, currentPos, isValidMove]
  );

  const dropPiece = useCallback(() => {
    if (!movePiece(0, 1)) {
      const newGrid = mergePiece();
      setGrid(clearLines(newGrid));
      spawnPiece();
      return false;
    }
    return true;
  }, [movePiece, mergePiece, clearLines, spawnPiece]);

  useEffect(() => {
    if (gameOver || isPaused) return;

    const interval = setInterval(() => {
      if (!dropPiece()) {
        if (!isValidMove(currentPiece, currentPos)) {
          setGameOver(true);
        }
      }
    }, dropSpeed);

    return () => clearInterval(interval);
  }, [gameOver, isPaused, dropPiece, currentPiece, currentPos, isValidMove, dropSpeed]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (gameOver || isPaused) return;

      switch (e.key) {
        case 'ArrowLeft':
          movePiece(-1, 0);
          break;
        case 'ArrowRight':
          movePiece(1, 0);
          break;
        case 'ArrowDown':
          movePiece(0, 1);
          break;
        case 'ArrowUp':
          rotatePiece();
          break;
        case ' ':
          while (dropPiece()) {}
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
  }, [gameOver, isPaused, movePiece, rotatePiece, dropPiece]);

  const renderCell = (cell: string, x: number, y: number) => {
    const isPieceCell = currentPiece.some(
      p => p.x + currentPos.x === x && p.y + currentPos.y === y
    );
    const color = isPieceCell ? COLORS[currentType] : cell ? COLORS[cell as keyof typeof COLORS] : '';

    return (
      <div
        key={`${x}-${y}`}
        className="border border-gray-700"
        style={{
          width: CELL_SIZE,
          height: CELL_SIZE,
          backgroundColor: color || '#2a2a2a',
        }}
      />
    );
  };

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
        <div className="border-4 border-[#626b51] bg-[#2a2a2a]">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${GRID_WIDTH}, ${CELL_SIZE}px)`,
              gap: '0px',
            }}
          >
            {grid.map((row, y) =>
              row.map((cell, x) => renderCell(cell, x, y))
            )}
          </div>
        </div>
        {(gameOver || isPaused || showHelp) && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-[#879372] p-6 rounded-lg shadow-lg text-[#2a2a2a] text-center">
              {showHelp ? (
                <>
                  <h3 className="text-xl font-bold mb-4">Controls</h3>
                  <ul className="space-y-2 text-left mb-4">
                    <li>← → : Move piece</li>
                    <li>↑ : Rotate piece</li>
                    <li>↓ : Move down</li>
                    <li>Space : Drop piece</li>
                    <li>P : Pause game</li>
                    <li>H : Show/hide help</li>
                  </ul>
                  <p className="text-sm mb-4">
                    Clear lines to score points!<br />
                    Level up every 1000 points!
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
      <div className="flex justify-between w-full max-w-[250px]">
        <div className="text-[#2a2a2a] text-xl font-bold">Score: {score}</div>
        <div className="text-[#2a2a2a] text-xl font-bold">Level: {level}</div>
      </div>
      <div className="text-sm text-gray-600">
        Press H for controls
      </div>
    </div>
  );
}