import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HRPolicy } from '../entities/hr-policy.entity';
import { CreateHRPolicyDto, UpdateHRPolicyDto } from '../dto/hr-policy.dto';

@Injectable()
export class HRPoliciesService {
    constructor(
        @InjectRepository(HRPolicy)
        private readonly hrPolicyRepository: Repository<HRPolicy>,
    ) { }

    async create(createDto: CreateHRPolicyDto): Promise<HRPolicy> {
        const policy = this.hrPolicyRepository.create(createDto);
        return await this.hrPolicyRepository.save(policy);
    }

    async findAll(page: number = 1, limit: number = 10, search?: string): Promise<any> {
        const query = this.hrPolicyRepository.createQueryBuilder('policy')
            .orderBy('policy.createdAt', 'DESC');

        if (search) {
            query.andWhere('(policy.title ILIKE :search OR policy.policyNumber ILIKE :search)', { search: `%${search}%` });
        }

        const [data, total] = await query
            .skip((page - 1) * limit)
            .take(limit)
            .getManyAndCount();

        return {
            data,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    async findOne(id: number): Promise<HRPolicy> {
        return await this.hrPolicyRepository.findOne({ where: { id } });
    }

    async update(id: number, updateDto: UpdateHRPolicyDto): Promise<HRPolicy> {
        await this.hrPolicyRepository.update(id, updateDto);
        return this.findOne(id);
    }

    async remove(id: number): Promise<void> {
        await this.hrPolicyRepository.delete(id);
    }
}
