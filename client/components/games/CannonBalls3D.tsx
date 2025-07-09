import { useState, useEffect, useRef } from "react";
import { GameProps } from "./GameEngine";

export default function CannonBalls3D({ onScore }: GameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [angle, setAngle] = useState(0);
  const [power, setPower] = useState(50);
  const [balls, setBalls] = useState(5);
  const [targets, setTargets] = useState<
    Array<{ x: number; y: number; hit: boolean }>
  >([]);

  useEffect(() => {
    // Initialize targets
    const newTargets = [];
    for (let i = 0; i < 10; i++) {
      newTargets.push({
        x: 300 + Math.random() * 200,
        y: 50 + Math.random() * 200,
        hit: false,
      });
    }
    setTargets(newTargets);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = "#87CEEB";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw ground
    ctx.fillStyle = "#8B4513";
    ctx.fillRect(0, canvas.height - 30, canvas.width, 30);

    // Draw cannon
    ctx.save();
    ctx.translate(50, canvas.height - 50);
    ctx.rotate((angle * Math.PI) / 180);
    ctx.fillStyle = "#444";
    ctx.fillRect(0, -8, 40, 16);
    ctx.restore();

    // Draw cannon base
    ctx.fillStyle = "#333";
    ctx.beginPath();
    ctx.arc(50, canvas.height - 50, 20, 0, 2 * Math.PI);
    ctx.fill();

    // Draw targets
    targets.forEach((target) => {
      if (!target.hit) {
        ctx.fillStyle = "#FF6B6B";
        ctx.fillRect(target.x, target.y, 30, 30);
        ctx.fillStyle = "#fff";
        ctx.font = "12px Arial";
        ctx.textAlign = "center";
        ctx.fillText("10", target.x + 15, target.y + 20);
      }
    });

    // Draw UI
    ctx.fillStyle = "#fff";
    ctx.font = "16px Arial";
    ctx.textAlign = "left";
    ctx.fillText(`Score: ${score}`, 10, 25);
    ctx.fillText(`Balls: ${balls}`, 10, 45);
    ctx.fillText(`Angle: ${angle}°`, 10, 65);
    ctx.fillText(`Power: ${power}%`, 10, 85);
  }, [angle, power, targets, score, balls]);

  const fire = () => {
    if (balls <= 0) return;

    setBalls((prev) => prev - 1);

    // Simple hit detection - if angle and power are in good range
    const hitChance = power > 70 && angle > -45 && angle < -10 ? 0.7 : 0.3;

    if (Math.random() < hitChance) {
      // Hit a target
      const availableTargets = targets.filter((t) => !t.hit);
      if (availableTargets.length > 0) {
        const targetIndex = targets.findIndex((t) => t === availableTargets[0]);
        setTargets((prev) =>
          prev.map((t, i) => (i === targetIndex ? { ...t, hit: true } : t)),
        );
        setScore((prev) => {
          const newScore = prev + 10;
          onScore?.(newScore);
          return newScore;
        });
      }
    }
  };

  return (
    <div className="flex flex-col items-center p-4 bg-sky-100 rounded-lg">
      <h3 className="text-xl font-bold mb-4 text-gray-800">Cannon Balls 3D</h3>

      <canvas
        ref={canvasRef}
        width={600}
        height={300}
        className="border-2 border-gray-600 rounded-lg bg-sky-200"
      />

      <div className="mt-4 space-y-4 w-full max-w-md">
        <div>
          <label className="block text-sm font-medium mb-2">
            Angle: {angle}°
          </label>
          <input
            type="range"
            min="-80"
            max="0"
            value={angle}
            onChange={(e) => setAngle(Number(e.target.value))}
            className="w-full"
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
          />
        </div>

        <button
          onClick={fire}
          disabled={balls <= 0}
          className="w-full bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 disabled:bg-gray-400"
        >
          FIRE! ({balls} balls left)
        </button>

        <div className="text-center">
          <p className="text-lg font-semibold">Score: {score}</p>
          <p className="text-sm text-gray-600">
            Adjust angle and power to hit red targets!
          </p>
        </div>
      </div>
    </div>
  );
}
