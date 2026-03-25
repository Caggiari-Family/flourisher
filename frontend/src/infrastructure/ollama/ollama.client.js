/**
 * Thin adapter that talks to a local Ollama instance.
 *
 * The Ollama server must have CORS enabled for the browser origin.
 * Set the env variable on the Ollama process:
 *   OLLAMA_ORIGINS=* ollama serve
 */

const PROMPTS = {
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

/**
 * Ask Ollama for tag suggestions based on selected nodes.
 *
 * @param {string} baseUrl      e.g. "http://localhost:11434"
 * @param {string} model        e.g. "qwen2.5:3b"
 * @param {{ name: string, description: string }[]} selectedTags
 * @param {'en'|'fr'} language
 * @returns {Promise<{ name: string, description: string }[]>}
 */
export async function ollamaSuggest(baseUrl, model, selectedTags, language = 'en') {
  const systemPrompt = PROMPTS[language] ?? PROMPTS.en;

  const tagList = selectedTags
    .map((t) => `- ${t.name}${t.description ? ` (${t.description})` : ''}`)
    .join('\n');

  const prompt = `${systemPrompt}

Selected tags:
${tagList}`;

  const res = await fetch(`${baseUrl}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, prompt, stream: false }),
  });

  if (!res.ok) {
    throw new Error(
      `Ollama responded with ${res.status}. Is it running at ${baseUrl}?`,
    );
  }

  const data = await res.json();
  return parseJsonResponse(data.response ?? '[]');
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
