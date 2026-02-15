import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExpenseCategory } from '../entities/expense-category.entity';
import { CreateExpenseCategoryDto } from '../dto/expense.dto';

@Injectable()
export class ExpenseCategoriesService {
  constructor(
    @InjectRepository(ExpenseCategory)
    private expenseCategoryRepository: Repository<ExpenseCategory>,
  ) {}

  async findAll(): Promise<ExpenseCategory[]> {
    return this.expenseCategoryRepository.find({ 
      where: { isActive: true },
      order: { name: 'ASC' }
    });
  }

  async findOne(id: number): Promise<ExpenseCategory> {
    return this.expenseCategoryRepository.findOne({ where: { id } });
  }

  async create(createExpenseCategoryDto: CreateExpenseCategoryDto): Promise<ExpenseCategory> {
    const expenseCategory = this.expenseCategoryRepository.create(createExpenseCategoryDto);
    return this.expenseCategoryRepository.save(expenseCategory);
  }

  async update(id: number, updateData: Partial<ExpenseCategory>): Promise<ExpenseCategory> {
    await this.expenseCategoryRepository.update(id, updateData);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.expenseCategoryRepository.update(id, { isActive: false });
  }


}