import { BaseContext } from 'koa';

class Service {
  ctx: BaseContext;
  constructor(ctx: BaseContext) {
    this.ctx = ctx
  }
}

class check extends Service {
  index() {
    console.log(this.ctx.service);
    return this.ctx.serviceNum || 1;
  }
}

module.exports = check;