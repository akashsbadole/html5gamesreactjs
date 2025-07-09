import { useState, useEffect } from "react";
import { GameProps } from "./GameEngine";

interface Block {
  id: number;
  x: number;
  y: number;
  width: number;
  color: string;
  falling: boolean;
}

export default function TowerCrash3D({ onScore }: GameProps) {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [currentBlock, setCurrentBlock] = useState<Block | null>(null);
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState<"building" | "crashing">(
    "building",
  );
  const [towerHeight, setTowerHeight] = useState(0);

  const colors = [
    "#FF6B6B",
    "#4ECDC4",
    "#45B7D1",
    "#96CEB4",
    "#FECA57",
    "#FF9FF3",
  ];

  useEffect(() => {
    if (gameState === "building" && !currentBlock) {
      createNewBlock();
    }
  }, [currentBlock, gameState]);

  const createNewBlock = () => {
    const newBlock: Block = {
      id: Date.now(),
      x: Math.random() * 300,
      y: 0,
      width: 80 + Math.random() * 40,
      color: colors[Math.floor(Math.random() * colors.length)],
      falling: false,
    };
    setCurrentBlock(newBlock);
  };

  const placeBlock = () => {
    if (!currentBlock) return;

    const placedBlock = {
      ...currentBlock,
      y: 400 - (blocks.length + 1) * 30,
    };

    setBlocks((prev) => [...prev, placedBlock]);
    setScore((prev) => {
      const newScore = prev + 10;
      onScore?.(newScore);
      return newScore;
    });
    setTowerHeight((prev) => prev + 30);
    setCurrentBlock(null);

    // Check if tower is getting high
    if (blocks.length >= 15) {
      setGameState("crashing");
      setTimeout(() => {
        crashTower();
      }, 1000);
    }
  };

  const crashTower = () => {
    // Animate blocks falling
    setBlocks((prev) =>
      prev.map((block, index) => ({
        ...block,
        falling: true,
        x: block.x + (Math.random() - 0.5) * 100,
        y: block.y + Math.random() * 200,
      })),
    );

    setTimeout(() => {
      setBlocks([]);
      setGameState("building");
      setTowerHeight(0);
    }, 3000);
  };

  const triggerCrash = () => {
    setGameState("crashing");
    crashTower();
  };

  return (
    <div className="flex flex-col items-center p-4 bg-blue-100 rounded-lg">
      <h3 className="text-xl font-bold mb-4 text-gray-800">Tower Crash 3D</h3>

      {/* Game Area */}
      <div
        className="relative border-2 border-gray-600 rounded-lg bg-gradient-to-b from-sky-300 to-green-300 overflow-hidden"
        style={{ width: "400px", height: "400px" }}
      >
        {/* Ground */}
        <div className="absolute bottom-0 w-full h-8 bg-brown-500 bg-gradient-to-r from-yellow-700 to-yellow-800"></div>

        {/* Blocks */}
        {blocks.map((block) => (
          <div
            key={block.id}
            className={`absolute transition-all duration-500 ${
              block.falling ? "animate-bounce" : ""
            }`}
            style={{
              left: `${block.x}px`,
              bottom: `${400 - block.y - 30}px`,
              width: `${block.width}px`,
              height: "25px",
              backgroundColor: block.color,
              border: "2px solid rgba(255,255,255,0.3)",
              borderRadius: "4px",
              boxShadow: "2px 2px 4px rgba(0,0,0,0.3)",
            }}
          />
        ))}

        {/* Current Block */}
        {currentBlock && gameState === "building" && (
          <div
            className="absolute animate-pulse"
            style={{
              left: `${currentBlock.x}px`,
              top: "20px",
              width: `${currentBlock.width}px`,
              height: "25px",
              backgroundColor: currentBlock.color,
              border: "2px solid rgba(255,255,255,0.5)",
              borderRadius: "4px",
              boxShadow: "2px 2px 4px rgba(0,0,0,0.3)",
            }}
          />
        )}

        {/* UI Overlay */}
        <div className="absolute top-4 left-4 text-white font-bold">
          <div>Score: {score}</div>
          <div>Height: {towerHeight}px</div>
          <div>Blocks: {blocks.length}</div>
        </div>
      </div>

      {/* Controls */}
      <div className="mt-4 space-y-4 w-full max-w-md">
        {gameState === "building" && currentBlock && (
          <div>
            <label className="block text-sm font-medium mb-2">
              Block Position
            </label>
            <input
              type="range"
              min="0"
              max="300"
              value={currentBlock.x}
              onChange={(e) =>
                setCurrentBlock((prev) =>
                  prev ? { ...prev, x: Number(e.target.value) } : null,
                )
              }
              className="w-full"
            />
            <button
              onClick={placeBlock}
              className="w-full mt-2 bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
            >
              Place Block
            </button>
          </div>
        )}

        {blocks.length > 3 && gameState === "building" && (
          <button
            onClick={triggerCrash}
            className="w-full bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600"
          >
            💥 CRASH THE TOWER! 💥
          </button>
        )}

        <div className="text-center">
          <p className="text-lg font-semibold">Score: {score}</p>
          <p className="text-sm text-gray-600">
            {gameState === "building"
              ? "Position blocks to build a tower!"
              : "Watch your tower crash!"}
          </p>
        </div>
      </div>
    </div>
  );
}
