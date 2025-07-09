import { useState, useEffect } from "react";
import { GameProps } from "./GameEngine";

const SYMBOLS = ["🎮", "🎯", "🎲", "🃏", "🎪", "🎨", "🎭", "🎸"];

interface Card {
  id: number;
  symbol: string;
  isFlipped: boolean;
  isMatched: boolean;
}

export default function MemoryGame({ onScore }: GameProps) {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [moves, setMoves] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);

  // Initialize cards
  useEffect(() => {
    const shuffledCards: Card[] = [];
    const allSymbols = [...SYMBOLS, ...SYMBOLS]; // Duplicate for pairs

    allSymbols
      .sort(() => Math.random() - 0.5)
      .forEach((symbol, index) => {
        shuffledCards.push({
          id: index,
          symbol,
          isFlipped: false,
          isMatched: false,
        });
      });

    setCards(shuffledCards);
  }, []);

  const handleCardClick = (cardId: number) => {
    if (
      flippedCards.length === 2 ||
      cards[cardId].isFlipped ||
      cards[cardId].isMatched
    ) {
      return;
    }

    const newFlippedCards = [...flippedCards, cardId];
    setFlippedCards(newFlippedCards);

    // Update card state
    setCards((prev) =>
      prev.map((card) =>
        card.id === cardId ? { ...card, isFlipped: true } : card,
      ),
    );

    // Check for match when two cards are flipped
    if (newFlippedCards.length === 2) {
      setMoves((prev) => prev + 1);

      const [firstCard, secondCard] = newFlippedCards.map((id) => cards[id]);

      setTimeout(() => {
        if (firstCard.symbol === secondCard.symbol) {
          // Match found
          setCards((prev) =>
            prev.map((card) =>
              newFlippedCards.includes(card.id)
                ? { ...card, isMatched: true }
                : card,
            ),
          );
          setScore((prev) => {
            const newScore = prev + 100;
            onScore?.(newScore);
            return newScore;
          });

          // Check if game is complete
          const allMatched = cards.every(
            (card) =>
              card.isMatched || newFlippedCards.includes(card.id) || card.id,
          );
          if (allMatched) {
            setGameComplete(true);
          }
        } else {
          // No match, flip cards back
          setCards((prev) =>
            prev.map((card) =>
              newFlippedCards.includes(card.id)
                ? { ...card, isFlipped: false }
                : card,
            ),
          );
        }
        setFlippedCards([]);
      }, 1000);
    }
  };

  const resetGame = () => {
    setCards([]);
    setFlippedCards([]);
    setScore(0);
    setMoves(0);
    setGameComplete(false);

    // Re-initialize cards
    setTimeout(() => {
      const shuffledCards: Card[] = [];
      const allSymbols = [...SYMBOLS, ...SYMBOLS];

      allSymbols
        .sort(() => Math.random() - 0.5)
        .forEach((symbol, index) => {
          shuffledCards.push({
            id: index,
            symbol,
            isFlipped: false,
            isMatched: false,
          });
        });

      setCards(shuffledCards);
    }, 100);
  };

  return (
    <div className="flex flex-col items-center p-6 bg-gradient-to-br from-purple-900 to-blue-900 rounded-lg text-white">
      <h3 className="text-2xl font-bold mb-4">Memory Card Game</h3>

      {/* Stats */}
      <div className="flex gap-6 mb-6 text-lg">
        <div>Score: {score}</div>
        <div>Moves: {moves}</div>
        <div>
          Pairs: {cards.filter((card) => card.isMatched).length / 2}/
          {SYMBOLS.length}
        </div>
      </div>

      {/* Game Grid */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {cards.map((card) => (
          <div
            key={card.id}
            onClick={() => handleCardClick(card.id)}
            className={`
              w-16 h-16 rounded-lg cursor-pointer transition-all duration-300 flex items-center justify-center text-2xl font-bold
              ${
                card.isFlipped || card.isMatched
                  ? "bg-white text-gray-800 transform scale-105"
                  : "bg-gray-700 hover:bg-gray-600"
              }
              ${card.isMatched ? "ring-4 ring-green-400" : ""}
            `}
          >
            {card.isFlipped || card.isMatched ? card.symbol : "?"}
          </div>
        ))}
      </div>

      {/* Game Complete */}
      {gameComplete && (
        <div className="text-center mb-4">
          <div className="text-3xl mb-2">🎉</div>
          <div className="text-xl font-bold text-green-400">
            Congratulations!
          </div>
          <div>You completed the game in {moves} moves!</div>
        </div>
      )}

      {/* Controls */}
      <button
        onClick={resetGame}
        className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
      >
        New Game
      </button>

      {/* Instructions */}
      <div className="mt-4 text-center text-sm text-gray-300 max-w-md">
        <p>Click cards to flip them over and find matching pairs!</p>
        <p>Match all pairs to win the game.</p>
      </div>
    </div>
  );
}
