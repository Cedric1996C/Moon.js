import * as fs from 'fs';
import Router from 'koa-router';
import logger from './logger';
import { BaseContext } from 'koa';
<<<<<<< HEAD
import { deco } from './decorator';
import { Calabash } from './calabash';

const HASLOADED = Symbol('hasloaded');

interface FileModule {
  module: any;
  filename: string;
}

interface StringSub {
  source: string;
  isFound: boolean;
}

interface Plugin {
  enable: boolean,
  package: string
}


function removeString(source: string, str: string): StringSub {
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
=======
import  Decorator  from './decorator/decorator';
>>>>>>> 4e9e610046eab3694707f161ddfae8ad3a008b53

export class Loader {
  private router: any = new Router;
  private app: Calabash;
  controller: any = {};

  constructor(app: Calabash) {
    this.app = app;
  }

  private appDir() {
    const subString = removeString(__dirname, 'node_modules');//如果包在node_modules中，正式环境
    if (subString.isFound) {
      return subString.source;
    }
    return subString.source.substr(0, subString.source.length - 4) + '/';
  }

  private fileLoader(url: string): Array<FileModule> {
    const merge = this.appDir() + url; // app/controller

    return fs.readdirSync(merge).map((name) => {
      return {
        module: require(merge + '/' + name).default,
        filename: name
      };
    });
  }

  loadFlow(){
    this.loadConfig();
    this.loadPlugin();
    this.loadController();
    this.loadService();
    this.loadMiddleware();
    this.loadRouter();//依赖loadController 
  }

  loadController(){
    this.fileLoader('app/controller');
  }

  loadService() {
    const service = this.fileLoader('app/service');
    this.loadToContext(service, this.app, 'service');
  }

  loadRouter() {
    const routes = deco.getRoutes();
    Object.keys(routes).forEach((route) => {
      routes[route].forEach((deco) => {
        (<any>this.router)[deco.method](route, async (ctx: BaseContext) => {
          const instance = new deco.constructor(ctx, this.app);
          await instance[deco.handler]();
        })
      })
    })
    this.app.use(this.router.routes());
  }

  loadToContext(target: Array<FileModule>, app: Calabash, property: string) {
    Object.defineProperty(app.context, property, {
      get() {
        if (!(<any>this)[HASLOADED]) {
          (<any>this)[HASLOADED] = {};
        }
<<<<<<< HEAD
        const loaded = (<any>this)[HASLOADED];
        if (!loaded[property]) {
          loaded[property] = {};
          target.forEach((mod) => {
            const key = mod.filename.split('.')[0];
            loaded[property][key] = new mod.module(this, app);
          })
          return loaded.service
        }
        return loaded.service;
      }
    })
  }

  loadMiddleware() {
    try {
      const middleware = this.fileLoader('app/middleware');
      const registedMid = this.app.config['middleware'];

      if (!registedMid) return;//如果中间件不存在
      registedMid.forEach((name: string) => {
        logger.blue(name);
        for (const index in middleware) {
          const mod = middleware[index];
          const fname = mod.filename.split('.')[0];
          if (name === fname) {
            this.app.use(mod.module());
          }
        }
=======
        const loaded = (<any>this)['cache'];

        // If some services failed to be loaded ? 
        if (!loaded['service']) {
          loaded['service'] = {};
          service.forEach((d) => {
            const name = d.split('.')[0];
            const mod = require(__dirname + '/service/' + d);
            loaded['service'][name] = new mod(this, that.app);
          });
          return loaded.service;
        }
        return loaded.service;
      }
    });
  }

  loadController(){
    const dirs = fs.readdirSync(__dirname + '/controller');
    dirs.forEach((filename) => {
      require(__dirname + '/controller/' + filename).default;
    })
  }

  loadRouter() {
    // const mod = require(__dirname + '/router.js');
    // const routers = mod(this.controller);

    const routes = Decorator.getRoutes();
    Object.keys(routes).forEach((route) => {
      routes[route].forEach((deco) => {
        (<any>this.router)[deco.method](route, async (ctx: BaseContext) => {
          const instance = new deco.constructor(ctx, this.app);
          await instance[deco.handler]();
        })
>>>>>>> 4e9e610046eab3694707f161ddfae8ad3a008b53
      })
    } catch (e) { }
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
        return merge
      }
    })
  }

  loadPlugin() {
    const Pdir = this.appDir() + 'app/config/plugin.js';
    const plugins = require(Pdir).default;
    for (const index in plugins) {
      const plugin: Plugin = plugins[index];
      if (plugin.enable) {
        const pkg = require(plugin.package);
        pkg(this.app);
      }
    }
  }
}