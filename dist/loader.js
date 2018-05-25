"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const koa_router_1 = __importDefault(require("koa-router"));
const logger_1 = __importDefault(require("./logger"));
const decorator_1 = require("./decorator");
const HASLOADED = Symbol('hasloaded');
function removeString(source, str) {
    const index = source.indexOf(str);
    if (index > 0) {
        return {
            source: source.substr(0, index),
            isFound: true
        };
    }
    return {
        source: source,
        isFound: false
    };
}
class Loader {
    constructor(app) {
        this.router = new koa_router_1.default;
        this.controller = {};
        this.app = app;
    }
    appDir() {
        const subString = removeString(__dirname, 'node_modules'); //如果包在node_modules中，正式环境
        if (subString.isFound) {
            return subString.source;
        }
        return subString.source.substr(0, subString.source.length - 4) + '/';
    }
    fileLoader(url) {
        const merge = this.appDir() + url; // app/controller
        return fs.readdirSync(merge).map((name) => {
            return {
                module: require(merge + '/' + name).default,
                filename: name
            };
        });
    }
    loadFlow() {
        this.loadConfig();
        this.loadPlugin();
        this.loadController();
        this.loadService();
        this.loadMiddleware();
        this.loadRouter(); //依赖loadController 
    }
    loadController() {
        this.fileLoader('app/controller');
    }
    loadService() {
        const service = this.fileLoader('app/service');
        this.loadToContext(service, this.app, 'service');
    }
    loadRouter() {
        const routes = decorator_1.deco.getRoutes();
        Object.keys(routes).forEach((route) => {
            routes[route].forEach((deco) => {
                this.router[deco.method](route, async (ctx) => {
                    const instance = new deco.constructor(ctx, this.app);
                    await instance[deco.handler]();
                });
            });
        });
        this.app.use(this.router.routes());
    }
    loadToContext(target, app, property) {
        Object.defineProperty(app.context, property, {
            get() {
                if (!this[HASLOADED]) {
                    this[HASLOADED] = {};
                }
                const loaded = this[HASLOADED];
                if (!loaded[property]) {
                    loaded[property] = {};
                    target.forEach((mod) => {
                        const key = mod.filename.split('.')[0];
                        loaded[property][key] = new mod.module(this, app);
                    });
                    return loaded.service;
                }
                return loaded.service;
            }
        });
    }
    loadMiddleware() {
        try {
            const middleware = this.fileLoader('app/middleware');
            const registedMid = this.app.config['middleware'];
            if (!registedMid)
                return; //如果中间件不存在
            registedMid.forEach((name) => {
                logger_1.default.blue(name);
                for (const index in middleware) {
                    const mod = middleware[index];
                    const fname = mod.filename.split('.')[0];
                    if (name === fname) {
                        this.app.use(mod.module());
                    }
                }
            });
        }
        catch (e) { }
    }
    loadConfig() {
        const configDef = this.appDir() + 'app/config/config.default.js';
        const configEnv = this.appDir()
            + (process.env.NODE_ENV === 'production' ? 'app/config/config.pro.js' : 'app/config/config.dev.js');
        const conf = require(configEnv).default;
        const confDef = require(configDef).default;
        const merge = Object.assign({}, conf, confDef);
        Object.defineProperty(this.app, 'config', {
            get: () => {
                return merge;
            }
        });
    }
    loadPlugin() {
        const Pdir = this.appDir() + 'app/config/plugin.js';
        const plugins = require(Pdir).default;
        for (const index in plugins) {
            const plugin = plugins[index];
            if (plugin.enable) {
                const pkg = require(plugin.package);
                pkg(this.app);
            }
        }
    }
}
exports.Loader = Loader;
