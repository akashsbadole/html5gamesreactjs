import { useState, useEffect } from "react";
import { GameProps } from "./GameEngine";

interface Ball {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
}

export default function FreeKick3D({ onScore }: GameProps) {
  const [ball, setBall] = useState<Ball>({
    x: 300,
    y: 350,
    vx: 0,
    vy: 0,
    size: 15,
  });
  const [power, setPower] = useState(50);
  const [angle, setAngle] = useState(-20);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(10);
  const [gameState, setGameState] = useState<
    "aiming" | "shooting" | "goal" | "miss" | "gameOver"
  >("aiming");
  const [isMoving, setIsMoving] = useState(false);
  const [goalkeeper, setGoalkeeper] = useState({ x: 250, moving: false });
  const [wind, setWind] = useState(0);

  const goal = {
    x: 200,
    y: 50,
    width: 200,
    height: 80,
    postWidth: 10,
  };

  // Goalkeeper AI
  useEffect(() => {
    if (gameState === "shooting" && isMoving) {
      const interval = setInterval(() => {
        setGoalkeeper((prev) => {
          let newX = prev.x;
          const direction = Math.random() > 0.5 ? 1 : -1;
          newX += direction * 2;

          // Keep goalkeeper within goal area
          newX = Math.max(
            goal.x + 20,
            Math.min(goal.x + goal.width - 40, newX),
          );

          return { x: newX, moving: true };
        });
      }, 100);

      return () => clearInterval(interval);
    }
  }, [gameState, isMoving, goal.x, goal.width]);

  const shoot = () => {
    if (gameState !== "aiming" || attempts <= 0) return;

    setGameState("shooting");
    setIsMoving(true);
    setAttempts((prev) => prev - 1);

    // Calculate initial velocity based on power and angle
    const radianAngle = (angle * Math.PI) / 180;
    const velocity = power / 5;

    setBall((prev) => ({
      ...prev,
      vx: Math.cos(radianAngle) * velocity + wind,
      vy: Math.sin(radianAngle) * velocity,
    }));

    // Generate new wind for next shot
    setWind((Math.random() - 0.5) * 2);
  };

  // Ball physics
  useEffect(() => {
    if (!isMoving) return;

    const physicsInterval = setInterval(() => {
      setBall((prev) => {
        let newX = prev.x + prev.vx;
        let newY = prev.y + prev.vy;
        let newVx = prev.vx * 0.99; // Air resistance
        let newVy = prev.vy + 0.5; // Gravity

        // Check goal collision
        if (
          newX >= goal.x &&
          newX <= goal.x + goal.width &&
          newY >= goal.y &&
          newY <= goal.y + goal.height
        ) {
          // Check if goalkeeper catches it
          const goalkeeperCatch =
            newX >= goalkeeper.x &&
            newX <= goalkeeper.x + 40 &&
            newY >= goal.y + 20;

          if (!goalkeeperCatch) {
            setScore((prevScore) => {
              const newScore = prevScore + 1;
              onScore?.(newScore);
              return newScore;
            });
            setGameState("goal");
          } else {
            setGameState("miss");
          }

          setIsMoving(false);
          setTimeout(resetBall, 2000);
          return prev;
        }

        // Check boundaries
        if (newX < 0 || newX > 600 || newY > 400) {
          setGameState("miss");
          setIsMoving(false);
          setTimeout(resetBall, 1000);
          return prev;
        }

        // Check goal posts collision
        if (
          newY <= goal.y + goal.height &&
          ((newX >= goal.x - goal.postWidth &&
            newX <= goal.x + goal.postWidth) ||
            (newX >= goal.x + goal.width - goal.postWidth &&
              newX <= goal.x + goal.width + goal.postWidth))
        ) {
          newVx *= -0.5;
          setGameState("miss");
        }

        // Check crossbar collision
        if (
          newX >= goal.x &&
          newX <= goal.x + goal.width &&
          newY >= goal.y - goal.postWidth &&
          newY <= goal.y + goal.postWidth
        ) {
          newVy *= -0.5;
          setGameState("miss");
        }

        return {
          ...prev,
          x: newX,
          y: newY,
          vx: newVx,
          vy: newVy,
        };
      });
    }, 16);

    return () => clearInterval(physicsInterval);
  }, [isMoving, goal, goalkeeper.x]);

  const resetBall = () => {
    setBall({
      x: 300,
      y: 350,
      vx: 0,
      vy: 0,
      size: 15,
    });
    setGameState(attempts > 0 ? "aiming" : "gameOver");
    setGoalkeeper({ x: 250, moving: false });
  };

  const resetGame = () => {
    setScore(0);
    setAttempts(10);
    setGameState("aiming");
    setWind(0);
    resetBall();
  };

  return (
    <div className="flex flex-col items-center p-4 bg-green-100 rounded-lg">
      <h3 className="text-2xl font-bold mb-4 text-green-800">3D Free Kick</h3>

      {/* Soccer Field */}
      <div
        className="relative border-2 border-green-600 rounded-lg bg-gradient-to-b from-green-300 to-green-500 overflow-hidden"
        style={{ width: "600px", height: "400px" }}
      >
        {/* Field markings */}
        <div className="absolute bottom-0 w-full h-1 bg-white"></div>
        <div
          className="absolute bottom-20 border-2 border-white"
          style={{
            left: "150px",
            width: "300px",
            height: "120px",
            borderRadius: "150px 150px 0 0",
          }}
        ></div>

        {/* Goal */}
        <div
          className="absolute bg-gray-200 border-2 border-gray-600"
          style={{
            left: `${goal.x}px`,
            top: `${goal.y}px`,
            width: `${goal.width}px`,
            height: `${goal.height}px`,
          }}
        >
          {/* Goal net pattern */}
          <div className="absolute inset-2 opacity-30">
            {Array.from({ length: 8 }, (_, i) => (
              <div
                key={i}
                className="absolute w-full h-0.5 bg-gray-600"
                style={{ top: `${i * 10}px` }}
              ></div>
            ))}
            {Array.from({ length: 10 }, (_, i) => (
              <div
                key={i}
                className="absolute h-full w-0.5 bg-gray-600"
                style={{ left: `${i * 20}px` }}
              ></div>
            ))}
          </div>
        </div>

        {/* Goal posts */}
        <div
          className="absolute bg-white"
          style={{
            left: `${goal.x - goal.postWidth}px`,
            top: `${goal.y}px`,
            width: `${goal.postWidth}px`,
            height: `${goal.height + goal.postWidth}px`,
          }}
        ></div>
        <div
          className="absolute bg-white"
          style={{
            left: `${goal.x + goal.width}px`,
            top: `${goal.y}px`,
            width: `${goal.postWidth}px`,
            height: `${goal.height + goal.postWidth}px`,
          }}
        ></div>
        <div
          className="absolute bg-white"
          style={{
            left: `${goal.x - goal.postWidth}px`,
            top: `${goal.y - goal.postWidth}px`,
            width: `${goal.width + goal.postWidth * 2}px`,
            height: `${goal.postWidth}px`,
          }}
        ></div>

        {/* Goalkeeper */}
        <div
          className={`absolute text-3xl transition-all duration-100 ${
            goalkeeper.moving ? "animate-pulse" : ""
          }`}
          style={{
            left: `${goalkeeper.x}px`,
            top: `${goal.y + 20}px`,
          }}
        >
          🥅
        </div>

        {/* Ball */}
        <div
          className="absolute text-xl transition-all duration-75"
          style={{
            left: `${ball.x - ball.size / 2}px`,
            top: `${ball.y - ball.size / 2}px`,
            transform: isMoving ? "rotate(45deg)" : "none",
          }}
        >
          ⚽
        </div>

        {/* Trajectory indicator */}
        {gameState === "aiming" && (
          <div
            className="absolute w-1 bg-red-400 opacity-60 origin-bottom"
            style={{
              left: `${ball.x}px`,
              bottom: `${400 - ball.y}px`,
              height: `${power * 2}px`,
              transform: `rotate(${angle}deg)`,
            }}
          ></div>
        )}

        {/* Wind indicator */}
        <div className="absolute top-4 right-4 text-white font-bold">
          <div>Wind: {wind > 0 ? "→" : wind < 0 ? "←" : "○"}</div>
          <div className="text-sm">{Math.abs(wind).toFixed(1)}</div>
        </div>

        {/* Game state messages */}
        {gameState === "goal" && (
          <div className="absolute inset-0 bg-green-500 bg-opacity-75 flex items-center justify-center">
            <div className="text-6xl font-bold text-white animate-bounce">
              GOAL! ⚽
            </div>
          </div>
        )}

        {gameState === "miss" && (
          <div className="absolute inset-0 bg-red-500 bg-opacity-50 flex items-center justify-center">
            <div className="text-4xl font-bold text-white">Miss! 😞</div>
          </div>
        )}

        {gameState === "gameOver" && (
          <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center">
            <div className="text-center text-white">
              <div className="text-4xl font-bold mb-4">Game Over!</div>
              <div className="text-2xl mb-4">Final Score: {score}/10</div>
              <button
                onClick={resetGame}
                className="bg-green-500 px-6 py-3 rounded-lg hover:bg-green-600 font-bold"
              >
                Play Again
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="mt-4 space-y-4 w-full max-w-md">
        <div>
          <label className="block text-sm font-medium mb-2">
            Angle: {angle}°
          </label>
          <input
            type="range"
            min="-45"
            max="10"
            value={angle}
            onChange={(e) => setAngle(Number(e.target.value))}
            className="w-full"
            disabled={gameState !== "aiming"}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Power: {power}%
          </label>
          <input
            type="range"
            min="20"
            max="100"
            value={power}
            onChange={(e) => setPower(Number(e.target.value))}
            className="w-full"
            disabled={gameState !== "aiming"}
          />
        </div>

        <button
          onClick={shoot}
          disabled={gameState !== "aiming" || attempts <= 0}
          className="w-full bg-blue-500 text-white py-3 px-4 rounded hover:bg-blue-600 disabled:bg-gray-400 font-bold text-lg"
        >
          SHOOT! ⚽
        </button>

        <div className="text-center space-y-2">
          <p className="text-xl font-bold">Score: {score}</p>
          <p className="text-lg">Attempts: {attempts}/10</p>
          <p className="text-sm text-gray-600">
            Adjust angle and power, watch the wind!
          </p>
        </div>
      </div>
    </div>
  );
}
