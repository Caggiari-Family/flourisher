import { Injectable } from '@nestjs/common';
import { TagRepositoryPort } from '../ports/tag-repository.port';
import { Edge } from '../../domain/tag.entity';

export class CreateEdgeCommand {
  constructor(
    public readonly sourceId: string,
    public readonly targetId: string,
    public readonly label: string = '',
  ) {}
}

@Injectable()
export class CreateEdgeUseCase {
  constructor(private readonly tagRepo: TagRepositoryPort) {}

  execute(cmd: CreateEdgeCommand): Promise<Edge> {
    return this.tagRepo.createEdge({
      sourceId: cmd.sourceId,
      targetId: cmd.targetId,
      label: cmd.label,
    });
  }
}
