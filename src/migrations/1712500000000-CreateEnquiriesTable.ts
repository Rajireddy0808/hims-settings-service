import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateEnquiriesTable1712500000000 implements MigrationInterface {
  name = 'CreateEnquiriesTable1712500000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS enquiries (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        phone VARCHAR(15) NOT NULL,
        medical_problems TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Trigger to update updated_at if not already defined for patients
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at_column') THEN
          CREATE FUNCTION update_updated_at_column()
          RETURNS TRIGGER AS $body$
          BEGIN
            NEW.updated_at = CURRENT_TIMESTAMP;
            RETURN NEW;
          END;
          $body$ language 'plpgsql';
        END IF;
      END
      $$;

      DROP TRIGGER IF EXISTS update_enquiries_updated_at ON enquiries;
      CREATE TRIGGER update_enquiries_updated_at 
        BEFORE UPDATE ON enquiries 
        FOR EACH ROW 
        EXECUTE FUNCTION update_updated_at_column();
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS enquiries CASCADE;`);
  }
}
