import React from 'react';

export default function Topbar({ query, setQuery, level, setLevel, onGenerate, exportSVG, rootData }) {
  return (
    <div className="topbar">
      <div className="title">
        <input className="topic-input" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Enter topic (e.g. Web Development)" />
        <select className="level-select" value={level} onChange={(e) => setLevel(e.target.value)}>
          <option>Beginner</option>
          <option>Intermediate</option>
          <option>Advanced</option>
        </select>
        <button className="generate-btn" onClick={onGenerate}>Generate Learning Map</button>
      </div>
      <div className="top-controls">
        <button className="export-small" onClick={exportSVG}>Export SVG</button>
        <button className="export-small" onClick={() => {
          const j = JSON.stringify(rootData, null, 2);
          const blob = new Blob([j], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'learning-map.json';
          document.body.appendChild(a);
          a.click();
          a.remove();
          URL.revokeObjectURL(url);
        }}>Export JSON</button>
      </div>
    </div>
  );
}
