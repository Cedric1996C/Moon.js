import { Controller } from '../core/controller';

export default class User extends Controller {
  async user() {
    this.ctx.body = this.ctx.service.check.index();
  }

  async userInfo() {
    this.ctx.body = 'hello userinfo';
  }
}