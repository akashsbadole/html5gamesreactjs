import { useGameCanvas, GameProps } from "./GameEngine";
import { useState, useCallback } from "react";

interface Marble {
  x: number;
  y: number;
  color: string;
  symbol: string;
  angle: number;
  distanceOnPath: number;
}

interface ShooterMarble {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  symbol: string;
  active: boolean;
}

export default function Totemia({
  width = 600,
  height = 400,
  onScore,
  onGameOver,
}: GameProps) {
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [gameState, setGameState] = useState<"playing" | "gameOver">("playing");

  const marbleTypes = [
    { color: "#ff6b6b", symbol: "🔥" }, // Fire
    { color: "#4ecdc4", symbol: "💧" }, // Water
    { color: "#45b7d1", symbol: "❄️" }, // Ice
    { color: "#96ceb4", symbol: "🌿" }, // Nature
    { color: "#feca57", symbol: "⚡" }, // Lightning
    { color: "#ff9ff3", symbol: "✨" }, // Magic
  ];

  const gameLogic = useCallback(
    (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => {
      let marbles: Marble[] = [];
      let shooterMarbles: ShooterMarble[] = [];
      let currentMarble = marbleTypes[0];
      let nextMarble = marbleTypes[1];
      let shooterAngle = 0;
      let pathProgress = 0;
      let gameSpeed = 0.5;

      const shooter = {
        x: canvas.width / 2,
        y: canvas.height - 50,
      };

      // Spiral path for marbles
      const getPathPosition = (distance: number) => {
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const spiralTightness = 0.01;
        const radius = 150 - distance * spiralTightness * 20;

        const angle = distance * spiralTightness;
        return {
          x: centerX + Math.cos(angle) * radius,
          y: centerY + Math.sin(angle) * radius,
        };
      };

      const initializeMarbles = () => {
        marbles = [];
        const numMarbles = 20 + level * 5;

        for (let i = 0; i < numMarbles; i++) {
          const marbleType =
            marbleTypes[Math.floor(Math.random() * marbleTypes.length)];
          const distance = i * 25;

          const pos = getPathPosition(distance);
          marbles.push({
            x: pos.x,
            y: pos.y,
            color: marbleType.color,
            symbol: marbleType.symbol,
            angle: 0,
            distanceOnPath: distance,
          });
        }
      };

      const drawBackground = () => {
        // Ancient temple background
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, "#2c1810");
        gradient.addColorStop(1, "#8b4513");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Temple pillars
        ctx.fillStyle = "#654321";
        for (let i = 0; i < 3; i++) {
          const x = 100 + i * 200;
          ctx.fillRect(x, 0, 30, canvas.height);

          // Pillar decorations
          ctx.fillStyle = "#ffd700";
          for (let j = 0; j < 5; j++) {
            ctx.fillRect(x + 5, j * 60 + 20, 20, 10);
          }
          ctx.fillStyle = "#654321";
        }

        // Path guide
        ctx.strokeStyle = "rgba(255, 215, 0, 0.3)";
        ctx.lineWidth = 30;
        ctx.beginPath();
        for (let i = 0; i < 500; i += 5) {
          const pos = getPathPosition(i);
          if (i === 0) {
            ctx.moveTo(pos.x, pos.y);
          } else {
            ctx.lineTo(pos.x, pos.y);
          }
        }
        ctx.stroke();
      };

      const drawMarble = (marble: Marble | ShooterMarble, size = 15) => {
        // Marble glow
        const gradient = ctx.createRadialGradient(
          marble.x,
          marble.y,
          0,
          marble.x,
          marble.y,
          size + 5,
        );
        gradient.addColorStop(0, marble.color);
        gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(marble.x, marble.y, size + 5, 0, 2 * Math.PI);
        ctx.fill();

        // Marble
        ctx.fillStyle = marble.color;
        ctx.beginPath();
        ctx.arc(marble.x, marble.y, size, 0, 2 * Math.PI);
        ctx.fill();

        // Marble highlight
        ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
        ctx.beginPath();
        ctx.arc(marble.x - 5, marble.y - 5, size / 3, 0, 2 * Math.PI);
        ctx.fill();

        // Symbol
        ctx.font = `${size}px Arial`;
        ctx.textAlign = "center";
        ctx.fillText(marble.symbol, marble.x, marble.y + 5);
      };

      const drawShooter = () => {
        // Shooter base
        ctx.fillStyle = "#8b4513";
        ctx.beginPath();
        ctx.arc(shooter.x, shooter.y, 25, 0, 2 * Math.PI);
        ctx.fill();

        // Shooter decorations
        ctx.fillStyle = "#ffd700";
        for (let i = 0; i < 8; i++) {
          const angle = (i * Math.PI) / 4;
          const x = shooter.x + Math.cos(angle) * 20;
          const y = shooter.y + Math.sin(angle) * 20;
          ctx.beginPath();
          ctx.arc(x, y, 3, 0, 2 * Math.PI);
          ctx.fill();
        }

        // Aim line
        ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(shooter.x, shooter.y);
        ctx.lineTo(
          shooter.x + Math.cos(shooterAngle) * 100,
          shooter.y + Math.sin(shooterAngle) * 100,
        );
        ctx.stroke();
        ctx.setLineDash([]);

        // Current marble in shooter
        drawMarble(
          {
            x: shooter.x,
            y: shooter.y,
            color: currentMarble.color,
            symbol: currentMarble.symbol,
            angle: 0,
            distanceOnPath: 0,
          },
          12,
        );

        // Next marble preview
        ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
        ctx.fillRect(canvas.width - 80, canvas.height - 80, 60, 60);
        ctx.fillStyle = "#fff";
        ctx.font = "12px Arial";
        ctx.textAlign = "center";
        ctx.fillText("Next", canvas.width - 50, canvas.height - 85);

        drawMarble(
          {
            x: canvas.width - 50,
            y: canvas.height - 50,
            color: nextMarble.color,
            symbol: nextMarble.symbol,
            angle: 0,
            distanceOnPath: 0,
          },
          10,
        );
      };

      const updateMarbles = () => {
        // Move marbles along path
        marbles.forEach((marble) => {
          marble.distanceOnPath += gameSpeed;
          const pos = getPathPosition(marble.distanceOnPath);
          marble.x = pos.x;
          marble.y = pos.y;
        });

        // Check if marbles reached the end
        if (marbles.length > 0 && marbles[0].distanceOnPath > 400) {
          setGameState("gameOver");
          onGameOver?.();
        }
      };

      const updateShooterMarbles = () => {
        shooterMarbles.forEach((shooterMarble, index) => {
          if (!shooterMarble.active) return;

          shooterMarble.x += shooterMarble.vx;
          shooterMarble.y += shooterMarble.vy;

          // Check collision with marbles in chain
          for (let i = 0; i < marbles.length; i++) {
            const marble = marbles[i];
            const dx = shooterMarble.x - marble.x;
            const dy = shooterMarble.y - marble.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 25) {
              // Insert marble into chain
              const newMarble: Marble = {
                x: marble.x,
                y: marble.y,
                color: shooterMarble.color,
                symbol: shooterMarble.symbol,
                angle: 0,
                distanceOnPath: marble.distanceOnPath,
              };

              marbles.splice(i, 0, newMarble);
              shooterMarble.active = false;

              // Recalculate positions
              marbles.forEach((m, idx) => {
                m.distanceOnPath = idx * 25;
                const pos = getPathPosition(m.distanceOnPath);
                m.x = pos.x;
                m.y = pos.y;
              });

              // Check for matches
              checkMatches(i);

              // Get new marble
              currentMarble = nextMarble;
              nextMarble =
                marbleTypes[Math.floor(Math.random() * marbleTypes.length)];

              break;
            }
          }

          // Remove marbles that go off screen
          if (
            shooterMarble.x < 0 ||
            shooterMarble.x > canvas.width ||
            shooterMarble.y < 0 ||
            shooterMarble.y > canvas.height
          ) {
            shooterMarble.active = false;
          }
        });

        shooterMarbles = shooterMarbles.filter(
          (marble) => marble.active,
        ) as ShooterMarble[];
      };

      const checkMatches = (insertIndex: number) => {
        const insertedMarble = marbles[insertIndex];
        let matchStart = insertIndex;
        let matchEnd = insertIndex;

        // Find start of match
        while (
          matchStart > 0 &&
          marbles[matchStart - 1].color === insertedMarble.color
        ) {
          matchStart--;
        }

        // Find end of match
        while (
          matchEnd < marbles.length - 1 &&
          marbles[matchEnd + 1].color === insertedMarble.color
        ) {
          matchEnd++;
        }

        // If 3 or more marbles match
        if (matchEnd - matchStart + 1 >= 3) {
          const matchedMarbles = marbles.splice(
            matchStart,
            matchEnd - matchStart + 1,
          );

          setScore((prev) => {
            const newScore = prev + matchedMarbles.length * 50;
            onScore?.(newScore);
            return newScore;
          });

          // Recalculate positions
          marbles.forEach((m, idx) => {
            m.distanceOnPath = idx * 25;
            const pos = getPathPosition(m.distanceOnPath);
            m.x = pos.x;
            m.y = pos.y;
          });

          // Check for chain reactions
          if (matchStart < marbles.length) {
            setTimeout(() => checkMatches(Math.max(0, matchStart - 1)), 100);
          }
        }

        // Check win condition
        if (marbles.length === 0) {
          setLevel((prev) => prev + 1);
          setTimeout(() => {
            initializeMarbles();
            gameSpeed += 0.1;
          }, 1000);
        }
      };

      const shoot = () => {
        const shooterMarble: ShooterMarble = {
          x: shooter.x,
          y: shooter.y,
          vx: Math.cos(shooterAngle) * 8,
          vy: Math.sin(shooterAngle) * 8,
          color: currentMarble.color,
          symbol: currentMarble.symbol,
          active: true,
        };

        shooterMarbles.push(shooterMarble);
      };

      const handleMouseMove = (event: MouseEvent) => {
        const rect = canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;

        shooterAngle = Math.atan2(mouseY - shooter.y, mouseX - shooter.x);
      };

      const handleClick = () => {
        if (gameState === "playing") {
          shoot();
        }
      };

      canvas.addEventListener("mousemove", handleMouseMove);
      canvas.addEventListener("click", handleClick);

      initializeMarbles();

      const gameLoop = () => {
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Update game
        updateMarbles();
        updateShooterMarbles();

        // Draw everything
        drawBackground();

        // Draw marbles in chain
        marbles.forEach(drawMarble);

        // Draw shooter marbles
        shooterMarbles.forEach((marble) => drawMarble(marble));

        drawShooter();

        // Draw UI
        ctx.fillStyle = "#ffd700";
        ctx.font = "20px Arial";
        ctx.textAlign = "left";
        ctx.fillText(`Score: ${score}`, 10, 30);
        ctx.fillText(`Level: ${level}`, 10, 55);

        // Instructions
        ctx.font = "14px Arial";
        ctx.fillText("Aim with mouse, click to shoot", 10, canvas.height - 30);
        ctx.fillText("Match 3+ marbles to clear them", 10, canvas.height - 10);

        // Warning if marbles are close to end
        if (marbles.length > 0 && marbles[0].distanceOnPath > 350) {
          ctx.fillStyle = "#ff0000";
          ctx.font = "24px Arial";
          ctx.textAlign = "center";
          ctx.fillText("WARNING! MARBLES APPROACHING!", canvas.width / 2, 100);
        }

        if (gameState === "playing") {
          requestAnimationFrame(gameLoop);
        }
      };

      gameLoop();

      return () => {
        canvas.removeEventListener("mousemove", handleMouseMove);
        canvas.removeEventListener("click", handleClick);
      };
    },
    [score, level, gameState, onScore, onGameOver],
  );

  const canvasRef = useGameCanvas(gameLogic, [score, level, gameState]);

  return (
    <div className="flex flex-col items-center">
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="border border-border rounded-lg cursor-crosshair"
        style={{ width: `${width}px`, height: `${height}px` }}
      />
      {gameState === "gameOver" && (
        <div className="mt-4 text-center">
          <h3 className="text-xl font-bold text-foreground">
            The Curse Consumed You!
          </h3>
          <p className="text-muted-foreground">Final Score: {score}</p>
          <p className="text-muted-foreground">Level Reached: {level}</p>
        </div>
      )}
    </div>
  );
}
