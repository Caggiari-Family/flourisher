import { useState, useCallback, useEffect, useMemo } from 'react';
import { createTagApi } from '../infrastructure/api/tag.api';

/**
 * Application-layer hook that manages the graph state and orchestrates all
 * tag / edge / suggestion operations.
 *
 * @param {string}   token        JWT access token
 * @param {Function} getEmbedding (text: string) => Promise<number[]>
 *                                Injected so this hook stays agnostic of the
 *                                embedding provider (Ollama, future providers…)
 */
export function useGraph(token, getEmbedding) {
  const api = useMemo(() => createTagApi(token), [token]);

  const [graphData, setGraphData]     = useState({ nodes: [], edges: [] });
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [suggestions, setSuggestions] = useState([]);  // similar existing Tag[]
  const [loading, setLoading]         = useState(false);
  const [toast, setToast]             = useState(null);

  // ── helpers ───────────────────────────────────────────────────────────────

  const notify = useCallback((msg, type = 'info') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  const reload = useCallback(async () => {
    try {
      const data = await api.fetchGraph();
      setGraphData(data);
    } catch {
      notify('Could not load graph — is the backend running?', 'error');
    }
  }, [api, notify]);

  useEffect(() => { reload(); }, [reload]);

  // ── node operations ───────────────────────────────────────────────────────

  const addTag = useCallback(async (name, description) => {
    try {
      // Create the tag first so the user doesn't wait for embedding
      const tag = await api.createTag(name, description);

      // Embed in the background and persist — failure is non-fatal
      if (getEmbedding) {
        getEmbedding(`${name}${description ? ': ' + description : ''}`)
          .then((embedding) => api.updateTag(tag.id, { embedding }))
          .catch(() => { /* embedding optional */ });
      }

      await reload();
      notify(`"${name}" added`, 'success');
    } catch {
      notify('Failed to add tag', 'error');
    }
  }, [api, getEmbedding, reload, notify]);

  const removeTag = useCallback(async (id) => {
    try {
      await api.deleteTag(id);
      setSelectedIds((prev) => { const n = new Set(prev); n.delete(id); return n; });
      setSuggestions((prev) => prev.filter((s) => s.id !== id));
      await reload();
      notify('Tag deleted', 'info');
    } catch {
      notify('Failed to delete tag', 'error');
    }
  }, [api, reload, notify]);

  const toggleSelect = useCallback((id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const clearSelection = useCallback(() => setSelectedIds(new Set()), []);

  // ── edge operations ───────────────────────────────────────────────────────

  const linkSelectedNodes = useCallback(async () => {
    const ids = [...selectedIds];
    if (ids.length < 2) return;
    try {
      for (let i = 0; i < ids.length - 1; i++) {
        await api.createEdge(ids[i], ids[i + 1]);
      }
      await reload();
      notify(`${ids.length - 1} edge(s) created`, 'success');
    } catch {
      notify('Failed to create edge(s)', 'error');
    }
  }, [api, selectedIds, reload, notify]);

  const removeEdge = useCallback(async (id) => {
    try {
      await api.deleteEdge(id);
      await reload();
      notify('Edge deleted', 'info');
    } catch {
      notify('Failed to delete edge', 'error');
    }
  }, [api, reload, notify]);

  // ── embedding-based suggestions ───────────────────────────────────────────

  const requestSuggestions = useCallback(async () => {
    if (selectedIds.size === 0 || !getEmbedding) return;

    const selected   = graphData.nodes.filter((n) =>  selectedIds.has(n.id));
    const candidates = graphData.nodes.filter((n) => !selectedIds.has(n.id));

    if (candidates.length === 0) {
      notify('Add more tags before searching for similar ones', 'info');
      return;
    }

    setLoading(true);
    try {
      const nodeText = (n) =>
        `${n.name}${n.description ? ': ' + n.description : ''}`;

      // Embed selected nodes (use stored vector when available)
      const selectedVectors = await Promise.all(
        selected.map((n) => n.embedding ?? getEmbedding(nodeText(n))),
      );

      // Mean of selected embeddings
      const dim  = selectedVectors[0].length;
      const mean = Array.from({ length: dim }, (_, i) =>
        selectedVectors.reduce((sum, v) => sum + v[i], 0) / selectedVectors.length,
      );

      // Embed every candidate (use stored vector, or generate + save back)
      const candidateVectors = await Promise.all(
        candidates.map(async (n) => {
          if (n.embedding) return n.embedding;
          const emb = await getEmbedding(nodeText(n));
          // Persist silently so future searches are faster
          api.updateTag(n.id, { embedding: emb }).catch(() => {});
          return emb;
        }),
      );

      // Cosine similarity
      const cosine = (a, b) => {
        let dot = 0, na = 0, nb = 0;
        for (let i = 0; i < a.length; i++) {
          dot += a[i] * b[i];
          na  += a[i] * a[i];
          nb  += b[i] * b[i];
        }
        return dot / (Math.sqrt(na) * Math.sqrt(nb));
      };

      const scored = candidates
        .map((n, i) => ({ node: n, score: cosine(mean, candidateVectors[i]) }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 5)
        .map(({ node }) => node);

      setSuggestions(scored);
      notify(`${scored.length} similar tag(s) found`, 'success');
    } catch (err) {
      notify(`Suggestion failed: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  }, [api, graphData.nodes, selectedIds, getEmbedding, notify]);

  /**
   * Accept a suggestion: create edges from every selected node to the
   * suggested node, then remove it from the suggestions list.
   */
  const acceptSuggestion = useCallback(async (id) => {
    try {
      for (const sourceId of selectedIds) {
        await api.createEdge(sourceId, id, 'similar');
      }
      setSuggestions((prev) => prev.filter((s) => s.id !== id));
      await reload();
      notify('Edge(s) created!', 'success');
    } catch {
      notify('Failed to accept suggestion', 'error');
    }
  }, [api, selectedIds, reload, notify]);

  /** Reject a suggestion: dismiss it locally, no backend call needed. */
  const rejectSuggestion = useCallback((id) => {
    setSuggestions((prev) => prev.filter((s) => s.id !== id));
  }, []);

  // ── derived ───────────────────────────────────────────────────────────────

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
    linkSelectedNodes,
    removeEdge,
    requestSuggestions,
    acceptSuggestion,
    rejectSuggestion,
  };
}
