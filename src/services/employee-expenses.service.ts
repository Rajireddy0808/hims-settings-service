import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmployeeExpense, ExpenseStatus } from '../entities/employee-expense.entity';
import { CreateExpenseDto, UpdateExpenseStatusDto } from '../dto/expense.dto';

@Injectable()
export class EmployeeExpensesService {
  constructor(
    @InjectRepository(EmployeeExpense)
    private employeeExpenseRepository: Repository<EmployeeExpense>,
  ) { }

  async findAllWithEmployees(fromDate?: string, toDate?: string, page: number = 1, limit: number = 10): Promise<any> {
    try {
      const query = this.employeeExpenseRepository
        .createQueryBuilder('expense')
        .leftJoinAndSelect('expense.employee', 'employee')
        .leftJoinAndSelect('expense.expenseCategory', 'category')
        .leftJoinAndSelect('expense.approver', 'approver')
        .orderBy('expense.createdAt', 'DESC');

      if (fromDate) {
        query.andWhere('expense.expenseDate >= :fromDate', { fromDate });
      }

      if (toDate) {
        query.andWhere('expense.expenseDate <= :toDate', { toDate });
      }

      const skip = (page - 1) * limit;
      const [expenses, total] = await query
        .skip(skip)
        .take(limit)
        .getManyAndCount();

      // Maintain the same return structure but use the entity objects
      const data = expenses.map(expense => ({
        id: expense.id,
        employeeId: expense.employeeId,
        locationId: expense.locationId,
        amount: expense.amount,
        description: expense.description,
        expenseDate: expense.expenseDate,
        receipt: expense.receipt,
        status: expense.status,
        approvedBy: expense.approvedBy,
        approvedAt: expense.approvedAt,
        rejectionReason: expense.rejectionReason,
        createdAt: expense.createdAt,
        updatedAt: expense.updatedAt,
        expenseCategory: expense.expenseCategory,
        employee: {
          id: expense.employee?.id,
          firstName: expense.employee?.firstName,
          lastName: expense.employee?.lastName,
          email: expense.employee?.email
        },
        approver: expense.approver ? {
          id: expense.approver.id,
          firstName: expense.approver.firstName,
          lastName: expense.approver.lastName,
          email: expense.approver.email
        } : null
      }));

      return {
        data,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      };
    } catch (error) {
      console.error('Error in findAllWithEmployees:', error);
      return { data: [], total: 0, page, limit, totalPages: 0 };
    }
  }

  async findApprovedExpensesByLocation(locationId?: number, status: string = 'approved'): Promise<any[]> {
    try {
      const query = this.employeeExpenseRepository
        .createQueryBuilder('expense')
        .leftJoinAndSelect('expense.employee', 'employee')
        .leftJoinAndSelect('expense.expenseCategory', 'category')
        .where('expense.status = :status', { status })
        .orderBy('expense.expenseDate', 'DESC');

      if (locationId) {
        // locationId in the original query was used on the user's location
        query.andWhere('employee.location_id = :locationId', { locationId });
      }

      const expenses = await query.getMany();

      return expenses.map(expense => ({
        id: expense.id,
        amount: expense.amount,
        description: expense.description,
        expenseDate: expense.expenseDate,
        status: expense.status,
        expenseCategory: {
          id: expense.expenseCategory?.id,
          name: expense.expenseCategory?.name
        },
        employee: {
          id: expense.employee?.id,
          firstName: expense.employee?.firstName,
          lastName: expense.employee?.lastName
        }
      }));
    } catch (error) {
      console.error('Error in findApprovedExpensesByLocation:', error);
      return [];
    }
  }

  async findAll(employeeId?: number): Promise<any[]> {
    try {
      console.log('Service findAll called with employeeId:', employeeId);

      const query = this.employeeExpenseRepository
        .createQueryBuilder('expense')
        .leftJoinAndSelect('expense.expenseCategory', 'category')
        .leftJoinAndSelect('expense.employee', 'employee')
        .leftJoinAndSelect('expense.approver', 'approver')
        .orderBy('expense.createdAt', 'DESC');

      if (employeeId) {
        console.log('Adding WHERE clause for employeeId:', employeeId);
        query.where('expense.employeeId = :employeeId', { employeeId });
      }

      const expenses = await query.getMany();
      console.log('Found expenses:', expenses.length);

      return expenses.map(expense => ({
        id: expense.id,
        employeeId: expense.employeeId,
        expenseCategoryId: expense.expenseCategoryId,
        amount: expense.amount,
        description: expense.description,
        expenseDate: expense.expenseDate,
        receipt: expense.receipt,
        status: expense.status,
        approvedBy: expense.approvedBy,
        approvedAt: expense.approvedAt,
        rejectionReason: expense.rejectionReason,
        createdAt: expense.createdAt,
        updatedAt: expense.updatedAt,
        expenseCategory: {
          id: expense.expenseCategory?.id,
          name: expense.expenseCategory?.name,
          description: expense.expenseCategory?.description,
          isActive: expense.expenseCategory?.isActive
        },
        employee: {
          id: expense.employee?.id,
          firstName: expense.employee?.firstName || 'N/A',
          lastName: expense.employee?.lastName || 'N/A',
          email: expense.employee?.email || 'N/A'
        },
        approver: expense.approver ? {
          id: expense.approver.id,
          firstName: expense.approver.firstName,
          lastName: expense.approver.lastName,
          email: expense.approver.email
        } : null
      }));
    } catch (error) {
      console.error('Error in findAll:', error);
      return [];
    }
  }

