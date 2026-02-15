import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ModulesService } from '../services/modules.service';
import { Module } from '../entities/module.entity';
import { SubModule } from '../entities/sub-module.entity';

@ApiTags('Settings - Modules')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('settings/modules')
export class ModulesController {
  constructor(private readonly modulesService: ModulesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all modules' })
  @ApiResponse({ status: 200, type: [Module] })
  findAllModules(
    @Query('includeSubModules') includeSubModules?: string,
    @Query('locationId') locationId?: string
  ) {
    // Modules are global, locationId is ignored
    if (includeSubModules === 'true') {
      return this.modulesService.findModulesWithSubModules();
    }
    return this.modulesService.findModulesWithSubModules();
  }

  @Get('sub-modules')
  @ApiOperation({ summary: 'Get all sub-modules' })
  @ApiResponse({ status: 200, type: [SubModule] })
  findAllSubModules(): Promise<SubModule[]> {
    return this.modulesService.findAllSubModules();
  }

  @Get('with-sub-modules')
  @ApiOperation({ summary: 'Get modules with sub-modules hierarchy' })
  async findModulesWithSubModules() {
    try {
      return await this.modulesService.findModulesWithSubModules();
    } catch (error) {
      console.error('Error in findModulesWithSubModules:', error);
      throw error;
    }
  }

  @Post()
  @ApiOperation({ summary: 'Create a new module' })
  @ApiResponse({ status: 201, type: Module })
  createModule(@Body() createModuleDto: Partial<Module>): Promise<Module> {
    return this.modulesService.createModule(createModuleDto);
  }

  @Post('sub-modules')
  @ApiOperation({ summary: 'Create a new sub-module' })
  @ApiResponse({ status: 201, type: SubModule })
  createSubModule(@Body() createSubModuleDto: Partial<SubModule>): Promise<SubModule> {
    return this.modulesService.createSubModule(createSubModuleDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update module' })
  @ApiResponse({ status: 200, type: Module })
  updateModule(@Param('id') id: string, @Body() updateModuleDto: Partial<Module>): Promise<Module> {
    return this.modulesService.updateModule(+id, updateModuleDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete module' })
  removeModule(@Param('id') id: string): Promise<void> {
    return this.modulesService.deleteModule(+id);
  }
}
