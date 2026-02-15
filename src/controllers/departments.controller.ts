import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { DepartmentsService } from '../services/departments.service';
import { Department } from '../entities/department.entity';

@ApiTags('Settings - Departments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('settings/departments')
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new department' })
  @ApiResponse({ status: 201, type: Department })
  create(@Body() createDepartmentDto: Partial<Department>): Promise<Department> {
    return this.departmentsService.create(createDepartmentDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all departments' })
  @ApiResponse({ status: 200, type: [Department] })
  async findAll(@Query('locationId') locationId?: string): Promise<Department[]> {
    if (locationId) {
      return this.departmentsService.findByLocationId(+locationId);
    }
    return this.departmentsService.findAll();
  }

  @Post('by-location')
  @ApiOperation({ summary: 'Get departments by location ID' })
  @ApiResponse({ status: 200, type: [Department] })
  async getDepartmentsByLocation(@Body() body: { locationId: number }): Promise<Department[]> {
    try {

      const result = await this.departmentsService.findByLocationId(body.locationId);

      return result;
    } catch (error) {
      console.error('Departments Controller - Error:', error);
      throw error;
    }
  }

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

  @Delete(':id')
  @ApiOperation({ summary: 'Deactivate department' })
  remove(@Param('id') id: string): Promise<Department> {
    return this.departmentsService.remove(+id);
  }
}
