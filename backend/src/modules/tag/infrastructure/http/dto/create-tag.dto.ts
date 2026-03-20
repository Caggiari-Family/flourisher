export class CreateTagDto {
  name: string;
  description?: string;
  /** When true the node is treated as a pending suggestion (shown in grey). */
  suggested?: boolean;
}
