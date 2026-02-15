import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentInstallment } from '../entities/payment-installment.entity';

@Injectable()
export class CashCollectionsService {
  constructor(
    @InjectRepository(PaymentInstallment)
    private paymentInstallmentRepository: Repository<PaymentInstallment>,
  ) {}

  async getCashCollections(locationId?: number, page: number = 1, limit: number = 10, fromDate?: string, toDate?: string) {
    const query = this.paymentInstallmentRepository
      .createQueryBuilder('pi')
      .leftJoin('patient_examination', 'pe', 'pe.id = pi.patientExaminationId')
      .select([
        'pi.id as id',
        'DATE(pi.paymentDate) as date',
        'pi.amount as amount',
        'pi.paymentMethod as payment_method',
        '\'credit\' as transaction_type'
      ])
      .where('LOWER(pi.paymentMethod) = :paymentMethod', { paymentMethod: 'cash' });

    if (locationId) {
      query.andWhere('pe.locationId = :locationId', { locationId });
    }

    if (fromDate) {
      query.andWhere('pi.paymentDate >= :fromDate', { fromDate });
    }

    if (toDate) {
      query.andWhere('pi.paymentDate <= :toDate', { toDate });
    }

    // Get expenses
    let expensesQuery = `
      SELECT 
        ee.id,
        DATE(ee.updated_at) as date,
        ee.amount,
        'Expense' as payment_method,
        'debit' as transaction_type
      FROM employee_expenses ee
      WHERE ee.status = 'approved'
    `;
    
    const expenseParams: any[] = [];
    let paramIndex = 1;
    
    if (locationId) {
      expensesQuery += ` AND ee.location_id = $${paramIndex}`;
      expenseParams.push(locationId);
      paramIndex++;
    }
    
    if (fromDate) {
      expensesQuery += ` AND ee.updated_at >= $${paramIndex}`;
      expenseParams.push(fromDate);
      paramIndex++;
    }
    
    if (toDate) {
      expensesQuery += ` AND ee.updated_at <= $${paramIndex}`;
      expenseParams.push(toDate);
      paramIndex++;
    }

    const [collections, expenses] = await Promise.all([
      query.getRawMany(),
      this.paymentInstallmentRepository.query(expensesQuery, expenseParams)
    ]);

    // Group by date
    const groupedByDate = {};
    
    collections.forEach(item => {
      const dateKey = item.date;
      if (!groupedByDate[dateKey]) {
        groupedByDate[dateKey] = { date: dateKey, credit: 0, debit: 0 };
      }
      groupedByDate[dateKey].credit += parseFloat(item.amount);
    });
    
    expenses.forEach(item => {
      const dateKey = item.date;
      if (!groupedByDate[dateKey]) {
        groupedByDate[dateKey] = { date: dateKey, credit: 0, debit: 0 };
      }
      groupedByDate[dateKey].debit += parseFloat(item.amount);
    });

    // Convert to array and sort by date descending
    const combined = Object.values(groupedByDate).sort((a: any, b: any) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    // Calculate running balance from oldest to newest
    let balance = 0;
    const sortedAsc = [...combined].reverse();
    const dataWithBalance = sortedAsc.map((item: any) => {
      balance += item.credit - item.debit;
      return {
        date: item.date,
        credit: item.credit.toFixed(2),
        debit: item.debit.toFixed(2),
        balance: balance.toFixed(2)
      };
    });

    // Reverse back to descending order for display
    dataWithBalance.reverse();

    // Paginate
    const total = dataWithBalance.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedData = dataWithBalance.slice(startIndex, endIndex);

    const totalCash = collections.reduce((sum, c) => sum + parseFloat(c.amount), 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + parseFloat(e.amount), 0);

    return {
      data: paginatedData,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      },
      summary: {
        totalCash,
        totalExpenses,
        currentBalance: balance
      }
    };
  }
}