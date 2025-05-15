import { Controller, Get, Post, Body, Patch, Param, Delete, All } from '@nestjs/common';
import { TestingService } from './testing.service';

@Controller('testing')
export class TestingController {
  constructor(private readonly testingService: TestingService) { }

  @All()
  anyFunctionTester() {
    return this.testingService.anyFunctionTester();
  }


}
