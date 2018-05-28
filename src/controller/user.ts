import { Controller } from '../core/controller';
import decorator from '../decorator/decorator';

export default class User extends Controller {

  @decorator.get('/')
  async user() {
    this.ctx.body = this.ctx.service.check.index();
  }

  @decorator.get('/userinfo')
  async userInfo() {
    this.ctx.body = 'hello userinfo';
  }
}