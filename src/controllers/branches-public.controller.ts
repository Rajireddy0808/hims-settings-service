import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { BranchesService } from '../services/branches.service';
import { Branch } from '../entities/branch.entity';

@ApiTags('Public Branches')
@Controller('public/branches')
export class BranchesPublicController {
  constructor(private readonly branchesService: BranchesService) {}

  @Get('test')
  @ApiOperation({ summary: 'Diagnostic endpoint' })
  test() {
    return { status: 'ok', message: 'Branches Public Controller is active', timestamp: new Date().toISOString() };
  }

  @Get()
  @ApiOperation({ summary: 'Get all active branches' })
  @ApiResponse({ status: 200, type: [Branch] })
  findAll(): Promise<Branch[]> {
    return this.branchesService.findAllActive();
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get active branch by slug' })
  @ApiResponse({ status: 200, type: Branch })
  findBySlug(@Param('slug') slug: string): Promise<Branch> {
    return this.branchesService.findBySlug(slug);
  }
}
