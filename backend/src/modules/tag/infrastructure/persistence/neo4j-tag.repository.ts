import { Injectable, NotFoundException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { Neo4jService } from '../../../../shared/neo4j/neo4j.service';
import {
  TagRepositoryPort,
  CreateTagInput,
  CreateEdgeInput,
} from '../../application/ports/tag-repository.port';
import { Tag, Edge, Graph } from '../../domain/tag.entity';

@Injectable()
export class Neo4jTagRepository implements TagRepositoryPort {
  constructor(private readonly neo4j: Neo4jService) {}

  async findGraph(): Promise<Graph> {
    const session = this.neo4j.getSession();
    try {
      const [nodesResult, edgesResult] = await Promise.all([
        session.run('MATCH (n:Tag) RETURN n ORDER BY toLower(n.name)'),
        session.run(
          'MATCH (a:Tag)-[r:RELATED_TO]->(b:Tag) RETURN a.id AS source, b.id AS target, r.id AS id',
        ),
      ]);

      const nodes = nodesResult.records.map((r) =>
        this.recordToTag(r.get('n').properties),
      );

      const edges: Edge[] = edgesResult.records.map((r) => ({
        id: r.get('id'),
        source: r.get('source'),
        target: r.get('target'),
      }));

      return { nodes, edges };
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
      return result.records.map((r) => this.recordToTag(r.get('n').properties));
    } finally {
      await session.close();
    }
  }

  async create(input: CreateTagInput): Promise<Tag> {
    const session = this.neo4j.getSession();
    try {
      const id = uuidv4();
      const result = await session.run(
        'CREATE (n:Tag {id: $id, name: $name, description: $description, suggested: $suggested}) RETURN n',
        { id, ...input },
      );
      return this.recordToTag(result.records[0].get('n').properties);
    } finally {
      await session.close();
    }
  }

  async createEdge(input: CreateEdgeInput): Promise<void> {
    const session = this.neo4j.getSession();
    try {
      await session.run(
        `MATCH (a:Tag {id: $sourceId}), (b:Tag {id: $targetId})
         CREATE (a)-[:RELATED_TO {id: $id}]->(b)`,
        { sourceId: input.sourceId, targetId: input.targetId, id: uuidv4() },
      );
    } finally {
      await session.close();
    }
  }

  async setSuggested(id: string, suggested: boolean): Promise<Tag> {
    const session = this.neo4j.getSession();
    try {
      const result = await session.run(
        'MATCH (n:Tag {id: $id}) SET n.suggested = $suggested RETURN n',
        { id, suggested },
      );
      if (result.records.length === 0) {
        throw new NotFoundException(`Tag ${id} not found`);
      }
      return this.recordToTag(result.records[0].get('n').properties);
    } finally {
      await session.close();
    }
  }

  async delete(id: string): Promise<void> {
    const session = this.neo4j.getSession();
    try {
      await session.run('MATCH (n:Tag {id: $id}) DETACH DELETE n', { id });
    } finally {
      await session.close();
    }
  }

  private recordToTag(p: Record<string, any>): Tag {
    return new Tag(p.id, p.name, p.description ?? '', p.suggested === true);
  }
}
