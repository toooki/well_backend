const mysql = require('mysql2/promise');
const fs = require('fs');
const dotenv = require('dotenv');

// 환경 변수 로드
dotenv.config();

// MySQL 연결 설정
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 10000, // 타임아웃을 10초로 설정
    ssl: {
        ca: fs.readFileSync("DigiCertGlobalRootCA.crt.pem")
    }
});

module.exports = pool;