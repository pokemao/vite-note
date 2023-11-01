# vite-note
深入理解和使用vite

# webpack关注兼容性node和web的开发，vite只关注web的开发
# vite对比webpack的优势
1.  上手简单，把webpack的大部分loader基本上内置了，不用手动配置，对新手友善 
2.  pnpm start的时间很短，原因是vite只使用import模块化，即：vite只能用于支持`<script type="module"></script>`的浏览器，所以vite不需要对所有的js文件进行模块化转化；对比webpack，他要把import和require的两种规范转化成自己的webpack_require规范，从而对import和require的模块化都做支持，这种转换势必要花费大量的时间


# vite对比webpack的劣势
1.  vite只能用于支持`<script type="module"></script>`的浏览器，就是支持esmodule模块化的浏览器，但是webpack支持所有类型的浏览器，因为webpack的模块化是webpack自己提供的
2. 和上一条的原因相似，webpack支持多种模块化(import和require), vite只使用import模块化

# 构建工具
将各种工具如terser，babel，less，eslint等集成(把...集合起来构成自己的一部分)起来，然后按一定的顺序调用这些工具

# 打包
将我们写的浏览器不认识的代码，如less，ts，jsx等，交给攻坚工具编译处理成浏览器可以认识的代码(html,css,js)的过程就是打包