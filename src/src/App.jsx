
import React, { useState } from 'react';
import {
  Search, Play, Home, Library, History,
  UserCircle, X, Menu, Youtube, ListVideo,
  Radio, LoaderCircle, ArrowLeft
} from 'lucide-react';

const FILTERS = [
  { id: 'video', label: 'Videos' },
  { id: 'channel', label: 'Channels' },
  { id: 'playlist', label: 'Playlists' }
];

export default function App() {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('video');
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  async function searchVideos(e) {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError('');
    setResults([]);
    setSelected(null);

    try {
      const response = await fetch(
        `/api/search?q=${encodeURIComponent(query)}&type=${filter}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Search failed');
      }

      setResults(data.items || []);

      if (!data.items?.length) {
        setError('No results found. Try another search.');
      }
    } catch (err) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  function changeFilter(value) {
    setFilter(value);
    setResults([]);
    setSelected(null);
    setError('');
  }

  function openItem(item) {
    if (item.kind === 'video') {
      setSelected({
        type: 'video',
        id: item.videoId
      });
    } else if (item.kind === 'playlist') {
      setSelected({
        type: 'playlist',
        id: item.playlistId
      });
    } else if (item.channelId) {
      window.open(
        `https://www.youtube.com/channel/${item.channelId}`,
        '_blank',
        'noopener,noreferrer'
      );
    }
  }

  return (
    <div className="app">
      <header className="topbar">
        <button
          className="icon-btn"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <Menu />
        </button>

        <div className="brand">
          <span className="brand-icon">
            <Play size={20} fill="currentColor" />
          </span>
          <span>PROXY<span className="dot">.</span></span>
        </div>

        <div className="top-actions">
          <span className="desktop-tag">Discover everything</span>
          <UserCircle />
        </div>
      </header>

      <div className="layout">
        {menuOpen && (
          <div className="mobile-overlay"
            onClick={() => setMenuOpen(false)} />
        )}

        <aside className={`sidebar ${menuOpen ? 'show' : ''}`}>
          <button
            className="side-link active"
            onClick={() => {
              setSelected(null);
              setMenuOpen(false);
            }}
          >
            <Home /> Home
          </button>

          <button className="side-link"
            onClick={() => setMenuOpen(false)}>
            <Library /> Library
          </button>

          <button className="side-link"
            onClick={() => setMenuOpen(false)}>
            <History /> History
          </button>

          <div className="sidebar-bottom">
            <span>PROXY v1.0</span>
            <p>Learn. Watch. Explore.</p>
          </div>
        </aside>

        <main className="main-content">
          {selected ? (
            <section className="player-section">
              <button
                className="back-btn"
                onClick={() => setSelected(null)}
              >
                <ArrowLeft size={18} /> Back to results
              </button>

              <div className="video-frame">
                <iframe
                  key={selected.id}
                  src={
                    selected.type === 'video'
                      ? `https://www.youtube-nocookie.com/embed/${encodeURIComponent(selected.id)}?autoplay=1`
                      : `https://www.youtube-nocookie.com/embed/videoseries?list=${encodeURIComponent(selected.id)}`
                  }
                  title="PROXY video player"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  referrerPolicy="strict-origin-when-cross-origin"
                />
              </div>

              <h2>Now playing on PROXY</h2>
              <p>Enjoy your video inside the PROXY player.</p>
            </section>
          ) : (
            <>
              <section className="hero">
                <div className="hero-badge">
                  <Radio size={14} /> YOUR VIDEO DISCOVERY SPACE
                </div>

                <h1>
                  Discover <span>Everything.</span>
                </h1>

                <p>
                  Search videos, channels and playlists
                  in one place.
                </p>

                <form className="search-form"
                  onSubmit={searchVideos}>
                  <Search size={21} />

                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search videos, channels, playlists..."
                  />

                  {query && (
                    <button type="button"
                      className="clear-btn"
                      onClick={() => setQuery('')}>
                      <X size={18} />
                    </button>
                  )}

                  <button className="search-btn"
                    type="submit">
                    Search
                  </button>
                </form>

                <div className="filters">
                  {FILTERS.map(item => (
                    <button
                      key={item.id}
                      className={
                        filter === item.id ? 'filter active' : 'filter'
                      }
                      onClick={() => changeFilter(item.id)}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </section>

              <section className="results-section">
                <div className="section-heading">
                  <h2>
                    {results.length ? 'Search Results' : 'Explore PROXY'}
                  </h2>
                  <span>{results.length} results</span>
                </div>

                {loading && (
                  <div className="status">
                    <LoaderCircle className="spin" />
                    <p>Searching YouTube...</p>
                  </div>
                )}

                {error && !loading && (
                  <div className="status error">
                    {error}
                  </div>
                )}

                {!loading && !error && results.length === 0 && (
                  <div className="empty-state">
                    <div className="empty-icon">
                      <Search size={32} />
                    </div>
                    <h3>Start exploring</h3>
                    <p>
                      Search your favourite videos,
                      creators and playlists.
                    </p>
                  </div>
                )}

                <div className="results-grid">
                  {results.map((item, index) => (
                    <article className="result-card"
                      key={item.id || index}
                      onClick={() => openItem(item)}>

                      <div className="thumbnail">
                        <img
                          src={item.thumbnail}
                          alt={item.title}
                          loading="lazy"
                        />

                        <span className="type-label">
                          {item.kind === 'video'
                            ? <Play size={13} />
                            : item.kind === 'channel'
                              ? <UserCircle size={13} />
                              : <ListVideo size={13} />}
                          {item.kind}
                        </span>
                      </div>

                      <div className="card-info">
                        <h3>{item.title}</h3>
                        <p>{item.channelTitle || 'YouTube'}</p>
                        <span>{item.description}</span>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            </>
          )}
        </main>
      </div>

      <footer className="footer">
        <span>PROXY.</span>
        <span>Powered by YouTube Data API</span>
      </footer>
    </div>
  );
          }
      
