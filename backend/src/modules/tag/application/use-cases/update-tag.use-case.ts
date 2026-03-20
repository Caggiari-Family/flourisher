import { Injectable } from '@nestjs/common';
import { TagRepositoryPort, UpdateTagInput } from '../ports/tag-repository.port';
import { Tag } from '../../domain/tag.entity';

export class UpdateTagCommand {
  constructor(
    public readonly id: string,
    public readonly input: UpdateTagInput,
  ) {}
}

@Injectable()
export class UpdateTagUseCase {
  constructor(private readonly tagRepo: TagRepositoryPort) {}

  execute(cmd: UpdateTagCommand): Promise<Tag> {
    return this.tagRepo.updateTag(cmd.id, cmd.input);
  }
}
