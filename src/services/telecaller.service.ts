import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { CallHistory } from '../entities/call-history.entity';

@Injectable()
export class TelecallerService {
  constructor(
    @InjectRepository(CallHistory)
    private callHistoryRepository: Repository<CallHistory>,
    private dataSource: DataSource,
  ) {}

  async getCallHistory(patientId: string, locationId?: number, userId?: string) {
    const whereCondition: any = { patientId };
    if (locationId) {
      whereCondition.locationId = locationId;
    }
    if (userId) {
      whereCondition.callerBy = userId;
    }
    
    const callHistory = await this.callHistoryRepository.find({
      where: whereCondition,
      order: { createdAt: 'DESC' }
    });

    // Get unique caller IDs
    const callerIds = [...new Set(callHistory.map(record => record.callerBy).filter(Boolean))];
    
    // Fetch user names
    const userNames = {};
    if (callerIds.length > 0) {
      try {
        const users = await this.dataSource.query(
          'SELECT id, first_name, last_name FROM users WHERE id = ANY($1)',
          [callerIds]
        );
        users.forEach(user => {
          userNames[user.id] = `${user.first_name || ''} ${user.last_name || ''}`.trim();
        });
      } catch (error) {
        console.error('Error fetching user names:', error);
      }
    }

    return callHistory.map((record, index) => ({
      sno: index + 1,
      dateTime: record.createdAt.toISOString(),
      nextCallDate: record.nextCallDate ? new Date(record.nextCallDate).toISOString().split('T')[0] : '',
      disposition: record.disposition || 'Completed',
      callerName: userNames[record.callerBy] || record.callerBy || 'Unknown',
      patientFeeling: record.patientFeeling || '',
      notes: record.notes || ''
    }));
  }

  async addCallRecord(patientId: string, callData: any, userId: string, locationId?: number) {
    // Validate user can only add records for themselves
    if (!userId) {
      throw new Error('User ID is required');
    }
    
    const callRecord = this.callHistoryRepository.create({
      patientId,
      locationId,
      nextCallDate: callData.nextCallDate ? new Date(callData.nextCallDate) : null,
      callerBy: userId,
      patientFeeling: callData.patientFeeling,
      disposition: callData.disposition,
      notes: callData.notes
    });

    const savedRecord = await this.callHistoryRepository.save(callRecord);

    return {
      success: true,
      message: 'Call record added successfully',
      data: savedRecord
    };
  }
}
