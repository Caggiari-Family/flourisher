import { Injectable } from '@nestjs/common';
import { TagRepositoryPort } from '../ports/tag-repository.port';
import { Graph } from '../../domain/tag.entity';

@Injectable()
export class GetGraphUseCase {
  constructor(private readonly tagRepo: TagRepositoryPort) {}

  execute(): Promise<Graph> {
    return this.tagRepo.findGraph();
  }
}
