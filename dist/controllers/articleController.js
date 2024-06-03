"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRandomArticle = exports.checkArticleExistence = exports.deleteArticle = exports.updateArticle = exports.listArticles = exports.download = exports.search = void 0;
const client_1 = require("@prisma/client");
const wikipediaService_1 = require("../services/wikipediaService");
const prisma = new client_1.PrismaClient();
const search = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { query } = req.query;
    if (!query) {
        return res.status(400).json({ error: 'Query parameter is required' });
    }
    try {
        const results = yield (0, wikipediaService_1.searchWikipedia)(query);
        res.json(results);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to search Wikipedia', details: error.message });
    }
});
exports.search = search;
const download = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { title, lang, overwrite } = req.body;
    if (!req.userId) {
        return res.status(401).json({ error: 'User ID is required' });
    }
    if (!title || !lang) {
        return res.status(400).json({ error: 'Title and language are required' });
    }
    try {
        const articleData = yield (0, wikipediaService_1.getWikipediaArticle)(title, lang);
        if (!articleData) {
            return res.status(400).json({ error: 'Article not found on Wikipedia' });
        }
        const existingArticle = yield prisma.article.findFirst({
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
            const updatedArticle = yield prisma.article.update({
                where: { id: existingArticle.id },
                data: {
                    title: articleData.title,
                    content: articleData.text['*'],
                },
            });
            return res.status(200).json(updatedArticle);
        }
        else {
            // Create a new article if it doesn't exist
            const newArticle = yield prisma.article.create({
                data: {
                    title: articleData.title,
                    content: articleData.text['*'],
                    authorId: req.userId,
                },
            });
            return res.status(201).json(newArticle);
        }
    }
    catch (error) {
        res.status(400).json({ error: 'Article download failed', details: error.message });
    }
});
exports.download = download;
const checkArticleExistence = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { title } = req.body;
    if (!req.userId) {
        return res.status(401).json({ error: 'User ID is required' });
    }
    if (!title) {
        return res.status(400).json({ error: 'Title is required' });
    }
    try {
        const existingArticle = yield prisma.article.findFirst({
            where: {
                title,
                authorId: req.userId,
            },
        });
        res.json({ exists: !!existingArticle });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to check article existence', details: error.message });
    }
});
exports.checkArticleExistence = checkArticleExistence;
const listArticles = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.userId) {
        return res.status(401).json({ error: 'User ID is required' });
    }
    try {
        const articles = yield prisma.article.findMany({
            where: { authorId: req.userId },
        });
        res.json(articles);
    }
    catch (error) {
        res.status(400).json({ error: 'Failed to list articles', details: error.message });
    }
});
exports.listArticles = listArticles;
const updateArticle = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { title, content } = req.body;
    if (!req.userId) {
        return res.status(401).json({ error: 'User ID is required' });
    }
    try {
        const article = yield prisma.article.findUnique({
            where: { id },
        });
        if (!article || article.authorId !== req.userId) {
            return res.status(403).json({ error: 'Unauthorized' });
        }
        const updatedArticle = yield prisma.article.update({
            where: { id },
            data: { title, content },
        });
        res.json(updatedArticle);
    }
    catch (error) {
        res.status(400).json({ error: 'Failed to update article', details: error.message });
    }
});
exports.updateArticle = updateArticle;
const deleteArticle = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    if (!req.userId) {
        return res.status(401).json({ error: 'User ID is required' });
    }
    try {
        const article = yield prisma.article.findUnique({
            where: { id },
        });
        if (!article || article.authorId !== req.userId) {
            return res.status(403).json({ error: 'Unauthorized' });
        }
        yield prisma.article.delete({ where: { id } });
        res.status(204).send();
    }
    catch (error) {
        res.status(400).json({ error: 'Failed to delete article', details: error.message });
    }
});
exports.deleteArticle = deleteArticle;
const getRandomArticle = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.userId) {
        return res.status(401).json({ error: 'User ID is required' });
    }
    try {
        const articles = yield prisma.article.findMany({
            where: { authorId: req.userId },
        });
        if (articles.length === 0) {
            return res.status(200).json({ message: 'No articles found' });
        }
        const randomArticle = articles[Math.floor(Math.random() * articles.length)];
        res.json(randomArticle);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch article of the day', details: error.message });
    }
});
exports.getRandomArticle = getRandomArticle;
