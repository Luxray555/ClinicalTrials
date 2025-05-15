import { Injectable } from '@nestjs/common';
import { CreateClinicalTrialDto } from './dto/create-clinical-trial.dto';
import { UpdateClinicalTrialDto } from './dto/update-clinical-trial.dto';
import { ClinicalTrialQueryDto } from './dto/query.dto';
import { ClinicalTrialsRepository } from './clinical-trials.repository';
import { ClinicalTrial } from '@/lib/types/data-model';

@Injectable()
export class ClinicalTrialsService {
  constructor(
    private readonly clinicalTrialsRepository: ClinicalTrialsRepository,
  ) { }

  async getTotalTrialsForAllSources() {
    return await this.clinicalTrialsRepository.getTotalTrialsForAllSources();
  }


  findAll(ctQuery: ClinicalTrialQueryDto) {
    const clinicalTrials =
      this.clinicalTrialsRepository.getAllClinicalTrials(ctQuery);
    return clinicalTrials;
  }

  findOne(id: string) {
    const clinicalTrial = this.clinicalTrialsRepository.getClinicalTrial(id);
    return clinicalTrial;
  }

  getCitiesFromCountry(country: string) {
    return this.clinicalTrialsRepository.getCitiesFromCountry(country);
  }

  findOneByOriginalTrialId(originalTrialId: string) {
    return this.clinicalTrialsRepository.getClinicalTrialByOriginalTrialId(
      originalTrialId,
    );
  }

  updateOrCreate(trial: ClinicalTrial) {
    return this.clinicalTrialsRepository.updateOrCreate(trial);
  }



  // this function takesa csvFile as input and extract clinical trials from it and insert them
  // into the database
  // async insertClinicalTrialsFromCsv(csvFile: any) {
  //   return this.clinicalTrialsRepository.insertClinicalTrialsFromCsv(csvFile);
  // }
}
