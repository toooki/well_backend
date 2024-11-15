/**
 * 메인 메뉴중 장례계획 메뉴창의 벡엔드
 * 주요기능
 * 1. 처음 창이 로딩될때 데이터베이스를 검색해 유저가 기록한 정보가 있다면 그 정보를 화면에 띄워줌
 * 2. 유저가 체크표시(저장하기) 버튼을 누르면 유저가 작성한 정보를 가져와 데이터베이스에 기록
 * 작성한 정보: 장례의사 설문(체크박스 3가지), 이송병원 선택(지도를 통한 병원선택), 상조선택(체크박스를 이용한 선택), 장례식장정하기(지도를 통한 장례식장 선택), 영정사진 등록(사진 파일로 등록)
 */

const express = require('express');
const multer = require('multer'); //사진을 업로드 하기 위한 multer모듈
const Funeral = express.Router(); //server.js에 라우팅 하기 위한 설정
const pool = require('../function/db'); //연결할 db

// Multer 설정
const storage = multer.memoryStorage(); // 메모리 스토리지 사용 (파일을 서버의 메모리에 저장)
const upload = multer({ storage });

/**
 * 1번 기능을 수행하기 위한 코드 먼저 유저 명을 가져온 다음에 그 유저명에 대한 데이터베이스를 검색해 그 값들을 rows에 넣어 보낸다 이때 pronunciation즉 사진파일은 base64로 인코딩 하여 전송한다
 */
Funeral.get('/load/:username', async (req, res) => {
  const { username } = req.params;

  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query(
      'SELECT * FROM funeral_planning WHERE username = ?',
      [username]
    );
    connection.release();

    if (rows.length > 0) {
      // 파일을 Base64로 인코딩하여 응답
      const data = rows[0];
      if (data.pronunciation) {
        data.pronunciation = data.pronunciation.toString('base64');
      }
      res.status(200).json(data);
    } else {
      res.status(404).send('No data found for this username');
    }
  } catch (error) {
    console.error('Error loading data:', error);
    res.status(500).send('Error loading data');
  }
});

/**
 * 2번의 기능을 수행하기 위한 코드
 * save 요청이 들어오면 multer을 이용해 사용자가 업로드한 사진파일을 처리한다
 * 그리고 req.body로 부터 정보를 받아온다 정보를 받아오면 데이터베이스에 있는 기존의 데이터는 삭제하고
 * 새로운 데이터를 삽입해준다
 */
Funeral.post('/save', upload.single('pronunciation'), async (req, res) => {
  const {
    username,
    organDonation,
    bodyDonation,
    burialOrCremation,
    hospital,
    funeralServiceAgencies,
    funeralHome,
    pronunciationName
  } = req.body;

  const pronunciation = req.file ? req.file.buffer : null;

  if (!username) {
    return res.status(400).send('Username is required');
  }

  try {
    const connection = await pool.getConnection();

    await connection.query(
      'DELETE FROM funeral_planning WHERE username = ?', [username]
    );

    await connection.query(
      'INSERT INTO funeral_planning (username, organDonation, bodyDonation, burialOrCremation, hospital, funeralServiceAgencies, funeralHome, pronunciationName, pronunciation) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [username, organDonation, bodyDonation, burialOrCremation, hospital, funeralServiceAgencies, funeralHome, pronunciationName, pronunciation]
    );
    connection.release();
    res.status(200).send('Data saved successfully');
  } catch (error) {
    console.error('Error saving data:', error);
    res.status(500).send('Error saving data');
  }
});

module.exports = Funeral;
