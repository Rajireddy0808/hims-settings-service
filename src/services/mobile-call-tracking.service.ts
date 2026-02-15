import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MobileNumber } from '../entities/mobile-number.entity';
import { MobileNumberNextCall } from '../entities/mobile-number-next-call.entity';

@Injectable()
export class MobileCallTrackingService {
  constructor(
    @InjectRepository(MobileNumber)
    private mobileNumberRepository: Repository<MobileNumber>,
    @InjectRepository(MobileNumberNextCall)
    private nextCallRepository: Repository<MobileNumberNextCall>,
  ) {}

  async getAssignedNumbers(userId: number) {
    const query = `
      SELECT 
        m.*,
        nc.disposition,
        nc.caller_by,
        nc.next_call_date as last_next_call_date
      FROM mobile_numbers m
      LEFT JOIN LATERAL (
        SELECT disposition, caller_by, next_call_date
        FROM mobile_number_next_call_ob
        WHERE mobile_number_id = m.id
        ORDER BY id DESC
        LIMIT 1
      ) nc ON true
      WHERE m.user_id = $1 AND m.is_active = true
      ORDER BY m.id ASC
    `;
    
    return this.mobileNumberRepository.query(query, [userId]);
  }

  async updateCallDetails(mobileId: number, callData: any, userId: number) {
    const nextCallData = this.nextCallRepository.create({
      mobile_number_id: mobileId,
      next_call_date: callData.nextCallDate ? new Date(callData.nextCallDate) : null,
      disposition: callData.disposition,
      patient_feeling: callData.patientFeeling,
      notes: callData.notes,
      caller_by: userId,
      caller_created_at: new Date(),
      caller_updated_at: new Date()
    });

    await this.nextCallRepository.save(nextCallData);

    return {
      success: true,
      message: 'Call details updated successfully'
    };
  }
}