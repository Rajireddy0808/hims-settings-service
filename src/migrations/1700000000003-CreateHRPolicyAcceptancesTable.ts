import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateHRPolicyAcceptancesTable1700000000003 implements MigrationInterface {
    name = 'CreateHRPolicyAcceptancesTable1700000000003';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE hr_policy_acceptances (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL,
                policy_id INTEGER NOT NULL,
                location_id INTEGER,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                CONSTRAINT fk_policy FOREIGN KEY (policy_id) REFERENCES hr_policies(id) ON DELETE CASCADE
            );
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE IF EXISTS hr_policy_acceptances CASCADE;`);
    }
}
