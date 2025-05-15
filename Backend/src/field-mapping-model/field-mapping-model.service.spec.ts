import { Test, TestingModule } from '@nestjs/testing';
import { FieldMappingModelService } from './field-mapping-model.service';

describe('FieldMappingModelService', () => {
  let service: FieldMappingModelService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FieldMappingModelService],
    }).compile();

    service = module.get<FieldMappingModelService>(FieldMappingModelService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
