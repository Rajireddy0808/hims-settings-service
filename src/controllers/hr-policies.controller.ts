import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, Query } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { HRPoliciesService } from '../services/hr-policies.service';
import { CreateHRPolicyDto, UpdateHRPolicyDto } from '../dto/hr-policy.dto';

@Controller('hr-policies')
@UseGuards(JwtAuthGuard)
export class HRPoliciesController {
    constructor(private readonly hrPoliciesService: HRPoliciesService) { }

    @Post()
    create(@Body() createDto: CreateHRPolicyDto) {
        return this.hrPoliciesService.create(createDto);
    }

    @Get()
    findAll(
        @Query('page') page?: string,
        @Query('limit') limit?: string,
        @Query('search') search?: string,
    ) {
        return this.hrPoliciesService.findAll(
            page ? +page : 1,
            limit ? +limit : 10,
            search,
        );
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.hrPoliciesService.findOne(+id);
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() updateDto: UpdateHRPolicyDto) {
        return this.hrPoliciesService.update(+id, updateDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.hrPoliciesService.remove(+id);
    }
}
