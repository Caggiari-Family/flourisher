/**
 * Thin adapter that talks to a local Ollama instance.
 *
 * The Ollama server must have CORS enabled for the browser origin.
 * Set the env variable on the Ollama process:
 *   OLLAMA_ORIGINS=* ollama serve
 */

// ── Suggest prompts ────────────────────────────────────────────────────────
// Given selected tags → propose new related tags (name + description).

const SUGGEST_PROMPTS = {
  en: `You are a creative assistant helping to build a concept map of related tags and ideas.
When given a list of selected tags, suggest 5-8 related tags/concepts that complement or connect those ideas.
Return ONLY a valid JSON array with "name" (1-3 words) and "description" (max 20 words) fields.
No markdown fences, no explanation — just the raw JSON array.
Example: [{"name":"painting","description":"Traditional visual art using pigments on a surface"}]`,

  fr: `Tu es un assistant créatif qui aide à construire une carte conceptuelle de tags et d'idées liées.
À partir d'une liste de tags sélectionnés, propose 5 à 8 nouveaux tags/concepts qui complètent ou relient ces idées.
Réponds UNIQUEMENT avec un tableau JSON valide avec les champs "name" (1 à 3 mots en français) et "description" (20 mots maximum en français).
Pas de balises markdown, pas d'explication — uniquement le tableau JSON brut.
Exemple : [{"name":"peinture","description":"Art visuel traditionnel utilisant des pigments sur une surface"}]`,
};

// ── Flourish prompts ───────────────────────────────────────────────────────
// Given the full graph structure → propose new edges (and implicitly new tags).

const FLOURISH_PROMPTS = {
  en: `You are a creative assistant that expands knowledge graphs.
Given a graph of tags and their relationships, suggest new connections that would enrich it.
Return ONLY a valid JSON array of edges: [{"source": "tag name", "target": "tag name"}].
- source and target can be existing tags OR brand new tags not in the graph
- suggest 4-7 new connections
- new tag names should be 1-3 words
No markdown, no explanation — just the raw JSON array.
Example: [{"source":"painting","target":"color theory"},{"source":"perspective","target":"drawing"}]`,

  fr: `Tu es un assistant créatif qui enrichit des graphes de connaissances.
À partir d'un graphe de tags et de leurs relations, propose de nouvelles connexions pour l'enrichir.
Réponds UNIQUEMENT avec un tableau JSON d'arêtes : [{"source": "nom du tag", "target": "nom du tag"}].
- source et target peuvent être des tags existants OU de nouveaux tags absents du graphe
- propose 4 à 7 nouvelles connexions
- les nouveaux noms de tags doivent faire 1 à 3 mots en français
Pas de markdown, pas d'explication — uniquement le tableau JSON brut.
Exemple : [{"source":"peinture","target":"théorie des couleurs"},{"source":"perspective","target":"dessin"}]`,
};

// ── Helpers ────────────────────────────────────────────────────────────────

async function generate(baseUrl, model, prompt) {
  const res = await fetch(`${baseUrl}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, prompt, stream: false }),
  });
  if (!res.ok) {
    throw new Error(`Ollama responded with ${res.status}. Is it running at ${baseUrl}?`);
  }
  const data = await res.json();
  return data.response ?? '[]';
}

function parseJsonResponse(raw) {
  try {
    return JSON.parse(raw);
  } catch {
    const match = raw.match(/\[[\s\S]*\]/);
    if (match) return JSON.parse(match[0]);
    throw new Error(`Could not parse Ollama response as JSON: ${raw.slice(0, 200)}`);
  }
}

// ── Public API ─────────────────────────────────────────────────────────────

/**
 * Suggest new tags from a selection.
 * Returns [{name, description}]
 */
export async function ollamaSuggest(baseUrl, model, selectedTags, language = 'en') {
  const systemPrompt = SUGGEST_PROMPTS[language] ?? SUGGEST_PROMPTS.en;
  const tagList = selectedTags
    .map((t) => `- ${t.name}${t.description ? ` (${t.description})` : ''}`)
    .join('\n');

  const raw = await generate(baseUrl, model, `${systemPrompt}\n\nSelected tags:\n${tagList}`);
  return parseJsonResponse(raw);
}

/**
 * Flourish: expand the graph by proposing new edges (and implicitly new tags).
 * Returns [{source: string, target: string}]
 *
 * @param {{ name: string }[]} nodes   all nodes in the graph
 * @param {{ source: string, target: string, label?: string }[]} edges  resolved by name
 */
export async function ollamaFlourish(baseUrl, model, nodes, edges, language = 'en') {
  const systemPrompt = FLOURISH_PROMPTS[language] ?? FLOURISH_PROMPTS.en;

  const nodeNames = nodes.map((n) => n.name).join(', ');
  const edgeLines = edges.map((e) => `${e.sourceName} -> ${e.targetName}`).join('\n');

  const graphDump = `Tags: ${nodeNames}\n${edgeLines ? `Edges:\n${edgeLines}` : 'Edges: none'}`;

  const raw = await generate(baseUrl, model, `${systemPrompt}\n\nGraph:\n${graphDump}`);
  return parseJsonResponse(raw);
}
