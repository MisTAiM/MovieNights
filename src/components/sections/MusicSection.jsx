/* ========================================
   MusicSection.jsx - Music Hub
   Features: Search with results, playlists, ad-free playback
   ======================================== */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import './MusicSection.css';

// ============================================
// CONFIGURATION
// ============================================

// Invidious instance for ad-free YouTube playback
const INVIDIOUS_INSTANCE = 'https://yewtu.be';
const PIPED_INSTANCE = 'https://piped.video';

// Curated playlists with verified YouTube playlist IDs
const PLAYLISTS = [
  { id: 'lofi', name: 'Lo-Fi Beats', icon: '🎧', playlistId: 'PLOzDu-MXXLliO9fBNZOQTBDddoA3FzZUo', desc: 'Chill study music' },
  { id: 'workout', name: 'Workout', icon: '💪', playlistId: 'PLgzTt0k8mXzEk586ze4BjvDXR7c-TUSnx', desc: 'High energy hits' },
  { id: 'rock', name: 'Rock Classics', icon: '🎸', playlistId: 'PLGBuKfnErZlCkRTMDPfPe3GYCFY8eacRP', desc: 'Classic rock anthems' },
  { id: 'pop', name: 'Pop Hits', icon: '🎤', playlistId: 'PLDcnymzs18LU4Kexrs91TVdfnplU3I5zs', desc: 'Top pop songs' },
  { id: 'hiphop', name: 'Hip Hop', icon: '🎵', playlistId: 'PLgEnQ8ynOh6FiSSNNqXmECOqcIqoVZGGp', desc: 'Hip hop & rap' },
  { id: 'jazz', name: 'Jazz', icon: '🎷', playlistId: 'PLkqz3S84Tw-T0T2Lvi4P2F3_g3LSFsMk_', desc: 'Smooth jazz' },
  { id: 'classical', name: 'Classical', icon: '🎻', playlistId: 'PLVXq77mXV539VYxMIVRLGbEV9dW9rl6dV', desc: 'Classical masterpieces' },
  { id: 'electronic', name: 'Electronic', icon: '🎹', playlistId: 'PLFPg_IUxqnZNnACUGsfn50DySIOVSkiKI', desc: 'EDM & electronic' },
];

// Live radio streams (24/7)
const RADIO_STREAMS = [
  { id: 'lofi-girl', name: 'Lofi Girl', icon: '👧', videoId: 'jfKfPfyJRdk', desc: '24/7 lo-fi beats', live: true },
  { id: 'chillhop', name: 'Chillhop', icon: '☕', videoId: '5yx6BWlEVcY', desc: 'Chillhop Radio', live: true },
  { id: 'jazz-cafe', name: 'Jazz Cafe', icon: '🎷', videoId: '-5KAN9_CzSA', desc: 'Cozy jazz', live: true },
  { id: 'synthwave', name: 'Synthwave', icon: '🌆', videoId: '4xDzrJKXOOY', desc: '80s retro vibes', live: true },
  { id: 'classical', name: 'Classical', icon: '🎻', videoId: 'mIYzp5rcTvU', desc: 'Classical radio', live: true },
  { id: 'ambient', name: 'Ambient', icon: '🌙', videoId: 'S_MOd40zlYU', desc: 'Relaxing ambient', live: true },
];

// Quick genre searches
const GENRES = [
  { id: 'pop', name: 'Pop', query: 'pop music 2024' },
  { id: 'rock', name: 'Rock', query: 'rock music playlist' },
  { id: 'hiphop', name: 'Hip Hop', query: 'hip hop rap music' },
  { id: 'rnb', name: 'R&B', query: 'rnb soul music' },
  { id: 'electronic', name: 'Electronic', query: 'electronic dance music' },
  { id: 'country', name: 'Country', query: 'country music hits' },
  { id: 'jazz', name: 'Jazz', query: 'jazz music' },
  { id: 'classical', name: 'Classical', query: 'classical music' },
  { id: 'metal', name: 'Metal', query: 'metal rock music' },
  { id: 'indie', name: 'Indie', query: 'indie music playlist' },
  { id: 'kpop', name: 'K-Pop', query: 'kpop music' },
  { id: 'latin', name: 'Latin', query: 'latin reggaeton music' },
];

