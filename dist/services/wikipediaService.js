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
exports.getWikipediaArticle = exports.searchWikipedia = void 0;
const axios_1 = __importDefault(require("axios"));
const searchWikipedia = (query, lang = 'en') => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield axios_1.default.get(`https://${lang}.wikipedia.org/w/api.php`, {
        params: {
            action: 'query',
            format: 'json',
            list: 'search',
            srsearch: query,
            origin: '*'
        }
    });
    return response.data.query.search;
});
exports.searchWikipedia = searchWikipedia;
const getWikipediaArticle = (title, lang = 'en') => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield axios_1.default.get(`https://${lang}.wikipedia.org/w/api.php`, {
        params: {
            action: 'parse',
            format: 'json',
            page: title,
            prop: 'text',
            origin: '*'
        }
    });
    return response.data.parse;
});
exports.getWikipediaArticle = getWikipediaArticle;
