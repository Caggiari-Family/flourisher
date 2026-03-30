import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../../../auth/infrastructure/http/auth.guard';
import { GetGraphUseCase } from '../../application/use-cases/get-graph.use-case';
import { CreateTagUseCase, CreateTagCommand } from '../../application/use-cases/create-tag.use-case';
import { UpdateTagUseCase, UpdateTagCommand } from '../../application/use-cases/update-tag.use-case';
import { DeleteTagUseCase, DeleteTagCommand } from '../../application/use-cases/delete-tag.use-case';
import { AcceptSuggestionUseCase, AcceptSuggestionCommand } from '../../application/use-cases/accept-suggestion.use-case';
import { RejectSuggestionUseCase, RejectSuggestionCommand } from '../../application/use-cases/reject-suggestion.use-case';
import { CreateEdgeUseCase, CreateEdgeCommand } from '../../application/use-cases/create-edge.use-case';
import { UpdateEdgeUseCase, UpdateEdgeCommand } from '../../application/use-cases/update-edge.use-case';
import { DeleteEdgeUseCase, DeleteEdgeCommand } from '../../application/use-cases/delete-edge.use-case';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { CreateEdgeDto } from './dto/create-edge.dto';
import { UpdateEdgeDto } from './dto/update-edge.dto';

@Controller()
@UseGuards(AuthGuard)
export class TagController {
  constructor(
    private readonly getGraph: GetGraphUseCase,
    private readonly createTag: CreateTagUseCase,
    private readonly updateTag: UpdateTagUseCase,
    private readonly deleteTag: DeleteTagUseCase,
    private readonly acceptSuggestionUc: AcceptSuggestionUseCase,
    private readonly rejectSuggestionUc: RejectSuggestionUseCase,
    private readonly createEdge: CreateEdgeUseCase,
    private readonly updateEdge: UpdateEdgeUseCase,
    private readonly deleteEdge: DeleteEdgeUseCase,
  ) {}

  // ── Graph (convenience) ───────────────────────────────────────────────────

  @Get('graph')
  graph() {
    return this.getGraph.execute();
  }

  // ── Nodes ─────────────────────────────────────────────────────────────────

  @Get('nodes')
  getNodes() {
    return this.getGraph.execute().then((g) => g.nodes);
  }

  @Post('nodes')
  createNode(@Body() dto: CreateTagDto) {
    return this.createTag.execute(
      new CreateTagCommand(dto.name, dto.description ?? '', dto.suggested ?? false, dto.status),
    );
  }

  @Put('nodes/:id')
  updateNode(@Param('id') id: string, @Body() dto: UpdateTagDto) {
    return this.updateTag.execute(new UpdateTagCommand(id, dto));
  }

  @Delete('nodes/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteNode(@Param('id') id: string) {
    return this.deleteTag.execute(new DeleteTagCommand(id));
  }

  @Put('nodes/:id/accept')
  acceptSuggestion(@Param('id') id: string) {
    return this.acceptSuggestionUc.execute(new AcceptSuggestionCommand(id));
  }

  @Delete('nodes/:id/reject')
  @HttpCode(HttpStatus.NO_CONTENT)
  rejectSuggestion(@Param('id') id: string) {
    return this.rejectSuggestionUc.execute(new RejectSuggestionCommand(id));
  }

  // ── Edges ─────────────────────────────────────────────────────────────────

  @Get('edges')
  getEdges() {
    return this.getGraph.execute().then((g) => g.edges);
  }

  @Post('edges')
  createEdgeRoute(@Body() dto: CreateEdgeDto) {
    return this.createEdge.execute(
      new CreateEdgeCommand(dto.sourceId, dto.targetId, dto.label ?? '', dto.status),
    );
  }

  @Put('edges/:id')
  updateEdgeRoute(@Param('id') id: string, @Body() dto: UpdateEdgeDto) {
    return this.updateEdge.execute(new UpdateEdgeCommand(id, dto.label, dto.status));
  }

  @Delete('edges/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteEdgeRoute(@Param('id') id: string) {
    return this.deleteEdge.execute(new DeleteEdgeCommand(id));
  }
}
