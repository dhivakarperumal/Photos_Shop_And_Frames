const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

(async () => {
  const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'frame_Shop_db',
    port: Number(process.env.DB_PORT || 3306),
  };

  const conn = await mysql.createConnection(dbConfig);
  const checks = [
    { name: 'provider', type: 'VARCHAR(50) NOT NULL DEFAULT \"local\"' },
    { name: 'provider_account_id', type: 'VARCHAR(255) NULL' },
    { name: 'google_client_id', type: 'VARCHAR(255) NULL' },
  ];

  for (const item of checks) {
    try {
      await conn.query(`ALTER TABLE users ADD COLUMN ${item.name} ${item.type}`);
      console.log('added', item.name);
    } catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('exists', item.name);
      } else {
        console.log('error', item.name, error.code || error.message);
      }
    }
  }

  await conn.end();
})();
