import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserType } from '../entities/user-type.entity';

@Injectable()
export class UserTypesService {
  constructor(
    @InjectRepository(UserType)
    private userTypeRepository: Repository<UserType>,
  ) {}

  async findAll() {
    return this.userTypeRepository.find({
      where: { isActive: true },
      order: { name: 'ASC' }
    });
  }

  async create(data: any) {
    const existing = await this.userTypeRepository.findOne({
      where: { code: data.code }
    });
    if (existing) {
      throw new ConflictException('User type code already exists');
    }
    
    const userType = this.userTypeRepository.create(data);
    return this.userTypeRepository.save(userType);
  }

  async update(id: number, data: any) {
    const userType = await this.userTypeRepository.findOne({ where: { id } });
    if (!userType) {
      throw new NotFoundException('User type not found');
    }
    
    await this.userTypeRepository.update(id, data);
    return this.userTypeRepository.findOne({ where: { id } });
  }

  async remove(id: number) {
    const userType = await this.userTypeRepository.findOne({ where: { id } });
    if (!userType) {
      throw new NotFoundException('User type not found');
    }
    
    await this.userTypeRepository.update(id, { isActive: false });
    return { message: 'User type deleted successfully' };
  }
}