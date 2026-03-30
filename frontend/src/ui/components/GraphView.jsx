import { useRef, useCallback, useMemo, useEffect } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import './GraphView.css';

const NODE_R = 24;
const FONT_BASE = 13;

/**
 * Renders the force-directed graph.
 * - Click a node  → toggle selection
 * - Right-click a suggested node → reject it
 */
export default function GraphView({
  graphData,
  selectedIds,
  onNodeClick,
  onAccept,
  onReject,
}) {
  const fgRef = useRef();

  useEffect(() => {
    const fg = fgRef.current;
    if (!fg) return;
    fg.d3Force('charge').strength(-600);
    fg.d3Force('link').distance(180);
  }, []);

  // react-force-graph mutates node objects in-place (adds x/y/vx/vy).
  // We pass it a stable shape derived from graphData so React state stays clean.
  const fgData = useMemo(
    () => ({
      nodes: graphData.nodes.map((n) => ({ ...n })),
      links: graphData.edges.map((e) => ({ source: e.source, target: e.target, status: e.status })),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(graphData)],
  );

  const paintNode = useCallback(
    (node, ctx, globalScale) => {
      const isSelected = selectedIds.has(node.id);
      const isSuggested = node.suggested;
      const fontSize = Math.max(9, FONT_BASE / globalScale);

      const statusColors = {
        thinking:       { fill: '#1e1040', stroke: '#8b5cf6' },
        pending:        { fill: '#2a1800', stroke: '#f59e0b' },
        done:           { fill: '#0f2a1a', stroke: '#10b981' },
        not_interested: { fill: '#2a0a0a', stroke: '#ef4444' },
      };
      const sc = statusColors[node.status] ?? statusColors.thinking;

      // Glow for selected nodes using status color
      if (isSelected) {
        ctx.shadowColor = sc.stroke;
        ctx.shadowBlur = 28 / globalScale;
      }

      ctx.beginPath();
      ctx.arc(node.x, node.y, NODE_R, 0, 2 * Math.PI);

      if (isSuggested) {
        ctx.fillStyle = '#1c1f30';
        ctx.strokeStyle = '#6b7280';
        ctx.setLineDash([5 / globalScale, 3 / globalScale]);
      } else {
        ctx.fillStyle = sc.fill;
        ctx.strokeStyle = sc.stroke;
        ctx.setLineDash([]);
      }

      ctx.lineWidth = (isSelected ? 3.5 : 2) / globalScale;
      ctx.fill();
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.shadowBlur = 0;

      // Label
      ctx.font = `${isSuggested ? 'italic ' : ''}${fontSize}px Sans-Serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = isSuggested ? '#9ca3af' : '#e2e8f0';

      // Truncate long names
      const maxWidth = NODE_R * 1.8;
      let label = node.name;
      while (ctx.measureText(label).width > maxWidth && label.length > 3) {
        label = label.slice(0, -2) + '…';
      }
      ctx.fillText(label, node.x, node.y);

      // "?" badge for suggestions
      if (isSuggested) {
        const bSize = Math.max(8, 11 / globalScale);
        ctx.font = `bold ${bSize}px Sans-Serif`;
        ctx.fillStyle = '#6b7280';
        ctx.fillText('?', node.x + NODE_R * 0.65, node.y - NODE_R * 0.65);
      }
    },
    [selectedIds],
  );

  const handleNodeClick = useCallback(
    (node) => onNodeClick(node.id),
    [onNodeClick],
  );

  const handleNodeRightClick = useCallback(
    (node, event) => {
      event.preventDefault();
      if (node.suggested) onReject(node.id);
    },
    [onReject],
  );

  const nodeLabel = useCallback(
    (node) =>
      node.suggested
        ? `${node.name} (suggested)\n${node.description || ''}\nLeft-click to select  •  Right-click to reject`
        : `${node.name}\n${node.description || ''}\nClick to select / deselect`,
    [],
  );

  return (
    <div className="graph-view">
      <ForceGraph2D
        ref={fgRef}
        graphData={fgData}
        nodeCanvasObject={paintNode}
        nodeCanvasObjectMode={() => 'replace'}
        nodeRelSize={NODE_R}
        nodeLabel={nodeLabel}
        onNodeClick={handleNodeClick}
        onNodeRightClick={handleNodeRightClick}
        linkColor={(link) => {
          if (link.status === 'pending') return '#f59e0b';
          if (link.status === 'done') return '#10b981';
          if (link.status === 'not_interested') return '#ef4444';
          return '#8b5cf6'; // thinking or unset
        }}
        linkWidth={1.5}
        linkDirectionalArrowLength={8}
        linkDirectionalArrowRelPos={1}
        linkDirectionalArrowColor={(link) => {
          if (link.status === 'pending') return '#f59e0b';
          if (link.status === 'done') return '#10b981';
          if (link.status === 'not_interested') return '#ef4444';
          return '#8b5cf6'; // thinking or unset
        }}
        backgroundColor="#0f1117"
        cooldownTicks={300}
        d3AlphaDecay={0.015}
        d3VelocityDecay={0.25}
      />

      <div className="graph-legend">
        <span className="graph-legend__item graph-legend__item--tag">◉ Tag</span>
        <span className="graph-legend__item graph-legend__item--selected">◉ Selected</span>
        <span className="graph-legend__item graph-legend__item--suggested">◌ Suggested</span>
      </div>

      {graphData.nodes.length === 0 && (
        <div className="graph-empty">
          Add your first tag in the sidebar to get started
        </div>
      )}
    </div>
  );
}
