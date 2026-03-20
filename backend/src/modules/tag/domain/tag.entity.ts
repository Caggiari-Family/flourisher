export class Tag {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly description: string,
    public readonly suggested: boolean,
  ) {}

  accept(): Tag {
    return new Tag(this.id, this.name, this.description, false);
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
