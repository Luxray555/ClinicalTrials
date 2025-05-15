import { Body, Controller, Get, Post, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';

import { Response } from 'express';

import { LocalAuthGuard } from './guards/local.guard';
import { Public } from 'src/lib/decorators/public.decorator';
import { JwtRefreshAuthGuard } from './guards/jwt-refresh.guard';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { CurrentUser } from 'src/lib/decorators/current-user.decorator';
import { CurrentUserType } from 'src/lib/types/current-user.type';
import { RegisterDoctorDto } from './dto/register-doctor.dto';
import { RegisterInvestigatorDto } from './dto/register-investigator.dto';

@Public()
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @UseGuards(LocalAuthGuard)
  login(
    @CurrentUser()
    user: CurrentUserType,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.authService.login(user, response);
  }

  @Post('register-doctor')
  registerDoctor(@Body() registerDoctorDto: RegisterDoctorDto) {
    return this.authService.registerDoctor(registerDoctorDto);
  }

  @Post('register-investigator')
  registerInvestigator(
    @Body() registerInvestigatorDto: RegisterInvestigatorDto,
  ) {
    return this.authService.registerInvestigator(registerInvestigatorDto);
  }

  @Post('refresh')
  @UseGuards(JwtRefreshAuthGuard)
  refresh(
    @CurrentUser()
    user: CurrentUserType,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.authService.login(user, response);
  }

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  loginGoogle() {}

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleCallback(
    @CurrentUser() user: CurrentUserType,
    @Res({ passthrough: true }) response: Response,
  ) {
    await this.authService.login(user, response, true);
  }

  @Get('logout')
  logout(@Res({ passthrough: true }) response: Response) {
    this.authService.logout(response);
  }
}
