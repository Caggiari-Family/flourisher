import { Injectable } from '@nestjs/common';
import { TagRepositoryPort } from '../ports/tag-repository.port';
import { Tag } from '../../domain/tag.entity';

export class CreateTagCommand {
  constructor(
    public readonly name: string,
    public readonly description: string,
  ) {}
}

@Injectable()
export class CreateTagUseCase {
  constructor(private readonly tagRepo: TagRepositoryPort) {}

  execute(cmd: CreateTagCommand): Promise<Tag> {
    return this.tagRepo.create({
      name: cmd.name,
      description: cmd.description,
      suggested: false,
    });
  }
}
