import logger from './logger';

interface explainer {
  method: string;
  constructor: any;
  handler: string;
}

interface explainers {
  [key:string]:Array<explainer>;
}

interface Deco {
  (target: any, propertyKey: string): void;
}

export interface decorator extends Decorator {

  post(url: string): Deco;
  get(url: string): Deco;
  patch(url: string): Deco;
  del(url: string): Deco;
  options(url: string): Deco;
  put(url: string): Deco;
}

class Decorator {
  routers: explainers = {};
  
  setRouter(url: string, explainer: explainer) {
    const _explainer = this.routers[url];
    if (_explainer) {
      // check if http methods are conflicted.
      for (const index in _explainer) {
        const object = _explainer[index];
        if (object.method === explainer.method) {
          logger.error(`路由地址 ${object.method} ${url} 已经存在`);
          return
        }
      }
      // Register if not conflicted.
      this.routers[url].push(explainer);
    } else {
      this.routers[url] = [];
      this.routers[url].push(explainer);
    }
  }

  restfulClass(url: string) {
    return (Class: Function) => {
      ['Get', 'Post', 'Del', 'Put'].forEach((method) => {
        const lowercase = method.toLowerCase();
        const handler = Class.prototype[method];
        if (handler) {
          this.setRouter(url, {
            method: lowercase,
            constructor: Class,
            handler: method
          })
        }
      })
    }
  }
  /**
   * get routes
   */
  getRoutes() {
    return this.routers;
  }
}

const methods = ['get', 'post', 'patch', 'del', 'options', 'put']

methods.forEach((method) => {
  Object.defineProperty(Decorator.prototype, method, {
    get: function () {
      return (url: string) => {
        return (target: any, propertyKey: string) => {
          (<any>this).setRouter(url, {
            method: method,
            constructor: target.constructor,
            handler: propertyKey
          })
        }
      }
    }
  })
})

export const deco: decorator = <any>new Decorator;