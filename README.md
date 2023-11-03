# vite-note
## 前置知识
### 构建工具
将各种工具如terser，babel，less，eslint等集成(把...集合起来构成自己的一部分)起来，然后按一定的顺序调用这些工具，把我们写的源代码打包成较高性能的html css js代码的东西
能够让我们不关心使用了什么多余的工具怎么转入源代码而只关心源代码内部的逻辑的工具

### 打包
将我们写的浏览器不认识的代码，如less，ts，jsx等，交给构建工具编译处理成浏览器可以认识的代码(html,css,js)的过程就是打包

### create-vite和vite的关系
1. 首先我们先说pnpm，yarn，npm的create指令
    我们使用pnpm create vite和yarn create vite的时候会首先安装create-vite到一个相当于全局的地方但是与正常的pnpm/yarn add create-vite -g是不同，这个命令会把create-vite这个库安装到一个缓存中(根据npm init、npm innit、npm create/npm exec、npm x/npx推测)，然后再执行这个缓存中的bin指向的可执行文件，并且把执行这个bin的时候的上下文塑造成 *和在敲pnpm/yarn create vite的目录下的上下文相同的上下文* 意思是
    ```shell
    D:\vite> pnpm create vite
    执行create-vite的时候相当于是
    D:\vite> pnpm run create-vite
    ```
    npm create vite和npm innit vite是npm init vite的别名，等同于npm exec create-vite --(这个--有什么用可以看npm的官网，这里不写--也没问题，但与后面的npx create-vite就不完全等价了)，等同于npx create-vite，这个命令会把create-vite这个库安装到某个缓存中，避免全局安装create-vite，然后和上面pnpm/yarn一样塑造出来一个“D:\vite>”的上下文执行create-vite的bin，相当于在执行npm run ...
    对npm详细的介绍可以看[npm中文文档](https://nodejs.cn/npm/cli/v7/commands/npm-exec/)，这个翻译的很好
2. create-vite对标的不是webpack-cli而是create-reacte-app和vue-cli
    [vite与create-vite对标](./README_img/create-vite对标.png)
    
## 深入理解和使用vite
1. 都说vite只支持es module，细说这里面的内容
    1. 开发环境
        在开发环境下，vite会开启一个静态服务器，这是一个静态资源服务器，存在于这个静态资源服务器中的静态资源（尤其指js文件）是模块化的！！！
        什么意思呢？我们都知道现在的浏览器chrome是支持script标签模块化的，就是`<script type="module"></script>`中type="module"这个属性，如果不知道可以看看==文件夹“模块化浏览器”==
        这和vite只支持esm有什么关系呢？关系很大，vite在开发环境时使用的dev-server在对依赖文件进行构建的时候是默认依赖文件(我们自己写的文件和node_module文件)是esm的，如果这些文件是esm的，那么是不是浏览器本身就支持这些文件的模块化呢！！！！！所以vite要做的就是在html中往script标签上添加type="module"这属性就够了！！！！！这是不是很简单，比webpack在开启dev-server之前要把整个项目的依赖关系用自己的模块化进行一次改造要快的多的多（注：除webpack和vite之外的打包构建工具好像都不能使用dev-server，但是可以使用打包完成后就是npm run build之后开启一个服务器）
        但是vite在开启dev-server的时候也要注意不是只有`在html中往script标签上添加type="module"这属性这么简单`还要在我们内部项目引用node_module中的文件的时候，告诉浏览器去解析node_module中的文件，这个具体怎么实现的后面再说
        这个确实很快，但是有没有什么要求呢？要求就是你要是用能够支持esm模块化的浏览器去开发你的项目！！！！！
    2. 生产环境
        你在使用npm run build打包的时候，使用的就不是上面的模式了，而是使用rollup进行打包，因为rollup能把你的代码打包成不支持esm模块化的浏览器也能运行的代码，这个地方就考虑到了不能要求网站的用户使用的浏览器必须支持esm模块化的问题
        由于这里使用rollup进行build，但是rollup是只支持esm模块化引入的，源文件或者node_modules中的导出内容是可以使用cjs2进行导出的(想使用cjs2导出要使用插件，默认的rollup只支持esm的导入导出，但是插件让rollup可以把导出扩展到cjs2，但是导入还是要求是esm的导入！！！！！)，因为rollup是只支持esm模块化的，所以生产环境下vite也是只支持esm的模块化的
        注意：rollup打包的时候由于要支持`用户使用不支持esm模块化的浏览器的问题`，所以rollup和webpack一样要实现一套自己的模块化标准  
2. vite在开发模式下，就是npm run serve的时候如何让浏览器调用到node_module中的js代码
    先看文件夹==“模块化浏览器”==中的目录结构
    我们都知道浏览器支持的模块化是在js文件中可以使用import '/math.js'、import './math.js'(这里不存在import 'math.js' === import './math.js'的情况，也就是说不写./不会被认为是相对于当前路径，估计是node_modules引起的问题)或者import '../'但是不能直接import一个node_modules中的内容，对node_modules进行查找的规范是nodejs和webpack支持的，并不是浏览器支持的
    1. 为什么浏览器不支持
        既然esm是后于cjs2出现的，cjs2采用了查找node_modules的方式，那使用esm的浏览器为什么不支持这个东西呢？
        首先cjs2是使用在node中的，是使用在服务端的，它引用node_modules中的js文件是通过fs模块读取的
        然而esm的浏览器要想获取一个node_modules中的js文件的内容是要通过网络请求的，按照现在的node_modules的相互依赖关系，下载一个包的时候要同时下载好多吧的这种情况，会导致浏览器发出大量的网络请求去获取js文件，但是我们知道浏览器对于同一个域名能同时建立的tcp请求数量是有默认要求的chrome是6个，那么如果你还在使用http1.1，这个时候这6个连接要负责处理这些大量的请求，必然会有很多请求会被阻塞在这些http的连接中(因为http和tcp的队头阻塞等机制要求)，这样会大大降低页面的性能指标(首屏时间什么的都会有变慢的风险)，同时还会增加浏览器的压力
    2. vite和webpack是如何使浏览器支持的呢
        所以我们在index中使用import _ from 'lodash'的时候会出现问题，浏览器不能解析到lodash，如果vite只是简单的`在html中往script标签上添加type="module"这属`的话，这样就不能使用之前webpack的开发的模式了，因为浏览器认识我们源代码中的import _ from 'lodash'这种东西，但是对于我们自己写的代码还好，因为我们自己写的代码可以使用相对引用的方式进行开发，虽然我们程序员也可以使用直接在源代码中使用相对路径的方式引入我们想用的模块来解决这个问题，但是这就违背了vite的初衷(对比webpack要开箱即用)。所以为了能让我们按原来的开发方式进行开发，vite它也要把我们的代码进行转换，但是这种转换于webpack的转换不同，webpack会把我们的代码的模块化方式改成自己实现的模块化方式_webpack__require_，而vite则是只要对我们代码中的import的部分进行转换，如：import _ from 'lodash'改成 import _ from './lodash'，只转换这个就完了吗，当然不是，vite还要把lodash这个包的内容从node_modules中提取出来放到使用import _ from './lodash'引入lodash的文件的同级目录下，这样浏览器就能正常引入lodash了，但是这样还没完，lodash中引入的内容怎么办，lodash这个库里面的代码也是有使用像import dayjs from 'dayjs'这种方式引入的，浏览器还是不认识，所以vite还要把lodash中import的东西改成相对路径，然后把import的东西放到这个路径下。这样就会说了，那做这么多改变，vite凭什么比webpack快，那我们看看webpack是怎么处理node_modules的，webpack不是只读node_modules中每个库的开头的import字段然后修改，webpack是要把所有原来库文件中的导入导出按照自己的模块化来实现，所以webpack也是要处理node_modules，而且webpack处理node_modules的过程更加复杂耗时。
        其实本质上vite和webpack都要对所有的js代码进行编译和分析，但是vite比webpack要快的原因还有一个vite使用esbuild来对js代码进行编译和分析，esbuild对js的编译器是go语言写的，而webpack也要对js代码进行编译和分析，但是webpack的编译器是node写的，node作为网络服务器处理IO密集型的事务很在行，比如，接受用户的网络请求进行回应，向数据库发送网络请求等待回应这种，但是node作为编译工具进行处理cpu密集型的事务就不在行


# webpack关注兼容性node和web的开发，vite只关注web的开发
# vite对比webpack的优势
1.  上手简单，把webpack的大部分loader基本上内置了，不用手动配置，对新手友善 
2.  pnpm start的时间很短，原因是vite只使用import模块化，即：vite只能用于支持`<script type="module"></script>`的浏览器，所以vite不需要对所有的js文件进行模块化转化；对比webpack，他要把import和require的两种规范转化成自己的webpack_require规范，从而对import和require的模块化都做支持，这种转换势必要花费大量的时间


# vite对比webpack的劣势
1.  vite只能用于支持`<script type="module"></script>`的浏览器，就是支持esmodule模块化的浏览器，但是webpack支持所有类型的浏览器，因为webpack的模块化是webpack自己提供的
2. 和上一条的原因相似，webpack支持多种模块化(import和require), vite只使用import模块化也就是es module模块化
