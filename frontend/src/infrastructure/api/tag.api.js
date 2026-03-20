import { createApiClient } from './client';

/**
 * Builds the tag/edge API adapter bound to the given JWT token.
 *
 * @param {string} token  JWT access token
 */
export function createTagApi(token) {
  const client = createApiClient(token);

  return {
    // ── Graph ────────────────────────────────────────────────────────────
    fetchGraph: () => client.get('/graph'),

    // ── Nodes ────────────────────────────────────────────────────────────
    /** @param {boolean} [suggested=false]  Pass true for AI suggestion nodes */
    createTag: (name, description, suggested = false, embedding = undefined) =>
      client.post('/nodes', { name, description, suggested, embedding }),

    findSimilar: (embedding, excludeIds = [], limit = 5) =>
      client.post('/nodes/similar', { embedding, excludeIds, limit }),

    updateTag: (id, data) => client.put(`/nodes/${id}`, data),

    deleteTag: (id) => client.delete(`/nodes/${id}`),

    acceptSuggestion: (id) => client.put(`/nodes/${id}/accept`, {}),

    rejectSuggestion: (id) => client.delete(`/nodes/${id}/reject`),

    // ── Edges ────────────────────────────────────────────────────────────
    createEdge: (sourceId, targetId, label = '') =>
      client.post('/edges', { sourceId, targetId, label }),

    updateEdge: (id, label) => client.put(`/edges/${id}`, { label }),

    deleteEdge: (id) => client.delete(`/edges/${id}`),
  };
}
