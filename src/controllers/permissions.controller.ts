import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsService } from '../services/permissions.service';
import { UserAccess } from '../entities/user-access.entity';

@ApiTags('Settings - Permissions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('settings/permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Get('modules')
  @ApiOperation({ summary: 'Get all modules and sub-modules' })
  getModulePermissions() {
    return this.permissionsService.getModulePermissions();
  }

  @Get('role/:roleId')
  @ApiOperation({ summary: 'Get role permissions' })
  @ApiResponse({ status: 200, type: [UserAccess] })
  getRolePermissions(@Param('roleId') roleId: string): Promise<UserAccess[]> {
    return this.permissionsService.getRolePermissions(+roleId);
  }

  @Get('role/:roleId/with-modules')
  @ApiOperation({ summary: 'Get role permissions with module details' })
  getRolePermissionsWithModules(@Param('roleId') roleId: string) {
    return this.permissionsService.getRolePermissionsWithModules(+roleId);
  }

  @Get('modules-with-permissions/:roleId')
  @ApiOperation({ summary: 'Get modules with submodules and role permissions' })
  getModulesWithPermissions(@Param('roleId') roleId: string) {
    return this.permissionsService.getModulesWithPermissions(+roleId);
  }

  @Post('role/:roleId')
  @ApiOperation({ summary: 'Update role permissions' })
  @ApiResponse({ status: 200, type: [UserAccess] })
  updateRolePermissions(
    @Param('roleId') roleId: string,
    @Body() permissions: Partial<UserAccess>[],
  ): Promise<UserAccess[]> {
    return this.permissionsService.updateRolePermissions(+roleId, permissions);
  }
}
