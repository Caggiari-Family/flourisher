import { useState, useCallback, useEffect, useMemo } from 'react';
import { createTagApi } from '../infrastructure/api/tag.api';

/**
 * Application-layer hook that manages the graph state and orchestrates
 * tag / suggestion operations through the API adapter.
 *
 * @param {string} token  JWT access token
 */
export function useGraph(token) {
  const api = useMemo(() => createTagApi(token), [token]);

  const [graphData, setGraphData] = useState({ nodes: [], edges: [] });
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // ── helpers ──────────────────────────────────────────────────────────────

  const notify = useCallback((msg, type = 'info') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  const reload = useCallback(async () => {
    try {
      const data = await api.fetchGraph();
      setGraphData(data);
    } catch (err) {
      notify('Could not load graph — is the backend running?', 'error');
    }
  }, [api, notify]);

  // ── initial load ─────────────────────────────────────────────────────────

  useEffect(() => {
    reload();
  }, [reload]);

  // ── graph mutations ───────────────────────────────────────────────────────

  const addTag = useCallback(
    async (name, description) => {
      try {
        await api.createTag(name, description);
        await reload();
        notify(`"${name}" added`, 'success');
      } catch {
        notify('Failed to add tag', 'error');
      }
    },
    [api, reload, notify],
  );

  const removeTag = useCallback(
    async (id) => {
      try {
        await api.deleteTag(id);
        setSelectedIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
        await reload();
        notify('Tag deleted', 'info');
      } catch {
        notify('Failed to delete tag', 'error');
      }
    },
    [api, reload, notify],
  );

  const toggleSelect = useCallback((id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const clearSelection = useCallback(() => setSelectedIds(new Set()), []);

  const requestSuggestions = useCallback(async () => {
    if (selectedIds.size === 0) return;
    setLoading(true);
    try {
      const created = await api.getSuggestions([...selectedIds]);
      await reload();
      notify(`${created.length} suggestion(s) added to graph`, 'success');
    } catch {
      notify('LLM request failed — check provider config and API key', 'error');
    } finally {
      setLoading(false);
    }
  }, [api, selectedIds, reload, notify]);

  const acceptSuggestion = useCallback(
    async (id) => {
      try {
        await api.acceptSuggestion(id);
        await reload();
        notify('Suggestion accepted!', 'success');
      } catch {
        notify('Failed to accept suggestion', 'error');
      }
    },
    [api, reload, notify],
  );

  const rejectSuggestion = useCallback(
    async (id) => {
      try {
        await api.rejectSuggestion(id);
        await reload();
        notify('Suggestion rejected', 'info');
      } catch {
        notify('Failed to reject suggestion', 'error');
      }
    },
    [api, reload, notify],
  );

  // ── derived data ──────────────────────────────────────────────────────────

  const suggestions = graphData.nodes.filter((n) => n.suggested);
  const selectedNodes = graphData.nodes.filter((n) => selectedIds.has(n.id));

  return {
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
  };
}
