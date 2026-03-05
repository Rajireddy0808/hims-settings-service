import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, Request, Query, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { EmployeeExpensesService } from '../services/employee-expenses.service';
import { CreateExpenseDto, UpdateExpenseStatusDto } from '../dto/expense.dto';
import { diskStorage } from 'multer';
import { extname } from 'path';
import type { File } from 'multer';

@Controller('employee-expenses')
export class EmployeeExpensesController {
  constructor(private readonly employeeExpensesService: EmployeeExpensesService) { }

  @Put('update-status/:id')
  updateExpenseStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateExpenseStatusDto
  ) {
    return this.employeeExpensesService.updateStatus(+id, updateStatusDto, 1);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Request() req, @Query('employeeId') employeeId?: string) {
    const targetEmployeeId = req.user.id;
    return this.employeeExpensesService.findAll(targetEmployeeId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('summary')
  getExpensesSummary(@Request() req, @Query('employeeId') employeeId?: string) {
    const targetEmployeeId = employeeId ? +employeeId : req.user.id;
    return this.employeeExpensesService.getExpensesSummary(targetEmployeeId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('all')
  findAllExpenses(
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string
  ) {
    return this.employeeExpensesService.findAllWithEmployees(
      fromDate,
      toDate,
      page ? +page : 1,
      limit ? +limit : 10
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('location')
  findApprovedExpensesByLocation(
    @Query('locationId') locationId?: string,
    @Query('status') status?: string
  ) {
    return this.employeeExpensesService.findApprovedExpensesByLocation(
      locationId ? +locationId : undefined,
      status || 'approved'
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.employeeExpensesService.findOne(+id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  @UseInterceptors(FileInterceptor('receipt', {
    storage: diskStorage({
      destination: (req, file, cb) => {
        const fs = require('fs');
        const uploadPath = './uploads/expenses';
        if (!fs.existsSync(uploadPath)) {
          fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'expense-' + uniqueSuffix + extname(file.originalname));
      },
    }),
  }))
  async create(
    @Request() req,
    @Body() createExpenseDto: CreateExpenseDto,
    @UploadedFile() file?: File
  ) {
    // Get user's primary location from database
    const user = await this.employeeExpensesService.getUserById(req.user.id);
    const locationId = user?.primaryLocationId || 1;

    // Use the uploaded filename if available with proper path prefix
    const receiptFilename = file ? `uploads/expenses/${file.filename}` : createExpenseDto.receipt;

    return this.employeeExpensesService.create(
      req.user.id,
      { ...createExpenseDto, receipt: receiptFilename },
      locationId
    );
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.employeeExpensesService.remove(+id, req.user.id);
  }
}