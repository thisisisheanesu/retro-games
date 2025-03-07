import React, { useState, useEffect, useCallback, useRef } from 'react';
import { HelpCircle } from 'lucide-react';

const CANVAS_WIDTH = 480;
const CANVAS_HEIGHT = 360;
const PADDLE_HEIGHT = 10;
const PADDLE_WIDTH = 75;
const BALL_SIZE = 8;
const INITIAL_BALL_SPEED = 4;
const BRICK_ROWS = 5;
const BRICK_COLS = 8;
const BRICK_HEIGHT = 20;
const BRICK_PADDING = 4;
const BRICK_COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD'];

interface Brick {
  x: number;
  y: number;
  width: number;
  color: string;
  visible: boolean;
}

export function Breakout() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [paddleX, setPaddleX] = useState(CANVAS_WIDTH / 2 - PADDLE_WIDTH / 2);
  const [ballX, setBallX] = useState(CANVAS_WIDTH / 2);
  const [ballY, setBallY] = useState(CANVAS_HEIGHT - 30);
  const [ballSpeedX, setBallSpeedX] = useState(INITIAL_BALL_SPEED);
  const [ballSpeedY, setBallSpeedY] = useState(-INITIAL_BALL_SPEED);
  const [bricks, setBricks] = useState<Brick[]>([]);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [gameWon, setGameWon] = useState(false);

  const initializeBricks = useCallback(() => {
    const brickWidth = (CANVAS_WIDTH - BRICK_PADDING * (BRICK_COLS + 1)) / BRICK_COLS;
    const newBricks: Brick[] = [];

    for (let row = 0; row < BRICK_ROWS; row++) {
      for (let col = 0; col < BRICK_COLS; col++) {
        newBricks.push({
          x: col * (brickWidth + BRICK_PADDING) + BRICK_PADDING,
          y: row * (BRICK_HEIGHT + BRICK_PADDING) + BRICK_PADDING + 30,
          width: brickWidth,
          color: BRICK_COLORS[row],
          visible: true,
        });
      }
    }
    return newBricks;
  }, []);

  const resetBall = useCallback(() => {
    setBallX(CANVAS_WIDTH / 2);
    setBallY(CANVAS_HEIGHT - 30);
    setBallSpeedX(INITIAL_BALL_SPEED * (Math.random() > 0.5 ? 1 : -1));
    setBallSpeedY(-INITIAL_BALL_SPEED);
  }, []);

  const resetGame = useCallback(() => {
    setPaddleX(CANVAS_WIDTH / 2 - PADDLE_WIDTH / 2);
    setScore(0);
    setLives(3);
    setGameOver(false);
    setGameWon(false);
    setBricks(initializeBricks());
    resetBall();
  }, [initializeBricks, resetBall]);

  useEffect(() => {
    setBricks(initializeBricks());
  }, [initializeBricks]);

  const drawGame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw bricks
    bricks.forEach(brick => {
      if (brick.visible) {
        ctx.fillStyle = brick.color;
        ctx.fillRect(brick.x, brick.y, brick.width, BRICK_HEIGHT);
      }
    });

    // Draw paddle
    ctx.fillStyle = '#879372';
    ctx.fillRect(paddleX, CANVAS_HEIGHT - PADDLE_HEIGHT - 10, PADDLE_WIDTH, PADDLE_HEIGHT);

    // Draw ball
    ctx.beginPath();
    ctx.arc(ballX, ballY, BALL_SIZE, 0, Math.PI * 2);
    ctx.fillStyle = '#879372';
    ctx.fill();

    // Draw score and lives
    ctx.font = '20px monospace';
    ctx.fillStyle = '#879372';
    ctx.fillText(`Score: ${score}`, 8, 20);
    ctx.fillText(`Lives: ${lives}`, CANVAS_WIDTH - 80, 20);
  }, [bricks, paddleX, ballX, ballY, score, lives]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (gameOver || isPaused) return;

      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const relativeX = e.clientX - rect.left;
      const newPaddleX = Math.max(
        0,
        Math.min(CANVAS_WIDTH - PADDLE_WIDTH, relativeX - PADDLE_WIDTH / 2)
      );
      setPaddleX(newPaddleX);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
          setPaddleX(x => Math.max(0, x - 20));
          break;
        case 'ArrowRight':
          setPaddleX(x => Math.min(CANVAS_WIDTH - PADDLE_WIDTH, x + 20));
          break;
        case 'p':
          setIsPaused(p => !p);
          break;
        case 'h':
          setShowHelp(h => !h);
          break;
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [gameOver, isPaused]);

  useEffect(() => {
    if (gameOver || isPaused) return;

    const gameLoop = setInterval(() => {
      setBallX(x => x + ballSpeedX);
      setBallY(y => y + ballSpeedY);

      // Ball collision with walls
      if (ballX <= BALL_SIZE || ballX >= CANVAS_WIDTH - BALL_SIZE) {
        setBallSpeedX(speed => -speed);
      }
      if (ballY <= BALL_SIZE) {
        setBallSpeedY(speed => -speed);
      }

      // Ball collision with paddle
      if (
        ballY >= CANVAS_HEIGHT - PADDLE_HEIGHT - BALL_SIZE - 10 &&
        ballY <= CANVAS_HEIGHT - BALL_SIZE &&
        ballX >= paddleX &&
        ballX <= paddleX + PADDLE_WIDTH
      ) {
        setBallSpeedY(speed => -Math.abs(speed));
        // Add angle based on where the ball hits the paddle
        const hitPosition = (ballX - paddleX) / PADDLE_WIDTH;
        setBallSpeedX(INITIAL_BALL_SPEED * (hitPosition * 2 - 1));
      }

      // Ball out of bounds
      if (ballY >= CANVAS_HEIGHT - BALL_SIZE) {
        setLives(l => {
          if (l - 1 <= 0) {
            setGameOver(true);
            return 0;
          }
          resetBall();
          return l - 1;
        });
      }

      // Ball collision with bricks
      setBricks(prevBricks => {
        let newBricks = [...prevBricks];
        let collision = false;

        for (let i = 0; i < newBricks.length; i++) {
          const brick = newBricks[i];
          if (!brick.visible) continue;

          if (
            ballX >= brick.x &&
            ballX <= brick.x + brick.width &&
            ballY >= brick.y &&
            ballY <= brick.y + BRICK_HEIGHT
          ) {
            newBricks[i] = { ...brick, visible: false };
            setBallSpeedY(speed => -speed);
            setScore(s => s + 10);
            collision = true;
            break;
          }
        }

        // Check if all bricks are destroyed
        if (!collision && newBricks.every(brick => !brick.visible)) {
          setGameWon(true);
          setGameOver(true);
        }

        return collision ? newBricks : prevBricks;
      });
    }, 1000 / 60);

    return () => clearInterval(gameLoop);
  }, [ballSpeedX, ballSpeedY, ballX, ballY, paddleX, gameOver, isPaused, resetBall]);

  useEffect(() => {
    const renderLoop = setInterval(drawGame, 1000 / 60);
    return () => clearInterval(renderLoop);
  }, [drawGame]);

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
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="border-4 border-[#626b51]"
        />
        {(gameOver || isPaused || showHelp) && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-[#879372] p-6 rounded-lg shadow-lg text-[#2a2a2a] text-center">
              {showHelp ? (
                <>
                  <h3 className="text-xl font-bold mb-4">Controls</h3>
                  <ul className="space-y-2 text-left mb-4">
                    <li>Mouse or ← → : Move paddle</li>
                    <li>P : Pause game</li>
                    <li>H : Show/hide help</li>
                  </ul>
                  <p className="text-sm mb-4">
                    Break all bricks to win!<br />
                    Don't let the ball fall!
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
                    {gameOver ? (gameWon ? 'You Won!' : 'Game Over!') : 'Paused'}
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
      <div className="text-sm text-gray-600">
        Press H for controls
      </div>
    </div>
  );
}