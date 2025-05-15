import { Controller, Get, Post, Body, Param, Patch, Query, UsePipes, ValidationPipe, Delete } from '@nestjs/common';
import { CreateAdminDto } from './dto/create-admin.dto';
import { AdminsService } from './admins.service';
import { Roles } from '@/lib/decorators/roles.decorator';
import { FindAllUsersDto } from './dto/all-users.dto';
import { getAllDataSourcesDto } from './dto/all-data-sources.dto';
import { updateScheduleDto } from './dto/update-schedule.dto';
import { GetAllDataCollectionLogsDto } from './dto/all-data-collection-logs.dto';

@Roles('ADMIN')
@Controller('admins')
export class AdminsController {
  constructor(private readonly adminsService: AdminsService) { }

  @Get('doctors')
  findAllDoctors() {
    return this.adminsService.findAllDoctors();
  }

  @Get('all-users')
  findAllUsers(@Query() query: FindAllUsersDto) {
    const { page, pageSize, role } = query;
    return this.adminsService.findAllUsers(page, pageSize, role);
  }
  @Get('data-collection-logs')
  getAllDataCollectionLogs(@Query() query: GetAllDataCollectionLogsDto) {
    const { page, pageSize, type } = query;
    return this.adminsService.getAllDataCollectionLogContexts(page, pageSize, type);
  }

  @Get('all-data-sources')
  getAllDataSources(@Query() query: getAllDataSourcesDto) {
    const { page, pageSize } = query;
    return this.adminsService.getAllDataSources(page, pageSize);
  }

  @Get('data-sources/:sourceId')
  getDataSourceDetails(@Param('sourceId') sourceId: string, @Query('page') page: number, @Query('pageSize') pageSize: number, @Query('type') type: string) {
    return this.adminsService.getDataSourceDetails(sourceId, +page, +pageSize, type);
  }
  @Patch('data-sources/:sourceId/schedule')
  updateSchedule(@Param('sourceId') sourceId: string, @Body() updateScheduleDto: updateScheduleDto) {
    return this.adminsService.updateSchedule(sourceId, updateScheduleDto);
  }

  @Get('patients')
  findAllPatients() {
    return this.adminsService.findAllPatients();
  }
  @Get('system-stats')
  getSystemStats() {
    return this.adminsService.getSystemStats();
  }

  @Post()
  createAdmin(@Body() createAdminDto: CreateAdminDto) {
    return this.adminsService.createAdmin(createAdminDto);
  }

  @Get(':id')
  findOneAdminById(@Param('id') id: string) {
    return this.adminsService.findOneAdminById(id);
  }

  @Patch('block-user/:id')
  blockUser(@Param('id') id: string) {
    return this.adminsService.blockUser(id);
  }


  @Patch('unblock-user/:id')
  unblockUser(@Param('id') id: string) {
    return this.adminsService.unblockUser(id);
  }
  @Delete('delete-user/:id')
  deleteUser(@Param('id') id: string) {
    return this.adminsService.deleteUser(id);
  }
  @Delete('delete-trial/:id')
  deleteClinicalTrial(@Param('id') id: string) {
    return this.adminsService.deleteClinicalTrial(id);
  }

}
