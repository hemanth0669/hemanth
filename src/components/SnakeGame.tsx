import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Point } from '../constants';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, RefreshCcw } from 'lucide-react';

const GRID_SIZE = 20;
const INITIAL_SNAKE: Point[] = [
  { x: 10, y: 10 },
  { x: 10, y: 11 },
  { x: 10, y: 12 },
];
const INITIAL_DIRECTION: Point = { x: 0, y: -1 };

interface SnakeGameProps {
  onScoreUpdate: (score: number) => void;
}

export const SnakeGame: React.FC<SnakeGameProps> = ({ onScoreUpdate }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [snake, setSnake] = useState<Point[]>(INITIAL_SNAKE);
  const [food, setFood] = useState<Point>({ x: 5, y: 5 });
  const [direction, setDirection] = useState<Point>(INITIAL_DIRECTION);
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [highScore, setHighScore] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    onScoreUpdate(score);
  }, [score, onScoreUpdate]);
  
  const gameLoopRef = useRef<number>(0);
  const lastUpdateRef = useRef<number>(0);
  const directionQueueRef = useRef<Point[]>([]);

  const generateFood = useCallback((currentSnake: Point[]): Point => {
    let newFood;
    while (true) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
      if (!currentSnake.some(segment => segment.x === newFood.x && segment.y === newFood.y)) {
        break;
      }
    }
    return newFood;
  }, []);

  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    setScore(0);
    setIsGameOver(false);
    setFood(generateFood(INITIAL_SNAKE));
    directionQueueRef.current = [];
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      let nextDir: Point | null = null;
      switch (e.key) {
        case 'ArrowUp':
          if (direction.y === 0) nextDir = { x: 0, y: -1 };
          break;
        case 'ArrowDown':
          if (direction.y === 0) nextDir = { x: 0, y: 1 };
          break;
        case 'ArrowLeft':
          if (direction.x === 0) nextDir = { x: -1, y: 0 };
          break;
        case 'ArrowRight':
          if (direction.x === 0) nextDir = { x: 1, y: 0 };
          break;
        case 'p':
        case 'P':
          setIsPaused(prev => !prev);
          break;
      }
      
      if (nextDir) {
        const lastQueued = directionQueueRef.current[directionQueueRef.current.length - 1] || direction;
        if ((nextDir.x !== -lastQueued.x || nextDir.x === 0) && (nextDir.y !== -lastQueued.y || nextDir.y === 0)) {
           directionQueueRef.current.push(nextDir);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [direction]);

  const update = useCallback((timestamp: number) => {
    if (isGameOver || isPaused) {
      gameLoopRef.current = requestAnimationFrame(update);
      return;
    }

    const speed = Math.max(50, 150 - Math.floor(score / 5) * 10);
    if (timestamp - lastUpdateRef.current < speed) {
      gameLoopRef.current = requestAnimationFrame(update);
      return;
    }
    lastUpdateRef.current = timestamp;

    setSnake(prevSnake => {
      const currentDirection = directionQueueRef.current.shift() || direction;
      setDirection(currentDirection);

      const head = prevSnake[0];
      const newHead = {
        x: (head.x + currentDirection.x + GRID_SIZE) % GRID_SIZE,
        y: (head.y + currentDirection.y + GRID_SIZE) % GRID_SIZE,
      };

      // Collision detection
      if (prevSnake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
        setIsGameOver(true);
        if (score > highScore) setHighScore(score);
        return prevSnake;
      }

      const newSnake = [newHead, ...prevSnake];

      // Check if food eaten
      if (newHead.x === food.x && newHead.y === food.y) {
        setScore(s => s + 1);
        setFood(generateFood(newSnake));
      } else {
        newSnake.pop();
      }

      return newSnake;
    });

    gameLoopRef.current = requestAnimationFrame(update);
  }, [food, isGameOver, isPaused, score, highScore, direction, generateFood]);

  useEffect(() => {
    gameLoopRef.current = requestAnimationFrame(update);
    return () => cancelAnimationFrame(gameLoopRef.current);
  }, [update]);

  // Draw loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = canvas.width / GRID_SIZE;

    // Clear
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid lines subtly
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= GRID_SIZE; i++) {
      ctx.beginPath();
      ctx.moveTo(i * size, 0);
      ctx.lineTo(i * size, canvas.height);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i * size);
      ctx.lineTo(canvas.width, i * size);
      ctx.stroke();
    }

    // Draw snake
    snake.forEach((segment, index) => {
      if (index === 0) {
        ctx.fillStyle = '#22d3ee';
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#22d3ee';
      } else {
        ctx.fillStyle = '#164e63'; // Dark cyan for body
        ctx.shadowBlur = 0;
      }

      ctx.beginPath();
      ctx.roundRect(segment.x * size + 1, segment.y * size + 1, size - 2, size - 2, index === 0 ? 6 : 4);
      ctx.fill();
    });
    ctx.shadowBlur = 0;

    // Draw food
    ctx.fillStyle = '#f472b6';
    ctx.shadowBlur = 20;
    ctx.shadowColor = '#f472b6';
    ctx.beginPath();
    ctx.arc((food.x + 0.5) * size, (food.y + 0.5) * size, size / 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

  }, [snake, food]);

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex justify-between w-full max-w-[400px] mb-2 px-4 font-mono hidden">
        {/* Scores moved to header in App.tsx */}
      </div>

      <div className="relative group">
        <canvas
          ref={canvasRef}
          width={400}
          height={400}
          className="rounded-lg border-2 border-neon-cyan snake-grid shadow-2xl shadow-cyan-500/5"
        />
        
        <AnimatePresence>
          {isGameOver && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/90 backdrop-blur-sm rounded-lg"
            >
              <h2 className="text-4xl font-black neon-magenta mb-2 tracking-tighter uppercase italic underline decoration-pink-500/30">Game Over</h2>
              <p className="text-slate-400 mb-6 font-mono text-xs uppercase tracking-widest">Final Score: {score}</p>
              <button
                onClick={resetGame}
                className="flex items-center gap-2 px-6 py-3 bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 rounded-full hover:bg-cyan-500 hover:text-slate-950 transition-all font-bold uppercase tracking-widest text-xs shadow-lg shadow-cyan-500/20"
              >
                <RefreshCcw className="w-4 h-4" />
                Retry Terminal
              </button>
            </motion.div>
          )}

          {isPaused && !isGameOver && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm rounded-lg"
            >
              <h2 className="text-3xl font-bold neon-cyan mb-4 uppercase tracking-widest animate-pulse">Paused</h2>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="absolute bottom-4 left-4 flex gap-2 pointer-events-none">
        <div className="px-2 py-1 bg-cyan-500/10 rounded border border-cyan-500/20 text-[10px] text-cyan-400 font-mono">
          {isGameOver ? 'STATUS: TERMINATED' : isPaused ? 'STATUS: SUSPENDED' : 'STATUS: ACTIVE'}
        </div>
        <div className="px-2 py-1 bg-slate-800/50 rounded text-[10px] text-slate-500 font-mono">GRID: 20x20</div>
      </div>

      <div className="text-slate-500 text-[10px] uppercase font-mono tracking-[0.2em] flex gap-4 mt-4">
        <span>[ARROWS] TO NAVIGATE</span>
        <span>[P] TO PAUSE</span>
      </div>
    </div>
  );
};
