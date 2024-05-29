import { Router } from 'express';
import { search, download, listArticles, updateArticle, deleteArticle } from '../controllers/articleController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.get('/search', authenticateToken, search);
router.post('/download', authenticateToken, download);
router.get('/', authenticateToken, listArticles);
router.put('/:id', authenticateToken, updateArticle);
router.delete('/:id', authenticateToken, deleteArticle);

export default router;
