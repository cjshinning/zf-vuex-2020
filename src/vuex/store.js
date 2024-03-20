import { forEach } from './util';
import applyMixin from './mixin';
import ModuleCollection from './modules/module-collection';
let Vue;

function getState(store, path) {
  return path.reduce((newState, current) => {
    return newState[current];
  }, store.state)
}

function installModule(store, rootState, path, module) {
  // 注册事件时，需要注册到对应的命名空间，path就是所有的路径，根据path算出一个空间里
  let namespace = store._modules.getNameSpace(path);
  // console.log(namespace);

  if (path.length > 0) {  //如果是子模块，需要将子模块的状态定义到根模块上
    // 这个api可以新增属性，如果本身对象不是响应式会直接赋值
    let parent = path.slice(0, -1).reduce((memo, current) => {
      return memo[current];
    }, rootState);
    // Vue.set会区分是否是响应式数据
    store._withCommitting(() => {
      Vue.set(parent, path[path.length - 1], module.state);
    })
  }

  module.forEachMutation((mutation, type) => {  // {changeAge:[fn,fn,fn]}
    // console.log(mutation, type);
    store._mutations[namespace + type] = (store._mutations[namespace + type] || []);
    store._mutations[namespace + type].push((payload) => {
      // 内部可能会替换状态，如果一直使用module.state可能就是老的状态
      debugger
      store._withCommitting(() => {
        mutation.call(store, getState(store, path), payload);  //这里更改状态
      })

      // 调用订阅的事件 重新执行
      store._subscribes.forEach(sub => sub({ mutation, type }, store.state));
    })
  })
  module.forEachAction((action, type) => {
    // console.log(action, type);
    store._actions[namespace + type] = (store._actions[namespace + type] || []);
    store._actions[namespace + type].push((payload) => {
      action.call(store, store, payload);
    })
  })
  module.forEachMGetter((getter, key) => {
    // 如果getters重名会覆盖，所有模块的getters都会定义到根模块
    store._wrapperGetter[namespace + key] = function () {
      return getter(getState(store, path));
    }
  })
  module.forEachChild((child, key) => {
    installModule(store, rootState, path.concat(key), child);
  })
}

function resetStoreVm(store, state) {
  const wrapperGetter = store._wrapperGetter;
  let oldVm = store._vm;
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
  store._vm = new Vue({
    data: {
      $$state: state
    },
    computed  //计算属性会将自己的属性放到实例上
  })
  if (store.strict) {
    // 只要状态变化就立即执行 状态变化后同步执行
    store._vm.$watch(() => store._vm._data.$$state, () => {
      console.log(store._committing);
      console.assert(store._committing, '在mutation之外更改了状态');
    }, { deep: true, sync: true });
  }
  // if (oldVm) {
  //   Vue.nextTick(() => oldVm.$destroyed());
  // }
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
    this._subscribes = []

    this.strict = options.strict;
    // 同步的watcher
    this._committing = false;

    installModule(this, state, [], this._modules.root);

    // 将状态放到vue的实力上
    resetStoreVm(this, state);

    // 插件实现
    options.plugins.forEach(plugin => plugin(this));

  }
  _withCommitting(fn) {
    let committing = this._committing;
    this._committing = true;  //在函数调用前 表示_committing为true
    fn();
    this._committing = committing;
  }
  subscribe(fn) {
    this._subscribes.push(fn);
  }
  // 类的数下访问器，当用户去这个实例上取state属性时，会执行此方法
  commit = (type, payload) => {
    this._mutations[type].forEach(fn => fn(payload));
  }
  dispatch = (type, payload) => {
    this._actions[type].forEach(fn => fn(payload));
  }
  replaceState(newState) {  //用最新的状态替换掉
    this._withCommitting(() => {
      this._vm._data.$$state = newState;
    })
  }
  get state() {
    return this._vm._data.$$state;
  }
  registerModule(path, rawModule) {
    if (typeof path === 'string') path = [path];
    // 模块注册
    this._modules.register(path, rawModule);

    // 安装模块，动态将状态新增上去
    installModule(this, this.state, path, rawModule.newModule);
    resetStoreVm(this, this.state);
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
