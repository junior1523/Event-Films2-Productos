import mysql from "mysql2/promise";
import fs from "fs";

async function setup() {
  const connection = await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root",
    database: "eventfilms",
    multipleStatements: true
  });

  try {
    const files = ["./db/notifications.sql", "./db/users.sql"];
    
    for (const file of files) {
      console.log(`Executing ${file}...`);
      const sql = fs.readFileSync(file, "utf8");
      await connection.query(sql);
    }
    
    console.log("✅ Database setup completed successfully!");
  } catch (err) {
    console.error("❌ Error executing SQL:", err.message);
  } finally {
    await connection.end();
  }
}

setup();
