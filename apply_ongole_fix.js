const { Pool } = require('pg');

const pool = new Pool({
    host: 'unicare-1.cjioaoua8wgw.eu-north-1.rds.amazonaws.com',
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: 'web1234U',
    ssl: {
        rejectUnauthorized: false
    }
});

async function applyFix() {
    const client = await pool.connect();
    try {
        console.log('--- Fixing Sequence ---');
        await client.query("SELECT setval(pg_get_serial_sequence('user_location_permissions', 'id'), (SELECT MAX(id) FROM user_location_permissions))");
        console.log('Sequence updated.');

        const userId = 79;
        const locationId = 1; // ONGOLE
        const roleId = 2; // Admin
        const departmentId = 45; // RECEPTION

        console.log(`Applying fix for User ID ${userId}...`);

        const insertQuery = `
            INSERT INTO user_location_permissions (user_id, location_id, role_id, department_id, is_active, created_at, updated_at)
            VALUES ($1, $2, $3, $4, true, NOW(), NOW())
            RETURNING id;
        `;

        const res = await client.query(insertQuery, [userId, locationId, roleId, departmentId]);
        console.log('Permission added successfully. ID:', res.rows[0].id);

        // Verify
        const verifyRes = await client.query("SELECT * FROM user_location_permissions WHERE user_id = $1", [userId]);
        console.log('Verified Permissions:');
        console.log(JSON.stringify(verifyRes.rows, null, 2));

    } catch (error) {
        console.error('Error applying fix:', error);
    } finally {
        client.release();
        await pool.end();
    }
}

applyFix();
