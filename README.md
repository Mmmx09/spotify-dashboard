# 🎵 What Makes a Hit? — Spotify Music Analytics Dashboard

> An interactive data visualization dashboard analyzing 89,740 Spotify tracks across 114 genres and 17,648 artists.

**Live Demo:** [spotify-dashboard-rho.vercel.app](https://spotify-dashboard-rho.vercel.app)

---

## Project Overview

This dashboard explores the question: **what makes a song popular?** Using Spotify's audio feature data, it visualizes relationships between musical attributes (energy, danceability, valence, tempo, acousticness) and popularity scores — revealing patterns across genres and artists.

Built as a personal portfolio project for the Power BI & Data Visualization course at em lyon business school.

---

## Star Schema (Data Model)

The data is structured as a star schema with one fact table and three dimension tables:

```
                    ┌─────────────────┐
                    │   fact_tracks   │
                    │─────────────────│
                    │ track_id (PK)   │
                    │ popularity      │
                    │ danceability    │
                    │ energy          │
                    │ valence         │
                    │ tempo           │
                    │ acousticness    │
                    │ instrumentalness│
                    │ speechiness     │
                    │ liveness        │
                    │ loudness        │
                    │ duration_ms     │
                    │ explicit        │
                    └────────┬────────┘
                             │
          ┌──────────────────┼──────────────────┐
          │                  │                  │
  ┌───────▼──────┐  ┌────────▼──────┐  ┌───────▼──────┐
  │  dim_genre   │  │  dim_artist   │  │  dim_album   │
  │──────────────│  │───────────────│  │──────────────│
  │ genre (PK)   │  │ artist_id(PK) │  │ album_id(PK) │
  │ avg_popularity│  │ primary_artist│  │ album_name   │
  │ avg_energy   │  │ track_count   │  │ track_name   │
  │ avg_dance    │  │ avg_popularity│  │ artists      │
  │ avg_valence  │  │ top_track     │  └──────────────┘
  │ avg_tempo    │  │ avg_danceabil.│
  │ track_count  │  │ avg_energy    │
  └──────────────┘  └───────────────┘
```

---

## Dashboard Pages

### Page 1 — The Big Picture
- **KPI cards**: total tracks, artists, genres, average popularity
- **Top 15 tracks** ranked by popularity score
- **Genre distribution** bar chart (interactive — click to filter scatter plot)
- **Energy vs Danceability scatter plot**: 3,000 tracks plotted, dot size = popularity, color = genre

### Page 2 — Music Through Genres
- **Metric explorer**: rank top 20 genres by popularity / danceability / energy / mood
- **Audio fingerprint radar chart**: compare 8 genres across 5 audio dimensions simultaneously
- **Full genre comparison table**: all metrics averaged per genre

### Page 3 — Artist Battle
- **Search & compare** any two artists in the dataset
- **Radar chart**: side-by-side audio DNA comparison
- **Bar chart**: percentage score per audio dimension
- **Cosine similarity score**: quantified musical similarity between the two artists

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite |
| Charts | Recharts |
| Styling | Custom CSS (Syne + DM Mono fonts) |
| Data processing | Python (pandas) |
| Deployment | Vercel |

---

## Project Structure

```
spotify-dashboard/
├── public/
│   └── spotify_data.json      # Processed star schema data (721KB)
├── src/
│   ├── App.jsx                # Root component + tab navigation
│   ├── App.css                # Global styles & design system
│   └── pages/
│       ├── Overview.jsx       # Page 1: The Big Picture
│       ├── Trends.jsx         # Page 2: Music Through Genres
│       └── ArtistBattle.jsx   # Page 3: Artist Battle
├── vercel.json                # SPA routing config
└── vite.config.js
```

---

## Data Source

- **Dataset**: [Spotify Tracks Dataset](https://www.kaggle.com/datasets/maharshipandya/-spotify-tracks-dataset) — Kaggle
- **Raw data**: 114,000 rows × 21 columns
- **After deduplication**: 89,740 unique tracks
- **Processing**: Python/pandas — deduplication by track_id, aggregation into star schema tables, export to JSON

---

## Run Locally

```bash
git clone https://github.com/Mmmx09/spotify-dashboard.git
cd spotify-dashboard
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## Key Insights

- High-popularity tracks cluster in the **high energy + high danceability** quadrant
- **K-pop** and **pop-film** genres lead in average popularity despite not topping danceability
- Music mood (valence) and acoustic scores vary dramatically across genres
- Artist sonic similarity can be quantified via cosine distance across 6 audio dimensions
