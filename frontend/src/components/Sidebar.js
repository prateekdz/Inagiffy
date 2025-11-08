import React from 'react';
import Icon from './Icons';


export default function Sidebar({
  zoomIn,
  zoomOut,
  scale,
  minimapComponent,
  showTooltips,
  setShowTooltips,
  levelFilter,
  setLevelFilter,
  exportSVG,
  exportPNG,
  expandCollapseChecked = false,
  onToggleExpandCollapse = () => {}
}) {
  return (
    <aside className="sidebar">
      <div className="controls">
        <div className="zoom">
          <button title="Zoom out" onClick={zoomOut}><Icon name="zoom-out" /></button>
          <div className="zoom-level">{Math.round(scale * 100)}%</div>
          <button title="Zoom in" onClick={zoomIn}><Icon name="zoom-in" /></button>
        </div>

        {minimapComponent}

        <div className="toggles">
          <label className="toggle-row">
            <input type="checkbox" checked={showTooltips} onChange={(e) => setShowTooltips(e.target.checked)} /> Tooltips
          </label>
          <label className="toggle-row">
            <input type="checkbox" checked={!!expandCollapseChecked} onChange={(e) => onToggleExpandCollapse(e.target.checked)} /> Expand/Collapse
          </label>
        </div>

        <div className="selectors">
          <select value="Expand Filter" disabled>
            <option>Expand Filter</option>
          </select>
          <select value={levelFilter} onChange={(e) => setLevelFilter(e.target.value)}>
            <option value="all">Level Filter</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
          </select>
        </div>
      </div>

      <div className="export-area">
        <button className="export-btn" onClick={exportSVG}>Export SVG</button>
        <button className="export-btn small" style={{ marginTop: 8 }} onClick={exportPNG}>Export PNG</button>
      </div>
    </aside>
  );
}
