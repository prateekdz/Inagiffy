import React, { useMemo, useState, useRef, useCallback } from 'react';
import './App.css';

// Top-level UI components (split out for readability)
import Topbar from './components/Topbar';
import Sidebar from './components/Sidebar';
import Minimap from './components/Minimap';
import TreeNodes from './components/TreeNodes';
import DetailsPanel from './components/DetailsPanel';

// --- App constants ---
const VIEWBOX = { width: 1000, height: 700 };
const DEFAULT_PAN = { x: 160, y: 350 };


// Simple mindmap data
const initialData = {
  id: 'root',
  label: 'MindMap',
  children: [
    {
      id: 'a',
      label: 'Tooltips',
      children: [
        { id: 'a1', label: 'Tip 1' },
        { id: 'a2', label: 'Tip 2' }
      ]
    },
    {
      id: 'b',
      label: 'Expand/Collapse',
      children: [
        { id: 'b1', label: 'Child 1' },
        { id: 'b2', label: 'Child 2', children: [{ id: 'b2a', label: 'Leaf' }] }
      ]
    },
    {
      id: 'c',
      label: 'Expand/Collapse',
      children: [
        { id: 'c1', label: 'Item A' },
        { id: 'c2', label: 'Item B' }
      ]
    }
  ]
};

