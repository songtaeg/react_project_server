const express = require('express');
const multer = require('multer');
const router = express.Router();
const connection = require('../db');
const fs = require('fs');
const path = require('path');

// 업로드 디렉토리 설정
const uploadDir = path.join(__dirname, '../uploads');

// 업로드 디렉토리가 없으면 생성
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer 스토리지 설정
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const upload = multer({ storage });

router.post('/insert', upload.single('image_url'), (req, res) => {
  const { user_id, title, content } = req.body;

  // title, content 필드 유효성 검사
  if (!user_id || !title || !content) {
    return res.status(400).json({ success: false, message: '모든 필드를 입력해야 합니다.' });
  }

  const image_url = req.file ? `uploads/${req.file.filename}` : null; // 이미지 URL 생성

  const query = 'INSERT INTO tbl_post (user_id, title, content, image_url) VALUES (?, ?, ?, ?)';

  connection.query(query, [user_id, title, content, image_url], (err, results) => {
    if (err) {
      console.error('SQL 오류:', err.sqlMessage);
      return res.status(500).json({ success: false, message: '게시물 등록 중 오류가 발생했습니다.', error: err.sqlMessage });
    }
    const post_id = results.insertId;
    res.json({ success: true, message: '게시물이 등록되었습니다.', post_id });
  });
});


// 모든 게시물 조회
router.get('/', (req, res) => {
  const query = 'SELECT * FROM tbl_post ORDER BY created_at DESC';

  connection.query(query, (err, results) => {
    if (err) {
      console.error('SQL 오류:', err.sqlMessage);
      return res.status(500).json({ success: false, message: '게시물 조회 중 오류가 발생했습니다.', error: err.sqlMessage });
    }
    res.json({ success: true, posts: results });
  });
});

// 게시물 수정
router.put('/:postId', upload.single('image_url'), (req, res) => {
  const { postId } = req.params;
  const { content } = req.body;

  // 기존 이미지 URL 조회
  const selectQuery = 'SELECT image_url FROM tbl_post WHERE post_id = ?';
  connection.query(selectQuery, [postId], (err, results) => {
    if (err) {
      console.error('SQL 오류:', err.sqlMessage);
      return res.status(500).json({ success: false, message: '게시물 수정 중 오류가 발생했습니다.', error: err.sqlMessage });
    }
    if (results.length === 0) {
      return res.status(404).json({ success: false, message: '게시물을 찾을 수 없습니다.' });
    }

    const existingImageUrl = results[0].image_url;
    const image_url = req.file ? `uploads/${req.file.filename}` : existingImageUrl;

    const query = 'UPDATE tbl_post SET content = ?, image_url = ? WHERE post_id = ?';
    connection.query(query, [content, image_url, postId], (err, results) => {
      if (err) {
        console.error('SQL 오류:', err.sqlMessage);
        return res.status(500).json({ success: false, message: '게시물 수정 중 오류가 발생했습니다.', error: err.sqlMessage });
      }
      if (results.affectedRows === 0) {
        return res.status(404).json({ success: false, message: '게시물을 찾을 수 없습니다.' });
      }
      res.json({ success: true, message: '게시물이 수정되었습니다.' });
    });
  });
});

// 게시물 삭제
router.delete('/:postId', (req, res) => {
  const { postId } = req.params;

  const selectQuery = 'SELECT image_url FROM tbl_post WHERE post_id = ?';
  connection.query(selectQuery, [postId], (err, results) => {
    if (err) {
      console.error('SQL 오류:', err.sqlMessage);
      return res.status(500).json({ success: false, message: '게시물 삭제 중 오류가 발생했습니다.', error: err.sqlMessage });
    }
    if (results.length === 0) {
      return res.status(404).json({ success: false, message: '게시물을 찾을 수 없습니다.' });
    }

    const imageUrl = results[0].image_url;

    // image_url이 null이 아닐 경우에만 imagePath 설정
    const imagePath = imageUrl ? path.join(uploadDir, path.basename(imageUrl)) : null; 

    const query = 'DELETE FROM tbl_post WHERE post_id = ?';
    connection.query(query, [postId], (err, results) => {
      if (err) {
        console.error('SQL 오류:', err.sqlMessage);
        return res.status(500).json({ success: false, message: '게시물 삭제 중 오류가 발생했습니다.', error: err.sqlMessage });
      }

      // 이미지 파일 삭제 조건 수정: imagePath가 유효할 경우에만 삭제
      if (imagePath && fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
      res.json({ success: true, message: '게시물이 삭제되었습니다.' });
    });
  });
});


module.exports = router;
