import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, Put } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesService } from '../services/roles.service';
import { Role } from '../entities/role.entity';

@ApiTags('Settings - Roles')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('settings/roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new role' })
  @ApiResponse({ status: 201, type: Role })
  create(@Body() createRoleDto: Partial<Role>): Promise<Role> {
    return this.rolesService.create(createRoleDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all roles' })
  @ApiResponse({ status: 200, type: [Role] })
  findAll(
    @Query('locationId') locationId?: string,
    @Query('includeModules') includeModules?: string
  ): Promise<Role[]> {
    const locationIdNum = locationId ? parseInt(locationId) : undefined;
    const includeModulesBool = includeModules === 'true';
    return this.rolesService.findAll(locationIdNum, includeModulesBool);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get role by ID' })
  @ApiResponse({ status: 200, type: Role })
  findOne(@Param('id') id: string): Promise<Role> {
    return this.rolesService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update role' })
  @ApiResponse({ status: 200, type: Role })
  update(@Param('id') id: string, @Body() updateRoleDto: Partial<Role>): Promise<Role> {
    return this.rolesService.update(+id, updateRoleDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete role' })
  remove(@Param('id') id: string): Promise<Role> {
    return this.rolesService.remove(+id);
  }

  @Get(':id/permissions')
  @ApiOperation({ summary: 'Get role permissions' })
  getRolePermissions(
    @Param('id') id: string,
    @Query('locationId') locationId?: string
  ): Promise<any[]> {
    const locationIdNum = locationId ? parseInt(locationId) : undefined;
    return this.rolesService.getRolePermissions(+id, locationIdNum);
  }

  @Put(':id/permissions')
  @ApiOperation({ summary: 'Update role permissions' })
  async updateRolePermissions(@Param('id') id: string, @Body() body: { permissions: any[] }): Promise<{ success: boolean; message: string }> {
    await this.rolesService.updateRolePermissions(+id, body.permissions);
    return { success: true, message: 'Permissions updated successfully' };
  }
}
