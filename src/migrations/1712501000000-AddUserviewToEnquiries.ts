import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserviewToEnquiries1712501000000 implements MigrationInterface {
  name = 'AddUserviewToEnquiries1712501000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE enquiries 
      ADD COLUMN IF NOT EXISTS userview VARCHAR(50) DEFAULT 'unread';
      
      -- Update existing records to unread
      UPDATE enquiries SET userview = 'unread' WHERE userview IS NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE enquiries 
      DROP COLUMN IF EXISTS userview;
    `);
  }
}
