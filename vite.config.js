/** cjs2规范 */
// const { defineConfig } = require('vite')
// const viteBaseConfig = require('./config/vite.base.config')
// const viteProConfig = require('./config/vite.pro.config')
// const viteDevConfig = require('./config/vite.dev.config')

// // 策略模式(设计模式)
// const envResolver = {
//     "build": () => Object.assign({}, viteBaseConfig, viteProConfig),
//     "serve": () => Object.assign({}, viteBaseConfig, viteDevConfig)
// }

// // 这里不再写配置，而是写一些操作变量的内容
// module.exports = defineConfig((commond) => {
//     // commond === "build" 生产环境
//     // commond === "serve" 开发环境
//     return envResolver[commond]()
// })

/** esm规范 */
import { defineConfig } from "vite";
import viteBaseConfig from "./config/vite.base.config";
import viteDevConfig from "./config/vite.dev.config";
import viteProConfig from "./config/vite.pro.config";
import { loadEnv } from "vite";
import path from "path";

const envResolver = {
    "build": () => Object.assign({}, viteBaseConfig, viteProConfig),
    "serve": () => Object.assign({}, viteBaseConfig, viteDevConfig)
}

export default defineConfig(({commond, mode}) => {
    // commond === "build" 生产环境
    // commond === "serve" 开发环境
    const config = envResolver[commond]()

    // 通过vite提供的loadEnv方法来加载.env.*的文件中的内容
    // vite内部会在不管是通过dev还是在build命令启动的时候，都会自动调用loadEnv这个方法来将环境变量注入到项目中
    // loadEnv这个命令是vite会自动调用的，我们在这里手动调用会阻止vite的自动调用，通过我们手动调用的方式process.env上面就会加上loadEnv函数解析出来的值
    // loadEnv这个方法内部会使用dotEnv这个库
    // dotEnv会把.env.*的文件中的符合loadEnv第三个参数规则的环境变量写入到process.env这个对象中，成为这个对象的属性。什么是符合loadEnv第三个参数规则？我们一会儿就说
    // 然后vite会再通过一些他自己的规则，对process.env中的属性进行筛选然后注入到我们的源代码中，马上我们就能看到规则了, 这个规则与loadEnv的第三个参数息息相关
    // 特别注意：vite不会把process.env提供给我们的源代码使用，这一点和webpack不同，就像上面一句话说的"vite会通过一些他自己的规则向我们的源代码中注入环境变量"

    /**
     * .env                # 所有情况下都会加载
     * .env.local          # 所有情况下都会加载，但会被 git 忽略
     * .env.[mode]         # 只在指定模式下加载
     * .env.[mode].local   # 只在指定模式下加载，但会被 git 忽略
     */
    /**
     * param1: 用dotEnv读取.env文件和.env.${param1}文件中的环境变量注入到process.env中
     *         如果.env文件和.env.${param1}文件有同名的环境变量，那么会取.env.${param1}文件中环境变量的值
     * param2：.env文件和.env.${param1}文件都存储在哪个目录(文件夹中)下
     * param3：表示.env文件和.env.${param1}文件中以${param3}开头的环境变量才会被vite使用dotEnv这个变量进行读取，并加载到process.env中
     *          这个参数如果不传，默认是"VITE", 如果想让.env文件和.env.${param1}文件中的所有环境变量都加载到process.env中就要在这里传入""
     * return：返回process.env
     */
    const env = loadEnv(mode, /** 可以使用process.cwd() */ path.resolve(__dirname, './env'), "")

    return config
})
