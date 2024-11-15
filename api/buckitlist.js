/**
 * 메인 메뉴중 버킷리스트 메뉴창의 벡엔드
 * 주요 기능
 * 1. 처음 창이 로딩될때 데이터베이스를 검색해 유저가 기록한 정보가 있다면 그 정보를 화면에 띄워줌
 * 2. 유저가 체크표시(저장하기) 버튼을 누르면 유저가 작성한 정보를 가져와 데이터베이스에 기록
 * 작성한 정보: 버킷리스트 내용(텍스트), 달성여부(체크박스)
 */

const express = require('express');
const bucketlistRouter = express.Router(); //server.js에 라우팅 하기 위한 설정
const pool = require('../function/db'); //연결할 db

/**
 * 2번기능을 수행하기 위한 코드
 * url로 요청을 받아서 사용자 별로 데이터베이스 기록을 위해 사용자가 작성한 버킷리스트와 유저명을 가져옴
 * 그 후 기존의 사용자의 데이터베이스가 있을 수 있으니 삭제후
 * 새로운 버킷리스트를 삽입 이때 bucketList에는 배열이 들어오기 때문에 for문을 이용해 배열로 하나하나 추가해줌
 */
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
      await pool.query(insertSql, [username, item.text, item.completed]);
    }
    console.log('New bucket list saved successfully');
    res.json({ message: '버킷리스트가 성공적으로 저장되었습니다.' });
  } catch (error) {
    console.error('Error saving new bucket list to database:', error);
    res.status(500).json({ error: '새로운 버킷리스트 저장 중 오류가 발생했습니다.' });
  }
});


/**
 * 1의 기능을 수행하기 위한 코드
 * 유저명을 받아와 그 유저명에 대한 데이터베이스의 기록이 있는지 확인후
 * 있다면 그 기록을 rows에 입력해 프런트엔드에 보냄
 */
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