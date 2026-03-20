import { Module } from '@nestjs/common';
import { TagRepositoryPort } from './application/ports/tag-repository.port';
import { GetGraphUseCase } from './application/use-cases/get-graph.use-case';
import { CreateTagUseCase } from './application/use-cases/create-tag.use-case';
import { UpdateTagUseCase } from './application/use-cases/update-tag.use-case';
import { DeleteTagUseCase } from './application/use-cases/delete-tag.use-case';
import { AcceptSuggestionUseCase } from './application/use-cases/accept-suggestion.use-case';
import { RejectSuggestionUseCase } from './application/use-cases/reject-suggestion.use-case';
import { FindSimilarTagsUseCase } from './application/use-cases/find-similar-tags.use-case';
import { CreateEdgeUseCase } from './application/use-cases/create-edge.use-case';
import { UpdateEdgeUseCase } from './application/use-cases/update-edge.use-case';
import { DeleteEdgeUseCase } from './application/use-cases/delete-edge.use-case';
import { Neo4jTagRepository } from './infrastructure/persistence/neo4j-tag.repository';
import { TagController } from './infrastructure/http/tag.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [TagController],
  providers: [
    { provide: TagRepositoryPort, useClass: Neo4jTagRepository },
    GetGraphUseCase,
    CreateTagUseCase,
    UpdateTagUseCase,
    DeleteTagUseCase,
    AcceptSuggestionUseCase,
    RejectSuggestionUseCase,
    FindSimilarTagsUseCase,
    CreateEdgeUseCase,
    UpdateEdgeUseCase,
    DeleteEdgeUseCase,
  ],
})
export class TagModule {}
