import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../../../auth/infrastructure/http/auth.guard';
import { GetGraphUseCase } from '../../application/use-cases/get-graph.use-case';
import { CreateTagUseCase, CreateTagCommand } from '../../application/use-cases/create-tag.use-case';
import { DeleteTagUseCase, DeleteTagCommand } from '../../application/use-cases/delete-tag.use-case';
import { AcceptSuggestionUseCase, AcceptSuggestionCommand } from '../../application/use-cases/accept-suggestion.use-case';
import { RejectSuggestionUseCase, RejectSuggestionCommand } from '../../application/use-cases/reject-suggestion.use-case';
import { SuggestTagsUseCase, SuggestTagsCommand } from '../../application/use-cases/suggest-tags.use-case';
import { CreateTagDto } from './dto/create-tag.dto';
import { SuggestTagsDto } from './dto/suggest-tags.dto';

@Controller()
@UseGuards(AuthGuard)
export class TagController {
  constructor(
    private readonly getGraph: GetGraphUseCase,
    private readonly createTag: CreateTagUseCase,
    private readonly deleteTag: DeleteTagUseCase,
    private readonly acceptSuggestion: AcceptSuggestionUseCase,
    private readonly rejectSuggestion: RejectSuggestionUseCase,
    private readonly suggestTags: SuggestTagsUseCase,
  ) {}

  @Get('graph')
  graph() {
    return this.getGraph.execute();
  }

  @Post('graph/nodes')
  createNode(@Body() dto: CreateTagDto) {
    return this.createTag.execute(
      new CreateTagCommand(dto.name, dto.description ?? ''),
    );
  }

  @Delete('graph/nodes/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteNode(@Param('id') id: string) {
    return this.deleteTag.execute(new DeleteTagCommand(id));
  }

  @Post('graph/nodes/:id/accept')
  accept(@Param('id') id: string) {
    return this.acceptSuggestion.execute(new AcceptSuggestionCommand(id));
  }

  @Delete('graph/nodes/:id/reject')
  @HttpCode(HttpStatus.NO_CONTENT)
  reject(@Param('id') id: string) {
    return this.rejectSuggestion.execute(new RejectSuggestionCommand(id));
  }

  @Post('llm/suggest')
  suggest(@Body() dto: SuggestTagsDto) {
    return this.suggestTags.execute(new SuggestTagsCommand(dto.nodeIds));
  }
}
