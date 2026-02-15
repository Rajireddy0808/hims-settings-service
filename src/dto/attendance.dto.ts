import { IsNotEmpty, IsOptional, IsString, IsNumber, IsDateString } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateAttendanceDto {
  @IsNotEmpty()
  @IsNumber()
  userId: number;

  @IsNotEmpty()
  @IsNumber()
  locationId: number;

  @IsNotEmpty()
  @IsDateString()
  date: string;

  @IsOptional()
  @IsString()
  checkIn?: string;

  @IsOptional()
  @IsString()
  checkOut?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  remarks?: string;

  @IsOptional()
  @IsString()
  leave_type?: string;

  @IsOptional()
  @IsString()
  leave_status?: string;

  @IsOptional()
  @IsNumber()
  userStatusId?: number;
}

export class UpdateAttendanceDto {
  @IsOptional()
  @IsString()
  checkIn?: string;

  @IsOptional()
  @IsString()
  checkOut?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  remarks?: string;

  @IsOptional()
  @IsString()
  leave_type?: string;

  @IsOptional()
  @IsString()
  leave_status?: string;

  @IsOptional()
  @IsNumber()
  userStatusId?: number;
}

export class CheckInOutDto {
  @IsNotEmpty()
  @IsNumber()
  userId: number;

  @IsNotEmpty()
  @IsNumber()
  locationId: number;

  @IsNotEmpty()
  @IsString()
  type: 'check-in' | 'check-out';
}

export class UpdateAvailableStatusDto {
  userId: number;
  locationId: number;
  userStatusId: number;
}
