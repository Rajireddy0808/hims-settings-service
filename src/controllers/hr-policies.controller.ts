import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, Query, UseInterceptors, UploadedFile, Res } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { HRPoliciesService } from '../services/hr-policies.service';
import { CreateHRPolicyDto, UpdateHRPolicyDto } from '../dto/hr-policy.dto';
import { AcceptHRPolicyDto } from '../dto/accept-hr-policy.dto';

@Controller('hr-policies')
@UseGuards(JwtAuthGuard)
export class HRPoliciesController {
    constructor(private readonly hrPoliciesService: HRPoliciesService) { }

    @Post()
    create(@Body() createDto: CreateHRPolicyDto) {
        return this.hrPoliciesService.create(createDto);
    }

    @Get('sample-excel')
    async getSampleExcel(@Res() res: Response) {
        const buffer = await this.hrPoliciesService.getSampleExcel();
        res.set({
            'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition': 'attachment; filename=hr_policies_sample.xlsx',
            'Content-Length': buffer.length,
        });
        res.end(buffer);
    }

    @Post('bulk-upload')
    @UseInterceptors(FileInterceptor('file'))
    async bulkUpload(@UploadedFile() file: Express.Multer.File) {
        return this.hrPoliciesService.bulkUpload(file);
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

    @Post('accept')
    accept(@Body() acceptDto: AcceptHRPolicyDto) {
        return this.hrPoliciesService.accept(acceptDto);
    }

    @Get('accepted-policies')
    getAcceptedPolicies(@Query('userId') userId: string) {
        return this.hrPoliciesService.getAcceptedPolicies(+userId);
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
