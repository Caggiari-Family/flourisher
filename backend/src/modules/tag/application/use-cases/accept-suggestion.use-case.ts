import { Injectable } from '@nestjs/common';
import { TagRepositoryPort } from '../ports/tag-repository.port';
import { Tag } from '../../domain/tag.entity';

export class AcceptSuggestionCommand {
  constructor(public readonly id: string) {}
}

@Injectable()
export class AcceptSuggestionUseCase {
  constructor(private readonly tagRepo: TagRepositoryPort) {}

  execute(cmd: AcceptSuggestionCommand): Promise<Tag> {
    return this.tagRepo.setSuggested(cmd.id, false);
  }
}
