import {Service} from '../core/service';


class check extends Service {
  index() {
    return this.ctx.serviceNum || 1;
  }
}

module.exports = check;