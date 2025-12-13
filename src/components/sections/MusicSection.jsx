/* ========================================
   MusicSection.jsx - Music Hub
   Working search with results display
   ======================================== */

import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import './MusicSection.css';

// Invidious instances for API (fallback chain - more reliable ones first)
const INVIDIOUS_INSTANCES = [
  'https://inv.nadeko.net',
  'https://invidious.privacyredirect.com',
  'https://vid.puffyan.us',
  'https://invidious.nerdvpn.de',
  'https://inv.riverside.rocks',
  'https://yt.artemislena.eu',
];

// Piped instances (alternative API)
const PIPED_INSTANCES = [
  'https://pipedapi.kavin.rocks',
  'https://api.piped.yt',
];

// 24/7 Live Radio Streams
const RADIO_STATIONS = [
  { id: 'lofi-girl', name: 'Lofi Girl', icon: '👧', videoId: 'jfKfPfyJRdk', desc: '24/7 lo-fi beats', color: '#e879a9' },
  { id: 'chillhop', name: 'Chillhop', icon: '☕', videoId: '5yx6BWlEVcY', desc: 'Jazzy lofi hip hop', color: '#8b5cf6' },
  { id: 'jazz', name: 'Jazz Cafe', icon: '🎷', videoId: '-5KAN9_CzSA', desc: 'Coffee shop jazz', color: '#f59e0b' },
  { id: 'synthwave', name: 'Synthwave', icon: '🌆', videoId: '4xDzrJKXOOY', desc: '80s retro vibes', color: '#ec4899' },
  { id: 'classical', name: 'Classical', icon: '🎻', videoId: 'jgpJVI3tDbY', desc: 'Classical focus', color: '#6366f1' },
  { id: 'ambient', name: 'Ambient', icon: '🌙', videoId: 'S_MOd40zlYU', desc: 'Sleep & relaxation', color: '#0ea5e9' },
];

// Curated playlists
const PLAYLISTS = [
  { id: 'study', name: 'Study Music', icon: '📚', videoId: 'lTRiuFIWV54', desc: '3 hours of focus music', duration: '3:00:00' },
  { id: 'workout', name: 'Workout Mix', icon: '💪', videoId: 'gDa1su1pNeM', desc: 'High energy hits', duration: '1:30:00' },
  { id: 'chill', name: 'Chill Vibes', icon: '🌴', videoId: 'lP26UCnoH9s', desc: 'Relaxing music', duration: '2:00:00' },
  { id: 'piano', name: 'Piano', icon: '🎹', videoId: '77ZozI0rw7w', desc: 'Beautiful piano', duration: '3:00:00' },
  { id: 'gaming', name: 'Gaming Music', icon: '🎮', videoId: 'NmCCQxVBfyM', desc: 'Epic soundtracks', duration: '2:30:00' },
  { id: 'meditation', name: 'Meditation', icon: '🧘', videoId: '1ZYbU82GVz4', desc: 'Calm meditation', duration: '3:00:00' },
];

// Genre quick searches
const GENRES = [
  { id: 'pop', name: 'Pop' },
  { id: 'hiphop', name: 'Hip Hop' },
  { id: 'rock', name: 'Rock' },
  { id: 'rnb', name: 'R&B' },
  { id: 'electronic', name: 'EDM' },
  { id: 'country', name: 'Country' },
  { id: 'jazz', name: 'Jazz' },
  { id: 'metal', name: 'Metal' },
  { id: 'indie', name: 'Indie' },
  { id: 'kpop', name: 'K-Pop' },
  { id: 'latin', name: 'Latin' },
  { id: 'classical', name: 'Classical' },
];