// External platforms
const PLATFORMS = [
  { id: 'spotify', name: 'Spotify', icon: '💚', url: 'https://open.spotify.com/' },
  { id: 'apple', name: 'Apple Music', icon: '🍎', url: 'https://music.apple.com/' },
  { id: 'youtube', name: 'YouTube Music', icon: '🔴', url: 'https://music.youtube.com/' },
  { id: 'soundcloud', name: 'SoundCloud', icon: '🔶', url: 'https://soundcloud.com/' },
];

function MusicSection() {
  const { actions } = useApp();
  
  // State
  const [activeTab, setActiveTab] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(80);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [queue, setQueue] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [recentPlays, setRecentPlays] = useState([]);
  const [playerReady, setPlayerReady] = useState(false);
  
  // Refs
  const playerRef = useRef(null);
  const progressInterval = useRef(null);

  // Load saved data
  useEffect(() => {
    try {
      const savedFavs = localStorage.getItem('mn_music_favorites');
      const savedRecent = localStorage.getItem('mn_music_recent');
      const savedVolume = localStorage.getItem('mn_music_volume');
      if (savedFavs) setFavorites(JSON.parse(savedFavs));
      if (savedRecent) setRecentPlays(JSON.parse(savedRecent));
      if (savedVolume) setVolume(parseInt(savedVolume));
    } catch (e) {
      console.error('Error loading music data:', e);
    }
  }, []);

  // Initialize YouTube IFrame API
  useEffect(() => {
    // Load YouTube API if not already loaded
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScript = document.getElementsByTagName('script')[0];
      firstScript.parentNode.insertBefore(tag, firstScript);
    }

    // Setup callback
    window.onYouTubeIframeAPIReady = () => {
      console.log('YouTube API Ready');
    };

    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, []);

  // Search for music using Invidious API
  const searchMusic = async (query) => {
    if (!query.trim()) return;
    
    setIsSearching(true);
    setActiveTab('search');
    
    try {
      // Use Invidious API for search
      const response = await fetch(`${INVIDIOUS_INSTANCE}/api/v1/search?q=${encodeURIComponent(query)}&type=video`);
      const data = await response.json();
      
      // Filter for music-related content
      const results = data.slice(0, 20).map(item => ({
        id: item.videoId,
        title: item.title,
        artist: item.author,
        duration: formatDuration(item.lengthSeconds),
        durationSeconds: item.lengthSeconds,
        thumbnail: item.videoThumbnails?.[0]?.url || `https://i.ytimg.com/vi/${item.videoId}/mqdefault.jpg`,
        videoId: item.videoId,
        views: formatViews(item.viewCount),
      }));
      
      setSearchResults(results);
      actions.addNotification(`Found ${results.length} results`, 'success');
    } catch (error) {
      console.error('Search error:', error);
      // Fallback - just show the search term for manual search
      actions.addNotification('Search API unavailable, showing alternatives', 'info');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Format duration
  const formatDuration = (seconds) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Format views
  const formatViews = (views) => {
    if (!views) return '';
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M views`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K views`;
    return `${views} views`;
  };

  // Play a track
  const playTrack = useCallback((track) => {
    // Add to recent plays
    const newRecent = [
      { ...track, playedAt: Date.now() },
      ...recentPlays.filter(r => r.id !== track.id)
    ].slice(0, 20);
    setRecentPlays(newRecent);
    localStorage.setItem('mn_music_recent', JSON.stringify(newRecent));
    
    setCurrentTrack(track);
    setIsPlaying(true);
    setCurrentTime(0);
    setDuration(track.durationSeconds || 0);
    
    // Initialize or load new video
    if (playerRef.current && playerRef.current.loadVideoById) {
      playerRef.current.loadVideoById(track.videoId);
      playerRef.current.setVolume(volume);
    }
    
    actions.addNotification(`Now Playing: ${track.title}`, 'success');
  }, [recentPlays, volume, actions]);

  // Play a playlist
  const playPlaylist = (playlist) => {
    const track = {
      id: playlist.id,
      title: playlist.name,
      artist: 'Playlist',
      videoId: playlist.playlistId,
      isPlaylist: true,
      thumbnail: `https://i.ytimg.com/vi/${playlist.playlistId}/mqdefault.jpg`,
    };
    setCurrentTrack(track);
    setIsPlaying(true);
    actions.addNotification(`Playing: ${playlist.name}`, 'success');
  };

  // Play radio
  const playRadio = (station) => {
    const track = {
      id: station.id,
      title: station.name,
      artist: station.desc,
      videoId: station.videoId,
      thumbnail: `https://i.ytimg.com/vi/${station.videoId}/mqdefault.jpg`,
      isLive: true,
    };
    playTrack(track);
  };

  // Player controls
  const togglePlay = () => {
    if (playerRef.current) {
      if (isPlaying) {
        playerRef.current.pauseVideo();
      } else {
        playerRef.current.playVideo();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseInt(e.target.value);
    setVolume(newVolume);
    localStorage.setItem('mn_music_volume', newVolume.toString());
    
    if (playerRef.current && playerRef.current.setVolume) {
      playerRef.current.setVolume(newVolume);
    }
  };

  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const seekTime = percent * duration;
    
    if (playerRef.current && playerRef.current.seekTo) {
      playerRef.current.seekTo(seekTime, true);
      setCurrentTime(seekTime);
    }
  };

  // Toggle favorite
  const toggleFavorite = (track) => {
    const exists = favorites.find(f => f.id === track.id);
    const newFavs = exists
      ? favorites.filter(f => f.id !== track.id)
      : [...favorites, track];
    setFavorites(newFavs);
    localStorage.setItem('mn_music_favorites', JSON.stringify(newFavs));
  };

  // Add to queue
  const addToQueue = (track) => {
    setQueue(prev => [...prev, track]);
    actions.addNotification(`Added to queue: ${track.title}`, 'info');
  };

  // Close player
  const closePlayer = () => {
    setCurrentTrack(null);
    setIsPlaying(false);
    if (playerRef.current && playerRef.current.stopVideo) {
      playerRef.current.stopVideo();
    }
  };

  // Handle search submit
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      searchMusic(searchQuery);
    }
  };

  // Quick genre search
  const searchGenre = (genre) => {
    setSearchQuery(genre.query);
    searchMusic(genre.query);
  };

  // Player state callback
  const onPlayerStateChange = (event) => {
    if (event.data === window.YT?.PlayerState?.PLAYING) {
      setIsPlaying(true);
      // Start progress tracking
      progressInterval.current = setInterval(() => {
        if (playerRef.current && playerRef.current.getCurrentTime) {
          setCurrentTime(playerRef.current.getCurrentTime());
        }
      }, 1000);
    } else if (event.data === window.YT?.PlayerState?.PAUSED) {
      setIsPlaying(false);
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    } else if (event.data === window.YT?.PlayerState?.ENDED) {
      setIsPlaying(false);
      // Play next in queue
      if (queue.length > 0) {
        const [next, ...rest] = queue;
        setQueue(rest);
        playTrack(next);
      }
    }
  };

  const onPlayerReady = (event) => {
    setPlayerReady(true);
    event.target.setVolume(volume);
  };

  // Get embed URL (using Invidious for ad-free playback)
  const getEmbedUrl = (videoId, isPlaylist = false) => {
    if (isPlaylist) {
      return `${INVIDIOUS_INSTANCE}/embed/videoseries?list=${videoId}&autoplay=1`;
    }
    return `${INVIDIOUS_INSTANCE}/embed/${videoId}?autoplay=1&quality=dash`;
  };

  return (
    <div className="music-section">
      <h2 className="section-title">🎵 Music Hub</h2>

      {/* Search Bar */}
      <form className="music-search" onSubmit={handleSearch}>
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search artists, songs, albums..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit" disabled={!searchQuery.trim() || isSearching}>
            {isSearching ? '...' : 'Search'}
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
          className={`tab ${activeTab === 'home' ? 'active' : ''}`}
          onClick={() => setActiveTab('home')}
        >
          🏠 Home
        </button>
        <button 
          className={`tab ${activeTab === 'radio' ? 'active' : ''}`}
          onClick={() => setActiveTab('radio')}
        >
          📻 Radio
        </button>
        <button 
          className={`tab ${activeTab === 'library' ? 'active' : ''}`}
          onClick={() => setActiveTab('library')}
        >
          💼 Library
        </button>
        <button 
          className={`tab ${activeTab === 'platforms' ? 'active' : ''}`}
          onClick={() => setActiveTab('platforms')}
        >
          🎧 Apps
        </button>
        {searchResults.length > 0 && (
          <button 
            className={`tab ${activeTab === 'search' ? 'active' : ''}`}
            onClick={() => setActiveTab('search')}
          >
            🔍 Results ({searchResults.length})
          </button>
        )}
      </div>

      {/* Content */}
      <div className="music-content">
        
        {/* Search Results */}
        {activeTab === 'search' && (
          <div className="search-results">
            <div className="results-header">
              <h3>Results for "{searchQuery}"</h3>
              <button className="clear-btn" onClick={() => { setSearchResults([]); setActiveTab('home'); }}>
                Clear
              </button>
            </div>
            
            {searchResults.length > 0 ? (
              <div className="track-list">
                {searchResults.map((track, idx) => (
                  <div key={track.id} className="track-item">
                    <span className="track-num">{idx + 1}</span>
                    <img src={track.thumbnail} alt="" className="track-thumb" />
                    <div className="track-info">
                      <h4>{track.title}</h4>
                      <p>{track.artist} • {track.duration} {track.views && `• ${track.views}`}</p>
                    </div>
                    <div className="track-actions">
                      <button onClick={() => playTrack(track)} title="Play">▶</button>
                      <button onClick={() => addToQueue(track)} title="Add to Queue">+</button>
                      <button 
                        onClick={() => toggleFavorite(track)} 
                        className={favorites.find(f => f.id === track.id) ? 'fav' : ''}
                        title="Favorite"
                      >
                        {favorites.find(f => f.id === track.id) ? '★' : '☆'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-results">
                <p>No results found. Try searching on:</p>
                <div className="alt-search">
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
            )}
          </div>
        )}

        {/* Home Tab */}
        {activeTab === 'home' && (
          <div className="home-tab">
            {/* Recent Plays */}
            {recentPlays.length > 0 && (
              <section className="section">
                <h3>🕐 Recently Played</h3>
                <div className="scroll-row">
                  {recentPlays.slice(0, 10).map(track => (
                    <button key={track.id} className="recent-card" onClick={() => playTrack(track)}>
                      <img src={track.thumbnail} alt="" />
                      <div className="recent-info">
                        <span className="recent-title">{track.title?.substring(0, 30)}</span>
                        <span className="recent-artist">{track.artist}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </section>
            )}

            {/* Playlists */}
            <section className="section">
              <h3>🎭 Mood Playlists</h3>
              <div className="playlist-grid">
                {PLAYLISTS.map(playlist => (
                  <button key={playlist.id} className="playlist-card" onClick={() => playPlaylist(playlist)}>
                    <span className="playlist-icon">{playlist.icon}</span>
                    <div className="playlist-info">
                      <h4>{playlist.name}</h4>
                      <p>{playlist.desc}</p>
                    </div>
                    <span className="play-icon">▶</span>
                  </button>
                ))}
              </div>
            </section>

            {/* Quick Radio */}
            <section className="section">
              <h3>📻 Live Radio</h3>
              <div className="radio-row">
                {RADIO_STREAMS.slice(0, 4).map(station => (
                  <button key={station.id} className="radio-card-small" onClick={() => playRadio(station)}>
                    <span className="radio-icon">{station.icon}</span>
                    <span className="radio-name">{station.name}</span>
                    <span className="live-badge">LIVE</span>
                  </button>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* Radio Tab */}
        {activeTab === 'radio' && (
          <div className="radio-tab">
            <h3>📻 24/7 Live Radio Stations</h3>
            <p className="tab-desc">Ad-free music streams running 24/7</p>
            <div className="radio-grid">
              {RADIO_STREAMS.map(station => (
                <button 
                  key={station.id} 
                  className={`radio-card ${currentTrack?.id === station.id ? 'playing' : ''}`}
                  onClick={() => playRadio(station)}
                >
                  <div className="radio-visual">
                    <span className="radio-big-icon">{station.icon}</span>
                    <span className="live-indicator">● LIVE</span>
                  </div>
                  <div className="radio-details">
                    <h4>{station.name}</h4>
                    <p>{station.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Library Tab */}
        {activeTab === 'library' && (
          <div className="library-tab">
            <section className="section">
              <h3>⭐ Favorites ({favorites.length})</h3>
              {favorites.length > 0 ? (
                <div className="track-list">
                  {favorites.map((track, idx) => (
                    <div key={track.id} className="track-item">
                      <span className="track-num">{idx + 1}</span>
                      <img src={track.thumbnail} alt="" className="track-thumb" />
                      <div className="track-info">
                        <h4>{track.title}</h4>
                        <p>{track.artist}</p>
                      </div>
                      <div className="track-actions">
                        <button onClick={() => playTrack(track)}>▶</button>
                        <button onClick={() => toggleFavorite(track)} className="fav">★</button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="empty">No favorites yet. Click ☆ on any track to save it.</p>
              )}
            </section>

            {/* Queue */}
            {queue.length > 0 && (
              <section className="section">
                <h3>📋 Queue ({queue.length})</h3>
                <div className="track-list">
                  {queue.map((track, idx) => (
                    <div key={`q-${idx}`} className="track-item">
                      <span className="track-num">{idx + 1}</span>
                      <img src={track.thumbnail} alt="" className="track-thumb" />
                      <div className="track-info">
                        <h4>{track.title}</h4>
                        <p>{track.artist}</p>
                      </div>
                      <div className="track-actions">
                        <button onClick={() => setQueue(queue.filter((_, i) => i !== idx))}>✕</button>
                      </div>
                    </div>
                  ))}
                </div>
                <button className="clear-queue" onClick={() => setQueue([])}>Clear Queue</button>
              </section>
            )}
          </div>
        )}

        {/* Platforms Tab */}
        {activeTab === 'platforms' && (
          <div className="platforms-tab">
            <h3>🎧 Music Streaming Apps</h3>
            <div className="platforms-grid">
              {PLATFORMS.map(platform => (
                <a
                  key={platform.id}
                  href={platform.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="platform-card"
                >
                  <span className="platform-icon">{platform.icon}</span>
                  <span className="platform-name">{platform.name}</span>
                  <span className="external">↗</span>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Audio Player */}
      {currentTrack && (
        <div className="audio-player">
          {/* Invidious embed for ad-free playback */}
          <div className="player-embed">
            <iframe
              ref={(el) => {
                if (el && !playerRef.current) {
                  // Store reference
                  playerRef.current = el;
                }
              }}
              src={getEmbedUrl(currentTrack.videoId, currentTrack.isPlaylist)}
              title={currentTrack.title}
              allow="autoplay; encrypted-media"
              allowFullScreen
            />
          </div>

          {/* Player Bar */}
          <div className="player-bar">
            {/* Track Info */}
            <div className="player-track">
              <img src={currentTrack.thumbnail} alt="" className="player-thumb" />
              <div className="player-info">
                <span className="player-title">{currentTrack.title}</span>
                <span className="player-artist">{currentTrack.artist}</span>
              </div>
            </div>

            {/* Controls */}
            <div className="player-controls">
              <button 
                className={`fav-btn ${favorites.find(f => f.id === currentTrack.id) ? 'active' : ''}`}
                onClick={() => toggleFavorite(currentTrack)}
              >
                {favorites.find(f => f.id === currentTrack.id) ? '★' : '☆'}
              </button>
            </div>

            {/* Volume */}
            <div className="player-volume">
              <span className="vol-icon">{volume === 0 ? '🔇' : volume < 50 ? '🔉' : '🔊'}</span>
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={handleVolumeChange}
                className="volume-slider"
              />
              <span className="vol-value">{volume}%</span>
            </div>

            {/* Close */}
            <button className="close-btn" onClick={closePlayer}>✕</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default MusicSection;
