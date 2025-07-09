import { useState } from "react";
import {
  Search,
  Gamepad2,
  Trophy,
  Star,
  Play,
  X,
  Maximize2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import SolitaireKlondike from "@/components/games/SolitaireKlondike";
import CannonBalls3D from "@/components/games/CannonBalls3D";
import TowerCrash3D from "@/components/games/TowerCrash3D";
import MotoX3M from "@/components/games/MotoX3M";
import WesternSniper from "@/components/games/WesternSniper";
import BubbleShooter from "@/components/games/BubbleShooter";
import ElementBlocks from "@/components/games/ElementBlocks";
import GardenBloom from "@/components/games/GardenBloom";
import ColorFill3D from "@/components/games/ColorFill3D";
import FreeKick3D from "@/components/games/FreeKick3D";
import BilliardsClassic from "@/components/games/BilliardsClassic";
import TableTennis from "@/components/games/TableTennis";
import OnetConnect from "@/components/games/OnetConnect";
import Totemia from "@/components/games/Totemia";

interface Game {
  id: string;
  name: string;
  description: string;
  category: string;
  rating: number;
  plays: string;
  image: string;
  gameComponent?: React.ComponentType<any>;
  featured?: boolean;
}

const games: Game[] = [
  // Working Games
  {
    id: "cannon-balls-3d",
    name: "Cannon Balls 3D",
    description: "Aim and fire cannonballs to destroy targets!",
    category: "Action & Adventure",
    rating: 4.8,
    plays: "2.1M",
    image: "/api/placeholder/300/200",
    gameComponent: CannonBalls3D,
    featured: true,
  },
  // Action and Adventure Games
  {
    id: "tower-crash-3d",
    name: "Tower Crash 3D",
    description: "Build towers with blocks and watch them spectacularly crash!",
    category: "Action & Adventure",
    rating: 4.3,
    plays: "1.8M",
    image: "/api/placeholder/300/200",
    gameComponent: TowerCrash3D,
  },
  {
    id: "moto-x3m-pool-party",
    name: "Moto X3M Pool Party",
    description:
      "Race your motorcycle through pools and obstacles with stunts!",
    category: "Action & Adventure",
    rating: 4.7,
    plays: "3.2M",
    image: "/api/placeholder/300/200",
    gameComponent: MotoX3M,
    featured: true,
  },
  {
    id: "western-sniper",
    name: "Western Sniper",
    description:
      "A shooting game where you take down enemies in a western setting.",
    category: "Action & Adventure",
    rating: 4.2,
    plays: "1.5M",
    image: "/api/placeholder/300/200",
    gameComponent: WesternSniper,
  },
  // Puzzle Games
  {
    id: "bubble-shooter",
    name: "Bubble Shooter",
    description:
      "Classic bubble-shooting game where you match colors to clear levels.",
    category: "Puzzle",
    rating: 4.6,
    plays: "4.1M",
    image: "/api/placeholder/300/200",
    gameComponent: BubbleShooter,
    featured: true,
  },
  {
    id: "element-blocks",
    name: "Element Blocks",
    description:
      "A block-puzzle game where you match elements to clear the board.",
    category: "Puzzle",
    rating: 4.4,
    plays: "2.3M",
    image: "/api/placeholder/300/200",
    gameComponent: ElementBlocks,
  },
  {
    id: "garden-bloom",
    name: "Garden Bloom",
    description: "A garden-themed match-3 game where you help flowers bloom.",
    category: "Puzzle",
    rating: 4.5,
    plays: "1.9M",
    image: "/api/placeholder/300/200",
    gameComponent: GardenBloom,
  },
  {
    id: "color-fill-3d",
    name: "Color Fill 3D",
    description:
      "A 3D color-filling game where you fill shapes with matching colors.",
    category: "Puzzle",
    rating: 4.1,
    plays: "1.2M",
    image: "/api/placeholder/300/200",
    gameComponent: ColorFill3D,
  },
  // Sports and Racing Games
  {
    id: "3d-free-kick",
    name: "3D Free Kick",
    description:
      "A soccer game where you take free kicks and try to score goals.",
    category: "Sports & Racing",
    rating: 4.3,
    plays: "2.7M",
    image: "/api/placeholder/300/200",
    gameComponent: FreeKick3D,
  },
  {
    id: "8-ball-billiards",
    name: "8 Ball Billiards Classic",
    description:
      "A classic billiards game where you pot balls and win matches.",
    category: "Sports & Racing",
    rating: 4.6,
    plays: "3.5M",
    image: "/api/placeholder/300/200",
    gameComponent: BilliardsClassic,
    featured: true,
  },
  {
    id: "table-tennis-world-tour",
    name: "Table Tennis World Tour",
    description: "A table tennis game where you compete against opponents.",
    category: "Sports & Racing",
    rating: 4.2,
    plays: "1.6M",
    image: "/api/placeholder/300/200",
    gameComponent: TableTennis,
  },
  // Other Games
  {
    id: "solitaire-klondike",
    name: "Solitaire Klondike",
    description:
      "A classic solitaire card game where you arrange cards in sequence.",
    category: "Other",
    rating: 4.5,
    plays: "5.2M",
    image: "/api/placeholder/300/200",
    gameComponent: SolitaireKlondike,
  },
  {
    id: "onet-connect-classic",
    name: "Onet Connect Classic",
    description: "A tile-matching game where you connect identical tiles.",
    category: "Other",
    rating: 4.3,
    plays: "2.8M",
    image: "/api/placeholder/300/200",
    gameComponent: OnetConnect,
  },
  {
    id: "totemia-cursed-marbles",
    name: "Totemia: Cursed Marbles",
    description: "A match-3 game with a fantasy theme.",
    category: "Other",
    rating: 4.4,
    plays: "2.1M",
    image: "/api/placeholder/300/200",
    gameComponent: Totemia,
  },
];

const categories = [
  "All",
  "Action & Adventure",
  "Puzzle",
  "Sports & Racing",
  "Other",
];

export default function Index() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [isGameModalOpen, setIsGameModalOpen] = useState(false);

  const handlePlayGame = (game: Game) => {
    setSelectedGame(game);
    setIsGameModalOpen(true);
  };

  const closeGameModal = () => {
    setIsGameModalOpen(false);
    setSelectedGame(null);
  };

  const filteredGames = games.filter((game) => {
    const matchesCategory =
      selectedCategory === "All" || game.category === selectedCategory;
    const matchesSearch =
      game.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      game.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const featuredGames = games.filter((game) => game.featured);

  const GameCard = ({ game }: { game: Game }) => (
    <div className="group relative bg-card rounded-lg overflow-hidden border border-border hover:border-primary/50 transition-all duration-300 hover:scale-105 hover:shadow-xl">
      <div className="aspect-video relative overflow-hidden">
        <div className="w-full h-full bg-gradient-to-br from-gaming-purple/20 to-gaming-green/20 flex items-center justify-center">
          <Gamepad2 className="w-12 h-12 text-muted-foreground" />
        </div>
        <div className="absolute top-2 right-2">
          <Badge variant="secondary" className="bg-black/50 text-white">
            {game.plays} plays
          </Badge>
        </div>
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
          <Button
            size="lg"
            className="bg-primary hover:bg-primary/90"
            onClick={() => handlePlayGame(game)}
          >
            <Play className="w-5 h-5 mr-2" />
            Play Now
          </Button>
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
            {game.name}
          </h3>
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-gaming-orange text-gaming-orange" />
            <span className="text-sm font-medium">{game.rating}</span>
          </div>
        </div>
        <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
          {game.description}
        </p>
        <Badge variant="outline" className="border-primary/30 text-primary">
          {game.category}
        </Badge>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gaming-purple to-gaming-green flex items-center justify-center">
                <Gamepad2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">GameHub</h1>
                <p className="text-xs text-muted-foreground">
                  Play HTML5 Games
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search games..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <section className="mb-12">
          <div className="relative rounded-2xl bg-gradient-to-r from-gaming-purple via-gaming-blue to-gaming-green p-8 md:p-12 overflow-hidden">
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="relative z-10 max-w-2xl">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Play Amazing HTML5 Games
              </h2>
              <p className="text-xl text-white/90 mb-6">
                Discover thousands of free games across action, puzzle, sports,
                and more. No downloads required!
              </p>
              <div className="flex flex-wrap gap-3">
                <Button
                  size="lg"
                  className="bg-white text-gaming-purple hover:bg-white/90"
                >
                  <Trophy className="w-5 h-5 mr-2" />
                  Browse Games
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-gaming-purple"
                >
                  Featured Games
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Games */}
        {featuredGames.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
              <Star className="w-6 h-6 text-gaming-orange" />
              Featured Games
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredGames.map((game) => (
                <GameCard key={game.id} game={game} />
              ))}
            </div>
          </section>
        )}

        {/* Category Filter */}
        <section className="mb-8">
          <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                onClick={() => setSelectedCategory(category)}
                className={
                  selectedCategory === category
                    ? "bg-primary hover:bg-primary/90"
                    : ""
                }
              >
                {category}
              </Button>
            ))}
          </div>
        </section>

        {/* Games Grid */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground">
              {selectedCategory === "All" ? "All Games" : selectedCategory}
            </h2>
            <p className="text-muted-foreground">
              {filteredGames.length} game{filteredGames.length !== 1 ? "s" : ""}{" "}
              found
            </p>
          </div>

          {filteredGames.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredGames.map((game) => (
                <GameCard key={game.id} game={game} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Gamepad2 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                No games found
              </h3>
              <p className="text-muted-foreground">
                Try adjusting your search or category filter
              </p>
            </div>
          )}
        </section>
      </main>

      {/* Game Player Modal */}
      <Dialog open={isGameModalOpen} onOpenChange={setIsGameModalOpen}>
        <DialogContent className="max-w-6xl w-full h-[90vh] p-0">
          <DialogHeader className="p-6 pb-4 border-b border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Gamepad2 className="w-6 h-6 text-primary" />
                  <DialogTitle className="text-xl font-bold">
                    {selectedGame?.name}
                  </DialogTitle>
                </div>
                <Badge
                  variant="outline"
                  className="border-primary/30 text-primary"
                >
                  {selectedGame?.category}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Maximize2 className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={closeGameModal}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </DialogHeader>
          <div className="flex-1 p-6 flex items-center justify-center min-h-[500px]">
            {selectedGame?.gameComponent ? (
              <div className="w-full h-full flex items-center justify-center">
                <selectedGame.gameComponent
                  width={600}
                  height={400}
                  onScore={(score: number) => console.log("Score:", score)}
                  onGameOver={() => console.log("Game Over")}
                />
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-muted rounded-lg">
                <div className="text-center">
                  <Gamepad2 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    Game Coming Soon
                  </h3>
                  <p className="text-muted-foreground">
                    This game will be available shortly. Check back soon!
                  </p>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/30 mt-20">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center gap-3 mb-4 md:mb-0">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gaming-purple to-gaming-green flex items-center justify-center">
                <Gamepad2 className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold text-foreground">GameHub</span>
            </div>
            <p className="text-muted-foreground text-center md:text-right">
              © 2024 GameHub. All rights reserved. Play free HTML5 games
              online.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
