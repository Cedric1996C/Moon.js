import fs from 'fs';
import Router from 'koa-router';
import { BaseContext } from 'koa';
import  Decorator  from './decorator/decorator';

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
    const routes = Decorator.getRoutes();
    Object.keys(routes).forEach((route) => {
      routes[route].forEach((deco) => {
        (<any>this.router)[deco.method](route, async (ctx: BaseContext) => {
          const instance = new deco.constructor(ctx, this.app);
          await instance[deco.handler]();
        })
      })
    })
    return this.router.routes();
  }

  loadConfig() {
    const defConfig = require(__dirname + '/config/config.default.js');
    const envConfig = require(__dirname + 
      (process.env.NODE_ENV === 'production' ? '/config/config.default.js':'/config/config.dev.js')
    );
    const config = Object.assign({}, defConfig, envConfig);
    Object.defineProperty(this.app, 'config', {
      get: () => {
        return config;
      }
    });
  }

  loadPlugin() {
    const pluginModule = require(__dirname + '/config/plugin.js');
    Object.keys(pluginModule).forEach((key) => {
      // pluginModule[key];
      if (pluginModule[key] && pluginModule[key].enable) { //判断是否开启
        const plugin = require(pluginModule[key].packagePath);
        plugin(this.app);
      }
    })
  }

}