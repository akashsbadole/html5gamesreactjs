import { useGameCanvas, GameProps } from "./GameEngine";
import { useState, useCallback } from "react";

interface Ball {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  number: number;
  potted: boolean;
  stripe: boolean;
}

export default function BilliardsClassic({
  width = 600,
  height = 300,
  onScore,
  onGameOver,
}: GameProps) {
  const [score, setScore] = useState(0);
  const [currentPlayer, setCurrentPlayer] = useState<"solids" | "stripes">(
    "solids",
  );
  const [gameState, setGameState] = useState<
    "aiming" | "shooting" | "gameOver"
  >("aiming");

  const gameLogic = useCallback(
    (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => {
      const tableMargin = 20;
      const pocketRadius = 15;
      let balls: Ball[] = [];
      let cueBall: Ball;
      let cueStick = { angle: 0, power: 0, charging: false };
      let mousePos = { x: 0, y: 0 };

      const pockets = [
        { x: tableMargin, y: tableMargin },
        { x: canvas.width / 2, y: tableMargin },
        { x: canvas.width - tableMargin, y: tableMargin },
        { x: tableMargin, y: canvas.height - tableMargin },
        { x: canvas.width / 2, y: canvas.height - tableMargin },
        { x: canvas.width - tableMargin, y: canvas.height - tableMargin },
      ];

      const initializeBalls = () => {
        balls = [];

        // Create numbered balls
        const ballColors = [
          "#ffff00", // 1 - yellow
          "#0000ff", // 2 - blue
          "#ff0000", // 3 - red
          "#800080", // 4 - purple
          "#ffa500", // 5 - orange
          "#008000", // 6 - green
          "#800000", // 7 - maroon
          "#000000", // 8 - black
          "#ffff00", // 9 - yellow stripe
          "#0000ff", // 10 - blue stripe
          "#ff0000", // 11 - red stripe
          "#800080", // 12 - purple stripe
          "#ffa500", // 13 - orange stripe
          "#008000", // 14 - green stripe
          "#800000", // 15 - maroon stripe
        ];

        // Rack formation
        const rackX = canvas.width * 0.75;
        const rackY = canvas.height / 2;
        const ballRadius = 8;

        let ballIndex = 0;
        for (let row = 0; row < 5; row++) {
          for (let col = 0; col <= row; col++) {
            if (ballIndex < 15) {
              const x = rackX + row * ballRadius * 1.8;
              const y =
                rackY - row * ballRadius + col * ballRadius * 2 - ballRadius;

              balls.push({
                x,
                y,
                vx: 0,
                vy: 0,
                radius: ballRadius,
                color: ballColors[ballIndex],
                number: ballIndex + 1,
                potted: false,
                stripe: ballIndex >= 8, // 9-15 are stripes
              });
              ballIndex++;
            }
          }
        }

        // Cue ball
        cueBall = {
          x: canvas.width * 0.25,
          y: canvas.height / 2,
          vx: 0,
          vy: 0,
          radius: 8,
          color: "#ffffff",
          number: 0,
          potted: false,
          stripe: false,
        };
      };

      initializeBalls();

      const drawTable = () => {
        // Table surface
        ctx.fillStyle = "#0f7b0f";
        ctx.fillRect(
          tableMargin,
          tableMargin,
          canvas.width - tableMargin * 2,
          canvas.height - tableMargin * 2,
        );

        // Table border
        ctx.strokeStyle = "#8b4513";
        ctx.lineWidth = 4;
        ctx.strokeRect(
          tableMargin,
          tableMargin,
          canvas.width - tableMargin * 2,
          canvas.height - tableMargin * 2,
        );

        // Pockets
        pockets.forEach((pocket) => {
          ctx.fillStyle = "#000";
          ctx.beginPath();
          ctx.arc(pocket.x, pocket.y, pocketRadius, 0, 2 * Math.PI);
          ctx.fill();
        });
      };

      const drawBall = (ball: Ball) => {
        if (ball.potted) return;

        // Ball shadow
        ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
        ctx.beginPath();
        ctx.arc(ball.x + 2, ball.y + 2, ball.radius, 0, 2 * Math.PI);
        ctx.fill();

        // Ball
        ctx.fillStyle = ball.color;
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius, 0, 2 * Math.PI);
        ctx.fill();

        // Ball highlight
        ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
        ctx.beginPath();
        ctx.arc(ball.x - 2, ball.y - 2, ball.radius / 3, 0, 2 * Math.PI);
        ctx.fill();

        // Stripe pattern
        if (ball.stripe && ball.number !== 8) {
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(ball.x - ball.radius, ball.y - 2, ball.radius * 2, 4);
        }

        // Ball number
        if (ball.number > 0) {
          ctx.fillStyle = ball.number === 8 ? "#ffffff" : "#000";
          ctx.font = "10px Arial";
          ctx.textAlign = "center";
          ctx.fillText(ball.number.toString(), ball.x, ball.y + 3);
        }
      };

      const drawCueStick = () => {
        if (gameState !== "aiming" || cueBall.potted) return;

        const stickLength = 100 + cueStick.power * 2;
        const stickX =
          cueBall.x - Math.cos(cueStick.angle) * (20 + cueStick.power);
        const stickY =
          cueBall.y - Math.sin(cueStick.angle) * (20 + cueStick.power);

        ctx.strokeStyle = "#8b4513";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(stickX, stickY);
        ctx.lineTo(
          stickX - Math.cos(cueStick.angle) * stickLength,
          stickY - Math.sin(cueStick.angle) * stickLength,
        );
        ctx.stroke();

        // Cue tip
        ctx.fillStyle = "#000";
        ctx.beginPath();
        ctx.arc(stickX, stickY, 3, 0, 2 * Math.PI);
        ctx.fill();
      };

      const updateBalls = () => {
        let movingBalls = 0;

        [...balls, cueBall].forEach((ball) => {
          if (ball.potted) return;

          ball.x += ball.vx;
          ball.y += ball.vy;

          // Friction
          ball.vx *= 0.98;
          ball.vy *= 0.98;

          // Stop very slow balls
          if (Math.abs(ball.vx) < 0.1 && Math.abs(ball.vy) < 0.1) {
            ball.vx = 0;
            ball.vy = 0;
          } else {
            movingBalls++;
          }

          // Wall collisions
          if (
            ball.x - ball.radius <= tableMargin ||
            ball.x + ball.radius >= canvas.width - tableMargin
          ) {
            ball.vx *= -0.8;
            ball.x = Math.max(
              tableMargin + ball.radius,
              Math.min(canvas.width - tableMargin - ball.radius, ball.x),
            );
          }

          if (
            ball.y - ball.radius <= tableMargin ||
            ball.y + ball.radius >= canvas.height - tableMargin
          ) {
            ball.vy *= -0.8;
            ball.y = Math.max(
              tableMargin + ball.radius,
              Math.min(canvas.height - tableMargin - ball.radius, ball.y),
            );
          }

          // Check pocket collisions
          pockets.forEach((pocket) => {
            const dx = ball.x - pocket.x;
            const dy = ball.y - pocket.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < pocketRadius - ball.radius / 2) {
              ball.potted = true;
              if (ball === cueBall) {
                // Cue ball potted - reset position
                setTimeout(() => {
                  cueBall.x = canvas.width * 0.25;
                  cueBall.y = canvas.height / 2;
                  cueBall.vx = 0;
                  cueBall.vy = 0;
                  cueBall.potted = false;
                }, 1000);
              } else {
                setScore((prev) => {
                  const newScore = prev + (ball.number === 8 ? 50 : 10);
                  onScore?.(newScore);
                  return newScore;
                });
              }
            }
          });
        });

        // Ball to ball collisions
        for (let i = 0; i < balls.length; i++) {
          if (balls[i].potted) continue;

          // Check collision with cue ball
          if (!cueBall.potted) {
            const dx = balls[i].x - cueBall.x;
            const dy = balls[i].y - cueBall.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < balls[i].radius + cueBall.radius) {
              // Simple collision response
              const angle = Math.atan2(dy, dx);
              const totalSpeed = Math.sqrt(
                cueBall.vx * cueBall.vx + cueBall.vy * cueBall.vy,
              );

              balls[i].vx = Math.cos(angle) * totalSpeed * 0.8;
              balls[i].vy = Math.sin(angle) * totalSpeed * 0.8;
              cueBall.vx *= 0.3;
              cueBall.vy *= 0.3;

              // Separate balls
              const overlap = balls[i].radius + cueBall.radius - distance;
              balls[i].x += (dx / distance) * overlap * 0.5;
              balls[i].y += (dy / distance) * overlap * 0.5;
              cueBall.x -= (dx / distance) * overlap * 0.5;
              cueBall.y -= (dy / distance) * overlap * 0.5;
            }
          }

          // Check ball to ball collisions
          for (let j = i + 1; j < balls.length; j++) {
            if (balls[j].potted) continue;

            const dx = balls[i].x - balls[j].x;
            const dy = balls[i].y - balls[j].y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < balls[i].radius + balls[j].radius) {
              // Simple elastic collision
              const angle = Math.atan2(dy, dx);
              const speed1 = Math.sqrt(
                balls[i].vx * balls[i].vx + balls[i].vy * balls[i].vy,
              );
              const speed2 = Math.sqrt(
                balls[j].vx * balls[j].vx + balls[j].vy * balls[j].vy,
              );

              balls[i].vx = Math.cos(angle) * speed2 * 0.7;
              balls[i].vy = Math.sin(angle) * speed2 * 0.7;
              balls[j].vx = -Math.cos(angle) * speed1 * 0.7;
              balls[j].vy = -Math.sin(angle) * speed1 * 0.7;
            }
          }
        }

        if (movingBalls === 0 && gameState === "shooting") {
          setGameState("aiming");
        }
      };

      const handleMouseMove = (event: MouseEvent) => {
        const rect = canvas.getBoundingClientRect();
        mousePos.x = event.clientX - rect.left;
        mousePos.y = event.clientY - rect.top;

        if (gameState === "aiming" && !cueBall.potted) {
          cueStick.angle = Math.atan2(
            mousePos.y - cueBall.y,
            mousePos.x - cueBall.x,
          );
        }
      };

      const handleMouseDown = () => {
        if (gameState === "aiming" && !cueBall.potted) {
          cueStick.charging = true;
        }
      };

      const handleMouseUp = () => {
        if (cueStick.charging && gameState === "aiming" && !cueBall.potted) {
          const power = Math.min(cueStick.power / 10, 8);
          cueBall.vx = Math.cos(cueStick.angle) * power;
          cueBall.vy = Math.sin(cueStick.angle) * power;

          cueStick.power = 0;
          cueStick.charging = false;
          setGameState("shooting");
        }
      };

      canvas.addEventListener("mousemove", handleMouseMove);
      canvas.addEventListener("mousedown", handleMouseDown);
      canvas.addEventListener("mouseup", handleMouseUp);

      const gameLoop = () => {
        // Clear canvas
        ctx.fillStyle = "#2d4a2d";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Update cue power
        if (cueStick.charging) {
          cueStick.power = Math.min(100, cueStick.power + 2);
        }

        // Update game
        updateBalls();

        // Draw everything
        drawTable();
        balls.forEach(drawBall);
        drawBall(cueBall);
        drawCueStick();

        // Draw UI
        ctx.fillStyle = "#fff";
        ctx.font = "16px Arial";
        ctx.textAlign = "left";
        ctx.fillText(`Score: ${score}`, 10, 25);
        ctx.fillText(`Player: ${currentPlayer}`, 10, 45);

        // Power meter
        if (cueStick.charging) {
          ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
          ctx.fillRect(10, canvas.height - 30, 100, 10);
          ctx.fillStyle =
            cueStick.power < 30
              ? "#4CAF50"
              : cueStick.power < 70
                ? "#FFC107"
                : "#F44336";
          ctx.fillRect(10, canvas.height - 30, cueStick.power, 10);
        }

        // Instructions
        ctx.font = "12px Arial";
        ctx.fillText(
          "Aim with mouse, hold to charge power",
          10,
          canvas.height - 40,
        );

        if (gameState !== "gameOver") {
          requestAnimationFrame(gameLoop);
        }
      };

      gameLoop();

      return () => {
        canvas.removeEventListener("mousemove", handleMouseMove);
        canvas.removeEventListener("mousedown", handleMouseDown);
        canvas.removeEventListener("mouseup", handleMouseUp);
      };
    },
    [score, currentPlayer, gameState, onScore, onGameOver],
  );

  const canvasRef = useGameCanvas(gameLogic, [score, currentPlayer, gameState]);

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
          <h3 className="text-xl font-bold text-foreground">Game Complete!</h3>
          <p className="text-muted-foreground">Final Score: {score}</p>
        </div>
      )}
    </div>
  );
}
