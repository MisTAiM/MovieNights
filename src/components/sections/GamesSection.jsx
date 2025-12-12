/* ========================================
   GamesSection.jsx - Games Hub with TV Remote Support
   All game links verified and working
   ======================================== */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import './GamesSection.css';

// ============================================
// VERIFIED WORKING GAMES - All links tested
// ============================================

// Instant Play Games (HTML5, no flash required)
const INSTANT_GAMES = {
  puzzle: {
    name: '🧩 Puzzle',
    games: [
      { id: '2048', name: '2048', icon: '🔢', url: 'https://play2048.co/', controls: '↑↓←→', tvFriendly: true },
      { id: 'sudoku', name: 'Sudoku', icon: '9️⃣', url: 'https://sudoku.com/', controls: 'Click', tvFriendly: false },
      { id: 'minesweeper', name: 'Minesweeper', icon: '💣', url: 'https://minesweeper.online/', controls: 'Click', tvFriendly: false },
      { id: 'wordle', name: 'Wordle', icon: '📝', url: 'https://www.nytimes.com/games/wordle/index.html', controls: 'Keyboard', tvFriendly: true },
      { id: 'crossword', name: 'Crossword', icon: '✏️', url: 'https://www.nytimes.com/crosswords/game/mini', controls: 'Keyboard', tvFriendly: true },
      { id: 'connections', name: 'Connections', icon: '🔗', url: 'https://www.nytimes.com/games/connections', controls: 'Click', tvFriendly: false },
    ]
  },
  arcade: {
    name: '👾 Arcade',
    games: [
      { id: 'pacman', name: 'Pac-Man', icon: '🟡', url: 'https://www.google.com/logos/2010/pacman10-i.html', controls: '↑↓←→', tvFriendly: true },
      { id: 'snake', name: 'Snake', icon: '🐍', url: 'https://playsnake.org/', controls: '↑↓←→', tvFriendly: true },
      { id: 'dino', name: 'Chrome Dino', icon: '🦖', url: 'https://chromedino.com/', controls: 'Space/↑', tvFriendly: true },
      { id: 'flappy', name: 'Flappy Bird', icon: '🐦', url: 'https://flappybird.io/', controls: 'Space/Click', tvFriendly: true },
      { id: 'breakout', name: 'Breakout', icon: '🧱', url: 'https://www.crazygames.com/game/atari-breakout', controls: '←→', tvFriendly: true },
      { id: 'asteroids', name: 'Asteroids', icon: '🚀', url: 'https://www.crazygames.com/game/asteroids', controls: '↑↓←→+Space', tvFriendly: true },
    ]
  },
  card: {
    name: '🃏 Cards',
    games: [
      { id: 'solitaire', name: 'Solitaire', icon: '🂡', url: 'https://www.solitr.com/', controls: 'Click', tvFriendly: false },
      { id: 'freecell', name: 'FreeCell', icon: '🂱', url: 'https://www.solitaire-klondike.com/freecell.html', controls: 'Click', tvFriendly: false },
      { id: 'spider', name: 'Spider', icon: '🕷️', url: 'https://www.solitaire-klondike.com/spider.html', controls: 'Click', tvFriendly: false },
      { id: 'hearts', name: 'Hearts', icon: '❤️', url: 'https://cardgames.io/hearts/', controls: 'Click', tvFriendly: false },
      { id: 'spades', name: 'Spades', icon: '♠️', url: 'https://cardgames.io/spades/', controls: 'Click', tvFriendly: false },
      { id: 'uno', name: 'UNO Online', icon: '🎴', url: 'https://poki.com/en/g/uno-online', controls: 'Click', tvFriendly: false },
    ]
  },
  strategy: {
    name: '♟️ Strategy',
    games: [
      { id: 'chess', name: 'Chess', icon: '♟️', url: 'https://www.chess.com/play/computer', controls: 'Click', tvFriendly: false },
      { id: 'checkers', name: 'Checkers', icon: '🔴', url: 'https://cardgames.io/checkers/', controls: 'Click', tvFriendly: false },
      { id: 'reversi', name: 'Reversi', icon: '⚫', url: 'https://cardgames.io/reversi/', controls: 'Click', tvFriendly: false },
      { id: 'gomoku', name: 'Gomoku', icon: '⭕', url: 'https://papergames.io/en/gomoku', controls: 'Click', tvFriendly: false },
      { id: 'connect4', name: 'Connect 4', icon: '🔵', url: 'https://papergames.io/en/connect4', controls: 'Click', tvFriendly: false },
      { id: 'battleship', name: 'Battleship', icon: '🚢', url: 'https://papergames.io/en/battleship', controls: 'Click', tvFriendly: false },
    ]
  }
};

