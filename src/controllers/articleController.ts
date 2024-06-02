import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { searchWikipedia, getWikipediaArticle } from '../services/wikipediaService';

interface AuthenticatedRequest extends Request {
  userId?: string;
}

const prisma = new PrismaClient();

const search = async (req: AuthenticatedRequest, res: Response) => {
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({ error: 'Query parameter is required' });
  }

  try {
    const results = await searchWikipedia(query as string);
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: 'Failed to search Wikipedia', details: error.message });
  }
};

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
      where: {
        title,
        authorId: req.userId,
      },
    });

    if (existingArticle && !overwrite) {
      return res.status(409).json({ error: 'Article already exists' });
    }

    if (existingArticle) {
      // Overwrite the existing article
      const updatedArticle = await prisma.article.update({
        where: { id: existingArticle.id },
        data: {
          title: articleData.title,
          content: articleData.text['*'],
        },
      });
      return res.status(200).json(updatedArticle);
    } else {
      // Create a new article if it doesn't exist
      const newArticle = await prisma.article.create({
        data: {
          title: articleData.title,
          content: articleData.text['*'],
          authorId: req.userId,
        },
      });
      return res.status(201).json(newArticle);
    }
  } catch (error) {
    res.status(400).json({ error: 'Article download failed', details: error.message });
  }
};

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
      where: {
        title,
        authorId: req.userId,
      },
    });

    res.json({ exists: !!existingArticle });
  } catch (error) {
    res.status(500).json({ error: 'Failed to check article existence', details: error.message });
  }
};

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
    res.status(400).json({ error: 'Failed to list articles', details: error.message });
  }
};

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

    const updatedArticle = await prisma.article.update({
      where: { id },
      data: { title, content },
    });
    res.json(updatedArticle);
  } catch (error) {
    res.status(400).json({ error: 'Failed to update article', details: error.message });
  }
};

const deleteArticle = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

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

    await prisma.article.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: 'Failed to delete article', details: error.message });
  }
};

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
    res.status(500).json({ error: 'Failed to fetch article of the day', details: error.message });
  }
};

export { search, download, listArticles, updateArticle, deleteArticle, checkArticleExistence, getRandomArticle };
