import { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, Music, Trophy, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Gamepad2 } from 'lucide-react';

const GRID_SIZE = 20;
const INITIAL_SNAKE = [{ x: 10, y: 10 }, { x: 10, y: 11 }, { x: 10, y: 12 }]; // start with length 3
const INITIAL_DIRECTION = { x: 0, y: -1 };
const GAME_SPEED = 120;

const TRACKS = [
  { id: 1, title: "Neon Grid (AI Generated)", artist: "Cyber-Gen", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" },
  { id: 2, title: "Digital Serenade (AI Generated)", artist: "Neural Net", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3" },
  { id: 3, title: "Synthwave Processor (AI Generated)", artist: "Logic Node", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3" }
];

export default function App() {
  // Audio State
  const [currentTrackIdx, setCurrentTrackIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(() => setIsPlaying(false));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentTrackIdx]);

  const togglePlay = () => setIsPlaying(!isPlaying);
  const nextTrack = () => setCurrentTrackIdx((prev) => (prev + 1) % TRACKS.length);
  const prevTrack = () => setCurrentTrackIdx((prev) => (prev - 1 + TRACKS.length) % TRACKS.length);
  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  // Snake State
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [dir, setDir] = useState(INITIAL_DIRECTION);
  const [food, setFood] = useState({ x: 5, y: 5 });
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);

  const snakeRef = useRef(snake);
  const dirRef = useRef(dir);
  snakeRef.current = snake;
  dirRef.current = dir;

  const generateFood = useCallback((currentSnake: {x: number, y: number}[]) => {
    let newFood;
    while (true) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE)
      };
      const onSnake = currentSnake.some(s => s.x === newFood.x && s.y === newFood.y);
      if (!onSnake) break;
    }
    return newFood;
  }, []);

  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    setDir(INITIAL_DIRECTION);
    setScore(0);
    setGameOver(false);
    setFood(generateFood(INITIAL_SNAKE));
    setGameStarted(true);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd', ' '].includes(e.key)) {
        e.preventDefault();
      }
      if (e.key === ' ' && (!gameStarted || gameOver)) {
         resetGame();
         return;
      }
      if (!gameStarted || gameOver) return;

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
          if (dirRef.current.y !== 1) setDir({ x: 0, y: -1 });
          break;
        case 'ArrowDown':
        case 's':
          if (dirRef.current.y !== -1) setDir({ x: 0, y: 1 });
          break;
        case 'ArrowLeft':
        case 'a':
          if (dirRef.current.x !== 1) setDir({ x: -1, y: 0 });
          break;
        case 'ArrowRight':
        case 'd':
          if (dirRef.current.x !== -1) setDir({ x: 1, y: 0 });
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameStarted, gameOver]);

  useEffect(() => {
    if (!gameStarted || gameOver) return;

    const moveSnake = () => {
      const head = { ...snakeRef.current[0] };
      head.x += dirRef.current.x;
      head.y += dirRef.current.y;

      if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
        handleGameOver();
        return;
      }

      if (snakeRef.current.some(s => s.x === head.x && s.y === head.y)) {
        handleGameOver();
        return;
      }

      const newSnake = [head, ...snakeRef.current];

      if (head.x === food.x && head.y === food.y) {
        setScore(s => s + 10);
        setFood(generateFood(newSnake));
      } else {
        newSnake.pop();
      }

      setSnake(newSnake);
    };

    const handleGameOver = () => {
       setGameOver(true);
       setHighScore(prev => Math.max(prev, score));
    };

    const intervalId = setInterval(moveSnake, GAME_SPEED);
    return () => clearInterval(intervalId);
  }, [gameStarted, gameOver, food, generateFood, score]);

  const handleDPad = (dx: number, dy: number) => {
     if (!gameStarted || gameOver) return;
     if (dirRef.current.x !== 0 && dx !== 0) return;
     if (dirRef.current.y !== 0 && dy !== 0) return;
     setDir({ x: dx, y: dy });
  };

  const track = TRACKS[currentTrackIdx];

  return (
    <div className="min-h-screen bg-[#050505] font-sans text-white flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(0,243,255,0.13)_0%,transparent_40%),radial-gradient(circle_at_100%_100%,rgba(255,0,255,0.13)_0%,transparent_40%)] pointer-events-none"></div>
      
      {/* App Shell */}
      <div className="z-10 w-full max-w-[1024px] xl:w-[940px] xl:h-[680px] bg-[rgba(20,20,25,0.7)] backdrop-blur-[20px] border border-white/10 rounded-[24px] flex flex-col xl:grid xl:grid-cols-[260px_1fr_220px] xl:grid-rows-[1fr_80px] gap-5 p-6 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] overflow-y-auto xl:overflow-hidden relative text-left">
        
        {/* Sidebar / Playlist */}
        <div className="bg-white/[0.03] rounded-2xl p-5 flex flex-col gap-4 border border-white/[0.05]">
          <h2 className="text-[10px] uppercase tracking-[1px] text-white/40 mb-1">Neural Playlist</h2>
          <div className="flex flex-col gap-2 overflow-y-auto">
            {TRACKS.map((t, i) => (
              <div 
                key={t.id}
                onClick={() => { setCurrentTrackIdx(i); setIsPlaying(true); }}
                className={`p-3 rounded-xl cursor-pointer transition-all duration-200 ${currentTrackIdx === i ? 'bg-[#00f3ff]/10 border border-[#00f3ff]/20' : 'bg-white/[0.02] hover:bg-white/[0.05]'}`}
              >
                <div className="text-[14px] font-semibold truncate">{t.title}</div>
                <div className="text-[11px] opacity-60 truncate">{t.artist}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Game Viewport */}
        <div className="bg-black/40 rounded-2xl border-2 border-[#00f3ff]/30 shadow-[inset_0_0_20px_rgba(0,243,255,0.1)] relative flex flex-col items-center justify-center p-4 min-h-[350px] xl:min-h-0">
           <div className="absolute top-4 left-4 font-mono text-[12px] text-[#00f3ff] z-20 hidden sm:block">SYSTEM: RUNNING_SNAKE_V2.0</div>
           
           <div className="w-full max-w-[400px] aspect-square relative border border-[#00f3ff]/10">
             {!gameStarted && !gameOver && (
                <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center z-20 backdrop-blur-sm">
                   <Gamepad2 className="w-16 h-16 text-[#00f3ff] mb-4 drop-shadow-[0_0_10px_rgba(0,243,255,0.8)]" />
                   <button onClick={resetGame} className="px-8 py-3 bg-[#00f3ff] hover:bg-[#00f3ff]/80 text-black font-bold uppercase tracking-widest rounded-md transition-all shadow-[0_0_15px_rgba(0,243,255,0.5)] transform hover:scale-105">
                      Start System
                   </button>
                </div>
             )}

             {gameOver && (
                <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-20 backdrop-blur-sm">
                   <h2 className="text-3xl font-bold text-[#ff00ff] mb-2 drop-shadow-[0_0_10px_rgba(255,0,255,0.8)] uppercase">System Failure</h2>
                   <button onClick={resetGame} className="mt-4 px-8 py-3 bg-[#ff00ff] hover:bg-[#ff00ff]/80 text-white font-bold uppercase tracking-widest rounded-md transition-all shadow-[0_0_15px_rgba(255,0,255,0.6)] transform hover:scale-105">
                      Reboot
                   </button>
                </div>
             )}

             {/* Render Snake */}
             {snake.map((segment, i) => (
                <div 
                  key={i}
                  className={`absolute rounded-[2px] transition-all duration-75`}
                  style={{ 
                    left: `${(100 / GRID_SIZE) * segment.x}%`, 
                    top: `${(100 / GRID_SIZE) * segment.y}%`, 
                    width: `${100 / GRID_SIZE}%`, 
                    height: `${100 / GRID_SIZE}%`,
                    backgroundColor: i === 0 ? '#00f3ff' : '#ff00ff',
                    boxShadow: i === 0 ? '0 0 15px #00f3ff' : '0 0 10px #ff00ff',
                    transform: i === 0 ? 'scale(0.95)' : 'scale(0.85)'
                  }}
                />
             ))}

             {/* Render Food */}
             <div 
                className="absolute rounded-full"
                style={{ 
                  left: `${(100 / GRID_SIZE) * food.x}%`, 
                  top: `${(100 / GRID_SIZE) * food.y}%`, 
                  width: `${100 / GRID_SIZE}%`, 
                  height: `${100 / GRID_SIZE}%`,
                  backgroundColor: '#39ff14',
                  boxShadow: '0 0 10px #39ff14',
                  transform: 'scale(0.7)'
                }}
             />
           </div>

           {/* Mobile Controls (D-Pad) */}
           <div className="z-10 mt-6 grid grid-cols-3 gap-2 xl:hidden w-48">
             <div />
             <button onPointerDown={(e) => {e.preventDefault(); handleDPad(0, -1);}} className="bg-white/5 border border-white/10 p-4 rounded-lg flex items-center justify-center active:bg-white/20 touch-none">
                <ChevronUp className="w-6 h-6 text-white/70" />
             </button>
             <div />
             <button onPointerDown={(e) => {e.preventDefault(); handleDPad(-1, 0);}} className="bg-white/5 border border-white/10 p-4 rounded-lg flex items-center justify-center active:bg-white/20 touch-none">
                <ChevronLeft className="w-6 h-6 text-white/70" />
             </button>
             <button onPointerDown={(e) => {e.preventDefault(); handleDPad(0, 1);}} className="bg-white/5 border border-white/10 p-4 rounded-lg flex items-center justify-center active:bg-white/20 touch-none">
                <ChevronDown className="w-6 h-6 text-white/70" />
             </button>
             <button onPointerDown={(e) => {e.preventDefault(); handleDPad(1, 0);}} className="bg-white/5 border border-white/10 p-4 rounded-lg flex items-center justify-center active:bg-white/20 touch-none">
                <ChevronRight className="w-6 h-6 text-white/70" />
             </button>
           </div>
        </div>

        {/* Stats Sidebar */}
        <div className="flex flex-row xl:flex-col gap-5 justify-center">
           <div className="bg-white/[0.03] flex flex-col items-center justify-center rounded-2xl p-5 border border-white/[0.05] flex-1 xl:flex-none">
             <div className="text-[10px] uppercase tracking-[1px] text-white/40 mb-2">Score</div>
             <div className="text-[#00f3ff] text-3xl xl:text-[42px] font-black font-mono drop-shadow-[0_0_8px_rgba(0,243,255,0.5)] leading-none">{String(score).padStart(6, '0')}</div>
           </div>
           <div className="bg-white/[0.03] flex flex-col items-center justify-center rounded-2xl p-5 border border-white/[0.05] flex-1 xl:flex-none">
             <div className="text-[10px] uppercase tracking-[1px] text-white/40 mb-2">Best</div>
             <div className="text-[#ff00ff] text-2xl xl:text-[32px] font-black font-mono drop-shadow-[0_0_8px_rgba(255,0,255,0.5)] leading-none">{String(highScore).padStart(6, '0')}</div>
           </div>
        </div>

        {/* Footer Bar */}
        <div className="xl:col-span-3 bg-white/[0.05] rounded-2xl px-6 py-4 xl:py-0 h-auto xl:h-[80px] flex flex-col sm:flex-row items-center justify-between border border-white/[0.05] gap-4">
           
           {/* Now Playing Info */}
           <div className="flex items-center gap-4 w-full sm:w-1/3">
              <div className="w-[48px] h-[48px] rounded-lg bg-[linear-gradient(45deg,#00f3ff,#ff00ff)] flex-shrink-0 flex items-center justify-center shadow-[0_0_15px_rgba(255,0,255,0.3)]">
                 <Music className={`w-6 h-6 text-white drop-shadow-md mix-blend-overlay ${isPlaying ? 'animate-bounce' : ''}`} />
              </div>
              <div className="flex flex-col min-w-0">
                 <div className="text-[14px] font-semibold truncate">{track.title}</div>
                 <div className="text-[12px] opacity-60 truncate">{track.artist}</div>
              </div>
           </div>

           {/* Audio Progress (Simulated visual for aesthetic) */}
           <div className="h-[4px] bg-white/10 rounded-[2px] flex-grow sm:mx-8 xl:mx-10 relative hidden sm:block">
              <div className={`absolute left-0 top-0 h-full w-[65%] bg-[#ff00ff] rounded-[2px] shadow-[0_0_10px_rgba(255,0,255,0.5)] ${isPlaying ? 'animate-pulse' : ''}`}></div>
           </div>

           {/* Controls */}
           <div className="flex items-center gap-6">
              <button onClick={prevTrack} className="opacity-60 hover:opacity-100 transition-opacity uppercase text-[10px] tracking-wider font-bold">PREV</button>
              <button 
                 onClick={togglePlay} 
                 className="w-[44px] h-[44px] rounded-full bg-[#00f3ff] text-black shadow-[0_0_15px_rgba(0,243,255,0.5)] flex items-center justify-center font-black hover:transform hover:scale-105 transition-all focus:outline-none"
              >
                 {isPlaying ? <Pause fill="black" className="w-5 h-5" /> : <Play fill="black" className="w-5 h-5 ml-1" />}
              </button>
              <button onClick={nextTrack} className="opacity-60 hover:opacity-100 transition-opacity uppercase text-[10px] tracking-wider font-bold">NEXT</button>
              
              <div className="w-[1px] h-[20px] bg-white/10 ml-2"></div>
              <button onClick={toggleMute} className="opacity-60 hover:opacity-100 transition-opacity">
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>
           </div>
        </div>
        
      </div>
      
      <audio 
        ref={audioRef} 
        src={track.url} 
        onEnded={nextTrack}
        preload="metadata"
        muted={isMuted}
      />
    </div>
  );
}
