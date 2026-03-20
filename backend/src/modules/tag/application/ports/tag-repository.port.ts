import { Tag, Graph } from '../../domain/tag.entity';

export interface CreateTagInput {
  name: string;
  description: string;
  suggested: boolean;
}

export interface CreateEdgeInput {
  sourceId: string;
  targetId: string;
}

export abstract class TagRepositoryPort {
  abstract findGraph(): Promise<Graph>;
  abstract findByIds(ids: string[]): Promise<Tag[]>;
  abstract create(input: CreateTagInput): Promise<Tag>;
  abstract createEdge(input: CreateEdgeInput): Promise<void>;
  abstract setSuggested(id: string, suggested: boolean): Promise<Tag>;
  abstract delete(id: string): Promise<void>;
}
