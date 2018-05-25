"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const koa_1 = __importDefault(require("koa"));
const loader_1 = require("./loader");
// import logger from './logger';
const controller_1 = require("./core/controller");
const service_1 = require("./core/service");
const req = __importStar(require("request"));
const decorator_1 = require("./decorator");
class Calabash extends koa_1.default {
    constructor() {
        super();
        this.config = {};
        this.loader = new loader_1.Loader(this);
        this.port = 3000;
        this.ip = '127.0.0.1';
    }
    loadDefaultMiddleware() {
        const bodyParser = require('koa-bodyparser');
        this.use(bodyParser());
    }
    error() {
        this.use(async (ctx, next) => {
            try {
                await next();
                if (ctx.status === 404) {
                    ctx.body = `<h1>404 not found</h1>`;
                    ctx.set('Content-Type', 'text/html');
                }
            }
            catch (e) {
                let status = e.status || 500;
                let message = e.message || '服务器错误';
                var err = `
                <h3>${status}</h3>
                <h3>${message}</h3>
                `;
                e.stack.split('\n').forEach((stk, index) => {
                    if (index !== 0)
                        err = err + `<p>${stk}</p>`;
                });
                ctx.body = err;
                ctx.set('Content-Type', 'text/html');
            }
        });
    }
    runInDev(handler) {
        if (process.env.NODE_ENV !== 'production') {
            handler.bind(this)();
        }
    }
    run(fn, port, ip) {
        this.runInDev(this.error);
        this.loadDefaultMiddleware();
        this.loader.loadFlow();
        return this.listen(port || this.port, ip || this.ip, () => {
            fn && fn(port || this.port, ip || this.ip);
        });
    }
    async curl(url) {
        const c = new Promise((resolve, reject) => {
            req.get(url, undefined, (error, response, body) => {
                if (error) {
                    reject(error);
                }
                else {
                    resolve({ error, response, body });
                }
            });
        });
        return await c;
    }
    async post(url, json) {
        const c = new Promise((resolve, reject) => {
            req.post(url, { body: JSON.stringify(json) }, (error, response, body) => {
                if (error) {
                    reject(error);
                }
                else {
                    resolve({ error, response, body });
                }
            });
        });
        return await c;
    }
}
Calabash.Controller = controller_1.Controller;
Calabash.Service = service_1.Service;
Calabash.decorator = decorator_1.deco;
exports.Calabash = Calabash;