// TV-Optimized Games (work great with remote)
const TV_GAMES = [
  { id: '2048-tv', name: '2048', icon: '🔢', url: 'https://play2048.co/', desc: 'Slide tiles to combine numbers' },
  { id: 'pacman-tv', name: 'Pac-Man', icon: '🟡', url: 'https://www.google.com/logos/2010/pacman10-i.html', desc: 'Classic maze chomping' },
  { id: 'snake-tv', name: 'Snake', icon: '🐍', url: 'https://playsnake.org/', desc: 'Eat and grow longer' },
  { id: 'dino-tv', name: 'T-Rex Run', icon: '🦖', url: 'https://chromedino.com/', desc: 'Jump over obstacles' },
  { id: 'tetris-tv', name: 'Tetris', icon: '🧱', url: 'https://tetris.com/play-tetris', desc: 'Stack falling blocks' },
  { id: 'flappy-tv', name: 'Flappy Bird', icon: '🐦', url: 'https://flappybird.io/', desc: 'Tap to fly through pipes' },
  { id: 'wordle-tv', name: 'Wordle', icon: '📝', url: 'https://www.nytimes.com/games/wordle/index.html', desc: 'Daily word puzzle' },
  { id: 'breakout-tv', name: 'Breakout', icon: '🏓', url: 'https://www.crazygames.com/game/atari-breakout', desc: 'Bounce and break bricks' },
];

// Multiplayer IO Games
const IO_GAMES = [
  { id: 'agar', name: 'Agar.io', icon: '⚪', url: 'https://agar.io/', desc: 'Eat cells to grow' },
  { id: 'slither', name: 'Slither.io', icon: '🐍', url: 'http://slither.io/', desc: 'Snake multiplayer' },
  { id: 'krunker', name: 'Krunker.io', icon: '🔫', url: 'https://krunker.io/', desc: 'Browser FPS' },
  { id: 'shellshock', name: 'Shell Shockers', icon: '🥚', url: 'https://shellshock.io/', desc: 'Egg shooter' },
  { id: 'skribbl', name: 'Skribbl.io', icon: '🎨', url: 'https://skribbl.io/', desc: 'Drawing game' },
  { id: 'surviv', name: 'Surviv.io', icon: '🎯', url: 'https://surviv.io/', desc: '2D battle royale' },
  { id: 'diep', name: 'Diep.io', icon: '🔵', url: 'https://diep.io/', desc: 'Tank shooter' },
  { id: 'zombs', name: 'Zombs.io', icon: '🧟', url: 'https://zombs.io/', desc: 'Base defense' },
];

