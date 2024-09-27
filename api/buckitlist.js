const express = require('express');
const bucketlistRouter = express.Router();
const pool = require('../function/db');

// POST 라우트 작성
bucketlistRouter.post('/savebuckitlist', async (req, res) => {
  const { bucketList, username } = req.body; // 사용자 이름 받아오기
  // 데이터베이스에 기존 버킷리스트 삭제
  const deleteSql = 'DELETE FROM bucketlist WHERE username = ?';
  try {
    await pool.query(deleteSql, [username]);
    console.log('Previous bucket list deleted successfully');
  } catch (error) {
    console.error('Error deleting previous bucket list from database:', error);
    res.status(500).json({ error: '이전 버킷리스트 삭제 중 오류가 발생했습니다.' });
    return; // 오류 발생 시 함수 종료
  }

  // 새로운 버킷리스트 삽입
  const insertSql = 'INSERT INTO bucketlist (username, text, completed) VALUES (?, ?, ?)';
  try {
    // 각각의 버킷리스트 아이템을 데이터베이스에 저장
    for (const item of bucketList) {
      await pool.query(insertSql, [username, item.text, item.completed]); // username 추가
    }
    console.log('New bucket list saved successfully');
    res.json({ message: '버킷리스트가 성공적으로 저장되었습니다.' });
  } catch (error) {
    console.error('Error saving new bucket list to database:', error);
    res.status(500).json({ error: '새로운 버킷리스트 저장 중 오류가 발생했습니다.' });
  }
});

bucketlistRouter.get('/bucketlistuser', async (req, res) => {
  const { username } = req.query;

  // 데이터베이스에서 해당 사용자의 버킷리스트 가져오기
  const sql = 'SELECT * FROM bucketlist WHERE username = ?';

  try {
    const [rows, fields] = await pool.query(sql, [username]);
    res.json(rows); // 사용자의 버킷리스트를 JSON 형식으로 응답
  } catch (error) {
    console.error('Error fetching user bucket list from database:', error);
    res.status(500).json({ error: '사용자의 버킷리스트를 가져오는 중 오류가 발생했습니다.' });
  }
});

module.exports = bucketlistRouter;