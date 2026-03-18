import { IsNumber, IsNotEmpty } from 'class-validator';

export class AcceptHRPolicyDto {
    @IsNumber()
    @IsNotEmpty()
    userId: number;

    @IsNumber()
    @IsNotEmpty()
    policyId: number;

    @IsNumber()
    @IsNotEmpty()
    locationId: number;
}
