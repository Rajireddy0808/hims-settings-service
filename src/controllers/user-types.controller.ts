import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UserTypesService } from '../services/user-types.service';

@ApiTags('User Types')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('user-types')
export class UserTypesController {
  constructor(private readonly userTypesService: UserTypesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all user types' })
  async getUserTypes() {
    return this.userTypesService.findAll();
  }

  @Post()
  @ApiOperation({ summary: 'Create user type' })
  async createUserType(@Body() data: any) {
    return this.userTypesService.create(data);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update user type' })
  async updateUserType(@Param('id') id: number, @Body() data: any) {
    return this.userTypesService.update(id, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete user type' })
  async deleteUserType(@Param('id') id: number) {
    return this.userTypesService.remove(id);
  }
}