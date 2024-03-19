import applyMixin from './mixin';
import { forEach } from './util';
let Vue;

// 最终用户拿到的是实例
class Store {
  constructor(options) {
    let state = options.state;  //用户传递过来的状态
    // 如果直接将state定义在市里上，稍后这个状态发生变化，视图是不会更新的

    // vue-router 使用defineReactive实现响应式，只定义了一个属性
    // observer 创建vue实例
    // vue中定义属性属性名是有特点的，如果属性名是通过$xxx命名的，不会被代理到vue的实例上

    // getters 其实写的是方法，但是取值的时候是属性
    this.getters = {};
    const computed = {};
    forEach(options.getters, (fn, key) => {
      computed[key] = () => { //通过计算属性实现懒加载
        return fn(this.state)
      }
      Object.defineProperty(this.getters, key, {
        get: () => {
          return this._vm[key]
        }
      })
    })
    // defineProperty去定义这个属性

    this._vm = new Vue({
      data: {
        $$store: state
      },
      computed  //计算属性会将自己的属性放到实例上
    })

    // 发布订阅模式 将用户定义的mutation和action先保存起来，稍等当调用commit时就找订阅的mutation方法，调用dispatch就找对应的action
    this._mutations = [];
    forEach(options.mutations, (fn, type) => {
      this._mutations[type] = (payload) => fn.call(this, this.state, payload);
    })

    this._actions = {};
    forEach(options.actions, (fn, type) => {
      this._actions[type] = (payload) => fn.call(this, this, payload);
    })
  }
  // 类的数下访问器，当用户去这个实例上取state属性时，会执行此方法
  commit = (type, payload) => {
    this._mutations[type](payload);
  }
  dispatch = (type, payload) => {
    this._actions[type](payload);
  }
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
