const Koa = require('koa')
const fs = require('fs')
const path = require('path')

const app = new Koa()

app.use(async ctx => {
    console.log(ctx.request);
    // 用户在浏览器中键入http://localhost:5173/
    if(ctx.url === '/') {
        const indexHTML = await fs.promises.readFile(path.resolve(__dirname, '../client/index.html'))
        ctx.set('Content-Type', 'text/html')
        ctx.body = indexHTML;
    }
    // 响应的index.html中会通过script标签请求http://localhost:5173/js/main.js
    if(ctx.url === '/js/main.js') {
        const mainJS = await fs.promises.readFile(path.resolve(__dirname, '../client/js/main.js'))
        ctx.set('Content-Type', 'text/javascript')
        ctx.body = mainJS;
    }
    // 响应的main.js中会通过js代码(import App from './App.vue')请求http://localhost:5173/js/App.vue
    if(ctx.url === '/js/App.vue') {
        const AppVUE = await fs.promises.readFile(path.resolve(__dirname, '../client/js/App.vue'))
        // 使用vue的compiler对AppVUE进行编译，编译成js代码
        ctx.set('Content-Type', 'text/javascript')
        ctx.body = AppVUE;
    }
})

app.listen(5173, () => {
    console.log("开发服务器启动在5173");
})
