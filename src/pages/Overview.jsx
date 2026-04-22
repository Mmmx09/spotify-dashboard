import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ScatterChart, Scatter, Cell, PieChart, Pie, Legend
} from "recharts";
import { useState } from "react";

const GREEN = "#1DB954";
const COLORS = ["#1DB954","#4ade80","#22c55e","#16a34a","#15803d","#86efac","#bbf7d0","#a3e635","#84cc16","#65a30d","#facc15","#fb923c","#f87171","#c084fc","#818cf8","#38bdf8","#22d3ee","#f472b6","#e879f9","#a78bfa"];

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  if (!d) return null;
  return (
    <div className="custom-tooltip">
      <div className="label">{d.track_name || d.genre}</div>
      {d.artists && <div className="row">Artist: <span>{d.artists}</span></div>}
      {d.popularity !== undefined && <div className="row">Popularity: <span>{d.popularity}</span></div>}
      {d.danceability !== undefined && <div className="row">Dance: <span>{(d.danceability * 100).toFixed(0)}%</span></div>}
      {d.energy !== undefined && <div className="row">Energy: <span>{(d.energy * 100).toFixed(0)}%</span></div>}
      {d.valence !== undefined && <div className="row">Mood: <span>{(d.valence * 100).toFixed(0)}%</span></div>}
      {d.track_genre && <div className="row">Genre: <span>{d.track_genre}</span></div>}
      {d.track_count && <div className="row">Tracks: <span>{d.track_count}</span></div>}
    </div>
  );
};

const ScatterTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  return (
    <div className="custom-tooltip">
      <div className="label">{d.track_name}</div>
      <div className="row">Artist: <span>{d.artists}</span></div>
      <div className="row">Energy: <span>{(d.energy*100).toFixed(0)}%</span></div>
      <div className="row">Danceability: <span>{(d.danceability*100).toFixed(0)}%</span></div>
      <div className="row">Popularity: <span>{d.popularity}</span></div>
    </div>
  );
};

export default function Overview({ data }) {
  const { kpi, top_tracks, top_genres, scatter } = data;
  const [selectedGenre, setSelectedGenre] = useState(null);

  const filteredScatter = selectedGenre
    ? scatter.filter((d) => d.track_genre === selectedGenre)
    : scatter;

  const genreColors = {};
  top_genres.forEach((g, i) => { genreColors[g.genre] = COLORS[i % COLORS.length]; });

  return (
    <div>
      <div className="page-header">
        <div className="page-title">The <span>Big Picture</span></div>
        <div className="page-sub">What does the landscape of popular music look like?</div>
      </div>

      {/* KPIs */}
      <div className="kpi-row">
        <div className="kpi-card">
          <div className="kpi-label">Total Tracks</div>
          <div className="kpi-value">{kpi.total_tracks.toLocaleString()}</div>
          <div className="kpi-desc">deduplicated songs</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Artists</div>
          <div className="kpi-value">{kpi.total_artists.toLocaleString()}</div>
          <div className="kpi-desc">primary artists</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Genres</div>
          <div className="kpi-value">{kpi.total_genres}</div>
          <div className="kpi-desc">from acoustic to grindcore</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Avg Popularity</div>
          <div className="kpi-value">{kpi.avg_popularity}</div>
          <div className="kpi-desc">out of 100</div>
        </div>
      </div>

      {/* Top tracks + Genre bar */}
      <div className="grid-2" style={{ gridTemplateColumns: "5fr 7fr" }}>
        <div className="card">
          <div className="card-title">Top 15 Tracks by Popularity</div>
          <div className="card-sub">Ranked by Spotify popularity score</div>
          <div className="track-list">
            {top_tracks.slice(0, 15).map((t, i) => (
              <div className="track-item" key={i}>
                <div className={"track-rank" + (i < 3 ? " top3" : "")}>{i + 1}</div>
                <div className="track-info">
                  <div className="track-name">{t.track_name}</div>
                  <div className="track-artist">{t.artists}</div>
                </div>
                <div className="track-genre">{t.track_genre}</div>
                <div className="track-pop">{t.popularity}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-title">Genre Distribution</div>
          <div className="card-sub">Top 20 genres by track count · click to filter scatter</div>
          <ResponsiveContainer width="100%" height={380}>
            <BarChart
              data={top_genres}
              layout="vertical"
              margin={{ left: 88, right: 20, top: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#252525" horizontal={false} />
              <XAxis type="number" tick={{ fill: "#888", fontSize: 10 }} axisLine={{ stroke: "#333" }} />
              <YAxis
                dataKey="genre" type="category"
                tick={{ fill: "#aaa", fontSize: 10 }}
                width={88}
                axisLine={false} tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="track_count" radius={[0, 4, 4, 0]}>
                {top_genres.map((_, i) => (
                  <Cell
                    key={i}
                    fill={selectedGenre === top_genres[i].genre ? GREEN : COLORS[i % COLORS.length]}
                    cursor="pointer"
                    onClick={() => setSelectedGenre(
                      selectedGenre === top_genres[i].genre ? null : top_genres[i].genre
                    )}
                    opacity={selectedGenre && selectedGenre !== top_genres[i].genre ? 0.3 : 1}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          {selectedGenre && (
            <div style={{ textAlign: "center", marginTop: 8 }}>
              <button
                onClick={() => setSelectedGenre(null)}
                style={{ background: "rgba(29,185,84,0.15)", border: "1px solid rgba(29,185,84,0.3)", color: GREEN, borderRadius: 6, padding: "4px 12px", cursor: "pointer", fontSize: 11, fontFamily: "DM Mono, monospace" }}
              >
                ✕ Clear filter: {selectedGenre}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Scatter */}
      <div className="card">
        <div className="card-title">Energy vs Danceability</div>
        <div className="card-sub">
          Each dot = a track · dot size = popularity · color = genre ·
          {selectedGenre ? ` filtered: ${selectedGenre}` : " showing 3,000 tracks (popularity ≥ 20)"}
        </div>
        <ResponsiveContainer width="100%" height={400}>
          <ScatterChart margin={{ top: 20, right: 20, bottom: 30, left: 30 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#252525" />
            <XAxis
              dataKey="energy" type="number" domain={[0, 1]} name="Energy"
              tick={{ fill: "#888", fontSize: 10 }} axisLine={{ stroke: "#333" }}
              label={{ value: "Energy →", position: "insideBottomRight", fill: "#777", fontSize: 11, dy: 20 }}
            />
            <YAxis
              dataKey="danceability" type="number" domain={[0, 1]} name="Danceability"
              tick={{ fill: "#888", fontSize: 10 }} axisLine={{ stroke: "#333" }}
              label={{ value: "← Danceability", angle: -90, position: "insideLeft", fill: "#777", fontSize: 11, dx: -18 }}
            />
            <Tooltip content={<ScatterTooltip />} />
            <Scatter data={filteredScatter}>
              {filteredScatter.map((d, i) => (
                <Cell
                  key={i}
                  fill={genreColors[d.track_genre] || GREEN}
                  opacity={0.55}
                  r={Math.max(2, d.popularity / 25)}
                />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
        <div className="insight">
          <strong>Key insight:</strong> High-popularity tracks (large dots) tend to cluster in the top-right quadrant —
          combining <strong>high energy</strong> and <strong>high danceability</strong>. Low-energy, acoustic tracks
          rarely break through the popularity ceiling.
        </div>
      </div>
    </div>
  );
}
