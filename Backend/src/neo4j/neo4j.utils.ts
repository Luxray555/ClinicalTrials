import { ConfigService } from '@nestjs/config';
import { Neo4jConfig } from './neo4j-config.interface';

export const createDatabaseConfig = (
  configService: ConfigService,
  customConfig?: Neo4jConfig,
): Neo4jConfig =>
  customConfig || {
    neo4jDatabaseUri: configService.get('NEO4J_DATABASE_URI'),
    neo4jDatabaseUsername: configService.get('NEO4J_DATABASE_USERNAME'),
    neo4jDatabasePassword: configService.get('NEO4J_DATABASE_PASSWORD'),
    neo4jAuraInstanseId: configService.get('AURA_INSTANCEID'),
    neo4jAuraInstanseName: configService.get('AURA_INSTANCENAME'),
  };

export class ConnecitonError extends Error {
  public details: string;
  constructor(oldError: Error) {
    super();
    this.message = 'Connection with Neo4j database was not established';
    this.name = 'Connection Error';
    this.stack = oldError.stack;
    this.details = oldError.message;
  }
}
