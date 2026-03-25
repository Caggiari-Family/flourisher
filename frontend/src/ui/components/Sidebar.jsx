import { useState, useRef, useEffect } from 'react';
import './Sidebar.css';

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
  onRemoveTag,
  onToggleSelect,
  onClearSelection,
  onLinkNodes,
  onRemoveEdge,
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
  const aiMenuRef                     = useRef(null);

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
        <ul className="node-list">
          {permanentNodes.length === 0 && <li className="sidebar__hint">No tags yet.</li>}
          {permanentNodes.map((n) => (
            <li
              key={n.id}
              className={`node-item ${selectedIds.has(n.id) ? 'node-item--selected' : ''}`}
              onClick={() => onToggleSelect(n.id)}
            >
              <div className="node-item__header">
                <div className="node-item__name">{n.name}</div>
                <button className="node-item__delete" title="Delete"
                  onClick={(e) => { e.stopPropagation(); onRemoveTag(n.id); }}>×</button>
              </div>
              {n.description && <div className="node-item__desc">{n.description}</div>}
            </li>
          ))}
        </ul>
      </section>

      {/* ── Edge list ─────────────────────────────── */}
      {edges && edges.length > 0 && (
        <section className="sidebar__section">
          <h2 className="sidebar__section-title">
            Edges <span className="badge">{edges.length}</span>
          </h2>
          <ul className="edge-list">
            {edges.map((e) => {
              const src = nodes.find((n) => n.id === e.source);
              const tgt = nodes.find((n) => n.id === e.target);
              return (
                <li key={e.id} className="edge-item">
                  <span className="edge-item__label">
                    {src?.name ?? '?'} → {tgt?.name ?? '?'}
                    {e.label ? ` (${e.label})` : ''}
                  </span>
                  <button className="node-item__delete" title="Delete edge"
                    onClick={() => onRemoveEdge(e.id)}>×</button>
                </li>
              );
            })}
          </ul>
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

    </aside>
  );
}
