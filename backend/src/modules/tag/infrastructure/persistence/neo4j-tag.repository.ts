import { Injectable, NotFoundException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { Neo4jService } from '../../../../shared/neo4j/neo4j.service';
import {
  TagRepositoryPort,
  CreateTagInput,
  UpdateTagInput,
  CreateEdgeInput,
} from '../../application/ports/tag-repository.port';
import { Tag, Edge, Graph } from '../../domain/tag.entity';

@Injectable()
export class Neo4jTagRepository implements TagRepositoryPort {
  constructor(private readonly neo4j: Neo4jService) {}

  // ── Graph ─────────────────────────────────────────────────────────────────

  async findGraph(): Promise<Graph> {
    const [nodes, edges] = await Promise.all([
      this.findNodes(),
      this.findEdges(),
    ]);
    return { nodes, edges };
  }

  // ── Nodes ─────────────────────────────────────────────────────────────────

  async findNodes(): Promise<Tag[]> {
    const session = this.neo4j.getSession();
    try {
      const result = await session.run(
        'MATCH (n:Tag) RETURN n ORDER BY toLower(n.name)',
      );
      return result.records.map((r) => this.toTag(r.get('n').properties));
    } finally {
      await session.close();
    }
  }

  async findByIds(ids: string[]): Promise<Tag[]> {
    const session = this.neo4j.getSession();
    try {
      const result = await session.run(
        'MATCH (n:Tag) WHERE n.id IN $ids RETURN n',
        { ids },
      );
      return result.records.map((r) => this.toTag(r.get('n').properties));
    } finally {
      await session.close();
    }
  }

  async createTag(input: CreateTagInput): Promise<Tag> {
    const session = this.neo4j.getSession();
    try {
      const id = uuidv4();
      const result = await session.run(
        `CREATE (n:Tag {id: $id, name: $name, description: $description, suggested: $suggested})
         RETURN n`,
        { id, ...input },
      );
      return this.toTag(result.records[0].get('n').properties);
    } finally {
      await session.close();
    }
  }

  async updateTag(id: string, input: UpdateTagInput): Promise<Tag> {
    const session = this.neo4j.getSession();
    try {
      const setClauses = Object.keys(input)
        .map((k) => `n.${k} = $${k}`)
        .join(', ');
      const result = await session.run(
        `MATCH (n:Tag {id: $id}) SET ${setClauses} RETURN n`,
        { id, ...input },
      );
      if (result.records.length === 0) {
        throw new NotFoundException(`Tag ${id} not found`);
      }
      return this.toTag(result.records[0].get('n').properties);
    } finally {
      await session.close();
    }
  }

  async deleteTag(id: string): Promise<void> {
    const session = this.neo4j.getSession();
    try {
      await session.run('MATCH (n:Tag {id: $id}) DETACH DELETE n', { id });
    } finally {
      await session.close();
    }
  }

  // ── Edges ─────────────────────────────────────────────────────────────────

  async findEdges(): Promise<Edge[]> {
    const session = this.neo4j.getSession();
    try {
      const result = await session.run(
        `MATCH (a:Tag)-[r:RELATED_TO]->(b:Tag)
         RETURN coalesce(r.id, toString(elementId(r))) AS id, a.id AS source, b.id AS target, r.label AS label, r.status AS status`,
      );
      return result.records.map((r) => this.toEdge(r));
    } finally {
      await session.close();
    }
  }

  async createEdge(input: CreateEdgeInput): Promise<Edge> {
    const session = this.neo4j.getSession();
    try {
      const id = uuidv4();
      const label = input.label ?? '';
      const result = await session.run(
        `MATCH (a:Tag {id: $sourceId}), (b:Tag {id: $targetId})
         CREATE (a)-[r:RELATED_TO {id: $id, label: $label, status: ''}]->(b)
         RETURN r.id AS id, a.id AS source, b.id AS target, r.label AS label, r.status AS status`,
        { sourceId: input.sourceId, targetId: input.targetId, id, label },
      );
      if (result.records.length === 0) {
        throw new NotFoundException('One or both nodes not found');
      }
      return this.toEdge(result.records[0]);
    } finally {
      await session.close();
    }
  }

  async updateEdge(id: string, input: { label?: string; status?: string }): Promise<Edge> {
    const session = this.neo4j.getSession();
    try {
      const setClauses = Object.keys(input)
        .map((k) => `r.${k} = $${k}`)
        .join(', ');
      const result = await session.run(
        `MATCH (a:Tag)-[r:RELATED_TO {id: $id}]->(b:Tag)
         SET ${setClauses}
         RETURN coalesce(r.id, toString(elementId(r))) AS id, a.id AS source, b.id AS target, r.label AS label, r.status AS status`,
        { id, ...input },
      );
      if (result.records.length === 0) {
        throw new NotFoundException(`Edge ${id} not found`);
      }
      return this.toEdge(result.records[0]);
    } finally {
      await session.close();
    }
  }

  async deleteEdge(id: string): Promise<void> {
    const session = this.neo4j.getSession();
    try {
      await session.run('MATCH ()-[r:RELATED_TO {id: $id}]->() DELETE r', { id });
    } finally {
      await session.close();
    }
  }

  // ── Mappers ───────────────────────────────────────────────────────────────

  private toTag(p: Record<string, any>): Tag {
    return new Tag(p.id, p.name, p.description ?? '', p.suggested === true, p.status ?? '');
  }

  private toEdge(r: any): Edge {
    return {
      id: r.get('id'),
      source: r.get('source'),
      target: r.get('target'),
      label: r.get('label') ?? '',
      status: r.get('status') ?? '',
    };
  }
}
