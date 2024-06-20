import { Request, Response, json } from 'express';
import { PrismaClient } from '@prisma/client';
import multer from 'multer';
import { searchWikipedia, getWikipediaArticle } from '../services/wikipediaService';

const upload = multer({ dest: 'uploads/' });

interface AuthenticatedRequest extends Request {
  userId?: string;
  file?: multer.File;
}

const prisma = new PrismaClient();

/**
 * Search articles on Wikipedia.
 */
const search = async (req: AuthenticatedRequest, res: Response) => {
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({ error: 'Query parameter is required' });
  }

  try {
    const results = await searchWikipedia(query as string);
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: 'Failed to search Wikipedia', details: (error as Error).message });
  }
};

/**
 * Download and save a Wikipedia article.
 */
const download = async (req: AuthenticatedRequest, res: Response) => {
  const { title, lang, overwrite } = req.body;

  if (!req.userId) {
    return res.status(401).json({ error: 'User ID is required' });
  }

  if (!title || !lang) {
    return res.status(400).json({ error: 'Title and language are required' });
  }

  try {
    const articleData = await getWikipediaArticle(title, lang);

    if (!articleData) {
      return res.status(400).json({ error: 'Article not found on Wikipedia' });
    }

    const existingArticle = await prisma.article.findFirst({
      where: { title, authorId: req.userId },
    });

    if (existingArticle && !overwrite) {
      return res.status(409).json({ error: 'Article already exists' });
    }

    if (existingArticle) {
      const updatedArticle = await prisma.article.update({
        where: { id: existingArticle.id },
        data: {
          title: articleData.title,
          content: articleData.content,
        },
      });
      return res.status(200).json(updatedArticle);
    } else {
      const newArticle = await prisma.article.create({
        data: {
          title: articleData.title,
          content: articleData.content,
          authorId: req.userId,
        },
      });
      console.log('New article created successfully', newArticle);
      return res.status(201).json(newArticle);
    }
  } catch (error) {
    console.error('Error downloading article:', error);
    res.status(500).json({ error: 'Article download failed', details: error.message });
  }
};

/**
 * Check if an article already exists for the authenticated user.
 */
const checkArticleExistence = async (req: AuthenticatedRequest, res: Response) => {
  const { title } = req.body;

  if (!req.userId) {
    return res.status(401).json({ error: 'User ID is required' });
  }

  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }

  try {
    const existingArticle = await prisma.article.findFirst({
      where: { title, authorId: req.userId },
    });

    res.json({ exists: !!existingArticle });
  } catch (error) {
    res.status(500).json({ error: 'Failed to check article existence', details: (error as Error).message });
  }
};

/**
 * List all articles for the authenticated user.
 */
const listArticles = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.userId) {
    return res.status(401).json({ error: 'User ID is required' });
  }

  try {
    const articles = await prisma.article.findMany({
      where: { authorId: req.userId },
    });
    res.json(articles);
  } catch (error) {
    res.status(400).json({ error: 'Failed to list articles', details: (error as Error).message });
  }
};

/**
 * Get an article by ID.
 */
const getArticleById = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  if (!req.userId) {
    return res.status(401).json({ error: 'User ID is required' });
  }

  try {
    const article = await prisma.article.findUnique({
      where: { id },
    });

    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    if (article.authorId !== req.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    res.json(article);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch article', details: (error as Error).message });
  }
};

/**
 * Update an existing article.
 */
const updateArticle = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { title, content } = req.body;

  if (!req.userId) {
    return res.status(401).json({ error: 'User ID is required' });
  }

  try {
    const article = await prisma.article.findUnique({
      where: { id },
    });

    if (!article || article.authorId !== req.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Save the edit history
    await prisma.articleHistory.create({
      data: {
        articleId: article.id,
        title: article.title,
        content: article.content,
        authorId: req.userId!,
      },
    });

    const updatedArticle = await prisma.article.update({
      where: { id },
      data: { title, content },
    });
    res.json(updatedArticle);
  } catch (error) {
    res.status(400).json({ error: 'Failed to update article', details: (error as Error).message });
  }
};

/**
 * Delete an article.
 */
const deleteArticle = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  if (!req.userId) {
    return res.status(401).json({ error: 'User ID is required' });
  }

  try {
    const article = await prisma.article.findUnique({
      where: { id },
    });

    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    if (article.authorId !== req.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await prisma.article.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    console.error(`Failed to delete article with ID: ${id}`, error);
    res.status(400).json({ error: 'Failed to delete article', details: (error as Error).message });
  }
};

/**
 * Get a random article for the authenticated user.
 */
const getRandomArticle = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.userId) {
    return res.status(401).json({ error: 'User ID is required' });
  }

  try {
    const articles = await prisma.article.findMany({
      where: { authorId: req.userId },
    });

    if (articles.length === 0) {
      return res.status(200).json({ message: 'No articles found' });
    }

    const randomArticle = articles[Math.floor(Math.random() * articles.length)];
    res.json(randomArticle);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch article of the day', details: (error as Error).message });
  }
};

/**
 * Get the history of an article by article ID.
 */
const getArticleHistory = async (req: AuthenticatedRequest, res: Response) => {
  const { articleId } = req.params;

  if (!req.userId) {
    return res.status(401).json({ error: 'User ID is required' });
  }

  try {
    const history = await prisma.articleHistory.findMany({
      where: { articleId },
      orderBy: { createdAt: 'desc' },
    });

    res.json(history);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch article history', details: (error as Error).message });
  }
};

export { getArticleHistory, search, download, listArticles, getArticleById, updateArticle, deleteArticle, checkArticleExistence, getRandomArticle };
