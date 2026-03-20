import { useState } from 'react';
import './Sidebar.css';

export default function Sidebar({
  nodes,
  edges,
  selectedIds,
  selectedNodes,
  suggestions,
  loading,
  onAddTag,
  onRemoveTag,
  onToggleSelect,
  onClearSelection,
  onLinkNodes,
  onRemoveEdge,
  onRequestSuggestions,
  onAccept,
  onReject,
}) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [showDescription, setShowDescription] = useState(false);

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAddTag(name.trim(), description.trim());
    setName('');
    setDescription('');
    setShowDescription(false);
  };

  const permanentNodes = nodes.filter((n) => !n.suggested);
  const canLink = selectedIds.size >= 2;

  return (
    <aside className="sidebar">
      {/* ── Add tag ────────────────────────────────── */}
      <section className="sidebar__section">
        <h2 className="sidebar__section-title">Add Tag</h2>
        <form className="add-form" onSubmit={handleAddSubmit}>
          <input
            className="sidebar__input"
            placeholder="Tag name…"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          {showDescription ? (
            <textarea
              className="sidebar__input sidebar__textarea"
              placeholder="Description (optional)…"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          ) : (
            <button
              type="button"
              className="sidebar__link-btn"
              onClick={() => setShowDescription(true)}
            >
              + add description
            </button>
          )}
          <button className="btn btn--primary" type="submit" disabled={!name.trim()}>
            Add Tag
          </button>
        </form>
      </section>

      {/* ── Selection actions ─────────────────────── */}
      <section className="sidebar__section">
        <h2 className="sidebar__section-title">Selection</h2>

        {selectedIds.size === 0 ? (
          <p className="sidebar__hint">
            Click tags in the graph or the list below to select them. With 2+
            selected you can link them or ask the AI for suggestions.
          </p>
        ) : (
          <>
            <div className="chip-group">
              {selectedNodes.map((n) => (
                <span key={n.id} className="chip">
                  {n.name}
                  <button
                    className="chip__remove"
                    onClick={() => onToggleSelect(n.id)}
                    title="Deselect"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            <div className="sidebar__row">
              <button
                className="btn btn--link"
                onClick={onLinkNodes}
                disabled={!canLink}
                title={canLink ? 'Create edges between selected tags' : 'Select at least 2 tags'}
              >
                🔗 Link
              </button>
              <button
                className="btn btn--ai"
                onClick={onRequestSuggestions}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner" aria-hidden="true" /> Thinking…
                  </>
                ) : (
                  '✨ Suggest'
                )}
              </button>
              <button
                className="btn btn--ghost"
                onClick={onClearSelection}
                title="Clear selection"
              >
                Clear
              </button>
            </div>
          </>
        )}
      </section>

      {/* ── Pending suggestions ───────────────────── */}
      {suggestions.length > 0 && (
        <section className="sidebar__section">
          <h2 className="sidebar__section-title">
            Pending
            <span className="badge">{suggestions.length}</span>
          </h2>

          <ul className="suggestion-list">
            {suggestions.map((s) => (
              <li key={s.id} className="suggestion-item">
                <div className="suggestion-item__name">{s.name}</div>
                {s.description && (
                  <div className="suggestion-item__desc">{s.description}</div>
                )}
                <div className="suggestion-item__actions">
                  <button className="btn btn--accept" onClick={() => onAccept(s.id)}>
                    ✓ Accept
                  </button>
                  <button className="btn btn--reject" onClick={() => onReject(s.id)}>
                    ✗ Reject
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <div className="sidebar__row sidebar__row--mt">
            <button
              className="btn btn--accept btn--sm"
              onClick={() => suggestions.forEach((s) => onAccept(s.id))}
            >
              Accept all
            </button>
            <button
              className="btn btn--reject btn--sm"
              onClick={() => suggestions.forEach((s) => onReject(s.id))}
            >
              Reject all
            </button>
          </div>
        </section>
      )}

      {/* ── Tag list ──────────────────────────────── */}
      <section className="sidebar__section sidebar__section--flex">
        <h2 className="sidebar__section-title">
          Tags
          <span className="badge">{permanentNodes.length}</span>
        </h2>

        <ul className="node-list">
          {permanentNodes.length === 0 && (
            <li className="sidebar__hint">No tags yet.</li>
          )}
          {permanentNodes.map((n) => (
            <li
              key={n.id}
              className={`node-item ${selectedIds.has(n.id) ? 'node-item--selected' : ''}`}
              onClick={() => onToggleSelect(n.id)}
            >
              <div className="node-item__name">{n.name}</div>
              {n.description && (
                <div className="node-item__desc">{n.description}</div>
              )}
              <button
                className="node-item__delete"
                title="Delete tag"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveTag(n.id);
                }}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      </section>

      {/* ── Edge list ─────────────────────────────── */}
      {edges && edges.length > 0 && (
        <section className="sidebar__section">
          <h2 className="sidebar__section-title">
            Edges
            <span className="badge">{edges.length}</span>
          </h2>
          <ul className="edge-list">
            {edges.map((e) => {
              const sourceNode = nodes.find((n) => n.id === e.source);
              const targetNode = nodes.find((n) => n.id === e.target);
              return (
                <li key={e.id} className="edge-item">
                  <span className="edge-item__label">
                    {sourceNode?.name ?? '?'} → {targetNode?.name ?? '?'}
                    {e.label ? ` (${e.label})` : ''}
                  </span>
                  <button
                    className="node-item__delete"
                    title="Delete edge"
                    onClick={() => onRemoveEdge(e.id)}
                  >
                    ×
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </aside>
  );
}
