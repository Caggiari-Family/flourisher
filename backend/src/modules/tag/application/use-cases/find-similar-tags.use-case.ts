import { Injectable } from '@nestjs/common';
import { TagRepositoryPort } from '../ports/tag-repository.port';
import { Tag } from '../../domain/tag.entity';

export class FindSimilarTagsCommand {
  constructor(
    public readonly embedding: number[],
    public readonly excludeIds: string[],
    public readonly limit: number = 5,
  ) {}
}

@Injectable()
export class FindSimilarTagsUseCase {
  constructor(private readonly tagRepo: TagRepositoryPort) {}

  execute(cmd: FindSimilarTagsCommand): Promise<Tag[]> {
    return this.tagRepo.findSimilar(cmd.embedding, cmd.excludeIds, cmd.limit);
  }
}
