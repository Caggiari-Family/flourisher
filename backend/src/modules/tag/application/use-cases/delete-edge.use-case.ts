import { Injectable } from '@nestjs/common';
import { TagRepositoryPort } from '../ports/tag-repository.port';

export class DeleteEdgeCommand {
  constructor(public readonly id: string) {}
}

@Injectable()
export class DeleteEdgeUseCase {
  constructor(private readonly tagRepo: TagRepositoryPort) {}

  execute(cmd: DeleteEdgeCommand): Promise<void> {
    return this.tagRepo.deleteEdge(cmd.id);
  }
}
