import React, { useRef, useState } from 'react';

export default function Minimap({ nodesLayout = [], diagramToMini = () => ({ x: 0, y: 0 }), minimapSize = { w: 180, h: 120 }, onSelectDiagramPoint }) {
  const svgRef = useRef(null);
  const draggingRef = useRef(false);
  const [isDragging, setIsDragging] = useState(false);

  const emitRatio = (clientX, clientY) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const cx = Math.max(0, Math.min(rect.width, clientX - rect.left));
    const cy = Math.max(0, Math.min(rect.height, clientY - rect.top));
    const ratioX = cx / rect.width;
    const ratioY = cy / rect.height;
    if (typeof onSelectDiagramPoint === 'function') onSelectDiagramPoint(ratioX, ratioY);
  };

  const onMouseDown = (e) => {
    draggingRef.current = true;
    setIsDragging(true);
    emitRatio(e.clientX, e.clientY);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const onMouseMove = (e) => {
    if (!draggingRef.current) return;
    emitRatio(e.clientX, e.clientY);
  };

  const onMouseUp = () => {
    draggingRef.current = false;
    setIsDragging(false);
    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('mouseup', onMouseUp);
  };

  return (
    <div className="minimap" aria-hidden={false}>
      <svg
        ref={svgRef}
        className="minimap-svg"
        width={minimapSize.w}
        height={minimapSize.h}
        onMouseDown={onMouseDown}
        onClick={(e) => emitRatio(e.clientX, e.clientY)}
      >
        <rect width="100%" height="100%" fill="#f6f8fa" rx="8" />
        {nodesLayout.map((n) => {
          const p = diagramToMini(n.x, n.y);
          return (
            <g key={n.id}>
              <circle cx={p.x} cy={p.y} r={3} fill="#2f3a49" />
            </g>
          );
        })}
        {/* Lightweight minimap: the viewport rectangle can be added later */}
      </svg>
    </div>
  );
}
