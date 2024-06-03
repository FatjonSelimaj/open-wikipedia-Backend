"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const articleController_1 = require("../controllers/articleController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get('/search', auth_1.authenticateToken, articleController_1.search);
router.post('/download', auth_1.authenticateToken, articleController_1.download);
router.post('/check', auth_1.authenticateToken, articleController_1.checkArticleExistence); // New route to check if article exists
router.get('/', auth_1.authenticateToken, articleController_1.listArticles);
router.get('/random', auth_1.authenticateToken, articleController_1.getRandomArticle); // New route for article of the day
router.put('/:id', auth_1.authenticateToken, articleController_1.updateArticle);
router.delete('/:id', auth_1.authenticateToken, articleController_1.deleteArticle);
exports.default = router;
