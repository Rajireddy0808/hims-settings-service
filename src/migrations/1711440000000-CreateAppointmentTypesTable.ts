import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateAppointmentTypesTable1711440000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create table if it doesn't exist
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS appointment_types (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                code VARCHAR(50) UNIQUE NOT NULL,
                description TEXT,
                is_active BOOLEAN DEFAULT true,
                location_id INTEGER,
                created_at TIMESTAMP DEFAULT now(),
                updated_at TIMESTAMP DEFAULT now()
            )
        `);

        // Seed initial data
        await queryRunner.query(`
            INSERT INTO appointment_types (name, code, description)
            VALUES 
                ('Consultation', 'consultation', 'General consultation'),
                ('Follow-up', 'follow-up', 'Follow-up visit'),
                ('Emergency', 'emergency', 'Emergency visit')
            ON CONFLICT (code) DO NOTHING
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE IF EXISTS appointment_types`);
    }
}
