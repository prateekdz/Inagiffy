import React from 'react';

export default function DetailsPanel({ selectedNode, exploreNode, onClose }) {
  if (!selectedNode) return null;
  return (
    <div className="details-panel">
      <h3>{selectedNode.label}</h3>
      {selectedNode.description && <p>{selectedNode.description}</p>}
      {selectedNode.resources && (
        <div>
          <h4>Resources</h4>
          <ul>
            {selectedNode.resources.map((r, i) => (
              <li key={i}><a href={r.url} target="_blank" rel="noreferrer">{r.title}</a></li>
            ))}
          </ul>
        </div>
      )}
      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
        <button className="btn btn-primary" onClick={() => exploreNode(selectedNode.id)}>Explore deeper</button>
        <button className="btn btn-secondary" onClick={onClose}>Close</button>
      </div>
    </div>
  );
}
