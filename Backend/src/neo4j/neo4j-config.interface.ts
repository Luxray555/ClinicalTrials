import { Connection } from 'cypher-query-builder';
import { Driver } from 'neo4j-driver';

export interface Neo4jConfig {
  neo4jDatabaseUri: string;
  neo4jDatabaseUsername: string;
  neo4jDatabasePassword: string;
  neo4jAuraInstanseId?: string;
  neo4jAuraInstanseName?: string;
  database?: string;
}

export type ConnectionWithDriver = Connection & {
  driver: Driver;
};
