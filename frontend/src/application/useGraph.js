import { useState, useCallback, useEffect, useMemo } from 'react';
import { createTagApi } from '../infrastructure/api/tag.api';

/**
 * @param {string}   token           JWT access token
 * @param {Function} getSuggestions  (selectedTags) => Promise<{name,description}[]>
 * @param {Function} getFlourish     (nodes, edges) => Promise<{source,target}[]>
 */
export function useGraph(token, getSuggestions, getFlourish) {
  const api = useMemo(() => createTagApi(token), [token]);

  const [graphData, setGraphData]     = useState({ nodes: [], edges: [] });
  const [selectedIds, setSelectedIds] = useState(new Set());
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
      await api.createTag(name, description);
      await reload();
      notify(`"${name}" added`, 'success');
    } catch {
      notify('Failed to add tag', 'error');
    }
  }, [api, reload, notify]);

  const removeTag = useCallback(async (id) => {
    try {
      await api.deleteTag(id);
      setSelectedIds((prev) => { const n = new Set(prev); n.delete(id); return n; });
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

  // ── Suggest ───────────────────────────────────────────────────────────────

  const requestSuggestions = useCallback(async () => {
    if (selectedIds.size === 0 || !getSuggestions) return;

    const selectedNodes = graphData.nodes.filter((n) => selectedIds.has(n.id));
    setLoading(true);
    try {
      const suggestions = await getSuggestions(selectedNodes);

      for (const s of suggestions) {
        const tag = await api.createTag(s.name, s.description ?? '', true);
        for (const sourceId of selectedIds) {
          await api.createEdge(sourceId, tag.id, 'suggests');
        }
      }

      await reload();
      notify(`${suggestions.length} suggestion(s) added to graph`, 'success');
    } catch (err) {
      notify(`Suggestion failed: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  }, [api, graphData.nodes, selectedIds, getSuggestions, reload, notify]);

  // ── Flourish ──────────────────────────────────────────────────────────────

  const requestFlourish = useCallback(async () => {
    if (!getFlourish) return;

    const { nodes, edges } = graphData;
    if (nodes.filter((n) => !n.suggested).length === 0) return;

    // Build name-resolved edges for the prompt
    const nodeById = Object.fromEntries(nodes.map((n) => [n.id, n]));
    const resolvedEdges = edges
      .map((e) => ({
        sourceName: nodeById[e.source]?.name,
        targetName: nodeById[e.target]?.name,
      }))
      .filter((e) => e.sourceName && e.targetName);

    setLoading(true);
    try {
      // Ask Ollama for new edges (source/target are tag names, possibly new)
      const newEdges = await getFlourish(nodes.filter((n) => !n.suggested), resolvedEdges);

      // Build a name→id map of existing permanent nodes
      const nameToId = Object.fromEntries(
        nodes.filter((n) => !n.suggested).map((n) => [n.name.toLowerCase(), n.id]),
      );

      // Create new suggested nodes for names not yet in the graph
      const createdIds = { ...nameToId };
      const newNames = new Set(
        newEdges.flatMap((e) => [e.source, e.target])
          .filter((name) => !createdIds[name?.toLowerCase()]),
      );

      for (const name of newNames) {
        if (!name) continue;
        const tag = await api.createTag(name, '', true);
        createdIds[name.toLowerCase()] = tag.id;
      }

      // Create the suggested edges (only if at least one end is an existing permanent node)
      let edgeCount = 0;
      for (const e of newEdges) {
        const srcKey = e.source?.toLowerCase();
        const tgtKey = e.target?.toLowerCase();
        const srcId = createdIds[srcKey];
        const tgtId = createdIds[tgtKey];
        const srcIsExisting = !!nameToId[srcKey];
        const tgtIsExisting = !!nameToId[tgtKey];
        if (srcId && tgtId && srcId !== tgtId && (srcIsExisting || tgtIsExisting)) {
          await api.createEdge(srcId, tgtId, 'flourish');
          edgeCount++;
        }
      }

      await reload();
      notify(`Flourish: ${newNames.size} new tag(s), ${edgeCount} edge(s) added`, 'success');
    } catch (err) {
      notify(`Flourish failed: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  }, [api, graphData, getFlourish, reload, notify]);

  // ── accept / reject ───────────────────────────────────────────────────────

  const acceptSuggestion = useCallback(async (id) => {
    try {
      await api.acceptSuggestion(id);
      await reload();
      notify('Suggestion accepted!', 'success');
    } catch {
      notify('Failed to accept suggestion', 'error');
    }
  }, [api, reload, notify]);

  const rejectSuggestion = useCallback(async (id) => {
    try {
      await api.rejectSuggestion(id);
      await reload();
      notify('Suggestion rejected', 'info');
    } catch {
      notify('Failed to reject suggestion', 'error');
    }
  }, [api, reload, notify]);

  // ── derived ───────────────────────────────────────────────────────────────

  const suggestions   = graphData.nodes.filter((n) => n.suggested);
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
    requestFlourish,
    acceptSuggestion,
    rejectSuggestion,
  };
}
