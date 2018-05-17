"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const koa_router_1 = __importDefault(require("koa-router"));
class Loader {
    constructor() {
        this.router = new koa_router_1.default;
        this.controller = {};
    }
    loadController() {
        const dirs = fs_1.default.readdirSync(__dirname + '/controller');
        dirs.forEach((filename) => {
            const controllerName = filename.split('.')[0];
            const mod = require(__dirname + '/controller/' + filename).default;
            if (mod) {
                const methodNames = Object.getOwnPropertyNames(mod.prototype).filter((names) => {
                    if (names !== 'constructor') {
                        return names;
                    }
                });
                Object.defineProperty(this.controller, controllerName, {
                    get() {
                        const merge = {};
                        methodNames.forEach((name) => {
                            merge[name] = {
                                type: mod,
                                methodName: name
                            };
                        });
                        return merge;
                    }
                });
            }
        });
    }
    loadRouter() {
        this.loadController();
        const mod = require(__dirname + '/router.js');
        const routers = mod(this.controller);
        Object.keys(routers).forEach((route) => {
            const [method, path] = route.split(' ');
            this.router[method](path, async (ctx) => {
                const _class = routers[route].type;
                const handler = routers[route].methodName;
                const instance = new _class(ctx);
                instance[handler]();
            });
        });
        return this.router.routes();
    }
}
exports.Loader = Loader;
