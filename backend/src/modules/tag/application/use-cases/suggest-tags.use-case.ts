import { Injectable } from '@nestjs/common';
import { TagRepositoryPort } from '../ports/tag-repository.port';
import { SuggestionPort } from '../ports/suggestion.port';
import { Tag } from '../../domain/tag.entity';

export class SuggestTagsCommand {
  constructor(public readonly sourceNodeIds: string[]) {}
}

@Injectable()
export class SuggestTagsUseCase {
  constructor(
    private readonly tagRepo: TagRepositoryPort,
    private readonly suggestionPort: SuggestionPort,
  ) {}

  async execute(cmd: SuggestTagsCommand): Promise<Tag[]> {
    const selectedTags = await this.tagRepo.findByIds(cmd.sourceNodeIds);
    if (selectedTags.length === 0) return [];

    const suggestions = await this.suggestionPort.suggest(selectedTags);

    const created: Tag[] = [];
    for (const s of suggestions) {
      const tag = await this.tagRepo.create({
        name: s.name,
        description: s.description,
        suggested: true,
      });
      for (const sourceId of cmd.sourceNodeIds) {
        await this.tagRepo.createEdge({ sourceId, targetId: tag.id });
      }
      created.push(tag);
    }
    return created;
  }
}
