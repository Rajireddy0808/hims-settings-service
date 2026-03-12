import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateMobileRechargeTables1700000000001 implements MigrationInterface {
  name = 'CreateMobileRechargeTables1700000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE mobile_operators (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE mobile_sim_masters (
        id SERIAL PRIMARY KEY,
        mobile_number VARCHAR(20) UNIQUE NOT NULL,
        operator_id INTEGER REFERENCES mobile_operators(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE mobile_recharge_plans (
        id SERIAL PRIMARY KEY,
        sim_master_id INTEGER REFERENCES mobile_sim_masters(id),
        user_id INTEGER REFERENCES users(id),
        recharge_days INTEGER NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        recharge_date DATE NOT NULL,
        next_recharge_date DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX idx_mobile_sim_masters_operator_id ON mobile_sim_masters(operator_id);
      CREATE INDEX idx_mobile_recharge_plans_sim_master_id ON mobile_recharge_plans(sim_master_id);
      CREATE INDEX idx_mobile_recharge_plans_user_id ON mobile_recharge_plans(user_id);
      CREATE INDEX idx_mobile_recharge_plans_next_recharge_date ON mobile_recharge_plans(next_recharge_date);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS mobile_recharge_plans CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS mobile_sim_masters CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS mobile_operators CASCADE;`);
  }
}
