import { useGraph } from '../../application/useGraph';
import { useOllama } from '../../application/useOllama';
import GraphView from '../components/GraphView';
import Sidebar from '../components/Sidebar';
import './GraphPage.css';

export default function GraphPage({ token, onLogout }) {
  const { ollamaUrl, ollamaModel, language, saveOllamaUrl, saveOllamaModel, saveLanguage, getSuggestions, getFlourish } =
    useOllama();

  const {
    graphData,
    selectedIds,
    selectedNodes,
    suggestions,
    loading,
    toast,
    addTag,
    updateTag,
    removeTag,
    toggleSelect,
    clearSelection,
    linkSelectedNodes,
    removeEdge,
    updateEdge,
    requestSuggestions,
    requestFlourish,
    acceptSuggestion,
    rejectSuggestion,
  } = useGraph(token, getSuggestions, getFlourish);

  return (
    <div className="graph-page">
      <header className="page-header">
        <div className="page-header-brand">
          <span className="page-header-logo">🌱</span>
          <span className="page-header-title">Flourisher</span>
        </div>
        <div className="page-header-controls">
          <select
            className="page-header-lang"
            value={language}
            onChange={(e) => saveLanguage(e.target.value)}
            title="Suggestion language"
          >
            <option value="en">EN</option>
            <option value="fr">FR</option>
          </select>
          <button className="page-header-logout" onClick={onLogout}>
            Sign out
          </button>
        </div>
      </header>

      <div className="page-body">
        <Sidebar
          nodes={graphData.nodes}
          edges={graphData.edges}
          selectedIds={selectedIds}
          selectedNodes={selectedNodes}
          suggestions={suggestions}
          loading={loading}
          ollamaUrl={ollamaUrl}
          ollamaModel={ollamaModel}
          onSaveOllamaUrl={saveOllamaUrl}
          onSaveOllamaModel={saveOllamaModel}
          onAddTag={addTag}
          onUpdateTag={updateTag}
          onRemoveTag={removeTag}
          onToggleSelect={toggleSelect}
          onClearSelection={clearSelection}
          onLinkNodes={linkSelectedNodes}
          onRemoveEdge={removeEdge}
          onUpdateEdge={updateEdge}
          onRequestSuggestions={requestSuggestions}
          onRequestFlourish={requestFlourish}
          onAccept={acceptSuggestion}
          onReject={rejectSuggestion}
        />

        <main className="page-graph">
          <GraphView
            graphData={graphData}
            selectedIds={selectedIds}
            onNodeClick={toggleSelect}
            onAccept={acceptSuggestion}
            onReject={rejectSuggestion}
          />
        </main>
      </div>

      {toast && (
        <div className={`page-toast page-toast--${toast.type}`}>{toast.msg}</div>
      )}
    </div>
  );
}