  async findOne(id: number): Promise<any> {
    const result = await this.employeeExpenseRepository
      .createQueryBuilder('expense')
      .leftJoin('users', 'user', 'user.id = expense.employeeId')
      .leftJoinAndSelect('expense.expenseCategory', 'category')
      .leftJoinAndSelect('expense.approver', 'approver')
      .select([
        'expense.*',
        'user.firstName as employeeFirstName',
        'user.lastName as employeeLastName',
        'user.email as employeeEmail',
        'category.*',
        'approver.*'
      ])
      .where('expense.id = :id', { id })
      .getRawAndEntities();

    if (!result.entities[0]) {
      throw new NotFoundException('Expense not found');
    }

    const expense = result.entities[0];
    const raw = result.raw[0];

    return {
      ...expense,
      employee: {
        id: expense.employeeId,
        firstName: raw.employeeFirstName,
        lastName: raw.employeeLastName,
        email: raw.employeeEmail
      }
    };
  }

  async getUserById(userId: number): Promise<any> {
    try {
      const user = await this.employeeExpenseRepository.query(
        'SELECT primary_location_id as "primaryLocationId" FROM users WHERE id = $1',
        [userId]
      );
      return user[0] || null;
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  }

  async create(employeeId: number, createExpenseDto: CreateExpenseDto, locationId: number): Promise<EmployeeExpense> {
    const expense = this.employeeExpenseRepository.create({
      ...createExpenseDto,
      employeeId,
      locationId,
      expenseDate: new Date(createExpenseDto.expenseDate)
    });

    return this.employeeExpenseRepository.save(expense);
  }

  async updateStatus(
    id: number,
    updateStatusDto: UpdateExpenseStatusDto,
    approverId: number
  ): Promise<any> {
    console.log('Updating expense with ID:', id, 'to status:', updateStatusDto.status);

    // Get expense details before updating
    const expense = await this.employeeExpenseRepository.findOne({ where: { id } });
    if (!expense) {
      throw new NotFoundException('Expense not found');
    }

    const updateResult = await this.employeeExpenseRepository.update(id, {
      status: updateStatusDto.status,
      approvedBy: approverId,
      approvedAt: new Date(),
      ...(updateStatusDto.status === ExpenseStatus.REJECTED && updateStatusDto.rejectionReason && {
        rejectionReason: updateStatusDto.rejectionReason
      })
    });

    // If approved, deduct from cash balance
    if (updateStatusDto.status === ExpenseStatus.APPROVED && expense.locationId) {
      try {
        await this.employeeExpenseRepository.query(
          `INSERT INTO cash_balances (location_id, amount, transaction_type, description, created_at, updated_at)
           VALUES ($1, $2, 'debit', $3, NOW(), NOW())`,
          [expense.locationId, expense.amount, `Expense approved - ${expense.description || 'Employee expense'}`]
        );
      } catch (error) {
        console.error('Error updating cash balance:', error);
      }
    }

    console.log('Update result:', updateResult);

    return { success: true, message: 'Status updated successfully', affected: updateResult.affected };
  }

  async getExpensesSummary(employeeId?: number) {
    const query = this.employeeExpenseRepository
      .createQueryBuilder('expense')
      .select([
        'expense.status as status',
        'COUNT(*) as count',
        'SUM(expense.amount) as total'
      ])
      .groupBy('expense.status');

    if (employeeId) {
      query.where('expense.employeeId = :employeeId', { employeeId });
    }

    return query.getRawMany();
  }

  async remove(id: number, employeeId: number): Promise<void> {
    const expense = await this.findOne(id);

    if (expense.employeeId !== employeeId) {
      throw new ForbiddenException('You can only delete your own expenses');
    }

    if (expense.status !== ExpenseStatus.PENDING) {
      throw new ForbiddenException('Only pending expenses can be deleted');
    }

    await this.employeeExpenseRepository.delete(id);
  }
}