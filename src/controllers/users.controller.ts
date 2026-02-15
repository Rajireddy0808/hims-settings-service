import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UsersService } from '../services/users.service';
import { User } from '../entities/user.entity';

@ApiTags('Settings - Users')
@Controller('settings/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 201, type: User })
  create(@Body() createUserDto: Partial<User>): Promise<User> {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, type: [User] })
  findAll(
    @Query('locationId') locationId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('departmentId') departmentId?: string,
    @Query('search') search?: string
  ) {
    const locationIdNum = locationId ? parseInt(locationId) : undefined;
    const pageNum = page ? parseInt(page) : 1;
    const limitNum = limit ? parseInt(limit) : 10;
    const departmentIdNum = departmentId ? parseInt(departmentId) : undefined;
    return this.usersService.findAll(locationIdNum, pageNum, limitNum, departmentIdNum, search);
  }

  @Get('mobile/:userId')
  @ApiOperation({ summary: 'Get mobile numbers assigned to user for mobile app' })
  @ApiResponse({ status: 200, description: 'List of mobile numbers assigned to user' })
  getMobileNumbersForUser(@Param('userId') userId: string) {
    return this.usersService.getMobileNumbersForUser(+userId);
  }

  @Post('mobile/:userId/call-record')
  @ApiOperation({ summary: 'Submit call record from mobile app' })
  @ApiResponse({ status: 201, description: 'Call record submitted successfully' })
  submitCallRecord(
    @Param('userId') userId: string,
    @Body() callData: {
      mobileNumberId: number;
      disposition: string;
      patientFeeling?: string;
      notes?: string;
      nextCallDate?: string;
    }
  ) {
    return this.usersService.submitCallRecord(+userId, callData);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({ status: 200, type: User })
  findOne(@Param('id') id: string): Promise<User> {
    return this.usersService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update user' })
  @ApiResponse({ status: 200, type: User })
  update(@Param('id') id: string, @Body() updateUserDto: Partial<User>): Promise<User> {
    return this.usersService.update(+id, updateUserDto);
  }

  @Patch(':id/toggle-status')
  @ApiOperation({ summary: 'Toggle user active status' })
  @ApiResponse({ status: 200, type: User })
  toggleStatus(@Param('id') id: string): Promise<User> {
    return this.usersService.toggleStatus(+id);
  }

  @Get(':id/department')
  @ApiOperation({ summary: 'Get user department by location' })
  getUserDepartment(@Param('id') id: string, @Query('locationId') locationId: string) {
    return this.usersService.getUserDepartment(+id, +locationId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete user' })
  remove(@Param('id') id: string): Promise<void> {
    return this.usersService.remove(+id);
  }
}
