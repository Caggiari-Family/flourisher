import { Tag } from '../../domain/tag.entity';

export interface SuggestionResult {
  name: string;
  description: string;
}

export abstract class SuggestionPort {
  abstract suggest(selectedTags: Tag[]): Promise<SuggestionResult[]>;
}
