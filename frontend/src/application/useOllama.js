import { useState, useCallback } from 'react';
import { ollamaSuggest } from '../infrastructure/ollama/ollama.client';

const URL_KEY      = 'flourisher_ollama_url';
const MODEL_KEY    = 'flourisher_ollama_model';
const LANGUAGE_KEY = 'flourisher_language';

const DEFAULT_URL      = 'http://localhost:11434';
const DEFAULT_MODEL    = 'qwen2.5:3b';
const DEFAULT_LANGUAGE = 'en';

export function useOllama() {
  const [ollamaUrl, setOllamaUrl] = useState(
    () => localStorage.getItem(URL_KEY) ?? DEFAULT_URL,
  );
  const [ollamaModel, setOllamaModel] = useState(
    () => localStorage.getItem(MODEL_KEY) ?? DEFAULT_MODEL,
  );
  const [language, setLanguage] = useState(
    () => localStorage.getItem(LANGUAGE_KEY) ?? DEFAULT_LANGUAGE,
  );

  const saveOllamaUrl = useCallback((url) => {
    localStorage.setItem(URL_KEY, url);
    setOllamaUrl(url);
  }, []);

  const saveOllamaModel = useCallback((model) => {
    localStorage.setItem(MODEL_KEY, model);
    setOllamaModel(model);
  }, []);

  const saveLanguage = useCallback((lang) => {
    localStorage.setItem(LANGUAGE_KEY, lang);
    setLanguage(lang);
  }, []);

  const getSuggestions = useCallback(
    (selectedTags) => ollamaSuggest(ollamaUrl, ollamaModel, selectedTags, language),
    [ollamaUrl, ollamaModel, language],
  );

  return {
    ollamaUrl,
    ollamaModel,
    language,
    saveOllamaUrl,
    saveOllamaModel,
    saveLanguage,
    getSuggestions,
  };
}
