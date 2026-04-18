import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Enquiry } from '../entities/enquiry.entity';

@Injectable()
export class EnquiryService {
  constructor(
    @InjectRepository(Enquiry)
    private readonly enquiryRepository: Repository<Enquiry>,
  ) {}

  async createEnquiry(data: Partial<Enquiry>): Promise<Enquiry> {
    const enquiry = this.enquiryRepository.create(data);
    return this.enquiryRepository.save(enquiry);
  }

  async findAllEnquiries(fromDate?: string, toDate?: string): Promise<Enquiry[]> {
    const queryOptions: any = {
      order: { created_at: 'DESC' },
      select: ['id', 'name', 'phone', 'medical_problems', 'userview', 'created_at', 'updated_at']
    };

    if (fromDate && toDate) {
      const start = new Date(fromDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(toDate);
      end.setHours(23, 59, 59, 999);
      queryOptions.where = {
        created_at: Between(start, end),
      };
    }

    // Explicitly fetching all fields to ensure 'userview' is included in the JSON response
    return this.enquiryRepository.find(queryOptions);
  }

  async markAsRead(id: number): Promise<Enquiry> {
    await this.enquiryRepository.update(id, { userview: 'read' });
    return this.enquiryRepository.findOneBy({ id });
  }
}