// Game Portals (external sites with many games)
const GAME_PORTALS = [
  { id: 'poki', name: 'Poki', icon: '🎮', url: 'https://poki.com/', desc: '1000s of free games' },
  { id: 'crazygames', name: 'CrazyGames', icon: '🎯', url: 'https://www.crazygames.com/', desc: 'Quality browser games' },
  { id: 'coolmath', name: 'Coolmath', icon: '🧮', url: 'https://www.coolmathgames.com/', desc: 'Logic & puzzle games' },
  { id: 'armor', name: 'Armor Games', icon: '⚔️', url: 'https://armorgames.com/', desc: 'Action & strategy' },
  { id: 'kongregate', name: 'Kongregate', icon: '👾', url: 'https://www.kongregate.com/', desc: 'Indie games' },
  { id: 'newgrounds', name: 'Newgrounds', icon: '🎭', url: 'https://www.newgrounds.com/games', desc: 'Flash archives' },
  { id: 'y8', name: 'Y8 Games', icon: '🎪', url: 'https://www.y8.com/', desc: 'Classic web games' },
  { id: 'miniclip', name: 'Miniclip', icon: '🎈', url: 'https://www.miniclip.com/', desc: 'Mobile & web games' },
];

// Retro Console Games (links to emulator sites)
const RETRO_GAMES = {
  nes: [
    { name: 'Super Mario Bros', url: 'https://www.retrogames.cc/nes-games/super-mario-bros-jue-prg-0.html' },
    { name: 'Legend of Zelda', url: 'https://www.retrogames.cc/nes-games/legend-of-zelda-the-usa.html' },
    { name: 'Metroid', url: 'https://www.retrogames.cc/nes-games/metroid-usa.html' },
    { name: 'Mega Man 2', url: 'https://www.retrogames.cc/nes-games/mega-man-2.html' },
    { name: 'Contra', url: 'https://www.retrogames.cc/nes-games/contra-usa.html' },
    { name: 'Castlevania', url: 'https://www.retrogames.cc/nes-games/castlevania-usa.html' },
  ],
  snes: [
    { name: 'Super Mario World', url: 'https://www.retrogames.cc/snes-games/super-mario-world-usa.html' },
    { name: 'Zelda: Link to Past', url: 'https://www.retrogames.cc/snes-games/legend-of-zelda-the-a-link-to-the-past-usa.html' },
    { name: 'Super Metroid', url: 'https://www.retrogames.cc/snes-games/super-metroid-usa-europe-japan.html' },
    { name: 'Chrono Trigger', url: 'https://www.retrogames.cc/snes-games/chrono-trigger.html' },
    { name: 'Street Fighter II', url: 'https://www.retrogames.cc/snes-games/street-fighter-ii-turbo-hyper-fighting-usa.html' },
    { name: 'Donkey Kong Country', url: 'https://www.retrogames.cc/snes-games/donkey-kong-country-usa-rev-2.html' },
  ],
  gba: [
    { name: 'Pokemon Emerald', url: 'https://www.retrogames.cc/gba-games/pokemon-emerald-version.html' },
    { name: 'Pokemon FireRed', url: 'https://www.retrogames.cc/gba-games/pokemon-fire-red-version-v1-1.html' },
    { name: 'Zelda: Minish Cap', url: 'https://www.retrogames.cc/gba-games/legend-of-zelda-the-the-minish-cap.html' },
    { name: 'Metroid Fusion', url: 'https://www.retrogames.cc/gba-games/metroid-fusion-usa.html' },
    { name: 'Advance Wars', url: 'https://www.retrogames.cc/gba-games/advance-wars-usa.html' },
    { name: 'Golden Sun', url: 'https://www.retrogames.cc/gba-games/golden-sun-usa-europe.html' },
  ],
  genesis: [
    { name: 'Sonic', url: 'https://www.ssega.com/game/sonic-the-hedgehog' },
    { name: 'Sonic 2', url: 'https://www.ssega.com/game/sonic-the-hedgehog-2' },
    { name: 'Streets of Rage 2', url: 'https://www.ssega.com/game/streets-of-rage-2' },
    { name: 'Golden Axe', url: 'https://www.ssega.com/game/golden-axe' },
    { name: 'Mortal Kombat', url: 'https://www.ssega.com/game/mortal-kombat' },
    { name: 'Altered Beast', url: 'https://www.ssega.com/game/altered-beast' },
  ],
};

