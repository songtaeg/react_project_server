const express = require('express');
const router = express.Router();
const connection = require('../db'); 

// 댓글 생성
router.post('/insert', (req, res) => {
    const { post_id, user_id, content } = req.body;

    // 필드 유효성 검사
    if (!post_id || !user_id || !content) {
        return res.status(400).json({ success: false, message: '모든 필드를 입력해야 합니다.' });
    }

    const query = 'INSERT INTO tbl_comments (post_id, user_id, content) VALUES (?, ?, ?)';
    connection.query(query, [post_id, user_id, content], (error, result) => {
        if (error) {
            console.error('댓글 추가 실패:', error);
            return res.status(500).json({ success: false, message: '댓글 추가에 실패했습니다.' });
        }
        res.status(201).json({ success: true, message: '댓글이 추가되었습니다.', comment_id: result.insertId });
    });
});

// 특정 게시물의 댓글 가져오기
router.get('/:postId', (req, res) => {
    const postId = req.params.postId;

    const query = `SELECT c.*, u.name 
        FROM tbl_comments c 
        JOIN tbl_user u ON c.user_id = u.id 
        WHERE c.post_id = ? `;

        connection.query(query, [postId], (error, comments) => {
        if (error) {
            console.error('댓글 가져오기 실패:', error);
            return res.status(500).json({ success: false, message: '댓글 가져오기 실패' });
        }
        res.json({ success: true, comments });
    });
});

// 댓글 수정
router.put('/:commentId', (req, res) => {
    const commentId = req.params.commentId;
    const { content } = req.body;

    if (!content) {
        return res.status(400).json({ success: false, message: '내용이 필요합니다.' });
    }

    const query = 'UPDATE tbl_comments SET content = ?, updated_at = NOW() WHERE id = ?';
    connection.query(query, [content, commentId], (error, result) => {
        if (error) {
            console.error('댓글 수정 실패:', error);
            return res.status(500).json({ success: false, message: '댓글 수정 실패' });
        }
        if (result.affectedRows > 0) {
            res.json({ success: true, message: '댓글이 수정되었습니다.' });
        } else {
            res.status(404).json({ success: false, message: '댓글을 찾을 수 없습니다.' });
        }
    });
});

// 댓글 삭제
router.delete('/:commentId', (req, res) => {
    const commentId = req.params.commentId;

    if (isNaN(commentId)) {
        return res.status(400).json({ success: false, message: '유효하지 않은 댓글 ID입니다.' });
    }

    const query = 'DELETE FROM tbl_comments WHERE id = ?';
    connection.query(query, [commentId], (error, result) => {
        if (error) {
            console.error('댓글 삭제 실패:', error);
            return res.status(500).json({ success: false, message: '댓글 삭제 실패' });
        }
        if (result.affectedRows > 0) {
            res.json({ success: true, message: '댓글이 삭제되었습니다.' });
        } else {
            res.status(404).json({ success: false, message: '댓글을 찾을 수 없습니다.' });
        }
    });
});

module.exports = router;
