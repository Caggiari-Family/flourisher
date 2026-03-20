import { Module } from '@nestjs/common';
import { TagRepositoryPort } from './application/ports/tag-repository.port';
import { SuggestionPort } from './application/ports/suggestion.port';
import { GetGraphUseCase } from './application/use-cases/get-graph.use-case';
import { CreateTagUseCase } from './application/use-cases/create-tag.use-case';
import { DeleteTagUseCase } from './application/use-cases/delete-tag.use-case';
import { AcceptSuggestionUseCase } from './application/use-cases/accept-suggestion.use-case';
import { RejectSuggestionUseCase } from './application/use-cases/reject-suggestion.use-case';
import { SuggestTagsUseCase } from './application/use-cases/suggest-tags.use-case';
import { Neo4jTagRepository } from './infrastructure/persistence/neo4j-tag.repository';
import { AnthropicAdapter } from './infrastructure/llm/anthropic.adapter';
import { OllamaAdapter } from './infrastructure/llm/ollama.adapter';
import { TagController } from './infrastructure/http/tag.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [TagController],
  providers: [
    // Port → Adapter bindings (infrastructure decision)
    {
      provide: TagRepositoryPort,
      useClass: Neo4jTagRepository,
    },
    {
      provide: SuggestionPort,
      useFactory: () =>
        process.env.LLM_PROVIDER === 'ollama'
          ? new OllamaAdapter()
          : new AnthropicAdapter(),
    },
    // Use cases
    GetGraphUseCase,
    CreateTagUseCase,
    DeleteTagUseCase,
    AcceptSuggestionUseCase,
    RejectSuggestionUseCase,
    SuggestTagsUseCase,
  ],
})
export class TagModule {}