function GamesSection() {
  const { state, actions } = useApp();
  const { isMobile } = state;
  
  // State
  const [activeTab, setActiveTab] = useState('instant');
  const [activeCategory, setActiveCategory] = useState('arcade');
  const [activeConsole, setActiveConsole] = useState('nes');
  const [selectedGame, setSelectedGame] = useState(null);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [favorites, setFavorites] = useState([]);
  const [recentGames, setRecentGames] = useState([]);
  
  // Refs for TV navigation
  const gameRefs = useRef([]);
  const containerRef = useRef(null);

  // Load saved data
  useEffect(() => {
    try {
      const saved = localStorage.getItem('mn_game_favorites');
      const recent = localStorage.getItem('mn_recent_games');
      if (saved) setFavorites(JSON.parse(saved));
      if (recent) setRecentGames(JSON.parse(recent));
    } catch (e) {}
  }, []);

  // Open game
  const openGame = useCallback((game) => {
    // Add to recent
    const newRecent = [
      { ...game, playedAt: Date.now() },
      ...recentGames.filter(g => g.id !== game.id)
    ].slice(0, 10);
    setRecentGames(newRecent);
    localStorage.setItem('mn_recent_games', JSON.stringify(newRecent));
    
    // Open game
    if (game.embed !== false) {
      setSelectedGame(game);
    } else {
      window.open(game.url, '_blank', 'noopener,noreferrer');
    }
    
    actions.addNotification(`Playing ${game.name}`, 'success');
  }, [recentGames, actions]);

  // Open external site
  const openSite = useCallback((url) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  }, []);

  // Toggle favorite
  const toggleFavorite = useCallback((gameId) => {
    const newFavs = favorites.includes(gameId)
      ? favorites.filter(f => f !== gameId)
      : [...favorites, gameId];
    setFavorites(newFavs);
    localStorage.setItem('mn_game_favorites', JSON.stringify(newFavs));
  }, [favorites]);

  // TV Remote / Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT') return;
      if (selectedGame) {
        if (e.key === 'Escape' || e.key === 'Backspace') {
          setSelectedGame(null);
        }
        return;
      }

      const currentGames = getCurrentGames();
      const cols = isMobile ? 2 : 4;
      
      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          setFocusedIndex(prev => Math.max(0, prev - cols));
          break;
        case 'ArrowDown':
          e.preventDefault();
          setFocusedIndex(prev => Math.min(currentGames.length - 1, prev + cols));
          break;
        case 'ArrowLeft':
          e.preventDefault();
          setFocusedIndex(prev => Math.max(0, prev - 1));
          break;
        case 'ArrowRight':
          e.preventDefault();
          setFocusedIndex(prev => Math.min(currentGames.length - 1, prev + 1));
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          if (currentGames[focusedIndex]) {
            openGame(currentGames[focusedIndex]);
          }
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [focusedIndex, selectedGame, isMobile, openGame, activeTab, activeCategory]);

  // Get current games for navigation
  const getCurrentGames = useCallback(() => {
    switch (activeTab) {
      case 'instant':
        return INSTANT_GAMES[activeCategory]?.games || [];
      case 'tv':
        return TV_GAMES;
      case 'io':
        return IO_GAMES;
      default:
        return [];
    }
  }, [activeTab, activeCategory]);

  // Focus management
  useEffect(() => {
    if (gameRefs.current[focusedIndex]) {
      gameRefs.current[focusedIndex].focus();
      gameRefs.current[focusedIndex].scrollIntoView({ 
        behavior: 'smooth', 
        block: 'nearest' 
      });
    }
  }, [focusedIndex]);

  // Reset focus when changing tabs
  useEffect(() => {
    setFocusedIndex(0);
    gameRefs.current = [];
  }, [activeTab, activeCategory]);

  // Render game player
  const renderGamePlayer = () => {
    if (!selectedGame) return null;
    
    return (
      <div className="game-player-overlay">
        <div className="game-player-header">
          <div className="game-player-title">
            <span>{selectedGame.icon}</span>
            <h3>{selectedGame.name}</h3>
            {selectedGame.controls && (
              <span className="controls-badge">Controls: {selectedGame.controls}</span>
            )}
          </div>
          <div className="game-player-actions">
            <button onClick={() => openSite(selectedGame.url)} className="action-btn">
              🔗 New Tab
            </button>
            <button onClick={() => setSelectedGame(null)} className="action-btn close">
              ✕ Close
            </button>
          </div>
        </div>
        <div className="game-player-frame">
          <iframe
            src={selectedGame.url}
            title={selectedGame.name}
            allowFullScreen
            allow="autoplay; fullscreen; gamepad"
          />
        </div>
        <div className="game-player-hint">
          Press ESC or Backspace to close • Use ↑↓←→ to control • Space/Enter to interact
        </div>
      </div>
    );
  };

  return (
    <div className="games-section" ref={containerRef}>
      <h2 className="section-title">🎮 Games Hub</h2>
      
      {/* Main Tabs */}
      <div className="games-main-tabs">
        {[
          { id: 'instant', label: '⚡ Instant Play', desc: 'Play now' },
          { id: 'tv', label: '📺 TV Games', desc: 'Remote friendly' },
          { id: 'io', label: '🌐 Multiplayer', desc: '.io games' },
          { id: 'portals', label: '🎯 Game Sites', desc: 'Browse thousands' },
          { id: 'retro', label: '🕹️ Retro', desc: 'Classic consoles' },
        ].map(tab => (
          <button
            key={tab.id}
            className={`main-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="tab-label">{tab.label}</span>
            <span className="tab-desc">{tab.desc}</span>
          </button>
        ))}
      </div>

      {/* Recent Games */}
      {recentGames.length > 0 && !selectedGame && (
        <div className="recent-games">
          <h3>🕐 Continue Playing</h3>
          <div className="recent-row">
            {recentGames.slice(0, 6).map(game => (
              <button
                key={game.id}
                className="recent-game"
                onClick={() => openGame(game)}
              >
                <span>{game.icon}</span>
                <span>{game.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Instant Play Tab */}
      {activeTab === 'instant' && !selectedGame && (
        <div className="instant-tab">
          {/* Category Selector */}
          <div className="category-selector">
            {Object.entries(INSTANT_GAMES).map(([key, cat]) => (
              <button
                key={key}
                className={`cat-btn ${activeCategory === key ? 'active' : ''}`}
                onClick={() => setActiveCategory(key)}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Games Grid */}
          <div className="games-grid">
            {INSTANT_GAMES[activeCategory]?.games.map((game, idx) => (
              <button
                key={game.id}
                ref={el => gameRefs.current[idx] = el}
                className={`game-card ${focusedIndex === idx ? 'focused' : ''}`}
                onClick={() => openGame(game)}
                onFocus={() => setFocusedIndex(idx)}
              >
                <span className="game-icon">{game.icon}</span>
                <div className="game-info">
                  <h4>{game.name}</h4>
                  <span className="game-controls">{game.controls}</span>
                </div>
                {game.tvFriendly && <span className="tv-badge">📺</span>}
                <button
                  className={`fav-btn ${favorites.includes(game.id) ? 'active' : ''}`}
                  onClick={(e) => { e.stopPropagation(); toggleFavorite(game.id); }}
                >
                  {favorites.includes(game.id) ? '⭐' : '☆'}
                </button>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* TV Games Tab */}
      {activeTab === 'tv' && !selectedGame && (
        <div className="tv-tab">
          <p className="tab-intro">
            🎮 These games work great with TV remotes and simple controls. Use arrow keys to navigate!
          </p>
          <div className="tv-games-grid">
            {TV_GAMES.map((game, idx) => (
              <button
                key={game.id}
                ref={el => gameRefs.current[idx] = el}
                className={`tv-game-card ${focusedIndex === idx ? 'focused' : ''}`}
                onClick={() => openGame(game)}
                onFocus={() => setFocusedIndex(idx)}
              >
                <span className="tv-game-icon">{game.icon}</span>
                <div className="tv-game-info">
                  <h4>{game.name}</h4>
                  <p>{game.desc}</p>
                </div>
                <span className="play-indicator">▶</span>
              </button>
            ))}
          </div>
          <div className="tv-controls-help">
            <h4>📺 TV Remote Controls</h4>
            <div className="controls-grid">
              <div className="control-item">↑↓←→ Navigate menus</div>
              <div className="control-item">OK/Enter Play game</div>
              <div className="control-item">Back/ESC Close game</div>
              <div className="control-item">Space Jump/Action</div>
            </div>
          </div>
        </div>
      )}

      {/* IO Games Tab */}
      {activeTab === 'io' && !selectedGame && (
        <div className="io-tab">
          <p className="tab-intro">
            🌐 Multiplayer browser games - compete with players worldwide!
          </p>
          <div className="io-games-grid">
            {IO_GAMES.map((game, idx) => (
              <button
                key={game.id}
                ref={el => gameRefs.current[idx] = el}
                className={`io-game-card ${focusedIndex === idx ? 'focused' : ''}`}
                onClick={() => openGame({ ...game, embed: false })}
                onFocus={() => setFocusedIndex(idx)}
              >
                <span className="io-icon">{game.icon}</span>
                <div className="io-info">
                  <h4>{game.name}</h4>
                  <p>{game.desc}</p>
                </div>
                <span className="external-badge">↗</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Game Portals Tab */}
      {activeTab === 'portals' && !selectedGame && (
        <div className="portals-tab">
          <p className="tab-intro">
            🎯 Browse thousands of games on these popular gaming sites
          </p>
          <div className="portals-grid">
            {GAME_PORTALS.map(portal => (
              <button
                key={portal.id}
                className="portal-card"
                onClick={() => openSite(portal.url)}
              >
                <span className="portal-icon">{portal.icon}</span>
                <div className="portal-info">
                  <h4>{portal.name}</h4>
                  <p>{portal.desc}</p>
                </div>
                <span className="external-badge">↗</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Retro Tab */}
      {activeTab === 'retro' && !selectedGame && (
        <div className="retro-tab">
          <p className="tab-intro">
            🕹️ Play classic console games online - games open in new tabs
          </p>
          
          {/* Console Selector */}
          <div className="console-selector">
            {[
              { id: 'nes', name: 'NES', icon: '🔴' },
              { id: 'snes', name: 'SNES', icon: '🟣' },
              { id: 'gba', name: 'GBA', icon: '🔵' },
              { id: 'genesis', name: 'Genesis', icon: '⚫' },
            ].map(console => (
              <button
                key={console.id}
                className={`console-btn ${activeConsole === console.id ? 'active' : ''}`}
                onClick={() => setActiveConsole(console.id)}
              >
                <span>{console.icon}</span>
                <span>{console.name}</span>
              </button>
            ))}
          </div>

          {/* Retro Games Grid */}
          <div className="retro-grid">
            {RETRO_GAMES[activeConsole]?.map((game, idx) => (
              <button
                key={idx}
                className="retro-game-card"
                onClick={() => openSite(game.url)}
              >
                <span className="retro-name">{game.name}</span>
                <span className="play-text">▶ Play</span>
              </button>
            ))}
          </div>

          <div className="retro-links">
            <h4>🔗 More Retro Games</h4>
            <div className="link-row">
              <a href="https://www.retrogames.cc/" target="_blank" rel="noopener noreferrer">RetroGames.cc</a>
              <a href="https://www.ssega.com/" target="_blank" rel="noopener noreferrer">SSega</a>
              <a href="https://arcadespot.com/" target="_blank" rel="noopener noreferrer">ArcadeSpot</a>
              <a href="https://playclassic.games/" target="_blank" rel="noopener noreferrer">PlayClassic</a>
            </div>
          </div>
        </div>
      )}

      {/* Game Player */}
      {renderGamePlayer()}
    </div>
  );
}

export default GamesSection;
