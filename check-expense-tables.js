const { Client } = require('pg');

const client = new Client({
  host: 'localhost',
  port: 5432,
  database: 'hims',
  user: 'postgres',
  password: 'postgres',
});

async function checkExpenseTables() {
  try {
    await client.connect();
    console.log('Connected to database');

    // Check if expense_categories table exists
    const categoriesResult = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'expense_categories'
      );
    `);
    
    console.log('expense_categories table exists:', categoriesResult.rows[0].exists);

    // Check if employee_expenses table exists
    const expensesResult = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'employee_expenses'
      );
    `);
    
    console.log('employee_expenses table exists:', expensesResult.rows[0].exists);

    // If tables exist, check data
    if (categoriesResult.rows[0].exists) {
      const countResult = await client.query('SELECT COUNT(*) FROM expense_categories');
      console.log('Number of expense categories:', countResult.rows[0].count);
      
      const sampleResult = await client.query('SELECT * FROM expense_categories LIMIT 5');
      console.log('Sample categories:', sampleResult.rows);
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
  }
}

checkExpenseTables();