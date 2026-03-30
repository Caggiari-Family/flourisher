import { useState, useRef, useEffect } from 'react';
import './Sidebar.css';

const STATUS_OPTIONS = [
  { value: 'thinking',      label: 'Thinking' },
  { value: 'pending',       label: 'Pending' },
  { value: 'done',          label: 'Done' },
  { value: 'not_interested', label: 'Not interested' },
];

const STATUS_COLOR = {
  thinking:      '#8b5cf6',
  pending:       '#f59e0b',
  done:          '#10b981',
  not_interested: '#ef4444',
};

export default function Sidebar({
  nodes,
  edges,
  selectedIds,
  selectedNodes,
  suggestions,
  loading,
  ollamaUrl,
  ollamaModel,
  onSaveOllamaUrl,
  onSaveOllamaModel,
  onAddTag,
  onUpdateTag,
  onRemoveTag,
  onToggleSelect,
  onClearSelection,
  onLinkNodes,
  onRemoveEdge,
  onUpdateEdge,
  onRequestSuggestions,
  onRequestFlourish,
  onAccept,
  onReject,
}) {
  const [name, setName]               = useState('');
  const [description, setDescription] = useState('');
  const [showDesc, setShowDesc]       = useState(false);
  const [urlDraft, setUrlDraft]       = useState(ollamaUrl);
  const [modelDraft, setModelDraft]   = useState(ollamaModel);
  const [aiMenuOpen, setAiMenuOpen]   = useState(false);
  const [nodeSearch, setNodeSearch]   = useState('');
  const [edgeSearch, setEdgeSearch]   = useState('');
  const [editingNode, setEditingNode] = useState(null); // { id, name, description, status }
  const [editName, setEditName]       = useState('');
  const [editDesc, setEditDesc]       = useState('');
  const [editNodeStatus, setEditNodeStatus] = useState('');

  // Edge editing state
  const [editingEdge, setEditingEdge]     = useState(null); // edge object
  const [editEdgeLabel, setEditEdgeLabel] = useState('');
  const [editEdgeStatus, setEditEdgeStatus] = useState('');

  const openEdit = (e, n) => {
    e.stopPropagation();
    setEditingNode(n);
    setEditName(n.name);
    setEditDesc(n.description ?? '');
    setEditNodeStatus(n.status ?? '');
  };

  const closeEdit = () => setEditingNode(null);

  const saveEdit = () => {
    if (!editName.trim()) return;
    onUpdateTag(editingNode.id, editName.trim(), editDesc.trim(), editNodeStatus);
    closeEdit();
  };

  const openEdgeEdit = (e, edge) => {
    e.stopPropagation();
    setEditingEdge(edge);
    setEditEdgeLabel(edge.label ?? '');
    setEditEdgeStatus(edge.status ?? '');
  };

  const closeEdgeEdit = () => setEditingEdge(null);

  const saveEdgeEdit = () => {
    onUpdateEdge(editingEdge.id, editEdgeLabel, editEdgeStatus);
    closeEdgeEdit();
  };

  const aiMenuRef = useRef(null);

  useEffect(() => {
    if (!aiMenuOpen) return;
    const handler = (e) => {
      if (aiMenuRef.current && !aiMenuRef.current.contains(e.target)) {
        setAiMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [aiMenuOpen]);

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAddTag(name.trim(), description.trim());
    setName('');
    setDescription('');
    setShowDesc(false);
  };

  const handleOllamaSubmit = (e) => {
    e.preventDefault();
    onSaveOllamaUrl(urlDraft.trim());
    onSaveOllamaModel(modelDraft.trim());
  };

  const permanentNodes = nodes.filter((n) => !n.suggested);
  const canLink        = selectedIds.size >= 2;

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
          {showDesc ? (
            <textarea
              className="sidebar__input sidebar__textarea"
              placeholder="Description (optional)…"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          ) : (
            <button type="button" className="sidebar__link-btn" onClick={() => setShowDesc(true)}>
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
            Click tags on the graph or the list below to select them.
            With 2+ selected you can link them or ask Ollama for suggestions.
          </p>
        ) : (
          <>
            <div className="chip-group">
              {selectedNodes.map((n) => (
                <span key={n.id} className="chip">
                  {n.name}
                  <button className="chip__remove" onClick={() => onToggleSelect(n.id)}>×</button>
                </span>
              ))}
            </div>
            <div className="sidebar__row">
              <button className="btn btn--link" onClick={onLinkNodes} disabled={!canLink}
                title={canLink ? 'Create edge(s) between selected tags' : 'Select ≥2 tags'}>
                🔗 Link
              </button>
              <div className="ai-dropdown" ref={aiMenuRef}>
                <button
                  className="btn btn--ai"
                  disabled={loading}
                  onClick={() => setAiMenuOpen((o) => !o)}
                >
                  {loading ? <><span className="spinner" /> Thinking…</> : <>✨ AI <span className="ai-dropdown__caret">▾</span></>}
                </button>
                {aiMenuOpen && !loading && (
                  <ul className="ai-dropdown__menu">
                    <li>
                      <button className="ai-dropdown__item" onClick={() => { setAiMenuOpen(false); onRequestSuggestions(); }}>
                        ✨ Suggest
                        <span className="ai-dropdown__item-hint">new tags from selection</span>
                      </button>
                    </li>
                    <li>
                      <button className="ai-dropdown__item" onClick={() => { setAiMenuOpen(false); onRequestFlourish(); }}>
                        🌱 Flourish
                        <span className="ai-dropdown__item-hint">expand full graph</span>
                      </button>
                    </li>
                  </ul>
                )}
              </div>
              <button className="btn btn--ghost" onClick={onClearSelection}>Clear</button>
            </div>
          </>
        )}
      </section>

      {/* ── Pending suggestions ───────────────────── */}
      {suggestions.length > 0 && (
        <section className="sidebar__section">
          <h2 className="sidebar__section-title">
            Pending <span className="badge">{suggestions.length}</span>
          </h2>
          <ul className="suggestion-list">
            {suggestions.map((s) => (
              <li key={s.id} className="suggestion-item">
                <div className="suggestion-item__name">{s.name}</div>
                {s.description && <div className="suggestion-item__desc">{s.description}</div>}
                <div className="suggestion-item__actions">
                  <button className="btn btn--accept" onClick={() => onAccept(s.id)}>✓ Accept</button>
                  <button className="btn btn--reject" onClick={() => onReject(s.id)}>✗ Reject</button>
                </div>
              </li>
            ))}
          </ul>
          <div className="sidebar__row sidebar__row--mt">
            <button className="btn btn--accept btn--sm" onClick={() => suggestions.forEach((s) => onAccept(s.id))}>Accept all</button>
            <button className="btn btn--reject btn--sm" onClick={() => suggestions.forEach((s) => onReject(s.id))}>Reject all</button>
          </div>
        </section>
      )}

      {/* ── Tag list ──────────────────────────────── */}
      <section className="sidebar__section sidebar__section--flex">
        <h2 className="sidebar__section-title">
          Tags <span className="badge">{permanentNodes.length}</span>
        </h2>
        <input
          className="sidebar__input sidebar__search"
          placeholder="Search tags…"
          value={nodeSearch}
          onChange={(e) => setNodeSearch(e.target.value)}
        />
        {nodeSearch.trim() && (() => {
          const q = nodeSearch.toLowerCase();
          const hits = permanentNodes.filter((n) => n.name.toLowerCase().includes(q));
          return (
            <ul className="node-list">
              {hits.length === 0
                ? <li className="sidebar__hint">No match.</li>
                : hits.map((n) => (
                  <li
                    key={n.id}
                    className={`node-item ${selectedIds.has(n.id) ? 'node-item--selected' : ''}`}
                    onClick={() => onToggleSelect(n.id)}
                  >
                    <div className="node-item__header">
                      {STATUS_COLOR[n.status] && (
                        <span className="status-dot" style={{ background: STATUS_COLOR[n.status] }} title={n.status} />
                      )}
                      <div className="node-item__name">{n.name}</div>
                      <button className="node-item__icon-btn" title="Edit" onClick={(e) => openEdit(e, n)}>✎</button>
                      <button className="node-item__delete" title="Delete" onClick={(e) => { e.stopPropagation(); onRemoveTag(n.id); }}>×</button>
                    </div>
                  </li>
                ))
              }
            </ul>
          );
        })()}
      </section>

      {/* ── Edge list ─────────────────────────────── */}
      {edges && edges.length > 0 && (
        <section className="sidebar__section">
          <h2 className="sidebar__section-title">
            Edges <span className="badge">{edges.length}</span>
          </h2>
          <input
            className="sidebar__input sidebar__search"
            placeholder="Search edges…"
            value={edgeSearch}
            onChange={(e) => setEdgeSearch(e.target.value)}
          />
          {edgeSearch.trim() && (() => {
            const q = edgeSearch.toLowerCase();
            const hits = edges.filter((e) => {
              const src = nodes.find((n) => n.id === e.source);
              const tgt = nodes.find((n) => n.id === e.target);
              return (src?.name ?? '').toLowerCase().includes(q)
                  || (tgt?.name ?? '').toLowerCase().includes(q)
                  || (e.label ?? '').toLowerCase().includes(q);
            });
            return (
              <ul className="edge-list">
                {hits.length === 0
                  ? <li className="sidebar__hint" style={{ padding: '4px 0' }}>No match.</li>
                  : hits.map((e, i) => {
                    const src = nodes.find((n) => n.id === e.source);
                    const tgt = nodes.find((n) => n.id === e.target);
                    return (
                      <li key={i} className="edge-item">
                        {STATUS_COLOR[e.status] && (
                          <span className="status-dot" style={{ background: STATUS_COLOR[e.status] }} title={e.status} />
                        )}
                        <span className="edge-item__label">
                          {src?.name ?? '?'} → {tgt?.name ?? '?'}
                          {e.label ? ` (${e.label})` : ''}
                        </span>
                        <button className="node-item__icon-btn" title="Edit edge" onClick={(ev) => openEdgeEdit(ev, e)}>✎</button>
                        <button className="node-item__delete" title="Delete edge" onClick={() => onRemoveEdge(e.id)}>×</button>
                      </li>
                    );
                  })
                }
              </ul>
            );
          })()}
        </section>
      )}

      {/* ── Ollama config ─────────────────────────── */}
      <section className="sidebar__section">
        <h2 className="sidebar__section-title">Ollama</h2>
        <form className="add-form" onSubmit={handleOllamaSubmit}>
          <label className="sidebar__label">Server URL</label>
          <input
            className="sidebar__input"
            value={urlDraft}
            onChange={(e) => setUrlDraft(e.target.value)}
            placeholder="http://localhost:11434"
          />
          <label className="sidebar__label">Model</label>
          <input
            className="sidebar__input"
            value={modelDraft}
            onChange={(e) => setModelDraft(e.target.value)}
            placeholder="llama3"
          />
          <button className="btn btn--ghost btn--sm" type="submit">Save</button>
        </form>
        <p className="sidebar__hint" style={{ marginTop: 8 }}>
          Ollama must allow CORS:<br />
          <code>OLLAMA_ORIGINS=* ollama serve</code>
        </p>
      </section>

      {/* ── Edit tag modal ────────────────────────── */}
      {editingNode && (
        <div className="edit-modal-overlay" onClick={closeEdit}>
          <div className="edit-modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="edit-modal__title">Edit Tag</h3>
            <label className="sidebar__label">Name</label>
            <input
              className="sidebar__input"
              value={editName}
              autoFocus
              onChange={(e) => setEditName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') closeEdit(); }}
            />
            <label className="sidebar__label" style={{ marginTop: 10 }}>Description</label>
            <textarea
              className="sidebar__input sidebar__textarea"
              value={editDesc}
              rows={3}
              onChange={(e) => setEditDesc(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Escape') closeEdit(); }}
            />
            <label className="sidebar__label" style={{ marginTop: 10 }}>Status</label>
            <select
              className="sidebar__input status-select"
              value={editNodeStatus}
              onChange={(e) => setEditNodeStatus(e.target.value)}
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <div className="edit-modal__actions">
              <button className="btn btn--primary" onClick={saveEdit} disabled={!editName.trim()}>Save</button>
              <button className="btn btn--ghost" onClick={closeEdit}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit edge modal ───────────────────────── */}
      {editingEdge && (
        <div className="edit-modal-overlay" onClick={closeEdgeEdit}>
          <div className="edit-modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="edit-modal__title">Edit Edge</h3>
            <label className="sidebar__label">Label</label>
            <input
              className="sidebar__input"
              value={editEdgeLabel}
              autoFocus
              placeholder="Label (optional)…"
              onChange={(e) => setEditEdgeLabel(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') saveEdgeEdit(); if (e.key === 'Escape') closeEdgeEdit(); }}
            />
            <label className="sidebar__label" style={{ marginTop: 10 }}>Status</label>
            <select
              className="sidebar__input status-select"
              value={editEdgeStatus}
              onChange={(e) => setEditEdgeStatus(e.target.value)}
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <div className="edit-modal__actions">
              <button className="btn btn--primary" onClick={saveEdgeEdit}>Save</button>
              <button className="btn btn--ghost" onClick={closeEdgeEdit}>Cancel</button>
            </div>
          </div>
        </div>
      )}

    </aside>
  );
}