function App() {
  // rootData holds the current generated roadmap
  // const [data] = useState(initialData);
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState(DEFAULT_PAN);
  const [collapsed, setCollapsed] = useState({});
  const [showTooltips, setShowTooltips] = useState(true);
  const [allCollapsed, setAllCollapsed] = useState(false);
  // tooltip: visible state + position + content
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, content: '' });

  const showTooltip = useCallback((node, e) => {
    if (!showTooltips) return;
    const padding = 12; // offset the tooltip from cursor
    setTooltip({ visible: true, x: e.clientX + padding, y: e.clientY + padding, content: node.description || node.label });
  }, [showTooltips]);

  const moveTooltip = useCallback((node, e) => {
    if (!showTooltips) return;
    setTooltip((t) => ({ ...t, x: e.clientX + 12, y: e.clientY + 12 }));
  }, [showTooltips]);

  const hideTooltip = useCallback(() => {
    setTooltip((t) => ({ ...t, visible: false }));
  }, []);
  const [levelFilter, setLevelFilter] = useState('all');
  const [query, setQuery] = useState('Web Development');
  const [level, setLevel] = useState('Beginner');
  const [selectedNode, setSelectedNode] = useState(null);
  const [rootData, setRootData] = useState(initialData);
  const svgRef = useRef();
  const draggingRef = useRef(null);

  // Toggle collapsed state for an id
  const toggle = useCallback((id) => {
    setCollapsed((s) => ({ ...s, [id]: !s[id] }));
  }, []);

  // Collapse all nodes (except root) by collecting ids from the tree
  const collapseAll = useCallback(() => {
    const ids = {};
    const walk = (n) => {
      if (!n || !n.children) return;
      n.children.forEach((c) => {
        ids[c.id] = true;
        walk(c);
      });
    };
    walk(rootData);
    setCollapsed(ids);
    setAllCollapsed(true);
  }, [rootData]);

  const expandAll = useCallback(() => {
    setCollapsed({});
    setAllCollapsed(false);
  }, []);

  const zoomIn = () => setScale((s) => Math.min(2.2, +(s + 0.1).toFixed(2)));
  const zoomOut = () => setScale((s) => Math.max(0.5, +(s - 0.1).toFixed(2)));

  const layout = useCallback((root) => {
    const gapY = 90;
    const childXOffset = 220;
    const result = [];

    function walk(node, x, y) {
      result.push({ id: node.id, label: node.label, x, y });
      if (node.children && !collapsed[node.id]) {
        node.children.forEach((child, idx) => {
          const childX = x + childXOffset;
          const childY = y + (idx - (node.children.length - 1) / 2) * gapY;
          walk(child, childX, childY);
        });
      }
    }

    walk(root, 0, 0);
    return result;
  }, [collapsed]);

  const filtered = useMemo(() => {
    if (levelFilter === 'all') return rootData;
    // simple depth-based filter: show only up to level N
    const maxDepth = parseInt(levelFilter, 10);
    function cloneWithDepth(node, depth) {
      if (depth > maxDepth) return { ...node, children: [] };
      return { ...node, children: node.children ? node.children.map((c) => cloneWithDepth(c, depth + 1)) : [] };
    }
    return cloneWithDepth(rootData, 0);
  }, [rootData, levelFilter]);

  // Cached layout of nodes used by minimap
  const nodesLayout = useMemo(() => layout(filtered), [filtered, layout]);

  // --- Generator: create a learning map from a query and level ---
  const sampleResources = (topic) => {
    return [
      { title: `${topic} - Official Guide`, url: `https://example.com/${encodeURIComponent(topic)}` },
      { title: `${topic} - Video Intro`, url: `https://youtube.com/results?search_query=${encodeURIComponent(topic)}` }
    ];
  };

  const generateMap = (topic, lev) => {
    const t = topic.toLowerCase();
    if (t.includes('web')) {
      return {
        id: `root-${Date.now()}`,
        label: topic,
        description: 'A learning roadmap for web development.',
        children: [
          { id: 'frontend', label: 'Frontend', description: 'UI, HTML/CSS, JS frameworks', resources: sampleResources('Frontend'), children: [
            { id: 'html', label: 'HTML', description: 'Structure web pages', resources: sampleResources('HTML') },
            { id: 'css', label: 'CSS', description: 'Styling and layout', resources: sampleResources('CSS') },
            { id: 'react', label: 'React', description: 'Component-based UI', resources: sampleResources('React') }
          ]},
          { id: 'backend', label: 'Backend', description: 'Servers, APIs, auth', resources: sampleResources('Backend'), children: [
            { id: 'node', label: 'Node.js', description: 'JavaScript runtime', resources: sampleResources('Node.js') },
            { id: 'apis', label: 'APIs', description: 'REST / GraphQL', resources: sampleResources('APIs') }
          ]},
          { id: 'databases', label: 'Databases', description: 'Data storage', resources: sampleResources('Databases'), children: [
            { id: 'sql', label: 'SQL', description: 'Relational DBs', resources: sampleResources('SQL') },
            { id: 'nosql', label: 'NoSQL', description: 'Document DBs', resources: sampleResources('NoSQL') }
          ]}
        ]
      };
    }
    if (t.includes('garden') || t.includes('gardening')) {
      return {
        id: `root-${Date.now()}`,
        label: topic,
        description: 'A roadmap for gardening topics.',
        children: [
          { id: 'soil', label: 'Soil Basics', description: 'Soil types and nutrition', resources: sampleResources('Soil') },
          { id: 'plants', label: 'Plant Types', description: 'Annuals, perennials, shrubs', resources: sampleResources('Plant Types') },
          { id: 'watering', label: 'Watering', description: 'Water schedules and techniques', resources: sampleResources('Watering') }
        ]
      };
    }
    // fallback: create 3 branches by splitting topic words
    const words = topic.split(/\s+/).slice(0,3);
    return {
      id: `root-${Date.now()}`,
      label: topic,
      description: `Overview for ${topic}`,
      children: words.map((w, i) => ({ id: `${w}-${i}`, label: w.charAt(0).toUpperCase()+w.slice(1), description: `About ${w}`, resources: sampleResources(w) }))
    };
  };

  const setDataFromQuery = async (q, lev) => {
    try {
      const resp = await fetch('http://localhost:4000/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: q, level: lev })
      });
      if (resp.ok) {
        const body = await resp.json();
        if (body && body.root) {
          setRootData(body.root);
          setPan(DEFAULT_PAN);
          setScale(1);
          return;
        }
      }
    } catch (err) {
  
      console.warn('Backend generate failed, falling back to local generator', err?.message || err);
    }

    // Local fallback
    const map = generateMap(q, lev);
    setRootData(map);
    setPan(DEFAULT_PAN);
    setScale(1);
  };

  // find node by id
  const findNodeById = (node, id) => {
    if (!node) return null;
    if (node.id === id) return node;
    if (!node.children) return null;
    for (const c of node.children) {
      const found = findNodeById(c, id);
      if (found) return found;
    }
    return null;
  };

  const updateNodeById = (node, id, updater) => {
    if (node.id === id) return updater(node);
    if (!node.children) return node;
    return { ...node, children: node.children.map((c) => updateNodeById(c, id, updater)) };
  };

  const generateSubtopics = (label) => {
    const base = label.split(/\s+/)[0];
    return [
      { id: `${base}-x-${Date.now()}`, label: `${base} - Deep 1`, description: `Deeper topic under ${label}`, resources: sampleResources(base+' deep1') },
      { id: `${base}-y-${Date.now()+1}`, label: `${base} - Deep 2`, description: `Deeper topic under ${label}`, resources: sampleResources(base+' deep2') }
    ];
  };

  const exploreNode = (id) => {
    const node = findNodeById(rootData, id);
    if (!node) return;
    if (node.children && node.children.length > 0) {
      // already has children -> toggle collapse/open
      setCollapsed((s) => ({ ...s, [id]: false }));
      setSelectedNode(node);
      return;
    }
    const subs = generateSubtopics(node.label);
    const newRoot = updateNodeById(rootData, id, (n) => ({ ...n, children: subs }));
    setRootData(newRoot);
    setCollapsed((s) => ({ ...s, [id]: false }));
    setSelectedNode(findNodeById(newRoot, id));
  };


  const onMouseDown = (e) => {
    if (!svgRef.current) return;
    e.preventDefault();
    const rect = svgRef.current.getBoundingClientRect();
    draggingRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startPan: { ...pan },
      viewBoxW: rect.width,
      viewBoxH: rect.height
    };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const onMouseMove = (e) => {
    if (!draggingRef.current) return;
    const dpx = e.clientX - draggingRef.current.startX;
    const dpy = e.clientY - draggingRef.current.startY;
  
    const svgClientW = draggingRef.current.viewBoxW || VIEWBOX.width;
    const svgClientH = draggingRef.current.viewBoxH || VIEWBOX.height;
    const dx = dpx * (VIEWBOX.width / svgClientW);
    const dy = dpy * (VIEWBOX.height / svgClientH);
    setPan({ x: draggingRef.current.startPan.x + dx, y: draggingRef.current.startPan.y + dy });
  };

  const onMouseUp = () => {
    draggingRef.current = null;
    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('mouseup', onMouseUp);
  };

  const exportSVG = () => {
    const svgEl = svgRef.current;
    if (!svgEl) return;
    const serializer = new XMLSerializer();
    const clone = svgEl.cloneNode(true);
   
    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    const source = serializer.serializeToString(clone);
    const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mindmap.svg';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

 
  const exportPNG = () => {
    const svgEl = svgRef.current;
    if (!svgEl) return;
    const serializer = new XMLSerializer();
    const clone = svgEl.cloneNode(true);
    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
   
  const viewW = VIEWBOX.width;
  const viewH = VIEWBOX.height;
  clone.setAttribute('width', viewW);
  clone.setAttribute('height', viewH);
    const source = serializer.serializeToString(clone);
    const svg64 = btoa(unescape(encodeURIComponent(source)));
    const image64 = 'data:image/svg+xml;base64,' + svg64;
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ratio = window.devicePixelRatio || 1;
      canvas.width = viewW * ratio;
      canvas.height = viewH * ratio;
      canvas.style.width = viewW + 'px';
      canvas.style.height = viewH + 'px';
      const ctx = canvas.getContext('2d');
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, viewW, viewH);
      ctx.drawImage(img, 0, 0);
      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'mindmap.png';
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      });
    };
    img.onerror = () => { console.error('Image load failed'); };
    img.src = image64;
  };

  // Minimap helpers
  const minimapSize = { w: 180, h: 120 };
  const computeBounds = (list) => {
    if (!list || list.length === 0) return { minX: -200, maxX: 200, minY: -200, maxY: 200 };
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    list.forEach(n => {
      if (n.x < minX) minX = n.x;
      if (n.x > maxX) maxX = n.x;
      if (n.y < minY) minY = n.y;
      if (n.y > maxY) maxY = n.y;
    });
 
    const pad = 120;
    return { minX: minX - pad, maxX: maxX + pad, minY: minY - pad, maxY: maxY + pad };
  };

  const bounds = computeBounds(nodesLayout);

  const diagramToMini = (x, y) => {
    const dx = bounds.maxX - bounds.minX || 1;
    const dy = bounds.maxY - bounds.minY || 1;
    const mx = ((x - bounds.minX) / dx) * minimapSize.w;
    const my = ((y - bounds.minY) / dy) * minimapSize.h;
    return { x: mx, y: my };
  };

  // minimap will report a ratio [0..1] for the clicked/dragged point. Convert to diagram coords:
  const handleMinimapSelect = (ratioX, ratioY) => {
    const dx = bounds.maxX - bounds.minX || 1;
    const dy = bounds.maxY - bounds.minY || 1;
    const diagramX = bounds.minX + ratioX * dx;
    const diagramY = bounds.minY + ratioY * dy;
    const viewW = VIEWBOX.width, viewH = VIEWBOX.height;
    const newPanX = viewW / 2 - diagramX * scale;
    const newPanY = viewH / 2 - diagramY * scale;
    setPan({ x: newPanX, y: newPanY });
  };

  return (
    <div className="wrap">
        <Sidebar
        zoomIn={zoomIn}
        zoomOut={zoomOut}
        scale={scale}
          minimapComponent={<Minimap nodesLayout={nodesLayout} diagramToMini={diagramToMini} minimapSize={minimapSize} onSelectDiagramPoint={handleMinimapSelect} />}
          showTooltips={showTooltips}
          setShowTooltips={setShowTooltips}
        levelFilter={levelFilter}
        setLevelFilter={setLevelFilter}
          exportSVG={exportSVG}
          exportPNG={exportPNG}
          // expand/collapse control
          expandCollapseChecked={allCollapsed}
          onToggleExpandCollapse={(checked) => { if (checked) collapseAll(); else expandAll(); }}
      />

      <main className="main">
        <Topbar query={query} setQuery={setQuery} level={level} setLevel={setLevel} onGenerate={() => setDataFromQuery(query, level)} exportSVG={exportSVG} rootData={rootData} />

        <div className="canvas-wrap">
          <svg ref={svgRef} onMouseDown={onMouseDown} className="mindmap-svg" width="100%" height="100%" viewBox={`0 0 ${VIEWBOX.width} ${VIEWBOX.height}`} preserveAspectRatio="xMidYMid meet">
            <defs>
              <filter id="soft" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="6" stdDeviation="14" floodColor="#000" floodOpacity="0.06" />
              </filter>
            </defs>
              <g transform={`translate(${pan.x},${pan.y}) scale(${scale})`}>
              {/* root node */}
              <TreeNodes
                node={filtered}
                x={0}
                y={0}
                depth={0}
                collapsed={collapsed}
                onToggle={toggle}
                showTooltips={showTooltips}
                onSelect={(n) => setSelectedNode(n)}
                onHover={showTooltip}
                onLeave={hideTooltip}
                onMove={moveTooltip}
              />
            </g>
          </svg>
        </div>
        {/* Tooltip: absolute positioned div using client coords from mouse events */}
        {tooltip.visible && (
          <div className="tooltip" style={{ left: tooltip.x + 'px', top: tooltip.y + 'px' }}>
            <div className="tooltip-content">{tooltip.content}</div>
          </div>
        )}
        {/* minimap removed from overlay - sidebar now contains the single minimap */}
        {/* details panel for selected node (component) */}
        <DetailsPanel selectedNode={selectedNode} exploreNode={exploreNode} onClose={() => setSelectedNode(null)} />
      </main>
    </div>
  );
}

export default App;
