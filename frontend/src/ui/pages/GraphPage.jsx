import { useGraph } from '../../application/useGraph';
import GraphView from '../components/GraphView';
import Sidebar from '../components/Sidebar';
import './GraphPage.css';

export default function GraphPage({ token, onLogout }) {
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
    requestSuggestions,
    acceptSuggestion,
    rejectSuggestion,
  } = useGraph(token);

  return (
    <div className="graph-page">
      <header className="page-header">
        <div className="page-header-brand">
          <span className="page-header-logo">🌱</span>
          <span className="page-header-title">Flourisher</span>
        </div>
        <button className="page-header-logout" onClick={onLogout} title="Sign out">
          Sign out
        </button>
      </header>

      <div className="page-body">
        <Sidebar
          nodes={graphData.nodes}
          selectedIds={selectedIds}
          selectedNodes={selectedNodes}
          suggestions={suggestions}
          loading={loading}
          onAddTag={addTag}
          onRemoveTag={removeTag}
          onToggleSelect={toggleSelect}
          onClearSelection={clearSelection}
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
