/**
 * 메인메뉴중 추억사진 메뉴창의 벡엔드
 * 주요기능
 * 1. 처음 창이 로딩될때 데이터베이스를 검색해 유저가 저장한 데이터가 있다면 화면에 보여줌
 * 2. 유저가 사진이나 동영상을 업로드 하거나 삭제하면 실시간으로 데이터베이스를 업데이트함
 */
const express = require('express');
const multer = require('multer');
const memory_locker = express.Router();
const pool = require('../function/db');

// Multer 설정
const storage = multer.memoryStorage(); // 파일을 메모리에 저장
const upload = multer({ storage });

/**
 * 2의 기능을 수행하기 위한 코드 유저가 파일(사진이나 동영상)을 업로드시 파일 이름을 Date.now()를 기준으로 생성하고 원래 파일이름에 붙임 파일의 mimetype을 이용해 이미지인지 비디오인지 구분함
 * 그후 데이터베이스에 삽입한다
 */
memory_locker.post('/upload', upload.single('file'), async (req, res) => {
  const { file } = req;
  if (!file) {
    return res.status(400).send({ message: 'No file uploaded' });
  }

  const filename = Date.now() + '-' + file.originalname;
  const fileType = file.mimetype.startsWith('image') ? 'image' : 'video';

  const sql = 'INSERT INTO memory_locker (username, filename, file, type) VALUES (?, ?, ?, ?)';

  try {
    const [result] = await pool.query(sql, [req.body.username, filename, file.buffer, fileType]);
    res.send({ message: 'File uploaded successfully', fileId: result.insertId });
  } catch (err) {
    console.error('Error saving file to database:', err);
    res.status(500).send({ message: 'Failed to save file to database' });
  }
});

/**
 * 1의기능을 수행하기 위한 코드 유저가 처음 화면을 로딩할때 데이터베이스에 저장된 값이 있으면 프런트 앤드에 그 값을 results에 담아서 보낸다
 */
memory_locker.get('/files', async (req, res) => {
  const username = req.query.username;
  try {
    const [results] = await pool.query('SELECT id, filename, type FROM memory_locker WHERE username = ?', [username]);
    res.send(results);
  } catch (err) {
    console.error('Error fetching files from database:', err);
    res.status(500).send({ message: 'Failed to fetch files' });
  }
});

/**
 * 2의 기능중 삭제를 누를시 파일의 id를 받아와 데이터에이스에서 찾아 삭제한다
 */
memory_locker.delete('/files/:id', async (req, res) => {
  const fileId = req.params.id;
  try {
    const [results] = await pool.query('DELETE FROM memory_locker WHERE id = ?', [fileId]);
    if (results.affectedRows === 0) {
      return res.status(404).send({ message: 'File not found' });
    }
    res.send({ message: 'File deleted successfully' });
  } catch (err) {
    console.error('Error deleting file from database:', err);
    res.status(500).send({ message: 'Failed to delete file' });
  }
});
/**
 * 사용자의 파일을 데이터베이스에서 찾아서 화면에 표시할 수 있게 보내줌
 */
memory_locker.get('/files/:id', async (req, res) => {
  const fileId = req.params.id;
  try {
    const [results] = await pool.query('SELECT file, type FROM memory_locker WHERE id = ?', [fileId]);
    if (results.length === 0) {
      return res.status(404).send({ message: 'File not found' });
    }

    const { file, type } = results[0];
    res.contentType(type);
    res.send(file);
  } catch (err) {
    console.error('Error fetching file from database:', err);
    res.status(500).send({ message: 'Failed to fetch file' });
  }
});

module.exports = memory_locker;