import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateHRPolicyDto {
    @IsString()
    @IsNotEmpty()
    policyNumber: string;

    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsNotEmpty()
    description: string;
}

export class UpdateHRPolicyDto {
    @IsString()
    @IsOptional()
    policyNumber?: string;

    @IsString()
    @IsOptional()
    title?: string;

    @IsString()
    @IsOptional()
    description?: string;
}
