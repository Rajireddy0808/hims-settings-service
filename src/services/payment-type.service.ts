import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentType } from '../entities/payment-type.entity';

@Injectable()
export class PaymentTypeService {
  constructor(
    @InjectRepository(PaymentType)
    private paymentTypeRepository: Repository<PaymentType>,
  ) {}

  async findAll(): Promise<PaymentType[]> {
    return this.paymentTypeRepository.find({
      order: { createdAt: 'DESC' }
    });
  }

  async findOne(id: number): Promise<PaymentType> {
    return this.paymentTypeRepository.findOne({ where: { id } });
  }

  async create(data: Partial<PaymentType>): Promise<PaymentType> {
    const paymentType = this.paymentTypeRepository.create(data);
    return this.paymentTypeRepository.save(paymentType);
  }

  async update(id: number, data: Partial<PaymentType>): Promise<PaymentType> {
    await this.paymentTypeRepository.update(id, data);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.paymentTypeRepository.delete(id);
  }
}