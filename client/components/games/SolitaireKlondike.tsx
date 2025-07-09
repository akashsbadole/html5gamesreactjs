import { useState, useCallback, useEffect } from "react";
import { GameProps } from "./GameEngine";

type Suit = "hearts" | "diamonds" | "clubs" | "spades";
type Rank =
  | "A"
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "10"
  | "J"
  | "Q"
  | "K";

interface Card {
  suit: Suit;
  rank: Rank;
  faceUp: boolean;
  id: string;
}

const SUITS: Suit[] = ["hearts", "diamonds", "clubs", "spades"];
const RANKS: Rank[] = [
  "A",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "J",
  "Q",
  "K",
];

const getSuitSymbol = (suit: Suit): string => {
  switch (suit) {
    case "hearts":
      return "♥";
    case "diamonds":
      return "♦";
    case "clubs":
      return "♣";
    case "spades":
      return "♠";
  }
};

const isRed = (suit: Suit): boolean => suit === "hearts" || suit === "diamonds";

const getRankValue = (rank: Rank): number => {
  if (rank === "A") return 1;
  if (rank === "J") return 11;
  if (rank === "Q") return 12;
  if (rank === "K") return 13;
  return parseInt(rank);
};

export default function SolitaireKlondike({ onScore, onGameOver }: GameProps) {
  const [deck, setDeck] = useState<Card[]>([]);
  const [waste, setWaste] = useState<Card[]>([]);
  const [foundation, setFoundation] = useState<Card[][]>([[], [], [], []]);
  const [tableau, setTableau] = useState<Card[][]>([
    [],
    [],
    [],
    [],
    [],
    [],
    [],
  ]);
  const [selectedCard, setSelectedCard] = useState<{
    card: Card;
    from: string;
    index?: number;
  } | null>(null);
  const [score, setScore] = useState(0);
  const [moves, setMoves] = useState(0);

  const createDeck = useCallback((): Card[] => {
    const newDeck: Card[] = [];
    for (const suit of SUITS) {
      for (const rank of RANKS) {
        newDeck.push({
          suit,
          rank,
          faceUp: false,
          id: `${suit}-${rank}`,
        });
      }
    }
    return newDeck.sort(() => Math.random() - 0.5);
  }, []);

  const initializeGame = useCallback(() => {
    const shuffledDeck = createDeck();
    const newTableau: Card[][] = [[], [], [], [], [], [], []];
    let deckIndex = 0;

    // Deal cards to tableau
    for (let col = 0; col < 7; col++) {
      for (let row = col; row < 7; row++) {
        const card = shuffledDeck[deckIndex++];
        if (row === col) {
          card.faceUp = true;
        }
        newTableau[row].push(card);
      }
    }

    setTableau(newTableau);
    setDeck(shuffledDeck.slice(deckIndex));
    setWaste([]);
    setFoundation([[], [], [], []]);
    setSelectedCard(null);
    setScore(0);
    setMoves(0);
  }, [createDeck]);

  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  const drawFromDeck = () => {
    if (deck.length === 0) {
      // Reset deck from waste
      setDeck([...waste].reverse().map((card) => ({ ...card, faceUp: false })));
      setWaste([]);
    } else {
      const drawnCard = deck[0];
      drawnCard.faceUp = true;
      setWaste([drawnCard, ...waste]);
      setDeck(deck.slice(1));
    }
    setMoves((m) => m + 1);
  };

  const canPlaceOnFoundation = (
    card: Card,
    foundationPile: Card[],
  ): boolean => {
    if (foundationPile.length === 0) {
      return card.rank === "A";
    }
    const topCard = foundationPile[foundationPile.length - 1];
    return (
      card.suit === topCard.suit &&
      getRankValue(card.rank) === getRankValue(topCard.rank) + 1
    );
  };

  const canPlaceOnTableau = (card: Card, tableauPile: Card[]): boolean => {
    if (tableauPile.length === 0) {
      return card.rank === "K";
    }
    const topCard = tableauPile[tableauPile.length - 1];
    return (
      isRed(card.suit) !== isRed(topCard.suit) &&
      getRankValue(card.rank) === getRankValue(topCard.rank) - 1
    );
  };

  const handleCardClick = (card: Card, from: string, index?: number) => {
    if (!card.faceUp) return;

    if (selectedCard) {
      // Try to place selected card
      const {
        card: selectedCardData,
        from: selectedFrom,
        index: selectedIndex,
      } = selectedCard;

      if (from.startsWith("foundation")) {
        const foundationIndex = parseInt(from.split("-")[1]);
        if (
          canPlaceOnFoundation(selectedCardData, foundation[foundationIndex])
        ) {
          moveCard(selectedFrom, from, selectedIndex);
          setScore((s) => s + 10);
        }
      } else if (from.startsWith("tableau")) {
        const tableauIndex = parseInt(from.split("-")[1]);
        if (canPlaceOnTableau(selectedCardData, tableau[tableauIndex])) {
          moveCard(selectedFrom, from, selectedIndex);
          setScore((s) => s + 5);
        }
      }
      setSelectedCard(null);
    } else {
      // Select card
      setSelectedCard({ card, from, index });
    }
  };

  const moveCard = (from: string, to: string, fromIndex?: number) => {
    const moveCards = (
      fromPile: Card[],
      toPile: Card[],
      cardIndex?: number,
    ) => {
      const cardsToMove =
        cardIndex !== undefined
          ? fromPile.slice(cardIndex)
          : [fromPile[fromPile.length - 1]];
      return {
        newFromPile:
          cardIndex !== undefined
            ? fromPile.slice(0, cardIndex)
            : fromPile.slice(0, -1),
        newToPile: [...toPile, ...cardsToMove],
      };
    };

    if (from === "waste") {
      if (to.startsWith("foundation")) {
        const foundationIndex = parseInt(to.split("-")[1]);
        const { newFromPile, newToPile } = moveCards(
          waste,
          foundation[foundationIndex],
        );
        setWaste(newFromPile);
        setFoundation((prev) =>
          prev.map((pile, i) => (i === foundationIndex ? newToPile : pile)),
        );
      } else if (to.startsWith("tableau")) {
        const tableauIndex = parseInt(to.split("-")[1]);
        const { newFromPile, newToPile } = moveCards(
          waste,
          tableau[tableauIndex],
        );
        setWaste(newFromPile);
        setTableau((prev) =>
          prev.map((pile, i) => (i === tableauIndex ? newToPile : pile)),
        );
      }
    } else if (from.startsWith("tableau")) {
      const fromTableauIndex = parseInt(from.split("-")[1]);
      if (to.startsWith("foundation")) {
        const foundationIndex = parseInt(to.split("-")[1]);
        const { newFromPile, newToPile } = moveCards(
          tableau[fromTableauIndex],
          foundation[foundationIndex],
        );
        setTableau((prev) =>
          prev.map((pile, i) => (i === fromTableauIndex ? newFromPile : pile)),
        );
        setFoundation((prev) =>
          prev.map((pile, i) => (i === foundationIndex ? newToPile : pile)),
        );
      } else if (to.startsWith("tableau")) {
        const toTableauIndex = parseInt(to.split("-")[1]);
        const { newFromPile, newToPile } = moveCards(
          tableau[fromTableauIndex],
          tableau[toTableauIndex],
          fromIndex,
        );
        setTableau((prev) =>
          prev.map((pile, i) => {
            if (i === fromTableauIndex) return newFromPile;
            if (i === toTableauIndex) return newToPile;
            return pile;
          }),
        );
      }

      // Flip top card if needed
      setTableau((prev) =>
        prev.map((pile, i) => {
          if (
            i === fromTableauIndex &&
            pile.length > 0 &&
            !pile[pile.length - 1].faceUp
          ) {
            const newPile = [...pile];
            newPile[newPile.length - 1].faceUp = true;
            return newPile;
          }
          return pile;
        }),
      );
    }

    setMoves((m) => m + 1);

    // Check for win
    if (foundation.every((pile) => pile.length === 13)) {
      onGameOver?.();
    }
  };

  const CardComponent = ({
    card,
    onClick,
    selected = false,
    stackOffset = 0,
  }: {
    card: Card;
    onClick: () => void;
    selected?: boolean;
    stackOffset?: number;
  }) => (
    <div
      className={`
        w-16 h-20 border-2 rounded-lg cursor-pointer transition-all duration-200
        ${card.faceUp ? "bg-white" : "bg-blue-900"}
        ${selected ? "border-yellow-400 transform -translate-y-2" : "border-gray-300"}
        ${card.faceUp ? "hover:shadow-lg hover:-translate-y-1" : ""}
      `}
      style={{ marginTop: stackOffset > 0 ? `${stackOffset * 20}px` : "0" }}
      onClick={onClick}
    >
      {card.faceUp ? (
        <div
          className={`p-1 h-full flex flex-col justify-between ${isRed(card.suit) ? "text-red-500" : "text-black"}`}
        >
          <div className="text-xs font-bold text-left">
            <div>{card.rank}</div>
            <div>{getSuitSymbol(card.suit)}</div>
          </div>
          <div className="text-lg text-center">{getSuitSymbol(card.suit)}</div>
          <div className="text-xs font-bold text-right transform rotate-180">
            <div>{card.rank}</div>
            <div>{getSuitSymbol(card.suit)}</div>
          </div>
        </div>
      ) : (
        <div className="w-full h-full bg-blue-900 rounded-lg flex items-center justify-center">
          <div className="text-white text-xs">🂠</div>
        </div>
      )}
    </div>
  );

  return (
    <div className="p-4 bg-green-800 min-h-[600px] rounded-lg">
      {/* Header */}
      <div className="flex justify-between items-center mb-4 text-white">
        <div>Score: {score}</div>
        <div>Moves: {moves}</div>
        <button
          onClick={initializeGame}
          className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
        >
          New Game
        </button>
      </div>

      {/* Top Row: Deck, Waste, and Foundations */}
      <div className="flex justify-between mb-6">
        <div className="flex gap-4">
          {/* Deck */}
          <div
            className="w-16 h-20 border-2 border-dashed border-white rounded-lg cursor-pointer flex items-center justify-center"
            onClick={drawFromDeck}
          >
            {deck.length > 0 ? (
              <CardComponent card={deck[0]} onClick={drawFromDeck} />
            ) : (
              <div className="text-white text-xs text-center">
                {waste.length > 0 ? "Reset" : "Empty"}
              </div>
            )}
          </div>

          {/* Waste */}
          <div className="w-16 h-20 border-2 border-dashed border-white rounded-lg flex items-center justify-center">
            {waste.length > 0 && (
              <CardComponent
                card={waste[0]}
                onClick={() => handleCardClick(waste[0], "waste")}
                selected={selectedCard?.from === "waste"}
              />
            )}
          </div>
        </div>

        {/* Foundations */}
        <div className="flex gap-2">
          {foundation.map((pile, index) => (
            <div
              key={index}
              className="w-16 h-20 border-2 border-dashed border-white rounded-lg flex items-center justify-center"
              onClick={() =>
                pile.length > 0 &&
                handleCardClick(pile[pile.length - 1], `foundation-${index}`)
              }
            >
              {pile.length > 0 ? (
                <CardComponent
                  card={pile[pile.length - 1]}
                  onClick={() =>
                    handleCardClick(
                      pile[pile.length - 1],
                      `foundation-${index}`,
                    )
                  }
                  selected={selectedCard?.from === `foundation-${index}`}
                />
              ) : (
                <div className="text-white text-xs">
                  {getSuitSymbol(SUITS[index])}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Tableau */}
      <div className="flex gap-2 justify-center">
        {tableau.map((pile, colIndex) => (
          <div
            key={colIndex}
            className="flex flex-col items-center min-h-[100px]"
          >
            <div className="w-16 h-20 border-2 border-dashed border-white rounded-lg mb-2 flex items-center justify-center">
              {pile.length === 0 && <div className="text-white text-xs">K</div>}
            </div>
            <div className="relative">
              {pile.map((card, cardIndex) => (
                <div
                  key={card.id}
                  className="absolute"
                  style={{ top: `${cardIndex * 20}px` }}
                >
                  <CardComponent
                    card={card}
                    onClick={() =>
                      handleCardClick(card, `tableau-${colIndex}`, cardIndex)
                    }
                    selected={
                      selectedCard?.from === `tableau-${colIndex}` &&
                      selectedCard?.index === cardIndex
                    }
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
