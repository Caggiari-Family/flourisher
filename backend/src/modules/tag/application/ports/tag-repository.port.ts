import { Tag, Edge, Graph } from '../../domain/tag.entity';

export interface CreateTagInput {
  name: string;
  description: string;
  suggested: boolean;
}

export interface UpdateTagInput {
  name?: string;
  description?: string;
  suggested?: boolean;
  status?: string;
}

export interface CreateEdgeInput {
  sourceId: string;
  targetId: string;
  label?: string;
}

export abstract class TagRepositoryPort {
  abstract findGraph(): Promise<Graph>;
  abstract findNodes(): Promise<Tag[]>;
  abstract findEdges(): Promise<Edge[]>;
  abstract findByIds(ids: string[]): Promise<Tag[]>;
  abstract createTag(input: CreateTagInput): Promise<Tag>;
  abstract updateTag(id: string, input: UpdateTagInput): Promise<Tag>;
  abstract deleteTag(id: string): Promise<void>;
  abstract createEdge(input: CreateEdgeInput): Promise<Edge>;
  abstract updateEdge(id: string, input: { label?: string; status?: string }): Promise<Edge>;
  abstract deleteEdge(id: string): Promise<void>;
}
