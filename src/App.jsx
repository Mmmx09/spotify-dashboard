import { useState, useEffect } from "react";
import Overview from "./pages/Overview";
import Trends from "./pages/Trends";
import ArtistBattle from "./pages/ArtistBattle";
import "./App.css";

export default function App() {
  const [page, setPage] = useState("overview");
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch("/spotify_data.json")
      .then((r) => r.json())
      .then(setData);
  }, []);

  const tabs = [
    { id: "overview", label: "The Big Picture", icon: "◈" },
    { id: "trends", label: "Music Through Time", icon: "◎" },
    { id: "artist", label: "Artist Battle", icon: "⚔" },
  ];

  return (
    <div className="app">
      <header className="header">
        <div className="header-inner">
          <div className="logo">
            <span className="logo-icon">♫</span>
            <div>
              <div className="logo-title">WHAT MAKES A HIT?</div>
              <div className="logo-sub">Spotify Music Analytics · 89,740 Tracks · 114 Genres</div>
            </div>
          </div>
          <nav className="tabs">
            {tabs.map((t) => (
              <button
                key={t.id}
                className={"tab" + (page === t.id ? " active" : "")}
                onClick={() => setPage(t.id)}
              >
                <span className="tab-icon">{t.icon}</span>
                {t.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="main">
        {!data ? (
          <div className="loading">
            <div className="loading-pulse">♫</div>
            <p>Loading data…</p>
          </div>
        ) : page === "overview" ? (
          <Overview data={data} />
        ) : page === "trends" ? (
          <Trends data={data} />
        ) : (
          <ArtistBattle data={data} />
        )}
      </main>

      <footer className="footer">
        <span>Data source: Spotify Tracks Dataset · Kaggle</span>
        <span>Star Schema: fact_tracks · dim_genre · dim_artist · dim_album</span>
      </footer>
    </div>
  );
}
