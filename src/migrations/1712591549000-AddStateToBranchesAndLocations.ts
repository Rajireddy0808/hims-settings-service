import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddStateToBranchesAndLocations1712591549000 implements MigrationInterface {
  name = 'AddStateToBranchesAndLocations1712591549000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add state to branches
    await queryRunner.query(`
      ALTER TABLE branches 
      ADD COLUMN IF NOT EXISTS state VARCHAR(100) DEFAULT 'Andhra Pradesh';
    `);

    // Add state to locations
    await queryRunner.query(`
      ALTER TABLE locations 
      ADD COLUMN IF NOT EXISTS state VARCHAR(100) DEFAULT 'Andhra Pradesh';
    `);
    
    // Ensure existing records have a state
    await queryRunner.query(`
      UPDATE branches SET state = 'Andhra Pradesh' WHERE state IS NULL;
      UPDATE locations SET state = 'Andhra Pradesh' WHERE state IS NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE branches DROP COLUMN IF EXISTS state;
      ALTER TABLE locations DROP COLUMN IF EXISTS state;
    `);
  }
}
