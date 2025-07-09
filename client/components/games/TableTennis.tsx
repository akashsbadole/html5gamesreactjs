import { useGameCanvas, GameProps } from "./GameEngine";
import { useState, useCallback } from "react";

interface Ball {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
}

interface Paddle {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
}

export default function TableTennis({
  width = 600,
  height = 300,
  onScore,
  onGameOver,
}: GameProps) {
  const [playerScore, setPlayerScore] = useState(0);
  const [aiScore, setAiScore] = useState(0);
  const [gameState, setGameState] = useState<"playing" | "gameOver">("playing");

  const gameLogic = useCallback(
    (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => {
      const ball: Ball = {
        x: canvas.width / 2,
        y: canvas.height / 2,
        vx: 3,
        vy: 2,
        radius: 6,
      };

      const playerPaddle: Paddle = {
        x: 20,
        y: canvas.height / 2 - 40,
        width: 10,
        height: 80,
        speed: 6,
      };

      const aiPaddle: Paddle = {
        x: canvas.width - 30,
        y: canvas.height / 2 - 40,
        width: 10,
        height: 80,
        speed: 4,
      };

      let keys: { [key: string]: boolean } = {};

      const drawTable = () => {
        // Table surface
        ctx.fillStyle = "#0a5a0a";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Net
        ctx.fillStyle = "#fff";
        ctx.fillRect(canvas.width / 2 - 2, 0, 4, canvas.height);

        // Center line
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 2;
        ctx.setLineDash([10, 10]);
        ctx.beginPath();
        ctx.moveTo(canvas.width / 2, 0);
        ctx.lineTo(canvas.width / 2, canvas.height);
        ctx.stroke();
        ctx.setLineDash([]);

        // Table borders
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 3;
        ctx.strokeRect(0, 0, canvas.width, canvas.height);
      };

      const drawPaddle = (paddle: Paddle, color: string) => {
        ctx.fillStyle = color;
        ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);

        // Paddle highlight
        ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
        ctx.fillRect(paddle.x, paddle.y, paddle.width, 5);
      };

      const drawBall = () => {
        // Ball shadow
        ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
        ctx.beginPath();
        ctx.arc(ball.x + 2, ball.y + 2, ball.radius, 0, 2 * Math.PI);
        ctx.fill();

        // Ball
        ctx.fillStyle = "#ff6b35";
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius, 0, 2 * Math.PI);
        ctx.fill();

        // Ball highlight
        ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
        ctx.beginPath();
        ctx.arc(ball.x - 2, ball.y - 2, ball.radius / 3, 0, 2 * Math.PI);
        ctx.fill();
      };

      const updatePaddles = () => {
        // Player paddle controls
        if (keys["ArrowUp"] || keys["w"] || keys["W"]) {
          playerPaddle.y = Math.max(0, playerPaddle.y - playerPaddle.speed);
        }
        if (keys["ArrowDown"] || keys["s"] || keys["S"]) {
          playerPaddle.y = Math.min(
            canvas.height - playerPaddle.height,
            playerPaddle.y + playerPaddle.speed,
          );
        }

        // AI paddle (follows ball with some delay)
        const paddleCenter = aiPaddle.y + aiPaddle.height / 2;
        const ballY = ball.y;

        if (ballY < paddleCenter - 10) {
          aiPaddle.y = Math.max(0, aiPaddle.y - aiPaddle.speed);
        } else if (ballY > paddleCenter + 10) {
          aiPaddle.y = Math.min(
            canvas.height - aiPaddle.height,
            aiPaddle.y + aiPaddle.speed,
          );
        }
      };

      const updateBall = () => {
        ball.x += ball.vx;
        ball.y += ball.vy;

        // Top and bottom wall collisions
        if (ball.y <= ball.radius || ball.y >= canvas.height - ball.radius) {
          ball.vy *= -1;
          ball.y = Math.max(
            ball.radius,
            Math.min(canvas.height - ball.radius, ball.y),
          );
        }

        // Player paddle collision
        if (
          ball.x - ball.radius <= playerPaddle.x + playerPaddle.width &&
          ball.x + ball.radius >= playerPaddle.x &&
          ball.y >= playerPaddle.y &&
          ball.y <= playerPaddle.y + playerPaddle.height &&
          ball.vx < 0
        ) {
          ball.vx *= -1.1; // Increase speed slightly
          ball.x = playerPaddle.x + playerPaddle.width + ball.radius;

          // Add spin based on where ball hits paddle
          const hitPos = (ball.y - playerPaddle.y) / playerPaddle.height - 0.5;
          ball.vy += hitPos * 3;
        }

        // AI paddle collision
        if (
          ball.x + ball.radius >= aiPaddle.x &&
          ball.x - ball.radius <= aiPaddle.x + aiPaddle.width &&
          ball.y >= aiPaddle.y &&
          ball.y <= aiPaddle.y + aiPaddle.height &&
          ball.vx > 0
        ) {
          ball.vx *= -1.1;
          ball.x = aiPaddle.x - ball.radius;

          // AI adds slight randomness
          const hitPos = (ball.y - aiPaddle.y) / aiPaddle.height - 0.5;
          ball.vy += hitPos * 2 + (Math.random() - 0.5);
        }

        // Scoring
        if (ball.x < 0) {
          setAiScore((prev) => prev + 1);
          resetBall(1);
        } else if (ball.x > canvas.width) {
          setPlayerScore((prev) => {
            const newScore = prev + 1;
            onScore?.(newScore);
            return newScore;
          });
          resetBall(-1);
        }

        // Game over check
        if (playerScore >= 11 || aiScore >= 11) {
          setGameState("gameOver");
          onGameOver?.();
        }
      };

      const resetBall = (direction: number) => {
        ball.x = canvas.width / 2;
        ball.y = canvas.height / 2;
        ball.vx = 3 * direction;
        ball.vy = (Math.random() - 0.5) * 4;
      };

      const handleKeyDown = (event: KeyboardEvent) => {
        keys[event.key] = true;
      };

      const handleKeyUp = (event: KeyboardEvent) => {
        keys[event.key] = false;
      };

      document.addEventListener("keydown", handleKeyDown);
      document.addEventListener("keyup", handleKeyUp);

      const gameLoop = () => {
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Update game
        updatePaddles();
        updateBall();

        // Draw everything
        drawTable();
        drawPaddle(playerPaddle, "#4CAF50");
        drawPaddle(aiPaddle, "#F44336");
        drawBall();

        // Draw UI
        ctx.fillStyle = "#fff";
        ctx.font = "24px Arial";
        ctx.textAlign = "center";
        ctx.fillText(`${playerScore} - ${aiScore}`, canvas.width / 2, 30);

        // Instructions
        ctx.font = "12px Arial";
        ctx.textAlign = "left";
        ctx.fillText("W/S or ↑/↓ to move paddle", 10, canvas.height - 20);
        ctx.textAlign = "right";
        ctx.fillText(
          "First to 11 wins!",
          canvas.width - 10,
          canvas.height - 20,
        );

        if (gameState === "playing") {
          requestAnimationFrame(gameLoop);
        }
      };

      gameLoop();

      return () => {
        document.removeEventListener("keydown", handleKeyDown);
        document.removeEventListener("keyup", handleKeyUp);
      };
    },
    [playerScore, aiScore, gameState, onScore, onGameOver],
  );

  const canvasRef = useGameCanvas(gameLogic, [playerScore, aiScore, gameState]);

  return (
    <div className="flex flex-col items-center">
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="border border-border rounded-lg"
        style={{ width: `${width}px`, height: `${height}px` }}
        tabIndex={0}
      />
      {gameState === "gameOver" && (
        <div className="mt-4 text-center">
          <h3 className="text-xl font-bold text-foreground">
            {playerScore > aiScore ? "You Win!" : "AI Wins!"}
          </h3>
          <p className="text-muted-foreground">
            Final Score: {playerScore} - {aiScore}
          </p>
        </div>
      )}
    </div>
  );
}
