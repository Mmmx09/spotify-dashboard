import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Cell, RadarChart,
  PolarGrid, PolarAngleAxis, Radar, Legend
} from "recharts";
import { useState, useMemo } from "react";

const GREEN = "#1DB954";
const BLUE = "#38bdf8";
const ORANGE = "#fb923c";
const PURPLE = "#c084fc";

const RADAR_COLORS = ["#1DB954","#38bdf8","#fb923c","#c084fc","#f472b6","#a3e635","#facc15","#22d3ee"];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="custom-tooltip">
      <div className="label">{label}</div>
      {payload.map((p, i) => (
        <div className="row" key={i}>
          {p.name}: <span style={{ color: p.color }}>{typeof p.value === 'number' ? p.value.toFixed(3) : p.value}</span>
        </div>
      ))}
    </div>
  );
};

export default function Trends({ data }) {
  const { genre_stats, top8_genres } = data;

  // Build genre audio profile radar data
  const radarData = [
    { metric: "Dance", fullMark: 1 },
    { metric: "Energy", fullMark: 1 },
    { metric: "Mood", fullMark: 1 },
    { metric: "Acoustic", fullMark: 1 },
    { metric: "Tempo", fullMark: 1 },
  ].map((row) => {
    const obj = { ...row };
    top8_genres.forEach((g) => {
      obj[g.genre] = g[
        row.metric === "Dance" ? "avg_danceability"
        : row.metric === "Energy" ? "avg_energy"
        : row.metric === "Mood" ? "avg_valence"
        : row.metric === "Acoustic" ? "avg_acousticness"
        : "avg_tempo_norm"
      ];
    });
    return obj;
  });

  // Genre popularity sorted
  const genreByPop = [...genre_stats]
    .sort((a, b) => b.avg_popularity - a.avg_popularity)
    .slice(0, 20);

  // Danceability vs popularity
  const danceVsPop = [...genre_stats]
    .sort((a, b) => b.avg_danceability - a.avg_danceability)
    .slice(0, 20);

  const [selectedMetric, setSelectedMetric] = useState("avg_popularity");
  const metricOptions = [
    { value: "avg_popularity", label: "Avg Popularity", color: GREEN },
    { value: "avg_danceability", label: "Avg Danceability", color: BLUE },
    { value: "avg_energy", label: "Avg Energy", color: ORANGE },
    { value: "avg_valence", label: "Avg Mood (Valence)", color: PURPLE },
  ];
  const currentMetric = metricOptions.find(m => m.value === selectedMetric);

  const sortedByMetric = [...genre_stats]
    .sort((a, b) => b[selectedMetric] - a[selectedMetric])
    .slice(0, 20);

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Music <span>Through Genres</span></div>
        <div className="page-sub">How do different genres compare across key audio dimensions?</div>
      </div>

      {/* Metric selector */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-title">Explore by Metric</div>
        <div className="card-sub">Select a dimension to rank the top 20 genres</div>
        <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
          {metricOptions.map((m) => (
            <button
              key={m.value}
              onClick={() => setSelectedMetric(m.value)}
              style={{
                background: selectedMetric === m.value ? `${m.color}22` : "var(--surface2)",
                border: `1px solid ${selectedMetric === m.value ? m.color : "#333"}`,
                color: selectedMetric === m.value ? m.color : "#888",
                borderRadius: 8, padding: "6px 16px", cursor: "pointer",
                fontSize: 12, fontFamily: "DM Mono, monospace", transition: "all 0.2s"
              }}
            >
              {m.label}
            </button>
          ))}
        </div>
        <ResponsiveContainer width="100%" height={340}>
          <BarChart
            data={sortedByMetric}
            margin={{ left: 88, right: 20, top: 0, bottom: 0 }}
            layout="vertical"
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#252525" horizontal={false} />
            <XAxis type="number" tick={{ fill: "#888", fontSize: 10 }} axisLine={{ stroke: "#333" }} />
            <YAxis dataKey="genre" type="category" tick={{ fill: "#aaa", fontSize: 10 }} width={88} axisLine={false} tickLine={false} />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const d = payload[0]?.payload;
                return (
                  <div className="custom-tooltip">
                    <div className="label">{d.genre}</div>
                    <div className="row">{currentMetric.label}: <span style={{ color: currentMetric.color }}>{d[selectedMetric].toFixed(3)}</span></div>
                    <div className="row">Track count: <span>{d.track_count}</span></div>
                  </div>
                );
              }}
            />
            <Bar dataKey={selectedMetric} radius={[0, 4, 4, 0]} fill={currentMetric.color} opacity={0.85} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Radar + Insight */}
      <div className="grid-2">
        <div className="card">
          <div className="card-title">Genre Audio Fingerprint</div>
          <div className="card-sub">Radar comparison of top 8 genres across 5 audio dimensions</div>
          <ResponsiveContainer width="100%" height={340}>
            <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
              <PolarGrid stroke="#2a2a2a" />
              <PolarAngleAxis dataKey="metric" tick={{ fill: "#aaa", fontSize: 12 }} />
              {top8_genres.map((g, i) => (
                <Radar
                  key={g.genre}
                  name={g.genre}
                  dataKey={g.genre}
                  stroke={RADAR_COLORS[i]}
                  fill={RADAR_COLORS[i]}
                  fillOpacity={0.08}
                  strokeWidth={1.5}
                />
              ))}
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: 10, color: "#888" }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <div className="card-title">Popularity vs Danceability</div>
          <div className="card-sub">Does a danceable genre guarantee popularity?</div>
          <div style={{ fontSize: 10, color: "#777", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Top 10 by Popularity</div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={genreByPop.slice(0,10)} margin={{ left: 65, right: 10, top: 0, bottom: 0 }} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#252525" horizontal={false} />
              <XAxis type="number" tick={{ fill: "#888", fontSize: 9 }} axisLine={{ stroke: "#333" }} />
              <YAxis dataKey="genre" type="category" tick={{ fill: "#aaa", fontSize: 9 }} width={65} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="avg_popularity" fill={GREEN} radius={[0,4,4,0]} name="Avg Popularity" />
            </BarChart>
          </ResponsiveContainer>

          <div style={{ height: 20 }} />
          <div style={{ fontSize: 10, color: "#777", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Top 10 by Danceability</div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={danceVsPop} margin={{ left: 65, right: 10, top: 0, bottom: 0 }} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#252525" horizontal={false} />
              <XAxis type="number" domain={[0,1]} tick={{ fill: "#888", fontSize: 9 }} axisLine={{ stroke: "#333" }} />
              <YAxis dataKey="genre" type="category" tick={{ fill: "#aaa", fontSize: 9 }} width={65} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="avg_danceability" fill={BLUE} radius={[0,4,4,0]} name="Danceability" />
            </BarChart>
          </ResponsiveContainer>

          <div className="insight" style={{ marginTop: 12 }}>
            <strong>Insight:</strong> K-pop and pop-film genres dominate in average popularity,
            while dance/latin genres top danceability — suggesting that <strong>familiarity and
            mainstream appeal</strong> matter more than pure danceability for chart success.
          </div>
        </div>
      </div>

      {/* Summary stats table */}
      <div className="card">
        <div className="card-title">Genre Comparison Table</div>
        <div className="card-sub">All audio metrics averaged per genre (top 20 by popularity)</div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11, fontFamily: "DM Mono, monospace" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #2a2a2a" }}>
                {["Genre","Tracks","Popularity","Dance","Energy","Mood","Acousticness","Tempo"].map(h => (
                  <th key={h} style={{ padding: "10px 12px", textAlign: "left", color: "#909090", fontWeight: 400, textTransform: "uppercase", fontSize: 10, letterSpacing: "0.06em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {genreByPop.map((g, i) => (
                <tr key={g.genre} style={{ borderBottom: "1px solid #1e1e1e", background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.018)" }}>
                  <td style={{ padding: "9px 12px", color: GREEN }}>{g.genre}</td>
                  <td style={{ padding: "9px 12px", color: "#888" }}>{g.track_count}</td>
                  <td style={{ padding: "9px 12px", color: "#f2f2f2" }}>{g.avg_popularity.toFixed(1)}</td>
                  <td style={{ padding: "9px 12px", color: "#f2f2f2" }}>{g.avg_danceability.toFixed(2)}</td>
                  <td style={{ padding: "9px 12px", color: "#f2f2f2" }}>{g.avg_energy.toFixed(2)}</td>
                  <td style={{ padding: "9px 12px", color: "#f2f2f2" }}>{g.avg_valence.toFixed(2)}</td>
                  <td style={{ padding: "9px 12px", color: "#f2f2f2" }}>{g.avg_acousticness.toFixed(2)}</td>
                  <td style={{ padding: "9px 12px", color: "#f2f2f2" }}>{g.avg_tempo.toFixed(0)} BPM</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
