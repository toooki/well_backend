const express = require('express');
const mindlistRouter = express.Router();
const pool = require('../function/db');

// POST 라우트 작성
mindlistRouter.post('/savemindlist', async (req, res) => {
  const { mindList, username } = req.body; // 사용자 이름 받아오기
  // 데이터베이스에 기존 mind list 삭제
  const deleteSql = 'DELETE FROM mindlist WHERE username = ?';
  try {
    await pool.query(deleteSql, [username]);
    console.log('Previous mind list deleted successfully');
  } catch (error) {
    console.error('Error deleting previous mind list from database:', error);
    res.status(500).json({ error: '이전 mind list 삭제 중 오류가 발생했습니다.' });
    return; // 오류 발생 시 함수 종료
  }

  // 새로운 mind list 삽입
  const insertSql = 'INSERT INTO mindlist (username, text, completed) VALUES (?, ?, ?)';
  try {
    // 각각의 mind list 아이템을 데이터베이스에 저장
    for (const item of mindList) {
      await pool.query(insertSql, [username, item.text, item.completed]); // username 추가
    }
    console.log('New mind list saved successfully');
    res.json({ message: 'mind list가 성공적으로 저장되었습니다.' });
  } catch (error) {
    console.error('Error saving new mind list to database:', error);
    res.status(500).json({ error: '새로운 mind list 저장 중 오류가 발생했습니다.' });
  }
});

mindlistRouter.get('/mindlistuser', async (req, res) => {
  const { username } = req.query;

  // 데이터베이스에서 해당 사용자의 mind list 가져오기
  const sql = 'SELECT * FROM mindlist WHERE username = ?';

  try {
    const [rows, fields] = await pool.query(sql, [username]);
    res.json(rows); // 사용자의 mind list를 JSON 형식으로 응답
  } catch (error) {
    console.error('Error fetching user mind list from database:', error);
    res.status(500).json({ error: '사용자의 mind list를 가져오는 중 오류가 발생했습니다.' });
  }
});

module.exports = mindlistRouter;