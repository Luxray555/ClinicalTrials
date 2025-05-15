import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { DoctorsService } from './doctors.service';

import { CurrentUser } from 'src/lib/decorators/current-user.decorator';
import { CurrentUserType } from 'src/lib/types/current-user.type';
import { CreatePatientDto } from 'src/patients/dto/create-patient.dto';
import { UpdateDoctorDto } from './dto/update-doctor.dto';
import { UpdatePatientDto } from 'src/patients/dto/update-patient.dto';
import { Roles } from '@/lib/decorators/roles.decorator';
import { ChangePasswordDto } from './dto/change-password.dto';

@Roles('DOCTOR')
@Controller('doctors')
export class DoctorsController {
  constructor(private readonly doctorsService: DoctorsService) {}

  @Get('me')
  findOneDoctor(@CurrentUser() user: CurrentUserType) {
    return this.doctorsService.findOneDoctorById(user.id);
  }

  @Patch('me')
  updateDoctor(
    @CurrentUser() user: CurrentUserType,
    @Body() updateDoctorDto: UpdateDoctorDto,
  ) {
    return this.doctorsService.updateDoctorById(user.id, updateDoctorDto);
  }

  @Patch('me/password-change')
  updateDoctorPassword(
    @CurrentUser() user: CurrentUserType,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.doctorsService.updateDoctorPassword(user.id, changePasswordDto);
  }

  @Delete('me')
  removeDoctor(@CurrentUser() user: CurrentUserType) {
    return this.doctorsService.removeDoctorById(user.id);
  }

  @Post('patients')
  createPatient(
    @Body() createPatientDto: CreatePatientDto,
    @CurrentUser() user: CurrentUserType,
  ) {
    return this.doctorsService.createPatient(createPatientDto, user.id);
  }

  @Get('patients')
  findAllPatientsOfDoctor(@CurrentUser() user: CurrentUserType) {
    return this.doctorsService.findAllPatientsOfDoctor(user.id);
  }

  @Get('patients/:id')
  findOnePatientOfDoctor(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserType,
  ) {
    return this.doctorsService.findOnePatientOfDoctor(id, user.id);
  }

  @Patch('patients/:id')
  updatePatient(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserType,
    @Body() updatePatientDto: UpdatePatientDto,
  ) {
    return this.doctorsService.updatePatientById(id, updatePatientDto, user.id);
  }

  @Delete('patients/:id')
  removePatient(@Param('id') id: string, @CurrentUser() user: CurrentUserType) {
    return this.doctorsService.removePatientById(id, user.id);
  }
}
