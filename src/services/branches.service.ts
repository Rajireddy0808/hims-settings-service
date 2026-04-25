import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Branch } from '../entities/branch.entity';

@Injectable()
export class BranchesService implements OnModuleInit {
  constructor(
    @InjectRepository(Branch)
    private branchesRepository: Repository<Branch>,
  ) {}

  async onModuleInit() {
    console.log('[Branches] 🚀 Initializing Branch Service...');
    console.log('[Branches] Initialization completed.');
  }

  private slugify(text: string) {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  async findAll(): Promise<Branch[]> {
    return await this.branchesRepository.find({
      order: { name: 'ASC' },
    });
  }

  async findAllActive(): Promise<Branch[]> {
    return await this.branchesRepository.find({
      where: { status: 'active' },
      order: { name: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Branch> {
    const branch = await this.branchesRepository.findOne({ where: { id } });
    if (!branch) {
      throw new NotFoundException(`Branch with ID ${id} not found`);
    }
    return branch;
  }

  async findBySlug(slug: string): Promise<Branch> {
    const branch = await this.branchesRepository.findOne({ 
      where: { 
        slug: slug,
        status: 'active'
      } 
    });
    if (!branch) {
      throw new NotFoundException(`Branch with slug "${slug}" not found`);
    }
    return branch;
  }

  async create(createBranchDto: any): Promise<Branch> {
    const branch = this.branchesRepository.create(createBranchDto as Partial<Branch>);
    if (!branch.slug) {
      branch.slug = this.slugify(branch.name);
    }
    return await this.branchesRepository.save(branch);
  }

  async update(id: number, updateBranchDto: any): Promise<Branch> {
    const branch = await this.findOne(id);
    if (updateBranchDto.name && updateBranchDto.name !== branch.name) {
      updateBranchDto.slug = updateBranchDto.slug || this.slugify(updateBranchDto.name);
    }
    Object.assign(branch, updateBranchDto);
    return await this.branchesRepository.save(branch);
  }

  async remove(id: number): Promise<void> {
    const branch = await this.findOne(id);
    await this.branchesRepository.remove(branch);
  }
}
