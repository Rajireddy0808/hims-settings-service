import { IsString, IsOptional, IsObject } from 'class-validator';

export class UpdateSystemSettingsDto {
  @IsOptional()
  @IsObject()
  general?: {
    hospital_name?: string;
    hospital_heading?: string;
    hospital_logo?: string;
    timezone?: string;
    currency?: string;
    dateFormat?: string;
  };

  @IsOptional()
  @IsObject()
  security?: {
    passwordMinLength?: number;
    requireUppercase?: boolean;
    requireNumbers?: boolean;
    requireSymbols?: boolean;
    sessionTimeout?: number;
    maxLoginAttempts?: number;
    enable2FA?: boolean;
  };

  @IsOptional()
  @IsObject()
  notifications?: {
    emailEnabled?: boolean;
    smsEnabled?: boolean;
    pushEnabled?: boolean;
    emailFrom?: string;
  };

  @IsOptional()
  @IsObject()
  system?: {
    maintenanceMode?: boolean;
    backupFrequency?: string;
    maxFileUploadSize?: number;
    enableAuditLogs?: boolean;
  };
}

export class SystemSettingDto {
  @IsString()
  key: string;

  @IsString()
  value: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  description?: string;
}
