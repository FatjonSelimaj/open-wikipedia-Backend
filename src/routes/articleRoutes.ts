import { Router } from 'express';
import { search, download, listArticles, getArticleById, updateArticle, deleteArticle, checkArticleExistence, getRandomArticle, getArticleHistory } from '../controllers/articleController';
import { authenticateToken } from '../middleware/auth';
import multer from 'multer';

const upload = multer({ dest: 'uploads/' });

const router = Router();

router.get('/search', authenticateToken, search);
router.post('/download', authenticateToken, download);
router.post('/check', authenticateToken, checkArticleExistence);
router.get('/', authenticateToken, listArticles);
router.get('/random', authenticateToken, getRandomArticle);
router.get('/:id', authenticateToken, getArticleById);
router.put('/:id', authenticateToken, updateArticle);
router.delete('/:id', authenticateToken, deleteArticle);
router.get('/history/:articleId', authenticateToken, getArticleHistory);

export default router;
