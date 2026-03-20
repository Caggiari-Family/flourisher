/**
 * Thin adapter that calls the Ollama embedding API.
 *
 * The Ollama server must have CORS enabled for the browser origin:
 *   OLLAMA_ORIGINS=* ollama serve          (local dev)
 *   OLLAMA_ORIGINS=https://yourapp.com     (production)
 *
 * Tested with qwen3-embedding:0.6b — any Ollama embedding model works.
 */

/**
 * Generate an embedding vector for a single piece of text.
 *
 * @param {string} baseUrl   e.g. "http://localhost:11434"
 * @param {string} model     e.g. "qwen3-embedding:0.6b"
 * @param {string} text      The text to embed
 * @returns {Promise<number[]>}
 */
export async function ollamaEmbed(baseUrl, model, text) {
  const res = await fetch(`${baseUrl}/api/embed`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, input: text }),
  });

  if (!res.ok) {
    throw new Error(
      `Ollama embed failed with ${res.status}. Is it running at ${baseUrl}?`,
    );
  }

  const data = await res.json();
  // Ollama returns { embeddings: [[...]] } — take the first vector
  return data.embeddings[0];
}