function MusicSection() {
  const { actions } = useApp();
  
  // State
  const [activeTab, setActiveTab] = useState('radio');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [recentPlays, setRecentPlays] = useState([]);

  // Load saved data
  useEffect(() => {
    try {
      const savedFavs = localStorage.getItem('mn_music_favorites');
      const savedRecent = localStorage.getItem('mn_music_recent');
      if (savedFavs) setFavorites(JSON.parse(savedFavs));
      if (savedRecent) setRecentPlays(JSON.parse(savedRecent));
    } catch (e) {
      console.error('Error loading music data:', e);
    }
  }, []);

  // Format duration from seconds
  const formatDuration = (seconds) => {
    if (!seconds) return '';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Format view count
  const formatViews = (views) => {
    if (!views) return '';
    if (views >= 1000000000) return `${(views / 1000000000).toFixed(1)}B`;
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
    return views.toString();
  };

  // Search for music
  const searchMusic = async (query) => {
    if (!query.trim()) return;
    
    setIsSearching(true);
    setSearchError(null);
    setActiveTab('search');
    
    // Add "music" or "official" to query for better results
    const searchTerm = `${query} music`;
    
    // Try Invidious API first
    for (const instance of INVIDIOUS_INSTANCES) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000);
        
        const response = await fetch(
          `${instance}/api/v1/search?q=${encodeURIComponent(searchTerm)}&type=video`,
          { 
            headers: { 'Accept': 'application/json' },
            signal: controller.signal
          }
        );
        
        clearTimeout(timeoutId);
        
        if (!response.ok) continue;
        
        const data = await response.json();
        
        if (data && Array.isArray(data) && data.length > 0) {
          const results = data.slice(0, 25).map(item => ({
            id: item.videoId,
            videoId: item.videoId,
            name: item.title,
            artist: item.author,
            duration: formatDuration(item.lengthSeconds),
            durationSeconds: item.lengthSeconds,
            views: formatViews(item.viewCount),
            thumbnail: `https://i.ytimg.com/vi/${item.videoId}/mqdefault.jpg`,
            icon: '🎵',
            desc: item.author,
          }));
          
          setSearchResults(results);
          setIsSearching(false);
          actions.addNotification(`Found ${results.length} results for "${query}"`, 'success');
          return;
        }
      } catch (err) {
        console.log(`Invidious ${instance} failed:`, err.message);
        continue;
      }
    }
    
    // Try Piped API as fallback
    for (const instance of PIPED_INSTANCES) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000);
        
        const response = await fetch(
          `${instance}/search?q=${encodeURIComponent(searchTerm)}&filter=music_songs`,
          { 
            headers: { 'Accept': 'application/json' },
            signal: controller.signal
          }
        );
        
        clearTimeout(timeoutId);
        
        if (!response.ok) continue;
        
        const data = await response.json();
        
        if (data && data.items && data.items.length > 0) {
          const results = data.items.slice(0, 25).map(item => {
            const videoId = item.url?.replace('/watch?v=', '') || item.id;
            return {
              id: videoId,
              videoId: videoId,
              name: item.title,
              artist: item.uploaderName || item.uploader,
              duration: formatDuration(item.duration),
              durationSeconds: item.duration,
              views: formatViews(item.views),
              thumbnail: item.thumbnail || `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`,
              icon: '🎵',
              desc: item.uploaderName || item.uploader,
            };
          });
          
          setSearchResults(results);
          setIsSearching(false);
          actions.addNotification(`Found ${results.length} results for "${query}"`, 'success');
          return;
        }
      } catch (err) {
        console.log(`Piped ${instance} failed:`, err.message);
        continue;
      }
    }
    
    // All APIs failed - show YouTube embed search as ultimate fallback
    setSearchError('search_fallback');
    setSearchResults([]);
    actions.addNotification(`Showing YouTube results for "${query}"`, 'info');
    setIsSearching(false);
  };

  // Handle search submit
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      searchMusic(searchQuery);
    }
  };

  // Search genre
  const searchGenre = (genre) => {
    setSearchQuery(genre.name);
    searchMusic(genre.name);
  };

  // Play track
  const playTrack = useCallback((track) => {
    // Add to recent
    const newRecent = [
      { ...track, playedAt: Date.now() },
      ...recentPlays.filter(r => r.id !== track.id)
    ].slice(0, 20);
    setRecentPlays(newRecent);
    localStorage.setItem('mn_music_recent', JSON.stringify(newRecent));
    
    setCurrentTrack(track);
    actions.addNotification(`Now playing: ${track.name}`, 'success');
  }, [recentPlays, actions]);

  // Close player
  const closePlayer = () => {
    setCurrentTrack(null);
  };

  // Toggle favorite
  const toggleFavorite = (track, e) => {
    if (e) e.stopPropagation();
    const exists = favorites.find(f => f.id === track.id);
    const newFavs = exists
      ? favorites.filter(f => f.id !== track.id)
      : [...favorites, { ...track, favAt: Date.now() }];
    setFavorites(newFavs);
    localStorage.setItem('mn_music_favorites', JSON.stringify(newFavs));
  };

  // Check if favorited
  const isFavorite = (trackId) => favorites.some(f => f.id === trackId);

  // Clear search
  const clearSearch = () => {
    setSearchResults([]);
    setSearchQuery('');
    setSearchError(null);
    setActiveTab('radio');
  };

  return (
    <div className="music-section">
      <h2 className="section-title">🎵 Music Hub</h2>

      {/* Search Bar */}
      <form className="music-search" onSubmit={handleSearch}>
        <div className="search-wrapper">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search for artists, songs (e.g. Drake, Taylor Swift)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit" disabled={isSearching || !searchQuery.trim()}>
            {isSearching ? 'Searching...' : 'Search'}
          </button>
        </div>
      </form>

      {/* Genre Pills */}
      <div className="genre-pills">
        {GENRES.map(genre => (
          <button
            key={genre.id}
            className="genre-pill"
            onClick={() => searchGenre(genre)}
          >
            {genre.name}
          </button>
        ))}
      </div>

      {/* Tabs */}
      <div className="music-tabs">
        <button 
          className={`tab ${activeTab === 'radio' ? 'active' : ''}`}
          onClick={() => setActiveTab('radio')}
        >
          📻 Radio
        </button>
        <button 
          className={`tab ${activeTab === 'playlists' ? 'active' : ''}`}
          onClick={() => setActiveTab('playlists')}
        >
          🎭 Playlists
        </button>
        <button 
          className={`tab ${activeTab === 'favorites' ? 'active' : ''}`}
          onClick={() => setActiveTab('favorites')}
        >
          ⭐ Favorites ({favorites.length})
        </button>
        <button 
          className={`tab ${activeTab === 'recent' ? 'active' : ''}`}
          onClick={() => setActiveTab('recent')}
        >
          🕐 Recent
        </button>
        {(searchResults.length > 0 || searchError) && (
          <button 
            className={`tab ${activeTab === 'search' ? 'active' : ''}`}
            onClick={() => setActiveTab('search')}
          >
            🔍 Results
          </button>
        )}
      </div>

      {/* Content */}
      <div className="music-content">
        
        {/* Search Results Tab */}
        {activeTab === 'search' && (
          <div className="search-tab">
            <div className="search-header">
              <h3>🔍 Results for "{searchQuery}"</h3>
              <button className="clear-btn" onClick={clearSearch}>✕ Clear</button>
            </div>
            
            {/* Loading */}
            {isSearching && (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>Searching for "{searchQuery}"...</p>
              </div>
            )}
            
            {/* Results List */}
            {!isSearching && searchResults.length > 0 && (
              <div className="results-list">
                {searchResults.map((track, idx) => (
                  <div 
                    key={track.id}
                    className={`result-item ${currentTrack?.id === track.id ? 'playing' : ''}`}
                    onClick={() => playTrack(track)}
                  >
                    <span className="result-num">{idx + 1}</span>
                    <img 
                      src={track.thumbnail} 
                      alt="" 
                      className="result-thumb"
                      onError={(e) => { e.target.src = `https://i.ytimg.com/vi/${track.videoId}/mqdefault.jpg`; }}
                    />
                    <div className="result-info">
                      <h4>{track.name}</h4>
                      <p>
                        {track.artist}
                        {track.duration && <span> • {track.duration}</span>}
                        {track.views && <span> • {track.views} views</span>}
                      </p>
                    </div>
                    <div className="result-actions">
                      <button 
                        className="play-btn"
                        onClick={(e) => { e.stopPropagation(); playTrack(track); }}
                      >
                        ▶
                      </button>
                      <button 
                        className={`fav-btn ${isFavorite(track.id) ? 'active' : ''}`}
                        onClick={(e) => toggleFavorite(track, e)}
                      >
                        {isFavorite(track.id) ? '★' : '☆'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Fallback - YouTube Embed Search */}
            {!isSearching && searchError === 'search_fallback' && (
              <div className="fallback-search">
                <p className="fallback-title">🎵 Results for "{searchQuery}"</p>
                <p className="fallback-note">Click any video below to play it directly:</p>
                <div className="youtube-embed-search">
                  <iframe
                    src={`https://www.youtube.com/embed?listType=search&list=${encodeURIComponent(searchQuery + ' official audio')}`}
                    title={`Search: ${searchQuery}`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
                <div className="external-options">
                  <p>Or open full search on:</p>
                  <div className="ext-links">
                    <a href={`https://music.youtube.com/search?q=${encodeURIComponent(searchQuery)}`} target="_blank" rel="noopener noreferrer">
                      🔴 YouTube Music
                    </a>
                    <a href={`https://open.spotify.com/search/${encodeURIComponent(searchQuery)}`} target="_blank" rel="noopener noreferrer">
                      💚 Spotify
                    </a>
                    <a href={`https://soundcloud.com/search?q=${encodeURIComponent(searchQuery)}`} target="_blank" rel="noopener noreferrer">
                      🔶 SoundCloud
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Radio Tab */}
        {activeTab === 'radio' && (
          <div className="radio-tab">
            <h3>📻 24/7 Live Radio</h3>
            <div className="radio-grid">
              {RADIO_STATIONS.map(station => (
                <div 
                  key={station.id}
                  className={`radio-card ${currentTrack?.id === station.id ? 'playing' : ''}`}
                  style={{ '--accent-color': station.color }}
                  onClick={() => playTrack(station)}
                >
                  <div className="radio-top">
                    <span className="radio-icon">{station.icon}</span>
                    <span className="live-dot">● LIVE</span>
                  </div>
                  <h4>{station.name}</h4>
                  <p>{station.desc}</p>
                  <button 
                    className={`fav-btn ${isFavorite(station.id) ? 'active' : ''}`}
                    onClick={(e) => toggleFavorite(station, e)}
                  >
                    {isFavorite(station.id) ? '★' : '☆'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Playlists Tab */}
        {activeTab === 'playlists' && (
          <div className="playlists-tab">
            <h3>🎭 Curated Playlists</h3>
            <div className="playlist-grid">
              {PLAYLISTS.map(playlist => (
                <div 
                  key={playlist.id}
                  className={`playlist-card ${currentTrack?.id === playlist.id ? 'playing' : ''}`}
                  onClick={() => playTrack(playlist)}
                >
                  <span className="playlist-icon">{playlist.icon}</span>
                  <div className="playlist-info">
                    <h4>{playlist.name}</h4>
                    <p>{playlist.desc}</p>
                    <span className="duration">{playlist.duration}</span>
                  </div>
                  <button 
                    className={`fav-btn ${isFavorite(playlist.id) ? 'active' : ''}`}
                    onClick={(e) => toggleFavorite(playlist, e)}
                  >
                    {isFavorite(playlist.id) ? '★' : '☆'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Favorites Tab */}
        {activeTab === 'favorites' && (
          <div className="favorites-tab">
            <h3>⭐ Your Favorites</h3>
            {favorites.length > 0 ? (
              <div className="track-list">
                {favorites.map((track, idx) => (
                  <div 
                    key={track.id}
                    className={`track-item ${currentTrack?.id === track.id ? 'playing' : ''}`}
                    onClick={() => playTrack(track)}
                  >
                    <span className="track-num">{idx + 1}</span>
                    {track.thumbnail ? (
                      <img src={track.thumbnail} alt="" className="track-thumb" />
                    ) : (
                      <span className="track-icon">{track.icon}</span>
                    )}
                    <div className="track-info">
                      <h4>{track.name}</h4>
                      <p>{track.artist || track.desc}</p>
                    </div>
                    <button 
                      className="remove-btn"
                      onClick={(e) => toggleFavorite(track, e)}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>No favorites yet</p>
                <p>Search for music and click ☆ to save songs here</p>
              </div>
            )}
          </div>
        )}

        {/* Recent Tab */}
        {activeTab === 'recent' && (
          <div className="recent-tab">
            <h3>🕐 Recently Played</h3>
            {recentPlays.length > 0 ? (
              <div className="track-list">
                {recentPlays.map((track, idx) => (
                  <div 
                    key={`${track.id}-${idx}`}
                    className={`track-item ${currentTrack?.id === track.id ? 'playing' : ''}`}
                    onClick={() => playTrack(track)}
                  >
                    <span className="track-num">{idx + 1}</span>
                    {track.thumbnail ? (
                      <img src={track.thumbnail} alt="" className="track-thumb" />
                    ) : (
                      <span className="track-icon">{track.icon}</span>
                    )}
                    <div className="track-info">
                      <h4>{track.name}</h4>
                      <p>{track.artist || track.desc}</p>
                    </div>
                    <button 
                      className={`fav-btn sm ${isFavorite(track.id) ? 'active' : ''}`}
                      onClick={(e) => toggleFavorite(track, e)}
                    >
                      {isFavorite(track.id) ? '★' : '☆'}
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>No recent plays</p>
                <p>Start listening to build your history</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Music Player */}
      {currentTrack && (
        <div className="music-player">
          <div className="player-container">
            <div className="player-header">
              <div className="now-playing">
                {currentTrack.thumbnail ? (
                  <img src={currentTrack.thumbnail} alt="" className="np-thumb" />
                ) : (
                  <span className="np-icon">{currentTrack.icon}</span>
                )}
                <div className="np-info">
                  <span className="np-title">{currentTrack.name}</span>
                  <span className="np-artist">{currentTrack.artist || currentTrack.desc}</span>
                </div>
              </div>
              <div className="player-btns">
                <button 
                  className={`fav-btn ${isFavorite(currentTrack.id) ? 'active' : ''}`}
                  onClick={() => toggleFavorite(currentTrack)}
                  title="Add to favorites"
                >
                  {isFavorite(currentTrack.id) ? '★' : '☆'}
                </button>
                <button 
                  className="ext-btn"
                  onClick={() => window.open(`https://www.youtube.com/watch?v=${currentTrack.videoId}`, '_blank')}
                  title="Open in YouTube"
                >
                  ↗
                </button>
                <button className="close-btn" onClick={closePlayer} title="Close">✕</button>
              </div>
            </div>
            
            <div className="video-wrapper">
              <iframe
                src={`https://www.youtube.com/embed/${currentTrack.videoId}?autoplay=1&rel=0`}
                title={currentTrack.name}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            
            <div className="player-tip">
              Use the video player controls for play/pause and volume
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MusicSection;
