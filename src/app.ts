import Koa from 'koa';
import {Loader}  from './loader';

const app = new Koa;
const loader = new Loader(app);

app.use(loader.loadFlow());


app.listen(3000, '127.0.0.1', () => {
    console.log('服务器在运行');
})
