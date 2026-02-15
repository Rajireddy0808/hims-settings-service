import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { EmployeeExpensesService } from '../services/employee-expenses.service';
import { CreateExpenseDto, UpdateExpenseStatusDto } from '../dto/expense.dto';

@Controller('employee-expenses')
export class EmployeeExpensesController {
  constructor(private readonly employeeExpensesService: EmployeeExpensesService) {}

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
  findAllExpenses(@Query('fromDate') fromDate?: string, @Query('toDate') toDate?: string) {
    return this.employeeExpensesService.findAllWithEmployees(fromDate, toDate);
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
  async create(@Request() req, @Body() createExpenseDto: CreateExpenseDto) {
    // Get user's primary location from database
    const user = await this.employeeExpensesService.getUserById(req.user.sub);
    const locationId = user?.primaryLocationId || 1;
    return this.employeeExpensesService.create(req.user.id, createExpenseDto, locationId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.employeeExpensesService.remove(+id, req.user.id);
  }
}