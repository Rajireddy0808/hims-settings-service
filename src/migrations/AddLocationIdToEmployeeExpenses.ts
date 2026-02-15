import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddLocationIdToEmployeeExpenses1642600000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn('employee_expenses', new TableColumn({
            name: 'location_id',
            type: 'int',
            isNullable: false,
            default: 1
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('employee_expenses', 'location_id');
    }
}