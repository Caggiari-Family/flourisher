import { Injectable } from '@nestjs/common';
import { TagRepositoryPort } from '../ports/tag-repository.port';
import { Edge } from '../../domain/tag.entity';

export class UpdateEdgeCommand {
  constructor(
    public readonly id: string,
    public readonly label: string,
  ) {}
}

@Injectable()
export class UpdateEdgeUseCase {
  constructor(private readonly tagRepo: TagRepositoryPort) {}

  execute(cmd: UpdateEdgeCommand): Promise<Edge> {
    return this.tagRepo.updateEdge(cmd.id, cmd.label);
  }
}
