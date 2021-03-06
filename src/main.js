// 如何在 webpack 构建的项目中，使用 Vue 进行开发

// 复习 在普通网页中如何使用vue： 
// 1. 使用 script 标签 ，引入 vue 的包
// 2. 在 index 页面中，创建 一个 id 为 app div 容器
// 3. 通过 new Vue 得到一个 vm 的实例


// 在webpack 中尝试使用 Vue：
// 注意： 在 webpack 中， 使用 import Vue from 'vue' 导入的 Vue 构造函数，功能不完整，只提供了 runtime-only 的方式，并没有提供 像网页中那样的使用方式；
import Vue from 'vue';
import Vuex from 'vuex';
import MintUI from 'mint-ui';
import 'mint-ui/lib/style.css';
Vue.use(MintUI);
Vue.use(Vuex);
//从本地获取数据，更新car
var car = JSON.parse(localStorage.getItem('car') || '[]')
var store = new Vuex.Store({
    state: {
        car: car
    },
    mutations: {
        //把商品详情页的数据传到car数组里面
        addToCar(state, goodinfo) {
            var flag = false; //默认商品不存在
            state.car.some(item => {
                if (item.id === goodinfo.id) {
                    item.count += goodinfo.count;
                    flag = true;
                    return true;
                }
            })
            if (!flag) {
                state.car.push(goodinfo);
            }
            //本地做持久化存储
            localStorage.setItem('car', JSON.stringify(state.car))
        },
        //更新商品数量
        updateShopCar(state, newInfo) {
            state.car.forEach(item => {
                if (item.id === newInfo.id) {
                    item.count = newInfo.count;
                    return;
                }
            })
            localStorage.setItem('car', JSON.stringify(state.car));
        },
        //从购物车中删除数据
        removeFromCar(state, id) {
            state.car.forEach((item, index) => {
                if (item.id == id) {
                    state.car.splice(index, 1);
                    return;
                }
            })
            localStorage.setItem('car', JSON.stringify(state.car));
        },
        //更新购物车中商品状态
        updateSelected(state, obj) {
            state.car.forEach(item => {
                if (item.id == obj.id) {
                    item.selected = obj.val;
                    return;
                }
            })
            localStorage.setItem('car', JSON.stringify(state.car))
        }

    },
    getters: {
        //得到购物车里面商品的数量，更新购物车图标
        getAllCounts(state) {
            var count = 0;
            state.car.forEach(item => {
                count += item.count
            })
            return count;
        },
        //获取商品数量，转化为对象形式{id：count}
        getGoodsCount(state) {
            var o = {}
            state.car.forEach(item => {
                o[item.id] = item.count;
            })
            return o;
        },
        //获取商品状态
        getSelected(state) {
            var o = {}
            state.car.forEach(item => {
                o[item.id] = item.selected;
            })
            return o;
        },
        //统计购物车中商品数量和价格
        getSumPrice(state) {
            var o = {
                count: 0, //商品件数
                price: 0 //商品总价
            }
            state.car.forEach(item => {
                if (item.selected) {
                    o.count += item.count
                    o.price += item.count * parseInt(item.price)
                }
            })
            return o
        }
    }
})
Vue.config.devtools = true;
// import Vue from '../node_modules/vue/dist/vue.js'
// 回顾 包的查找规则：
// 1. 找 项目根目录中有没有 node_modules 的文件夹
// 2. 在 node_modules 中 根据包名，找对应的 vue 文件夹
// 3. 在 vue 文件夹中，找 一个叫做 package.json 的包配置文件
// 4. 在 package.json 文件中，查找 一个 main 属性【main属性指定了这个包在被加载时候，的入口文件】

// var login = {
//   template: '<h1>这是login组件，是使用网页中形式创建出来的组件</h1>'
// }


// 1. 导入 login 组件
import app from './App.vue';
import './lib/mui/css/mui.css';
import './lib/mui/css/icons-extra.css';
import router from '../router.js';
// 默认，webpack 无法打包 .vue 文件，需要安装 相关的loader： 
//  cnpm i vue-loader vue-template-compiler -D
//  在配置文件中，新增loader哦配置项 { test:/\.vue$/, use: 'vue-loader' }
import moment from 'moment';
//定义一个全局过滤器，用来格式化时间
Vue.filter("dataFormat", function(dataStr, pattern = "YYYY-MM-DD HH:mm:ss") {
    return moment(dataStr).format(pattern);
})

var vm = new Vue({
    el: '#app',
    data: {},
    // components: {
    //   login
    // }
    /* render: function (createElements) { // 在 webpack 中，如果想要通过 vue， 把一个组件放到页面中去展示，vm 实例中的 render 函数可以实现
      return createElements(login)
    } */

    render: c => c(app),
    router: router,
    store: store
})


// 总结梳理： webpack 中如何使用 vue :
// 1. 安装vue的包：  cnpm i vue -S
// 2. 由于 在 webpack 中，推荐使用 .vue 这个组件模板文件定义组件，所以，需要安装 能解析这种文件的 loader    cnpm i vue-loader vue-template-complier -D
// 3. 在 main.js 中，导入 vue 模块  import Vue from 'vue'
// 4. 定义一个 .vue 结尾的组件，其中，组件有三部分组成： template script style
// 5. 使用 import login from './login.vue' 导入这个组件
// 6. 创建 vm 的实例 var vm = new Vue({ el: '#app', render: c => c(login) })
// 7. 在页面中创建一个 id 为 app 的 div 元素，作为我们 vm 实例要控制的区域；