import Koa from 'koa';

import {Loader}  from './loader';
// import { user } from './router/user';

const app = new Koa;


// route.get('/', async (ctx, next) => {
//     ctx.body = 'hello ts-koa hhh';
// })

// route.get('/user', user);

const loader = new Loader(app);

app.use(loader.loadFlow());


app.listen(3000, '127.0.0.1', () => {
    console.log('服务器在运行');
})
