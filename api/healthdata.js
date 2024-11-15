/**
 * 메인메뉴중 건강체크 메뉴창의 벡엔드
 * 주요기능
 * 1. 처음 창이 로딩될때 데이터베이스를 검색해 유저의 정보가 있다면 건강체크 창을 건너뛰고 바로 결과를 보여줌
 * 2. 유저가 건강체크를 하고 저장 버튼을 누르면 데이터베이스에 저장하고 결과창을 보여줌
 * 3. 다시설문 버튼을 누르면 결과창에서 건강체크 창으로 이동
 */
const express = require('express');
const healthdataRouter = express.Router(); //server.js에 라우팅 하기 위한 설정
const pool = require('../function/db'); //연결할 db

/**
 * 2번기능을 수행하기 위한 코드 사용자와 건강체크 결과를 가져온 다음 데이터베이스에 저장된 값을 삭제한다 그 후 가져온 값들을 데이터베이스에 삽입한다
 */
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

/**
 * 1번 기능을 수행하기 위한 코드 데이터베이스에서 유저명에 대한 값을 검색하여 rows에 저장한후 프런트앤드에 전송한다
 */
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