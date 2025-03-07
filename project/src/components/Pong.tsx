import React, { useState, useEffect, useCallback, useRef } from 'react';
import { HelpCircle } from 'lucide-react';

const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 400;
const PADDLE_HEIGHT = 60;
const PADDLE_WIDTH = 10;
const BALL_SIZE = 8;
const BALL_SPEED = 5;
const PADDLE_SPEED = 8;
const WINNING_SCORE = 5;

export function Pong() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [leftPaddleY, setLeftPaddleY] = useState(CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2);
  const [rightPaddleY, setRightPaddleY] = useState(CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2);
  const [ballX, setBallX] = useState(CANVAS_WIDTH / 2);
  const [ballY, setBallY] = useState(CANVAS_HEIGHT / 2);
  const [ballSpeedX, setBallSpeedX] = useState(BALL_SPEED);
  const [ballSpeedY, setBallSpeedY] = useState(BALL_SPEED);
  const [leftScore, setLeftScore] = useState(0);
  const [rightScore, setRightScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [winner, setWinner] = useState<'left' | 'right' | null>(null);

  const resetBall = useCallback(() => {
    setBallX(CANVAS_WIDTH / 2);
    setBallY(CANVAS_HEIGHT / 2);
    setBallSpeedX(BALL_SPEED * (Math.random() > 0.5 ? 1 : -1));
    setBallSpeedY(BALL_SPEED * (Math.random() > 0.5 ? 1 : -1));
  }, []);

  const resetGame = useCallback(() => {
    setLeftPaddleY(CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2);
    setRightPaddleY(CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2);
    setLeftScore(0);
    setRightScore(0);
    setGameOver(false);
    setWinner(null);
    resetBall();
  }, [resetBall]);

  const drawGame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw center line
    ctx.setLineDash([5, 15]);
    ctx.beginPath();
    ctx.moveTo(CANVAS_WIDTH / 2, 0);
    ctx.lineTo(CANVAS_WIDTH / 2, CANVAS_HEIGHT);
    ctx.strokeStyle = '#879372';
    ctx.stroke();

    // Draw paddles
    ctx.fillStyle = '#879372';
    ctx.fillRect(0, leftPaddleY, PADDLE_WIDTH, PADDLE_HEIGHT);
    ctx.fillRect(CANVAS_WIDTH - PADDLE_WIDTH, rightPaddleY, PADDLE_WIDTH, PADDLE_HEIGHT);

    // Draw ball
    ctx.beginPath();
    ctx.arc(ballX, ballY, BALL_SIZE, 0, Math.PI * 2);
    ctx.fillStyle = '#879372';
    ctx.fill();

    // Draw scores
    ctx.font = '48px monospace';
    ctx.fillStyle = '#879372';
    ctx.fillText(leftScore.toString(), CANVAS_WIDTH / 4, 60);
    ctx.fillText(rightScore.toString(), (CANVAS_WIDTH * 3) / 4, 60);
  }, [ballX, ballY, leftPaddleY, rightPaddleY, leftScore, rightScore]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameOver || isPaused) return;

      switch (e.key) {
        case 'w':
          setLeftPaddleY(prev => Math.max(0, prev - PADDLE_SPEED));
          break;
        case 's':
          setLeftPaddleY(prev => Math.min(CANVAS_HEIGHT - PADDLE_HEIGHT, prev + PADDLE_SPEED));
          break;
        case 'ArrowUp':
          setRightPaddleY(prev => Math.max(0, prev - PADDLE_SPEED));
          break;
        case 'ArrowDown':
          setRightPaddleY(prev => Math.min(CANVAS_HEIGHT - PADDLE_HEIGHT, prev + PADDLE_SPEED));
          break;
        case 'p':
          setIsPaused(p => !p);
          break;
        case 'h':
          setShowHelp(h => !h);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameOver, isPaused]);

  useEffect(() => {
    if (gameOver || isPaused) return;

    const gameLoop = setInterval(() => {
      setBallX(x => x + ballSpeedX);
      setBallY(y => y + ballSpeedY);

      // Ball collision with top and bottom
      if (ballY <= BALL_SIZE || ballY >= CANVAS_HEIGHT - BALL_SIZE) {
        setBallSpeedY(speed => -speed);
      }

      // Ball collision with paddles
      if (
        (ballX <= PADDLE_WIDTH + BALL_SIZE &&
          ballY >= leftPaddleY &&
          ballY <= leftPaddleY + PADDLE_HEIGHT) ||
        (ballX >= CANVAS_WIDTH - PADDLE_WIDTH - BALL_SIZE &&
          ballY >= rightPaddleY &&
          ballY <= rightPaddleY + PADDLE_HEIGHT)
      ) {
        setBallSpeedX(speed => -speed * 1.1);
        setBallSpeedY(speed => speed * 1.1);
      }

      // Ball out of bounds
      if (ballX <= 0) {
        setRightScore(s => {
          if (s + 1 >= WINNING_SCORE) {
            setGameOver(true);
            setWinner('right');
            return s;
          }
          return s + 1;
        });
        resetBall();
      } else if (ballX >= CANVAS_WIDTH) {
        setLeftScore(s => {
          if (s + 1 >= WINNING_SCORE) {
            setGameOver(true);
            setWinner('left');
            return s;
          }
          return s + 1;
        });
        resetBall();
      }
    }, 1000 / 60);

    return () => clearInterval(gameLoop);
  }, [ballSpeedX, ballSpeedY, ballX, ballY, leftPaddleY, rightPaddleY, gameOver, isPaused, resetBall]);

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
                    <li>W/S : Move left paddle</li>
                    <li>↑/↓ : Move right paddle</li>
                    <li>P : Pause game</li>
                    <li>H : Show/hide help</li>
                  </ul>
                  <p className="text-sm mb-4">
                    First to {WINNING_SCORE} points wins!<br />
                    Ball speeds up with each hit!
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
                    {gameOver ? `${winner === 'left' ? 'Left' : 'Right'} Player Wins!` : 'Paused'}
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