import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HRPolicy } from '../entities/hr-policy.entity';
import { HRPolicyAcceptance } from '../entities/hr-policy-acceptance.entity';
import { CreateHRPolicyDto, UpdateHRPolicyDto } from '../dto/hr-policy.dto';
import { AcceptHRPolicyDto } from '../dto/accept-hr-policy.dto';
import * as XLSX from 'xlsx';

@Injectable()
export class HRPoliciesService {
    constructor(
        @InjectRepository(HRPolicy)
        private readonly hrPolicyRepository: Repository<HRPolicy>,
        @InjectRepository(HRPolicyAcceptance)
        private readonly hrPolicyAcceptanceRepository: Repository<HRPolicyAcceptance>,
    ) { }

    async create(createDto: CreateHRPolicyDto): Promise<HRPolicy> {
        const policy = this.hrPolicyRepository.create(createDto);
        return await this.hrPolicyRepository.save(policy);
    }

    async getSampleExcel(): Promise<Buffer> {
        const data = [
            {
                'Policy Number': 'HR-001',
                'Title': 'Leave Policy',
                'Description': '<p>This is a sample leave policy. You can use <strong>HTML</strong> tags here.</p>',
                'Is Active': 'TRUE'
            },
            {
                'Policy Number': 'HR-002',
                'Title': 'Work From Home Policy',
                'Description': '<p>Details about WFH policy...</p>',
                'Is Active': 'TRUE'
            }
        ];

        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'HR Policies');
        
        // Write to buffer
        const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
        return buffer;
    }

    async bulkUpload(file: Express.Multer.File): Promise<any> {
        if (!file) throw new Error('No file uploaded');

        const workbook = XLSX.read(file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const rows: any[] = XLSX.utils.sheet_to_json(worksheet);

        const results = {
            total: rows.length,
            created: 0,
            updated: 0,
            failed: 0,
            errors: []
        };

        for (const row of rows) {
            try {
                const policyNumber = row['Policy Number']?.toString();
                const title = row['Title']?.toString();
                const description = row['Description']?.toString();
                const isActiveStr = row['Is Active']?.toString().toUpperCase();

                if (!policyNumber || !title) {
                    throw new Error(`Missing required fields for row: ${JSON.stringify(row)}`);
                }

                const isActive = isActiveStr === 'TRUE' || isActiveStr === '1' || isActiveStr === 'YES';

                let policy = await this.hrPolicyRepository.findOne({ where: { policyNumber } });

                if (policy) {
                    policy.title = title;
                    policy.description = description || policy.description;
                    policy.isActive = isActive;
                    await this.hrPolicyRepository.save(policy);
                    results.updated++;
                } else {
                    policy = this.hrPolicyRepository.create({
                        policyNumber,
                        title,
                        description: description || '',
                        isActive
                    });
                    await this.hrPolicyRepository.save(policy);
                    results.created++;
                }
            } catch (error) {
                results.failed++;
                results.errors.push(`Error at row: ${error.message}`);
            }
        }

        return results;
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

    async accept(acceptDto: AcceptHRPolicyDto): Promise<HRPolicyAcceptance> {
        const { userId, policyId, locationId } = acceptDto;
        
        // Check if already accepted
        let acceptance = await this.hrPolicyAcceptanceRepository.findOne({
            where: { userId, policyId }
        });

        if (acceptance) {
            acceptance.locationId = locationId; // Update location if changed
            return await this.hrPolicyAcceptanceRepository.save(acceptance);
        }

        acceptance = this.hrPolicyAcceptanceRepository.create({
            userId,
            policyId,
            locationId
        });

        return await this.hrPolicyAcceptanceRepository.save(acceptance);
    }

    async getAcceptedPolicies(userId: number): Promise<HRPolicyAcceptance[]> {
        return await this.hrPolicyAcceptanceRepository.find({
            where: { userId }
        });
    }
}
