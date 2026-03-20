import { Injectable, Logger } from '@nestjs/common';
import Anthropic from '@anthropic-ai/sdk';
import {
  SuggestionPort,
  SuggestionResult,
} from '../../application/ports/suggestion.port';
import { Tag } from '../../domain/tag.entity';

@Injectable()
export class AnthropicAdapter implements SuggestionPort {
  private readonly logger = new Logger(AnthropicAdapter.name);
  private readonly client: Anthropic;

  constructor() {
    this.client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }

  async suggest(selectedTags: Tag[]): Promise<SuggestionResult[]> {
    const tagList = selectedTags
      .map((t) => `- ${t.name}${t.description ? ` (${t.description})` : ''}`)
      .join('\n');

    const response = await this.client.messages.create({
      model: process.env.ANTHROPIC_MODEL ?? 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      messages: [{ role: 'user', content: this.buildPrompt(tagList) }],
    });

    const text =
      response.content[0].type === 'text' ? response.content[0].text : '[]';
    this.logger.debug(`Anthropic response: ${text}`);
    return this.parseJson(text);
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
      this.logger.warn(`Could not parse LLM response as JSON: ${raw}`);
      return [];
    }
  }
}
