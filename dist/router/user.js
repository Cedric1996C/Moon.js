"use strict";
module.exports = (controller) => {
    return {
        'get /': controller.user.user,
        'get /userinfo': controller.user.userinfo
    };
};
// const user = async (ctx: any, next: any) => {
//   ctx.body = 'hello user';
// }
// const userInfo = async (ctx: any, next: any) => {
//   ctx.body = 'hello userinfo';
// }
// export default {
//   'get /': user,
//   'get /userinfo': userInfo
// }
