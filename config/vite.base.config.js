const { defineConfig } = require('vite')

module.exports = defineConfig({
    // 配置环境变量的前缀，只有符合这个前缀的环境变量才会被加入到import.meta.env中
    // envPrefix: "pokemao",

    // 对vite编译css文件的时候的行为进行配置
    css: {
        // 对vite在处理css模块化的时候的行为进行配置
        modules: {
            localsConvention: 'dashesOnly',
            scopeBehaviour: "local",
            // generateScopedName: '[name]_[local]_[hash:5]' // [name]、[local]、[hash:5]这些占位符代表什么意思要看postcss的文档
            // generateScopedName: (name, filename, css) => {
            //     return 
            // },
            // 使生成的hash更加具有独特性
            hashPrefix: "addSalt",
            globalModulePaths: [],  // 不想参与到css模块化的module.css文件的路径
        },
        preprocessorOptions: {
            // 对预处理器less这个程序执行时传入的参数进行配置
            // 执行时传入的参数是指：使用lessc命令时后面跟的参数
            less: {
                math: "always", // 相当于使用 lessc --math="always"
                // 配置项目中所有的less文件中可以使用的全局变量
                globalVars: {
                    // 在项目中所有的less文件中，css规则的属性值都可以使用@mainColor代替
                    /**
                     * 比如：
                     * .warp {
                     *  background-color: @mainColor
                     * }
                     */
                    // 经过lessc编译之后生成的css代码就是
                    /**
                     * .wrap {
                     *  background-color: red
                     * }
                     */
                    mainColor: 'red'
                }
            },
            // 对预处理器sass这个程序执行时传入的参数进行配置
            sass: {

            }
        },
        // 开启css文件的sourcemap
        devSourcemap: true,
        postcss: {
            plugins:[
                // 内部集成了大量的postcss插件
                postcss-preset-env()
            ]
        }
    }
})
