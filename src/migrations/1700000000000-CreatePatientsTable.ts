import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePatientsTable1700000000000 implements MigrationInterface {
  name = 'CreatePatientsTable1700000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE IF EXISTS patients CASCADE;
      
      CREATE TABLE patients (
        id SERIAL PRIMARY KEY,
        patient_id VARCHAR(20) UNIQUE NOT NULL,
        
        salutation VARCHAR(10),
        first_name VARCHAR(100) NOT NULL,
        middle_name VARCHAR(100),
        last_name VARCHAR(100) NOT NULL,
        father_spouse_name VARCHAR(200),
        
        gender VARCHAR(10) NOT NULL,
        date_of_birth DATE,
        blood_group VARCHAR(10),
        marital_status VARCHAR(20),
        
        mobile VARCHAR(15) NOT NULL,
        email VARCHAR(255),
        emergency_contact VARCHAR(15),
        
        address1 TEXT NOT NULL,
        district VARCHAR(100) DEFAULT 'HYDERABAD',
        state VARCHAR(100) DEFAULT 'TELANGANA',
        country VARCHAR(100) DEFAULT 'INDIA',
        pin_code VARCHAR(10) NOT NULL,
        
        medical_history TEXT,
        medical_conditions TEXT,
        
        fee VARCHAR(50),
        fee_type VARCHAR(50),
        source VARCHAR(100),
        occupation VARCHAR(100),
        specialization VARCHAR(100),
        doctor VARCHAR(100),
        
        location_id INTEGER NOT NULL,
        created_by INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status VARCHAR(20) DEFAULT 'active'
      );
      
      CREATE INDEX idx_patients_patient_id ON patients(patient_id);
      CREATE INDEX idx_patients_mobile ON patients(mobile);
      CREATE INDEX idx_patients_location_id ON patients(location_id);
      CREATE INDEX idx_patients_created_by ON patients(created_by);
      CREATE INDEX idx_patients_status ON patients(status);
      
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ language 'plpgsql';
      
      CREATE TRIGGER update_patients_updated_at 
        BEFORE UPDATE ON patients 
        FOR EACH ROW 
        EXECUTE FUNCTION update_updated_at_column();
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS patients CASCADE;`);
    await queryRunner.query(`DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;`);
  }
}
