export class Tag {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly description: string,
    public readonly suggested: boolean,
    public readonly embedding?: number[],
  ) {}

  accept(): Tag {
    return new Tag(this.id, this.name, this.description, false, this.embedding);
  }
}

export interface Edge {
  id: string;
  source: string;
  target: string;
  label: string;
}

export interface Graph {
  nodes: Tag[];
  edges: Edge[];
}
