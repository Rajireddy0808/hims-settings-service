import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Treatment } from '../entities/treatment.entity';

@Injectable()
export class TreatmentsService implements OnModuleInit {
  constructor(
    @InjectRepository(Treatment)
    private readonly treatmentRepository: Repository<Treatment>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) { }

  async onModuleInit() {
    console.log('[Treatments] 🚀 Initializing Treatment Service...');
    try {
      await this.fixDb();
    } catch (err) {
      console.error('[Treatments] Error during initialization:', err);
    }
  }

  async fixDb(): Promise<string> {
    const results = [];
    try {
      try {
        await this.dataSource.query('ALTER TABLE "treatments" ADD COLUMN IF NOT EXISTS "slug" VARCHAR(255) UNIQUE');
        results.push('Column "slug" ensured in "treatments" table.');
      } catch (err) {
        results.push(`Error adding column: ${err.message}`);
      }

      try {
        await this.dataSource.query(`
          UPDATE "treatments" 
          SET "slug" = LOWER(REGEXP_REPLACE(name, '[^a-zA-Z0-9]+', '-', 'g'))
          WHERE "slug" IS NULL
        `);
        results.push('Slugs populated for existing treatments.');
      } catch (err) {
        results.push(`Error populating slugs: ${err.message}`);
      }

      return results.join(' | ');
    } catch (error) {
      console.error('Critical error in fixDb:', error);
      return `Critical failure: ${error.message}`;
    }
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  }

  async create(createTreatmentDto: any): Promise<Treatment> {
    if (!createTreatmentDto.slug && createTreatmentDto.name) {
      createTreatmentDto.slug = this.generateSlug(createTreatmentDto.name);
    }
    const treatment = this.treatmentRepository.create(createTreatmentDto);
    return this.treatmentRepository.save(treatment) as any;
  }

  async findAll(query: {
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
    search?: string;
  } = {}): Promise<{ items: Treatment[]; total: number } | Treatment[]> {
    const { page, limit, startDate, endDate, search } = query;
    
    // If no pagination/search parameters, return all for backward compatibility
    if (!page && !limit && !startDate && !endDate && !search) {
      return this.treatmentRepository.find({ order: { name: 'ASC' } });
    }

    const currentPage = page ? Number(page) : 1;
    const currentLimit = limit ? Number(limit) : 10;
    const skip = (currentPage - 1) * currentLimit;

    const queryBuilder = this.treatmentRepository.createQueryBuilder('treatment')
      .orderBy('treatment.createdAt', 'DESC')
      .skip(skip)
      .take(currentLimit);

    if (startDate && endDate) {
      queryBuilder.andWhere('treatment.createdAt BETWEEN :startDate AND :endDate', { 
        startDate: new Date(startDate), 
        endDate: new Date(endDate) 
      });
    } else if (startDate) {
      queryBuilder.andWhere('treatment.createdAt >= :startDate', { startDate: new Date(startDate) });
    } else if (endDate) {
      queryBuilder.andWhere('treatment.createdAt <= :endDate', { endDate: new Date(endDate) });
    }

    if (search) {
      queryBuilder.andWhere(
        '(treatment.name ILIKE :search OR treatment.category ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    const [items, total] = await queryBuilder.getManyAndCount();

    return { items, total };
  }

  async findAllActive(): Promise<Treatment[]> {
    return this.treatmentRepository.find({
      where: { status: 'active' },
      order: { name: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Treatment> {
    const treatment = await this.treatmentRepository.findOne({ where: { id } });
    if (!treatment) {
      throw new NotFoundException(`Treatment with ID ${id} not found`);
    }
    return treatment;
  }

  async findOneBySlug(slug: string): Promise<Treatment> {
    const treatment = await this.treatmentRepository.findOne({ where: { slug, status: 'active' } });

    if (!treatment && /^\d+$/.test(slug)) {
      const idTreatment = await this.treatmentRepository.findOne({ where: { id: parseInt(slug), status: 'active' } });
      if (idTreatment) return idTreatment;
    }

    if (!treatment) {
      throw new NotFoundException(`Treatment with slug ${slug} not found`);
    }
    return treatment;
  }

  async update(id: number, updateTreatmentDto: any): Promise<Treatment> {
    await this.findOne(id);
    if (updateTreatmentDto.name && !updateTreatmentDto.slug) {
      updateTreatmentDto.slug = this.generateSlug(updateTreatmentDto.name);
    }
    await this.treatmentRepository.update(id, updateTreatmentDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const treatment = await this.findOne(id);
    await this.treatmentRepository.remove(treatment);
  }
}
