import { useState, useEffect } from "react";
import { GameProps } from "./GameEngine";

interface Target {
  id: number;
  x: number;
  y: number;
  type: "outlaw" | "bottle" | "barrel";
  hit: boolean;
  points: number;
}

export default function WesternSniper({ onScore }: GameProps) {
  const [targets, setTargets] = useState<Target[]>([]);
  const [score, setScore] = useState(0);
  const [ammo, setAmmo] = useState(6);
  const [crosshair, setCrosshair] = useState({ x: 300, y: 200 });
  const [isReloading, setIsReloading] = useState(false);
  const [level, setLevel] = useState(1);

  useEffect(() => {
    spawnTargets();
  }, [level]);

  const spawnTargets = () => {
    const newTargets: Target[] = [];
    for (let i = 0; i < 5 + level; i++) {
      newTargets.push({
        id: i,
        x: 100 + Math.random() * 400,
        y: 50 + Math.random() * 200,
        type: ["outlaw", "bottle", "barrel"][Math.floor(Math.random() * 3)] as
          | "outlaw"
          | "bottle"
          | "barrel",
        hit: false,
        points: Math.floor(Math.random() * 50) + 10,
      });
    }
    setTargets(newTargets);
  };

  const shoot = (targetX: number, targetY: number) => {
    if (ammo <= 0 || isReloading) return;

    setAmmo((prev) => prev - 1);

    // Check if hit any target
    const hitTarget = targets.find(
      (target) =>
        !target.hit &&
        Math.abs(target.x - targetX) < 30 &&
        Math.abs(target.y - targetY) < 30,
    );

    if (hitTarget) {
      setTargets((prev) =>
        prev.map((t) => (t.id === hitTarget.id ? { ...t, hit: true } : t)),
      );
      setScore((prev) => {
        const newScore = prev + hitTarget.points;
        onScore?.(newScore);
        return newScore;
      });
    }

    // Check if all targets hit
    const remainingTargets = targets.filter((t) => !t.hit);
    if (remainingTargets.length <= 1) {
      setTimeout(() => {
        setLevel((prev) => prev + 1);
        setAmmo(6);
        spawnTargets();
      }, 1000);
    }

    // Auto reload if empty
    if (ammo <= 1) {
      reload();
    }
  };

  const reload = () => {
    setIsReloading(true);
    setTimeout(() => {
      setAmmo(6);
      setIsReloading(false);
    }, 2000);
  };

  const getTargetIcon = (type: string) => {
    switch (type) {
      case "outlaw":
        return "🤠";
      case "bottle":
        return "🍾";
      case "barrel":
        return "🛢️";
      default:
        return "🎯";
    }
  };

  return (
    <div className="flex flex-col items-center p-4 bg-yellow-100 rounded-lg">
      <h3 className="text-xl font-bold mb-4 text-gray-800">Western Sniper</h3>

      {/* Desert Scene */}
      <div
        className="relative border-2 border-gray-600 rounded-lg bg-gradient-to-b from-yellow-200 to-orange-300 cursor-crosshair overflow-hidden"
        style={{ width: "600px", height: "300px" }}
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          setCrosshair({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
          });
        }}
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          shoot(e.clientX - rect.left, e.clientY - rect.top);
        }}
      >
        {/* Mountains background */}
        <div className="absolute bottom-0 w-full h-24 bg-gradient-to-t from-yellow-600 to-orange-400"></div>

        {/* Cacti */}
        <div className="absolute bottom-16 left-20 text-4xl">🌵</div>
        <div className="absolute bottom-20 right-32 text-3xl">🌵</div>

        {/* Targets */}
        {targets.map((target) => (
          <div
            key={target.id}
            className={`absolute text-3xl transition-all duration-300 ${
              target.hit ? "opacity-20 transform scale-75" : "hover:scale-110"
            }`}
            style={{
              left: `${target.x}px`,
              top: `${target.y}px`,
              cursor: target.hit ? "default" : "crosshair",
            }}
          >
            {getTargetIcon(target.type)}
            {target.hit && <div className="text-red-500 text-xl">💥</div>}
            <div className="text-xs text-center font-bold text-yellow-800">
              {target.points}
            </div>
          </div>
        ))}

        {/* Crosshair */}
        <div
          className="absolute pointer-events-none"
          style={{
            left: `${crosshair.x}px`,
            top: `${crosshair.y}px`,
            transform: "translate(-50%, -50%)",
          }}
        >
          <div className="relative">
            <div className="absolute w-8 h-0.5 bg-red-500 -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute w-0.5 h-8 bg-red-500 -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute w-6 h-6 border-2 border-red-500 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
          </div>
        </div>

        {/* Sun */}
        <div className="absolute top-4 right-4 text-4xl">☀️</div>

        {/* UI Overlay */}
        <div className="absolute top-4 left-4 text-gray-800 font-bold">
          <div>Score: {score}</div>
          <div>Level: {level}</div>
          <div>
            Targets: {targets.filter((t) => !t.hit).length}/{targets.length}
          </div>
        </div>
      </div>

      {/* Ammo Display */}
      <div className="mt-4 flex items-center space-x-4">
        <div className="flex space-x-1">
          {Array.from({ length: 6 }, (_, i) => (
            <div
              key={i}
              className={`w-4 h-8 rounded ${
                i < ammo ? "bg-yellow-600" : "bg-gray-300"
              }`}
            />
          ))}
        </div>
        <button
          onClick={reload}
          disabled={isReloading || ammo === 6}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
        >
          {isReloading ? "Reloading..." : "Reload"}
        </button>
      </div>

      <div className="mt-4 text-center">
        <p className="text-2xl font-bold">Score: {score}</p>
        <p className="text-sm text-gray-600">
          Click on targets to shoot! Different targets worth different points.
        </p>
        <p className="text-xs text-gray-500">
          🤠 Outlaws, 🍾 Bottles, 🛢️ Barrels - Shoot 'em all, partner!
        </p>
      </div>
    </div>
  );
}
