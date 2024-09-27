const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const memory_locker = express.Router();

const pool = require('../function/db');


// 업로드 및 다운로드 설정
const storage = multer.memoryStorage(); // 파일을 메모리에 저장
const upload = multer({ storage });

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

// 새로운 삭제 라우트 추가
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