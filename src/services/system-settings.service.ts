import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SystemSetting } from '../entities/system-setting.entity';
import { UpdateSystemSettingsDto } from '../dto/system-settings.dto';

@Injectable()
export class SystemSettingsService {
  constructor(
    @InjectRepository(SystemSetting)
    private systemSettingRepository: Repository<SystemSetting>,
  ) {}

  async getAllSettings(): Promise<any> {
    try {
      // Get the latest settings record using raw query
      const result = await this.systemSettingRepository.query('SELECT * FROM hospital_settings ORDER BY id DESC LIMIT 1');
      const settings = result[0] || {};
      
      return {
        general: {
          hospital_name: settings?.hospital_name || 'Pranam Hospital Management System',
          hospital_heading: settings?.hospital_heading || 'Hospital Management System',
          hospital_logo: settings?.hospital_logo || '/images/pranam-logo.png',
          timezone: 'Asia/Kolkata',
          currency: 'INR',
          dateFormat: 'DD/MM/YYYY',
        },
        security: {
          passwordMinLength: 8,
          requireUppercase: true,
          requireNumbers: true,
          requireSymbols: false,
          sessionTimeout: 30,
          maxLoginAttempts: 5,
          enable2FA: false,
        },
        notifications: {
          emailEnabled: true,
          smsEnabled: false,
          pushEnabled: true,
          emailFrom: 'noreply@pranamhms.com',
        },
        system: {
          maintenanceMode: false,
          backupFrequency: 'daily',
          maxFileUploadSize: 10,
          enableAuditLogs: true,
        },
      };
    } catch (error) {
      console.error('Error fetching settings:', error);
      return {
        general: {
          hospital_name: 'Pranam Hospital Management System',
          hospital_heading: 'HIMS - Hospital Information Management System',
          hospital_logo: '/images/pranam-logo.png',
          timezone: 'Asia/Kolkata',
          currency: 'INR',
          dateFormat: 'DD/MM/YYYY',
        },
        security: {
          passwordMinLength: 8,
          requireUppercase: true,
          requireNumbers: true,
          requireSymbols: false,
          sessionTimeout: 30,
          maxLoginAttempts: 5,
          enable2FA: false,
        },
        notifications: {
          emailEnabled: true,
          smsEnabled: false,
          pushEnabled: true,
          emailFrom: 'noreply@pranamhms.com',
        },
        system: {
          maintenanceMode: false,
          backupFrequency: 'daily',
          maxFileUploadSize: 10,
          enableAuditLogs: true,
        },
      };
    }
  }

  async updateSettings(updateDto: UpdateSystemSettingsDto): Promise<any> {
    try {

      
      // Get current settings to preserve unchanged fields
      const currentSettings = await this.systemSettingRepository.query('SELECT * FROM hospital_settings ORDER BY id DESC LIMIT 1');
      const current = currentSettings[0] || {};
      
      // Create new record with current values as defaults, then override with new values
      const newSettings = {
        hospital_name: current.hospital_name || 'Pranam Hospital Management System',
        hospital_heading: current.hospital_heading || 'Hospital Management System', 
        hospital_logo: current.hospital_logo || '/images/pranam-logo.png',
      };
      
      // Update only the fields that were provided
      if (updateDto.general) {
        if (updateDto.general.hospital_name !== undefined) {
          newSettings.hospital_name = updateDto.general.hospital_name;
        }
        if (updateDto.general.hospital_heading !== undefined) {
          newSettings.hospital_heading = updateDto.general.hospital_heading;
        }
        if (updateDto.general.hospital_logo !== undefined) {
          newSettings.hospital_logo = updateDto.general.hospital_logo;
        }
      }
      

      
      // Always create new record (maintains history)
      const result = await this.systemSettingRepository.save(newSettings);
      
      return { message: 'Settings updated successfully', id: result.id };
    } catch (error) {
      console.error('Error updating settings:', error);
      throw new Error(`Failed to update settings: ${error.message}`);
    }
  }



  private parseValue(value: string): any {
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }

  async getSettingByKey(key: string): Promise<any> {
    const setting = await this.systemSettingRepository.findOne({ where: {} });
    if (!setting) return null;
    
    switch (key) {
      case 'hospital_name':
        return setting.hospital_name;
      case 'hospital_heading':
        return setting.hospital_heading;
      case 'hospital_logo':
        return setting.hospital_logo;
      default:
        return null;
    }
  }

  async initializeDefaultSettings(): Promise<void> {
    const exists = await this.systemSettingRepository.findOne({ where: {} });
    if (!exists) {
      const defaultSettings = this.systemSettingRepository.create({
        hospital_name: 'Pranam Hospital Management System',
        hospital_heading: 'HIMS - Hospital Information Management System',
        hospital_logo: '/images/pranam-logo.png',
      });
      await this.systemSettingRepository.save(defaultSettings);
    }
  }
}
