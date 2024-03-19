import applyMixin from './mixin';
let Vue;

// 最终用户拿到的是实例
class Store {
  constructor(options) {
    let state = options.state;  //用户传递过来的状态
    // 如果直接将state定义在市里上，稍后这个状态发生变化，视图是不会更新的

    // vue-router 使用defineReactive实现响应式，只定义了一个属性
    // observer 创建vue实例
    // vue中定义属性属性名是有特点的，如果属性名是通过$xxx命名的，不会被代理到vue的实例上

    this._vm = new Vue({
      data: {
        $$store: state
      }
    })
    console.log(this._vm.$$store);
  }
  // 类的数下访问器，当用户去这个实例上取state属性时，会执行此方法
  get state() {
    return this._vm._data.$$store;
  }
}

const install = (_Vue) => {
  Vue = _Vue;
  console.log('install'); //vue-router 调用install目的？注册了全局组件 注册了原型方法 mixin=>router实例 绑定给了所有的实例
  applyMixin(Vue);
}

export {
  Store,
  install
}
