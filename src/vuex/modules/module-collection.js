import { forEach } from '../util';
import Module from './module';

export default class ModuleCollection {
  constructor(options) {
    // 注册模块  递归注册 根模块 
    this.register([], options);
  }
  register(path, rootModule) {  //类似ast语法树
    let newModule = new Module(rootModule);
    if (path.length === 0) {
      this.root = newModule;
    } else {  // [b,c]
      let parent = path.slice(0, -1).reduce((memo, current) => {
        return memo.getChild(current);
      }, this.root);
      parent.addChild(path[path.length - 1], newModule);
    }
    if (rootModule.modules) { //如果有modules 说明有子模块
      forEach(rootModule.modules, (module, moduleName) => { // [b,c]
        this.register([...path, moduleName], module);
      })
    }
  }
  getNameSpace(path) { //获取命名空间
    let root = this.root;
    return path.reduce((namespace, key) => {
      root = root.getChild(key);
      return namespace + (root.namespaced ? key + '/' : '');
    }, '')
  }
}

// 格式化树结构
// this.root = {
//   _raw: xxx,
//   _children: {
//     a: {
//       _raw: xxx,
//       state: a.state
//     },
//     b: {
//       _raw: xxx,
//       _children: {},
//       state: b.state

//     }
//   },
//   state: xxx.state
// }