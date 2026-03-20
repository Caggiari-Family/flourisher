import { createApiClient } from './client';

/**
 * Builds the tag API adapter bound to the given JWT token.
 * @param {string} token
 */
export function createTagApi(token) {
  const client = createApiClient(token);

  return {
    fetchGraph: () => client.get('/graph'),

    createTag: (name, description) =>
      client.post('/graph/nodes', { name, description }),

    deleteTag: (id) => client.delete(`/graph/nodes/${id}`),

    acceptSuggestion: (id) => client.post(`/graph/nodes/${id}/accept`, {}),

    rejectSuggestion: (id) => client.delete(`/graph/nodes/${id}/reject`),

    getSuggestions: (nodeIds) => client.post('/llm/suggest', { nodeIds }),
  };
}
