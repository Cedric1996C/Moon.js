import {BaseContext} from 'koa';
import Koa from 'koa';

export class Service {
  ctx: BaseContext;
  app: Koa
  constructor(ctx: BaseContext, app: Koa) {
    this.ctx = ctx;
    this.app = app;
  }
}