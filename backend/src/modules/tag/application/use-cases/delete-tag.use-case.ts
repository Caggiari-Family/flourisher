import { Injectable } from '@nestjs/common';
import { TagRepositoryPort } from '../ports/tag-repository.port';

export class DeleteTagCommand {
  constructor(public readonly id: string) {}
}

@Injectable()
export class DeleteTagUseCase {
  constructor(private readonly tagRepo: TagRepositoryPort) {}

  execute(cmd: DeleteTagCommand): Promise<void> {
    return this.tagRepo.deleteTag(cmd.id);
  }
}
