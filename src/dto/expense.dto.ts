import { IsNotEmpty, IsNumber, IsString, IsOptional, IsDateString, IsEnum } from 'class-validator';
import { ExpenseStatus } from '../entities/employee-expense.entity';

export class CreateExpenseDto {
  @IsNotEmpty()
  @IsNumber()
  expenseCategoryId: number;

  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty()
  @IsDateString()
  expenseDate: string;

  @IsOptional()
  @IsString()
  receipt?: string;
}

export class UpdateExpenseStatusDto {
  @IsNotEmpty()
  @IsEnum(ExpenseStatus)
  status: ExpenseStatus;

  @IsOptional()
  @IsString()
  rejectionReason?: string;
}

export class CreateExpenseCategoryDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;
}