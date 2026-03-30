import { Injectable } from '@nestjs/common';
import { TagRepositoryPort } from '../ports/tag-repository.port';
import { Edge } from '../../domain/tag.entity';

export class UpdateEdgeCommand {
  constructor(
    public readonly id: string,
    public readonly label?: string,
    public readonly status?: string,
  ) {}
}

@Injectable()
export class UpdateEdgeUseCase {
  constructor(private readonly tagRepo: TagRepositoryPort) {}

  execute(cmd: UpdateEdgeCommand): Promise<Edge> {
    const input: { label?: string; status?: string } = {};
    if (cmd.label !== undefined) input.label = cmd.label;
    if (cmd.status !== undefined) input.status = cmd.status;
    return this.tagRepo.updateEdge(cmd.id, input);
  }
}
