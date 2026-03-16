import { IsNotEmpty, IsNumber, IsString, IsOptional, IsDateString, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { ExpenseStatus } from '../entities/employee-expense.entity';

export class CreateExpenseDto {
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  expenseCategoryId: number;

  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
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

  @IsOptional()
  isActive?: boolean;
}