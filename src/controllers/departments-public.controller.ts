import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { DepartmentsService } from '../services/departments.service';
import { Department } from '../entities/department.entity';

@ApiTags('Departments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('settings/departments')
export class DepartmentsPublicController {
  constructor(private readonly departmentsService: DepartmentsService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get department by ID' })
  @ApiResponse({ status: 200, type: Department })
  findOne(@Param('id') id: string): Promise<Department> {
    return this.departmentsService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update department' })
  @ApiResponse({ status: 200, type: Department })
  update(@Param('id') id: string, @Body() updateDepartmentDto: Partial<Department>): Promise<Department> {
    return this.departmentsService.update(+id, updateDepartmentDto);
  }
}
