import fs from 'fs';
import mysql from 'mysql2/promise';

async function reset() {
  const conn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    multipleStatements: true,
  });

  await conn.query('DROP DATABASE IF EXISTS eventfilms');
  await conn.query('CREATE DATABASE eventfilms CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci');
  await conn.query('USE eventfilms');

  const schema = fs.readFileSync('db/schema_mysql.sql', 'utf8');
  await conn.query(schema);

  const [tables] = await conn.query('SHOW TABLES');
  console.log('Reset complete. Tables created:', tables.map((r) => Object.values(r)[0]));
  await conn.end();
}

reset().catch((e) => {
  console.error('Reset failed:', e);
  process.exit(1);
});
