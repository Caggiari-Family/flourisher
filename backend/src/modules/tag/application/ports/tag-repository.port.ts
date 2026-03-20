import { Tag, Edge, Graph } from '../../domain/tag.entity';

export interface CreateTagInput {
  name: string;
  description: string;
  suggested: boolean;
  embedding?: number[];
}

export interface UpdateTagInput {
  name?: string;
  description?: string;
  suggested?: boolean;
  embedding?: number[];
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
  abstract updateEdge(id: string, label: string): Promise<Edge>;
  abstract deleteEdge(id: string): Promise<void>;
  abstract findSimilar(embedding: number[], excludeIds: string[], limit: number): Promise<Tag[]>;
}
