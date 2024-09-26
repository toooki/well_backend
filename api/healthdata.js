const express = require('express');
const healthdataRouter = express.Router();
const mysql = require('mysql2/promise');

const pool = require('../function/db');
// // MySQL 연결 설정
// const pool = mysql.createPool({
//   host: '127.0.0.1',
//   user: 'root', // MySQL 사용자 이름
//   password: '1234', // MySQL 비밀번호
//   database: 'welldyingdb', // 사용할 데이터베이스 이름
//   port: 3306,
//   waitForConnections: true,
//   connectionLimit: 10,
//   queueLimit: 0
// });

// POST 라우트 작성
healthdataRouter.post('/savehealthdata', async (req, res) => {
  const { healthchecklist, username } = req.body; // 사용자 이름 받아오기
  // 데이터베이스에 기존 건강리스트 삭제
  const deleteSql = 'DELETE FROM healthdata WHERE username = ?';
  try {
    await pool.query(deleteSql, [username]);
    console.log('Previous bucket list deleted successfully');
  } catch (error) {
    console.error('Error deleting previous bucket list from database:', error);
    res.status(500).json({ error: '이전 버킷리스트 삭제 중 오류가 발생했습니다.' });
    return; // 오류 발생 시 함수 종료
  }

  // 새로운 건강리스트 삽입
  const insertSql = 'INSERT INTO healthdata (username, healthscore, healthstate, memoryscore, memorystate, stressscore, stressstate, nutritionscore, nutritionstate, depressionscore, depressionstate) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
  try {
    // 각각의 건강 점수를 데이터베이스에 저장
    await pool.query(insertSql, [username, healthchecklist[0], healthchecklist[1], healthchecklist[2], healthchecklist[3], healthchecklist[4], healthchecklist[5], healthchecklist[6], healthchecklist[7], healthchecklist[8], healthchecklist[9]]); // username 추가
    console.log('New bucket list saved successfully');
    res.json({ message: '건강체크 결과가 성공적으로 저장되었습니다.' });
  } catch (error) {
    console.error('Error saving new bucket list to database:', error);
    res.status(500).json({ error: '새로운 건강체크 결과 저장 중 오류가 발생했습니다.' });
  }
});

healthdataRouter.get('/healthdatauser', async (req, res) => {
  const { username } = req.query;

  // 데이터베이스에서 해당 사용자의 버킷리스트 가져오기
  const sql = 'SELECT * FROM healthdata WHERE username = ?';

  try {
    const [rows, fields] = await pool.query(sql, [username]);
    res.json(rows); // 사용자의 버킷리스트를 JSON 형식으로 응답
  } catch (error) {
    console.error('Error fetching user bucket list from database:', error);
    res.status(500).json({ error: '사용자의 건강 결과를 가져오는 중 오류가 발생했습니다.' });
  }
});

module.exports = healthdataRouter;