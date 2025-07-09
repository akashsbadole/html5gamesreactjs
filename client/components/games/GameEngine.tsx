import { useEffect, useRef } from "react";

export interface GameProps {
  width?: number;
  height?: number;
  onScore?: (score: number) => void;
  onGameOver?: () => void;
}

export const useGameCanvas = (
  gameLogic: (
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
  ) => () => void,
  dependencies: any[] = [],
) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Initialize and run game logic
    const cleanup = gameLogic(canvas, ctx);

    return cleanup;
  }, dependencies);

  return canvasRef;
};
