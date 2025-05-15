import { Module } from '@nestjs/common';
import { TestingService } from './testing.service';
import { TestingController } from './testing.controller';
import { Neo4jModule } from 'src/neo4j/neo4j.module';
import { Neo4jService } from 'src/neo4j/neo4j.service';

@Module({
  controllers: [TestingController],
  providers: [TestingService],
})
export class TestingModule { }
