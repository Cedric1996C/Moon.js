import fs from 'fs';
import Router from 'koa-router';
import { BaseContext } from 'koa';

export class Loader {
  router: Router = new Router;
  controller: any = {};
  app: any;

  constructor(app: any) {
    this.app = app;
  }

  loadFlow(){
    this.loadConfig();
    this.loadService();
    this.loadController();
    return this.loadRouter();
  }

  loadService() {
    const service = fs.readdirSync(__dirname + '/service');
    var that = this;
    Object.defineProperty(this.app.context, 'service', {
      get() {
        if (!(<any>this)['cache']) {
          (<any>this)['cache'] = {};
        }
        const loaded = (<any>this)['cache'];

        // If some services failed to be loaded ? 
        if (!loaded['service']) {
          loaded['service'] = {};
          service.forEach((d) => {
            const name = d.split('.')[0];
            const mod = require(__dirname + '/service/' + d);
            console.log("mod :", mod);
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
      const controllerName = filename.split('.')[0];
      const mod = require(__dirname + '/controller/' + filename).default;
      if (mod) {
        const methodNames = Object.getOwnPropertyNames(mod.prototype).filter((names) => {
          if (names !== 'constructor') {
            return names;
          }
        })
        Object.defineProperty(this.controller, controllerName, {
          get() {
            const merge: { [key: string]: any } = {};
            methodNames.forEach((name) => {
              merge[name] = {
                type: mod,
                methodName: name
              }
            })
            return merge;
          }
        });
      }
    })
  }

  loadRouter() {
    const mod = require(__dirname + '/router.js');
    const routers = mod(this.controller);

    Object.keys(routers).forEach((route) => {
      const [method, path] = route.split(' ');

      (<any>this.router)[method](path, async (ctx: BaseContext) => {
        const _class = routers[route].type;
        const handler = routers[route].methodName;
        const instance = new _class(ctx, this.app);
        instance[handler]();
      })
    })
    return this.router.routes();
  }

  loadConfig() {
    const pubConfig = require(__dirname + '/config/config.pub.js');
    const envConfig = require(__dirname + 
      (process.env.NODE_ENV === 'production' ? '/config/config.pro.js':'/config/config.dev.js')
    );
    const config = Object.assign({}, pubConfig, envConfig);
    Object.defineProperty(this.app, 'config', {
      get: () => {
        return config;
      }
    });
  }

}