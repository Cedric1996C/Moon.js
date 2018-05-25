"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = __importDefault(require("./logger"));
class Decorator {
    constructor() {
        this.routers = {};
    }
    setRouter(url, explainer) {
        const _explainer = this.routers[url];
        if (_explainer) {
            // check if http methods are conflicted.
            for (const index in _explainer) {
                const object = _explainer[index];
                if (object.method === explainer.method) {
                    logger_1.default.error(`路由地址 ${object.method} ${url} 已经存在`);
                    return;
                }
            }
            // Register if not conflicted.
            this.routers[url].push(explainer);
        }
        else {
            this.routers[url] = [];
            this.routers[url].push(explainer);
        }
    }
    restfulClass(url) {
        return (Class) => {
            ['Get', 'Post', 'Del', 'Put'].forEach((method) => {
                const lowercase = method.toLowerCase();
                const handler = Class.prototype[method];
                if (handler) {
                    this.setRouter(url, {
                        method: lowercase,
                        constructor: Class,
                        handler: method
                    });
                }
            });
        };
    }
    /**
     * get routes
     */
    getRoutes() {
        return this.routers;
    }
}
const methods = ['get', 'post', 'patch', 'del', 'options', 'put'];
methods.forEach((method) => {
    Object.defineProperty(Decorator.prototype, method, {
        get: function () {
            return (url) => {
                return (target, propertyKey) => {
                    this.setRouter(url, {
                        method: method,
                        constructor: target.constructor,
                        handler: propertyKey
                    });
                };
            };
        }
    });
});
exports.deco = new Decorator;
