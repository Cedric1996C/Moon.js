interface decorator {
  method: string;
  constructor: any;
  handler: string;
}

interface decorators {
  [key:string]:Array<decorator>;
}

class Decorator {
  routers: decorators = {};
  
  setRouter(url: string, decorator: decorator) {
    const _decorator = this.routers[url];
    if (_decorator) {
      // check if http methods are conflicted.
      for (const index in _decorator) {
        const object = _decorator[index];
        if (object.method === decorator.method) {
          return
        }
      }
      // Register if not conflicted.
      this.routers[url].push(decorator);
    } else {
      this.routers[url] = [];
      this.routers[url].push(decorator);
    }
  }

  /**
    * @instance.get('/')
    * @param url 
    */
  get(url: string) {
    return (target: any, propertyKey: string) => {
      (<any>this).setRouter(url, {
        method: 'get',
        constructor: target.constructor,
        handler: propertyKey
      })
    }
  }
  
  /**
    * @instance.post('/')
    * @param url 
    */
  post(url: string) {
    return (target: any, propertyKey: string) => {
      (<any>this).setRouter(url, {
        method: 'post',
        constructor: target.constructor,
        handler: propertyKey
      })
    }
  }

  /**
    * @instance.delete('/')
    * @param url 
    */
  delete(url: string) {
    return (target: any, propertyKey: string) => {
      (<any>this).setRouter(url, {
        method: 'delete',
        constructor: target.constructor,
        handler: propertyKey
      })
    }
  }

  /**
    * @instance.put('/')
    * @param url 
    */
  put(url: string) {
    return (target: any, propertyKey: string) => {
      (<any>this).setRouter(url, {
        method: 'get',
        constructor: target.constructor,
        handler: propertyKey
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

export = new Decorator();