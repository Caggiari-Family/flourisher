import { Module } from '@nestjs/common';
import { Neo4jModule } from './shared/neo4j/neo4j.module';
import { AuthModule } from './modules/auth/auth.module';
import { TagModule } from './modules/tag/tag.module';

@Module({
  imports: [Neo4jModule, AuthModule, TagModule],
})
export class AppModule {}
