"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const koa_1 = __importDefault(require("koa"));
const loader_1 = require("./loader");
// import { user } from './router/user';
const app = new koa_1.default;
// route.get('/', async (ctx, next) => {
//     ctx.body = 'hello ts-koa hhh';
// })
// route.get('/user', user);
const loader = new loader_1.Loader;
app.use(loader.loadRouter());
app.listen(3000, '127.0.0.1', () => {
    console.log('服务器在运行');
});
