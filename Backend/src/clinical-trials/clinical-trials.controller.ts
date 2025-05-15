import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ClinicalTrialsService } from './clinical-trials.service';
import { ClinicalTrialQueryDto } from './dto/query.dto';
import { Public } from '@/lib/decorators/public.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';
import { CsvService } from '@/csv/csv.service';
import { FieldMappingModelService } from '@/field-mapping-model/field-mapping-model.service';

@Public()
@Controller('clinical-trials')
export class ClinicalTrialsController {
  constructor(
    private readonly clinicalTrialsService: ClinicalTrialsService,
    private readonly csvService: CsvService,
    private readonly fieldMappingService: FieldMappingModelService,
  ) { }

  @Get()
  findAll(@Query() ctQuery: ClinicalTrialQueryDto) {
    return this.clinicalTrialsService.findAll(ctQuery);
  }

  @Get('cities')
  getCitiesFromCountry(@Query('country') country: string) {
    return this.clinicalTrialsService.getCitiesFromCountry(country);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.clinicalTrialsService.findOne(id);
  }

  @Post('upload-csv')
  @UseInterceptors(FileInterceptor('file'))
  async uploadCsv(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    try {
      // Parse CSV to get columns and rows
      const { columns, rows } = await this.csvService.parseCsv(file.buffer);

      if (!columns.length) {
        throw new BadRequestException('CSV file contains no columns');
      }

      // Call the field mapping service
      const mappedFields = await this.fieldMappingService.predictFieldMapping({
        fields: columns,
      });

      return {
        rawColumns: columns,
        mappedColumns: mappedFields, // Field mappings from the service
        totalRows: rows.length,
      };
    } catch (error) {
      console.error('CSV Upload Error:', error);
      throw new BadRequestException(`CSV Processing failed: ${error.message}`);
    }
  }


}
