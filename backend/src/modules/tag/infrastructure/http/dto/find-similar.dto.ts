export class FindSimilarDto {
  /** Mean embedding vector of the selected tags (computed by the frontend). */
  embedding: number[];
  /** IDs to exclude from results (e.g. already selected nodes). */
  excludeIds?: string[];
  /** Maximum number of results to return (default 5). */
  limit?: number;
}
