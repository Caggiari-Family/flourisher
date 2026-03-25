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

  // Imperatively sync data so deleted nodes/links are properly removed
  useEffect(() => {
    fgRef.current?.graphData(fgData);
  }, [fgData]);

  // react-force-graph mutates node objects in-place (adds x/y/vx/vy).
  // We pass it a stable shape derived from graphData so React state stays clean.
  const fgData = useMemo(
    () => ({
      nodes: graphData.nodes.map((n) => ({ ...n })),
      links: graphData.edges.map((e) => ({ source: e.source, target: e.target })),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(graphData)],
  );

  const paintNode = useCallback(
    (node, ctx, globalScale) => {
      const isSelected = selectedIds.has(node.id);
      const isSuggested = node.suggested;
      const fontSize = Math.max(9, FONT_BASE / globalScale);

      // Glow for selected nodes
      if (isSelected) {
        ctx.shadowColor = '#fbbf24';
        ctx.shadowBlur = 18 / globalScale;
      }

      ctx.beginPath();
      ctx.arc(node.x, node.y, NODE_R, 0, 2 * Math.PI);

      if (isSuggested) {
        ctx.fillStyle = '#1c1f30';
        ctx.strokeStyle = '#6b7280';
        ctx.setLineDash([5 / globalScale, 3 / globalScale]);
      } else if (isSelected) {
        ctx.fillStyle = '#3b2200';
        ctx.strokeStyle = '#fbbf24';
        ctx.setLineDash([]);
      } else {
        ctx.fillStyle = '#1e3a5f';
        ctx.strokeStyle = '#3b82f6';
        ctx.setLineDash([]);
      }

      ctx.lineWidth = 2 / globalScale;
      ctx.fill();
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.shadowBlur = 0;

      // Label
      ctx.font = `${isSuggested ? 'italic ' : ''}${fontSize}px Sans-Serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = isSuggested ? '#9ca3af' : isSelected ? '#fde68a' : '#e2e8f0';

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
        nodeCanvasObject={paintNode}
        nodeCanvasObjectMode={() => 'replace'}
        nodeRelSize={NODE_R}
        nodeLabel={nodeLabel}
        onNodeClick={handleNodeClick}
        onNodeRightClick={handleNodeRightClick}
        linkColor={() => '#2d3748'}
        linkWidth={1.5}
        linkDirectionalArrowLength={8}
        linkDirectionalArrowRelPos={1}
        linkDirectionalArrowColor={() => '#475569'}
        backgroundColor="#0f1117"
        cooldownTicks={100}
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
