import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import neo4j, { Driver, Session } from 'neo4j-driver';

@Injectable()
export class Neo4jService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(Neo4jService.name);
  private driver: Driver;

  async onModuleInit(): Promise<void> {
    const uri = process.env.NEO4J_URI ?? 'bolt://localhost:7687';
    const username = process.env.NEO4J_USERNAME ?? 'neo4j';
    const password = process.env.NEO4J_PASSWORD ?? 'password';

    this.driver = neo4j.driver(uri, neo4j.auth.basic(username, password));

    await this.waitForConnection();
    await this.initConstraints();
  }

  async onModuleDestroy(): Promise<void> {
    await this.driver.close();
  }

  getSession(): Session {
    return this.driver.session();
  }

  private async waitForConnection(retries = 20, delayMs = 3000): Promise<void> {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        await this.driver.verifyConnectivity();
        this.logger.log('Connected to Neo4j');
        return;
      } catch (err) {
        if (attempt === retries) throw err;
        this.logger.warn(
          `Neo4j not ready (attempt ${attempt}/${retries}), retrying in ${delayMs}ms…`,
        );
        await new Promise((r) => setTimeout(r, delayMs));
      }
    }
  }

  private async initConstraints(): Promise<void> {
    const session = this.getSession();
    try {
      await session.run(
        'CREATE CONSTRAINT tag_id_unique IF NOT EXISTS FOR (n:Tag) REQUIRE n.id IS UNIQUE',
      );
      this.logger.log('Neo4j constraints initialised');
    } finally {
      await session.close();
    }
  }
}
