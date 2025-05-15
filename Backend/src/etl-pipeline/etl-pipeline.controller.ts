import { Controller, Post, Body, Param } from '@nestjs/common';
import { EtlPipelineService } from './etl-pipeline.service';
import { RunEtlPipelineDto } from './dto/run-etl-pipeline.dto';
import { Public } from '@/lib/decorators/public.decorator';

@Public()
@Controller('etl-pipeline')
export class EtlPipelineController {
  constructor(private readonly etlPipelineService: EtlPipelineService) { }

  @Post(':slug/run')
  async runPipeline(@Body() runPipelineDto: RunEtlPipelineDto, @Param('slug') slug: string) {
    return await this.etlPipelineService.runPipelineBySlug(runPipelineDto, slug);
  }

  @Post(':slug/stop')
  stopPipeline(@Param('slug') slug: string) {
    return this.etlPipelineService.stopPipelineBySlug(slug);
  }

  @Post(':slug/refresh')
  refreshPipeline(@Param('slug') slug: string) {
    return this.etlPipelineService.refreshDataSource(slug);
  }


  // @Post('clinical-trials-gov/run')
  // async runPiplineClinicalTrialsGovPipeline(
  //   @Body() runPipelineDto: RunEtlPipelineDto,
  // ) {
  //   return await this.etlPipelineService.runClinicalTrialsGovPipeline(
  //     runPipelineDto,
  //   );
  // }

  // @Post('clinical-trials-gov/stop')
  // stopPiplineClinicalTrialsGovPipeline() {
  //   return this.etlPipelineService.stopClinicalTrialsGovPipeline();
  // }

  // @Post('clinical-trials-gov/refresh')
  // refreshPiplineClinicalTrialsGovPipeline() {
  //   return this.etlPipelineService.refreshClinicalTrialsGovPipeline();
  // }

  // @Post('unicancer/run')
  // async runUnicancerPipeline(@Body() runPipelineDto: RunEtlPipelineDto) {
  //   return await this.etlPipelineService.runUnicancerPipeline(runPipelineDto);
  // }

  // @Post('unicancer/stop')
  // stopUnicancerPipeline() {
  //   return this.etlPipelineService.stopUnicancerPipeline();
  // }

  // @Post('cancer-fr/run')
  // async runCancerFrPipeline(@Body() runPipelineDto: RunEtlPipelineDto) {
  //   return await this.etlPipelineService.runCancerFrPipeline(runPipelineDto);
  // }

  // @Post('cancer-fr/stop')
  // stopCancerFrPipeline() {
  //   return this.etlPipelineService.stopCancerFrPipeline();
  // }



}


