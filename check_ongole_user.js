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

async function checkOngoleUser() {
    const client = await pool.connect();
    try {
        console.log('--- User Check ---');
        // Search by username or part of it
        const userRes = await client.query("SELECT id, username, email, is_active FROM users WHERE username ILIKE '%UMAMHESWARI%' OR username ILIKE '%KARETI%'");
        console.log('Users found:');
        console.log(JSON.stringify(userRes.rows, null, 2));

        let userId = null;
        if (userRes.rows.length === 0) {
            console.log('User not found by username. Checking user_info table by name...');
            const userInfoRes = await client.query("SELECT user_id, first_name, last_name FROM user_info WHERE first_name ILIKE '%UMAMHESWARI%' OR last_name ILIKE '%KARETI%'");
            console.log('User Info found:');
            console.log(JSON.stringify(userInfoRes.rows, null, 2));
            if (userInfoRes.rows.length > 0) {
                userId = userInfoRes.rows[0].user_id;
            }
        } else {
            userId = userRes.rows[0].id;
        }

        console.log('--- Locations Check ---');
        const locRes = await client.query("SELECT id, name, location_code, is_active FROM locations WHERE name ILIKE '%Ongole%'");
        console.log('Locations found:');
        console.log(JSON.stringify(locRes.rows, null, 2));

        if (userId) {
            console.log(`--- User Info for User ID ${userId} ---`);
            const userInfoRes = await client.query("SELECT * FROM user_info WHERE user_id = $1", [userId]);
            console.log(JSON.stringify(userInfoRes.rows, null, 2));

            console.log(`--- Permissions for User ID ${userId} ---`);
            const permRes = await client.query("SELECT * FROM user_location_permissions WHERE user_id = $1", [userId]);
            console.log('All permissions for user:');
            console.log(JSON.stringify(permRes.rows, null, 2));

            if (locRes.rows.length > 0) {
                const locId = locRes.rows[0].id;
                const specificPermRes = await client.query("SELECT * FROM user_location_permissions WHERE user_id = $1 AND location_id = $2", [userId, locId]);
                console.log(`Specific Permission for Ongole (ID: ${locId}):`);
                console.log(JSON.stringify(specificPermRes.rows, null, 2));
            }
        }

        console.log('--- Users in Ongole (Location ID 1) ---');
        const ongoleUsersRes = await client.query(`
            SELECT ulp.user_id, ulp.role_id, ulp.department_id, r.name as role_name, d.name as dept_name
            FROM user_location_permissions ulp
            LEFT JOIN roles r ON ulp.role_id = r.id
            LEFT JOIN departments d ON ulp.department_id = d.id
            WHERE ulp.location_id = 1
        `);
        console.log(JSON.stringify(ongoleUsersRes.rows, null, 2));

        console.log('--- Sample Permissions from Other Users ---');
        const allPermsRes = await client.query("SELECT * FROM user_location_permissions LIMIT 10");
        console.log(JSON.stringify(allPermsRes.rows, null, 2));

        console.log('--- Roles Check ---');
        const rolesRes = await client.query("SELECT id, name FROM roles LIMIT 10");
        console.log(JSON.stringify(rolesRes.rows, null, 2));

        console.log('--- Departments Check ---');
        const deptsRes = await client.query("SELECT id, name FROM departments LIMIT 10");
        console.log(JSON.stringify(deptsRes.rows, null, 2));

    } catch (error) {
        console.error('Error:', error);
    } finally {
        client.release();
        await pool.end();
    }
}

checkOngoleUser();
