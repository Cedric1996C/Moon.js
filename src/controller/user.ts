import { Controller } from './base';

export default class User extends Controller {
  async user() {
    console.log("user");
    this.ctx.body = this.ctx.service.check.index();
  }

  async userInfo() {
    this.ctx.body = 'hello userinfo';
  }
}