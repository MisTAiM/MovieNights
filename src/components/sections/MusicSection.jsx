/* ========================================
   MusicSection.jsx - Music Hub with Full Song Playback
   Uses YouTube for full songs, radio streams, and playlists
   ======================================== */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import './MusicSection.css';

// ============================================
// CURATED PLAYLISTS (YouTube playlist/video IDs)
// ============================================

const MOOD_PLAYLISTS = [
  { id: 'lofi', name: 'Lo-Fi Chill', icon: '🎧', videoId: 'jfKfPfyJRdk', desc: 'Beats to relax/study' },
  { id: 'focus', name: 'Deep Focus', icon: '🧠', videoId: '7NOSDKb0HlU', desc: 'Concentration music' },
  { id: 'sleep', name: 'Sleep', icon: '😴', videoId: 'lCOF9LN_Zxs', desc: 'Calm ambient sounds' },
  { id: 'workout', name: 'Workout', icon: '💪', videoId: 'gGk7pLmBfQo', desc: 'High energy hits' },
  { id: 'party', name: 'Party', icon: '🎉', videoId: 'vWa3v4aaRNY', desc: 'Dance & EDM' },
  { id: 'jazz', name: 'Jazz', icon: '🎷', videoId: 'Dx5qFachd3A', desc: 'Smooth jazz vibes' },
  { id: 'classical', name: 'Classical', icon: '🎻', videoId: 'mIYzp5rcTvU', desc: 'Orchestral masterpieces' },
  { id: 'acoustic', name: 'Acoustic', icon: '🎸', videoId: 'AsPD5Jus74Q', desc: 'Unplugged sessions' },
];

// Live Radio Streams (24/7 YouTube streams)
const RADIO_STREAMS = [
  { id: 'lofi-girl', name: 'Lofi Girl', icon: '👧', videoId: 'jfKfPfyJRdk', desc: 'Beats to study/relax' },
  { id: 'chillhop', name: 'Chillhop', icon: '🎵', videoId: '5yx6BWlEVcY', desc: 'Chilled hip hop' },
  { id: 'jazz-cafe', name: 'Jazz Cafe', icon: '☕', videoId: 'Dx5qFachd3A', desc: 'Cozy jazz radio' },
  { id: 'synthwave', name: 'Synthwave', icon: '🌆', videoId: '4xDzrJKXOOY', desc: '80s retro vibes' },
  { id: 'classical', name: 'Classical FM', icon: '🎼', videoId: 'HFgCGMRLJgI', desc: 'Beautiful classics' },
  { id: 'ambient', name: 'Ambient', icon: '🌙', videoId: 'S_MOd40zlYU', desc: 'Atmospheric sounds' },
];

// Music Platforms (external links)
const MUSIC_PLATFORMS = [
  { id: 'spotify', name: 'Spotify', icon: '💚', url: 'https://open.spotify.com/', desc: 'Streaming service' },
  { id: 'apple', name: 'Apple Music', icon: '🍎', url: 'https://music.apple.com/', desc: 'Apple streaming' },
  { id: 'youtube-music', name: 'YouTube Music', icon: '🔴', url: 'https://music.youtube.com/', desc: 'Music videos' },
  { id: 'soundcloud', name: 'SoundCloud', icon: '🔶', url: 'https://soundcloud.com/', desc: 'Independent artists' },
  { id: 'bandcamp', name: 'Bandcamp', icon: '💙', url: 'https://bandcamp.com/', desc: 'Support artists' },
  { id: 'tidal', name: 'Tidal', icon: '🌊', url: 'https://tidal.com/', desc: 'Hi-fi streaming' },
];

