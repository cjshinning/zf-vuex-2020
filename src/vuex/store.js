import { forEach } from './util';
import applyMixin from './mixin';
import ModuleCollection from './modules/module-collection';
let Vue;

function installModule(store, rootState, path, module) {
  if (path.length > 0) {  //如果是子模块，需要将子模块的状态定义到根模块上
    // 这个api可以新增属性，如果本身对象不是响应式会直接赋值
    let parent = path.slice(0, -1).reduce((memo, current) => {
      return memo[current];
    }, rootState);

    // Vue.set会区分是否是响应式数据
    Vue.set(parent, path[path.length - 1], module.state);
  }

  module.forEachMutation((mutation, type) => {  // {changeAge:[fn,fn,fn]}
    // console.log(mutation, type);
    store._mutations[type] = (store._mutations[type] || []);
    store._mutations[type].push((payload) => {
      mutation.call(store, module.state, payload);
    })
  })
  module.forEachAction((action, type) => {
    // console.log(action, type);
    store._actions[type] = (store._actions[type] || []);
    store._actions[type].push((payload) => {
      action.call(store, store, payload);
    })
  })
  module.forEachMGetter((getter, key) => {
    // 如果getters重名会覆盖，所有模块的getters都会定义到根模块
    store._wrapperGetter[key] = function () {
      return getter(module.state);
    }
  })
  module.forEachChild((child, key) => {
    installModule(store, rootState, path.concat(key), child);
  })
}

function resetStoreVm(store, state) {
  const wrapperGetter = store._wrapperGetter;
  let computed = {};
  store.getters = {};
  forEach(wrapperGetter, (fn, key) => {
    computed[key] = function () {
      return fn();
    }
    Object.defineProperty(store.getters, key, {
      get: () => store._vm[key]
    })
  })
  // forEach(wrapperGetter, (fn, key) => {
  //   computed[key] = () => { //通过计算属性实现懒加载
  //     return fn(this.state)
  //   }
  //   Object.defineProperty(store.getters, key, {
  //     get: () => store._vm[key]
  //   })
  // })
  // store._vm = new Vue({
  //   data: {
  //     $$state: state
  //   },
  //   computed
  // });
  store._vm = new Vue({
    data: {
      $$store: state
    },
    computed  //计算属性会将自己的属性放到实例上
  })
}

// 最终用户拿到的是实例
class Store {
  constructor(options) {
    // 格式化用户传入的参数 -> vue-router routes createRoutMap
    // 格式化成树形结构更直观，后续也更好操作一些
    // 1.收集模块转换成一棵树
    this._modules = new ModuleCollection(options);
    // console.log(this._modules);
    // 2.安装模块，将模块上的属性 定义在我们的store中
    let state = this._modules.root.state; //根的状态

    this._mutations = {}; //存放所有模块中的mutations
    this._actions = {}; //存放所有模块中的actions
    this._wrapperGetter = {}; //存放所有模块中的getters

    installModule(this, state, [], this._modules.root);

    // console.log(this._mutations);
    // console.log(this._actions);
    // console.log(this._wrapperGetter);
    // console.log(state);

    // 将状态放到vue的实力上
    resetStoreVm(this, state);

    // let state = options.state;  //用户传递过来的状态
    // // 如果直接将state定义在市里上，稍后这个状态发生变化，视图是不会更新的
    // // vue-router 使用defineReactive实现响应式，只定义了一个属性
    // // observer 创建vue实例
    // // vue中定义属性属性名是有特点的，如果属性名是通过$xxx命名的，不会被代理到vue的实例上
    // // getters 其实写的是方法，但是取值的时候是属性
    // this.getters = {};
    // const computed = {};
    // forEach(options.getters, (fn, key) => {
    //   computed[key] = () => { //通过计算属性实现懒加载
    //     return fn(this.state)
    //   }
    //   Object.defineProperty(this.getters, key, {
    //     get: () => {
    //       return this._vm[key]
    //     }
    //   })
    // })
    // // defineProperty去定义这个属性

    // this._vm = new Vue({
    //   data: {
    //     $$store: state
    //   },
    //   computed  //计算属性会将自己的属性放到实例上
    // })

    // // 发布订阅模式 将用户定义的mutation和action先保存起来，稍等当调用commit时就找订阅的mutation方法，调用dispatch就找对应的action
    // this._mutations = [];
    // forEach(options.mutations, (fn, type) => {
    //   this._mutations[type] = (payload) => fn.call(this, this.state, payload);
    // })

    // this._actions = {};
    // forEach(options.actions, (fn, type) => {
    //   this._actions[type] = (payload) => fn.call(this, this, payload);
    // })
  }
  // 类的数下访问器，当用户去这个实例上取state属性时，会执行此方法
  commit = (type, payload) => {
    this._mutations[type].forEach(fn => fn(payload));
  }
  dispatch = (type, payload) => {
    this._actions[type].forEach(fn => fn(payload));
  }
  get state() {
    return this._vm._data.$$store;
  }
}

const install = (_Vue) => {
  Vue = _Vue;
  // console.log('install'); //vue-router 调用install目的？注册了全局组件 注册了原型方法 mixin=>router实例 绑定给了所有的实例
  applyMixin(Vue);
}

export {
  Store,
  install
}
