import { Injectable, Logger } from '@nestjs/common';
import {
  SuggestionPort,
  SuggestionResult,
} from '../../application/ports/suggestion.port';
import { Tag } from '../../domain/tag.entity';

@Injectable()
export class OllamaAdapter implements SuggestionPort {
  private readonly logger = new Logger(OllamaAdapter.name);

  async suggest(selectedTags: Tag[]): Promise<SuggestionResult[]> {
    const url = process.env.OLLAMA_URL ?? 'http://ollama:11434';
    const model = process.env.OLLAMA_MODEL ?? 'llama3';

    const tagList = selectedTags
      .map((t) => `- ${t.name}${t.description ? ` (${t.description})` : ''}`)
      .join('\n');

    const res = await fetch(`${url}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        prompt: this.buildPrompt(tagList),
        stream: false,
      }),
    });

    if (!res.ok) {
      throw new Error(`Ollama error: ${res.status} ${res.statusText}`);
    }

    const data = (await res.json()) as { response: string };
    this.logger.debug(`Ollama response: ${data.response}`);
    return this.parseJson(data.response ?? '[]');
  }

  private buildPrompt(tagList: string): string {
    return `You are a creative assistant helping to build a concept map of related tags and ideas.

Selected tags:
${tagList}

Based on these tags, suggest 5-8 related tags/concepts that complement or connect these ideas.
Return ONLY a valid JSON array with "name" (1-3 words) and "description" (max 20 words) fields.
No markdown fences, no explanation — just the raw JSON array.

Example: [{"name":"painting","description":"Traditional visual art using pigments on a surface"}]`;
  }

  private parseJson(raw: string): SuggestionResult[] {
    try {
      return JSON.parse(raw);
    } catch {
      const match = raw.match(/\[[\s\S]*\]/);
      if (match) return JSON.parse(match[0]);
      this.logger.warn(`Could not parse Ollama response as JSON: ${raw}`);
      return [];
    }
  }
}
