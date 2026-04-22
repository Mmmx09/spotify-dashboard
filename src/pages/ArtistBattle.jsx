import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar,
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Cell, Legend
} from "recharts";
import { useState, useMemo } from "react";

const GREEN = "#1DB954";
const BLUE = "#38bdf8";

function ArtistSelector({ label, artists, value, onChange, color }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const filtered = query.length >= 1
    ? artists.filter((a) => a.primary_artist.toLowerCase().includes(query.toLowerCase())).slice(0, 10)
    : [];

  return (
    <div className="artist-select-box" style={{ borderColor: value ? `${color}44` : undefined }}>
      <div className="artist-select-label" style={{ color }}>{label}</div>
      <div className="dropdown">
        <input
          className="artist-select-input"
          placeholder="Search artist…"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          style={{ borderColor: value ? `${color}55` : undefined }}
        />
        {open && filtered.length > 0 && (
          <div className="dropdown-list">
            {filtered.map((a) => (
              <div
                key={a.primary_artist}
                className="dropdown-item"
                onMouseDown={() => { onChange(a); setQuery(a.primary_artist); setOpen(false); }}
              >
                {a.primary_artist}
                <span style={{ color: "#555", marginLeft: 8, fontSize: 10 }}>
                  pop {a.avg_popularity.toFixed(0)} · {a.track_count} tracks
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
      {value && (
        <>
          <div className="artist-name-display" style={{ color }}>{value.primary_artist}</div>
          <div className="artist-meta">
            {value.track_count} tracks · Avg popularity: {value.avg_popularity.toFixed(0)} · Top: "{value.top_track}"
          </div>
        </>
      )}
    </div>
  );
}

function similarity(a, b) {
  const dims = ["avg_danceability","avg_energy","avg_valence","avg_acousticness","avg_instrumentalness"];
  // Normalize tempo to 0-1 (60-200 BPM range)
  const aVec = [...dims.map(d => a[d]), Math.max(0, Math.min(1, (a.avg_tempo - 60) / 140))];
  const bVec = [...dims.map(d => b[d]), Math.max(0, Math.min(1, (b.avg_tempo - 60) / 140))];
  const dot = aVec.reduce((s, v, i) => s + v * bVec[i], 0);
  const magA = Math.sqrt(aVec.reduce((s, v) => s + v * v, 0));
  const magB = Math.sqrt(bVec.reduce((s, v) => s + v * v, 0));
  return magA && magB ? dot / (magA * magB) : 0;
}

const DIMS = [
  { key: "avg_danceability", label: "Danceability" },
  { key: "avg_energy", label: "Energy" },
  { key: "avg_valence", label: "Mood" },
  { key: "avg_acousticness", label: "Acoustic" },
  { key: "avg_instrumentalness", label: "Instrumental" },
];

export default function ArtistBattle({ data }) {
  const { artist_stats, top_tracks } = data;
  const [artistA, setArtistA] = useState(null);
  const [artistB, setArtistB] = useState(null);

  // Defaults on first render
  useMemo(() => {
    if (!artistA && artist_stats.length) setArtistA(artist_stats[0]);
    if (!artistB && artist_stats.length) setArtistB(artist_stats[1]);
  }, [artist_stats]);

  const radarData = DIMS.map(({ key, label }) => ({
    metric: label,
    [artistA?.primary_artist || "A"]: artistA ? artistA[key] : 0,
    [artistB?.primary_artist || "B"]: artistB ? artistB[key] : 0,
  }));

  const barData = DIMS.map(({ key, label }) => ({
    name: label,
    [artistA?.primary_artist || "A"]: artistA ? +(artistA[key] * 100).toFixed(1) : 0,
    [artistB?.primary_artist || "B"]: artistB ? +(artistB[key] * 100).toFixed(1) : 0,
  }));

  const sim = artistA && artistB ? similarity(artistA, artistB) : null;
  const simPct = sim !== null ? Math.round(sim * 100) : null;

  const simDescription = simPct !== null
    ? simPct >= 85 ? "Nearly identical sonic profiles"
    : simPct >= 70 ? "Very similar sound and style"
    : simPct >= 55 ? "Some shared characteristics"
    : "Quite different musical styles"
    : "";

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="custom-tooltip">
        <div className="label">{label}</div>
        {payload.map((p, i) => (
          <div className="row" key={i}>
            {p.name}: <span style={{ color: p.color }}>{p.value}%</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Artist <span>Battle</span></div>
        <div className="page-sub">Compare the audio DNA of any two artists in the dataset</div>
      </div>

      {/* Selectors */}
      <div className="battle-selectors">
        <ArtistSelector
          label="Artist A"
          artists={artist_stats}
          value={artistA}
          onChange={setArtistA}
          color={GREEN}
        />
        <div>
          <div className="vs-badge">VS</div>
          {simPct !== null && (
            <div style={{ textAlign: "center", marginTop: 12 }}>
              <div style={{ fontSize: 11, color: "#666", marginBottom: 6 }}>Similarity</div>
              <div style={{
                fontFamily: "Syne, sans-serif", fontWeight: 800,
                fontSize: 28, color: simPct >= 70 ? GREEN : simPct >= 50 ? "#facc15" : "#f87171"
              }}>
                {simPct}%
              </div>
              <div style={{ fontSize: 10, color: "#666", marginTop: 4, maxWidth: 90, textAlign: "center" }}>
                {simDescription}
              </div>
              <div className="similarity-bar" style={{ marginTop: 10, width: 90 }}>
                <div className="similarity-fill" style={{ width: `${simPct}%` }} />
              </div>
            </div>
          )}
        </div>
        <ArtistSelector
          label="Artist B"
          artists={artist_stats}
          value={artistB}
          onChange={setArtistB}
          color={BLUE}
        />
      </div>

      {artistA && artistB && (
        <>
          {/* Radar + Bar */}
          <div className="grid-2">
            <div className="card">
              <div className="card-title">Audio DNA Radar</div>
              <div className="card-sub">5 audio dimensions compared head-to-head</div>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
                  <PolarGrid stroke="#2a2a2a" />
                  <PolarAngleAxis dataKey="metric" tick={{ fill: "#aaa", fontSize: 12 }} />
                  <Radar
                    name={artistA.primary_artist}
                    dataKey={artistA.primary_artist}
                    stroke={GREEN} fill={GREEN} fillOpacity={0.15} strokeWidth={2}
                  />
                  <Radar
                    name={artistB.primary_artist}
                    dataKey={artistB.primary_artist}
                    stroke={BLUE} fill={BLUE} fillOpacity={0.15} strokeWidth={2}
                  />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, color: "#888" }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            <div className="card">
              <div className="card-title">Side-by-Side Metrics</div>
              <div className="card-sub">Percentage score per audio dimension</div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={barData} margin={{ left: 0, right: 10, top: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#252525" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: "#aaa", fontSize: 10 }} axisLine={{ stroke: "#333" }} />
                  <YAxis tick={{ fill: "#888", fontSize: 10 }} domain={[0, 100]} unit="%" axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey={artistA.primary_artist} fill={GREEN} radius={[4,4,0,0]} />
                  <Bar dataKey={artistB.primary_artist} fill={BLUE} radius={[4,4,0,0]} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, color: "#888" }} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Stats comparison */}
          <div className="card">
            <div className="card-title">Stats Summary</div>
            <div className="card-sub">Key metrics at a glance</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 16, alignItems: "start" }}>
              {/* Artist A stats */}
              <div>
                <div style={{ color: GREEN, fontFamily: "Syne, sans-serif", fontWeight: 700, marginBottom: 12 }}>
                  {artistA.primary_artist}
                </div>
                {[
                  ["Avg Popularity", artistA.avg_popularity.toFixed(1)],
                  ["Tracks in dataset", artistA.track_count],
                  ["Top Track", artistA.top_track],
                  ["Top Track Popularity", artistA.top_track_popularity],
                  ["Avg Tempo", `${artistA.avg_tempo.toFixed(0)} BPM`],
                  ["Avg Mood (Valence)", `${(artistA.avg_valence * 100).toFixed(0)}%`],
                ].map(([k, v]) => (
                  <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "9px 0", borderBottom: "1px solid #1e1e1e", fontSize: 12 }}>
                    <span style={{ color: "#909090" }}>{k}</span>
                    <span style={{ color: "#f2f2f2", maxWidth: 160, textAlign: "right", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{v}</span>
                  </div>
                ))}
              </div>

              {/* Center divider */}
              <div style={{ width: 1, background: "#2a2a2a", alignSelf: "stretch", margin: "0 4px" }} />

              {/* Artist B stats */}
              <div>
                <div style={{ color: BLUE, fontFamily: "Syne, sans-serif", fontWeight: 700, marginBottom: 12 }}>
                  {artistB.primary_artist}
                </div>
                {[
                  ["Avg Popularity", artistB.avg_popularity.toFixed(1)],
                  ["Tracks in dataset", artistB.track_count],
                  ["Top Track", artistB.top_track],
                  ["Top Track Popularity", artistB.top_track_popularity],
                  ["Avg Tempo", `${artistB.avg_tempo.toFixed(0)} BPM`],
                  ["Avg Mood (Valence)", `${(artistB.avg_valence * 100).toFixed(0)}%`],
                ].map(([k, v]) => (
                  <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "9px 0", borderBottom: "1px solid #1e1e1e", fontSize: 12 }}>
                    <span style={{ color: "#909090" }}>{k}</span>
                    <span style={{ color: "#f2f2f2", maxWidth: 160, textAlign: "right", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="insight" style={{ marginTop: 20 }}>
              <strong>{artistA.primary_artist}</strong> vs <strong style={{ color: BLUE }}>{artistB.primary_artist}</strong>:
              {" "}Sonic similarity score is <strong>{simPct}%</strong> — {simDescription.toLowerCase()}.
              {artistA.avg_popularity > artistB.avg_popularity
                ? ` ${artistA.primary_artist} leads in average popularity (${artistA.avg_popularity.toFixed(0)} vs ${artistB.avg_popularity.toFixed(0)}).`
                : ` ${artistB.primary_artist} leads in average popularity (${artistB.avg_popularity.toFixed(0)} vs ${artistA.avg_popularity.toFixed(0)}).`
              }
            </div>
          </div>
        </>
      )}

      {!artistA && !artistB && (
        <div style={{ textAlign: "center", padding: "60px 0", color: "#444" }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>⚔</div>
          <div style={{ fontFamily: "Syne, sans-serif", fontSize: 18 }}>Search two artists to begin</div>
        </div>
      )}
    </div>
  );
}
