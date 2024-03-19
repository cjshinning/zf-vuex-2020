import applyMixin from './mixin';

let Vue;
class Store {
  constructor(options) {
    console.log(options);
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
