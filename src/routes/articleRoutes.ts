import { Router } from 'express';
import { search, download, listArticles, updateArticle, deleteArticle, checkArticleExistence, getRandomArticle } from '../controllers/articleController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.get('/search', authenticateToken, search);
router.post('/download', authenticateToken, download);
router.post('/check', authenticateToken, checkArticleExistence); // New route to check if article exists
router.get('/', authenticateToken, listArticles);
router.get('/random', authenticateToken, getRandomArticle); // New route for article of the day
router.put('/:id', authenticateToken, updateArticle);
router.delete('/:id', authenticateToken, deleteArticle);

export default router;
