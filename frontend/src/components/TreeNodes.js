import React from 'react';

function TreeNodes({ node, x = 0, y = 0, depth = 0, collapsed = {}, onToggle, showTooltips, onSelect, onHover, onLeave, onMove }) {
  const nodeWidth = 120;
  const nodeHeight = 34;
  const gapY = 90;
  const childXOffset = 220;

  return (
    <g>
      <g
        transform={`translate(${x},${y})`}
        onClick={(e) => { e.stopPropagation(); onSelect && onSelect(node); }}
        onMouseEnter={(e) => { onHover && onHover(node, e); }}
        onMouseLeave={(e) => { onLeave && onLeave(node, e); }}
        onMouseMove={(e) => { onMove && onMove(node, e); }}
        style={{ cursor: 'pointer' }}
      >
        <rect className="node-rect" x={-nodeWidth / 2} y={-nodeHeight / 2} rx="18" ry="18" width={nodeWidth} height={nodeHeight} />
        <text className="node-text" x="0" y="6" textAnchor="middle">{node.label}</text>
        {showTooltips && (
          <title>{node.label}</title>
        )}
        {node.children && node.children.length > 0 && (
          <g className="collapse-handle" onClick={(e) => { e.stopPropagation(); onToggle(node.id); }}>
            <rect x={nodeWidth / 2 - 14} y={-nodeHeight / 2} width="28" height="28" rx="8" className="icon-bg" />
            <text x={nodeWidth / 2} y={6} textAnchor="middle" className="icon-plus">{collapsed[node.id] ? '+' : '-'}</text>
          </g>
        )}
      </g>

      {node.children && !collapsed[node.id] && node.children.map((child, idx) => {
        const childX = x + childXOffset;
        const childY = y + (idx - (node.children.length - 1) / 2) * gapY;
        const path = `M ${x + nodeWidth / 2} ${y} C ${x + nodeWidth / 2 + 40} ${y} ${childX - 60} ${childY} ${childX - nodeWidth / 2} ${childY}`;
        return (
          <g key={child.id}>
            <path d={path} fill="none" stroke="#e0e6ea" strokeWidth="2" />
            <TreeNodes node={child} x={childX} y={childY} depth={depth + 1} collapsed={collapsed} onToggle={onToggle} showTooltips={showTooltips} onSelect={onSelect} />
          </g>
        );
      })}
    </g>
  );
}

export default TreeNodes;
// End TreeNodes