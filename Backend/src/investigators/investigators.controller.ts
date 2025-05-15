import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { InvestigatorsService } from './investigators.service';
import { CreateInvestigatorDto } from './dto/create-investigator.dto';
import { UpdateInvestigatorDto } from './dto/update-investigator.dto';
import { Roles } from '@/lib/decorators/roles.decorator';
import { CurrentUser } from '@/lib/decorators/current-user.decorator';
import { CurrentUserType } from '@/lib/types/current-user.type';
import { ChangePasswordDto } from './dto/change-password.dto';
import { CreateNewClinicalTrialDto } from './dto/create-new-clinical-trial.dto';
import { UpdateClinicalTrialDto } from './dto/update-clinical-trial';

@Roles('INVESTIGATOR')
@Controller('investigators')
export class InvestigatorsController {
  constructor(private readonly investigatorsService: InvestigatorsService) {}

  @Get('me')
  findOneDoctor(@CurrentUser() user: CurrentUserType) {
    return this.investigatorsService.findOneInvestigatorById(user.id);
  }

  @Patch('me')
  updateDoctor(
    @CurrentUser() user: CurrentUserType,
    @Body() updateInvestigatorDto: UpdateInvestigatorDto,
  ) {
    return this.investigatorsService.updateInvestigatorById(
      user.id,
      updateInvestigatorDto,
    );
  }

  @Patch('me/password-change')
  updateDoctorPassword(
    @CurrentUser() user: CurrentUserType,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.investigatorsService.updateInvestigatorPassword(
      user.id,
      changePasswordDto,
    );
  }

  @Delete('me')
  removeDoctor(@CurrentUser() user: CurrentUserType) {
    return this.investigatorsService.removeInvestigatorById(user.id);
  }

  @Post('add-new-clinical-trial')
  addNewClinicalTrial(
    @CurrentUser() user: CurrentUserType,
    @Body() createNewClinicalTrialDto: CreateNewClinicalTrialDto,
  ) {
    return this.investigatorsService.addNewClinicalTrial(
      user.id,
      createNewClinicalTrialDto,
    );
  }

  @Get('clinical-trials/:id')
  getClinicalTrialById(@Param('id') id: string) {
    return this.investigatorsService.getClinicalTrialById(id);
  }

  @Get('clinical-trials')
  getAllClinicalTrials(@CurrentUser() user: CurrentUserType) {
    return this.investigatorsService.getAllClinicalTrials(user.id);
  }

  @Delete('clinical-trials/:id')
  removeClinicalTrial(
    @CurrentUser() user: CurrentUserType,
    @Param('id') id: string,
  ) {
    return this.investigatorsService.removeClinicalTrialById(user.id, id);
  }

  @Patch('clinical-trials/:id')
  updateClinicalTrial(
    @CurrentUser() user: CurrentUserType,
    @Param('id') id: string,
    @Body() updateClinicalTrialDto: UpdateClinicalTrialDto,
  ) {
    return this.investigatorsService.updateClinicalTrialById(
      user.id,
      id,
      updateClinicalTrialDto,
    );
  }
}
