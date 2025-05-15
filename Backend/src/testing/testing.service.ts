import { Neo4jService } from '@/neo4j/neo4j.service';
import { HttpException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class TestingService {
  constructor(
    private readonly neo4jService: Neo4jService,
  ) { }

  async anyFunctionTester() {
    try {

      throw new HttpException(
        {
          status: 500,
          error: "Internal Server Error",
          message: "Max retries reached",
        },
        500,
      );
      // console.log('await bcrypt.hash(createAdminDto.password, 10)', await bcrypt.hash("admin123", 10))
      // console.log('await bcrypt.hash(createAdminDto.password, 10)', await bcrypt.hash("ilyes123", 10))
    } catch (error) {
      // console.error('Error in anyFunctionTester:', error.message);
      // throw error;
      throw new HttpException(
        {
          status: 500,
          error: "Internal Server Error",
          message: "Max retries reached",
        },
        500,
      );
    }
  }
}
