import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginPayloadDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;
}