// Genre Categories for YouTube search
const GENRES = [
  { id: 'pop', name: 'Pop', icon: '🎤' },
  { id: 'hiphop', name: 'Hip Hop', icon: '🎤' },
  { id: 'rock', name: 'Rock', icon: '🎸' },
  { id: 'electronic', name: 'Electronic', icon: '🎹' },
  { id: 'rnb', name: 'R&B', icon: '💜' },
  { id: 'country', name: 'Country', icon: '🤠' },
  { id: 'latin', name: 'Latin', icon: '💃' },
  { id: 'kpop', name: 'K-Pop', icon: '🇰🇷' },
  { id: 'jpop', name: 'J-Pop', icon: '🇯🇵' },
  { id: 'metal', name: 'Metal', icon: '🤘' },
  { id: 'indie', name: 'Indie', icon: '🎵' },
  { id: 'jazz', name: 'Jazz', icon: '🎷' },
];

function MusicSection() {
  const { actions } = useApp();
  
  // State
  const [activeTab, setActiveTab] = useState('discover');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [currentVideo, setCurrentVideo] = useState(null);
  const [isPlayerMinimized, setIsPlayerMinimized] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [recentPlays, setRecentPlays] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState(null);
  
  const searchInputRef = useRef(null);
  const playerRef = useRef(null);

  // Load saved data
  useEffect(() => {
    try {
      const savedFavs = localStorage.getItem('mn_music_favorites');
      const savedRecent = localStorage.getItem('mn_music_recent');
      if (savedFavs) setFavorites(JSON.parse(savedFavs));
      if (savedRecent) setRecentPlays(JSON.parse(savedRecent));
    } catch (e) {}
  }, []);

  // Search YouTube
  const searchYouTube = useCallback(async (query) => {
    if (!query.trim()) return;
    
    setIsSearching(true);
    try {
      // Use YouTube search via embedded search URL
      // Since we can't use the API directly without a key, we'll provide search links
      const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query + ' official audio')}`;
      
      // For now, open YouTube search in the player
      setSearchResults([{
        type: 'search',
        query: query,
        url: searchUrl
      }]);
    } catch (error) {
      console.error('Search error:', error);
    }
    setIsSearching(false);
  }, []);

  // Handle search submit
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Open YouTube search in player
      playVideo({
        id: 'search',
        name: `Search: ${searchQuery}`,
        icon: '🔍',
        searchQuery: searchQuery,
        isSearch: true
      });
    }
  };

  // Play video
  const playVideo = useCallback((item) => {
    // Add to recent
    const newRecent = [
      { ...item, playedAt: Date.now() },
      ...recentPlays.filter(r => r.id !== item.id)
    ].slice(0, 20);
    setRecentPlays(newRecent);
    localStorage.setItem('mn_music_recent', JSON.stringify(newRecent));
    
    setCurrentVideo(item);
    setIsPlayerMinimized(false);
    actions.addNotification(`Now Playing: ${item.name}`, 'success');
  }, [recentPlays, actions]);

  // Toggle favorite
  const toggleFavorite = useCallback((item) => {
    const newFavs = favorites.find(f => f.id === item.id)
      ? favorites.filter(f => f.id !== item.id)
      : [...favorites, item];
    setFavorites(newFavs);
    localStorage.setItem('mn_music_favorites', JSON.stringify(newFavs));
  }, [favorites]);

  // Open external platform
  const openPlatform = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Get YouTube embed URL
  const getEmbedUrl = (item) => {
    if (item.isSearch) {
      return `https://www.youtube.com/embed?listType=search&list=${encodeURIComponent(item.searchQuery + ' official audio')}&autoplay=1`;
    }
    return `https://www.youtube.com/embed/${item.videoId}?autoplay=1&rel=0`;
  };

  // Search by genre
  const searchByGenre = (genre) => {
    setSelectedGenre(genre.id);
    playVideo({
      id: `genre-${genre.id}`,
      name: `${genre.name} Music`,
      icon: genre.icon,
      searchQuery: `${genre.name} music mix 2024`,
      isSearch: true
    });
  };

  return (
    <div className="music-section">
      <h2 className="section-title">🎵 Music Hub</h2>

      {/* Search Bar - Always Visible */}
      <form className="music-search" onSubmit={handleSearch}>
        <div className="search-container">
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search songs, artists, albums..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <button type="submit" className="search-btn" disabled={isSearching}>
            {isSearching ? '⏳' : '🔍'}
          </button>
        </div>
        <p className="search-hint">Press Enter to search on YouTube</p>
      </form>

      {/* Quick Genre Buttons */}
      <div className="genre-quick">
        {GENRES.slice(0, 8).map(genre => (
          <button
            key={genre.id}
            className={`genre-btn ${selectedGenre === genre.id ? 'active' : ''}`}
            onClick={() => searchByGenre(genre)}
          >
            <span>{genre.icon}</span>
            <span>{genre.name}</span>
          </button>
        ))}
      </div>

      {/* Main Tabs */}
      <div className="music-tabs">
        {[
          { id: 'discover', label: '🔥 Discover' },
          { id: 'radio', label: '📻 Radio' },
          { id: 'platforms', label: '🎧 Platforms' },
          { id: 'library', label: '💼 Library' },
        ].map(tab => (
          <button
            key={tab.id}
            className={`music-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Discover Tab */}
      {activeTab === 'discover' && (
        <div className="discover-content">
          {/* Recent Plays */}
          {recentPlays.length > 0 && (
            <div className="recent-section">
              <h3>🕐 Recently Played</h3>
              <div className="recent-scroll">
                {recentPlays.slice(0, 8).map((item, idx) => (
                  <button
                    key={`recent-${idx}`}
                    className="recent-item"
                    onClick={() => playVideo(item)}
                  >
                    <span className="recent-icon">{item.icon}</span>
                    <span className="recent-name">{item.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Mood Playlists */}
          <div className="playlists-section">
            <h3>🎭 Mood & Activity</h3>
            <div className="playlists-grid">
              {MOOD_PLAYLISTS.map(playlist => (
                <button
                  key={playlist.id}
                  className="playlist-card"
                  onClick={() => playVideo(playlist)}
                >
                  <span className="playlist-icon">{playlist.icon}</span>
                  <div className="playlist-info">
                    <h4>{playlist.name}</h4>
                    <p>{playlist.desc}</p>
                  </div>
                  <span className="play-btn">▶</span>
                </button>
              ))}
            </div>
          </div>

          {/* All Genres */}
          <div className="genres-section">
            <h3>🎵 Browse Genres</h3>
            <div className="genres-grid">
              {GENRES.map(genre => (
                <button
                  key={genre.id}
                  className="genre-card"
                  onClick={() => searchByGenre(genre)}
                >
                  <span className="genre-icon">{genre.icon}</span>
                  <span className="genre-name">{genre.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Radio Tab */}
      {activeTab === 'radio' && (
        <div className="radio-content">
          <h3>📻 24/7 Live Radio Streams</h3>
          <p className="radio-desc">Continuous music streams - click to tune in!</p>
          
          <div className="radio-grid">
            {RADIO_STREAMS.map(station => (
              <button
                key={station.id}
                className={`radio-card ${currentVideo?.id === station.id ? 'playing' : ''}`}
                onClick={() => playVideo(station)}
              >
                <div className="radio-visual">
                  <span className="radio-icon">{station.icon}</span>
                  {currentVideo?.id === station.id && (
                    <div className="live-indicator">
                      <span className="live-dot"></span>
                      LIVE
                    </div>
                  )}
                </div>
                <div className="radio-info">
                  <h4>{station.name}</h4>
                  <p>{station.desc}</p>
                </div>
              </button>
            ))}
          </div>

          <div className="external-radio">
            <h4>🔗 More Radio Options</h4>
            <div className="radio-links">
              <a href="https://radio.garden/" target="_blank" rel="noopener noreferrer">Radio Garden</a>
              <a href="https://somafm.com/" target="_blank" rel="noopener noreferrer">SomaFM</a>
              <a href="https://www.internet-radio.com/" target="_blank" rel="noopener noreferrer">Internet Radio</a>
              <a href="https://poolside.fm/" target="_blank" rel="noopener noreferrer">Poolside FM</a>
            </div>
          </div>
        </div>
      )}

      {/* Platforms Tab */}
      {activeTab === 'platforms' && (
        <div className="platforms-content">
          <h3>🎧 Music Streaming Platforms</h3>
          <p className="platform-desc">Open your favorite music service</p>
          
          <div className="platforms-grid">
            {MUSIC_PLATFORMS.map(platform => (
              <button
                key={platform.id}
                className="platform-card"
                onClick={() => openPlatform(platform.url)}
              >
                <span className="platform-icon">{platform.icon}</span>
                <div className="platform-info">
                  <h4>{platform.name}</h4>
                  <p>{platform.desc}</p>
                </div>
                <span className="external-badge">↗</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Library Tab */}
      {activeTab === 'library' && (
        <div className="library-content">
          {/* Favorites */}
          <div className="favorites-section">
            <h3>⭐ Favorites ({favorites.length})</h3>
            {favorites.length > 0 ? (
              <div className="favorites-grid">
                {favorites.map((item, idx) => (
                  <button
                    key={`fav-${idx}`}
                    className="favorite-card"
                    onClick={() => playVideo(item)}
                  >
                    <span className="fav-icon">{item.icon}</span>
                    <span className="fav-name">{item.name}</span>
                    <button
                      className="remove-fav"
                      onClick={(e) => { e.stopPropagation(); toggleFavorite(item); }}
                    >
                      ✕
                    </button>
                  </button>
                ))}
              </div>
            ) : (
              <p className="empty-msg">No favorites yet. Click ⭐ on any playlist to save it!</p>
            )}
          </div>

          {/* History */}
          <div className="history-section">
            <h3>📜 History ({recentPlays.length})</h3>
            {recentPlays.length > 0 ? (
              <div className="history-list">
                {recentPlays.map((item, idx) => (
                  <button
                    key={`history-${idx}`}
                    className="history-item"
                    onClick={() => playVideo(item)}
                  >
                    <span>{item.icon}</span>
                    <span className="history-name">{item.name}</span>
                    <span className="history-time">
                      {new Date(item.playedAt).toLocaleDateString()}
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <p className="empty-msg">Your listening history will appear here</p>
            )}
          </div>
        </div>
      )}

      {/* Player */}
      {currentVideo && (
        <div className={`music-player ${isPlayerMinimized ? 'minimized' : ''}`} ref={playerRef}>
          <div className="player-header">
            <div className="now-playing">
              <span className="now-icon">{currentVideo.icon}</span>
              <div className="now-info">
                <span className="now-label">Now Playing</span>
                <span className="now-title">{currentVideo.name}</span>
              </div>
            </div>
            <div className="player-controls">
              <button
                className={`fav-control ${favorites.find(f => f.id === currentVideo.id) ? 'active' : ''}`}
                onClick={() => toggleFavorite(currentVideo)}
                title="Add to favorites"
              >
                {favorites.find(f => f.id === currentVideo.id) ? '⭐' : '☆'}
              </button>
              <button
                className="minimize-btn"
                onClick={() => setIsPlayerMinimized(!isPlayerMinimized)}
                title={isPlayerMinimized ? 'Expand' : 'Minimize'}
              >
                {isPlayerMinimized ? '▲' : '▼'}
              </button>
              <button
                className="close-player"
                onClick={() => setCurrentVideo(null)}
                title="Close player"
              >
                ✕
              </button>
            </div>
          </div>
          
          {!isPlayerMinimized && (
            <div className="player-frame">
              <iframe
                src={getEmbedUrl(currentVideo)}
                title={currentVideo.name}
                allow="autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default MusicSection;
