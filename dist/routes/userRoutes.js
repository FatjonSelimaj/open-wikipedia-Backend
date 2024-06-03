"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userController_1 = require("../controllers/userController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.post('/users/register', userController_1.register);
router.post('/users/login', userController_1.login);
router.put('/users/:id', userController_1.updateUser);
router.delete('/users/:id', userController_1.deleteUser);
router.get('/users/me', auth_1.authenticateToken, userController_1.getUserProfile);
router.post('/users/change-password', auth_1.authenticateToken, userController_1.changePassword);
exports.default = router;
