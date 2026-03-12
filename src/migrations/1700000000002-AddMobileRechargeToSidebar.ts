import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMobileRechargeToSidebar1700000000002 implements MigrationInterface {
  name = 'AddMobileRechargeToSidebar1700000000002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Insert "Accounts" module if it doesn't exist
    await queryRunner.query(`
      INSERT INTO modules (name, path, icon, "order", status)
      SELECT 'Accounts', 'admin/accounts', 'dollar-sign', 10, 1
      WHERE NOT EXISTS (SELECT 1 FROM modules WHERE name = 'Accounts');
    `);

    // 2. Get the module ID for "Accounts"
    const modules = await queryRunner.query(`SELECT id FROM modules WHERE name = 'Accounts' LIMIT 1;`);
    const moduleId = modules[0].id;

    // 3. Insert "Mobile Recharge" sub-module
    await queryRunner.query(`
      INSERT INTO sub_modules (module_id, subcat_name, subcat_path, icon)
      SELECT ${moduleId}, 'Mobile Recharge', 'admin/accounts/recharge', 'phone'
      WHERE NOT EXISTS (SELECT 1 FROM sub_modules WHERE subcat_name = 'Mobile Recharge' AND module_id = ${moduleId});
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM sub_modules WHERE subcat_name = 'Mobile Recharge';`);
    // We might not want to delete the whole Accounts module as it might be used by other features later
  }
}
