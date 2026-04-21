import { useState, useCallback, useEffect, useRef } from 'react';
import { SnakeGame } from './components/SnakeGame';
import { motion, AnimatePresence } from 'motion/react';
import { Volume2, Play, Pause, SkipBack, SkipForward } from 'lucide-react';
import { TRACKS } from './constants';

export default function App() {
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const currentTrack = TRACKS[currentTrackIndex];

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(e => console.error("Playback failed:", e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentTrackIndex]);

  const handleScoreUpdate = useCallback((newScore: number) => {
    setScore(newScore);
    if (newScore > highScore) {
      setHighScore(newScore);
    }
  }, [highScore]);

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-dark-surface">
      <div className="h-[768px] w-[1024px] flex flex-col p-6 gap-6 bg-dark-surface shadow-2xl relative">
        <audio
          ref={audioRef}
          src={currentTrack.url}
          onEnded={() => setCurrentTrackIndex((prev) => (prev + 1) % TRACKS.length)}
        />

        {/* Header */}
        <header className="flex justify-between items-end border-b border-slate-800 pb-4">
          <div className="flex flex-col">
            <h1 className="text-4xl font-black tracking-tighter neon-cyan italic underline decoration-cyan-500/30 font-sans">SYNTH SQUIRM</h1>
            <p className="text-xs uppercase tracking-widest text-slate-500 font-bold">Neural Audio + Classic Arcade v2.0</p>
          </div>
          <div className="flex gap-8 text-right font-mono">
            <div className="flex flex-col">
              <span className="text-xs text-slate-500 uppercase font-bold tracking-widest">High Score</span>
              <span className="text-2xl font-mono text-pink-500">{highScore.toString().padStart(4, '0')}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-slate-500 uppercase font-bold tracking-widest">Current Score</span>
              <span className="text-2xl font-mono neon-cyan">{score.toString().padStart(4, '0')}</span>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex gap-6 overflow-hidden">
          {/* Sidebar */}
          <aside className="w-72 flex flex-col gap-4">
            <div className="bg-glass rounded-xl border border-slate-800 p-4 flex-1 flex flex-col overflow-hidden">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Playlist: AI Generated</h2>
              <div className="flex flex-col gap-2 overflow-y-auto pr-2">
                {TRACKS.map((track, index) => (
                  <div 
                    key={track.id}
                    onClick={() => {
                      setCurrentTrackIndex(index);
                      setIsPlaying(true);
                    }}
                    className={`p-3 rounded flex items-center gap-3 cursor-pointer transition-all ${index === currentTrackIndex ? 'music-active' : 'hover:bg-slate-800/50 border-l-4 border-transparent'}`}
                  >
                    <div className={`w-8 h-8 rounded flex items-center justify-center transition-colors ${index === currentTrackIndex ? 'bg-cyan-500/20' : 'bg-slate-800'}`}>
                      {index === currentTrackIndex && isPlaying ? (
                         <div className="flex items-end gap-[2px] h-3">
                            <motion.div animate={{ height: [4, 12, 6] }} transition={{ repeat: Infinity, duration: 0.5 }} className="w-1 bg-cyan-400" />
                            <motion.div animate={{ height: [8, 4, 12] }} transition={{ repeat: Infinity, duration: 0.6 }} className="w-1 bg-cyan-400" />
                            <motion.div animate={{ height: [6, 12, 4] }} transition={{ repeat: Infinity, duration: 0.4 }} className="w-1 bg-cyan-400" />
                         </div>
                      ) : (
                        <span className="text-xs text-slate-500">0{index + 1}</span>
                      )}
                    </div>
                    <div className="overflow-hidden">
                      <p className={`text-sm font-medium truncate ${index === currentTrackIndex ? 'neon-cyan' : 'text-slate-300'}`}>{track.title}</p>
                      <p className="text-[10px] text-slate-500 truncate">{track.artist} // {track.duration}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-pink-500/10 rounded-xl border border-pink-500/20 p-4">
              <p className="text-[10px] text-pink-400 font-bold uppercase tracking-widest mb-1">Tip</p>
              <p className="text-xs text-pink-100/70">Eat the glowing neon spheres to sync the bass drops and boost your multiplier.</p>
            </div>
          </aside>

          {/* Game Section */}
          <section className="flex-1 flex flex-col gap-6">
            <div className="flex-1 relative bg-slate-900/50 border-2 border-neon-cyan rounded-2xl overflow-hidden snake-grid shadow-2xl shadow-cyan-500/5 flex items-center justify-center">
              <SnakeGame onScoreUpdate={handleScoreUpdate} />
            </div>

            {/* Bottom Controls */}
            <div className="h-24 bg-glass rounded-2xl border border-slate-800 p-4 flex items-center justify-between">
              <div className="flex items-center gap-4 w-1/3">
                <motion.div 
                  key={currentTrack.id}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg shadow-lg shadow-cyan-500/20 overflow-hidden"
                >
                  <img src={currentTrack.cover} className="w-full h-full object-cover opacity-80" referrerPolicy="no-referrer" />
                </motion.div>
                <div>
                  <p className="text-sm font-bold text-white truncate max-w-[120px]">{currentTrack.title}</p>
                  <p className="text-xs text-slate-500">Now Playing</p>
                </div>
              </div>

              <div className="flex flex-col items-center gap-2 flex-1">
                <div className="flex items-center gap-6">
                  <button 
                    onClick={() => setCurrentTrackIndex((prev) => (prev - 1 + TRACKS.length) % TRACKS.length)}
                    className="text-slate-400 hover:text-cyan-400 transition-colors"
                  >
                    <SkipBack className="w-5 h-5 fill-current" />
                  </button>
                  <button 
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="w-10 h-10 bg-cyan-500 text-slate-950 rounded-full flex items-center justify-center hover:scale-105 transition-transform shadow-lg shadow-cyan-500/40"
                  >
                    {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current translate-x-0.5" />}
                  </button>
                  <button 
                    onClick={() => setCurrentTrackIndex((prev) => (prev + 1) % TRACKS.length)}
                    className="text-slate-400 hover:text-cyan-400 transition-colors"
                  >
                    <SkipForward className="w-5 h-5 fill-current" />
                  </button>
                </div>
                <div className="w-full max-w-xs bg-slate-800 h-1 rounded-full overflow-hidden">
                  <motion.div 
                    className="bg-cyan-500 h-full shadow-[0_0_8px_rgba(34,211,238,1)]" 
                    animate={{ width: isPlaying ? '100%' : '10%' }}
                    transition={{ duration: isPlaying ? 180 : 0.5, ease: "linear" }}
                  />
                </div>
              </div>

              <div className="w-1/3 flex justify-end items-center gap-4 text-slate-500">
                <Volume2 className="w-4 h-4" />
                <div className="w-20 bg-slate-800 h-1 rounded-full">
                  <div className="bg-slate-400 h-full w-3/4"></div>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
