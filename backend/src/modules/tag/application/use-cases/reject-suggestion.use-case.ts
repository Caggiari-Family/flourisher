import { Injectable } from '@nestjs/common';
import { TagRepositoryPort } from '../ports/tag-repository.port';

export class RejectSuggestionCommand {
  constructor(public readonly id: string) {}
}

@Injectable()
export class RejectSuggestionUseCase {
  constructor(private readonly tagRepo: TagRepositoryPort) {}

  execute(cmd: RejectSuggestionCommand): Promise<void> {
    return this.tagRepo.delete(cmd.id);
  }
}
