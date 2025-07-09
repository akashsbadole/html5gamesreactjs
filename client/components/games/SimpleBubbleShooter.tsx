import { useEffect, useRef, useState } from "react";
import { GameProps } from "./GameEngine";

interface Bubble {
  x: number;
  y: number;
  color: string;
  radius: number;
}

const COLORS = ["#ff6b6b", "#4ecdc4", "#45b7d1", "#96ceb4", "#feca57"];

export default function SimpleBubbleShooter({
  width = 400,
  height = 500,
  onScore,
}: GameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [currentColor, setCurrentColor] = useState(COLORS[0]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const bubbles: Bubble[] = [];
    const bubbleRadius = 20;
    let shooterBubble: Bubble | null = null;
    let animationId: number;

    // Initialize bubbles
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 10; col++) {
        if (Math.random() > 0.3) {
          bubbles.push({
            x: col * (bubbleRadius * 2) + bubbleRadius,
            y: row * (bubbleRadius * 1.8) + bubbleRadius,
            color: COLORS[Math.floor(Math.random() * COLORS.length)],
            radius: bubbleRadius,
          });
        }
      }
    }

    const drawBubble = (bubble: Bubble) => {
      ctx.beginPath();
      ctx.arc(bubble.x, bubble.y, bubble.radius, 0, 2 * Math.PI);
      ctx.fillStyle = bubble.color;
      ctx.fill();
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 2;
      ctx.stroke();
    };

    const drawShooter = () => {
      const shooterX = canvas.width / 2;
      const shooterY = canvas.height - 30;

      // Current bubble
      ctx.beginPath();
      ctx.arc(shooterX, shooterY, bubbleRadius, 0, 2 * Math.PI);
      ctx.fillStyle = currentColor;
      ctx.fill();
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 2;
      ctx.stroke();
    };

    const checkCollision = (x: number, y: number): boolean => {
      return bubbles.some((bubble) => {
        const dx = x - bubble.x;
        const dy = y - bubble.y;
        return Math.sqrt(dx * dx + dy * dy) < bubbleRadius * 2;
      });
    };

    const addBubble = (x: number, y: number) => {
      bubbles.push({
        x,
        y,
        color: currentColor,
        radius: bubbleRadius,
      });

      // Remove matching bubbles
      const toRemove = new Set<Bubble>();
      const checkMatches = (startBubble: Bubble) => {
        const stack = [startBubble];
        const visited = new Set();
        const matching = [];

        while (stack.length > 0) {
          const bubble = stack.pop()!;
          if (visited.has(bubble) || bubble.color !== startBubble.color)
            continue;

          visited.add(bubble);
          matching.push(bubble);

          bubbles.forEach((other) => {
            if (
              !visited.has(other) &&
              other.color === startBubble.color &&
              Math.sqrt((bubble.x - other.x) ** 2 + (bubble.y - other.y) ** 2) <
                bubbleRadius * 2.5
            ) {
              stack.push(other);
            }
          });
        }

        if (matching.length >= 3) {
          matching.forEach((b) => toRemove.add(b));
        }
      };

      const newBubble = bubbles[bubbles.length - 1];
      checkMatches(newBubble);

      // Remove matched bubbles
      toRemove.forEach((bubble) => {
        const index = bubbles.indexOf(bubble);
        if (index > -1) bubbles.splice(index, 1);
      });

      if (toRemove.size > 0) {
        setScore((prev) => {
          const newScore = prev + toRemove.size * 10;
          onScore?.(newScore);
          return newScore;
        });
      }

      // Get new color
      setCurrentColor(COLORS[Math.floor(Math.random() * COLORS.length)]);
    };

    const handleClick = (event: MouseEvent) => {
      if (shooterBubble) return; // Already shooting

      const rect = canvas.getBoundingClientRect();
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;

      const shooterX = canvas.width / 2;
      const shooterY = canvas.height - 30;

      const dx = mouseX - shooterX;
      const dy = mouseY - shooterY;
      const length = Math.sqrt(dx * dx + dy * dy);

      shooterBubble = {
        x: shooterX,
        y: shooterY,
        color: currentColor,
        radius: bubbleRadius,
      };

      const speed = 8;
      const vx = (dx / length) * speed;
      const vy = (dy / length) * speed;

      const moveBubble = () => {
        if (!shooterBubble) return;

        shooterBubble.x += vx;
        shooterBubble.y += vy;

        // Wall collision
        if (
          shooterBubble.x <= bubbleRadius ||
          shooterBubble.x >= canvas.width - bubbleRadius
        ) {
          const speed = Math.sqrt(vx * vx + vy * vy);
          const newVx = -vx;
          shooterBubble.x = Math.max(
            bubbleRadius,
            Math.min(canvas.width - bubbleRadius, shooterBubble.x),
          );
        }

        // Check collision with other bubbles or top
        if (
          shooterBubble.y <= bubbleRadius ||
          checkCollision(shooterBubble.x, shooterBubble.y)
        ) {
          // Add bubble to grid
          const gridY = Math.max(
            bubbleRadius,
            Math.round(shooterBubble.y / (bubbleRadius * 1.8)) *
              (bubbleRadius * 1.8),
          );
          const gridX =
            Math.round(shooterBubble.x / (bubbleRadius * 2)) *
            (bubbleRadius * 2);

          addBubble(gridX, gridY);
          shooterBubble = null;
        }
      };

      const shootLoop = () => {
        if (shooterBubble) {
          moveBubble();
          requestAnimationFrame(shootLoop);
        }
      };
      shootLoop();
    };

    canvas.addEventListener("click", handleClick);

    const gameLoop = () => {
      // Clear canvas
      ctx.fillStyle = "#1a1a2e";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw bubbles
      bubbles.forEach(drawBubble);

      // Draw shooter bubble
      if (shooterBubble) {
        drawBubble(shooterBubble);
      }

      // Draw shooter
      drawShooter();

      // Draw UI
      ctx.fillStyle = "#fff";
      ctx.font = "16px Arial";
      ctx.fillText(`Score: ${score}`, 10, 25);
      ctx.font = "12px Arial";
      ctx.fillText("Click to shoot bubbles!", 10, canvas.height - 10);

      animationId = requestAnimationFrame(gameLoop);
    };

    gameLoop();

    return () => {
      canvas.removeEventListener("click", handleClick);
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [score, currentColor, onScore]);

  return (
    <div className="flex flex-col items-center">
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="border border-gray-300 rounded-lg cursor-crosshair bg-gray-900"
        style={{ width: `${width}px`, height: `${height}px` }}
      />
      <div className="mt-2 text-center">
        <p className="text-sm">Score: {score}</p>
        <p className="text-xs text-gray-600">Click to shoot bubbles!</p>
      </div>
    </div>
  );
}
