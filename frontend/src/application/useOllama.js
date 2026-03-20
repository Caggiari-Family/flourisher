import { useState, useCallback } from 'react';
import { ollamaSuggest } from '../infrastructure/ollama/ollama.client';

const URL_KEY   = 'flourisher_ollama_url';
const MODEL_KEY = 'flourisher_ollama_model';

const DEFAULT_URL   = 'http://localhost:11434';
const DEFAULT_MODEL = 'llama3';

/**
 * Application-layer hook that manages Ollama configuration and exposes a
 * `getSuggestions` function for the graph layer to call.
 *
 * Settings are persisted to localStorage so they survive page reloads.
 */
export function useOllama() {
  const [ollamaUrl, setOllamaUrl] = useState(
    () => localStorage.getItem(URL_KEY) ?? DEFAULT_URL,
  );
  const [ollamaModel, setOllamaModel] = useState(
    () => localStorage.getItem(MODEL_KEY) ?? DEFAULT_MODEL,
  );

  const saveOllamaUrl = useCallback((url) => {
    localStorage.setItem(URL_KEY, url);
    setOllamaUrl(url);
  }, []);

  const saveOllamaModel = useCallback((model) => {
    localStorage.setItem(MODEL_KEY, model);
    setOllamaModel(model);
  }, []);

  const getSuggestions = useCallback(
    (selectedTags) => ollamaSuggest(ollamaUrl, ollamaModel, selectedTags),
    [ollamaUrl, ollamaModel],
  );

  return {
    ollamaUrl,
    ollamaModel,
    saveOllamaUrl,
    saveOllamaModel,
    getSuggestions,
  };
}
