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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePassword = exports.getUserProfile = exports.deleteUser = exports.updateUser = exports.login = exports.register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const SECRET_KEY = process.env.SECRET_KEY || 'default_secret_key';
const passwordValidation = (password) => {
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
};
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, email, password } = req.body;
    if (!passwordValidation(password)) {
        return res.status(400).json({ error: 'Password Debole, deve contenere almeno 8 caratteri, una lettera maiuscola, un numero e un carattere speciale.' });
    }
    const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
    try {
        const newUser = yield prisma.user.create({
            data: {
                username,
                email,
                password: hashedPassword,
            },
        });
        res.status(201).json({ message: 'User registered successfully' });
    }
    catch (error) {
        res.status(400).json({ error: 'User registration failed', details: error.message });
    }
});
exports.register = register;
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    try {
        const user = yield prisma.user.findUnique({
            where: { email },
        });
        if (!user || !(yield bcryptjs_1.default.compare(password, user.password))) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const token = jsonwebtoken_1.default.sign({ userId: user.id }, SECRET_KEY, { expiresIn: '1h' });
        res.json({
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
            }
        });
    }
    catch (error) {
        res.status(400).json({ error: 'Login failed', details: error.message });
    }
});
exports.login = login;
const updateUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { username, email, password } = req.body;
    try {
        const user = yield prisma.user.findUnique({ where: { id } });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const hashedPassword = password ? yield bcryptjs_1.default.hash(password, 10) : user.password;
        const updatedUser = yield prisma.user.update({
            where: { id },
            data: {
                username: username || user.username,
                email: email || user.email,
                password: hashedPassword,
            },
        });
        res.json({ message: 'User updated successfully', user: updatedUser });
    }
    catch (error) {
        res.status(400).json({ error: 'User update failed', details: error.message });
    }
});
exports.updateUser = updateUser;
const deleteUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const user = yield prisma.user.findUnique({ where: { id } });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        yield prisma.user.delete({ where: { id } });
        res.json({ message: 'User and associated articles deleted successfully' });
    }
    catch (error) {
        res.status(400).json({ error: 'User deletion failed', details: error.message });
    }
});
exports.deleteUser = deleteUser;
const getUserProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.userId;
        const user = yield prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    }
    catch (error) {
        res.status(500).json({ message: 'Internal server error', details: error.message });
    }
});
exports.getUserProfile = getUserProfile;
const changePassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { oldPassword, newPassword } = req.body;
    if (!passwordValidation(newPassword)) {
        return res.status(400).json({ error: 'Password Debole, deve contenere almeno 8 caratteri, una lettera maiuscola, un numero e un carattere speciale.' });
    }
    try {
        const user = yield prisma.user.findUnique({ where: { id: req.userId } });
        if (!user || !(yield bcryptjs_1.default.compare(oldPassword, user.password))) {
            return res.status(401).json({ message: 'Old password is incorrect' });
        }
        const hashedNewPassword = yield bcryptjs_1.default.hash(newPassword, 10);
        yield prisma.user.update({
            where: { id: req.userId },
            data: { password: hashedNewPassword }
        });
        res.json({ message: 'Password updated successfully' });
    }
    catch (error) {
        res.status(400).json({ error: 'Password update failed', details: error.message });
    }
});
exports.changePassword = changePassword;
