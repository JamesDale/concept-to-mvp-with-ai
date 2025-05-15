import { useState, useEffect } from 'react'
import './App.css'

function App() {
  return (
    <div className="game-container">
      <Game />
    </div>
  )
}

interface Bird {
  y: number;
  velocity: number;
}

interface Pipe {
  x: number;
  height: number;
  passed: boolean;
  destroyed: boolean;
}

interface Bomb {
  x: number;
  y: number;
  active: boolean;
}

interface FireParticle {
  id: number;
  tx: number;
  ty: number;
}

function Game() {
  const [bird, setBird] = useState<Bird>({ y: window.innerHeight / 2, velocity: 0 });
  const [pipes, setPipes] = useState<Pipe[]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [bombs, setBombs] = useState<Bomb[]>([]);
  const [isBreathingFire, setIsBreathingFire] = useState(false);
  const [fireParticles, setFireParticles] = useState<FireParticle[]>([]);

  const createFireParticles = () => {
    const particles: FireParticle[] = [];
    for (let i = 0; i < 20; i++) {
      particles.push({
        id: Math.random(),
        tx: (Math.random() - 0.5) * 100,
        ty: -Math.random() * 100
      });
    }
    setFireParticles(particles);
  };

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        if (gameOver) {
          // Reset game
          setBird({ y: window.innerHeight / 2, velocity: 0 });
          setPipes([]);
          setBombs([]);
          setGameOver(false);
          setScore(0);
        } else {
          // Jump and breathe fire
          setBird(prev => ({ ...prev, velocity: -12 }));
          setIsBreathingFire(true);
          createFireParticles();
          setTimeout(() => {
            setIsBreathingFire(false);
            setFireParticles([]);
          }, 500);
        }
      } else if (e.code === 'KeyB' && !gameOver) {
        // Drop bomb
        setBombs(prev => [...prev, { x: 140, y: bird.y, active: true }]);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameOver, bird.y]);

  useEffect(() => {
    if (gameOver) return;

    const gameLoop = setInterval(() => {
      // Update bird position
      setBird(prev => {
        const newY = prev.y + prev.velocity;
        const newVelocity = prev.velocity + 0.7; // Gravity

        // Check if bird hits the ground or ceiling
        if (newY > window.innerHeight - 50 || newY < 0) {
          setGameOver(true);
          return prev;
        }

        return { y: newY, velocity: newVelocity };
      });

      // Update bombs
      setBombs(prev => {
        const newBombs = prev
          .map(bomb => ({
            ...bomb,
            y: bomb.y + 8, // Bomb falls faster than bird
            active: bomb.y < window.innerHeight // Deactivate when hitting ground
          }))
          .filter(bomb => bomb.active);

        // Check bomb collisions with pipes
        newBombs.forEach(bomb => {
          pipes.forEach(pipe => {
            if (
              !pipe.destroyed &&
              bomb.x > pipe.x &&
              bomb.x < pipe.x + 80 &&
              bomb.y > pipe.height &&
              bomb.y < pipe.height + 200
            ) {
              pipe.destroyed = true;
              bomb.active = false;
            }
          });
        });

        return newBombs;
      });

      // Update pipes
      setPipes(prev => {
        const newPipes = prev
          .map(pipe => ({
            ...pipe,
            x: pipe.x - 3,
            passed: pipe.passed || pipe.x < 140
          }))
          .filter(pipe => pipe.x > -80);

        // Add new pipe
        if (prev.length === 0 || prev[prev.length - 1].x < window.innerWidth - 400) {
          newPipes.push({
            x: window.innerWidth,
            height: Math.random() * (window.innerHeight - 300) + 100,
            passed: false,
            destroyed: false
          });
        }

        // Check collisions
        newPipes.forEach(pipe => {
          if (
            !pipe.destroyed &&
            pipe.x < 140 &&
            pipe.x > 60 &&
            (bird.y < pipe.height || bird.y > pipe.height + 200)
          ) {
            setGameOver(true);
          }

          // Update score
          if (!pipe.passed && pipe.x < 140) {
            setScore(s => s + 1);
          }
        });

        return newPipes;
      });
    }, 16); // Increased frame rate for smoother animation

    return () => clearInterval(gameLoop);
  }, [bird.y, gameOver, pipes]);

  return (
    <div className="game">
      <div className="bird" style={{ top: `${bird.y}px` }}>
        <div className={`fire ${isBreathingFire ? 'active' : ''}`}>
          <div className="fire-particles">
            {fireParticles.map(particle => (
              <div
                key={particle.id}
                className="fire-particle"
                style={{
                  '--tx': `${particle.tx}px`,
                  '--ty': `${particle.ty}px`
                } as React.CSSProperties}
              />
            ))}
          </div>
        </div>
      </div>
      {pipes.map((pipe, i) => (
        !pipe.destroyed && (
          <div key={i}>
            <div
              className="pipe top"
              style={{
                left: `${pipe.x}px`,
                height: `${pipe.height}px`
              }}
            />
            <div
              className="pipe bottom"
              style={{
                left: `${pipe.x}px`,
                top: `${pipe.height + 200}px`
              }}
            />
          </div>
        )
      ))}
      {bombs.map((bomb, i) => (
        <div
          key={i}
          className="bomb"
          style={{
            left: `${bomb.x}px`,
            top: `${bomb.y}px`
          }}
        />
      ))}
      {gameOver && (
        <div className="game-over">
          Game Over! Score: {score}
          <br />
          Press Space to Restart
        </div>
      )}
      <div className="score">Score: {score}</div>
      <div className="controls">
        Space: Jump & Breathe Fire | B: Drop Bomb
      </div>
    </div>
  );
}

export default App
