import mysql from "mysql2/promise";
import fs from "fs";
import path from "path";

async function setup() {
  const connection = await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root",
    database: "eventfilms",
    multipleStatements: true
  });

  try {
    console.log("Reading notifications.sql...");
    const sql = fs.readFileSync("./db/notifications.sql", "utf8");
    
    console.log("Executing SQL...");
    await connection.query(sql);
    
    console.log("✅ Table 'notificaciones' created successfully!");
  } catch (err) {
    console.error("❌ Error executing SQL:", err.message);
  } finally {
    await connection.end();
  }
}

setup();
