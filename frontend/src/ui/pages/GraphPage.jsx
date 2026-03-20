import { useGraph } from '../../application/useGraph';
import { useOllama } from '../../application/useOllama';
import GraphView from '../components/GraphView';
import Sidebar from '../components/Sidebar';
import './GraphPage.css';

export default function GraphPage({ token, onLogout }) {
  const { ollamaUrl, ollamaModel, saveOllamaUrl, saveOllamaModel, getEmbedding } =
    useOllama();

  const {
    graphData,
    selectedIds,
    selectedNodes,
    suggestions,
    loading,
    toast,
    addTag,
    removeTag,
    toggleSelect,
    clearSelection,
    linkSelectedNodes,
    removeEdge,
    requestSuggestions,
    acceptSuggestion,
    rejectSuggestion,
  } = useGraph(token, getEmbedding);

  return (
    <div className="graph-page">
      <header className="page-header">
        <div className="page-header-brand">
          <span className="page-header-logo">🌱</span>
          <span className="page-header-title">Flourisher</span>
        </div>
        <button className="page-header-logout" onClick={onLogout}>
          Sign out
        </button>
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
          onRemoveTag={removeTag}
          onToggleSelect={toggleSelect}
          onClearSelection={clearSelection}
          onLinkNodes={linkSelectedNodes}
          onRemoveEdge={removeEdge}
          onRequestSuggestions={requestSuggestions}
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
